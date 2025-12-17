# 📋 CertChain - Deployment & Operations Checklist

## Pre-Deployment Verification (48 hours before)

### ✅ Smart Contract
- [ ] Contract address verified on Etherscan
  - URL: https://sepolia.etherscan.io/address/0x895c3f9770a59F0062171c13395170E39B2dd084
  - Source code visible
  - Contract name: CertificateRegistry
- [ ] Issuer address whitelisted
  - Run: `contracts/scripts/check-state.js`
  - Expected: "✅ Issuer whitelisted: YES"
- [ ] Network connectivity test
  - Run: `curl -X POST https://ethereum-sepolia.publicnode.com ...`
  - Expected: Block number returned

### ✅ Backend
- [ ] All dependencies installed: `npm install`
- [ ] .env file configured with:
  - `DATABASE_URL` → PostgreSQL connection working
  - `ETH_RPC_URL` → Sepolia public RPC
  - `REGISTRY_CONTRACT` → 0x895c3f9770a59F0062171c13395170E39B2dd084
  - `ISSUER_PRIVATE_KEY` → 0x prefix included
  - `JWT_SECRET` → Strong random string
- [ ] Database migrations completed
  - Run: `npx sequelize-cli db:migrate`
  - Check: Tables exist (Users, Certificates, Logs, ...)
- [ ] Health check passes
  - Run: `curl http://localhost:3000/health`
  - Expected: `{"status":"ok"}`
- [ ] All routes accessible
  - POST /api/auth/login ✓
  - GET /api/issuer/certificates ✓
  - POST /api/verify ✓
  - GET /api/logs ✓

### ✅ Frontend
- [ ] All dependencies installed: `npm install`
- [ ] .env configured: `VITE_API_URL=http://localhost:3000` (or production URL)
- [ ] Build succeeds: `npm run build` (no TypeScript errors)
- [ ] Development server runs: `npm run dev` (port 5173)
- [ ] All pages load
  - http://localhost:5173/issuer/new-certificate ✓
  - http://localhost:5173/student/claim ✓
  - http://localhost:5173/verify ✓
  - http://localhost:5173/admin/logs ✓

### ✅ Database
- [ ] PostgreSQL running on port 5432
- [ ] Database `e-certdb` exists
- [ ] Tables created: Users, Certificates, Logs, Claims, Templates
- [ ] Connection pool configured (max 10 connections)
- [ ] Backup created: `pg_dump e-certdb > backup.sql`

---

## Staging Test (24 hours before)

### Test Scenario 1: Full Issuance Flow
```bash
# 1. Issue certificate
curl -X POST http://localhost:3000/api/issuer/certificates \
  -H "Authorization: Bearer <token>" \
  -d '{"certificateId":"CERT-STAGING-001",...}'
# Expected: 200 OK, returns signature

# 2. Publish to blockchain
curl -X POST http://localhost:3000/api/issuer/certificates/CERT-STAGING-001/issue \
  -H "Authorization: Bearer <token>" \
  -d '{"signature":"0x..."}'
# Expected: 200 OK, tx hash + claim token

# 3. Check on-chain
curl http://localhost:3000/api/verify/CERT-STAGING-001
# Expected: 200 OK, status=VALID
```

### Test Scenario 2: Student Claim
```bash
# 1. Claim with token
curl -X POST http://localhost:3000/api/students/claim \
  -H "Authorization: Bearer <student_token>" \
  -d '{"claimToken":"eyJ..."}'
# Expected: 200 OK, certificate details

# 2. View claimed certs
curl http://localhost:3000/api/students/me/certificates \
  -H "Authorization: Bearer <student_token>"
# Expected: Array with CERT-STAGING-001
```

### Test Scenario 3: Logging
```bash
# Frontend automatically logs, verify in DB:
psql -d e-certdb -c "SELECT action, level, message FROM logs ORDER BY timestamp DESC LIMIT 5;"
# Expected: 
# - CERTIFICATE_ISSUE | SUCCESS | ...
# - CERTIFICATE_CLAIM | SUCCESS | ...
```

### Test Scenario 4: Verification
```bash
# 1. By ID
curl http://localhost:3000/api/verify/CERT-STAGING-001
# Expected: {status:"VALID", revoked:false}

# 2. By file
curl -F "file=@credential.json" http://localhost:3000/api/verify
# Expected: {status:"VALID", hashMatch:true}
```

---

## Go-Live Checklist (Day Of)

