import { useState, useEffect } from "react";
import { api } from "../api";
import { STATUS_COLOR, fmtD, fmt } from "../utils/constants";
import { Spin, MiniBar, Donut, Icon, Modal, ContactButtons } from "../components/UI";

// ─── ALERTS POPUP (auto-shows on login if there are alerts) ─────────────────
function AlertsPopup({ alerts, onClose }) {
  const [tab, setTab] = useState(() => {
    if (alerts.expiringAgreements?.length) return "agreements";
    if (alerts.upcomingDOJ?.length) return "doj";
    return "resignations";
  });

  const tabs = [
    { k: "agreements", l: "Agreement Renewals", icon: "📄", count: alerts.expiringAgreements?.length || 0 },
    { k: "doj", l: "Upcoming DOJ", icon: "📅", count: alerts.upcomingDOJ?.length || 0 },
    { k: "resignations", l: "Pending Resignations", icon: "📝", count: alerts.pendingResignations?.length || 0 },
  ].filter(t => t.count > 0);

  return (
    <Modal open={true} onClose={onClose} title="🔔 Action Required" wide>
      <div style={{ marginTop: -8 }}>
        <div style={{ display: "flex", gap: 6, marginBottom: 18, flexWrap: "wrap" }}>
          {tabs.map(t => (
            <button key={t.k} onClick={() => setTab(t.k)}
              style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 9, border: `1.5px solid ${tab === t.k ? "#2563eb" : "#e2e8f0"}`, background: tab === t.k ? "#eff6ff" : "white", cursor: "pointer", fontSize: 12, fontWeight: 700, color: tab === t.k ? "#1d4ed8" : "#374151" }}>
              <span>{t.icon}</span> {t.l}
              <span style={{ background: tab === t.k ? "#2563eb" : "#94a3b8", color: "white", borderRadius: 10, padding: "1px 7px", fontSize: 10, fontWeight: 800 }}>{t.count}</span>
            </button>
          ))}
        </div>

        {tab === "agreements" && (
          <div style={{ maxHeight: 420, overflow: "auto" }}>
            {alerts.expiringAgreements.map(a => (
              <div key={a.id} style={{ background: a.isExpired ? "#fef2f2" : "#fffbeb", border: `1px solid ${a.isExpired ? "#fecaca" : "#fde68a"}`, borderRadius: 12, padding: "14px 16px", marginBottom: 10, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 800, color: "#0f172a", fontSize: 14 }}>{a.companyName}</div>
                  <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>{a.contactName || "No contact"} · Ends {fmtD(a.agreementEndDate)}</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ padding: "4px 10px", borderRadius: 8, fontSize: 11, fontWeight: 800, whiteSpace: "nowrap", background: a.isExpired ? "#fee2e2" : "#fef9c3", color: a.isExpired ? "#dc2626" : "#92400e" }}>
                    {a.isExpired ? `⛔ Expired ${Math.abs(a.daysLeft)}d ago` : `⏳ ${a.daysLeft}d left`}
                  </span>
                  <ContactButtons phone={a.mobile} email={a.email} waMessage={`Hi ${a.contactName||""}, following up on the agreement renewal for ${a.companyName}.`}/>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "doj" && (
          <div style={{ maxHeight: 420, overflow: "auto" }}>
            {alerts.upcomingDOJ.map(d => (
              <div key={d.id} style={{ background: d.daysLeft <= 2 ? "#fef2f2" : "#eff6ff", border: `1px solid ${d.daysLeft <= 2 ? "#fecaca" : "#bfdbfe"}`, borderRadius: 12, padding: "14px 16px", marginBottom: 10, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 800, color: "#0f172a", fontSize: 14 }}>{d.candidateName}</div>
                  <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>{d.clientName || "—"} · DOJ {fmtD(d.proposedDOJ)} · Owner: {d.ownerName||"—"}</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ padding: "4px 10px", borderRadius: 8, fontSize: 11, fontWeight: 800, whiteSpace: "nowrap", background: d.daysLeft <= 2 ? "#fee2e2" : "#dbeafe", color: d.daysLeft <= 2 ? "#dc2626" : "#1d4ed8" }}>
                    {d.daysLeft === 0 ? "📅 Today" : d.daysLeft === 1 ? "📅 Tomorrow" : `📅 ${d.daysLeft}d away`}
                  </span>
                  <ContactButtons phone={d.phone} waMessage={`Hi ${d.candidateName}, confirming your joining date of ${fmtD(d.proposedDOJ)}.`}/>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "resignations" && (
          <div style={{ maxHeight: 420, overflow: "auto" }}>
            {alerts.pendingResignations.map(r => (
              <div key={r.id} style={{ background: "#fef9c3", border: "1px solid #fde68a", borderRadius: 12, padding: "14px 16px", marginBottom: 10, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 800, color: "#0f172a", fontSize: 14 }}>{r.candidateName}</div>
                  <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>{r.clientName || "—"} · Owner: {r.ownerName||"—"} {r.proposedDOJ && `· DOJ ${fmtD(r.proposedDOJ)}`}</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ padding: "4px 10px", borderRadius: 8, fontSize: 11, fontWeight: 800, whiteSpace: "nowrap", background: "#fef3c7", color: "#92400e" }}>📝 Pending</span>
                  <ContactButtons phone={r.phone} waMessage={`Hi ${r.candidateName}, following up on your resignation acceptance status.`}/>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
}

// ─── BELL ICON WITH BADGE (always visible, reopens alerts) ───────────────────
function AlertsBell({ count, onClick }) {
  if (!count) return null;
  return (
    <button onClick={onClick} style={{ position: "relative", display: "flex", alignItems: "center", gap: 6, padding: "9px 16px", background: "linear-gradient(135deg,#fef3c7,#fde68a)", border: "1px solid #fbbf24", borderRadius: 10, cursor: "pointer", fontSize: 12, fontWeight: 700, color: "#92400e" }}>
      <Icon n="bell" s={14}/> {count} alert{count > 1 ? "s" : ""} need attention
    </button>
  );
}

// ─── CONVERSION FUNNEL ────────────────────────────────────────────────────────
function ConversionFunnel({ funnel }) {
  if (!funnel) return null;
  const stages = [
    { l: "Total Candidates", v: funnel.total, c: "#2563eb", bg: "#eff6ff" },
    { l: "Offered", v: funnel.offered, c: "#f97316", bg: "#fff7ed" },
    { l: "Joined", v: funnel.joined, c: "#22c55e", bg: "#f0fdf4" },
  ];
  const max = Math.max(funnel.total, 1);
  return (
    <div style={{ background: "white", borderRadius: 14, padding: 20, boxShadow: "0 1px 3px rgba(0,0,0,.06)", border: "1px solid #f1f5f9" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", display:"flex", alignItems:"center", gap:6 }}><Icon n="trendUp" s={14}/> Recruitment Funnel</div>
        <div style={{ display: "flex", gap: 10 }}>
          <span style={{ fontSize: 11, color: "#64748b" }}>Offer rate: <strong style={{ color: "#f97316" }}>{funnel.offerRate}%</strong></span>
          <span style={{ fontSize: 11, color: "#64748b" }}>Conversion: <strong style={{ color: "#22c55e" }}>{funnel.conversionRate}%</strong></span>
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {stages.map((s, i) => (
          <div key={s.l}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: "#475569" }}>{s.l}</span>
              <span style={{ fontSize: 13, fontWeight: 800, color: s.c }}>{s.v}</span>
            </div>
            <div style={{ height: 22, background: s.bg, borderRadius: 6, overflow: "hidden", position: "relative" }}>
              <div style={{ height: "100%", width: `${Math.max(4, (s.v / max) * 100)}%`, background: s.c, borderRadius: 6, transition: "width .6s ease" }}/>
            </div>
          </div>
        ))}
        {(funnel.backout > 0 || funnel.hold > 0) && (
          <div style={{ display: "flex", gap: 8, marginTop: 4, paddingTop: 10, borderTop: "1px solid #f1f5f9" }}>
            {funnel.backout > 0 && <span style={{ fontSize: 11, background: "#fee2e2", color: "#dc2626", padding: "3px 10px", borderRadius: 8, fontWeight: 700 }}>⚠️ {funnel.backout} Backout</span>}
            {funnel.hold > 0 && <span style={{ fontSize: 11, background: "#fef9c3", color: "#92400e", padding: "3px 10px", borderRadius: 8, fontWeight: 700 }}>⏸ {funnel.hold} On Hold</span>}
          </div>
        )}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [s, setS] = useState(null);
  const [alerts, setAlerts] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAlerts, setShowAlerts] = useState(false);

  useEffect(() => {
    Promise.all([api.getDashboard(), api.getAlerts()])
      .then(([dash, al]) => {
        setS(dash); setLoading(false);
        if (al && !al.error) {
          setAlerts(al);
          // Auto-popup on login if there are alerts, once per session
          const seen = sessionStorage.getItem("alerts_seen");
          if (al.totalAlerts > 0 && !seen) {
            setShowAlerts(true);
            sessionStorage.setItem("alerts_seen", "1");
          }
        }
      })
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
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22, flexWrap: "wrap", gap: 10 }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: "#0f172a", margin: 0 }}>Dashboard</h2>
          <p style={{ color: "#64748b", margin: "3px 0 0", fontSize: 13 }}>Live recruitment overview · synced across all devices</p>
        </div>
        {alerts && <AlertsBell count={alerts.totalAlerts} onClick={() => setShowAlerts(true)} />}
      </div>

      {/* KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(150px,1fr))", gap: 12, marginBottom: 18 }}>
        {cards.map(c => (
          <div key={c.l} style={{ background: "white", borderRadius: 12, padding: 16, boxShadow: "0 1px 3px rgba(0,0,0,.06)", border: "1px solid #f1f5f9" }}>
            <div style={{ fontSize: 26, fontWeight: 800, color: c.c }}>{c.v ?? 0}</div>
            <div style={{ fontSize: 11, color: "#64748b", marginTop: 2, fontWeight: 500, lineHeight: 1.3 }}>{c.l}</div>
            <div style={{ width: 28, height: 3, background: c.c, borderRadius: 2, marginTop: 8, opacity: .4 }} />
          </div>
        ))}
      </div>

      {/* Funnel + Charts row */}
      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 14, marginBottom: 14 }}>
        <ConversionFunnel funnel={s.funnel} />

        <div style={{ background: "white", borderRadius: 14, padding: 18, boxShadow: "0 1px 3px rgba(0,0,0,.06)", border: "1px solid #f1f5f9" }}>
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
      </div>

      {/* Charts */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <div style={{ background: "white", borderRadius: 12, padding: 18, boxShadow: "0 1px 3px rgba(0,0,0,.06)", border: "1px solid #f1f5f9" }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#0f172a", marginBottom: 4 }}>Top Clients</div>
          <MiniBar data={clientDist} height={75} />
        </div>

        <div style={{ background: "white", borderRadius: 12, padding: 18, boxShadow: "0 1px 3px rgba(0,0,0,.06)", border: "1px solid #f1f5f9" }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#0f172a", marginBottom: 4 }}>Monthly Joining Trend</div>
          <MiniBar data={monthTrend} height={75} />
        </div>
      </div>

      {showAlerts && alerts && <AlertsPopup alerts={alerts} onClose={() => setShowAlerts(false)} />}

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
