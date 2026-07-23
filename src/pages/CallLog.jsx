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

// The three candidate sections. `dateLabel` tells the user which date the
// calendar is filtering on, since it differs per section.
const SECTIONS = [
  { k: "offered",     l: "Offered",     icon: "assignment_turned_in", dateLabel: "Offer month",     dateKey: "offerMonth" },
  { k: "joined",      l: "Joined",      icon: "verified",             dateLabel: "Joining date",    dateKey: "actualDOJ" },
  { k: "resignation", l: "Resignation", icon: "person_off",           dateLabel: "Resignation date",dateKey: "resignationDate" },
];

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
                {candidate.actualDOJ ? `Joined ${fmtD(candidate.actualDOJ)}` : candidate.joiningStatus || "—"}{candidate.ownerName ? ` · Owner: ${candidate.ownerName}` : ""}
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
  const [collapsed, setCollapsed] = useState(() => new Set());
  const [section, setSection] = useState("joined");
  const [range, setRange]     = useState({ from: "", to: "" });
  const [ownerPick, setOwnerPick]   = useState("");
  const [clientPick, setClientPick] = useState("");

  // Only recruiters log calls. Admin/viewer get read-only oversight.
  const isRecruiter = user?.role === "recruiter";
  const canEdit = isRecruiter;

  // Recruiters see their candidates grouped BY COMPANY.
  // Admins/viewers see everyone grouped BY RECRUITER, to watch activity.
  const groupBy    = isRecruiter ? "clientName" : "ownerName";
  const groupLabel = isRecruiter ? "Company"    : "Recruiter";
  const groupIcon  = isRecruiter ? "domain"     : "person";

  const load = useCallback(() => {
    setLoading(true);
    const p = { section };
    if (range.from) p.from = range.from;
    if (range.to)   p.to = range.to;
    api.getCallLog(p)
      .then(d => {
        if (d && d.error) setError(d.error);
        else { setData(d); setError(""); }
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [section, range.from, range.to]);

  useEffect(() => { load(); }, [load]);

  // Dropdown options come from the full loaded set, so narrowing one filter
  // never empties the other dropdown.
  const uniq = (key) => [...new Set((data.rows || []).map(r => (r[key] || "").trim()).filter(Boolean))].sort();
  const ownerOptions  = uniq("ownerName");
  const clientOptions = uniq("clientName");

  // Filter client-side so switching tabs is instant.
  const rows = (data.rows || []).filter(r => {
    if (filter === "none" && r.callFlag) return false;
    if (FLAG_KEYS.includes(filter) && r.callFlag !== filter) return false;
    if (ownerPick  && (r.ownerName  || "").trim() !== ownerPick)  return false;
    if (clientPick && (r.clientName || "").trim() !== clientPick) return false;
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return [r.candidateName, r.clientName, r.phone, r.designation, r.ownerName]
      .some(v => (v || "").toLowerCase().includes(q));
  });

  const counts = data.counts || {};

  // Group the filtered rows (by company for recruiters, by recruiter for admins)
  const groups = (() => {
    const map = {};
    for (const r of rows) {
      const key = (r[groupBy] || "").trim() || "— Unassigned —";
      if (!map[key]) map[key] = { name: key, items: [], red: 0, yellow: 0, green: 0, none: 0 };
      map[key].items.push(r);
      if (r.callFlag === "red") map[key].red++;
      else if (r.callFlag === "yellow") map[key].yellow++;
      else if (r.callFlag === "green") map[key].green++;
      else map[key].none++;
    }
    return Object.values(map).sort((a, b) => b.items.length - a.items.length);
  })();

  const toggle = (name) => setCollapsed(s => {
    const n = new Set(s);
    n.has(name) ? n.delete(name) : n.add(name);
    return n;
  });
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

  const activeSection = SECTIONS.find(x => x.k === section) || SECTIONS[1];
  const pickerCls = "px-3 py-2 rounded-lg border border-outline-variant bg-white text-primary text-xs font-semibold outline-none focus:border-primary cursor-pointer max-w-[200px]";

  return (
    <div className="font-sans">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-4xl font-black text-primary tracking-tight">Call Log</h1>
            {!canEdit && (
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container text-text-secondary text-[10px] font-black uppercase tracking-wider">
                <M n="visibility" className="text-sm"/> View only
              </span>
            )}
          </div>
          <p className="text-text-tertiary text-lg font-medium mt-1">
            {isRecruiter
              ? `Follow up with your ${activeSection.l.toLowerCase()} candidates, grouped by company.`
              : `Monitor recruiter follow-up activity across ${activeSection.l.toLowerCase()} candidates.`}
          </p>
        </div>
        <div className="flex items-center gap-3 self-start flex-wrap">
          {groups.length > 1 && (
            <button onClick={() => setCollapsed(c => c.size ? new Set() : new Set(groups.map(g => g.name)))}
              className="flex items-center gap-2 px-5 py-3 bg-white border border-outline-variant text-primary rounded-xl font-extrabold hover:bg-surface-container-low transition-all">
              <M n={collapsed.size ? "unfold_more" : "unfold_less"}/>
              {collapsed.size ? "Expand all" : "Collapse all"}
            </button>
          )}
          <button onClick={load}
            className="flex items-center gap-2 px-5 py-3 bg-white border border-outline-variant text-primary rounded-xl font-extrabold hover:bg-surface-container-low transition-all">
            <M n="refresh"/> Refresh
          </button>
        </div>
      </header>

      {/* Section tabs */}
      <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
        {SECTIONS.map(sec => (
          <button key={sec.k} onClick={() => { setSection(sec.k); setFilter("all"); }}
            className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-black whitespace-nowrap transition-all border-2 ${section === sec.k ? "bg-primary text-white border-primary shadow-lg shadow-primary/20" : "bg-white text-text-secondary border-outline-variant hover:border-primary"}`}>
            <M n={sec.icon} fill={section === sec.k ? 1 : 0} className="text-lg"/> {sec.l}
          </button>
        ))}
      </div>

      {/* Calendar + scrollable recruiter / client pickers */}
      <div className="flex flex-wrap items-center gap-3 mb-5 p-4 bg-white rounded-2xl border border-outline-variant">
        <div className="flex items-center gap-2">
          <M n="date_range" className={`text-lg ${range.from || range.to ? "text-secondary" : "text-text-tertiary"}`} fill={range.from || range.to ? 1 : 0}/>
          <span className="text-[10px] font-black uppercase tracking-wider text-text-tertiary">{activeSection.dateLabel}</span>
          <input type="date" value={range.from} max={range.to || undefined}
            onChange={e => setRange(r => ({ ...r, from: e.target.value }))} className={pickerCls}/>
          <span className="text-text-tertiary text-xs font-bold">to</span>
          <input type="date" value={range.to} min={range.from || undefined}
            onChange={e => setRange(r => ({ ...r, to: e.target.value }))} className={pickerCls}/>
        </div>

        {!isRecruiter && (
          <select value={ownerPick} onChange={e => setOwnerPick(e.target.value)} className={pickerCls} size={1}>
            <option value="">All recruiters ({ownerOptions.length})</option>
            {ownerOptions.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        )}

        <select value={clientPick} onChange={e => setClientPick(e.target.value)} className={pickerCls} size={1}>
          <option value="">All companies ({clientOptions.length})</option>
          {clientOptions.map(c => <option key={c} value={c}>{c}</option>)}
        </select>

        {(range.from || range.to || ownerPick || clientPick) && (
          <button onClick={() => { setRange({ from: "", to: "" }); setOwnerPick(""); setClientPick(""); }}
            className="flex items-center gap-1 px-3 py-2 rounded-lg text-[10px] font-black text-text-secondary bg-surface-container hover:bg-surface-container-high transition-colors">
            <M n="restart_alt" className="text-sm"/> Clear filters
          </button>
        )}
      </div>

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
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder={isRecruiter ? "Search name, company or phone…" : "Search name, recruiter, company or phone…"}
          className="w-full pl-10 pr-3 py-3 rounded-xl border border-outline-variant bg-white text-sm font-semibold text-primary outline-none focus:border-primary transition-colors"/>
      </div>

      {/* Grouping indicator */}
      {!loading && !error && groups.length > 0 && (
        <div className="flex items-center gap-2 mb-3 text-[10px] font-black uppercase tracking-widest text-text-tertiary">
          <M n={groupIcon} className="text-sm"/> Grouped by {groupLabel} · {groups.length} {groups.length === 1 ? "group" : "groups"}
        </div>
      )}

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
            {(data.rows || []).length === 0 ? `No ${activeSection.l.toLowerCase()} candidates in this range.` : "No candidates match these filters."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {groups.map(g => {
            const isOpen = !collapsed.has(g.name);
            return (
              <div key={g.name} className="bg-white rounded-3xl border border-outline-variant shadow-sm overflow-hidden">
                {/* Group header */}
                <div onClick={() => toggle(g.name)}
                  className="flex items-center justify-between gap-4 p-5 cursor-pointer hover:bg-surface-container-low transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-11 h-11 rounded-2xl bg-primary/5 flex items-center justify-center shrink-0">
                      <M n={groupIcon} className="text-primary"/>
                    </div>
                    <div className="min-w-0">
                      <p className="font-black text-primary truncate">{g.name}</p>
                      <p className="text-[11px] font-medium text-text-tertiary">
                        {g.items.length} candidate{g.items.length > 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    {/* per-group flag tally */}
                    <div className="hidden sm:flex items-center gap-1.5">
                      {[["red", g.red], ["yellow", g.yellow], ["green", g.green]].map(([k, n]) => n > 0 && (
                        <span key={k} className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-black ${FLAGS[k].chip}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${FLAGS[k].dot}`}/> {n}
                        </span>
                      ))}
                      {g.none > 0 && (
                        <span className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-black bg-surface-container text-text-tertiary">
                          <span className="w-1.5 h-1.5 rounded-full bg-outline-variant"/> {g.none}
                        </span>
                      )}
                    </div>
                    <M n={isOpen ? "expand_less" : "expand_more"} className="text-2xl text-outline-variant"/>
                  </div>
                </div>

                {/* Group items */}
                {isOpen && (
                  <div className="border-t border-surface-container p-4 grid grid-cols-1 xl:grid-cols-2 gap-3 bg-surface-container-low">
                    {g.items.map(r => {
                      const f = FLAGS[r.callFlag];
                      return (
                        <div key={r.id} onClick={() => setActive(r)}
                          className="bg-white p-4 rounded-2xl border border-outline-variant hover:border-primary hover:shadow-md transition-all cursor-pointer">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-start gap-3 min-w-0">
                              <span className={`w-3 h-3 rounded-full shrink-0 mt-1.5 ${f ? f.dot : "bg-outline-variant"}`}
                                title={f ? f.label : "Not called yet"}/>
                              <div className="min-w-0">
                                <p className="font-black text-primary truncate">{r.candidateName}</p>
                                <p className="text-xs font-medium text-text-tertiary truncate">
                                  {/* show the *other* dimension so context isn't lost */}
                                  {isRecruiter
                                    ? (r.designation || "—")
                                    : (r.clientName || "—")}
                                </p>
                                <p className="text-[11px] font-medium text-text-tertiary mt-1">
                                  {activeSection.l === "Joined" ? "Joined" : activeSection.l === "Offered" ? "Offer" : "Resigned"} {fmtD(r[activeSection.dateKey])}
                                </p>
                              </div>
                            </div>
                            <span className={`text-[10px] font-black px-2 py-1 rounded-lg whitespace-nowrap shrink-0 ${f ? f.chip : "bg-surface-container text-text-tertiary"}`}>
                              {f ? f.short : "Not called"}
                            </span>
                          </div>

                          <div className="flex items-center justify-between gap-3 mt-3 pt-3 border-t border-surface-container flex-wrap">
                            <div className="flex items-center gap-3">
                              <ContactButtons phone={r.phone} email={r.email}
                                waMessage={`Hi ${r.candidateName}, checking in regarding your joining at ${r.clientName || "your new company"}.`}/>
                              <span className="text-[10px] font-bold text-text-tertiary flex items-center gap-1">
                                <M n="history" className="text-sm"/> {fmtWhen(r.lastCalledAt)}
                                {r.callCount > 0 && ` · ${r.callCount}`}
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
