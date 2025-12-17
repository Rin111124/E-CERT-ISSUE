import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AppLayout } from "../../layouts/AppLayout.tsx";
import { getStudentCredential } from "../../services/api";
import { StatusBadge } from "../../components/StatusBadge";
import { CopyButton } from "../../components/CopyButton.tsx";

export default function StudentCertificateDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!id) return;
        getStudentCredential(id)
            .then(setData)
            .catch((err) => setError(err.response?.data?.message || err.message));
    }, [id]);

    const downloadJson = () => {
        if (!data?.credential) return;
        const blob = new Blob([JSON.stringify(data.credential, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `credential-${id}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const downloadPdf = () => {
        if (!data?.credential) return;
        const certId = data.certificate?.certificateId || id;
        const credentialJson = JSON.stringify(data.credential, null, 2);
        const html = `
<!doctype html>
<html>
<head><meta charset="utf-8"><title>Certificate ${certId}</title></head>
<body>
  <h1>Certificate ${certId}</h1>
  <p>Status: ${data.certificate?.status || "N/A"}${data.certificate?.revoked ? " (Revoked)" : ""}</p>
  <p>Issued at: ${data.certificate?.issuedAt || "N/A"}</p>
  <p>Verify: ${window.location.origin}/verify/${certId}</p>
  ${data.qrDataUrl ? `<img src="${data.qrDataUrl}" alt="QR" width="180" height="180" />` : ""}
  <h3>Credential JSON (embedded for verification)</h3>
  <pre>${credentialJson}</pre>
  <!-- Marker for backend parser -->
  <div style="font-size:0.1px; color:#fff;">
    CREDENTIAL_JSON_START
    ${credentialJson}
    CREDENTIAL_JSON_END
  </div>
</body>
</html>
`;
        const blob = new Blob([html], { type: "text/html" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${certId}.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
    };

    const verify = () => {
        const certId = data?.certificate?.certificateId || data?.credential?.payload?.certificateId || id;
        if (certId) navigate(`/verify/${certId}`);
    };

    const payload = data?.credential?.payload || {};
    const cert = payload.certificate || payload; // backward compat
    const issueDate = cert?.issuedAt || payload.issueDate;
    const expiryDate =
        cert?.expiresAt ??
        (issueDate ? new Date(new Date(issueDate).setFullYear(new Date(issueDate).getFullYear() + 2)).toISOString().split("T")[0] : null);

    return (
        <AppLayout title="Certificate Detail" user={{ email: "student@certchain.edu", role: "Student" }}>
            <div className="panel stack">
                <div className="section-title flex items-center justify-between">
                    <span>Certificate</span>
                    {data?.certificate && <StatusBadge status={data.certificate.status} />}
                </div>
                {error && <div className="callout danger">{error}</div>}
                {!data && !error && <div className="muted">Loading...</div>}

                {data && (
                    <>
                        <div className="grid two">
                            <button className="btn btn-primary" onClick={downloadJson}>
                                Download JSON
                            </button>
                            <button className="btn btn-primary" onClick={downloadPdf}>
                                Tải PDF
                            </button>
                        </div>
                        <div className="grid two">
                            <div className="stack rounded-lg border border-white/10 bg-slate-900 p-3">
                                <div className="text-xs text-slate-400">Certificate ID</div>
                                <div className="font-mono text-sm">{data.certificate?.certificateId || cert?.id || "N/A"}</div>
                            </div>
                            <div className="stack rounded-lg border border-white/10 bg-slate-900 p-3">
                                <div className="text-xs text-slate-400">Trạng thái</div>
                                <div className="flex items-center gap-2">
                                    <StatusBadge status={data.certificate?.status} />
                                    {data.certificate?.revoked && <span className="text-red-400 text-xs">(Revoked)</span>}
                                </div>
                            </div>
                            <div className="stack rounded-lg border border-white/10 bg-slate-900 p-3">
                                <div className="text-xs text-slate-400">Ngày cấp</div>
                                <div className="text-sm">{issueDate || data.certificate?.issuedAt || "N/A"}</div>
                            </div>
                            <div className="stack rounded-lg border border-white/10 bg-slate-900 p-3">
                                <div className="text-xs text-slate-400">Ngày hết hạn</div>
                                <div className="text-sm">{expiryDate || "Mặc định +2 năm"}</div>
                            </div>
                            <div className="stack rounded-lg border border-white/10 bg-slate-900 p-3">
                                <div className="text-xs text-slate-400">Tx hash</div>
                                <div className="text-xs font-mono break-all flex items-center gap-2">
                                    {data.certificate?.onChainTx || "---"}
                                    {data.certificate?.onChainTx && <CopyButton value={data.certificate.onChainTx} />}
                                </div>
                            </div>
                        </div>
                        <div className="grid two items-start">
                            {data.qrDataUrl && (
                                <div className="flex items-center justify-center border border-white/10 rounded-lg p-3 bg-slate-900">
                                    <img src={data.qrDataUrl} alt="QR" className="h-24 w-24" />
                                </div>
                            )}
                            <div className="flex items-center gap-3">
                                <button className="btn btn-ghost" onClick={verify}>
                                    Verify
                                </button>
                                {data.verifyLink && (
                                    <div className="text-xs text-cyan-300 flex items-center gap-2">
                                        <span>Link:</span>
                                        <span className="font-mono break-all">{window.location.origin}{data.verifyLink}</span>
                                        <CopyButton value={`${window.location.origin}${data.verifyLink}`} />
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="panel">
                            <div className="section-title">Advanced</div>
                            <pre className="code-block">{JSON.stringify(data.credential, null, 2)}</pre>
                        </div>
                    </>
                )}
            </div>
        </AppLayout>
    );
}
