
import { useState, useEffect, useMemo, useCallback } from "react";

// ─── SEED DATA ───────────────────────────────────────────────────────────────
const INITIAL_MASTERS = {
  clients: ["Alicon","Metal Seam","Zytex","Gyandhara","Vista Processed Foods","Kanoria","Skylark Food","Payal Group","CEC","Cornish","Avadh Rail","Proind","SM Auto","Sogefi","Modern","FIL Industries","CMR","Marc Lab","Translight Scaff","Descon"],
  owners: ["Manish Sir","Nivedita","Chandni","Yogita","Ruchi","Mansi","Sooraj","Ragini","Payal","Pragya","Sanjay Sir","Neeraj","Khushbu","Fiza","Sandeep","Deepika","Sudhanshu"],
  joiningStatus: ["Offered","Joined","Backout","Left","Rejected","Hold","Cancelled","offered"],
  resignationStatus: ["Pending","Accepted","Done","Rejected","NaN"],
  statusCodes: [
    { code: "Red", label: "Lost Case", color: "#ef4444" },
    { code: "Orange", label: "Offer Given – Joining Pending", color: "#f97316" },
    { code: "Brown", label: "Joined – Invoice Not Raised", color: "#92400e" },
    { code: "Yellow", label: "Invoice Raised – Payment Pending", color: "#eab308" },
    { code: "Green", label: "Payment Received – <6 Months", color: "#22c55e" },
    { code: "Blue", label: "Payment Received – 6 Months Complete", color: "#3b82f6" },
  ],
};

const SEED_CANDIDATES = [
  { id:1, sn:1, client:"Metal Seam", designation:"Manufacturing Head", location:"Lucknow", name:"Ajay Kumar", actualDOJ:"2024-01-08", offerMonth:"2024-10-23", phone:"8010410021", resignationAcceptance:"Done", proposedDOJ:"2024-01-08", owner:"Manish Sir", joiningStatus:"Joined", ctc:121916, statusCode:"Green", notes:"", createdAt:"2024-01-01", updatedAt:"2024-01-01", deleted:false },
  { id:2, sn:2, client:"Metal Seam", designation:"Internal Auditor", location:"Lucknow", name:"Arpita Singh", actualDOJ:"2024-02-01", offerMonth:"2024-12-23", phone:"9717344700", resignationAcceptance:"Done", proposedDOJ:"2024-02-01", owner:"Nivedita", joiningStatus:"Joined", ctc:45000, statusCode:"Red", notes:"", createdAt:"2024-01-01", updatedAt:"2024-01-01", deleted:false },
  { id:3, sn:3, client:"Vista Processed Foods", designation:"QA Officer", location:"Gurgaon", name:"Deependra Singh", actualDOJ:"2024-01-15", offerMonth:"2024-01-24", phone:"7905604617", resignationAcceptance:"Done", proposedDOJ:"2024-01-15", owner:"Chandni", joiningStatus:"Joined", ctc:41500, statusCode:"Green", notes:"", createdAt:"2024-01-01", updatedAt:"2024-01-01", deleted:false },
  { id:4, sn:4, client:"Gyandhara", designation:"Account Manager", location:"Lucknow", name:"Ram Singh", actualDOJ:"2024-02-15", offerMonth:"2024-01-24", phone:"7275780030", resignationAcceptance:"Done", proposedDOJ:"2024-02-28", owner:"Yogita", joiningStatus:"Joined", ctc:65166, statusCode:"Green", notes:"", createdAt:"2024-01-01", updatedAt:"2024-01-01", deleted:false },
  { id:5, sn:5, client:"Zytex", designation:"JRA", location:"Mumbai", name:"Shobha Prajapat", actualDOJ:"2024-01-08", offerMonth:"2024-01-24", phone:"9136275030", resignationAcceptance:"Done", proposedDOJ:"2024-01-08", owner:"Ruchi", joiningStatus:"Joined", ctc:15000, statusCode:"Green", notes:"", createdAt:"2024-01-01", updatedAt:"2024-01-01", deleted:false },
  { id:6, sn:6, client:"Alicon", designation:"Automation Engineer", location:"Pune", name:"Sagar Tandale", actualDOJ:"2024-02-08", offerMonth:"2024-01-24", phone:"9923286079", resignationAcceptance:"Done", proposedDOJ:"2024-02-08", owner:"Mansi", joiningStatus:"Joined", ctc:62500, statusCode:"Green", notes:"", createdAt:"2024-01-01", updatedAt:"2024-01-01", deleted:false },
  { id:7, sn:7, client:"Alicon", designation:"CTO", location:"Pune", name:"Vikram Aditya Rai", actualDOJ:"2026-06-12", offerMonth:"2026-04-05", phone:"9335040198", resignationAcceptance:"Pending", proposedDOJ:"2026-06-12", owner:"Ample Leap", joiningStatus:"Offered", ctc:112000, statusCode:"Orange", notes:"NA", createdAt:"2026-04-05", updatedAt:"2026-04-05", deleted:false },
  { id:8, sn:8, client:"Metal Seam", designation:"GM Maintenance", location:"Lucknow", name:"Shailendra Mishra", actualDOJ:"2024-02-01", offerMonth:"2024-01-24", phone:"9811959434", resignationAcceptance:"Done", proposedDOJ:"2024-02-01", owner:"Manish Sir", joiningStatus:"Joined", ctc:160836, statusCode:"Green", notes:"", createdAt:"2024-01-01", updatedAt:"2024-01-01", deleted:false },
  { id:9, sn:9, client:"Kanoria", designation:"Sales Manager", location:"Kolkata", name:"Godfray", actualDOJ:"2024-02-01", offerMonth:"2024-01-24", phone:"9836831120", resignationAcceptance:"Done", proposedDOJ:"2024-02-01", owner:"Yogita", joiningStatus:"Joined", ctc:82666, statusCode:"Green", notes:"", createdAt:"2024-01-01", updatedAt:"2024-01-01", deleted:false },
  { id:10, sn:10, client:"Gyandhara", designation:"Admin Executive", location:"Lucknow", name:"Kamal Kant", actualDOJ:"2024-01-29", offerMonth:"2024-01-24", phone:"8630380020", resignationAcceptance:"Done", proposedDOJ:"2024-01-29", owner:"Chandni", joiningStatus:"Joined", ctc:25000, statusCode:"Green", notes:"", createdAt:"2024-01-01", updatedAt:"2024-01-01", deleted:false },
  { id:11, sn:11, client:"Avadh Rail", designation:"Track Design Executive", location:"Lucknow", name:"Shahab Alam", actualDOJ:"", offerMonth:"2024-01-24", phone:"8318206354", resignationAcceptance:"Pending", proposedDOJ:"", owner:"Nivedita", joiningStatus:"Offered", ctc:75000, statusCode:"Red", notes:"", createdAt:"2024-01-01", updatedAt:"2024-01-01", deleted:false },
  { id:12, sn:12, client:"Cornish", designation:"Sales Manager", location:"Delhi", name:"Raghuvansh", actualDOJ:"2024-01-24", offerMonth:"2024-01-24", phone:"9654799216", resignationAcceptance:"Pending", proposedDOJ:"2024-01-24", owner:"Pragya", joiningStatus:"Joined", ctc:55555, statusCode:"Red", notes:"", createdAt:"2024-01-01", updatedAt:"2024-01-01", deleted:false },
  { id:13, sn:13, client:"Skylark Food", designation:"Quality Head", location:"Sonipat", name:"Tana Sabane", actualDOJ:"2024-02-12", offerMonth:"2024-02-24", phone:"9833753758", resignationAcceptance:"Done", proposedDOJ:"2024-02-12", owner:"Chandni", joiningStatus:"Joined", ctc:172500, statusCode:"Green", notes:"", createdAt:"2024-01-01", updatedAt:"2024-01-01", deleted:false },
  { id:14, sn:14, client:"Payal Group", designation:"Capex Head", location:"Delhi", name:"Gaurav Sharma", actualDOJ:"2024-02-12", offerMonth:"2024-01-24", phone:"7073930744", resignationAcceptance:"Done", proposedDOJ:"2024-02-12", owner:"Payal", joiningStatus:"Joined", ctc:241666, statusCode:"Green", notes:"", createdAt:"2024-01-01", updatedAt:"2024-01-01", deleted:false },
  { id:15, sn:15, client:"Alicon", designation:"HR Manager", location:"Pune", name:"Sarvanand Pandey", actualDOJ:"", offerMonth:"2024-05-22", phone:"", resignationAcceptance:"Pending", proposedDOJ:"2024-06-20", owner:"Sandeep", joiningStatus:"Backout", ctc:65000, statusCode:"Red", notes:"", createdAt:"2024-01-01", updatedAt:"2024-01-01", deleted:false },
];

