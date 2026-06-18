import { useState, useEffect } from "react";
import { api } from "../api";
import { Spin } from "../components/UI";

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

  const ACTION_STYLE = {
    Created:  { bg:"#dcfce7", c:"#16a34a", icon:"✅" },
    Updated:  { bg:"#fef9c3", c:"#92400e", icon:"✏️" },
    Deleted:  { bg:"#fee2e2", c:"#dc2626", icon:"🗑️" },
  };

  return (
    <div>
      <div style={{background:"white",borderRadius:16,padding:"20px 24px",marginBottom:18,boxShadow:"0 1px 3px rgba(0,0,0,.06)",border:"1px solid #f1f5f9",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <div style={{width:40,height:40,borderRadius:11,background:"linear-gradient(135deg,#475569,#334155)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>📋</div>
          <div>
            <h2 style={{fontSize:18,fontWeight:800,color:"#0f172a",margin:0}}>Audit Log</h2>
            <p style={{color:"#64748b",margin:0,fontSize:12}}>{logs.length} recent actions tracked</p>
          </div>
        </div>
        <button onClick={load} style={{display:"flex",alignItems:"center",gap:6,padding:"9px 14px",background:"white",border:"1.5px solid #e2e8f0",borderRadius:10,fontWeight:600,cursor:"pointer",fontSize:12,color:"#374151"}}>
          🔄 Refresh
        </button>
      </div>

      <div style={{background:"white",borderRadius:14,overflow:"hidden",boxShadow:"0 1px 3px rgba(0,0,0,.06)",border:"1px solid #f1f5f9"}}>
        {loading ? (
          <div style={{padding:60,textAlign:"center"}}><Spin/><div style={{marginTop:12,color:"#94a3b8",fontSize:13}}>Loading audit logs…</div></div>
        ) : error ? (
          <div style={{padding:40,textAlign:"center",color:"#ef4444"}}>Failed to load: {error}</div>
        ) : logs.length === 0 ? (
          <div style={{padding:60,textAlign:"center"}}>
            <div style={{fontSize:36,marginBottom:10}}>📋</div>
            <div style={{fontSize:14,fontWeight:700,color:"#0f172a"}}>No audit logs yet</div>
            <div style={{fontSize:12,color:"#94a3b8",marginTop:4}}>Actions will appear here as users interact with the CRM</div>
          </div>
        ) : (
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
            <thead>
              <tr style={{background:"linear-gradient(to right,#f8fafc,#f1f5f9)"}}>
                {["Time","User","Action","Record","Details"].map(h=>(
                  <th key={h} style={{padding:"12px 16px",textAlign:"left",fontSize:10,fontWeight:700,color:"#64748b",textTransform:"uppercase",letterSpacing:.7,borderBottom:"2px solid #e2e8f0"}}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {logs.map((l,i)=>{
                const s = ACTION_STYLE[l.action] || {bg:"#f1f5f9",c:"#475569",icon:"•"};
                return (
                  <tr key={i} style={{borderBottom:"1px solid #f8fafc",background:i%2?"#fcfcfd":"white",transition:"background .1s"}}
                    onMouseEnter={e=>e.currentTarget.style.background="#f0f9ff"}
                    onMouseLeave={e=>e.currentTarget.style.background=i%2?"#fcfcfd":"white"}>
                    <td style={{padding:"12px 16px",color:"#64748b",fontFamily:"monospace",fontSize:10,whiteSpace:"nowrap"}}>
                      {new Date(l.createdAt).toLocaleString("en-IN",{day:"2-digit",month:"short",hour:"2-digit",minute:"2-digit"})}
                    </td>
                    <td style={{padding:"12px 16px"}}>
                      <div style={{display:"flex",alignItems:"center",gap:7}}>
                        <div style={{width:26,height:26,borderRadius:7,background:"linear-gradient(135deg,#2563eb,#7c3aed)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:800,color:"white",flexShrink:0}}>
                          {(l.user?.name||"S")[0].toUpperCase()}
                        </div>
                        <span style={{fontWeight:600,color:"#1e293b",fontSize:12}}>{l.user?.name||"System"}</span>
                      </div>
                    </td>
                    <td style={{padding:"12px 16px"}}>
                      <span style={{display:"inline-flex",alignItems:"center",gap:4,padding:"3px 10px",borderRadius:20,fontSize:11,fontWeight:700,background:s.bg,color:s.c}}>
                        {s.icon} {l.action}
                      </span>
                    </td>
                    <td style={{padding:"12px 16px",fontWeight:600,color:"#1e293b"}}>{l.recordName||"—"}</td>
                    <td style={{padding:"12px 16px",color:"#64748b",fontSize:11}}>{l.detail||"—"}</td>
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
