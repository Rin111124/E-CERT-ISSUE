// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title Certificate Registry for immutable proofs of academic credentials
/// @notice Stores only hashed certificate fingerprint + issuer metadata, not PII
contract CertificateRegistry {
    address public owner;

    struct Certificate {
        bytes32 docHash;
        address issuer;
        uint64 issuedAt;
        bool revoked;
    }

    struct MerkleBatch {
        address issuer;
        uint64 anchoredAt;
    }

    mapping(bytes32 => Certificate) private certificates;
    mapping(address => bool) public whitelist;
    mapping(bytes32 => MerkleBatch) public merkleRoots; // root => issuer, timestamp

    event Issued(bytes32 indexed certificateId, bytes32 indexed docHash, address indexed issuer);
    event Revoked(bytes32 indexed certificateId, address indexed issuer);
    event WhitelistUpdated(address indexed issuer, bool allowed);
    event BatchIssued(bytes32 indexed merkleRoot, address indexed issuer, uint64 anchoredAt);

    error NotOwner();
    error NotWhitelisted();
    error AlreadyIssued();
    error NotIssuer();
    error RootAlreadyAnchored();

    modifier onlyOwner() {
        if (msg.sender != owner) revert NotOwner();
        _;
    }

    modifier onlyWhitelisted() {
        if (!whitelist[msg.sender]) revert NotWhitelisted();
        _;
    }

    constructor(address[] memory initialIssuers) {
        owner = msg.sender;
        for (uint256 i = 0; i < initialIssuers.length; i++) {
            whitelist[initialIssuers[i]] = true;
            emit WhitelistUpdated(initialIssuers[i], true);
        }
    }

    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "Invalid owner");
        owner = newOwner;
    }

    /// @notice Issue a new certificate hash to chain
    /// @param certificateId Unique certificate identifier (bytes32)
    /// @param docHash SHA-256 hash of canonical certificate payload
    function issue(bytes32 certificateId, bytes32 docHash) external onlyWhitelisted {
        Certificate storage cert = certificates[certificateId];
        if (cert.issuer != address(0)) revert AlreadyIssued();
        cert.docHash = docHash;
        cert.issuer = msg.sender;
        cert.issuedAt = uint64(block.timestamp);
        emit Issued(certificateId, docHash, msg.sender);
    }

    /// @notice Revoke a certificate on chain
    function revoke(bytes32 certificateId) external {
        Certificate storage cert = certificates[certificateId];
        if (cert.issuer == address(0)) revert NotIssuer();
        if (cert.issuer != msg.sender && msg.sender != owner) revert NotIssuer();
        cert.revoked = true;
        emit Revoked(certificateId, msg.sender);
    }

    /// @notice Get certificate proof
    function get(bytes32 certificateId) external view returns (Certificate memory) {
        return certificates[certificateId];
    }

    /// @notice Anchor a Merkle root representing a batch of certificate docHashes
    /// @dev Backend/off-chain giữ merkleProof cho từng chứng chỉ; on-chain chỉ lưu root + issuer + timestamp
    function issueBatch(bytes32 merkleRoot) external onlyWhitelisted {
        if (merkleRoots[merkleRoot].issuer != address(0)) revert RootAlreadyAnchored();
        merkleRoots[merkleRoot] = MerkleBatch({issuer: msg.sender, anchoredAt: uint64(block.timestamp)});
        emit BatchIssued(merkleRoot, msg.sender, uint64(block.timestamp));
    }

    /// @notice Manage issuer whitelist
    function setWhitelist(address issuer, bool allowed) external onlyOwner {
        whitelist[issuer] = allowed;
        emit WhitelistUpdated(issuer, allowed);
    }
}
