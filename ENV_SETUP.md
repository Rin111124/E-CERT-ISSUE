# ⚙️ Environment Setup - Quick Guide

## 📁 File Cấu Hình

### Frontend (.env)
```bash
cd frontend
cp .env.example .env
```

Chỉnh sửa `frontend/.env`:
```env
# Backend API
VITE_API_URL=http://localhost:4000

# Infura RPC (Lấy từ https://infura.io)
VITE_SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_PROJECT_ID

# Smart Contract
VITE_CONTRACT_ADDRESS=0x895c3f9770a59F0062171c13395170E39B2dd084

# Chain ID
VITE_SEPOLIA_CHAIN_ID=11155111
```

### Contracts (.env) - Đã có sẵn
```env
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/5aa22cd0089b44e79bfa6edf21642862
DEPLOYER_PRIVATE_KEY=0x...
ETHERSCAN_API_KEY=...
```

---

## 🚀 Quick Start

```bash
# 1. Lấy Infura API Key
# Truy cập: https://infura.io
# Tạo project → Copy Project ID

# 2. Cấu hình frontend
cd frontend
echo "VITE_API_URL=http://localhost:4000" > .env
echo "VITE_SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_PROJECT_ID" >> .env
echo "VITE_CONTRACT_ADDRESS=0x895c3f9770a59F0062171c13395170E39B2dd084" >> .env
echo "VITE_SEPOLIA_CHAIN_ID=11155111" >> .env

# 3. Start
npm install
npm run dev
```

---

## 🔗 Tài Liệu Chi Tiết

Xem: **[INFURA_SETUP.md](INFURA_SETUP.md)** để biết hướng dẫn đầy đủ
