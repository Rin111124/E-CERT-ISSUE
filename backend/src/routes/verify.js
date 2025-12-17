import { Router } from "express";
import multer from "multer";
import { ethers } from "ethers";
import { canonicalize } from "../utils/canonical.js";
import { sha256Hex, buildSigningMessage, verifySignature } from "../utils/crypto.js";
import { getOnChainProof, getMerkleBatch } from "../services/blockchain.js";
import crypto from "crypto";

const upload = multer({ storage: multer.memoryStorage() });
const router = Router();

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
    const credential = req.file
      ? JSON.parse(req.file.buffer.toString("utf8"))
      : req.body;
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
