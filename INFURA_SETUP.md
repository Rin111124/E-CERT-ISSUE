# 🔧 Cấu Hình Infura RPC

## Tại Sao Dùng Infura?

Infura cung cấp:
- ✅ **Tốc độ cao** - Infrastructure tối ưu
- ✅ **Độ tin cậy** - 99.9% uptime
- ✅ **Miễn phí** - 100,000 requests/ngày
- ✅ **Analytics** - Dashboard theo dõi usage
- ✅ **Rate limiting** - Kiểm soát tốt hơn

Public nodes thường:
- ⚠️ Chậm hơn
- ⚠️ Không ổn định
- ⚠️ Không có analytics
- ⚠️ Có thể bị rate limit

---

## 📋 Cấu Hình

### Bước 1: Lấy Infura API Key

1. Truy cập: https://infura.io/
2. Đăng ký tài khoản miễn phí
3. Tạo project mới
4. Chọn "Ethereum" → "Sepolia"
5. Copy **Project ID**

### Bước 2: Cấu Hình Frontend

```bash
cd e:\Blockchain\frontend
cp .env.example .env
```

Chỉnh sửa file `.env`:
```env
VITE_SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_PROJECT_ID
```

Thay `YOUR_PROJECT_ID` bằng Project ID của bạn.

### Bước 3: Restart Frontend

```bash
npm run dev
```

---

## ✅ Xác Minh Cấu Hình

Mở: http://localhost:5173/metamask-test

Kiểm tra:
- [ ] RPC Endpoint hiển thị: `sepolia.infura.io/v3/...`
- [ ] MetaMask kết nối thành công
- [ ] Transaction gửi được

---

## 🔐 Bảo Mật

### ✅ LÀM
- ✅ Thêm `.env` vào `.gitignore`
- ✅ Không commit API key lên Git
- ✅ Sử dụng API key riêng cho mỗi môi trường
- ✅ Rotate API key định kỳ

### ❌ KHÔNG LÀM
- ❌ Commit file `.env` lên Git
- ❌ Chia sẻ API key công khai
- ❌ Dùng chung API key production/development

---

## 📊 Infura Dashboard

Truy cập: https://infura.io/dashboard

Theo dõi:
- Số lượng requests
- Bandwidth usage
- Error rates
- Top endpoints

---

## 🌐 Cấu Hình Trong Code

### Frontend (Vite)

File: `frontend/.env`
```env
VITE_SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_PROJECT_ID
```

Sử dụng:
```typescript
const rpcUrl = import.meta.env.VITE_SEPOLIA_RPC_URL;
```

### Backend/Contracts (Node.js)

File: `contracts/.env`
```env
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_PROJECT_ID
```

Sử dụng:
```javascript
require('dotenv').config();
const rpcUrl = process.env.SEPOLIA_RPC_URL;
```

---

## 🔄 Chuyển Đổi Giữa RPC Providers

### Infura → Alchemy

```env
VITE_SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_API_KEY
```

### Infura → QuickNode

```env
VITE_SEPOLIA_RPC_URL=https://YOUR_ENDPOINT.quiknode.pro/YOUR_API_KEY/
```

### Infura → Public Node (Fallback)

```env
VITE_SEPOLIA_RPC_URL=https://ethereum-sepolia.publicnode.com
```

---

## ⚡ Performance Tips

### Rate Limits

**Infura Free Tier**:
- 100,000 requests/day
- 10 requests/second

**Nếu vượt quá**:
1. Upgrade plan
2. Implement caching
3. Batch requests
4. Sử dụng multiple providers

### Caching Strategies

```typescript
// Cache balance for 30 seconds
const cachedBalance = localStorage.getItem('balance');
const cacheTime = localStorage.getItem('balanceTime');

if (cachedBalance && Date.now() - cacheTime < 30000) {
    return cachedBalance;
}

// Fetch new balance
const balance = await getBalance();
localStorage.setItem('balance', balance);
localStorage.setItem('balanceTime', Date.now());
```

---

## 🐛 Troubleshooting

### Lỗi: "Invalid project ID"

**Nguyên nhân**: Project ID sai hoặc chưa cấu hình

**Giải pháp**:
1. Kiểm tra lại Project ID trên Infura Dashboard
2. Đảm bảo `.env` có cấu hình đúng
3. Restart dev server

### Lỗi: "Rate limit exceeded"

**Nguyên nhân**: Vượt quá 100,000 requests/day

**Giải pháp**:
1. Upgrade Infura plan
2. Implement request caching
3. Sử dụng fallback provider

### Lỗi: "CORS error"

**Nguyên nhân**: Domain không được whitelist

**Giải pháp**:
1. Vào Infura Dashboard
2. Settings → Allowlist
3. Thêm `localhost` và domain của bạn

---

## 📖 Tài Liệu

- 📚 **Infura Docs**: https://docs.infura.io/
- 🔧 **API Reference**: https://docs.infura.io/api/
- 💬 **Support**: https://support.infura.io/

---

**Cập nhật**: December 2025  
**Status**: ✅ Đã cấu hình Infura thành công
