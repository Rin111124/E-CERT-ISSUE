import { useState } from "react";
import { AppLayout } from "../../layouts/AppLayout";
import { logger } from "../../services/logger";
import { CheckCircle, AlertCircle, Copy } from "lucide-react";

export default function ClaimPage() {
    const [claimToken, setClaimToken] = useState("");
    const [claimed, setClaimed] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleClaim = async () => {
        if (!claimToken.trim()) {
            setError("Vui lòng nhập mã yêu cầu");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const response = await fetch("/api/students/claim", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
                body: JSON.stringify({ claimToken }),
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error || "Yêu cầu thất bại");
            }

            const data = await response.json();
            setClaimed(data);

            await logger.success("CERTIFICATE_CLAIM", `Yêu cầu chứng chỉ thành công`, {
                certificateId: data.certificateId,
                studentEmail: data.studentEmail,
            });
        } catch (err: any) {
            setError(err.message);
            await logger.error("CERTIFICATE_CLAIM", `Yêu cầu thất bại: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
    };

    return (
        <AppLayout title="Yêu Cầu Chứng Chỉ" user={{ email: "student@example.com", role: "Học Viên" }}>
            <div className="max-w-2xl mx-auto">
                {!claimed ? (
                    <>
                        <div className="bg-slate-800 rounded-lg p-6 mb-6">
                            <h2 className="text-2xl font-bold mb-4">Yêu Cầu Chứng Chỉ Của Bạn</h2>
                            <p className="text-slate-400 mb-6">
                                Hãy nhập mã yêu cầu (claim token) mà bạn nhận được từ cơ sở cấp. Mã này sẽ được gửi đến
                                email của bạn hoặc có thể được chia sẻ trực tiếp.
                            </p>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold mb-2">Mã Yêu Cầu</label>
                                    <textarea
                                        placeholder="Dán mã yêu cầu (claim token) tại đây..."
                                        value={claimToken}
                                        onChange={(e) => {
                                            setClaimToken(e.target.value);
                                            setError("");
                                        }}
                                        className="w-full h-24 px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-400 font-mono text-xs focus:outline-none focus:border-cyan-500"
                                    />
                                    <p className="text-xs text-slate-400 mt-2">
                                        Mã là một chuỗi JWT dài được mã hóa
                                    </p>
                                </div>

                                {error && (
                                    <div className="flex items-start gap-3 p-3 bg-red-900 border border-red-700 rounded">
                                        <AlertCircle size={20} className="text-red-400 flex-shrink-0 mt-0.5" />
                                        <p className="text-red-300 text-sm">{error}</p>
                                    </div>
                                )}

                                <button
                                    onClick={handleClaim}
                                    disabled={loading || !claimToken.trim()}
                                    className="w-full bg-cyan-600 hover:bg-cyan-700 disabled:bg-slate-600 px-4 py-3 rounded font-semibold transition"
                                >
                                    {loading ? "Đang xử lý..." : "Yêu Cầu Chứng Chỉ"}
                                </button>
                            </div>
                        </div>

                        {/* Info Cards */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-slate-800 rounded-lg p-4">
                                <h3 className="font-semibold text-cyan-400 mb-2">Quy Trình</h3>
                                <ol className="text-xs text-slate-400 space-y-1">
                                    <li>1. Cơ sở cấp phát hành chứng chỉ</li>
                                    <li>2. Bạn nhận mã yêu cầu</li>
                                    <li>3. Dán mã ở trên</li>
                                    <li>4. Chứng chỉ được thêm vào tài khoản</li>
                                </ol>
                            </div>
                            <div className="bg-slate-800 rounded-lg p-4">
                                <h3 className="font-semibold text-green-400 mb-2">Lợi Ích</h3>
                                <ul className="text-xs text-slate-400 space-y-1">
                                    <li>✓ Lưu trữ an toàn</li>
                                    <li>✓ Xác minh nhanh chóng</li>
                                    <li>✓ Chia sẻ dễ dàng</li>
                                    <li>✓ Bất biến trên blockchain</li>
                                </ul>
                            </div>
                        </div>
                    </>
                ) : (
                    <>
                        {/* Success */}
                        <div className="bg-green-900 border border-green-700 rounded-lg p-6 mb-6">
                            <div className="flex items-start gap-4">
                                <CheckCircle size={32} className="text-green-400 flex-shrink-0" />
                                <div>
                                    <h2 className="text-2xl font-bold text-green-300 mb-2">Thành Công!</h2>
                                    <p className="text-green-200">
                                        Chứng chỉ của bạn đã được yêu cầu thành công. Bây giờ bạn có thể xem chi tiết và
                                        tải xuống.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Credential Details */}
                        <div className="bg-slate-800 rounded-lg p-6 space-y-4">
                            <h3 className="text-xl font-bold">Chi Tiết Chứng Chỉ</h3>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-slate-700 p-4 rounded">
                                    <p className="text-xs text-slate-400 mb-1">Mã Chứng Chỉ</p>
                                    <p className="font-mono text-sm text-cyan-400">{claimed.certificateId}</p>
                                </div>
                                <div className="bg-slate-700 p-4 rounded">
                                    <p className="text-xs text-slate-400 mb-1">Người Nhận</p>
                                    <p className="text-sm">{claimed.studentName}</p>
                                </div>
                                <div className="bg-slate-700 p-4 rounded">
                                    <p className="text-xs text-slate-400 mb-1">Khóa Học</p>
                                    <p className="text-sm">{claimed.courseName}</p>
                                </div>
                                <div className="bg-slate-700 p-4 rounded">
                                    <p className="text-xs text-slate-400 mb-1">Ngày Cấp</p>
                                    <p className="text-sm">{new Date(claimed.issueDate).toLocaleDateString("vi-VN")}</p>
                                </div>
                            </div>

                            {/* Blockchain Hash */}
                            <div className="border-t border-slate-700 pt-4">
                                <h4 className="font-semibold mb-2">Xác Minh Blockchain</h4>
                                <div className="space-y-2 text-xs">
                                    <div className="bg-slate-700 p-3 rounded font-mono flex items-start gap-2">
                                        <span className="text-slate-400">Hash:</span>
                                        <span className="text-green-400 break-all flex-1">{claimed.docHash?.slice(0, 32)}...</span>
                                        <button
                                            onClick={() => copyToClipboard(claimed.docHash)}
                                            className="text-cyan-400 hover:text-cyan-300 flex-shrink-0"
                                        >
                                            <Copy size={16} />
                                        </button>
                                    </div>
                                    <div className="bg-slate-700 p-3 rounded font-mono flex items-start gap-2">
                                        <span className="text-slate-400">TX:</span>
                                        <span className="text-blue-400 break-all flex-1">{claimed.transactionHash?.slice(0, 32)}...</span>
                                        <button
                                            onClick={() => copyToClipboard(claimed.transactionHash)}
                                            className="text-cyan-400 hover:text-cyan-300 flex-shrink-0"
                                        >
                                            <Copy size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-4">
                                <button className="flex-1 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded font-semibold transition">
                                    Xem Chi Tiết
                                </button>
                                <button className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded font-semibold transition">
                                    Tải Xuống PDF
                                </button>
                            </div>

                            <button
                                onClick={() => {
                                    setClaimed(null);
                                    setClaimToken("");
                                }}
                                className="w-full px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded font-semibold transition text-sm"
                            >
                                Yêu Cầu Chứng Chỉ Khác
                            </button>
                        </div>
                    </>
                )}
            </div>
        </AppLayout>
    );
}
