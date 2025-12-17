import { Link } from "react-router-dom";

function roleLabel(role) {
    if (role === "ISSUER_ADMIN" || role === "SYS_ADMIN") return "Issuer Admin";
    if (role === "STUDENT") return "Student";
    return "Khách / Verifier";
}

export default function RoleDashboard({ token, role }) {
    const isIssuer = role === "ISSUER_ADMIN" || role === "SYS_ADMIN";
    const isStudent = role === "STUDENT";

    return (
        <div className="grid" style={{ gap: 16 }}>
            <div className="hero">
                <h1>Dashboard {token ? roleLabel(role) : "khách"}</h1>
                <p>
                    Điều hướng nhanh theo vai trò. Sau đăng nhập, truy cập đúng workspace để thực hiện nghiệp vụ
                    Issuance / Storage / Verification.
                </p>
                {!token && (
                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 8 }}>
                        <Link className="pill-ghost" to="/login">Đăng nhập</Link>
                        <Link className="pill-ghost" to="/verify">Thử verify</Link>
                    </div>
                )}
            </div>

            <div className="grid two" style={{ alignItems: "stretch" }}>
                <div className="panel stack">
                    <div className="section-title">Issuer</div>
                    <div className="muted">Tạo template, canonicalize payload, ký số, issue/revoke.</div>
                    <Link className="pill-ghost" to={isIssuer ? "/issuer" : "/login"}>
                        {isIssuer ? "Vào Issuer" : "Đăng nhập với role Issuer"}
                    </Link>
                    <div className="list" style={{ gap: 8 }}>
                        <div className="list-row">
                            <div className="muted">Tạo template & payload</div>
                            <span className="badge">Bước 1 — Issuance</span>
                        </div>
                        <div className="list-row">
                            <div className="muted">Issue on-chain docHash</div>
                            <span className="badge">Tx</span>
                        </div>
                    </div>
                </div>

                <div className="panel stack">
                    <div className="section-title">Student</div>
                    <div className="muted">Claim bằng token, tải Credential JSON/PDF, xem trạng thái revoke.</div>
                    <Link className="pill-ghost" to={isStudent ? "/student" : "/login"}>
                        {isStudent ? "Vào Student" : "Đăng nhập với role Student"}
                    </Link>
                    <div className="list" style={{ gap: 8 }}>
                        <div className="list-row">
                            <div className="muted">Claim magic link/token</div>
                            <span className="badge">Bước 2 — Storage</span>
                        </div>
                        <div className="list-row">
                            <div className="muted">Tải credential JSON/PDF</div>
                            <span className="badge">Download</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="panel stack">
                <div className="section-title">Verifier</div>
                <div className="muted">Không cần đăng nhập. Dán JSON/PDF hoặc nhập certificateId để kiểm tra.</div>
                <Link className="pill-ghost" to="/verify">Mở Verifier</Link>
                <div className="list" style={{ gap: 8 }}>
                    <div className="list-row">
                        <div className="muted">So sánh computedHash vs onChainHash</div>
                        <span className="badge">Bước 3 — Verification</span>
                    </div>
                    <div className="list-row">
                        <div className="muted">Recover signer, kiểm tra revoke</div>
                        <span className="badge">VALID / REVOKED</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
