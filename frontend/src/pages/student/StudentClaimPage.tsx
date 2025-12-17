import { useEffect, useState } from "react";
import { AppLayout } from "../../layouts/AppLayout.tsx";
import { claimCertificate } from "../../services/api";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function StudentClaimPage() {
    const [searchParams] = useSearchParams();
    const [token, setToken] = useState("");
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const t = searchParams.get("token");
        if (t) setToken(t);
    }, [searchParams]);

    const normalizeToken = (raw: string) => {
        const match = raw.match(/token=([^&]+)/);
        return match ? match[1] : raw.trim();
    };

    const onClaim = async () => {
        if (!token.trim()) return;
        setError(null);
        try {
            const normalized = normalizeToken(token);
            const res = await claimCertificate(normalized);
            if (res?.certificate?.id) {
                navigate(`/student/certificates/${res.certificate.id}`);
            } else if (res?.certificateId) {
                navigate(`/student/certificates/${res.certificateId}`);
            } else {
                setError("Không tìm thấy chứng chỉ cho token này.");
            }
        } catch (err: any) {
            setError(err.response?.data?.message || err.message || "Claim failed");
        }
    };

    return (
        <AppLayout title="Claim Certificate" user={{ email: "student@certchain.edu", role: "Student" }}>
            <div className="panel stack">
                <div className="section-title">Claim via token</div>
                <p className="muted">Nhập claim token để nhận chứng chỉ vào ví của bạn.</p>
                <input
                    className="input"
                    placeholder="Paste claim token or full link"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                />
                <button className="btn btn-primary" onClick={onClaim} disabled={!token.trim()}>
                    Claim
                </button>
                {error && <div className="callout danger">{error}</div>}
            </div>
        </AppLayout>
    );
}
