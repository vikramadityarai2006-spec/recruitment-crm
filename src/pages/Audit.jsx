import { useState, useEffect } from "react";
import { api } from "../api";

// Resolve a colour + icon for any action string (matches on keywords so new
// action types — Login, User Created, Company Updated, Master Deleted, etc. —
// are styled automatically without needing an exact map entry).
const resolveStyle = (action) => {
  const a = (action || "").toLowerCase();
  if (a.includes("login"))                                        return { bg: "bg-blue-100",   c: "text-blue-700",   icon: "login" };
  if (a.includes("delet") || a.includes("deactiv") || a.includes("removed")) return { bg: "bg-red-100", c: "text-red-800", icon: "delete" };
  if (a.includes("bulk") || a.includes("email") || a.includes("whatsapp") || a.includes("message")) return { bg: "bg-purple-100", c: "text-purple-700", icon: "send" };
  if (a.includes("reassign") || a.includes("updat") || a.includes("edit"))   return { bg: "bg-yellow-100", c: "text-yellow-800", icon: "edit_square" };
  if (a.includes("creat") || a.includes("added") || a.includes("saved") || a.includes("activated")) return { bg: "bg-green-100", c: "text-green-700", icon: "add_circle" };
  return { bg: "bg-gray-100", c: "text-gray-600", icon: "radio_button_checked" };
};

export default function Audit() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = () => {
    setLoading(true);
    setError("");
    api.getAudit()
      .then(d => { setLogs(Array.isArray(d) ? d : []); setLoading(false); })
      .catch(e => { setError(e.message); setLoading(false); });
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="max-w-container-max mx-auto">
      {/* Header */}
      <div className="bg-surface-container-lowest rounded-xl p-lg mb-md shadow-sm border border-outline-variant flex justify-between items-center flex-wrap gap-4">
        <div className="flex items-center gap-md">
          <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
            <span className="material-symbols-outlined text-white text-[20px]">history</span>
          </div>
          <div>
            <h2 className="text-xl font-bold text-text-primary m-0">Audit Log</h2>
            <p className="text-text-tertiary m-0 text-xs">{logs.length} recent actions tracked</p>
          </div>
        </div>
        <button onClick={load} className="flex items-center gap-xs px-md py-sm bg-surface-container-lowest border border-outline-variant rounded-lg font-semibold text-xs text-text-primary hover:bg-surface-container-low transition-colors cursor-pointer">
          <span className="material-symbols-outlined text-[16px]">refresh</span>
          Refresh
        </button>
      </div>

      {/* Table */}
      <div className="bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm border border-outline-variant">
        {loading ? (
          <div className="p-16 text-center">
            <div className="w-9 h-9 border-4 border-primary/10 border-t-secondary rounded-full animate-spin-fast mx-auto mb-3"></div>
            <div className="text-text-tertiary text-sm">Loading audit logs…</div>
          </div>
        ) : error ? (
          <div className="p-10 text-center text-error font-medium">Failed to load: {error}</div>
        ) : logs.length === 0 ? (
          <div className="p-16 text-center">
            <span className="material-symbols-outlined text-4xl text-outline-variant">history</span>
            <div className="text-sm font-bold text-text-primary mt-2">No audit logs yet</div>
            <div className="text-xs text-text-tertiary mt-1">Actions will appear here as users interact with the CRM</div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-surface-container">
                  {["Time", "User", "Action", "Record", "Details"].map(h => (
                    <th key={h} className="px-lg py-sm text-left text-xs font-bold text-primary uppercase tracking-wider border-b border-outline-variant">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {logs.map((l, i) => {
                  const s = resolveStyle(l.action);
                  return (
                    <tr key={i} className="hover:bg-surface-container-low transition-colors">
                      <td className="px-lg py-md text-text-tertiary font-mono text-[11px] whitespace-nowrap">
                        {new Date(l.createdAt).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                      </td>
                      <td className="px-lg py-md">
                        <div className="flex items-center gap-sm">
                          <div className="w-7 h-7 rounded-full bg-primary-container flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0">
                            {(l.user?.name || "S")[0].toUpperCase()}
                          </div>
                          <span className="font-semibold text-text-primary text-[13px]">{l.user?.name || "System"}</span>
                        </div>
                      </td>
                      <td className="px-lg py-md">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-bold ${s.bg} ${s.c}`}>
                          <span className="material-symbols-outlined text-[14px] leading-none">{s.icon}</span>
                          {l.action}
                        </span>
                      </td>
                      <td className="px-lg py-md font-semibold text-text-primary text-[13px]">{l.recordName || "—"}</td>
                      <td className="px-lg py-md text-text-secondary text-[13px]">{l.detail || "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
