import { useState, useEffect, useCallback } from "react";
import { api } from "../api";
import { fmtD } from "../utils/constants";
import { ContactButtons } from "../components/UI";

// ─── MATERIAL ICON ────────────────────────────────────────────────────────────
const M = ({ n, fill = 0, className = "" }) => (
  <span
    className={`material-symbols-outlined ${className}`}
    style={{ fontVariationSettings: `'FILL' ${fill}` }}
  >{n}</span>
);

// ─── ANIMATED BAR CHART ───────────────────────────────────────────────────────
function BarChart({ data = [] }) {
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div className="h-40 flex items-end justify-between gap-2 pt-4">
      {data.slice(-6).map((d, i, arr) => {
        const pct = Math.max((d.value / max) * 100, 4);
        const isLast = i === arr.length - 1;
        return (
          <div key={d.label} className="flex-1 flex flex-col items-center group">
            <div className="w-full bg-surface-container-high rounded-t-lg relative h-24 overflow-hidden">
              <div
                className={`absolute bottom-0 left-0 right-0 rounded-t-lg transition-all group-hover:opacity-80 ${isLast ? "bg-secondary" : "bg-primary"}`}
                style={{ height: `${pct}%` }}
              />
            </div>
            <span className={`text-[9px] font-black mt-2 uppercase ${isLast ? "text-secondary" : "text-text-tertiary"}`}>{d.label}</span>
          </div>
        );
      })}
    </div>
  );
}

// ─── SVG DONUT ────────────────────────────────────────────────────────────────
function DonutChart({ data = [], total }) {
  const R = 15.915, C = 18;
  let offset = 0;
  const slices = data.map(d => {
    const pct = total > 0 ? (d.value / total) * 100 : 0;
    const s = { ...d, pct, offset };
    offset += pct;
    return s;
  });
  return (
    <div className="relative w-48 h-48 shrink-0">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
        <circle cx={C} cy={C} r={R} fill="transparent" stroke="#f0f2f5" strokeWidth={4}/>
        {slices.map((s, i) => (
          <circle key={i} cx={C} cy={C} r={R} fill="transparent"
            stroke={s.color} strokeWidth={4}
            strokeDasharray={`${s.pct} ${100 - s.pct}`}
            strokeDashoffset={-s.offset}/>
        ))}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-3xl font-black text-primary">{total}</span>
        <span className="text-[10px] font-black text-text-tertiary uppercase tracking-widest">Pipeline</span>
      </div>
    </div>
  );
}

