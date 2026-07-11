import { useState, useEffect, useMemo } from "react";
import { api } from "../api";

// ─── SORTABLE COLUMN HEADER ────────────────────────────────────────────────────
function SortTh({ label, sortKey, sort, setSort, align = "center", colorClass = "text-primary" }) {
  const active = sort.key === sortKey;
  return (
    <th
      onClick={() => setSort(s => ({ key: sortKey, dir: s.key === sortKey && s.dir === "desc" ? "asc" : "desc" }))}
      className={`px-4 py-4 text-[10px] font-black uppercase tracking-widest cursor-pointer select-none hover:bg-surface-container transition-colors ${colorClass} ${align === "center" ? "text-center" : "text-left"}`}>
      <span className="inline-flex items-center gap-1">
        {label}
        {active && <span className="material-symbols-outlined text-xs">{sort.dir === "desc" ? "arrow_downward" : "arrow_upward"}</span>}
      </span>
    </th>
  );
}

export default function UserReport({ onNavigate }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sort, setSort] = useState({ key: "total", dir: "desc" });

  useEffect(() => {
    setLoading(true);
    setError("");
    api.getUserReport()
      .then(r => { if (r.error) setError(r.error); else setData(r); })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const nav = (page, filter) => onNavigate && onNavigate(page, filter);

  const recruiters = useMemo(() => {
    const rows = data?.recruiters || [];
    const sorted = [...rows].sort((a, b) => {
      const av = a[sort.key] ?? 0, bv = b[sort.key] ?? 0;
      if (sort.key === "ownerName") return sort.dir === "desc" ? bv.localeCompare(av) : av.localeCompare(bv);
      return sort.dir === "desc" ? bv - av : av - bv;
    });
    return sorted;
  }, [data, sort]);

  const totals = data?.totals || { candidates: 0, offered: 0, joined: 0, backout: 0, red: 0, resPending: 0 };
  const topPerformer = recruiters[0];

  if (loading) return (
    <div className="flex flex-col items-center justify-center gap-3.5" style={{ height: 280 }}>
      <div className="w-9 h-9 border-4 border-surface-container-high border-t-primary rounded-full animate-spin"/>
      <span className="text-text-tertiary text-sm">Loading user report…</span>
    </div>
  );
  if (error) return <div className="text-error bg-error-bg p-5 rounded-2xl">Error: {error}</div>;

  return (
    <div className="font-sans">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <h1 className="text-4xl font-black text-primary tracking-tight">User Report</h1>
          <p className="text-text-tertiary text-lg font-medium mt-1">Per-recruiter performance, synced live with candidate data.</p>
        </div>
        {topPerformer && (
          <div className="flex items-center gap-3 px-6 py-3.5 bg-white border-2 border-secondary rounded-xl">
            <span className="material-symbols-outlined text-secondary fill-1">emoji_events</span>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-text-tertiary">Top Performer</p>
              <p className="text-sm font-extrabold text-primary">{topPerformer.ownerName} · {topPerformer.total} candidates</p>
            </div>
          </div>
        )}
      </header>

      {/* Org-wide summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 mb-10">
        {[
          { l: "Recruiters",   v: recruiters.length,    icon: "group",               c: "text-primary",      bg: "bg-primary/5" },
          { l: "Total",        v: totals.candidates,     icon: "database",            c: "text-primary",      bg: "bg-primary/5" },
          { l: "Offered",      v: totals.offered,        icon: "description",         c: "text-secondary",    bg: "bg-orange-50" },
          { l: "Joined",       v: totals.joined,         icon: "verified",            c: "text-green-600",    bg: "bg-green-50" },
          { l: "Backout",      v: totals.backout,        icon: "cancel",              c: "text-text-tertiary",bg: "bg-surface-container" },
          { l: "Red Flagged",  v: totals.red,             icon: "flag",               c: "text-error",        bg: "bg-red-50" },
        ].map(c => (
          <div key={c.l} className="bg-white rounded-2xl p-5 border border-outline-variant shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-9 h-9 rounded-xl ${c.bg} flex items-center justify-center`}>
                <span className={`material-symbols-outlined text-lg ${c.c}`}>{c.icon}</span>
              </div>
            </div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-text-tertiary mb-1">{c.l}</p>
            <h3 className={`text-2xl font-extrabold ${c.c}`}>{(c.v || 0).toLocaleString("en-IN")}</h3>
          </div>
        ))}
      </div>

      {/* Leaderboard table */}
      <div className="bg-white p-8 rounded-[2.5rem] border border-outline-variant shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h4 className="text-2xl font-extrabold text-primary tracking-tight">Recruiter Leaderboard</h4>
            <p className="text-text-tertiary font-medium mt-1">Click any column header to sort. Click a value to jump to filtered candidates.</p>
          </div>
        </div>

        {recruiters.length === 0 ? (
          <div className="text-center text-text-tertiary py-10 text-sm">No recruiter data yet — candidates need an Owner assigned.</div>
        ) : (
          <div className="overflow-x-auto -mx-8">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-low border-y border-outline-variant">
                  <SortTh label="Recruiter"   sortKey="ownerName"      sort={sort} setSort={setSort} align="left"/>
                  <SortTh label="Total"       sortKey="total"          sort={sort} setSort={setSort}/>
                  <SortTh label="Pipeline"    sortKey="pipeline"       sort={sort} setSort={setSort}/>
                  <SortTh label="Red"         sortKey="red"            sort={sort} setSort={setSort} colorClass="text-error"/>
                  <SortTh label="Backout"     sortKey="backout"        sort={sort} setSort={setSort} colorClass="text-text-tertiary"/>
                  <SortTh label="Joined"      sortKey="joined"         sort={sort} setSort={setSort} colorClass="text-green-600"/>
                  <SortTh label="Offered"     sortKey="offered"        sort={sort} setSort={setSort} colorClass="text-secondary"/>
                  <SortTh label="Resign Pend."sortKey="resPending"     sort={sort} setSort={setSort} colorClass="text-indigo-500"/>
                  <SortTh label="Conversion"  sortKey="conversionRate" sort={sort} setSort={setSort}/>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container">
                {recruiters.map((r, i) => (
                  <tr key={r.ownerName} className="hover:bg-surface-container-lowest transition-colors">
                    <td className="px-8 py-6 font-extrabold text-primary">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-[11px] font-black text-primary shrink-0">
                          {i === 0 ? <span className="material-symbols-outlined text-sm text-secondary fill-1">emoji_events</span> : (r.ownerName || "?")[0].toUpperCase()}
                        </div>
                        <span className="truncate max-w-[160px]">{r.ownerName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-6 text-center">
                      <span onClick={() => nav("candidates", { owners: [r.ownerName] })}
                        className="inline-flex items-center justify-center min-w-[28px] px-3 py-1 rounded-lg text-xs font-black bg-primary text-white shadow-sm cursor-pointer">
                        {r.total}
                      </span>
                    </td>
                    <td className="px-4 py-6 text-center">
                      <span onClick={() => nav("candidates", { owners: [r.ownerName] })}
                        className={`inline-flex items-center justify-center min-w-[28px] px-3 py-1 rounded-lg text-xs font-black cursor-pointer ${r.pipeline > 0 ? "bg-surface-container text-primary" : "bg-surface-container-lowest text-outline-variant border"}`}>
                        {r.pipeline}
                      </span>
                    </td>
                    <td className="px-4 py-6 text-center">
                      <span onClick={() => nav("candidates", { owners: [r.ownerName], statuses: ["Red"] })}
                        className={`inline-flex items-center justify-center min-w-[28px] px-3 py-1 rounded-lg text-xs font-black cursor-pointer ${r.red > 0 ? "bg-red-100 text-error" : "bg-surface-container-lowest text-outline-variant border"}`}>
                        {r.red}
                      </span>
                    </td>
                    <td className="px-4 py-6 text-center">
                      <span onClick={() => nav("candidates", { owners: [r.ownerName], statuses: ["Backout"] })}
                        className={`inline-flex items-center justify-center min-w-[28px] px-3 py-1 rounded-lg text-xs font-black cursor-pointer ${r.backout > 0 ? "bg-surface-container text-text-tertiary" : "bg-surface-container-lowest text-outline-variant border"}`}>
                        {r.backout}
                      </span>
                    </td>
                    <td className="px-4 py-6 text-center">
                      <span onClick={() => nav("candidates", { owners: [r.ownerName], statuses: ["Joined"] })}
                        className={`inline-flex items-center justify-center min-w-[28px] px-3 py-1 rounded-lg text-xs font-black cursor-pointer ${r.joined > 0 ? "bg-green-600 text-white" : "bg-surface-container-lowest text-outline-variant border"}`}>
                        {r.joined}
                      </span>
                    </td>
                    <td className="px-4 py-6 text-center">
                      <span onClick={() => nav("candidates", { owners: [r.ownerName], statuses: ["Offered"] })}
                        className={`inline-flex items-center justify-center min-w-[28px] px-3 py-1 rounded-lg text-xs font-black cursor-pointer ${r.offered > 0 ? "bg-secondary text-white shadow-sm" : "bg-surface-container-lowest text-outline-variant border"}`}>
                        {r.offered}
                      </span>
                    </td>
                    <td className="px-4 py-6 text-center">
                      <span onClick={() => nav("candidates", { owners: [r.ownerName], resignations: ["Pending"] })}
                        className={`inline-flex items-center justify-center min-w-[28px] px-3 py-1 rounded-lg text-xs font-black cursor-pointer ${r.resPending > 0 ? "bg-indigo-100 text-indigo-600" : "bg-surface-container-lowest text-outline-variant border"}`}>
                        {r.resPending}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-16 h-1.5 bg-surface-container rounded-full">
                          <div className="h-full bg-primary rounded-full" style={{ width: `${Math.min(r.conversionRate, 100)}%` }}/>
                        </div>
                        <span className="text-xs font-black text-primary">{r.conversionRate}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
