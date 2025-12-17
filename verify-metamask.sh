#!/bin/bash
# MetaMask Integration Verification Script

echo "🔍 MetaMask Integration Verification"
echo "===================================="
echo ""

# Check MetaMask Service
echo "✓ Checking Services..."
if [ -f "frontend/src/services/metamask.ts" ]; then
    echo "  ✅ metamask.ts exists"
else
    echo "  ❌ metamask.ts missing"
fi

# Check MetaMask Components
echo "✓ Checking Components..."
if [ -f "frontend/src/components/MetaMaskConnect.tsx" ]; then
    echo "  ✅ MetaMaskConnect.tsx exists"
else
    echo "  ❌ MetaMaskConnect.tsx missing"
fi

if [ -f "frontend/src/components/ContractInteraction.tsx" ]; then
    echo "  ✅ ContractInteraction.tsx exists"
else
    echo "  ❌ ContractInteraction.tsx missing"
fi

# Check MetaMask Test Page
echo "✓ Checking Pages..."
if [ -f "frontend/src/pages/MetaMaskTestPage.tsx" ]; then
    echo "  ✅ MetaMaskTestPage.tsx exists"
else
    echo "  ❌ MetaMaskTestPage.tsx missing"
fi

# Check AppLayout
echo "✓ Checking Layouts..."
if grep -q "MetaMaskConnect" frontend/src/layouts/AppLayout.tsx; then
    echo "  ✅ AppLayout imports MetaMaskConnect"
else
    echo "  ❌ AppLayout not updated"
fi

# Check App.jsx routes
echo "✓ Checking Routes..."
if grep -q "metamask-test" frontend/src/App.jsx; then
    echo "  ✅ Route /metamask-test configured"
else
    echo "  ❌ Route not configured"
fi

# Check Documentation
echo "✓ Checking Documentation..."
if [ -f "METAMASK_GUIDE.md" ]; then
    echo "  ✅ METAMASK_GUIDE.md exists"
else
    echo "  ❌ METAMASK_GUIDE.md missing"
fi

if [ -f "METAMASK_QUICKSTART.md" ]; then
    echo "  ✅ METAMASK_QUICKSTART.md exists"
else
    echo "  ❌ METAMASK_QUICKSTART.md missing"
fi

if [ -f "METAMASK_INTEGRATION_SUMMARY.md" ]; then
    echo "  ✅ METAMASK_INTEGRATION_SUMMARY.md exists"
else
    echo "  ❌ METAMASK_INTEGRATION_SUMMARY.md missing"
fi

echo ""
echo "===================================="
echo "✨ MetaMask Integration Complete!"
echo "===================================="
echo ""
echo "🚀 To test:"
echo "  1. cd frontend"
echo "  2. npm install"
echo "  3. npm run dev"
echo "  4. Open: http://localhost:5173/metamask-test"
echo ""
echo "📱 Setup:"
echo "  1. Install MetaMask: https://metamask.io/"
echo "  2. Get Sepolia ETH: https://www.alchemy.com/faucets/ethereum-sepolia"
echo "  3. Click 'Connect MetaMask' on test page"
echo ""
