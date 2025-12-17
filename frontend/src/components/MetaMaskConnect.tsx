import { useEffect } from "react";
import { useMetaMask } from "../services/metamask";
import { Wallet, AlertCircle, CheckCircle } from "lucide-react";

export function MetaMaskConnect() {
    const {
        account,
        balance,
        chainId,
        isConnected,
        isSepolia,
        isLoading,
        error,
        connect,
        switchNetwork,
    } = useMetaMask();

    // Tự động chuyển sang Sepolia nếu chưa
    useEffect(() => {
        if (isConnected && !isSepolia) {
            console.warn("Không phải mạng Sepolia, chuyển đổi...");
            switchNetwork();
        }
    }, [isConnected, isSepolia]);

    if (!isConnected) {
        return (
            <div className="flex items-center gap-3">
                <button
                    onClick={connect}
                    disabled={isLoading}
                    className="flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 disabled:bg-slate-600 rounded font-semibold transition"
                >
                    <Wallet size={18} />
                    {isLoading ? "Kết nối..." : "MetaMask"}
                </button>

                {error && (
                    <div className="flex items-center gap-2 px-3 py-2 bg-red-900 border border-red-700 rounded text-red-300 text-sm">
                        <AlertCircle size={16} />
                        {error}
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="flex items-center gap-4">
            {/* Trạng thái kết nối */}
            <div className="flex items-center gap-2">
                <CheckCircle size={18} className="text-green-400" />
                <div className="text-sm">
                    <p className="font-semibold text-green-400">Kết Nối</p>
                    <p className="text-xs text-slate-400">{account?.slice(0, 10)}...</p>
                </div>
            </div>

            {/* Số dư */}
            <div className="text-sm">
                <p className="font-semibold text-cyan-400">Số Dư</p>
                <p className="text-xs text-slate-400">{balance} SepoliaETH</p>
            </div>

            {/* Mạng */}
            <div className="text-sm">
                <p className="font-semibold text-orange-400">Mạng</p>
                {isSepolia ? (
                    <p className="text-xs text-green-400">✓ Sepolia</p>
                ) : (
                    <button
                        onClick={switchNetwork}
                        className="text-xs text-yellow-400 hover:text-yellow-300 underline"
                    >
                        Chuyển sang Sepolia
                    </button>
                )}
            </div>
        </div>
    );
}
