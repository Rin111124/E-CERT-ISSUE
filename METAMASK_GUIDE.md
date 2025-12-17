# 🦊 MetaMask Integration Guide

## Tổng Quan

CertChain tích hợp MetaMask để:
- ✅ Kết nối ví Ethereum của bạn
- ✅ Tự động chuyển sang mạng Sepolia testnet
- ✅ Ký transaction phát hành chứng chỉ
- ✅ Quản lý Sepolia ETH (testnet)

---

## 🔧 Cài Đặt MetaMask

### 1. Cài Đặt Extension

**Trên Chrome/Edge/Brave**:
1. Truy cập: https://metamask.io/download/
2. Chọn trình duyệt của bạn
3. Nhấn "Add to Chrome" (hoặc browser tương ứng)
4. Nhấn "Add extension"

**Trên Firefox**:
1. Truy cập: https://addons.mozilla.org/en-US/firefox/addon/ether-metamask/
2. Nhấn "Add to Firefox"

### 2. Tạo Ví Mới

1. Mở MetaMask extension
2. Nhấn "Create a Wallet"
3. Tạo password mạnh
4. **Lưu backup seed phrase ở nơi an toàn** (12 từ)
5. Xác nhận seed phrase
6. ✅ Ví đã sẵn sàng!

### 3. Thêm Sepolia Network (Tùy Chọn)

MetaMask sẽ tự động thêm Sepolia khi kết nối lần đầu, nhưng bạn có thể thêm thủ công:

1. Mở MetaMask
2. Nhấn menu "Networks" (góc trên cùng)
3. Nhấn "Add a custom RPC network"
4. Điền thông tin:
   - **Network Name**: Sepolia Testnet
   - **RPC URL**: https://ethereum-sepolia.publicnode.com
   - **Chain ID**: 11155111
   - **Currency Symbol**: SepoliaETH
   - **Block Explorer**: https://sepolia.etherscan.io
5. Nhấn "Save"

---

## 💰 Lấy Sepolia ETH (Testnet)

**Bạn cần Sepolia ETH để gửi transaction!**

### Cách 1: Alchemy Faucet ⭐ (Recommended)

1. Truy cập: https://www.alchemy.com/faucets/ethereum-sepolia
2. Sao chép địa chỉ ví MetaMask (Click account menu → Copy)
3. Paste vào form
4. Nhấn "Send Me ETH"
5. ✅ Chờ ~1 phút để nhận Sepolia ETH

### Cách 2: Infura Faucet

1. Truy cập: https://www.infura.io/faucet/sepolia
2. Nhập địa chỉ ví
3. Hoàn thành Captcha
4. ✅ Nhận Sepolia ETH

### Cách 3: QuickNode Faucet

1. Truy cập: https://faucet.quicknode.com/ethereum/sepolia
2. Kết nối MetaMask (hoặc nhập địa chỉ)
3. Nhấn "DRIP"
4. ✅ Nhận Sepolia ETH

### Kiểm Tra Số Dư

- **Trên MetaMask**: Xem số dư tại trang chính
- **Trên Etherscan**: https://sepolia.etherscan.io/ → Paste địa chỉ ví

---

## 🚀 Sử Dụng CertChain với MetaMask

### Step 1: Kết Nối ví

```
[CertChain Homepage]
┌─────────────────────────────────────┐
│  💬 CertChain                       │ [🦊 MetaMask]
├─────────────────────────────────────┤
│ Nhấn nút MetaMask ở góc trên bên phải
└─────────────────────────────────────┘
      ↓
[MetaMask Popup]
"Allow CertChain to access..."
      ↓ Nhấn "Connect"
✅ Kết nối thành công!
```

### Step 2: Chọn Sepolia Network

MetaMask sẽ tự động yêu cầu chuyển sang Sepolia. Nhấn "Switch network".

```
🔴 Hiện tại: Ethereum Mainnet
   ↓ Nhấn "Switch"
🟢 Chuyển sang: Sepolia Testnet
   ✅ Sẵn sàng
```

### Step 3: Phát Hành Chứng Chỉ (Contract Call)

```
[Issuer Dashboard]
1. Nhập Certificate ID: CERT-2026-0001
2. Nhập Doc Hash: 0x1234...
3. Nhấn "Phát Hành Trên Blockchain"
      ↓
[MetaMask Popup]
"Confirm Transaction"
- To: 0x895c3f9770a59F0062171c13395170E39B2dd084
- Gas Fee: ~0.002 SepoliaETH
      ↓ Nhấn "Confirm"
      ↓
⏳ Transaction đang xử lý...
      ↓
✅ Thành công! TX: 0x9876...
```

---

## 📡 Frontend Code Integration

### Sử Dụng MetaMask Hook

