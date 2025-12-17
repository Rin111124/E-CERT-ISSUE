import { Router } from "express";
import { body, validationResult } from "express-validator";
import { ethers } from "ethers";
import { requireRole } from "../middleware/auth.js";
import { canonicalize } from "../utils/canonical.js";
import { sha256Hex, buildSigningMessage, signCertificateMessage } from "../utils/crypto.js";
import { issueOnChain, revokeOnChain, issueBatchOnChain, getOnChainProof, getMerkleBatch } from "../services/blockchain.js";
import { Template, Certificate, AuditLog, ClaimToken, Batch, BatchItem, User } from "../models/index.js";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { sendCredentialEmail, buildLinks } from "../services/mailer.js";
import { MerkleTree } from "merkletreejs";

const router = Router();
const respondError = (res, err) => {
  console.error(err);
  if (err.name === "SequelizeUniqueConstraintError") {
    const field = err.errors?.[0]?.path;
    const value = err.errors?.[0]?.value;
    return res.status(400).json({ message: `Duplicate ${field}: ${value}` });
  }
  return res.status(500).json({ message: "Internal error" });
};

const decodeRevert = (err) => {
  const data = err?.info?.error?.data || err?.data;
  if (typeof data !== "string" || !data.startsWith("0x")) return null;
  const selector = data.slice(0, 10);
  switch (selector) {
    case "0xc68e50c0":
      return "Certificate already issued on-chain";
    case "0x584a7938":
      return "Issuer is not whitelisted on-chain";
    case "0x54ec5063":
      return "Not the issuer/owner on-chain";
    case "0x6a95bdbf":
      return "Merkle root already anchored on-chain";
    default:
      return null;
  }
};

router.post(
  "/templates",
  requireRole(["ISSUER_ADMIN", "SYS_ADMIN"]),
  body("name").isString(),
  body("schema").notEmpty(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const template = await Template.create({
      name: req.body.name,
      schema: req.body.schema,
      issuerId: req.user.sub,
    });
    res.json(template);
  }
);

router.get(
  "/templates",
  requireRole(["ISSUER_ADMIN", "SYS_ADMIN"]),
  async (req, res) => {
    const templates = await Template.findAll({
      where: { issuerId: req.user.sub },
      order: [["createdAt", "DESC"]],
    });
    res.json(templates);
  }
);

router.post(
  "/certificates",
  requireRole(["ISSUER_ADMIN", "SYS_ADMIN"]),
  body("payload").notEmpty(),
  body("templateId").optional().isString(),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
      const { payload, templateId } = req.body;
      const canonical = canonicalize(payload);
      const docHash = sha256Hex(Buffer.from(canonical, "utf8"));
      const certificateId = payload.certificateId;
      const messageHash = buildSigningMessage({
        certificateId,
        docHash,
      });
      const signature = await signCertificateMessage(messageHash, process.env.ISSUER_PRIVATE_KEY);

      const uuidRegex = /^[0-9a-fA-F-]{36}$/;
      const safeTemplateId = templateId && uuidRegex.test(templateId) ? templateId : null;

      const record = await Certificate.create({
        certificateId,
        canonicalJson: payload,
        docHash,
        signature,
        issuerId: req.user.sub,
        templateId: safeTemplateId,
        status: "DRAFT",
      });
      res.json({ id: record.id, certificateId, docHash, signature });
    } catch (err) {
      respondError(res, err);
    }
  }
);

router.get(
  "/certificates",
  requireRole(["ISSUER_ADMIN", "SYS_ADMIN"]),
  async (req, res) => {
    const certs = await Certificate.findAll({
      where: { issuerId: req.user.sub },
      order: [["createdAt", "DESC"]],
    });
    res.json(certs);
  }
);

