import { useState, useEffect } from "react";
import { AppLayout } from "../../layouts/AppLayout";
import { Search, Filter, Download } from "lucide-react";

interface Log {
    id: string;
    timestamp: string;
    level: "INFO" | "SUCCESS" | "WARNING" | "ERROR";
    action: string;
    actor: string;
    message: string;
    metadata?: Record<string, any>;
}

export function LogsDashboard() {
    const [logs, setLogs] = useState<Log[]>([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        level: "",
        action: "",
        actor: "",
    });

    useEffect(() => {
        fetchLogs();
    }, []);

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const query = new URLSearchParams();
            if (filters.level) query.append("level", filters.level);
            if (filters.action) query.append("action", filters.action);
            if (filters.actor) query.append("actor", filters.actor);

            const response = await fetch(`/api/logs?${query}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            });

            if (response.ok) {
                const data = await response.json();
                setLogs(data.logs);
            }
        } catch (err) {
            console.error("Fetch logs error:", err);
        } finally {
            setLoading(false);
        }
    };

    const getLevelColor = (level: string) => {
        switch (level) {
            case "SUCCESS":
                return "text-green-400";
            case "ERROR":
                return "text-red-400";
            case "WARNING":
                return "text-yellow-400";
            default:
                return "text-cyan-400";
        }
    };

    const getLevelBg = (level: string) => {
        switch (level) {
            case "SUCCESS":
                return "bg-green-900";
            case "ERROR":
                return "bg-red-900";
            case "WARNING":
                return "bg-yellow-900";
            default:
                return "bg-cyan-900";
        }
    };

    return (
        <AppLayout title="Nhật Ký Hệ Thống" user={{ email: "admin@edu.vn", role: "Quản Trị" }}>
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <h2 className="text-2xl font-bold mb-4">Nhật Ký Hệ Thống</h2>
                    <p className="text-slate-400">Theo dõi tất cả hoạt động: Phát Hành → Yêu Cầu → Xác Minh</p>
                </div>

                {/* Filters */}
                <div className="bg-slate-800 rounded-lg p-4 mb-6">
                    <div className="flex items-center gap-2 mb-4">
                        <Filter size={20} />
                        <h3 className="font-semibold">Bộ Lọc</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <select
                            value={filters.level}
                            onChange={(e) => {
                                setFilters({ ...filters, level: e.target.value });
                            }}
                            className="px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white text-sm focus:outline-none focus:border-cyan-500"
                        >
                            <option value="">Tất Cả Mức Độ</option>
                            <option value="INFO">INFO</option>
                            <option value="SUCCESS">SUCCESS</option>
                            <option value="WARNING">WARNING</option>
                            <option value="ERROR">ERROR</option>
                        </select>

                        <select
                            value={filters.action}
                            onChange={(e) => {
                                setFilters({ ...filters, action: e.target.value });
                            }}
                            className="px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white text-sm focus:outline-none focus:border-cyan-500"
                        >
                            <option value="">Tất Cả Hành Động</option>
                            <option value="TEMPLATE_CREATE">Template Create</option>
                            <option value="CERTIFICATE_DRAFT">Certificate Draft</option>
                            <option value="CERTIFICATE_SIGN">Certificate Sign</option>
                            <option value="CERTIFICATE_ISSUE">Certificate Issue</option>
                            <option value="CERTIFICATE_REVOKE">Certificate Revoke</option>
                            <option value="CERTIFICATE_CLAIM">Certificate Claim</option>
                            <option value="CERTIFICATE_VERIFY">Certificate Verify</option>
                        </select>

                        <input
                            type="text"
                            placeholder="Tìm theo người dùng..."
                            value={filters.actor}
                            onChange={(e) => {
                                setFilters({ ...filters, actor: e.target.value });
                            }}
                            className="px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white text-sm placeholder-slate-400 focus:outline-none focus:border-cyan-500"
                        />

                        <button
                            onClick={fetchLogs}
                            className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded font-semibold transition text-sm"
                        >
                            <Search size={16} className="inline mr-2" />
                            Tìm Kiếm
                        </button>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-4 gap-4 mb-6">
                    <div className="bg-green-900 rounded-lg p-4 border border-green-700">
                        <p className="text-green-300 text-sm">Thành Công</p>
                        <p className="text-2xl font-bold text-green-400">
                            {logs.filter((l) => l.level === "SUCCESS").length}
                        </p>
                    </div>
                    <div className="bg-blue-900 rounded-lg p-4 border border-blue-700">
                        <p className="text-blue-300 text-sm">Thông Tin</p>
                        <p className="text-2xl font-bold text-blue-400">
                            {logs.filter((l) => l.level === "INFO").length}
                        </p>
                    </div>
                    <div className="bg-yellow-900 rounded-lg p-4 border border-yellow-700">
                        <p className="text-yellow-300 text-sm">Cảnh Báo</p>
                        <p className="text-2xl font-bold text-yellow-400">
                            {logs.filter((l) => l.level === "WARNING").length}
                        </p>
                    </div>
                    <div className="bg-red-900 rounded-lg p-4 border border-red-700">
                        <p className="text-red-300 text-sm">Lỗi</p>
                        <p className="text-2xl font-bold text-red-400">
                            {logs.filter((l) => l.level === "ERROR").length}
                        </p>
                    </div>
                </div>

                {/* Logs Table */}
                <div className="bg-slate-800 rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-slate-700">
                                <tr>
                                    <th className="px-4 py-3 text-left">Thời Gian</th>
                                    <th className="px-4 py-3 text-left">Mức Độ</th>
                                    <th className="px-4 py-3 text-left">Hành Động</th>
                                    <th className="px-4 py-3 text-left">Người Dùng</th>
                                    <th className="px-4 py-3 text-left">Tin Nhắn</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-700">
                                {loading ? (
                                    <tr>
                                        <td colSpan={5} className="px-4 py-4 text-center text-slate-400">
                                            Đang tải...
                                        </td>
                                    </tr>
                                ) : logs.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-4 py-4 text-center text-slate-400">
                                            Không có nhật ký nào
                                        </td>
                                    </tr>
                                ) : (
                                    logs.map((log) => (
                                        <tr key={log.id} className="hover:bg-slate-700 transition">
                                            <td className="px-4 py-3 text-xs text-slate-400">
                                                {new Date(log.timestamp).toLocaleString("vi-VN")}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span
                                                    className={`px-2 py-1 rounded text-xs font-semibold ${getLevelBg(
                                                        log.level
                                                    )} ${getLevelColor(log.level)}`}
                                                >
                                                    {log.level}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 font-mono text-xs">{log.action}</td>
                                            <td className="px-4 py-3 text-xs">{log.actor}</td>
                                            <td className="px-4 py-3 text-xs text-slate-300">{log.message}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Export Button */}
                <div className="mt-6 flex justify-end">
                    <button className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded font-semibold transition text-sm">
                        <Download size={16} />
                        Xuất CSV
                    </button>
                </div>
            </div>
        </AppLayout>
    );
}
