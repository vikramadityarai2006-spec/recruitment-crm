import { useState, useEffect, useMemo, useCallback } from "react";

// ─── API ──────────────────────────────────────────────────────────────────────
const BASE_URL = "https://crm-backend-production-de8b.up.railway.app/api";
const getToken = () => localStorage.getItem("crm_token");
const H = () => ({ "Content-Type":"application/json", ...(getToken()?{Authorization:`Bearer ${getToken()}`}:{}) });
const api = {
  login:(e,p)=>fetch(`${BASE_URL}/auth/login`,{method:"POST",headers:H(),body:JSON.stringify({email:e,password:p})}).then(r=>r.json()),
  getCandidates:(p={})=>fetch(`${BASE_URL}/candidates?${new URLSearchParams(p)}`,{headers:H()}).then(r=>r.json()),
  createCandidate:(d)=>fetch(`${BASE_URL}/candidates`,{method:"POST",headers:H(),body:JSON.stringify(d)}).then(r=>r.json()),
  updateCandidate:(id,d)=>fetch(`${BASE_URL}/candidates/${id}`,{method:"PUT",headers:H(),body:JSON.stringify(d)}).then(r=>r.json()),
  deleteCandidate:(id)=>fetch(`${BASE_URL}/candidates/${id}`,{method:"DELETE",headers:H()}).then(r=>r.json()),
  getMasters:()=>fetch(`${BASE_URL}/masters`,{headers:H()}).then(r=>r.json()),
  getDashboard:()=>fetch(`${BASE_URL}/dashboard`,{headers:H()}).then(r=>r.json()),
  getAudit:()=>fetch(`${BASE_URL}/audit`,{headers:H()}).then(r=>r.json()),
  addMaster:(category,value)=>fetch(`${BASE_URL}/masters`,{method:"POST",headers:H(),body:JSON.stringify({category,value})}).then(r=>r.json()),
};

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const STATUS_COLOR={Joined:"#22c55e",Offered:"#f97316",offered:"#f97316",Backout:"#ef4444",Left:"#8b5cf6",Rejected:"#dc2626",Hold:"#eab308",Cancelled:"#6b7280"};
const STATUS_BG={Joined:"#dcfce7",Offered:"#ffedd5",offered:"#ffedd5",Backout:"#fee2e2",Left:"#ede9fe",Rejected:"#fee2e2",Hold:"#fef9c3",Cancelled:"#f3f4f6"};
const CODE_COLORS={Red:"#ef4444",Orange:"#f97316",Brown:"#92400e",Yellow:"#eab308",Green:"#22c55e",Blue:"#3b82f6",RED:"#ef4444",GREEN:"#22c55e"};

const fmt=(n)=>n?.toLocaleString("en-IN")??"—";
const fmtDate=(d)=>{if(!d)return"—";try{return new Date(d).toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"});}catch{return d;}};

// ─── BADGE ────────────────────────────────────────────────────────────────────
function Badge({status,code}){
  if(code){const c=CODE_COLORS[code]||"#6b7280";return<span style={{background:c+"22",color:c,border:`1px solid ${c}44`,padding:"2px 8px",borderRadius:12,fontSize:11,fontWeight:600}}>{code}</span>;}
  const c=STATUS_COLOR[status]||"#6b7280",bg=STATUS_BG[status]||"#f3f4f6";
  return<span style={{background:bg,color:c,padding:"2px 8px",borderRadius:12,fontSize:11,fontWeight:600}}>{status||"—"}</span>;
}

// ─── ICONS ────────────────────────────────────────────────────────────────────
const Icon=({name,size=16})=>{
  const icons={
    dashboard:<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>,
    users:<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
    settings:<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/></svg>,
    plus:<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
    search:<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
    edit:<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
    trash:<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>,
    eye:<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
    download:<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
    chart:<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
    logout:<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
    x:<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
    filter:<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>,
    refresh:<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>,
  };
  return icons[name]||null;
};

// ─── MINI CHARTS ─────────────────────────────────────────────────────────────
function MiniBar({data,height=60}){
  if(!data?.length)return null;
  const max=Math.max(...data.map(d=>d.value),1);
  return<div style={{display:"flex",alignItems:"flex-end",gap:4,height,paddingTop:4}}>
    {data.map((d,i)=><div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:2}}>
      <div style={{width:"100%",background:d.color||"#3b82f6",borderRadius:"3px 3px 0 0",height:Math.max(4,(d.value/max)*(height-20)),transition:"height .3s"}}/>
      <span style={{fontSize:9,color:"#94a3b8",textAlign:"center",lineHeight:1}}>{d.label}</span>
    </div>)}
  </div>;
}

function DonutChart({data,size=100}){
  const total=data.reduce((a,b)=>a+b.value,0)||1;
  let cum=0;
  const slices=data.map(d=>{const pct=d.value/total;const start=cum;cum+=pct;return{...d,start,pct};});
  const p=(cx,cy,r,a)=>({x:cx+r*Math.cos(a-Math.PI/2),y:cy+r*Math.sin(a-Math.PI/2)});
  const r=40,cx=50,cy=50;
  return<svg width={size} height={size} viewBox="0 0 100 100">
    {slices.map((s,i)=>{
      if(s.pct===0)return null;
      const sa=s.start*2*Math.PI,ea=(s.start+s.pct)*2*Math.PI;
      const p1=p(cx,cy,r,sa),p2=p(cx,cy,r,ea),large=s.pct>0.5?1:0;
      return<path key={i} d={`M${cx},${cy} L${p1.x},${p1.y} A${r},${r} 0 ${large},1 ${p2.x},${p2.y} Z`} fill={s.color} opacity={0.9}/>;
    })}
    <circle cx={cx} cy={cy} r={26} fill="white"/>
    <text x={cx} y={cy+1} textAnchor="middle" dominantBaseline="middle" fontSize={14} fontWeight={700} fill="#1e293b">{total}</text>
    <text x={cx} y={cy+11} textAnchor="middle" dominantBaseline="middle" fontSize={7} fill="#94a3b8">TOTAL</text>
  </svg>;
}

