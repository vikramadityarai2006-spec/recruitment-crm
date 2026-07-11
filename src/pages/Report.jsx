import { useState, useEffect } from "react";
import { api } from "../api";
import { MiniBar } from "../components/UI";

const RANGES = [
  { v: 1,  l: "Last Month" },
  { v: 3,  l: "Last 3 Months" },
  { v: 6,  l: "Last 6 Months" },
  { v: 12, l: "Last 12 Months" },
];

export default function Report() {
  const [range, setRange] = useState(6);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");
    api.getReports(range)
      .then(r => { if (r.error) setError(r.error); else setData(r); })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [range]);

  const totals = (data?.monthly || []).reduce((acc, m) => ({
    added: acc.added + m.added,
    offered: acc.offered + m.offered,
    joined: acc.joined + m.joined,
  }), { added: 0, offered: 0, joined: 0 });

  const rangeLabel = RANGES.find(r => r.v === range)?.l;
  const addedSeries   = (data?.monthly || []).map(m => ({ label: m.label, value: m.added,   color: "#001c3e" }));
  const offeredSeries = (data?.monthly || []).map(m => ({ label: m.label, value: m.offered, color: "#E67E22" }));
  const joinedSeries  = (data?.monthly || []).map(m => ({ label: m.label, value: m.joined,  color: "#059669" }));

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-primary tracking-tight">Reports</h2>
          <p className="text-sm text-outline mt-1 font-medium">Monthly tracking of your candidate activity</p>
        </div>
        <div className="flex p-1 bg-surface-container-high rounded-lg border border-outline-variant">
          {RANGES.map(r => (
            <button key={r.v} onClick={() => setRange(r.v)}
              className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-colors ${range === r.v ? "bg-white text-primary shadow-sm ring-1 ring-black/5" : "text-outline hover:text-primary"}`}>
              {r.l}
            </button>
          ))}
        </div>
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center h-48 gap-3">
          <div className="w-9 h-9 border-4 border-primary/10 border-t-secondary rounded-full animate-spin-fast"></div>
          <span className="text-text-tertiary text-sm">Loading report…</span>
        </div>
      )}

      {!loading && error && <div className="text-error p-5 font-medium">Error: {error}</div>}

      {!loading && !error && data && (
        <div className="space-y-6">
          {/* Period totals */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { l: `Added (${rangeLabel})`, v: totals.added, icon: "person_add", c: "text-primary", bg: "bg-primary/5", bar: "bg-primary" },
              { l: `Offered (${rangeLabel})`, v: totals.offered, icon: "description", c: "text-secondary", bg: "bg-secondary/5", bar: "bg-secondary" },
              { l: `Joined (${rangeLabel})`, v: totals.joined, icon: "handshake", c: "text-emerald-600", bg: "bg-emerald-50", bar: "bg-emerald-600" },
            ].map(c => (
              <div key={c.l} className="bg-white rounded-xl p-6 border border-outline-variant shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-outline">{c.l}</span>
                  <div className={`w-8 h-8 rounded-full ${c.bg} flex items-center justify-center`}>
                    <span className={`material-symbols-outlined ${c.c} text-lg`}>{c.icon}</span>
                  </div>
                </div>
                <div className={`text-3xl font-extrabold ${c.c}`}>{c.v ?? 0}</div>
                <div className={`mt-4 h-1 w-12 ${c.bar}/20 rounded-full overflow-hidden`}>
                  <div className={`h-full ${c.bar} w-2/3`}></div>
                </div>
              </div>
            ))}
          </div>

          {/* Current status snapshot */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { l: "Total Candidates", v: data.snapshot.total, c: "text-primary" },
              { l: "Backout (Current)", v: data.snapshot.backout, c: "text-error" },
              { l: "On Hold (Current)", v: data.snapshot.hold, c: "text-secondary" },
              { l: "Resignation Pending", v: data.snapshot.resPending, c: "text-indigo-500" },
            ].map(c => (
              <div key={c.l} className="bg-surface-container-low rounded-lg p-4 border border-outline-variant/50">
                <div className={`text-lg font-bold ${c.c}`}>{c.v ?? 0}</div>
                <div className="text-[10px] font-bold text-outline uppercase tracking-tight">{c.l}</div>
              </div>
            ))}
          </div>

          {/* Monthly trend charts */}
          <div className={`grid grid-cols-1 ${range <= 3 ? "" : "lg:grid-cols-2"} gap-6`}>
            {[
              { title: "Candidates Added Trend", icon: "trending_up", c: "text-primary", series: addedSeries },
              { title: "Offers Made Trend", icon: "assignment_turned_in", c: "text-secondary", series: offeredSeries },
            ].map(card => (
              <div key={card.title} className="bg-white rounded-xl border border-outline-variant shadow-sm overflow-hidden">
                <div className="p-4 border-b border-outline-variant flex items-center justify-between bg-surface-container-lowest">
                  <div className="flex items-center gap-2">
                    <span className={`material-symbols-outlined ${card.c} text-sm`}>{card.icon}</span>
                    <h3 className={`text-xs font-bold uppercase tracking-wider ${card.c}`}>{card.title}</h3>
                  </div>
                  <span className="text-[10px] text-outline font-medium">Monthly Breakdown</span>
                </div>
                <div className="p-6">
                  <MiniBar data={card.series} height={110} />
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-xl border border-outline-variant shadow-sm overflow-hidden">
            <div className="p-4 border-b border-outline-variant flex items-center justify-between bg-surface-container-lowest">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-emerald-600 text-sm">person_pin</span>
                <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-600">Candidates Joined Trend</h3>
              </div>
              <span className="text-[10px] text-outline font-medium">Monthly Breakdown</span>
            </div>
            <div className="p-6">
              <MiniBar data={joinedSeries} height={110} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
