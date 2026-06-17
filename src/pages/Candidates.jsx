import { useState, useEffect, useCallback } from "react";
import { api } from "../api";
import { fmt, fmtD } from "../utils/constants";
import { Badge, Spin, Icon, Modal } from "../components/UI";
import CandidateForm from "../components/CandidateForm";

// ─── VIEW CANDIDATE ───────────────────────────────────────────────────────────
function ViewCandidate({ c }) {
  if (!c) return null;
  const R = (l, v) => (
    <div style={{ display:"flex", borderBottom:"1px solid #f8fafc", padding:"9px 0" }}>
      <div style={{ width:170, fontSize:11, fontWeight:700, color:"#64748b", textTransform:"uppercase", letterSpacing:.4, flexShrink:0 }}>{l}</div>
      <div style={{ fontSize:13, color:"#0f172a", fontWeight:500 }}>{v||"—"}</div>
    </div>
  );
  return (
    <div>
      <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:18, paddingBottom:18, borderBottom:"1px solid #f1f5f9" }}>
        <div style={{ width:50, height:50, borderRadius:12, background:"linear-gradient(135deg,#2563eb22,#7c3aed22)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, fontWeight:800, color:"#2563eb", flexShrink:0 }}>
          {c.candidateName?.[0]?.toUpperCase()}
        </div>
        <div>
          <h3 style={{ margin:0, fontSize:18, fontWeight:800, color:"#0f172a" }}>{c.candidateName}</h3>
          <p style={{ margin:"2px 0 0", color:"#64748b", fontSize:12 }}>{c.designation} · {c.clientName}</p>
          <div style={{ display:"flex", gap:5, marginTop:5 }}><Badge status={c.joiningStatus}/><Badge code={c.statusCode}/></div>
        </div>
      </div>
      {R("Client",c.clientName)}{R("Designation",c.designation)}{R("Location",c.location)}
      {R("Phone",c.phone)}{R("Offer Month",fmtD(c.offerMonth))}{R("Proposed DOJ",fmtD(c.proposedDOJ))}
      {R("Actual DOJ",fmtD(c.actualDOJ))}{R("Resignation",c.resignationAcceptance)}{R("Owner",c.ownerName)}
      {R("Joining Status",c.joiningStatus)}{R("CTC/Month",c.ctcPerMonth?`₹${fmt(c.ctcPerMonth)}`:"—")}
      {R("Status Code",c.statusCode)}{R("Notes",c.notes)}
    </div>
  );
}

