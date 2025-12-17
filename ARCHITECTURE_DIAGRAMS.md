# 📊 MetaMask Integration - Architecture Diagrams

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     USER BROWSER                             │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │           CertChain React Application               │  │
│  │                                                       │  │
│  │  ┌─────────────────────────────────────────────┐   │  │
│  │  │         Routes (React Router)              │   │  │
│  │  │  / → Home                                  │   │  │
│  │  │  /metamask-test → MetaMaskTestPage        │   │  │
│  │  │  /issuer → IssuerDashboard                │   │  │
│  │  │  /student → StudentDashboard              │   │  │
│  │  │  /verify → VerifyPage                     │   │  │
│  │  └─────────────────────────────────────────────┘   │  │
│  │                        ↓                             │  │
│  │  ┌─────────────────────────────────────────────┐   │  │
│  │  │          Page Components                   │   │  │
│  │  │  MetaMaskTestPage                         │   │  │
│  │  │  └─ AppLayout                             │   │  │
│  │  │     ├─ MetaMaskConnect (Widget) ⭐       │   │  │
│  │  │     └─ Main Content                      │   │  │
│  │  │        ├─ ContractInteraction Form ⭐   │   │  │
│  │  │        └─ Status Cards                   │   │  │
│  │  └─────────────────────────────────────────────┘   │  │
│  │                        ↓                             │  │
│  │  ┌─────────────────────────────────────────────┐   │  │
│  │  │      Services (Web3 Integration)           │   │  │
│  │  │  metamask.ts ⭐                            │   │  │
│  │  │  ├─ MetaMaskService (singleton)           │   │  │
│  │  │  └─ useMetaMask() React Hook              │   │  │
│  │  │     ├─ connectWallet()                    │   │  │
│  │  │     ├─ getBalance()                       │   │  │
│  │  │     ├─ switchToSepolia()                  │   │  │
│  │  │     ├─ sendTransaction()                  │   │  │
│  │  │     └─ signMessage()                      │   │  │
│  │  └─────────────────────────────────────────────┘   │  │
│  │                        ↓                             │  │
│  │  ┌─────────────────────────────────────────────┐   │  │
│  │  │    window.ethereum (MetaMask Provider)     │   │  │
│  │  │    ✅ Wallet Connection                    │   │  │
│  │  │    ✅ Transaction Signing                  │   │  │
│  │  │    ✅ Message Signing                      │   │  │
│  │  │    ✅ Network Switching                    │   │  │
│  │  └─────────────────────────────────────────────┘   │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │          MetaMask Extension (Plugin)                │  │
│  │  • Wallet Management                               │  │
│  │  • Transaction Signing                             │  │
│  │  • Network Management                              │  │
│  │  • Account Management                              │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              ↓
                              │
┌─────────────────────────────────────────────────────────────┐
│         Ethereum Sepolia Testnet (RPC Node)                │
│  RPC: https://ethereum-sepolia.publicnode.com             │
│  Chain ID: 11155111                                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Smart Contract: CertificateRegistry                       │
│  Address: 0x895c3f9770a59F0062171c13395170E39B2dd084      │
│  Functions:                                                │
│    • issue(certificateId, docHash)                        │
│    • revoke(certificateId)                                │
│    • get(certificateId)                                   │
│    • setWhitelist(issuer, isActive)                       │
│                                                              │
│  State Storage:                                            │
│    • Certificates mapping                                 │
│    • Whitelist mapping                                    │
│    • Owner & issuer data                                  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔄 User Flow - Connecting & Issuing Certificate

