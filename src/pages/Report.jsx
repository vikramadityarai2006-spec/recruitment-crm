import { useState, useEffect } from "react";
import { api } from "../api";
import { Spin, MiniBar, Icon } from "../components/UI";

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

  const addedSeries   = (data?.monthly || []).map(m => ({ label: m.label, value: m.added,   color: "#2563eb" }));
  const offeredSeries = (data?.monthly || []).map(m => ({ label: m.label, value: m.offered, color: "#f97316" }));
  const joinedSeries  = (data?.monthly || []).map(m => ({ label: m.label, value: m.joined,  color: "#22c55e" }));

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22, flexWrap: "wrap", gap: 10 }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: "#0f172a", margin: 0 }}>Reports</h2>
          <p style={{ color: "#64748b", margin: "3px 0 0", fontSize: 13 }}>Monthly tracking of your candidate activity</p>
        </div>

        {/* Range toggle */}
        <div style={{ display: "flex", gap: 4, background: "#f1f5f9", padding: 4, borderRadius: 10 }}>
          {RANGES.map(r => (
            <button key={r.v} onClick={() => setRange(r.v)}
              style={{
                padding: "7px 14px", borderRadius: 8, border: "none", cursor: "pointer",
                fontSize: 12, fontWeight: 700,
                background: range === r.v ? "white" : "transparent",
                color: range === r.v ? "#2563eb" : "#64748b",
                boxShadow: range === r.v ? "0 1px 3px rgba(0,0,0,.1)" : "none",
                transition: "all .15s",
              }}>
              {r.l}
            </button>
          ))}
        </div>
      </div>

      {loading && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: 200, gap: 12 }}>
          <Spin /><span style={{ color: "#94a3b8", fontSize: 13 }}>Loading report…</span>
        </div>
      )}

      {!loading && error && <div style={{ color: "#ef4444", padding: 20 }}>Error: {error}</div>}

      {!loading && !error && data && (
        <>
          {/* Period totals */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(150px,1fr))", gap: 12, marginBottom: 14 }}>
            {[
              { l: `Added (${RANGES.find(r => r.v === range)?.l})`, v: totals.added, c: "#2563eb" },
              { l: `Offered (${RANGES.find(r => r.v === range)?.l})`, v: totals.offered, c: "#f97316" },
              { l: `Joined (${RANGES.find(r => r.v === range)?.l})`, v: totals.joined, c: "#22c55e" },
            ].map(c => (
              <div key={c.l} style={{ background: "white", borderRadius: 12, padding: 16, boxShadow: "0 1px 3px rgba(0,0,0,.06)", border: "1px solid #f1f5f9" }}>
                <div style={{ fontSize: 26, fontWeight: 800, color: c.c }}>{c.v ?? 0}</div>
                <div style={{ fontSize: 11, color: "#64748b", marginTop: 2, fontWeight: 500, lineHeight: 1.3 }}>{c.l}</div>
                <div style={{ width: 28, height: 3, background: c.c, borderRadius: 2, marginTop: 8, opacity: .4 }} />
              </div>
            ))}
          </div>

          {/* Current status snapshot — not date-bucketed, since statuses
              don't carry a history of when they changed */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(150px,1fr))", gap: 12, marginBottom: 18 }}>
            {[
              { l: "Total Candidates (current)", v: data.snapshot.total, c: "#0f172a" },
              { l: "Backout (current)", v: data.snapshot.backout, c: "#dc2626" },
              { l: "On Hold (current)", v: data.snapshot.hold, c: "#92400e" },
              { l: "Resignation Pending (current)", v: data.snapshot.resPending, c: "#7c3aed" },
            ].map(c => (
              <div key={c.l} style={{ background: "#f8fafc", borderRadius: 12, padding: "12px 16px", border: "1px solid #f1f5f9" }}>
                <div style={{ fontSize: 20, fontWeight: 800, color: c.c }}>{c.v ?? 0}</div>
                <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 2, fontWeight: 600 }}>{c.l}</div>
              </div>
            ))}
          </div>

          {/* Monthly trend charts */}
          <div style={{ display: "grid", gridTemplateColumns: range <= 3 ? "1fr" : "1fr 1fr", gap: 14 }}>
            <div style={{ background: "white", borderRadius: 12, padding: 18, boxShadow: "0 1px 3px rgba(0,0,0,.06)", border: "1px solid #f1f5f9" }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#0f172a", marginBottom: 4, display: "flex", alignItems: "center", gap: 6 }}>
                <Icon n="trendUp" s={13} /> Candidates Added
              </div>
              <MiniBar data={addedSeries} height={100} />
            </div>

            <div style={{ background: "white", borderRadius: 12, padding: 18, boxShadow: "0 1px 3px rgba(0,0,0,.06)", border: "1px solid #f1f5f9" }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#0f172a", marginBottom: 4, display: "flex", alignItems: "center", gap: 6 }}>
                <Icon n="trendUp" s={13} /> Offers Made
              </div>
              <MiniBar data={offeredSeries} height={100} />
            </div>

            <div style={{ background: "white", borderRadius: 12, padding: 18, boxShadow: "0 1px 3px rgba(0,0,0,.06)", border: "1px solid #f1f5f9" }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#0f172a", marginBottom: 4, display: "flex", alignItems: "center", gap: 6 }}>
                <Icon n="trendUp" s={13} /> Candidates Joined
              </div>
              <MiniBar data={joinedSeries} height={100} />
            </div>
          </div>
        </>
      )}

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
