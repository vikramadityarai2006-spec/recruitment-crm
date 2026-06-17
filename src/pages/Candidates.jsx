import { useState, useEffect, useCallback, useRef } from "react";
import { api } from "../api";
import { fmt, fmtD } from "../utils/constants";
import { Badge, Spin, Icon, Modal } from "../components/UI";
import CandidateForm from "../components/CandidateForm";

const fmtMonth = (d) => {
  if (!d) return "—";
  try { return new Date(d).toLocaleDateString("en-IN", { month: "short", year: "numeric" }); }
  catch { return d; }
};

const EMPTY_FILTERS = {
  client: "", location: "", owner: "", status: "", statusCode: "", resign: ""
};

const resColor = (v) => {
  if (!v || v === "—") return { bg: "#f1f5f9", color: "#94a3b8" };
  const l = v.toLowerCase();
  if (l === "done" || l === "accepted" || l === "yes") return { bg: "#dcfce7", color: "#16a34a" };
  if (l === "pending") return { bg: "#fef9c3", color: "#92400e" };
  if (l === "rejected" || l === "no") return { bg: "#fee2e2", color: "#dc2626" };
  return { bg: "#f0f9ff", color: "#0369a1" };
};

// ── View modal card ──────────────────────────────────────────────
function ViewCandidate({ c }) {
  if (!c) return null;
  const Row = ({ l, v, badge, resV, code }) => (
    <div style={{ display: "flex", padding: "10px 0", borderBottom: "1px solid #f8fafc", alignItems: "center" }}>
      <div style={{ width: 160, fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: .4, flexShrink: 0 }}>{l}</div>
      <div style={{ fontSize: 13, color: "#0f172a", fontWeight: 500 }}>
        {badge ? <Badge status={v} /> :
         code ? <Badge code={v} /> :
         resV ? (() => { const rc = resColor(v); return <span style={{ padding: "2px 10px", borderRadius: 8, fontSize: 12, fontWeight: 700, background: rc.bg, color: rc.color }}>{v || "—"}</span>; })() :
         (v || "—")}
      </div>
    </div>
  );
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20, paddingBottom: 20, borderBottom: "1px solid #f1f5f9" }}>
        <div style={{ width: 52, height: 52, borderRadius: 13, background: "linear-gradient(135deg,#2563eb22,#7c3aed22)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, fontWeight: 800, color: "#2563eb" }}>
          {c.candidateName?.[0]?.toUpperCase()}
        </div>
        <div>
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: "#0f172a" }}>{c.candidateName}</h3>
          <p style={{ margin: "2px 0 0", color: "#64748b", fontSize: 12 }}>{c.designation} · {c.clientName}</p>
        </div>
      </div>
      <Row l="Client" v={c.clientName} />
      <Row l="Designation" v={c.designation} />
      <Row l="Location" v={c.location} />
      <Row l="Phone" v={c.phone} />
      <Row l="Offer Month" v={fmtMonth(c.offerMonth)} />
      <Row l="Proposed DOJ" v={fmtD(c.proposedDOJ)} />
      <Row l="Actual DOJ" v={fmtD(c.actualDOJ)} />
      <Row l="Resignation" v={c.resignationAcceptance} resV />
      <Row l="Owner" v={c.ownerName} />
      <Row l="Joining Status" v={c.joiningStatus} badge />
      <Row l="CTC / Month" v={c.ctcPerMonth ? `₹${fmt(c.ctcPerMonth)}` : "—"} />
      <Row l="Status Code" v={c.statusCode} code />
      {c.notes && <Row l="Notes" v={c.notes} />}
    </div>
  );
}

