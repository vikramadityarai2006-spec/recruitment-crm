import { useState } from "react";
import { api } from "../api";

export default function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [pass, setPass]   = useState("");
  const [err, setErr]     = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [focused, setFocused]   = useState("");

  const NAVY        = "#0B1F3A";
  const ORANGE      = "#F4621F";
  const ORANGE_DARK = "#D4521A";
  const CREAM       = "#FDF8F4";

  const go = async e => {
    e.preventDefault();
    if (!email.trim()) { setErr("Enter your email address"); return; }
    if (!pass)         { setErr("Enter your password"); return; }
    setLoading(true); setErr("");
    try {
      const r = await api.login(email.trim(), pass);
      if (r.token) {
        sessionStorage.setItem("crm_token", r.token);
        const expiresAt = Date.now() + (r.expiresIn || 28800) * 1000;
        sessionStorage.setItem("crm_session_expires", expiresAt.toString());
        onLogin(r.user);
      } else {
        setErr(r.error || "Incorrect email or password.");
        setLoading(false);
      }
    } catch {
      setErr("Connection failed. Check your internet and try again.");
      setLoading(false);
    }
  };

  const fill = (em, pw) => { setEmail(em); setPass(pw); setErr(""); };

  return (
    <div style={{ minHeight:"100vh", display:"flex", fontFamily:"'Inter',system-ui,sans-serif", background:CREAM }}>

      {/* ── LEFT BRAND PANEL ── */}
      <div style={{ width:420, minHeight:"100vh", background:NAVY, display:"flex", flexDirection:"column", padding:"48px 52px", position:"relative", overflow:"hidden", flexShrink:0 }}>

        {/* Giant ghost monogram */}
        <div style={{ position:"absolute", right:-50, bottom:-30, fontSize:320, fontWeight:900, color:"rgba(244,98,31,.07)", lineHeight:1, userSelect:"none", pointerEvents:"none", fontFamily:"Georgia,serif" }}>A</div>

        {/* Dot grid decoration */}
        <div style={{ position:"absolute", top:28, right:28, display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:7, opacity:.1 }}>
          {Array.from({length:25}).map((_,i)=>(
            <div key={i} style={{ width:3, height:3, borderRadius:"50%", background:"white" }}/>
          ))}
        </div>

        {/* Orange top accent line */}
        <div style={{ position:"absolute", top:0, left:0, right:0, height:4, background:`linear-gradient(90deg,${ORANGE},#FF8C42)` }}/>

        {/* Logo */}
        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:72, position:"relative" }}>
          <div style={{ width:44, height:44, borderRadius:12, background:ORANGE, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, boxShadow:"0 8px 24px rgba(244,98,31,.4)" }}>
            <span style={{ color:"white", fontSize:22, fontWeight:900, fontFamily:"Georgia,serif" }}>A</span>
          </div>
          <div>
            <div style={{ color:"white", fontSize:17, fontWeight:700, letterSpacing:-.3 }}>Ample Leap</div>
            <div style={{ color:"rgba(255,255,255,.4)", fontSize:10, letterSpacing:1.8, textTransform:"uppercase", marginTop:1 }}>HR Excellence</div>
          </div>
        </div>

        {/* Hero copy */}
        <div style={{ flex:1, position:"relative" }}>
          <div style={{ color:"rgba(255,255,255,.45)", fontSize:11, fontWeight:600, letterSpacing:2.5, textTransform:"uppercase", marginBottom:14 }}>Recruitment CRM</div>
          <h1 style={{ color:"white", fontSize:40, fontWeight:800, lineHeight:1.15, margin:"0 0 22px", letterSpacing:-.8 }}>
            Grow and<br/>
            <span style={{ color:ORANGE }}>Smile.</span>
          </h1>
          <p style={{ color:"rgba(255,255,255,.5)", fontSize:14, lineHeight:1.75, margin:0, maxWidth:290 }}>
            One platform to manage candidates, client agreements, recruiter performance, and joining analytics — end to end.
          </p>

          {/* Divider */}
          <div style={{ width:40, height:3, background:ORANGE, borderRadius:2, margin:"32px 0" }}/>

          {/* Values */}
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {["Ethics","Excellence","Happiness","Commitment"].map(v=>(
              <div key={v} style={{ display:"flex", alignItems:"center", gap:10 }}>
                <div style={{ width:5, height:5, borderRadius:"50%", background:ORANGE, flexShrink:0 }}/>
                <span style={{ color:"rgba(255,255,255,.45)", fontSize:12, fontWeight:500 }}>{v}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div style={{ borderTop:"1px solid rgba(255,255,255,.08)", paddingTop:28 }}>
          <div style={{ display:"flex", gap:32 }}>
            {[["70+","Clients"],["700+","Placements"],["22","Projects"]].map(([n,l])=>(
              <div key={l}>
                <div style={{ color:ORANGE, fontSize:20, fontWeight:800 }}>{n}</div>
                <div style={{ color:"rgba(255,255,255,.4)", fontSize:10, marginTop:2, fontWeight:500, textTransform:"uppercase", letterSpacing:.8 }}>{l}</div>
              </div>
            ))}
          </div>
          <div style={{ marginTop:20, display:"flex", alignItems:"center", gap:6 }}>
            <div style={{ width:6, height:6, borderRadius:"50%", background:"#22c55e", boxShadow:"0 0 6px #22c55e88" }}/>
            <span style={{ color:"rgba(255,255,255,.3)", fontSize:10 }}>ampleleap.com · The Integrated HR Solution</span>
          </div>
        </div>
      </div>

      {/* ── RIGHT FORM PANEL ── */}
      <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", padding:"48px 40px" }}>
        <div style={{ width:"100%", maxWidth:400 }}>

          {/* Header */}
          <div style={{ marginBottom:36 }}>
            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:10 }}>
              <div style={{ width:3, height:24, background:ORANGE, borderRadius:2 }}/>
              <span style={{ fontSize:11, fontWeight:700, color:ORANGE, letterSpacing:2, textTransform:"uppercase" }}>Secure Login</span>
            </div>
            <h2 style={{ fontSize:30, fontWeight:800, color:NAVY, margin:"0 0 6px", letterSpacing:-.6 }}>Welcome back</h2>
            <p style={{ color:"#6B7280", fontSize:14, margin:0 }}>Sign in to your CRM dashboard</p>
          </div>

          {/* Error banner */}
          {err && (
            <div style={{ background:"#FEF2F2", border:"1px solid #FECACA", borderLeft:`3px solid #EF4444`, borderRadius:"0 10px 10px 0", padding:"11px 14px", marginBottom:20, display:"flex", gap:9, alignItems:"flex-start" }}>
              <span style={{ fontSize:13, flexShrink:0, marginTop:1 }}>⚠</span>
              <span style={{ fontSize:13, color:"#991B1B", fontWeight:500 }}>{err}</span>
            </div>
          )}

          <form onSubmit={go}>
            {/* Email field */}
            <div style={{ marginBottom:18 }}>
              <label style={{ display:"block", fontSize:11, fontWeight:700, color:"#374151", marginBottom:7, letterSpacing:.6, textTransform:"uppercase" }}>Email Address</label>
              <div style={{ position:"relative" }}>
                <div style={{ position:"absolute", left:13, top:"50%", transform:"translateY(-50%)", color:focused==="email"?ORANGE:"#9CA3AF", display:"flex", transition:"color .2s" }}>
                  <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                </div>
                <input type="email" value={email} autoComplete="email" required
                  onChange={e=>{setEmail(e.target.value);setErr("");}}
                  onFocus={()=>setFocused("email")} onBlur={()=>setFocused("")}
                  placeholder="you@ampleleap.com"
                  style={{ width:"100%", padding:"12px 14px 12px 38px", borderRadius:10, border:`1.5px solid ${focused==="email"?ORANGE:err&&!email?"#EF4444":"#E5E7EB"}`, fontSize:14, boxSizing:"border-box", outline:"none", background:"white", color:NAVY, transition:"all .2s", boxShadow:focused==="email"?`0 0 0 3px rgba(244,98,31,.1)`:"none" }}/>
              </div>
            </div>

            {/* Password field */}
            <div style={{ marginBottom:28 }}>
              <label style={{ display:"block", fontSize:11, fontWeight:700, color:"#374151", marginBottom:7, letterSpacing:.6, textTransform:"uppercase" }}>Password</label>
              <div style={{ position:"relative" }}>
                <div style={{ position:"absolute", left:13, top:"50%", transform:"translateY(-50%)", color:focused==="pass"?ORANGE:"#9CA3AF", display:"flex", transition:"color .2s" }}>
                  <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                </div>
                <input type={showPass?"text":"password"} value={pass} autoComplete="current-password" required
                  onChange={e=>{setPass(e.target.value);setErr("");}}
                  onFocus={()=>setFocused("pass")} onBlur={()=>setFocused("")}
                  placeholder="Enter your password"
                  style={{ width:"100%", padding:"12px 44px 12px 38px", borderRadius:10, border:`1.5px solid ${focused==="pass"?ORANGE:err&&!pass?"#EF4444":"#E5E7EB"}`, fontSize:14, boxSizing:"border-box", outline:"none", background:"white", color:NAVY, transition:"all .2s", boxShadow:focused==="pass"?`0 0 0 3px rgba(244,98,31,.1)`:"none" }}/>
                <button type="button" onClick={()=>setShowPass(v=>!v)}
                  style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", color:"#9CA3AF", display:"flex", padding:2 }}>
                  {showPass
                    ? <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    : <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button type="submit" disabled={loading}
              style={{ width:"100%", padding:"13px", borderRadius:10, background:loading?ORANGE_DARK:ORANGE, color:"white", border:"none", fontWeight:700, fontSize:15, cursor:loading?"not-allowed":"pointer", boxShadow:`0 4px 16px rgba(244,98,31,.35)`, transition:"all .2s", display:"flex", alignItems:"center", justifyContent:"center", gap:9, letterSpacing:.2 }}
              onMouseEnter={e=>{ if(!loading) e.currentTarget.style.background=ORANGE_DARK; }}
              onMouseLeave={e=>{ if(!loading) e.currentTarget.style.background=ORANGE; }}>
              {loading
                ? <><span style={{ width:15, height:15, border:"2px solid rgba(255,255,255,.3)", borderTop:"2px solid white", borderRadius:"50%", animation:"spin .8s linear infinite", display:"inline-block", flexShrink:0 }}/>Signing in…</>
                : "Sign in →"}
            </button>
          </form>

          {/* Session hint */}
          <div style={{ display:"flex", alignItems:"center", gap:7, justifyContent:"center", marginTop:14 }}>
            <svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth={2}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            <span style={{ fontSize:11, color:"#9CA3AF" }}>Session clears on browser close · 8 hour timeout</span>
          </div>

          {/* Demo divider */}
          <div style={{ display:"flex", alignItems:"center", gap:12, margin:"28px 0 18px" }}>
            <div style={{ flex:1, height:1, background:"#E5E7EB" }}/>
            <span style={{ fontSize:10, color:"#9CA3AF", fontWeight:600, letterSpacing:1.2, textTransform:"uppercase" }}>Demo accounts</span>
            <div style={{ flex:1, height:1, background:"#E5E7EB" }}/>
          </div>

          {/* Demo cards */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8 }}>
            {[
              {role:"Admin",     icon:"🔑", em:"admin@ampleleap.com",     pw:"admin123", accent:"#F4621F", bg:"#FFF7F4"},
              {role:"Recruiter", icon:"✏️", em:"recruiter@ampleleap.com", pw:"rec123",   accent:"#1D4ED8", bg:"#EFF6FF"},
              {role:"Viewer",    icon:"👁️", em:"viewer@ampleleap.com",    pw:"view123",  accent:"#16A34A", bg:"#F0FDF4"},
            ].map(d=>(
              <button key={d.role} type="button" onClick={()=>fill(d.em,d.pw)}
                style={{ padding:"11px 8px", background:d.bg, border:`1.5px solid ${d.accent}20`, borderRadius:10, cursor:"pointer", textAlign:"center", transition:"all .15s", fontFamily:"inherit" }}
                onMouseEnter={e=>{ e.currentTarget.style.borderColor=d.accent; e.currentTarget.style.transform="translateY(-2px)"; e.currentTarget.style.boxShadow=`0 4px 12px ${d.accent}22`; }}
                onMouseLeave={e=>{ e.currentTarget.style.borderColor=`${d.accent}20`; e.currentTarget.style.transform="translateY(0)"; e.currentTarget.style.boxShadow="none"; }}>
                <div style={{ fontSize:18, marginBottom:4 }}>{d.icon}</div>
                <div style={{ fontSize:11, fontWeight:700, color:d.accent }}>{d.role}</div>
                <div style={{ fontSize:9, color:"#9CA3AF", marginTop:1, fontWeight:500 }}>click to fill</div>
              </button>
            ))}
          </div>

          {/* Footer */}
          <div style={{ textAlign:"center", marginTop:32, fontSize:11, color:"#9CA3AF" }}>
            © {new Date().getFullYear()} Ample Leap ·{" "}
            <a href="https://ampleleap.com" target="_blank" rel="noreferrer" style={{ color:ORANGE, textDecoration:"none", fontWeight:500 }}>ampleleap.com</a>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 768px) {
          div[style*="width:420px"] { display: none !important; }
        }
      `}</style>
    </div>
  );
}