// ─── MULTI SELECT DROPDOWN ────────────────────────────────────────────────────
function MultiSelect({ label, icon, options, selected, onChange }) {
  const [open, setOpen] = useState(false);
  const sel = Array.isArray(selected) ? selected : [];
  const toggle = (v) => {
    const n = sel.includes(v) ? sel.filter(x=>x!==v) : [...sel, v];
    onChange(n);
  };
  return (
    <div style={{ position:"relative" }}>
      <label style={{ display:"block", fontSize:10, fontWeight:600, color:"#64748b", marginBottom:4, textTransform:"uppercase", letterSpacing:.4 }}>{icon} {label}</label>
      <div onClick={()=>setOpen(o=>!o)} style={{ padding:"8px 10px", borderRadius:8, border:`1.5px solid ${sel.length?"#2563eb":"#e2e8f0"}`, background:sel.length?"#eff6ff":"white", cursor:"pointer", fontSize:12, color:sel.length?"#1d4ed8":"#374151", fontWeight:sel.length?600:400, display:"flex", alignItems:"center", justifyContent:"space-between", userSelect:"none" }}>
        <span style={{ overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", flex:1 }}>
          {sel.length===0 ? "All" : sel.length===1 ? sel[0] : `${sel.length} selected`}
        </span>
        <span style={{ marginLeft:4, fontSize:10, flexShrink:0 }}>{open?"▲":"▼"}</span>
      </div>
      {open && (
        <div style={{ position:"absolute", top:"100%", left:0, right:0, background:"white", border:"1.5px solid #e2e8f0", borderRadius:8, zIndex:100, boxShadow:"0 8px 24px rgba(0,0,0,.12)", maxHeight:200, overflow:"auto", marginTop:2 }}>
          {sel.length>0 && (
            <div onClick={()=>{ onChange([]); setOpen(false); }} style={{ padding:"8px 12px", borderBottom:"1px solid #f1f5f9", fontSize:11, color:"#dc2626", fontWeight:600, cursor:"pointer", background:"#fef2f2" }}>
              ✕ Clear All
            </div>
          )}
          {options.map(o=>(
            <div key={o} onClick={()=>toggle(o)} style={{ padding:"8px 12px", display:"flex", alignItems:"center", gap:8, cursor:"pointer", background:sel.includes(o)?"#eff6ff":"white", borderBottom:"1px solid #f8fafc" }}
              onMouseEnter={e=>{ if(!sel.includes(o)) e.currentTarget.style.background="#f8fafc"; }}
              onMouseLeave={e=>{ e.currentTarget.style.background=sel.includes(o)?"#eff6ff":"white"; }}>
              <div style={{ width:14, height:14, borderRadius:4, border:`2px solid ${sel.includes(o)?"#2563eb":"#d1d5db"}`, background:sel.includes(o)?"#2563eb":"white", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                {sel.includes(o) && <span style={{ color:"white", fontSize:9, fontWeight:800 }}>✓</span>}
              </div>
              <span style={{ fontSize:12, color:sel.includes(o)?"#1d4ed8":"#374151", fontWeight:sel.includes(o)?600:400 }}>{o}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── FILTER PANEL ─────────────────────────────────────────────────────────────
function FilterPanel({ filters, masters, onApply, onClose }) {
  const [local, setLocal] = useState({ ...filters });
  const set = (k,v) => setLocal(f=>({...f,[k]:v}));
  const activeCount = [
    ...(local.clients||[]),
    ...(local.owners||[]),
    ...(local.resignations||[]),
    ...(local.statuses||[]),
    ...(local.codes||[]),
    local.location, local.designation,
    local.offerFrom, local.offerTo,
    local.proposedFrom, local.proposedTo,
    local.actualFrom, local.actualTo,
  ].filter(Boolean).length;

  const clearAll = () => setLocal({ clients:[], owners:[], resignations:[], statuses:[], codes:[], location:"", designation:"", offerFrom:"", offerTo:"", proposedFrom:"", proposedTo:"", actualFrom:"", actualTo:"" });

  const DateRange = ({ label, icon, fk, tk }) => (
    <div>
      <label style={{ display:"block", fontSize:10, fontWeight:600, color:"#64748b", marginBottom:4, textTransform:"uppercase", letterSpacing:.4 }}>{icon} {label}</label>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:6 }}>
        <div>
          <div style={{ fontSize:9, color:"#94a3b8", marginBottom:2 }}>FROM</div>
          <input type="date" value={local[fk]||""} onChange={e=>set(fk,e.target.value)} style={{ width:"100%", padding:"7px 8px", borderRadius:7, border:`1.5px solid ${local[fk]?"#2563eb":"#e2e8f0"}`, fontSize:11, outline:"none", background:local[fk]?"#eff6ff":"white", boxSizing:"border-box" }}/>
        </div>
        <div>
          <div style={{ fontSize:9, color:"#94a3b8", marginBottom:2 }}>TO</div>
          <input type="date" value={local[tk]||""} onChange={e=>set(tk,e.target.value)} style={{ width:"100%", padding:"7px 8px", borderRadius:7, border:`1.5px solid ${local[tk]?"#2563eb":"#e2e8f0"}`, fontSize:11, outline:"none", background:local[tk]?"#eff6ff":"white", boxSizing:"border-box" }}/>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ position:"fixed", top:0, right:0, bottom:0, width:400, background:"white", zIndex:600, boxShadow:"-4px 0 40px rgba(0,0,0,.18)", display:"flex", flexDirection:"column", fontFamily:"Inter,system-ui,sans-serif" }}>
      {/* Header */}
      <div style={{ padding:"20px 22px 16px", background:"linear-gradient(135deg,#0f172a,#1e3a5f)", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div>
          <div style={{ fontSize:16, fontWeight:800, color:"white", display:"flex", alignItems:"center", gap:8 }}>
            <Icon n="filter" s={16}/> Advanced Filters
          </div>
          <div style={{ fontSize:11, color:"#94a3b8", marginTop:3 }}>
            {activeCount>0 ? <span style={{ color:"#93c5fd" }}>● {activeCount} filter{activeCount>1?"s":""} active</span> : "No filters applied"}
          </div>
        </div>
        <button onClick={onClose} style={{ background:"rgba(255,255,255,.1)", border:"none", borderRadius:8, width:32, height:32, cursor:"pointer", color:"white", fontSize:16, display:"flex", alignItems:"center", justifyContent:"center" }}>✕</button>
      </div>

      {/* Body */}
      <div style={{ flex:1, overflow:"auto", padding:20 }}>

        {/* Multi-select filters */}
        <div style={{ background:"#f8fafc", borderRadius:12, padding:16, marginBottom:16, border:"1px solid #f1f5f9" }}>
          <div style={{ fontSize:12, fontWeight:700, color:"#0f172a", marginBottom:12, display:"flex", alignItems:"center", gap:6 }}>🏢 Client & People</div>
          <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
            <MultiSelect label="Client" icon="🏢" options={masters.clients||[]} selected={local.clients||[]} onChange={v=>set("clients",v)}/>
            <MultiSelect label="Owner" icon="👤" options={masters.owners||[]} selected={local.owners||[]} onChange={v=>set("owners",v)}/>
          </div>
        </div>

        <div style={{ background:"#f8fafc", borderRadius:12, padding:16, marginBottom:16, border:"1px solid #f1f5f9" }}>
          <div style={{ fontSize:12, fontWeight:700, color:"#0f172a", marginBottom:12, display:"flex", alignItems:"center", gap:6 }}>📊 Status Filters</div>
          <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
            <MultiSelect label="Joining Status" icon="📋" options={masters.joiningStatus||[]} selected={local.statuses||[]} onChange={v=>set("statuses",v)}/>
            <MultiSelect label="Resignation" icon="📝" options={masters.resignationStatus||["Pending","Accepted","NA"]} selected={local.resignations||[]} onChange={v=>set("resignations",v)}/>
            <MultiSelect label="Status Code" icon="🎨" options={(masters.statusCodes||[]).map(s=>s.code||s)} selected={local.codes||[]} onChange={v=>set("codes",v)}/>
          </div>
        </div>

        <div style={{ background:"#f8fafc", borderRadius:12, padding:16, marginBottom:16, border:"1px solid #f1f5f9" }}>
          <div style={{ fontSize:12, fontWeight:700, color:"#0f172a", marginBottom:12, display:"flex", alignItems:"center", gap:6 }}>📍 Location & Position</div>
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            <div>
              <label style={{ display:"block", fontSize:10, fontWeight:600, color:"#64748b", marginBottom:4, textTransform:"uppercase", letterSpacing:.4 }}>📍 Location</label>
              <input value={local.location||""} onChange={e=>set("location",e.target.value)} placeholder="e.g. Mumbai, Pune…" style={{ width:"100%", padding:"8px 10px", borderRadius:8, border:`1.5px solid ${local.location?"#2563eb":"#e2e8f0"}`, fontSize:12, outline:"none", background:local.location?"#eff6ff":"white", boxSizing:"border-box" }}/>
            </div>
            <div>
              <label style={{ display:"block", fontSize:10, fontWeight:600, color:"#64748b", marginBottom:4, textTransform:"uppercase", letterSpacing:.4 }}>💼 Position / Designation</label>
              <input value={local.designation||""} onChange={e=>set("designation",e.target.value)} placeholder="e.g. Manager, Engineer…" style={{ width:"100%", padding:"8px 10px", borderRadius:8, border:`1.5px solid ${local.designation?"#2563eb":"#e2e8f0"}`, fontSize:12, outline:"none", background:local.designation?"#eff6ff":"white", boxSizing:"border-box" }}/>
            </div>
          </div>
        </div>

        <div style={{ background:"#f8fafc", borderRadius:12, padding:16, marginBottom:16, border:"1px solid #f1f5f9" }}>
          <div style={{ fontSize:12, fontWeight:700, color:"#0f172a", marginBottom:12, display:"flex", alignItems:"center", gap:6 }}>📅 Date Ranges</div>
          <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
            <DateRange label="Offer Month" icon="📅" fk="offerFrom" tk="offerTo"/>
            <DateRange label="Proposed DOJ" icon="🗓️" fk="proposedFrom" tk="proposedTo"/>
            <DateRange label="Actual DOJ" icon="✅" fk="actualFrom" tk="actualTo"/>
          </div>
        </div>

      </div>

      {/* Footer */}
      <div style={{ padding:"14px 20px", borderTop:"1px solid #f1f5f9", background:"#f8fafc", display:"flex", gap:8 }}>
        <button onClick={clearAll} style={{ flex:1, padding:"10px", background:"white", border:"1.5px solid #e2e8f0", borderRadius:9, fontWeight:600, cursor:"pointer", fontSize:13, color:"#64748b" }}>
          Clear All
        </button>
        <button onClick={()=>{ onApply(local); onClose(); }} style={{ flex:2, padding:"10px", background:"linear-gradient(135deg,#2563eb,#7c3aed)", color:"white", border:"none", borderRadius:9, fontWeight:700, cursor:"pointer", fontSize:13 }}>
          Apply Filters{activeCount>0?` (${activeCount})`:""}
        </button>
      </div>
    </div>
  );
}

// ─── MAIN CANDIDATES PAGE ─────────────────────────────────────────────────────
export default function Candidates({ masters, user }) {
  const [result, setResult] = useState({ candidates:[], total:0, pages:1 });
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({
    clients:[], owners:[], resignations:[], statuses:[], codes:[],
    location:"", designation:"",
    offerFrom:"", offerTo:"", proposedFrom:"", proposedTo:"", actualFrom:"", actualTo:""
  });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [modal, setModal] = useState(null);
  const [saving, setSaving] = useState(false);
  const PER = 20;

  const load = useCallback(async (p=1, s="", f={}) => {
    setLoading(true);
    const params = { page:p, limit:PER, sortBy:"id", sortDir:"desc" };
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
      setResult(res || { candidates:[], total:0, pages:1 });
    } catch(e) { console.error(e); }
    setLoading(false);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => { load(1, search, filters); setPage(1); }, 400);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => { load(page, search, filters); }, [page, filters]);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this candidate?")) return;
    try {
      const r = await api.deleteCandidate(id);
      if (r.error) { alert("Error: "+r.error); return; }
      load(page, search, filters);
    } catch(e) { alert("Delete failed: "+e.message); }
  };

  const handleSave = async (form) => {
    setSaving(true);
    try {
      const r = modal.type==="add" ? await api.createCandidate(form) : await api.updateCandidate(modal.data.id, form);
      if (r.error) { alert("Error: "+r.error); setSaving(false); return; }
      setModal(null); load(page, search, filters);
    } catch(e) { alert("Save failed: "+e.message); }
    setSaving(false);
  };

  const exportCSV = () => {
    const cols = ["SR.NO","Client","Candidate","Position","Location","Phone","Offer Mth","Prop DOJ","Actual DOJ","Resign","Owner","Status","CTC/Mo","Code"];
    const rows = (result.candidates||[]).map((c,i)=>[i+1,c.clientName,c.candidateName,c.designation,c.location,c.phone,fmtD(c.offerMonth),fmtD(c.proposedDOJ),fmtD(c.actualDOJ),c.resignationAcceptance,c.ownerName,c.joiningStatus,c.ctcPerMonth?`₹${fmt(c.ctcPerMonth)}`:"",c.statusCode]);
    const csv = [cols,...rows].map(r=>r.map(v=>`"${v||""}"`).join(",")).join("\n");
    const a=document.createElement("a"); a.href="data:text/csv;charset=utf-8,"+encodeURIComponent(csv); a.download="candidates.csv"; a.click();
  };

  const activeFilters = [
    ...(filters.clients||[]),
    ...(filters.owners||[]),
    ...(filters.resignations||[]),
    ...(filters.statuses||[]),
    ...(filters.codes||[]),
    filters.location, filters.designation,
    filters.offerFrom, filters.offerTo,
    filters.proposedFrom, filters.proposedTo,
    filters.actualFrom, filters.actualTo,
  ].filter(Boolean).length;

  const clearAll = () => {
    const nf = { clients:[], owners:[], resignations:[], statuses:[], codes:[], location:"", designation:"", offerFrom:"", offerTo:"", proposedFrom:"", proposedTo:"", actualFrom:"", actualTo:"" };
    setFilters(nf); setPage(1); load(1, search, nf);
  };

  const canEdit = user.role !== "viewer";
  const canDel = user.role === "admin";

  return (
    <div style={{ position:"relative" }}>
      {showFilters && <div onClick={()=>setShowFilters(false)} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.4)", zIndex:599 }}/>}
      {showFilters && <FilterPanel filters={filters} masters={masters} onApply={(f)=>{ setFilters(f); setPage(1); load(1,search,f); }} onClose={()=>setShowFilters(false)}/>}

      {/* Header */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:18, flexWrap:"wrap", gap:10 }}>
        <div>
          <h2 style={{ fontSize:20, fontWeight:800, color:"#0f172a", margin:0 }}>Candidates</h2>
          <p style={{ color:"#64748b", margin:"3px 0 0", fontSize:13 }}>{result.total} records · {activeFilters>0&&<span style={{ color:"#2563eb", fontWeight:600 }}>{activeFilters} filter{activeFilters>1?"s":""} active</span>}</p>
        </div>
        <div style={{ display:"flex", gap:7, flexWrap:"wrap" }}>
          <button onClick={()=>load(page,search,filters)} style={{ display:"flex", alignItems:"center", gap:5, padding:"8px 12px", background:"#f1f5f9", border:"none", borderRadius:8, fontWeight:600, cursor:"pointer", fontSize:12 }}><Icon n="refresh" s={13}/> Refresh</button>
          {canEdit && <button onClick={()=>setModal({type:"add"})} style={{ display:"flex", alignItems:"center", gap:5, padding:"8px 14px", background:"linear-gradient(135deg,#2563eb,#7c3aed)", color:"white", border:"none", borderRadius:8, fontWeight:600, cursor:"pointer", fontSize:12 }}><Icon n="plus" s={13}/> Add Candidate</button>}
          <button onClick={exportCSV} style={{ display:"flex", alignItems:"center", gap:5, padding:"8px 12px", background:"#f1f5f9", border:"none", borderRadius:8, fontWeight:600, cursor:"pointer", fontSize:12 }}><Icon n="dl" s={13}/> Export CSV</button>
        </div>
      </div>

      {/* Search + Filter Button */}
      <div style={{ background:"white", borderRadius:12, padding:14, marginBottom:14, boxShadow:"0 1px 3px rgba(0,0,0,.06)", border:"1px solid #f1f5f9" }}>
        <div style={{ display:"flex", gap:8 }}>
          <div style={{ flex:1, display:"flex", alignItems:"center", gap:7, background:"#f8fafc", borderRadius:8, padding:"9px 12px", border:"1.5px solid #e2e8f0" }}>
            <Icon n="search" s={14}/>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search name, client, phone, designation…"
              style={{ border:"none", background:"none", outline:"none", fontSize:13, width:"100%", color:"#374151" }}/>
            {search && <button onClick={()=>{setSearch("");load(1,"",filters);}} style={{ border:"none", background:"none", cursor:"pointer", color:"#94a3b8", fontSize:16, display:"flex", padding:0 }}>✕</button>}
          </div>
          <button onClick={()=>setShowFilters(true)} style={{ display:"flex", alignItems:"center", gap:7, padding:"9px 16px", background:activeFilters>0?"linear-gradient(135deg,#2563eb,#7c3aed)":"white", border:`1.5px solid ${activeFilters>0?"#2563eb":"#e2e8f0"}`, borderRadius:8, cursor:"pointer", fontSize:13, fontWeight:700, color:activeFilters>0?"white":"#374151" }}>
            <Icon n="filter" s={14}/>
            Filters
            {activeFilters>0 && <span style={{ background:"white", color:"#2563eb", borderRadius:"50%", width:18, height:18, display:"flex", alignItems:"center", justifyContent:"center", fontSize:10, fontWeight:800 }}>{activeFilters}</span>}
          </button>
        </div>

        {/* Active Filter Chips */}
        {activeFilters > 0 && (
          <div style={{ display:"flex", gap:5, flexWrap:"wrap", marginTop:10 }}>
            {[...(filters.clients||[]).map(v=>({k:"clients",v,l:`Client: ${v}`})),
              ...(filters.owners||[]).map(v=>({k:"owners",v,l:`Owner: ${v}`})),
              ...(filters.statuses||[]).map(v=>({k:"statuses",v,l:`Status: ${v}`})),
              ...(filters.resignations||[]).map(v=>({k:"resignations",v,l:`Resign: ${v}`})),
              ...(filters.codes||[]).map(v=>({k:"codes",v,l:`Code: ${v}`})),
              filters.location&&{k:"location",v:filters.location,l:`Location: ${filters.location}`},
              filters.designation&&{k:"designation",v:filters.designation,l:`Position: ${filters.designation}`},
              filters.offerFrom&&{k:"offerFrom",v:filters.offerFrom,l:`Offer From: ${filters.offerFrom}`},
              filters.offerTo&&{k:"offerTo",v:filters.offerTo,l:`Offer To: ${filters.offerTo}`},
              filters.proposedFrom&&{k:"proposedFrom",v:filters.proposedFrom,l:`Prop From: ${filters.proposedFrom}`},
              filters.proposedTo&&{k:"proposedTo",v:filters.proposedTo,l:`Prop To: ${filters.proposedTo}`},
              filters.actualFrom&&{k:"actualFrom",v:filters.actualFrom,l:`Actual From: ${filters.actualFrom}`},
              filters.actualTo&&{k:"actualTo",v:filters.actualTo,l:`Actual To: ${filters.actualTo}`},
            ].filter(Boolean).map((chip,i)=>(
              <span key={i} style={{ display:"flex", alignItems:"center", gap:4, padding:"3px 10px", background:"#eff6ff", border:"1px solid #bfdbfe", borderRadius:20, fontSize:11, color:"#1d4ed8", fontWeight:600 }}>
                {chip.l}
                <button onClick={()=>{
                  const nf = {...filters};
                  if (Array.isArray(nf[chip.k])) nf[chip.k] = nf[chip.k].filter(x=>x!==chip.v);
                  else nf[chip.k] = "";
                  setFilters(nf); setPage(1); load(1,search,nf);
                }} style={{ border:"none", background:"none", cursor:"pointer", color:"#3b82f6", fontSize:13, padding:0, display:"flex", alignItems:"center", marginLeft:1 }}>✕</button>
              </span>
            ))}
            <button onClick={clearAll} style={{ padding:"3px 10px", background:"#fee2e2", border:"1px solid #fecaca", borderRadius:20, fontSize:11, color:"#dc2626", fontWeight:600, cursor:"pointer" }}>Clear All ✕</button>
          </div>
        )}
      </div>

      {/* Table */}
      <div style={{ background:"white", borderRadius:12, boxShadow:"0 1px 3px rgba(0,0,0,.06)", border:"1px solid #f1f5f9", overflow:"auto" }}>
        {loading ? (
          <div style={{ padding:60, textAlign:"center" }}><Spin/><div style={{ marginTop:10, color:"#94a3b8", fontSize:13 }}>Loading candidates…</div></div>
        ) : (
          <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12 }}>
            <thead>
              <tr style={{ background:"linear-gradient(to right,#f8fafc,#f1f5f9)", borderBottom:"2px solid #e2e8f0" }}>
                {[["SR.NO",50],["CLIENT",110],["CANDIDATE",130],["POSITION",110],["LOC",75],["PHONE",100],["OFFER MTH",90],["PROP DOJ",90],["ACTUAL DOJ",90],["RESIGN",80],["OWNER",90],["STATUS",85],["CTC/MO",80],["CODE",60],["",80]].map(([l,w])=>(
                  <th key={l} style={{ padding:"10px 10px", textAlign:"left", fontWeight:700, color:"#475569", fontSize:10, textTransform:"uppercase", letterSpacing:.5, minWidth:w, whiteSpace:"nowrap" }}>{l}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {!(result.candidates||[]).length && (
                <tr><td colSpan={15} style={{ padding:60, textAlign:"center" }}>
                  <div style={{ fontSize:36, marginBottom:10 }}>🔍</div>
                  <div style={{ fontSize:14, fontWeight:700, color:"#0f172a", marginBottom:4 }}>No candidates found</div>
                  <div style={{ fontSize:12, color:"#94a3b8" }}>{activeFilters>0?"Try adjusting or clearing your filters":"No candidates added yet"}</div>
                  {activeFilters>0 && <button onClick={clearAll} style={{ marginTop:12, padding:"8px 16px", background:"#2563eb", color:"white", border:"none", borderRadius:8, cursor:"pointer", fontWeight:600, fontSize:12 }}>Clear Filters</button>}
                </td></tr>
              )}
              {(result.candidates||[]).map((c,i)=>(
                <tr key={c.id}
                  style={{ borderBottom:"1px solid #f8fafc", background:i%2?"#fcfcfd":"white", transition:"background .12s" }}
                  onMouseEnter={e=>e.currentTarget.style.background="#f0f9ff"}
                  onMouseLeave={e=>e.currentTarget.style.background=i%2?"#fcfcfd":"white"}>
                  <td style={{ padding:"10px 10px", color:"#94a3b8", fontWeight:700, fontSize:11 }}>{(page-1)*PER+i+1}</td>
                  <td style={{ padding:"10px 10px", fontWeight:700, color:"#1e293b", maxWidth:110, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{c.clientName||"—"}</td>
                  <td style={{ padding:"10px 10px" }}>
                    <div style={{ fontWeight:600, color:"#0f172a", maxWidth:125, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{c.candidateName}</div>
                    <div style={{ fontSize:10, color:"#94a3b8", marginTop:1 }}>ID: {c.id}</div>
                  </td>
                  <td style={{ padding:"10px 10px", color:"#475569", maxWidth:110, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{c.designation||"—"}</td>
                  <td style={{ padding:"10px 10px", color:"#475569", whiteSpace:"nowrap" }}>{c.location||"—"}</td>
                  <td style={{ padding:"10px 10px", color:"#64748b", fontFamily:"monospace", fontSize:11, whiteSpace:"nowrap" }}>{c.phone||"—"}</td>
                  <td style={{ padding:"10px 10px", color:"#64748b", whiteSpace:"nowrap", fontSize:11 }}>{fmtD(c.offerMonth)}</td>
                  <td style={{ padding:"10px 10px", color:"#64748b", whiteSpace:"nowrap", fontSize:11 }}>{fmtD(c.proposedDOJ)}</td>
                  <td style={{ padding:"10px 10px", color:"#64748b", whiteSpace:"nowrap", fontSize:11 }}>{fmtD(c.actualDOJ)}</td>
                  <td style={{ padding:"10px 10px", whiteSpace:"nowrap" }}>
                    <span style={{ fontSize:10, fontWeight:600, padding:"2px 6px", borderRadius:8,
                      background:c.resignationAcceptance==="Pending"?"#fef9c3":c.resignationAcceptance==="Accepted"?"#dcfce7":"#f1f5f9",
                      color:c.resignationAcceptance==="Pending"?"#92400e":c.resignationAcceptance==="Accepted"?"#16a34a":"#64748b" }}>
                      {c.resignationAcceptance||"—"}
                    </span>
                  </td>
                  <td style={{ padding:"10px 10px", color:"#475569", whiteSpace:"nowrap" }}>{c.ownerName||"—"}</td>
                  <td style={{ padding:"10px 10px" }}><Badge status={c.joiningStatus}/></td>
                  <td style={{ padding:"10px 10px", color:"#0f172a", fontWeight:700, whiteSpace:"nowrap", fontSize:11 }}>{c.ctcPerMonth?`₹${fmt(c.ctcPerMonth)}`:"—"}</td>
                  <td style={{ padding:"10px 10px" }}><Badge code={c.statusCode}/></td>
                  <td style={{ padding:"10px 10px" }}>
                    <div style={{ display:"flex", gap:3 }}>
                      <button onClick={()=>setModal({type:"view",data:c})} title="View" style={{ padding:5, background:"#f0f9ff", border:"none", borderRadius:5, cursor:"pointer", color:"#2563eb", display:"flex" }}><Icon n="eye" s={12}/></button>
                      {canEdit&&<button onClick={()=>setModal({type:"edit",data:c})} title="Edit" style={{ padding:5, background:"#f0fdf4", border:"none", borderRadius:5, cursor:"pointer", color:"#16a34a", display:"flex" }}><Icon n="edit" s={12}/></button>}
                      {canDel&&<button onClick={()=>handleDelete(c.id)} title="Delete" style={{ padding:5, background:"#fef2f2", border:"none", borderRadius:5, cursor:"pointer", color:"#dc2626", display:"flex" }}><Icon n="trash" s={12}/></button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:12, flexWrap:"wrap", gap:8 }}>
        <span style={{ fontSize:12, color:"#64748b" }}>Showing {(page-1)*PER+1}–{Math.min(page*PER,result.total)} of {result.total} candidates</span>
        <div style={{ display:"flex", gap:3 }}>
          <button onClick={()=>{setPage(1);load(1,search,filters);}} disabled={page<=1} style={{ padding:"5px 10px", border:"1.5px solid #e2e8f0", borderRadius:6, background:"white", cursor:page<=1?"not-allowed":"pointer", fontSize:12, opacity:page<=1?.4:1 }}>«</button>
          <button onClick={()=>{const p=page-1;setPage(p);load(p,search,filters);}} disabled={page<=1} style={{ padding:"5px 10px", border:"1.5px solid #e2e8f0", borderRadius:6, background:"white", cursor:page<=1?"not-allowed":"pointer", fontSize:12, opacity:page<=1?.4:1 }}>‹ Prev</button>
          {Array.from({length:Math.min(5,result.pages||1)},(_,i)=>{
            const p = Math.max(1,Math.min(page-2,result.pages-4))+i;
            if(p<1||p>result.pages) return null;
            return <button key={p} onClick={()=>{setPage(p);load(p,search,filters);}} style={{ padding:"5px 10px", border:"1.5px solid #e2e8f0", borderRadius:6, background:p===page?"#2563eb":"white", color:p===page?"white":"#374151", cursor:"pointer", fontSize:12, fontWeight:p===page?700:400 }}>{p}</button>;
          })}
          <button onClick={()=>{const p=page+1;setPage(p);load(p,search,filters);}} disabled={page>=result.pages} style={{ padding:"5px 10px", border:"1.5px solid #e2e8f0", borderRadius:6, background:"white", cursor:page>=result.pages?"not-allowed":"pointer", fontSize:12, opacity:page>=result.pages?.4:1 }}>Next ›</button>
          <button onClick={()=>{setPage(result.pages);load(result.pages,search,filters);}} disabled={page>=result.pages} style={{ padding:"5px 10px", border:"1.5px solid #e2e8f0", borderRadius:6, background:"white", cursor:page>=result.pages?"not-allowed":"pointer", fontSize:12, opacity:page>=result.pages?.4:1 }}>»</button>
        </div>
      </div>

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
