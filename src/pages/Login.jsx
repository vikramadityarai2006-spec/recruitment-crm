import { useState } from "react";
import { api } from "../api";

export default function Login({ onLogin }) {
  const [email, setEmail] = useState("admin@ampleleap.com");
  const [pass, setPass] = useState("admin123");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const go = async e => {
    e.preventDefault();
    setLoading(true);
    setErr("");
    try {
      const r = await api.login(email, pass);
      if (r.token) {
        localStorage.setItem("crm_token", r.token);
        onLogin(r.user);
      } else {
        setErr(r.error || "Invalid credentials. Please try again.");
      }
    } catch(ex) {
      setErr("Connection failed. Please check your internet and try again.");
    }
    setLoading(false);
  };

  return (
    <div style={{minHeight:"100vh",background:"linear-gradient(135deg,#0f172a 0%,#1e3a5f 50%,#0f172a 100%)",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"Inter,system-ui,sans-serif",padding:16}}>
      <div style={{width:"100%",maxWidth:420}}>
        {/* Card */}
        <div style={{background:"white",borderRadius:20,padding:"44px 40px",boxShadow:"0 25px 60px rgba(0,0,0,.4)",border:"1px solid rgba(255,255,255,.1)"}}>
          {/* Logo */}
          <div style={{textAlign:"center",marginBottom:32}}>
            <div style={{width:56,height:56,background:"linear-gradient(135deg,#2563eb,#7c3aed)",borderRadius:16,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 14px",boxShadow:"0 8px 24px rgba(37,99,235,.4)"}}>
              <svg width={28} height={28} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            </div>
            <h1 style={{fontSize:24,fontWeight:800,color:"#0f172a",margin:0,letterSpacing:-.5}}>Ample Leap CRM</h1>
            <p style={{color:"#64748b",marginTop:4,fontSize:13}}>Recruitment Joining Tracker</p>
          </div>

          {err && (
            <div style={{background:"#fee2e2",color:"#991b1b",padding:"11px 14px",borderRadius:9,fontSize:13,marginBottom:18,fontWeight:500,border:"1px solid #fecaca",display:"flex",alignItems:"center",gap:8}}>
              <span style={{fontSize:16}}>⚠️</span>{err}
            </div>
          )}

          <form onSubmit={go}>
            <div style={{marginBottom:16}}>
              <label style={{display:"block",fontSize:12,fontWeight:700,color:"#374151",marginBottom:6,textTransform:"uppercase",letterSpacing:.5}}>Email Address</label>
              <input value={email} onChange={e=>setEmail(e.target.value)} type="email" required placeholder="Enter your email"
                style={{width:"100%",padding:"11px 14px",borderRadius:10,border:"1.5px solid #e2e8f0",fontSize:14,boxSizing:"border-box",outline:"none",background:"#fafafa",transition:"border .2s,box-shadow .2s"}}
                onFocus={e=>{e.target.style.borderColor="#2563eb";e.target.style.boxShadow="0 0 0 3px rgba(37,99,235,.1)";}}
                onBlur={e=>{e.target.style.borderColor="#e2e8f0";e.target.style.boxShadow="none";}}/>
            </div>
            <div style={{marginBottom:24}}>
              <label style={{display:"block",fontSize:12,fontWeight:700,color:"#374151",marginBottom:6,textTransform:"uppercase",letterSpacing:.5}}>Password</label>
              <input value={pass} onChange={e=>setPass(e.target.value)} type="password" required placeholder="Enter your password"
                style={{width:"100%",padding:"11px 14px",borderRadius:10,border:"1.5px solid #e2e8f0",fontSize:14,boxSizing:"border-box",outline:"none",background:"#fafafa",transition:"border .2s,box-shadow .2s"}}
                onFocus={e=>{e.target.style.borderColor="#2563eb";e.target.style.boxShadow="0 0 0 3px rgba(37,99,235,.1)";}}
                onBlur={e=>{e.target.style.borderColor="#e2e8f0";e.target.style.boxShadow="none";}}/>
            </div>
            <button type="submit" disabled={loading}
              style={{width:"100%",padding:"13px",background:"linear-gradient(135deg,#2563eb,#7c3aed)",color:"white",border:"none",borderRadius:11,fontWeight:700,fontSize:15,cursor:loading?"not-allowed":"pointer",opacity:loading?.8:1,boxShadow:"0 4px 14px rgba(37,99,235,.35)",transition:"all .2s",letterSpacing:.2}}>
              {loading ? (
                <span style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
                  <span style={{width:16,height:16,border:"2px solid rgba(255,255,255,.4)",borderTop:"2px solid white",borderRadius:"50%",animation:"spin 0.8s linear infinite",display:"inline-block"}}/>
                  Signing in…
                </span>
              ) : "Sign In →"}
            </button>
          </form>

          <div style={{marginTop:20,padding:"14px 16px",background:"#f8fafc",borderRadius:10,border:"1px solid #f1f5f9"}}>
            <div style={{fontSize:11,fontWeight:700,color:"#64748b",textTransform:"uppercase",letterSpacing:.5,marginBottom:8}}>Demo Credentials</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
              {[["🔑 Admin","admin@ampleleap.com","admin123"],["✏️ Recruiter","recruiter@ampleleap.com","rec123"],["👁️ Viewer","viewer@ampleleap.com","view123"]].map(([role,email,pwd])=>(
                <div key={role} onClick={()=>{setEmail(email);setPass(pwd);}} style={{padding:"8px 10px",background:"white",borderRadius:8,border:"1px solid #e2e8f0",cursor:"pointer",transition:"all .15s"}}
                  onMouseEnter={e=>e.currentTarget.style.borderColor="#2563eb"}
                  onMouseLeave={e=>e.currentTarget.style.borderColor="#e2e8f0"}>
                  <div style={{fontSize:11,fontWeight:700,color:"#374151"}}>{role}</div>
                  <div style={{fontSize:9,color:"#94a3b8",marginTop:1,fontFamily:"monospace"}}>{pwd}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div style={{textAlign:"center",marginTop:16,fontSize:11,color:"rgba(255,255,255,.3)"}}>
          Ample Leap Recruitment CRM · Secure Login
        </div>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