```
START: User opens http://localhost:5173/metamask-test
  ↓
┌─────────────────────────────────────────┐
│ MetaMaskTestPage loads                 │
│ (useMetaMask hook initializes)         │
└─────────────────────────────────────────┘
  ↓
┌─────────────────────────────────────────┐
│ Check: MetaMask installed?              │
│  ✅ YES → Show MetaMaskConnect widget  │
│  ❌ NO  → Show "Install MetaMask" msg  │
└─────────────────────────────────────────┘
  ↓
  (User clicks "🦊 Connect MetaMask" button)
  ↓
┌─────────────────────────────────────────┐
│ metamask.ts:                           │
│ connectWallet()                        │
│  → window.ethereum.request({           │
│      method: 'eth_requestAccounts'     │
│    })                                  │
└─────────────────────────────────────────┘
  ↓
┌─────────────────────────────────────────┐
│ MetaMask Extension Popup:              │
│ "CertChain wants to connect your       │
│  account (0xE8AB70...)"               │
│                                        │
│ [Cancel]        [Connect]             │
└─────────────────────────────────────────┘
  ↓
  (User clicks "Connect")
  ↓
┌─────────────────────────────────────────┐
│ metamask.ts:                           │
│ • Store account address                │
│ • Get balance: getBalance()            │
│ • Check network: getChainId()          │
│ • If not Sepolia: switchToSepolia()   │
│ • Set event listeners:                 │
│   - onAccountsChanged()                │
│   - onChainChanged()                   │
└─────────────────────────────────────────┘
  ↓
┌─────────────────────────────────────────┐
│ Network Sepolia?                       │
│  ✅ YES → Continue                    │
│  ❌ NO  → Show "Switch Network" popup │
└─────────────────────────────────────────┘
  ↓
  (If NO, user clicks "Switch Network")
  ↓
┌─────────────────────────────────────────┐
│ MetaMask Extension Popup:              │
│ "Switch to Sepolia Testnet"           │
│                                        │
│ [Cancel]   [Switch Network]           │
└─────────────────────────────────────────┘
  ↓
┌─────────────────────────────────────────┐
│ Page Updates:                          │
│ • Account: ✓ Kết Nối (green)         │
│ • Network: ✓ Sepolia (green)         │
│ • Balance: 0.5 ETH                    │
│ • Form: Enabled                       │
└─────────────────────────────────────────┘
  ↓
  (User fills certificate form)
  ↓
┌─────────────────────────────────────────┐
│ Form Fields:                           │
│ Certificate ID: CERT-2026-0001        │
│ Doc Hash: 0x1234567890... (auto)      │
└─────────────────────────────────────────┘
  ↓
  (User clicks "🦊 Phát Hành Chứng Chỉ")
  ↓
┌─────────────────────────────────────────┐
│ ContractInteraction.tsx:               │
│ 1. Create ethers.Interface             │
│ 2. Encode function call:               │
│    encodeFunctionData('issue', [...]) │
│ 3. Send transaction:                   │
│    metamask.sendTransaction(           │
│      CONTRACT_ADDRESS,                 │
│      account,                          │
│      encodedData                       │
│    )                                   │
└─────────────────────────────────────────┘
  ↓
┌─────────────────────────────────────────┐
│ MetaMask Extension Popup:              │
│ ╔═════════════════════════════════╗   │
│ ║ Confirm Transaction             ║   │
│ ╠═════════════════════════════════╣   │
│ ║ To: 0x895c3f9770a59F...        ║   │
│ ║ Function: issue(...)            ║   │
│ ║ Gas Estimate: 180,000           ║   │
│ ║ Gas Price: 2 Gwei              ║   │
│ ║ Total: ~0.0036 ETH             ║   │
│ ║                                 ║   │
│ ║ [Reject]        [Confirm]      ║   │
│ ╚═════════════════════════════════╝   │
└─────────────────────────────────────────┘
  ↓
  (User clicks "Confirm")
  ↓
┌─────────────────────────────────────────┐
│ metamask.ts:                           │
│ • window.ethereum.request({            │
│     method: 'eth_sendTransaction',     │
│     params: [{...transaction}]         │
│   })                                   │
│ • Transaction signed by user's key    │
│ • Sent to RPC node                    │
└─────────────────────────────────────────┘
  ↓
┌─────────────────────────────────────────┐
│ UI Update:                             │
│ ⏳ Transaction đang xử lý...         │
│                                        │
│ Waiting for confirmation...           │
└─────────────────────────────────────────┘
  ↓
┌─────────────────────────────────────────┐
│ Sepolia Network:                       │
│ 1. RPC node receives transaction      │
│ 2. Validates transaction              │
│ 3. Adds to mempool                    │
│ 4. Miners/validators pick it up       │
│ 5. Includes in block                  │
│ 6. Block mined (~12 seconds)          │
│ 7. Confirmation sent back             │
└─────────────────────────────────────────┘
  ↓
┌─────────────────────────────────────────┐
│ Smart Contract Execution:              │
│ issue(CERT-2026-0001, 0x1234...)      │
│  → Verify caller whitelisted ✅       │
│  → Check ID not exists ✅             │
│  → Store certificate data ✅          │
│  → Emit IssueCertificate event ✅    │
│  → Return success ✅                  │
└─────────────────────────────────────────┘
  ↓
┌─────────────────────────────────────────┐
│ UI Final Update:                       │
│ ✅ Thành công!                       │
│                                        │
│ Transaction Hash:                     │
│ 0x9876543210abcdef...                │
│                                        │
│ Block Number: 9852436                 │
│ Status: Confirmed ✓                   │
│                                        │
│ [View on Etherscan]                   │
└─────────────────────────────────────────┘
  ↓
END: Certificate issued on blockchain! 🎉
```

---

## 📱 Component Relationship Diagram

