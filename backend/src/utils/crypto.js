import crypto from "crypto";
import { ethers } from "ethers";
import { config } from "../config.js";

export function sha256Hex(input) {
  return crypto.createHash("sha256").update(input).digest("hex");
}

export function buildSigningMessage({ certificateId, docHash }) {
  const prefix = "CERTIFICATE";
  return ethers.keccak256(
    ethers.toUtf8Bytes(
      prefix +
        config.chainId.toString() +
        config.registryContract.toLowerCase() +
        certificateId +
        docHash
    )
  );
}

export function signCertificateMessage(messageHash, privateKey) {
  const wallet = new ethers.Wallet(privateKey);
  return wallet.signMessage(ethers.getBytes(messageHash));
}

export function verifySignature(messageHash, signature, expectedAddress) {
  const recovered = ethers.verifyMessage(ethers.getBytes(messageHash), signature);
  return recovered.toLowerCase() === expectedAddress.toLowerCase();
}
