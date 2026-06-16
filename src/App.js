import { useState, useEffect, useCallback, useRef } from "react";

// ─── API ──────────────────────────────────────────────────────────────────────
const BASE_URL = "https://crm-api-iota-two.vercel.app/api";
const getToken = () => localStorage.getItem("crm_token");
const H = () => ({ "Content-Type": "application/json", ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}) });

const api = {
  login: (e, p) => fetch(`${BASE_URL}/auth/login`, { method: "POST", headers: H(), body: JSON.stringify({ email: e, password: p }) }).then(r => r.json()),
  getCandidates: (p = {}) => fetch(`${BASE_URL}/candidates?${new URLSearchParams(p)}`, { headers: H() }).then(r => r.json()),
  createCandidate: (d) => fetch(`${BASE_URL}/candidates`, { method: "POST", headers: H(), body: JSON.stringify(d) }).then(r => r.json()),
  updateCandidate: (id, d) => fetch(`${BASE_URL}/candidates/${id}`, { method: "PUT", headers: H(), body: JSON.stringify(d) }).then(r => r.json()),
  deleteCandidate: (id) => fetch(`${BASE_URL}/candidates/delete`, { method: "POST", headers: H(), body: JSON.stringify({ id }) }).then(r => r.json()),
  getMasters: () => fetch(`${BASE_URL}/masters`, { headers: H() }).then(r => r.json()),
  getDashboard: () => fetch(`${BASE_URL}/dashboard`, { headers: H() }).then(r => r.json()),
  getAudit: () => fetch(`${BASE_URL}/audit`, { headers: H() }).then(r => r.json()),
  addMaster: (category, value) => fetch(`${BASE_URL}/masters`, { method: "POST", headers: H(), body: JSON.stringify({ category, value }) }).then(r => r.json()),
};

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const SC = { Joined:"#22c55e",Offered:"#f97316",offered:"#f97316",joined:"#22c55e",Backout:"#ef4444",Left:"#8b5cf6",Rejected:"#dc2626",Hold:"#eab308",Cancelled:"#6b7280" };
const SB = { Joined:"#dcfce7",Offered:"#ffedd5",offered:"#ffedd5",joined:"#dcfce7",Backout:"#fee2e2",Left:"#ede9fe",Rejected:"#fee2e2",Hold:"#fef9c3",Cancelled:"#f3f4f6" };
const CC = { Red:"#ef4444",Orange:"#f97316",Brown:"#92400e",Yellow:"#eab308",Green:"#22c55e",Blue:"#3b82f6",RED:"#ef4444",GREEN:"#22c55e",orange:"#f97316",red:"#ef4444",green:"#22c55e" };
const fmt = n => n?.toLocaleString("en-IN") ?? "—";
const fmtD = d => { if (!d) return "—"; try { return new Date(d).toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"}); } catch { return d; } };

// ─── COMPONENTS ───────────────────────────────────────────────────────────────
const Badge = ({ status, code }) => {
  if (code) { const c = CC[code]||"#6b7280"; return <span style={{background:c+"22",color:c,border:`1px solid ${c}44`,padding:"2px 8px",borderRadius:12,fontSize:11,fontWeight:600,whiteSpace:"nowrap"}}>{code}</span>; }
  const c = SC[status]||"#6b7280", bg = SB[status]||"#f3f4f6";
  return <span style={{background:bg,color:c,padding:"2px 8px",borderRadius:12,fontSize:11,fontWeight:600,whiteSpace:"nowrap"}}>{status||"—"}</span>;
};

const Spin = () => <div style={{width:20,height:20,border:"2px solid #e2e8f0",borderTop:"2px solid #2563eb",borderRadius:"50%",animation:"spin 0.8s linear infinite",margin:"0 auto"}} />;

const Icon = ({ n, s=16 }) => {
  const I = {
    dash:<svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>,
    users:<svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
    cog:<svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/></svg>,
    plus:<svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
    search:<svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
    edit:<svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
    trash:<svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>,
    eye:<svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
    dl:<svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
    chart:<svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
    out:<svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
    x:<svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
    filter:<svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>,
    refresh:<svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>,
  };
  return I[n]||null;
};

// ─── MINI CHARTS ─────────────────────────────────────────────────────────────
const MiniBar = ({ data=[], height=70 }) => {
  const max = Math.max(...data.map(d=>d.value), 1);
  return <div style={{display:"flex",alignItems:"flex-end",gap:3,height,paddingTop:4}}>
    {data.map((d,i) => <div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:2}}>
      <div style={{width:"100%",background:d.color||"#3b82f6",borderRadius:"3px 3px 0 0",height:Math.max(3,(d.value/max)*(height-18)),transition:"height .4s ease"}}/>
      <span style={{fontSize:8,color:"#94a3b8",textAlign:"center",lineHeight:1.1}}>{d.label}</span>
    </div>)}
  </div>;
};

const Donut = ({ data=[], size=90 }) => {
  const total = data.reduce((a,b)=>a+b.value,0)||1;
  let cum = 0;
  const slices = data.map(d=>{const pct=d.value/total;const s=cum;cum+=pct;return{...d,s,pct};});
  const P=(cx,cy,r,a)=>({x:cx+r*Math.cos(a-Math.PI/2),y:cy+r*Math.sin(a-Math.PI/2)});
  return <svg width={size} height={size} viewBox="0 0 100 100">
    {slices.map((s,i)=>{
      if(!s.pct) return null;
      const sa=s.s*2*Math.PI,ea=(s.s+s.pct)*2*Math.PI;
      const p1=P(50,50,40,sa),p2=P(50,50,40,ea);
      return <path key={i} d={`M50,50 L${p1.x},${p1.y} A40,40 0 ${s.pct>.5?1:0},1 ${p2.x},${p2.y} Z`} fill={s.color} opacity={.9}/>;
    })}
    <circle cx={50} cy={50} r={26} fill="white"/>
    <text x={50} y={51} textAnchor="middle" dominantBaseline="middle" fontSize={13} fontWeight={700} fill="#1e293b">{total}</text>
    <text x={50} y={61} textAnchor="middle" dominantBaseline="middle" fontSize={7} fill="#94a3b8">TOTAL</text>
  </svg>;
};

// ─── MODAL ────────────────────────────────────────────────────────────────────
const Modal = ({ open, onClose, title, children, wide }) => {
  if (!open) return null;
  return <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.55)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:16}} onClick={onClose}>
    <div style={{background:"white",borderRadius:16,width:"100%",maxWidth:wide?880:560,maxHeight:"92vh",overflow:"auto",boxShadow:"0 25px 60px rgba(0,0,0,.35)"}} onClick={e=>e.stopPropagation()}>
      <div style={{padding:"18px 24px",borderBottom:"1px solid #f1f5f9",display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,background:"white",zIndex:1}}>
        <h3 style={{margin:0,fontSize:17,fontWeight:700,color:"#0f172a"}}>{title}</h3>
        <button onClick={onClose} style={{background:"#f1f5f9",border:"none",borderRadius:8,padding:6,cursor:"pointer",display:"flex"}}><Icon n="x" s={15}/></button>
      </div>
      <div style={{padding:24}}>{children}</div>
    </div>
  </div>;
};

