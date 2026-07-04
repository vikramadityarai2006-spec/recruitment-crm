import { useState, useEffect, useRef } from "react";
import { api } from "../api";
import { fmtD } from "../utils/constants";
import { ContactButtons } from "../components/UI";

// ─── MATERIAL ICON ────────────────────────────────────────────────────────────
const M = ({ n, fill = 0, size = 20, style = {} }) => (
  <span style={{
    fontFamily: "Material Symbols Outlined",
    fontVariationSettings: `'FILL' ${fill},'wght' 400,'GRAD' 0,'opsz' 24`,
    fontSize: size, display: "inline-block", verticalAlign: "middle",
    lineHeight: 1, userSelect: "none", ...style
  }}>{n}</span>
);

// ─── ANIMATED BAR CHART ───────────────────────────────────────────────────────
function BarChart({ data = [] }) {
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 6, height: 160 }}>
      {data.slice(-6).map((d, i, arr) => {
        const pct = Math.max((d.value / max) * 100, 4);
        const isLast = i === arr.length - 1;
        return (
          <div key={d.label} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", height: "100%" }}>
            <div style={{ flex: 1, width: "100%", position: "relative", borderRadius: "6px 6px 0 0", background: "#e5eeff", overflow: "hidden" }}>
              <div style={{
                position: "absolute", bottom: 0, left: 0, right: 0,
                height: `${pct}%`,
                background: isLast ? "#E67E22" : "#003163",
                borderRadius: "6px 6px 0 0",
                transition: "height 1s ease",
              }}/>
            </div>
            <span style={{ fontSize: 10, marginTop: 6, fontWeight: 700, color: isLast ? "#003163" : "#43474f", textTransform: "uppercase" }}>{d.label}</span>
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
  const circ = 2 * Math.PI * R;
  const slices = data.map(d => {
    const pct = total > 0 ? (d.value / total) * 100 : 0;
    const s = { ...d, pct, offset };
    offset += pct;
    return s;
  });
  return (
    <div style={{ position: "relative", width: 176, height: 176, flexShrink: 0 }}>
      <svg viewBox="0 0 36 36" style={{ width: "100%", height: "100%", transform: "rotate(-90deg)" }}>
        <circle cx={C} cy={C} r={R} fill="transparent" stroke="#e5eeff" strokeWidth={3}/>
        {slices.map((s, i) => (
          <circle key={i} cx={C} cy={C} r={R} fill="transparent"
            stroke={s.color} strokeWidth={3}
            strokeDasharray={`${s.pct} ${100 - s.pct}`}
            strokeDashoffset={-s.offset}/>
        ))}
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
        <span style={{ fontSize: 28, fontWeight: 700, color: "#003163", lineHeight: 1 }}>{total}</span>
        <span style={{ fontSize: 10, textTransform: "uppercase", fontWeight: 700, color: "#43474f", marginTop: 2, letterSpacing: ".05em" }}>Pipeline</span>
      </div>
    </div>
  );
}

// ─── ALERTS DRAWER ────────────────────────────────────────────────────────────
function AlertsDrawer({ alerts, onClose, onUpdated }) {
  const [busyId, setBusyId] = useState(null);
  const [doneIds, setDoneIds] = useState(() => new Set());

  const markJoined = async (c) => {
    setBusyId(c.id);
    try {
      const r = await api.updateCandidate(c.id, { actualDOJ: new Date().toISOString().slice(0,10) });
      if (r.error) { alert(r.error); } else { setDoneIds(s=>new Set(s).add(c.id)); onUpdated && onUpdated(); }
    } catch(e) { alert(e.message); }
    setBusyId(null);
  };
  const markResignationAccepted = async (c) => {
    setBusyId(c.id);
    try {
      const r = await api.updateCandidate(c.id, { resignationAcceptance: "Accepted" });
      if (r.error) { alert(r.error); } else { setDoneIds(s=>new Set(s).add(c.id)); onUpdated && onUpdated(); }
    } catch(e) { alert(e.message); }
    setBusyId(null);
  };
  const renewAgreement = async (a) => {
    const input = window.prompt(`New agreement end date for ${a.companyName} (YYYY-MM-DD):`, "");
    if (!input) return;
    setBusyId(a.id);
    try {
      const r = await api.updateCompany(a.id, { agreementEndDate: input });
      if (r.error) { alert(r.error); } else { setDoneIds(s=>new Set(s).add(a.id)); onUpdated && onUpdated(); }
    } catch(e) { alert(e.message); }
    setBusyId(null);
  };

  const UpdateKey = ({ label, onClick, id, color="#003163" }) => doneIds.has(id) ? (
    <span style={{ fontSize:11, fontWeight:700, color:"#16a34a", display:"flex", alignItems:"center", gap:4, whiteSpace:"nowrap" }}>
      <M n="check_circle" size={14} fill={1}/> Updated
    </span>
  ) : (
    <button onClick={onClick} disabled={busyId===id} style={{ display:"flex", alignItems:"center", gap:4, padding:"6px 10px", background:color, color:"white", border:"none", borderRadius:8, fontSize:11, fontWeight:700, cursor:busyId===id?"default":"pointer", opacity:busyId===id?.6:1, whiteSpace:"nowrap" }}>
      <M n="update" size={13}/> {busyId===id?"...":label}
    </button>
  );

  const [activeTab, setActiveTab] = useState(() => {
    if (alerts?.expiringAgreements?.length) return "agreements";
    if (alerts?.upcomingDOJ?.length) return "doj";
    return "resignations";
  });
  const [visible, setVisible] = useState(false);
  useEffect(() => { setTimeout(() => setVisible(true), 10); }, []);

  const close = () => { setVisible(false); setTimeout(onClose, 300); };

  const tabs = [
    { k: "agreements", l: "Agreements", icon: "description", count: alerts?.expiringAgreements?.length || 0 },
    { k: "doj",        l: "Upcoming DOJ", icon: "event",       count: alerts?.upcomingDOJ?.length || 0 },
    { k: "resignations",l:"Resignations", icon: "person_off",   count: alerts?.pendingResignations?.length || 0 },
  ].filter(t => t.count > 0);

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 200 }}>
      <div onClick={close} style={{ position: "absolute", inset: 0, background: "rgba(0,49,99,.2)", backdropFilter: "blur(3px)" }}/>
      <div style={{
        position: "absolute", right: 0, top: 0, bottom: 0, width: "100%", maxWidth: 440,
        background: "white", boxShadow: "-8px 0 40px rgba(0,0,0,.15)",
        display: "flex", flexDirection: "column",
        transform: visible ? "translateX(0)" : "translateX(100%)",
        transition: "transform .3s cubic-bezier(.4,0,.2,1)",
      }}>
        {/* Header */}
        <div style={{ padding: "20px 24px", background: "linear-gradient(135deg,#003163,#001c3e)", color: "white", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <h3 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>Action Required</h3>
            <p style={{ fontSize: 13, opacity: .8, marginTop: 4 }}>
              {(alerts?.expiringAgreements?.length||0)+(alerts?.upcomingDOJ?.length||0)+(alerts?.pendingResignations?.length||0)} tasks need your attention
            </p>
          </div>
          <button onClick={close} style={{ background: "rgba(255,255,255,.1)", border: "none", borderRadius: 8, padding: 6, cursor: "pointer", color: "white", display: "flex" }}>
            <M n="close" size={20}/>
          </button>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 0, borderBottom: "1px solid #c3c6d1" }}>
          {tabs.map(t => (
            <button key={t.k} onClick={() => setActiveTab(t.k)} style={{ flex: 1, padding: "10px 8px", border: "none", background: "white", cursor: "pointer", borderBottom: `2px solid ${activeTab===t.k?"#003163":"transparent"}`, color: activeTab===t.k?"#003163":"#43474f", fontWeight: activeTab===t.k?700:500, fontSize: 12, display: "flex", flexDirection: "column", alignItems: "center", gap: 4, transition: "all .15s" }}>
              <M n={t.icon} size={18} fill={activeTab===t.k?1:0}/>
              {t.l}
              <span style={{ background: activeTab===t.k?"#003163":"#c3c6d1", color: "white", borderRadius: 10, padding: "1px 6px", fontSize: 10, fontWeight: 700 }}>{t.count}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflow: "auto", padding: 16, display: "flex", flexDirection: "column", gap: 10 }}>
          {activeTab === "agreements" && (alerts?.expiringAgreements||[]).map(a => (
            <div key={a.id} style={{ padding: 16, background: a.isExpired?"#ffdad6":"#fff8ee", border: `1px solid ${a.isExpired?"#ba1a1a33":"#E67E2233"}`, borderRadius: 12, display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: "50%", background: a.isExpired?"#ba1a1a":"#E67E22", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <M n="description" size={18} style={{ color: "white" }}/>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, color: "#0b1c30", fontSize: 14 }}>{a.companyName}</div>
                <div style={{ fontSize: 12, color: "#43474f", marginTop: 2 }}>{a.contactName||"—"} · {a.isExpired?`Expired ${Math.abs(a.daysLeft)}d ago`:`${a.daysLeft}d left`}</div>
              </div>
              <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:6 }}>
                <ContactButtons phone={a.mobile} email={a.email} waMessage={`Hi ${a.contactName||""}, following up on agreement renewal for ${a.companyName}.`}/>
                <UpdateKey label="Renew" id={a.id} onClick={()=>renewAgreement(a)} color="#E67E22"/>
              </div>
            </div>
          ))}
          {activeTab === "doj" && (alerts?.upcomingDOJ||[]).map(d => (
            <div key={d.id} style={{ padding: 16, background: "#eff4ff", border: "1px solid #003163" + "22", borderRadius: 12, display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#E67E22", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <M n="event" size={18} style={{ color: "white" }}/>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, color: "#0b1c30", fontSize: 14 }}>{d.candidateName}</div>
                <div style={{ fontSize: 12, color: "#43474f", marginTop: 2 }}>{d.clientName||"—"} · DOJ {fmtD(d.proposedDOJ)} · {d.daysLeft===0?"Today":d.daysLeft===1?"Tomorrow":`${d.daysLeft}d away`}</div>
              </div>
              <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:6 }}>
                <ContactButtons phone={d.phone} waMessage={`Hi ${d.candidateName}, confirming your joining on ${fmtD(d.proposedDOJ)}.`}/>
                <UpdateKey label="Mark Joined" id={d.id} onClick={()=>markJoined(d)}/>
              </div>
            </div>
          ))}
          {activeTab === "resignations" && (alerts?.pendingResignations||[]).map(r => (
            <div key={r.id} style={{ padding: 16, background: "#f8f9fa", border: "1px solid #c3c6d1", borderRadius: 12, display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#e5eeff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <M n="person_off" size={18} style={{ color: "#003163" }}/>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, color: "#0b1c30", fontSize: 14 }}>{r.candidateName}</div>
                <div style={{ fontSize: 12, color: "#43474f", marginTop: 2 }}>{r.clientName||"—"} · Owner: {r.ownerName||"—"}{r.proposedDOJ&&` · DOJ ${fmtD(r.proposedDOJ)}`}</div>
              </div>
              <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:6 }}>
                <ContactButtons phone={r.phone} waMessage={`Hi ${r.candidateName}, following up on your resignation acceptance.`}/>
                <UpdateKey label="Mark Accepted" id={r.id} onClick={()=>markResignationAccepted(r)}/>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{ padding: 16, borderTop: "1px solid #c3c6d1", background: "#f8f9fa" }}>
          <button onClick={close} style={{ width: "100%", padding: "12px", background: "#003163", color: "white", border: "none", borderRadius: 12, fontWeight: 700, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            <M n="done_all" size={18} style={{ color: "white" }}/> Mark all as seen
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── KPI CARD ─────────────────────────────────────────────────────────────────
function KPICard({ icon, label, value, bar, barColor, badge, badgeColor, delay = 0, onClick }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => { const t = setTimeout(() => setVisible(true), delay); return () => clearTimeout(t); }, [delay]);
  return (
    <div onClick={onClick} style={{
      background: "white", padding: 16, borderRadius: 12, border: "1px solid #c3c6d1",
      opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(10px)",
      transition: "all .6s ease-out", cursor: onClick ? "pointer" : "default",
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 10px 25px -5px rgba(0,0,0,.08)"; }}
      onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: "#dce9ff", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <M n={icon} size={18} style={{ color: "#003163" }}/>
        </div>
        <span style={{ fontSize: 11, fontWeight: 700, color: badgeColor || "#43474f" }}>{badge}</span>
      </div>
      <p style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".08em", color: "#43474f", marginBottom: 4 }}>{label}</p>
      <h4 style={{ fontSize: 24, fontWeight: 700, color: "#0b1c30", margin: 0 }}>{(value||0).toLocaleString("en-IN")}</h4>
      <div style={{ marginTop: 12, height: 4, width: "100%", background: "#e5eeff", borderRadius: 99 }}>
        <div style={{ height: "100%", width: `${Math.min(bar, 100)}%`, background: barColor || "#003163", borderRadius: 99, transition: "width 1s ease" }}/>
      </div>
    </div>
  );
}

// ─── MAIN DASHBOARD ───────────────────────────────────────────────────────────
export default function Dashboard({ onNavigate }) {
  const [data, setData]       = useState(null);
  const [alerts, setAlerts]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");
  const [showDrawer, setShowDrawer] = useState(false);

  const refresh = () => {
    Promise.all([api.getDashboard(), api.getAlerts()])
      .then(([dash, al]) => {
        setData(dash); setLoading(false);
        if (al && !al.error) setAlerts(al);
      })
      .catch(e => { setError(e.message); setLoading(false); });
  };

  useEffect(() => {
    api.getDashboard().then(dash => { setData(dash); setLoading(false); }).catch(e => { setError(e.message); setLoading(false); });
    api.getAlerts().then(al => {
      if (al && !al.error) {
        setAlerts(al);
        const seen = sessionStorage.getItem("alerts_seen");
        if (al.totalAlerts > 0 && !seen) { setShowDrawer(true); sessionStorage.setItem("alerts_seen","1"); }
      }
    });
  }, []);

  if (loading) return (
    <div style={{ display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:280,gap:14 }}>
      <div style={{ width:36,height:36,border:"3px solid #e5eeff",borderTop:"3px solid #003163",borderRadius:"50%",animation:"spin .8s linear infinite" }}/>
      <span style={{ color:"#43474f",fontSize:13 }}>Loading dashboard…</span>
    </div>
  );
  if (error) return <div style={{ color:"#ba1a1a",padding:20,background:"#ffdad6",borderRadius:12 }}>Error: {error}</div>;
  if (!data) return null;

  const { total=0, offered=0, joined=0, resPending=0, thisMonth=0, nextMonth=0, funnel, statusGroups=[], clientGroups=[], months=[] } = data;

  const goToday = () => { const d=new Date(); return d.toISOString().slice(0,10); };
  const monthRange = (offset=0) => {
    const now=new Date(); const s=new Date(now.getFullYear(),now.getMonth()+offset,1); const e=new Date(now.getFullYear(),now.getMonth()+offset+1,0);
    return { from:s.toISOString().slice(0,10), to:e.toISOString().slice(0,10) };
  };
  const nav = (page, filter) => onNavigate && onNavigate(page, filter);

  const kpiCards = [
    { icon:"person_search", label:"Total Candidates", value:total,      bar:75, barColor:"#003163", badge:"+12%",        badgeColor:"#22C55E", onClick:()=>nav("candidates", {}) },
    { icon:"assignment_turned_in",label:"Offered",    value:offered,    bar:40, barColor:"#E67E22", badge:"+5%",         badgeColor:"#22C55E", onClick:()=>nav("candidates", {statuses:["Offered"]}) },
    { icon:"verified",      label:"Joined",           value:joined,     bar:65, barColor:"#22C55E", badge:"+8%",         badgeColor:"#22C55E", onClick:()=>nav("candidates", {statuses:["Joined"]}) },
    { icon:"contract",      label:"Agreements",       value:0,          bar:30, barColor:"#ba1a1a", badge:"Check now",   badgeColor:"#ba1a1a", onClick:()=>nav("companies") },
    { icon:"calendar_today",label:"Joining This Month",value:thisMonth,  bar:55, barColor:"#003163", badge:"This month",  badgeColor:"#43474f", onClick:()=>nav("candidates", {actualFrom:monthRange(0).from, actualTo:monthRange(0).to}) },
    { icon:"person_off",    label:"Resign Pending",   value:resPending,  bar:15, barColor:"#737780", badge:resPending>0?"Action needed":"Clear", badgeColor:resPending>0?"#F97316":"#22C55E", onClick:()=>nav("candidates", {resignations:["Pending"]}) },
  ];

  const statusColors = { Joined:"#22C55E", Offered:"#E67E22", Backout:"#ba1a1a", Hold:"#F97316", "In Process":"#003163" };
  const donutData = (statusGroups||[]).filter(x=>x.joiningStatus&&x._count?._all>0).map(x=>({ label:x.joiningStatus, value:x._count._all, color:statusColors[x.joiningStatus]||"#737780" }));
  const donutTotal = donutData.reduce((a,b)=>a+b.value,0);

  const topClients = (clientGroups||[]).filter(x=>x.clientName).slice(0,5);
  const maxClient = Math.max(...topClients.map(x=>x._count?._all||0),1);

  const monthData = (months||[]).map(m=>({ label:m.label, value:m.value }));

  const alertCount = (alerts?.expiringAgreements?.length||0)+(alerts?.upcomingDOJ?.length||0)+(alerts?.pendingResignations?.length||0);

  const funnelStages = [
    { label:"Total Candidates Pool", value:total,  color:"linear-gradient(135deg,#003163,#001c3e)", textColor:"white", onClick:()=>nav("candidates",{}) },
    { label:"Offers Extended",       value:offered, color:"#E67E22",                                 textColor:"white", onClick:()=>nav("candidates",{statuses:["Offered"]}) },
    { label:"Successful Joinings",   value:joined,  color:"#22C55E",                                 textColor:"white", onClick:()=>nav("candidates",{statuses:["Joined"]}) },
  ];
  const convRate = offered > 0 ? Math.round((joined/offered)*100) : 0;
  const offerRate = total > 0 ? Math.round((offered/total)*100) : 0;

  return (
    <div style={{ fontFamily:"'Inter',system-ui,sans-serif" }}>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"/>

      {/* Header */}
      <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:20, flexWrap:"wrap", gap:12 }}>
        <div>
          <h3 style={{ fontSize:24,fontWeight:700,color:"#003163",margin:0 }}>Dashboard</h3>
          <p style={{ color:"#43474f",fontSize:14,marginTop:4 }}>Analyze your recruitment funnel and candidate trends.</p>
        </div>
        <div style={{ display:"flex",gap:10 }}>
          {alertCount > 0 && (
            <button onClick={()=>setShowDrawer(true)} style={{ position:"relative",display:"flex",alignItems:"center",gap:6,padding:"9px 16px",background:"white",border:"1px solid #c3c6d1",borderRadius:12,cursor:"pointer",fontSize:13,fontWeight:600,color:"#003163" }}>
              <M n="notifications" size={18} fill={1} style={{color:"#E67E22"}}/>
              {alertCount} alert{alertCount>1?"s":""}
              <span style={{ position:"absolute",top:8,right:8,width:7,height:7,background:"#E67E22",borderRadius:"50%",border:"2px solid white" }}/>
            </button>
          )}
          <button style={{ display:"flex",alignItems:"center",gap:6,padding:"9px 14px",background:"white",border:"1px solid #c3c6d1",borderRadius:12,cursor:"pointer",fontSize:13,fontWeight:600,color:"#003163" }}>
            <M n="download" size={18}/> Export PDF
          </button>
          <button style={{ display:"flex",alignItems:"center",gap:6,padding:"9px 16px",background:"linear-gradient(135deg,#003163,#001c3e)",color:"white",border:"none",borderRadius:12,cursor:"pointer",fontSize:13,fontWeight:600,boxShadow:"0 4px 12px rgba(0,49,99,.3)" }}>
            <M n="add" size={18} style={{color:"white"}}/> Add Candidate
          </button>
        </div>
      </div>

      {/* KPI Grid */}
      <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))",gap:12,marginBottom:20 }}>
        {kpiCards.map((c,i) => <KPICard key={c.label} {...c} delay={i*80}/>)}
      </div>

      {/* Main Grid: Funnel + Donut */}
      <div style={{ display:"grid",gridTemplateColumns:"1.6fr 1fr",gap:16,marginBottom:16 }}>

        {/* Recruitment Funnel */}
        <div style={{ background:"white",padding:24,borderRadius:14,border:"1px solid #c3c6d1" }}>
          <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:24 }}>
            <div>
              <h4 style={{ fontSize:20,fontWeight:700,color:"#003163",margin:0 }}>Recruitment Funnel</h4>
              <p style={{ color:"#43474f",fontSize:13,marginTop:4 }}>Candidate journey from application to joining.</p>
            </div>
            <div style={{ display:"flex",alignItems:"center",gap:5,padding:"4px 10px",background:"#eff4ff",borderRadius:99,fontSize:11,fontWeight:700,color:"#003163" }}>
              <M n="trending_up" size={15}/> {joined>0?"Active":"No data"}
            </div>
          </div>
          <div style={{ display:"flex",flexDirection:"column",gap:6 }}>
            {funnelStages.map((s,i) => (
              <div key={s.label}>
                <div onClick={s.onClick} style={{ height:60,background:s.color,borderRadius:12,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 20px",marginLeft:i*28,cursor:s.onClick?"pointer":"default" }}>
                  <span style={{ fontWeight:600,color:s.textColor,fontSize:14 }}>{s.label}</span>
                  <span style={{ fontSize:20,fontWeight:700,color:s.textColor }}>{(s.value||0).toLocaleString("en-IN")}</span>
                </div>
                {i<funnelStages.length-1 && (
                  <div style={{ display:"flex",justifyContent:"center",marginTop:4,marginBottom:4 }}>
                    <div style={{ background:"white",border:"1px solid #c3c6d1",borderRadius:99,padding:"3px 10px",fontSize:11,fontWeight:700,color:"#43474f",boxShadow:"0 1px 3px rgba(0,0,0,.06)" }}>
                      {i===0?`${offerRate}%`:`${convRate}%`} Conversion
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
          <div style={{ marginTop:20,paddingTop:16,borderTop:"1px solid #c3c6d1",display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:0 }}>
            {[["Offer Rate", offerRate+"%"],["Joining Rate", convRate+"%"],["Resign Pending", resPending]].map(([l,v],i)=>(
              <div key={l} style={{ textAlign:"center",padding:"0 12px",borderRight:i<2?"1px solid #c3c6d1":"none" }}>
                <p style={{ fontSize:10,fontWeight:700,color:"#43474f",textTransform:"uppercase",letterSpacing:".06em",marginBottom:4 }}>{l}</p>
                <p style={{ fontSize:20,fontWeight:700,color:"#003163" }}>{v}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Joining Status Donut */}
        <div style={{ background:"white",padding:24,borderRadius:14,border:"1px solid #c3c6d1",display:"flex",flexDirection:"column" }}>
          <h4 style={{ fontSize:20,fontWeight:700,color:"#003163",margin:"0 0 20px" }}>Joining Status</h4>
          <div style={{ flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",marginBottom:16 }}>
            <DonutChart data={donutData} total={donutTotal}/>
          </div>
          <div style={{ display:"flex",flexDirection:"column",gap:6 }}>
            {donutData.slice(0,4).map(s=>(
              <div key={s.label} onClick={()=>nav("candidates",{statuses:[s.label]})} style={{ display:"flex",alignItems:"center",justifyContent:"space-between",padding:"8px 12px",background:"#eff4ff",borderRadius:8, cursor:"pointer", transition:"background .15s" }}
                onMouseEnter={e=>e.currentTarget.style.background="#dce9ff"} onMouseLeave={e=>e.currentTarget.style.background="#eff4ff"}>
                <div style={{ display:"flex",alignItems:"center",gap:8 }}>
                  <div style={{ width:10,height:10,borderRadius:"50%",background:s.color,flexShrink:0 }}/>
                  <span style={{ fontSize:13,fontWeight:600,color:"#0b1c30" }}>{s.label}</span>
                </div>
                <span style={{ fontSize:13,fontWeight:700,color:"#003163" }}>{s.value} ({donutTotal>0?Math.round((s.value/donutTotal)*100):0}%)</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Grid: Top Clients + Monthly Trend */}
      <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:16 }}>

        {/* Top Clients */}
        <div style={{ background:"white",padding:24,borderRadius:14,border:"1px solid #c3c6d1" }}>
          <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20 }}>
            <h4 style={{ fontSize:20,fontWeight:700,color:"#003163",margin:0 }}>Top Clients</h4>
          </div>
          {topClients.length===0
            ? <div style={{ textAlign:"center",color:"#43474f",padding:30,fontSize:13 }}>No client data yet</div>
            : <div style={{ display:"flex",flexDirection:"column",gap:14 }}>
                {topClients.map(c=>{
                  const count = c._count?._all||0;
                  const pct = Math.round((count/maxClient)*100);
                  return (
                    <div key={c.clientName} onClick={()=>nav("candidates",{clients:[c.clientName]})} style={{ display:"flex",alignItems:"center",justifyContent:"space-between", cursor:"pointer", padding:6, margin:"-6px", borderRadius:10, transition:"background .15s" }}
                      onMouseEnter={e=>e.currentTarget.style.background="#f8f9fa"} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                      <div style={{ display:"flex",alignItems:"center",gap:12 }}>
                        <div style={{ width:38,height:38,borderRadius:9,background:"#dce9ff",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
                          <M n="corporate_fare" size={18} style={{color:"#003163"}}/>
                        </div>
                        <div>
                          <p style={{ fontWeight:600,color:"#0b1c30",fontSize:13,margin:0,maxWidth:130,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{c.clientName}</p>
                        </div>
                      </div>
                      <div style={{ textAlign:"right" }}>
                        <p style={{ fontWeight:700,color:"#003163",fontSize:13,margin:0 }}>{count} Hires</p>
                        <div style={{ width:80,height:4,background:"#e5eeff",borderRadius:99,marginTop:4 }}>
                          <div style={{ width:`${pct}%`,height:"100%",background:"#003163",borderRadius:99 }}/>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
          }
        </div>

        {/* Monthly Trend */}
        <div style={{ background:"white",padding:24,borderRadius:14,border:"1px solid #c3c6d1" }}>
          <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20 }}>
            <h4 style={{ fontSize:20,fontWeight:700,color:"#003163",margin:0 }}>Monthly Joining Trend</h4>
          </div>
          {monthData.length===0
            ? <div style={{ textAlign:"center",color:"#43474f",padding:30,fontSize:13 }}>No monthly data yet</div>
            : <BarChart data={monthData}/>
          }
          <div style={{ display:"flex",gap:16,marginTop:12 }}>
            <div style={{ display:"flex",alignItems:"center",gap:6 }}>
              <div style={{ width:8,height:8,borderRadius:"50%",background:"#003163" }}/>
              <span style={{ fontSize:11,color:"#43474f",fontWeight:500 }}>Actuals</span>
            </div>
            <div style={{ display:"flex",alignItems:"center",gap:6 }}>
              <div style={{ width:8,height:8,borderRadius:"50%",background:"#E67E22" }}/>
              <span style={{ fontSize:11,color:"#43474f",fontWeight:500 }}>Peak Month</span>
            </div>
          </div>
        </div>
      </div>

      {showDrawer && alerts && <AlertsDrawer alerts={alerts} onClose={()=>setShowDrawer(false)} onUpdated={refresh}/>}
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