// ─── MODAL ────────────────────────────────────────────────────────────────────
function Modal({open,onClose,title,children,wide}){
  if(!open)return null;
  return<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.5)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:16}} onClick={onClose}>
    <div style={{background:"white",borderRadius:16,width:"100%",maxWidth:wide?860:560,maxHeight:"90vh",overflow:"auto",boxShadow:"0 25px 50px rgba(0,0,0,.3)"}} onClick={e=>e.stopPropagation()}>
      <div style={{padding:"20px 24px",borderBottom:"1px solid #f1f5f9",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <h3 style={{margin:0,fontSize:18,fontWeight:700,color:"#0f172a"}}>{title}</h3>
        <button onClick={onClose} style={{background:"#f1f5f9",border:"none",borderRadius:8,padding:6,cursor:"pointer",display:"flex"}}><Icon name="x" size={16}/></button>
      </div>
      <div style={{padding:24}}>{children}</div>
    </div>
  </div>;
}

// ─── LOGIN ────────────────────────────────────────────────────────────────────
function LoginScreen({onLogin}){
  const [email,setEmail]=useState("admin@ampleleap.com");
  const [password,setPassword]=useState("admin123");
  const [error,setError]=useState("");
  const [loading,setLoading]=useState(false);
  const handle=async(e)=>{
    e.preventDefault();setLoading(true);setError("");
    const res=await api.login(email,password);
    if(res.token){localStorage.setItem("crm_token",res.token);onLogin(res.user);}
    else{setError(res.error||"Invalid credentials");setLoading(false);}
  };
  return<div style={{minHeight:"100vh",background:"linear-gradient(135deg,#0f172a 0%,#1e3a5f 50%,#0f172a 100%)",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Inter',system-ui,sans-serif"}}>
    <div style={{background:"white",borderRadius:20,padding:"48px 40px",width:420,boxShadow:"0 25px 50px rgba(0,0,0,.4)"}}>
      <div style={{textAlign:"center",marginBottom:32}}>
        <div style={{width:56,height:56,background:"linear-gradient(135deg,#2563eb,#7c3aed)",borderRadius:16,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 16px",boxShadow:"0 8px 24px #2563eb44"}}>
          <svg width={28} height={28} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
        </div>
        <h1 style={{fontSize:24,fontWeight:800,color:"#0f172a",margin:0}}>Ample Leap CRM</h1>
        <p style={{color:"#64748b",marginTop:4,fontSize:14}}>Recruitment Joining Tracker</p>
      </div>
      {error&&<div style={{background:"#fee2e2",color:"#991b1b",padding:"10px 14px",borderRadius:8,fontSize:13,marginBottom:16}}>{error}</div>}
      <form onSubmit={handle}>
        <label style={{display:"block",fontSize:13,fontWeight:600,color:"#374151",marginBottom:4}}>Email</label>
        <input value={email} onChange={e=>setEmail(e.target.value)} type="email" required style={{width:"100%",padding:"10px 14px",borderRadius:8,border:"1.5px solid #e2e8f0",fontSize:14,marginBottom:16,boxSizing:"border-box",outline:"none"}}/>
        <label style={{display:"block",fontSize:13,fontWeight:600,color:"#374151",marginBottom:4}}>Password</label>
        <input value={password} onChange={e=>setPassword(e.target.value)} type="password" required style={{width:"100%",padding:"10px 14px",borderRadius:8,border:"1.5px solid #e2e8f0",fontSize:14,marginBottom:24,boxSizing:"border-box",outline:"none"}}/>
        <button type="submit" disabled={loading} style={{width:"100%",padding:"12px",background:"linear-gradient(135deg,#2563eb,#7c3aed)",color:"white",border:"none",borderRadius:10,fontWeight:700,fontSize:15,cursor:"pointer",opacity:loading?.7:1}}>
          {loading?"Signing in…":"Sign In"}
        </button>
      </form>
      <div style={{marginTop:20,padding:14,background:"#f8fafc",borderRadius:8,fontSize:12,color:"#64748b"}}>
        <strong>Demo logins:</strong><br/>Admin: admin@ampleleap.com / admin123<br/>Recruiter: recruiter@ampleleap.com / rec123
      </div>
    </div>
  </div>;
}

// ─── CANDIDATE FORM ───────────────────────────────────────────────────────────
function CandidateForm({initial,masters,onSave,onCancel}){
  const blank={client:"",designation:"",location:"",name:"",actualDOJ:"",offerMonth:"",phone:"",resignationAcceptance:"Pending",proposedDOJ:"",owner:"",joiningStatus:"Offered",ctc:"",statusCode:"Orange",notes:""};
  const [form,setForm]=useState(initial?{
    ...blank,
    client:initial.clientName||"",
    designation:initial.designation||"",
    location:initial.location||"",
    name:initial.candidateName||"",
    actualDOJ:initial.actualDOJ?initial.actualDOJ.split("T")[0]:"",
    offerMonth:initial.offerMonth?initial.offerMonth.split("T")[0]:"",
    phone:initial.phone||"",
    resignationAcceptance:initial.resignationAcceptance||"Pending",
    proposedDOJ:initial.proposedDOJ?initial.proposedDOJ.split("T")[0]:"",
    owner:initial.ownerName||"",
    joiningStatus:initial.joiningStatus||"Offered",
    ctc:initial.ctcPerMonth||"",
    statusCode:initial.statusCode||"Orange",
    notes:initial.notes||"",
  }:blank);
  const set=(k,v)=>setForm(f=>({...f,[k]:v}));
  const field=(label,key,type="text",placeholder="")=><div style={{marginBottom:16}}>
    <label style={{display:"block",fontSize:12,fontWeight:600,color:"#475569",marginBottom:4,textTransform:"uppercase",letterSpacing:.5}}>{label}</label>
    <input type={type} value={form[key]||""} onChange={e=>set(key,e.target.value)} placeholder={placeholder} style={{width:"100%",padding:"9px 12px",borderRadius:8,border:"1.5px solid #e2e8f0",fontSize:14,boxSizing:"border-box",outline:"none"}}/>
  </div>;
  const select=(label,key,opts)=><div style={{marginBottom:16}}>
    <label style={{display:"block",fontSize:12,fontWeight:600,color:"#475569",marginBottom:4,textTransform:"uppercase",letterSpacing:.5}}>{label}</label>
    <select value={form[key]||""} onChange={e=>set(key,e.target.value)} style={{width:"100%",padding:"9px 12px",borderRadius:8,border:"1.5px solid #e2e8f0",fontSize:14,boxSizing:"border-box",outline:"none",background:"white"}}>
      <option value="">— Select —</option>
      {opts.map(o=><option key={o} value={o}>{o}</option>)}
    </select>
  </div>;
  return<div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 16px"}}>
      {select("Client Name","client",masters.clients||[])}
      {field("Designation / Position","designation","text","e.g. Senior Manager")}
      {field("Location","location","text","e.g. Mumbai")}
      {field("Candidate Name","name","text","Full name")}
      {field("Phone No.","phone","tel","10-digit number")}
      {field("CTC Per Month (₹)","ctc","number","e.g. 85000")}
      {field("Offer Month","offerMonth","date")}
      {field("Proposed Date of Joining","proposedDOJ","date")}
      {field("Actual Date of Joining","actualDOJ","date")}
      {select("Resignation Acceptance","resignationAcceptance",masters.resignationStatus||[])}
      {select("Owner Name","owner",masters.owners||[])}
      {select("Joining Status","joiningStatus",masters.joiningStatus||[])}
      {select("Status Code","statusCode",(masters.statusCodes||[]).map(s=>s.code||s))}
    </div>
    <div style={{marginBottom:16}}>
      <label style={{display:"block",fontSize:12,fontWeight:600,color:"#475569",marginBottom:4,textTransform:"uppercase",letterSpacing:.5}}>Notes</label>
      <textarea value={form.notes||""} onChange={e=>set("notes",e.target.value)} rows={3} style={{width:"100%",padding:"9px 12px",borderRadius:8,border:"1.5px solid #e2e8f0",fontSize:14,boxSizing:"border-box",outline:"none",resize:"vertical"}}/>
    </div>
    <div style={{display:"flex",gap:10,justifyContent:"flex-end"}}>
      <button onClick={onCancel} style={{padding:"10px 20px",background:"#f1f5f9",border:"none",borderRadius:8,fontWeight:600,cursor:"pointer",fontSize:14}}>Cancel</button>
      <button onClick={()=>onSave(form)} style={{padding:"10px 20px",background:"linear-gradient(135deg,#2563eb,#7c3aed)",color:"white",border:"none",borderRadius:8,fontWeight:600,cursor:"pointer",fontSize:14}}>Save Candidate</button>
    </div>
  </div>;
}

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
function Dashboard(){
  const [stats,setStats]=useState(null);
  const [loading,setLoading]=useState(true);
  useEffect(()=>{api.getDashboard().then(d=>{setStats(d);setLoading(false);});},[]);
  if(loading)return<div style={{display:"flex",alignItems:"center",justifyContent:"center",height:200,color:"#64748b"}}>Loading dashboard...</div>;
  if(!stats)return null;
  const cards=[
    {label:"Total Candidates",value:stats.total,color:"#2563eb"},
    {label:"Offered",value:stats.offered,color:"#f97316"},
    {label:"Joined",value:stats.joined,color:"#22c55e"},
    {label:"Resignation Pending",value:stats.resPending,color:"#ef4444"},
    {label:"Joining This Month",value:stats.thisMonth,color:"#8b5cf6"},
    {label:"Joining Next Month",value:stats.nextMonth,color:"#06b6d4"},
  ];
  const statusDist=(stats.statusGroups||[]).filter(s=>s.joiningStatus&&s._count>0).map(s=>({label:s.joiningStatus,value:s._count,color:STATUS_COLOR[s.joiningStatus]||"#94a3b8"}));
  const clientDist=(stats.clientGroups||[]).filter(c=>c.clientName).map(c=>({label:c.clientName.length>8?c.clientName.slice(0,8)+"…":c.clientName,value:c._count,color:"#3b82f6"}));
  const monthlyTrend=(stats.months||[]).map(m=>({label:m.label,value:m.value,color:"#22c55e"}));
  return<div>
    <div style={{marginBottom:24}}>
      <h2 style={{fontSize:22,fontWeight:800,color:"#0f172a",margin:0}}>Dashboard</h2>
      <p style={{color:"#64748b",margin:"4px 0 0",fontSize:14}}>Live recruitment overview — synced across all devices</p>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))",gap:14,marginBottom:28}}>
      {cards.map(c=><div key={c.label} style={{background:"white",borderRadius:14,padding:18,boxShadow:"0 1px 3px rgba(0,0,0,.06)",border:"1px solid #f1f5f9"}}>
        <div style={{fontSize:28,fontWeight:800,color:c.color}}>{c.value}</div>
        <div style={{fontSize:12,color:"#64748b",marginTop:2,fontWeight:500,lineHeight:1.3}}>{c.label}</div>
        <div style={{width:32,height:3,background:c.color,borderRadius:2,marginTop:10,opacity:.4}}/>
      </div>)}
    </div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:16,marginBottom:28}}>
      <div style={{background:"white",borderRadius:14,padding:20,boxShadow:"0 1px 3px rgba(0,0,0,.06)",border:"1px solid #f1f5f9"}}>
        <div style={{fontSize:13,fontWeight:700,color:"#0f172a",marginBottom:8}}>Joining Status Distribution</div>
        <div style={{display:"flex",alignItems:"center",gap:16}}>
          <DonutChart data={statusDist} size={90}/>
          <div style={{flex:1}}>{statusDist.map(s=><div key={s.label} style={{display:"flex",alignItems:"center",gap:6,marginBottom:4}}>
            <div style={{width:8,height:8,borderRadius:"50%",background:s.color,flexShrink:0}}/>
            <span style={{fontSize:11,color:"#475569",flex:1}}>{s.label}</span>
            <span style={{fontSize:11,fontWeight:700,color:"#0f172a"}}>{s.value}</span>
          </div>)}</div>
        </div>
      </div>
      <div style={{background:"white",borderRadius:14,padding:20,boxShadow:"0 1px 3px rgba(0,0,0,.06)",border:"1px solid #f1f5f9"}}>
        <div style={{fontSize:13,fontWeight:700,color:"#0f172a",marginBottom:4}}>Top Clients</div>
        <MiniBar data={clientDist} height={80}/>
      </div>
      <div style={{background:"white",borderRadius:14,padding:20,boxShadow:"0 1px 3px rgba(0,0,0,.06)",border:"1px solid #f1f5f9"}}>
        <div style={{fontSize:13,fontWeight:700,color:"#0f172a",marginBottom:4}}>Monthly Joining Trend</div>
        <MiniBar data={monthlyTrend} height={80}/>
      </div>
    </div>
  </div>;
}

// ─── CANDIDATES PAGE ──────────────────────────────────────────────────────────
function CandidatesPage({masters,user,onAdd,onEdit,onDelete,onView}){
  const [data,setData]=useState({candidates:[],total:0,pages:1});
  const [search,setSearch]=useState("");
  const [filters,setFilters]=useState({client:"",owner:"",status:"",statusCode:"",location:""});
  const [page,setPage]=useState(1);
  const [loading,setLoading]=useState(true);
  const [showFilters,setShowFilters]=useState(false);
  const PER=20;

  const load=useCallback(async()=>{
    setLoading(true);
    const params={page,limit:PER,sortBy:"id",sortDir:"desc"};
    if(search)params.search=search;
    if(filters.client)params.client=filters.client;
    if(filters.owner)params.owner=filters.owner;
    if(filters.status)params.status=filters.status;
    if(filters.statusCode)params.statusCode=filters.statusCode;
    if(filters.location)params.location=filters.location;
    const res=await api.getCandidates(params);
    setData(res);setLoading(false);
  },[page,search,filters]);

  useEffect(()=>{load();},[load]);

  const setFilter=(k,v)=>{setFilters(f=>({...f,[k]:v}));setPage(1);};
  const activeFiltersCount=Object.values(filters).filter(Boolean).length;
  const canEdit=user.role!=="viewer";
  const canDelete=user.role==="admin";

  const exportCSV=()=>{
    const cols=["ID","Client","Designation","Location","Candidate Name","Phone","Offer Month","Proposed DOJ","Actual DOJ","Resignation","Owner","Status","CTC","Code","Notes"];
    const rows=(data.candidates||[]).map(c=>[c.id,c.clientName,c.designation,c.location,c.candidateName,c.phone,c.offerMonth,c.proposedDOJ,c.actualDOJ,c.resignationAcceptance,c.ownerName,c.joiningStatus,c.ctcPerMonth,c.statusCode,c.notes]);
    const csv=[cols,...rows].map(r=>r.map(v=>`"${v||""}"`).join(",")).join("\n");
    const a=document.createElement("a");a.href="data:text/csv;charset=utf-8,"+encodeURIComponent(csv);a.download="candidates.csv";a.click();
  };

  const SortArr=({k})=><span style={{color:"#94a3b8",fontSize:10,marginLeft:2}}>⇅</span>;

  return<div>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20,flexWrap:"wrap",gap:10}}>
      <div>
        <h2 style={{fontSize:22,fontWeight:800,color:"#0f172a",margin:0}}>Candidates</h2>
        <p style={{color:"#64748b",margin:"4px 0 0",fontSize:14}}>{data.total} records in database</p>
      </div>
      <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
        <button onClick={load} style={{display:"flex",alignItems:"center",gap:6,padding:"9px 14px",background:"#f1f5f9",border:"none",borderRadius:9,fontWeight:600,cursor:"pointer",fontSize:13,color:"#374151"}}>
          <Icon name="refresh" size={14}/> Refresh
        </button>
        {canEdit&&<button onClick={onAdd} style={{display:"flex",alignItems:"center",gap:6,padding:"9px 16px",background:"linear-gradient(135deg,#2563eb,#7c3aed)",color:"white",border:"none",borderRadius:9,fontWeight:600,cursor:"pointer",fontSize:13}}>
          <Icon name="plus" size={14}/> Add Candidate
        </button>}
        <button onClick={exportCSV} style={{display:"flex",alignItems:"center",gap:6,padding:"9px 14px",background:"#f1f5f9",border:"none",borderRadius:9,fontWeight:600,cursor:"pointer",fontSize:13,color:"#374151"}}>
          <Icon name="download" size={14}/> Export CSV
        </button>
      </div>
    </div>

    <div style={{background:"white",borderRadius:12,padding:14,marginBottom:16,boxShadow:"0 1px 3px rgba(0,0,0,.06)",border:"1px solid #f1f5f9"}}>
      <div style={{display:"flex",gap:10,marginBottom:showFilters?12:0,flexWrap:"wrap"}}>
        <div style={{flex:1,minWidth:200,display:"flex",alignItems:"center",gap:8,background:"#f8fafc",borderRadius:8,padding:"8px 12px",border:"1.5px solid #e2e8f0"}}>
          <Icon name="search" size={14}/>
          <input value={search} onChange={e=>{setSearch(e.target.value);setPage(1);}} placeholder="Search name, client, phone…" style={{border:"none",background:"none",outline:"none",fontSize:13,width:"100%"}}/>
        </div>
        <button onClick={()=>setShowFilters(f=>!f)} style={{display:"flex",alignItems:"center",gap:6,padding:"8px 14px",background:activeFiltersCount>0?"#eff6ff":"#f8fafc",border:"1.5px solid "+(activeFiltersCount>0?"#bfdbfe":"#e2e8f0"),borderRadius:8,cursor:"pointer",fontSize:13,fontWeight:600,color:activeFiltersCount>0?"#1d4ed8":"#374151"}}>
          <Icon name="filter" size={13}/> Filters {activeFiltersCount>0&&`(${activeFiltersCount})`}
        </button>
      </div>
      {showFilters&&<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))",gap:8}}>
        {[["Client",filters.client,v=>setFilter("client",v),masters.clients||[]],
          ["Owner",filters.owner,v=>setFilter("owner",v),masters.owners||[]],
          ["Joining Status",filters.status,v=>setFilter("status",v),masters.joiningStatus||[]],
          ["Status Code",filters.statusCode,v=>setFilter("statusCode",v),(masters.statusCodes||[]).map(s=>s.code||s)],
        ].map(([label,val,fn,opts])=><div key={label}>
          <label style={{fontSize:11,fontWeight:600,color:"#64748b",display:"block",marginBottom:2}}>{label}</label>
          <select value={val} onChange={e=>fn(e.target.value)} style={{width:"100%",padding:"7px 10px",borderRadius:7,border:"1.5px solid #e2e8f0",fontSize:13,background:"white",outline:"none"}}>
            <option value="">All</option>
            {opts.map(o=><option key={o} value={o}>{o}</option>)}
          </select>
        </div>)}
        <div>
          <label style={{fontSize:11,fontWeight:600,color:"#64748b",display:"block",marginBottom:2}}>Location</label>
          <input value={filters.location} onChange={e=>setFilter("location",e.target.value)} placeholder="Filter city…" style={{width:"100%",padding:"7px 10px",borderRadius:7,border:"1.5px solid #e2e8f0",fontSize:13,boxSizing:"border-box",outline:"none"}}/>
        </div>
        {activeFiltersCount>0&&<div style={{display:"flex",alignItems:"flex-end"}}>
          <button onClick={()=>{setFilters({client:"",owner:"",status:"",statusCode:"",location:""});setPage(1);}} style={{width:"100%",padding:"7px 10px",borderRadius:7,border:"1.5px solid #fecaca",background:"#fef2f2",color:"#dc2626",fontSize:13,fontWeight:600,cursor:"pointer"}}>Clear All</button>
        </div>}
      </div>}
    </div>

    <div style={{background:"white",borderRadius:12,boxShadow:"0 1px 3px rgba(0,0,0,.06)",border:"1px solid #f1f5f9",overflow:"auto"}}>
      {loading?<div style={{padding:60,textAlign:"center",color:"#94a3b8"}}>Loading candidates...</div>:
      <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
        <thead><tr style={{background:"#f8fafc",borderBottom:"1.5px solid #e2e8f0"}}>
          {[["#",36],["Client",130],["Candidate",150],["Position",130],["Location",90],["Phone",110],["Offer Month",110],["Proposed DOJ",110],["Owner",110],["Status",100],["CTC/Mo",90],["Code",70],["",90]].map(([l,w])=><th key={l} style={{padding:"10px 12px",textAlign:"left",fontWeight:700,color:"#475569",fontSize:11,textTransform:"uppercase",letterSpacing:.4,minWidth:w}}>{l}</th>)}
        </tr></thead>
        <tbody>
          {(data.candidates||[]).length===0&&<tr><td colSpan={13} style={{padding:40,textAlign:"center",color:"#94a3b8"}}>No candidates found.</td></tr>}
          {(data.candidates||[]).map((c,i)=><tr key={c.id} style={{borderBottom:"1px solid #f8fafc",background:i%2===0?"white":"#fcfcfd"}} onMouseEnter={e=>e.currentTarget.style.background="#f0f9ff"} onMouseLeave={e=>e.currentTarget.style.background=i%2===0?"white":"#fcfcfd"}>
            <td style={{padding:"10px 12px",color:"#94a3b8",fontWeight:600}}>{c.id}</td>
            <td style={{padding:"10px 12px",fontWeight:600,color:"#1e293b"}}>{c.clientName||"—"}</td>
            <td style={{padding:"10px 12px"}}><div style={{fontWeight:600,color:"#0f172a"}}>{c.candidateName}</div>{c.phone&&<div style={{fontSize:11,color:"#94a3b8"}}>{c.phone}</div>}</td>
            <td style={{padding:"10px 12px",color:"#475569"}}>{c.designation||"—"}</td>
            <td style={{padding:"10px 12px",color:"#475569"}}>{c.location||"—"}</td>
            <td style={{padding:"10px 12px",color:"#64748b",fontFamily:"monospace"}}>{c.phone||"—"}</td>
            <td style={{padding:"10px 12px",color:"#64748b"}}>{fmtDate(c.offerMonth)}</td>
            <td style={{padding:"10px 12px",color:"#64748b"}}>{fmtDate(c.proposedDOJ)}</td>
            <td style={{padding:"10px 12px",color:"#475569"}}>{c.ownerName||"—"}</td>
            <td style={{padding:"10px 12px"}}><Badge status={c.joiningStatus}/></td>
            <td style={{padding:"10px 12px",color:"#0f172a",fontWeight:600}}>₹{fmt(c.ctcPerMonth)}</td>
            <td style={{padding:"10px 12px"}}><Badge code={c.statusCode}/></td>
            <td style={{padding:"10px 12px"}}>
              <div style={{display:"flex",gap:4}}>
                <button onClick={()=>onView(c)} style={{padding:5,background:"#f0f9ff",border:"none",borderRadius:6,cursor:"pointer",color:"#2563eb",display:"flex"}} title="View"><Icon name="eye" size={13}/></button>
                {canEdit&&<button onClick={()=>onEdit(c)} style={{padding:5,background:"#f0fdf4",border:"none",borderRadius:6,cursor:"pointer",color:"#16a34a",display:"flex"}} title="Edit"><Icon name="edit" size={13}/></button>}
                {canDelete&&<button onClick={()=>onDelete(c.id)} style={{padding:5,background:"#fef2f2",border:"none",borderRadius:6,cursor:"pointer",color:"#dc2626",display:"flex"}} title="Delete"><Icon name="trash" size={13}/></button>}
              </div>
            </td>
          </tr>)}
        </tbody>
      </table>}
    </div>

    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:14,flexWrap:"wrap",gap:8}}>
      <span style={{fontSize:13,color:"#64748b"}}>Page {page} of {data.pages} — {data.total} total</span>
      <div style={{display:"flex",gap:4}}>
        {page>1&&<button onClick={()=>setPage(p=>p-1)} style={{padding:"6px 12px",border:"1.5px solid #e2e8f0",borderRadius:7,background:"white",cursor:"pointer",fontSize:13}}>← Prev</button>}
        <span style={{padding:"6px 14px",background:"#2563eb",color:"white",borderRadius:7,fontSize:13,fontWeight:700}}>{page}</span>
        {page<data.pages&&<button onClick={()=>setPage(p=>p+1)} style={{padding:"6px 12px",border:"1.5px solid #e2e8f0",borderRadius:7,background:"white",cursor:"pointer",fontSize:13}}>Next →</button>}
      </div>
    </div>
  </div>;
}