### 🔴 STOP - Final Checks
- [ ] All tests passed in staging
- [ ] Database backup completed and tested
- [ ] Issuer and student test accounts created
- [ ] Admin account created with SYS_ADMIN role
- [ ] Firewall rules configured (port 443 HTTPS only)
- [ ] SSL certificate installed and valid
- [ ] CDN configured for frontend static assets (optional)
- [ ] Email service tested for claim tokens
- [ ] SMS alerts configured for errors

### 🟢 GO - Deployment Steps

#### 1. Deploy Backend
```bash
# Option A: Direct server
ssh admin@production-server.com
cd /app/certchain/backend
git pull origin main
npm install --production
npm run migrate
pm2 restart certchain-backend

# Option B: Docker
docker pull certchain-backend:1.0
docker-compose -f docker-compose.prod.yml up -d

# Health check
curl https://api.certchain.edu/health
# Expected: 200 OK
```

#### 2. Deploy Frontend
```bash
# Option A: Static hosting (AWS S3 + CloudFront)
npm run build
aws s3 sync dist/ s3://certchain-frontend-prod/
aws cloudfront create-invalidation --id E123ABC --paths "/*"

# Option B: Nginx
npm run build
scp -r dist/* admin@cdn.certchain.edu:/var/www/certchain/
systemctl restart nginx

# Verify
curl https://certchain.edu
# Expected: React app loads
```

#### 3. Warm-up Phase (First Hour)
- [ ] Monitor error rate (should be < 0.1%)
- [ ] Check RPC latency (should be < 500ms)
- [ ] Verify logs are being written to database
- [ ] Test at least 5 sample issuances
- [ ] Send test claim tokens to sample students

### 📊 Monitoring (Ongoing)

#### Every 5 minutes
```bash
# Health check
curl https://api.certchain.edu/health

# RPC connectivity
curl -X POST https://ethereum-sepolia.publicnode.com -d '...'

# Database connectivity
psql -d e-certdb -c "SELECT COUNT(*) FROM certificates;"
```

#### Every hour
```bash
# Error count
psql -d e-certdb -c "SELECT COUNT(*) FROM logs WHERE level='ERROR' AND timestamp > NOW() - INTERVAL '1 hour';"

# Transaction success rate
psql -d e-certdb -c "SELECT 
  COUNT(CASE WHEN level='SUCCESS' THEN 1 END) as success,
  COUNT(CASE WHEN level='ERROR' THEN 1 END) as errors
FROM logs WHERE action='CERTIFICATE_ISSUE' AND timestamp > NOW() - INTERVAL '1 hour';"
```

#### Every day
- [ ] Database backup: `pg_dump e-certdb > backup-$(date +%Y%m%d).sql`
- [ ] Log export: Check `/admin/logs` dashboard
- [ ] Review errors: Any new patterns?
- [ ] Certificate count: Growing as expected?
- [ ] Student claims: Any rejections?

#### Weekly
- [ ] Analyze verification patterns
- [ ] Check for revoked certificates (should be minimal)
- [ ] Review admin logs for suspicious activity
- [ ] Test disaster recovery (restore from backup)

---

## 🚨 Incident Response

### Scenario: RPC Connection Failed
```
Error: ECONNRESET to ethereum-sepolia.publicnode.com
```

**Immediate Actions**:
1. Check alternative RPC providers
2. Switch to: `alchemy-sepolia.g.alchemy.com/v2/...`
3. Update `.env` and restart backend
4. Verify: `curl http://localhost:3000/health`

**Prevention**:
- Configure RPC fallback: `ETH_RPC_URL` + `ETH_RPC_URL_BACKUP`
- Monitor RPC uptime with external service
- Implement circuit breaker pattern

### Scenario: Certificate Already Issued (AlreadyIssued)
```
Error: Contract revert AlreadyIssued (certificateId)
```

**Root Cause**: Attempted to reuse `certificateId`

**Fix**:
1. Generate unique ID: `CERT-YYYY-NNNN` format
2. Check existing in database before issuing
3. Prevent duplicate IDs in form validation

**Prevention**:
- Add unique constraint on `certificateId` column
- Generate IDs serverside (timestamp + random)

### Scenario: Database Connection Pool Exhausted
```
Error: no more connections available
```

**Immediate**:
1. Restart backend: `pm2 restart certchain-backend`
2. Check slow queries: `pg_stat_statements`
3. Kill idle connections: `pg_terminate_backend(...)`

**Prevention**:
- Monitor pool usage: `SELECT count(*) FROM pg_stat_activity;`
- Increase `max_connections` in PostgreSQL config
- Optimize slow queries (add indexes)

### Scenario: Logs Table Growing Too Large
```
SELECT pg_size_pretty(pg_total_relation_size('logs'));
-- Result: 50GB (too large)
```

