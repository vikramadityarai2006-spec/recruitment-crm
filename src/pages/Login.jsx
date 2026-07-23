import { useState } from "react";
import { api } from "../api";

export default function Login({ onLogin }) {
  const [email, setEmail]       = useState("");
  const [pass, setPass]         = useState("");
  const [err, setErr]           = useState("");
  const [loading, setLoading]   = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [remember, setRemember] = useState(false);
  // Two-factor step: recruiters receive a code by email before a session starts.
  const [otpStage, setOtpStage] = useState(false);
  const [otp, setOtp]           = useState("");
  const [otpMins, setOtpMins]   = useState(10);
  const [otpShared, setOtpShared] = useState(false);

  const startSession = (r) => {
    sessionStorage.setItem("crm_token", r.token);
    const expiresAt = Date.now() + (r.expiresIn || 28800) * 1000;
    sessionStorage.setItem("crm_session_expires", expiresAt.toString());
    onLogin(r.user);
  };

  const go = async e => {
    e.preventDefault();
    setLoading(true); setErr("");
    try {
      const r = await api.login(email.trim(), pass);
      if (r.otpRequired) {
        setOtpStage(true);
        setOtpMins(r.expiresInMinutes || 10);
        setOtpShared(Boolean(r.sentToShared));
        setOtp("");
        setLoading(false);
        return;
      }
      if (r.token) startSession(r);
      else {
        setErr(r.error || "Invalid credentials. Please verify your email and password.");
        setLoading(false);
      }
    } catch {
      setErr("Connection failed. Check your internet and try again.");
      setLoading(false);
    }
  };

  const verify = async e => {
    e.preventDefault();
    if (otp.trim().length < 6) { setErr("Enter the 6-digit code from your email."); return; }
    setLoading(true); setErr("");
    try {
      const r = await api.verifyOtp(email.trim(), otp.trim());
      if (r.token) startSession(r);
      else {
        setErr(r.error || "That code was not accepted.");
        setLoading(false);
      }
    } catch {
      setErr("Connection failed. Check your internet and try again.");
      setLoading(false);
    }
  };

  const backToLogin = () => { setOtpStage(false); setOtp(""); setErr(""); setPass(""); };

  const fillDemo = (role) => {
    const demos = {
      admin:     { email: "admin@ampleleap.com",     pass: "admin123" },
      recruiter: { email: "recruiter@ampleleap.com", pass: "rec123"   },
      viewer:    { email: "viewer@ampleleap.com",    pass: "view123"  },
    };
    setEmail(demos[role].email);
    setPass(demos[role].pass);
    setErr("");
  };

  return (
    <>
      {/* Tailwind via CDN — loaded once */}
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap"/>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"/>

      <style>{`
        .mat { font-family: 'Material Symbols Outlined'; font-variation-settings: 'FILL' 0,'wght' 400,'GRAD' 0,'opsz' 24; display:inline-block; vertical-align:middle; }
        .mat-fill { font-variation-settings: 'FILL' 1,'wght' 400,'GRAD' 0,'opsz' 24; }
        @keyframes fadeIn { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        .fade-in { animation: fadeIn .6s ease-out forwards; }
        .fade-in-2 { animation: fadeIn .6s ease-out .2s both; }
        .fade-in-4 { animation: fadeIn .6s ease-out .4s both; }
        @keyframes spin { to{transform:rotate(360deg)} }
        .spin { animation: spin .8s linear infinite; }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Inter', system-ui, sans-serif; }

        /* Field */
        .field {
          width: 100%; padding: 12px 16px 12px 44px;
          background: #f8f9fa; border: 1px solid #c3c6d1;
          border-radius: 12px; font-size: 16px; color: #191c1d;
          outline: none; transition: all .2s; font-family: inherit;
        }
        .field:focus { border-color: #003163; box-shadow: 0 0 0 3px rgba(0,49,99,.12); background: #fff; }
        .field::placeholder { color: #9ba0aa; }

        /* Demo btn hover */
        .demo-btn:hover { background: #e7e8e9 !important; }
        .demo-btn:hover .demo-icon { transform: scale(1.1); }
        .demo-icon { transition: transform .2s; }

        /* Submit hover */
        .submit-btn:hover:not(:disabled) { background: #d35400 !important; }
        .submit-btn:active:not(:disabled) { transform: scale(.98); }
        .submit-btn:disabled { opacity: .6; cursor: not-allowed; }
      `}</style>

      <div style={{ minHeight:"100vh", display:"flex", fontFamily:"'Inter',system-ui,sans-serif", background:"#f8f9fa", overflowX:"hidden" }}>

        {/* ── LEFT BRAND PANEL ── */}
        <section style={{ display:"none", width:"58.333%", background:"#003163", position:"relative", overflow:"hidden", padding:"64px", flexDirection:"column", justifyContent:"space-between", flexShrink:0 }} className="al-left">
          {/* Background overlay */}
          <div style={{ position:"absolute", inset:0, zIndex:0 }}>
            <div style={{ position:"absolute", inset:0, backgroundImage:"url('https://lh3.googleusercontent.com/aida/AP1WRLv5Q_u2xfc5mQSjr_tDEkOJMCisBJXAS05abi5TmS9wSVMQbbfav-QNFJvsiu34gEfNso3k0JZ0-Wf2mZBdJvP3pwppEPp4JLsXbU_BoyxzCzX7lfn87ywWqxPui_4nmpX5CFVu_Gh2kKVdJ4pOWBXUt3vpNTQAWT_jvTjBNzYsvkB1poQkWi23bx5Fyvyon9s5rKBnH-_e2pGOh2WexYAjs2YoMLjynIuLRN12mgH3rmQHKFMPjH6NQQ')", backgroundSize:"cover", backgroundPosition:"center", opacity:.2, mixBlendMode:"overlay" }}/>
            <div style={{ position:"absolute", inset:0, background:"linear-gradient(135deg, #003163 0%, transparent 50%, #001c3e 100%)", opacity:.9 }}/>
          </div>

          {/* Top: logo + headline */}
          <div style={{ position:"relative", zIndex:10 }} className="fade-in">
            <img src="https://lh3.googleusercontent.com/aida/AP1WRLt22RVqyfgd_cv5WlOHA9yYsMY6Gn9T5z-gVRggZfSgT9Gep4ne0ZXHSunSpnoxJcX3wGIAdG5DaJKa8o4feuEdewE_9WjjKpHDFIVNK01qobqbaAJ2GEtq4oe7lLMfp_TD6HL8n8rT3qTmXLGWa_2A10loCw0vHBV1mgvlOqKd7ywGAAzsAsG6KGpQIijjMIK0wuvrTVUGf8NbZlP972nqrq31JQFjUouHsvYsTrz3NeCeQAvgt2GtMQ"
              alt="Ample Leap Logo" style={{ height:64, marginBottom:48, display:"block" }}/>
            <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
              <h1 style={{ fontSize:48, lineHeight:"56px", letterSpacing:"-.02em", fontWeight:700, color:"white" }}>
                Quantum Growth <br/>
                <span style={{ color:"#789ad3" }}>Simplified.</span>
              </h1>
              <p style={{ fontSize:18, lineHeight:"28px", color:"white", opacity:.8, maxWidth:480 }}>
                Experience the future of recruitment management. Ethics, Excellence, Happiness, and Commitment—integrated into every workflow.
              </p>
              <div style={{ display:"flex", alignItems:"center", gap:8, color:"#e77e23", fontSize:24, fontWeight:600, fontStyle:"italic", marginTop:8 }}>
                Grow and Smile.
              </div>
            </div>
          </div>

          {/* Middle: values grid */}
          <div style={{ position:"relative", zIndex:10 }} className="fade-in-2">
            <p style={{ fontSize:12, lineHeight:"16px", letterSpacing:".05em", fontWeight:500, color:"#789ad3", textTransform:"uppercase", marginBottom:20 }}>Core Values</p>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
              {[
                { icon:"verified_user",      label:"Ethics",     color:"#42D9DA" },
                { icon:"star",               label:"Excellence", color:"#e77e23" },
                { icon:"sentiment_satisfied",label:"Happiness",  color:"#bff0a4" },
                { icon:"handshake",          label:"Commitment", color:"#789ad3" },
              ].map(v => (
                <div key={v.label} style={{ display:"flex", alignItems:"center", gap:12, background:"rgba(255,255,255,.05)", border:"1px solid rgba(255,255,255,.1)", padding:16, borderRadius:12 }}>
                  <span className="mat mat-fill" style={{ color:v.color, fontSize:22 }}>{v.icon}</span>
                  <span style={{ color:"white", fontSize:14, fontWeight:600 }}>{v.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div style={{ position:"relative", zIndex:10, paddingTop:32, borderTop:"1px solid rgba(255,255,255,.1)" }} className="fade-in-4">
            <p style={{ fontSize:12, color:"white", opacity:.4 }}>© {new Date().getFullYear()} Ample Leap. The Integrated HR Solution. All rights reserved.</p>
          </div>
        </section>

        {/* ── RIGHT FORM PANEL ── */}
        <main style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", padding:"32px 24px", background:"#ffffff" }}>
          <div style={{ width:"100%", maxWidth:448 }} className="fade-in">

            {/* Mobile logo */}
            <div style={{ display:"block", marginBottom:32 }} className="al-mobile-logo">
              <img src="https://lh3.googleusercontent.com/aida/AP1WRLt22RVqyfgd_cv5WlOHA9yYsMY6Gn9T5z-gVRggZfSgT9Gep4ne0ZXHSunSpnoxJcX3wGIAdG5DaJKa8o4feuEdewE_9WjjKpHDFIVNK01qobqbaAJ2GEtq4oe7lLMfp_TD6HL8n8rT3qTmXLGWa_2A10loCw0vHBV1mgvlOqKd7ywGAAzsAsG6KGpQIijjMIK0wuvrTVUGf8NbZlP972nqrq31JQFjUouHsvYsTrz3NeCeQAvgt2GtMQ"
                alt="Ample Leap" style={{ height:40 }}/>
            </div>

            <div style={{ marginBottom:48 }}>
              <h2 style={{ fontSize:32, lineHeight:"40px", letterSpacing:"-.01em", fontWeight:700, color:"#003163", marginBottom:8 }}>
                {otpStage ? (otpShared ? "Enter your code" : "Check your email") : "Welcome back"}
              </h2>
              <p style={{ fontSize:16, color:"#43474f" }}>
                {otpStage
                  ? (otpShared
                      ? <>A 6-digit code was sent to the <strong style={{color:"#003163"}}>company inbox</strong>. Ask your administrator for it. It expires in {otpMins} minutes.</>
                      : <>We sent a 6-digit code to <strong style={{color:"#003163"}}>{email}</strong>. It expires in {otpMins} minutes.</>)
                  : "Secure CRM Login Portal"}
              </p>
            </div>

            {/* Error */}
            {err && (
              <div style={{ display:"flex", alignItems:"flex-start", gap:12, padding:16, background:"#ffdad6", borderRadius:12, marginBottom:24 }}>
                <span className="mat" style={{ color:"#93000a", fontSize:20, flexShrink:0 }}>error</span>
                <span style={{ fontSize:12, color:"#93000a", fontWeight:500 }}>{err}</span>
              </div>
            )}

            {!otpStage && (
            <form onSubmit={go} style={{ display:"flex", flexDirection:"column", gap:24 }}>
              {/* Email */}
              <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
                <label style={{ fontSize:14, fontWeight:600, color:"#43474f", letterSpacing:".01em" }}>Email Address</label>
                <div style={{ position:"relative" }}>
                  <span className="mat" style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", color:"#737780", fontSize:20, pointerEvents:"none" }}>alternate_email</span>
                  <input type="email" value={email} required placeholder="name@ampleleap.com"
                    onChange={e=>{setEmail(e.target.value);setErr("");}}
                    className="field" style={{ paddingLeft:44 }}/>
                </div>
              </div>

              {/* Password */}
              <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                  <label style={{ fontSize:14, fontWeight:600, color:"#43474f", letterSpacing:".01em" }}>Password</label>
                  <a href="#" style={{ fontSize:12, color:"#003163", textDecoration:"none", fontWeight:500 }}
                    onMouseEnter={e=>e.target.style.textDecoration="underline"}
                    onMouseLeave={e=>e.target.style.textDecoration="none"}>Forgot password?</a>
                </div>
                <div style={{ position:"relative" }}>
                  <span className="mat" style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", color:"#737780", fontSize:20, pointerEvents:"none" }}>lock</span>
                  <input type={showPass?"text":"password"} value={pass} required placeholder="••••••••"
                    onChange={e=>{setPass(e.target.value);setErr("");}}
                    className="field" style={{ paddingLeft:44, paddingRight:48 }}/>
                  <button type="button" onClick={()=>setShowPass(v=>!v)}
                    style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", color:"#737780", display:"flex", alignItems:"center", padding:2 }}
                    onMouseEnter={e=>e.currentTarget.style.color="#003163"}
                    onMouseLeave={e=>e.currentTarget.style.color="#737780"}>
                    <span className="mat" style={{ fontSize:20 }}>{showPass?"visibility_off":"visibility"}</span>
                  </button>
                </div>
              </div>

              {/* Remember */}
              <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                <input type="checkbox" id="remember" checked={remember} onChange={e=>setRemember(e.target.checked)}
                  style={{ width:16, height:16, cursor:"pointer", accentColor:"#003163" }}/>
                <label htmlFor="remember" style={{ fontSize:12, color:"#43474f", cursor:"pointer", userSelect:"none" }}>Remember this device</label>
              </div>

              {/* Submit */}
              <button type="submit" disabled={loading} className="submit-btn"
                style={{ width:"100%", display:"flex", alignItems:"center", justifyContent:"center", gap:8, padding:"16px 24px", background:"#E67E22", color:"white", border:"none", borderRadius:12, fontSize:14, fontWeight:600, letterSpacing:".01em", boxShadow:"0 4px 16px rgba(230,126,34,.35)", transition:"all .2s", cursor:"pointer", fontFamily:"inherit" }}>
                {loading ? (
                  <>
                    <div style={{ width:18, height:18, border:"2px solid rgba(255,255,255,.3)", borderTop:"2px solid white", borderRadius:"50%" }} className="spin"/>
                    Authenticating…
                  </>
                ) : (
                  <>
                    Sign in
                    <span className="mat" style={{ fontSize:20 }}>arrow_forward</span>
                  </>
                )}
              </button>
            </form>
            )}

            {/* ── Step 2: one-time code (recruiters) ── */}
            {otpStage && (
            <form onSubmit={verify} style={{ display:"flex", flexDirection:"column", gap:24 }}>
              <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
                <label style={{ fontSize:14, fontWeight:600, color:"#43474f", letterSpacing:".01em" }}>Verification code</label>
                <div style={{ position:"relative" }}>
                  <span className="mat" style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", color:"#737780", fontSize:20, pointerEvents:"none" }}>pin</span>
                  <input type="text" inputMode="numeric" autoComplete="one-time-code" maxLength={6}
                    value={otp} autoFocus placeholder="000000"
                    onChange={e=>{ setOtp(e.target.value.replace(/\D/g,"")); setErr(""); }}
                    className="field"
                    style={{ paddingLeft:44, letterSpacing:"10px", fontSize:22, fontWeight:700, textAlign:"center" }}/>
                </div>
              </div>

              <button type="submit" disabled={loading} className="submit-btn"
                style={{ width:"100%", display:"flex", alignItems:"center", justifyContent:"center", gap:8, padding:"16px 24px", background:"#E67E22", color:"white", border:"none", borderRadius:12, fontSize:14, fontWeight:600, letterSpacing:".01em", boxShadow:"0 4px 16px rgba(230,126,34,.35)", transition:"all .2s", cursor:"pointer", fontFamily:"inherit" }}>
                {loading ? (
                  <>
                    <div style={{ width:18, height:18, border:"2px solid rgba(255,255,255,.3)", borderTop:"2px solid white", borderRadius:"50%" }} className="spin"/>
                    Verifying…
                  </>
                ) : (
                  <>
                    Verify and sign in
                    <span className="mat" style={{ fontSize:20 }}>arrow_forward</span>
                  </>
                )}
              </button>

              <button type="button" onClick={backToLogin}
                style={{ background:"none", border:"none", cursor:"pointer", color:"#003163", fontSize:12, fontWeight:600, fontFamily:"inherit", display:"flex", alignItems:"center", justifyContent:"center", gap:6 }}>
                <span className="mat" style={{ fontSize:16 }}>arrow_back</span> Use a different account
              </button>
            </form>
            )}

            {/* Demo accounts */}
            {!otpStage && (
            <div style={{ marginTop:48, paddingTop:32, borderTop:"1px solid #c3c6d1" }}>
              <p style={{ fontSize:12, color:"#43474f", textTransform:"uppercase", letterSpacing:".05em", fontWeight:500, marginBottom:16 }}>Quick Access: Demo Accounts</p>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:12 }}>
                {[
                  { role:"admin",     icon:"admin_panel_settings", label:"Admin"     },
                  { role:"recruiter", icon:"work",                  label:"Recruiter" },
                  { role:"viewer",    icon:"visibility",            label:"Viewer"    },
                ].map(d=>(
                  <button key={d.role} type="button" onClick={()=>fillDemo(d.role)} className="demo-btn"
                    style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:8, padding:12, background:"#edeeef", border:"1px solid #c3c6d1", borderRadius:12, cursor:"pointer", transition:"background .15s", fontFamily:"inherit" }}>
                    <span className="mat demo-icon" style={{ color:"#003163", fontSize:24 }}>{d.icon}</span>
                    <span style={{ fontSize:12, color:"#43474f", fontWeight:500 }}>{d.label}</span>
                  </button>
                ))}
              </div>
            </div>
            )}

            <p style={{ marginTop:48, textAlign:"center", fontSize:12, color:"#737780" }}>
              Need help? Contact{" "}
              <a href="mailto:support@ampleleap.com" style={{ color:"#003163", fontWeight:500, textDecoration:"none" }}
                onMouseEnter={e=>e.target.style.textDecoration="underline"}
                onMouseLeave={e=>e.target.style.textDecoration="none"}>Support</a>
            </p>
          </div>
        </main>
      </div>

      <style>{`
        @media (min-width: 1024px) {
          .al-left { display: flex !important; }
          .al-mobile-logo { display: none !important; }
        }
      `}</style>
    </>
  );
}
