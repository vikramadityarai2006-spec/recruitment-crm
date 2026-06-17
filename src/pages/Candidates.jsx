import { useState, useEffect, useCallback, useRef } from "react";
import { api } from "../api";
import { fmt, fmtD } from "../utils/constants";
import { Badge, Spin, Icon, Modal } from "../components/UI";
import CandidateForm from "../components/CandidateForm";

const fmtMonth = (d) => {
  if (!d) return "—";
  try {
    return new Date(d).toLocaleDateString("en-IN", { month: "short", year: "numeric" });
  } catch { return d; }
};

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const YEARS = ["2022","2023","2024","2025","2026"];
const OFFER_MONTH_OPTS = YEARS.flatMap(y => MONTHS.map(m => `${m} ${y}`)).reverse();

const EMPTY_FILTERS = {
  client: "", position: "", location: "", offerMonth: "",
  propDOJ: "", actualDOJ: "", resign: "", owner: "", status: "", statusCode: ""
};

const FILTER_CONFIG = [
  { label: "Client",      key: "client",     type: "select",   icon: "🏢" },
  { label: "Position",    key: "position",   type: "text",     icon: "💼" },
  { label: "Location",    key: "location",   type: "text",     icon: "📍" },
  { label: "Offer Month", key: "offerMonth", type: "select",   icon: "📅", opts: OFFER_MONTH_OPTS },
  { label: "Prop DOJ",    key: "propDOJ",    type: "date",     icon: "📆" },
  { label: "Actual DOJ",  key: "actualDOJ",  type: "date",     icon: "✅" },
  { label: "Resign",      key: "resign",     type: "select",   icon: "🚪", opts: ["Done", "Pending"] },
  { label: "Owner",       key: "owner",      type: "select",   icon: "👤" },
  { label: "Status",      key: "status",     type: "select",   icon: "🔖" },
  { label: "Code",        key: "statusCode", type: "select",   icon: "🎨" },
];

