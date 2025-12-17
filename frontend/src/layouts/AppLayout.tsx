import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import { MetaMaskConnect } from "../components/MetaMaskConnect.tsx";

type Props = {
    children: ReactNode;
    title?: string;
    user?: { email: string; role: string };
    showMetaMask?: boolean;
};

export function AppLayout({ children, title = "CertChain", user, showMetaMask = false }: Props) {
    const navigate = useNavigate();

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        navigate("/login");
    };

    return (
        <div className="min-h-screen flex flex-col text-slate-100">
            <header className="sticky top-0 z-10 border-b border-white/10 bg-slate-900/80 backdrop-blur-xl shadow-lg">
                <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
                    <div>
                        <p className="text-xs uppercase tracking-[0.16em] text-slate-400">CertChain</p>
                        <h1 className="text-3xl font-extrabold text-white leading-tight">{title}</h1>
                        <p className="text-xs text-slate-400">
                            Hệ thống cấp chứng chỉ điện tử end-to-end với MetaMask và blockchain.
                        </p>
                    </div>
                    <div className="flex items-center gap-5">
                        {showMetaMask && <MetaMaskConnect />}
                        {user && (
                            <div className="flex items-center gap-4 rounded-lg border border-white/10 bg-white/5 px-3 py-2">
                                <div className="text-sm">
                                    <p className="font-semibold text-white">{user.email}</p>
                                    <p className="text-slate-400 text-xs">{user.role}</p>
                                </div>
                                <button
                                    onClick={logout}
                                    className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-cyan-400 to-fuchsia-500 px-3 py-2 text-xs font-semibold text-slate-900 shadow-md shadow-cyan-500/30 transition hover:from-cyan-300 hover:to-fuchsia-400"
                                >
                                    <LogOut size={16} />
                                    Logout
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            <main className="flex-1">
                <div className="mx-auto max-w-6xl px-4 py-8">{children}</div>
            </main>

            <footer className="border-t border-white/5 bg-slate-900/70 text-center py-4 text-xs text-slate-400">
                <p>CertChain © 2025 — Issuance • Storage • Verification</p>
            </footer>
        </div>
    );
}
