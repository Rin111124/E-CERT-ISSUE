import { useState } from "react";
import { AppLayout } from "../../layouts/AppLayout.tsx";
import { changePassword } from "../../services/api";

export default function StudentChangePasswordPage() {
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const onSubmit = async () => {
        if (newPassword !== confirmPassword) {
            setError("Mật khẩu mới không khớp");
            return;
        }
        setLoading(true);
        setError(null);
        setMessage(null);
        try {
            await changePassword(currentPassword, newPassword);
            setMessage("Đổi mật khẩu thành công. Hãy đăng nhập lại.");
        } catch (err: any) {
            setError(err.response?.data?.message || err.message || "Đổi mật khẩu thất bại");
        } finally {
            setLoading(false);
        }
    };

    return (
        <AppLayout title="Đổi mật khẩu" user={{ email: "student@certchain.edu", role: "Student" }}>
            <div className="panel stack max-w-xl">
                <div className="section-title">Đổi mật khẩu</div>
                <input
                    className="input"
                    type="password"
                    placeholder="Mật khẩu hiện tại"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                />
                <input
                    className="input"
                    type="password"
                    placeholder="Mật khẩu mới"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                />
                <input
                    className="input"
                    type="password"
                    placeholder="Nhập lại mật khẩu mới"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <button className="btn btn-primary" onClick={onSubmit} disabled={loading}>
                    {loading ? "Đang đổi..." : "Đổi mật khẩu"}
                </button>
                {message && <div className="callout success">{message}</div>}
                {error && <div className="callout danger">{error}</div>}
            </div>
        </AppLayout>
    );
}
