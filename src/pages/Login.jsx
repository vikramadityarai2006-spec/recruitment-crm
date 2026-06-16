import { useState } from "react";
import { api } from "../api";

export default function Login({ onLogin }) {
  const [email, setEmail] = useState("admin@ampleleap.com");
  const [pass, setPass] = useState("admin123");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const go = async e => {
    e.preventDefault(); setLoading(true); setErr("");
    const r = await api.login(email, pass);
    if (r.token) { localStorage.setItem("crm_token", r.token); onLogin(r.user); }
    else { setErr(r.error || "Invalid credentials"); setLoading(false); }
  };

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg,#0f172a,#1e3a5f,#0f172a)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Inter,system-ui,sans-serif" }}>
      <div style={{ background: "white", borderRadius: 20, padding: "44px 40px", width: 400, boxShadow: "0 25px 60px rgba(0,0,0,.4)" }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ width: 52, height: 52, background: "linear-gradient(135deg,#2563eb,#7c3aed)", borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px", boxShadow: "0 8px 24px #2563eb44" }}>
            <svg width={26} height={26} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /></svg>
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "#0f172a", margin: 0 }}>Ample Leap CRM</h1>
          <p style={{ color: "#64748b", marginTop: 3, fontSize: 13 }}>Recruitment Joining Tracker</p>
        </div>
        {err && <div style={{ background: "#fee2e2", color: "#991b1b", padding: "9px 12px", borderRadius: 8, fontSize: 13, marginBottom: 14 }}>{err}</div>}
        <form onSubmit={go}>
          <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 4 }}>Email</label>
          <input value={email} onChange={e => setEmail(e.target.value)} type="email" required style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1.5px solid #e2e8f0", fontSize: 14, marginBottom: 14, boxSizing: "border-box", outline: "none" }} />
          <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 4 }}>Password</label>
          <input value={pass} onChange={e => setPass(e.target.value)} type="password" required style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1.5px solid #e2e8f0", fontSize: 14, marginBottom: 22, boxSizing: "border-box", outline: "none" }} />
          <button type="submit" disabled={loading} style={{ width: "100%", padding: "12px", background: "linear-gradient(135deg,#2563eb,#7c3aed)", color: "white", border: "none", borderRadius: 10, fontWeight: 700, fontSize: 15, cursor: "pointer", opacity: loading ? .7 : 1 }}>
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>
        <div style={{ marginTop: 18, padding: 12, background: "#f8fafc", borderRadius: 8, fontSize: 11, color: "#64748b", lineHeight: 1.7 }}>
          <strong>Admin:</strong> admin@ampleleap.com / admin123<br />
          <strong>Recruiter:</strong> recruiter@ampleleap.com / rec123<br />
          <strong>Viewer:</strong> viewer@ampleleap.com / view123
        </div>
      </div>
    </div>
  );
}
