# ✅ MetaMask Integration - Setup Checklist

## 📋 Pre-Setup Checklist

### Your Computer
- [ ] Node.js v18+ installed (`node --version`)
- [ ] npm v9+ installed (`npm --version`)
- [ ] Git installed (optional)
- [ ] Code editor (VS Code, etc.)

### Blockchain Prerequisites
- [ ] MetaMask extension installed from https://metamask.io/
- [ ] Sepolia testnet network in MetaMask
  - Chain ID: 11155111
  - RPC: https://ethereum-sepolia.publicnode.com
- [ ] Sepolia ETH in wallet (get from faucet)
  - Alchemy: https://www.alchemy.com/faucets/ethereum-sepolia
  - Infura: https://www.infura.io/faucet/sepolia
  - QuickNode: https://faucet.quicknode.com/ethereum/sepolia

---

## 🚀 Setup Process

### Step 1: Frontend Preparation ✓
- [x] **Services**
  - [x] metamask.ts (Web3 integration service)
  - [x] logger.ts (system logging)
  - [x] api.ts (backend communication)

- [x] **Components**
  - [x] MetaMaskConnect.tsx (wallet widget)
  - [x] ContractInteraction.tsx (issue form)

- [x] **Pages**
  - [x] MetaMaskTestPage.tsx (demo page)
  - [x] IssuerDashboard.jsx (issuer dashboard)
  - [x] StudentDashboard.jsx (student dashboard)
  - [x] VerifyPage.tsx (verification)

- [x] **Layouts**
  - [x] AppLayout.tsx (updated with MetaMaskConnect)

- [x] **Routing**
  - [x] App.jsx (added /metamask-test route)

### Step 2: Documentation ✓
- [x] METAMASK_GUIDE.md (full guide in Vietnamese)
- [x] METAMASK_QUICKSTART.md (quick start guide)
- [x] METAMASK_INTEGRATION_SUMMARY.md (complete summary)

### Step 3: Smart Contract Verification ✓
- [x] Contract deployed on Sepolia
  - Address: 0x895c3f9770a59F0062171c13395170E39B2dd084
  - Owner: 0xE8AB70e0b543a6B9b6675E6a343826f1Cbaa048A
  - Issuer whitelisted: YES

- [x] RPC connectivity confirmed
  - RPC: https://ethereum-sepolia.publicnode.com
  - Last block: #9852435

---

## 🧪 Testing Checklist

### Pre-Run Setup
- [ ] Navigate to project folder: `cd e:\Blockchain`
- [ ] Navigate to frontend: `cd frontend`
- [ ] Install dependencies: `npm install`
- [ ] Ensure MetaMask is installed and unlocked

### Start Frontend
- [ ] Run: `npm run dev`
- [ ] Check output: "Local: http://localhost:5173"
- [ ] Open browser: http://localhost:5173

### Test Page Verification
- [ ] Load homepage: http://localhost:5173 ✓
- [ ] Click "MetaMask" nav link → redirects to /metamask-test
- [ ] Page loads: "🦊 MetaMask Test Page" visible
- [ ] Status cards visible (3 cards: Status, Network, Balance)

### MetaMask Connection
- [ ] Click "🦊 Connect MetaMask" button
- [ ] MetaMask popup appears
- [ ] Select account to connect
- [ ] Click "Connect" in popup
- [ ] Wait 1-2 seconds for page update
- [ ] Status cards update:
  - Status: ✓ Kết Nối (green)
  - Network: ✓ Sepolia (green) or ⚠ Khác (yellow)
  - Balance: Shows ETH amount

### Network Switching
- [ ] If network is not Sepolia (yellow warning)
- [ ] Page automatically or manually prompts: "Switch to Sepolia?"
- [ ] MetaMask popup appears: "Switch network"
- [ ] Click "Switch network" in MetaMask
- [ ] Status updates to: Sepolia ✓ (green)

### Wallet Information Display
- [ ] Account section visible (if connected)
- [ ] Address displayed: 0xXXXX...XXXX format
- [ ] Balance displayed: X.XXX ETH
- [ ] Etherscan link clickable: https://sepolia.etherscan.io/address/...
- [ ] Link opens in new tab with correct address

### Contract Interaction Form
- [ ] Form visible below account info
- [ ] Title: "📜 Phát Hành Chứng Chỉ"
- [ ] Two input fields:
  - [ ] Certificate ID field (placeholder: "CERT-2026-0001")
  - [ ] Doc Hash field (auto-filled with default)
- [ ] Submit button: "🦊 Phát Hành Chứng Chỉ"
- [ ] Button enabled only when connected

### Issue Certificate Test
- [ ] Enter Certificate ID: "CERT-2026-TEST-001"
- [ ] Keep Doc Hash as is (default SHA-256)
- [ ] Click "🦊 Phát Hành Chứng Chỉ" button
- [ ] MetaMask popup appears showing:
  - To: 0x895c3f...
  - Function: issue(...)
  - Gas estimation: ~150,000 - 200,000
