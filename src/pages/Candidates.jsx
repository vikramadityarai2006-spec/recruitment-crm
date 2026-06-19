import { useState, useEffect, useCallback } from "react";
import { api } from "../api";
import { fmt, fmtD } from "../utils/constants";
import { Badge, Spin, Icon, Modal, ContactButtons } from "../components/UI";
import CandidateForm from "../components/CandidateForm";

// ─── VIEW CANDIDATE ───────────────────────────────────────────────────────────
function ViewCandidate({ c }) {
  if (!c) return null;
  const R = (l, v, accent=false) => (
    <div style={{ display:"flex", alignItems:"flex-start", padding:"10px 0", borderBottom:"1px solid #f1f5f9" }}>
      <div style={{ width:180, fontSize:11, fontWeight:600, color:"#94a3b8", textTransform:"uppercase", letterSpacing:.8, flexShrink:0, paddingTop:1 }}>{l}</div>
      <div style={{ fontSize:13, color: accent?"#2563eb":"#1e293b", fontWeight: accent?600:500, flex:1 }}>{v||"—"}</div>
    </div>
  );
  return (
    <div>
      <div style={{ background:"linear-gradient(135deg,#0f172a,#1e3a5f)", borderRadius:14, padding:24, marginBottom:20, display:"flex", alignItems:"center", gap:16 }}>
        <div style={{ width:60, height:60, borderRadius:16, background:"linear-gradient(135deg,#2563eb,#7c3aed)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:24, fontWeight:900, color:"white", flexShrink:0, boxShadow:"0 8px 24px rgba(37,99,235,.4)" }}>
          {c.candidateName?.[0]?.toUpperCase()}
        </div>
        <div style={{ flex:1 }}>
          <h3 style={{ margin:0, fontSize:20, fontWeight:800, color:"white" }}>{c.candidateName}</h3>
          <p style={{ margin:"4px 0 0", color:"#94a3b8", fontSize:13 }}>{c.designation} · {c.clientName} · {c.location}</p>
          <div style={{ display:"flex", gap:6, marginTop:8 }}>
            <Badge status={c.joiningStatus}/>
            <Badge code={c.statusCode}/>
            {c.phone && <span style={{ fontSize:11, color:"#94a3b8", background:"rgba(255,255,255,.1)", padding:"2px 8px", borderRadius:10 }}>📞 {c.phone}</span>}
          </div>
        </div>
        {c.ctcPerMonth && <div style={{ textAlign:"right" }}>
          <div style={{ fontSize:22, fontWeight:800, color:"#22c55e" }}>₹{fmt(c.ctcPerMonth)}</div>
          <div style={{ fontSize:10, color:"#64748b", marginTop:2 }}>PER MONTH</div>
        </div>}
        <ContactButtons phone={c.phone} waMessage={`Hi ${c.candidateName}, this is regarding your application with ${c.clientName||"us"}.`} size="lg"/>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0 24px" }}>
        {R("Client",c.clientName,true)}{R("Owner",c.ownerName)}
        {R("Designation",c.designation)}{R("Location",c.location)}
        {R("Phone",c.phone)}{R("Joining Status",c.joiningStatus)}
        {R("Offer Month",fmtD(c.offerMonth))}{R("Status Code",c.statusCode)}
        {R("Proposed DOJ",fmtD(c.proposedDOJ))}{R("Actual DOJ",fmtD(c.actualDOJ))}
        {R("Resignation",c.resignationAcceptance)}{R("CTC/Month",c.ctcPerMonth?`₹${fmt(c.ctcPerMonth)}`:"—")}
      </div>
      {c.notes && <div style={{ marginTop:12, padding:"12px 16px", background:"#f8fafc", borderRadius:10, border:"1px solid #f1f5f9" }}>
        <div style={{ fontSize:10, fontWeight:700, color:"#94a3b8", textTransform:"uppercase", letterSpacing:.8, marginBottom:4 }}>Notes</div>
        <div style={{ fontSize:13, color:"#475569" }}>{c.notes}</div>
      </div>}
    </div>
  );
}

// ─── MULTI SELECT ─────────────────────────────────────────────────────────────
function MultiSelect({ label, icon, options, selected, onChange }) {
  const [open, setOpen] = useState(false);
  const sel = Array.isArray(selected) ? selected : [];
  const toggle = v => onChange(sel.includes(v) ? sel.filter(x=>x!==v) : [...sel,v]);
  return (
    <div style={{ position:"relative" }}>
      <label style={{ display:"block", fontSize:10, fontWeight:700, color:"#64748b", marginBottom:5, textTransform:"uppercase", letterSpacing:.6 }}>{icon} {label}</label>
      <div onClick={()=>setOpen(o=>!o)} style={{ padding:"9px 12px", borderRadius:8, border:`1.5px solid ${sel.length?"#2563eb":"#e2e8f0"}`, background:sel.length?"#eff6ff":"white", cursor:"pointer", fontSize:12, display:"flex", alignItems:"center", justifyContent:"space-between", userSelect:"none" }}>
        <span style={{ color:sel.length?"#1d4ed8":"#94a3b8", fontWeight:sel.length?600:400, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", flex:1 }}>
          {sel.length===0?"Any":sel.length===1?sel[0]:`${sel.length} selected`}
        </span>
        {sel.length>0 && <span style={{ background:"#2563eb", color:"white", borderRadius:"50%", width:16, height:16, display:"flex", alignItems:"center", justifyContent:"center", fontSize:9, fontWeight:800, marginRight:4, flexShrink:0 }}>{sel.length}</span>}
        <span style={{ fontSize:9, color:"#94a3b8", flexShrink:0 }}>{open?"▲":"▼"}</span>
      </div>
      {open && <>
        <div onClick={()=>setOpen(false)} style={{ position:"fixed", inset:0, zIndex:98 }}/>
        <div style={{ position:"absolute", top:"100%", left:0, right:0, background:"white", border:"1.5px solid #e2e8f0", borderRadius:10, zIndex:99, boxShadow:"0 12px 40px rgba(0,0,0,.15)", maxHeight:220, overflow:"auto", marginTop:4 }}>
          {sel.length>0 && <div onClick={()=>{onChange([]);setOpen(false);}} style={{ padding:"9px 12px", borderBottom:"1px solid #f1f5f9", fontSize:11, color:"#ef4444", fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", gap:6, background:"#fef2f2" }}>
            ✕ Clear selection
          </div>}
          {options.map(o=>(
            <div key={o} onClick={()=>toggle(o)} style={{ padding:"9px 12px", display:"flex", alignItems:"center", gap:10, cursor:"pointer", background:sel.includes(o)?"#eff6ff":"white", borderBottom:"1px solid #f8fafc" }}
              onMouseEnter={e=>{ if(!sel.includes(o)) e.currentTarget.style.background="#f8fafc"; }}
              onMouseLeave={e=>{ e.currentTarget.style.background=sel.includes(o)?"#eff6ff":"white"; }}>
              <div style={{ width:16, height:16, borderRadius:4, border:`2px solid ${sel.includes(o)?"#2563eb":"#d1d5db"}`, background:sel.includes(o)?"#2563eb":"white", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, transition:"all .15s" }}>
                {sel.includes(o) && <span style={{ color:"white", fontSize:9, fontWeight:900 }}>✓</span>}
              </div>
              <span style={{ fontSize:12, color:sel.includes(o)?"#1d4ed8":"#374151", fontWeight:sel.includes(o)?600:400 }}>{o}</span>
            </div>
          ))}
        </div>
      </>}
    </div>
  );
}

// ─── FILTER PANEL ─────────────────────────────────────────────────────────────
function FilterPanel({ filters, masters, onApply, onClose }) {
  const [local, setLocal] = useState({...filters});
  const set = (k,v) => setLocal(f=>({...f,[k]:v}));
  const activeCount = [...(local.clients||[]),...(local.owners||[]),...(local.resignations||[]),...(local.statuses||[]),...(local.codes||[]),local.location,local.designation,local.offerFrom,local.offerTo,local.proposedFrom,local.proposedTo,local.actualFrom,local.actualTo].filter(Boolean).length;
  const clearAll = () => setLocal({clients:[],owners:[],resignations:[],statuses:[],codes:[],location:"",designation:"",offerFrom:"",offerTo:"",proposedFrom:"",proposedTo:"",actualFrom:"",actualTo:""});

  const DateRange = ({label,icon,fk,tk}) => (
    <div>
      <label style={{display:"block",fontSize:10,fontWeight:700,color:"#64748b",marginBottom:5,textTransform:"uppercase",letterSpacing:.6}}>{icon} {label}</label>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
        <div>
          <div style={{fontSize:9,color:"#94a3b8",marginBottom:3,textTransform:"uppercase",letterSpacing:.4}}>From</div>
          <input type="date" value={local[fk]||""} onChange={e=>set(fk,e.target.value)} style={{width:"100%",padding:"8px 10px",borderRadius:8,border:`1.5px solid ${local[fk]?"#2563eb":"#e2e8f0"}`,fontSize:11,outline:"none",background:local[fk]?"#eff6ff":"white",boxSizing:"border-box"}}/>
        </div>
        <div>
          <div style={{fontSize:9,color:"#94a3b8",marginBottom:3,textTransform:"uppercase",letterSpacing:.4}}>To</div>
          <input type="date" value={local[tk]||""} onChange={e=>set(tk,e.target.value)} style={{width:"100%",padding:"8px 10px",borderRadius:8,border:`1.5px solid ${local[tk]?"#2563eb":"#e2e8f0"}`,fontSize:11,outline:"none",background:local[tk]?"#eff6ff":"white",boxSizing:"border-box"}}/>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{position:"fixed",top:0,right:0,bottom:0,width:420,background:"white",zIndex:600,boxShadow:"-8px 0 60px rgba(0,0,0,.2)",display:"flex",flexDirection:"column",fontFamily:"Inter,system-ui,sans-serif"}}>
      <div style={{padding:"22px 24px 18px",background:"linear-gradient(135deg,#0f172a 0%,#1e3a5f 100%)",display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0}}>
        <div>
          <div style={{fontSize:17,fontWeight:800,color:"white",display:"flex",alignItems:"center",gap:8}}>
            <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2}><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
            Advanced Filters
          </div>
          <div style={{fontSize:11,color:"#64748b",marginTop:3}}>
            {activeCount>0?<span style={{color:"#93c5fd",fontWeight:600}}>● {activeCount} filter{activeCount>1?"s":""} active</span>:"Filter candidates by any criteria"}
          </div>
        </div>
        <button onClick={onClose} style={{background:"rgba(255,255,255,.08)",border:"1px solid rgba(255,255,255,.12)",borderRadius:8,width:34,height:34,cursor:"pointer",color:"#94a3b8",fontSize:16,display:"flex",alignItems:"center",justifyContent:"center",transition:"all .2s"}}
          onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,.15)"}
          onMouseLeave={e=>e.currentTarget.style.background="rgba(255,255,255,.08)"}>✕</button>
      </div>

      <div style={{flex:1,overflow:"auto",padding:20}}>
        {/* Multi-select filters */}
        <div style={{background:"#f8fafc",borderRadius:14,padding:18,marginBottom:14,border:"1px solid #f1f5f9"}}>
          <div style={{fontSize:11,fontWeight:700,color:"#0f172a",marginBottom:14,display:"flex",alignItems:"center",gap:6,textTransform:"uppercase",letterSpacing:.6}}>
            <span style={{width:20,height:20,background:"#2563eb",borderRadius:5,display:"inline-flex",alignItems:"center",justifyContent:"center",fontSize:10}}>🏢</span>
            Client & Team
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            <MultiSelect label="Client" icon="🏢" options={masters.clients||[]} selected={local.clients||[]} onChange={v=>set("clients",v)}/>
            <MultiSelect label="Owner / Recruiter" icon="👤" options={masters.owners||[]} selected={local.owners||[]} onChange={v=>set("owners",v)}/>
          </div>
        </div>

        <div style={{background:"#f8fafc",borderRadius:14,padding:18,marginBottom:14,border:"1px solid #f1f5f9"}}>
          <div style={{fontSize:11,fontWeight:700,color:"#0f172a",marginBottom:14,display:"flex",alignItems:"center",gap:6,textTransform:"uppercase",letterSpacing:.6}}>
            <span style={{width:20,height:20,background:"#8b5cf6",borderRadius:5,display:"inline-flex",alignItems:"center",justifyContent:"center",fontSize:10}}>📊</span>
            Status Filters
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            <MultiSelect label="Joining Status" icon="📋" options={masters.joiningStatus||[]} selected={local.statuses||[]} onChange={v=>set("statuses",v)}/>
            <MultiSelect label="Resignation Status" icon="📝" options={masters.resignationStatus||["Pending","Accepted","NA"]} selected={local.resignations||[]} onChange={v=>set("resignations",v)}/>
            <MultiSelect label="Status Code" icon="🎨" options={(masters.statusCodes||[]).map(s=>s.code||s)} selected={local.codes||[]} onChange={v=>set("codes",v)}/>
          </div>
        </div>

        <div style={{background:"#f8fafc",borderRadius:14,padding:18,marginBottom:14,border:"1px solid #f1f5f9"}}>
          <div style={{fontSize:11,fontWeight:700,color:"#0f172a",marginBottom:14,display:"flex",alignItems:"center",gap:6,textTransform:"uppercase",letterSpacing:.6}}>
            <span style={{width:20,height:20,background:"#22c55e",borderRadius:5,display:"inline-flex",alignItems:"center",justifyContent:"center",fontSize:10}}>📍</span>
            Location & Role
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            <div>
              <label style={{display:"block",fontSize:10,fontWeight:700,color:"#64748b",marginBottom:5,textTransform:"uppercase",letterSpacing:.6}}>📍 Location / City</label>
              <input value={local.location||""} onChange={e=>set("location",e.target.value)} placeholder="e.g. Mumbai, Pune, Delhi…"
                style={{width:"100%",padding:"9px 12px",borderRadius:8,border:`1.5px solid ${local.location?"#2563eb":"#e2e8f0"}`,fontSize:12,outline:"none",background:local.location?"#eff6ff":"white",boxSizing:"border-box"}}/>
            </div>
            <div>
              <label style={{display:"block",fontSize:10,fontWeight:700,color:"#64748b",marginBottom:5,textTransform:"uppercase",letterSpacing:.6}}>💼 Position / Designation</label>
              <input value={local.designation||""} onChange={e=>set("designation",e.target.value)} placeholder="e.g. Manager, Engineer…"
                style={{width:"100%",padding:"9px 12px",borderRadius:8,border:`1.5px solid ${local.designation?"#2563eb":"#e2e8f0"}`,fontSize:12,outline:"none",background:local.designation?"#eff6ff":"white",boxSizing:"border-box"}}/>
            </div>
          </div>
        </div>

        <div style={{background:"#f8fafc",borderRadius:14,padding:18,marginBottom:14,border:"1px solid #f1f5f9"}}>
          <div style={{fontSize:11,fontWeight:700,color:"#0f172a",marginBottom:14,display:"flex",alignItems:"center",gap:6,textTransform:"uppercase",letterSpacing:.6}}>
            <span style={{width:20,height:20,background:"#f97316",borderRadius:5,display:"inline-flex",alignItems:"center",justifyContent:"center",fontSize:10}}>📅</span>
            Date Ranges
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:14}}>
            <DateRange label="Offer Month" icon="📅" fk="offerFrom" tk="offerTo"/>
            <DateRange label="Proposed DOJ" icon="🗓️" fk="proposedFrom" tk="proposedTo"/>
            <DateRange label="Actual DOJ" icon="✅" fk="actualFrom" tk="actualTo"/>
          </div>
        </div>
      </div>

      <div style={{padding:"16px 20px",borderTop:"1px solid #f1f5f9",background:"white",display:"flex",gap:10,flexShrink:0}}>
        <button onClick={clearAll} style={{flex:1,padding:"11px",background:"white",border:"1.5px solid #e2e8f0",borderRadius:10,fontWeight:600,cursor:"pointer",fontSize:13,color:"#64748b",transition:"all .2s"}}
          onMouseEnter={e=>e.currentTarget.style.background="#f8fafc"}
          onMouseLeave={e=>e.currentTarget.style.background="white"}>
          Clear All
        </button>
        <button onClick={()=>{onApply(local);onClose();}} style={{flex:2,padding:"11px",background:"linear-gradient(135deg,#2563eb,#7c3aed)",color:"white",border:"none",borderRadius:10,fontWeight:700,cursor:"pointer",fontSize:13,boxShadow:"0 4px 14px rgba(37,99,235,.35)",transition:"all .2s"}}
          onMouseEnter={e=>e.currentTarget.style.transform="translateY(-1px)"}
          onMouseLeave={e=>e.currentTarget.style.transform="translateY(0)"}>
          Apply Filters{activeCount>0?` (${activeCount})`:""}
        </button>
      </div>
    </div>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
const PER = 20;
const EMPTY_FILTERS = {clients:[],owners:[],resignations:[],statuses:[],codes:[],location:"",designation:"",offerFrom:"",offerTo:"",proposedFrom:"",proposedTo:"",actualFrom:"",actualTo:""};

export default function Candidates({ masters, user }) {
  const [result, setResult] = useState({candidates:[],total:0,pages:1});
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [modal, setModal] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async (p=1,s="",f={}) => {
    setLoading(true);
    const params = {page:p,limit:PER};
    if (s) params.search = s;
    if (f.clients?.length) params.client = f.clients.join(",");
    if (f.owners?.length) params.owner = f.owners.join(",");
    if (f.statuses?.length) params.status = f.statuses.join(",");
    if (f.codes?.length) params.statusCode = f.codes.join(",");
    if (f.resignations?.length) params.resignation = f.resignations.join(",");
    if (f.location) params.location = f.location;
    if (f.designation) params.designation = f.designation;
    if (f.offerFrom) params.offerFrom = f.offerFrom;
    if (f.offerTo) params.offerTo = f.offerTo;
    if (f.proposedFrom) params.proposedFrom = f.proposedFrom;
    if (f.proposedTo) params.proposedTo = f.proposedTo;
    if (f.actualFrom) params.actualFrom = f.actualFrom;
    if (f.actualTo) params.actualTo = f.actualTo;
    try {
      const res = await api.getCandidates(params);
      setResult(res || {candidates:[],total:0,pages:1});
    } catch(e) { console.error(e); }
    setLoading(false);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {load(1,search,filters);setPage(1);},400);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => { load(page,search,filters); }, [page,filters]);

  const handleDelete = async id => {
    if (!window.confirm("Delete this candidate? This cannot be undone.")) return;
    try {
      const r = await api.deleteCandidate(id);
      if (r.error) { alert(r.error); return; }
      load(page,search,filters);
    } catch(e) { alert(e.message); }
  };

  const handleSave = async form => {
    setSaving(true);
    try {
      const r = modal.type==="add" ? await api.createCandidate(form) : await api.updateCandidate(modal.data.id,form);
      if (r.error) { alert(r.error); setSaving(false); return; }
      setModal(null); load(page,search,filters);
    } catch(e) { alert(e.message); }
    setSaving(false);
  };

  const exportCSV = () => {
    const cols = ["SR.NO","Client","Candidate","Position","Location","Phone","Offer Mth","Prop DOJ","Actual DOJ","Resign","Owner","Status","CTC/Mo","Code"];
    const rows = (result.candidates||[]).map((c,i)=>[i+1+(page-1)*PER,c.clientName,c.candidateName,c.designation,c.location,c.phone,fmtD(c.offerMonth),fmtD(c.proposedDOJ),fmtD(c.actualDOJ),c.resignationAcceptance,c.ownerName,c.joiningStatus,c.ctcPerMonth?`${fmt(c.ctcPerMonth)}`:"",c.statusCode]);
    const csv = [cols,...rows].map(r=>r.map(v=>`"${v||""}"`).join(",")).join("\n");
    const a = document.createElement("a"); a.href="data:text/csv;charset=utf-8,"+encodeURIComponent(csv); a.download="candidates.csv"; a.click();
  };

  const activeFilters = [...(filters.clients||[]),...(filters.owners||[]),...(filters.resignations||[]),...(filters.statuses||[]),...(filters.codes||[]),filters.location,filters.designation,filters.offerFrom,filters.offerTo,filters.proposedFrom,filters.proposedTo,filters.actualFrom,filters.actualTo].filter(Boolean).length;
  const clearAll = () => { setFilters(EMPTY_FILTERS); setPage(1); load(1,search,EMPTY_FILTERS); };
  const canEdit = user.role !== "viewer";
  const canDel = user.role === "admin";

  const ResignBadge = ({v}) => {
    const styles = {Pending:{bg:"#fef9c3",c:"#92400e"},Accepted:{bg:"#dcfce7",c:"#16a34a"},NA:{bg:"#f1f5f9",c:"#64748b"}};
    const s = styles[v] || styles.NA;
    return <span style={{padding:"2px 7px",borderRadius:8,fontSize:10,fontWeight:600,background:s.bg,color:s.c,whiteSpace:"nowrap"}}>{v||"—"}</span>;
  };

  return (
    <div style={{position:"relative",minHeight:"100vh"}}>
      {showFilters && <div onClick={()=>setShowFilters(false)} style={{position:"fixed",inset:0,background:"rgba(15,23,42,.5)",zIndex:599,backdropFilter:"blur(2px)"}}/>}
      {showFilters && <FilterPanel filters={filters} masters={masters} onApply={f=>{setFilters(f);setPage(1);load(1,search,f);}} onClose={()=>setShowFilters(false)}/>}

      {/* ── PAGE HEADER ── */}
      <div style={{background:"white",borderRadius:16,padding:"20px 24px",marginBottom:18,boxShadow:"0 1px 3px rgba(0,0,0,.06)",border:"1px solid #f1f5f9"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:12}}>
          <div>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:4}}>
              <div style={{width:36,height:36,borderRadius:10,background:"linear-gradient(135deg,#2563eb,#7c3aed)",display:"flex",alignItems:"center",justifyContent:"center"}}>
                <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              </div>
              <div>
                <h2 style={{fontSize:18,fontWeight:800,color:"#0f172a",margin:0}}>Candidates</h2>
                <p style={{color:"#64748b",margin:0,fontSize:12}}>
                  <strong style={{color:"#0f172a"}}>{result.total.toLocaleString()}</strong> total records
                  {activeFilters>0 && <span style={{color:"#2563eb",fontWeight:600}}> · {activeFilters} filter{activeFilters>1?"s":""} applied</span>}
                </p>
              </div>
            </div>
          </div>
          <div style={{display:"flex",gap:8,flexWrap:"wrap",alignItems:"center"}}>
            {canEdit && (
              <button onClick={()=>setModal({type:"add"})}
                style={{display:"flex",alignItems:"center",gap:6,padding:"9px 18px",background:"linear-gradient(135deg,#2563eb,#7c3aed)",color:"white",border:"none",borderRadius:10,fontWeight:700,cursor:"pointer",fontSize:13,boxShadow:"0 4px 12px rgba(37,99,235,.3)",transition:"all .2s"}}
                onMouseEnter={e=>e.currentTarget.style.transform="translateY(-1px)"}
                onMouseLeave={e=>e.currentTarget.style.transform="translateY(0)"}>
                <Icon n="plus" s={14}/> Add Candidate
              </button>
            )}
            <button onClick={()=>load(page,search,filters)} style={{display:"flex",alignItems:"center",gap:6,padding:"9px 14px",background:"white",border:"1.5px solid #e2e8f0",borderRadius:10,fontWeight:600,cursor:"pointer",fontSize:12,color:"#374151",transition:"all .2s"}}
              onMouseEnter={e=>e.currentTarget.style.borderColor="#2563eb"}
              onMouseLeave={e=>e.currentTarget.style.borderColor="#e2e8f0"}>
              <Icon n="refresh" s={13}/> Refresh
            </button>
            <button onClick={exportCSV} style={{display:"flex",alignItems:"center",gap:6,padding:"9px 14px",background:"white",border:"1.5px solid #e2e8f0",borderRadius:10,fontWeight:600,cursor:"pointer",fontSize:12,color:"#374151",transition:"all .2s"}}
              onMouseEnter={e=>e.currentTarget.style.borderColor="#2563eb"}
              onMouseLeave={e=>e.currentTarget.style.borderColor="#e2e8f0"}>
              <Icon n="dl" s={13}/> Export
            </button>
          </div>
        </div>
      </div>

      {/* ── SEARCH & FILTER BAR ── */}
      <div style={{background:"white",borderRadius:14,padding:16,marginBottom:16,boxShadow:"0 1px 3px rgba(0,0,0,.06)",border:"1px solid #f1f5f9"}}>
        <div style={{display:"flex",gap:10,marginBottom:activeFilters>0?12:0}}>
          <div style={{flex:1,display:"flex",alignItems:"center",gap:10,background:"#f8fafc",borderRadius:10,padding:"10px 14px",border:"1.5px solid #e2e8f0",transition:"all .2s"}}
            onFocus={e=>e.currentTarget.style.borderColor="#2563eb"}
            onBlur={e=>e.currentTarget.style.borderColor="#e2e8f0"}>
            <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth={2.5}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search by name, client, phone, position…"
              style={{border:"none",background:"none",outline:"none",fontSize:13,width:"100%",color:"#374151"}}/>
            {search && <button onClick={()=>{setSearch("");load(1,"",filters);}} style={{border:"none",background:"none",cursor:"pointer",color:"#94a3b8",fontSize:16,display:"flex",padding:0}}>✕</button>}
          </div>

          <button onClick={()=>setShowFilters(true)}
            style={{display:"flex",alignItems:"center",gap:8,padding:"10px 18px",background:activeFilters>0?"linear-gradient(135deg,#2563eb,#7c3aed)":"white",border:`1.5px solid ${activeFilters>0?"transparent":"#e2e8f0"}`,borderRadius:10,cursor:"pointer",fontSize:13,fontWeight:700,color:activeFilters>0?"white":"#374151",transition:"all .2s",boxShadow:activeFilters>0?"0 4px 12px rgba(37,99,235,.3)":"none"}}>
            <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
            Filters
            {activeFilters>0 && <span style={{background:"white",color:"#2563eb",borderRadius:"50%",width:18,height:18,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:900}}>{activeFilters}</span>}
          </button>
        </div>

        {/* Filter chips */}
        {activeFilters>0 && (
          <div style={{display:"flex",gap:6,flexWrap:"wrap",paddingTop:4}}>
            {[
              ...(filters.clients||[]).map(v=>({k:"clients",v,l:`🏢 ${v}`})),
              ...(filters.owners||[]).map(v=>({k:"owners",v,l:`👤 ${v}`})),
              ...(filters.statuses||[]).map(v=>({k:"statuses",v,l:`📋 ${v}`})),
              ...(filters.resignations||[]).map(v=>({k:"resignations",v,l:`📝 ${v}`})),
              ...(filters.codes||[]).map(v=>({k:"codes",v,l:`🎨 ${v}`})),
              filters.location&&{k:"location",v:filters.location,l:`📍 ${filters.location}`},
              filters.designation&&{k:"designation",v:filters.designation,l:`💼 ${filters.designation}`},
              filters.offerFrom&&{k:"offerFrom",v:filters.offerFrom,l:`📅 From ${filters.offerFrom}`},
              filters.offerTo&&{k:"offerTo",v:filters.offerTo,l:`📅 To ${filters.offerTo}`},
              filters.proposedFrom&&{k:"proposedFrom",v:filters.proposedFrom,l:`🗓️ Prop ≥ ${filters.proposedFrom}`},
              filters.proposedTo&&{k:"proposedTo",v:filters.proposedTo,l:`🗓️ Prop ≤ ${filters.proposedTo}`},
              filters.actualFrom&&{k:"actualFrom",v:filters.actualFrom,l:`✅ Act ≥ ${filters.actualFrom}`},
              filters.actualTo&&{k:"actualTo",v:filters.actualTo,l:`✅ Act ≤ ${filters.actualTo}`},
            ].filter(Boolean).map((chip,i)=>(
              <span key={i} style={{display:"inline-flex",alignItems:"center",gap:5,padding:"4px 10px 4px 12px",background:"#eff6ff",border:"1px solid #bfdbfe",borderRadius:20,fontSize:11,color:"#1d4ed8",fontWeight:600}}>
                {chip.l}
                <button onClick={()=>{ const nf={...filters}; if(Array.isArray(nf[chip.k])) nf[chip.k]=nf[chip.k].filter(x=>x!==chip.v); else nf[chip.k]=""; setFilters(nf);setPage(1);load(1,search,nf); }} style={{border:"none",background:"#bfdbfe",cursor:"pointer",color:"#1d4ed8",borderRadius:"50%",width:14,height:14,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:900,padding:0}}>✕</button>
              </span>
            ))}
            <button onClick={clearAll} style={{display:"inline-flex",alignItems:"center",gap:4,padding:"4px 12px",background:"#fef2f2",border:"1px solid #fecaca",borderRadius:20,fontSize:11,color:"#dc2626",fontWeight:700,cursor:"pointer"}}>
              Clear all ✕
            </button>
          </div>
        )}
      </div>

      {/* ── TABLE ── */}
      <div style={{background:"white",borderRadius:14,boxShadow:"0 1px 3px rgba(0,0,0,.06)",border:"1px solid #f1f5f9",overflow:"hidden"}}>
        {loading ? (
          <div style={{padding:80,textAlign:"center"}}>
            <div style={{width:40,height:40,border:"3px solid #f1f5f9",borderTop:"3px solid #2563eb",borderRadius:"50%",animation:"spin 0.8s linear infinite",margin:"0 auto 16px"}}/>
            <div style={{color:"#64748b",fontSize:13,fontWeight:500}}>Loading candidates…</div>
          </div>
        ) : (
          <>
          <div style={{overflow:"auto"}}>
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
              <thead>
                <tr style={{background:"linear-gradient(to right,#f8fafc,#f1f5f9)"}}>
                  {[["SR",44],["CLIENT",115],["CANDIDATE",145],["POSITION",115],["LOCATION",80],["PHONE",105],["OFFER MTH",95],["PROP DOJ",95],["ACTUAL DOJ",95],["RESIGN",85],["OWNER",95],["STATUS",90],["CTC / MO",88],["CODE",62],["CONNECT",90],["",80]].map(([l,w])=>(
                    <th key={l} style={{padding:"12px 12px",textAlign:"left",fontWeight:700,color:"#64748b",fontSize:10,textTransform:"uppercase",letterSpacing:.7,minWidth:w,whiteSpace:"nowrap",borderBottom:"2px solid #e2e8f0"}}>{l}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {!(result.candidates||[]).length && (
                  <tr><td colSpan={16}>
                    <div style={{padding:80,textAlign:"center"}}>
                      <div style={{width:64,height:64,borderRadius:18,background:"linear-gradient(135deg,#f1f5f9,#e2e8f0)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 16px",fontSize:28}}>🔍</div>
                      <div style={{fontSize:16,fontWeight:700,color:"#0f172a",marginBottom:6}}>No candidates found</div>
                      <div style={{fontSize:13,color:"#94a3b8",marginBottom:16}}>{activeFilters>0?"Try adjusting your filters or clear them to see all records":"No candidates added yet — add your first one!"}</div>
                      {activeFilters>0 && <button onClick={clearAll} style={{padding:"9px 20px",background:"#2563eb",color:"white",border:"none",borderRadius:9,fontWeight:700,cursor:"pointer",fontSize:13}}>Clear All Filters</button>}
                    </div>
                  </td></tr>
                )}
                {(result.candidates||[]).map((c,i)=>(
                  <tr key={c.id}
                    style={{borderBottom:"1px solid #f8fafc",background:i%2===0?"white":"#fcfcfd",cursor:"default",transition:"background .1s"}}
                    onMouseEnter={e=>{ e.currentTarget.style.background="#f0f9ff"; e.currentTarget.style.boxShadow="inset 3px 0 0 #2563eb"; }}
                    onMouseLeave={e=>{ e.currentTarget.style.background=i%2===0?"white":"#fcfcfd"; e.currentTarget.style.boxShadow="none"; }}>
                    <td style={{padding:"11px 12px"}}>
                      <span style={{fontSize:11,fontWeight:700,color:"#94a3b8",background:"#f8fafc",border:"1px solid #e2e8f0",borderRadius:6,padding:"2px 7px"}}>{(page-1)*PER+i+1}</span>
                    </td>
                    <td style={{padding:"11px 12px"}}>
                      <div style={{fontWeight:700,color:"#1e293b",maxWidth:110,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",fontSize:12}}>{c.clientName||"—"}</div>
                    </td>
                    <td style={{padding:"11px 12px"}}>
                      <div style={{fontWeight:700,color:"#0f172a",maxWidth:140,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.candidateName}</div>
                      <div style={{fontSize:10,color:"#94a3b8",marginTop:1}}>#{c.id}</div>
                    </td>
                    <td style={{padding:"11px 12px",color:"#475569",maxWidth:110,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.designation||"—"}</td>
                    <td style={{padding:"11px 12px",whiteSpace:"nowrap"}}>
                      {c.location ? <span style={{display:"inline-flex",alignItems:"center",gap:3,fontSize:11,color:"#475569"}}><span style={{color:"#94a3b8"}}>📍</span>{c.location}</span> : "—"}
                    </td>
                    <td style={{padding:"11px 12px",color:"#64748b",fontFamily:"monospace",fontSize:11,whiteSpace:"nowrap"}}>{c.phone||"—"}</td>
                    <td style={{padding:"11px 12px",color:"#64748b",whiteSpace:"nowrap",fontSize:11}}>{fmtD(c.offerMonth)}</td>
                    <td style={{padding:"11px 12px",color:"#64748b",whiteSpace:"nowrap",fontSize:11}}>{fmtD(c.proposedDOJ)}</td>
                    <td style={{padding:"11px 12px",whiteSpace:"nowrap",fontSize:11}}>
                      {c.actualDOJ ? <span style={{color:"#16a34a",fontWeight:600}}>{fmtD(c.actualDOJ)}</span> : <span style={{color:"#94a3b8"}}>Pending</span>}
                    </td>
                    <td style={{padding:"11px 12px"}}><ResignBadge v={c.resignationAcceptance}/></td>
                    <td style={{padding:"11px 12px",color:"#475569",whiteSpace:"nowrap",fontWeight:500}}>{c.ownerName||"—"}</td>
                    <td style={{padding:"11px 12px"}}><Badge status={c.joiningStatus}/></td>
                    <td style={{padding:"11px 12px",whiteSpace:"nowrap"}}>
                      {c.ctcPerMonth ? <span style={{fontWeight:700,color:"#0f172a",fontSize:12}}>₹{fmt(c.ctcPerMonth)}</span> : <span style={{color:"#94a3b8"}}>—</span>}
                    </td>
                    <td style={{padding:"11px 12px"}}><Badge code={c.statusCode}/></td>
                    <td style={{padding:"11px 12px"}}>
                      <ContactButtons phone={c.phone} waMessage={`Hi ${c.candidateName}, this is regarding your application with ${c.clientName||"us"}.`}/>
                    </td>
                    <td style={{padding:"11px 12px"}}>
                      <div style={{display:"flex",gap:3}}>
                        <button onClick={()=>setModal({type:"view",data:c})} title="View Profile"
                          style={{padding:"5px 7px",background:"#f0f9ff",border:"1px solid #bfdbfe",borderRadius:6,cursor:"pointer",color:"#2563eb",display:"flex",transition:"all .15s"}}
                          onMouseEnter={e=>{ e.currentTarget.style.background="#dbeafe"; }}
                          onMouseLeave={e=>{ e.currentTarget.style.background="#f0f9ff"; }}>
                          <Icon n="eye" s={12}/>
                        </button>
                        {canEdit && <button onClick={()=>setModal({type:"edit",data:c})} title="Edit"
                          style={{padding:"5px 7px",background:"#f0fdf4",border:"1px solid #bbf7d0",borderRadius:6,cursor:"pointer",color:"#16a34a",display:"flex",transition:"all .15s"}}
                          onMouseEnter={e=>{ e.currentTarget.style.background="#dcfce7"; }}
                          onMouseLeave={e=>{ e.currentTarget.style.background="#f0fdf4"; }}>
                          <Icon n="edit" s={12}/>
                        </button>}
                        {canDel && <button onClick={()=>handleDelete(c.id)} title="Delete"
                          style={{padding:"5px 7px",background:"#fef2f2",border:"1px solid #fecaca",borderRadius:6,cursor:"pointer",color:"#dc2626",display:"flex",transition:"all .15s"}}
                          onMouseEnter={e=>{ e.currentTarget.style.background="#fee2e2"; }}
                          onMouseLeave={e=>{ e.currentTarget.style.background="#fef2f2"; }}>
                          <Icon n="trash" s={12}/>
                        </button>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div style={{padding:"14px 20px",borderTop:"1px solid #f1f5f9",display:"flex",justifyContent:"space-between",alignItems:"center",background:"#fafafa",flexWrap:"wrap",gap:8}}>
            <div style={{fontSize:12,color:"#64748b"}}>
              Showing <strong style={{color:"#0f172a"}}>{Math.min((page-1)*PER+1,result.total)}</strong>–<strong style={{color:"#0f172a"}}>{Math.min(page*PER,result.total)}</strong> of <strong style={{color:"#0f172a"}}>{result.total.toLocaleString()}</strong> candidates
            </div>
            <div style={{display:"flex",gap:4,alignItems:"center"}}>
              <button onClick={()=>{setPage(1);load(1,search,filters);}} disabled={page<=1} style={{padding:"6px 10px",border:"1.5px solid #e2e8f0",borderRadius:8,background:"white",cursor:page<=1?"not-allowed":"pointer",fontSize:12,color:"#374151",opacity:page<=1?.4:1,fontWeight:600}}>«</button>
              <button onClick={()=>{const p=page-1;setPage(p);load(p,search,filters);}} disabled={page<=1} style={{padding:"6px 12px",border:"1.5px solid #e2e8f0",borderRadius:8,background:"white",cursor:page<=1?"not-allowed":"pointer",fontSize:12,color:"#374151",opacity:page<=1?.4:1,fontWeight:600}}>‹ Prev</button>
              {Array.from({length:Math.min(5,result.pages||1)},(_,i)=>{
                const p = Math.max(1,Math.min(page-2,(result.pages||1)-4))+i;
                if(p<1||p>(result.pages||1)) return null;
                return <button key={p} onClick={()=>{setPage(p);load(p,search,filters);}}
                  style={{padding:"6px 12px",border:`1.5px solid ${p===page?"#2563eb":"#e2e8f0"}`,borderRadius:8,background:p===page?"#2563eb":"white",color:p===page?"white":"#374151",cursor:"pointer",fontSize:12,fontWeight:p===page?700:500,minWidth:36,transition:"all .15s"}}>
                  {p}
                </button>;
              })}
              <button onClick={()=>{const p=page+1;setPage(p);load(p,search,filters);}} disabled={page>=(result.pages||1)} style={{padding:"6px 12px",border:"1.5px solid #e2e8f0",borderRadius:8,background:"white",cursor:page>=(result.pages||1)?"not-allowed":"pointer",fontSize:12,color:"#374151",opacity:page>=(result.pages||1)?.4:1,fontWeight:600}}>Next ›</button>
              <button onClick={()=>{setPage(result.pages||1);load(result.pages||1,search,filters);}} disabled={page>=(result.pages||1)} style={{padding:"6px 10px",border:"1.5px solid #e2e8f0",borderRadius:8,background:"white",cursor:page>=(result.pages||1)?"not-allowed":"pointer",fontSize:12,color:"#374151",opacity:page>=(result.pages||1)?.4:1,fontWeight:600}}>»</button>
            </div>
          </div>
          </>
        )}
      </div>

      {/* Modals */}
      <Modal open={modal?.type==="add"} onClose={()=>setModal(null)} title="Add New Candidate" wide>
        <CandidateForm masters={masters} onSave={handleSave} onCancel={()=>setModal(null)} saving={saving}/>
      </Modal>
      <Modal open={modal?.type==="edit"} onClose={()=>setModal(null)} title="Edit Candidate" wide>
        <CandidateForm initial={modal?.data} masters={masters} onSave={handleSave} onCancel={()=>setModal(null)} saving={saving}/>
      </Modal>
      <Modal open={modal?.type==="view"} onClose={()=>setModal(null)} title="Candidate Profile">
        <ViewCandidate c={modal?.data}/>
      </Modal>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
