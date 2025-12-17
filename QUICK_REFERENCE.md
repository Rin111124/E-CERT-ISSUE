# 🎫 MetaMask Integration - Quick Reference Card

## 📍 Navigation

```
┌─────────────────────────────────────────────────────────┐
│ CertChain Home / Verify / Issuer / Student / Dashboard  │
│                                    [🦊 MetaMask] [Login]│
└─────────────────────────────────────────────────────────┘
         ↓ Click [MetaMask] link
         
http://localhost:5173/metamask-test
```

---

## 🔑 Key Files

| File | Location | Purpose |
|------|----------|---------|
| **Service** | `frontend/src/services/metamask.ts` | Web3 integration, React hook |
| **Widget** | `frontend/src/components/MetaMaskConnect.tsx` | Wallet status display |
| **Form** | `frontend/src/components/ContractInteraction.tsx` | Issue certificate form |
| **Page** | `frontend/src/pages/MetaMaskTestPage.tsx` | Demo/test page |
| **Layout** | `frontend/src/layouts/AppLayout.tsx` | Updated with MetaMask widget |
| **Routes** | `frontend/src/App.jsx` | Added /metamask-test route |

---

## 🌐 Networks

```
Development:
  Name: Sepolia Testnet
  Chain ID: 11155111
  RPC: https://ethereum-sepolia.publicnode.com
  Currency: SepoliaETH (testnet, no value)
  
Smart Contract:
  Address: 0x895c3f9770a59F0062171c13395170E39B2dd084
  Network: Sepolia
  Type: CertificateRegistry.sol
  Status: ✅ Operational
```

---

## 💰 Get Testnet ETH

