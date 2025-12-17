import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { AppLayout } from "../../layouts/AppLayout";
import { getCertificate, revokeCertificate } from "../../services/api";
import { StatusBadge } from "../../components/StatusBadge";
import { CodeViewer } from "../../components/CodeViewer";
import { CopyButton } from "../../components/CopyButton";

export default function CertificateDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [tab, setTab] = useState<"overview" | "blockchain" | "credential" | "delivery" | "audit">("overview");
  const [c, setC] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [revoking, setRevoking] = useState(false);

  const load = () => {
    if (!id) return;
    setLoading(true);
    getCertificate(id)
      .then(setC)
      .catch((e) => setError(e.message || "Không tải được chứng chỉ"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const onRevoke = async () => {
    if (!id || !c || c.revoked) return;
    if (!confirm("Bạn có chắc muốn thu hồi chứng chỉ này?")) return;
    setRevoking(true);
    setError(null);
    try {
      const { certificate } = await revokeCertificate(id);
      setC(certificate);
    } catch (e: any) {
      setError(e.response?.data?.message || e.message || "Thu hồi thất bại");
    } finally {
      setRevoking(false);
    }
  };

  if (!c) {
    return (
      <AppLayout title="Certificate" user={{ email: "issuer@certchain.edu", role: "Issuer" }}>
        <div className="panel">{loading ? "Loading..." : "Không tìm thấy chứng chỉ"}</div>
      </AppLayout>
    );
  }

  // Chuẩn hóa dữ liệu từ canonicalJson
  const canon = c.canonicalJson || c.payload || {};
  const cert = canon.certificate || canon;
  const recipient = canon.recipient || {};
  const issuer = canon.issuer || {};
  const achievement = canon.achievement || {};
  const verification = canon.verification || {};
  const issueDate = cert?.issuedAt || canon.issueDate || c.issuedAt;
  const expiry =
    cert?.expiresAt ||
    (issueDate
      ? new Date(new Date(issueDate).setFullYear(new Date(issueDate).getFullYear() + 2)).toISOString().split("T")[0]
      : "Không rõ");

  const tabs: { key: typeof tab; label: string }[] = [
    { key: "overview", label: "Tổng quan" },
    { key: "blockchain", label: "Blockchain" },
    { key: "credential", label: "Credential" },
    { key: "delivery", label: "Giao nhận" },
    { key: "audit", label: "Audit" },
  ];

  return (
    <AppLayout title="Certificate" showMetaMask user={{ email: "issuer@certchain.edu", role: "Issuer" }}>
      <div className="stack">
        {error && <div className="callout danger">{error}</div>}

        <div className="panel flex items-center gap-3">
          <div className="flex-1">
            <p className="text-xs text-slate-400">Certificate ID</p>
            <h1 className="text-xl font-semibold text-white">{c.certificateId}</h1>
            <p className="text-xs text-slate-500">{achievement.course?.name || cert?.title || "—"}</p>
          </div>
          <div className="flex items-center gap-3">
            <StatusBadge status={c.status} />
            {c.revoked ? (
              <span className="text-red-400 text-xs">Đã thu hồi</span>
            ) : (
              <button className="btn btn-primary" onClick={onRevoke} disabled={revoking}>
                {revoking ? "Đang thu hồi..." : "Thu hồi chứng chỉ"}
              </button>
            )}
          </div>
        </div>

        <div className="panel grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-xs text-slate-400">Student</p>
            <p className="text-slate-100">{recipient.fullName || canon.studentName || "—"}</p>
            <p className="text-xs text-slate-400">{recipient.email || canon.studentEmail || "—"}</p>
            <p className="text-xs text-slate-400">{recipient.id || "—"}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Issued at</p>
            <p className="text-slate-100">{issueDate || "N/A"}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Expiry date</p>
            <p className="text-slate-100">{expiry}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Template</p>
            <p className="text-slate-100">{c.templateId || "—"}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Issuer</p>
            <p className="text-slate-100">{issuer.name || "—"}</p>
            <p className="text-xs text-slate-400">{issuer.id || "—"}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Status</p>
            <p className="text-slate-100">{c.status}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Revoked</p>
            <p className="text-slate-100">{c.revoked ? "Có" : "Không"}</p>
          </div>
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
          <div className="panel grid gap-3 md:grid-cols-2 text-sm">
            <div>
              <div className="section-title">Course</div>
              <div className="muted">{achievement.course?.name || cert?.title || "—"}</div>
            </div>
            <div>
              <div className="section-title">Issue date</div>
              <div className="muted">{issueDate || "—"}</div>
            </div>
            <div>
              <div className="section-title">Expiry date</div>
              <div className="muted">{expiry}</div>
            </div>
            <div>
              <div className="section-title">Student email</div>
              <div className="muted">{recipient.email || "—"}</div>
            </div>
            <div>
              <div className="section-title">Grade</div>
              <div className="muted">
                {achievement.grade?.score ? `${achievement.grade.score}/${achievement.grade.scale || ""}` : "—"}{" "}
                {achievement.grade?.classification || ""}
              </div>
            </div>
            <div>
              <div className="section-title">Skills</div>
              <div className="muted">{achievement.skills || "—"}</div>
            </div>
          </div>
        )}

        {tab === "blockchain" && (
          <div className="panel grid gap-3 md:grid-cols-2 text-sm">
            <div className="stack text-sm">
              <div className="section-title">Doc Hash</div>
              <div className="font-mono text-xs text-cyan-300 break-all flex items-center gap-2">
                {c.docHash || "—"}
                {c.docHash && <CopyButton value={c.docHash} />}
              </div>
            </div>
            <div className="stack text-sm">
              <div className="section-title">Tx Hash</div>
              <div className="font-mono text-xs text-slate-300 break-all flex items-center gap-2">
                {c.onChainTx || "—"}
                {c.onChainTx && <CopyButton value={c.onChainTx} />}
              </div>
            </div>
            <div>
              <div className="section-title">Block</div>
              <div className="muted">{c.blockNumber || "—"}</div>
            </div>
            <div>
              <div className="section-title">Verification URL</div>
              <div className="muted">{verification.verificationUrl || "—"}</div>
            </div>
          </div>
        )}

        {tab === "credential" && (
          <div className="panel">
            <CodeViewer title="Canonical payload" code={JSON.stringify(canon, null, 2)} />
          </div>
        )}

        {tab === "delivery" && (
          <div className="panel grid gap-3 md:grid-cols-3 text-sm">
            <div>
              <div className="section-title">Email</div>
              <div className="muted">{recipient.email || "—"}</div>
            </div>
            <div>
              <div className="section-title">Claim status</div>
              <div className="muted">{c.revoked ? "Đã thu hồi" : c.studentId ? "Đã gán cho student" : "Chưa gán"}</div>
            </div>
            <div>
              <div className="section-title">On-chain TX</div>
              <div className="muted">{c.onChainTx || "—"}</div>
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
