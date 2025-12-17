import { Router } from "express";
import { requireRole } from "../middleware/auth.js";
import { Certificate, ClaimToken } from "../models/index.js";
import QRCode from "qrcode";

const router = Router();

router.post("/claim", requireRole(["STUDENT"]), async (req, res) => {
  let { token } = req.body;
  if (!token) return res.status(400).json({ message: "Missing token" });
  // Allow users to paste full URL; extract the token param if present
  const tokenMatch = token.match(/token=([^&]+)/);
  if (tokenMatch) {
    token = tokenMatch[1];
  }
  const claim = await ClaimToken.findOne({
    where: { token },
    include: [{ model: Certificate, as: "certificate" }],
  });
  if (!claim) return res.status(404).json({ message: "Invalid token" });
  if (claim.claimed || new Date(claim.expiresAt) < new Date()) {
    return res.status(400).json({ message: "Token expired or claimed" });
  }
  const payloadEmail = claim.certificate?.canonicalJson?.studentEmail?.toLowerCase();
  const userEmail = req.user?.email?.toLowerCase();
  if (payloadEmail && userEmail && payloadEmail !== userEmail) {
    return res.status(403).json({
      message: "Email không trùng với email trong chứng chỉ. Hãy đăng nhập đúng tài khoản sinh viên.",
    });
  }
  const certificate = await claim.certificate.update({ studentId: req.user.sub });
  await claim.update({ claimed: true });
  res.json({ certificate });
});

router.get("/me/certificates", requireRole(["STUDENT"]), async (req, res) => {
  const certs = await Certificate.findAll({
    where: { studentId: req.user.sub },
    order: [["createdAt", "DESC"]],
  });
  res.json(certs);
});

router.get("/me/certificates/:id/credential", requireRole(["STUDENT"]), async (req, res) => {
  const cert = await Certificate.findByPk(req.params.id);
  if (!cert || cert.studentId !== req.user.sub) {
    return res.status(404).json({ message: "Not found" });
  }
  const credential = {
    payload: cert.canonicalJson,
    signature: cert.signature,
    txHash: cert.onChainTx,
    merkleRoot: cert.merkleRoot,
    merkleProof: cert.merkleProof,
  };
  const qrDataUrl = await QRCode.toDataURL(cert.certificateId);
  res.json({
    credential,
    qrDataUrl,
    certificate: {
      id: cert.id,
      certificateId: cert.certificateId,
      status: cert.status,
      revoked: cert.revoked,
      issuedAt: cert.issuedAt,
      onChainTx: cert.onChainTx,
    },
    verifyLink: `/verify/${cert.certificateId}`,
  });
});

export default router;