// Batch issuance with Merkle tree: payloads[]
router.post(
  "/batches",
  requireRole(["ISSUER_ADMIN", "SYS_ADMIN"]),
  body("payloads").isArray({ min: 1 }),
  body("templateId").isString(),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
      const { payloads, templateId } = req.body;
      const leaves = [];
      const certRecords = [];

      for (const payload of payloads) {
        const canonical = canonicalize(payload);
        const docHash = sha256Hex(Buffer.from(canonical, "utf8"));
        const certificateId = payload.certificateId;
        const messageHash = buildSigningMessage({ certificateId, docHash });
        const signature = await signCertificateMessage(messageHash, process.env.ISSUER_PRIVATE_KEY);
        certRecords.push({ payload, docHash, certificateId, signature });
        leaves.push(Buffer.from(docHash, "hex"));
      }

      const tree = new MerkleTree(leaves, (data) => crypto.createHash("sha256").update(data).digest(), {
        sortPairs: true,
      });
      const rootHex = tree.getRoot().toString("hex");
      if (!rootHex) return res.status(400).json({ message: "Failed to build merkle root" });
      const merkleRootHex = "0x" + rootHex;

      const batch = await Batch.create({
        merkleRoot: merkleRootHex,
        issuerId: req.user.sub,
        status: "PENDING",
      });

      const createdCertificates = [];
      for (let i = 0; i < certRecords.length; i++) {
        const rec = certRecords[i];
        const proof = tree.getProof(leaves[i]).map((p) => "0x" + p.data.toString("hex"));
        const cert = await Certificate.create({
          certificateId: rec.certificateId,
          canonicalJson: rec.payload,
          docHash: rec.docHash,
          signature: rec.signature,
          issuerId: req.user.sub,
          templateId,
          status: "HASHED",
          merkleRoot: merkleRootHex,
          merkleProof: proof,
          batchId: batch.id,
        });
        await BatchItem.create({
          certificateId: cert.id,
          batchId: batch.id,
          status: "HASHED",
        });
        createdCertificates.push({ id: cert.id, certificateId: cert.certificateId, merkleProof: proof });
      }

      // Anchor root on-chain
      // Fast guard to avoid revert
      const existingRoot = await getMerkleBatch(merkleRootHex);
      if (existingRoot?.issuer && existingRoot.issuer !== ethers.ZeroAddress) {
        return res.status(400).json({ message: "Merkle root already anchored on-chain" });
      }

      const tx = await issueBatchOnChain(merkleRootHex, process.env.ISSUER_PRIVATE_KEY);
      await batch.update({ txHash: tx.txHash, blockNumber: tx.blockNumber, status: "ANCHORED", anchoredAt: new Date() });

      await AuditLog.create({
        action: "BATCH_ISSUE",
        actorId: req.user.sub,
        metadata: { batchId: batch.id, merkleRoot: merkleRootHex, tx },
      });

      res.json({
        batchId: batch.id,
        merkleRoot: merkleRootHex,
        txHash: tx.txHash,
        certificates: createdCertificates,
      });
    } catch (err) {
      respondError(res, err);
    }
  }
);