```typescript
import { useMetaMask } from "@/services/metamask";

export function MyComponent() {
  const {
    account,        // "0xE8AB70..."
    balance,        // "0.5" (in ETH)
    isConnected,    // true/false
    isSepolia,      // true/false
    connect,        // async () => connect wallet
    switchNetwork,  // async () => switch to Sepolia
    signMessage,    // async (msg, addr) => signature
    sendTransaction // async (to, from, data, value) => txHash
  } = useMetaMask();

  return (
    <div>
      {!isConnected && (
        <button onClick={connect}>Connect MetaMask</button>
      )}

      {isConnected && (
        <div>
          <p>Account: {account}</p>
          <p>Balance: {balance} ETH</p>
          <p>Network: {isSepolia ? "Sepolia ✓" : "Other ⚠"}</p>
        </div>
      )}
    </div>
  );
}
```

### Gửi Transaction

```typescript
const { account, sendTransaction } = useMetaMask();

const issueCertificate = async () => {
  // Encode function call to smart contract
  const encodedData = iface.encodeFunctionData("issue", [
    certificateId,
    docHash,
  ]);

  // Send transaction via MetaMask
  const txHash = await sendTransaction(
    CONTRACT_ADDRESS,  // 0x895c3f9770a59F0062171c13395170E39B2dd084
    account,           // User's address
    encodedData        // Function call
  );

  console.log("Transaction sent:", txHash);
};
```

### Ký Tin Nhắn

```typescript
const { account, signMessage } = useMetaMask();

const signCertificate = async (message: string) => {
  const signature = await signMessage(message, account);
  console.log("Signature:", signature);
  // Gửi signature lên backend để xác minh
};
```

---

## 🔐 Security Best Practices

### ✅ LÀM

1. ✅ Luôn yêu cầu người dùng xác nhận transaction
2. ✅ Hiển thị contract address trước khi gửi tx
3. ✅ Kiểm tra gas fee (không quá cao)
4. ✅ Giữ seed phrase ở nơi an toàn
5. ✅ Sử dụng testnet (Sepolia) trước mainnet

### ❌ KHÔNG LÀM

1. ❌ Không bao giờ chia sẻ seed phrase
2. ❌ Không click link lạ từ email (phishing)
3. ❌ Không cho phép website truy cập private key
4. ❌ Không sử dụng password yếu
5. ❌ Không gửi tx cho contract không xác minh

---

## 🐛 Troubleshooting

### Lỗi: "MetaMask Not Installed"

**Giải Pháp**:
- Cài đặt MetaMask từ https://metamask.io/download/
- Kiểm tra extension đã bật chưa (Settings → Extensions)

### Lỗi: "User Rejected Connection"

**Giải Pháp**:
- Mở MetaMask notification
- Nhấn "Connect" để chấp nhận

### Lỗi: "Sepolia Network Not Found"

**Giải Pháp**:
- MetaMask sẽ tự động thêm Sepolia
- Hoặc thêm thủ công (xem hướng dẫn trên)

### Lỗi: "Insufficient Balance"

**Giải Pháp**:
- Bạn cần Sepolia ETH
- Lấy từ faucet (xem mục trên)
- Cần tối thiểu ~0.01 ETH per transaction

### Lỗi: "Transaction Failed - AlreadyIssued"

**Giải Pháp**:
- Certificate ID đã tồn tại trên blockchain
- Sử dụng certificate ID mới và duy nhất

### Không Thể Kết Nối đến Sepolia RPC

**Giải Pháp**:
```javascript
// Kiểm tra RPC đang hoạt động:
curl -X POST https://ethereum-sepolia.publicnode.com \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'
```

---

## 📊 Demo Page

Truy cập: http://localhost:5173/metamask-test

Trang này cung cấp:
- ✅ MetaMask kết nối / ngắt kết nối
- ✅ Hiển thị địa chỉ ví & số dư
- ✅ Chuyển sang Sepolia
- ✅ Hướng dẫn lấy Sepolia ETH
- ✅ Form phát hành chứng chỉ trực tiếp

---

## 🔗 Các Link Hữu Ích

| Tài Nguyên | URL |
|-----------|-----|
| MetaMask Docs | https://docs.metamask.io/ |
| Sepolia Faucet (Alchemy) | https://www.alchemy.com/faucets/ethereum-sepolia |
| Sepolia Explorer | https://sepolia.etherscan.io |
| Contract Address | https://sepolia.etherscan.io/address/0x895c3f9770a59F0062171c13395170E39B2dd084 |
| Web3.js Docs | https://web3js.readthedocs.io |
| ethers.js Docs | https://docs.ethers.org |

---

**Version**: 1.0  
**Last Updated**: December 2025  
**Status**: Production Ready
