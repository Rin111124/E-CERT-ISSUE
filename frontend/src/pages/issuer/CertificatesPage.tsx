import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AppLayout } from "../../layouts/AppLayout";
import { listCertificates } from "../../services/api";
import { StatusBadge } from "../../components/StatusBadge";
import { Plus } from "lucide-react";

export default function CertificatesPage() {
    const [q, setQ] = useState("");
    const [status, setStatus] = useState<string | "ALL">("ALL");
    const [items, setItems] = useState<any[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        (async () => {
            try {
                const data = await listCertificates();
                setItems(Array.isArray(data) ? data : []);
            } catch (e: any) {
                setError(e.response?.data?.message || e.message || "Không tải được danh sách chứng chỉ");
                setItems([]);
            }
        })();
    }, []);

    const filtered = useMemo(() => {
        const safeItems = Array.isArray(items) ? items : [];
        return safeItems.filter(
            (it) =>
                (status === "ALL" || it.status === status) &&
                (!q ||
                    it.certificateId?.toLowerCase().includes(q.toLowerCase()) ||
                    (it.holderName || it.studentName || "").toLowerCase().includes(q.toLowerCase()))
        );
    }, [q, status, items]);

    return (
        <AppLayout title="Chứng chỉ" showMetaMask user={{ email: "issuer@certchain.edu", role: "Issuer" }}>
            <div className="stack">
                {error && <div className="callout danger">{error}</div>}
                <div className="panel flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-3 w-full">
                        <input
                            className="input md:flex-1"
                            placeholder="Tìm certificateId hoặc người nhận"
                            value={q}
                            onChange={(e) => setQ(e.target.value)}
                        />
                        <select className="input md:w-48" value={status} onChange={(e) => setStatus(e.target.value)}>
                            <option value="ALL">Tất cả</option>
                            <option value="DRAFT">Draft</option>
                            <option value="ISSUED">Issued</option>
                            <option value="REVOKED">Revoked</option>
                        </select>
                    </div>
                    <Link to="/issuer/certificates/new" className="btn btn-primary inline-flex items-center gap-2">
                        <Plus size={16} />
                        Tạo mới
                    </Link>
                </div>

                <div className="panel">
                    <div className="grid gap-3">
                        {filtered.map((c) => (
                            <Link
                                key={c.id}
                                to={`/issuer/certificates/${c.id}`}
                                className="flex items-center justify-between rounded-lg border border-white/10 bg-slate-900 px-3 py-3 hover:border-cyan-400 transition"
                            >
                                <div className="space-y-1">
                                    <div className="text-sm font-semibold text-white">{c.certificateId}</div>
                                    <div className="text-xs text-slate-400">
                                        {(c.holderName || c.studentName || "Chưa rõ")} ·{" "}
                                        {(c.program || c.courseName || "Chưa rõ")}
                                    </div>
                                </div>
                                <StatusBadge status={c.status} />
                            </Link>
                        ))}
                        {filtered.length === 0 && <div className="muted text-sm">Không có chứng chỉ.</div>}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
