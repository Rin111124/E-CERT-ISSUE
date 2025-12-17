# CertChain – Blockchain Certificate App

Full-stack app (React + Express + PostgreSQL + Ethereum/MetaMask) for issuing, delivering, and verifying digital certificates.

## Project Structure
- `frontend/`: React + Vite UI (Issuer/Student/Verify portals).
- `backend/`: Express API + Sequelize + PostgreSQL; ethers for on-chain.
- `contracts/`: Solidity contracts (compiled separately).
- Docs: `QUICKSTART.md`, `INFURA_SETUP.md`, `METAMASK_GUIDE.md`, etc.

## Prerequisites
- Node.js >= 18
- PostgreSQL running and accessible
- MetaMask wallet (Sepolia testnet) + Infura/Alchemy RPC

## Environment Variables (do not commit secrets)
Create `.env` files in backend/frontend/contracts (see `.env.example` if present). Important backend vars:
- `DATABASE_URL` or PG host/user/pass/db
- `JWT_SECRET`
- `ISSUER_PRIVATE_KEY` (issuer wallet key)
- `ETH_RPC_URL` (Infura/Alchemy RPC)
- SMTP (optional for email): `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `MAIL_FROM`
- `PUBLIC_APP_URL` (frontend URL used in emails)

## Backend Setup
```bash
cd backend
npm install
npx sequelize-cli db:migrate
npm run dev
```
API served at `http://localhost:4000/api`.

## Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
App at `http://localhost:5173`.

## Key Flows
- Issuer: connect wallet (Sepolia) → create certificate draft → hash → issue on-chain → auto-assign to student (or claim link if no account).
- Student: login, view/download certificates, claim via token, change password.
- Verify: public `/verify/:certificateId` or upload JSON to verify.

## Security Notes
- Do NOT commit `.env` or private keys.
- Use a dedicated issuer wallet (testnet) for issuing.
- Rotate JWT_SECRET and SMTP passwords in production.
