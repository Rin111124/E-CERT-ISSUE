import { Link } from "react-router-dom";

export default function LandingPage({ token, role }) {
    return (
        <div className="grid" style={{ gap: 18 }}>
            <div className="hero">
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    <h1>Hệ thống cấp chứng chỉ điện tử</h1>
                    <p>
                        Chu trình end-to-end 3 bước: Issuance → Storage → Verification. Chuẩn hóa payload, ký số,
                        ghi on-chain hash và xác thực nhanh bằng JSON/PDF hoặc QR.
                    </p>
                    <div className="step-row" style={{ marginTop: 4 }}>
                        <div className="step">
                            <strong>Trước đăng nhập</strong>
                            <div className="muted">Xem mô tả quy trình, thử verify nhanh qua JSON/PDF.</div>
                        </div>
                        <div className="step">
                            <strong>Sau đăng nhập</strong>
                            <div className="muted">Đi tới dashboard theo vai trò: Issuer, Student, Verifier.</div>
                        </div>
                    </div>
                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 6 }}>
                        <Link className="pill-ghost" to="/verify">Thử verify ngay</Link>
                        <Link className="pill-ghost" to={token ? "/dashboard" : "/login"}>
                            {token ? "Vào dashboard" : "Đăng nhập"}
                        </Link>
                    </div>
                </div>
            </div>

            <div className="grid two role-grid">
                <div className="panel stack">
                    <div className="section-title">Issuer</div>
                    <h3>Quản trị phát hành</h3>
                    <div className="muted">Nhập payload theo template, canonicalize, ký số và issue on-chain.</div>
                    <div className="list" style={{ gap: 8 }}>
                        <div className="list-row">
                            <div className="muted">Tạo template & payload</div>
                            <Link to="/issuer" className="pill-ghost">Vào Issuer</Link>
                        </div>
                        <div className="list-row">
                            <div className="muted">Issue / revoke trên blockchain</div>
                            <Link to="/issuer" className="pill-ghost">Issue nhanh</Link>
                        </div>
                    </div>
                </div>
                <div className="panel stack">
                    <div className="section-title">Student</div>
                    <h3>Nhận và lưu trữ</h3>
                    <div className="muted">Claim bằng magic link/token, tải Credential JSON/PDF, xem QR.</div>
                    <div className="list" style={{ gap: 8 }}>
                        <div className="list-row">
                            <div className="muted">Claim chứng chỉ</div>
                            <Link to="/student" className="pill-ghost">Claim</Link>
                        </div>
                        <div className="list-row">
                            <div className="muted">Tải credential</div>
                            <Link to="/student" className="pill-ghost">Tải JSON/PDF</Link>
                        </div>
                    </div>
                </div>
                <div className="panel stack">
                    <div className="section-title">Verifier</div>
                    <h3>Xác thực</h3>
                    <div className="muted">Tính hash, recover signer, kiểm tra revoke → VALID/REVOKED/TAMPERED.</div>
                    <div className="list" style={{ gap: 8 }}>
                        <div className="list-row">
                            <div className="muted">Upload JSON/PDF</div>
                            <Link to="/verify" className="pill-ghost">Verify file</Link>
                        </div>
                        <div className="list-row">
                            <div className="muted">Tra cứu certificateId</div>
                            <Link to="/verify" className="pill-ghost">Lookup</Link>
                        </div>
                    </div>
                </div>
                <div className="panel stack">
                    <div className="section-title">Tổng quan</div>
                    <h3>Dashboard vai trò</h3>
                    <div className="muted">Xem nhanh lối tắt sau khi đăng nhập.</div>
                    <div className="list" style={{ gap: 8 }}>
                        <div className="list-row">
                            <div className="muted">Issuer dashboard</div>
                            <Link to={token && (role === "ISSUER_ADMIN" || role === "SYS_ADMIN") ? "/issuer" : "/login"} className="pill-ghost">Đi tới Issuer</Link>
                        </div>
                        <div className="list-row">
                            <div className="muted">Student portal</div>
                            <Link to={token && role === "STUDENT" ? "/student" : "/login"} className="pill-ghost">Đi tới Student</Link>
                        </div>
                        <div className="list-row">
                            <div className="muted">Verifier workspace</div>
                            <Link to="/verify" className="pill-ghost">Mở Verifier</Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