export default function Candidates({ masters, user, onDataChange }) {
  const [result, setResult] = useState({ candidates: [], total: 0, pages: 1 });
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showF, setShowF] = useState(false);
  const [modal, setModal] = useState(null);
  const [saving, setSaving] = useState(false);
  const searchRef = useRef();
  const PER = 20;

  // The Load function perfectly matches the new backend query parameters
  const load = useCallback(async (p = 1, s = "", f = {}) => {
    setLoading(true);
    const params = { page: p, limit: PER, sortBy: "id", sortDir: "desc" };
    if (s) params.search = s;
    if (f.client)     params.client = f.client;
    if (f.position)   params.position = f.position;
    if (f.owner)      params.owner = f.owner;
    if (f.status)     params.status = f.status;
    if (f.statusCode) params.statusCode = f.statusCode;
    if (f.location)   params.location = f.location;
    if (f.offerMonth) params.offerMonth = f.offerMonth;
    if (f.propDOJ)    params.propDOJ = f.propDOJ;
    if (f.actualDOJ)  params.actualDOJ = f.actualDOJ;
    if (f.resign)     params.resign = f.resign;
    
    try {
      const res = await api.getCandidates(params);
      setResult(res || { candidates: [], total: 0, pages: 1 });
    } catch (e) { console.error(e); }
    setLoading(false);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => { load(1, search, filters); setPage(1); }, 400);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => { load(page, search, filters); }, [page, filters]);

  const setFilter = (k, v) => {
    const nf = { ...filters, [k]: v };
    setFilters(nf); setPage(1);
  };

  const clearFilters = () => {
    setFilters(EMPTY_FILTERS); setPage(1);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this candidate?")) return;
    try {
      const r = await api.deleteCandidate(id);
      if (r.error) { alert("Error: " + r.error); return; }
      load(page, search, filters);
      onDataChange?.();
    } catch (e) { alert("Delete failed: " + e.message); }
  };

  const handleSave = async (form) => {
    setSaving(true);
    try {
      const r = modal.type === "add" ? await api.createCandidate(form) : await api.updateCandidate(modal.data.id, form);
      if (r.error) { alert("Error: " + r.error); setSaving(false); return; }
      setModal(null); load(page, search, filters);
      onDataChange?.();
    } catch (e) { alert("Save failed: " + e.message); }
    setSaving(false);
  };

  const exportCSV = () => {
    const cols = ["SR.NO","Client","Designation","Location","Candidate","Phone","Offer Month","Proposed DOJ","Actual DOJ","Resignation","Owner","Status","CTC","Code","Notes"];
    const rows = (result.candidates || []).map((c, i) => [(result.total - ((page-1)*PER) - i), c.clientName, c.designation, c.location, c.candidateName, c.phone, fmtMonth(c.offerMonth), c.proposedDOJ, c.actualDOJ, c.resignationAcceptance, c.ownerName, c.joiningStatus, c.ctcPerMonth, c.statusCode, c.notes]);
    const csv = [cols, ...rows].map(r => r.map(v => `"${(v || "").toString().replace(/"/g, '""')}"`).join(",")).join("\n");
    const a = document.createElement("a"); a.href = "data:text/csv;charset=utf-8," + encodeURIComponent(csv); a.download = "candidates.csv"; a.click();
  };

  const activeF = Object.values(filters).filter(Boolean).length;
  const canEdit = user.role !== "viewer";
  const canDel = user.role === "admin";

  const resColor = (v) => {
    if (!v || v === "—") return { bg: "#f1f5f9", color: "#94a3b8" };
    if (v === "Accepted" || v === "Yes" || v === "Done") return { bg: "#dcfce7", color: "#16a34a" };
    if (v === "Pending") return { bg: "#fef9c3", color: "#92400e" };
    if (v === "Rejected" || v === "No") return { bg: "#fee2e2", color: "#dc2626" };
    return { bg: "#f0f9ff", color: "#0369a1" };
  };

  const cols = [
    { l: "SR.NO", w: 50 }, { l: "CLIENT", w: 100 }, { l: "CANDIDATE", w: 130 },
    { l: "POSITION", w: 110 }, { l: "LOC", w: 75 }, { l: "PHONE", w: 95 },
    { l: "OFFER MTH", w: 80 }, { l: "PROP DOJ", w: 88 }, { l: "ACTUAL DOJ", w: 90 },
    { l: "RESIGN", w: 80 }, { l: "OWNER", w: 85 }, { l: "STATUS", w: 80 },
    { l: "CTC", w: 78 }, { l: "CODE", w: 58 }, { l: "", w: 72 },
  ];

  const getOpts = (key) => {
    if (key === "client")     return masters.clients || [];
    if (key === "owner")      return masters.owners || [];
    if (key === "status")     return masters.joiningStatus || [];
    if (key === "statusCode") return (masters.statusCodes || []).map(s => s.code || s);
    return [];
  };

  const FILTER_LABEL_MAP = {
    client: "Client", position: "Position", location: "Location",
    offerMonth: "Offer Month", propDOJ: "Prop DOJ", actualDOJ: "Actual DOJ",
    resign: "Resign", owner: "Owner", status: "Status", statusCode: "Code"
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: "#0f172a", margin: 0 }}>Candidates</h2>
          <p style={{ color: "#64748b", margin: "3px 0 0", fontSize: 13 }}>{result.total} records in database</p>
        </div>
        <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
          <button onClick={() => load(page, search, filters)} style={{ display: "flex", alignItems: "center", gap: 5, padding: "7px 11px", background: "#f1f5f9", border: "none", borderRadius: 8, fontWeight: 600, cursor: "pointer", fontSize: 12, color: "#374151" }}>
            <Icon n="refresh" s={13} /> Refresh
          </button>
          {canEdit && <button onClick={() => setModal({ type: "add" })} style={{ display: "flex", alignItems: "center", gap: 5, padding: "7px 13px", background: "linear-gradient(135deg,#2563eb,#7c3aed)", color: "white", border: "none", borderRadius: 8, fontWeight: 600, cursor: "pointer", fontSize: 12 }}>
            <Icon n="plus" s={13} /> Add Candidate
          </button>}
          <button onClick={exportCSV} style={{ display: "flex", alignItems: "center", gap: 5, padding: "7px 11px", background: "#f1f5f9", border: "none", borderRadius: 8, fontWeight: 600, cursor: "pointer", fontSize: 12, color: "#374151" }}>
            <Icon n="dl" s={13} /> Export CSV
          </button>
        </div>
      </div>

      <div style={{ background: "white", borderRadius: 10, padding: "10px 12px", marginBottom: 12, boxShadow: "0 1px 3px rgba(0,0,0,.06)", border: "1px solid #f1f5f9" }}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 180, display: "flex", alignItems: "center", gap: 7, background: "#f8fafc", borderRadius: 7, padding: "6px 10px", border: "1.5px solid #e2e8f0" }}>
            <Icon n="search" s={13} />
            <input ref={searchRef} value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name, client, phone…" style={{ border: "none", background: "none", outline: "none", fontSize: 13, width: "100%" }} />
            {search && <button onClick={() => { setSearch(""); load(1, "", filters); }} style={{ border: "none", background: "none", cursor: "pointer", color: "#94a3b8", display: "flex", padding: 0 }}><Icon n="x" s={11} /></button>}
          </div>
          <button
            onClick={() => setShowF(f => !f)}
            style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 14px", background: showF ? "linear-gradient(135deg,#2563eb,#7c3aed)" : activeF > 0 ? "#eff6ff" : "#f8fafc", border: `1.5px solid ${showF ? "transparent" : activeF > 0 ? "#bfdbfe" : "#e2e8f0"}`, borderRadius: 7, cursor: "pointer", fontSize: 12, fontWeight: 700, color: showF ? "white" : activeF > 0 ? "#1d4ed8" : "#374151", transition: "all .15s" }}>
            <Icon n="filter" s={12} /> Filters
            {activeF > 0 && <span style={{ background: showF ? "rgba(255,255,255,0.3)" : "#2563eb", color: "white", borderRadius: 10, padding: "1px 7px", fontSize: 10, fontWeight: 800 }}>{activeF}</span>}
          </button>
        </div>

        {showF && (
          <div style={{ marginTop: 12, borderTop: "1px solid #f1f5f9", paddingTop: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <span style={{ fontSize: 11, fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: 0.6 }}>🎯 Filter by</span>
              {activeF > 0 && (
                <button onClick={clearFilters} style={{ display: "flex", alignItems: "center", gap: 4, padding: "4px 10px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 6, color: "#dc2626", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>✕ Clear all filters</button>
              )}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 10 }}>
              {FILTER_CONFIG.map(({ label, key, type, icon, opts }) => {
                const val = filters[key];
                const isActive = !!val;
                const selectOpts = opts || getOpts(key);
                return (
                  <div key={key} style={{ position: "relative" }}>
                    <label style={{ fontSize: 10, fontWeight: 700, color: isActive ? "#2563eb" : "#64748b", display: "flex", alignItems: "center", gap: 4, marginBottom: 4, textTransform: "uppercase", letterSpacing: .5 }}>
                      <span>{icon}</span> {label}
                      {isActive && <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#2563eb", display: "inline-block", marginLeft: 2 }} />}
                    </label>

                    {type === "select" ? (
                      <select value={val} onChange={e => setFilter(key, e.target.value)}
                        style={{ width: "100%", padding: "7px 28px 7px 9px", borderRadius: 7, border: `1.5px solid ${isActive ? "#93c5fd" : "#e2e8f0"}`, fontSize: 12, background: isActive ? "#eff6ff" : "white", color: isActive ? "#1d4ed8" : "#374151", outline: "none", cursor: "pointer", fontWeight: isActive ? 700 : 400, appearance: "none", WebkitAppearance: "none", backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%2394a3b8'/%3E%3C/svg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 9px center" }}>
                        <option value="">All</option>
                        {selectOpts.map(o => <option key={o} value={o}>{o}</option>)}
                      </select>
                    ) : type === "date" ? (
                      <input type="date" value={val} onChange={e => setFilter(key, e.target.value)}
                        style={{ width: "100%", padding: "7px 9px", borderRadius: 7, boxSizing: "border-box", border: `1.5px solid ${isActive ? "#93c5fd" : "#e2e8f0"}`, fontSize: 11, background: isActive ? "#eff6ff" : "white", color: isActive ? "#1d4ed8" : "#374151", outline: "none", cursor: "pointer", fontWeight: isActive ? 700 : 400 }} />
                    ) : (
                      <input type="text" value={val} onChange={e => setFilter(key, e.target.value)} placeholder={`Search ${label}…`}
                        style={{ width: "100%", padding: "7px 9px", borderRadius: 7, boxSizing: "border-box", border: `1.5px solid ${isActive ? "#93c5fd" : "#e2e8f0"}`, fontSize: 12, background: isActive ? "#eff6ff" : "white", color: isActive ? "#1d4ed8" : "#374151", outline: "none", fontWeight: isActive ? 700 : 400 }} />
                    )}
                    {isActive && <button onClick={() => setFilter(key, "")} style={{ position: "absolute", right: type === "select" ? 22 : 7, bottom: 8, border: "none", background: "none", cursor: "pointer", color: "#93c5fd", fontSize: 13, lineHeight: 1, padding: 0, display: "flex", alignItems: "center" }}>×</button>}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {activeF > 0 && (
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
          {Object.entries(filters).filter(([, v]) => v).map(([k, v]) => (
            <span key={k} style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 9px 3px 10px", background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 20, fontSize: 11, fontWeight: 600, color: "#1d4ed8" }}>
              <span style={{ color: "#93c5fd", fontWeight: 400 }}>{FILTER_LABEL_MAP[k]}:</span> {v}
              <button onClick={() => setFilter(k, "")} style={{ border: "none", background: "none", cursor: "pointer", color: "#93c5fd", padding: "0 0 0 2px", display: "flex", fontSize: 14, lineHeight: 1 }}>×</button>
            </span>
          ))}
        </div>
      )}

      <div style={{ background: "white", borderRadius: 10, boxShadow: "0 1px 3px rgba(0,0,0,.06)", border: "1px solid #f1f5f9", overflow: "auto" }}>
        {loading ? (
          <div style={{ padding: 50, textAlign: "center" }}><Spin /><div style={{ marginTop: 10, color: "#94a3b8", fontSize: 13 }}>Loading…</div></div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
            <thead>
              <tr style={{ background: "linear-gradient(to right,#f8fafc,#f1f5f9)", borderBottom: "2px solid #e2e8f0" }}>
                {cols.map(({ l, w }) => <th key={l} style={{ padding: "9px 8px", textAlign: "left", fontWeight: 700, color: "#475569", fontSize: 10, textTransform: "uppercase", letterSpacing: .5, minWidth: w, whiteSpace: "nowrap" }}>{l}</th>)}
              </tr>
            </thead>
            <tbody>
              {!(result.candidates || []).length && <tr><td colSpan={15} style={{ padding: 40, textAlign: "center", color: "#94a3b8" }}>No candidates found.</td></tr>}
              {(result.candidates || []).map((c, i) => {
                const srNo = result.total - ((page - 1) * PER) - i;
                const rc = resColor(c.resignationAcceptance);
                return (
                  <tr key={c.id} style={{ borderBottom: "1px solid #f1f5f9", background: i % 2 ? "#fcfcfd" : "white", transition: "background .12s" }} onMouseEnter={e => e.currentTarget.style.background = "#f0f9ff"} onMouseLeave={e => e.currentTarget.style.background = i % 2 ? "#fcfcfd" : "white"}>
                    <td style={{ padding: "8px 8px", color: "#94a3b8", fontWeight: 700, fontSize: 10 }}>{srNo}</td>
                    <td style={{ padding: "8px 8px", fontWeight: 700, color: "#1e293b", maxWidth: 100, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.clientName || "—"}</td>
                    <td style={{ padding: "8px 8px" }}>
                      <div style={{ fontWeight: 700, color: "#0f172a", maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.candidateName}</div>
                      {c.phone && <div style={{ fontSize: 9, color: "#94a3b8", marginTop: 1 }}>{c.phone}</div>}
                    </td>
                    <td style={{ padding: "8px 8px", color: "#475569", maxWidth: 110, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.designation || "—"}</td>
                    <td style={{ padding: "8px 8px", color: "#64748b", whiteSpace: "nowrap" }}>{c.location || "—"}</td>
                    <td style={{ padding: "8px 8px", color: "#64748b", fontFamily: "monospace", fontSize: 10 }}>{c.phone || "—"}</td>
                    <td style={{ padding: "8px 8px", color: "#475569", whiteSpace: "nowrap", fontWeight: 600 }}>{fmtMonth(c.offerMonth)}</td>
                    <td style={{ padding: "8px 8px", color: "#64748b", whiteSpace: "nowrap" }}>{fmtD(c.proposedDOJ)}</td>
                    <td style={{ padding: "8px 8px", whiteSpace: "nowrap" }}>{c.actualDOJ ? <span style={{ fontWeight: 700, color: "#16a34a", background: "#dcfce7", padding: "2px 7px", borderRadius: 6, fontSize: 10 }}>{fmtD(c.actualDOJ)}</span> : <span style={{ color: "#cbd5e1", fontSize: 10 }}>—</span>}</td>
                    <td style={{ padding: "8px 8px" }}><span style={{ padding: "2px 7px", borderRadius: 6, fontSize: 10, fontWeight: 700, background: rc.bg, color: rc.color, whiteSpace: "nowrap" }}>{c.resignationAcceptance || "—"}</span></td>
                    <td style={{ padding: "8px 8px", color: "#475569", whiteSpace: "nowrap", fontSize: 11 }}>{c.ownerName || "—"}</td>
                    <td style={{ padding: "8px 8px" }}><Badge status={c.joiningStatus} /></td>
                    <td style={{ padding: "8px 8px", color: "#0f172a", fontWeight: 700, whiteSpace: "nowrap" }}>₹{fmt(c.ctcPerMonth)}</td>
                    <td style={{ padding: "8px 8px" }}><Badge code={c.statusCode} /></td>
                    <td style={{ padding: "8px 8px" }}>
                      <div style={{ display: "flex", gap: 3 }}>
                        <button onClick={() => setModal({ type: "view", data: c })} title="View" style={{ padding: "4px 5px", background: "#f0f9ff", border: "none", borderRadius: 5, cursor: "pointer", color: "#2563eb", display: "flex" }}><Icon n="eye" s={11} /></button>
                        {canEdit && <button onClick={() => setModal({ type: "edit", data: c })} title="Edit" style={{ padding: "4px 5px", background: "#f0fdf4", border: "none", borderRadius: 5, cursor: "pointer", color: "#16a34a", display: "flex" }}><Icon n="edit" s={11} /></button>}
                        {canDel && <button onClick={() => handleDelete(c.id)} title="Delete" style={{ padding: "4px 5px", background: "#fef2f2", border: "none", borderRadius: 5, cursor: "pointer", color: "#dc2626", display: "flex" }}><Icon n="trash" s={11} /></button>}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12, flexWrap: "wrap", gap: 8 }}>
        <span style={{ fontSize: 12, color: "#64748b" }}>Page {page} of {result.pages || 1} · {result.total || 0} total records</span>
        <div style={{ display: "flex", gap: 3 }}>
          {[["«", 1, page <= 1], ["‹ Prev", page - 1, page <= 1], null, ["Next ›", page + 1, page >= result.pages], ["»", result.pages, page >= result.pages]].map((btn, i) => {
            if (!btn) return <span key={i} style={{ padding: "5px 12px", background: "linear-gradient(135deg,#2563eb,#7c3aed)", color: "white", borderRadius: 6, fontSize: 12, fontWeight: 700 }}>{page}</span>;
            const [label, target, disabled] = btn;
            return <button key={i} onClick={() => { setPage(target); load(target, search, filters); }} disabled={disabled} style={{ padding: "5px 10px", border: "1.5px solid #e2e8f0", borderRadius: 6, background: "white", cursor: disabled ? "not-allowed" : "pointer", fontSize: 12, opacity: disabled ? .4 : 1 }}>{label}</button>;
          })}
        </div>
      </div>
    </div>
  );
}