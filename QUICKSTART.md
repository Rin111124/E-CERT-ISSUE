# 🚀 CertChain - Quick Start Guide

## 5 Phút Setup

### 1. Backend (Terminal 1)
```bash
cd backend

# Install dependencies
npm install

# Create .env file
cat > .env << 'EOF'
PORT=3000
DATABASE_URL=postgresql://postgres:password@localhost:5432/e-certdb
JWT_SECRET=test-secret-key
ETH_RPC_URL=https://ethereum-sepolia.publicnode.com
REGISTRY_CONTRACT=0x895c3f9770a59F0062171c13395170E39B2dd084
CHAIN_ID=11155111
ISSUER_PRIVATE_KEY=0x3485a64bbd91d0172be061812ba1e9d8b47cdf2b7b738f84d6f5868b4ebf0047
CLIENT_ORIGIN=http://localhost:5173
EOF

# Run migrations
npx sequelize-cli db:migrate

# Start server
npm start
# ✓ Server running on port 3000
```

### 2. Frontend (Terminal 2)
```bash
cd frontend

# Install dependencies
npm install

# Create .env file
echo "VITE_API_URL=http://localhost:3000" > .env

# Start dev server
npm run dev
# ✓ Frontend running on http://localhost:5173
```

### 3. Open Browser
```
http://localhost:5173
```

---

## 🧪 Test Workflow (5 Steps)

### Step 1: Create & Issue Certificate (Issuer Role)

1. Go to: http://localhost:5173/issuer/new-certificate
2. **Enter Certificate Code**: `CERT-2026-TEST-001` (must be unique!)
3. **Student Details**:
   - Email: `student@test.com`
   - Name: `Test Student`
   - Course: `Blockchain 101`
   - Date: `2025-01-15`
4. **Click "Tiếp Tục"** (Next)
5. **Click "Ký Số"** (Sign) → waits for signature
6. **Click "Phát Hành Ngay"** (Issue) → sends to blockchain
7. ✅ Success! Shows `claimToken` and `transactionHash`

**Copy the claim token for next step**

### Step 2: Check Blockchain Proof

1. Go to Etherscan: https://sepolia.etherscan.io/address/0x895c3f9770a59F0062171c13395170E39B2dd084
2. Click "Contract" → "Read Contract"
3. Find `get` function, enter:
   - certificateId: `0x4345524t2d323032362d544553542d303031` (converted hex)
4. Should return: `docHash`, `issuer`, `timestamp`, `revoked=false`

### Step 3: Claim Certificate (Student Role)

1. Go to: http://localhost:5173/student/claim
2. **Paste Claim Token**: (from Step 1)
3. **Click "Yêu Cầu Chứng Chỉ"** (Claim)
4. ✅ Success! Shows:
   - Certificate ID
   - Student Name
   - Course Name
   - Blockchain Hash
   - Transaction Hash

### Step 4: Verify by Certificate ID (Public)

1. Go to: http://localhost:5173/verify
2. **Method 1 - By ID**:
   - Enter: `CERT-2026-TEST-001`
   - Click "Xác Minh"
3. ✅ Result: **VALID** ✓ (not revoked, on-chain proof exists)

### Step 5: View System Logs (Admin)

1. Go to: http://localhost:5173/admin/logs
2. Should see entries:
   - `CERTIFICATE_ISSUE` - Level: SUCCESS (issuer@edu.vn)
   - `CERTIFICATE_CLAIM` - Level: SUCCESS (student@example.com)
   - `CERTIFICATE_VERIFY` - Level: SUCCESS (verifier@org.vn)
3. **Filter** by action, level, or user
4. **Export** logs as CSV

---

## 📝 Test Scenarios

### ✅ Scenario A: Normal Flow
1. Issue new cert → Success
2. Student claims → Success
3. Verify → VALID

### ❌ Scenario B: Reuse Certificate ID (Should Fail)
1. Issue CERT-2026-TEST-001
2. Try to issue CERT-2026-TEST-001 again
3. Error: `AlreadyIssued` (cannot reuse ID)

### ❌ Scenario C: Revoked Certificate
1. Issue cert → Success
2. Revoke cert (from issuer dashboard)
3. Verify → REVOKED ✗

