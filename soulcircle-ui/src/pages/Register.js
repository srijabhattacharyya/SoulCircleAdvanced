import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async () => {
    setError("");
    if (!form.name || !form.email || !form.password) { setError("Please fill in all fields."); return; }
    if (form.password.length < 6) { setError("Password must be at least 6 characters."); return; }
    setLoading(true);
    try {
      const res = await fetch("http://127.0.0.1:8000/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.detail || "Registration failed."); return; }
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
        <h2 className="auth-title">Create your account</h2>
        <p className="auth-subtitle">A safe, private space just for you.</p>

        {error && <div className="auth-error">{error}</div>}

        <div className="auth-fields">
          <div className="auth-field">
            <label>Your name</label>
            <input name="name" value={form.name} onChange={handle} placeholder="What should we call you?" />
          </div>
          <div className="auth-field">
            <label>Email address</label>
            <input name="email" type="email" value={form.email} onChange={handle} placeholder="your@email.com" />
          </div>
          <div className="auth-field">
            <label>Password</label>
            <input name="password" type="password" value={form.password} onChange={handle} placeholder="At least 6 characters"
              onKeyDown={(e) => e.key === "Enter" && submit()} />
          </div>
        </div>

        <button className="btn-primary auth-btn" onClick={submit} disabled={loading}>
          {loading ? "Creating account…" : "Create account"}
        </button>

        <p className="auth-switch">Already have an account? <Link to="/login">Sign in</Link></p>
        <p className="auth-note">Your data is private and never shared.</p>
      </div>
    </div>
  );
}

export default Register;