// ── Main page ────────────────────────────────────────────────────
export default function Candidates({ masters, user, onDataChange }) {
  const [result, setResult] = useState({ candidates: [], total: 0, pages: 1 });
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showF, setShowF] = useState(false);
  const [modal, setModal] = useState(null); // { type: "view"|"add"|"edit", data? }
  const [saving, setSaving] = useState(false);
  const searchRef = useRef();
  const PER = 25;

  const load = useCallback(async (p = 1, s = "", f = {}) => {
    setLoading(true);
    const params = { page: p, limit: PER };
    if (s)          params.search    = s;
    if (f.client)   params.client    = f.client;
    if (f.location) params.location  = f.location;
    if (f.owner)    params.owner     = f.owner;
    if (f.status)   params.status    = f.status;
    if (f.statusCode) params.statusCode = f.statusCode;
    if (f.resign)   params.resign    = f.resign;
    try {
      const res = await api.getCandidates(params);
      setResult(res || { candidates: [], total: 0, pages: 1 });
    } catch (e) { console.error(e); }
    setLoading(false);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => { load(1, search, filters); setPage(1); }, 350);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => { load(page, search, filters); }, [page, filters]);

  const setFilter = (k, v) => { setFilters(f => ({ ...f, [k]: v })); setPage(1); };
  const clearFilters = () => { setFilters(EMPTY_FILTERS); setPage(1); };
  const activeF = Object.values(filters).filter(Boolean).length;

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
      const r = modal.type === "add"
        ? await api.createCandidate(form)
        : await api.updateCandidate(modal.data.id, form);
      if (r.error) { alert("Error: " + r.error); setSaving(false); return; }
      setModal(null);
      load(page, search, filters);
      onDataChange?.();
    } catch (e) { alert("Save failed: " + e.message); }
    setSaving(false);
  };

  const exportCSV = () => {
    const cols = ["SR","Client","Designation","Location","Candidate","Phone","Offer Month","Proposed DOJ","Actual DOJ","Resignation","Owner","Status","CTC/Month","Code","Notes"];
    const rows = (result.candidates || []).map((c, i) => [
      result.total - ((page - 1) * PER) - i,
      c.clientName, c.designation, c.location, c.candidateName, c.phone,
      fmtMonth(c.offerMonth), fmtD(c.proposedDOJ), fmtD(c.actualDOJ),
      c.resignationAcceptance, c.ownerName, c.joiningStatus, c.ctcPerMonth, c.statusCode, c.notes
    ]);
    const csv = [cols, ...rows].map(r => r.map(v => `"${(v || "").toString().replace(/"/g, '""')}"`).join(",")).join("\n");
    const a = document.createElement("a");
    a.href = "data:text/csv;charset=utf-8," + encodeURIComponent(csv);
    a.download = "candidates.csv";
    a.click();
  };

  const canEdit = user.role !== "viewer";
  const canDel  = user.role === "admin";

  const getOpts = (key) => {
    if (key === "client")     return masters.clients || [];
    if (key === "owner")      return masters.owners || [];
    if (key === "status")     return masters.joiningStatus || [];
    if (key === "statusCode") return (masters.statusCodes || []).map(s => s.code || s);
    if (key === "resign")     return ["Done", "Pending", "Accepted", "Rejected"];
    return [];
  };

  // ── Styles helpers ────────────────────────────────────────────
  const TH = (w) => ({ padding: "10px 10px", textAlign: "left", fontWeight: 700, color: "#475569", fontSize: 10, textTransform: "uppercase", letterSpacing: .6, minWidth: w, whiteSpace: "nowrap", borderBottom: "2px solid #e2e8f0" });
  const TD = (extra = {}) => ({ padding: "9px 10px", fontSize: 12, ...extra });

  return (
    <div style={{ fontFamily: "'Inter',system-ui,sans-serif" }}>

      {/* ── Header ── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18, flexWrap: "wrap", gap: 10 }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: "#0f172a", margin: 0, letterSpacing: -0.3 }}>Candidates</h2>
          <p style={{ color: "#64748b", margin: "3px 0 0", fontSize: 13 }}>
            {loading ? "Loading…" : `${result.total} records`}
          </p>
        </div>
        <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
          <button onClick={() => load(page, search, filters)}
            style={{ display: "flex", alignItems: "center", gap: 5, padding: "8px 13px", background: "white", border: "1.5px solid #e2e8f0", borderRadius: 8, fontWeight: 600, cursor: "pointer", fontSize: 12, color: "#374151" }}>
            <Icon n="refresh" s={13} /> Refresh
          </button>
          <button onClick={exportCSV}
            style={{ display: "flex", alignItems: "center", gap: 5, padding: "8px 13px", background: "white", border: "1.5px solid #e2e8f0", borderRadius: 8, fontWeight: 600, cursor: "pointer", fontSize: 12, color: "#374151" }}>
            <Icon n="dl" s={13} /> Export CSV
          </button>
          {canEdit && (
            <button onClick={() => setModal({ type: "add" })}
              style={{ display: "flex", alignItems: "center", gap: 5, padding: "8px 15px", background: "linear-gradient(135deg,#2563eb,#7c3aed)", color: "white", border: "none", borderRadius: 8, fontWeight: 700, cursor: "pointer", fontSize: 12, boxShadow: "0 2px 8px #2563eb44" }}>
              <Icon n="plus" s={13} /> Add Candidate
            </button>
          )}
        </div>
      </div>

      {/* ── Search + Filter bar ── */}
      <div style={{ background: "white", borderRadius: 12, padding: "12px 14px", marginBottom: 12, boxShadow: "0 1px 4px rgba(0,0,0,.06)", border: "1px solid #f1f5f9" }}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {/* Search */}
          <div style={{ flex: 1, minWidth: 200, display: "flex", alignItems: "center", gap: 8, background: "#f8fafc", borderRadius: 8, padding: "7px 11px", border: "1.5px solid #e2e8f0" }}>
            <Icon n="search" s={13} />
            <input ref={searchRef} value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search name, client, phone, designation…"
              style={{ border: "none", background: "none", outline: "none", fontSize: 13, width: "100%", color: "#0f172a" }} />
            {search && (
              <button onClick={() => { setSearch(""); }} style={{ border: "none", background: "none", cursor: "pointer", color: "#94a3b8", display: "flex", padding: 0 }}>
                <Icon n="x" s={12} />
              </button>
            )}
          </div>
          {/* Filter toggle */}
          <button onClick={() => setShowF(f => !f)}
            style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 15px", background: showF ? "linear-gradient(135deg,#2563eb,#7c3aed)" : activeF > 0 ? "#eff6ff" : "#f8fafc", border: `1.5px solid ${showF ? "transparent" : activeF > 0 ? "#bfdbfe" : "#e2e8f0"}`, borderRadius: 8, cursor: "pointer", fontSize: 12, fontWeight: 700, color: showF ? "white" : activeF > 0 ? "#1d4ed8" : "#374151", transition: "all .15s" }}>
            <Icon n="filter" s={12} /> Filters
            {activeF > 0 && <span style={{ background: showF ? "rgba(255,255,255,.3)" : "#2563eb", color: "white", borderRadius: 10, padding: "1px 7px", fontSize: 10, fontWeight: 800 }}>{activeF}</span>}
          </button>
        </div>

        {/* Filter panel */}
        {showF && (
          <div style={{ marginTop: 14, borderTop: "1px solid #f1f5f9", paddingTop: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <span style={{ fontSize: 11, fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: .5 }}>Filter by</span>
              {activeF > 0 && (
                <button onClick={clearFilters} style={{ padding: "4px 10px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 6, color: "#dc2626", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>
                  ✕ Clear all
                </button>
              )}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(150px,1fr))", gap: 10 }}>
              {[
                { label: "Client",      key: "client",     type: "select" },
                { label: "Location",    key: "location",   type: "text"   },
                { label: "Owner",       key: "owner",      type: "select" },
                { label: "Status",      key: "status",     type: "select" },
                { label: "Code",        key: "statusCode", type: "select" },
                { label: "Resignation", key: "resign",     type: "select" },
              ].map(({ label, key, type }) => {
                const val = filters[key];
                const active = !!val;
                const opts = getOpts(key);
                return (
                  <div key={key}>
                    <label style={{ display: "block", fontSize: 10, fontWeight: 700, color: active ? "#2563eb" : "#64748b", marginBottom: 4, textTransform: "uppercase", letterSpacing: .4 }}>{label}</label>
                    {type === "select" ? (
                      <select value={val} onChange={e => setFilter(key, e.target.value)}
                        style={{ width: "100%", padding: "7px 10px", borderRadius: 7, border: `1.5px solid ${active ? "#93c5fd" : "#e2e8f0"}`, fontSize: 12, background: active ? "#eff6ff" : "white", color: active ? "#1d4ed8" : "#374151", outline: "none", fontWeight: active ? 700 : 400 }}>
                        <option value="">All</option>
                        {opts.map(o => <option key={o} value={o}>{o}</option>)}
                      </select>
                    ) : (
                      <input type="text" value={val} onChange={e => setFilter(key, e.target.value)} placeholder={`Search…`}
                        style={{ width: "100%", padding: "7px 10px", borderRadius: 7, boxSizing: "border-box", border: `1.5px solid ${active ? "#93c5fd" : "#e2e8f0"}`, fontSize: 12, background: active ? "#eff6ff" : "white", color: active ? "#1d4ed8" : "#374151", outline: "none", fontWeight: active ? 700 : 400 }} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Active filter chips */}
      {activeF > 0 && (
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
          {Object.entries(filters).filter(([, v]) => v).map(([k, v]) => (
            <span key={k} style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 10px 3px 11px", background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 20, fontSize: 11, fontWeight: 600, color: "#1d4ed8" }}>
              <span style={{ color: "#93c5fd", fontWeight: 400, textTransform: "capitalize" }}>{k}:</span> {v}
              <button onClick={() => setFilter(k, "")} style={{ border: "none", background: "none", cursor: "pointer", color: "#93c5fd", padding: "0 0 0 2px", fontSize: 14, lineHeight: 1, display: "flex" }}>×</button>
            </span>
          ))}
        </div>
      )}

      {/* ── Table ── */}
      <div style={{ background: "white", borderRadius: 12, boxShadow: "0 1px 4px rgba(0,0,0,.06)", border: "1px solid #f1f5f9", overflow: "auto" }}>
        {loading ? (
          <div style={{ padding: 60, textAlign: "center" }}>
            <Spin /><div style={{ marginTop: 12, color: "#94a3b8", fontSize: 13 }}>Loading candidates…</div>
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead style={{ background: "linear-gradient(to right,#f8fafc,#f1f5f9)" }}>
              <tr>
                <th style={TH(40)}>#</th>
                <th style={TH(110)}>Client</th>
                <th style={TH(130)}>Candidate</th>
                <th style={TH(120)}>Designation</th>
                <th style={TH(80)}>Location</th>
                <th style={TH(100)}>Phone</th>
                <th style={TH(85)}>Offer Mth</th>
                <th style={TH(90)}>Prop DOJ</th>
                <th style={TH(90)}>Actual DOJ</th>
                <th style={TH(80)}>Resign</th>
                <th style={TH(90)}>Owner</th>
                <th style={TH(80)}>Status</th>
                <th style={TH(85)}>CTC/Mth</th>
                <th style={TH(65)}>Code</th>
                <th style={TH(75)}></th>
              </tr>
            </thead>
            <tbody>
              {!(result.candidates || []).length && (
                <tr><td colSpan={15} style={{ padding: 50, textAlign: "center", color: "#94a3b8", fontSize: 13 }}>No candidates found.</td></tr>
              )}
              {(result.candidates || []).map((c, i) => {
                const srNo = result.total - ((page - 1) * PER) - i;
                const rc = resColor(c.resignationAcceptance);
                const isEven = i % 2 === 0;
                return (
                  <tr key={c.id}
                    style={{ borderBottom: "1px solid #f1f5f9", background: isEven ? "white" : "#fcfcfd", transition: "background .1s" }}
                    onMouseEnter={e => e.currentTarget.style.background = "#f0f9ff"}
                    onMouseLeave={e => e.currentTarget.style.background = isEven ? "white" : "#fcfcfd"}>

                    <td style={TD({ color: "#cbd5e1", fontWeight: 700, fontSize: 10 })}>{srNo}</td>

                    <td style={TD({ fontWeight: 700, color: "#1e293b", maxWidth: 110, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" })}>
                      {c.clientName || "—"}
                    </td>

                    <td style={TD({ maxWidth: 130 })}>
                      <div style={{ fontWeight: 700, color: "#0f172a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.candidateName}</div>
                    </td>

                    <td style={TD({ color: "#475569", maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" })}>
                      {c.designation || "—"}
                    </td>

                    <td style={TD({ color: "#64748b", whiteSpace: "nowrap" })}>{c.location || "—"}</td>

                    <td style={TD({ color: "#475569", fontFamily: "monospace", fontSize: 11, whiteSpace: "nowrap" })}>
                      {c.phone || "—"}
                    </td>

                    <td style={TD({ color: "#475569", whiteSpace: "nowrap", fontWeight: 600 })}>{fmtMonth(c.offerMonth)}</td>

                    <td style={TD({ color: "#64748b", whiteSpace: "nowrap", fontSize: 11 })}>{fmtD(c.proposedDOJ)}</td>

                    <td style={TD({ whiteSpace: "nowrap" })}>
                      {c.actualDOJ
                        ? <span style={{ fontWeight: 700, color: "#16a34a", background: "#dcfce7", padding: "2px 7px", borderRadius: 6, fontSize: 10 }}>{fmtD(c.actualDOJ)}</span>
                        : <span style={{ color: "#cbd5e1", fontSize: 10 }}>—</span>}
                    </td>

                    <td style={TD()}>
                      <span style={{ padding: "2px 8px", borderRadius: 6, fontSize: 10, fontWeight: 700, background: rc.bg, color: rc.color, whiteSpace: "nowrap" }}>
                        {c.resignationAcceptance || "—"}
                      </span>
                    </td>

                    <td style={TD({ color: "#475569", whiteSpace: "nowrap" })}>{c.ownerName || "—"}</td>

                    <td style={TD()}><Badge status={c.joiningStatus} /></td>

                    <td style={TD({ fontWeight: 700, color: "#0f172a", whiteSpace: "nowrap" })}>
                      {c.ctcPerMonth ? `₹${fmt(c.ctcPerMonth)}` : "—"}
                    </td>

                    <td style={TD()}><Badge code={c.statusCode} /></td>

                    <td style={TD()}>
                      <div style={{ display: "flex", gap: 3 }}>
                        <button onClick={() => setModal({ type: "view", data: c })} title="View"
                          style={{ padding: "4px 6px", background: "#f0f9ff", border: "none", borderRadius: 5, cursor: "pointer", color: "#2563eb", display: "flex" }}>
                          <Icon n="eye" s={11} />
                        </button>
                        {canEdit && (
                          <button onClick={() => setModal({ type: "edit", data: c })} title="Edit"
                            style={{ padding: "4px 6px", background: "#f0fdf4", border: "none", borderRadius: 5, cursor: "pointer", color: "#16a34a", display: "flex" }}>
                            <Icon n="edit" s={11} />
                          </button>
                        )}
                        {canDel && (
                          <button onClick={() => handleDelete(c.id)} title="Delete"
                            style={{ padding: "4px 6px", background: "#fef2f2", border: "none", borderRadius: 5, cursor: "pointer", color: "#dc2626", display: "flex" }}>
                            <Icon n="trash" s={11} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Pagination ── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 14, flexWrap: "wrap", gap: 8 }}>
        <span style={{ fontSize: 12, color: "#64748b" }}>
          Page <strong>{page}</strong> of <strong>{result.pages || 1}</strong> · {result.total || 0} total
        </span>
        <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
          <button onClick={() => { setPage(1); }} disabled={page <= 1}
            style={{ padding: "5px 10px", border: "1.5px solid #e2e8f0", borderRadius: 7, background: "white", cursor: page <= 1 ? "not-allowed" : "pointer", fontSize: 12, opacity: page <= 1 ? .4 : 1, fontWeight: 600 }}>«</button>
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1}
            style={{ padding: "5px 12px", border: "1.5px solid #e2e8f0", borderRadius: 7, background: "white", cursor: page <= 1 ? "not-allowed" : "pointer", fontSize: 12, opacity: page <= 1 ? .4 : 1, fontWeight: 600 }}>‹ Prev</button>
          <span style={{ padding: "5px 14px", background: "linear-gradient(135deg,#2563eb,#7c3aed)", color: "white", borderRadius: 7, fontSize: 12, fontWeight: 700 }}>{page}</span>
          <button onClick={() => setPage(p => Math.min(result.pages || 1, p + 1))} disabled={page >= (result.pages || 1)}
            style={{ padding: "5px 12px", border: "1.5px solid #e2e8f0", borderRadius: 7, background: "white", cursor: page >= (result.pages || 1) ? "not-allowed" : "pointer", fontSize: 12, opacity: page >= (result.pages || 1) ? .4 : 1, fontWeight: 600 }}>Next ›</button>
          <button onClick={() => setPage(result.pages || 1)} disabled={page >= (result.pages || 1)}
            style={{ padding: "5px 10px", border: "1.5px solid #e2e8f0", borderRadius: 7, background: "white", cursor: page >= (result.pages || 1) ? "not-allowed" : "pointer", fontSize: 12, opacity: page >= (result.pages || 1) ? .4 : 1, fontWeight: 600 }}>»</button>
        </div>
      </div>

      {/* ── Modals ── */}
      <Modal open={!!modal} onClose={() => !saving && setModal(null)}
        title={modal?.type === "view" ? "Candidate Details" : modal?.type === "add" ? "Add New Candidate" : "Edit Candidate"}
        wide={modal?.type !== "view"}>
        {modal?.type === "view" && <ViewCandidate c={modal.data} />}
        {(modal?.type === "add" || modal?.type === "edit") && (
          <CandidateForm
            initial={modal.data}
            masters={masters}
            onSave={handleSave}
            onCancel={() => setModal(null)}
            saving={saving}
          />
        )}
      </Modal>
    </div>
  );
}
