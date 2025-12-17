import type { ReactNode } from "react";
import { AppLayout } from "../layouts/AppLayout";
import { ContractInteraction } from "../components/ContractInteraction";
import { useMetaMask } from "../services/metamask";
import {
    AlertTriangle,
    CheckCircle,
    ExternalLink,
    RefreshCcw,
    ShieldCheck,
    Sparkles,
    Wallet,
    Wifi,
} from "lucide-react";

export function MetaMaskTestPage() {
    const {
        account,
        balance,
        isSepolia,
        isConnected,
        isLoading,
        error,
        connect,
        switchNetwork,
    } = useMetaMask();

    return (
        <AppLayout
            title="MetaMask Integration"
            showMetaMask={true}
            user={{ email: "developer@certchain.edu", role: "Developer" }}
        >
            <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
                <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-br from-cyan-500/15 via-slate-900 to-fuchsia-600/10 p-6 shadow-2xl">
                    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(124,247,255,0.12),transparent_35%),radial-gradient(circle_at_80%_0%,rgba(139,92,246,0.12),transparent_30%)]" />
                    <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div className="space-y-2">
                            <Badge>
                                <Sparkles size={14} /> Quick start
                            </Badge>
                            <h2 className="text-3xl font-bold text-white">Test your wallet in 3 steps</h2>
                            <p className="max-w-2xl text-sm text-slate-200">
                                Connect MetaMask, switch to Sepolia, then send a sample transaction to the demo smart
                                contract. Everything you need is on this page.
                            </p>
                            {error && (
                                <div className="flex items-center gap-2 rounded-lg border border-red-500/40 bg-red-900/50 px-3 py-2 text-sm text-red-200">
                                    <AlertTriangle size={16} />
                                    {error}
                                </div>
                            )}
                        </div>
                        <div className="flex flex-wrap items-center gap-3">
                            <button
                                onClick={connect}
                                disabled={isConnected || isLoading}
                                className="inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-4 py-3 text-sm font-semibold text-slate-900 shadow-lg shadow-cyan-500/30 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-300"
                            >
                                <Wallet size={18} />
                                {isConnected ? "Connected" : isLoading ? "Connecting..." : "Connect MetaMask"}
                            </button>
                            <button
                                onClick={switchNetwork}
                                disabled={!isConnected || isSepolia || isLoading}
                                className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm font-semibold text-slate-100 transition hover:border-cyan-400 hover:text-cyan-200 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                <RefreshCcw size={16} />
                                {isSepolia ? "On Sepolia" : "Switch to Sepolia"}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                    <StatusCard
                        title="Wallet"
                        value={isConnected ? "Connected" : "Not connected"}
                        icon={<Wallet className="text-cyan-300" size={18} />}
                        tone={isConnected ? "success" : "warn"}
                        helper={account ? `${account.slice(0, 6)}...${account.slice(-4)}` : "Open MetaMask to connect"}
                    />
                    <StatusCard
                        title="Network"
                        value={isSepolia ? "Sepolia Testnet" : "Switch to Sepolia"}
                        icon={<Wifi className="text-amber-300" size={18} />}
                        tone={isSepolia ? "success" : "warn"}
                        helper={isSepolia ? "Ready for contract calls" : "Network must be Sepolia"}
                    />
                    <StatusCard
                        title="Balance"
                        value={`${balance} ETH`}
                        icon={<CheckCircle className="text-emerald-300" size={18} />}
                        tone="neutral"
                        helper="Sepolia test ETH"
                    />
                    <StatusCard
                        title="Next step"
                        value={isConnected ? (isSepolia ? "Send a test tx" : "Switch network") : "Connect wallet"}
                        icon={<Sparkles className="text-fuchsia-300" size={18} />}
                        tone="neutral"
                        helper="Follow the checklist below"
                    />
                </div>

                <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                    <div className="lg:col-span-2 space-y-4">
                        <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-5 shadow-lg">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs uppercase tracking-[0.12em] text-slate-400">Checklist</p>
                                    <h3 className="text-lg font-semibold text-white">Get ready in minutes</h3>
                                </div>
                                <div className="rounded-full border border-slate-700 bg-slate-800 px-3 py-1 text-xs text-slate-300">
                                    Beginner friendly
                                </div>
                            </div>
                            <ol className="mt-4 space-y-3 text-sm text-slate-200">
                                <ChecklistRow
                                    done={isConnected}
                                    title="Connect MetaMask"
                                    description="Use the header button or the connect button above."
                                />
                                <ChecklistRow
                                    done={isSepolia}
                                    title="Switch to Sepolia"
                                    description="Click Switch to Sepolia and approve in MetaMask."
                                />
                                <ChecklistRow
                                    done={false}
                                    title="Send a sample transaction"
                                    description="Fill the contract form below to issue a test certificate on-chain."
                                />
                            </ol>
                        </div>

                        <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-5 shadow-lg">
                            <div className="flex items-center gap-2 text-sm font-semibold text-white">
                                <ShieldCheck size={18} className="text-cyan-300" />
                                Smart contract interaction
                            </div>
                            <p className="mt-1 text-sm text-slate-400">
                                Issue a sample certificate directly from your wallet. Works only on Sepolia.
                            </p>
                            <div className="mt-4">
                                <ContractInteraction />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="rounded-xl border border-slate-800 bg-gradient-to-b from-slate-900 to-slate-950 p-5 shadow-lg">
                            <p className="text-xs uppercase tracking-[0.12em] text-slate-400">Need test ETH?</p>
                            <h3 className="text-lg font-semibold text-white">Grab Sepolia ETH</h3>
                            <p className="text-sm text-slate-400">
                                You only need a tiny amount to submit a transaction. Each faucet sends a small drip.
                            </p>
                            <div className="mt-3 space-y-2 text-sm">
                                <FaucetLink label="Alchemy Faucet" href="https://www.alchemy.com/faucets/ethereum-sepolia" />
                                <FaucetLink label="Infura Faucet" href="https://www.infura.io/faucet/sepolia" />
                                <FaucetLink label="QuickNode Faucet" href="https://faucet.quicknode.com/ethereum/sepolia" />
                            </div>
                        </div>

                        <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-5 shadow-lg">
                            <p className="text-xs uppercase tracking-[0.12em] text-slate-400">Developer info</p>
                            <h3 className="text-lg font-semibold text-white">Connection details</h3>
                            <div className="mt-3 space-y-2 text-xs font-mono text-slate-300">
                                <div>
                                    <p className="text-slate-500">Contract address</p>
                                    <p className="break-all text-cyan-300">
                                        {import.meta.env.VITE_CONTRACT_ADDRESS || "0x895c3f9770a59F0062171c13395170E39B2dd084"}
                                    </p>
                                </div>
                                <div className="pt-2">
                                    <p className="text-slate-500">RPC endpoint</p>
                                    <p className="break-all text-cyan-300">
                                        {import.meta.env.VITE_SEPOLIA_RPC_URL || "https://sepolia.infura.io/v3/YOUR_PROJECT_ID"}
                                    </p>
                                </div>
                                <div className="pt-2">
                                    <p className="text-slate-500">Chain ID</p>
                                    <p className="text-cyan-300">11155111 (0xaa36a7)</p>
                                </div>
                                <div className="pt-2">
                                    <a
                                        className="inline-flex items-center gap-2 text-cyan-300 hover:text-cyan-100"
                                        href="https://sepolia.etherscan.io/address/0x895c3f9770a59F0062171c13395170E39B2dd084"
                                        target="_blank"
                                        rel="noreferrer"
                                    >
                                        View on Etherscan <ExternalLink size={14} />
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

