import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async () => {
    setError("");
    if (!form.email || !form.password) { setError("Please fill in all fields."); return; }
    setLoading(true);
    try {
      const res = await fetch("http://127.0.0.1:8000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.detail || "Login failed."); return; }
      login(data.access_token, { name: data.name, email: data.email });
      navigate("/");
    } catch {
      setError("Could not connect to server. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <span className="navbar-logo-dot"></span>
          SoulCircle
        </div>
        <h2 className="auth-title">Welcome back</h2>
        <p className="auth-subtitle">Your space is waiting for you.</p>

        {error && <div className="auth-error">{error}</div>}

        <div className="auth-fields">
          <div className="auth-field">
            <label>Email address</label>
            <input name="email" type="email" value={form.email} onChange={handle} placeholder="your@email.com" />
          </div>
          <div className="auth-field">
            <label>Password</label>
            <input name="password" type="password" value={form.password} onChange={handle} placeholder="Your password"
              onKeyDown={(e) => e.key === "Enter" && submit()} />
          </div>
        </div>

        <button className="btn-primary auth-btn" onClick={submit} disabled={loading}>
          {loading ? "Signing in…" : "Sign in"}
        </button>

        <p className="auth-switch">Don't have an account? <Link to="/register">Create one</Link></p>
        <p className="auth-note">Your data is private and never shared.</p>
      </div>
    </div>
  );
}

export default Login;