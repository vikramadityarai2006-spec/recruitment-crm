import { useState, useEffect, useCallback } from "react";
import { api } from "../api";
import { STATUS_COLOR } from "../utils/constants";

const Spin = () => (
  <div style={{ width: 22, height: 22, border: "2.5px solid #e2e8f0", borderTop: "2.5px solid #2563eb", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto" }} />
);

// Animated counter
function CountUp({ target }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!target) return;
    let start = 0;
    const step = Math.ceil(target / 30);
    const t = setInterval(() => {
      start += step;
      if (start >= target) { setVal(target); clearInterval(t); }
      else setVal(start);
    }, 24);
    return () => clearInterval(t);
  }, [target]);
  return <>{val.toLocaleString("en-IN")}</>;
}

// Donut chart
function Donut({ data = [], size = 110 }) {
  const total = data.reduce((a, b) => a + b.value, 0) || 1;
  let cum = 0;
  const slices = data.map(d => { const pct = d.value / total; const s = cum; cum += pct; return { ...d, s, pct }; });
  const P = (cx, cy, r, a) => ({ x: cx + r * Math.cos(a - Math.PI / 2), y: cy + r * Math.sin(a - Math.PI / 2) });
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      {slices.map((s, i) => {
        if (!s.pct) return null;
        const sa = s.s * 2 * Math.PI, ea = (s.s + s.pct) * 2 * Math.PI;
        const p1 = P(50, 50, 40, sa), p2 = P(50, 50, 40, ea);
        return <path key={i} d={`M50,50 L${p1.x},${p1.y} A40,40 0 ${s.pct > .5 ? 1 : 0},1 ${p2.x},${p2.y} Z`} fill={s.color} opacity={.88} />;
      })}
      <circle cx={50} cy={50} r={27} fill="white" />
      <text x={50} y={50} textAnchor="middle" dominantBaseline="middle" fontSize={14} fontWeight={800} fill="#0f172a">{total}</text>
      <text x={50} y={61} textAnchor="middle" dominantBaseline="middle" fontSize={6.5} fill="#94a3b8" letterSpacing={0.5}>TOTAL</text>
    </svg>
  );
}

// Bar chart
function BarChart({ data = [], height = 90, color = "#3b82f6", gradient = false }) {
  const max = Math.max(...data.map(d => d.value), 1);
  const id = "g" + color.replace("#", "");
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height, paddingTop: 8 }}>
      {gradient && (
        <svg width={0} height={0} style={{ position: "absolute" }}>
          <defs>
            <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="1" />
              <stop offset="100%" stopColor={color} stopOpacity="0.4" />
            </linearGradient>
          </defs>
        </svg>
      )}
      {data.map((d, i) => (
        <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3, minWidth: 0 }}>
          <span style={{ fontSize: 9, fontWeight: 700, color: "#475569" }}>{d.value || ""}</span>
          <div
            style={{
              width: "100%",
              background: gradient ? `url(#${id}) ${color}` : (d.color || color),
              borderRadius: "4px 4px 0 0",
              height: Math.max(4, (d.value / max) * (height - 28)),
              transition: "height .5s cubic-bezier(.4,0,.2,1)",
              boxShadow: `0 2px 8px ${(d.color || color)}44`,
            }}
          />
          <span style={{ fontSize: 8, color: "#94a3b8", textAlign: "center", lineHeight: 1.2, maxWidth: "100%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{d.label}</span>
        </div>
      ))}
    </div>
  );
}