router.post(
  "/certificates/:id/issue",
  requireRole(["ISSUER_ADMIN", "SYS_ADMIN"]),
  async (req, res) => {
    try {
      const cert = await Certificate.findByPk(req.params.id);
      if (!cert) return res.status(404).json({ message: "Not found" });
      const certificateIdHex = ethers.keccak256(ethers.toUtf8Bytes(cert.certificateId));
      const docHashHex = "0x" + cert.docHash;

      // Avoid revert by checking on-chain state first
      const onChain = await getOnChainProof(certificateIdHex);
      if (onChain?.issuer && onChain.issuer !== ethers.ZeroAddress) {
        return res.status(400).json({ message: "Certificate already issued on-chain" });
      }

      const tx = await issueOnChain(certificateIdHex, docHashHex, process.env.ISSUER_PRIVATE_KEY);
      const updated = await cert.update({
        onChainTx: tx.txHash,
        status: "ISSUED",
        issuedAt: new Date(),
        blockNumber: tx.blockNumber,
      });
      // Auto-assign to student account. If email not exists -> create new student user with random password.
      const studentEmail = cert.canonicalJson?.studentEmail;
      let studentUser = null;
      let createdStudentPassword = null;
      if (studentEmail) {
        studentUser = await User.findOne({ where: { email: studentEmail } });
        if (!studentUser) {
          createdStudentPassword = crypto.randomBytes(6).toString("hex");
          const hashed = await bcrypt.hash(createdStudentPassword, 10);
          studentUser = await User.create({
            email: studentEmail,
            fullName: cert.canonicalJson?.studentName || studentEmail,
            password: hashed,
            role: "STUDENT",
            forcePasswordReset: true,
          });
        }
        await updated.update({ studentId: studentUser.id });
      }

      // Optionally keep claim token for legacy flow only when no student user
      let claimToken = null;
      if (!studentUser) {
        claimToken = await ClaimToken.create({
          token: crypto.randomUUID(),
          certificateId: cert.id,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        });
      }
      await AuditLog.create({
        action: "ISSUE",
        actorId: req.user.sub,
        metadata: { certificateId: cert.certificateId, tx },
      });

      // Send email notification
      try {
        const links = buildLinks({
          certificateId: cert.certificateId,
          claimToken: claimToken?.token || null,
          certificateInternalId: studentUser?.id ? cert.id : null,
        });

        if (studentUser) {
          const subject = 'Chung chi moi da duoc gan vao tai khoan cua ban';
          const body = `
Xin chao ${studentUser.fullName || studentEmail},

Chung chi ${cert.certificateId} da duoc gan vao tai khoan cua ban.
${links.studentViewLink ? `Xem chung chi: ${links.studentViewLink}` : ''}
Xac minh nhanh: ${links.verifyLink}
${createdStudentPassword ? `Tai khoan moi, mat khau tam thoi: ${createdStudentPassword}` : ''}
${links.changePasswordLink ? `Doi mat khau (khuyen nghi/bat buoc neu moi): ${links.changePasswordLink}` : ''}
`;
          await sendCredentialEmail({ to: studentEmail, subject, text: body, html: body.replace(/\n/g, "<br>") });
        } else if (claimToken) {
          const subject = 'Claim chung chi cua ban';
          const body = `
Xin chao,

Claim chung chi ${cert.certificateId} bang link: ${links.claimLink}
Xac minh nhanh: ${links.verifyLink}
`;
          await sendCredentialEmail({ to: studentEmail || cert.canonicalJson?.studentEmail, subject, text: body, html: body.replace(/\n/g, "<br>") });
        }
      } catch (mailErr) {
        console.warn('Send email failed', mailErr);
      }

      res.json({
        txHash: tx.txHash,
        certificateIdHex,
        docHashHex,
        certificate: updated,
        claimToken: claimToken?.token || null,
        claimTokenExpiresAt: claimToken?.expiresAt || null,
        studentEmailAssigned: studentUser?.email || null,
        studentId: studentUser?.id || null,
        createdStudentPassword,
      });
    } catch (err) {
      const reason = decodeRevert(err);
      if (reason) return res.status(400).json({ message: reason });
      return respondError(res, err);
    }
  }
);

router.post(
  "/certificates/:id/revoke",
  requireRole(["ISSUER_ADMIN", "SYS_ADMIN"]),
  async (req, res) => {
    const cert = await Certificate.findByPk(req.params.id);
    if (!cert) return res.status(404).json({ message: "Not found" });
    const certificateIdHex = ethers.keccak256(ethers.toUtf8Bytes(cert.certificateId));
    const tx = await revokeOnChain(certificateIdHex, process.env.ISSUER_PRIVATE_KEY);
    const updated = await cert.update({ revoked: true, status: "REVOKED" });
    await AuditLog.create({
      action: "REVOKE",
      actorId: req.user.sub,
      metadata: { certificateId: cert.certificateId, tx },
    });
    res.json({ txHash: tx.txHash, certificate: updated });
  }
);

export default router;
