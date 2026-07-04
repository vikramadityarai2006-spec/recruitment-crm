import { useState, useEffect, useCallback } from "react";
import { api } from "../api";
import { fmt, fmtD } from "../utils/constants";
import { Modal } from "../components/UI";
import CandidateForm from "../components/CandidateForm";
import BulkMessageModal from "../components/BulkMessageModal";

// ─── MATERIAL ICON ────────────────────────────────────────────────────────────
const M = ({ n, fill = 0, size = 18, style = {} }) => (
  <span style={{ fontFamily:"Material Symbols Outlined", fontVariationSettings:`'FILL' ${fill},'wght' 400,'GRAD' 0,'opsz' 24`, fontSize:size, display:"inline-block", verticalAlign:"middle", lineHeight:1, userSelect:"none", ...style }}>{n}</span>
);

// ─── STATUS BADGE ─────────────────────────────────────────────────────────────
function StatusBadge({ status, code }) {
  if (code) return <span style={{ background:"#003163", color:"white", fontSize:10, fontWeight:700, padding:"3px 8px", borderRadius:8, textTransform:"uppercase" }}>{code}</span>;
  const map = {
    Joined:      { bg:"#dcfce7", c:"#16a34a" },
    Offered:     { bg:"#fff8ee", c:"#E67E22" },
    Backout:     { bg:"#ffdad6", c:"#ba1a1a" },
    Hold:        { bg:"#f1f5f9", c:"#64748b" },
    "In Process":{ bg:"#e5eeff", c:"#003163" },
  };
  const s = map[status] || { bg:"#f1f5f9", c:"#64748b" };
  return (
    <span style={{ display:"inline-flex", alignItems:"center", gap:5, padding:"4px 9px", background:s.bg, color:s.c, fontSize:11, fontWeight:700, borderRadius:8 }}>
      <span style={{ width:6, height:6, borderRadius:"50%", background:s.c, flexShrink:0 }}/>
      {status || "Unknown"}
    </span>
  );
}

// ─── RESIGN BADGE ─────────────────────────────────────────────────────────────
function ResignBadge({ v }) {
  const map = { Pending:{ bg:"#fff8ee", c:"#E67E22" }, Accepted:{ bg:"#dcfce7", c:"#16a34a" }, NA:{ bg:"#f1f5f9", c:"#64748b" } };
  const s = map[v] || map.NA;
  return <span style={{ background:s.bg, color:s.c, fontSize:10, fontWeight:700, padding:"3px 8px", borderRadius:8, whiteSpace:"nowrap" }}>{v||"—"}</span>;
}

