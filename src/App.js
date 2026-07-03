import { useState, useEffect, useCallback } from "react";
import { api } from "./api";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Candidates from "./pages/Candidates";
import Masters from "./pages/Masters";
import Audit from "./pages/Audit";
import Companies from "./pages/Companies";

// ─── MATERIAL ICON ─────────────────────────────────────────────────────────────
const M = ({ n, fill = 0, size = 22, style = {} }) => (
  <span style={{ fontFamily:"Material Symbols Outlined", fontVariationSettings:`'FILL' ${fill},'wght' 400,'GRAD' 0,'opsz' 24`, fontSize:size, display:"inline-block", verticalAlign:"middle", lineHeight:1, userSelect:"none", ...style }}>{n}</span>
);

// ─── SESSION EXPIRED MODAL ────────────────────────────────────────────────────
function SessionModal({ onDismiss }) {
  return (
    <div style={{ position:"fixed",inset:0,background:"rgba(0,49,99,.4)",backdropFilter:"blur(4px)",zIndex:9999,display:"flex",alignItems:"center",justifyContent:"center" }}>
      <div style={{ background:"white",borderRadius:20,padding:"36px 40px",maxWidth:380,width:"100%",textAlign:"center",boxShadow:"0 25px 60px rgba(0,0,0,.3)" }}>
        <div style={{ width:60,height:60,borderRadius:"50%",background:"#dce9ff",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 16px" }}>
          <M n="lock" size={28} style={{color:"#003163"}}/>
        </div>
        <h2 style={{ fontSize:20,fontWeight:700,color:"#003163",margin:"0 0 8px" }}>Session Expired</h2>
        <p style={{ fontSize:14,color:"#43474f",margin:"0 0 24px",lineHeight:1.6 }}>Your session has timed out for security. Sign in again to continue.</p>
        <button onClick={onDismiss} style={{ width:"100%",padding:13,background:"linear-gradient(135deg,#003163,#001c3e)",color:"white",border:"none",borderRadius:12,fontWeight:700,fontSize:15,cursor:"pointer" }}>
          Sign In Again
        </button>
      </div>
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState(() => {
    const t = sessionStorage.getItem("crm_token");
    if (!t) return null;
    try {
      const p = JSON.parse(atob(t.split(".")[1]));
      if (p.exp * 1000 < Date.now()) { sessionStorage.removeItem("crm_token"); return null; }
      return { id:p.id, name:p.name, email:p.email, role:p.role };
    } catch { sessionStorage.removeItem("crm_token"); return null; }
  });

  const [page, setPage]               = useState("dashboard");
  const [masters, setMasters]         = useState({ clients:[], owners:[], joiningStatus:[], resignationStatus:[], locations:[], designations:[], statusCodes:[], _full:{} });
  const [sessionExpired, setSessionExpired] = useState(false);
  const [mobileOpen, setMobileOpen]   = useState(false);

  // Listen for 401 auto-logout
  useEffect(() => {
    const h = e => { if (e.detail==="session_expired") { setUser(null); setSessionExpired(true); } };
    window.addEventListener("crm_logout", h);
    return () => window.removeEventListener("crm_logout", h);
  }, []);

  // Auto-logout timer
  useEffect(() => {
    if (!user) return;
    const exp = parseInt(sessionStorage.getItem("crm_session_expires")||"0");
    if (!exp) return;
    const ms = exp - Date.now();
    if (ms <= 0) { logout(); return; }
    const t = setTimeout(() => logout("session_expired"), ms);
    return () => clearTimeout(t);
  }, [user]);

  const loadMasters = useCallback(() => {
    if (user) api.getMasters().then(m => { if (m&&!m.error) setMasters(m); }).catch(console.error);
  }, [user]);

  useEffect(() => { loadMasters(); }, [loadMasters]);

  if (!user) return (
    <>
      {sessionExpired && <SessionModal onDismiss={() => setSessionExpired(false)}/>}
      <Login onLogin={u => { setUser(u); setSessionExpired(false); }}/>
    </>
  );

  const logout = (reason) => {
    sessionStorage.removeItem("crm_token");
    sessionStorage.removeItem("crm_session_expires");
    setUser(null);
    if (reason === "session_expired") setSessionExpired(true);
  };

  const nav = [
    { k:"dashboard",  l:"Dashboard",    icon:"dashboard",        roles:["admin","recruiter","viewer"] },
    { k:"candidates", l:"Candidates",   icon:"group",            roles:["admin","recruiter","viewer"] },
    { k:"companies",  l:"Clients",      icon:"business_center",  roles:["admin","recruiter","viewer"] },
    { k:"masters",    l:"Master Data",  icon:"tune",             roles:["admin"] },
    { k:"audit",      l:"Audit Log",    icon:"history",          roles:["admin"] },
  ].filter(n => n.roles.includes(user.role));

  const getSessionLeft = () => {
    const exp = parseInt(sessionStorage.getItem("crm_session_expires")||"0");
    if (!exp) return null;
    const ms = exp - Date.now();
    if (ms <= 0) return null;
    const h = Math.floor(ms/3600000);
    const m = Math.floor((ms%3600000)/60000);
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

  return (
    <div style={{ display:"flex", fontFamily:"'Inter',system-ui,sans-serif", minHeight:"100vh", background:"#F8F9FA" }}>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"/>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"/>

      {/* ── SIDEBAR ── */}
      {mobileOpen && <div onClick={()=>setMobileOpen(false)} style={{ position:"fixed",inset:0,background:"rgba(0,0,0,.3)",zIndex:49 }}/>}

      <aside style={{ width:256, background:"#eff4ff", borderRight:"1px solid #c3c6d1", minHeight:"100vh", display:"flex", flexDirection:"column", padding:16, flexShrink:0, position:"sticky", top:0, height:"100vh", overflowY:"auto", zIndex:50, transition:"transform .3s" }}>

        {/* Brand */}
        <div style={{ display:"flex",alignItems:"center",gap:12,marginBottom:48,paddingLeft:8 }}>
          <div style={{ width:40,height:40,borderRadius:12,background:"#003163",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
            <span style={{ color:"white",fontWeight:900,fontSize:18,fontFamily:"Georgia,serif" }}>A</span>
          </div>
          <div>
            <h1 style={{ fontSize:18,fontWeight:700,color:"#003163",margin:0,lineHeight:1.1 }}>Ample Leap</h1>
            <p style={{ fontSize:10,textTransform:"uppercase",letterSpacing:"0.12em",color:"#43474f",fontWeight:600,margin:0,marginTop:2 }}>Grow and Smile</p>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex:1, display:"flex", flexDirection:"column", gap:4 }}>
          {nav.map(n => {
            const active = page === n.k;
            return (
              <button key={n.k} onClick={()=>{ setPage(n.k); setMobileOpen(false); }}
                style={{ display:"flex",alignItems:"center",gap:14,padding:"10px 14px",borderRadius:12,border:"none",background:active?"#E67E22":"transparent",color:active?"white":"#43474f",fontWeight:active?700:500,cursor:"pointer",fontSize:14,textAlign:"left",fontFamily:"inherit",transition:"all .15s",transform:active?"translateX(4px)":"translateX(0)" }}
                onMouseEnter={e=>{ if(!active){ e.currentTarget.style.background="#dce9ff"; e.currentTarget.style.color="#003163"; } }}
                onMouseLeave={e=>{ if(!active){ e.currentTarget.style.background="transparent"; e.currentTarget.style.color="#43474f"; } }}>
                <M n={n.icon} fill={active?1:0} size={20} style={{color:active?"white":"#43474f"}}/>
                {n.l}
              </button>
            );
          })}
        </nav>

        {/* Add candidate CTA */}
        {user.role!=="viewer" && (
          <button onClick={()=>setPage("candidates")} style={{ width:"100%",padding:"12px 16px",background:"#E67E22",color:"white",border:"none",borderRadius:12,fontWeight:700,fontSize:14,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:6,boxShadow:"0 4px 16px rgba(230,126,34,.35)",marginBottom:16,fontFamily:"inherit" }}>
            <M n="add" size={18} style={{color:"white"}}/> Add New Candidate
          </button>
        )}

        {/* User + Footer */}
        <div style={{ paddingTop:16,borderTop:"1px solid #c3c6d1" }}>
          {getSessionLeft() && <div style={{ fontSize:10,color:"#737780",textAlign:"center",marginBottom:10,padding:"4px 8px",background:"#e5eeff",borderRadius:8 }}>🔒 Session: {getSessionLeft()} remaining</div>}
          <div style={{ display:"flex",alignItems:"center",gap:10,padding:"8px 10px",background:"white",borderRadius:10,border:"1px solid #c3c6d1",marginBottom:8 }}>
            <div style={{ width:34,height:34,borderRadius:8,background:"#003163",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,fontWeight:700,color:"white",flexShrink:0 }}>{user.name[0].toUpperCase()}</div>
            <div style={{ flex:1,overflow:"hidden" }}>
              <div style={{ fontSize:13,fontWeight:700,color:"#003163",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{user.name}</div>
              <div style={{ fontSize:10,color:"#43474f",textTransform:"capitalize" }}>{user.role}</div>
            </div>
          </div>
          <button onClick={()=>logout()} style={{ width:"100%",display:"flex",alignItems:"center",gap:8,padding:"9px 12px",border:"1px solid #c3c6d1",borderRadius:10,background:"transparent",color:"#43474f",cursor:"pointer",fontSize:13,fontWeight:600,fontFamily:"inherit",transition:"all .15s" }}
            onMouseEnter={e=>{ e.currentTarget.style.color="#ba1a1a"; e.currentTarget.style.borderColor="#ba1a1a"; e.currentTarget.style.background="#ffdad6"; }}
            onMouseLeave={e=>{ e.currentTarget.style.color="#43474f"; e.currentTarget.style.borderColor="#c3c6d1"; e.currentTarget.style.background="transparent"; }}>
            <M n="logout" size={16}/> Sign Out
          </button>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <div style={{ flex:1, display:"flex", flexDirection:"column", minWidth:0 }}>
        {/* Top bar */}
        <header style={{ background:"white", borderBottom:"1px solid #c3c6d1", padding:"0 24px", height:64, display:"flex", alignItems:"center", justifyContent:"space-between", position:"sticky", top:0, zIndex:40 }}>
          <div style={{ display:"flex",alignItems:"center",gap:12 }}>
            <button onClick={()=>setMobileOpen(v=>!v)} style={{ background:"none",border:"none",cursor:"pointer",color:"#003163",display:"flex",padding:2 }}>
              <M n="menu" size={22}/>
            </button>
            <h2 style={{ fontSize:18,fontWeight:700,color:"#003163",margin:0 }}>
              {{dashboard:"Recruitment Overview",candidates:"Candidates",companies:"Client Contacts",masters:"Master Data",audit:"Audit Log"}[page]}
            </h2>
          </div>
          <div style={{ display:"flex",alignItems:"center",gap:12 }}>
            {/* Search */}
            <div style={{ display:"flex",alignItems:"center",gap:8,background:"#eff4ff",border:"1px solid #c3c6d1",borderRadius:99,padding:"6px 14px",width:200 }}>
              <M n="search" size={18} style={{color:"#43474f"}}/>
              <input placeholder="Search candidates…" style={{ border:"none",background:"none",outline:"none",fontSize:13,width:"100%",color:"#0b1c30" }}/>
            </div>
            <div style={{ display:"flex",alignItems:"center",gap:8 }}>
              <div style={{ textAlign:"right" }}>
                <div style={{ fontSize:14,fontWeight:700,color:"#003163" }}>{user.name}</div>
                <div style={{ fontSize:11,color:"#43474f",textTransform:"capitalize" }}>{user.role}</div>
              </div>
              <div style={{ width:38,height:38,borderRadius:"50%",background:"#003163",border:"2px solid #E67E22",display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,fontWeight:700,color:"white" }}>{user.name[0].toUpperCase()}</div>
            </div>
          </div>
        </header>

        {/* Page */}
        <main style={{ padding:24, flex:1, overflow:"auto" }}>
          {page==="dashboard"  && <Dashboard/>}
          {page==="candidates" && <Candidates masters={masters} user={user}/>}
          {page==="companies"  && <Companies user={user}/>}
          {page==="masters"    && user.role==="admin" && <Masters masters={masters} reload={loadMasters} currentUser={user}/>}
          {page==="audit"      && user.role==="admin" && <Audit/>}
        </main>
      </div>

      <style>{`
        @keyframes spin { to{transform:rotate(360deg)} }
        ::-webkit-scrollbar { width:5px; height:5px; }
        ::-webkit-scrollbar-track { background:transparent; }
        ::-webkit-scrollbar-thumb { background:#C3C6D1; border-radius:10px; }
      `}</style>
    </div>
  );
}
