# 📡 CertChain - API Documentation

## Base URL
```
Development: http://localhost:3000
Production: https://api.certchain.edu
```

## Authentication
All endpoints (except public ones) require JWT token in header:
```
Authorization: Bearer <jwt_token>
```

---

## 🔐 Auth Endpoints

### POST /api/auth/login
**Public** - No authentication required

**Request**:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response** (200 OK):
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "role": "ISSUER_ADMIN" | "STUDENT" | "SYS_ADMIN"
  }
}
```

**Error** (401):
```json
{"error": "Invalid email or password"}
```

---

## 📋 Issuer Endpoints

### GET /api/issuer/certificates
**Role**: ISSUER_ADMIN

**Query Parameters**:
- `page`: Number (default: 1)
- `limit`: Number (default: 20)
- `status`: String (DRAFT, ISSUED, REVOKED)

**Response** (200 OK):
```json
{
  "certificates": [
    {
      "id": "uuid",
      "certificateId": "CERT-2026-0001",
      "studentEmail": "student@example.com",
      "studentName": "Nguyễn Văn A",
      "courseName": "Blockchain 101",
      "status": "ISSUED",
      "transactionHash": "0x...",
      "timestamp": "2025-01-15T10:30:00Z",
      "revoked": false
    }
  ],
  "total": 45,
  "page": 1
}
```

---

### POST /api/issuer/certificates
**Role**: ISSUER_ADMIN - Create & Sign Certificate

**Request**:
```json
{
  "certificateId": "CERT-2026-0001",
  "studentEmail": "student@example.com",
  "studentName": "Nguyễn Văn A",
  "courseName": "Blockchain 101",
  "issueDate": "2025-01-15"
}
```

**Process**:
1. Backend canonicalizes the payload
2. Computes SHA-256 hash → `docHash`
3. Creates message with: prefix + chainId + contractAddress + certificateId + docHash
4. Signs with Keccak256 + ECDSA → `signature`

**Response** (200 OK):
```json
{
  "certificateId": "CERT-2026-0001",
  "docHash": "0x1234567890abcdef...",
  "signature": "0xabcd1234...",
  "message": "0x..."
}
```

**Error** (409):
```json
{
  "error": "Certificate already exists",
  "code": "DUPLICATE_CERTIFICATE"
}
```

---

### POST /api/issuer/certificates/:certificateId/issue
**Role**: ISSUER_ADMIN - Publish to Blockchain

**Request**:
```json
{
  "signature": "0xabcd1234..."
}
```

**Process**:
1. Backend calls: `contract.issue(certificateIdHex, docHashHex)` via ethers.js
2. Sends transaction to Ethereum Sepolia
3. Waits for confirmation (~15 seconds)
4. Generates claim token (JWT expiring in 7 days)
5. Logs action: `CERTIFICATE_ISSUE`

**Response** (200 OK):
```json
{
  "certificateId": "CERT-2026-0001",
  "transactionHash": "0x9876543210abcdef...",
  "blockNumber": 9852400,
  "claimToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "studentEmail": "student@example.com",
  "expiresIn": "7d"
}
```

**Error** (400):
```json
{
  "error": "Blockchain issuance failed",
  "reason": "AlreadyIssued" | "NotWhitelisted" | "RPC_TIMEOUT",
  "details": "..."
}
```

---

### POST /api/issuer/certificates/:certificateId/revoke
**Role**: ISSUER_ADMIN - Revoke Certificate

**Process**:
1. Calls: `contract.revoke(certificateIdHex)`
2. Sets `revoked = true` on-chain
3. Logs action: `CERTIFICATE_REVOKE`

**Response** (200 OK):
```json
{
  "certificateId": "CERT-2026-0001",
  "transactionHash": "0x...",
  "revoked": true
}
```

**Error** (400):
```json
{
  "error": "Cannot revoke certificate",
  "reason": "NOT_FOUND" | "ALREADY_REVOKED"
}
```

---

### GET /api/issuer/templates
**Role**: ISSUER_ADMIN

**Response** (200 OK):
```json
{
  "templates": [
    {
      "id": "uuid",
      "name": "Bachelor Degree Template v1",
      "schema": {
        "schemaVersion": "1.0",
        "degreeType": "Cử nhân",
        "fields": ["name", "course", "date"]
      },
      "createdAt": "2025-01-01T00:00:00Z"
    }
  ]
}
```

---

### POST /api/issuer/templates
**Role**: ISSUER_ADMIN - Create Template

**Request**:
```json
{
  "name": "Master Degree Template",
  "schema": {
    "schemaVersion": "1.0",
    "degreeType": "Thạc sĩ",
    "fields": ["name", "course", "date", "gpa"]
  }
}
```

**Response** (201 Created):
```json
{
  "id": "uuid",
  "name": "Master Degree Template",
  "schema": {...}
}
```

---

## 👤 Student Endpoints

### POST /api/students/claim
**Role**: STUDENT - Claim Certificate

**Request**:
```json
{
  "claimToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Process**:
1. Verifies JWT token (not expired, signed correctly)
2. Extracts: certificateId, studentEmail
3. Checks: Token used only once
4. Saves: StudentCertificate mapping
5. Logs: `CERTIFICATE_CLAIM`

**Response** (200 OK):
```json
{
  "certificateId": "CERT-2026-0001",
  "studentEmail": "student@example.com",
  "studentName": "Nguyễn Văn A",
  "courseName": "Blockchain 101",
  "issueDate": "2025-01-15",
  "docHash": "0x...",
  "transactionHash": "0x...",
  "claimedAt": "2025-01-15T11:00:00Z"
}
```

**Error** (400):
```json
{
  "error": "Invalid or expired claim token",
  "code": "INVALID_TOKEN" | "EXPIRED_TOKEN" | "ALREADY_CLAIMED"
}
```

---

### GET /api/students/me/certificates
**Role**: STUDENT - Get My Certificates

**Query Parameters**:
- `page`: Number (default: 1)
- `limit`: Number (default: 20)

**Response** (200 OK):
```json
{
  "certificates": [
    {
      "certificateId": "CERT-2026-0001",
      "courseName": "Blockchain 101",
      "issueDate": "2025-01-15",
      "claimedAt": "2025-01-15T11:00:00Z",
      "status": "VALID" | "REVOKED"
    }
  ],
  "total": 3
}
```

---

### GET /api/students/me/certificates/:certificateId
**Role**: STUDENT - Get Certificate Details

**Response** (200 OK):
```json
{
  "certificateId": "CERT-2026-0001",
  "studentName": "Nguyễn Văn A",
  "courseName": "Blockchain 101",
  "issueDate": "2025-01-15",
  "docHash": "0x...",
  "signature": "0x...",
  "transactionHash": "0x...",
  "onChainProof": {
    "issuer": "0xE8AB70e0b543a6B9b6675E6a343826f1Cbaa048A",
    "timestamp": 1705330800,
    "revoked": false
  }
}
```

---

### GET /api/students/me/certificates/:certificateId/credential
**Role**: STUDENT - Download Credential

**Query Parameters**:
- `format`: "json" | "pdf" (default: "json")

**Response** (200 OK):
- Content-Type: `application/json` or `application/pdf`
- Includes: certificateId, docHash, signature, QR code, issuer proof

**File**: `CERT-2026-0001.json` or `CERT-2026-0001.pdf`

---

## ✓ Verification Endpoints

### GET /api/verify/:certificateId
**Public** - Verify by Certificate ID

**Response** (200 OK):
```json
{
  "certificateId": "CERT-2026-0001",
  "status": "VALID" | "REVOKED" | "NOT_FOUND",
  "proof": {
    "issuer": "0xE8AB70e0b543a6B9b6675E6a343826f1Cbaa048A",
    "docHash": "0x...",
    "timestamp": 1705330800,
    "revoked": false
  }
}
```

**Error** (404):
```json
{
  "error": "Certificate not found",
  "certificateId": "CERT-INVALID"
}
```

---

### POST /api/verify
**Public** - Verify by File Upload

**Request**:
- Content-Type: `multipart/form-data`
- Field: `file` (JSON or PDF, max 10MB)

**Process**:
1. Extracts credential data from file
2. Computes SHA-256 hash
3. Looks up on-chain: `contract.get(certificateId)`
4. Compares: computed hash vs. on-chain docHash
5. Recovers signer from signature
6. Logs: `CERTIFICATE_VERIFY`

**Response** (200 OK):
```json
{
  "status": "VALID" | "REVOKED" | "TAMPERED" | "INVALID_SIGNER",
  "certificateId": "CERT-2026-0001",
  "computedHash": "0x1234...",
  "onChainHash": "0x1234...",
  "hashMatch": true,
  "signature": "0xabcd...",
  "signer": "0xE8AB70...",
  "expectedIssuer": "0xE8AB70...",
  "revoked": false,
  "timestamp": 1705330800
}
```

**Error** (400):
```json
{
  "error": "Invalid credential file",
  "reason": "INVALID_FORMAT" | "MISSING_FIELDS" | "FILE_TOO_LARGE"
}
```

---

## 📊 Logging Endpoints

### POST /api/logs
**Public** - Frontend submits log entries

**Request**:
```json
{
  "timestamp": "2025-01-15T10:30:00Z",
  "level": "SUCCESS" | "ERROR" | "WARNING" | "INFO",
  "action": "CERTIFICATE_ISSUE",
  "message": "Certificate issued successfully",
  "metadata": {
    "certificateId": "CERT-2026-0001",
    "transactionHash": "0x..."
  }
}
```

**Response** (201 Created):
```json
{"success": true}
```

---

### GET /api/logs
**Role**: SYS_ADMIN - Retrieve System Logs

**Query Parameters**:
- `level`: "SUCCESS" | "ERROR" | "WARNING" | "INFO"
- `action`: "CERTIFICATE_ISSUE" | "CERTIFICATE_CLAIM" | "CERTIFICATE_VERIFY" | ...
- `actor`: Email address (e.g., "issuer@edu.vn")
- `startDate`: ISO 8601 (e.g., "2025-01-01T00:00:00Z")
- `endDate`: ISO 8601
- `limit`: Number (default: 100, max: 1000)
- `offset`: Number (default: 0)

**Example**:
```
GET /api/logs?action=CERTIFICATE_ISSUE&level=SUCCESS&limit=50&offset=0
```

**Response** (200 OK):
```json
{
  "logs": [
    {
      "id": "uuid",
      "timestamp": "2025-01-15T10:30:00Z",
      "level": "SUCCESS",
      "action": "CERTIFICATE_ISSUE",
      "actor": "issuer@edu.vn",
      "message": "Certificate issued successfully",
      "metadata": {
        "certificateId": "CERT-2026-0001",
        "transactionHash": "0x..."
      }
    }
  ],
  "count": 45,
  "total": 1250
}
```

**Error** (403):
```json
{"error": "Admin access required"}
```

---

## 🔄 Common Request/Response Patterns

### Error Response Format
```json
{
  "error": "Human-readable error message",
  "code": "ERROR_CODE",
  "details": "Additional context",
  "timestamp": "2025-01-15T10:30:00Z"
}
```

### Pagination
```json
{
  "items": [...],
  "total": 150,
  "page": 1,
  "limit": 20,
  "hasMore": true
}
```

### Metadata in Logs
```json
{
  "certificateId": "CERT-2026-0001",
  "transactionHash": "0x...",
  "blockNumber": 9852400,
  "gasUsed": 150000,
  "duration": 1234,  // milliseconds
  "error": null      // if error occurred
}
```

---

## 🧪 Example Workflows

### Full Issuance Flow
```bash
# 1. Create & sign
curl -X POST http://localhost:3000/api/issuer/certificates \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "certificateId": "CERT-2026-0001",
    "studentEmail": "student@example.com",
    "studentName": "Test Student",
    "courseName": "Blockchain 101",
    "issueDate": "2025-01-15"
  }'
# Response: {"signature": "0x...", "docHash": "0x..."}

# 2. Issue on blockchain
curl -X POST http://localhost:3000/api/issuer/certificates/CERT-2026-0001/issue \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"signature": "0x..."}'
# Response: {"claimToken": "eyJ...", "transactionHash": "0x..."}

# 3. Student claims
curl -X POST http://localhost:3000/api/students/claim \
  -H "Authorization: Bearer $STUDENT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"claimToken": "eyJ..."}'
# Response: Certificate details

# 4. Verify
curl http://localhost:3000/api/verify/CERT-2026-0001
# Response: {"status": "VALID", ...}
```

---

## 📈 Rate Limiting

- Default: 100 requests per 15 minutes per IP
- Verify endpoint: 10 requests per 1 minute per IP

---

## 🔒 CORS Policy

```
Allowed Origins: http://localhost:5173 (dev), https://certchain.edu (prod)
Allowed Methods: GET, POST, PUT, DELETE
Allowed Headers: Authorization, Content-Type
```

---

**API Version**: 1.0  
**Last Updated**: January 2025  
**Status**: Production Ready