// ─── LOGIN ────────────────────────────────────────────────────────────────────
function Login({ onLogin }) {
  const [email,setEmail]=useState("admin@ampleleap.com");
  const [pass,setPass]=useState("admin123");
  const [err,setErr]=useState("");
  const [loading,setLoading]=useState(false);
  const go = async e => {
    e.preventDefault(); setLoading(true); setErr("");
    const r = await api.login(email,pass);
    if (r.token) { localStorage.setItem("crm_token",r.token); onLogin(r.user); }
    else { setErr(r.error||"Invalid credentials"); setLoading(false); }
  };
  return <div style={{minHeight:"100vh",background:"linear-gradient(135deg,#0f172a,#1e3a5f,#0f172a)",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"Inter,system-ui,sans-serif"}}>
    <div style={{background:"white",borderRadius:20,padding:"44px 40px",width:400,boxShadow:"0 25px 60px rgba(0,0,0,.4)"}}>
      <div style={{textAlign:"center",marginBottom:28}}>
        <div style={{width:52,height:52,background:"linear-gradient(135deg,#2563eb,#7c3aed)",borderRadius:14,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 14px",boxShadow:"0 8px 24px #2563eb44"}}>
          <svg width={26} height={26} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
        </div>
        <h1 style={{fontSize:22,fontWeight:800,color:"#0f172a",margin:0}}>Ample Leap CRM</h1>
        <p style={{color:"#64748b",marginTop:3,fontSize:13}}>Recruitment Joining Tracker</p>
      </div>
      {err && <div style={{background:"#fee2e2",color:"#991b1b",padding:"9px 12px",borderRadius:8,fontSize:13,marginBottom:14}}>{err}</div>}
      <form onSubmit={go}>
        <label style={{display:"block",fontSize:12,fontWeight:600,color:"#374151",marginBottom:4}}>Email</label>
        <input value={email} onChange={e=>setEmail(e.target.value)} type="email" required style={{width:"100%",padding:"10px 12px",borderRadius:8,border:"1.5px solid #e2e8f0",fontSize:14,marginBottom:14,boxSizing:"border-box",outline:"none"}}/>
        <label style={{display:"block",fontSize:12,fontWeight:600,color:"#374151",marginBottom:4}}>Password</label>
        <input value={pass} onChange={e=>setPass(e.target.value)} type="password" required style={{width:"100%",padding:"10px 12px",borderRadius:8,border:"1.5px solid #e2e8f0",fontSize:14,marginBottom:22,boxSizing:"border-box",outline:"none"}}/>
        <button type="submit" disabled={loading} style={{width:"100%",padding:"12px",background:"linear-gradient(135deg,#2563eb,#7c3aed)",color:"white",border:"none",borderRadius:10,fontWeight:700,fontSize:15,cursor:"pointer",opacity:loading?.7:1}}>
          {loading ? "Signing in…" : "Sign In"}
        </button>
      </form>
      <div style={{marginTop:18,padding:12,background:"#f8fafc",borderRadius:8,fontSize:11,color:"#64748b",lineHeight:1.6}}>
        <strong>Admin:</strong> admin@ampleleap.com / admin123<br/>
        <strong>Recruiter:</strong> recruiter@ampleleap.com / rec123
      </div>
    </div>
  </div>;
}

// ─── CANDIDATE FORM ───────────────────────────────────────────────────────────
function CandidateForm({ initial, masters, onSave, onCancel, saving }) {
  const blank = {clientName:"",designation:"",location:"",candidateName:"",actualDOJ:"",offerMonth:"",phone:"",resignationAcceptance:"Pending",proposedDOJ:"",ownerName:"",joiningStatus:"Offered",ctcPerMonth:"",statusCode:"Orange",notes:""};
  const [form,setForm] = useState(() => initial ? {
    clientName:initial.clientName||"", designation:initial.designation||"", location:initial.location||"",
    candidateName:initial.candidateName||"", actualDOJ:initial.actualDOJ?initial.actualDOJ.split("T")[0]:"",
    offerMonth:initial.offerMonth?initial.offerMonth.split("T")[0]:"", phone:initial.phone||"",
    resignationAcceptance:initial.resignationAcceptance||"Pending",
    proposedDOJ:initial.proposedDOJ?initial.proposedDOJ.split("T")[0]:"",
    ownerName:initial.ownerName||"", joiningStatus:initial.joiningStatus||"Offered",
    ctcPerMonth:initial.ctcPerMonth||"", statusCode:initial.statusCode||"Orange", notes:initial.notes||"",
  } : blank);
  const set = (k,v) => setForm(f=>({...f,[k]:v}));
  const F = (label,key,type="text",ph="") => <div style={{marginBottom:14}}>
    <label style={{display:"block",fontSize:11,fontWeight:600,color:"#475569",marginBottom:3,textTransform:"uppercase",letterSpacing:.4}}>{label}</label>
    <input type={type} value={form[key]||""} onChange={e=>set(key,e.target.value)} placeholder={ph} style={{width:"100%",padding:"8px 10px",borderRadius:7,border:"1.5px solid #e2e8f0",fontSize:13,boxSizing:"border-box",outline:"none"}}/>
  </div>;
  const S = (label,key,opts) => <div style={{marginBottom:14}}>
    <label style={{display:"block",fontSize:11,fontWeight:600,color:"#475569",marginBottom:3,textTransform:"uppercase",letterSpacing:.4}}>{label}</label>
    <select value={form[key]||""} onChange={e=>set(key,e.target.value)} style={{width:"100%",padding:"8px 10px",borderRadius:7,border:"1.5px solid #e2e8f0",fontSize:13,boxSizing:"border-box",outline:"none",background:"white"}}>
      <option value="">— Select —</option>
      {opts.map(o=><option key={o} value={o}>{o}</option>)}
    </select>
  </div>;
  return <div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 14px"}}>
      {S("Client Name","clientName",masters.clients||[])}
      {F("Designation","designation","text","e.g. Senior Manager")}
      {F("Location","location","text","e.g. Mumbai")}
      {F("Candidate Name","candidateName","text","Full name")}
      {F("Phone No.","phone","tel","10-digit")}
      {F("CTC Per Month (₹)","ctcPerMonth","number","e.g. 85000")}
      {F("Offer Month","offerMonth","date")}
      {F("Proposed DOJ","proposedDOJ","date")}
      {F("Actual DOJ","actualDOJ","date")}
      {S("Resignation","resignationAcceptance",masters.resignationStatus||[])}
      {S("Owner","ownerName",masters.owners||[])}
      {S("Joining Status","joiningStatus",masters.joiningStatus||[])}
      {S("Status Code","statusCode",(masters.statusCodes||[]).map(s=>s.code||s))}
    </div>
    <div style={{marginBottom:14}}>
      <label style={{display:"block",fontSize:11,fontWeight:600,color:"#475569",marginBottom:3,textTransform:"uppercase",letterSpacing:.4}}>Notes</label>
      <textarea value={form.notes||""} onChange={e=>set("notes",e.target.value)} rows={2} style={{width:"100%",padding:"8px 10px",borderRadius:7,border:"1.5px solid #e2e8f0",fontSize:13,boxSizing:"border-box",outline:"none",resize:"vertical"}}/>
    </div>
    <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
      <button onClick={onCancel} style={{padding:"9px 18px",background:"#f1f5f9",border:"none",borderRadius:8,fontWeight:600,cursor:"pointer",fontSize:13}}>Cancel</button>
      <button onClick={()=>onSave(form)} disabled={saving} style={{padding:"9px 18px",background:"linear-gradient(135deg,#2563eb,#7c3aed)",color:"white",border:"none",borderRadius:8,fontWeight:600,cursor:"pointer",fontSize:13,opacity:saving?.7:1}}>
        {saving?"Saving…":"Save Candidate"}
      </button>
    </div>
  </div>;
}

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
function Dashboard() {
  const [s,setS]=useState(null);
  const [loading,setLoading]=useState(true);
  useEffect(()=>{api.getDashboard().then(d=>{setS(d);setLoading(false);}).catch(()=>setLoading(false));},[]);
  if(loading) return <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:200,gap:12}}><Spin/><span style={{color:"#94a3b8",fontSize:13}}>Loading dashboard…</span></div>;
  if(!s) return <div style={{color:"#ef4444",padding:20}}>Failed to load dashboard.</div>;
  const cards = [
    {l:"Total Candidates",v:s.total,c:"#2563eb"},
    {l:"Offered",v:s.offered,c:"#f97316"},
    {l:"Joined",v:s.joined,c:"#22c55e"},
    {l:"Resignation Pending",v:s.resPending,c:"#ef4444"},
    {l:"Joining This Month",v:s.thisMonth,c:"#8b5cf6"},
    {l:"Joining Next Month",v:s.nextMonth,c:"#06b6d4"},
  ];
  const statusDist = (s.statusGroups||[]).filter(x=>x.joiningStatus&&x._count>0).map(x=>({label:x.joiningStatus,value:x._count,color:SC[x.joiningStatus]||"#94a3b8"}));
  const clientDist = (s.clientGroups||[]).filter(x=>x.clientName).map(x=>({label:x.clientName.length>9?x.clientName.slice(0,9)+"…":x.clientName,value:x._count,color:"#3b82f6"}));
  const monthTrend = (s.months||[]).map(m=>({label:m.label,value:m.value,color:"#22c55e"}));
  return <div>
    <div style={{marginBottom:22}}>
      <h2 style={{fontSize:20,fontWeight:800,color:"#0f172a",margin:0}}>Dashboard</h2>
      <p style={{color:"#64748b",margin:"3px 0 0",fontSize:13}}>Live recruitment overview · synced across all devices</p>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(150px,1fr))",gap:12,marginBottom:24}}>
      {cards.map(c=><div key={c.l} style={{background:"white",borderRadius:12,padding:16,boxShadow:"0 1px 3px rgba(0,0,0,.06)",border:"1px solid #f1f5f9"}}>
        <div style={{fontSize:26,fontWeight:800,color:c.c}}>{c.v??0}</div>
        <div style={{fontSize:11,color:"#64748b",marginTop:2,fontWeight:500,lineHeight:1.3}}>{c.l}</div>
        <div style={{width:28,height:3,background:c.c,borderRadius:2,marginTop:8,opacity:.4}}/>
      </div>)}
    </div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:14,marginBottom:20}}>
      <div style={{background:"white",borderRadius:12,padding:18,boxShadow:"0 1px 3px rgba(0,0,0,.06)",border:"1px solid #f1f5f9"}}>
        <div style={{fontSize:12,fontWeight:700,color:"#0f172a",marginBottom:8}}>Joining Status</div>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <Donut data={statusDist} size={85}/>
          <div style={{flex:1,overflow:"hidden"}}>
            {statusDist.slice(0,6).map(s=><div key={s.label} style={{display:"flex",alignItems:"center",gap:5,marginBottom:3}}>
              <div style={{width:7,height:7,borderRadius:"50%",background:s.color,flexShrink:0}}/>
              <span style={{fontSize:10,color:"#475569",flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{s.label}</span>
              <span style={{fontSize:10,fontWeight:700,color:"#0f172a"}}>{s.value}</span>
            </div>)}
          </div>
        </div>
      </div>
      <div style={{background:"white",borderRadius:12,padding:18,boxShadow:"0 1px 3px rgba(0,0,0,.06)",border:"1px solid #f1f5f9"}}>
        <div style={{fontSize:12,fontWeight:700,color:"#0f172a",marginBottom:4}}>Top Clients</div>
        <MiniBar data={clientDist} height={75}/>
      </div>
      <div style={{background:"white",borderRadius:12,padding:18,boxShadow:"0 1px 3px rgba(0,0,0,.06)",border:"1px solid #f1f5f9"}}>
        <div style={{fontSize:12,fontWeight:700,color:"#0f172a",marginBottom:4}}>Monthly Joining Trend</div>
        <MiniBar data={monthTrend} height={75}/>
      </div>
    </div>
  </div>;
}

// ─── CANDIDATES ───────────────────────────────────────────────────────────────
function Candidates({ masters, user, onAdd, onEdit, onDelete, onView }) {
  const [result,setResult]=useState({candidates:[],total:0,pages:1});
  const [search,setSearch]=useState("");
  const [filters,setFilters]=useState({client:"",owner:"",status:"",statusCode:"",location:""});
  const [page,setPage]=useState(1);
  const [loading,setLoading]=useState(true);
  const [showF,setShowF]=useState(false);
  const searchRef = useRef();
  const PER = 20;

  const load = useCallback(async (p=page, s=search, f=filters) => {
    setLoading(true);
    const params = {page:p, limit:PER, sortBy:"id", sortDir:"desc"};
    if(s) params.search=s;
    if(f.client) params.client=f.client;
    if(f.owner) params.owner=f.owner;
    if(f.status) params.status=f.status;
    if(f.statusCode) params.statusCode=f.statusCode;
    if(f.location) params.location=f.location;
    try { const res=await api.getCandidates(params); setResult(res||{candidates:[],total:0,pages:1}); }
    catch(e) { console.error(e); }
    setLoading(false);
  },[]);

  // Debounced search
  useEffect(()=>{
    const t = setTimeout(()=>{ load(1,search,filters); setPage(1); },400);
    return ()=>clearTimeout(t);
  },[search]);

  useEffect(()=>{ load(page,search,filters); },[page,filters]);

  const setFilter=(k,v)=>{ const nf={...filters,[k]:v}; setFilters(nf); setPage(1); load(1,search,nf); };
  const clearFilters=()=>{ const nf={client:"",owner:"",status:"",statusCode:"",location:""}; setFilters(nf); setPage(1); load(1,search,nf); };
  const activeF = Object.values(filters).filter(Boolean).length;
  const canEdit = user.role!=="viewer";
  const canDel = user.role==="admin";

  const exportCSV=()=>{
    const cols=["ID","Client","Designation","Location","Candidate","Phone","Offer Month","Proposed DOJ","Actual DOJ","Resignation","Owner","Status","CTC","Code","Notes"];
    const rows=(result.candidates||[]).map(c=>[c.id,c.clientName,c.designation,c.location,c.candidateName,c.phone,c.offerMonth,c.proposedDOJ,c.actualDOJ,c.resignationAcceptance,c.ownerName,c.joiningStatus,c.ctcPerMonth,c.statusCode,c.notes]);
    const csv=[cols,...rows].map(r=>r.map(v=>`"${v||""}"`).join(",")).join("\n");
    const a=document.createElement("a");a.href="data:text/csv;charset=utf-8,"+encodeURIComponent(csv);a.download="candidates.csv";a.click();
  };

  return <div>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18,flexWrap:"wrap",gap:10}}>
      <div>
        <h2 style={{fontSize:20,fontWeight:800,color:"#0f172a",margin:0}}>Candidates</h2>
        <p style={{color:"#64748b",margin:"3px 0 0",fontSize:13}}>{result.total} records in database</p>
      </div>
      <div style={{display:"flex",gap:7,flexWrap:"wrap"}}>
        <button onClick={()=>load(page,search,filters)} style={{display:"flex",alignItems:"center",gap:5,padding:"8px 12px",background:"#f1f5f9",border:"none",borderRadius:8,fontWeight:600,cursor:"pointer",fontSize:12,color:"#374151"}}>
          <Icon n="refresh" s={13}/> Refresh
        </button>
        {canEdit&&<button onClick={onAdd} style={{display:"flex",alignItems:"center",gap:5,padding:"8px 14px",background:"linear-gradient(135deg,#2563eb,#7c3aed)",color:"white",border:"none",borderRadius:8,fontWeight:600,cursor:"pointer",fontSize:12}}>
          <Icon n="plus" s={13}/> Add Candidate
        </button>}
        <button onClick={exportCSV} style={{display:"flex",alignItems:"center",gap:5,padding:"8px 12px",background:"#f1f5f9",border:"none",borderRadius:8,fontWeight:600,cursor:"pointer",fontSize:12,color:"#374151"}}>
          <Icon n="dl" s={13}/> Export CSV
        </button>
      </div>
    </div>

    <div style={{background:"white",borderRadius:10,padding:12,marginBottom:14,boxShadow:"0 1px 3px rgba(0,0,0,.06)",border:"1px solid #f1f5f9"}}>
      <div style={{display:"flex",gap:8,marginBottom:showF?10:0,flexWrap:"wrap"}}>
        <div style={{flex:1,minWidth:180,display:"flex",alignItems:"center",gap:7,background:"#f8fafc",borderRadius:7,padding:"7px 10px",border:"1.5px solid #e2e8f0"}}>
          <Icon n="search" s={13}/>
          <input ref={searchRef} value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search name, client, phone…" style={{border:"none",background:"none",outline:"none",fontSize:13,width:"100%"}}/>
          {search&&<button onClick={()=>{setSearch("");load(1,"",filters);}} style={{border:"none",background:"none",cursor:"pointer",color:"#94a3b8",display:"flex",padding:0}}><Icon n="x" s={11}/></button>}
        </div>
        <button onClick={()=>setShowF(f=>!f)} style={{display:"flex",alignItems:"center",gap:5,padding:"7px 12px",background:activeF>0?"#eff6ff":"#f8fafc",border:"1.5px solid "+(activeF>0?"#bfdbfe":"#e2e8f0"),borderRadius:7,cursor:"pointer",fontSize:12,fontWeight:600,color:activeF>0?"#1d4ed8":"#374151"}}>
          <Icon n="filter" s={12}/> Filters {activeF>0&&`(${activeF})`}
        </button>
      </div>
      {showF&&<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(140px,1fr))",gap:7}}>
        {[["Client",filters.client,v=>setFilter("client",v),masters.clients||[]],
          ["Owner",filters.owner,v=>setFilter("owner",v),masters.owners||[]],
          ["Status",filters.status,v=>setFilter("status",v),masters.joiningStatus||[]],
          ["Code",filters.statusCode,v=>setFilter("statusCode",v),(masters.statusCodes||[]).map(s=>s.code||s)],
        ].map(([l,val,fn,opts])=><div key={l}>
          <label style={{fontSize:10,fontWeight:600,color:"#64748b",display:"block",marginBottom:2}}>{l}</label>
          <select value={val} onChange={e=>fn(e.target.value)} style={{width:"100%",padding:"6px 8px",borderRadius:6,border:"1.5px solid #e2e8f0",fontSize:12,background:"white",outline:"none"}}>
            <option value="">All</option>
            {opts.map(o=><option key={o} value={o}>{o}</option>)}
          </select>
        </div>)}
        <div>
          <label style={{fontSize:10,fontWeight:600,color:"#64748b",display:"block",marginBottom:2}}>Location</label>
          <input value={filters.location} onChange={e=>setFilter("location",e.target.value)} placeholder="City…" style={{width:"100%",padding:"6px 8px",borderRadius:6,border:"1.5px solid #e2e8f0",fontSize:12,boxSizing:"border-box",outline:"none"}}/>
        </div>
        {activeF>0&&<div style={{display:"flex",alignItems:"flex-end"}}>
          <button onClick={clearFilters} style={{width:"100%",padding:"6px 8px",borderRadius:6,border:"1.5px solid #fecaca",background:"#fef2f2",color:"#dc2626",fontSize:12,fontWeight:600,cursor:"pointer"}}>Clear All</button>
        </div>}
      </div>}
    </div>

    <div style={{background:"white",borderRadius:10,boxShadow:"0 1px 3px rgba(0,0,0,.06)",border:"1px solid #f1f5f9",overflow:"auto"}}>
      {loading ? <div style={{padding:50,textAlign:"center"}}><Spin/><div style={{marginTop:10,color:"#94a3b8",fontSize:13}}>Loading…</div></div> :
      <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
        <thead><tr style={{background:"#f8fafc",borderBottom:"1.5px solid #e2e8f0"}}>
          {[["#",40],["Client",120],["Candidate",140],["Position",120],["Location",80],["Phone",100],["Offer Mth",95],["Prop DOJ",95],["Owner",100],["Status",90],["CTC",85],["Code",65],["",85]].map(([l,w])=>
            <th key={l} style={{padding:"9px 10px",textAlign:"left",fontWeight:700,color:"#475569",fontSize:10,textTransform:"uppercase",letterSpacing:.4,minWidth:w,whiteSpace:"nowrap"}}>{l}</th>)}
        </tr></thead>
        <tbody>
          {!(result.candidates||[]).length&&<tr><td colSpan={13} style={{padding:40,textAlign:"center",color:"#94a3b8"}}>No candidates found.</td></tr>}
          {(result.candidates||[]).map((c,i)=><tr key={c.id}
            style={{borderBottom:"1px solid #f8fafc",background:i%2?"#fcfcfd":"white",transition:"background .1s"}}
            onMouseEnter={e=>e.currentTarget.style.background="#f0f9ff"}
            onMouseLeave={e=>e.currentTarget.style.background=i%2?"#fcfcfd":"white"}>
            <td style={{padding:"9px 10px",color:"#94a3b8",fontWeight:600,fontSize:11}}>{c.id}</td>
            <td style={{padding:"9px 10px",fontWeight:600,color:"#1e293b",maxWidth:120,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.clientName||"—"}</td>
            <td style={{padding:"9px 10px"}}>
              <div style={{fontWeight:600,color:"#0f172a",maxWidth:130,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.candidateName}</div>
              {c.phone&&<div style={{fontSize:10,color:"#94a3b8"}}>{c.phone}</div>}
            </td>
            <td style={{padding:"9px 10px",color:"#475569",maxWidth:120,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.designation||"—"}</td>
            <td style={{padding:"9px 10px",color:"#475569",whiteSpace:"nowrap"}}>{c.location||"—"}</td>
            <td style={{padding:"9px 10px",color:"#64748b",fontFamily:"monospace",fontSize:11}}>{c.phone||"—"}</td>
            <td style={{padding:"9px 10px",color:"#64748b",whiteSpace:"nowrap"}}>{fmtD(c.offerMonth)}</td>
            <td style={{padding:"9px 10px",color:"#64748b",whiteSpace:"nowrap"}}>{fmtD(c.proposedDOJ)}</td>
            <td style={{padding:"9px 10px",color:"#475569",whiteSpace:"nowrap"}}>{c.ownerName||"—"}</td>
            <td style={{padding:"9px 10px"}}><Badge status={c.joiningStatus}/></td>
            <td style={{padding:"9px 10px",color:"#0f172a",fontWeight:600,whiteSpace:"nowrap"}}>₹{fmt(c.ctcPerMonth)}</td>
            <td style={{padding:"9px 10px"}}><Badge code={c.statusCode}/></td>
            <td style={{padding:"9px 10px"}}>
              <div style={{display:"flex",gap:3}}>
                <button onClick={()=>onView(c)} title="View" style={{padding:4,background:"#f0f9ff",border:"none",borderRadius:5,cursor:"pointer",color:"#2563eb",display:"flex"}}><Icon n="eye" s={12}/></button>
                {canEdit&&<button onClick={()=>onEdit(c)} title="Edit" style={{padding:4,background:"#f0fdf4",border:"none",borderRadius:5,cursor:"pointer",color:"#16a34a",display:"flex"}}><Icon n="edit" s={12}/></button>}
                {canDel&&<button onClick={()=>onDelete(c.id,()=>load(page,search,filters))} title="Delete" style={{padding:4,background:"#fef2f2",border:"none",borderRadius:5,cursor:"pointer",color:"#dc2626",display:"flex"}}><Icon n="trash" s={12}/></button>}
              </div>
            </td>
          </tr>)}
        </tbody>
      </table>}
    </div>

    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:12,flexWrap:"wrap",gap:8}}>
      <span style={{fontSize:12,color:"#64748b"}}>Page {page} of {result.pages||1} · {result.total||0} total</span>
      <div style={{display:"flex",gap:3}}>
        <button onClick={()=>{setPage(1);load(1,search,filters);}} disabled={page<=1} style={{padding:"5px 10px",border:"1.5px solid #e2e8f0",borderRadius:6,background:"white",cursor:page<=1?"not-allowed":"pointer",fontSize:12,opacity:page<=1?.4:1}}>«</button>
        <button onClick={()=>{const p=page-1;setPage(p);load(p,search,filters);}} disabled={page<=1} style={{padding:"5px 10px",border:"1.5px solid #e2e8f0",borderRadius:6,background:"white",cursor:page<=1?"not-allowed":"pointer",fontSize:12,opacity:page<=1?.4:1}}>‹ Prev</button>
        <span style={{padding:"5px 12px",background:"#2563eb",color:"white",borderRadius:6,fontSize:12,fontWeight:700}}>{page}</span>
        <button onClick={()=>{const p=page+1;setPage(p);load(p,search,filters);}} disabled={page>=result.pages} style={{padding:"5px 10px",border:"1.5px solid #e2e8f0",borderRadius:6,background:"white",cursor:page>=result.pages?"not-allowed":"pointer",fontSize:12,opacity:page>=result.pages?.4:1}}>Next ›</button>
        <button onClick={()=>{setPage(result.pages);load(result.pages,search,filters);}} disabled={page>=result.pages} style={{padding:"5px 10px",border:"1.5px solid #e2e8f0",borderRadius:6,background:"white",cursor:page>=result.pages?"not-allowed":"pointer",fontSize:12,opacity:page>=result.pages?.4:1}}>»</button>
      </div>
    </div>
    <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
  </div>;
}