// Sparkline
function Sparkline({ data = [], color = "#2563eb", height = 36 }) {
  if (data.length < 2) return null;
  const max = Math.max(...data, 1);
  const w = 80, h = height;
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - (v / max) * h}`).join(" ");
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ overflow: "visible" }}>
      <defs>
        <linearGradient id={"spark" + color.replace("#", "")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={`0,${h} ${pts} ${w},${h}`} fill={`url(#spark${color.replace("#", "")})`} />
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function Dashboard({ refreshKey }) {
  const [s, setS] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    api.getDashboard()
      .then(d => { setS(d); setLoading(false); setLastUpdated(new Date()); })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load, refreshKey]);

  // Auto-refresh every 30s
  useEffect(() => {
    const t = setInterval(load, 30000);
    return () => clearInterval(t);
  }, [load]);

  const now = new Date();
  const timeStr = now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
  const dateStr = now.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  if (loading && !s) return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: 300, gap: 14 }}>
      <Spin />
      <span style={{ color: "#94a3b8", fontSize: 13, fontWeight: 500 }}>Loading dashboard…</span>
    </div>
  );

  if (!s) return null;

  const statusDist = (s.statusGroups || [])
    .filter(x => x.joiningStatus && x._count > 0)
    .map(x => ({ label: x.joiningStatus, value: x._count, color: STATUS_COLOR[x.joiningStatus] || "#94a3b8" }));

  const clientDist = (s.clientGroups || [])
    .filter(x => x.clientName)
    .slice(0, 8)
    .map(x => ({ label: x.clientName.length > 8 ? x.clientName.slice(0, 8) + "…" : x.clientName, value: x._count, color: "#6366f1" }));

  const monthTrend = (s.months || []).map(m => ({ label: m.label, value: m.value, color: "#22c55e" }));
  const sparkValues = (s.months || []).map(m => m.value);

  const kpis = [
    {
      label: "Total Candidates", value: s.total, icon: "👥",
      grad: ["#2563eb", "#3b82f6"], light: "#eff6ff", text: "#1d4ed8",
      spark: sparkValues, sparkColor: "#3b82f6",
      sub: "All time records"
    },
    {
      label: "Offered", value: s.offered, icon: "📋",
      grad: ["#f97316", "#fb923c"], light: "#fff7ed", text: "#c2410c",
      sub: "Awaiting joining"
    },
    {
      label: "Joined", value: s.joined, icon: "✅",
      grad: ["#16a34a", "#22c55e"], light: "#f0fdf4", text: "#15803d",
      spark: sparkValues, sparkColor: "#22c55e",
      sub: "Successfully placed"
    },
    {
      label: "Resignation Pending", value: s.resPending, icon: "⏳",
      grad: ["#dc2626", "#ef4444"], light: "#fef2f2", text: "#b91c1c",
      sub: "Awaiting clearance"
    },
    {
      label: "Joining This Month", value: s.thisMonth, icon: "📅",
      grad: ["#7c3aed", "#8b5cf6"], light: "#f5f3ff", text: "#6d28d9",
      sub: new Date().toLocaleDateString("en-IN", { month: "long", year: "numeric" })
    },
    {
      label: "Joining Next Month", value: s.nextMonth, icon: "🔜",
      grad: ["#0891b2", "#06b6d4"], light: "#ecfeff", text: "#0e7490",
      sub: new Date(now.getFullYear(), now.getMonth() + 1, 1).toLocaleDateString("en-IN", { month: "long", year: "numeric" })
    },
  ];

  return (
    <div style={{ fontFamily: "'Inter',system-ui,sans-serif" }}>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: "#0f172a", margin: 0, letterSpacing: -0.5 }}>Dashboard</h2>
          <p style={{ color: "#64748b", margin: "4px 0 0", fontSize: 13 }}>{dateStr}</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {lastUpdated && (
            <span style={{ fontSize: 11, color: "#94a3b8" }}>
              Updated {lastUpdated.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
            </span>
          )}
          <button onClick={load} style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 13px", background: "white", border: "1.5px solid #e2e8f0", borderRadius: 8, fontSize: 12, fontWeight: 600, color: "#374151", cursor: "pointer", boxShadow: "0 1px 3px rgba(0,0,0,.06)" }}>
            <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><polyline points="23 4 23 10 17 10" /><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" /></svg>
            Refresh
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(190px,1fr))", gap: 14, marginBottom: 22 }}>
        {kpis.map((k) => (
          <div key={k.label} style={{
            background: "white", borderRadius: 16, padding: "18px 20px",
            boxShadow: "0 1px 4px rgba(0,0,0,.06), 0 4px 16px rgba(0,0,0,.04)",
            border: "1px solid #f1f5f9", position: "relative", overflow: "hidden",
            transition: "transform .15s, box-shadow .15s",
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,.1)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,.06), 0 4px 16px rgba(0,0,0,.04)"; }}
          >
            {/* Decorative circle */}
            <div style={{
              position: "absolute", top: -20, right: -20, width: 80, height: 80,
              borderRadius: "50%", background: `linear-gradient(135deg,${k.grad[0]},${k.grad[1]})`, opacity: .08,
            }} />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
              <div style={{
                width: 38, height: 38, borderRadius: 10,
                background: `linear-gradient(135deg,${k.grad[0]},${k.grad[1]})`,
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, boxShadow: `0 4px 12px ${k.grad[0]}44`,
              }}>{k.icon}</div>
              {k.spark && <Sparkline data={k.spark} color={k.sparkColor} height={30} />}
            </div>
            <div style={{ fontSize: 30, fontWeight: 900, color: "#0f172a", lineHeight: 1, letterSpacing: -1, marginBottom: 4 }}>
              <CountUp target={k.value ?? 0} />
            </div>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#374151", marginBottom: 2 }}>{k.label}</div>
            <div style={{ fontSize: 10, color: "#94a3b8", fontWeight: 500 }}>{k.sub}</div>
            {/* Bottom accent */}
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 3, background: `linear-gradient(to right,${k.grad[0]},${k.grad[1]})`, opacity: .6, borderRadius: "0 0 16px 16px" }} />
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr 1fr", gap: 14, marginBottom: 14 }}>

        {/* Joining Status Donut */}
        <div style={{ background: "white", borderRadius: 16, padding: 20, boxShadow: "0 1px 4px rgba(0,0,0,.06)", border: "1px solid #f1f5f9" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 800, color: "#0f172a" }}>Joining Status</div>
              <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 1 }}>Distribution by status</div>
            </div>
            <span style={{ fontSize: 10, background: "#f0f9ff", color: "#2563eb", border: "1px solid #bfdbfe", padding: "3px 8px", borderRadius: 20, fontWeight: 600 }}>Live</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <Donut data={statusDist} size={110} />
            <div style={{ flex: 1 }}>
              {statusDist.map(s => (
                <div key={s.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: s.color, flexShrink: 0, boxShadow: `0 0 6px ${s.color}88` }} />
                    <span style={{ fontSize: 11, color: "#475569", fontWeight: 500 }}>{s.label}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <div style={{ width: 40, height: 4, borderRadius: 2, background: "#f1f5f9", overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${(s.value / (statusDist.reduce((a, b) => a + b.value, 0) || 1)) * 100}%`, background: s.color, borderRadius: 2 }} />
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 700, color: "#0f172a", minWidth: 20, textAlign: "right" }}>{s.value}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Clients */}
        <div style={{ background: "white", borderRadius: 16, padding: 20, boxShadow: "0 1px 4px rgba(0,0,0,.06)", border: "1px solid #f1f5f9" }}>
          <div style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: "#0f172a" }}>Top Clients</div>
            <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 1 }}>Candidates placed</div>
          </div>
          {clientDist.length > 0
            ? <BarChart data={clientDist} height={100} color="#6366f1" gradient />
            : <div style={{ color: "#94a3b8", fontSize: 12, textAlign: "center", padding: 30 }}>No data</div>
          }
        </div>

        {/* Monthly Trend */}
        <div style={{ background: "white", borderRadius: 16, padding: 20, boxShadow: "0 1px 4px rgba(0,0,0,.06)", border: "1px solid #f1f5f9" }}>
          <div style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: "#0f172a" }}>Monthly Joining Trend</div>
            <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 1 }}>Joinings per month</div>
          </div>
          {monthTrend.length > 0
            ? <BarChart data={monthTrend} height={100} color="#22c55e" gradient />
            : <div style={{ color: "#94a3b8", fontSize: 12, textAlign: "center", padding: 30 }}>No data</div>
          }
        </div>
      </div>

      {/* Bottom Row — Recent Activity + Quick Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>

        {/* Resignation Status Breakdown */}
        <div style={{ background: "white", borderRadius: 16, padding: 20, boxShadow: "0 1px 4px rgba(0,0,0,.06)", border: "1px solid #f1f5f9" }}>
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: "#0f172a" }}>Resignation Tracker</div>
            <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 1 }}>Current resignation status</div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {[
              { label: "Accepted", value: s.resAccepted ?? "—", bg: "#f0fdf4", color: "#16a34a", border: "#bbf7d0", icon: "✅" },
              { label: "Pending", value: s.resPending ?? "—", bg: "#fefce8", color: "#92400e", border: "#fde68a", icon: "⏳" },
              { label: "Rejected", value: s.resRejected ?? "—", bg: "#fef2f2", color: "#dc2626", border: "#fecaca", icon: "❌" },
              { label: "Not Applicable", value: s.resNA ?? "—", bg: "#f8fafc", color: "#64748b", border: "#e2e8f0", icon: "➖" },
            ].map(r => (
              <div key={r.label} style={{ background: r.bg, border: `1px solid ${r.border}`, borderRadius: 10, padding: "12px 14px", display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 18 }}>{r.icon}</span>
                <div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: r.color, lineHeight: 1 }}>{r.value}</div>
                  <div style={{ fontSize: 10, color: r.color, fontWeight: 600, marginTop: 2, opacity: .8 }}>{r.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pipeline summary */}
        <div style={{ background: "white", borderRadius: 16, padding: 20, boxShadow: "0 1px 4px rgba(0,0,0,.06)", border: "1px solid #f1f5f9" }}>
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: "#0f172a" }}>Placement Pipeline</div>
            <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 1 }}>Conversion overview</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              { label: "Total Candidates", value: s.total, max: s.total, color: "#3b82f6" },
              { label: "Offered", value: s.offered, max: s.total, color: "#f97316" },
              { label: "Joined", value: s.joined, max: s.total, color: "#22c55e" },
              { label: "Left / Backout", value: (s.left ?? 0) + (s.backout ?? 0), max: s.total, color: "#ef4444" },
            ].map(r => (
              <div key={r.label}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ fontSize: 11, fontWeight: 600, color: "#374151" }}>{r.label}</span>
                  <span style={{ fontSize: 11, fontWeight: 800, color: "#0f172a" }}>{r.value ?? 0}</span>
                </div>
                <div style={{ height: 7, background: "#f1f5f9", borderRadius: 10, overflow: "hidden" }}>
                  <div style={{
                    height: "100%", borderRadius: 10,
                    width: `${Math.min(100, ((r.value ?? 0) / (r.max || 1)) * 100)}%`,
                    background: r.color,
                    transition: "width .8s cubic-bezier(.4,0,.2,1)",
                    boxShadow: `0 0 8px ${r.color}66`,
                  }} />
                </div>
              </div>
            ))}
            {s.total > 0 && (
              <div style={{ marginTop: 4, padding: "10px 14px", background: "#f8fafc", borderRadius: 10, display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: 11, color: "#64748b", fontWeight: 600 }}>Placement Rate</span>
                <span style={{ fontSize: 13, fontWeight: 800, color: "#16a34a" }}>
                  {Math.round(((s.joined ?? 0) / s.total) * 100)}%
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