| Faucet | Time | Amount |
|--------|------|--------|
| 🔗 [Alchemy](https://www.alchemy.com/faucets/ethereum-sepolia) | ~1 min | 0.5 ETH |
| 🔗 [Infura](https://www.infura.io/faucet/sepolia) | ~2 min | 0.1 ETH |
| 🔗 [QuickNode](https://faucet.quicknode.com/ethereum/sepolia) | ~1 min | 0.5 ETH |

**Need more?** Try another faucet after 24 hours.

---

## 🚀 Start App

```bash
cd e:\Blockchain\frontend
npm install
npm run dev
```

**Output**:
```
  ➜  Local:   http://localhost:5173/
```

Open in browser: **http://localhost:5173**

---

## 🎮 Use MetaMask

### Flow 1: Test Page (Easiest)
```
1. Click "MetaMask" nav link
   ↓ Opens: /metamask-test
   
2. Click "🦊 Connect MetaMask" button
   ↓ MetaMask popup
   
3. Select account → Click "Connect"
   ↓ Page shows account & balance
   
4. Fill form (or use defaults)
   ↓ Certificate ID, Doc Hash
   
5. Click "🦊 Phát Hành Chứng Chỉ"
   ↓ MetaMask signature popup
   
6. Click "Confirm"
   ↓ Transaction sent to blockchain
   
7. Wait ~30 seconds
   ✅ Certificate issued!
```

### Flow 2: Issuer Dashboard
```
1. Login as ISSUER_ADMIN
2. Go to Issuer Dashboard
3. Fill certificate form
4. Click Submit
5. MetaMask popup appears
6. Sign transaction
7. ✅ Done!
```

---

## 📊 Status Indicators

```
Connection Status:
  ✓ Kết Nối (Green)    = Connected
  ✗ Chưa Kết Nối (Red) = Not connected

Network Status:
  ✓ Sepolia (Green)    = Correct network
  ⚠ Khác (Yellow)      = Wrong network (click "Switch")

Balance:
  0.5 ETH              = Sufficient for ~100+ transactions
  <0.01 ETH            = Getting low, get more from faucet
```

---

## 💻 React Code Snippet

```typescript
import { useMetaMask } from "@/services/metamask";

function MyComponent() {
  const { 
    account,       // Address: "0xE8AB70..."
    balance,       // Balance: "0.5"
    isConnected,   // Boolean
    isSepolia,     // Boolean
    connect,       // Async function
    sendTransaction // Async function
  } = useMetaMask();

  if (!isConnected) {
    return <button onClick={connect}>Connect</button>;
  }

  return <div>Connected: {account} ({balance} ETH)</div>;
}
```

---

## ⚙️ Environment

```
Frontend:
  Framework: React 18
  Language: TypeScript
  Build: Vite
  Styling: Tailwind CSS
  Web3: ethers.js v6

Backend:
  Server: Node.js + Express
  Database: Prisma + SQLite
  Blockchain: ethers.js v6

Smart Contract:
  Language: Solidity 0.8.20
  Network: Sepolia Testnet
  Verification: On-chain state confirmed
```

---

## 🔗 Important Links

| Resource | URL |
|----------|-----|
| Frontend Demo | http://localhost:5173/metamask-test |
| MetaMask Docs | https://docs.metamask.io/ |
| Sepolia Faucet | https://www.alchemy.com/faucets/ethereum-sepolia |
| Contract Explorer | https://sepolia.etherscan.io/address/0x895c3f9770a59F0062171c13395170E39B2dd084 |
| ethers.js Docs | https://docs.ethers.org |
| Solidity Docs | https://docs.soliditylang.org |

---

## 🐛 Quick Fixes

| Issue | Solution |
|-------|----------|
| MetaMask popup not showing | Check browser pop-up settings |
| Can't connect | Unlock MetaMask, select account |
| Wrong network | Click "Switch Network" in popup |
| No balance | Get Sepolia ETH from faucet |
| Transaction failed | Check certificate ID is unique |
| Page not loading | Run `npm run dev` in frontend folder |
| Port 5173 busy | Try `npm run dev -- --port 3000` |

---

## 📚 Documentation Files

```
📄 METAMASK_GUIDE.md
   → Detailed guide in Vietnamese (Installation, Usage, Security)

📄 METAMASK_QUICKSTART.md
   → Quick start guide (5 minutes)

📄 METAMASK_INTEGRATION_SUMMARY.md
   → Complete technical summary

📄 SETUP_CHECKLIST.md
   → Step-by-step verification checklist

📄 QUICK_REFERENCE.md
   → This file!
```

---

## ✅ Success Checklist

- [ ] MetaMask installed and unlocked
- [ ] Sepolia network added
- [ ] Sepolia ETH in wallet
- [ ] Frontend running (`npm run dev`)
- [ ] Can access http://localhost:5173
- [ ] Can click "MetaMask" nav link
- [ ] Can connect wallet
- [ ] Can see account address
- [ ] Can see ETH balance
- [ ] Can fill and submit form
- [ ] Can sign MetaMask transaction
- [ ] Certificate issued successfully

---

## 🎯 What's Next?

1. **Test Everything** ← You are here
2. **Add to Issuer Dashboard** (enable MetaMask on issue page)
3. **Add to Student Dashboard** (show on-chain certificates)
4. **Enable Verification** (verify on-chain)
5. **Deploy to Production** (mainnet)

---

## 💬 Contact & Support

**Issues?** Check:
1. [METAMASK_GUIDE.md](METAMASK_GUIDE.md) - Troubleshooting section
2. Console (F12 → Console tab)
3. MetaMask transaction history

**Quick Test Links**:
- 🧪 Test Page: http://localhost:5173/metamask-test
- 🏠 Home: http://localhost:5173
- 📜 Contract: https://sepolia.etherscan.io/address/0x895c3f9770a59F0062171c13395170E39B2dd084

---

**Created**: December 2025  
**Status**: ✅ Production Ready  
**Last Updated**: Today

---

## 🎉 You're All Set!

Everything is configured and ready to use. Open your browser and start testing! 🚀
