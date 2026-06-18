import { useState } from "react";

export default function CandidateForm({ initial, masters, onSave, onCancel, saving }) {
  const blank = {
    clientName:"", designation:"", location:"", candidateName:"",
    actualDOJ:"", offerMonth:"", phone:"", resignationAcceptance:"Pending",
    proposedDOJ:"", ownerName:"", joiningStatus:"Offered",
    ctcPerMonth:"", statusCode:"Orange", notes:""
  };

  const [form, setForm] = useState(() => initial ? {
    clientName: initial.clientName||"", designation: initial.designation||"",
    location: initial.location||"", candidateName: initial.candidateName||"",
    actualDOJ: initial.actualDOJ?initial.actualDOJ.split("T")[0]:"",
    offerMonth: initial.offerMonth?initial.offerMonth.split("T")[0]:"",
    phone: initial.phone||"", resignationAcceptance: initial.resignationAcceptance||"Pending",
    proposedDOJ: initial.proposedDOJ?initial.proposedDOJ.split("T")[0]:"",
    ownerName: initial.ownerName||"", joiningStatus: initial.joiningStatus||"Offered",
    ctcPerMonth: initial.ctcPerMonth||"", statusCode: initial.statusCode||"Orange",
    notes: initial.notes||""
  } : blank);

  const set = (k,v) => setForm(f=>({...f,[k]:v}));

  const inp = (label, key, type="text", ph="") => (
    <div style={{marginBottom:14}}>
      <label style={{display:"block",fontSize:11,fontWeight:700,color:"#64748b",marginBottom:4,textTransform:"uppercase",letterSpacing:.5}}>{label}</label>
      <input type={type} value={form[key]||""} onChange={e=>set(key,e.target.value)} placeholder={ph}
        style={{width:"100%",padding:"9px 12px",borderRadius:8,border:"1.5px solid #e2e8f0",fontSize:13,boxSizing:"border-box",outline:"none",background:"#fafafa",transition:"border .2s"}}
        onFocus={e=>e.target.style.borderColor="#2563eb"}
        onBlur={e=>e.target.style.borderColor="#e2e8f0"}/>
    </div>
  );

  // Smart select with fallback to text input if no options
  const sel = (label, key, opts, allowCustom=false) => (
    <div style={{marginBottom:14}}>
      <label style={{display:"block",fontSize:11,fontWeight:700,color:"#64748b",marginBottom:4,textTransform:"uppercase",letterSpacing:.5}}>{label}</label>
      {opts && opts.length > 0 ? (
        <select value={form[key]||""} onChange={e=>set(key,e.target.value)}
          style={{width:"100%",padding:"9px 12px",borderRadius:8,border:"1.5px solid #e2e8f0",fontSize:13,boxSizing:"border-box",outline:"none",background:"#fafafa",cursor:"pointer"}}>
          <option value="">— Select {label} —</option>
          {opts.map(o=><option key={o} value={o}>{o}</option>)}
        </select>
      ) : (
        <input value={form[key]||""} onChange={e=>set(key,e.target.value)} placeholder={`Type ${label.toLowerCase()}…`}
          style={{width:"100%",padding:"9px 12px",borderRadius:8,border:"1.5px solid #e2e8f0",fontSize:13,boxSizing:"border-box",outline:"none",background:"#fafafa"}}
          onFocus={e=>e.target.style.borderColor="#2563eb"}
          onBlur={e=>e.target.style.borderColor="#e2e8f0"}/>
      )}
    </div>
  );

  return (
    <div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 16px"}}>
        {sel("Client Name", "clientName", masters.clients||[])}
        {sel("Designation / Position", "designation", masters.designations||[], true)}
        {sel("Location / City", "location", masters.locations||[], true)}
        {inp("Candidate Name", "candidateName", "text", "Full name")}
        {inp("Phone Number", "phone", "tel", "10-digit mobile")}
        {inp("CTC Per Month (₹)", "ctcPerMonth", "number", "e.g. 85000")}
        {inp("Offer Month", "offerMonth", "date")}
        {inp("Proposed Date of Joining", "proposedDOJ", "date")}
        {inp("Actual Date of Joining", "actualDOJ", "date")}
        {sel("Resignation Acceptance", "resignationAcceptance", masters.resignationStatus||["Pending","Accepted","NA"])}
        {sel("Owner / Recruiter", "ownerName", masters.owners||[])}
        {sel("Joining Status", "joiningStatus", masters.joiningStatus||[])}
        {sel("Status Code", "statusCode", (masters.statusCodes||[]).map(s=>s.code||s))}
      </div>
      <div style={{marginBottom:16}}>
        <label style={{display:"block",fontSize:11,fontWeight:700,color:"#64748b",marginBottom:4,textTransform:"uppercase",letterSpacing:.5}}>Notes</label>
        <textarea value={form.notes||""} onChange={e=>set("notes",e.target.value)} rows={3} placeholder="Any additional notes…"
          style={{width:"100%",padding:"9px 12px",borderRadius:8,border:"1.5px solid #e2e8f0",fontSize:13,boxSizing:"border-box",outline:"none",resize:"vertical",background:"#fafafa"}}
          onFocus={e=>e.target.style.borderColor="#2563eb"}
          onBlur={e=>e.target.style.borderColor="#e2e8f0"}/>
      </div>
      <div style={{display:"flex",gap:10,justifyContent:"flex-end",paddingTop:8,borderTop:"1px solid #f1f5f9"}}>
        <button onClick={onCancel} style={{padding:"10px 20px",background:"white",border:"1.5px solid #e2e8f0",borderRadius:9,fontWeight:600,cursor:"pointer",fontSize:13,color:"#374151"}}>Cancel</button>
        <button onClick={()=>onSave(form)} disabled={saving}
          style={{padding:"10px 24px",background:"linear-gradient(135deg,#2563eb,#7c3aed)",color:"white",border:"none",borderRadius:9,fontWeight:700,cursor:"pointer",fontSize:13,opacity:saving?.7:1,boxShadow:"0 4px 12px rgba(37,99,235,.3)"}}>
          {saving?"Saving…":"Save Candidate"}
        </button>
      </div>
    </div>
  );
}
