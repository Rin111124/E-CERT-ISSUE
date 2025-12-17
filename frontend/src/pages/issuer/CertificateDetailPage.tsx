import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { AppLayout } from "../../layouts/AppLayout";
import { getCertificate } from "../../services/api";
import { StatusBadge } from "../../components/StatusBadge";
import { CodeViewer } from "../../components/CodeViewer";

export default function CertificateDetailPage() {
    const { id } = useParams<{ id: string }>();
    const [tab, setTab] = useState<"overview" | "blockchain" | "credential" | "delivery" | "audit">("overview");
    const [c, setC] = useState<any | null>(null);

    useEffect(() => {
        if (id) getCertificate(id).then(setC);
    }, [id]);

    if (!c) {
        return (
            <AppLayout title="Certificate" user={{ email: "issuer@certchain.edu", role: "Issuer" }}>
                <div className="panel">Loading...</div>
            </AppLayout>
        );
    }

    const tabs: { key: typeof tab; label: string }[] = [
        { key: "overview", label: "Overview" },
        { key: "blockchain", label: "Blockchain" },
        { key: "credential", label: "Credential" },
        { key: "delivery", label: "Delivery" },
        { key: "audit", label: "Audit" },
    ];

    return (
        <AppLayout title="Certificate" showMetaMask user={{ email: "issuer@certchain.edu", role: "Issuer" }}>
            <div className="stack">
                <div className="panel flex items-center gap-3">
                    <div className="flex-1">
                        <p className="text-xs text-slate-400">Certificate ID</p>
                        <h1 className="text-xl font-semibold text-white">{c.certificateId}</h1>
                        <p className="text-xs text-slate-500">{c.program || "—"}</p>
                    </div>
                    <StatusBadge status={c.status} />
                </div>

                <div className="panel flex flex-wrap gap-2 text-sm">
                    {tabs.map((t) => (
                        <button
                            key={t.key}
                            onClick={() => setTab(t.key)}
                            className={`btn-ghost ${tab === t.key ? "border-[hsl(var(--primary))]" : ""}`}
                        >
                            {t.label}
                        </button>
                    ))}
                </div>

                {tab === "overview" && (
                    <div className="panel grid gap-3 md:grid-cols-2">
                        <div className="stack">
                            <div className="section-title">Holder</div>
                            <div className="muted text-sm">{c.holderName || "—"}</div>
                        </div>
                        <div className="stack">
                            <div className="section-title">Issued at</div>
                            <div className="muted text-sm">{c.issuedAt || "—"}</div>
                        </div>
                    </div>
                )}

                {tab === "blockchain" && (
                    <div className="panel grid gap-3 md:grid-cols-2">
                        <div className="stack text-sm">
                            <div className="section-title">Doc Hash</div>
                            <div className="font-mono text-xs text-cyan-300 break-all">{c.docHash || "—"}</div>
                        </div>
                        <div className="stack text-sm">
                            <div className="section-title">Tx Hash</div>
                            <div className="font-mono text-xs text-slate-300 break-all">{c.txHash || "—"}</div>
                        </div>
                    </div>
                )}

                {tab === "credential" && (
                    <div className="panel">
                        <CodeViewer title="Canonical payload" code={JSON.stringify({ certificateId: c.certificateId }, null, 2)} />
                    </div>
                )}

                {tab === "delivery" && (
                    <div className="panel grid gap-3 md:grid-cols-3 text-sm">
                        <div>
                            <div className="section-title">Email</div>
                            <div className="muted">{c.delivery?.email || "—"}</div>
                        </div>
                        <div>
                            <div className="section-title">Sent at</div>
                            <div className="muted">{c.delivery?.sentAt || "—"}</div>
                        </div>
                        <div>
                            <div className="section-title">Opened at</div>
                            <div className="muted">{c.delivery?.openedAt || "—"}</div>
                        </div>
                    </div>
                )}

                {tab === "audit" && (
                    <div className="panel">
                        <div className="muted text-sm">Audit trail coming soon.</div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
