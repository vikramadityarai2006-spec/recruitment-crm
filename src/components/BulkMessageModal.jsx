import { useState } from "react";
import { api } from "../api";

const M = ({ n, size = 18, style = {} }) => (
  <span style={{ fontFamily:"Material Symbols Outlined", fontSize:size, display:"inline-block", verticalAlign:"middle", lineHeight:1, userSelect:"none", ...style }}>{n}</span>
);

const PLACEHOLDERS = [
  { k:"{{name}}", l:"Candidate Name" },
  { k:"{{client}}", l:"Client" },
  { k:"{{designation}}", l:"Designation" },
  { k:"{{owner}}", l:"Owner" },
  { k:"{{status}}", l:"Status" },
];

const fillTemplate = (tpl, c) => String(tpl||"")
  .replace(/{{\s*name\s*}}/gi, c.candidateName||"")
  .replace(/{{\s*client\s*}}/gi, c.clientName||"")
  .replace(/{{\s*designation\s*}}/gi, c.designation||"")
  .replace(/{{\s*owner\s*}}/gi, c.ownerName||"")
  .replace(/{{\s*status\s*}}/gi, c.joiningStatus||"");

const fileToBase64 = (file) => new Promise((resolve,reject) => {
  const r = new FileReader();
  r.onload = () => resolve(String(r.result).split(",")[1]);
  r.onerror = reject;
  r.readAsDataURL(file);
});

