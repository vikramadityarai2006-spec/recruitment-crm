import { useState, useEffect } from "react";
import { api } from "../api";
import { STATUS_COLOR } from "../utils/constants";
import { Spin, MiniBar, Donut } from "../components/UI";

export default function Dashboard() {
  const [s, setS] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api.getDashboard()
      .then(d => { setS(d); setLoading(false); })
      .catch(e => { setError(e.message); setLoading(false); });
  }, []);

  if (loading) return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: 200, gap: 12 }}>
      <Spin /><span style={{ color: "#94a3b8", fontSize: 13 }}>Loading dashboard…</span>
    </div>
  );
  if (error) return <div style={{ color: "#ef4444", padding: 20 }}>Error: {error}</div>;
  if (!s) return null;

  const cards = [
    { l: "Total Candidates", v: s.total, c: "#2563eb" },
    { l: "Offered", v: s.offered, c: "#f97316" },
    { l: "Joined", v: s.joined, c: "#22c55e" },
    { l: "Resignation Pending", v: s.resPending, c: "#ef4444" },
    { l: "Joining This Month", v: s.thisMonth, c: "#8b5cf6" },
    { l: "Joining Next Month", v: s.nextMonth, c: "#06b6d4" },
  ];

  const statusDist = (s.statusGroups || [])
    .filter(x => x.joiningStatus && x._count._all > 0)
    .map(x => ({ label: x.joiningStatus, value: x._count._all, color: STATUS_COLOR[x.joiningStatus] || "#94a3b8" }));

  const clientDist = (s.clientGroups || [])
    .filter(x => x.clientName)
    .map(x => ({ label: x.clientName.length > 9 ? x.clientName.slice(0, 9) + "…" : x.clientName, value: x._count._all, color: "#3b82f6" }));

  const monthTrend = (s.months || []).map(m => ({ label: m.label, value: m.value, color: "#22c55e" }));

  return (
    <div>
      <div style={{ marginBottom: 22 }}>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: "#0f172a", margin: 0 }}>Dashboard</h2>
        <p style={{ color: "#64748b", margin: "3px 0 0", fontSize: 13 }}>Live recruitment overview · synced across all devices</p>
      </div>

      {/* KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(150px,1fr))", gap: 12, marginBottom: 24 }}>
        {cards.map(c => (
          <div key={c.l} style={{ background: "white", borderRadius: 12, padding: 16, boxShadow: "0 1px 3px rgba(0,0,0,.06)", border: "1px solid #f1f5f9" }}>
            <div style={{ fontSize: 26, fontWeight: 800, color: c.c }}>{c.v ?? 0}</div>
            <div style={{ fontSize: 11, color: "#64748b", marginTop: 2, fontWeight: 500, lineHeight: 1.3 }}>{c.l}</div>
            <div style={{ width: 28, height: 3, background: c.c, borderRadius: 2, marginTop: 8, opacity: .4 }} />
          </div>
        ))}
      </div>

      {/* Charts */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
        <div style={{ background: "white", borderRadius: 12, padding: 18, boxShadow: "0 1px 3px rgba(0,0,0,.06)", border: "1px solid #f1f5f9" }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#0f172a", marginBottom: 8 }}>Joining Status</div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Donut data={statusDist} size={85} />
            <div style={{ flex: 1, overflow: "hidden" }}>
              {statusDist.slice(0, 6).map(s => (
                <div key={s.label} style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 3 }}>
                  <div style={{ width: 7, height: 7, borderRadius: "50%", background: s.color, flexShrink: 0 }} />
                  <span style={{ fontSize: 10, color: "#475569", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.label}</span>
                  <span style={{ fontSize: 10, fontWeight: 700, color: "#0f172a" }}>{s.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ background: "white", borderRadius: 12, padding: 18, boxShadow: "0 1px 3px rgba(0,0,0,.06)", border: "1px solid #f1f5f9" }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#0f172a", marginBottom: 4 }}>Top Clients</div>
          <MiniBar data={clientDist} height={75} />
        </div>

        <div style={{ background: "white", borderRadius: 12, padding: 18, boxShadow: "0 1px 3px rgba(0,0,0,.06)", border: "1px solid #f1f5f9" }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#0f172a", marginBottom: 4 }}>Monthly Joining Trend</div>
          <MiniBar data={monthTrend} height={75} />
        </div>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