- [ ] Click "Confirm" in MetaMask
- [ ] Page shows: "⏳ Transaction đang xử lý..."
- [ ] After ~30 seconds:
  - [ ] Status: "✅ Thành công!"
  - [ ] Transaction hash: 0xXXXX...
  - [ ] Block number: displayed
  - [ ] Link to Etherscan: clickable

### Developer Info Section
- [ ] Contract Address: 0x895c3f... (copyable)
- [ ] RPC Endpoint: ethereum-sepolia.publicnode.com
- [ ] Chain ID: 11155111
- [ ] Etherscan Link: https://sepolia.etherscan.io/address/...

### Faucet Instructions
- [ ] "Lấy Sepolia ETH" section visible
- [ ] 3 faucet options displayed:
  - [ ] Alchemy Faucet (with link)
  - [ ] Infura Faucet (with link)
  - [ ] QuickNode Faucet (with link)
- [ ] Instructions readable

---

## 🐛 Troubleshooting Checklist

### MetaMask Not Showing
- [ ] Extension installed? https://metamask.io/download/
- [ ] Extension enabled in browser?
- [ ] Extension pinned to toolbar?
- [ ] Refreshed page? (Ctrl+R or Cmd+R)

### Can't Connect
- [ ] MetaMask unlocked?
- [ ] Account selected in MetaMask?
- [ ] Popup blocked? (Check browser pop-up settings)
- [ ] Browser console shows errors? (F12 → Console)

### Wrong Network
- [ ] Network shows as "⚠ Khác" (yellow)?
- [ ] Click "Switch Network" button?
- [ ] Confirm in MetaMask popup?
- [ ] Or manually switch: MetaMask menu → Sepolia

### No Balance Showing
- [ ] Have you gotten Sepolia ETH from faucet?
- [ ] Check balance directly in MetaMask
- [ ] Check on Etherscan: https://sepolia.etherscan.io/

### Transaction Failed
- [ ] Error message visible? Note it
- [ ] Insufficient balance? Get more Sepolia ETH
- [ ] Certificate ID already issued? Use new ID
- [ ] Check MetaMask transaction history

### Page Not Loading
- [ ] Frontend running? (`npm run dev` in frontend folder)
- [ ] Check console: http://localhost:5173 (F12)
- [ ] Port 5173 free? (default Vite port)
- [ ] Try different port: `npm run dev -- --port 3000`

---

## ✨ Success Criteria

Your MetaMask integration is working if:

- ✅ Can load http://localhost:5173/metamask-test
- ✅ "Connect MetaMask" button appears
- ✅ Can click button without errors
- ✅ MetaMask popup appears
- ✅ Can select account and connect
- ✅ Page shows account address
- ✅ Page shows ETH balance
- ✅ Can switch to Sepolia network
- ✅ Certificate form appears and is enabled
- ✅ Can submit certificate (with MetaMask confirmation)
- ✅ Transaction gets confirmed on blockchain
- ✅ Certificate appears on Etherscan

---

## 📊 Expected Results

### After Successful Connection
```
Status Cards:
  ✓ Kết Nối (green)
  ✓ Sepolia (green)
  0.5 ETH (or your balance)

Account Info:
  Address: 0xE8AB70e0b543a6B9b6675E6a343826f1Cbaa048A
  Balance: 0.5 ETH
  View on Etherscan: [Link]

Form Status:
  ✅ Certificate ID: [Input]
  ✅ Doc Hash: [Input]
  ✅ [🦊 Phát Hành Chứng Chỉ] (enabled)
```

### After Issuing Certificate
```
Transaction Status:
  ✅ Thành công!
  
Details:
  Transaction Hash: 0x9876543210abcdef...
  Block Number: 9852436
  Status: Confirmed ✓
```

---

## 📞 Getting Help

If something doesn't work:

1. **Check Console** (F12 → Console tab)
   - Look for red error messages
   - Note any warnings

2. **Check MetaMask Network**
   - Ensure on Sepolia testnet
   - Check gas prices aren't too high

3. **Check Balance**
   - Need Sepolia ETH for transactions
   - Get from faucet if balance is 0

4. **Check Docs**
   - [METAMASK_GUIDE.md](METAMASK_GUIDE.md) (full guide)
   - [METAMASK_QUICKSTART.md](METAMASK_QUICKSTART.md) (quick start)
   - [METAMASK_INTEGRATION_SUMMARY.md](METAMASK_INTEGRATION_SUMMARY.md) (complete summary)

---

## 🎯 Next Steps After Verification

Once everything works:

1. **Add to Other Pages**
   - [ ] Enable MetaMask on IssuerDashboard
   - [ ] Enable MetaMask on StudentDashboard
   - [ ] Update verification to check blockchain

2. **Improve Features**
   - [ ] Add transaction history
   - [ ] Show gas estimates before signing
   - [ ] Add batch issuance
   - [ ] Support hardware wallets

3. **Deploy to Production**
   - [ ] Deploy contract to mainnet
   - [ ] Update contract address
   - [ ] Deploy frontend to hosting
   - [ ] Set up environment variables

---

**Last Updated**: December 2025  
**Version**: 1.0  
**Status**: ✅ Ready for Testing
