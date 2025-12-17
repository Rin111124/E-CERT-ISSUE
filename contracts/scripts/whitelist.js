const hre = require("hardhat");

async function main() {
    // Địa chỉ issuer cần whitelist
    const issuer = process.env.WHITELIST_ISSUER || "0xE8AB70e0b543a6B9b6675E6a343826f1Cbaa048A";
    // Địa chỉ contract registry trên Sepolia
    const registryAddress = process.env.REGISTRY_CONTRACT || "0x895c3f9770a59F0062171c13395170E39B2dd084";

    console.log("Using registry:", registryAddress);
    console.log("Whitelisting issuer:", issuer);

    const registry = await hre.ethers.getContractAt("CertificateRegistry", registryAddress);
    const tx = await registry.setWhitelist(issuer, true);
    console.log("tx submitted:", tx.hash);
    await tx.wait();
    console.log("Whitelisted successfully");
}

main().catch((e) => {
    console.error(e);
    process.exit(1);
});