export default function BulkMessageModal({ candidates, onClose }) {
  const [channel, setChannel] = useState("whatsapp");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("Hi {{name}}, this is an update regarding your application with {{client}}.");
  const [attachment, setAttachment] = useState(null); // {filename, base64, contentType}
  const [attaching, setAttaching] = useState(false);
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState(null);
  const [waQueue, setWaQueue] = useState(null);   // manual wa.me fallback queue
  const [waIndex, setWaIndex] = useState(0);
  const [waSkipped, setWaSkipped] = useState([]);

  const withEmail = candidates.filter(c=>c.email);
  const withPhone = candidates.filter(c=>c.phone);
  const usable = channel === "email" ? withEmail : withPhone;

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAttaching(true);
    try {
      const base64 = await fileToBase64(file);
      setAttachment({ filename:file.name, base64, contentType:file.type||"application/octet-stream" });
    } catch { alert("Could not read file"); }
    setAttaching(false);
  };

  const send = async () => {
    if (!message.trim()) { alert("Write a message first"); return; }
    if (usable.length === 0) { alert(`None of the selected candidates have a ${channel==="email"?"email address":"phone number"} on file.`); return; }
    setSending(true); setResult(null); setWaQueue(null);
    try {
      const r = await api.bulkMessage({
        channel,
        candidateIds: usable.map(c=>c.id),
        subject,
        message,
        attachment,
      });
      if (r.error) { alert(r.error); setSending(false); return; }
      if (r.mode === "manual") {
        setWaQueue(r.queue); setWaIndex(0); setWaSkipped(r.skipped||[]);
      } else {
        setResult(r);
      }
    } catch(e) { alert(e.message); }
    setSending(false);
  };

  const openNext = () => {
    const item = waQueue[waIndex];
    if (!item) return;
    window.open(item.url, "_blank", "noopener");
    setWaIndex(i => i+1);
  };

  const label = (t) => <label style={{ display:"block", fontSize:11, fontWeight:700, color:"#43474f", marginBottom:6, textTransform:"uppercase", letterSpacing:.5 }}>{t}</label>;

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.55)", zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center", padding:16 }} onClick={onClose}>
      <div style={{ background:"white", borderRadius:16, width:"100%", maxWidth:620, maxHeight:"92vh", overflow:"auto", boxShadow:"0 25px 60px rgba(0,0,0,.35)" }} onClick={e=>e.stopPropagation()}>

        {/* Header */}
        <div style={{ padding:"18px 24px", borderBottom:"1px solid #f1f5f9", display:"flex", alignItems:"center", justifyContent:"space-between", position:"sticky", top:0, background:"white", zIndex:1 }}>
          <div>
            <h3 style={{ margin:0, fontSize:17, fontWeight:700, color:"#0b1c30" }}>Bulk Message</h3>
            <p style={{ margin:"2px 0 0", fontSize:12, color:"#43474f" }}>{candidates.length} candidate{candidates.length!==1?"s":""} selected</p>
          </div>
          <button onClick={onClose} style={{ background:"#f1f5f9", border:"none", borderRadius:8, padding:6, cursor:"pointer" }}><M n="close" size={18}/></button>
        </div>

        <div style={{ padding:24 }}>
          {/* Channel tabs */}
          <div style={{ display:"flex", gap:8, marginBottom:18 }}>
            {[["whatsapp","WhatsApp","#16a34a"],["email","Email","#003163"]].map(([k,l,c])=>(
              <button key={k} onClick={()=>{setChannel(k);setResult(null);setWaQueue(null);}}
                style={{ flex:1, padding:"10px 14px", borderRadius:12, border:`1.5px solid ${channel===k?c:"#c3c6d1"}`, background:channel===k?c:"white", color:channel===k?"white":"#43474f", fontWeight:700, fontSize:13, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:6 }}>
                <M n={k==="whatsapp"?"chat":"mail"} size={16}/> {l}
              </button>
            ))}
          </div>

          <div style={{ marginBottom:10, padding:"8px 12px", background:"#eff4ff", borderRadius:10, fontSize:12, color:"#003163" }}>
            {usable.length} of {candidates.length} selected candidate{candidates.length!==1?"s":""} have a {channel==="email"?"email address":"phone number"} on file.
          </div>

          {channel==="email" && (
            <div style={{ marginBottom:14 }}>
              {label("Subject")}
              <input value={subject} onChange={e=>setSubject(e.target.value)} placeholder="e.g. Update on your application with {{client}}"
                style={{ width:"100%", padding:"10px 12px", borderRadius:10, border:"1px solid #c3c6d1", fontSize:13, boxSizing:"border-box", outline:"none" }}/>
            </div>
          )}

          {/* Message with formatting toolbar */}
          <div style={{ marginBottom:14 }}>
            {label("Message")}
            <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginBottom:8 }}>
              {PLACEHOLDERS.map(p=>(
                <button key={p.k} onClick={()=>setMessage(m=>m+" "+p.k)} type="button"
                  style={{ padding:"4px 10px", borderRadius:99, border:"1px solid #dce9ff", background:"#eff4ff", color:"#003163", fontSize:11, fontWeight:700, cursor:"pointer" }}>
                  + {p.l}
                </button>
              ))}
            </div>
            <textarea value={message} onChange={e=>setMessage(e.target.value)} rows={6}
              style={{ width:"100%", padding:"10px 12px", borderRadius:10, border:"1px solid #c3c6d1", fontSize:13, boxSizing:"border-box", outline:"none", resize:"vertical", fontFamily:"inherit" }}/>
            <p style={{ fontSize:11, color:"#737780", marginTop:6 }}>
              Placeholders are filled per-candidate. Preview for <strong>{candidates[0]?.candidateName}</strong>: "{fillTemplate(message, candidates[0]||{}).slice(0,140)}{message.length>140?"…":""}"
            </p>
          </div>

          {/* Attachment */}
          <div style={{ marginBottom:18 }}>
            {label("Attachment (optional)")}
            {!attachment ? (
              <label style={{ display:"flex", alignItems:"center", gap:8, padding:"10px 14px", border:"1.5px dashed #c3c6d1", borderRadius:10, cursor:"pointer", fontSize:13, color:"#43474f" }}>
                <M n="attach_file" size={18}/> {attaching?"Reading file…":"Click to attach a file"}
                <input type="file" onChange={handleFile} style={{ display:"none" }}/>
              </label>
            ) : (
              <div style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 14px", border:"1px solid #dce9ff", background:"#eff4ff", borderRadius:10, fontSize:13 }}>
                <M n="description" size={18} style={{color:"#003163"}}/>
                <span style={{ flex:1, color:"#0b1c30", fontWeight:600, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{attachment.filename}</span>
                <button onClick={()=>setAttachment(null)} style={{ border:"none", background:"none", cursor:"pointer", color:"#ba1a1a", display:"flex" }}><M n="close" size={16}/></button>
              </div>
            )}
            {channel==="whatsapp" && attachment && (
              <p style={{ fontSize:11, color:"#E67E22", marginTop:6 }}>
                Note: unless a WhatsApp Business API is configured on the server, WhatsApp Web can't auto-attach files —
                you'll need to attach "{attachment.filename}" manually in each chat that opens. Email attachments always send automatically.
              </p>
            )}
          </div>

          {/* Send */}
          {!waQueue && !result && (
            <button onClick={send} disabled={sending} style={{ width:"100%", padding:14, background:channel==="whatsapp"?"#16a34a":"#003163", color:"white", border:"none", borderRadius:12, fontWeight:700, fontSize:14, cursor:sending?"default":"pointer", opacity:sending?.7:1, display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
              <M n="send" size={18}/> {sending?"Sending…":`Send to ${usable.length} candidate${usable.length!==1?"s":""}`}
            </button>
          )}

          {/* Email/API result */}
          {result && (
            <div style={{ marginTop:8 }}>
              <div style={{ padding:12, background:"#dcfce7", border:"1px solid #16a34a44", borderRadius:10, fontSize:13, color:"#166534", fontWeight:600, marginBottom:8 }}>
                Sent to {result.sent?.length||0} candidate{(result.sent?.length||0)!==1?"s":""}.
              </div>
              {result.failed?.length>0 && (
                <div style={{ padding:12, background:"#ffdad6", border:"1px solid #ba1a1a44", borderRadius:10, fontSize:13, color:"#7a0d0d" }}>
                  <strong>{result.failed.length} failed:</strong>
                  <ul style={{ margin:"6px 0 0", paddingLeft:18 }}>
                    {result.failed.map(f=><li key={f.id}>{f.name} — {f.reason}</li>)}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* WhatsApp manual queue */}
          {waQueue && (
            <div style={{ marginTop:8 }}>
              <div style={{ padding:12, background:"#eff4ff", border:"1px solid #dce9ff", borderRadius:10, fontSize:12, color:"#003163", marginBottom:10 }}>
                No WhatsApp Business API configured, so messages are opened one at a time in WhatsApp Web/App with the text pre-filled — just hit send in each window.
              </div>
              {waIndex < waQueue.length ? (
                <button onClick={openNext} style={{ width:"100%", padding:14, background:"#16a34a", color:"white", border:"none", borderRadius:12, fontWeight:700, fontSize:14, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
                  <M n="chat" size={18}/> Open WhatsApp for {waQueue[waIndex].name} ({waIndex+1} of {waQueue.length})
                </button>
              ) : (
                <div style={{ padding:12, background:"#dcfce7", border:"1px solid #16a34a44", borderRadius:10, fontSize:13, color:"#166534", fontWeight:600, textAlign:"center" }}>
                  All {waQueue.length} WhatsApp chats opened ✓
                </div>
              )}
              {waSkipped.length>0 && (
                <div style={{ marginTop:8, fontSize:12, color:"#737780" }}>
                  Skipped (no phone number): {waSkipped.map(s=>s.name).join(", ")}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
