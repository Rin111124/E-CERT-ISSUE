import { Router } from "express";
import multer from "multer";
import { ethers } from "ethers";
import { canonicalize } from "../utils/canonical.js";
import { sha256Hex, buildSigningMessage, verifySignature } from "../utils/crypto.js";
import { getOnChainProof, getMerkleBatch } from "../services/blockchain.js";
import crypto from "crypto";
import { createRequire } from "module";
import zlib from "zlib";

const upload = multer({ storage: multer.memoryStorage() });
const router = Router();

function tryParseJsonMatch(text) {
  const marker = text.match(/CREDENTIAL_JSON_START([\s\S]*?)CREDENTIAL_JSON_END/);
  if (marker && marker[1]) {
    try {
      return JSON.parse(marker[1]);
    } catch (e) {
      // keep trying other strategies
    }
  }
  const jsonMatch = text.match(/\{[\s\S]*?certificateId[\s\S]*?\}/i);
  if (!jsonMatch) return null;
  try {
    return JSON.parse(jsonMatch[0]);
  } catch (err) {
    return null;
  }
}

async function extractCredentialFromPdf(buffer) {
  // Try pdf-parse (v1 function, or v2 class PDFParse); fallback to naive scan for embedded JSON
  try {
    const req = createRequire(import.meta.url);
    const mod = req("pdf-parse");
    const PDFParseCls = mod?.PDFParse;
    const VerbosityLevel = mod?.VerbosityLevel || mod?.PDFParse?.VerbosityLevel;
    const pdfParseFn =
      typeof mod === "function"
        ? mod
        : typeof mod?.default === "function"
          ? mod.default
          : null;

    // Try common shapes exported by different pdf-parse versions
    if (typeof pdfParseFn === "function") {
      const { text } = await pdfParseFn(buffer);
      const parsed = tryParseJsonMatch(text);
      if (parsed) return parsed;
    } else if (typeof PDFParseCls === "function") {
      const parser = new PDFParseCls({ verbosity: VerbosityLevel?.WARNINGS ?? 0 });
      const extractor = typeof parser.extract === "function" ? parser.extract : parser.parse;
      if (typeof extractor === "function") {
        const { text } = await extractor.call(parser, buffer);
        const parsed = tryParseJsonMatch(text);
        if (parsed) return parsed;
      }
    } else if (typeof mod?.parse === "function") {
      const { text } = await mod.parse(buffer);
      const parsed = tryParseJsonMatch(text);
      if (parsed) return parsed;
    } else if (typeof mod?.default?.parse === "function") {
      const { text } = await mod.default.parse(buffer);
      const parsed = tryParseJsonMatch(text);
      if (parsed) return parsed;
    } else {
      // Unknown shape; log available keys to assist debugging, then fallback
      try {
        const keys = Object.keys(mod || {});
        console.warn("pdf-parse loaded but shape unexpected, keys=", keys);
      } catch (e) {
        console.warn("pdf-parse loaded but is not callable, fallback to naive scan");
      }
    }
  } catch (err) {
    console.warn("pdf-parse not available or failed, fallback to naive scan", err.message);
  }

  // Naive scan 1: try different encodings directly on raw buffer
  const encodings = ["utf8", "latin1", "ascii"];
  for (const enc of encodings) {
    try {
      const text = buffer.toString(enc);
      const parsed = tryParseJsonMatch(text);
      if (parsed) return parsed;
    } catch (e) {
      // ignore and try next encoding
    }
  }

  // Naive scan 2: scan PDF streams and attempt Flate (zlib) decompression, then search for markers/JSON
  try {
    const STREAM = Buffer.from("stream");
    const ENDSTREAM = Buffer.from("endstream");
    let pos = 0;
    while (true) {
      const sIdx = buffer.indexOf(STREAM, pos);
      if (sIdx === -1) break;
      let start = sIdx + STREAM.length;
      // Skip newline(s) immediately after 'stream'
      if (buffer[start] === 0x0d && buffer[start + 1] === 0x0a) start += 2; // \r\n
      else if (buffer[start] === 0x0a) start += 1; // \n
      const eIdx = buffer.indexOf(ENDSTREAM, start);
      if (eIdx === -1) break;
      const raw = buffer.slice(start, eIdx);
      // Try deflate (FlateDecode)
      try {
        const inflated = zlib.inflateSync(raw, { finishFlush: zlib.constants.Z_SYNC_FLUSH });
        for (const enc of encodings) {
          try {
            const text = inflated.toString(enc);
            const parsed = tryParseJsonMatch(text);
            if (parsed) return parsed;
          } catch (_) {
            // continue
          }
        }
      } catch (_) {
        // not flate or failed; ignore
      }
      pos = eIdx + ENDSTREAM.length;
    }
  } catch (e) {
    console.warn("PDF stream scan failed:", e.message);
  }
  return null;
}

function hexCertId(certificateId) {
  return ethers.keccak256(ethers.toUtf8Bytes(certificateId));
}

function verifyMerkleProof(leafHex, proof, rootHex) {
  let computed = Buffer.from(leafHex, "hex");
  const root = Buffer.from(rootHex.replace(/^0x/, ""), "hex");
  for (const p of proof) {
    const sibling = Buffer.from(p.replace(/^0x/, ""), "hex");
    const pair = [computed, sibling].sort(Buffer.compare);
    computed = crypto.createHash("sha256").update(Buffer.concat(pair)).digest();
  }
  return computed.equals(root);
}