// ─── VIEW CANDIDATE ───────────────────────────────────────────────────────────
function ViewCandidate({ c }) {
  if(!c) return null;
  const R=(l,v)=><div style={{display:"flex",borderBottom:"1px solid #f8fafc",padding:"9px 0"}}>
    <div style={{width:170,fontSize:11,fontWeight:700,color:"#64748b",textTransform:"uppercase",letterSpacing:.4,flexShrink:0}}>{l}</div>
    <div style={{fontSize:13,color:"#0f172a",fontWeight:500}}>{v||"—"}</div>
  </div>;
  return <div>
    <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:18,paddingBottom:18,borderBottom:"1px solid #f1f5f9"}}>
      <div style={{width:50,height:50,borderRadius:12,background:"linear-gradient(135deg,#2563eb22,#7c3aed22)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,fontWeight:800,color:"#2563eb",flexShrink:0}}>
        {c.candidateName?.[0]?.toUpperCase()}
      </div>
      <div>
        <h3 style={{margin:0,fontSize:18,fontWeight:800,color:"#0f172a"}}>{c.candidateName}</h3>
        <p style={{margin:"2px 0 0",color:"#64748b",fontSize:12}}>{c.designation} · {c.clientName}</p>
        <div style={{display:"flex",gap:5,marginTop:5}}><Badge status={c.joiningStatus}/><Badge code={c.statusCode}/></div>
      </div>
    </div>
    {R("Client",c.clientName)}{R("Designation",c.designation)}{R("Location",c.location)}
    {R("Phone",c.phone)}{R("Offer Month",fmtD(c.offerMonth))}{R("Proposed DOJ",fmtD(c.proposedDOJ))}
    {R("Actual DOJ",fmtD(c.actualDOJ))}{R("Resignation",c.resignationAcceptance)}{R("Owner",c.ownerName)}
    {R("CTC Per Month",c.ctcPerMonth?`₹${fmt(c.ctcPerMonth)}`:"—")}{R("Notes",c.notes)}
  </div>;
}

// ─── ENHANCED MASTERS PAGE ───────────────────────────────────────────────────
function Masters({ masters, reload }) {
  const [tab, setTab] = useState("clients");
  const [val, setVal] = useState("");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ text: "", type: "success" });
  const [editId, setEditId] = useState(null);
  const [editVal, setEditVal] = useState("");
  const [showUserForm, setShowUserForm] = useState(false);
  const [newUser, setNewUser] = useState({ name: "", email: "", password: "", role: "recruiter" });
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [newCode, setNewCode] = useState({ code: "", label: "", color: "#3b82f6" });
  const [savingCode, setSavingCode] = useState(false);

  const tabs = [
    { k: "clients", l: "Clients" },
    { k: "owners", l: "Owners" },
    { k: "joiningStatus", l: "Joining Status" },
    { k: "resignationStatus", l: "Resignation" },
    { k: "locations", l: "Locations" },
    { k: "designations", l: "Designations" },
    { k: "statusCodes", l: "Status Codes" },
    { k: "users", l: "👥 Users" },
  ];

  const showMsg = (text, type = "success") => { setMsg({ text, type }); setTimeout(() => setMsg({ text: "", type: "success" }), 3000); };

  const loadUsers = async () => {
    setLoadingUsers(true);
    try { const r = await fetch(`${BASE_URL}/users`, { headers: H() }); setUsers(await r.json()); }
    catch (e) { console.error(e); }
    setLoadingUsers(false);
  };

  useEffect(() => { if (tab === "users") loadUsers(); }, [tab]);

  const addItem = async () => {
    if (!val.trim()) return;
    setSaving(true);
    try {
      const r = await api.addMaster(tab, val.trim());
      if (r.error) { showMsg(r.error, "error"); }
      else { showMsg(`✅ "${val.trim()}" added!`); setVal(""); reload(); }
    } catch (e) { showMsg(e.message, "error"); }
    setSaving(false);
  };

  const deleteItem = async (id, value) => {
    if (!window.confirm(`Delete "${value}"?`)) return;
    try {
      const r = await fetch(`${BASE_URL}/masters/${id}`, { method: "DELETE", headers: H() });
      const data = await r.json();
      if (data.error) showMsg(data.error, "error");
      else { showMsg(`🗑️ "${value}" deleted!`); reload(); }
    } catch (e) { showMsg(e.message, "error"); }
  };

  const startEdit = (id, value) => { setEditId(id); setEditVal(value); };

  const saveEdit = async (id) => {
    if (!editVal.trim()) return;
    try {
      const r = await fetch(`${BASE_URL}/masters/${id}`, { method: "PUT", headers: H(), body: JSON.stringify({ value: editVal }) });
      const data = await r.json();
      if (data.error) showMsg(data.error, "error");
      else { showMsg("✅ Updated!"); setEditId(null); reload(); }
    } catch (e) { showMsg(e.message, "error"); }
  };

  const addUser = async () => {
    if (!newUser.name || !newUser.email || !newUser.password) { showMsg("All fields required", "error"); return; }
    setSaving(true);
    try {
      const r = await fetch(`${BASE_URL}/users`, { method: "POST", headers: H(), body: JSON.stringify(newUser) });
      const data = await r.json();
      if (data.error) showMsg(data.error, "error");
      else { showMsg(`✅ User "${newUser.name}" created!`); setNewUser({ name: "", email: "", password: "", role: "recruiter" }); setShowUserForm(false); loadUsers(); }
    } catch (e) { showMsg(e.message, "error"); }
    setSaving(false);
  };

  const toggleUser = async (id, active, name) => {
    if (!window.confirm(`${active ? "Deactivate" : "Activate"} "${name}"?`)) return;
    try {
      const r = await fetch(`${BASE_URL}/users/${id}`, { method: "PUT", headers: H(), body: JSON.stringify({ active: !active }) });
      const data = await r.json();
      if (data.error) showMsg(data.error, "error");
      else { showMsg(`✅ User ${active ? "deactivated" : "activated"}!`); loadUsers(); }
    } catch (e) { showMsg(e.message, "error"); }
  };

  const changeRole = async (id, role, name) => {
    try {
      const r = await fetch(`${BASE_URL}/users/${id}`, { method: "PUT", headers: H(), body: JSON.stringify({ role }) });
      const data = await r.json();
      if (data.error) showMsg(data.error, "error");
      else { showMsg(`✅ ${name}'s role changed to ${role}!`); loadUsers(); }
    } catch (e) { showMsg(e.message, "error"); }
  };

  const addStatusCode = async () => {
    if (!newCode.code || !newCode.label || !newCode.color) { showMsg("All fields required", "error"); return; }
    setSavingCode(true);
    try {
      const r = await fetch(`${BASE_URL}/masters/status-codes`, { method: "POST", headers: H(), body: JSON.stringify(newCode) });
      const data = await r.json();
      if (data.error) showMsg(data.error, "error");
      else { showMsg(`✅ Status code "${newCode.code}" saved!`); setNewCode({ code: "", label: "", color: "#3b82f6" }); reload(); }
    } catch (e) { showMsg(e.message, "error"); }
    setSavingCode(false);
  };

  const deleteStatusCode = async (code) => {
    if (!window.confirm(`Delete status code "${code}"?`)) return;
    try {
      const r = await fetch(`${BASE_URL}/masters/status-codes`, { method: "DELETE", headers: H(), body: JSON.stringify({ code }) });
      const data = await r.json();
      if (data.error) showMsg(data.error, "error");
      else { showMsg(`🗑️ "${code}" deleted!`); reload(); }
    } catch (e) { showMsg(e.message, "error"); }
  };

  const fullItems = masters._full?.[tab] || [];
  const isSpecial = tab === "statusCodes" || tab === "users";

  const B = (props) => <button {...props} style={{ ...props.style, cursor: "pointer", border: "none", fontFamily: "inherit" }}>{props.children}</button>;

  return <div>
    <div style={{ marginBottom: 20 }}>
      <h2 style={{ fontSize: 20, fontWeight: 800, color: "#0f172a", margin: 0 }}>Master Data</h2>
      <p style={{ color: "#64748b", margin: "3px 0 0", fontSize: 13 }}>Manage all dropdown values, status codes and team members.</p>
    </div>

    {msg.text && <div style={{ background: msg.type === "error" ? "#fee2e2" : "#dcfce7", color: msg.type === "error" ? "#991b1b" : "#166534", padding: "10px 16px", borderRadius: 8, marginBottom: 16, fontSize: 13, fontWeight: 600 }}>{msg.text}</div>}

    {/* Tabs */}
    <div style={{ display: "flex", gap: 5, marginBottom: 18, flexWrap: "wrap" }}>
      {tabs.map(t => <B key={t.k} onClick={() => setTab(t.k)} style={{ padding: "7px 13px", borderRadius: 7, background: tab === t.k ? "#2563eb" : "white", color: tab === t.k ? "white" : "#374151", fontWeight: 600, fontSize: 12, border: `1.5px solid ${tab === t.k ? "#2563eb" : "#e2e8f0"}` }}>{t.l}</B>)}
    </div>

    {/* STATUS CODES TAB */}
    {tab === "statusCodes" && <div>
      <div style={{ background: "white", borderRadius: 12, padding: 20, boxShadow: "0 1px 3px rgba(0,0,0,.06)", border: "1px solid #f1f5f9", marginBottom: 16 }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", margin: "0 0 14px" }}>Add / Edit Status Code</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr auto auto", gap: 8, alignItems: "flex-end" }}>
          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: "#475569", display: "block", marginBottom: 3 }}>CODE</label>
            <input value={newCode.code} onChange={e => setNewCode(n => ({ ...n, code: e.target.value }))} placeholder="e.g. Purple" style={{ width: "100%", padding: "8px 10px", borderRadius: 7, border: "1.5px solid #e2e8f0", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
          </div>
          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: "#475569", display: "block", marginBottom: 3 }}>LABEL</label>
            <input value={newCode.label} onChange={e => setNewCode(n => ({ ...n, label: e.target.value }))} placeholder="e.g. Special Case" style={{ width: "100%", padding: "8px 10px", borderRadius: 7, border: "1.5px solid #e2e8f0", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
          </div>
          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: "#475569", display: "block", marginBottom: 3 }}>COLOR</label>
            <input type="color" value={newCode.color} onChange={e => setNewCode(n => ({ ...n, color: e.target.value }))} style={{ width: 44, height: 36, borderRadius: 7, border: "1.5px solid #e2e8f0", cursor: "pointer", padding: 2 }} />
          </div>
          <B onClick={addStatusCode} disabled={savingCode} style={{ padding: "8px 14px", background: "#2563eb", color: "white", borderRadius: 7, fontWeight: 700, fontSize: 12 }}>
            {savingCode ? "Saving…" : "Save"}
          </B>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))", gap: 10 }}>
        {(masters.statusCodes || []).map(s => <div key={s.code} style={{ background: "white", borderRadius: 10, padding: "14px 16px", border: `2px solid ${s.color}44`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 16, height: 16, borderRadius: "50%", background: s.color, flexShrink: 0, boxShadow: `0 0 6px ${s.color}66` }} />
            <div>
              <div style={{ fontWeight: 700, fontSize: 13, color: s.color }}>{s.code}</div>
              <div style={{ fontSize: 11, color: "#64748b", marginTop: 1 }}>{s.label}</div>
            </div>
          </div>
          <B onClick={() => deleteStatusCode(s.code)} style={{ padding: "4px 8px", background: "#fef2f2", color: "#dc2626", borderRadius: 6, fontSize: 11, fontWeight: 600 }}>Delete</B>
        </div>)}
      </div>
    </div>}

    {/* USERS TAB */}
    {tab === "users" && <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", margin: 0 }}>Team Members ({users.length})</h3>
        <B onClick={() => setShowUserForm(f => !f)} style={{ padding: "8px 14px", background: "linear-gradient(135deg,#2563eb,#7c3aed)", color: "white", borderRadius: 8, fontWeight: 600, fontSize: 12, display: "flex", alignItems: "center", gap: 5 }}>
          + Add Team Member
        </B>
      </div>

      {showUserForm && <div style={{ background: "white", borderRadius: 12, padding: 20, boxShadow: "0 1px 3px rgba(0,0,0,.06)", border: "1px solid #f1f5f9", marginBottom: 16 }}>
        <h4 style={{ margin: "0 0 14px", fontSize: 13, fontWeight: 700, color: "#0f172a" }}>New Team Member</h4>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 12px" }}>
          {[["Full Name", "name", "text", "e.g. Rahul Sharma"], ["Email", "email", "email", "e.g. rahul@ampleleap.com"], ["Password", "password", "password", "min 6 characters"]].map(([l, k, t, p]) => <div key={k} style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 11, fontWeight: 600, color: "#475569", display: "block", marginBottom: 3, textTransform: "uppercase" }}>{l}</label>
            <input type={t} value={newUser[k]} onChange={e => setNewUser(u => ({ ...u, [k]: e.target.value }))} placeholder={p} style={{ width: "100%", padding: "8px 10px", borderRadius: 7, border: "1.5px solid #e2e8f0", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
          </div>)}
          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 11, fontWeight: 600, color: "#475569", display: "block", marginBottom: 3, textTransform: "uppercase" }}>Role</label>
            <select value={newUser.role} onChange={e => setNewUser(u => ({ ...u, role: e.target.value }))} style={{ width: "100%", padding: "8px 10px", borderRadius: 7, border: "1.5px solid #e2e8f0", fontSize: 13, outline: "none", background: "white" }}>
              <option value="admin">Admin</option>
              <option value="recruiter">Recruiter</option>
              <option value="viewer">Viewer</option>
            </select>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <B onClick={() => setShowUserForm(false)} style={{ padding: "8px 16px", background: "#f1f5f9", color: "#374151", borderRadius: 7, fontWeight: 600, fontSize: 12 }}>Cancel</B>
          <B onClick={addUser} disabled={saving} style={{ padding: "8px 16px", background: "linear-gradient(135deg,#2563eb,#7c3aed)", color: "white", borderRadius: 7, fontWeight: 600, fontSize: 12 }}>
            {saving ? "Creating…" : "Create User"}
          </B>
        </div>
      </div>}

      {loadingUsers ? <div style={{ padding: 30, textAlign: "center" }}><Spin /></div> :
        <div style={{ background: "white", borderRadius: 12, overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,.06)", border: "1px solid #f1f5f9" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead><tr style={{ background: "#f8fafc", borderBottom: "1.5px solid #e2e8f0" }}>
              {["Name", "Email", "Role", "Status", "Actions"].map(h => <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: .4 }}>{h}</th>)}
            </tr></thead>
            <tbody>
              {users.map((u, i) => <tr key={u.id} style={{ borderBottom: "1px solid #f8fafc", background: i % 2 ? "#fcfcfd" : "white" }}>
                <td style={{ padding: "10px 14px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 28, height: 28, borderRadius: 7, background: "linear-gradient(135deg,#2563eb,#7c3aed)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, color: "white", flexShrink: 0 }}>{u.name[0]}</div>
                    <span style={{ fontWeight: 600, color: "#0f172a" }}>{u.name}</span>
                  </div>
                </td>
                <td style={{ padding: "10px 14px", color: "#64748b" }}>{u.email}</td>
                <td style={{ padding: "10px 14px" }}>
                  <select value={u.role} onChange={e => changeRole(u.id, e.target.value, u.name)} style={{ padding: "4px 8px", borderRadius: 6, border: "1.5px solid #e2e8f0", fontSize: 12, background: "white", outline: "none", cursor: "pointer" }}>
                    <option value="admin">Admin</option>
                    <option value="recruiter">Recruiter</option>
                    <option value="viewer">Viewer</option>
                  </select>
                </td>
                <td style={{ padding: "10px 14px" }}>
                  <span style={{ padding: "3px 8px", borderRadius: 10, fontSize: 11, fontWeight: 600, background: u.active ? "#dcfce7" : "#fee2e2", color: u.active ? "#16a34a" : "#dc2626" }}>
                    {u.active ? "Active" : "Inactive"}
                  </span>
                </td>
                <td style={{ padding: "10px 14px" }}>
                  <B onClick={() => toggleUser(u.id, u.active, u.name)} style={{ padding: "4px 10px", background: u.active ? "#fef2f2" : "#f0fdf4", color: u.active ? "#dc2626" : "#16a34a", borderRadius: 6, fontSize: 11, fontWeight: 600 }}>
                    {u.active ? "Deactivate" : "Activate"}
                  </B>
                </td>
              </tr>)}
            </tbody>
          </table>
        </div>}
    </div>}

    {/* REGULAR TABS */}
    {!isSpecial && <div style={{ background: "white", borderRadius: 12, padding: 20, boxShadow: "0 1px 3px rgba(0,0,0,.06)", border: "1px solid #f1f5f9", maxWidth: 560 }}>
      <div style={{ display: "flex", gap: 7, marginBottom: 16 }}>
        <input value={val} onChange={e => setVal(e.target.value)} onKeyDown={e => e.key === "Enter" && addItem()} placeholder={`Add new ${tabs.find(t => t.k === tab)?.l?.replace(/s$/, "") || "item"}…`} style={{ flex: 1, padding: "8px 12px", borderRadius: 7, border: "1.5px solid #e2e8f0", fontSize: 13, outline: "none" }} />
        <B onClick={addItem} disabled={saving} style={{ padding: "8px 14px", background: "#2563eb", color: "white", borderRadius: 7, fontWeight: 700, fontSize: 12, display: "flex", alignItems: "center", gap: 4 }}>
          + {saving ? "Adding…" : "Add"}
        </B>
      </div>
      <div style={{ maxHeight: 420, overflow: "auto" }}>
        {fullItems.length === 0 && <div style={{ textAlign: "center", color: "#94a3b8", padding: 24, fontSize: 13 }}>No items yet. Add one above!</div>}
        {fullItems.map((item, i) => <div key={item.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "9px 12px", background: i % 2 ? "#f8fafc" : "white", borderRadius: 7, marginBottom: 4, border: "1px solid #f1f5f9" }}>
          {editId === item.id ? <div style={{ display: "flex", gap: 6, flex: 1 }}>
            <input value={editVal} onChange={e => setEditVal(e.target.value)} onKeyDown={e => e.key === "Enter" && saveEdit(item.id)} autoFocus style={{ flex: 1, padding: "5px 8px", borderRadius: 6, border: "1.5px solid #2563eb", fontSize: 13, outline: "none" }} />
            <B onClick={() => saveEdit(item.id)} style={{ padding: "5px 10px", background: "#2563eb", color: "white", borderRadius: 6, fontSize: 11, fontWeight: 700 }}>Save</B>
            <B onClick={() => setEditId(null)} style={{ padding: "5px 10px", background: "#f1f5f9", color: "#374151", borderRadius: 6, fontSize: 11, fontWeight: 600 }}>Cancel</B>
          </div> : <>
            <span style={{ fontSize: 13, color: "#1e293b", fontWeight: 500, flex: 1 }}>{item.value}</span>
            <div style={{ display: "flex", gap: 5 }}>
              <B onClick={() => startEdit(item.id, item.value)} style={{ padding: "4px 8px", background: "#f0f9ff", color: "#2563eb", borderRadius: 6, fontSize: 11, fontWeight: 600 }}>Edit</B>
              <B onClick={() => deleteItem(item.id, item.value)} style={{ padding: "4px 8px", background: "#fef2f2", color: "#dc2626", borderRadius: 6, fontSize: 11, fontWeight: 600 }}>Delete</B>
            </div>
          </>}
        </div>)}
      </div>
    </div>}
  </div>;
}