// ─── VIEW CANDIDATE ───────────────────────────────────────────────────────────
function ViewCandidate({candidate:c}){
  if(!c)return null;
  const row=(label,value)=><div style={{display:"flex",borderBottom:"1px solid #f8fafc",padding:"10px 0"}}>
    <div style={{width:180,fontSize:12,fontWeight:700,color:"#64748b",textTransform:"uppercase",letterSpacing:.4,flexShrink:0}}>{label}</div>
    <div style={{fontSize:14,color:"#0f172a",fontWeight:500}}>{value||"—"}</div>
  </div>;
  return<div>
    <div style={{display:"flex",alignItems:"center",gap:16,marginBottom:20,paddingBottom:20,borderBottom:"1px solid #f1f5f9"}}>
      <div style={{width:56,height:56,borderRadius:14,background:"linear-gradient(135deg,#2563eb22,#7c3aed22)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,fontWeight:800,color:"#2563eb"}}>
        {c.candidateName?.[0]?.toUpperCase()}
      </div>
      <div>
        <h3 style={{margin:0,fontSize:20,fontWeight:800,color:"#0f172a"}}>{c.candidateName}</h3>
        <p style={{margin:"2px 0 0",color:"#64748b",fontSize:13}}>{c.designation} · {c.clientName}</p>
        <div style={{display:"flex",gap:6,marginTop:6}}><Badge status={c.joiningStatus}/><Badge code={c.statusCode}/></div>
      </div>
    </div>
    {row("Client",c.clientName)}{row("Designation",c.designation)}{row("Location",c.location)}
    {row("Phone",c.phone)}{row("Offer Month",fmtDate(c.offerMonth))}{row("Proposed DOJ",fmtDate(c.proposedDOJ))}
    {row("Actual DOJ",fmtDate(c.actualDOJ))}{row("Resignation",c.resignationAcceptance)}{row("Owner",c.ownerName)}
    {row("CTC Per Month",c.ctcPerMonth?`₹${fmt(c.ctcPerMonth)}`:"—")}{row("Notes",c.notes)}
  </div>;
}

// ─── MASTERS PAGE ─────────────────────────────────────────────────────────────
function MastersPage({masters,reloadMasters}){
  const [activeTab,setActiveTab]=useState("clients");
  const [newVal,setNewVal]=useState("");
  const [saving,setSaving]=useState(false);
  const tabs=[{key:"clients",label:"Clients"},{key:"owners",label:"Owners"},{key:"joiningStatus",label:"Joining Status"},{key:"resignationStatus",label:"Resignation Status"}];
  const addItem=async()=>{
    if(!newVal.trim())return;
    setSaving(true);
    await api.addMaster(activeTab,newVal.trim());
    setNewVal("");setSaving(false);reloadMasters();
  };
  return<div>
    <h2 style={{fontSize:22,fontWeight:800,color:"#0f172a",margin:"0 0 4px"}}>Master Data</h2>
    <p style={{color:"#64748b",margin:"0 0 20px",fontSize:14}}>Manage dropdown options used across the application.</p>
    <div style={{display:"flex",gap:6,marginBottom:20,flexWrap:"wrap"}}>
      {tabs.map(t=><button key={t.key} onClick={()=>setActiveTab(t.key)} style={{padding:"8px 16px",borderRadius:8,border:"1.5px solid "+(activeTab===t.key?"#2563eb":"#e2e8f0"),background:activeTab===t.key?"#2563eb":"white",color:activeTab===t.key?"white":"#374151",fontWeight:600,cursor:"pointer",fontSize:13}}>{t.label}</button>)}
    </div>
    <div style={{background:"white",borderRadius:14,padding:24,boxShadow:"0 1px 3px rgba(0,0,0,.06)",border:"1px solid #f1f5f9",maxWidth:540}}>
      <div style={{display:"flex",gap:8,marginBottom:20}}>
        <input value={newVal} onChange={e=>setNewVal(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addItem()} placeholder={`Add new ${tabs.find(t=>t.key===activeTab)?.label?.slice(0,-1)||"item"}…`} style={{flex:1,padding:"9px 14px",borderRadius:8,border:"1.5px solid #e2e8f0",fontSize:14,outline:"none"}}/>
        <button onClick={addItem} disabled={saving} style={{padding:"9px 16px",background:"#2563eb",color:"white",border:"none",borderRadius:8,fontWeight:700,cursor:"pointer",fontSize:13,display:"flex",alignItems:"center",gap:5}}>
          <Icon name="plus" size={14}/>{saving?"Saving…":"Add"}
        </button>
      </div>
      {(masters[activeTab]||[]).map((item,i)=><div key={i} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 14px",background:"#f8fafc",borderRadius:8,marginBottom:6}}>
        <span style={{fontSize:14,color:"#1e293b",fontWeight:500}}>{item}</span>
      </div>)}
    </div>
    <div style={{marginTop:24}}>
      <h3 style={{fontSize:15,fontWeight:700,color:"#0f172a",marginBottom:12}}>Status Code Reference</h3>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))",gap:10}}>
        {(masters.statusCodes||[]).map(s=><div key={s.code} style={{background:"white",borderRadius:10,padding:"12px 16px",border:`2px solid ${s.color}33`,display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:14,height:14,borderRadius:"50%",background:s.color,flexShrink:0}}/>
          <div><div style={{fontWeight:700,fontSize:13,color:s.color}}>{s.code}</div><div style={{fontSize:11,color:"#64748b",marginTop:1}}>{s.label}</div></div>
        </div>)}
      </div>
    </div>
  </div>;
}

// ─── AUDIT PAGE ───────────────────────────────────────────────────────────────
function AuditPage(){
  const [logs,setLogs]=useState([]);
  const [loading,setLoading]=useState(true);
  useEffect(()=>{api.getAudit().then(d=>{setLogs(Array.isArray(d)?d:[]);setLoading(false);});},[]);
  return<div>
    <h2 style={{fontSize:22,fontWeight:800,color:"#0f172a",margin:"0 0 4px"}}>Audit Log</h2>
    <p style={{color:"#64748b",margin:"0 0 20px",fontSize:14}}>Track all changes made across all users</p>
    <div style={{background:"white",borderRadius:14,overflow:"auto",boxShadow:"0 1px 3px rgba(0,0,0,.06)",border:"1px solid #f1f5f9"}}>
      {loading?<div style={{padding:40,textAlign:"center",color:"#94a3b8"}}>Loading logs...</div>:
      <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
        <thead><tr style={{background:"#f8fafc",borderBottom:"1.5px solid #e2e8f0"}}>
          {["Time","User","Action","Record","Details"].map(h=><th key={h} style={{padding:"10px 14px",textAlign:"left",fontSize:11,fontWeight:700,color:"#64748b",textTransform:"uppercase",letterSpacing:.4}}>{h}</th>)}
        </tr></thead>
        <tbody>
          {logs.length===0&&<tr><td colSpan={5} style={{padding:40,textAlign:"center",color:"#94a3b8"}}>No audit logs yet.</td></tr>}
          {logs.map((l,i)=><tr key={i} style={{borderBottom:"1px solid #f8fafc"}}>
            <td style={{padding:"10px 14px",color:"#64748b",fontFamily:"monospace",fontSize:11,whiteSpace:"nowrap"}}>{new Date(l.createdAt).toLocaleString("en-IN")}</td>
            <td style={{padding:"10px 14px",fontWeight:600,color:"#1e293b"}}>{l.user?.name||"System"}</td>
            <td style={{padding:"10px 14px"}}><span style={{padding:"2px 8px",borderRadius:10,fontSize:11,fontWeight:700,background:l.action==="Created"?"#dcfce7":l.action==="Deleted"?"#fee2e2":"#fef9c3",color:l.action==="Created"?"#16a34a":l.action==="Deleted"?"#dc2626":"#92400e"}}>{l.action}</span></td>
            <td style={{padding:"10px 14px",color:"#475569"}}>{l.recordName}</td>
            <td style={{padding:"10px 14px",color:"#64748b",fontSize:12}}>{l.detail}</td>
          </tr>)}
        </tbody>
      </table>}
    </div>
  </div>;
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App(){
  const [user,setUser]=useState(()=>{
    const t=localStorage.getItem("crm_token");
    if(!t)return null;
    try{const p=JSON.parse(atob(t.split(".")[1]));return{id:p.id,name:p.name,email:p.email,role:p.role};}
    catch{return null;}
  });
  const [page,setPage]=useState("dashboard");
  const [masters,setMasters]=useState({clients:[],owners:[],joiningStatus:[],resignationStatus:[],statusCodes:[]});
  const [modal,setModal]=useState(null);
  const [refreshKey,setRefreshKey]=useState(0);

  const loadMasters=useCallback(()=>{
    if(user)api.getMasters().then(m=>setMasters(m));
  },[user]);

  useEffect(()=>{loadMasters();},[loadMasters]);

  const handleLogin=(u)=>{setUser(u);};
  const handleLogout=()=>{localStorage.removeItem("crm_token");setUser(null);};

  const handleAdd=()=>setModal({type:"add"});
  const handleEdit=(c)=>setModal({type:"edit",data:c});
  const handleView=(c)=>setModal({type:"view",data:c});
  const handleDelete=async(id)=>{
    if(!window.confirm("Delete this candidate?"))return;
    await api.deleteCandidate(id);
    setRefreshKey(k=>k+1);
  };
  const handleSave=async(form)=>{
    const payload={
      clientName:form.client,designation:form.designation,location:form.location,
      candidateName:form.name,actualDOJ:form.actualDOJ||null,offerMonth:form.offerMonth||null,
      phone:form.phone,resignationAcceptance:form.resignationAcceptance,proposedDOJ:form.proposedDOJ||null,
      ownerName:form.owner,joiningStatus:form.joiningStatus,ctcPerMonth:form.ctc?+form.ctc:null,
      statusCode:form.statusCode,notes:form.notes,
    };
    if(modal.type==="add")await api.createCandidate(payload);
    else await api.updateCandidate(modal.data.id,payload);
    setModal(null);setRefreshKey(k=>k+1);
  };

  if(!user)return<LoginScreen onLogin={handleLogin}/>;

  const navItems=[
    {key:"dashboard",label:"Dashboard",icon:"dashboard"},
    {key:"candidates",label:"Candidates",icon:"users"},
    ...(user.role==="admin"?[
      {key:"masters",label:"Master Data",icon:"settings"},
      {key:"audit",label:"Audit Log",icon:"eye"},
    ]:[]),
  ];

  return<div style={{display:"flex",fontFamily:"'Inter',system-ui,sans-serif",minHeight:"100vh",background:"#f8fafc"}}>
    <aside style={{width:220,background:"#0f172a",minHeight:"100vh",display:"flex",flexDirection:"column",flexShrink:0}}>
      <div style={{padding:"24px 20px 16px"}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:36,height:36,borderRadius:10,background:"linear-gradient(135deg,#2563eb,#7c3aed)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
            <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
          </div>
          <div><div style={{fontSize:13,fontWeight:800,color:"white",lineHeight:1.1}}>Ample Leap</div><div style={{fontSize:10,color:"#64748b",marginTop:1}}>CRM v2.0</div></div>
        </div>
      </div>
      <nav style={{flex:1,padding:"8px 10px"}}>
        {navItems.map(n=><button key={n.key} onClick={()=>setPage(n.key)} style={{width:"100%",display:"flex",alignItems:"center",gap:10,padding:"10px 12px",borderRadius:9,border:"none",background:page===n.key?"#1e40af22":"transparent",color:page===n.key?"#93c5fd":"#94a3b8",fontWeight:page===n.key?700:500,cursor:"pointer",fontSize:14,marginBottom:2,textAlign:"left",outline:"none"}}>
          <span style={{opacity:.8}}><Icon name={n.icon} size={16}/></span>{n.label}
        </button>)}
      </nav>
      <div style={{padding:"16px 14px",borderTop:"1px solid #1e293b"}}>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
          <div style={{width:32,height:32,borderRadius:8,background:"linear-gradient(135deg,#1e40af,#7c3aed)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:800,color:"white",flexShrink:0}}>{user.name[0]}</div>
          <div style={{overflow:"hidden"}}>
            <div style={{fontSize:12,fontWeight:700,color:"#e2e8f0",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{user.name}</div>
            <div style={{fontSize:10,color:"#64748b",textTransform:"capitalize"}}>{user.role}</div>
          </div>
        </div>
        <button onClick={handleLogout} style={{width:"100%",display:"flex",alignItems:"center",gap:8,padding:"8px 10px",borderRadius:7,border:"none",background:"transparent",color:"#64748b",cursor:"pointer",fontSize:12,fontWeight:600}}>
          <Icon name="logout" size={13}/> Sign Out
        </button>
      </div>
    </aside>

    <main style={{flex:1,overflow:"auto",display:"flex",flexDirection:"column"}}>
      <div style={{background:"white",borderBottom:"1px solid #f1f5f9",padding:"12px 24px",display:"flex",justifyContent:"space-between",alignItems:"center",position:"sticky",top:0,zIndex:10}}>
        <div style={{fontSize:13,color:"#64748b"}}>{new Date().toLocaleDateString("en-IN",{weekday:"long",day:"numeric",month:"long",year:"numeric"})}</div>
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          <div style={{fontSize:13,background:"#f0fdf4",color:"#16a34a",border:"1px solid #bbf7d0",padding:"4px 10px",borderRadius:20,fontWeight:600}}>● Live Database</div>
          <div style={{fontSize:13,background:"#f0f9ff",color:"#0369a1",border:"1px solid #bae6fd",padding:"4px 10px",borderRadius:20,fontWeight:600,textTransform:"capitalize"}}>{user.role}</div>
        </div>
      </div>

      <div style={{padding:24,flex:1}}>
        {page==="dashboard"&&<Dashboard/>}
        {page==="candidates"&&<CandidatesPage key={refreshKey} masters={masters} user={user} onAdd={handleAdd} onEdit={handleEdit} onDelete={handleDelete} onView={handleView}/>}
        {page==="masters"&&user.role==="admin"&&<MastersPage masters={masters} reloadMasters={loadMasters}/>}
        {page==="audit"&&user.role==="admin"&&<AuditPage/>}
      </div>
    </main>

    <Modal open={modal?.type==="add"} onClose={()=>setModal(null)} title="Add New Candidate" wide>
      <CandidateForm masters={masters} onSave={handleSave} onCancel={()=>setModal(null)}/>
    </Modal>
    <Modal open={modal?.type==="edit"} onClose={()=>setModal(null)} title="Edit Candidate" wide>
      <CandidateForm initial={modal?.data} masters={masters} onSave={handleSave} onCancel={()=>setModal(null)}/>
    </Modal>
    <Modal open={modal?.type==="view"} onClose={()=>setModal(null)} title="Candidate Profile">
      <ViewCandidate candidate={modal?.data}/>
    </Modal>
  </div>;
}
