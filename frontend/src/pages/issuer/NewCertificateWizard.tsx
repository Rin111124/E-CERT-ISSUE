import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight, Check, Link as LinkIcon, Shield } from "lucide-react";
import { AppLayout } from "../../layouts/AppLayout";
import { useMetaMask } from "../../services/metamask";
import { CopyButton } from "../../components/CopyButton";
import api from "../../api/client";

type StepKey = 0 | 1 | 2 | 3 | 4 | 5;

type TemplateState = {
  id?: string;
  name: string;
  schemaJson: string;
  schema?: any;
};

type PayloadState = {
  schemaVersion: string;
  certificate: {
    id: string;
    title: string;
    type: string;
    level?: string;
    description?: string;
    language?: string;
    issuedAt: string;
    expiresAt?: string | null;
    status?: string;
  };
  recipient: {
    id: string;
    fullName: string;
    dateOfBirth?: string;
    email: string;
    affiliation?: {
      organization?: string;
      department?: string;
      program?: string;
      class?: string;
    };
  };
  issuer: {
    id: string;
    name: string;
    website?: string;
    logoUrl?: string;
    address?: string;
  };
  achievement?: {
    course?: { code?: string; name?: string; hours?: number | string };
    grade?: { score?: number | string; scale?: number | string; classification?: string };
    skills?: string;
  };
  verification?: {
    verificationUrl?: string;
    qrPayload?: string;
    hashAlgorithm?: string;
    documentHash?: string;
  };
};

const twoYearsFromDate = (iso: string) => {
  const d = new Date(iso);
  d.setFullYear(d.getFullYear() + 2);
  return d.toISOString();
};

const generateId = (prefix: string) => {
  const now = new Date();
  const year = now.getFullYear();
  const rand = Math.floor(Math.random() * 100000).toString().padStart(5, "0");
  return `${prefix}-${year}-${rand}`;
};

const todayIso = new Date().toISOString();