```
                    App.jsx (Routes)
                         ↓
        ┌─────────────────┴──────────────────┐
        ↓                                    ↓
   Routes                            MetaMaskTestPage.tsx
   Config                                   ↓
        ↓                           AppLayout (Layout)
        ↓                                   ↓
   /metamask-test route          ┌─────────┴─────────┐
                                 ↓                   ↓
                          Header Component    Main Content
                                 ↓                   ↓
                         ┌────────────────┐  ┌──────────────┐
                         │MetaMaskConnect │  │Status Cards  │
                         │(Widget) ⭐    │  │Account Info  │
                         │- Connect btn  │  │Form          │
                         │- Address      │  │Faucet Info   │
                         │- Balance      │  └──────────────┘
                         │- Network      │
                         └────────┬───────┘
                                  ↓
                         useMetaMask() Hook
                                  ↓
                         metamask.ts Service
                                  ↓
                    ┌─────────────┴──────────────┐
                    ↓                            ↓
            MetaMaskService            window.ethereum
            (Singleton)                (MetaMask Provider)
            - connectWallet()               ↓
            - getBalance()           Wallet Management
            - switchNetwork()        Event Listeners
            - sendTransaction()      Transaction Signing
            - signMessage()
```

---

## 🔌 MetaMask Connection Flow

```
Browser                 MetaMask              Ethereum Network
 │                      Extension              (Sepolia)
 │                        │                        │
 ├─ Check installed ──→   │                        │
 │  (window.ethereum)     │                        │
 │←─ YES ────────────────│                        │
 │                        │                        │
 ├─ Request accounts ─→  │                        │
 │  (User approves)       │                        │
 │←─ [0xE8AB70...] ──────│                        │
 │                        │                        │
 ├─ Get balance ─────→   ├─ RPC call ────────→   │
 │                        │ eth_getBalance        │
 │←─ 0.5 ETH ────────────│←─ 500000000000... ──│
 │                        │                        │
 ├─ Get chain ID ────→   ├─ RPC call ────────→   │
 │                        │ eth_chainId           │
 │←─ 11155111 ───────────│←─ 0xaa36a7 ─────────│
 │                        │                        │
 ├─ Send Transaction ─→  │                        │
 │  {to, data, from, ...}│                        │
 │←─ Wait for sign ──────│                        │
 │                        │  (User signs)         │
 │  [Signature popup]     │                       │
 │  (User confirms)       │                        │
 │←─ Signed TX ──────────│                        │
 │                        ├─ RPC call ────────→  │
 │                        │ eth_sendRawTransaction
 │                        │←─ TX Hash ───────────│
 │←─ TX Hash: 0x9876...─│                        │
 │                        │                        │
 │  (Polling loop)        │                        │
 ├─ Check status ────→   ├─ RPC call ────────→   │
 │  eth_getTransactionReceipt                  │
 │←─ Pending ────────────│←─ Pending ────────────│
 │  (wait 12 sec)         │  (block processing)   │
 ├─ Check status ────→   ├─ RPC call ────────→   │
 │  eth_getTransactionReceipt                  │
 │←─ Confirmed ──────────│←─ Confirmed ──────────│
 │  Block: 9852436        │                        │
 │  Status: 1 (success)   │                        │
 │                        │                        │
 └─ Display result ──────────────────────────────┘
   ✅ Certificate issued!
```

---

## 🗂️ File Structure & Dependencies

```
frontend/
│
├── src/
│   ├── services/
│   │   ├── metamask.ts ⭐ (core Web3 service)
│   │   │   ├─ Imports: ethers, React
│   │   │   ├─ Exports: MetaMaskService, useMetaMask
│   │   │   └─ Type: TypeScript
│   │   │
│   │   ├── logger.ts (system logging)
│   │   ├── api.ts (backend API client)
│   │   └── ...
│   │
│   ├── components/
│   │   ├── MetaMaskConnect.tsx ⭐ (wallet widget)
│   │   │   ├─ Imports: useMetaMask, lucide-react
│   │   │   ├─ Exports: MetaMaskConnect component
│   │   │   └─ Type: TypeScript + JSX
│   │   │
│   │   ├── ContractInteraction.tsx ⭐ (form)
│   │   │   ├─ Imports: ethers, useMetaMask
│   │   │   ├─ Exports: ContractInteraction
│   │   │   └─ Type: TypeScript + JSX
│   │   │
│   │   └── ... (other components)
│   │
│   ├── pages/
│   │   ├── MetaMaskTestPage.tsx ⭐ (demo page)
│   │   │   ├─ Imports: MetaMaskConnect, ContractInteraction, useMetaMask
│   │   │   ├─ Exports: MetaMaskTestPage component
│   │   │   └─ Type: TypeScript + JSX
│   │   │
│   │   ├── IssuerDashboard.jsx
│   │   ├── StudentDashboard.jsx
│   │   ├── VerifyPage.tsx
│   │   └── ... (other pages)
│   │
│   ├── layouts/
│   │   ├── AppLayout.tsx ✏️ (MODIFIED)
│   │   │   ├─ Added: MetaMaskConnect import
│   │   │   ├─ Added: showMetaMask prop
│   │   │   └─ Updated: Header includes MetaMaskConnect
│   │   │
│   │   └── ... (other layouts)
│   │
│   ├── App.jsx ✏️ (MODIFIED)
│   │   ├─ Added: MetaMaskTestPage import
│   │   ├─ Added: /metamask-test route
│   │   └─ Added: MetaMask nav link
│   │
│   └── main.jsx (entry point)
│
├── public/
│   └── ...
│
├── package.json
└── vite.config.js
```