// ─── VIEW CANDIDATE ───────────────────────────────────────────────────────────
function ViewCandidate({ c }) {
  if (!c) return null;
  const R = (l, v, accent=false) => (
    <div style={{ display:"flex", alignItems:"flex-start", padding:"12px 0", borderBottom:"1px solid #f1f5f9" }}>
      <div style={{ width:160, fontSize:11, fontWeight:600, color:"#43474f", textTransform:"uppercase", letterSpacing:".05em", flexShrink:0 }}>{l}</div>
      <div style={{ fontSize:13, color:accent?"#003163":"#0b1c30", fontWeight:accent?700:500, flex:1 }}>{v||"—"}</div>
    </div>
  );
  return (
    <div>
      <div style={{ background:"linear-gradient(135deg,#003163,#001c3e)", borderRadius:14, padding:"20px 24px", marginBottom:20, display:"flex", alignItems:"center", gap:16 }}>
        <div style={{ width:56, height:56, borderRadius:16, background:"#E67E22", display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, fontWeight:900, color:"white", flexShrink:0 }}>
          {c.candidateName?.[0]?.toUpperCase()}
        </div>
        <div style={{ flex:1 }}>
          <h3 style={{ margin:0, fontSize:20, fontWeight:700, color:"white" }}>{c.candidateName}</h3>
          <p style={{ margin:"4px 0 0", color:"rgba(255,255,255,.7)", fontSize:13 }}>{c.designation} · {c.clientName} · {c.location}</p>
          <div style={{ display:"flex", gap:8, marginTop:8 }}>
            <StatusBadge status={c.joiningStatus}/>
            <StatusBadge code={c.statusCode}/>
          </div>
        </div>
        {c.ctcPerMonth && <div style={{ textAlign:"right" }}>
          <div style={{ fontSize:22, fontWeight:700, color:"#22c55e" }}>₹{fmt(c.ctcPerMonth)}</div>
          <div style={{ fontSize:10, color:"rgba(255,255,255,.6)", textTransform:"uppercase", fontWeight:700 }}>Per Month</div>
        </div>}
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0 32px" }}>
        {R("Client",c.clientName,true)}{R("Owner",c.ownerName)}
        {R("Designation",c.designation)}{R("Location",c.location)}
        {R("Phone",c.phone)}{R("Email",c.email)}{R("Joining Status",c.joiningStatus)}
        {R("Offer Month",fmtD(c.offerMonth))}{R("Status Code",c.statusCode)}
        {R("Proposed DOJ",fmtD(c.proposedDOJ))}{R("Actual DOJ",fmtD(c.actualDOJ))}
        {R("Resignation",c.resignationAcceptance)}{R("CTC/Month",c.ctcPerMonth?`₹${fmt(c.ctcPerMonth)}`:"—")}
      </div>
      {c.notes && <div style={{ marginTop:12, padding:"14px 16px", background:"#eff4ff", borderRadius:12, border:"1px solid #dce9ff" }}>
        <div style={{ fontSize:10, fontWeight:700, color:"#003163", textTransform:"uppercase", letterSpacing:".08em", marginBottom:6 }}>Internal Notes</div>
        <div style={{ fontSize:13, color:"#0b1c30", lineHeight:1.6 }}>{c.notes}</div>
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
    <div>
      <label style={{ display:"block", fontSize:11, fontWeight:700, color:"#43474f", textTransform:"uppercase", letterSpacing:".05em", marginBottom:6 }}>
        <M n={icon} size={14} style={{ marginRight:4 }}/> {label}
      </label>
      <div onClick={()=>setOpen(o=>!o)} style={{ padding:"10px 14px", borderRadius:10, border:`1px solid ${sel.length?"#003163":"#c3c6d1"}`, background:sel.length?"#eff4ff":"white", cursor:"pointer", fontSize:13, display:"flex", alignItems:"center", justifyContent:"space-between", userSelect:"none", transition:"all .2s" }}>
        <span style={{ color:sel.length?"#003163":"#737780", fontWeight:sel.length?700:500, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", flex:1 }}>
          {sel.length===0?"Select options":sel.length===1?sel[0]:`${sel.length} selected`}
        </span>
        <M n={open?"expand_less":"expand_more"} size={18} style={{ color:"#737780", marginLeft:8 }}/>
      </div>
      {open && <>
        <div onClick={()=>setOpen(false)} style={{ position:"fixed", inset:0, zIndex:98 }}/>
        <div style={{ position:"absolute", top:"100%", left:0, right:0, background:"white", border:"1px solid #c3c6d1", borderRadius:12, zIndex:99, boxShadow:"0 12px 40px rgba(0,49,99,.15)", maxHeight:220, overflow:"auto", marginTop:6 }}>
          {sel.length>0 && <div onClick={()=>{onChange([]);setOpen(false);}} style={{ padding:"10px 14px", borderBottom:"1px solid #f1f5f9", fontSize:12, color:"#ba1a1a", fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", gap:6, background:"#ffdad633" }}>
            <M n="close" size={16}/> Clear selection
          </div>}
          {options.map(o=>(
            <div key={o} onClick={()=>toggle(o)} style={{ padding:"10px 14px", display:"flex", alignItems:"center", gap:10, cursor:"pointer", background:sel.includes(o)?"#eff4ff":"white", borderBottom:"1px solid #f1f5f9" }}>
              <div style={{ width:18, height:18, borderRadius:4, border:`1px solid ${sel.includes(o)?"#003163":"#c3c6d1"}`, background:sel.includes(o)?"#003163":"white", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                {sel.includes(o) && <M n="check" size={14} style={{ color:"white" }}/>}
              </div>
              <span style={{ fontSize:13, color:sel.includes(o)?"#003163":"#0b1c30", fontWeight:sel.includes(o)?700:500 }}>{o}</span>
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
  const [visible, setVisible] = useState(false);
  useEffect(()=>{ setTimeout(()=>setVisible(true),10); },[]);
  const set = (k,v) => setLocal(f=>({...f,[k]:v}));
  const close = () => { setVisible(false); setTimeout(onClose,300); };
  const activeCount = [...(local.clients||[]),...(local.owners||[]),...(local.resignations||[]),...(local.statuses||[]),...(local.codes||[]),local.location,local.designation,local.offerFrom,local.offerTo,local.proposedFrom,local.proposedTo,local.actualFrom,local.actualTo].filter(Boolean).length;
  const clearAll = () => setLocal({clients:[],owners:[],resignations:[],statuses:[],codes:[],location:"",designation:"",offerFrom:"",offerTo:"",proposedFrom:"",proposedTo:"",actualFrom:"",actualTo:""});

  const DateRange = ({label,icon,fk,tk}) => (
    <div>
      <label style={{ display:"block", fontSize:11, fontWeight:700, color:"#43474f", textTransform:"uppercase", letterSpacing:".05em", marginBottom:6 }}><M n={icon} size={14} style={{marginRight:4}}/>{label}</label>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
        <input type="date" value={local[fk]||""} onChange={e=>set(fk,e.target.value)} style={{ width:"100%", padding:"9px 12px", borderRadius:10, border:`1px solid ${local[fk]?"#003163":"#c3c6d1"}`, fontSize:12, outline:"none", background:local[fk]?"#eff4ff":"white" }}/>
        <input type="date" value={local[tk]||""} onChange={e=>set(tk,e.target.value)} style={{ width:"100%", padding:"9px 12px", borderRadius:10, border:`1px solid ${local[tk]?"#003163":"#c3c6d1"}`, fontSize:12, outline:"none", background:local[tk]?"#eff4ff":"white" }}/>
      </div>
    </div>
  );

  const Section = ({title,icon,children}) => (
    <div style={{ marginBottom:28 }}>
      <div style={{ fontSize:12, fontWeight:700, color:"#003163", textTransform:"uppercase", letterSpacing:".08em", borderBottom:"1px solid #c3c6d1", paddingBottom:8, marginBottom:16, display:"flex", alignItems:"center", gap:6 }}>
        <M n={icon} size={16}/>{title}
      </div>
      <div style={{ display:"flex", flexDirection:"column", gap:16, position:"relative" }}>{children}</div>
    </div>
  );

  return (
    <div style={{ position:"fixed", inset:0, zIndex:600 }}>
      <div onClick={close} style={{ position:"absolute", inset:0, background:"rgba(0,49,99,.15)", backdropFilter:"blur(4px)" }}/>
      <div style={{ position:"absolute", top:0, right:0, bottom:0, width:440, background:"white", boxShadow:"-10px 0 60px rgba(0,49,99,.2)", display:"flex", flexDirection:"column", transform:visible?"translateX(0)":"translateX(100%)", transition:"transform .3s cubic-bezier(.4,0,.2,1)" }}>

        {/* Header */}
        <div style={{ background:"linear-gradient(135deg,#003163,#001c3e)", padding:"20px 24px", display:"flex", alignItems:"center", justifyContent:"space-between", color:"white", flexShrink:0 }}>
          <div>
            <div style={{ fontSize:20, fontWeight:700, display:"flex", alignItems:"center", gap:10 }}>
              <M n="filter_list" size={24}/> Advanced Filters
            </div>
            <div style={{ fontSize:13, marginTop:4, opacity:.7 }}>
              {activeCount>0?`${activeCount} filter${activeCount>1?"s":""} active`:"Refine your candidate search"}
            </div>
          </div>
          <button onClick={close} style={{ background:"rgba(255,255,255,.1)", border:"none", borderRadius:10, padding:8, cursor:"pointer", color:"white", display:"flex" }}>
            <M n="close" size={20}/>
          </button>
        </div>

        {/* Body */}
        <div style={{ flex:1, overflow:"auto", padding:"24px 24px 20px" }}>
          <Section title="Organization & Team" icon="corporate_fare">
            <MultiSelect label="Client" icon="corporate_fare" options={masters.clients||[]} selected={local.clients||[]} onChange={v=>set("clients",v)}/>
            <MultiSelect label="Owner / Recruiter" icon="person" options={masters.owners||[]} selected={local.owners||[]} onChange={v=>set("owners",v)}/>
          </Section>
          <Section title="Candidate Status" icon="verified">
            <MultiSelect label="Joining Status" icon="verified" options={masters.joiningStatus||[]} selected={local.statuses||[]} onChange={v=>set("statuses",v)}/>
            <MultiSelect label="Resignation Status" icon="person_off" options={masters.resignationStatus||["Pending","Accepted","NA"]} selected={local.resignations||[]} onChange={v=>set("resignations",v)}/>
            <MultiSelect label="Status Code" icon="category" options={(masters.statusCodes||[]).map(s=>s.code||s)} selected={local.codes||[]} onChange={v=>set("codes",v)}/>
          </Section>
          <Section title="Location & Position" icon="location_on">
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
              <div>
                <label style={{ display:"block", fontSize:11, fontWeight:700, color:"#43474f", textTransform:"uppercase", letterSpacing:".05em", marginBottom:6 }}>Location</label>
                <input value={local.location||""} onChange={e=>set("location",e.target.value)} placeholder="e.g. Mumbai" style={{ width:"100%", padding:"10px 14px", borderRadius:10, border:`1px solid ${local.location?"#003163":"#c3c6d1"}`, fontSize:13, background:local.location?"#eff4ff":"white", outline:"none" }}/>
              </div>
              <div>
                <label style={{ display:"block", fontSize:11, fontWeight:700, color:"#43474f", textTransform:"uppercase", letterSpacing:".05em", marginBottom:6 }}>Position</label>
                <input value={local.designation||""} onChange={e=>set("designation",e.target.value)} placeholder="e.g. Manager" style={{ width:"100%", padding:"10px 14px", borderRadius:10, border:`1px solid ${local.designation?"#003163":"#c3c6d1"}`, fontSize:13, background:local.designation?"#eff4ff":"white", outline:"none" }}/>
              </div>
            </div>
          </Section>
          <Section title="Date Intervals" icon="event">
            <DateRange label="Offer Month" icon="event" fk="offerFrom" tk="offerTo"/>
            <DateRange label="Proposed DOJ" icon="calendar_month" fk="proposedFrom" tk="proposedTo"/>
            <DateRange label="Actual DOJ" icon="task_alt" fk="actualFrom" tk="actualTo"/>
          </Section>
        </div>

        {/* Footer */}
        <div style={{ padding:"20px 24px", background:"#f8f9fa", borderTop:"1px solid #c3c6d1", display:"flex", gap:12, flexShrink:0 }}>
          <button onClick={clearAll} style={{ flex:1, padding:14, background:"white", border:"1px solid #c3c6d1", borderRadius:12, fontSize:14, fontWeight:700, color:"#43474f", cursor:"pointer" }}>Clear All</button>
          <button onClick={()=>{onApply(local);close();}} style={{ flex:2, padding:14, background:"#003163", color:"white", border:"none", borderRadius:12, fontSize:14, fontWeight:700, cursor:"pointer", boxShadow:"0 4px 12px rgba(0,49,99,.3)" }}>
            Apply{activeCount>0?` (${activeCount})`:""}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
const PAGE_SIZE_OPTIONS = [25, 50, 100];
const EMPTY = {clients:[],owners:[],resignations:[],statuses:[],codes:[],location:"",designation:"",offerFrom:"",offerTo:"",proposedFrom:"",proposedTo:"",actualFrom:"",actualTo:""};
const PRESETS_KEY = "crm_filter_presets";

export default function Candidates({ masters, user, initialFilter, onConsumeInitialFilter }) {
  const [result, setResult]         = useState({candidates:[],total:0,pages:1});
  const [search, setSearch]         = useState("");
  const [debSearch, setDebSearch]   = useState("");
  const [filters, setFilters]       = useState(EMPTY);
  const [page, setPage]             = useState(1);
  const [PER, setPER]               = useState(25); // records per page — default 25
  const [sortDir, setSortDir]       = useState("desc"); // newest to oldest by default
  const [loading, setLoading]       = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [modal, setModal]           = useState(null);
  const [saving, setSaving]         = useState(false);
  const [selected, setSelected]     = useState(() => new Set());
  const [showBulk, setShowBulk]     = useState(false);
  const [presets, setPresets]       = useState(() => {
    try { return JSON.parse(localStorage.getItem(PRESETS_KEY) || "[]"); } catch { return []; }
  });

  // Apply a filter handed to us from another page (e.g. clicking a Dashboard stat)
  useEffect(() => {
    if (initialFilter) {
      setFilters(f => ({ ...EMPTY, ...initialFilter }));
      setPage(1);
      onConsumeInitialFilter && onConsumeInitialFilter();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialFilter]);

  const load = useCallback(async (p=1,s="",f={},per=25,dir="desc") => {
    setLoading(true);
    const params = {page:p,limit:per,sortDir:dir};
    if (s) params.search=s;
    if (f.clients?.length) params.client=f.clients.join(",");
    if (f.owners?.length) params.owner=f.owners.join(",");
    if (f.statuses?.length) params.status=f.statuses.join(",");
    if (f.codes?.length) params.statusCode=f.codes.join(",");
    if (f.resignations?.length) params.resignation=f.resignations.join(",");
    if (f.location) params.location=f.location;
    if (f.designation) params.designation=f.designation;
    if (f.offerFrom) params.offerFrom=f.offerFrom;
    if (f.offerTo) params.offerTo=f.offerTo;
    if (f.proposedFrom) params.proposedFrom=f.proposedFrom;
    if (f.proposedTo) params.proposedTo=f.proposedTo;
    if (f.actualFrom) params.actualFrom=f.actualFrom;
    if (f.actualTo) params.actualTo=f.actualTo;
    try { const res = await api.getCandidates(params); setResult(res||{candidates:[],total:0,pages:1}); }
    catch(e) { console.error(e); }
    setLoading(false);
  },[]);

  useEffect(()=>{ const t=setTimeout(()=>{setDebSearch(search);setPage(1);},400); return()=>clearTimeout(t); },[search]);
  useEffect(()=>{ load(page,debSearch,filters,PER,sortDir); setSelected(new Set()); },[page,filters,debSearch,PER,sortDir,load]);

  const handleDelete = async id => {
    if (!window.confirm("Delete this candidate? This cannot be undone.")) return;
    try { const r=await api.deleteCandidate(id); if(r.error){alert(r.error);return;} load(page,debSearch,filters,PER,sortDir); }
    catch(e){alert(e.message);}
  };

  const handleSave = async form => {
    setSaving(true);
    try {
      const r = modal.type==="add" ? await api.createCandidate(form) : await api.updateCandidate(modal.data.id,form);
      if(r.error){alert(r.error);setSaving(false);return;}
      setModal(null); load(page,debSearch,filters,PER,sortDir);
    } catch(e){alert(e.message);}
    setSaving(false);
  };

  const exportCSV = () => {
    const cols=["SR.NO","Client","Candidate","Position","Location","Phone","Offer Mth","Prop DOJ","Actual DOJ","Resign","Owner","Status","CTC/Mo","Code"];
    const rows=(result.candidates||[]).map((c,i)=>[i+1+(page-1)*PER,c.clientName,c.candidateName,c.designation,c.location,c.phone,fmtD(c.offerMonth),fmtD(c.proposedDOJ),fmtD(c.actualDOJ),c.resignationAcceptance,c.ownerName,c.joiningStatus,c.ctcPerMonth?fmt(c.ctcPerMonth):"",c.statusCode]);
    const csv=[cols,...rows].map(r=>r.map(v=>`"${v||""}"`).join(",")).join("\n");
    const a=document.createElement("a");a.href="data:text/csv;charset=utf-8,"+encodeURIComponent(csv);a.download="candidates.csv";a.click();
  };

  const activeFilters = [...(filters.clients||[]),...(filters.owners||[]),...(filters.resignations||[]),...(filters.statuses||[]),...(filters.codes||[]),filters.location,filters.designation,filters.offerFrom,filters.offerTo,filters.proposedFrom,filters.proposedTo,filters.actualFrom,filters.actualTo].filter(Boolean).length;
  const clearAll = () => { setFilters(EMPTY); setPage(1); };
  const canEdit = user.role!=="viewer";
  const canDel  = user.role==="admin";

  // Chip list for active filters
  const chips = [
    ...(filters.clients||[]).map(v=>({k:"clients",v,l:v,i:"corporate_fare"})),
    ...(filters.owners||[]).map(v=>({k:"owners",v,l:v,i:"person"})),
    ...(filters.statuses||[]).map(v=>({k:"statuses",v,l:v,i:"verified"})),
    ...(filters.resignations||[]).map(v=>({k:"resignations",v,l:v,i:"person_off"})),
    ...(filters.codes||[]).map(v=>({k:"codes",v,l:v,i:"category"})),
    filters.location&&{k:"location",v:filters.location,l:filters.location,i:"location_on"},
    filters.designation&&{k:"designation",v:filters.designation,l:filters.designation,i:"work"},
    filters.offerFrom&&{k:"offerFrom",v:filters.offerFrom,l:"Offer ≥ "+filters.offerFrom,i:"event"},
    filters.actualFrom&&{k:"actualFrom",v:filters.actualFrom,l:"Joined ≥ "+filters.actualFrom,i:"task_alt"},
  ].filter(Boolean);

  const removeChip = chip => {
    const nf={...filters};
    if(Array.isArray(nf[chip.k])) nf[chip.k]=nf[chip.k].filter(x=>x!==chip.v);
    else nf[chip.k]="";
    setFilters(nf); setPage(1);
  };

  // ── Selection (for bulk messaging) ──
  const pageIds = (result.candidates||[]).map(c=>c.id);
  const allOnPageSelected = pageIds.length>0 && pageIds.every(id=>selected.has(id));
  const toggleOne = id => setSelected(s => { const n=new Set(s); n.has(id)?n.delete(id):n.add(id); return n; });
  const toggleAllOnPage = () => setSelected(s => {
    const n = new Set(s);
    if (allOnPageSelected) pageIds.forEach(id=>n.delete(id));
    else pageIds.forEach(id=>n.add(id));
    return n;
  });
  const selectedCandidates = (result.candidates||[]).filter(c=>selected.has(c.id));

  // ── Advanced filter states (save / load / delete named filter presets) ──
  const savePreset = () => {
    const name = window.prompt("Name this filter set (e.g. 'Pending resignations - Infosys'):");
    if (!name) return;
    const next = [...presets.filter(p=>p.name!==name), { name, filters }];
    setPresets(next);
    localStorage.setItem(PRESETS_KEY, JSON.stringify(next));
  };
  const loadPreset = name => {
    const p = presets.find(x=>x.name===name);
    if (p) { setFilters({...EMPTY,...p.filters}); setPage(1); }
  };
  const deletePreset = name => {
    const next = presets.filter(p=>p.name!==name);
    setPresets(next);
    localStorage.setItem(PRESETS_KEY, JSON.stringify(next));
  };

  const ActionBtn = ({onClick,title,icon,color,bg}) => (
    <button onClick={onClick} title={title} style={{ padding:6, background:"white", border:"1px solid #c3c6d1", borderRadius:8, cursor:"pointer", color, display:"flex", transition:"all .15s" }}
      onMouseEnter={e=>{ e.currentTarget.style.background=bg; e.currentTarget.style.color="white"; e.currentTarget.style.borderColor=bg; }}
      onMouseLeave={e=>{ e.currentTarget.style.background="white"; e.currentTarget.style.color=color; e.currentTarget.style.borderColor="#c3c6d1"; }}>
      <M n={icon} size={18}/>
    </button>
  );

  return (
    <div style={{ fontFamily:"'Inter',system-ui,sans-serif" }}>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"/>

      {showFilters && <FilterPanel filters={filters} masters={masters} onApply={f=>{setFilters(f);setPage(1);}} onClose={()=>setShowFilters(false)}/>}

      {/* ── HEADER ── */}
      <div style={{ display:"flex", flexWrap:"wrap", alignItems:"flex-start", justifyContent:"space-between", gap:16, marginBottom:24 }}>
        <div>
          <h1 style={{ fontSize:24, fontWeight:700, color:"#003163", margin:0 }}>Candidates</h1>
          <p style={{ color:"#43474f", fontSize:14, marginTop:4 }}>
            Manage and track candidate lifecycle across <strong style={{ color:"#003163" }}>{result.total.toLocaleString()}</strong> records.
          </p>
        </div>
        <div style={{ display:"flex", flexWrap:"wrap", gap:10 }}>
          {selected.size>0 && (
            <button onClick={()=>setShowBulk(true)} style={{ display:"flex", alignItems:"center", gap:8, padding:"10px 16px", background:"#16a34a", color:"white", border:"none", borderRadius:12, fontSize:13, fontWeight:700, cursor:"pointer", boxShadow:"0 4px 12px rgba(22,163,74,.3)" }}>
              <M n="campaign" size={18}/> Message {selected.size} Selected
            </button>
          )}
          <button onClick={()=>load(page,debSearch,filters,PER,sortDir)} style={{ display:"flex", alignItems:"center", gap:8, padding:"10px 16px", background:"white", border:"1px solid #c3c6d1", borderRadius:12, fontSize:13, fontWeight:600, color:"#003163", cursor:"pointer", transition:"all .2s" }}
            onMouseEnter={e=>e.currentTarget.style.background="#eff4ff"}
            onMouseLeave={e=>e.currentTarget.style.background="white"}>
            <M n="refresh" size={18}/> Refresh
          </button>
          <button onClick={exportCSV} style={{ display:"flex", alignItems:"center", gap:8, padding:"10px 16px", background:"white", border:"1px solid #c3c6d1", borderRadius:12, fontSize:13, fontWeight:600, color:"#003163", cursor:"pointer", transition:"all .2s" }}
            onMouseEnter={e=>e.currentTarget.style.background="#eff4ff"}
            onMouseLeave={e=>e.currentTarget.style.background="white"}>
            <M n="download" size={18}/> Export
          </button>
          {canEdit && <button onClick={()=>setModal({type:"add"})} style={{ display:"flex", alignItems:"center", gap:8, padding:"10px 20px", background:"linear-gradient(135deg,#003163,#001c3e)", color:"white", border:"none", borderRadius:12, fontSize:14, fontWeight:700, cursor:"pointer", boxShadow:"0 4px 12px rgba(0,49,99,.3)", transition:"all .2s" }}
            onMouseEnter={e=>e.currentTarget.style.transform="scale(1.02)"}
            onMouseLeave={e=>e.currentTarget.style.transform="scale(1)"}>
            <M n="add" size={20} style={{color:"white"}}/> Add Candidate
          </button>}
        </div>
      </div>

      {/* ── SEARCH & FILTER BAR ── */}
      <div style={{ background:"white", border:"1px solid #c3c6d1", borderRadius:12, padding:16, marginBottom:20, boxShadow:"0 2px 4px rgba(0,49,99,.04)" }}>
        <div style={{ display:"flex", gap:12 }}>
          <div style={{ flex:1, display:"flex", alignItems:"center", gap:12, padding:"10px 16px", background:"#f8f9fa", border:"1px solid #c3c6d1", borderRadius:12, transition:"all .2s" }}
            onFocus={e=>e.currentTarget.style.borderColor="#003163"}
            onBlur={e=>e.currentTarget.style.borderColor="#c3c6d1"}>
            <M n="search" size={20} style={{color:"#737780"}}/>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search by name, client, phone, designation..."
              style={{ border:"none", background:"none", outline:"none", fontSize:14, width:"100%", color:"#0b1c30", fontWeight:500 }}/>
            {search && <M n="close" onClick={()=>{setSearch("");setDebSearch("");setPage(1);}} size={18} style={{color:"#737780",cursor:"pointer"}}/>}
          </div>
          <button onClick={()=>setShowFilters(true)} style={{ display:"flex", alignItems:"center", gap:8, padding:"10px 20px", background:activeFilters>0?"#003163":"white", border:`1px solid ${activeFilters>0?"#003163":"#c3c6d1"}`, borderRadius:12, cursor:"pointer", fontSize:14, fontWeight:700, color:activeFilters>0?"white":"#003163", transition:"all .2s" }}>
            <M n="filter_list" size={18}/> Filters
            {activeFilters>0 && <span style={{ background:"#E67E22", color:"white", fontSize:10, fontWeight:800, padding:"0 8px", borderRadius:99 }}>{activeFilters}</span>}
          </button>
          {presets.length>0 && (
            <select onChange={e=>{ if(e.target.value){loadPreset(e.target.value);e.target.value="";} }} defaultValue=""
              title="Load a saved filter set" style={{ padding:"10px 12px", borderRadius:12, border:"1px solid #c3c6d1", fontSize:13, fontWeight:600, color:"#003163", background:"white", cursor:"pointer" }}>
              <option value="">Saved Filters ({presets.length})</option>
              {presets.map(p=><option key={p.name} value={p.name}>{p.name}</option>)}
            </select>
          )}
          {activeFilters>0 && (
            <button onClick={savePreset} title="Save current filters as a preset" style={{ display:"flex", alignItems:"center", gap:6, padding:"10px 14px", background:"white", border:"1px solid #c3c6d1", borderRadius:12, cursor:"pointer", fontSize:13, fontWeight:600, color:"#003163" }}>
              <M n="bookmark_add" size={16}/> Save
            </button>
          )}
          <button onClick={()=>setSortDir(d=>d==="desc"?"asc":"desc")} title="Toggle sort order" style={{ display:"flex", alignItems:"center", gap:6, padding:"10px 14px", background:"white", border:"1px solid #c3c6d1", borderRadius:12, cursor:"pointer", fontSize:13, fontWeight:600, color:"#003163" }}>
            <M n={sortDir==="desc"?"arrow_downward":"arrow_upward"} size={16}/> {sortDir==="desc"?"Newest first":"Oldest first"}
          </button>
          <select value={PER} onChange={e=>{setPER(parseInt(e.target.value));setPage(1);}} title="Rows per page"
            style={{ padding:"10px 12px", borderRadius:12, border:"1px solid #c3c6d1", fontSize:13, fontWeight:600, color:"#003163", background:"white", cursor:"pointer" }}>
            {PAGE_SIZE_OPTIONS.map(n=><option key={n} value={n}>{n} / page</option>)}
          </select>
        </div>

        {presets.length>0 && (
          <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginTop:12 }}>
            {presets.map(p=>(
              <span key={p.name} style={{ display:"inline-flex", alignItems:"center", gap:6, padding:"3px 10px", background:"#f1f5f9", borderRadius:99, fontSize:11, color:"#43474f" }}>
                {p.name}
                <button onClick={()=>deletePreset(p.name)} style={{ border:"none", background:"none", cursor:"pointer", color:"#ba1a1a", display:"flex", padding:0 }}><M n="close" size={11}/></button>
              </span>
            ))}
          </div>
        )}

        {/* Filter chips */}
        {chips.length>0 && (
          <div style={{ display:"flex", flexWrap:"wrap", alignItems:"center", gap:8, marginTop:12, paddingTop:12, borderTop:"1px solid #f1f5f9" }}>
            {chips.map((chip,i) => (
              <span key={i} style={{ display:"inline-flex", alignItems:"center", gap:6, padding:"4px 12px", background:"#eff4ff", border:"1px solid #dce9ff", color:"#003163", fontSize:11, fontWeight:700, borderRadius:99 }}>
                <M n={chip.i} size={13}/> {chip.l}
                <button onClick={()=>removeChip(chip)} style={{ border:"none", background:"#dce9ff", cursor:"pointer", color:"#003163", borderRadius:"50%", width:14, height:14, display:"flex", alignItems:"center", justifyContent:"center", padding:0 }}>
                  <M n="close" size={10}/>
                </button>
              </span>
            ))}
            <button onClick={clearAll} style={{ display:"inline-flex", alignItems:"center", gap:4, padding:"4px 12px", background:"#ffdad6", border:"1px solid #ffdad6", color:"#ba1a1a", fontSize:11, fontWeight:800, borderRadius:99, cursor:"pointer" }}>
              Clear all filters
            </button>
          </div>
        )}
      </div>

      {/* ── TABLE ── */}
      <div style={{ background:"white", border:"1px solid #c3c6d1", borderRadius:12, boxShadow:"0 2px 4px rgba(0,49,99,.06)", overflow:"hidden", marginBottom:16 }}>
        {loading ? (
          <div style={{ padding:100, textAlign:"center" }}>
            <div style={{ width:40, height:40, border:"3px solid #e5eeff", borderTop:"3px solid #003163", borderRadius:"50%", animation:"spin .8s linear infinite", margin:"0 auto 16px" }}/>
            <div style={{ color:"#43474f", fontSize:14, fontWeight:600 }}>Syncing candidates...</div>
          </div>
        ) : (
          <>
          <div style={{ overflowX:"auto" }}>
            <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
              <thead>
                <tr style={{ background:"#f8f9fa", borderBottom:"2px solid #c3c6d1" }}>
                  <th style={{ padding:"14px 8px", width:36 }}>
                    <input type="checkbox" checked={allOnPageSelected} onChange={toggleAllOnPage} style={{ width:16, height:16, cursor:"pointer" }}/>
                  </th>
                  {[["SR",45],["CLIENT",130],["CANDIDATE",160],["POSITION",130],["LOCATION",90],["OFFER",100],["DOJ",110],["RESIGN",90],["OWNER",110],["STATUS",130],["CTC",90],["CODE",80],["ACTION",110]].map(([l,w])=>(
                    <th key={l} style={{ padding:"14px 16px", textAlign:"left", fontSize:10, fontWeight:700, color:"#003163", letterSpacing:".08em", textTransform:"uppercase", whiteSpace:"nowrap", minWidth:w }}>
                      {l}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody style={{ divideY:"1px solid #f1f5f9" }}>
                {!(result.candidates||[]).length && (
                  <tr><td colSpan={14} style={{ padding:100, textAlign:"center" }}>
                    <div style={{ width:80, height:80, borderRadius:"50%", background:"#f8f9fa", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 20px" }}>
                      <M n="person_search" size={40} style={{color:"#c3c6d1"}}/>
                    </div>
                    <div style={{ fontSize:18, fontWeight:700, color:"#003163", marginBottom:8 }}>No matches found</div>
                    <div style={{ fontSize:14, color:"#43474f", marginBottom:20 }}>Adjust your search or filters to find what you're looking for.</div>
                    {activeFilters>0 && <button onClick={clearAll} style={{ padding:"10px 24px", background:"#003163", color:"white", border:"none", borderRadius:12, fontSize:14, fontWeight:700, cursor:"pointer" }}>Reset Filters</button>}
                  </td></tr>
                )}
                {(result.candidates||[]).map((c,i) => (
                  <tr key={c.id} style={{ borderBottom:"1px solid #f1f5f9", background:selected.has(c.id)?"#eff4ff":"white", transition:"background .1s" }}
                    onMouseEnter={e=>{ if(!selected.has(c.id)) e.currentTarget.style.background="#f8f9fa"; }}
                    onMouseLeave={e=>{ e.currentTarget.style.background=selected.has(c.id)?"#eff4ff":"white"; }}>
                    <td style={{ padding:"14px 8px" }} onClick={e=>e.stopPropagation()}>
                      <input type="checkbox" checked={selected.has(c.id)} onChange={()=>toggleOne(c.id)} style={{ width:16, height:16, cursor:"pointer" }}/>
                    </td>
                    <td style={{ padding:"14px 16px" }}>
                      <span style={{ background:"#f1f5f9", color:"#737780", fontSize:11, fontWeight:800, padding:"3px 6px", borderRadius:6 }}>{(page-1)*PER+i+1}</span>
                    </td>
                    <td style={{ padding:"14px 16px", fontWeight:700, color:"#0b1c30", fontSize:13 }}>{c.clientName||"—"}</td>
                    <td style={{ padding:"14px 16px" }}>
                      <div style={{ fontWeight:700, color:"#003163" }}>{c.candidateName}</div>
                      <div style={{ color:"#737780", fontSize:11, marginTop:2 }}>{c.phone||"No phone"}</div>
                    </td>
                    <td style={{ padding:"14px 16px", color:"#43474f", fontWeight:500 }}>{c.designation||"—"}</td>
                    <td style={{ padding:"14px 16px" }}>
                      {c.location ? <div style={{ display:"flex", alignItems:"center", gap:4, color:"#43474f" }}><M n="location_on" size={14} style={{color:"#E67E22"}}/>{c.location}</div> : "—"}
                    </td>
                    <td style={{ padding:"14px 16px", fontWeight:600, color:"#0b1c30" }}>{fmtD(c.offerMonth)}</td>
                    <td style={{ padding:"14px 16px" }}>
                      <div style={{ color:c.actualDOJ?"#16a34a":"#003163", fontWeight:600 }}>{fmtD(c.actualDOJ||c.proposedDOJ)}</div>
                      {!c.actualDOJ && <div style={{ color:"#E67E22", fontSize:10, fontWeight:700, textTransform:"uppercase" }}>Proposed</div>}
                    </td>
                    <td style={{ padding:"14px 16px" }}><ResignBadge v={c.resignationAcceptance}/></td>
                    <td style={{ padding:"14px 16px", fontWeight:600, color:"#0b1c30" }}>{c.ownerName||"—"}</td>
                    <td style={{ padding:"14px 16px" }}><StatusBadge status={c.joiningStatus}/></td>
                    <td style={{ padding:"14px 16px" }}>
                      {c.ctcPerMonth ? <span style={{ fontWeight:700, color:"#0b1c30" }}>₹{fmt(c.ctcPerMonth)}</span> : "—"}
                    </td>
                    <td style={{ padding:"14px 16px" }}><StatusBadge code={c.statusCode}/></td>
                    <td style={{ padding:"14px 16px" }}>
                      <div style={{ display:"flex", gap:6 }}>
                        <ActionBtn onClick={()=>setModal({type:"view",data:c})} title="View Details" icon="visibility" color="#003163" bg="#003163"/>
                        {canEdit && <ActionBtn onClick={()=>setModal({type:"edit",data:c})} title="Edit" icon="edit" color="#E67E22" bg="#E67E22"/>}
                        {canDel  && <ActionBtn onClick={()=>handleDelete(c.id)} title="Delete" icon="delete" color="#ba1a1a" bg="#ba1a1a"/>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div style={{ background:"#f8f9fa", borderTop:"1px solid #c3c6d1", padding:"16px 24px", display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:8 }}>
            <div style={{ color:"#43474f", fontSize:13, fontWeight:500 }}>
              Showing <strong style={{color:"#003163"}}>{Math.min((page-1)*PER+1,result.total)}</strong> to <strong style={{color:"#003163"}}>{Math.min(page*PER,result.total)}</strong> of <strong style={{color:"#003163"}}>{result.total.toLocaleString()}</strong> candidates
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:6 }}>
              <button onClick={()=>setPage(1)} disabled={page<=1} style={{ padding:"8px 12px", border:"1px solid #c3c6d1", borderRadius:10, background:"white", cursor:page<=1?"not-allowed":"pointer", fontSize:13, color:"#003163", opacity:page<=1?.4:1, fontWeight:700 }}>«</button>
              <button onClick={()=>setPage(p=>p-1)} disabled={page<=1} style={{ padding:"8px 16px", border:"1px solid #c3c6d1", borderRadius:10, background:"white", cursor:page<=1?"not-allowed":"pointer", fontSize:13, color:"#003163", opacity:page<=1?.4:1, fontWeight:700 }}>Prev</button>
              {Array.from({length:Math.min(5,result.pages||1)},(_,i)=>{
                const p=Math.max(1,Math.min(page-2,(result.pages||1)-4))+i;
                if(p<1||p>(result.pages||1)) return null;
                const active=p===page;
                return <button key={p} onClick={()=>setPage(p)} style={{ padding:"8px 14px", minWidth:40, border:`1px solid ${active?"#003163":"#c3c6d1"}`, borderRadius:10, background:active?"#003163":"white", color:active?"white":"#003163", cursor:"pointer", fontSize:13, fontWeight:700, transition:"all .15s" }}>{p}</button>;
              })}
              <button onClick={()=>setPage(p=>p+1)} disabled={page>=(result.pages||1)} style={{ padding:"8px 16px", border:"1px solid #c3c6d1", borderRadius:10, background:"white", cursor:page>=(result.pages||1)?"not-allowed":"pointer", fontSize:13, color:"#003163", opacity:page>=(result.pages||1)?.4:1, fontWeight:700 }}>Next</button>
              <button onClick={()=>setPage(result.pages||1)} disabled={page>=(result.pages||1)} style={{ padding:"8px 12px", border:"1px solid #c3c6d1", borderRadius:10, background:"white", cursor:page>=(result.pages||1)?"not-allowed":"pointer", fontSize:13, color:"#003163", opacity:page>=(result.pages||1)?.4:1, fontWeight:700 }}>»</button>
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

      {showBulk && selectedCandidates.length>0 && (
        <BulkMessageModal candidates={selectedCandidates} onClose={()=>setShowBulk(false)}/>
      )}

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
