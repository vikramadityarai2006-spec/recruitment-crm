import { useState } from "react";
import { api } from "../api";

export default function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const go = async e => {
    e.preventDefault();
    if (!email.trim()) { setErr("Please enter your email address"); return; }
    if (!pass) { setErr("Please enter your password"); return; }
    setLoading(true);
    setErr("");
    try {
      const r = await api.login(email.trim(), pass);
      if (r.token) {
        // Store token and session expiry time
        sessionStorage.setItem("crm_token", r.token);
        const expiresAt = Date.now() + (r.expiresIn || 28800) * 1000;
        sessionStorage.setItem("crm_session_expires", expiresAt.toString());
        onLogin(r.user);
      } else {
        setErr(r.error || "Invalid email or password. Please try again.");
        setLoading(false);
      }
    } catch {
      setErr("Unable to connect. Please check your internet connection.");
      setLoading(false);
    }
  };

  const fillDemo = (em, pw) => { setEmail(em); setPass(pw); setErr(""); };

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(160deg, #0f172a 0%, #1e3a5f 50%, #0f172a 100%)",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "'Inter', system-ui, sans-serif", padding: 16,
    }}>
      {/* Background decoration */}
      <div style={{ position: "fixed", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
        <div style={{ position: "absolute", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(37,99,235,.15), transparent)", top: -100, left: -100 }} />
        <div style={{ position: "absolute", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(124,58,237,.1), transparent)", bottom: -100, right: -100 }} />
      </div>

      <div style={{ width: "100%", maxWidth: 440, position: "relative" }}>
        {/* Main card */}
        <div style={{
          background: "white", borderRadius: 20, overflow: "hidden",
          boxShadow: "0 25px 60px rgba(0,0,0,.4), 0 0 0 1px rgba(255,255,255,.05)",
        }}>
          {/* Top gradient bar */}
          <div style={{ height: 4, background: "linear-gradient(to right, #2563eb, #7c3aed, #06b6d4)" }} />

          <div style={{ padding: "36px 36px 32px" }}>
            {/* Logo */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 32 }}>
              <div style={{
                width: 48, height: 48, borderRadius: 14,
                background: "linear-gradient(135deg, #2563eb, #7c3aed)",
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "0 8px 20px rgba(37,99,235,.35)", flexShrink: 0,
              }}>
                <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2}>
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
              </div>
              <div>
                <div style={{ fontSize: 20, fontWeight: 800, color: "#0f172a", lineHeight: 1.1 }}>Ample Leap CRM</div>
                <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>Recruitment Joining Tracker</div>
              </div>
            </div>

            <h1 style={{ fontSize: 24, fontWeight: 700, color: "#0f172a", margin: "0 0 4px" }}>Welcome back</h1>
            <p style={{ fontSize: 13, color: "#64748b", margin: "0 0 28px" }}>Sign in to your account to continue</p>

            {/* Error */}
            {err && (
              <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 10, padding: "11px 14px", marginBottom: 20, display: "flex", alignItems: "flex-start", gap: 9 }}>
                <span style={{ fontSize: 15, flexShrink: 0, marginTop: 1 }}>⚠️</span>
                <span style={{ fontSize: 13, color: "#991b1b", fontWeight: 500 }}>{err}</span>
              </div>
            )}

            <form onSubmit={go}>
              {/* Email */}
              <div style={{ marginBottom: 18 }}>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Email address</label>
                <input
                  type="email" value={email} onChange={e => { setEmail(e.target.value); setErr(""); }}
                  placeholder="you@ampleleap.com" autoComplete="email" required
                  style={{ width: "100%", padding: "11px 14px", borderRadius: 10, border: `1.5px solid ${err && !email ? "#ef4444" : "#e2e8f0"}`, fontSize: 14, boxSizing: "border-box", outline: "none", background: "#fafafa", transition: "all .2s" }}
                  onFocus={e => { e.target.style.borderColor = "#2563eb"; e.target.style.boxShadow = "0 0 0 3px rgba(37,99,235,.1)"; e.target.style.background = "white"; }}
                  onBlur={e => { e.target.style.borderColor = "#e2e8f0"; e.target.style.boxShadow = "none"; e.target.style.background = "#fafafa"; }}
                />
              </div>

              {/* Password with show/hide */}
              <div style={{ marginBottom: 24 }}>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Password</label>
                <div style={{ position: "relative" }}>
                  <input
                    type={showPass ? "text" : "password"} value={pass} onChange={e => { setPass(e.target.value); setErr(""); }}
                    placeholder="Enter your password" autoComplete="current-password" required
                    style={{ width: "100%", padding: "11px 44px 11px 14px", borderRadius: 10, border: `1.5px solid ${err && !pass ? "#ef4444" : "#e2e8f0"}`, fontSize: 14, boxSizing: "border-box", outline: "none", background: "#fafafa", transition: "all .2s" }}
                    onFocus={e => { e.target.style.borderColor = "#2563eb"; e.target.style.boxShadow = "0 0 0 3px rgba(37,99,235,.1)"; e.target.style.background = "white"; }}
                    onBlur={e => { e.target.style.borderColor = "#e2e8f0"; e.target.style.boxShadow = "none"; e.target.style.background = "#fafafa"; }}
                  />
                  <button type="button" onClick={() => setShowPass(v => !v)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#94a3b8", fontSize: 16, padding: 2 }}>
                    {showPass ? "🙈" : "👁"}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button type="submit" disabled={loading} style={{
                width: "100%", padding: "13px", borderRadius: 11,
                background: loading ? "#94a3b8" : "linear-gradient(135deg, #2563eb, #7c3aed)",
                color: "white", border: "none", fontWeight: 700, fontSize: 15,
                cursor: loading ? "not-allowed" : "pointer",
                boxShadow: loading ? "none" : "0 4px 14px rgba(37,99,235,.35)",
                transition: "all .2s", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              }}>
                {loading ? (
                  <>
                    <span style={{ width: 16, height: 16, border: "2px solid rgba(255,255,255,.4)", borderTop: "2px solid white", borderRadius: "50%", animation: "spin .8s linear infinite", display: "inline-block", flexShrink: 0 }} />
                    Signing in…
                  </>
                ) : "Sign In →"}
              </button>
            </form>

            {/* Session notice */}
            <div style={{ marginTop: 16, display: "flex", alignItems: "center", gap: 6, justifyContent: "center" }}>
              <span style={{ fontSize: 11, color: "#94a3b8" }}>🔒 Session lasts 8 hours · auto-logout after inactivity</span>
            </div>
          </div>

          {/* Demo credentials */}
          <div style={{ background: "#f8fafc", borderTop: "1px solid #f1f5f9", padding: "18px 36px" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: .8, marginBottom: 10 }}>Demo accounts</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
              {[
                { role: "Admin", icon: "🔑", email: "admin@ampleleap.com", pass: "admin123", color: "#d97706", bg: "#fef3c7" },
                { role: "Recruiter", icon: "✏️", email: "recruiter@ampleleap.com", pass: "rec123", color: "#2563eb", bg: "#eff6ff" },
                { role: "Viewer", icon: "👁️", email: "viewer@ampleleap.com", pass: "view123", color: "#16a34a", bg: "#f0fdf4" },
              ].map(d => (
                <button key={d.role} type="button" onClick={() => fillDemo(d.email, d.pass)}
                  style={{ padding: "9px 10px", background: d.bg, border: `1px solid ${d.color}33`, borderRadius: 9, cursor: "pointer", textAlign: "center", transition: "all .15s" }}
                  onMouseEnter={e => e.currentTarget.style.transform = "translateY(-1px)"}
                  onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}>
                  <div style={{ fontSize: 16, marginBottom: 3 }}>{d.icon}</div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: d.color }}>{d.role}</div>
                  <div style={{ fontSize: 9, color: "#94a3b8", marginTop: 1 }}>Click to fill</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ textAlign: "center", marginTop: 20, fontSize: 11, color: "rgba(255,255,255,.25)" }}>
          Ample Leap Recruitment · Secure CRM Platform
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
