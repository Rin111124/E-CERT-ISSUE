import { useState } from "react";
import api from "../api/client.js";

export default function VerifierPage() {
  const [credentialJson, setCredentialJson] = useState("");
  const [certificateId, setCertificateId] = useState("");
  const [result, setResult] = useState(null);
  const [onChain, setOnChain] = useState(null);
  const [score, setScore] = useState([]);
  const [timeline, setTimeline] = useState([]);

  const verifyJson = async () => {
    try {
      const parsed = JSON.parse(credentialJson);
      const { data } = await api.post("/verify", parsed);
      setResult(data.status);
      setOnChain(data.onChain);
      buildScorecard(data.status, data.onChain);
    } catch (err) {
      setOnChain(null);
      setResult(err.response?.data?.status || "Invalid JSON");
      buildScorecard("ERROR");
    }
  };

  const lookup = async () => {
    if (!certificateId) {
      setResult("Missing certificateId");
      setOnChain(null);
      setScore([]);
      setTimeline([]);
      return;
    }
    try {
      const { data } = await api.get(`/verify/${certificateId}`);
      setResult(data.status);
      setOnChain(data.onChain);
      buildScorecard(data.status, data.onChain);
    } catch (err) {
      setResult(err.response?.data?.status || "NOT_FOUND");
      setOnChain(null);
      setScore([]);
      setTimeline([]);
    }
  };

  const buildScorecard = (status, onChainData) => {
    const pass = (cond) => cond ? "PASS" : "FAIL";
    const rows = [];
    rows.push({ label: "Integrity (hash)", status: pass(status === "VALID" || status === "REVOKED" || status === "ON_CHAIN") });
    rows.push({ label: "On-chain match", status: pass(status === "VALID" || status === "REVOKED" || status === "ON_CHAIN") });
    rows.push({ label: "Issuer signature", status: pass(status === "VALID" || status === "REVOKED" || status === "ON_CHAIN") });
    rows.push({ label: "Revocation", status: pass(status !== "REVOKED") });
    rows.push({ label: "Proof (Merkle/direct)", status: pass(status !== "INVALID_PROOF" && status !== "TAMPERED") });
    setScore(rows);

    const tl = [
      { label: "Created", pass: true },
      { label: "Hashed", pass: true },
      { label: "Signed by issuer", pass: status !== "INVALID_SIGNER" },
      { label: "Anchored on-chain", pass: !!onChainData },
      { label: "Delivered to student", pass: true },
      { label: "Verified", pass: status === "VALID" },
    ];
    if (status === "REVOKED") tl.push({ label: "Revoked", pass: false });
    setTimeline(tl);
  };

  return (
    <div className="grid" style={{ gap: 16 }}>
      <div className="panel">
        <div className="section-title">Bước 3 — Xác thực</div>
        <div className="step-row">
          <div className="step">
            <strong>So sánh hash</strong>
            <div className="muted">computedHash = SHA-256(canonical_payload_from_file) vs onChainHash.</div>
          </div>
          <div className="step">
            <strong>Kiểm tra người ký</strong>
            <div className="muted">recover signer từ chữ ký trong file → đối chiếu issuerAddress.</div>
          </div>
          <div className="step">
            <strong>Kiểm tra revoke</strong>
            <div className="muted">Nếu revoked → REVOKED; nếu mismatch → TAMPERED/INVALID SIGNER.</div>
          </div>
        </div>
      </div>

      <div className="grid two">
        <div className="panel stack">
          <div className="section-title">Xác thực qua file JSON/PDF</div>
          <div className="upload">Drop JSON/PDF hoặc dán nội dung JSON bên dưới.</div>
          <textarea
            rows={12}
            placeholder="Credential JSON"
            value={credentialJson}
            onChange={(e) => setCredentialJson(e.target.value)}
          />
          <button onClick={verifyJson}>Verify JSON</button>
          <div className="muted">Kết quả trả về: VALID / REVOKED / TAMPERED / INVALID SIGNER / NOT FOUND.</div>
        </div>

        <div className="panel stack">
          <div className="section-title">Tra cứu on-chain bằng certificateId</div>
          <input
            placeholder="CERT-2026-0001"
            value={certificateId}
            onChange={(e) => setCertificateId(e.target.value)}
          />
          <button onClick={lookup}>Lookup</button>
          <div className="muted">Trả về onChainHash, issuer, trạng thái revoke.</div>
        </div>
      </div>

      {result && (
        <div className="panel stack">
          <div className="section-title">Kết quả</div>
          <div className={"status-pill " + (result === "VALID" ? "" : "danger")}>{result}</div>
          {onChain && (
            <div className="table-grid">
              <div className="label">Issuer</div>
              <div className="value mono" style={{ gridColumn: "span 2" }}>{onChain.issuer}</div>
              <div className="label">On-chain hash</div>
              <div className="value mono" style={{ gridColumn: "span 2" }}>{onChain.docHash}</div>
              <div className="label">Revoked</div>
              <div className="value">{onChain.revoked ? "Yes" : "No"}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
