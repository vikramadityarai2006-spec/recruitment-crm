import { useState, useEffect, useCallback, useRef } from "react";
import { api } from "../api";
import { fmt, fmtD } from "../utils/constants";
import { Badge, Spin, Icon, Modal } from "../components/UI";
import CandidateForm from "../components/CandidateForm";

function ViewCandidate({ c }) {
  if (!c) return null;
  const R = (l, v) => (
    <div style={{ display: "flex", borderBottom: "1px solid #f8fafc", padding: "9px 0" }}>
      <div style={{ width: 170, fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: .4, flexShrink: 0 }}>{l}</div>
      <div style={{ fontSize: 13, color: "#0f172a", fontWeight: 500 }}>{v || "—"}</div>
    </div>
  );
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 18, paddingBottom: 18, borderBottom: "1px solid #f1f5f9" }}>
        <div style={{ width: 50, height: 50, borderRadius: 12, background: "linear-gradient(135deg,#2563eb22,#7c3aed22)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: 800, color: "#2563eb", flexShrink: 0 }}>
          {c.candidateName?.[0]?.toUpperCase()}
        </div>
        <div>
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: "#0f172a" }}>{c.candidateName}</h3>
          <p style={{ margin: "2px 0 0", color: "#64748b", fontSize: 12 }}>{c.designation} · {c.clientName}</p>
          <div style={{ display: "flex", gap: 5, marginTop: 5 }}><Badge status={c.joiningStatus} /><Badge code={c.statusCode} /></div>
        </div>
      </div>
      {R("Client", c.clientName)}{R("Designation", c.designation)}{R("Location", c.location)}
      {R("Phone", c.phone)}{R("Offer Month", fmtD(c.offerMonth))}{R("Proposed DOJ", fmtD(c.proposedDOJ))}
      {R("Actual DOJ", fmtD(c.actualDOJ))}{R("Resignation", c.resignationAcceptance)}{R("Owner", c.ownerName)}
      {R("CTC Per Month", c.ctcPerMonth ? `₹${fmt(c.ctcPerMonth)}` : "—")}{R("Notes", c.notes)}
    </div>
  );
}