### ❌ Scenario D: Tampered Credential
1. Download credential JSON from claim page
2. Edit `docHash` value (change one character)
3. Upload file to verify → TAMPERED ✗

---

## 🛠️ Backend Routes (For Testing with Postman/curl)

### Auth
```bash
# Login as issuer
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "issuer@edu.vn",
    "password": "issuer123"
  }'

# Response: {"token": "eyJ..."}
```

### Issue Certificate
```bash
curl -X POST http://localhost:3000/api/issuer/certificates \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJ..." \
  -d '{
    "certificateId": "CERT-2026-TEST-002",
    "studentEmail": "student2@test.com",
    "studentName": "Another Student",
    "courseName": "Advanced Blockchain",
    "issueDate": "2025-01-15"
  }'

# Response: {"signature": "0x...", "docHash": "0x..."}
```

### Publish to Blockchain
```bash
curl -X POST http://localhost:3000/api/issuer/certificates/CERT-2026-TEST-002/issue \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJ..." \
  -d '{"signature": "0x..."}'

# Response: {"transactionHash": "0x...", "claimToken": "eyJ..."}
```

### Verify by ID
```bash
curl http://localhost:3000/api/verify/CERT-2026-TEST-002

# Response: {"status": "VALID", "revoked": false, "timestamp": 1234567890}
```

### View Logs (Admin)
```bash
curl http://localhost:3000/api/logs?action=CERTIFICATE_ISSUE&level=SUCCESS \
  -H "Authorization: Bearer eyJ..."

# Response: {"logs": [...], "count": 5}
```

---

## 🔍 Troubleshooting

### "Port 3000 already in use"
```bash
# Kill process
lsof -ti:3000 | xargs kill -9
```

### "Database connection refused"
```bash
# Check PostgreSQL is running
psql -U postgres -d e-certdb -c "SELECT 1"

# If needed, create database
createdb -U postgres e-certdb
```

### "RPC timeout"
- Check: Is `ETH_RPC_URL` correct in .env?
- Test: `curl -X POST https://ethereum-sepolia.publicnode.com -H "Content-Type: application/json" -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'`

### "Certificate not found on blockchain"
- Check: Is the contract address correct? (0x895c3f9770a59F0062171c13395170E39B2dd084)
- Check: Did the transaction actually confirm? View on Etherscan
- Check: Logs at `/admin/logs` for errors

### "Logs not appearing in dashboard"
- Check: Is DB migrations ran? (`npx sequelize-cli db:migrate`)
- Check: Is `/api/logs` endpoint working? (`curl http://localhost:3000/api/logs`)

---

## 📊 Architecture at a Glance

```
Frontend (React)          Backend (Node.js)         Blockchain (Ethereum)
┌──────────────┐         ┌──────────────┐          ┌──────────────┐
│Issue Button  │────────→│POST /issuer/ │─────────→│issue() func  │
│              │         │certificates  │          │              │
│Claim Form    │────────→│POST /claim   │          │get() func    │
│              │         │              │          │              │
│Verify Input  │────────→│GET /verify   │─────────→│Keccak256()   │
└──────────────┘         └──────────────┘          │verify sig    │
                         ↓                          └──────────────┘
                    PostgreSQL
                    ┌──────────────┐
                    │Users         │
                    │Certificates  │
                    │Logs (NEW!)   │
                    └──────────────┘
```

---

## 🎯 Next Steps

1. ✅ Test all 5 scenarios above
2. ✅ Check admin logs dashboard
3. ✅ Try revoking a certificate
4. ✅ Verify revoked certificate (should show REVOKED)
5. ✅ Export logs as CSV
6. 🚀 Deploy to production with proper security

---

## 📞 Quick Reference

| Component | URL | Role |
|-----------|-----|------|
| Frontend | http://localhost:5173 | Everyone |
| Backend Health | http://localhost:3000/health | Everyone |
| Issuer Dashboard | http://localhost:5173/issuer/new-certificate | ISSUER_ADMIN |
| Student Claim | http://localhost:5173/student/claim | STUDENT |
| Verify | http://localhost:5173/verify | PUBLIC |
| Admin Logs | http://localhost:5173/admin/logs | SYS_ADMIN |

---

**Happy Testing! 🎉**
