import { useState, useEffect, useCallback } from "react";
import { api } from "../api";
import { fmt, fmtD } from "../utils/constants";
import { Modal } from "../components/UI";
import CandidateForm from "../components/CandidateForm";
import BulkMessageModal from "../components/BulkMessageModal";

const M = ({ n, size = 18, className = "" }) => (
  <span className={`material-symbols-outlined ${className}`} style={{ fontSize: size }}>{n}</span>
);

// ─── STATUS BADGE ─────────────────────────────────────────────────────────────
function StatusBadge({ status, code }) {
  if (code) return <span className="bg-primary text-white text-[10px] font-bold px-2 py-1 rounded-md uppercase">{code}</span>;
  const map = {
    Joined:       { bg: "bg-green-50",  c: "text-green-600" },
    Offered:      { bg: "bg-orange-50", c: "text-secondary" },
    Backout:      { bg: "bg-red-50",    c: "text-error" },
    Hold:         { bg: "bg-gray-100",  c: "text-text-secondary" },
    "In Process": { bg: "bg-primary/5", c: "text-primary" },
  };
  const s = map[status] || { bg: "bg-gray-100", c: "text-text-secondary" };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold ${s.bg} ${s.c}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current shrink-0"></span>
      {status || "Unknown"}
    </span>
  );
}