export default function Candidates({ masters, user }) {
  const [result, setResult] = useState({ candidates: [], total: 0, pages: 1 });
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({ client: "", owner: "", status: "", statusCode: "", location: "" });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showF, setShowF] = useState(false);
  const [modal, setModal] = useState(null);
  const [saving, setSaving] = useState(false);
  const searchRef = useRef();
  const PER = 20;

  const load = useCallback(async (p = 1, s = "", f = {}) => {
    setLoading(true);
    const params = { page: p, limit: PER, sortBy: "id", sortDir: "desc" };
    if (s) params.search = s;
    if (f.client) params.client = f.client;
    if (f.owner) params.owner = f.owner;
    if (f.status) params.status = f.status;
    if (f.statusCode) params.statusCode = f.statusCode;
    if (f.location) params.location = f.location;
    try {
      const res = await api.getCandidates(params);
      setResult(res || { candidates: [], total: 0, pages: 1 });
    } catch (e) { console.error(e); }
    setLoading(false);
  }, []);

  // Debounced search
  useEffect(() => {
    const t = setTimeout(() => { load(1, search, filters); setPage(1); }, 400);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => { load(page, search, filters); }, [page, filters]);

  const setFilter = (k, v) => {
    const nf = { ...filters, [k]: v };
    setFilters(nf); setPage(1); load(1, search, nf);
  };

  const clearFilters = () => {
    const nf = { client: "", owner: "", status: "", statusCode: "", location: "" };
    setFilters(nf); setPage(1); load(1, search, nf);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this candidate?")) return;
    try {
      const r = await api.deleteCandidate(id);
      if (r.error) { alert("Error: " + r.error); return; }
      load(page, search, filters);
    } catch (e) { alert("Delete failed: " + e.message); }
  };

  const handleSave = async (form) => {
    setSaving(true);
    try {
      const r = modal.type === "add" ? await api.createCandidate(form) : await api.updateCandidate(modal.data.id, form);
      if (r.error) { alert("Error: " + r.error); setSaving(false); return; }
      setModal(null); load(page, search, filters);
    } catch (e) { alert("Save failed: " + e.message); }
    setSaving(false);
  };

  const exportCSV = () => {
    const cols = ["ID","Client","Designation","Location","Candidate","Phone","Offer Month","Proposed DOJ","Actual DOJ","Resignation","Owner","Status","CTC","Code","Notes"];
    const rows = (result.candidates || []).map(c => [c.id,c.clientName,c.designation,c.location,c.candidateName,c.phone,c.offerMonth,c.proposedDOJ,c.actualDOJ,c.resignationAcceptance,c.ownerName,c.joiningStatus,c.ctcPerMonth,c.statusCode,c.notes]);
    const csv = [cols, ...rows].map(r => r.map(v => `"${v || ""}"`).join(",")).join("\n");
    const a = document.createElement("a"); a.href = "data:text/csv;charset=utf-8," + encodeURIComponent(csv); a.download = "candidates.csv"; a.click();
  };

  const activeF = Object.values(filters).filter(Boolean).length;
  const canEdit = user.role !== "viewer";
  const canDel = user.role === "admin";

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18, flexWrap: "wrap", gap: 10 }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: "#0f172a", margin: 0 }}>Candidates</h2>
          <p style={{ color: "#64748b", margin: "3px 0 0", fontSize: 13 }}>{result.total} records in database</p>
        </div>
        <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
          <button onClick={() => load(page, search, filters)} style={{ display: "flex", alignItems: "center", gap: 5, padding: "8px 12px", background: "#f1f5f9", border: "none", borderRadius: 8, fontWeight: 600, cursor: "pointer", fontSize: 12, color: "#374151" }}>
            <Icon n="refresh" s={13} /> Refresh
          </button>
          {canEdit && <button onClick={() => setModal({ type: "add" })} style={{ display: "flex", alignItems: "center", gap: 5, padding: "8px 14px", background: "linear-gradient(135deg,#2563eb,#7c3aed)", color: "white", border: "none", borderRadius: 8, fontWeight: 600, cursor: "pointer", fontSize: 12 }}>
            <Icon n="plus" s={13} /> Add Candidate
          </button>}
          <button onClick={exportCSV} style={{ display: "flex", alignItems: "center", gap: 5, padding: "8px 12px", background: "#f1f5f9", border: "none", borderRadius: 8, fontWeight: 600, cursor: "pointer", fontSize: 12, color: "#374151" }}>
            <Icon n="dl" s={13} /> Export CSV
          </button>
        </div>
      </div>

      {/* Search & Filters */}
      <div style={{ background: "white", borderRadius: 10, padding: 12, marginBottom: 14, boxShadow: "0 1px 3px rgba(0,0,0,.06)", border: "1px solid #f1f5f9" }}>
        <div style={{ display: "flex", gap: 8, marginBottom: showF ? 10 : 0, flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 180, display: "flex", alignItems: "center", gap: 7, background: "#f8fafc", borderRadius: 7, padding: "7px 10px", border: "1.5px solid #e2e8f0" }}>
            <Icon n="search" s={13} />
            <input ref={searchRef} value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name, client, phone…" style={{ border: "none", background: "none", outline: "none", fontSize: 13, width: "100%" }} />
            {search && <button onClick={() => { setSearch(""); load(1, "", filters); }} style={{ border: "none", background: "none", cursor: "pointer", color: "#94a3b8", display: "flex", padding: 0 }}><Icon n="x" s={11} /></button>}
          </div>
          <button onClick={() => setShowF(f => !f)} style={{ display: "flex", alignItems: "center", gap: 5, padding: "7px 12px", background: activeF > 0 ? "#eff6ff" : "#f8fafc", border: `1.5px solid ${activeF > 0 ? "#bfdbfe" : "#e2e8f0"}`, borderRadius: 7, cursor: "pointer", fontSize: 12, fontWeight: 600, color: activeF > 0 ? "#1d4ed8" : "#374151" }}>
            <Icon n="filter" s={12} /> Filters {activeF > 0 && `(${activeF})`}
          </button>
        </div>
        {showF && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(140px,1fr))", gap: 7 }}>
            {[["Client", "client", masters.clients || []], ["Owner", "owner", masters.owners || []], ["Status", "status", masters.joiningStatus || []], ["Code", "statusCode", (masters.statusCodes || []).map(s => s.code || s)]].map(([l, k, opts]) => (
              <div key={k}>
                <label style={{ fontSize: 10, fontWeight: 600, color: "#64748b", display: "block", marginBottom: 2 }}>{l}</label>
                <select value={filters[k]} onChange={e => setFilter(k, e.target.value)} style={{ width: "100%", padding: "6px 8px", borderRadius: 6, border: "1.5px solid #e2e8f0", fontSize: 12, background: "white", outline: "none" }}>
                  <option value="">All</option>
                  {opts.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
            ))}
            <div>
              <label style={{ fontSize: 10, fontWeight: 600, color: "#64748b", display: "block", marginBottom: 2 }}>Location</label>
              <input value={filters.location} onChange={e => setFilter("location", e.target.value)} placeholder="City…" style={{ width: "100%", padding: "6px 8px", borderRadius: 6, border: "1.5px solid #e2e8f0", fontSize: 12, boxSizing: "border-box", outline: "none" }} />
            </div>
            {activeF > 0 && (
              <div style={{ display: "flex", alignItems: "flex-end" }}>
                <button onClick={clearFilters} style={{ width: "100%", padding: "6px 8px", borderRadius: 6, border: "1.5px solid #fecaca", background: "#fef2f2", color: "#dc2626", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Clear All</button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Table */}
      <div style={{ background: "white", borderRadius: 10, boxShadow: "0 1px 3px rgba(0,0,0,.06)", border: "1px solid #f1f5f9", overflow: "auto" }}>
        {loading ? (
          <div style={{ padding: 50, textAlign: "center" }}><Spin /><div style={{ marginTop: 10, color: "#94a3b8", fontSize: 13 }}>Loading…</div></div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead>
              <tr style={{ background: "#f8fafc", borderBottom: "1.5px solid #e2e8f0" }}>
                {[["#",40],["Client",120],["Candidate",140],["Position",120],["Location",80],["Phone",100],["Offer Mth",95],["Prop DOJ",95],["Owner",100],["Status",90],["CTC",85],["Code",65],["",85]].map(([l, w]) => (
                  <th key={l} style={{ padding: "9px 10px", textAlign: "left", fontWeight: 700, color: "#475569", fontSize: 10, textTransform: "uppercase", letterSpacing: .4, minWidth: w, whiteSpace: "nowrap" }}>{l}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {!(result.candidates || []).length && <tr><td colSpan={13} style={{ padding: 40, textAlign: "center", color: "#94a3b8" }}>No candidates found.</td></tr>}
              {(result.candidates || []).map((c, i) => (
                <tr key={c.id} style={{ borderBottom: "1px solid #f8fafc", background: i % 2 ? "#fcfcfd" : "white", transition: "background .1s" }}
                  onMouseEnter={e => e.currentTarget.style.background = "#f0f9ff"}
                  onMouseLeave={e => e.currentTarget.style.background = i % 2 ? "#fcfcfd" : "white"}>
                  <td style={{ padding: "9px 10px", color: "#94a3b8", fontWeight: 600, fontSize: 11 }}>{c.id}</td>
                  <td style={{ padding: "9px 10px", fontWeight: 600, color: "#1e293b", maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.clientName || "—"}</td>
                  <td style={{ padding: "9px 10px" }}>
                    <div style={{ fontWeight: 600, color: "#0f172a", maxWidth: 130, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.candidateName}</div>
                    {c.phone && <div style={{ fontSize: 10, color: "#94a3b8" }}>{c.phone}</div>}
                  </td>
                  <td style={{ padding: "9px 10px", color: "#475569", maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.designation || "—"}</td>
                  <td style={{ padding: "9px 10px", color: "#475569", whiteSpace: "nowrap" }}>{c.location || "—"}</td>
                  <td style={{ padding: "9px 10px", color: "#64748b", fontFamily: "monospace", fontSize: 11 }}>{c.phone || "—"}</td>
                  <td style={{ padding: "9px 10px", color: "#64748b", whiteSpace: "nowrap" }}>{fmtD(c.offerMonth)}</td>
                  <td style={{ padding: "9px 10px", color: "#64748b", whiteSpace: "nowrap" }}>{fmtD(c.proposedDOJ)}</td>
                  <td style={{ padding: "9px 10px", color: "#475569", whiteSpace: "nowrap" }}>{c.ownerName || "—"}</td>
                  <td style={{ padding: "9px 10px" }}><Badge status={c.joiningStatus} /></td>
                  <td style={{ padding: "9px 10px", color: "#0f172a", fontWeight: 600, whiteSpace: "nowrap" }}>₹{fmt(c.ctcPerMonth)}</td>
                  <td style={{ padding: "9px 10px" }}><Badge code={c.statusCode} /></td>
                  <td style={{ padding: "9px 10px" }}>
                    <div style={{ display: "flex", gap: 3 }}>
                      <button onClick={() => setModal({ type: "view", data: c })} title="View" style={{ padding: 4, background: "#f0f9ff", border: "none", borderRadius: 5, cursor: "pointer", color: "#2563eb", display: "flex" }}><Icon n="eye" s={12} /></button>
                      {canEdit && <button onClick={() => setModal({ type: "edit", data: c })} title="Edit" style={{ padding: 4, background: "#f0fdf4", border: "none", borderRadius: 5, cursor: "pointer", color: "#16a34a", display: "flex" }}><Icon n="edit" s={12} /></button>}
                      {canDel && <button onClick={() => handleDelete(c.id)} title="Delete" style={{ padding: 4, background: "#fef2f2", border: "none", borderRadius: 5, cursor: "pointer", color: "#dc2626", display: "flex" }}><Icon n="trash" s={12} /></button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12, flexWrap: "wrap", gap: 8 }}>
        <span style={{ fontSize: 12, color: "#64748b" }}>Page {page} of {result.pages || 1} · {result.total || 0} total</span>
        <div style={{ display: "flex", gap: 3 }}>
          {[["«", 1, page <= 1], ["‹ Prev", page - 1, page <= 1], null, ["Next ›", page + 1, page >= result.pages], ["»", result.pages, page >= result.pages]].map((btn, i) => {
            if (!btn) return <span key={i} style={{ padding: "5px 12px", background: "#2563eb", color: "white", borderRadius: 6, fontSize: 12, fontWeight: 700 }}>{page}</span>;
            const [label, target, disabled] = btn;
            return <button key={i} onClick={() => { setPage(target); load(target, search, filters); }} disabled={disabled}
              style={{ padding: "5px 10px", border: "1.5px solid #e2e8f0", borderRadius: 6, background: "white", cursor: disabled ? "not-allowed" : "pointer", fontSize: 12, opacity: disabled ? .4 : 1 }}>{label}</button>;
          })}
        </div>
      </div>

      {/* Modals */}
      <Modal open={modal?.type === "add"} onClose={() => setModal(null)} title="Add New Candidate" wide>
        <CandidateForm masters={masters} onSave={handleSave} onCancel={() => setModal(null)} saving={saving} />
      </Modal>
      <Modal open={modal?.type === "edit"} onClose={() => setModal(null)} title="Edit Candidate" wide>
        <CandidateForm initial={modal?.data} masters={masters} onSave={handleSave} onCancel={() => setModal(null)} saving={saving} />
      </Modal>
      <Modal open={modal?.type === "view"} onClose={() => setModal(null)} title="Candidate Profile">
        <ViewCandidate c={modal?.data} />
      </Modal>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
