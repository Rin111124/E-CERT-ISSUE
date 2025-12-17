import { useEffect, useState } from "react";
import api, { setAuthToken } from "../api/client.js";
import MetaMaskConnect from "../components/MetaMaskConnect.jsx";

export default function IssuerDashboard({ token, role }) {
  const defaultPayload = {
    certificateId: "CERT-2026-0001",
    fullName: "Nguyen Van A",
    degreeType: "Cu nhan",
    major: "Cong nghe thong tin",
    graduationYear: 2026,
    classification: "Gioi",
    issuer: {
      name: "Truong Dai hoc X",
      ethAddress: "0xISSUER",
    },
    issuedAt: "2026-07-30T00:00:00Z",
    schemaVersion: "1.0",
  };

  const [templates, setTemplates] = useState([]);
  const [certs, setCerts] = useState([]);
  const [templateName, setTemplateName] = useState("Bachelor Template");
  const [templateSchema, setTemplateSchema] = useState(
    JSON.stringify({ degreeType: "Cu nhan", schemaVersion: "1.0" }, null, 2)
  );
  const [payload, setPayload] = useState(defaultPayload);
  const [payloadJson, setPayloadJson] = useState(JSON.stringify(defaultPayload, null, 2));
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [batchJson, setBatchJson] = useState(
    JSON.stringify([defaultPayload, { ...defaultPayload, certificateId: "CERT-2026-0002" }], null, 2)
  );
  const [batchResult, setBatchResult] = useState(null);

  useEffect(() => {
    if (token) {
      setAuthToken(token);
      load();
    }
  }, [token]);

  async function load() {
    try {
      const [tpl, c] = await Promise.all([api.get("/issuer/templates"), api.get("/issuer/certificates")]);
      setTemplates(tpl.data);
      setCerts(c.data);
      if (tpl.data[0]) setSelectedTemplate(tpl.data[0].id);
    } catch (err) {
      console.warn(err);
    }
  }

  if (!token || (role !== "ISSUER_ADMIN" && role !== "SYS_ADMIN")) {
    return <div className="panel">Vui long dang nhap voi vai tro ISSUER_ADMIN.</div>;
  }

  const createTemplate = async () => {
    setError("");
    try {
      const { data } = await api.post("/issuer/templates", {
        name: templateName,
        schema: JSON.parse(templateSchema),
      });
      setTemplates([data, ...templates]);
      setSelectedTemplate(data.id);
      setMessage("Da tao template");
    } catch (e) {
      setError(e.response?.data?.message || "Tao template that bai");
    }
  };

  const createCertificate = async () => {
    try {
      setError("");
      if (!selectedTemplate) {
        setError("Ban can tao/chon template truoc khi tao chung chi");
        return;
      }
      const parsed = JSON.parse(payloadJson);
      const { data } = await api.post("/issuer/certificates", {
        templateId: selectedTemplate,
        payload: parsed,
      });
      setMessage("Da tao draft cho " + data.certificateId);
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Tao chung chi that bai");
    }
  };

  const issue = async (id) => {
    const { data } = await api.post(`/issuer/certificates/${id}/issue`);
    setMessage("Issued tx " + data.txHash);
    load();
  };

  const revoke = async (id) => {
    const { data } = await api.post(`/issuer/certificates/${id}/revoke`);
    setMessage("Revoked tx " + data.txHash);
    load();
  };

  const issueBatch = async () => {
    setError("");
    setBatchResult(null);
    if (!selectedTemplate) {
      setError("Ban can tao/chon template truoc khi batch issue");
      return;
    }
    try {
      const payloads = JSON.parse(batchJson);
      const { data } = await api.post("/issuer/batches", {
        templateId: selectedTemplate,
        payloads,
      });
      setBatchResult(data);
      setMessage("Batch anchored root " + data.merkleRoot);
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Batch issue that bai");
    }
  };

  const updateField = (field, value) => {
    const updated = { ...payload, [field]: value };
    setPayload(updated);
    setPayloadJson(JSON.stringify(updated, null, 2));
  };

  const updateIssuerField = (field, value) => {
    const updated = { ...payload, issuer: { ...payload.issuer, [field]: value } };
    setPayload(updated);
    setPayloadJson(JSON.stringify(updated, null, 2));
  };

  return (
    <div className="grid" style={{ gap: 16 }}>
      <div className="panel">
        <div className="step-row">
          <div className="step">
            <strong>Buoc 1 — Issuance</strong>
            <div className="muted">Canonicalize payload + SHA-256 + issuer ky ECDSA + issue(certificateId, docHash).</div>
          </div>
          <div className="step">
            <strong>Buoc 2 — Storage</strong>
            <div className="muted">Sinh Credential JSON/PDF + QR, gui magic link / claim token.</div>
          </div>
          <div className="step">
            <strong>Buoc 3 — Verification</strong>
            <div className="muted">So khop hash, recover signer, kiem tra revoke.</div>
          </div>
        </div>
      </div>

      <div className="grid two">
        <MetaMaskConnect />
        <div className="panel stack">
          <div className="section-title">Buoc 1 — Dinh nghia template</div>
          <input value={templateName} onChange={(e) => setTemplateName(e.target.value)} placeholder="Ten template" />
          <textarea rows={6} value={templateSchema} onChange={(e) => setTemplateSchema(e.target.value)} />
          <button onClick={createTemplate}>Luu template</button>
        </div>
      </div>

      <div className="grid two">
        <div className="panel stack">
          <div className="section-title">Buoc 1 — Nhap payload (draft)</div>
          <div className="grid two">
            <div className="stack">
              <label>Ma chung chi</label>
              <input value={payload.certificateId} onChange={(e) => updateField("certificateId", e.target.value)} />
              <label>Ho ten</label>
              <input value={payload.fullName} onChange={(e) => updateField("fullName", e.target.value)} />
              <label>Loai bang</label>
              <input value={payload.degreeType} onChange={(e) => updateField("degreeType", e.target.value)} />
              <label>Nganh</label>
              <input value={payload.major} onChange={(e) => updateField("major", e.target.value)} />
            </div>
            <div className="stack">
              <label>Nam tot nghiep</label>
              <input
                type="number"
                value={payload.graduationYear}
                onChange={(e) => updateField("graduationYear", Number(e.target.value))}
              />
              <label>Xep loai</label>
              <input value={payload.classification} onChange={(e) => updateField("classification", e.target.value)} />
              <label>Issuer name</label>
              <input value={payload.issuer.name} onChange={(e) => updateIssuerField("name", e.target.value)} />
              <label>Issuer address</label>
              <input value={payload.issuer.ethAddress} onChange={(e) => updateIssuerField("ethAddress", e.target.value)} />
              <label>IssuedAt (ISO)</label>
              <input value={payload.issuedAt} onChange={(e) => updateField("issuedAt", e.target.value)} />
            </div>
          </div>
          <div className="muted">Form tren se tu chuyen thanh JSON ben duoi.</div>
          <select value={selectedTemplate} onChange={(e) => setSelectedTemplate(e.target.value)}>
            {templates.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
          <textarea rows={12} value={payloadJson} onChange={(e) => setPayloadJson(e.target.value)} />
          <button onClick={createCertificate} disabled={!selectedTemplate}>
            Tao ban nhap (canonicalize & luu)
          </button>
          <div className="muted">Backend: canonicalize + docHash = SHA-256(canonical_payload) + luu status=DRAFT.</div>
        </div>

        <div className="panel stack">
          <div className="section-title">Buoc 2 — Phat hanh on-chain</div>
          <div className="muted">
            Chon chung chi nhap, ky thong diep chuan (certificateId + docHash + chainId + contractAddress) roi goi
            issue().
          </div>
          <div className="list">
            {certs.map((c) => (
              <div key={c.id} className="list-row">
                <div className="stack" style={{ gap: 4 }}>
                  <div className="mono">{c.certificateId}</div>
                  <div className="muted">Hash: {c.docHash?.slice(0, 18)}...</div>
                  <div className="muted">Tx: {c.onChainTx || "Chua issue"}</div>
                  <div className={"status-pill " + (c.revoked ? "danger" : "")}>
                    {c.revoked ? "Revoked" : c.onChainTx ? "Issued" : "Draft"}
                  </div>
                </div>
                <div className="stack" style={{ minWidth: 180 }}>
                  <button onClick={() => issue(c.id)}>Issue on-chain</button>
                  <button onClick={() => revoke(c.id)}>Revoke</button>
                </div>
              </div>
            ))}
          </div>
          <div className="muted">
            Sau khi issue: Backend luu txHash, blockNumber, issuedAt; luu them claim token de student claim.
          </div>
        </div>
      </div>

      <div className="panel stack">
        <div className="section-title">Batch Mode — Merkle (import JSON array)</div>
        <div className="muted">Nhap mang payloads (JSON array) → hash tung chứng chỉ → Merkle root → issueBatch(root).</div>
        <textarea rows={10} value={batchJson} onChange={(e) => setBatchJson(e.target.value)} />
        <button onClick={issueBatch} disabled={!selectedTemplate}>
          Batch issue (Merkle)
        </button>
        {batchResult && (
          <div className="callout">
            <div>Batch ID: {batchResult.batchId}</div>
            <div>Merkle Root: {batchResult.merkleRoot}</div>
            <div>Tx: {batchResult.txHash}</div>
            <div className="muted">Certificates:</div>
            <ul>
              {batchResult.certificates?.map((c) => (
                <li key={c.id}>
                  {c.certificateId} — proof[{c.merkleProof?.length || 0}] nodes
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {message && <div className="callout">{message}</div>}
      {error && <div className="callout danger">{error}</div>}
    </div>
  );
}