const normalizeOnChainCertificate = (c) =>
  c
    ? {
      docHash: c.docHash,
      issuer: c.issuer,
      issuedAt: c.issuedAt ? Number(c.issuedAt) : undefined,
      revoked: c.revoked,
    }
    : c;

const normalizeOnChainBatch = (b, merkleRoot) =>
  b
    ? {
      merkleRoot,
      issuer: b.issuer,
      anchoredAt: b.anchoredAt ? Number(b.anchoredAt) : undefined,
    }
    : b;

router.post("/", upload.single("file"), async (req, res) => {
  try {
    let credential = req.body;
    if (req.file) {
      const isPdf =
        req.file.mimetype === "application/pdf" ||
        (req.file.originalname || "").toLowerCase().endsWith(".pdf");
      if (isPdf) {
        credential = await extractCredentialFromPdf(req.file.buffer);
        if (!credential) {
          // Fallbacks: accept JSON via multipart fields, or certificateId-only lookup
          const jsonField = req.body.json || req.body.credential;
          if (jsonField) {
            try {
              credential = typeof jsonField === "string" ? JSON.parse(jsonField) : jsonField;
            } catch (e) {
              return res.status(400).json({ message: "Không đọc được JSON trong trường 'json'/'credential'" });
            }
          } else if (req.body.certificateId) {
            // Best-effort: verify on-chain status only by certificateId, without file hash/signature
            const certIdHex = hexCertId(req.body.certificateId);
            const onChain = await getOnChainProof(certIdHex);
            if (!onChain.issuer || onChain.issuer === ethers.ZeroAddress) {
              return res.json({ status: "NOT_FOUND" });
            }
            const safeOnChain = normalizeOnChainCertificate(onChain);
            return res.json({ status: onChain.revoked ? "REVOKED" : "ON_CHAIN", onChain: safeOnChain });
          } else {
            return res.status(400).json({ message: "PDF không chứa credential JSON để xác thực" });
          }
        }
      } else {
        credential = JSON.parse(req.file.buffer.toString("utf8"));
      }
    }

    const payload = credential.payload || credential;
    const signature = credential.signature;
    const merkleRoot = credential.merkleRoot;
    const merkleProof = credential.merkleProof;
    const canonical = canonicalize(payload);
    const docHash = sha256Hex(Buffer.from(canonical, "utf8"));
    // Path 1: direct on-chain docHash
    if (!merkleRoot) {
      const certIdHex = hexCertId(payload.certificateId);
      const onChain = await getOnChainProof(certIdHex);
      if (!onChain.issuer || onChain.issuer === ethers.ZeroAddress) {
        return res.json({ status: "NOT_FOUND" });
      }
      const safeOnChain = normalizeOnChainCertificate(onChain);
      if (onChain.docHash.toLowerCase() !== ("0x" + docHash).toLowerCase()) {
        return res.json({ status: "TAMPERED", onChain: safeOnChain });
      }
      if (onChain.revoked) {
        return res.json({ status: "REVOKED", onChain: safeOnChain });
      }
      const msgHash = buildSigningMessage({ certificateId: payload.certificateId, docHash });
      const validSig = verifySignature(msgHash, signature, onChain.issuer);
      if (!validSig) {
        return res.json({ status: "INVALID_SIGNER", onChain: safeOnChain });
      }
      return res.json({
        status: "VALID",
        onChain: safeOnChain,
        txHash: credential.txHash,
        issuer: onChain.issuer,
      });
    }

    // Path 2: Merkle batch
    if (!merkleProof || !Array.isArray(merkleProof) || merkleProof.length === 0) {
      return res.json({ status: "INVALID_PROOF" });
    }
    const onChainBatch = await getMerkleBatch(merkleRoot);
    if (!onChainBatch.issuer || onChainBatch.issuer === ethers.ZeroAddress) {
      return res.json({ status: "NOT_FOUND" });
    }
    const safeBatch = normalizeOnChainBatch(onChainBatch, merkleRoot);
    const validProof = verifyMerkleProof(docHash, merkleProof, merkleRoot);
    if (!validProof) {
      return res.json({ status: "TAMPERED", onChain: { merkleRoot } });
    }
    const msgHash = buildSigningMessage({ certificateId: payload.certificateId, docHash });
    const validSig = verifySignature(msgHash, signature, onChainBatch.issuer);
    if (!validSig) {
      return res.json({ status: "INVALID_SIGNER", onChain: { merkleRoot } });
    }
    return res.json({
      status: "VALID",
      onChain: safeBatch,
      txHash: credential.txHash,
      issuer: onChainBatch.issuer,
    });
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: "Malformed credential" });
  }
});

router.get("/:certificateId", async (req, res) => {
  const certIdHex = hexCertId(req.params.certificateId);
  const onChain = await getOnChainProof(certIdHex);
  if (!onChain.issuer || onChain.issuer === ethers.ZeroAddress) {
    return res.json({ status: "NOT_FOUND" });
  }
  res.json({ status: onChain.revoked ? "REVOKED" : "ON_CHAIN", onChain: normalizeOnChainCertificate(onChain) });
});

export default router;