// ─── RESIGN BADGE ─────────────────────────────────────────────────────────────
function ResignBadge({ v }) {
  const map = { Pending: "bg-orange-50 text-secondary", Accepted: "bg-green-50 text-green-600", NA: "bg-gray-100 text-text-secondary" };
  return <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase whitespace-nowrap ${map[v] || map.NA}`}>{v || "—"}</span>;
}

// ─── VIEW CANDIDATE ───────────────────────────────────────────────────────────
function ViewCandidate({ c }) {
  if (!c) return null;
  const R = (l, v, accent = false) => (
    <div className="flex items-start py-3 border-b border-surface-container">
      <div className="w-40 text-[11px] font-semibold text-text-secondary uppercase tracking-wider shrink-0">{l}</div>
      <div className={`text-sm flex-1 ${accent ? "text-primary font-bold" : "text-text-primary font-medium"}`}>{v || "—"}</div>
    </div>
  );
  return (
    <div>
      <div className="bg-primary rounded-2xl p-6 mb-5 flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center text-xl font-black text-white shrink-0">
          {c.candidateName?.[0]?.toUpperCase()}
        </div>
        <div className="flex-1">
          <h3 className="m-0 text-xl font-bold text-white">{c.candidateName}</h3>
          <p className="m-0 mt-1 text-white/70 text-sm">{c.designation} · {c.clientName} · {c.location}</p>
          <div className="flex gap-2 mt-2">
            <StatusBadge status={c.joiningStatus}/>
            <StatusBadge code={c.statusCode}/>
          </div>
        </div>
        {c.ctcPerMonth && (
          <div className="text-right">
            <div className="text-xl font-bold text-green-400">₹{fmt(c.ctcPerMonth)}</div>
            <div className="text-[10px] text-white/60 uppercase font-bold">Per Month</div>
          </div>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
        {R("Client", c.clientName, true)}{R("Owner", c.ownerName)}
        {R("Designation", c.designation)}{R("Location", c.location)}
        {R("Phone", c.phone)}{R("Email", c.email)}{R("Joining Status", c.joiningStatus)}
        {R("Offer Month", fmtD(c.offerMonth))}{R("Status Code", c.statusCode)}
        {R("Proposed DOJ", fmtD(c.proposedDOJ))}{R("Actual DOJ", fmtD(c.actualDOJ))}
        {R("Resignation", c.resignationAcceptance)}{R("CTC/Month", c.ctcPerMonth ? `₹${fmt(c.ctcPerMonth)}` : "—")}
      </div>
      {c.notes && (
        <div className="mt-3 p-4 bg-primary/5 rounded-xl border border-primary/10">
          <div className="text-[10px] font-bold text-primary uppercase tracking-wider mb-1.5">Internal Notes</div>
          <div className="text-sm text-text-primary leading-relaxed">{c.notes}</div>
        </div>
      )}
    </div>
  );
}

// ─── MULTI SELECT ─────────────────────────────────────────────────────────────
function MultiSelect({ label, icon, options, selected, onChange }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const sel = Array.isArray(selected) ? selected : [];
  const toggle = v => onChange(sel.includes(v) ? sel.filter(x => x !== v) : [...sel, v]);
  const filteredOptions = options.filter(o => o.toLowerCase().includes(query.trim().toLowerCase()));
  const closeAndReset = () => { setOpen(false); setQuery(""); };
  return (
    <div className="relative">
      <label className="block text-[11px] font-bold text-text-secondary uppercase tracking-wider mb-1.5">
        <M n={icon} size={14} className="mr-1 align-middle"/> {label}
      </label>
      <div onClick={() => setOpen(o => !o)} className={`px-3.5 py-2.5 rounded-lg border cursor-pointer text-sm flex items-center justify-between select-none transition-all ${sel.length ? "border-primary bg-primary/5" : "border-outline-variant bg-white"}`}>
        <span className={`overflow-hidden text-ellipsis whitespace-nowrap flex-1 ${sel.length ? "text-primary font-bold" : "text-outline font-medium"}`}>
          {sel.length === 0 ? "Select options" : sel.length === 1 ? sel[0] : `${sel.length} selected`}
        </span>
        <M n={open ? "expand_less" : "expand_more"} size={18} className="text-outline ml-2"/>
      </div>
      {open && <>
        <div onClick={closeAndReset} className="fixed inset-0 z-[98]"/>
        <div className="absolute top-full left-0 right-0 bg-white border border-outline-variant rounded-xl z-[99] shadow-2xl max-h-64 overflow-hidden mt-1.5 flex flex-col">
          <input autoFocus value={query} onChange={e => setQuery(e.target.value)} onClick={e => e.stopPropagation()}
            placeholder={`Search ${label.toLowerCase()}...`} className="m-2 px-2.5 py-2 rounded-lg border border-outline-variant text-sm outline-none focus:border-primary"/>
          <div className="overflow-auto">
            {sel.length > 0 && (
              <div onClick={() => { onChange([]); closeAndReset(); }} className="px-3.5 py-2.5 border-b border-surface-container text-xs text-error font-bold cursor-pointer flex items-center gap-1.5 bg-red-50/50">
                <M n="close" size={16}/> Clear selection
              </div>
            )}
            {filteredOptions.length === 0 && <div className="p-3.5 text-xs text-outline text-center">No matches</div>}
            {filteredOptions.map(o => (
              <div key={o} onClick={() => toggle(o)} className={`px-3.5 py-2.5 flex items-center gap-2.5 cursor-pointer border-b border-surface-container ${sel.includes(o) ? "bg-primary/5" : "bg-white"}`}>
                <div className={`w-[18px] h-[18px] rounded border flex items-center justify-center shrink-0 ${sel.includes(o) ? "bg-primary border-primary" : "border-outline-variant bg-white"}`}>
                  {sel.includes(o) && <M n="check" size={14} className="text-white"/>}
                </div>
                <span className={`text-sm ${sel.includes(o) ? "text-primary font-bold" : "text-text-primary font-medium"}`}>{o}</span>
              </div>
            ))}
          </div>
        </div>
      </>}
    </div>
  );
}

// ─── FILTER PANEL ─────────────────────────────────────────────────────────────
function FilterPanel({ filters, masters, onApply, onClose }) {
  const [local, setLocal] = useState({ ...filters });
  const [visible, setVisible] = useState(false);
  useEffect(() => { setTimeout(() => setVisible(true), 10); }, []);
  const set = (k, v) => setLocal(f => ({ ...f, [k]: v }));
  const close = () => { setVisible(false); setTimeout(onClose, 300); };
  const activeCount = [...(local.clients || []), ...(local.owners || []), ...(local.resignations || []), ...(local.statuses || []), ...(local.codes || []), local.location, local.designation, local.offerFrom, local.offerTo, local.proposedFrom, local.proposedTo, local.actualFrom, local.actualTo].filter(Boolean).length;
  const clearAll = () => setLocal({ clients: [], owners: [], resignations: [], statuses: [], codes: [], location: "", designation: "", offerFrom: "", offerTo: "", proposedFrom: "", proposedTo: "", actualFrom: "", actualTo: "" });

  const DateRange = ({ label, icon, fk, tk }) => (
    <div>
      <label className="block text-[11px] font-bold text-text-secondary uppercase tracking-wider mb-1.5"><M n={icon} size={14} className="mr-1 align-middle"/>{label}</label>
      <div className="grid grid-cols-2 gap-2">
        <input type="date" value={local[fk] || ""} onChange={e => set(fk, e.target.value)} className={`w-full px-3 py-2 rounded-lg border text-xs outline-none ${local[fk] ? "border-primary bg-primary/5" : "border-outline-variant bg-white"}`}/>
        <input type="date" value={local[tk] || ""} onChange={e => set(tk, e.target.value)} className={`w-full px-3 py-2 rounded-lg border text-xs outline-none ${local[tk] ? "border-primary bg-primary/5" : "border-outline-variant bg-white"}`}/>
      </div>
    </div>
  );

  const Section = ({ title, icon, children }) => (
    <div className="mb-7">
      <div className="text-xs font-bold text-primary uppercase tracking-wider border-b border-outline-variant pb-2 mb-4 flex items-center gap-1.5">
        <M n={icon} size={16}/>{title}
      </div>
      <div className="flex flex-col gap-4 relative">{children}</div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[600]">
      <div onClick={close} className="absolute inset-0 bg-primary/15 backdrop-blur-sm"/>
      <div className="absolute top-0 right-0 bottom-0 w-full max-w-[440px] bg-white shadow-2xl flex flex-col transition-transform duration-300" style={{ transform: visible ? "translateX(0)" : "translateX(100%)" }}>
        <div className="bg-primary px-6 py-5 flex items-center justify-between text-white shrink-0">
          <div>
            <div className="text-xl font-bold flex items-center gap-2.5"><M n="filter_list" size={24}/> Advanced Filters</div>
            <div className="text-sm mt-1 opacity-70">{activeCount > 0 ? `${activeCount} filter${activeCount > 1 ? "s" : ""} active` : "Refine your candidate search"}</div>
          </div>
          <button onClick={close} className="bg-white/10 border-none rounded-lg p-2 text-white"><M n="close" size={20}/></button>
        </div>
        <div className="flex-1 overflow-auto px-6 pt-6 pb-5">
          <Section title="Organization & Team" icon="corporate_fare">
            <MultiSelect label="Client" icon="corporate_fare" options={masters.clients || []} selected={local.clients || []} onChange={v => set("clients", v)}/>
            <MultiSelect label="Owner / Recruiter" icon="person" options={masters.owners || []} selected={local.owners || []} onChange={v => set("owners", v)}/>
          </Section>
          <Section title="Candidate Status" icon="verified">
            <MultiSelect label="Joining Status" icon="verified" options={masters.joiningStatus || []} selected={local.statuses || []} onChange={v => set("statuses", v)}/>
            <MultiSelect label="Resignation Status" icon="person_off" options={masters.resignationStatus || ["Pending", "Accepted", "NA"]} selected={local.resignations || []} onChange={v => set("resignations", v)}/>
            <MultiSelect label="Status Code" icon="category" options={(masters.statusCodes || []).map(s => s.code || s)} selected={local.codes || []} onChange={v => set("codes", v)}/>
          </Section>
          <Section title="Location & Position" icon="location_on">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-text-secondary uppercase tracking-wider mb-1.5">Location</label>
                <input value={local.location || ""} onChange={e => set("location", e.target.value)} placeholder="e.g. Mumbai" className={`w-full px-3.5 py-2.5 rounded-lg border text-sm outline-none ${local.location ? "border-primary bg-primary/5" : "border-outline-variant bg-white"}`}/>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-text-secondary uppercase tracking-wider mb-1.5">Position</label>
                <input value={local.designation || ""} onChange={e => set("designation", e.target.value)} placeholder="e.g. Manager" className={`w-full px-3.5 py-2.5 rounded-lg border text-sm outline-none ${local.designation ? "border-primary bg-primary/5" : "border-outline-variant bg-white"}`}/>
              </div>
            </div>
          </Section>
          <Section title="Date Intervals" icon="event">
            <DateRange label="Offer Month" icon="event" fk="offerFrom" tk="offerTo"/>
            <DateRange label="Proposed DOJ" icon="calendar_month" fk="proposedFrom" tk="proposedTo"/>
            <DateRange label="Actual DOJ" icon="task_alt" fk="actualFrom" tk="actualTo"/>
          </Section>
        </div>
        <div className="px-6 py-5 bg-surface border-t border-outline-variant flex gap-3 shrink-0">
          <button onClick={clearAll} className="flex-1 py-3.5 bg-white border border-outline-variant rounded-xl text-sm font-bold text-text-secondary">Clear All</button>
          <button onClick={() => { onApply(local); close(); }} className="flex-[2] py-3.5 bg-primary text-white rounded-xl text-sm font-bold shadow-lg shadow-primary/30">
            Apply{activeCount > 0 ? ` (${activeCount})` : ""}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
const PAGE_SIZE_OPTIONS = [25, 50, 100];
const EMPTY = { clients: [], owners: [], resignations: [], statuses: [], codes: [], location: "", designation: "", offerFrom: "", offerTo: "", proposedFrom: "", proposedTo: "", actualFrom: "", actualTo: "" };
const PRESETS_KEY = "crm_filter_presets";

export default function Candidates({ masters, user, initialFilter, onConsumeInitialFilter, openCandidateId, onOpenedCandidate }) {
  const [result, setResult] = useState({ candidates: [], total: 0, pages: 1 });
  const [search, setSearch] = useState("");
  const [debSearch, setDebSearch] = useState("");
  const [filters, setFilters] = useState(EMPTY);
  const [page, setPage] = useState(1);
  const [PER, setPER] = useState(25);
  const [sortDir, setSortDir] = useState("desc");
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [modal, setModal] = useState(null);
  const [saving, setSaving] = useState(false);
  const [selected, setSelected] = useState(() => new Set());
  const [showBulk, setShowBulk] = useState(false);
  const [presets, setPresets] = useState(() => {
    try { return JSON.parse(localStorage.getItem(PRESETS_KEY) || "[]"); } catch { return []; }
  });

  useEffect(() => {
    if (initialFilter) {
      setFilters(f => ({ ...EMPTY, ...initialFilter }));
      setPage(1);
      onConsumeInitialFilter && onConsumeInitialFilter();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialFilter]);

  useEffect(() => {
    if (!openCandidateId) return;
    (async () => {
      try {
        const c = await api.getCandidate(openCandidateId);
        if (c && !c.error) setModal({ type: "edit", data: c });
      } catch (e) { console.error(e); }
      onOpenedCandidate && onOpenedCandidate();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openCandidateId]);

  const load = useCallback(async (p = 1, s = "", f = {}, per = 25, dir = "desc") => {
    setLoading(true);
    const params = { page: p, limit: per, sortDir: dir };
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
    try { const res = await api.getCandidates(params); setResult(res || { candidates: [], total: 0, pages: 1 }); }
    catch (e) { console.error(e); }
    setLoading(false);
  }, []);

  useEffect(() => { const t = setTimeout(() => { setDebSearch(search); setPage(1); }, 400); return () => clearTimeout(t); }, [search]);
  useEffect(() => { load(page, debSearch, filters, PER, sortDir); setSelected(new Set()); }, [page, filters, debSearch, PER, sortDir, load]);

  const handleDelete = async id => {
    if (!window.confirm("Delete this candidate? This cannot be undone.")) return;
    try { const r = await api.deleteCandidate(id); if (r.error) { alert(r.error); return; } load(page, debSearch, filters, PER, sortDir); }
    catch (e) { alert(e.message); }
  };

  const handleSave = async form => {
    setSaving(true);
    try {
      const r = modal.type === "add" ? await api.createCandidate(form) : await api.updateCandidate(modal.data.id, form);
      if (r.error) { alert(r.error); setSaving(false); return; }
      setModal(null); load(page, debSearch, filters, PER, sortDir);
    } catch (e) { alert(e.message); }
    setSaving(false);
  };

  const exportCSV = () => {
    const cols = ["SR.NO", "Client", "Candidate", "Position", "Location", "Phone", "Offer Mth", "Prop DOJ", "Actual DOJ", "Resign", "Owner", "Status", "CTC/Mo", "Code"];
    const rows = (result.candidates || []).map((c, i) => [i + 1 + (page - 1) * PER, c.clientName, c.candidateName, c.designation, c.location, c.phone, fmtD(c.offerMonth), fmtD(c.proposedDOJ), fmtD(c.actualDOJ), c.resignationAcceptance, c.ownerName, c.joiningStatus, c.ctcPerMonth ? fmt(c.ctcPerMonth) : "", c.statusCode]);
    const csv = [cols, ...rows].map(r => r.map(v => `"${v || ""}"`).join(",")).join("\n");
    const a = document.createElement("a"); a.href = "data:text/csv;charset=utf-8," + encodeURIComponent(csv); a.download = "candidates.csv"; a.click();
  };

  const activeFilters = [...(filters.clients || []), ...(filters.owners || []), ...(filters.resignations || []), ...(filters.statuses || []), ...(filters.codes || []), filters.location, filters.designation, filters.offerFrom, filters.offerTo, filters.proposedFrom, filters.proposedTo, filters.actualFrom, filters.actualTo].filter(Boolean).length;
  const clearAll = () => { setFilters(EMPTY); setPage(1); };
  const canEdit = user.role !== "viewer";
  const canDel = user.role === "admin";

  const chips = [
    ...(filters.clients || []).map(v => ({ k: "clients", v, l: v, i: "corporate_fare" })),
    ...(filters.owners || []).map(v => ({ k: "owners", v, l: v, i: "person" })),
    ...(filters.statuses || []).map(v => ({ k: "statuses", v, l: v, i: "verified" })),
    ...(filters.resignations || []).map(v => ({ k: "resignations", v, l: v, i: "person_off" })),
    ...(filters.codes || []).map(v => ({ k: "codes", v, l: v, i: "category" })),
    filters.location && { k: "location", v: filters.location, l: filters.location, i: "location_on" },
    filters.designation && { k: "designation", v: filters.designation, l: filters.designation, i: "work" },
    filters.offerFrom && { k: "offerFrom", v: filters.offerFrom, l: "Offer ≥ " + filters.offerFrom, i: "event" },
    filters.actualFrom && { k: "actualFrom", v: filters.actualFrom, l: "Joined ≥ " + filters.actualFrom, i: "task_alt" },
  ].filter(Boolean);

  const removeChip = chip => {
    const nf = { ...filters };
    if (Array.isArray(nf[chip.k])) nf[chip.k] = nf[chip.k].filter(x => x !== chip.v);
    else nf[chip.k] = "";
    setFilters(nf); setPage(1);
  };

  const pageIds = (result.candidates || []).map(c => c.id);
  const allOnPageSelected = pageIds.length > 0 && pageIds.every(id => selected.has(id));
  const toggleOne = id => setSelected(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const toggleAllOnPage = () => setSelected(s => {
    const n = new Set(s);
    if (allOnPageSelected) pageIds.forEach(id => n.delete(id));
    else pageIds.forEach(id => n.add(id));
    return n;
  });
  const selectedCandidates = (result.candidates || []).filter(c => selected.has(c.id));

  const savePreset = () => {
    const name = window.prompt("Name this filter set (e.g. 'Pending resignations - Infosys'):");
    if (!name) return;
    const next = [...presets.filter(p => p.name !== name), { name, filters }];
    setPresets(next);
    localStorage.setItem(PRESETS_KEY, JSON.stringify(next));
  };
  const loadPreset = name => {
    const p = presets.find(x => x.name === name);
    if (p) { setFilters({ ...EMPTY, ...p.filters }); setPage(1); }
  };
  const deletePreset = name => {
    const next = presets.filter(p => p.name !== name);
    setPresets(next);
    localStorage.setItem(PRESETS_KEY, JSON.stringify(next));
  };

  const ActionBtn = ({ onClick, title, icon, cls }) => (
    <button onClick={onClick} title={title} className={`action-btn p-2 border border-outline-variant rounded-lg transition-all flex ${cls}`}>
      <M n={icon} size={18}/>
    </button>
  );

  return (
    <div className="max-w-[1600px] mx-auto">
      {showFilters && <FilterPanel filters={filters} masters={masters} onApply={f => { setFilters(f); setPage(1); }} onClose={() => setShowFilters(false)}/>}

      {/* Header */}
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-primary">Candidate Tracker</h1>
          <p className="text-text-secondary text-sm">Real-time recruitment pipeline management for <span className="font-bold text-primary">{result.total.toLocaleString()}</span> records.</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {selected.size > 0 && (
            <button onClick={() => setShowBulk(true)} className="flex items-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-green-600/20 hover:bg-green-700 transition-all">
              <M n="campaign" size={18}/> Message {selected.size} Selected
            </button>
          )}
          <button onClick={() => load(page, debSearch, filters, PER, sortDir)} className="flex items-center gap-2 px-4 py-2.5 bg-white border border-outline-variant rounded-xl text-sm font-semibold text-primary hover:bg-primary/5 transition-colors shadow-sm">
            <M n="refresh" size={20}/> Refresh
          </button>
          <button onClick={exportCSV} className="flex items-center gap-2 px-4 py-2.5 bg-white border border-outline-variant rounded-xl text-sm font-semibold text-primary hover:bg-primary/5 transition-colors shadow-sm">
            <M n="download" size={20}/> Export CSV
          </button>
          {canEdit && (
            <button onClick={() => setModal({ type: "add" })} className="flex items-center gap-2 px-6 py-2.5 bg-secondary text-white rounded-xl text-sm font-bold shadow-lg shadow-secondary/20 hover:scale-[1.02] active:scale-[0.98] transition-all">
              <M n="add" size={20}/> Add Candidate
            </button>
          )}
        </div>
      </header>

      {/* Search & filter navy panel */}
      <div className="bg-primary rounded-2xl p-5 mb-8 shadow-xl shadow-primary/10">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-[280px] relative group">
            <M n="search" size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50"/>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name, client, phone, designation..."
              className="w-full bg-white/10 border border-white/20 rounded-xl py-3 pl-12 pr-4 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:bg-white/15 transition-all text-sm font-medium"/>
            {search && <button onClick={() => { setSearch(""); setDebSearch(""); setPage(1); }} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white"><M n="close" size={18}/></button>}
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button onClick={() => setShowFilters(true)} className={`flex items-center gap-2 px-5 py-3 border border-white/20 rounded-xl text-sm font-bold text-white transition-all ${activeFilters > 0 ? "bg-secondary" : "bg-white/10 hover:bg-white/20"}`}>
              <M n="filter_list" size={20}/> Filters
              {activeFilters > 0 && <span className="bg-white text-secondary text-[10px] font-black px-1.5 py-0.5 rounded-full">{activeFilters}</span>}
            </button>
            {presets.length > 0 && (
              <select onChange={e => { if (e.target.value) { loadPreset(e.target.value); e.target.value = ""; } }} defaultValue=""
                className="bg-white/10 border border-white/20 text-white text-sm font-semibold rounded-xl px-4 py-3 outline-none cursor-pointer hover:bg-white/20 transition-all">
                <option className="text-primary" value="">Saved Filters ({presets.length})</option>
                {presets.map(p => <option className="text-primary" key={p.name} value={p.name}>{p.name}</option>)}
              </select>
            )}
            {activeFilters > 0 && (
              <button onClick={savePreset} className="flex items-center gap-1.5 px-4 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-white text-sm font-semibold transition-all">
                <M n="bookmark_add" size={16}/> Save
              </button>
            )}
            <button onClick={() => setSortDir(d => d === "desc" ? "asc" : "desc")} title="Sort Order" className="flex items-center gap-1.5 px-4 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-white text-sm font-semibold transition-all">
              <M n={sortDir === "desc" ? "arrow_downward" : "arrow_upward"} size={18}/> {sortDir === "desc" ? "Newest" : "Oldest"}
            </button>
            <select value={PER} onChange={e => { setPER(parseInt(e.target.value)); setPage(1); }}
              className="bg-white/10 border border-white/20 text-white text-sm font-semibold rounded-xl px-4 py-3 outline-none cursor-pointer hover:bg-white/20 transition-all">
              {PAGE_SIZE_OPTIONS.map(n => <option className="text-primary" key={n} value={n}>{n} / page</option>)}
            </select>
          </div>
        </div>

        {presets.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {presets.map(p => (
              <span key={p.name} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white/10 rounded-full text-[11px] text-white/70">
                {p.name}
                <button onClick={() => deletePreset(p.name)} className="text-white/50 hover:text-white flex"><M n="close" size={11}/></button>
              </span>
            ))}
          </div>
        )}

        {chips.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-white/10 items-center">
            {chips.map((chip, i) => (
              <span key={i} className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 border border-white/20 text-white/80 font-bold text-[11px] rounded-lg">
                <M n={chip.i} size={14}/> {chip.l}
                <button onClick={() => removeChip(chip)} className="hover:text-white"><M n="close" size={14}/></button>
              </span>
            ))}
            <button onClick={clearAll} className="text-[11px] font-black text-white/50 hover:text-secondary uppercase tracking-wider ml-2 transition-colors">Clear All</button>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-white border border-outline-variant rounded-2xl shadow-sm overflow-hidden flex flex-col">
        {selected.size > 0 && (
          <div className="bg-green-50 border-b border-green-100 px-6 py-3 flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-3">
              <span className="bg-green-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full">{selected.size} Selected</span>
              <span className="text-sm font-medium text-green-800">Bulk actions available for selected candidates</span>
            </div>
            <button onClick={() => setShowBulk(true)} className="flex items-center gap-2 px-4 py-1.5 bg-green-600 text-white rounded-lg text-sm font-bold shadow-md shadow-green-600/20 hover:bg-green-700 transition-all">
              <M n="campaign" size={18}/> Send Bulk Message
            </button>
          </div>
        )}

        {loading ? (
          <div className="p-24 text-center">
            <div className="w-10 h-10 border-4 border-primary/10 border-t-secondary rounded-full animate-spin-fast mx-auto mb-4"></div>
            <div className="text-primary font-bold text-sm uppercase tracking-widest">Syncing Pipeline...</div>
          </div>
        ) : (
          <>
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse min-w-[1300px]">
              <thead>
                <tr className="bg-surface border-b border-outline-variant">
                  <th className="py-4 px-4 w-12 text-center">
                    <input type="checkbox" checked={allOnPageSelected} onChange={toggleAllOnPage} className="w-4 h-4 rounded border-outline-variant text-primary cursor-pointer"/>
                  </th>
                  {["SR", "CLIENT", "CANDIDATE", "POSITION", "LOCATION", "OFFER", "DOJ", "RESIGN", "OWNER", "STATUS", "CTC/MO", "CODE", "ACTIONS"].map(l => (
                    <th key={l} className="py-4 px-4 text-[10px] font-black text-primary uppercase tracking-widest whitespace-nowrap">{l}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {!(result.candidates || []).length && (
                  <tr><td colSpan={14} className="p-24 text-center">
                    <M n="person_search" size={40} className="text-outline-variant"/>
                    <div className="text-lg font-bold text-primary mt-4 mb-2">No matches found</div>
                    <div className="text-sm text-text-secondary mb-5">Adjust your search or filters to find what you're looking for.</div>
                    {activeFilters > 0 && <button onClick={clearAll} className="px-6 py-2.5 bg-primary text-white rounded-xl text-sm font-bold">Reset Filters</button>}
                  </td></tr>
                )}
                {(result.candidates || []).map((c, i) => (
                  <tr key={c.id} className={`hover:bg-primary/[0.02] transition-colors group ${selected.has(c.id) ? "bg-primary/5" : ""}`}>
                    <td className="py-4 px-4 text-center" onClick={e => e.stopPropagation()}>
                      <input type="checkbox" checked={selected.has(c.id)} onChange={() => toggleOne(c.id)} className="w-4 h-4 rounded border-outline-variant text-primary cursor-pointer"/>
                    </td>
                    <td className="py-4 px-4"><span className="text-[11px] font-bold text-text-secondary bg-surface px-2 py-1 rounded">{(page - 1) * PER + i + 1}</span></td>
                    <td className="py-4 px-4 font-bold text-primary">{c.clientName || "—"}</td>
                    <td className="py-4 px-4">
                      <div className="font-bold text-primary">{c.candidateName}</div>
                      <div className="text-[11px] text-text-secondary">{c.phone || "No phone"}</div>
                    </td>
                    <td className="py-4 px-4 text-sm font-medium text-text-primary">{c.designation || "—"}</td>
                    <td className="py-4 px-4">
                      {c.location ? <div className="flex items-center gap-1 text-[11px] text-secondary font-bold"><M n="location_on" size={14}/>{c.location}</div> : "—"}
                    </td>
                    <td className="py-4 px-4 font-semibold text-text-primary">{fmtD(c.offerMonth)}</td>
                    <td className="py-4 px-4">
                      <div className={`font-bold ${c.actualDOJ ? "text-green-600" : "text-primary"}`}>{fmtD(c.actualDOJ || c.proposedDOJ)}</div>
                      {!c.actualDOJ && <div className="text-[9px] font-black text-secondary uppercase">Proposed</div>}
                    </td>
                    <td className="py-4 px-4"><ResignBadge v={c.resignationAcceptance}/></td>
                    <td className="py-4 px-4 font-semibold text-text-primary">{c.ownerName || "—"}</td>
                    <td className="py-4 px-4"><StatusBadge status={c.joiningStatus}/></td>
                    <td className="py-4 px-4 font-bold text-primary">{c.ctcPerMonth ? `₹${fmt(c.ctcPerMonth)}` : "—"}</td>
                    <td className="py-4 px-4"><StatusBadge code={c.statusCode}/></td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <ActionBtn onClick={() => setModal({ type: "view", data: c })} title="View" icon="visibility" cls="text-primary hover:bg-primary hover:text-white"/>
                        {canEdit && <ActionBtn onClick={() => setModal({ type: "edit", data: c })} title="Edit" icon="edit" cls="text-secondary hover:bg-secondary hover:text-white"/>}
                        {canDel && <ActionBtn onClick={() => handleDelete(c.id)} title="Delete" icon="delete" cls="text-error hover:bg-error hover:text-white"/>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="bg-surface border-t border-outline-variant px-6 py-4 flex flex-wrap items-center justify-between gap-4">
            <div className="text-xs font-semibold text-text-secondary">
              Showing <span className="text-primary">{Math.min((page - 1) * PER + 1, result.total)}</span> to <span className="text-primary">{Math.min(page * PER, result.total)}</span> of <span className="text-primary">{result.total.toLocaleString()}</span> candidates
            </div>
            <div className="flex items-center gap-1.5">
              <button onClick={() => setPage(1)} disabled={page <= 1} className="px-3 py-2 bg-white border border-outline-variant rounded-lg text-primary text-xs font-black hover:bg-primary/5 disabled:opacity-30 disabled:pointer-events-none transition-all">
                <M n="keyboard_double_arrow_left" size={16}/>
              </button>
              <button onClick={() => setPage(p => p - 1)} disabled={page <= 1} className="px-4 py-2 bg-white border border-outline-variant rounded-lg text-primary text-xs font-bold hover:bg-primary/5 disabled:opacity-30 disabled:pointer-events-none transition-all">Prev</button>
              <div className="flex items-center gap-1 mx-2">
                {Array.from({ length: Math.min(5, result.pages || 1) }, (_, i) => {
                  const p = Math.max(1, Math.min(page - 2, (result.pages || 1) - 4)) + i;
                  if (p < 1 || p > (result.pages || 1)) return null;
                  const active = p === page;
                  return <button key={p} onClick={() => setPage(p)} className={`w-9 h-9 flex items-center justify-center rounded-lg text-[13px] font-bold transition-colors ${active ? "bg-primary text-white shadow-lg shadow-primary/20 font-black" : "text-primary hover:bg-primary/5"}`}>{p}</button>;
                })}
              </div>
              <button onClick={() => setPage(p => p + 1)} disabled={page >= (result.pages || 1)} className="px-4 py-2 bg-white border border-outline-variant rounded-lg text-primary text-xs font-bold hover:bg-primary/5 disabled:opacity-30 disabled:pointer-events-none transition-all">Next</button>
              <button onClick={() => setPage(result.pages || 1)} disabled={page >= (result.pages || 1)} className="px-3 py-2 bg-white border border-outline-variant rounded-lg text-primary text-xs font-black hover:bg-primary/5 disabled:opacity-30 disabled:pointer-events-none transition-all">
                <M n="keyboard_double_arrow_right" size={16}/>
              </button>
            </div>
          </div>
          </>
        )}
      </div>

      <Modal open={modal?.type === "add"} onClose={() => setModal(null)} title="Add New Candidate" wide>
        <CandidateForm masters={masters} onSave={handleSave} onCancel={() => setModal(null)} saving={saving}/>
      </Modal>
      <Modal open={modal?.type === "edit"} onClose={() => setModal(null)} title="Edit Candidate" wide>
        <CandidateForm initial={modal?.data} masters={masters} onSave={handleSave} onCancel={() => setModal(null)} saving={saving}/>
      </Modal>
      <Modal open={modal?.type === "view"} onClose={() => setModal(null)} title="Candidate Profile">
        <ViewCandidate c={modal?.data}/>
      </Modal>

      {showBulk && selectedCandidates.length > 0 && (
        <BulkMessageModal candidates={selectedCandidates} onClose={() => setShowBulk(false)}/>
      )}
    </div>
  );
}