// ─── ALERTS DRAWER ────────────────────────────────────────────────────────────
function AlertsDrawer({ alerts, onClose, onNavigate, hideAgreements = false }) {
  // Recruiters never see agreement alerts (no Companies access).
  const agreements = hideAgreements ? [] : (alerts?.expiringAgreements || []);
  const [activeTab, setActiveTab] = useState(() => {
    if (agreements.length) return "agreements";
    if (alerts?.upcomingDOJ?.length) return "doj";
    return "resignations";
  });
  const [visible, setVisible] = useState(false);
  useEffect(() => { setTimeout(() => setVisible(true), 10); }, []);

  const close = () => { setVisible(false); setTimeout(onClose, 300); };

  const tabs = [
    { k: "agreements", l: "Agreements", icon: "description", count: agreements.length },
    { k: "doj",        l: "DOJ",        icon: "event",       count: alerts?.upcomingDOJ?.length || 0 },
    { k: "resignations",l:"Resign",     icon: "person_off",  count: alerts?.pendingResignations?.length || 0 },
  ].filter(t => t.count > 0);

  return (
    <div className="fixed inset-0 z-[200]">
      <div onClick={close} className="absolute inset-0 bg-primary/40 backdrop-blur-sm"/>
      <div className={`absolute top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl flex flex-col transition-transform duration-300 ${visible ? "translate-x-0" : "translate-x-full"}`}>
        {/* Header */}
        <div className="bg-primary p-8 text-white flex items-center justify-between">
          <div>
            <h3 className="text-xl font-black tracking-tight">Smart Notifications</h3>
            <p className="text-white/60 text-xs font-medium mt-1">
              {agreements.length+(alerts?.upcomingDOJ?.length||0)+(alerts?.pendingResignations?.length||0)} critical actions pending your review
            </p>
          </div>
          <button onClick={close} className="w-10 h-10 flex items-center justify-center bg-white/10 rounded-full hover:bg-white/20 transition-all">
            <M n="close"/>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-outline-variant">
          {tabs.map(t => (
            <button key={t.k} onClick={() => setActiveTab(t.k)}
              className={`flex-1 py-4 border-b-2 text-xs flex flex-col items-center gap-1.5 transition-all ${activeTab===t.k ? "border-secondary text-primary font-black" : "border-transparent text-text-tertiary font-bold"}`}>
              <M n={t.icon} fill={activeTab===t.k?1:0} className="text-lg"/>
              {t.l}
              <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold text-white ${activeTab===t.k ? "bg-primary" : "bg-outline-variant"}`}>{t.count}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-surface-container-low">
          {activeTab === "agreements" && agreements.map(a => (
            <div key={a.id} className={`bg-white p-5 rounded-2xl border-l-4 shadow-sm ${a.isExpired ? "border-error" : "border-secondary"}`}>
              <div className="flex items-start gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${a.isExpired ? "bg-red-50" : "bg-orange-50"}`}>
                  <M n="description" className={`text-xl ${a.isExpired ? "text-error" : "text-secondary"}`}/>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-black text-primary">{a.companyName}</p>
                  <p className="text-xs font-medium text-text-tertiary mt-0.5">{a.contactName||"—"} · <span className={`font-bold ${a.isExpired?"text-error":"text-secondary"}`}>{a.isExpired?`Expired ${Math.abs(a.daysLeft)}d ago`:`Expires in ${a.daysLeft}d`}</span></p>
                  <div className="flex items-center gap-2 mt-4 flex-wrap">
                    <button onClick={()=>{ onNavigate && onNavigate("companies", { openId: a.id }); close(); }}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white rounded-lg text-[10px] font-black whitespace-nowrap hover:-translate-y-0.5 transition-all">
                      <span className="material-symbols-outlined text-sm">edit</span> Open form
                    </button>
                    <ContactButtons phone={a.mobile} email={a.email} waMessage={`Hi ${a.contactName||""}, following up on agreement renewal for ${a.companyName}.`}/>
                    
                  </div>
                </div>
              </div>
            </div>
          ))}
          {activeTab === "doj" && (alerts?.upcomingDOJ||[]).map(d => (
            <div key={d.id} className="bg-white p-5 rounded-2xl border-l-4 border-primary shadow-sm">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center shrink-0">
                  <M n="event" className="text-xl text-primary"/>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-black text-primary">{d.candidateName}</p>
                  <p className="text-xs font-medium text-text-tertiary mt-0.5">{d.clientName||"—"} · DOJ {fmtD(d.proposedDOJ)} · <span className="font-bold text-primary">{d.daysLeft===0?"Today":d.daysLeft===1?"Tomorrow":`${d.daysLeft}d away`}</span></p>
                  <div className="flex items-center gap-2 mt-4 flex-wrap">
                    <button onClick={()=>{ onNavigate && onNavigate("candidates", { openId: d.id }); close(); }}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white rounded-lg text-[10px] font-black whitespace-nowrap hover:-translate-y-0.5 transition-all">
                      <span className="material-symbols-outlined text-sm">edit</span> Open form
                    </button>
                    <ContactButtons phone={d.phone} waMessage={`Hi ${d.candidateName}, confirming your joining on ${fmtD(d.proposedDOJ)}.`}/>
                    
                  </div>
                </div>
              </div>
            </div>
          ))}
          {activeTab === "resignations" && (alerts?.pendingResignations||[]).map(r => (
            <div key={r.id} className="bg-white p-5 rounded-2xl border-l-4 border-outline-variant shadow-sm">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center shrink-0">
                  <M n="person_off" className="text-xl text-primary"/>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-black text-primary">{r.candidateName}</p>
                  <p className="text-xs font-medium text-text-tertiary mt-0.5">{r.clientName||"—"} · Owner: {r.ownerName||"—"}{r.proposedDOJ&&` · DOJ ${fmtD(r.proposedDOJ)}`}</p>
                  <div className="flex items-center gap-2 mt-4 flex-wrap">
                    <button onClick={()=>{ onNavigate && onNavigate("candidates", { openId: r.id }); close(); }}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white rounded-lg text-[10px] font-black whitespace-nowrap hover:-translate-y-0.5 transition-all">
                      <span className="material-symbols-outlined text-sm">edit</span> Open form
                    </button>
                    <ContactButtons phone={r.phone} waMessage={`Hi ${r.candidateName}, following up on your resignation acceptance.`}/>
                    
                  </div>
                </div>
              </div>
            </div>
          ))}
          {tabs.length === 0 && (
            <div className="text-center text-text-tertiary text-sm py-10">No pending actions 🎉</div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-outline-variant bg-surface-container-lowest">
          <button onClick={close} className="w-full py-4 bg-primary text-white font-black rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-primary/20">
            <M n="check_all"/> Close Notifications
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── KPI CARD ─────────────────────────────────────────────────────────────────
function KPICard({ icon, iconBg, iconColor, label, value, bar, barColor, badge, badgeBg, badgeColor, onClick }) {
  return (
    <div onClick={onClick}
      className={`bg-white p-6 rounded-3xl border border-outline-variant shadow-sm hover:-translate-y-1 hover:shadow-xl hover:border-primary transition-all ${onClick?"cursor-pointer":""}`}>
      <div className="flex items-center justify-between mb-4">
        <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${iconBg}`}>
          <M n={icon} className={iconColor}/>
        </div>
        <span className={`text-[10px] font-extrabold px-2 py-1 rounded-lg ${badgeBg} ${badgeColor}`}>{badge}</span>
      </div>
      <p className="text-[10px] font-bold uppercase tracking-widest text-text-tertiary mb-1">{label}</p>
      <h3 className="text-2xl font-extrabold text-primary">{(value||0).toLocaleString("en-IN")}</h3>
      {typeof bar === "number" && (
        <div className="w-full h-1.5 bg-surface-container rounded-full mt-4">
          <div className={`h-full rounded-full ${barColor}`} style={{ width: `${Math.min(Math.max(bar,0),100)}%` }}/>
        </div>
      )}
    </div>
  );
}

// ─── TOTAL CANDIDATES CARD (in-range total) ───────────────────────────────────
function TotalCandidatesCard({ total, rangeLabel, onOpen }) {
  return (
    <div className="col-span-1 sm:col-span-2 bg-primary rounded-3xl p-6 relative overflow-hidden text-white shadow-2xl shadow-primary/30">
      <div className="absolute -right-5 -top-5 w-32 h-32 bg-white/5 rounded-full"/>
      <div className="relative z-10 flex flex-col h-full justify-between">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-black uppercase tracking-[0.15em] opacity-60">Candidate Database</span>
          <span className="bg-white/10 rounded-lg px-2.5 py-1 text-[10px] font-bold flex items-center gap-1.5">
            <M n="calendar_month" className="text-sm"/> {rangeLabel}
          </span>
        </div>
        <div>
          <h2 onClick={onOpen} className="text-5xl font-black tracking-tighter mt-4 cursor-pointer">
            {(total||0).toLocaleString("en-IN")}
          </h2>
          <p className="text-white/40 text-xs font-medium mt-1">
            {rangeLabel === "All time" ? "Verified talent profiles in system" : "Candidates by offer month in range"}
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── DATE RANGE CONTROL (From – To) ───────────────────────────────────────────
function DateRangeControl({ range, onChange, busy }) {
  const set = (k, v) => onChange({ ...range, [k]: v });
  const clear = () => onChange({ from: "", to: "" });
  const active = range.from || range.to;
  const inputCls = "px-2.5 py-2 rounded-lg border border-outline-variant bg-white text-primary text-xs font-semibold outline-none focus:border-primary cursor-pointer";
  return (
    <div className="flex items-center gap-2 flex-wrap bg-white border border-outline-variant rounded-xl px-3 py-2">
      <M n="date_range" className={`text-lg ${active ? "text-secondary" : "text-text-tertiary"}`} fill={active ? 1 : 0}/>
      <span className="text-[10px] font-black uppercase tracking-wider text-text-tertiary hidden lg:inline" title="Filters the dashboard by candidate offer month">Offer&nbsp;month</span>
      <div className="flex items-center gap-1.5">
        <label className="text-[10px] font-black uppercase tracking-wider text-text-tertiary">From</label>
        <input type="date" value={range.from} max={range.to || undefined} onChange={e => set("from", e.target.value)} className={inputCls}/>
      </div>
      <div className="flex items-center gap-1.5">
        <label className="text-[10px] font-black uppercase tracking-wider text-text-tertiary">To</label>
        <input type="date" value={range.to} min={range.from || undefined} onChange={e => set("to", e.target.value)} className={inputCls}/>
      </div>
      {active && (
        <button onClick={clear} title="Reset to all-time"
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-black text-text-secondary bg-surface-container hover:bg-surface-container-high transition-colors">
          <M n="restart_alt" className="text-sm"/> All time
        </button>
      )}
      {busy && <div className="w-4 h-4 border-2 border-surface-container-high border-t-secondary rounded-full animate-spin"/>}
    </div>
  );
}

// ─── STATUS BREAKDOWN STRIP (Pipeline / Red / Backout / Joined / Offered) ──────
// Rendered inside an expanded client row — mirrors the old Portfolio Health
// columns, but scoped to a single company.
const STATUS_COLS = [
  { k:"pipeline", l:"Pipeline", status:null,      on:"bg-primary text-white",              bar:"bg-primary" },
  { k:"red",      l:"Red",      status:"Red",     on:"bg-red-100 text-error",              bar:"bg-error" },
  { k:"backout",  l:"Backout",  status:"Backout", on:"bg-surface-container text-text-secondary", bar:"bg-text-tertiary" },
  { k:"joined",   l:"Joined",   status:"Joined",  on:"bg-green-600 text-white",            bar:"bg-green-600" },
  { k:"offered",  l:"Offered",  status:"Offered", on:"bg-secondary text-white",            bar:"bg-secondary" },
];

function StatusBreakdown({ row, onPick }) {
  const max = Math.max(...STATUS_COLS.map(c => row[c.k] || 0), 1);
  return (
    <div className="grid grid-cols-5 gap-2 sm:gap-3">
      {STATUS_COLS.map(c => {
        const val = row[c.k] || 0;
        return (
          <button key={c.k} onClick={(e) => { e.stopPropagation(); onPick(c.status); }}
            title={`${val} ${c.l}`}
            className="group/cell flex flex-col items-center gap-2 p-2 rounded-xl hover:bg-white transition-colors">
            {/* mini bar */}
            <div className="w-full h-14 flex items-end justify-center">
              <div className={`w-full rounded-t-md transition-all ${val > 0 ? c.bar : "bg-surface-container"} group-hover/cell:opacity-80`}
                style={{ height: `${val > 0 ? Math.max((val / max) * 100, 8) : 4}%` }}/>
            </div>
            <span className={`inline-flex items-center justify-center min-w-[26px] px-2 py-0.5 rounded-lg text-[11px] font-black ${val > 0 ? c.on : "bg-surface-container-lowest text-outline-variant border border-outline-variant"}`}>
              {val}
            </span>
            <span className="text-[9px] font-black uppercase tracking-wider text-text-tertiary">{c.l}</span>
          </button>
        );
      })}
    </div>
  );
}

// ─── TOP CLIENT ENGAGEMENT (all companies, expandable) ────────────────────────
function ClientEngagement({ rows, onPick, onOpenClient }) {
  const [query, setQuery] = useState("");
  const [openName, setOpenName] = useState(null);

  const filtered = rows.filter(r => (r.clientName || "").toLowerCase().includes(query.trim().toLowerCase()));
  const maxTotal = Math.max(...rows.map(r => r.total || 0), 1);

  return (
    <div className="bg-white p-8 rounded-[2.5rem] border border-outline-variant shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h4 className="text-2xl font-extrabold text-primary tracking-tight">Top Client Engagement</h4>
          <p className="text-text-tertiary font-medium mt-1 text-sm">
            Click any company to see its Pipeline, Red, Backout, Joined and Offered breakdown.
          </p>
        </div>
        <span className="text-[10px] font-black uppercase tracking-widest text-text-tertiary bg-surface-container px-3 py-1.5 rounded-lg whitespace-nowrap">
          {rows.length} {rows.length === 1 ? "Company" : "Companies"}
        </span>
      </div>

      {rows.length > 6 && (
        <div className="relative mb-4">
          <M n="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-lg text-text-tertiary"/>
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search company…"
            className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-outline-variant bg-surface-container-lowest text-sm font-semibold text-primary outline-none focus:border-primary focus:bg-white transition-colors"/>
        </div>
      )}

      {rows.length === 0 ? (
        <div className="text-center text-text-tertiary py-10 text-sm">No client data yet</div>
      ) : filtered.length === 0 ? (
        <div className="text-center text-text-tertiary py-10 text-sm">No company matches “{query}”</div>
      ) : (
        <div className="divide-y divide-surface-container max-h-[560px] overflow-y-auto -mx-2 px-2">
          {filtered.map((c, i) => {
            const isOpen = openName === c.clientName;
            const pct = Math.round(((c.total || 0) / maxTotal) * 100);
            const isTop = i === 0 && !query;
            return (
              <div key={c.clientName} className="py-2">
                {/* Row header — click to expand */}
                <div onClick={() => setOpenName(isOpen ? null : c.clientName)}
                  className={`group flex items-center justify-between gap-4 p-4 rounded-2xl cursor-pointer transition-all ${isOpen ? "bg-surface-container-low" : "hover:bg-surface-container-low"}`}>
                  <div className="flex items-center gap-4 min-w-0">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${isTop ? "bg-orange-50" : "bg-primary/5"}`}>
                      <M n="domain" className={isTop ? "text-secondary" : "text-primary"}/>
                    </div>
                    <div className="min-w-0">
                      <p className="font-black text-primary truncate max-w-[180px] sm:max-w-[260px]">{c.clientName}</p>
                      <p className="text-xs font-medium text-text-tertiary">
                        {isTop ? "Tier 1 Strategic Partner" : "Active Client"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <p className="text-lg font-black text-primary">
                        {(c.total || 0)} <span className="text-[10px] text-text-tertiary font-bold">CANDIDATES</span>
                      </p>
                      <div className="w-24 h-1.5 bg-surface-container rounded-full mt-1.5 ml-auto">
                        <div className={`h-full rounded-full ${isTop ? "bg-secondary" : "bg-primary"}`} style={{ width: `${pct}%` }}/>
                      </div>
                    </div>
                    <M n={isOpen ? "expand_less" : "expand_more"}
                      className={`text-2xl transition-colors ${isOpen ? "text-primary" : "text-outline-variant group-hover:text-primary"}`}/>
                  </div>
                </div>

                {/* Expanded breakdown */}
                {isOpen && (
                  <div className="mt-1 mb-2 mx-2 p-5 bg-surface-container-low rounded-2xl border border-outline-variant">
                    <StatusBreakdown row={c} onPick={(status) => onPick(c.clientName, status)}/>
                    <div className="flex items-center justify-between gap-3 mt-5 pt-4 border-t border-surface-container flex-wrap">
                      <p className="text-[11px] font-semibold text-text-tertiary">
                        Click a bar to open that candidate list.
                      </p>
                      <button onClick={(e) => { e.stopPropagation(); onOpenClient(c.clientName); }}
                        className="flex items-center gap-1.5 px-4 py-2 bg-primary text-white rounded-xl text-[11px] font-black hover:-translate-y-0.5 transition-all shadow-md shadow-primary/20">
                        <M n="open_in_new" className="text-sm"/> Full client page
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── MAIN DASHBOARD ───────────────────────────────────────────────────────────
export default function Dashboard({ onNavigate, user }) {
  const [data, setData]       = useState(null);
  const [alerts, setAlerts]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError]     = useState("");
  const [showDrawer, setShowDrawer] = useState(false);
  const [range, setRange]     = useState({ from: "", to: "" }); // From–To (empty = all-time)

  const loadDashboard = useCallback((r) => {
    const p = {};
    if (r.from) p.from = r.from;
    if (r.to)   p.to = r.to;
    return api.getDashboard(p).then(dash => {
      if (dash && dash.error) { setError(dash.error); return; }
      setData(dash); setError("");
    });
  }, []);

  // Refetch the whole dashboard whenever the date range changes.
  useEffect(() => {
    const initial = data === null;
    initial ? setLoading(true) : setRefreshing(true);
    loadDashboard(range)
      .catch(e => setError(e.message))
      .finally(() => { setLoading(false); setRefreshing(false); });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [range, loadDashboard]);

  // Alerts load once on mount (not affected by the date range).
  useEffect(() => {
    api.getAlerts().then(al => {
      if (al && !al.error) {
        setAlerts(al);
        const seen = sessionStorage.getItem("alerts_seen");
        if (al.totalAlerts > 0 && !seen) { setShowDrawer(true); sessionStorage.setItem("alerts_seen","1"); }
      }
    });
  }, []);

  if (loading) return (
    <div className="flex flex-col items-center justify-center gap-3.5" style={{ height: 280 }}>
      <div className="w-9 h-9 border-4 border-surface-container-high border-t-primary rounded-full animate-spin"/>
      <span className="text-text-tertiary text-sm">Loading dashboard…</span>
    </div>
  );
  if (error) return <div className="text-error bg-error-bg p-5 rounded-2xl">Error: {error}</div>;
  if (!data) return null;

  const { total=0, offered=0, joined=0, resPending=0, thisMonth=0, statusGroups=[], months=[],
          funnel={}, clientStatusBreakdown=[] } = data;

  const fmtRange = (d) => { try { return new Date(d).toLocaleDateString("en-IN", { day:"2-digit", month:"short", year:"numeric" }); } catch { return d; } };
  const rangeLabel = (!range.from && !range.to) ? "All time"
    : range.from && range.to ? `${fmtRange(range.from)} → ${fmtRange(range.to)}`
    : range.from ? `Since ${fmtRange(range.from)}`
    : `Until ${fmtRange(range.to)}`;

  const monthRange = (offset=0) => {
    const now=new Date(); const s=new Date(now.getFullYear(),now.getMonth()+offset,1); const e=new Date(now.getFullYear(),now.getMonth()+offset+1,0);
    return { from:s.toISOString().slice(0,10), to:e.toISOString().slice(0,10) };
  };
  const nav = (page, filter) => onNavigate && onNavigate(page, filter);

  const isRecruiter = user?.role === "recruiter";
  const pct = (n) => total > 0 ? Math.round((n / total) * 100) : 0;
  // Backout count: prefer the funnel figure, fall back to summing the client breakdown.
  const backout = funnel.backout ?? (clientStatusBreakdown||[]).reduce((a,r)=>a+(r.backout||0),0);

  const kpiCards = [
    { icon:"assignment_turned_in", iconBg:"bg-orange-50",  iconColor:"text-secondary", label:"Offered",            value:offered,    bar:pct(offered), barColor:"bg-secondary",  badge:total?`${Math.round((offered/total)*100)}% of total`:"—", badgeBg:"bg-orange-50", badgeColor:"text-secondary", onClick:()=>nav("candidates", {statuses:["Offered"]}) },
    { icon:"verified",             iconBg:"bg-green-50",   iconColor:"text-green-600", label:"Joined",             value:joined,     bar:pct(joined), barColor:"bg-green-600",  badge:offered?`${Math.round((joined/offered)*100)}% of offers`:"—", badgeBg:"bg-green-50", badgeColor:"text-green-600", onClick:()=>nav("candidates", {statuses:["Joined"]}) },
    // Backout — always shown in red, it is the dashboard's warning metric.
    { icon:"person_cancel",        iconBg:"bg-red-50",     iconColor:"text-error",     label:"Backout",            value:backout,    bar:pct(backout), barColor:"bg-error",      badge:backout>0?"Risk":"Clear", badgeBg:backout>0?"bg-red-100":"bg-green-50", badgeColor:backout>0?"text-error":"text-green-600", onClick:()=>nav("candidates", {statuses:["Backout"]}) },
    // Agreements are a Companies-page concern. Recruiters have no Companies
    // access (the API returns them no agreements), so the card is hidden for them.
    ...(isRecruiter ? [] : [{ icon:"gavel", iconBg:"bg-red-50", iconColor:"text-error", label:"Agreements", value:alerts?.expiringAgreements?.length||0, barColor:"bg-error", badge:"Action", badgeBg:"bg-red-100", badgeColor:"text-error", onClick:()=>nav("companies") }]),
    { icon:"calendar_today",       iconBg:"bg-surface-container", iconColor:"text-primary", label:"Joining This Month", value:thisMonth,  bar:pct(thisMonth), barColor:"bg-primary",    badge:"This month", badgeBg:"bg-surface-container", badgeColor:"text-text-secondary", onClick:()=>nav("candidates", {actualFrom:monthRange(0).from, actualTo:monthRange(0).to}) },
    { icon:"cancel_presentation",  iconBg:"bg-surface-container", iconColor:"text-text-secondary", label:"Resignations", value:resPending, bar:pct(resPending), barColor:"bg-text-tertiary", badge:resPending>0?"Alert":"Clear", badgeBg:resPending>0?"bg-orange-100":"bg-green-50", badgeColor:resPending>0?"text-secondary":"text-green-600", onClick:()=>nav("candidates", {resignations:["Pending"]}) },
  ];

  const statusColors = { Joined:"#16a34a", Offered:"#E67E22", Backout:"#ba1a1a", Hold:"#F97316", "In Process":"#001c3e" };
  const donutData = (statusGroups||[]).filter(x=>x.joiningStatus&&x._count?._all>0).map(x=>({ label:x.joiningStatus, value:x._count._all, color:statusColors[x.joiningStatus]||"#737780" }));
  const donutTotal = donutData.reduce((a,b)=>a+b.value,0);


  const monthData = (months||[]).map(m=>({ label:m.label, value:m.value }));

  const alertCount = (isRecruiter ? 0 : (alerts?.expiringAgreements?.length||0))+(alerts?.upcomingDOJ?.length||0)+(alerts?.pendingResignations?.length||0);

  const funnelStages = [
    { label:"Active Pipeline Pool", value:total,  className:"bg-primary",   onClick:()=>nav("candidates",{}) },
    { label:"Offers Extended",      value:offered, className:"bg-secondary", onClick:()=>nav("candidates",{statuses:["Offered"]}) },
    { label:"Successful Hires",     value:joined,  className:"bg-green-600", onClick:()=>nav("candidates",{statuses:["Joined"]}) },
  ];
  const convRate = offered > 0 ? Math.round((joined/offered)*100) : 0;
  const offerRate = total > 0 ? Math.round((offered/total)*100) : 0;
  const retention = (joined+backout) > 0 ? Math.round((joined/(joined+backout))*100) : 100;

  return (
    <div className="font-sans">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <h1 className="text-4xl font-black text-primary tracking-tight">Intelligence Dashboard</h1>
          <p className="text-text-tertiary text-lg font-medium mt-1">Analyze your recruitment funnel and candidate trends.</p>
        </div>
        <div className="flex items-center gap-4 flex-wrap">
          <DateRangeControl range={range} onChange={setRange} busy={refreshing}/>
          {alertCount > 0 && (
            <button onClick={()=>setShowDrawer(true)}
              className="relative flex items-center gap-2 px-6 py-3.5 bg-white border-2 border-secondary rounded-xl cursor-pointer text-secondary font-extrabold hover:bg-orange-50 transition-all">
              <M n="notifications_active" fill={1}/>
              <span>{alertCount} Critical Action{alertCount>1?"s":""}</span>
            </button>
          )}
          <button onClick={() => window.print()}
            className="flex items-center gap-2 px-6 py-3.5 bg-white border border-outline-variant text-primary rounded-xl font-extrabold hover:bg-surface-container-low transition-all">
            <M n="download"/>
            <span>Export PDF</span>
          </button>
          <button onClick={()=>nav("candidates", {})} className="flex items-center gap-2 px-6 py-3.5 bg-primary text-white rounded-xl font-extrabold shadow-xl shadow-primary/20 hover:-translate-y-0.5 transition-all">
            <M n="add"/>
            <span>Add Candidate</span>
          </button>
        </div>
      </header>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-5 mb-10">
        <TotalCandidatesCard total={total} rangeLabel={rangeLabel} onOpen={()=>nav("candidates", {})} />
        {kpiCards.map(c => <KPICard key={c.label} {...c}/>)}
      </div>

      {/* Main Visuals Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 mb-10">

        {/* Recruitment Funnel */}
        <div className="lg:col-span-3 bg-white p-8 rounded-[2.5rem] border border-outline-variant shadow-sm">
          <div className="flex items-start justify-between mb-10">
            <div>
              <h4 className="text-2xl font-extrabold text-primary tracking-tight">Conversion Funnel</h4>
              <p className="text-text-tertiary font-medium mt-1">End-to-end talent lifecycle efficiency.</p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-surface-container rounded-xl text-primary text-xs font-black">
              <M n="bar_chart" className="text-sm"/> Live Metrics
            </div>
          </div>
          <div className="space-y-4">
            {funnelStages.map((s,i) => (
              <div key={s.label}>
                <div onClick={s.onClick}
                  className={`group relative flex items-center justify-between p-6 rounded-2xl h-20 transition-all ${s.className} ${s.onClick?"cursor-pointer hover:translate-x-2":""}`}
                  style={{ marginLeft: i===1?"2.5rem":i===2?"5rem":0 }}>
                  <span className="text-white font-bold text-lg">{s.label}</span>
                  <div className="flex items-center gap-4">
                    <span className="text-white font-black text-3xl">{(s.value||0).toLocaleString("en-IN")}</span>
                    <M n="chevron_right" className="text-white/40"/>
                  </div>
                </div>
                {i<funnelStages.length-1 && (
                  <div className="flex justify-center -my-2" style={{ marginLeft: i===0?0:"2.5rem" }}>
                    <div className="bg-white border-2 border-outline-variant px-4 py-1.5 rounded-full text-[10px] font-black text-primary flex items-center gap-1.5 shadow-md">
                      <M n="auto_graph" className={`text-sm ${i===0?"text-secondary":"text-green-600"}`}/>
                      {i===0?`${offerRate}%`:`${convRate}%`} Conversion
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-4 mt-12 pt-8 border-t border-surface-container">
            <div className="text-center">
              <p className="text-[10px] font-black text-text-tertiary uppercase tracking-widest mb-1">Offer/Lead</p>
              <p className="text-2xl font-black text-primary">{offerRate}%</p>
            </div>
            <div className="text-center border-x border-surface-container">
              <p className="text-[10px] font-black text-text-tertiary uppercase tracking-widest mb-1">Success Rate</p>
              <p className="text-2xl font-black text-primary">{convRate}%</p>
            </div>
            <div className="text-center">
              <p className="text-[10px] font-black text-text-tertiary uppercase tracking-widest mb-1">Retention</p>
              <p className="text-2xl font-black text-primary">{retention}%</p>
            </div>
          </div>
        </div>

        {/* Donut Chart & Status */}
        <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] border border-outline-variant shadow-sm flex flex-col">
          <h4 className="text-2xl font-extrabold text-primary tracking-tight mb-8">Talent Status</h4>
          <div className="flex-1 flex flex-col items-center justify-center mb-8 relative">
            <DonutChart data={donutData} total={donutTotal}/>
          </div>
          <div className="space-y-2">
            {donutData.length===0 && <div className="text-center text-text-tertiary text-sm py-4">No status data yet</div>}
            {donutData.map(s=>(
              <div key={s.label} onClick={()=>nav("candidates",{statuses:[s.label]})}
                className="flex items-center justify-between p-3.5 bg-surface-container-low border border-transparent hover:border-outline-variant hover:bg-white rounded-2xl cursor-pointer transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: s.color }}/>
                  <span className="text-sm font-bold text-primary">{s.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-black text-primary">{s.value}</span>
                  <span className="text-[10px] font-bold bg-surface-container px-1.5 py-0.5 rounded text-text-tertiary">{donutTotal>0?Math.round((s.value/donutTotal)*100):0}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Secondary Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* Top Clients — all companies, expandable to status breakdown */}
        <ClientEngagement
          rows={clientStatusBreakdown}
          onPick={(clientName, status) =>
            nav("candidates", status ? { clients:[clientName], statuses:[status] } : { clients:[clientName] })}
          onOpenClient={(clientName) =>
            nav("client-detail", { clientName, from: range.from, to: range.to })}
        />

        {/* Monthly Volume */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-outline-variant shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h4 className="text-2xl font-extrabold text-primary tracking-tight">Monthly Volume</h4>
            <div className="flex gap-4">
              <div className="flex items-center gap-1.5 text-[10px] font-black text-text-tertiary">
                <div className="w-2 h-2 rounded-sm bg-primary"/> ACTUALS
              </div>
              <div className="flex items-center gap-1.5 text-[10px] font-black text-text-tertiary">
                <div className="w-2 h-2 rounded-sm bg-secondary"/> PEAK
              </div>
            </div>
          </div>
          {monthData.length===0
            ? <div className="text-center text-text-tertiary py-10 text-sm">No monthly data yet</div>
            : <BarChart data={monthData}/>
          }
        </div>
      </div>

      {showDrawer && alerts && <AlertsDrawer alerts={alerts} hideAgreements={isRecruiter} onClose={()=>setShowDrawer(false)} onNavigate={onNavigate}/>}
    </div>
  );
}