// ─── UTILITY ──────────────────────────────────────────────────────────────────
const fmt = (n) => n?.toLocaleString("en-IN") ?? "—";
const fmtDate = (d) => {
  if (!d) return "—";
  try { return new Date(d).toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"}); }
  catch { return d; }
};
const today = new Date();
const thisMonth = today.getMonth();
const thisYear = today.getFullYear();

const STATUS_COLOR = {
  Joined:"#22c55e", Offered:"#f97316", offered:"#f97316", Backout:"#ef4444",
  Left:"#8b5cf6", Rejected:"#dc2626", Hold:"#eab308", Cancelled:"#6b7280",
};
const STATUS_BG = {
  Joined:"#dcfce7", Offered:"#ffedd5", offered:"#ffedd5", Backout:"#fee2e2",
  Left:"#ede9fe", Rejected:"#fee2e2", Hold:"#fef9c3", Cancelled:"#f3f4f6",
};

function Badge({ status, code }) {
  if (code) {
    const found = INITIAL_MASTERS.statusCodes.find(s=>s.code===code);
    const color = found?.color || "#6b7280";
    return <span style={{background:color+"22",color,border:`1px solid ${color}44`,padding:"2px 8px",borderRadius:12,fontSize:11,fontWeight:600,letterSpacing:.3}}>{code}</span>;
  }
  const color = STATUS_COLOR[status]||"#6b7280";
  const bg = STATUS_BG[status]||"#f3f4f6";
  return <span style={{background:bg,color,padding:"2px 8px",borderRadius:12,fontSize:11,fontWeight:600,letterSpacing:.3}}>{status||"—"}</span>;
}

// ─── ICONS ────────────────────────────────────────────────────────────────────
const Icon = ({ name, size=16 }) => {
  const icons = {
    dashboard: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>,
    users: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
    settings: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/></svg>,
    plus: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
    search: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
    edit: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
    trash: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>,
    eye: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
    download: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
    upload: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>,
    bell: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
    chevronDown: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><polyline points="6 9 12 15 18 9"/></svg>,
    x: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
    filter: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>,
    chart: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
    logout: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
    menu: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>,
  };
  return icons[name] || null;
};

// ─── MINI CHART ───────────────────────────────────────────────────────────────
function MiniBar({ data, height=60 }) {
  if (!data?.length) return null;
  const max = Math.max(...data.map(d=>d.value), 1);
  return (
    <div style={{display:"flex",alignItems:"flex-end",gap:4,height,paddingTop:4}}>
      {data.map((d,i)=>(
        <div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:2}}>
          <div style={{width:"100%",background:d.color||"#3b82f6",borderRadius:"3px 3px 0 0",height:Math.max(4,(d.value/max)*(height-20)),transition:"height .3s"}}/>
          <span style={{fontSize:9,color:"#94a3b8",textAlign:"center",lineHeight:1}}>{d.label}</span>
        </div>
      ))}
    </div>
  );
}

function DonutChart({ data, size=100 }) {
  const total = data.reduce((a,b)=>a+b.value,0)||1;
  let cum = 0;
  const slices = data.map(d=>{
    const pct = d.value/total;
    const start = cum; cum += pct;
    return {...d, start, pct};
  });
  const polarToCart = (cx,cy,r,angle) => ({
    x: cx + r * Math.cos(angle - Math.PI/2),
    y: cy + r * Math.sin(angle - Math.PI/2),
  });
  const r=40, cx=50, cy=50;
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      {slices.map((s,i)=>{
        if(s.pct===0) return null;
        const startAngle = s.start * 2 * Math.PI;
        const endAngle = (s.start + s.pct) * 2 * Math.PI;
        const p1 = polarToCart(cx,cy,r,startAngle);
        const p2 = polarToCart(cx,cy,r,endAngle);
        const large = s.pct > 0.5 ? 1 : 0;
        return <path key={i} d={`M${cx},${cy} L${p1.x},${p1.y} A${r},${r} 0 ${large},1 ${p2.x},${p2.y} Z`} fill={s.color} opacity={0.9}/>;
      })}
      <circle cx={cx} cy={cy} r={26} fill="white"/>
      <text x={cx} y={cy+1} textAnchor="middle" dominantBaseline="middle" fontSize={14} fontWeight={700} fill="#1e293b">{total}</text>
      <text x={cx} y={cy+11} textAnchor="middle" dominantBaseline="middle" fontSize={7} fill="#94a3b8">TOTAL</text>
    </svg>
  );
}

// ─── AUTH ─────────────────────────────────────────────────────────────────────
const USERS = [
  { id:1, name:"Admin User", email:"admin@ampleleap.com", password:"admin123", role:"admin" },
  { id:2, name:"Recruiter", email:"recruiter@ampleleap.com", password:"rec123", role:"recruiter" },
  { id:3, name:"Viewer", email:"viewer@ampleleap.com", password:"view123", role:"viewer" },
];

