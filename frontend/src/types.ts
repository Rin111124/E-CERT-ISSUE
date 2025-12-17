export type CertificateStatus = "DRAFT" | "ISSUED" | "REVOKED" | "DELIVERED";

export interface Certificate {
    id: string;
    certificateId: string;
    holderName: string;
    program: string;
    issuedAt?: string;
    status: CertificateStatus;
    docHash: string;
    txHash?: string;
    issuerAddress?: string;
    revoked?: boolean;
    delivery?: {
        email: string;
        sentAt?: string;
        openedAt?: string;
    };
}

export interface VerificationResult {
    certificateId: string;
    status: "VALID" | "REVOKED" | "TAMPERED" | "INVALID_SIGNER" | "NOT_FOUND" | "PENDING";
    onChainHash?: string;
    computedHash?: string;
    issuer?: string;
    blockNumber?: number;
    txHash?: string;
}
