import { useState, useEffect, useCallback } from "react";
import { api } from "./api";
import { Icon } from "./components/UI";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Candidates from "./pages/Candidates";
import Masters from "./pages/Masters";
import Audit from "./pages/Audit";
import Companies from "./pages/Companies";

export default function App() {
  const [user, setUser] = useState(() => {
    const t = localStorage.getItem("crm_token");
    if (!t) return null;
    try {
      const p = JSON.parse(atob(t.split(".")[1]));
      if (p.exp * 1000 < Date.now()) { localStorage.removeItem("crm_token"); return null; }
      return { id:p.id, name:p.name, email:p.email, role:p.role };
    } catch { localStorage.removeItem("crm_token"); return null; }
  });

  const [page, setPage] = useState("dashboard");
  const [masters, setMasters] = useState({
    clients:[], owners:[], joiningStatus:[], resignationStatus:[],
    locations:[], designations:[], statusCodes:[], _full:{}
  });
  const [refreshKey, setRefreshKey] = useState(0);

  const loadMasters = useCallback(() => {
    if (user) api.getMasters().then(m => setMasters(m || {})).catch(console.error);
  }, [user]);

  useEffect(() => { loadMasters(); }, [loadMasters]);

  if (!user) return <Login onLogin={u => { setUser(u); }} />;

  const logout = () => { localStorage.removeItem("crm_token"); setUser(null); };

  const nav = [
    { k:"dashboard",  l:"Dashboard",       i:"dash"  },
    { k:"candidates", l:"Candidates",       i:"users" },
    { k:"companies",  l:"Companies",        i:"chart" },
    ...(user.role==="admin" ? [
      { k:"masters",  l:"Master Data",      i:"cog"   },
      { k:"audit",    l:"Audit Log",        i:"eye"   },
    ] : []),
  ];

  const PAGE_TITLES = {
    dashboard:"Dashboard", candidates:"Candidates",
    companies:"Company Contacts", masters:"Master Data", audit:"Audit Log"
  };

  return (
    <div style={{display:"flex",fontFamily:"'Inter',system-ui,sans-serif",minHeight:"100vh",background:"#f1f5f9"}}>
      {/* ── SIDEBAR ── */}
      <aside style={{width:220,background:"#0f172a",minHeight:"100vh",display:"flex",flexDirection:"column",flexShrink:0,position:"sticky",top:0,height:"100vh",overflow:"auto"}}>
        {/* Logo */}
        <div style={{padding:"22px 18px 16px",borderBottom:"1px solid #1e293b"}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{width:36,height:36,borderRadius:10,background:"linear-gradient(135deg,#2563eb,#7c3aed)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,boxShadow:"0 4px 12px rgba(37,99,235,.4)"}}>
              <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
            </div>
            <div>
              <div style={{fontSize:13,fontWeight:800,color:"white",lineHeight:1.1}}>Ample Leap</div>
              <div style={{fontSize:9,color:"#475569",marginTop:1,letterSpacing:.5}}>RECRUITMENT CRM</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{flex:1,padding:"12px 10px"}}>
          <div style={{fontSize:9,fontWeight:700,color:"#334155",textTransform:"uppercase",letterSpacing:1,padding:"0 8px",marginBottom:6}}>Navigation</div>
          {nav.map(n=>(
            <button key={n.k} onClick={()=>setPage(n.k)}
              style={{width:"100%",display:"flex",alignItems:"center",gap:10,padding:"10px 12px",borderRadius:9,border:"none",background:page===n.k?"rgba(37,99,235,.2)":"transparent",color:page===n.k?"#93c5fd":"#64748b",fontWeight:page===n.k?700:400,cursor:"pointer",fontSize:13,marginBottom:2,textAlign:"left",outline:"none",transition:"all .15s",fontFamily:"inherit"}}>
              <span style={{opacity:.9,flexShrink:0}}><Icon n={n.i} s={15}/></span>
              {n.l}
              {page===n.k && <span style={{marginLeft:"auto",width:5,height:5,borderRadius:"50%",background:"#3b82f6",flexShrink:0}}/>}
            </button>
          ))}
        </nav>

        {/* User */}
        <div style={{padding:"14px 12px",borderTop:"1px solid #1e293b"}}>
          <div style={{display:"flex",alignItems:"center",gap:9,marginBottom:10,padding:"8px 10px",background:"rgba(255,255,255,.04)",borderRadius:9}}>
            <div style={{width:32,height:32,borderRadius:8,background:"linear-gradient(135deg,#1e40af,#7c3aed)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:800,color:"white",flexShrink:0}}>
              {user.name[0].toUpperCase()}
            </div>
            <div style={{overflow:"hidden",flex:1}}>
              <div style={{fontSize:12,fontWeight:700,color:"#e2e8f0",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{user.name}</div>
              <div style={{fontSize:9,color:"#475569",textTransform:"capitalize",marginTop:1}}>{user.role} account</div>
            </div>
          </div>
          <button onClick={logout} style={{width:"100%",display:"flex",alignItems:"center",gap:7,padding:"8px 10px",borderRadius:8,border:"1px solid #1e293b",background:"transparent",color:"#64748b",cursor:"pointer",fontSize:11,fontWeight:600,fontFamily:"inherit",transition:"all .15s"}}
            onMouseEnter={e=>{e.currentTarget.style.background="#1e293b";e.currentTarget.style.color="#ef4444";}}
            onMouseLeave={e=>{e.currentTarget.style.background="transparent";e.currentTarget.style.color="#64748b";}}>
            <Icon n="out" s={12}/> Sign Out
          </button>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <main style={{flex:1,overflow:"auto",display:"flex",flexDirection:"column",minWidth:0}}>
        {/* Top bar */}
        <div style={{background:"white",borderBottom:"1px solid #e2e8f0",padding:"12px 24px",display:"flex",justifyContent:"space-between",alignItems:"center",position:"sticky",top:0,zIndex:10,backdropFilter:"blur(8px)"}}>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <div style={{fontSize:14,fontWeight:700,color:"#0f172a"}}>{PAGE_TITLES[page]}</div>
            <span style={{color:"#cbd5e1",fontSize:12}}>›</span>
            <div style={{fontSize:12,color:"#64748b"}}>{new Date().toLocaleDateString("en-IN",{weekday:"long",day:"numeric",month:"long",year:"numeric"})}</div>
          </div>
          <div style={{display:"flex",gap:8,alignItems:"center"}}>
            <div style={{fontSize:11,background:"#f0fdf4",color:"#16a34a",border:"1px solid #bbf7d0",padding:"4px 10px",borderRadius:20,fontWeight:700,display:"flex",alignItems:"center",gap:4}}>
              <span style={{width:6,height:6,borderRadius:"50%",background:"#22c55e",animation:"pulse 2s infinite",display:"inline-block"}}/>
              Live
            </div>
            <div style={{fontSize:11,background:"#f0f9ff",color:"#0369a1",border:"1px solid #bae6fd",padding:"4px 10px",borderRadius:20,fontWeight:600,textTransform:"capitalize"}}>{user.role}</div>
          </div>
        </div>

        {/* Page Content */}
        <div style={{padding:24,flex:1}}>
          {page==="dashboard"  && <Dashboard key={refreshKey}/>}
          {page==="candidates" && <Candidates key={refreshKey} masters={masters} user={user}/>}
          {page==="companies"  && <Companies user={user}/>}
          {page==="masters"    && user.role==="admin" && <Masters masters={masters} reload={loadMasters}/>}
          {page==="audit"      && user.role==="admin" && <Audit/>}
        </div>
      </main>

      <style>{`
        * { box-sizing: border-box; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:.4; } }
        ::-webkit-scrollbar { width: 5px; height: 5px; }
        ::-webkit-scrollbar-track { background: #f1f5f9; }
        ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        ::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
      `}</style>
    </div>
  );
}
