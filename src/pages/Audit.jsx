import { useState, useEffect } from "react";
import { api } from "../api";
import { Spin } from "../components/UI";

export default function Audit() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getAudit()
      .then(d => { setLogs(Array.isArray(d) ? d : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const ACTION_STYLE = {
    Created:  { bg: "#dcfce7", color: "#16a34a" },
    Updated:  { bg: "#fef9c3", color: "#92400e" },
    Deleted:  { bg: "#fee2e2", color: "#dc2626" },
    Default:  { bg: "#f1f5f9", color: "#475569" },
  };

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: "#0f172a", margin: 0 }}>Audit Log</h2>
        <p style={{ color: "#64748b", margin: "3px 0 0", fontSize: 13 }}>Track all changes across all team members</p>
      </div>

      <div style={{ background: "white", borderRadius: 12, overflow: "auto", boxShadow: "0 1px 3px rgba(0,0,0,.06)", border: "1px solid #f1f5f9" }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: "center" }}><Spin /></div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead>
              <tr style={{ background: "#f8fafc", borderBottom: "1.5px solid #e2e8f0" }}>
                {["Time", "User", "Action", "Record", "Details"].map(h => (
                  <th key={h} style={{ padding: "9px 12px", textAlign: "left", fontSize: 10, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: .4 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {!logs.length && (
                <tr><td colSpan={5} style={{ padding: 40, textAlign: "center", color: "#94a3b8" }}>No audit logs yet.</td></tr>
              )}
              {logs.map((l, i) => {
                const style = ACTION_STYLE[l.action] || ACTION_STYLE.Default;
                return (
                  <tr key={i} style={{ borderBottom: "1px solid #f8fafc", background: i % 2 ? "#fcfcfd" : "white" }}>
                    <td style={{ padding: "9px 12px", color: "#64748b", fontFamily: "monospace", fontSize: 10, whiteSpace: "nowrap" }}>
                      {new Date(l.createdAt).toLocaleString("en-IN")}
                    </td>
                    <td style={{ padding: "9px 12px", fontWeight: 600, color: "#1e293b" }}>{l.user?.name || "System"}</td>
                    <td style={{ padding: "9px 12px" }}>
                      <span style={{ padding: "2px 8px", borderRadius: 9, fontSize: 10, fontWeight: 700, background: style.bg, color: style.color }}>
                        {l.action}
                      </span>
                    </td>
                    <td style={{ padding: "9px 12px", color: "#475569", fontWeight: 500 }}>{l.recordName}</td>
                    <td style={{ padding: "9px 12px", color: "#64748b", fontSize: 11 }}>{l.detail}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