export default function NewCertificateWizard() {
  const navigate = useNavigate();
  const { account, isConnected, isSepolia } = useMetaMask();

  const [step, setStep] = useState<StepKey>(0);
  const [draftId, setDraftId] = useState<string | null>(null);
  const [template, setTemplate] = useState<TemplateState>({
    name: "Bachelor Template",
    schemaJson: JSON.stringify({ degreeType: "Bachelor", schemaVersion: "1.0" }, null, 2),
  });
  const [payload, setPayload] = useState<PayloadState>({
    schemaVersion: "1.0",
    certificate: {
      id: "",
      title: "Chứng chỉ khóa học",
      type: "course_completion",
      level: "basic",
      description: "Hoàn thành khóa học với đầy đủ yêu cầu.",
      language: "vi-VN",
      issuedAt: todayIso,
      expiresAt: twoYearsFromDate(todayIso),
      status: "valid",
    },
    recipient: {
      id: "",
      fullName: "",
      email: "",
    },
    issuer: {
      id: "ISSUER-XYZ-UNI",
      name: "Truong Dai hoc XYZ",
    },
    achievement: {
      course: { name: "" },
      skills: "",
    },
    verification: {},
  });
  const [noExpiry, setNoExpiry] = useState(false);
  const [canonical, setCanonical] = useState("");
  const [docHash, setDocHash] = useState("");
  const [signature, setSignature] = useState("");
  const [txHash, setTxHash] = useState("");
  const [claimLink, setClaimLink] = useState("");
  const [hashError, setHashError] = useState<string | null>(null);
  const [issuing, setIssuing] = useState(false);
  const [issueError, setIssueError] = useState<string | null>(null);
  const [assignedEmail, setAssignedEmail] = useState<string | null>(null);
  const [generatedPassword, setGeneratedPassword] = useState<string | null>(null);
  const [templates, setTemplates] = useState<TemplateState[]>([]);
  const [tplError, setTplError] = useState<string | null>(null);

  const steps = useMemo(
    () => [
      { key: 0, label: "Wallet & Network" },
      { key: 1, label: "Template" },
      { key: 2, label: "Payload" },
      { key: 3, label: "Review & Hash" },
      { key: 4, label: "Sign & Issue" },
      { key: 5, label: "Delivery" },
    ],
    []
  );

  const canProceed = (target: StepKey) => {
    switch (target) {
      case 1:
        return isConnected && isSepolia;
      case 2:
        return template.name.trim().length > 0;
      case 3:
        return (
          payload.certificate.id &&
          payload.recipient.email &&
          payload.recipient.fullName &&
          payload.certificate.title
        );
      case 4:
        return canonical && docHash;
      case 5:
        return txHash !== "";
      default:
        return true;
    }
  };

  const goNext = () => {
    const next = (step + 1) as StepKey;
    if (next <= 5 && canProceed(next)) setStep(next);
  };

  const goPrev = () => {
    const prev = (step - 1) as StepKey;
    if (prev >= 0) setStep(prev);
  };

  useEffect(() => {
    api
      .get("/issuer/templates")
      .then((res) => setTemplates(res.data || []))
      .catch((e) => setTplError(e.response?.data?.message || e.message || "Không tải được template"));
  }, []);

  const computeHash = async () => {
    try {
      setHashError(null);
      const expiresAt = noExpiry ? null : payload.certificate.expiresAt;
      const canonicalPayload = JSON.stringify(
        {
          ...payload,
          certificate: {
            ...payload.certificate,
            expiresAt,
          },
        },
        null,
        2
      );
      setCanonical(canonicalPayload);
      const enc = new TextEncoder().encode(canonicalPayload);
      const digest = await crypto.subtle.digest("SHA-256", enc);
      const hashArray = Array.from(new Uint8Array(digest));
      const hex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
      setDocHash("0x" + hex);
    } catch (err: any) {
      setHashError(err.message || "Failed to hash payload (UTF-8 issue?)");
      setDocHash("");
    }
  };

  const ensureDraft = async () => {
    if (draftId) return draftId;
    const body: any = { payload: { ...payload, certificate: { ...payload.certificate, expiresAt: noExpiry ? null : payload.certificate.expiresAt } } };
    if (template.id) body.templateId = template.id;
    const { data } = await api.post("/issuer/certificates", body);
    setDraftId(data.id);
    if (data.docHash) setDocHash(data.docHash.startsWith("0x") ? data.docHash : "0x" + data.docHash);
    return data.id as string;
  };

  const signAndIssue = async () => {
    if (!docHash) {
      setIssueError("Please generate the document hash before issuing.");
      return;
    }
    setIssuing(true);
    setIssueError(null);
    try {
      const id = await ensureDraft();
      const { data } = await api.post(`/issuer/certificates/${id}/issue`, {});
      setSignature(data.signature || "server-signature");
      setTxHash(data.txHash || data.onChainTx || "");
      if (data.claimToken) {
        const link = `${window.location.origin}/student/claim?token=${data.claimToken}`;
        setClaimLink(link);
      }
      if (data.studentEmailAssigned) setAssignedEmail(data.studentEmailAssigned);
      if (data.createdStudentPassword) setGeneratedPassword(data.createdStudentPassword);
      setStep(5);
    } catch (err: any) {
      const apiMsg =
        err.response?.data?.message ||
        err.response?.data?.errors?.map((e: any) => e.msg || e.param).join(", ");
      setIssueError(apiMsg || err.message || "Issue failed");
    } finally {
      setIssuing(false);
    }
  };

  useEffect(() => {
    if (step === 3 && !docHash) {
      computeHash();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  const nextDisabled =
    step === 5 ? false : !canProceed((step + 1) as StepKey) || (step === 3 && (!canonical || !docHash));

  const nextReason =
    step === 3 && (!canonical || !docHash)
      ? "Please click Generate hash before continuing"
      : !canProceed((step + 1) as StepKey)
      ? "Complete the current step before continuing"
      : "";

  const statusPills = [
    { label: "Wallet", ok: isConnected, value: account || "Not connected" },
    { label: "Network", ok: isSepolia, value: isSepolia ? "Sepolia" : "Wrong network" },
    { label: "Draft", ok: !!draftId, value: draftId ? "Saved" : "Not saved" },
    { label: "Hash", ok: !!docHash, value: docHash ? `${docHash.slice(0, 10)}…` : "Not generated" },
    { label: "Tx", ok: !!txHash, value: txHash ? `${txHash.slice(0, 10)}…` : "Pending" },
  ];

  return (
    <AppLayout title="New Certificate" showMetaMask user={{ email: "issuer@certchain.edu", role: "Issuer" }}>
      <div className="max-w-6xl mx-auto grid gap-6 lg:grid-cols-[280px_1fr]">
        <div className="panel">
          <div className="section-title">Steps</div>
          <div className="stack">
            {steps.map((s, i) => {
              const active = step === s.key;
              const done = step > s.key;
              const allowed = canProceed(s.key as StepKey);
              return (
                <button
                  key={s.key}
                  onClick={() => allowed && setStep(s.key as StepKey)}
                  className={`flex w-full items-center justify-between rounded-lg border px-3 py-2 text-left transition ${
                    active ? "border-cyan-400 bg-cyan-500/10 text-white" : "border-white/10 bg-slate-900 text-slate-200"
                  } ${!allowed ? "opacity-60 cursor-not-allowed" : ""}`}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${
                        done ? "bg-emerald-500 text-slate-900" : active ? "bg-cyan-500 text-slate-900" : "bg-slate-800 text-slate-200"
                      }`}
                    >
                      {done ? <Check size={14} /> : i + 1}
                    </div>
                    <span className="text-sm">{s.label}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="stack">
          <div className="flex flex-wrap gap-2">
            {statusPills.map((pill) => (
              <div
                key={pill.label}
                className={`flex items-center gap-2 rounded-full border px-3 py-1 text-xs ${
                  pill.ok ? "border-emerald-400/40 text-emerald-200 bg-emerald-500/10" : "border-amber-400/30 text-amber-200 bg-amber-500/10"
                }`}
              >
                <Shield size={14} />
                <span className="font-semibold">{pill.label}:</span>
                <span className="font-mono">{pill.value}</span>
              </div>
            ))}
          </div>

          {step === 0 && (
            <div className="panel stack">
              <div className="section-title">Step 0 — Wallet & Network</div>
              <p className="muted">Connect MetaMask with the issuer wallet on Sepolia. Actions are disabled until connected.</p>
              <div className="rounded-lg border border-white/10 bg-slate-900 p-4 text-sm">
                <p>Wallet: {account || "Not connected"}</p>
                <p>Network: {isSepolia ? "Sepolia" : "Wrong network"}</p>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="panel stack">
              <div className="section-title">Step 1 — Template</div>
              {tplError && <div className="callout danger text-xs">{tplError}</div>}
              <select
                className="input"
                value={template.id || ""}
                onChange={(e) => {
                  const found = templates.find((t) => t.id === e.target.value);
                  if (found) {
                    setTemplate({ id: found.id, name: found.name, schemaJson: JSON.stringify(found.schema || found.schemaJson || {}, null, 2) });
                  } else {
                    setTemplate({ ...template, id: undefined });
                  }
                }}
              >
                <option value="">Chọn template (tùy chọn)</option>
                {templates.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
              <input
                className="input"
                placeholder="Template name"
                value={template.name}
                onChange={(e) => setTemplate({ ...template, name: e.target.value })}
              />
              <textarea
                className="input font-mono text-xs"
                rows={6}
                value={template.schemaJson}
                onChange={(e) => setTemplate({ ...template, schemaJson: e.target.value })}
              />
              <p className="muted text-xs">Advanced schema JSON (optional).</p>
            </div>
          )}

          {step === 2 && (
            <div className="panel stack">
              <div className="section-title">Step 2 — Payload</div>
              <div className="grid two">
                <input
                  className="input"
                  placeholder="Certificate ID"
                  value={payload.certificate.id}
                  onChange={(e) => setPayload({ ...payload, certificate: { ...payload.certificate, id: e.target.value } })}
                />
                <button
                  className="btn btn-ghost"
                  type="button"
                  onClick={() => {
                    const gen = generateId("CERT");
                    setPayload({ ...payload, certificate: { ...payload.certificate, id: gen } });
                  }}
                >
                  Tạo mã tự động
                </button>
                <input
                  className="input"
                  placeholder="Title"
                  value={payload.certificate.title}
                  onChange={(e) => setPayload({ ...payload, certificate: { ...payload.certificate, title: e.target.value } })}
                />
                <input
                  className="input"
                  placeholder="Type"
                  value={payload.certificate.type}
                  onChange={(e) => setPayload({ ...payload, certificate: { ...payload.certificate, type: e.target.value } })}
                />
                <input
                  className="input"
                  placeholder="Level"
                  value={payload.certificate.level || ""}
                  onChange={(e) => setPayload({ ...payload, certificate: { ...payload.certificate, level: e.target.value } })}
                />
                <input
                  className="input"
                  placeholder="Language"
                  value={payload.certificate.language || ""}
                  onChange={(e) => setPayload({ ...payload, certificate: { ...payload.certificate, language: e.target.value } })}
                />
                <input
                  className="input"
                  type="date"
                  value={payload.certificate.issuedAt.slice(0, 10)}
                  onChange={(e) => {
                    const iso = new Date(e.target.value).toISOString();
                    setPayload({
                      ...payload,
                      certificate: {
                        ...payload.certificate,
                        issuedAt: iso,
                        expiresAt: noExpiry ? null : twoYearsFromDate(iso),
                      },
                    });
                  }}
                />
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={noExpiry}
                    onChange={(e) => setNoExpiry(e.target.checked)}
                  />
                  <span className="text-xs text-slate-300">Không hết hạn</span>
                </div>
                <input
                  className="input"
                  type="date"
                  disabled={noExpiry}
                  value={payload.certificate.expiresAt ? payload.certificate.expiresAt.slice(0, 10) : ""}
                  onChange={(e) =>
                    setPayload({
                      ...payload,
                      certificate: { ...payload.certificate, expiresAt: e.target.value ? new Date(e.target.value).toISOString() : null },
                    })
                  }
                  placeholder="Expiry date (optional)"
                />
              </div>
              <textarea
                className="input"
                rows={3}
                placeholder="Description"
                value={payload.certificate.description || ""}
                onChange={(e) => setPayload({ ...payload, certificate: { ...payload.certificate, description: e.target.value } })}
              />

              <div className="grid two">
                <input
                  className="input"
                  placeholder="Recipient ID"
                  value={payload.recipient.id}
                  onChange={(e) => setPayload({ ...payload, recipient: { ...payload.recipient, id: e.target.value } })}
                />
                <button
                  className="btn btn-ghost"
                  type="button"
                  onClick={() => {
                    const gen = generateId("RECIP");
                    setPayload({ ...payload, recipient: { ...payload.recipient, id: gen } });
                  }}
                >
                  Tạo mã tự động
                </button>
                <input
                  className="input"
                  placeholder="Recipient full name"
                  value={payload.recipient.fullName}
                  onChange={(e) => setPayload({ ...payload, recipient: { ...payload.recipient, fullName: e.target.value } })}
                />
                <input
                  className="input"
                  type="date"
                  placeholder="Date of birth"
                  value={payload.recipient.dateOfBirth || ""}
                  onChange={(e) => setPayload({ ...payload, recipient: { ...payload.recipient, dateOfBirth: e.target.value } })}
                />
                <input
                  className="input"
                  placeholder="Recipient email"
                  value={payload.recipient.email}
                  onChange={(e) => setPayload({ ...payload, recipient: { ...payload.recipient, email: e.target.value } })}
                />
                <input
                  className="input"
                  placeholder="Organization"
                  value={payload.recipient.affiliation?.organization || ""}
                  onChange={(e) =>
                    setPayload({
                      ...payload,
                      recipient: { ...payload.recipient, affiliation: { ...payload.recipient.affiliation, organization: e.target.value } },
                    })
                  }
                />
                <input
                  className="input"
                  placeholder="Department"
                  value={payload.recipient.affiliation?.department || ""}
                  onChange={(e) =>
                    setPayload({
                      ...payload,
                      recipient: { ...payload.recipient, affiliation: { ...payload.recipient.affiliation, department: e.target.value } },
                    })
                  }
                />
                <input
                  className="input"
                  placeholder="Program"
                  value={payload.recipient.affiliation?.program || ""}
                  onChange={(e) =>
                    setPayload({
                      ...payload,
                      recipient: { ...payload.recipient, affiliation: { ...payload.recipient.affiliation, program: e.target.value } },
                    })
                  }
                />
                <input
                  className="input"
                  placeholder="Class"
                  value={payload.recipient.affiliation?.class || ""}
                  onChange={(e) =>
                    setPayload({
                      ...payload,
                      recipient: { ...payload.recipient, affiliation: { ...payload.recipient.affiliation, class: e.target.value } },
                    })
                  }
                />
              </div>

              <div className="grid two">
                <input
                  className="input"
                  placeholder="Issuer ID"
                  value={payload.issuer.id}
                  onChange={(e) => setPayload({ ...payload, issuer: { ...payload.issuer, id: e.target.value } })}
                />
                <button
                  className="btn btn-ghost"
                  type="button"
                  onClick={() => {
                    const gen = generateId("ISSUER");
                    setPayload({ ...payload, issuer: { ...payload.issuer, id: gen } });
                  }}
                >
                  Tạo mã tự động
                </button>
                <input
                  className="input"
                  placeholder="Issuer name"
                  value={payload.issuer.name}
                  onChange={(e) => setPayload({ ...payload, issuer: { ...payload.issuer, name: e.target.value } })}
                />
                <input
                  className="input"
                  placeholder="Issuer website"
                  value={payload.issuer.website || ""}
                  onChange={(e) => setPayload({ ...payload, issuer: { ...payload.issuer, website: e.target.value } })}
                />
                <input
                  className="input"
                  placeholder="Issuer address"
                  value={payload.issuer.address || ""}
                  onChange={(e) => setPayload({ ...payload, issuer: { ...payload.issuer, address: e.target.value } })}
                />
              </div>

              <div className="grid two">
                <input
                  className="input"
                  placeholder="Course code"
                  value={payload.achievement?.course?.code || ""}
                  onChange={(e) =>
                    setPayload({
                      ...payload,
                      achievement: { ...payload.achievement, course: { ...(payload.achievement?.course || {}), code: e.target.value } },
                    })
                  }
                />
                <input
                  className="input"
                  placeholder="Course name"
                  value={payload.achievement?.course?.name || ""}
                  onChange={(e) =>
                    setPayload({
                      ...payload,
                      achievement: { ...payload.achievement, course: { ...(payload.achievement?.course || {}), name: e.target.value } },
                    })
                  }
                />
                <input
                  className="input"
                  placeholder="Hours"
                  value={payload.achievement?.course?.hours || ""}
                  onChange={(e) =>
                    setPayload({
                      ...payload,
                      achievement: { ...payload.achievement, course: { ...(payload.achievement?.course || {}), hours: e.target.value } },
                    })
                  }
                />
                <input
                  className="input"
                  placeholder="Grade score"
                  value={payload.achievement?.grade?.score || ""}
                  onChange={(e) =>
                    setPayload({
                      ...payload,
                      achievement: { ...payload.achievement, grade: { ...(payload.achievement?.grade || {}), score: e.target.value } },
                    })
                  }
                />
                <input
                  className="input"
                  placeholder="Grade scale"
                  value={payload.achievement?.grade?.scale || ""}
                  onChange={(e) =>
                    setPayload({
                      ...payload,
                      achievement: { ...payload.achievement, grade: { ...(payload.achievement?.grade || {}), scale: e.target.value } },
                    })
                  }
                />
                <input
                  className="input"
                  placeholder="Grade classification"
                  value={payload.achievement?.grade?.classification || ""}
                  onChange={(e) =>
                    setPayload({
                      ...payload,
                      achievement: { ...payload.achievement, grade: { ...(payload.achievement?.grade || {}), classification: e.target.value } },
                    })
                  }
                />
                <input
                  className="input"
                  placeholder="Skills (comma separated)"
                  value={payload.achievement?.skills || ""}
                  onChange={(e) =>
                    setPayload({
                      ...payload,
                      achievement: { ...payload.achievement, skills: e.target.value },
                    })
                  }
                />
              </div>

              <div className="grid two">
                <input
                  className="input"
                  placeholder="Verification URL"
                  value={payload.verification?.verificationUrl || ""}
                  onChange={(e) =>
                    setPayload({
                      ...payload,
                      verification: { ...payload.verification, verificationUrl: e.target.value },
                    })
                  }
                />
                <input
                  className="input"
                  placeholder="QR payload"
                  value={payload.verification?.qrPayload || ""}
                  onChange={(e) =>
                    setPayload({
                      ...payload,
                      verification: { ...payload.verification, qrPayload: e.target.value },
                    })
                  }
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="panel stack">
              <div className="section-title">Step 3 — Review & Hash</div>
              <button className="btn btn-primary w-full" onClick={computeHash}>
                Generate canonical + hash
              </button>
              {hashError && <div className="callout danger text-xs">{hashError}</div>}
              {canonical && <div className="code-block">{canonical}</div>}
              {docHash && (
                <div className="flex items-center gap-2 text-xs text-cyan-300">
                  <Shield size={14} />
                  <span className="font-mono break-all">{docHash}</span>
                  <CopyButton value={docHash} />
                </div>
              )}
            </div>
          )}

          {step === 4 && (
            <div className="panel stack">
              <div className="section-title">Step 4 — Sign & Issue</div>
              <button className="btn btn-primary" disabled={issuing || !docHash} onClick={signAndIssue}>
                {issuing ? "Issuing..." : "Sign & issue on-chain"}
              </button>
              <div className="stack text-xs">
                {issueError && <div className="callout danger text-xs">{issueError}</div>}
                <div className="muted">Signature: {signature || "Pending"}</div>
                <div className="muted">Tx hash: {txHash || "Pending"}</div>
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="panel stack">
              <div className="section-title">Step 5 — Delivery</div>
              <button
                className="btn btn-primary"
                disabled={!txHash}
                onClick={() => {
                  if (!claimLink) {
                    setClaimLink(`${window.location.origin}/student/claim`);
                  }
                }}
              >
                Create claim link
              </button>
              {claimLink && (
                <div className="flex items-center gap-2 text-sm text-cyan-300">
                  <LinkIcon size={16} />
                  <span className="truncate">{claimLink}</span>
                  <CopyButton value={claimLink} />
                </div>
              )}
              {assignedEmail && (
                <div className="callout">
                  <div className="text-sm text-white">Certificate delivered to: {assignedEmail}</div>
                  {generatedPassword && (
                    <div className="text-xs text-amber-300">
                      New account created. Temporary password: <span className="font-mono">{generatedPassword}</span>
                    </div>
                  )}
                  {!claimLink && <div className="text-xs text-slate-300">No claim step needed.</div>}
                </div>
              )}
            </div>
          )}

          <div className="flex gap-3">
            <button onClick={goPrev} disabled={step === 0} className="flex-1 btn btn-ghost disabled:opacity-60">
              Back
            </button>
            {step === 5 ? (
              <button onClick={() => navigate("/issuer/certificates")} className="flex-1 btn btn-primary">
                Finish
              </button>
            ) : (
              <button
                onClick={goNext}
                disabled={nextDisabled}
                className="flex-1 btn btn-primary disabled:opacity-60"
                title={nextReason}
              >
                Next <ChevronRight size={16} />
              </button>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
