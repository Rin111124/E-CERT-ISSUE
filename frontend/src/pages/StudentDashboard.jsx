import { useEffect, useState } from "react";
import api, { setAuthToken } from "../api/client.js";

export default function StudentDashboard({ token, role }) {
  const [claimToken, setClaimToken] = useState("");
  const [certs, setCerts] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (token) {
      setAuthToken(token);
      load();
    }
  }, [token]);

  if (!token || role !== "STUDENT") {
    return <div className="panel">Đăng nhập với vai trò STUDENT để claim/xem chứng chỉ.</div>;
  }

  async function load() {
    const { data } = await api.get("/students/me/certificates");
    setCerts(data);
  }

  const claim = async () => {
    try {
      const { data } = await api.post("/students/claim", { token: claimToken });
      setMessage("Claimed " + data.certificate.certificateId);
      load();
    } catch (err) {
      setMessage("Claim failed");
    }
  };

  const downloadJson = (cert) => {
    const blob = new Blob(
      [
        JSON.stringify(
          {
            payload: cert.canonicalJson,
            signature: cert.signature,
            txHash: cert.onChainTx,
          },
          null,
          2
        ),
      ],
      { type: "application/json" }
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = cert.certificateId + ".json";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="grid" style={{ gap: 16 }}>
      <div className="panel">
        <div className="section-title">Bước 2 — Nhận và lưu trữ</div>
        <div className="step-row">
          <div className="step">
            <strong>Nhận magic link / claim token</strong>
            <div className="muted">Được gửi qua email sau khi issuer issue on-chain.</div>
          </div>
          <div className="step">
            <strong>Tải Credential JSON/PDF</strong>
            <div className="muted">File chứa canonical payload, chữ ký, tx hash và QR.</div>
          </div>
        </div>
      </div>

      <div className="grid two">
        <div className="panel stack">
          <div className="section-title">Claim chứng chỉ</div>
          <input
            placeholder="Claim token"
            value={claimToken}
            onChange={(e) => setClaimToken(e.target.value)}
          />
          <button onClick={claim}>Claim</button>
          {message && <div className="muted">{message}</div>}
        </div>

        <div className="panel stack">
          <div className="section-title">Tải lại Credential file</div>
          <div className="muted">Chọn chứng chỉ để tải JSON (bao gồm canonical_payload, signature, txHash). PDF/QR có thể được render phía backend.</div>
          <div className="list">
            {certs.map((c) => (
              <div key={c.id} className="list-row">
                <div className="stack" style={{ gap: 4 }}>
                  <div className="mono">{c.certificateId}</div>
                  <div className="muted">Tx: {c.onChainTx || "Pending issue"}</div>
                  <div className={"status-pill " + (c.revoked ? "danger" : "")}>{c.revoked ? "Revoked" : "Active"}</div>
                </div>
                <div className="stack" style={{ minWidth: 140 }}>
                  <button onClick={() => downloadJson(c)}>Download JSON</button>
                  <div className="qr-box">QR/PDF hiển thị (tùy backend)</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
