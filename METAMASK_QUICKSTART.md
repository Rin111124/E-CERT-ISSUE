# 🚀 MetaMask Integration - Hướng Dẫn Nhanh

## Tổng Quan

CertChain giờ hỗ trợ kết nối MetaMask wallet để phát hành chứng chỉ trực tiếp trên blockchain Sepolia.

## 🔧 Cài Đặt (5 phút)

### 1️⃣ Cài MetaMask
- Tải từ: https://metamask.io/download/
- Tạo ví mới và **lưu seed phrase**

### 2️⃣ Thêm Sepolia Network
MetaMask tự động thêm, nhưng bạn cũng có thể thêm thủ công:

```
RPC URL: https://sepolia.infura.io/v3/YOUR_INFURA_PROJECT_ID
Chain ID: 11155111
Currency: SepoliaETH
Explorer: https://sepolia.etherscan.io
```

> 💡 **Lấy Infura API Key miễn phí**: https://infura.io/ (100,000 requests/ngày)

### 3️⃣ Lấy Sepolia ETH (Testnet)
Chọn một trong 3 cách:

| Faucet | URL | Cách Nhận |
|--------|-----|----------|
| Alchemy | https://www.alchemy.com/faucets/ethereum-sepolia | Copy address, Click "Send Me ETH" |
| Infura | https://www.infura.io/faucet/sepolia | Nhập address, Hoàn thành Captcha |
| QuickNode | https://faucet.quicknode.com/ethereum/sepolia | Kết nối MetaMask, Click "DRIP" |

> ⏱️ Chờ 1-2 phút để nhận Sepolia ETH

### 4️⃣ Chạy Frontend

```bash
cd frontend
npm install
npm run dev
```

Mở: http://localhost:5173

---

## 💡 Sử Dụng MetaMask

### Kế Hoạch A: Qua Demo Page

1. Click "MetaMask" trong menu
2. Click "Connect MetaMask"
3. Phê duyệt kết nối trong popup
4. Chọn Sepolia network
5. Phát hành chứng chỉ qua form

### Kế Hoạch B: Qua Issuer Dashboard

1. Login với vai trò ISSUER_ADMIN
2. Phát hành chứng chỉ qua form
3. Khi submit → MetaMask yêu cầu xác nhận
4. Ký transaction
5. ✅ Chứng chỉ được lưu trên blockchain

---

## 🎯 Demo URLs

| Trang | URL | Mô Tả |
|-------|-----|-------|
| Landing | http://localhost:5173 | Trang chủ |
| MetaMask Test | http://localhost:5173/metamask-test | **Demo MetaMask** ⭐ |
| Issuer | http://localhost:5173/issuer | Phát hành chứng chỉ |
| Verify | http://localhost:5173/verify | Xác minh chứng chỉ |
| Student | http://localhost:5173/student | Quản lý chứng chỉ |

---

## 🔗 Smart Contract

```
Network: Ethereum Sepolia (Chain ID: 11155111)
Contract Address: 0x895c3f9770a59F0062171c13395170E39B2dd084
RPC: https://ethereum-sepolia.publicnode.com
Explorer: https://sepolia.etherscan.io/address/0x895c3f9770a59F0062171c13395170E39B2dd084
```

---

## 💰 Gas Fees (Sepolia)

| Action | Approx. Gas | ETH Cost |
|--------|------------|----------|
| Issue Certificate | 150,000 - 200,000 | ~0.003 - 0.005 ETH |
| Revoke Certificate | 100,000 | ~0.002 ETH |
| Get Certificate | 0 | Free (read-only) |

**Không cần lo:** Sepolia ETH không có giá trị thực, chỉ để test!

---

## 🎨 Code Example

### React Hook

```typescript
import { useMetaMask } from "@/services/metamask";

export function MyComponent() {
  const { account, balance, isConnected, connect, sendTransaction } = useMetaMask();

  return (
    <div>
      {!isConnected ? (
        <button onClick={connect}>🦊 Connect MetaMask</button>
      ) : (
        <div>
          <p>Account: {account}</p>
          <p>Balance: {balance} ETH</p>
          <button onClick={() => sendTransaction(...)}>Send TX</button>
        </div>
      )}
    </div>
  );
}
```

---

## ❓ FAQ

**Q: MetaMask không tìm thấy?**  
A: Cài extension từ https://metamask.io/

**Q: Không thể kết nối?**  
A: Kiểm tra extension đã bật, ví đã tạo

**Q: Không có Sepolia ETH?**  
A: Lấy từ faucet (xem bên trên)

**Q: Transaction bị reject?**  
A: Bạn đã xác nhận trong MetaMask popup chưa?

**Q: Ví hiển thị sai network?**  
A: Click "Switch network" khi CertChain yêu cầu

---

## 📖 Tài Liệu Chi Tiết

Xem [METAMASK_GUIDE.md](../METAMASK_GUIDE.md) để có hướng dẫn đầy đủ.

---

**Status**: ✅ Production Ready  
**Last Updated**: December 2025
