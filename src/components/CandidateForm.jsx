import { useState } from "react";

export default function CandidateForm({ initial, masters, onSave, onCancel, saving }) {
  const blank = { clientName:"",designation:"",location:"",candidateName:"",actualDOJ:"",offerMonth:"",phone:"",resignationAcceptance:"Pending",proposedDOJ:"",ownerName:"",joiningStatus:"Offered",ctcPerMonth:"",statusCode:"Orange",notes:"" };
  
  const [form, setForm] = useState(() => initial ? {
    clientName: initial.clientName||"", designation: initial.designation||"", location: initial.location||"",
    candidateName: initial.candidateName||"", actualDOJ: initial.actualDOJ?initial.actualDOJ.split("T")[0]:"",
    offerMonth: initial.offerMonth?initial.offerMonth.split("T")[0]:"", phone: initial.phone||"",
    resignationAcceptance: initial.resignationAcceptance||"Pending",
    proposedDOJ: initial.proposedDOJ?initial.proposedDOJ.split("T")[0]:"",
    ownerName: initial.ownerName||"", joiningStatus: initial.joiningStatus||"Offered",
    ctcPerMonth: initial.ctcPerMonth||"", statusCode: initial.statusCode||"Orange", notes: initial.notes||"",
  } : blank);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const inp = (label, key, type="text", ph="") => (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#475569", marginBottom: 3, textTransform: "uppercase", letterSpacing: .4 }}>{label}</label>
      <input type={type} value={form[key]||""} onChange={e=>set(key,e.target.value)} placeholder={ph}
        style={{ width:"100%",padding:"8px 10px",borderRadius:7,border:"1.5px solid #e2e8f0",fontSize:13,boxSizing:"border-box",outline:"none" }} />
    </div>
  );

  const sel = (label, key, opts) => (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#475569", marginBottom: 3, textTransform: "uppercase", letterSpacing: .4 }}>{label}</label>
      <select value={form[key]||""} onChange={e=>set(key,e.target.value)}
        style={{ width:"100%",padding:"8px 10px",borderRadius:7,border:"1.5px solid #e2e8f0",fontSize:13,boxSizing:"border-box",outline:"none",background:"white" }}>
        <option value="">— Select —</option>
        {opts.map(o=><option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 14px" }}>
        {sel("Client Name", "clientName", masters.clients||[])}
        {inp("Designation", "designation", "text", "e.g. Senior Manager")}
        {inp("Location", "location", "text", "e.g. Mumbai")}
        {inp("Candidate Name", "candidateName", "text", "Full name")}
        {inp("Phone No.", "phone", "tel", "10-digit")}
        {inp("CTC Per Month (₹)", "ctcPerMonth", "number", "e.g. 85000")}
        {inp("Offer Month", "offerMonth", "date")}
        {inp("Proposed DOJ", "proposedDOJ", "date")}
        {inp("Actual DOJ", "actualDOJ", "date")}
        {sel("Resignation", "resignationAcceptance", masters.resignationStatus||[])}
        {sel("Owner", "ownerName", masters.owners||[])}
        {sel("Joining Status", "joiningStatus", masters.joiningStatus||[])}
        {sel("Status Code", "statusCode", (masters.statusCodes||[]).map(s=>s.code||s))}
      </div>
      <div style={{ marginBottom: 14 }}>
        <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#475569", marginBottom: 3, textTransform: "uppercase", letterSpacing: .4 }}>Notes</label>
        <textarea value={form.notes||""} onChange={e=>set("notes",e.target.value)} rows={2}
          style={{ width:"100%",padding:"8px 10px",borderRadius:7,border:"1.5px solid #e2e8f0",fontSize:13,boxSizing:"border-box",outline:"none",resize:"vertical" }} />
      </div>
      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
        <button onClick={onCancel} style={{ padding:"9px 18px",background:"#f1f5f9",border:"none",borderRadius:8,fontWeight:600,cursor:"pointer",fontSize:13 }}>Cancel</button>
        <button onClick={()=>onSave(form)} disabled={saving}
          style={{ padding:"9px 18px",background:"linear-gradient(135deg,#2563eb,#7c3aed)",color:"white",border:"none",borderRadius:8,fontWeight:600,cursor:"pointer",fontSize:13,opacity:saving?.7:1 }}>
          {saving ? "Saving…" : "Save Candidate"}
        </button>
      </div>
    </div>
  );
}
