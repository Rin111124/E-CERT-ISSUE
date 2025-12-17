const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with", deployer.address);

  const Registry = await hre.ethers.getContractFactory("CertificateRegistry");
  // Add pre-whitelisted issuers (can be empty)
  const registry = await Registry.deploy([]);
  await registry.waitForDeployment();

  console.log("CertificateRegistry deployed to:", await registry.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
