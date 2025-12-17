import { AppLayout } from "../../layouts/AppLayout.tsx";
import { MetaMaskConnect } from "../../components/MetaMaskConnect.tsx";

export default function IssuerSettingsPage() {
    return (
        <AppLayout title="Issuer Settings" showMetaMask user={{ email: "issuer@certchain.edu", role: "Issuer" }}>
            <div className="grid gap-4">
                <div className="panel stack">
                    <div className="section-title">Wallet & Network</div>
                    <MetaMaskConnect />
                </div>
                <div className="panel stack">
                    <div className="section-title">Contract</div>
                    <p className="muted">Configure contract address and RPC in .env (read-only placeholder).</p>
                </div>
            </div>
        </AppLayout>
    );
}
