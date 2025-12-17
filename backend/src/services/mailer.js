import nodemailer from "nodemailer";
import { config } from "../config.js";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 465),
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendCredentialEmail({ to, subject, text, html }) {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn("SMTP not configured; skip sending email.");
    return;
  }
  await transporter.sendMail({
    from: process.env.MAIL_FROM || `CertChain <${process.env.SMTP_USER}>`,
    to,
    subject,
    text,
    html,
  });
}

export function buildLinks({ certificateId, claimToken, certificateInternalId }) {
  const base = process.env.PUBLIC_APP_URL || "http://localhost:5173";
  return {
    verifyLink: `${base}/verify/${certificateId}`,
    claimLink: claimToken ? `${base}/student/claim?token=${claimToken}` : null,
    studentViewLink: certificateInternalId ? `${base}/student/certificates/${certificateInternalId}` : null,
    changePasswordLink: `${base}/student/change-password`,
  };
}
