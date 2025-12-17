import { ethers } from "ethers";
import { createRequire } from "module";
import { config } from "../config.js";

const require = createRequire(import.meta.url);
const registryAbi = require("../abi/CertificateRegistry.json");

function getProvider() {
  // Pass static network to avoid detectNetwork calls that can fail on flaky RPC
  const chainId = Number(config.chainId || 11155111);
  return new ethers.JsonRpcProvider(config.ethRpcUrl, { name: "sepolia", chainId });
}

function getContract(signer) {
  const provider = signer || getProvider();
  return new ethers.Contract(config.registryContract, registryAbi, provider);
}

export async function issueOnChain(certificateIdHex, docHashHex, privateKey) {
  const wallet = new ethers.Wallet(privateKey, getProvider());
  const contract = getContract(wallet);
  const tx = await contract.issue(certificateIdHex, docHashHex);
  const receipt = await tx.wait();
  return { txHash: receipt.hash, blockNumber: receipt.blockNumber };
}

export async function revokeOnChain(certificateIdHex, privateKey) {
  const wallet = new ethers.Wallet(privateKey, getProvider());
  const contract = getContract(wallet);
  const tx = await contract.revoke(certificateIdHex);
  const receipt = await tx.wait();
  return { txHash: receipt.hash, blockNumber: receipt.blockNumber };
}

export async function getOnChainProof(certificateIdHex) {
  const contract = getContract();
  return contract.get(certificateIdHex);
}

export async function issueBatchOnChain(merkleRootHex, privateKey) {
  const wallet = new ethers.Wallet(privateKey, getProvider());
  const contract = getContract(wallet);
  const tx = await contract.issueBatch(merkleRootHex);
  const receipt = await tx.wait();
  return { txHash: receipt.hash, blockNumber: receipt.blockNumber };
}

export async function getMerkleBatch(merkleRootHex) {
  const contract = getContract();
  return contract.merkleRoots(merkleRootHex);
}