// ─── AUDIT ────────────────────────────────────────────────────────────────────
function Audit() {
  const [logs,setLogs]=useState([]);
  const [loading,setLoading]=useState(true);
  useEffect(()=>{api.getAudit().then(d=>{setLogs(Array.isArray(d)?d:[]);setLoading(false);});},[]);
  return <div>
    <h2 style={{fontSize:20,fontWeight:800,color:"#0f172a",margin:"0 0 4px"}}>Audit Log</h2>
    <p style={{color:"#64748b",margin:"0 0 16px",fontSize:13}}>Track all changes across all users</p>
    <div style={{background:"white",borderRadius:12,overflow:"auto",boxShadow:"0 1px 3px rgba(0,0,0,.06)",border:"1px solid #f1f5f9"}}>
      {loading?<div style={{padding:40,textAlign:"center"}}><Spin/></div>:
      <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
        <thead><tr style={{background:"#f8fafc",borderBottom:"1.5px solid #e2e8f0"}}>
          {["Time","User","Action","Record","Details"].map(h=><th key={h} style={{padding:"9px 12px",textAlign:"left",fontSize:10,fontWeight:700,color:"#64748b",textTransform:"uppercase",letterSpacing:.4}}>{h}</th>)}
        </tr></thead>
        <tbody>
          {!logs.length&&<tr><td colSpan={5} style={{padding:40,textAlign:"center",color:"#94a3b8"}}>No logs yet.</td></tr>}
          {logs.map((l,i)=><tr key={i} style={{borderBottom:"1px solid #f8fafc"}}>
            <td style={{padding:"9px 12px",color:"#64748b",fontFamily:"monospace",fontSize:10,whiteSpace:"nowrap"}}>{new Date(l.createdAt).toLocaleString("en-IN")}</td>
            <td style={{padding:"9px 12px",fontWeight:600,color:"#1e293b"}}>{l.user?.name||"System"}</td>
            <td style={{padding:"9px 12px"}}><span style={{padding:"2px 7px",borderRadius:9,fontSize:10,fontWeight:700,background:l.action==="Created"?"#dcfce7":l.action==="Deleted"?"#fee2e2":"#fef9c3",color:l.action==="Created"?"#16a34a":l.action==="Deleted"?"#dc2626":"#92400e"}}>{l.action}</span></td>
            <td style={{padding:"9px 12px",color:"#475569"}}>{l.recordName}</td>
            <td style={{padding:"9px 12px",color:"#64748b",fontSize:11}}>{l.detail}</td>
          </tr>)}
        </tbody>
      </table>}
    </div>
  </div>;
}