type StatusTone = "success" | "warn" | "neutral";

type StatusCardProps = {
    title: string;
    value: string;
    helper: string;
    tone?: StatusTone;
    icon: ReactNode;
};

function StatusCard({ title, value, helper, icon, tone = "neutral" }: StatusCardProps) {
    const toneStyles =
        tone === "success"
            ? "border-emerald-500/30 bg-emerald-500/5"
            : tone === "warn"
                ? "border-amber-500/30 bg-amber-500/5"
                : "border-slate-800 bg-slate-900/70";

    return (
        <div className={`rounded-xl border ${toneStyles} p-4 shadow`}>
            <div className="flex items-center justify-between text-sm text-slate-300">
                <span>{title}</span>
                <span>{icon}</span>
            </div>
            <div className="mt-2 text-lg font-semibold text-white">{value}</div>
            <div className="text-xs text-slate-400">{helper}</div>
        </div>
    );
}

type ChecklistRowProps = {
    done: boolean;
    title: string;
    description: string;
};

function ChecklistRow({ done, title, description }: ChecklistRowProps) {
    return (
        <li className="flex items-start gap-3">
            <CheckCircle size={18} className={done ? "text-emerald-400" : "text-slate-600"} />
            <div>
                <p className="font-semibold">{title}</p>
                <p className="text-slate-400">{description}</p>
            </div>
        </li>
    );
}

type FaucetLinkProps = {
    label: string;
    href: string;
};

function FaucetLink({ label, href }: FaucetLinkProps) {
    return (
        <a
            href={href}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-slate-200 transition hover:border-cyan-400 hover:text-white"
        >
            <span>{label}</span>
            <ExternalLink size={14} />
        </a>
    );
}

function Badge({ children }: { children: ReactNode }) {
    return (
        <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.08em] text-cyan-200">
            {children}
        </div>
    );
}
