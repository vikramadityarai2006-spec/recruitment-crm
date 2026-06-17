import { useState } from "react";

const BASE_URL = "https://crm-api-iota-two.vercel.app/api";

export default function Login({ onLogin }) {
  const [email, setEmail] = useState("admin@ampleleap.com");
  const [pass, setPass] = useState("admin123");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [debug, setDebug] = useState("");

  const go = async e => {
    e.preventDefault();
    setLoading(true);
    setErr("");
    setDebug("");
    try {
      const res = await fetch(`${BASE_URL}/auth`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: pass })
      });
      const data = await res.json();
      setDebug(`Status: ${res.status} | Response: ${JSON.stringify(data)}`);
      if (data.token) {
        localStorage.setItem("crm_token", data.token);
        onLogin(data.user);
      } else {
        setErr(data.error || "Login failed");
      }
    } catch (ex) {
      setErr("Network error: " + ex.message);
      setDebug("Exception: " + ex.message);
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg,#0f172a,#1e3a5f,#0f172a)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Inter,system-ui,sans-serif" }}>
      <div style={{ background: "white", borderRadius: 20, padding: "44px 40px", width: 440, boxShadow: "0 25px 60px rgba(0,0,0,.4)" }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ width: 52, height: 52, background: "linear-gradient(135deg,#2563eb,#7c3aed)", borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
            <svg width={26} height={26} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /></svg>
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "#0f172a", margin: 0 }}>Ample Leap CRM</h1>
          <p style={{ color: "#64748b", marginTop: 3, fontSize: 13 }}>Recruitment Joining Tracker</p>
        </div>

        {err && <div style={{ background: "#fee2e2", color: "#991b1b", padding: "10px 12px", borderRadius: 8, fontSize: 13, marginBottom: 12, fontWeight: 600 }}>❌ {err}</div>}

        <form onSubmit={go}>
          <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 4 }}>Email</label>
          <input value={email} onChange={e => setEmail(e.target.value)} type="email" required
            style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1.5px solid #e2e8f0", fontSize: 14, marginBottom: 14, boxSizing: "border-box", outline: "none" }} />

          <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 4 }}>Password</label>
          <input value={pass} onChange={e => setPass(e.target.value)} type="password" required
            style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1.5px solid #e2e8f0", fontSize: 14, marginBottom: 20, boxSizing: "border-box", outline: "none" }} />

          <button type="submit" disabled={loading}
            style={{ width: "100%", padding: "12px", background: "linear-gradient(135deg,#2563eb,#7c3aed)", color: "white", border: "none", borderRadius: 10, fontWeight: 700, fontSize: 15, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? .7 : 1 }}>
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>

        {debug && (
          <div style={{ marginTop: 12, padding: 10, background: "#f8fafc", borderRadius: 7, fontSize: 10, color: "#64748b", wordBreak: "break-all", fontFamily: "monospace" }}>
            {debug}
          </div>
        )}

        <div style={{ marginTop: 16, padding: 12, background: "#f8fafc", borderRadius: 8, fontSize: 11, color: "#64748b", lineHeight: 1.7 }}>
          <strong>Admin:</strong> admin@ampleleap.com / admin123<br />
          <strong>Recruiter:</strong> recruiter@ampleleap.com / rec123
        </div>
      </div>
    </div>
  );
}
