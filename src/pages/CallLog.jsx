import { useState, useEffect, useCallback } from "react";
import { api } from "../api";
import { fmtD } from "../utils/constants";
import { ContactButtons } from "../components/UI";

const M = ({ n, fill = 0, className = "" }) => (
  <span className={`material-symbols-outlined ${className}`} style={{ fontVariationSettings: `'FILL' ${fill}` }}>{n}</span>
);

// The three tracking flags. Single source of truth for label + colour.
const FLAGS = {
  red:    { label: "Left the company",       short: "Left",    dot: "bg-error",     chip: "bg-red-100 text-error",           icon: "logout" },
  yellow: { label: "Payment yet to receive", short: "Pending", dot: "bg-secondary", chip: "bg-orange-100 text-secondary",    icon: "schedule" },
  green:  { label: "Payment received",       short: "Paid",    dot: "bg-green-600", chip: "bg-green-100 text-green-700",     icon: "paid" },
};
const FLAG_KEYS = ["red", "yellow", "green"];

const fmtWhen = (d) => {
  if (!d) return "Never";
  const diff = Math.floor((Date.now() - new Date(d)) / 86400000);
  if (diff <= 0) return "Today";
  if (diff === 1) return "Yesterday";
  if (diff < 30) return `${diff}d ago`;
  return fmtD(d);
};

