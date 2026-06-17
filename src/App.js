import { useState, useEffect, useCallback } from "react";
import { api } from "./api";
import { Icon } from "./components/UI";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Candidates from "./pages/Candidates";
import Masters from "./pages/Masters";
import Audit from "./pages/Audit";
import Companies from "./pages/Companies";

export default function App() {
  const [user, setUser] = useState(() => {
    const t = localStorage.getItem("crm_token");
    if (!t) return null;
    try {
      const p = JSON.parse(atob(t.split(".")[1]));
      return { id: p.id, name: p.name, email: p.email, role: p.role };
    } catch {
      localStorage.removeItem("crm_token");
      return null;
    }
  });

  const [page, setPage] = useState("dashboard");
  const [masters, setMasters] = useState({
    clients: [], owners: [], joiningStatus: [],
    resignationStatus: [], statusCodes: [], _full: {}
  });
  // Incrementing key causes Dashboard to re-fetch when candidates change
  const [dashRefresh, setDashRefresh] = useState(0);

  const loadMasters = useCallback(() => {
    if (user) api.getMasters().then(m => setMasters(m || {})).catch(console.error);
  }, [user]);

  useEffect(() => { loadMasters(); }, [loadMasters]);

  if (!user) return <Login onLogin={u => setUser(u)} />;

  const logout = () => { localStorage.removeItem("crm_token"); setUser(null); };

  // Called after any candidate save/delete
  const onCandidateChange = () => setDashRefresh(k => k + 1);

  const nav = [
    { k: "dashboard", l: "Dashboard", i: "dash" },
    { k: "candidates", l: "Candidates", i: "users" },
    { k: "companies", l: "Companies", i: "chart" },
    ...(user.role === "admin" ? [
      { k: "masters", l: "Master Data", i: "cog" },
      { k: "audit", l: "Audit Log", i: "eye" },
    ] : []),
  ];

  return (
    <div style={{ display: "flex", fontFamily: "'Inter',system-ui,sans-serif", minHeight: "100vh", background: "#f8fafc" }}>
      {/* Sidebar */}
      <aside style={{ width: 210, background: "#0f172a", minHeight: "100vh", display: "flex", flexDirection: "column", flexShrink: 0, position: "sticky", top: 0, height: "100vh", overflow: "auto" }}>
        <div style={{ padding: "20px 16px 14px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
            <div style={{ width: 34, height: 34, borderRadius: 9, background: "linear-gradient(135deg,#2563eb,#7c3aed)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <svg width={17} height={17} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /></svg>
            </div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 800, color: "white", lineHeight: 1.1 }}>Ample Leap</div>
              <div style={{ fontSize: 9, color: "#64748b", marginTop: 1 }}>CRM v2.0</div>
            </div>
          </div>
        </div>

        <nav style={{ flex: 1, padding: "6px 8px" }}>
          {nav.map(n => (
            <button key={n.k} onClick={() => setPage(n.k)}
              style={{ width: "100%", display: "flex", alignItems: "center", gap: 9, padding: "9px 10px", borderRadius: 8, border: "none", background: page === n.k ? "#1e293b" : "transparent", color: page === n.k ? "#93c5fd" : "#94a3b8", fontWeight: page === n.k ? 700 : 400, cursor: "pointer", fontSize: 13, marginBottom: 1, textAlign: "left", outline: "none", transition: "all .15s", fontFamily: "inherit" }}>
              <Icon n={n.i} s={14} />{n.l}
            </button>
          ))}
        </nav>

        <div style={{ padding: "12px", borderTop: "1px solid #1e293b" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <div style={{ width: 30, height: 30, borderRadius: 7, background: "linear-gradient(135deg,#1e40af,#7c3aed)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, color: "white", flexShrink: 0 }}>{user.name[0]}</div>
            <div style={{ overflow: "hidden", flex: 1 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#e2e8f0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.name}</div>
              <div style={{ fontSize: 9, color: "#64748b", textTransform: "capitalize" }}>{user.role}</div>
            </div>
          </div>
          <button onClick={logout} style={{ width: "100%", display: "flex", alignItems: "center", gap: 7, padding: "7px 9px", borderRadius: 6, border: "none", background: "transparent", color: "#64748b", cursor: "pointer", fontSize: 11, fontWeight: 600, fontFamily: "inherit" }}>
            <Icon n="out" s={12} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, overflow: "auto", display: "flex", flexDirection: "column", minWidth: 0 }}>
        {/* Top bar */}
        <div style={{ background: "white", borderBottom: "1px solid #f1f5f9", padding: "10px 22px", display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, zIndex: 10 }}>
          <div style={{ fontSize: 12, color: "#64748b" }}>
            {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </div>
          <div style={{ display: "flex", gap: 7, alignItems: "center" }}>
            <div style={{ fontSize: 11, background: "#f0fdf4", color: "#16a34a", border: "1px solid #bbf7d0", padding: "3px 9px", borderRadius: 20, fontWeight: 600 }}>● Live</div>
            <div style={{ fontSize: 11, background: "#f0f9ff", color: "#0369a1", border: "1px solid #bae6fd", padding: "3px 9px", borderRadius: 20, fontWeight: 600, textTransform: "capitalize" }}>{user.role}</div>
          </div>
        </div>

        {/* Page Content */}
        <div style={{ padding: 22, flex: 1 }}>
          {page === "dashboard"  && <Dashboard refreshKey={dashRefresh} />}
          {page === "candidates" && <Candidates masters={masters} user={user} onDataChange={onCandidateChange} />}
          {page === "companies"  && <Companies user={user} />}
          {page === "masters"    && user.role === "admin" && <Masters masters={masters} reload={loadMasters} />}
          {page === "audit"      && user.role === "admin" && <Audit />}
        </div>
      </main>

      <style>{`* { box-sizing: border-box; } @keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
