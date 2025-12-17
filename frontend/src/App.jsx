import { useEffect, useMemo, useState } from "react";
import {
  NavLink,
  Route,
  Routes,
  useNavigate,
  Navigate,
  useLocation,
} from "react-router-dom";
import LandingPage from "./pages/LandingPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import RoleDashboard from "./pages/RoleDashboard.jsx";
import { VerifyPage } from "./pages/VerifyPage.tsx";
import { VerifyDetailPage } from "./pages/VerifyDetailPage.tsx";
import CertificatesPage from "./pages/issuer/CertificatesPage.tsx";
import NewCertificateWizard from "./pages/issuer/NewCertificateWizard.tsx";
import CertificateDetailPage from "./pages/issuer/CertificateDetailPage.tsx";
import IssuerTemplatesPage from "./pages/issuer/IssuerTemplatesPage.tsx";
import IssuerSettingsPage from "./pages/issuer/IssuerSettingsPage.tsx";
import StudentCertificatesPage from "./pages/student/StudentCertificatesPage.tsx";
import StudentClaimPage from "./pages/student/StudentClaimPage.tsx";
import StudentCertificateDetailPage from "./pages/student/StudentCertificateDetailPage.tsx";
import StudentChangePasswordPage from "./pages/student/StudentChangePasswordPage.tsx";
import { setAuthToken } from "./api/client.js";
import { MetaMaskConnect } from "./components/MetaMaskConnect.tsx";

export default function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [role, setRole] = useState(localStorage.getItem("role"));
  const navigate = useNavigate();
  const location = useLocation();

  const isIssuer = role === "ISSUER_ADMIN" || role === "SYS_ADMIN";
  const isStudent = role === "STUDENT";

  useEffect(() => {
    if (token) {
      localStorage.setItem("token", token);
      setAuthToken(token);
    } else {
      localStorage.removeItem("token");
      setAuthToken(null);
    }
    if (role) {
      localStorage.setItem("role", role);
    }
  }, [token, role]);

  const logout = () => {
    setToken(null);
    setRole(null);
    navigate("/auth/login");
  };

  const handleLogin = (t, r) => {
    setToken(t);
    setRole(r);
    if (r === "ISSUER_ADMIN" || r === "SYS_ADMIN") {
      navigate("/issuer/certificates");
    } else if (r === "STUDENT") {
      navigate("/student/certificates");
    } else {
      navigate("/dashboard");
    }
  };

  const navItems = useMemo(() => {
    if (!token) {
      return [
        { to: "/", label: "Home" },
        { to: "/verify", label: "Verify" },
        { to: "/auth/login", label: "Login" },
      ];
    }
    if (isIssuer) {
      return [
        { to: "/verify", label: "Verify" },
        { to: "/issuer/certificates", label: "Certificates" },
        { to: "/issuer/templates", label: "Templates" },
        { to: "/issuer/settings", label: "Settings" },
      ];
    }
    if (isStudent) {
      return [
        { to: "/verify", label: "Verify" },
        { to: "/student/certificates", label: "My Certificates" },
        { to: "/student/claim", label: "Claim" },
        { to: "/student/change-password", label: "Đổi mật khẩu" },
      ];
    }
    return [{ to: "/verify", label: "Verify" }];
  }, [token, isIssuer, isStudent]);

  const RequireAuth = ({ children, roles }) => {
    if (!token) return <Navigate to="/auth/login" replace />;
    if (roles && !roles.includes(role)) return <Navigate to="/auth/login" replace />;
    return children;
  };

  const WalletBadge = () =>
    isIssuer ? (
      <div className="hidden md:block">
        <MetaMaskConnect />
      </div>
    ) : null;

  return (
    <div>
      <header className="topbar">
        <div className="topbar-inner">
          <NavLink to="/" className="brand" style={{ textDecoration: "none" }}>
            <span className="pill">CertChain</span>
            <span className="muted">E2E chứng chỉ điện tử</span>
          </NavLink>
          <div className="nav">
            {navItems.map((item) => (
              <NavLink key={item.to} to={item.to} className={({ isActive }) => (isActive ? "active" : "")}>
                {item.label}
              </NavLink>
            ))}
            {isIssuer && <WalletBadge />}
            {token && (
              <button onClick={logout} className={location.pathname === "/auth/logout" ? "active" : ""}>
                Logout
              </button>
            )}
          </div>
        </div>
      </header>

      <div className="shell">
        <Routes>
          {/* Public */}
          <Route path="/" element={<LandingPage token={token} role={role} />} />
          <Route path="/verify" element={<VerifyPage />} />
          <Route path="/verify/:certificateId" element={<VerifyDetailPage />} />

          {/* Auth */}
          <Route path="/auth/login" element={<LoginPage onLogin={handleLogin} />} />
          <Route path="/auth/logout" element={<Navigate to="/auth/login" replace />} />

          {/* Issuer Portal */}
          <Route
            path="/issuer"
            element={
              <RequireAuth roles={["ISSUER_ADMIN", "SYS_ADMIN"]}>
                <Navigate to="/issuer/certificates" replace />
              </RequireAuth>
            }
          />
          <Route
            path="/issuer/certificates"
            element={
              <RequireAuth roles={["ISSUER_ADMIN", "SYS_ADMIN"]}>
                <CertificatesPage />
              </RequireAuth>
            }
          />
          <Route
            path="/issuer/certificates/new"
            element={
              <RequireAuth roles={["ISSUER_ADMIN", "SYS_ADMIN"]}>
                <NewCertificateWizard />
              </RequireAuth>
            }
          />
          <Route
            path="/issuer/certificates/:id"
            element={
              <RequireAuth roles={["ISSUER_ADMIN", "SYS_ADMIN"]}>
                <CertificateDetailPage />
              </RequireAuth>
            }
          />
          <Route
            path="/issuer/templates"
            element={
              <RequireAuth roles={["ISSUER_ADMIN", "SYS_ADMIN"]}>
                <IssuerTemplatesPage />
              </RequireAuth>
            }
          />
          <Route
            path="/issuer/settings/*"
            element={
              <RequireAuth roles={["ISSUER_ADMIN", "SYS_ADMIN"]}>
                <IssuerSettingsPage />
              </RequireAuth>
            }
          />

          {/* Student Portal */}
          <Route
            path="/student"
            element={
              <RequireAuth roles={["STUDENT"]}>
                <Navigate to="/student/certificates" replace />
              </RequireAuth>
            }
          />
          <Route
            path="/student/claim"
            element={
              <RequireAuth roles={["STUDENT"]}>
                <StudentClaimPage />
              </RequireAuth>
            }
          />
          <Route
            path="/student/certificates"
            element={
              <RequireAuth roles={["STUDENT"]}>
                <StudentCertificatesPage />
              </RequireAuth>
            }
          />
          <Route
            path="/student/certificates/:id"
            element={
              <RequireAuth roles={["STUDENT"]}>
                <StudentCertificateDetailPage />
              </RequireAuth>
            }
          />
          <Route
            path="/student/change-password"
            element={
              <RequireAuth roles={["STUDENT"]}>
                <StudentChangePasswordPage />
              </RequireAuth>
            }
          />

          {/* Dashboard (optional role switcher) */}
          <Route
            path="/dashboard"
            element={
              <RequireAuth roles={["ISSUER_ADMIN", "SYS_ADMIN", "STUDENT"]}>
                <RoleDashboard token={token} role={role} />
              </RequireAuth>
            }
          />
        </Routes>
      </div>
    </div>
  );
}
