const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CertificateRegistry", function () {
  async function deployFixture() {
    const [owner, issuer, other] = await ethers.getSigners();
    const Registry = await ethers.getContractFactory("CertificateRegistry");
    const registry = await Registry.deploy([issuer.address]);
    return { registry, owner, issuer, other };
  }

  it("whitelists issuers", async () => {
    const { registry, issuer } = await deployFixture();
    expect(await registry.whitelist(issuer.address)).to.equal(true);
  });

  it("issues and reads certificate", async () => {
    const { registry, issuer } = await deployFixture();
    const certId = ethers.keccak256(ethers.toUtf8Bytes("CERT-1"));
    const docHash = ethers.randomBytes(32);

    await expect(registry.connect(issuer).issue(certId, docHash)).to.emit(
      registry,
      "Issued"
    );

    const cert = await registry.get(certId);
    expect(cert.docHash).to.equal(ethers.hexlify(docHash));
    expect(cert.issuer).to.equal(issuer.address);
    expect(cert.revoked).to.equal(false);
  });

  it("prevents duplicate issue", async () => {
    const { registry, issuer } = await deployFixture();
    const certId = ethers.keccak256(ethers.toUtf8Bytes("CERT-1"));
    const docHash = ethers.randomBytes(32);
    await registry.connect(issuer).issue(certId, docHash);
    await expect(
      registry.connect(issuer).issue(certId, docHash)
    ).to.be.revertedWithCustomError(registry, "AlreadyIssued");
  });

  it("revokes by issuer or owner", async () => {
    const { registry, issuer, owner, other } = await deployFixture();
    const certId = ethers.keccak256(ethers.toUtf8Bytes("CERT-1"));
    const docHash = ethers.randomBytes(32);
    await registry.connect(issuer).issue(certId, docHash);
    await expect(registry.connect(issuer).revoke(certId)).to.emit(
      registry,
      "Revoked"
    );
    await registry.connect(owner).revoke(certId); // owner allowed
    await expect(
      registry.connect(other).revoke(certId)
    ).to.be.revertedWithCustomError(registry, "NotIssuer");
  });

  it("anchors merkle batch root", async () => {
    const { registry, issuer, other } = await deployFixture();
    const root = ethers.randomBytes(32);
    await expect(registry.connect(issuer).issueBatch(root)).to.emit(registry, "BatchIssued");
    await expect(registry.connect(issuer).issueBatch(root)).to.be.revertedWithCustomError(
      registry,
      "RootAlreadyAnchored"
    );
    await expect(registry.connect(other).issueBatch(ethers.randomBytes(32))).to.be.revertedWithCustomError(
      registry,
      "NotWhitelisted"
    );
    const batch = await registry.merkleRoots(root);
    expect(batch.issuer).to.equal(issuer.address);
    expect(batch.anchoredAt).to.be.gt(0);
  });
});
