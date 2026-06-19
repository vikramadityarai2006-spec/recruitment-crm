import { STATUS_COLOR, STATUS_BG, CODE_COLORS } from "../utils/constants";

export const Badge = ({ status, code }) => {
  if (code) {
    const c = CODE_COLORS[code] || "#6b7280";
    return <span style={{ background: c + "22", color: c, border: `1px solid ${c}44`, padding: "2px 8px", borderRadius: 12, fontSize: 11, fontWeight: 600, whiteSpace: "nowrap" }}>{code}</span>;
  }
  const c = STATUS_COLOR[status] || "#6b7280", bg = STATUS_BG[status] || "#f3f4f6";
  return <span style={{ background: bg, color: c, padding: "2px 8px", borderRadius: 12, fontSize: 11, fontWeight: 600, whiteSpace: "nowrap" }}>{status || "—"}</span>;
};

export const Spin = () => (
  <div style={{ width: 20, height: 20, border: "2px solid #e2e8f0", borderTop: "2px solid #2563eb", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto" }} />
);

export const Modal = ({ open, onClose, title, children, wide }) => {
  if (!open) return null;
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.55)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }} onClick={onClose}>
      <div style={{ background: "white", borderRadius: 16, width: "100%", maxWidth: wide ? 880 : 560, maxHeight: "92vh", overflow: "auto", boxShadow: "0 25px 60px rgba(0,0,0,.35)" }} onClick={e => e.stopPropagation()}>
        <div style={{ padding: "18px 24px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, background: "white", zIndex: 1 }}>
          <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: "#0f172a" }}>{title}</h3>
          <button onClick={onClose} style={{ background: "#f1f5f9", border: "none", borderRadius: 8, padding: 6, cursor: "pointer", display: "flex" }}>✕</button>
        </div>
        <div style={{ padding: 24 }}>{children}</div>
      </div>
    </div>
  );
};

export const Icon = ({ n, s = 16 }) => {
  const icons = {
    dash: <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg>,
    users: <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>,
    cog: <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="3" /><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14" /></svg>,
    plus: <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>,
    search: <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>,
    edit: <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>,
    trash: <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6M14 11v6" /><path d="M9 6V4h6v2" /></svg>,
    eye: <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>,
    dl: <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>,
    chart: <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>,
    out: <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>,
    x: <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>,
    filter: <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" /></svg>,
    refresh: <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><polyline points="23 4 23 10 17 10" /><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" /></svg>,
    whatsapp: <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor"><path d="M17.6 6.32A8.86 8.86 0 0 0 12.05 4a8.94 8.94 0 0 0-7.74 13.4L3 21l3.71-1.27a8.9 8.9 0 0 0 4.34 1.1h0a8.94 8.94 0 0 0 8.94-8.94 8.86 8.86 0 0 0-2.39-5.57zM12.05 19.1a7.4 7.4 0 0 1-3.77-1.03l-.27-.16-2.8.92.93-2.73-.18-.28a7.43 7.43 0 1 1 13.8-3.93 7.45 7.45 0 0 1-7.71 7.21zm4.08-5.56c-.22-.11-1.32-.65-1.53-.73-.2-.08-.36-.11-.5.11-.15.22-.58.73-.71.88-.13.15-.26.16-.48.05a6.1 6.1 0 0 1-1.8-1.11 6.74 6.74 0 0 1-1.24-1.55c-.13-.22 0-.34.1-.45.1-.1.22-.26.33-.39a1.5 1.5 0 0 0 .22-.37.4.4 0 0 0 0-.39c-.06-.11-.5-1.21-.69-1.65-.18-.43-.37-.37-.5-.38h-.43a.83.83 0 0 0-.6.28 2.52 2.52 0 0 0-.79 1.87 4.36 4.36 0 0 0 .92 2.32 10 10 0 0 0 3.85 3.4 4.42 4.42 0 0 0 2.71.57 2.31 2.31 0 0 0 1.52-1.07 1.88 1.88 0 0 0 .13-1.07c-.06-.1-.2-.16-.41-.27z"/></svg>,
    mail: <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>,
    phone: <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" /></svg>,
    bell: <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>,
    clock: <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>,
    alert: <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>,
    fileText: <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></svg>,
    trendUp: <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></svg>,
  };
  return icons[n] || null;
};

export const MiniBar = ({ data = [], height = 70 }) => {
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 3, height, paddingTop: 4 }}>
      {data.map((d, i) => (
        <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
          <div style={{ width: "100%", background: d.color || "#3b82f6", borderRadius: "3px 3px 0 0", height: Math.max(3, (d.value / max) * (height - 18)), transition: "height .4s ease" }} />
          <span style={{ fontSize: 8, color: "#94a3b8", textAlign: "center", lineHeight: 1.1 }}>{d.label}</span>
        </div>
      ))}
    </div>
  );
};

export const Donut = ({ data = [], size = 90 }) => {
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
        return <path key={i} d={`M50,50 L${p1.x},${p1.y} A40,40 0 ${s.pct > .5 ? 1 : 0},1 ${p2.x},${p2.y} Z`} fill={s.color} opacity={.9} />;
      })}
      <circle cx={50} cy={50} r={26} fill="white" />
      <text x={50} y={51} textAnchor="middle" dominantBaseline="middle" fontSize={13} fontWeight={700} fill="#1e293b">{total}</text>
      <text x={50} y={61} textAnchor="middle" dominantBaseline="middle" fontSize={7} fill="#94a3b8">TOTAL</text>
    </svg>
  );
};

// Quick-connect buttons: WhatsApp + Email + Call. Stops propagation so they work inside table rows.
export const ContactButtons = ({ phone, email, waMessage = "", size = "sm" }) => {
  const dims = size === "sm" ? { btn: 24, icon: 12 } : { btn: 30, icon: 14 };
  const stop = (e) => e.stopPropagation();
  const cleanPhone = (p) => {
    if (!p) return "";
    const digits = String(p).replace(/\D/g, "");
    return digits.length === 10 ? "91" + digits : digits;
  };
  const wa = phone ? `https://wa.me/${cleanPhone(phone)}${waMessage ? `?text=${encodeURIComponent(waMessage)}` : ""}` : null;
  const mail = email ? `mailto:${email}` : null;
  const tel = phone ? `tel:${phone}` : null;
  const btnStyle = (bg, color) => ({
    width: dims.btn, height: dims.btn, borderRadius: dims.btn / 2, background: bg, color, display: "flex",
    alignItems: "center", justifyContent: "center", textDecoration: "none", border: "none", cursor: "pointer", flexShrink: 0, transition: "transform .15s",
  });
  return (
    <div style={{ display: "flex", gap: 5 }} onClick={stop}>
      {wa && <a href={wa} target="_blank" rel="noreferrer" title="WhatsApp" style={btnStyle("#dcfce7", "#16a34a")}
        onMouseEnter={e => e.currentTarget.style.transform = "scale(1.1)"} onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}>
        <Icon n="whatsapp" s={dims.icon} />
      </a>}
      {tel && <a href={tel} title="Call" style={btnStyle("#dbeafe", "#2563eb")}
        onMouseEnter={e => e.currentTarget.style.transform = "scale(1.1)"} onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}>
        <Icon n="phone" s={dims.icon} />
      </a>}
      {mail && <a href={mail} title="Email" style={btnStyle("#fef3c7", "#d97706")}
        onMouseEnter={e => e.currentTarget.style.transform = "scale(1.1)"} onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}>
        <Icon n="mail" s={dims.icon} />
      </a>}
    </div>
  );
};
