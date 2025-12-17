const hre = require("hardhat");

async function main() {
    console.log("\n========== BLOCKCHAIN CERTIFICATE SYSTEM DIAGNOSTIC ==========\n");

    const registryAddr = process.env.REGISTRY_CONTRACT || "0x895c3f9770a59F0062171c13395170E39B2dd084";
    const issuer = "0xE8AB70e0b543a6B9b6675E6a343826f1Cbaa048A";

    console.log("📋 Configuration:");
    console.log(`   Registry Contract: ${registryAddr}`);
    console.log(`   Issuer Address: ${issuer}`);
    console.log(`   RPC: ${process.env.SEPOLIA_RPC_URL || "default"}`);
    console.log(`   Chain ID: ${process.env.CHAIN_ID || "11155111"}\n`);

    try {
        const registry = await hre.ethers.getContractAt("CertificateRegistry", registryAddr);

        // 1. Check owner
        const owner = await registry.owner();
        console.log("🔐 Owner:", owner);

        // 2. Check whitelist status
        const isWhitelisted = await registry.whitelist(issuer);
        console.log(`✅ Issuer whitelisted: ${isWhitelisted ? "YES" : "NO"}`);
        if (!isWhitelisted) {
            console.log("   ⚠️  Issuer NOT whitelisted! Run: npm run whitelist");
        }

        // 3. Check sample certificateIds
        const testIds = ["CERT-2026-0001", "CERT-2026-0002", "CERT-2026-0003"];
        console.log("\n📜 Certificate Status:");
        for (const id of testIds) {
            const cid = hre.ethers.keccak256(hre.ethers.toUtf8Bytes(id));
            const cert = await registry.get(cid);
            const isIssued = cert.issuer !== "0x0000000000000000000000000000000000000000";
            const revoked = cert.revoked ? " [REVOKED]" : "";
            console.log(`   ${id}: ${isIssued ? "✅ ISSUED" : "❌ NOT ISSUED"}${revoked}`);
            if (isIssued) {
                console.log(`      Hash: ${cert.docHash.slice(0, 18)}...`);
                console.log(`      Issuer: ${cert.issuer}`);
                console.log(`      IssuedAt: ${new Date(Number(cert.issuedAt) * 1000).toISOString()}`);
            }
        }

        // 4. Network check
        const blockNumber = await hre.ethers.provider.getBlockNumber();
        console.log(`\n🌐 Network Status: Block #${blockNumber}\n`);

    } catch (err) {
        console.error("❌ Error:", err.message);
        console.log("\nPossible issues:");
        console.log("   - RPC URL unreachable (check SEPOLIA_RPC_URL in .env)");
        console.log("   - Contract address incorrect (check REGISTRY_CONTRACT)");
        console.log("   - Network mismatch (ensure sepolia network)");
    }

    console.log("========== END DIAGNOSTIC ==========\n");
}

main().catch((e) => {
    console.error(e);
    process.exit(1);
});
