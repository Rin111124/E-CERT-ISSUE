import { useState } from "react";
import { useMetaMask } from "../services/metamask";
import { ethers } from "ethers";
import { AlertCircle, CheckCircle } from "lucide-react";

const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS || "0x895c3f9770a59F0062171c13395170E39B2dd084";
const CONTRACT_ABI = [
    "function issue(bytes32 certificateId, bytes32 docHash) external",
    "function revoke(bytes32 certificateId) external",
    "function get(bytes32 certificateId) external view returns (tuple(bytes32 docHash, address issuer, uint64 issuedAt, bool revoked))",
    "function whitelist(address issuer) external view returns (bool)",
];

export function ContractInteraction() {
    const { account, isSepolia, sendTransaction } = useMetaMask();
    const [certificateId, setCertificateId] = useState("");
    const [docHash, setDocHash] = useState("");
    const [result, setResult] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const issueCertificate = async () => {
        if (!account || !isSepolia) {
            setError("Vui lòng kết nối MetaMask và chọn mạng Sepolia");
            return;
        }

        if (!certificateId || !docHash) {
            setError("Vui lòng nhập certificateId và docHash");
            return;
        }

        setLoading(true);
        setError("");

        try {
            // Mã hóa certificateId và docHash thành bytes32
            const certIdBytes = ethers.id(certificateId); // Keccak256
            const docHashBytes = docHash.startsWith("0x")
                ? docHash
                : "0x" + docHash;

            // Encode function call
            const iface = new ethers.Interface(CONTRACT_ABI);
            const encodedData = iface.encodeFunctionData("issue", [
                certIdBytes,
                docHashBytes,
            ]);

            // Gửi transaction thông qua MetaMask
            const txHash = await sendTransaction(CONTRACT_ADDRESS, account, encodedData);

            setResult({
                status: "pending",
                txHash,
                message: "Transaction đang xử lý...",
            });

            // Chờ confirmation
            const provider = new ethers.JsonRpcProvider(
                "https://ethereum-sepolia.publicnode.com"
            );
            const receipt = await provider.waitForTransaction(txHash);

            setResult({
                status: "success",
                txHash,
                blockNumber: receipt?.blockNumber,
                message: "Chứng chỉ đã phát hành thành công!",
            });

            // Reset form
            setCertificateId("");
            setDocHash("");
        } catch (err: any) {
            setError(err.message || "Lỗi khi phát hành chứng chỉ");
            setResult(null);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-slate-800 rounded-lg p-6 space-y-4">
            <h3 className="text-lg font-bold">Phát Hành Chứng Chỉ (Smart Contract)</h3>

            {!isSepolia && (
                <div className="flex items-start gap-3 p-3 bg-yellow-900 border border-yellow-700 rounded">
                    <AlertCircle size={20} className="text-yellow-400 flex-shrink-0 mt-0.5" />
                    <p className="text-yellow-300 text-sm">
                        Bạn cần chuyển sang mạng Sepolia để tương tác với smart contract
                    </p>
                </div>
            )}

            <div className="space-y-3">
                <div>
                    <label className="block text-sm font-semibold mb-2">Mã Chứng Chỉ</label>
                    <input
                        type="text"
                        placeholder="VD: CERT-2026-0001"
                        value={certificateId}
                        onChange={(e) => setCertificateId(e.target.value)}
                        className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"
                    />
                </div>

                <div>
                    <label className="block text-sm font-semibold mb-2">Document Hash (SHA-256)</label>
                    <input
                        type="text"
                        placeholder="0x1234567890abcdef... hoặc 1234567890abcdef..."
                        value={docHash}
                        onChange={(e) => setDocHash(e.target.value)}
                        className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-400 font-mono text-xs focus:outline-none focus:border-cyan-500"
                    />
                    <p className="text-xs text-slate-400 mt-1">
                        64 ký tự hex (256 bits) hoặc có 0x prefix
                    </p>
                </div>

                {error && (
                    <div className="flex items-start gap-3 p-3 bg-red-900 border border-red-700 rounded">
                        <AlertCircle size={20} className="text-red-400 flex-shrink-0 mt-0.5" />
                        <p className="text-red-300 text-sm">{error}</p>
                    </div>
                )}

                {result && (
                    <div
                        className={`p-4 rounded border ${result.status === "success"
                            ? "bg-green-900 border-green-700"
                            : "bg-blue-900 border-blue-700"
                            }`}
                    >
                        <div className="flex items-start gap-3">
                            <CheckCircle
                                size={20}
                                className={
                                    result.status === "success"
                                        ? "text-green-400"
                                        : "text-blue-400"
                                }
                                style={{
                                    marginTop: "2px",
                                    animation:
                                        result.status === "pending"
                                            ? "spin 1s linear infinite"
                                            : "none",
                                }}
                            />
                            <div>
                                <p
                                    className={
                                        result.status === "success"
                                            ? "text-green-300 font-semibold"
                                            : "text-blue-300 font-semibold"
                                    }
                                >
                                    {result.message}
                                </p>
                                <p className="text-xs text-slate-300 mt-1 font-mono">
                                    TX: {result.txHash?.slice(0, 16)}...
                                </p>
                                {result.blockNumber && (
                                    <p className="text-xs text-slate-300 font-mono">
                                        Block: #{result.blockNumber}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                <button
                    onClick={issueCertificate}
                    disabled={loading || !isSepolia || !certificateId || !docHash}
                    className="w-full bg-cyan-600 hover:bg-cyan-700 disabled:bg-slate-600 px-4 py-3 rounded font-semibold transition"
                >
                    {loading ? "Đang xử lý..." : "Phát Hành Trên Blockchain"}
                </button>
            </div>

            <div className="border-t border-slate-700 pt-4 text-xs text-slate-400">
                <p className="mb-2">
                    <strong>Hướng dẫn:</strong>
                </p>
                <ol className="list-decimal list-inside space-y-1">
                    <li>Kết nối MetaMask và chọn mạng Sepolia</li>
                    <li>Backend sẽ tạo certificateId + docHash</li>
                    <li>Nhập vào form và ký transaction</li>
                    <li>Chứng chỉ sẽ được lưu trên blockchain</li>
                </ol>
            </div>
        </div>
    );
}