---

## 🔐 Data Flow - Certificate Issuance

```
React Component
(MetaMaskTestPage)
    ↓
    │
    ├─ User Input
    │   ├─ Certificate ID: "CERT-2026-0001"
    │   └─ Doc Hash: "0x1234567890..."
    │
    ↓
ContractInteraction.tsx
    ├─ Validate input
    ├─ Create ethers.Interface
    │   └─ Use CertificateRegistry ABI
    │
    ├─ Encode function call
    │   └─ encodeFunctionData('issue', [id, hash])
    │       Result: "0x123456..." (encoded bytes)
    │
    ├─ Call useMetaMask().sendTransaction()
    │   Input: {
    │     to: CONTRACT_ADDRESS,
    │     from: userAccount,
    │     data: encodedData,
    │     value: "0"
    │   }
    │
    ↓
metamask.ts (sendTransaction)
    ├─ Prepare transaction object
    ├─ Call window.ethereum.request()
    │   Method: 'eth_sendTransaction'
    │   Params: [transaction]
    │
    ├─ MetaMask popup shows
    ├─ User reviews & signs
    ├─ MetaMask creates signed transaction
    │
    ↓
MetaMask Extension
    ├─ Sign transaction with user's private key
    ├─ Create signed transaction (RLP encoded)
    ├─ Return txHash: "0x9876543210abcdef..."
    │
    ↓
Ethereum Sepolia RPC
    ├─ Receive signed transaction
    ├─ Validate transaction
    │   ├─ Check signature
    │   ├─ Verify nonce
    │   ├─ Check balance
    │   └─ Estimate gas
    │
    ├─ Add to mempool
    ├─ Broadcast to network
    ├─ Miners/validators include in block
    ├─ Block mined (~12 seconds)
    │
    ↓
Smart Contract (CertificateRegistry)
    ├─ Execute issue() function
    │   ├─ Verify msg.sender is whitelisted ✓
    │   ├─ Verify certificate ID unique ✓
    │   ├─ Store certificate data:
    │   │   ├─ certificateId → docHash mapping
    │   │   ├─ Issuer address
    │   │   └─ Timestamp
    │   │
    │   ├─ Emit IssueCertificate event:
    │   │   ├─ certificateId
    │   │   ├─ docHash
    │   │   ├─ issuer
    │   │   └─ timestamp
    │   │
    │   └─ Return success
    │
    ↓
Blockchain State Update
    ├─ Certificate data stored
    ├─ Event logged
    ├─ Block confirmed
    │
    ↓
Frontend (MetaMaskTestPage)
    ├─ Poll for transaction confirmation
    │   Using: eth_getTransactionReceipt
    │
    ├─ Receive confirmation:
    │   ├─ transactionHash: "0x9876..."
    │   ├─ blockNumber: 9852436
    │   ├─ status: 1 (success)
    │   └─ gasUsed: 180000
    │
    ├─ Update UI:
    │   ├─ Show "✅ Thành công!"
    │   ├─ Display TX hash
    │   ├─ Display block number
    │   └─ Provide Etherscan link
    │
    └─ Certificate successfully issued! 🎉

Verification:
    └─ Query blockchain using ethers.js
        ├─ Call contract.get(certificateId)
        └─ Returns stored certificate data ✅
```

---

**These diagrams show the complete flow from user interaction through blockchain confirmation.**

For more details, see:
- 📄 [METAMASK_INTEGRATION_SUMMARY.md](METAMASK_INTEGRATION_SUMMARY.md) (Technical details)
- 📄 [METAMASK_GUIDE.md](METAMASK_GUIDE.md) (Complete guide)
- 📄 [FINAL_DELIVERY_SUMMARY.md](FINAL_DELIVERY_SUMMARY.md) (Full summary)
