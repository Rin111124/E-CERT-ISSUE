import { useEffect, useState } from "react";
import { AppLayout } from "../../layouts/AppLayout.tsx";
import { listStudentCertificates } from "../../services/api";
import { Link } from "react-router-dom";
import { StatusBadge } from "../../components/StatusBadge";

export default function StudentCertificatesPage() {
    const [items, setItems] = useState<any[]>([]);

    useEffect(() => {
        listStudentCertificates()
            .then((data) => setItems(Array.isArray(data) ? data : []))
            .catch(() => setItems([]));
    }, []);

    return (
        <AppLayout title="Chứng chỉ của tôi" user={{ email: "student@certchain.edu", role: "Student" }}>
            <div className="panel">
                <div className="section-title">Danh sách chứng chỉ</div>
                <div className="grid gap-3">
                    {items.map((c) => (
                        <Link
                            key={c.id}
                            to={`/student/certificates/${c.id}`}
                            className="flex items-center justify-between rounded-lg border border-white/10 bg-slate-900 px-3 py-3 hover:border-cyan-400 transition"
                        >
                            <div className="space-y-1">
                                <div className="text-sm font-semibold text-white">{c.certificateId}</div>
                                <div className="text-xs text-slate-400">{c.program || c.courseName || "Chưa rõ"}</div>
                            </div>
                            <StatusBadge status={c.status} />
                        </Link>
                    ))}
                    {items.length === 0 && <div className="muted text-sm">Chưa có chứng chỉ.</div>}
                </div>
            </div>
        </AppLayout>
    );
}