function LoginScreen({ onLogin }) {
  const [email,setEmail]=useState("admin@ampleleap.com");
  const [password,setPassword]=useState("admin123");
  const [error,setError]=useState("");
  const [loading,setLoading]=useState(false);

  const handle = (e) => {
    e.preventDefault();
    setLoading(true); setError("");
    setTimeout(()=>{
      const u = USERS.find(u=>u.email===email&&u.password===password);
      if(u) onLogin(u);
      else { setError("Invalid credentials. Try admin@ampleleap.com / admin123"); setLoading(false); }
    },600);
  };

  return (
    <div style={{minHeight:"100vh",background:"linear-gradient(135deg,#0f172a 0%,#1e3a5f 50%,#0f172a 100%)",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Inter',system-ui,sans-serif"}}>
      <div style={{background:"white",borderRadius:20,padding:"48px 40px",width:420,boxShadow:"0 25px 50px rgba(0,0,0,.4)"}}>
        <div style={{textAlign:"center",marginBottom:32}}>
          <div style={{width:56,height:56,background:"linear-gradient(135deg,#2563eb,#7c3aed)",borderRadius:16,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 16px",boxShadow:"0 8px 24px #2563eb44"}}>
            <svg width={28} height={28} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          </div>
          <h1 style={{fontSize:24,fontWeight:800,color:"#0f172a",margin:0}}>Ample Leap CRM</h1>
          <p style={{color:"#64748b",marginTop:4,fontSize:14}}>Recruitment Joining Tracker</p>
        </div>
        {error && <div style={{background:"#fee2e2",color:"#991b1b",padding:"10px 14px",borderRadius:8,fontSize:13,marginBottom:16}}>{error}</div>}
        <form onSubmit={handle}>
          <label style={{display:"block",fontSize:13,fontWeight:600,color:"#374151",marginBottom:4}}>Email</label>
          <input value={email} onChange={e=>setEmail(e.target.value)} type="email" required style={{width:"100%",padding:"10px 14px",borderRadius:8,border:"1.5px solid #e2e8f0",fontSize:14,marginBottom:16,boxSizing:"border-box",outline:"none"}} />
          <label style={{display:"block",fontSize:13,fontWeight:600,color:"#374151",marginBottom:4}}>Password</label>
          <input value={password} onChange={e=>setPassword(e.target.value)} type="password" required style={{width:"100%",padding:"10px 14px",borderRadius:8,border:"1.5px solid #e2e8f0",fontSize:14,marginBottom:24,boxSizing:"border-box",outline:"none"}} />
          <button type="submit" disabled={loading} style={{width:"100%",padding:"12px",background:"linear-gradient(135deg,#2563eb,#7c3aed)",color:"white",border:"none",borderRadius:10,fontWeight:700,fontSize:15,cursor:"pointer",opacity:loading?.7:1}}>
            {loading?"Signing in…":"Sign In"}
          </button>
        </form>
        <div style={{marginTop:20,padding:14,background:"#f8fafc",borderRadius:8,fontSize:12,color:"#64748b"}}>
          <strong>Demo logins:</strong><br/>
          Admin: admin@ampleleap.com / admin123<br/>
          Recruiter: recruiter@ampleleap.com / rec123<br/>
          Viewer: viewer@ampleleap.com / view123
        </div>
      </div>
    </div>
  );
}

// ─── MODAL ────────────────────────────────────────────────────────────────────
function Modal({ open, onClose, title, children, wide }) {
  if (!open) return null;
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.5)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:16}} onClick={onClose}>
      <div style={{background:"white",borderRadius:16,width:"100%",maxWidth:wide?860:560,maxHeight:"90vh",overflow:"auto",boxShadow:"0 25px 50px rgba(0,0,0,.3)"}} onClick={e=>e.stopPropagation()}>
        <div style={{padding:"20px 24px",borderBottom:"1px solid #f1f5f9",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <h3 style={{margin:0,fontSize:18,fontWeight:700,color:"#0f172a"}}>{title}</h3>
          <button onClick={onClose} style={{background:"#f1f5f9",border:"none",borderRadius:8,padding:6,cursor:"pointer",display:"flex"}}>
            <Icon name="x" size={16}/>
          </button>
        </div>
        <div style={{padding:24}}>{children}</div>
      </div>
    </div>
  );
}

// ─── CANDIDATE FORM ───────────────────────────────────────────────────────────
function CandidateForm({ initial, masters, onSave, onCancel }) {
  const blank = { client:"", designation:"", location:"", name:"", actualDOJ:"", offerMonth:"", phone:"", resignationAcceptance:"Pending", proposedDOJ:"", owner:"", joiningStatus:"Offered", ctc:"", statusCode:"Orange", notes:"" };
  const [form,setForm] = useState(initial || blank);
  const set = (k,v) => setForm(f=>({...f,[k]:v}));
  const field = (label,key,type="text",placeholder="") => (
    <div style={{marginBottom:16}}>
      <label style={{display:"block",fontSize:12,fontWeight:600,color:"#475569",marginBottom:4,textTransform:"uppercase",letterSpacing:.5}}>{label}</label>
      <input type={type} value={form[key]||""} onChange={e=>set(key,e.target.value)} placeholder={placeholder}
        style={{width:"100%",padding:"9px 12px",borderRadius:8,border:"1.5px solid #e2e8f0",fontSize:14,boxSizing:"border-box",outline:"none"}} />
    </div>
  );
  const select = (label,key,opts) => (
    <div style={{marginBottom:16}}>
      <label style={{display:"block",fontSize:12,fontWeight:600,color:"#475569",marginBottom:4,textTransform:"uppercase",letterSpacing:.5}}>{label}</label>
      <select value={form[key]||""} onChange={e=>set(key,e.target.value)}
        style={{width:"100%",padding:"9px 12px",borderRadius:8,border:"1.5px solid #e2e8f0",fontSize:14,boxSizing:"border-box",outline:"none",background:"white"}}>
        <option value="">— Select —</option>
        {opts.map(o=><option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );

  return (
    <div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 16px"}}>
        {select("Client Name","client",masters.clients)}
        {field("Designation / Position","designation","text","e.g. Senior Manager")}
        {field("Location","location","text","e.g. Mumbai")}
        {field("Candidate Name","name","text","Full name")}
        {field("Phone No.","phone","tel","10-digit number")}
        {field("CTC Per Month (₹)","ctc","number","e.g. 85000")}
        {field("Offer Month","offerMonth","date")}
        {field("Proposed Date of Joining","proposedDOJ","date")}
        {field("Actual Date of Joining","actualDOJ","date")}
        {select("Resignation Acceptance","resignationAcceptance",masters.resignationStatus)}
        {select("Owner Name","owner",masters.owners)}
        {select("Joining Status","joiningStatus",masters.joiningStatus)}
        {select("Status Code","statusCode",masters.statusCodes.map(s=>s.code))}
      </div>
      <div style={{marginBottom:16}}>
        <label style={{display:"block",fontSize:12,fontWeight:600,color:"#475569",marginBottom:4,textTransform:"uppercase",letterSpacing:.5}}>Notes</label>
        <textarea value={form.notes||""} onChange={e=>set("notes",e.target.value)} rows={3}
          style={{width:"100%",padding:"9px 12px",borderRadius:8,border:"1.5px solid #e2e8f0",fontSize:14,boxSizing:"border-box",outline:"none",resize:"vertical"}} />
      </div>
      <div style={{display:"flex",gap:10,justifyContent:"flex-end"}}>
        <button onClick={onCancel} style={{padding:"10px 20px",background:"#f1f5f9",border:"none",borderRadius:8,fontWeight:600,cursor:"pointer",fontSize:14}}>Cancel</button>
        <button onClick={()=>onSave(form)} style={{padding:"10px 20px",background:"linear-gradient(135deg,#2563eb,#7c3aed)",color:"white",border:"none",borderRadius:8,fontWeight:600,cursor:"pointer",fontSize:14}}>Save Candidate</button>
      </div>
    </div>
  );
}

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
function Dashboard({ candidates, masters }) {
  const active = candidates.filter(c=>!c.deleted);
  const joined = active.filter(c=>c.joiningStatus?.toLowerCase()==="joined");
  const offered = active.filter(c=>["offered","offered"].includes(c.joiningStatus?.toLowerCase()));
  const pending = active.filter(c=>c.resignationAcceptance?.toLowerCase()==="pending");
  const thisMonthJ = active.filter(c=>{
    if(!c.actualDOJ) return false;
    const d = new Date(c.actualDOJ);
    return d.getMonth()===thisMonth && d.getFullYear()===thisYear;
  });
  const nextMonthJ = active.filter(c=>{
    if(!c.proposedDOJ) return false;
    const d = new Date(c.proposedDOJ);
    const nm = (thisMonth+1)%12, ny = thisMonth===11?thisYear+1:thisYear;
    return d.getMonth()===nm && d.getFullYear()===ny;
  });

  const cards = [
    { label:"Total Candidates", value:active.length, color:"#2563eb", bg:"#eff6ff" },
    { label:"Offered", value:offered.length, color:"#f97316", bg:"#fff7ed" },
    { label:"Joined", value:joined.length, color:"#22c55e", bg:"#f0fdf4" },
    { label:"Resigned Pending", value:pending.length, color:"#ef4444", bg:"#fef2f2" },
    { label:"Joining This Month", value:thisMonthJ.length, color:"#8b5cf6", bg:"#f5f3ff" },
    { label:"Joining Next Month", value:nextMonthJ.length, color:"#06b6d4", bg:"#ecfeff" },
  ];

  // Status distribution
  const statusDist = masters.joiningStatus.map(s=>{
    const v = active.filter(c=>c.joiningStatus?.toLowerCase()===s.toLowerCase()).length;
    return { label:s, value:v, color:STATUS_COLOR[s]||"#94a3b8" };
  }).filter(x=>x.value>0);

  // Client distribution
  const clientDist = [...new Set(active.map(c=>c.client).filter(Boolean))].map(cl=>({
    label:cl.length>8?cl.slice(0,8)+"…":cl,
    value:active.filter(c=>c.client===cl).length,
    color:"#3b82f6"
  })).sort((a,b)=>b.value-a.value).slice(0,8);

  // Owner distribution
  const ownerDist = [...new Set(active.map(c=>c.owner).filter(Boolean))].map(o=>({
    label:o.length>8?o.slice(0,8)+"…":o,
    value:active.filter(c=>c.owner===o).length,
    color:"#8b5cf6"
  })).sort((a,b)=>b.value-a.value).slice(0,8);

  // Monthly trend
  const months = Array.from({length:6},(_,i)=>{
    const d = new Date(); d.setMonth(d.getMonth()-5+i);
    return { month:d.getMonth(), year:d.getFullYear(), label:d.toLocaleString("en-IN",{month:"short"}) };
  });
  const monthlyTrend = months.map(m=>({
    label:m.label,
    value:active.filter(c=>{
      if(!c.actualDOJ) return false;
      const d=new Date(c.actualDOJ);
      return d.getMonth()===m.month && d.getFullYear()===m.year;
    }).length,
    color:"#22c55e"
  }));

  // Upcoming joinings
  const upcoming = active.filter(c=>{
    if(!c.proposedDOJ) return false;
    const d = new Date(c.proposedDOJ);
    return d >= today && d <= new Date(today.getTime()+14*86400000);
  }).sort((a,b)=>new Date(a.proposedDOJ)-new Date(b.proposedDOJ));

  return (
    <div>
      <div style={{marginBottom:24}}>
        <h2 style={{fontSize:22,fontWeight:800,color:"#0f172a",margin:0}}>Dashboard</h2>
        <p style={{color:"#64748b",margin:"4px 0 0",fontSize:14}}>Real-time recruitment overview</p>
      </div>

      {/* KPI Cards */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))",gap:14,marginBottom:28}}>
        {cards.map(c=>(
          <div key={c.label} style={{background:"white",borderRadius:14,padding:18,boxShadow:"0 1px 3px rgba(0,0,0,.06)",border:"1px solid #f1f5f9"}}>
            <div style={{fontSize:28,fontWeight:800,color:c.color}}>{c.value}</div>
            <div style={{fontSize:12,color:"#64748b",marginTop:2,fontWeight:500,lineHeight:1.3}}>{c.label}</div>
            <div style={{width:32,height:3,background:c.color,borderRadius:2,marginTop:10,opacity:.4}}/>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:16,marginBottom:28}}>
        <div style={{background:"white",borderRadius:14,padding:20,boxShadow:"0 1px 3px rgba(0,0,0,.06)",border:"1px solid #f1f5f9"}}>
          <div style={{fontSize:13,fontWeight:700,color:"#0f172a",marginBottom:8}}>Joining Status Distribution</div>
          <div style={{display:"flex",alignItems:"center",gap:16}}>
            <DonutChart data={statusDist} size={90}/>
            <div style={{flex:1}}>
              {statusDist.map(s=>(
                <div key={s.label} style={{display:"flex",alignItems:"center",gap:6,marginBottom:4}}>
                  <div style={{width:8,height:8,borderRadius:"50%",background:s.color,flexShrink:0}}/>
                  <span style={{fontSize:11,color:"#475569",flex:1}}>{s.label}</span>
                  <span style={{fontSize:11,fontWeight:700,color:"#0f172a"}}>{s.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div style={{background:"white",borderRadius:14,padding:20,boxShadow:"0 1px 3px rgba(0,0,0,.06)",border:"1px solid #f1f5f9"}}>
          <div style={{fontSize:13,fontWeight:700,color:"#0f172a",marginBottom:4}}>Client-wise Candidates</div>
          <MiniBar data={clientDist} height={80}/>
        </div>
        <div style={{background:"white",borderRadius:14,padding:20,boxShadow:"0 1px 3px rgba(0,0,0,.06)",border:"1px solid #f1f5f9"}}>
          <div style={{fontSize:13,fontWeight:700,color:"#0f172a",marginBottom:4}}>Monthly Joining Trend</div>
          <MiniBar data={monthlyTrend} height={80}/>
        </div>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
        {/* Upcoming joinings */}
        <div style={{background:"white",borderRadius:14,padding:20,boxShadow:"0 1px 3px rgba(0,0,0,.06)",border:"1px solid #f1f5f9"}}>
          <div style={{fontSize:13,fontWeight:700,color:"#0f172a",marginBottom:12}}>⏰ Upcoming Joinings (14 days)</div>
          {upcoming.length===0 ? <div style={{color:"#94a3b8",fontSize:13}}>No upcoming joinings in the next 14 days.</div> :
            upcoming.map(c=>(
              <div key={c.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:"1px solid #f8fafc"}}>
                <div>
                  <div style={{fontSize:13,fontWeight:600,color:"#0f172a"}}>{c.name}</div>
                  <div style={{fontSize:11,color:"#94a3b8"}}>{c.client} · {c.designation}</div>
                </div>
                <div style={{fontSize:12,color:"#f97316",fontWeight:600}}>{fmtDate(c.proposedDOJ)}</div>
              </div>
            ))
          }
        </div>
        {/* Owner distribution */}
        <div style={{background:"white",borderRadius:14,padding:20,boxShadow:"0 1px 3px rgba(0,0,0,.06)",border:"1px solid #f1f5f9"}}>
          <div style={{fontSize:13,fontWeight:700,color:"#0f172a",marginBottom:8}}>Owner-wise Candidates</div>
          <MiniBar data={ownerDist} height={80}/>
          <div style={{marginTop:12}}>
            {ownerDist.map(o=>(
              <div key={o.label} style={{display:"flex",justifyContent:"space-between",fontSize:12,color:"#475569",padding:"3px 0"}}>
                <span>{o.label}</span><span style={{fontWeight:700,color:"#0f172a"}}>{o.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── CANDIDATES TABLE ─────────────────────────────────────────────────────────
function CandidatesPage({ candidates, masters, user, onAdd, onEdit, onDelete, onView }) {
  const [search,setSearch]=useState("");
  const [filters,setFilters]=useState({client:"",owner:"",status:"",statusCode:"",location:""});
  const [page,setPage]=useState(1);
  const [sort,setSort]=useState({key:"sn",dir:1});
  const [showFilters,setShowFilters]=useState(false);
  const PER = 15;

  const setFilter = (k,v) => { setFilters(f=>({...f,[k]:v})); setPage(1); };

  const filtered = useMemo(()=>{
    let r = candidates.filter(c=>!c.deleted);
    if(search) {
      const q = search.toLowerCase();
      r = r.filter(c=>[c.name,c.client,c.designation,c.location,c.phone,c.owner].some(x=>x?.toLowerCase().includes(q)));
    }
    if(filters.client) r=r.filter(c=>c.client===filters.client);
    if(filters.owner) r=r.filter(c=>c.owner===filters.owner);
    if(filters.status) r=r.filter(c=>c.joiningStatus?.toLowerCase()===filters.status.toLowerCase());
    if(filters.statusCode) r=r.filter(c=>c.statusCode===filters.statusCode);
    if(filters.location) r=r.filter(c=>c.location?.toLowerCase().includes(filters.location.toLowerCase()));
    r = [...r].sort((a,b)=>{
      const av=a[sort.key], bv=b[sort.key];
      if(av==null) return 1; if(bv==null) return -1;
      return (av>bv?1:-1)*sort.dir;
    });
    return r;
  },[candidates,search,filters,sort]);

  const pages = Math.ceil(filtered.length/PER)||1;
  const shown = filtered.slice((page-1)*PER, page*PER);

  const toggleSort = (k) => setSort(s=>s.key===k?{key:k,dir:-s.dir}:{key:k,dir:1});
  const SortArrow = ({k})=><span style={{color:"#94a3b8",fontSize:10,marginLeft:2}}>{sort.key===k?(sort.dir===1?"▲":"▼"):"⇅"}</span>;

  const canEdit = user.role!=="viewer";
  const canDelete = user.role==="admin";

  const exportCSV = () => {
    const cols = ["SN","Client","Designation","Location","Candidate Name","Phone","Offer Month","Proposed DOJ","Actual DOJ","Resignation","Owner","Status","CTC","Code","Notes"];
    const rows = filtered.map(c=>[c.sn,c.client,c.designation,c.location,c.name,c.phone,c.offerMonth,c.proposedDOJ,c.actualDOJ,c.resignationAcceptance,c.owner,c.joiningStatus,c.ctc,c.statusCode,c.notes]);
    const csv = [cols,...rows].map(r=>r.map(v=>`"${v||""}"`).join(",")).join("\n");
    const a=document.createElement("a"); a.href="data:text/csv;charset=utf-8,"+encodeURIComponent(csv); a.download="candidates.csv"; a.click();
  };

  const activeFiltersCount = Object.values(filters).filter(Boolean).length;

  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20,flexWrap:"wrap",gap:10}}>
        <div>
          <h2 style={{fontSize:22,fontWeight:800,color:"#0f172a",margin:0}}>Candidates</h2>
          <p style={{color:"#64748b",margin:"4px 0 0",fontSize:14}}>{filtered.length} records</p>
        </div>
        <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
          {canEdit && <button onClick={onAdd} style={{display:"flex",alignItems:"center",gap:6,padding:"9px 16px",background:"linear-gradient(135deg,#2563eb,#7c3aed)",color:"white",border:"none",borderRadius:9,fontWeight:600,cursor:"pointer",fontSize:13}}>
            <Icon name="plus" size={14}/> Add Candidate
          </button>}
          <button onClick={exportCSV} style={{display:"flex",alignItems:"center",gap:6,padding:"9px 14px",background:"#f1f5f9",border:"none",borderRadius:9,fontWeight:600,cursor:"pointer",fontSize:13,color:"#374151"}}>
            <Icon name="download" size={14}/> Export CSV
          </button>
        </div>
      </div>

      {/* Search + Filters */}
      <div style={{background:"white",borderRadius:12,padding:14,marginBottom:16,boxShadow:"0 1px 3px rgba(0,0,0,.06)",border:"1px solid #f1f5f9"}}>
        <div style={{display:"flex",gap:10,marginBottom:showFilters?12:0,flexWrap:"wrap"}}>
          <div style={{flex:1,minWidth:200,display:"flex",alignItems:"center",gap:8,background:"#f8fafc",borderRadius:8,padding:"8px 12px",border:"1.5px solid #e2e8f0"}}>
            <Icon name="search" size={14}/><input value={search} onChange={e=>{setSearch(e.target.value);setPage(1);}} placeholder="Search candidates, clients, phone…" style={{border:"none",background:"none",outline:"none",fontSize:13,width:"100%"}}/>
          </div>
          <button onClick={()=>setShowFilters(f=>!f)} style={{display:"flex",alignItems:"center",gap:6,padding:"8px 14px",background:activeFiltersCount>0?"#eff6ff":"#f8fafc",border:"1.5px solid "+(activeFiltersCount>0?"#bfdbfe":"#e2e8f0"),borderRadius:8,cursor:"pointer",fontSize:13,fontWeight:600,color:activeFiltersCount>0?"#1d4ed8":"#374151"}}>
            <Icon name="filter" size={13}/> Filters {activeFiltersCount>0&&`(${activeFiltersCount})`}
          </button>
        </div>
        {showFilters && (
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))",gap:8}}>
            {[
              ["Client",filters.client,v=>setFilter("client",v),["","..."].concat(masters.clients)],
              ["Owner",filters.owner,v=>setFilter("owner",v),["","..."].concat(masters.owners)],
              ["Joining Status",filters.status,v=>setFilter("status",v),["","..."].concat(masters.joiningStatus)],
              ["Status Code",filters.statusCode,v=>setFilter("statusCode",v),["","..."].concat(masters.statusCodes.map(s=>s.code))],
            ].map(([label,val,fn,opts])=>(
              <div key={label}>
                <label style={{fontSize:11,fontWeight:600,color:"#64748b",display:"block",marginBottom:2}}>{label}</label>
                <select value={val} onChange={e=>fn(e.target.value)} style={{width:"100%",padding:"7px 10px",borderRadius:7,border:"1.5px solid #e2e8f0",fontSize:13,background:"white",outline:"none"}}>
                  <option value="">All</option>
                  {opts.filter(o=>o&&o!=="...").map(o=><option key={o} value={o}>{o}</option>)}
                </select>
              </div>
            ))}
            <div>
              <label style={{fontSize:11,fontWeight:600,color:"#64748b",display:"block",marginBottom:2}}>Location</label>
              <input value={filters.location} onChange={e=>setFilter("location",e.target.value)} placeholder="Filter by city…" style={{width:"100%",padding:"7px 10px",borderRadius:7,border:"1.5px solid #e2e8f0",fontSize:13,boxSizing:"border-box",outline:"none"}}/>
            </div>
            {activeFiltersCount>0 && <div style={{display:"flex",alignItems:"flex-end"}}>
              <button onClick={()=>{setFilters({client:"",owner:"",status:"",statusCode:"",location:""});setPage(1);}} style={{width:"100%",padding:"7px 10px",borderRadius:7,border:"1.5px solid #fecaca",background:"#fef2f2",color:"#dc2626",fontSize:13,fontWeight:600,cursor:"pointer"}}>Clear All</button>
            </div>}
          </div>
        )}
      </div>

      {/* Table */}
      <div style={{background:"white",borderRadius:12,boxShadow:"0 1px 3px rgba(0,0,0,.06)",border:"1px solid #f1f5f9",overflow:"auto"}}>
        <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
          <thead>
            <tr style={{background:"#f8fafc",borderBottom:"1.5px solid #e2e8f0"}}>
              {[["sn","#",36],["client","Client",130],["name","Candidate",150],["designation","Position",130],["location","Location",90],["phone","Phone",110],["offerMonth","Offer Month",110],["proposedDOJ","Proposed DOJ",110],["actualDOJ","Actual DOJ",110],["owner","Owner",110],["joiningStatus","Status",100],["ctc","CTC/Mo",90],["statusCode","Code",70]].map(([k,l,w])=>(
                <th key={k} onClick={()=>toggleSort(k)} style={{padding:"10px 12px",textAlign:"left",fontWeight:700,color:"#475569",cursor:"pointer",userSelect:"none",fontSize:11,textTransform:"uppercase",letterSpacing:.4,minWidth:w}}>
                  {l}<SortArrow k={k}/>
                </th>
              ))}
              <th style={{padding:"10px 12px",width:90}}></th>
            </tr>
          </thead>
          <tbody>
            {shown.length===0 && <tr><td colSpan={14} style={{padding:40,textAlign:"center",color:"#94a3b8"}}>No candidates found. Try adjusting your filters.</td></tr>}
            {shown.map((c,i)=>(
              <tr key={c.id} style={{borderBottom:"1px solid #f8fafc",background:i%2===0?"white":"#fcfcfd"}} onMouseEnter={e=>e.currentTarget.style.background="#f0f9ff"} onMouseLeave={e=>e.currentTarget.style.background=i%2===0?"white":"#fcfcfd"}>
                <td style={{padding:"10px 12px",color:"#94a3b8",fontWeight:600}}>{c.sn}</td>
                <td style={{padding:"10px 12px",fontWeight:600,color:"#1e293b"}}>{c.client||"—"}</td>
                <td style={{padding:"10px 12px"}}>
                  <div style={{fontWeight:600,color:"#0f172a"}}>{c.name}</div>
                  {c.phone&&<div style={{fontSize:11,color:"#94a3b8"}}>{c.phone}</div>}
                </td>
                <td style={{padding:"10px 12px",color:"#475569"}}>{c.designation||"—"}</td>
                <td style={{padding:"10px 12px",color:"#475569"}}>{c.location||"—"}</td>
                <td style={{padding:"10px 12px",color:"#64748b",fontFamily:"monospace"}}>{c.phone||"—"}</td>
                <td style={{padding:"10px 12px",color:"#64748b"}}>{fmtDate(c.offerMonth)}</td>
                <td style={{padding:"10px 12px",color:"#64748b"}}>{fmtDate(c.proposedDOJ)}</td>
                <td style={{padding:"10px 12px",color:"#64748b"}}>{fmtDate(c.actualDOJ)}</td>
                <td style={{padding:"10px 12px",color:"#475569"}}>{c.owner||"—"}</td>
                <td style={{padding:"10px 12px"}}><Badge status={c.joiningStatus}/></td>
                <td style={{padding:"10px 12px",color:"#0f172a",fontWeight:600}}>₹{fmt(c.ctc)}</td>
                <td style={{padding:"10px 12px"}}><Badge code={c.statusCode}/></td>
                <td style={{padding:"10px 12px"}}>
                  <div style={{display:"flex",gap:4}}>
                    <button onClick={()=>onView(c)} style={{padding:5,background:"#f0f9ff",border:"none",borderRadius:6,cursor:"pointer",color:"#2563eb",display:"flex"}} title="View"><Icon name="eye" size={13}/></button>
                    {canEdit&&<button onClick={()=>onEdit(c)} style={{padding:5,background:"#f0fdf4",border:"none",borderRadius:6,cursor:"pointer",color:"#16a34a",display:"flex"}} title="Edit"><Icon name="edit" size={13}/></button>}
                    {canDelete&&<button onClick={()=>onDelete(c.id)} style={{padding:5,background:"#fef2f2",border:"none",borderRadius:6,cursor:"pointer",color:"#dc2626",display:"flex"}} title="Delete"><Icon name="trash" size={13}/></button>}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:14,flexWrap:"wrap",gap:8}}>
        <span style={{fontSize:13,color:"#64748b"}}>Showing {Math.min((page-1)*PER+1,filtered.length)}–{Math.min(page*PER,filtered.length)} of {filtered.length}</span>
        <div style={{display:"flex",gap:4}}>
          {[1,page-1].filter(p=>p>=1&&p<page).filter((v,i,a)=>a.indexOf(v)===i).concat([page]).concat([page+1,pages].filter(p=>p>page&&p<=pages).filter((v,i,a)=>a.indexOf(v)===i)).slice(0,7).map(p=>(
            <button key={p} onClick={()=>setPage(p)} style={{width:32,height:32,border:"1.5px solid "+(p===page?"#2563eb":"#e2e8f0"),borderRadius:7,background:p===page?"#2563eb":"white",color:p===page?"white":"#374151",fontWeight:600,cursor:"pointer",fontSize:13}}>{p}</button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── VIEW CANDIDATE ───────────────────────────────────────────────────────────
function ViewCandidate({ candidate: c }) {
  if(!c) return null;
  const row = (label,value) => (
    <div style={{display:"flex",borderBottom:"1px solid #f8fafc",padding:"10px 0"}}>
      <div style={{width:180,fontSize:12,fontWeight:700,color:"#64748b",textTransform:"uppercase",letterSpacing:.4,flexShrink:0}}>{label}</div>
      <div style={{fontSize:14,color:"#0f172a",fontWeight:500}}>{value||"—"}</div>
    </div>
  );
  const statusInfo = INITIAL_MASTERS.statusCodes.find(s=>s.code===c.statusCode);
  return (
    <div>
      <div style={{display:"flex",alignItems:"center",gap:16,marginBottom:20,paddingBottom:20,borderBottom:"1px solid #f1f5f9"}}>
        <div style={{width:56,height:56,borderRadius:14,background:"linear-gradient(135deg,#2563eb22,#7c3aed22)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,fontWeight:800,color:"#2563eb"}}>
          {c.name?.[0]?.toUpperCase()}
        </div>
        <div>
          <h3 style={{margin:0,fontSize:20,fontWeight:800,color:"#0f172a"}}>{c.name}</h3>
          <p style={{margin:"2px 0 0",color:"#64748b",fontSize:13}}>{c.designation} · {c.client}</p>
          <div style={{display:"flex",gap:6,marginTop:6}}><Badge status={c.joiningStatus}/><Badge code={c.statusCode}/></div>
        </div>
      </div>
      {statusInfo && <div style={{background:statusInfo.color+"11",border:`1px solid ${statusInfo.color}33`,borderRadius:8,padding:"8px 14px",marginBottom:16,fontSize:13,color:statusInfo.color,fontWeight:600}}>
        ● {statusInfo.label}
      </div>}
      {row("Client", c.client)}
      {row("Designation", c.designation)}
      {row("Location", c.location)}
      {row("Phone", c.phone)}
      {row("Offer Month", fmtDate(c.offerMonth))}
      {row("Proposed DOJ", fmtDate(c.proposedDOJ))}
      {row("Actual DOJ", fmtDate(c.actualDOJ))}
      {row("Resignation Acceptance", c.resignationAcceptance)}
      {row("Owner", c.owner)}
      {row("CTC Per Month", c.ctc ? `₹${fmt(c.ctc)}` : "—")}
      {row("Notes", c.notes)}
    </div>
  );
}

// ─── MASTER DATA PAGE ─────────────────────────────────────────────────────────
function MastersPage({ masters, setMasters }) {
  const [activeTab,setActiveTab]=useState("clients");
  const [newVal,setNewVal]=useState("");

  const tabs = [
    { key:"clients", label:"Clients" },
    { key:"owners", label:"Owners" },
    { key:"joiningStatus", label:"Joining Status" },
    { key:"resignationStatus", label:"Resignation Status" },
  ];

  const addItem = () => {
    if(!newVal.trim()) return;
    setMasters(m=>({...m,[activeTab]:[...m[activeTab],newVal.trim()]}));
    setNewVal("");
  };
  const removeItem = (i) => setMasters(m=>({...m,[activeTab]:m[activeTab].filter((_,idx)=>idx!==i)}));

  return (
    <div>
      <h2 style={{fontSize:22,fontWeight:800,color:"#0f172a",margin:"0 0 4px"}}>Master Data</h2>
      <p style={{color:"#64748b",margin:"0 0 20px",fontSize:14}}>Manage dropdown options used across the application.</p>

      <div style={{display:"flex",gap:6,marginBottom:20,flexWrap:"wrap"}}>
        {tabs.map(t=>(
          <button key={t.key} onClick={()=>setActiveTab(t.key)} style={{padding:"8px 16px",borderRadius:8,border:"1.5px solid "+(activeTab===t.key?"#2563eb":"#e2e8f0"),background:activeTab===t.key?"#2563eb":"white",color:activeTab===t.key?"white":"#374151",fontWeight:600,cursor:"pointer",fontSize:13}}>
            {t.label}
          </button>
        ))}
      </div>

      <div style={{background:"white",borderRadius:14,padding:24,boxShadow:"0 1px 3px rgba(0,0,0,.06)",border:"1px solid #f1f5f9",maxWidth:540}}>
        <div style={{display:"flex",gap:8,marginBottom:20}}>
          <input value={newVal} onChange={e=>setNewVal(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addItem()} placeholder={`Add new ${tabs.find(t=>t.key===activeTab)?.label?.slice(0,-1)}…`}
            style={{flex:1,padding:"9px 14px",borderRadius:8,border:"1.5px solid #e2e8f0",fontSize:14,outline:"none"}}/>
          <button onClick={addItem} style={{padding:"9px 16px",background:"#2563eb",color:"white",border:"none",borderRadius:8,fontWeight:700,cursor:"pointer",fontSize:13,display:"flex",alignItems:"center",gap:5}}>
            <Icon name="plus" size={14}/> Add
          </button>
        </div>
        <div>
          {masters[activeTab]?.map((item,i)=>(
            <div key={i} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 14px",background:"#f8fafc",borderRadius:8,marginBottom:6}}>
              <span style={{fontSize:14,color:"#1e293b",fontWeight:500}}>{item}</span>
              <button onClick={()=>removeItem(i)} style={{padding:4,background:"#fef2f2",border:"none",borderRadius:6,cursor:"pointer",color:"#ef4444",display:"flex"}}>
                <Icon name="x" size={13}/>
              </button>
            </div>
          ))}
          {masters[activeTab]?.length===0 && <div style={{textAlign:"center",color:"#94a3b8",padding:20}}>No items yet.</div>}
        </div>
      </div>

      {/* Status Codes (read-only reference) */}
      <div style={{marginTop:24}}>
        <h3 style={{fontSize:15,fontWeight:700,color:"#0f172a",marginBottom:12}}>Status Code Reference</h3>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))",gap:10}}>
          {masters.statusCodes.map(s=>(
            <div key={s.code} style={{background:"white",borderRadius:10,padding:"12px 16px",border:`2px solid ${s.color}33`,display:"flex",alignItems:"center",gap:10}}>
              <div style={{width:14,height:14,borderRadius:"50%",background:s.color,flexShrink:0}}/>
              <div>
                <div style={{fontWeight:700,fontSize:13,color:s.color}}>{s.code}</div>
                <div style={{fontSize:11,color:"#64748b",marginTop:1}}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── REPORTS PAGE ─────────────────────────────────────────────────────────────
function ReportsPage({ candidates }) {
  const active = candidates.filter(c=>!c.deleted);

  const byStatus = INITIAL_MASTERS.joiningStatus.map(s=>({
    status: s,
    count: active.filter(c=>c.joiningStatus?.toLowerCase()===s.toLowerCase()).length,
    totalCTC: active.filter(c=>c.joiningStatus?.toLowerCase()===s.toLowerCase()).reduce((a,c)=>a+(+c.ctc||0),0),
  })).filter(x=>x.count>0);

  const byClient = [...new Set(active.map(c=>c.client).filter(Boolean))].map(cl=>{
    const group = active.filter(c=>c.client===cl);
    return { client:cl, count:group.length, joined:group.filter(c=>c.joiningStatus?.toLowerCase()==="joined").length, avgCTC:Math.round(group.reduce((a,c)=>a+(+c.ctc||0),0)/group.length)||0 };
  }).sort((a,b)=>b.count-a.count);

  return (
    <div>
      <h2 style={{fontSize:22,fontWeight:800,color:"#0f172a",margin:"0 0 4px"}}>Reports</h2>
      <p style={{color:"#64748b",margin:"0 0 20px",fontSize:14}}>Analytics and summary reports</p>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20}}>
        <div style={{background:"white",borderRadius:14,padding:20,boxShadow:"0 1px 3px rgba(0,0,0,.06)",border:"1px solid #f1f5f9"}}>
          <h3 style={{fontSize:15,fontWeight:700,color:"#0f172a",margin:"0 0 14px"}}>Status Summary</h3>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
            <thead><tr style={{background:"#f8fafc"}}>
              {["Status","Count","Total CTC"].map(h=><th key={h} style={{padding:"8px 12px",textAlign:"left",fontSize:11,fontWeight:700,color:"#64748b",textTransform:"uppercase",letterSpacing:.4}}>{h}</th>)}
            </tr></thead>
            <tbody>{byStatus.map(r=>(
              <tr key={r.status} style={{borderTop:"1px solid #f1f5f9"}}>
                <td style={{padding:"9px 12px"}}><Badge status={r.status}/></td>
                <td style={{padding:"9px 12px",fontWeight:700,color:"#0f172a"}}>{r.count}</td>
                <td style={{padding:"9px 12px",color:"#16a34a",fontWeight:600}}>₹{fmt(r.totalCTC)}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>

        <div style={{background:"white",borderRadius:14,padding:20,boxShadow:"0 1px 3px rgba(0,0,0,.06)",border:"1px solid #f1f5f9"}}>
          <h3 style={{fontSize:15,fontWeight:700,color:"#0f172a",margin:"0 0 14px"}}>Client-wise Summary</h3>
          <div style={{overflow:"auto",maxHeight:320}}>
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
              <thead><tr style={{background:"#f8fafc"}}>
                {["Client","Total","Joined","Avg CTC"].map(h=><th key={h} style={{padding:"8px 12px",textAlign:"left",fontSize:11,fontWeight:700,color:"#64748b",textTransform:"uppercase",letterSpacing:.4}}>{h}</th>)}
              </tr></thead>
              <tbody>{byClient.map(r=>(
                <tr key={r.client} style={{borderTop:"1px solid #f1f5f9"}}>
                  <td style={{padding:"9px 12px",fontWeight:600,color:"#1e293b"}}>{r.client}</td>
                  <td style={{padding:"9px 12px",fontWeight:700}}>{r.count}</td>
                  <td style={{padding:"9px 12px",color:"#16a34a",fontWeight:600}}>{r.joined}</td>
                  <td style={{padding:"9px 12px",color:"#475569"}}>₹{fmt(r.avgCTC)}</td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── AUDIT LOG PAGE ───────────────────────────────────────────────────────────
function AuditPage({ logs }) {
  return (
    <div>
      <h2 style={{fontSize:22,fontWeight:800,color:"#0f172a",margin:"0 0 4px"}}>Audit Log</h2>
      <p style={{color:"#64748b",margin:"0 0 20px",fontSize:14}}>Track all changes made to candidate records</p>
      <div style={{background:"white",borderRadius:14,overflow:"auto",boxShadow:"0 1px 3px rgba(0,0,0,.06)",border:"1px solid #f1f5f9"}}>
        <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
          <thead><tr style={{background:"#f8fafc",borderBottom:"1.5px solid #e2e8f0"}}>
            {["Time","User","Action","Record","Details"].map(h=><th key={h} style={{padding:"10px 14px",textAlign:"left",fontSize:11,fontWeight:700,color:"#64748b",textTransform:"uppercase",letterSpacing:.4}}>{h}</th>)}
          </tr></thead>
          <tbody>
            {logs.length===0&&<tr><td colSpan={5} style={{padding:40,textAlign:"center",color:"#94a3b8"}}>No audit logs yet.</td></tr>}
            {logs.map((l,i)=>(
              <tr key={i} style={{borderBottom:"1px solid #f8fafc"}}>
                <td style={{padding:"10px 14px",color:"#64748b",fontFamily:"monospace",fontSize:11,whiteSpace:"nowrap"}}>{l.time}</td>
                <td style={{padding:"10px 14px",fontWeight:600,color:"#1e293b"}}>{l.user}</td>
                <td style={{padding:"10px 14px"}}>
                  <span style={{padding:"2px 8px",borderRadius:10,fontSize:11,fontWeight:700,background:l.action==="Created"?"#dcfce7":l.action==="Deleted"?"#fee2e2":"#fef9c3",color:l.action==="Created"?"#16a34a":l.action==="Deleted"?"#dc2626":"#92400e"}}>
                    {l.action}
                  </span>
                </td>
                <td style={{padding:"10px 14px",color:"#475569"}}>{l.record}</td>
                <td style={{padding:"10px 14px",color:"#64748b",fontSize:12}}>{l.detail}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [user,setUser]=useState(null);
  const [page,setPage]=useState("dashboard");
  const [candidates,setCandidates]=useState(SEED_CANDIDATES);
  const [masters,setMasters]=useState(INITIAL_MASTERS);
  const [modal,setModal]=useState(null); // {type, data}
  const [auditLogs,setAuditLogs]=useState([]);
  const [nextId,setNextId]=useState(SEED_CANDIDATES.length+1);
  const [sidebarOpen,setSidebarOpen]=useState(false);

  const log = useCallback((action,record,detail="") => {
    setAuditLogs(l=>[{time:new Date().toLocaleString("en-IN"),user:user?.name||"?",action,record,detail},...l].slice(0,100));
  },[user]);

  if(!user) return <LoginScreen onLogin={setUser}/>;

  const handleAdd = () => setModal({type:"add"});
  const handleEdit = (c) => setModal({type:"edit",data:c});
  const handleView = (c) => setModal({type:"view",data:c});
  const handleDelete = (id) => {
    if(!window.confirm("Delete this candidate?")) return;
    const c = candidates.find(x=>x.id===id);
    setCandidates(cs=>cs.map(x=>x.id===id?{...x,deleted:true}:x));
    log("Deleted",c?.name,"Soft deleted");
  };
  const handleSave = (form) => {
    if(modal.type==="add") {
      const sn = candidates.filter(c=>!c.deleted).length+1;
      const newC = {...form,id:nextId,sn,createdAt:new Date().toISOString().split("T")[0],updatedAt:new Date().toISOString().split("T")[0],deleted:false,ctc:+form.ctc||0};
      setCandidates(cs=>[...cs,newC]);
      setNextId(n=>n+1);
      log("Created",form.name,`Client: ${form.client}, Status: ${form.joiningStatus}`);
    } else {
      setCandidates(cs=>cs.map(c=>c.id===modal.data.id?{...c,...form,ctc:+form.ctc||0,updatedAt:new Date().toISOString().split("T")[0]}:c));
      log("Updated",form.name,`Status: ${form.joiningStatus}`);
    }
    setModal(null);
  };

  const navItems = [
    {key:"dashboard",label:"Dashboard",icon:"dashboard"},
    {key:"candidates",label:"Candidates",icon:"users"},
    {key:"reports",label:"Reports",icon:"chart"},
    ...(user.role==="admin"?[
      {key:"masters",label:"Master Data",icon:"settings"},
      {key:"audit",label:"Audit Log",icon:"eye"},
    ]:[]),
  ];

  const Sidebar = () => (
    <aside style={{width:220,background:"#0f172a",minHeight:"100vh",display:"flex",flexDirection:"column",flexShrink:0}}>
      <div style={{padding:"24px 20px 16px"}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:36,height:36,borderRadius:10,background:"linear-gradient(135deg,#2563eb,#7c3aed)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
            <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          </div>
          <div>
            <div style={{fontSize:13,fontWeight:800,color:"white",lineHeight:1.1}}>Ample Leap</div>
            <div style={{fontSize:10,color:"#64748b",marginTop:1}}>CRM v2.0</div>
          </div>
        </div>
      </div>
      <nav style={{flex:1,padding:"8px 10px"}}>
        {navItems.map(n=>(
          <button key={n.key} onClick={()=>{setPage(n.key);setSidebarOpen(false);}} style={{width:"100%",display:"flex",alignItems:"center",gap:10,padding:"10px 12px",borderRadius:9,border:"none",background:page===n.key?"#1e40af22":"transparent",color:page===n.key?"#93c5fd":"#94a3b8",fontWeight:page===n.key?700:500,cursor:"pointer",fontSize:14,marginBottom:2,textAlign:"left",outline:"none"}}>
            <span style={{opacity:.8}}><Icon name={n.icon} size={16}/></span>{n.label}
          </button>
        ))}
      </nav>
      <div style={{padding:"16px 14px",borderTop:"1px solid #1e293b"}}>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
          <div style={{width:32,height:32,borderRadius:8,background:"linear-gradient(135deg,#1e40af,#7c3aed)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:800,color:"white",flexShrink:0}}>
            {user.name[0]}
          </div>
          <div style={{overflow:"hidden"}}>
            <div style={{fontSize:12,fontWeight:700,color:"#e2e8f0",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{user.name}</div>
            <div style={{fontSize:10,color:"#64748b",textTransform:"capitalize"}}>{user.role}</div>
          </div>
        </div>
        <button onClick={()=>setUser(null)} style={{width:"100%",display:"flex",alignItems:"center",gap:8,padding:"8px 10px",borderRadius:7,border:"none",background:"transparent",color:"#64748b",cursor:"pointer",fontSize:12,fontWeight:600}}>
          <Icon name="logout" size={13}/> Sign Out
        </button>
      </div>
    </aside>
  );

  return (
    <div style={{display:"flex",fontFamily:"'Inter',system-ui,sans-serif",minHeight:"100vh",background:"#f8fafc"}}>
      {/* Desktop sidebar */}
      <div style={{display:"block"}}><Sidebar/></div>

      {/* Main */}
      <main style={{flex:1,overflow:"auto",display:"flex",flexDirection:"column"}}>
        {/* Top bar */}
        <div style={{background:"white",borderBottom:"1px solid #f1f5f9",padding:"12px 24px",display:"flex",justifyContent:"space-between",alignItems:"center",position:"sticky",top:0,zIndex:10}}>
          <div style={{fontSize:13,color:"#64748b"}}>
            {new Date().toLocaleDateString("en-IN",{weekday:"long",day:"numeric",month:"long",year:"numeric"})}
          </div>
          <div style={{display:"flex",gap:8,alignItems:"center"}}>
            <div style={{fontSize:13,background:"#f0f9ff",color:"#0369a1",border:"1px solid #bae6fd",padding:"4px 10px",borderRadius:20,fontWeight:600,textTransform:"capitalize"}}>
              {user.role}
            </div>
          </div>
        </div>

        <div style={{padding:24,flex:1}}>
          {page==="dashboard" && <Dashboard candidates={candidates} masters={masters}/>}
          {page==="candidates" && <CandidatesPage candidates={candidates} masters={masters} user={user} onAdd={handleAdd} onEdit={handleEdit} onDelete={handleDelete} onView={handleView}/>}
          {page==="reports" && <ReportsPage candidates={candidates}/>}
          {page==="masters" && user.role==="admin" && <MastersPage masters={masters} setMasters={setMasters}/>}
          {page==="audit" && user.role==="admin" && <AuditPage logs={auditLogs}/>}
        </div>
      </main>

      {/* Modals */}
      <Modal open={modal?.type==="add"} onClose={()=>setModal(null)} title="Add New Candidate" wide>
        <CandidateForm masters={masters} onSave={handleSave} onCancel={()=>setModal(null)}/>
      </Modal>
      <Modal open={modal?.type==="edit"} onClose={()=>setModal(null)} title="Edit Candidate" wide>
        <CandidateForm initial={modal?.data} masters={masters} onSave={handleSave} onCancel={()=>setModal(null)}/>
      </Modal>
      <Modal open={modal?.type==="view"} onClose={()=>setModal(null)} title="Candidate Profile">
        <ViewCandidate candidate={modal?.data}/>
      </Modal>
    </div>
  );
}
