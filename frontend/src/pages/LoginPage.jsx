import { useState } from "react";
import api, { setAuthToken } from "../api/client.js";

export default function LoginPage({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post("/auth/login", { email, password });
      setAuthToken(data.token);
      onLogin(data.token, data.role);
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="card">
      <h2>Login</h2>
      <form onSubmit={submit} className="grid">
        <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">Login</button>
        {error && <div style={{ color: "salmon" }}>{error}</div>}
      </form>
    </div>
  );
}