// ─── CALL PANEL (slide-over) ──────────────────────────────────────────────────
function CallPanel({ candidate, canEdit, onClose, onSaved }) {
  const [flag, setFlag] = useState(candidate.callFlag || "");
  const [notes, setNotes] = useState("");
  const [history, setHistory] = useState(null);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const [visible, setVisible] = useState(false);

  useEffect(() => { setTimeout(() => setVisible(true), 10); }, []);
  useEffect(() => {
    api.getCallHistory(candidate.id)
      .then(h => setHistory(Array.isArray(h) ? h : []))
      .catch(() => setHistory([]));
  }, [candidate.id]);

  const close = () => { setVisible(false); setTimeout(onClose, 250); };

  const save = async () => {
    setErr("");
    if (!flag && !notes.trim()) { setErr("Add a note or pick a flag first."); return; }
    setSaving(true);
    try {
      const r = await api.logCall({ candidateId: candidate.id, flag: flag || undefined, notes });
      if (r.error) setErr(r.error);
      else {
        setNotes("");
        const h = await api.getCallHistory(candidate.id);
        setHistory(Array.isArray(h) ? h : []);
        onSaved(candidate.id, flag || candidate.callFlag);
      }
    } catch (e) { setErr(e.message); }
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-[200]">
      <div onClick={close} className="absolute inset-0 bg-primary/40 backdrop-blur-sm"/>
      <div className={`absolute top-0 right-0 h-full w-full max-w-lg bg-white shadow-2xl flex flex-col transition-transform duration-300 ${visible ? "translate-x-0" : "translate-x-full"}`}>

        {/* Header */}
        <div className="bg-primary p-7 text-white">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50">Call Log</p>
              <h3 className="text-2xl font-black tracking-tight truncate">{candidate.candidateName}</h3>
              <p className="text-white/60 text-xs font-medium mt-1 truncate">
                {candidate.clientName || "—"}{candidate.designation ? ` · ${candidate.designation}` : ""}
              </p>
              <p className="text-white/40 text-[11px] font-medium mt-1">
                Joined {fmtD(candidate.actualDOJ)}{candidate.ownerName ? ` · Owner: ${candidate.ownerName}` : ""}
              </p>
            </div>
            <button onClick={close} className="w-9 h-9 shrink-0 flex items-center justify-center bg-white/10 rounded-full hover:bg-white/20 transition-all">
              <M n="close"/>
            </button>
          </div>
          <div className="mt-5">
            <ContactButtons phone={candidate.phone} email={candidate.email} size="lg"
              waMessage={`Hi ${candidate.candidateName}, checking in regarding your joining at ${candidate.clientName || "your new company"}.`}/>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-7 space-y-6 bg-surface-container-low">
          {/* Flag picker */}
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-text-tertiary mb-3">Current status</p>
            <div className="space-y-2">
              {FLAG_KEYS.map(k => {
                const f = FLAGS[k];
                const on = flag === k;
                return (
                  <button key={k} disabled={!canEdit} onClick={() => setFlag(on ? "" : k)}
                    className={`w-full flex items-center gap-3 p-4 rounded-2xl border-2 transition-all text-left ${on ? "border-primary bg-white shadow-sm" : "border-transparent bg-white/60 hover:bg-white"} ${canEdit ? "cursor-pointer" : "cursor-default opacity-70"}`}>
                    <span className={`w-3 h-3 rounded-full shrink-0 ${f.dot}`}/>
                    <M n={f.icon} className={`text-lg ${on ? "text-primary" : "text-text-tertiary"}`}/>
                    <span className={`flex-1 text-sm font-bold ${on ? "text-primary" : "text-text-secondary"}`}>{f.label}</span>
                    {on && <M n="check_circle" fill={1} className="text-primary text-lg"/>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Note */}
          {canEdit && (
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-text-tertiary mb-3">Call notes</p>
              <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={4}
                placeholder="What did the candidate say?"
                className="w-full p-4 rounded-2xl border border-outline-variant bg-white text-sm text-primary outline-none focus:border-primary resize-none"/>
              {err && <p className="text-error text-xs font-bold mt-2">{err}</p>}
              <button onClick={save} disabled={saving}
                className={`w-full mt-3 py-3.5 bg-primary text-white font-black rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-primary/20 ${saving ? "opacity-60" : "hover:-translate-y-0.5"} transition-all`}>
                <M n="add_call"/> {saving ? "Saving…" : "Save call"}
              </button>
            </div>
          )}

          {/* History */}
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-text-tertiary mb-3">
              History {history ? `(${history.length})` : ""}
            </p>
            {history === null ? (
              <div className="flex justify-center py-6">
                <div className="w-6 h-6 border-2 border-surface-container-high border-t-primary rounded-full animate-spin"/>
              </div>
            ) : history.length === 0 ? (
              <div className="text-center text-text-tertiary text-sm py-8 bg-white rounded-2xl">No calls logged yet</div>
            ) : (
              <div className="space-y-2">
                {history.map(h => {
                  const f = FLAGS[h.flag];
                  return (
                    <div key={h.id} className="bg-white p-4 rounded-2xl border-l-4 shadow-sm" style={{ borderLeftColor: h.flag === "red" ? "#ba1a1a" : h.flag === "yellow" ? "#E67E22" : h.flag === "green" ? "#16a34a" : "#e0e0e0" }}>
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-md ${f ? f.chip : "bg-surface-container text-text-tertiary"}`}>
                          {f ? f.short : "Note"}
                        </span>
                        <span className="text-[10px] font-bold text-text-tertiary">{fmtD(h.calledAt)}</span>
                      </div>
                      {h.notes && <p className="text-sm text-primary font-medium mt-1.5 whitespace-pre-wrap break-words">{h.notes}</p>}
                      <p className="text-[10px] font-medium text-text-tertiary mt-2">by {h.calledByName}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
export default function CallLog({ user }) {
  const [data, setData]       = useState({ rows: [], counts: {} });
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");
  const [filter, setFilter]   = useState("all");
  const [search, setSearch]   = useState("");
  const [active, setActive]   = useState(null);

  const canEdit = user?.role !== "viewer";

  const load = useCallback(() => {
    setLoading(true);
    api.getCallLog()
      .then(d => {
        if (d && d.error) setError(d.error);
        else { setData(d); setError(""); }
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  // Filter client-side so switching tabs is instant.
  const rows = (data.rows || []).filter(r => {
    if (filter === "none" && r.callFlag) return false;
    if (FLAG_KEYS.includes(filter) && r.callFlag !== filter) return false;
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return [r.candidateName, r.clientName, r.phone, r.designation]
      .some(v => (v || "").toLowerCase().includes(q));
  });

  const counts = data.counts || {};
  const tabs = [
    { k: "all",    l: "All",     n: counts.all    || 0, dot: "bg-primary" },
    { k: "none",   l: "Not called", n: counts.none || 0, dot: "bg-outline-variant" },
    { k: "red",    l: "Left",    n: counts.red    || 0, dot: "bg-error" },
    { k: "yellow", l: "Pending", n: counts.yellow || 0, dot: "bg-secondary" },
    { k: "green",  l: "Paid",    n: counts.green  || 0, dot: "bg-green-600" },
  ];

  // Reflect a saved flag immediately without a full refetch.
  const onSaved = (id, newFlag) => {
    setData(d => {
      const rows = (d.rows || []).map(r => r.id === id
        ? { ...r, callFlag: newFlag || r.callFlag, lastCalledAt: new Date().toISOString(), callCount: (r.callCount || 0) + 1 }
        : r);
      const counts = {
        all: rows.length,
        red: rows.filter(r => r.callFlag === "red").length,
        yellow: rows.filter(r => r.callFlag === "yellow").length,
        green: rows.filter(r => r.callFlag === "green").length,
        none: rows.filter(r => !r.callFlag).length,
      };
      return { rows, counts };
    });
  };

  return (
    <div className="font-sans">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div>
          <h1 className="text-4xl font-black text-primary tracking-tight">Call Log</h1>
          <p className="text-text-tertiary text-lg font-medium mt-1">
            Follow up with joined candidates and track their status.
          </p>
        </div>
        <button onClick={load}
          className="flex items-center gap-2 px-5 py-3 bg-white border border-outline-variant text-primary rounded-xl font-extrabold hover:bg-surface-container-low transition-all self-start">
          <M n="refresh"/> Refresh
        </button>
      </header>

      {/* Flag legend */}
      <div className="flex flex-wrap gap-4 mb-6 p-4 bg-white rounded-2xl border border-outline-variant">
        {FLAG_KEYS.map(k => (
          <div key={k} className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${FLAGS[k].dot}`}/>
            <span className="text-xs font-bold text-text-secondary">{FLAGS[k].label}</span>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
        {tabs.map(t => (
          <button key={t.k} onClick={() => setFilter(t.k)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black whitespace-nowrap transition-all border ${filter === t.k ? "bg-primary text-white border-primary shadow-md" : "bg-white text-text-secondary border-outline-variant hover:bg-surface-container-low"}`}>
            <span className={`w-2 h-2 rounded-full ${t.dot}`}/>
            {t.l}
            <span className={`px-1.5 py-0.5 rounded text-[10px] ${filter === t.k ? "bg-white/20" : "bg-surface-container"}`}>{t.n}</span>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <M n="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-lg text-text-tertiary"/>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name, client or phone…"
          className="w-full pl-10 pr-3 py-3 rounded-xl border border-outline-variant bg-white text-sm font-semibold text-primary outline-none focus:border-primary transition-colors"/>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center gap-3.5 py-24">
          <div className="w-9 h-9 border-4 border-surface-container-high border-t-primary rounded-full animate-spin"/>
          <span className="text-text-tertiary text-sm">Loading candidates…</span>
        </div>
      ) : error ? (
        <div className="text-error bg-error-bg p-5 rounded-2xl">Error: {error}</div>
      ) : rows.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-outline-variant">
          <M n="phone_missed" className="text-5xl text-outline-variant"/>
          <p className="text-text-tertiary font-medium mt-3">
            {(data.rows || []).length === 0 ? "No joined candidates yet." : "No candidates match this filter."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {rows.map(r => {
            const f = FLAGS[r.callFlag];
            return (
              <div key={r.id} onClick={() => setActive(r)}
                className="bg-white p-5 rounded-3xl border border-outline-variant shadow-sm hover:-translate-y-1 hover:shadow-xl hover:border-primary transition-all cursor-pointer">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <span className={`w-3 h-3 rounded-full shrink-0 mt-1.5 ${f ? f.dot : "bg-outline-variant"}`}
                      title={f ? f.label : "Not called yet"}/>
                    <div className="min-w-0">
                      <p className="font-black text-primary truncate">{r.candidateName}</p>
                      <p className="text-xs font-medium text-text-tertiary truncate">
                        {r.clientName || "—"}{r.designation ? ` · ${r.designation}` : ""}
                      </p>
                      <p className="text-[11px] font-medium text-text-tertiary mt-1">
                        Joined {fmtD(r.actualDOJ)}
                      </p>
                    </div>
                  </div>
                  <span className={`text-[10px] font-black px-2 py-1 rounded-lg whitespace-nowrap shrink-0 ${f ? f.chip : "bg-surface-container text-text-tertiary"}`}>
                    {f ? f.short : "Not called"}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-3 mt-4 pt-4 border-t border-surface-container flex-wrap">
                  <div className="flex items-center gap-3">
                    <ContactButtons phone={r.phone} email={r.email}
                      waMessage={`Hi ${r.candidateName}, checking in regarding your joining at ${r.clientName || "your new company"}.`}/>
                    <span className="text-[10px] font-bold text-text-tertiary flex items-center gap-1">
                      <M n="history" className="text-sm"/> {fmtWhen(r.lastCalledAt)}
                      {r.callCount > 0 && ` · ${r.callCount} call${r.callCount > 1 ? "s" : ""}`}
                    </span>
                  </div>
                  <span className="text-[11px] font-black text-primary flex items-center gap-1">
                    {canEdit ? "Log call" : "View"} <M n="chevron_right" className="text-sm"/>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {active && (
        <CallPanel candidate={active} canEdit={canEdit}
          onClose={() => setActive(null)} onSaved={onSaved}/>
      )}
    </div>
  );
}
