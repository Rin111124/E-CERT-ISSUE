import { useEffect, useState } from "react";
import { ethers } from "ethers";

export default function MetaMaskConnect({ onConnected }) {
  const [account, setAccount] = useState(null);

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", (accounts) => {
        setAccount(accounts[0]);
        onConnected?.(accounts[0]);
      });
    }
  }, [onConnected]);

  const connect = async () => {
    if (!window.ethereum) {
      alert("MetaMask required");
      return;
    }
    const [addr] = await window.ethereum.request({ method: "eth_requestAccounts" });
    setAccount(addr);
    onConnected?.(addr);
  };

  return (
    <div className="card">
      <div>Wallet: {account || "Not connected"}</div>
      <button onClick={connect}>Connect MetaMask</button>
    </div>
  );
}