// ─── APP ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [user,setUser]=useState(()=>{
    const t=localStorage.getItem("crm_token");
    if(!t) return null;
    try{const p=JSON.parse(atob(t.split(".")[1]));return{id:p.id,name:p.name,email:p.email,role:p.role};}
    catch{localStorage.removeItem("crm_token");return null;}
  });
  const [page,setPage]=useState("dashboard");
  const [masters,setMasters]=useState({clients:[],owners:[],joiningStatus:[],resignationStatus:[],statusCodes:[]});
  const [modal,setModal]=useState(null);
  const [saving,setSaving]=useState(false);
  const [refreshKey,setRefreshKey]=useState(0);

  useEffect(()=>{ if(user) api.getMasters().then(m=>setMasters(m||{})).catch(console.error); },[user]);

  if(!user) return <Login onLogin={u=>{setUser(u);}}/>;

  const logout=()=>{localStorage.removeItem("crm_token");setUser(null);};

  const handleDelete=async(id,reloadFn)=>{
    if(!window.confirm("Delete this candidate?")) return;
    try{
      const r=await api.deleteCandidate(id);
      if(r.error){alert("Error: "+r.error);return;}
      if(reloadFn) reloadFn();
      else setRefreshKey(k=>k+1);
    }catch(e){alert("Delete failed: "+e.message);}
  };

  const handleSave=async(form)=>{
    setSaving(true);
    try{
      const r=modal.type==="add"?await api.createCandidate(form):await api.updateCandidate(modal.data.id,form);
      if(r.error){alert("Error: "+r.error);setSaving(false);return;}
      setModal(null);setRefreshKey(k=>k+1);
    }catch(e){alert("Save failed: "+e.message);}
    setSaving(false);
  };

  const nav=[
    {k:"dashboard",l:"Dashboard",i:"dash"},
    {k:"candidates",l:"Candidates",i:"users"},
    ...(user.role==="admin"?[{k:"masters",l:"Master Data",i:"cog"},{k:"audit",l:"Audit Log",i:"eye"}]:[]),
  ];

  return <div style={{display:"flex",fontFamily:"'Inter',system-ui,sans-serif",minHeight:"100vh",background:"#f8fafc"}}>
    <aside style={{width:210,background:"#0f172a",minHeight:"100vh",display:"flex",flexDirection:"column",flexShrink:0,position:"sticky",top:0,height:"100vh",overflow:"auto"}}>
      <div style={{padding:"20px 16px 14px"}}>
        <div style={{display:"flex",alignItems:"center",gap:9}}>
          <div style={{width:34,height:34,borderRadius:9,background:"linear-gradient(135deg,#2563eb,#7c3aed)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
            <svg width={17} height={17} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
          </div>
          <div><div style={{fontSize:12,fontWeight:800,color:"white",lineHeight:1.1}}>Ample Leap</div><div style={{fontSize:9,color:"#64748b",marginTop:1}}>CRM v2.0</div></div>
        </div>
      </div>
      <nav style={{flex:1,padding:"6px 8px"}}>
        {nav.map(n=><button key={n.k} onClick={()=>setPage(n.k)} style={{width:"100%",display:"flex",alignItems:"center",gap:9,padding:"9px 10px",borderRadius:8,border:"none",background:page===n.k?"#1e293b":"transparent",color:page===n.k?"#93c5fd":"#94a3b8",fontWeight:page===n.k?700:400,cursor:"pointer",fontSize:13,marginBottom:1,textAlign:"left",outline:"none",transition:"all .15s"}}>
          <Icon n={n.i} s={14}/>{n.l}
        </button>)}
      </nav>
      <div style={{padding:"12px 12px",borderTop:"1px solid #1e293b"}}>
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
          <div style={{width:30,height:30,borderRadius:7,background:"linear-gradient(135deg,#1e40af,#7c3aed)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:800,color:"white",flexShrink:0}}>{user.name[0]}</div>
          <div style={{overflow:"hidden",flex:1}}>
            <div style={{fontSize:11,fontWeight:700,color:"#e2e8f0",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{user.name}</div>
            <div style={{fontSize:9,color:"#64748b",textTransform:"capitalize"}}>{user.role}</div>
          </div>
        </div>
        <button onClick={logout} style={{width:"100%",display:"flex",alignItems:"center",gap:7,padding:"7px 9px",borderRadius:6,border:"none",background:"transparent",color:"#64748b",cursor:"pointer",fontSize:11,fontWeight:600}}>
          <Icon n="out" s={12}/> Sign Out
        </button>
      </div>
    </aside>

    <main style={{flex:1,overflow:"auto",display:"flex",flexDirection:"column",minWidth:0}}>
      <div style={{background:"white",borderBottom:"1px solid #f1f5f9",padding:"10px 22px",display:"flex",justifyContent:"space-between",alignItems:"center",position:"sticky",top:0,zIndex:10}}>
        <div style={{fontSize:12,color:"#64748b"}}>{new Date().toLocaleDateString("en-IN",{weekday:"long",day:"numeric",month:"long",year:"numeric"})}</div>
        <div style={{display:"flex",gap:7,alignItems:"center"}}>
          <div style={{fontSize:11,background:"#f0fdf4",color:"#16a34a",border:"1px solid #bbf7d0",padding:"3px 9px",borderRadius:20,fontWeight:600}}>● Live</div>
          <div style={{fontSize:11,background:"#f0f9ff",color:"#0369a1",border:"1px solid #bae6fd",padding:"3px 9px",borderRadius:20,fontWeight:600,textTransform:"capitalize"}}>{user.role}</div>
        </div>
      </div>
      <div style={{padding:22,flex:1}}>
        {page==="dashboard"&&<Dashboard/>}
        {page==="candidates"&&<Candidates key={refreshKey} masters={masters} user={user} onAdd={()=>setModal({type:"add"})} onEdit={c=>setModal({type:"edit",data:c})} onDelete={handleDelete} onView={c=>setModal({type:"view",data:c})}/>}
        {page==="masters"&&user.role==="admin"&&<Masters masters={masters} reload={()=>api.getMasters().then(m=>setMasters(m||{}))}/>}
        {page==="audit"&&user.role==="admin"&&<Audit/>}
      </div>
    </main>

    <Modal open={modal?.type==="add"} onClose={()=>setModal(null)} title="Add New Candidate" wide>
      <CandidateForm masters={masters} onSave={handleSave} onCancel={()=>setModal(null)} saving={saving}/>
    </Modal>
    <Modal open={modal?.type==="edit"} onClose={()=>setModal(null)} title="Edit Candidate" wide>
      <CandidateForm initial={modal?.data} masters={masters} onSave={handleSave} onCancel={()=>setModal(null)} saving={saving}/>
    </Modal>
    <Modal open={modal?.type==="view"} onClose={()=>setModal(null)} title="Candidate Profile">
      <ViewCandidate c={modal?.data}/>
    </Modal>
    <style>{`*{box-sizing:border-box;} @keyframes spin{to{transform:rotate(360deg)}}`}</style>
  </div>;
}
