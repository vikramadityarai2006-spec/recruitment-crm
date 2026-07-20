import { useState, useEffect, useCallback } from "react";
import { api } from "../api";

// ─── MATERIAL ICON ────────────────────────────────────────────────────────────
const M = ({ n, fill = 0, className = "" }) => (
  <span className={`material-symbols-outlined ${className}`} style={{ fontVariationSettings: `'FILL' ${fill}` }}>{n}</span>
);

// Tile config — mirrors the "Company Portfolio Health" columns on the dashboard.
const TILES = [
  { k: "pipeline", l: "Pipeline", icon: "conveyor_belt",   ring: "border-primary/20",       chip: "bg-primary/5 text-primary",        num: "text-primary",       status: null },
  { k: "red",      l: "Red-flagged", icon: "flag",         ring: "border-error/20",         chip: "bg-red-100 text-error",            num: "text-error",         status: "Red" },
  { k: "backout",  l: "Backout",  icon: "person_cancel",   ring: "border-outline-variant",  chip: "bg-surface-container text-text-tertiary", num: "text-text-secondary", status: "Backout" },
  { k: "joined",   l: "Joined",   icon: "verified",        ring: "border-green-600/20",     chip: "bg-green-100 text-green-700",      num: "text-green-600",     status: "Joined" },
  { k: "offered",  l: "Offered",  icon: "assignment_turned_in", ring: "border-secondary/20", chip: "bg-orange-100 text-secondary",     num: "text-secondary",     status: "Offered" },
];

export default function ClientDetail({ clientName, from = "", to = "", onNavigate }) {
  const [row, setRow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const nav = (page, filter) => onNavigate && onNavigate(page, filter);

  const load = useCallback(() => {
    setLoading(true); setError("");
    const p = {};
    if (from) p.from = from;
    if (to)   p.to = to;
    api.getDashboard(p)
      .then(d => {
        if (d && d.error) { setError(d.error); return; }
        const match = (d.clientStatusBreakdown || []).find(
          c => (c.clientName || "").toLowerCase() === (clientName || "").toLowerCase()
        );
        setRow(match || { clientName, total: 0, pipeline: 0, red: 0, backout: 0, joined: 0, offered: 0, notFound: !match });
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [clientName, from, to]);

  useEffect(() => { load(); }, [load]);

  const rangeLabel = (!from && !to) ? "All time" : `${from || "…"} → ${to || "…"}`;
  const convRate = row && row.offered > 0 ? Math.round((row.joined / row.offered) * 100) : 0;

  return (
    <div className="font-sans max-w-[1200px] mx-auto">
      {/* Back */}
      <button onClick={() => nav("dashboard")}
        className="flex items-center gap-1.5 text-sm font-bold text-text-secondary hover:text-primary transition-colors mb-6">
        <M n="arrow_back" className="text-lg"/> Back to Dashboard
      </button>

      {/* Header */}
      <header className="bg-primary rounded-3xl p-8 mb-8 relative overflow-hidden text-white shadow-2xl shadow-primary/30">
        <div className="absolute -right-8 -top-8 w-40 h-40 bg-white/5 rounded-full"/>
        <div className="relative z-10 flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center shrink-0">
            <M n="domain" fill={1} className="text-4xl text-white"/>
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50">Client Portfolio</p>
            <h1 className="text-3xl font-black tracking-tight truncate">{clientName}</h1>
            <p className="text-white/50 text-xs font-medium mt-1 flex items-center gap-1.5">
              <M n="calendar_month" className="text-sm"/> {rangeLabel}
            </p>
          </div>
          {row && !loading && (
            <div className="ml-auto text-right shrink-0 hidden sm:block">
              <p className="text-5xl font-black tracking-tighter">{(row.total || 0).toLocaleString("en-IN")}</p>
              <p className="text-white/40 text-[11px] font-bold uppercase tracking-widest">Total candidates</p>
            </div>
          )}
        </div>
      </header>

      {loading ? (
        <div className="flex flex-col items-center justify-center gap-3.5 py-24">
          <div className="w-9 h-9 border-4 border-surface-container-high border-t-primary rounded-full animate-spin"/>
          <span className="text-text-tertiary text-sm">Loading client…</span>
        </div>
      ) : error ? (
        <div className="text-error bg-error-bg p-5 rounded-2xl">Error: {error}</div>
      ) : (
        <>
          {row.notFound && (
            <div className="bg-orange-50 border border-secondary/30 text-secondary rounded-2xl p-4 mb-6 text-sm font-semibold flex items-center gap-2">
              <M n="info" className="text-lg"/> No breakdown data for this client in the selected range. Showing zeros — open the full candidate list below.
            </div>
          )}

          {/* Status tiles — each clickable into the filtered candidate list */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-5 mb-8">
            {TILES.map(t => {
              const val = row[t.k] || 0;
              const go = () => nav("candidates", t.status ? { clients: [clientName], statuses: [t.status] } : { clients: [clientName] });
              return (
                <button key={t.k} onClick={go}
                  className={`text-left bg-white p-6 rounded-3xl border ${t.ring} shadow-sm hover:-translate-y-1 hover:shadow-xl transition-all group`}>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${t.chip}`}>
                      <M n={t.icon} className="text-xl"/>
                    </div>
                    <M n="chevron_right" className="text-outline-variant group-hover:text-primary transition-colors"/>
                  </div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-text-tertiary mb-1">{t.l}</p>
                  <h3 className={`text-3xl font-black ${t.num}`}>{val.toLocaleString("en-IN")}</h3>
                </button>
              );
            })}
          </div>

          {/* Summary strip */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-5 mb-8">
            <div className="bg-white rounded-3xl border border-outline-variant shadow-sm p-6 text-center">
              <p className="text-[10px] font-black text-text-tertiary uppercase tracking-widest mb-1">Total Candidates</p>
              <p className="text-3xl font-black text-primary">{(row.total || 0).toLocaleString("en-IN")}</p>
            </div>
            <div className="bg-white rounded-3xl border border-outline-variant shadow-sm p-6 text-center">
              <p className="text-[10px] font-black text-text-tertiary uppercase tracking-widest mb-1">Offer → Join</p>
              <p className="text-3xl font-black text-primary">{convRate}%</p>
            </div>
            <div className="bg-white rounded-3xl border border-outline-variant shadow-sm p-6 text-center col-span-2 md:col-span-1 flex flex-col justify-center">
              <button onClick={() => nav("candidates", { clients: [clientName] })}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-extrabold shadow-lg shadow-primary/20 hover:-translate-y-0.5 transition-all">
                <M n="group"/> View all candidates
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
