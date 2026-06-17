import { useState } from "react";

const BASE_URL = "https://crm-api-pied.vercel.app/api";

export default function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const go = async e => {
    e.preventDefault();
    setLoading(true);
    setErr("");
    try {
      const res = await fetch(`${BASE_URL}/auth`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: pass })
      });
      const data = await res.json();
      if (data.token) {
        localStorage.setItem("crm_token", data.token);
        onLogin(data.user);
      } else {
        setErr(data.error || "Invalid credentials. Please try again.");
      }
    } catch (ex) {
      setErr("Network error. Please check your connection.");
    }
    setLoading(false);
  };

  return (
    <div style={{
      minHeight: "100vh",
      fontFamily: "'Inter',system-ui,sans-serif",
      display: "flex",
      position: "relative",
      overflow: "hidden",
      background: "#0a0f1e",
    }}>

      {/* Animated background blobs */}
      <div style={{ position: "absolute", inset: 0, overflow: "hidden", zIndex: 0 }}>
        {/* Green blob — AMPLE brand color */}
        <div style={{
          position: "absolute", top: "-15%", left: "-10%",
          width: 600, height: 600, borderRadius: "50%",
          background: "radial-gradient(circle,#2d7a3a44,#1a4d2200)",
          animation: "float1 8s ease-in-out infinite",
        }} />
        {/* Blue blob — LEAP brand color */}
        <div style={{
          position: "absolute", bottom: "-20%", right: "-10%",
          width: 700, height: 700, borderRadius: "50%",
          background: "radial-gradient(circle,#1a4fa844,#0d2a5500)",
          animation: "float2 10s ease-in-out infinite",
        }} />
        {/* Center glow */}
        <div style={{
          position: "absolute", top: "40%", left: "30%",
          width: 400, height: 400, borderRadius: "50%",
          background: "radial-gradient(circle,#2563eb11,transparent)",
          animation: "float3 12s ease-in-out infinite",
        }} />
        {/* Grid lines */}
        <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: .04 }}>
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Left Panel — Branding */}
      <div style={{
        flex: 1, display: "flex", flexDirection: "column", justifyContent: "center",
        padding: "60px 64px", position: "relative", zIndex: 1,
        display: "flex",
      }}>
        {/* Logo */}
        <div style={{ marginBottom: 56 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
            <div style={{
              width: 46, height: 46, borderRadius: 12,
              background: "linear-gradient(135deg,#2d7a3a,#1a6b4a)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 0 30px #2d7a3a55",
            }}>
              <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2}>
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <div>
              <div style={{ fontSize: 28, fontWeight: 900, lineHeight: 1, letterSpacing: -0.5 }}>
                <span style={{ color: "#4ade80" }}>AMPLE </span>
                <span style={{ color: "#60a5fa" }}>LEAP</span>
              </div>
              <div style={{ fontSize: 11, color: "#64748b", letterSpacing: 1, textTransform: "uppercase", marginTop: 2 }}>
                The Integrated H.R. Solution
              </div>
            </div>
          </div>
        </div>

        {/* Tagline */}
        <h1 style={{ fontSize: 42, fontWeight: 900, color: "white", margin: "0 0 16px", lineHeight: 1.15, letterSpacing: -1 }}>
          Recruitment<br />
          <span style={{ background: "linear-gradient(90deg,#4ade80,#60a5fa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            Joining Tracker
          </span>
        </h1>
        <p style={{ fontSize: 15, color: "#64748b", lineHeight: 1.7, maxWidth: 380, margin: "0 0 52px" }}>
          Manage your entire recruitment pipeline — from offer to joining — in one unified platform built for Ample Leap's team.
        </p>

        {/* Stats */}
        <div style={{ display: "flex", gap: 36 }}>
          {[
            { val: "70+", label: "Clients Served" },
            { val: "700+", label: "Placements" },
            { val: "22+", label: "Projects" },
          ].map(s => (
            <div key={s.label}>
              <div style={{ fontSize: 26, fontWeight: 900, color: "white", lineHeight: 1 }}>{s.val}</div>
              <div style={{ fontSize: 11, color: "#475569", marginTop: 4, fontWeight: 500 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Services pill tags */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginTop: 32 }}>
          {["Recruitment", "Executive Search", "HR Excellence", "Manpower Outsourcing", "Corporate Training"].map(tag => (
            <span key={tag} style={{
              padding: "4px 12px", borderRadius: 20, fontSize: 11, fontWeight: 600,
              border: "1px solid #1e293b", color: "#475569", background: "#0f172a",
            }}>{tag}</span>
          ))}
        </div>
      </div>

      {/* Right Panel — Login Form */}
      <div style={{
        width: 460, display: "flex", alignItems: "center", justifyContent: "center",
        padding: "40px 48px", position: "relative", zIndex: 1,
        background: "rgba(15,23,42,0.7)",
        backdropFilter: "blur(24px)",
        borderLeft: "1px solid rgba(255,255,255,0.06)",
      }}>
        <div style={{ width: "100%" }}>

          {/* Form header */}
          <div style={{ marginBottom: 32 }}>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 12px",
              background: "rgba(74,222,128,0.1)", border: "1px solid rgba(74,222,128,0.2)",
              borderRadius: 20, marginBottom: 16,
            }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#4ade80", boxShadow: "0 0 8px #4ade80" }} />
              <span style={{ fontSize: 11, color: "#4ade80", fontWeight: 600 }}>Secure Portal</span>
            </div>
            <h2 style={{ fontSize: 26, fontWeight: 800, color: "white", margin: "0 0 6px", letterSpacing: -0.5 }}>Welcome back</h2>
            <p style={{ fontSize: 13, color: "#475569", margin: 0 }}>Sign in to your Ample Leap CRM account</p>
          </div>

          {/* Error */}
          {err && (
            <div style={{
              background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)",
              color: "#fca5a5", padding: "11px 14px", borderRadius: 10, fontSize: 13,
              fontWeight: 500, marginBottom: 20, display: "flex", alignItems: "center", gap: 8,
            }}>
              <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              {err}
            </div>
          )}

          <form onSubmit={go}>
            {/* Email */}
            <div style={{ marginBottom: 18 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#94a3b8", marginBottom: 7, letterSpacing: .3 }}>EMAIL ADDRESS</label>
              <div style={{ position: "relative" }}>
                <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth={2} style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)" }}>
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
                </svg>
                <input
                  value={email} onChange={e => setEmail(e.target.value)}
                  type="email" required placeholder="you@ampleleap.com"
                  style={{
                    width: "100%", padding: "12px 14px 12px 40px",
                    background: "rgba(255,255,255,0.05)", border: "1.5px solid rgba(255,255,255,0.08)",
                    borderRadius: 10, fontSize: 14, color: "white", boxSizing: "border-box", outline: "none",
                    transition: "border-color .2s",
                  }}
                  onFocus={e => e.target.style.borderColor = "#4ade8066"}
                  onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.08)"}
                />
              </div>
            </div>

            {/* Password */}
            <div style={{ marginBottom: 26 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#94a3b8", marginBottom: 7, letterSpacing: .3 }}>PASSWORD</label>
              <div style={{ position: "relative" }}>
                <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth={2} style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)" }}>
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                <input
                  value={pass} onChange={e => setPass(e.target.value)}
                  type={showPass ? "text" : "password"} required placeholder="Enter your password"
                  style={{
                    width: "100%", padding: "12px 40px 12px 40px",
                    background: "rgba(255,255,255,0.05)", border: "1.5px solid rgba(255,255,255,0.08)",
                    borderRadius: 10, fontSize: 14, color: "white", boxSizing: "border-box", outline: "none",
                    transition: "border-color .2s",
                  }}
                  onFocus={e => e.target.style.borderColor = "#60a5fa66"}
                  onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.08)"}
                />
                <button type="button" onClick={() => setShowPass(v => !v)} style={{
                  position: "absolute", right: 13, top: "50%", transform: "translateY(-50%)",
                  background: "none", border: "none", cursor: "pointer", color: "#475569", display: "flex", padding: 0,
                }}>
                  {showPass
                    ? <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    : <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  }
                </button>
              </div>
            </div>

            {/* Submit */}
            <button type="submit" disabled={loading} style={{
              width: "100%", padding: "13px",
              background: loading ? "rgba(74,222,128,0.3)" : "linear-gradient(135deg,#2d7a3a,#1a6b4a,#1a4fa8)",
              color: "white", border: "none", borderRadius: 10,
              fontWeight: 700, fontSize: 15, cursor: loading ? "not-allowed" : "pointer",
              transition: "all .2s", letterSpacing: .2,
              boxShadow: loading ? "none" : "0 4px 20px rgba(45,122,58,0.4)",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            }}
              onMouseEnter={e => { if (!loading) e.target.style.boxShadow = "0 6px 28px rgba(45,122,58,0.6)"; }}
              onMouseLeave={e => { e.target.style.boxShadow = loading ? "none" : "0 4px 20px rgba(45,122,58,0.4)"; }}
            >
              {loading ? (
                <>
                  <div style={{ width: 16, height: 16, border: "2px solid rgba(255,255,255,0.3)", borderTop: "2px solid white", borderRadius: "50%", animation: "spin .7s linear infinite" }} />
                  Signing in…
                </>
              ) : (
                <>
                  Sign In to CRM
                  <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "24px 0" }}>
            <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.06)" }} />
            <span style={{ fontSize: 11, color: "#334155" }}>DEMO CREDENTIALS</span>
            <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.06)" }} />
          </div>

          {/* Demo credentials */}
          <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
            {[
              { role: "Admin", email: "admin@ampleleap.com", pass: "admin123", color: "#7c3aed", bg: "rgba(124,58,237,0.08)", border: "rgba(124,58,237,0.2)" },
              { role: "Recruiter", email: "recruiter@ampleleap.com", pass: "rec123", color: "#0891b2", bg: "rgba(8,145,178,0.08)", border: "rgba(8,145,178,0.2)" },
            ].map(d => (
              <button key={d.role} type="button"
                onClick={() => { setEmail(d.email); setPass(d.pass); }}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "9px 13px", background: d.bg,
                  border: `1px solid ${d.border}`, borderRadius: 8, cursor: "pointer",
                  transition: "all .15s",
                }}
                onMouseEnter={e => e.currentTarget.style.background = d.bg.replace("0.08", "0.15")}
                onMouseLeave={e => e.currentTarget.style.background = d.bg}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: d.color, background: `${d.color}22`, padding: "2px 7px", borderRadius: 10 }}>{d.role}</span>
                  <span style={{ fontSize: 11, color: "#475569", fontFamily: "monospace" }}>{d.email}</span>
                </div>
                <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="#334155" strokeWidth={2}><path d="M9 18l6-6-6-6"/></svg>
              </button>
            ))}
          </div>

          {/* Footer */}
          <div style={{ marginTop: 28, textAlign: "center" }}>
            <p style={{ fontSize: 11, color: "#1e293b", margin: 0 }}>
              © {new Date().getFullYear()} Ample Leap · The Integrated H.R. Solution
            </p>
            <a href="https://ampleleap.com" target="_blank" rel="noreferrer"
              style={{ fontSize: 11, color: "#334155", textDecoration: "none", marginTop: 4, display: "inline-block" }}>
              ampleleap.com ↗
            </a>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes float1 { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(30px,40px) scale(1.05); } }
        @keyframes float2 { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(-40px,-30px) scale(1.08); } }
        @keyframes float3 { 0%,100% { transform: translate(0,0); } 50% { transform: translate(20px,-20px); } }
        input::placeholder { color: #334155; }
        input:-webkit-autofill { -webkit-box-shadow: 0 0 0 100px #0f172a inset !important; -webkit-text-fill-color: white !important; }
      `}</style>
    </div>
  );
}
