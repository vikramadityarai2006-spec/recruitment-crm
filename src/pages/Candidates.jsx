import { useState, useEffect, useCallback, useRef } from "react";
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
      {R("CTC Per Month",c.ctcPerMonth?`₹${fmt(c.ctcPerMonth)}`:"—")}{R("Notes",c.notes)}
    </div>
  );
}

// ─── ADVANCED FILTER PANEL ────────────────────────────────────────────────────
function FilterPanel({ filters, setFilters, masters, onApply, onClear, onClose }) {
  const [local, setLocal] = useState({ ...filters });
  const set = (k, v) => setLocal(f => ({ ...f, [k]: v }));

  const activeCount = Object.values(local).filter(Boolean).length;

  const Section = ({ title, icon, children }) => (
    <div style={{ marginBottom:20 }}>
      <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:10, paddingBottom:6, borderBottom:"2px solid #f1f5f9" }}>
        <span style={{ fontSize:15 }}>{icon}</span>
        <span style={{ fontSize:12, fontWeight:700, color:"#0f172a", textTransform:"uppercase", letterSpacing:.6 }}>{title}</span>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
        {children}
      </div>
    </div>
  );

  const Sel = ({ label, k, opts, icon }) => (
    <div>
      <label style={{ display:"block", fontSize:10, fontWeight:600, color:"#64748b", marginBottom:3, textTransform:"uppercase", letterSpacing:.4 }}>
        {icon} {label}
      </label>
      <select value={local[k]||""} onChange={e=>set(k,e.target.value)}
        style={{ width:"100%", padding:"8px 10px", borderRadius:8, border:`1.5px solid ${local[k]?"#2563eb":"#e2e8f0"}`, fontSize:12, background:local[k]?"#eff6ff":"white", outline:"none", color:local[k]?"#1d4ed8":"#374151", fontWeight:local[k]?600:400 }}>
        <option value="">All</option>
        {opts.map(o=><option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );

  const DateRange = ({ label, fromKey, toKey, icon }) => (
    <div style={{ gridColumn:"1 / -1" }}>
      <label style={{ display:"block", fontSize:10, fontWeight:600, color:"#64748b", marginBottom:6, textTransform:"uppercase", letterSpacing:.4 }}>
        {icon} {label}
      </label>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
        <div>
          <label style={{ fontSize:9, color:"#94a3b8", display:"block", marginBottom:3 }}>FROM</label>
          <input type="date" value={local[fromKey]||""} onChange={e=>set(fromKey,e.target.value)}
            style={{ width:"100%", padding:"7px 10px", borderRadius:7, border:`1.5px solid ${local[fromKey]?"#2563eb":"#e2e8f0"}`, fontSize:12, outline:"none", background:local[fromKey]?"#eff6ff":"white", boxSizing:"border-box" }}/>
        </div>
        <div>
          <label style={{ fontSize:9, color:"#94a3b8", display:"block", marginBottom:3 }}>TO</label>
          <input type="date" value={local[toKey]||""} onChange={e=>set(toKey,e.target.value)}
            style={{ width:"100%", padding:"7px 10px", borderRadius:7, border:`1.5px solid ${local[toKey]?"#2563eb":"#e2e8f0"}`, fontSize:12, outline:"none", background:local[toKey]?"#eff6ff":"white", boxSizing:"border-box" }}/>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ position:"fixed", top:0, right:0, bottom:0, width:380, background:"white", zIndex:500, boxShadow:"-4px 0 30px rgba(0,0,0,.15)", display:"flex", flexDirection:"column", fontFamily:"Inter,system-ui,sans-serif" }}>
      {/* Header */}
      <div style={{ padding:"18px 20px", borderBottom:"1px solid #f1f5f9", background:"linear-gradient(135deg,#0f172a,#1e3a5f)", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div>
          <div style={{ fontSize:16, fontWeight:800, color:"white" }}>🔍 Advanced Filters</div>
          <div style={{ fontSize:11, color:"#94a3b8", marginTop:2 }}>
            {activeCount > 0 ? <span style={{ color:"#93c5fd" }}>{activeCount} filter{activeCount>1?"s":""} active</span> : "No filters applied"}
          </div>
        </div>
        <button onClick={onClose} style={{ background:"#1e293b", border:"none", borderRadius:8, padding:"6px 10px", cursor:"pointer", color:"#94a3b8", fontSize:18, display:"flex", alignItems:"center" }}>✕</button>
      </div>

      {/* Filter Body */}
      <div style={{ flex:1, overflow:"auto", padding:20 }}>

        <Section title="Client & Position" icon="🏢">
          <Sel label="Client" k="client" icon="🏢" opts={masters.clients||[]}/>
          <Sel label="Location" k="location" icon="📍" opts={[...new Set((masters.locations||[]))]}/>
          <div style={{ gridColumn:"1/-1" }}>
            <label style={{ display:"block", fontSize:10, fontWeight:600, color:"#64748b", marginBottom:3, textTransform:"uppercase", letterSpacing:.4 }}>💼 Position / Designation</label>
            <input value={local.designation||""} onChange={e=>set("designation",e.target.value)} placeholder="Type position…"
              style={{ width:"100%", padding:"8px 10px", borderRadius:8, border:`1.5px solid ${local.designation?"#2563eb":"#e2e8f0"}`, fontSize:12, outline:"none", background:local.designation?"#eff6ff":"white", boxSizing:"border-box" }}/>
          </div>
        </Section>

        <Section title="People" icon="👤">
          <Sel label="Owner" k="owner" icon="👤" opts={masters.owners||[]}/>
          <Sel label="Resignation" k="resignation" icon="📝" opts={masters.resignationStatus||["Pending","Accepted","NA"]}/>
        </Section>

        <Section title="Status & Code" icon="📊">
          <Sel label="Joining Status" k="status" icon="📋" opts={masters.joiningStatus||[]}/>
          <Sel label="Status Code" k="statusCode" icon="🎨" opts={(masters.statusCodes||[]).map(s=>s.code||s)}/>
        </Section>

        <Section title="Date Filters" icon="📅">
          <DateRange label="Offer Month" fromKey="offerFrom" toKey="offerTo" icon="📅"/>
          <DateRange label="Proposed DOJ" fromKey="proposedFrom" toKey="proposedTo" icon="🗓️"/>
          <DateRange label="Actual DOJ" fromKey="actualFrom" toKey="actualTo" icon="✅"/>
        </Section>

      </div>

      {/* Footer */}
      <div style={{ padding:"16px 20px", borderTop:"1px solid #f1f5f9", background:"#f8fafc", display:"flex", gap:8 }}>
        <button onClick={()=>{ setLocal({client:"",location:"",designation:"",owner:"",resignation:"",status:"",statusCode:"",offerFrom:"",offerTo:"",proposedFrom:"",proposedTo:"",actualFrom:"",actualTo:""}); }}
          style={{ flex:1, padding:"10px", background:"white", border:"1.5px solid #e2e8f0", borderRadius:9, fontWeight:600, cursor:"pointer", fontSize:13, color:"#64748b" }}>
          Clear All
        </button>
        <button onClick={()=>{ setFilters(local); onApply(local); onClose(); }}
          style={{ flex:2, padding:"10px", background:"linear-gradient(135deg,#2563eb,#7c3aed)", color:"white", border:"none", borderRadius:9, fontWeight:700, cursor:"pointer", fontSize:13 }}>
          Apply Filters {activeCount>0&&`(${activeCount})`}
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
    client:"", location:"", designation:"", owner:"", resignation:"",
    status:"", statusCode:"",
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
    if (f.client) params.client = f.client;
    if (f.owner) params.owner = f.owner;
    if (f.status) params.status = f.status;
    if (f.statusCode) params.statusCode = f.statusCode;
    if (f.location) params.location = f.location;
    if (f.designation) params.designation = f.designation;
    if (f.resignation) params.resignation = f.resignation;
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
    const cols = ["ID","Client","Designation","Location","Candidate","Phone","Offer Month","Proposed DOJ","Actual DOJ","Resignation","Owner","Status","CTC","Code","Notes"];
    const rows = (result.candidates||[]).map(c=>[c.id,c.clientName,c.designation,c.location,c.candidateName,c.phone,c.offerMonth,c.proposedDOJ,c.actualDOJ,c.resignationAcceptance,c.ownerName,c.joiningStatus,c.ctcPerMonth,c.statusCode,c.notes]);
    const csv = [cols,...rows].map(r=>r.map(v=>`"${v||""}"`).join(",")).join("\n");
    const a=document.createElement("a"); a.href="data:text/csv;charset=utf-8,"+encodeURIComponent(csv); a.download="candidates.csv"; a.click();
  };

  const activeFilters = Object.values(filters).filter(Boolean).length;
  const canEdit = user.role !== "viewer";
  const canDel = user.role === "admin";

  // Active filter chips
  const filterLabels = {
    client:"Client", location:"Location", designation:"Position", owner:"Owner",
    resignation:"Resignation", status:"Status", statusCode:"Code",
    offerFrom:"Offer From", offerTo:"Offer To",
    proposedFrom:"Proposed From", proposedTo:"Proposed To",
    actualFrom:"Actual From", actualTo:"Actual To"
  };

  return (
    <div style={{ position:"relative" }}>
      {/* Overlay when filter panel is open */}
      {showFilters && <div onClick={()=>setShowFilters(false)} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.3)", zIndex:499 }}/>}

      {/* Filter Panel */}
      {showFilters && (
        <FilterPanel
          filters={filters}
          setFilters={setFilters}
          masters={masters}
          onApply={(f) => { setFilters(f); setPage(1); load(1, search, f); }}
          onClear={() => { const nf={client:"",location:"",designation:"",owner:"",resignation:"",status:"",statusCode:"",offerFrom:"",offerTo:"",proposedFrom:"",proposedTo:"",actualFrom:"",actualTo:""}; setFilters(nf); setPage(1); load(1, search, nf); }}
          onClose={()=>setShowFilters(false)}
        />
      )}

      {/* Header */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:18, flexWrap:"wrap", gap:10 }}>
        <div>
          <h2 style={{ fontSize:20, fontWeight:800, color:"#0f172a", margin:0 }}>Candidates</h2>
          <p style={{ color:"#64748b", margin:"3px 0 0", fontSize:13 }}>{result.total} records in database</p>
        </div>
        <div style={{ display:"flex", gap:7, flexWrap:"wrap" }}>
          <button onClick={()=>load(page,search,filters)} style={{ display:"flex", alignItems:"center", gap:5, padding:"8px 12px", background:"#f1f5f9", border:"none", borderRadius:8, fontWeight:600, cursor:"pointer", fontSize:12 }}>
            <Icon n="refresh" s={13}/> Refresh
          </button>
          {canEdit && <button onClick={()=>setModal({type:"add"})} style={{ display:"flex", alignItems:"center", gap:5, padding:"8px 14px", background:"linear-gradient(135deg,#2563eb,#7c3aed)", color:"white", border:"none", borderRadius:8, fontWeight:600, cursor:"pointer", fontSize:12 }}>
            <Icon n="plus" s={13}/> Add Candidate
          </button>}
          <button onClick={exportCSV} style={{ display:"flex", alignItems:"center", gap:5, padding:"8px 12px", background:"#f1f5f9", border:"none", borderRadius:8, fontWeight:600, cursor:"pointer", fontSize:12 }}>
            <Icon n="dl" s={13}/> Export CSV
          </button>
        </div>
      </div>

      {/* Search Bar + Filter Button */}
      <div style={{ background:"white", borderRadius:12, padding:14, marginBottom:14, boxShadow:"0 1px 3px rgba(0,0,0,.06)", border:"1px solid #f1f5f9" }}>
        <div style={{ display:"flex", gap:8 }}>
          <div style={{ flex:1, display:"flex", alignItems:"center", gap:7, background:"#f8fafc", borderRadius:8, padding:"9px 12px", border:"1.5px solid #e2e8f0" }}>
            <Icon n="search" s={14}/>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search name, client, phone, designation…"
              style={{ border:"none", background:"none", outline:"none", fontSize:13, width:"100%", color:"#374151" }}/>
            {search && <button onClick={()=>{setSearch("");load(1,"",filters);}} style={{ border:"none", background:"none", cursor:"pointer", color:"#94a3b8", display:"flex", padding:0, fontSize:16 }}>✕</button>}
          </div>

          {/* Filter Button */}
          <button onClick={()=>setShowFilters(true)}
            style={{ display:"flex", alignItems:"center", gap:7, padding:"9px 16px", background:activeFilters>0?"linear-gradient(135deg,#2563eb,#7c3aed)":"#f8fafc", border:`1.5px solid ${activeFilters>0?"#2563eb":"#e2e8f0"}`, borderRadius:8, cursor:"pointer", fontSize:13, fontWeight:700, color:activeFilters>0?"white":"#374151", position:"relative" }}>
            <Icon n="filter" s={14}/>
            Filters
            {activeFilters > 0 && (
              <span style={{ background:"white", color:"#2563eb", borderRadius:"50%", width:18, height:18, display:"flex", alignItems:"center", justifyContent:"center", fontSize:10, fontWeight:800, marginLeft:2 }}>{activeFilters}</span>
            )}
          </button>
        </div>

        {/* Active Filter Chips */}
        {activeFilters > 0 && (
          <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginTop:10 }}>
            {Object.entries(filters).filter(([,v])=>v).map(([k,v])=>(
              <span key={k} style={{ display:"flex", alignItems:"center", gap:4, padding:"3px 10px", background:"#eff6ff", border:"1px solid #bfdbfe", borderRadius:20, fontSize:11, color:"#1d4ed8", fontWeight:600 }}>
                {filterLabels[k]}: {v}
                <button onClick={()=>{ const nf={...filters,[k]:""}; setFilters(nf); setPage(1); load(1,search,nf); }}
                  style={{ border:"none", background:"none", cursor:"pointer", color:"#3b82f6", fontSize:13, padding:0, display:"flex", alignItems:"center", marginLeft:2 }}>✕</button>
              </span>
            ))}
            <button onClick={()=>{ const nf={client:"",location:"",designation:"",owner:"",resignation:"",status:"",statusCode:"",offerFrom:"",offerTo:"",proposedFrom:"",proposedTo:"",actualFrom:"",actualTo:""}; setFilters(nf); setPage(1); load(1,search,nf); }}
              style={{ padding:"3px 10px", background:"#fee2e2", border:"1px solid #fecaca", borderRadius:20, fontSize:11, color:"#dc2626", fontWeight:600, cursor:"pointer" }}>
              Clear All ✕
            </button>
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
              <tr style={{ background:"#f8fafc", borderBottom:"1.5px solid #e2e8f0" }}>
                {[["#",40],["Client",120],["Candidate",140],["Position",120],["Location",80],["Phone",100],["Offer Mth",95],["Prop DOJ",95],["Owner",100],["Status",90],["CTC",85],["Code",65],["",85]].map(([l,w])=>(
                  <th key={l} style={{ padding:"10px 10px", textAlign:"left", fontWeight:700, color:"#475569", fontSize:10, textTransform:"uppercase", letterSpacing:.4, minWidth:w, whiteSpace:"nowrap" }}>{l}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {!(result.candidates||[]).length && (
                <tr><td colSpan={13} style={{ padding:60, textAlign:"center" }}>
                  <div style={{ fontSize:32, marginBottom:8 }}>🔍</div>
                  <div style={{ fontSize:14, fontWeight:700, color:"#0f172a", marginBottom:4 }}>No candidates found</div>
                  <div style={{ fontSize:12, color:"#94a3b8" }}>{activeFilters>0?"Try adjusting your filters":"No candidates yet"}</div>
                </td></tr>
              )}
              {(result.candidates||[]).map((c,i)=>(
                <tr key={c.id} style={{ borderBottom:"1px solid #f8fafc", background:i%2?"#fcfcfd":"white", transition:"background .1s" }}
                  onMouseEnter={e=>e.currentTarget.style.background="#f0f9ff"}
                  onMouseLeave={e=>e.currentTarget.style.background=i%2?"#fcfcfd":"white"}>
                  <td style={{ padding:"10px 10px", color:"#94a3b8", fontWeight:600, fontSize:11 }}>{c.id}</td>
                  <td style={{ padding:"10px 10px", fontWeight:700, color:"#1e293b", maxWidth:120, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{c.clientName||"—"}</td>
                  <td style={{ padding:"10px 10px" }}>
                    <div style={{ fontWeight:600, color:"#0f172a", maxWidth:130, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{c.candidateName}</div>
                    {c.phone&&<div style={{ fontSize:10, color:"#94a3b8" }}>{c.phone}</div>}
                  </td>
                  <td style={{ padding:"10px 10px", color:"#475569", maxWidth:120, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{c.designation||"—"}</td>
                  <td style={{ padding:"10px 10px", color:"#475569", whiteSpace:"nowrap" }}>{c.location||"—"}</td>
                  <td style={{ padding:"10px 10px", color:"#64748b", fontFamily:"monospace", fontSize:11 }}>{c.phone||"—"}</td>
                  <td style={{ padding:"10px 10px", color:"#64748b", whiteSpace:"nowrap" }}>{fmtD(c.offerMonth)}</td>
                  <td style={{ padding:"10px 10px", color:"#64748b", whiteSpace:"nowrap" }}>{fmtD(c.proposedDOJ)}</td>
                  <td style={{ padding:"10px 10px", color:"#475569", whiteSpace:"nowrap" }}>{c.ownerName||"—"}</td>
                  <td style={{ padding:"10px 10px" }}><Badge status={c.joiningStatus}/></td>
                  <td style={{ padding:"10px 10px", color:"#0f172a", fontWeight:600, whiteSpace:"nowrap" }}>₹{fmt(c.ctcPerMonth)}</td>
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
        <span style={{ fontSize:12, color:"#64748b" }}>
          Page {page} of {result.pages||1} · {result.total||0} total
          {activeFilters>0&&<span style={{ color:"#2563eb", fontWeight:600 }}> · {activeFilters} filter{activeFilters>1?"s":""} active</span>}
        </span>
        <div style={{ display:"flex", gap:3 }}>
          <button onClick={()=>{setPage(1);load(1,search,filters);}} disabled={page<=1} style={{ padding:"5px 10px", border:"1.5px solid #e2e8f0", borderRadius:6, background:"white", cursor:page<=1?"not-allowed":"pointer", fontSize:12, opacity:page<=1?.4:1 }}>«</button>
          <button onClick={()=>{const p=page-1;setPage(p);load(p,search,filters);}} disabled={page<=1} style={{ padding:"5px 10px", border:"1.5px solid #e2e8f0", borderRadius:6, background:"white", cursor:page<=1?"not-allowed":"pointer", fontSize:12, opacity:page<=1?.4:1 }}>‹ Prev</button>
          <span style={{ padding:"5px 12px", background:"#2563eb", color:"white", borderRadius:6, fontSize:12, fontWeight:700 }}>{page}</span>
          <button onClick={()=>{const p=page+1;setPage(p);load(p,search,filters);}} disabled={page>=result.pages} style={{ padding:"5px 10px", border:"1.5px solid #e2e8f0", borderRadius:6, background:"white", cursor:page>=result.pages?"not-allowed":"pointer", fontSize:12, opacity:page>=result.pages?.4:1 }}>Next ›</button>
          <button onClick={()=>{setPage(result.pages);load(result.pages,search,filters);}} disabled={page>=result.pages} style={{ padding:"5px 10px", border:"1.5px solid #e2e8f0", borderRadius:6, background:"white", cursor:page>=result.pages?"not-allowed":"pointer", fontSize:12, opacity:page>=result.pages?.4:1 }}>»</button>
        </div>
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