**Fix**:
1. Archive old logs to separate table
2. Create partitions by month
3. Set retention policy: Delete logs > 90 days old

```sql
-- Delete logs older than 90 days
DELETE FROM logs WHERE timestamp < NOW() - INTERVAL '90 days';
VACUUM ANALYZE logs;
```

---

## 🔐 Security Hardening (Production)

### Secrets Management
```bash
# ❌ DON'T: Store in .env file
echo "ISSUER_PRIVATE_KEY=0x..." > .env

# ✅ DO: Use vault
# Option 1: AWS Secrets Manager
aws secretsmanager create-secret --name certchain-issuer-key

# Option 2: HashiCorp Vault
vault kv put secret/certchain/issuer issuer_private_key=0x...

# Option 3: Google Cloud Secret Manager
gcloud secrets create certchain-issuer-key --data-file=key.txt

# In code:
const privateKey = await getSecretFromVault('issuer-key');
```

### Network Security
```
Firewall Rules:
- Inbound:
  - Port 443 (HTTPS) from 0.0.0.0/0 ✓
  - Port 80 (HTTP) from 0.0.0.0/0 → redirect to 443 ✓
  - Port 5432 (PostgreSQL) from 0.0.0.0/0 ✗ (internal only)
  
- Outbound:
  - Port 443 to ethereum-sepolia.publicnode.com ✓
  - Port 25 (SMTP) for email notifications ✓
```

### Database Security
```sql
-- Create separate user for app (no superuser)
CREATE USER certchain_app WITH PASSWORD 'strong_password';
GRANT CONNECT ON DATABASE e-certdb TO certchain_app;
GRANT USAGE ON SCHEMA public TO certchain_app;
GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA public TO certchain_app;

-- Enable audit logging
ALTER SYSTEM SET log_statement = 'all';
ALTER SYSTEM SET log_line_prefix = '%t [%p]: [%l-1] user=%u,db=%d,app=%a,client=%h ';
SELECT pg_reload_conf();
```

### Rate Limiting
```javascript
// Add to Express middleware
const rateLimit = require('express-rate-limit');

app.use('/api/', rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
}));

app.use('/api/verify', rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10 // stricter limit for verification
}));
```

---

## 📈 Scaling for Production

### Load Distribution
```
                    └─────────────────────────┘
                            ↓
                    Load Balancer (AWS ELB)
                    ↙           ↓           ↘
            Backend 1    Backend 2    Backend 3
            (port 3000)  (port 3000)  (port 3000)
                    ↓           ↓           ↓
                    └──────→ PostgreSQL ←──┘
                         (RDS Primary)
                              ↓
                         (RDS Replica)
                              ↓
                        Backup S3
```

### Caching Layer
```javascript
// Add Redis for certificate lookup
const redis = require('redis');
const client = redis.createClient({
  host: 'redis.certchain.edu',
  port: 6379
});

// Cache verified certificates for 5 minutes
app.get('/api/verify/:certificateId', async (req, res) => {
  const cached = await client.get(`cert:${req.params.certificateId}`);
  if (cached) return res.json(JSON.parse(cached));
  
  const cert = await blockchainService.getCertificate(...);
  await client.setex(`cert:${req.params.certificateId}`, 300, JSON.stringify(cert));
  res.json(cert);
});
```

---

## 📋 Ongoing Operations

### Daily Tasks
- [ ] Check system health dashboard
- [ ] Review error logs
- [ ] Verify backup completed
- [ ] Monitor RPC uptime

### Weekly Tasks
- [ ] Run security audit (`npm audit`)
- [ ] Update dependencies (`npm update`)
- [ ] Review certificate statistics
- [ ] Optimize slow queries

### Monthly Tasks
- [ ] Rotate SSL certificates
- [ ] Update firewall rules
- [ ] Review and archive old logs
- [ ] Capacity planning (storage, compute)

### Quarterly Tasks
- [ ] Penetration testing
- [ ] Disaster recovery drill
- [ ] Contract security audit
- [ ] Full backup restoration test

---

## 📞 Escalation Contacts

| Issue | Contact | Phone | Email |
|-------|---------|-------|-------|
| Database down | DBA Team | +84-xxx-xxx | dba@certchain.edu |
| RPC failure | Blockchain Ops | +84-xxx-xxx | blockchain-ops@certchain.edu |
| Website down | DevOps Lead | +84-xxx-xxx | devops@certchain.edu |
| Security incident | Security Officer | +84-xxx-xxx | security@certchain.edu |

---

**Last Reviewed**: January 2025  
**Next Review**: April 2025  
**Version**: 1.0
