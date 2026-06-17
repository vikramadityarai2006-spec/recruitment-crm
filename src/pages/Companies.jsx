import { useState, useEffect, useCallback } from "react";
import { api } from "../api";
import { Spin, Modal, Icon } from "../components/UI";

// ─── COMPANY FORM ─────────────────────────────────────────────────────────────
function CompanyForm({ initial, onSave, onCancel, saving }) {
  const blank = { companyName:"",spoc:"",contactName:"",department:"HR",mobile:"",email:"",address:"",dsc:"NO",hardcopy:"NO",serviceFee:"",agreementUrl:"" };
  const [form, setForm] = useState(initial || blank);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const F = (label, key, type="text", ph="", full=false) => (
    <div style={{ marginBottom: 14, gridColumn: full ? "1 / -1" : undefined }}>
      <label style={{ display:"block", fontSize:11, fontWeight:600, color:"#475569", marginBottom:3, textTransform:"uppercase", letterSpacing:.4 }}>{label}</label>
      <input type={type} value={form[key]||""} onChange={e=>set(key,e.target.value)} placeholder={ph}
        style={{ width:"100%", padding:"8px 10px", borderRadius:7, border:"1.5px solid #e2e8f0", fontSize:13, boxSizing:"border-box", outline:"none" }}/>
    </div>
  );

  const S = (label, key, opts) => (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display:"block", fontSize:11, fontWeight:600, color:"#475569", marginBottom:3, textTransform:"uppercase", letterSpacing:.4 }}>{label}</label>
      <select value={form[key]||""} onChange={e=>set(key,e.target.value)}
        style={{ width:"100%", padding:"8px 10px", borderRadius:7, border:"1.5px solid #e2e8f0", fontSize:13, boxSizing:"border-box", outline:"none", background:"white" }}>
        {opts.map(o=><option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );

  return (
    <div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0 14px" }}>
        {F("Company Name","companyName","text","e.g. Alicon Group")}
        {F("SPOC (Our Owner)","spoc","text","e.g. Yogita")}
        {F("Contact Person Name","contactName","text","e.g. Rahul Sharma")}
        {F("Department","department","text","e.g. HR")}
        {F("Mobile Number","mobile","tel","10-digit number")}
        {F("Email Address","email","email","e.g. hr@company.com")}
        {S("DSC Received","dsc",["YES","NO","Pending"])}
        {S("Hardcopy Received","hardcopy",["YES","NO","Pending"])}
        {F("Service Fee","serviceFee","text","e.g. 8.33% + GST")}
        {F("Agreement PDF URL","agreementUrl","url","https://drive.google.com/...")}
      </div>
      <div style={{ marginBottom:14, gridColumn:"1 / -1" }}>
        <label style={{ display:"block", fontSize:11, fontWeight:600, color:"#475569", marginBottom:3, textTransform:"uppercase", letterSpacing:.4 }}>Office Address</label>
        <textarea value={form.address||""} onChange={e=>set("address",e.target.value)} rows={2} placeholder="Full address…"
          style={{ width:"100%", padding:"8px 10px", borderRadius:7, border:"1.5px solid #e2e8f0", fontSize:13, boxSizing:"border-box", outline:"none", resize:"vertical" }}/>
      </div>
      <div style={{ background:"#f0f9ff", border:"1px solid #bae6fd", borderRadius:8, padding:"10px 14px", marginBottom:16, fontSize:12, color:"#0369a1" }}>
        💡 <strong>Agreement PDF:</strong> Upload your PDF to Google Drive, make it publicly viewable, then paste the link above.
      </div>
      <div style={{ display:"flex", gap:8, justifyContent:"flex-end" }}>
        <button onClick={onCancel} style={{ padding:"9px 18px", background:"#f1f5f9", border:"none", borderRadius:8, fontWeight:600, cursor:"pointer", fontSize:13 }}>Cancel</button>
        <button onClick={()=>onSave(form)} disabled={saving}
          style={{ padding:"9px 18px", background:"linear-gradient(135deg,#2563eb,#7c3aed)", color:"white", border:"none", borderRadius:8, fontWeight:600, cursor:"pointer", fontSize:13, opacity:saving?.7:1 }}>
          {saving ? "Saving…" : "Save Company"}
        </button>
      </div>
    </div>
  );
}

// ─── VIEW COMPANY ─────────────────────────────────────────────────────────────
function ViewCompany({ c }) {
  if (!c) return null;
  const R = (label, value, isLink=false) => (
    <div style={{ display:"flex", borderBottom:"1px solid #f8fafc", padding:"9px 0" }}>
      <div style={{ width:160, fontSize:11, fontWeight:700, color:"#64748b", textTransform:"uppercase", letterSpacing:.4, flexShrink:0 }}>{label}</div>
      <div style={{ fontSize:13, color:"#0f172a", fontWeight:500 }}>
        {isLink && value ? <a href={value} target="_blank" rel="noreferrer" style={{ color:"#2563eb", textDecoration:"none" }}>📄 View Agreement PDF</a> : value||"—"}
      </div>
    </div>
  );
  const Badge = ({ val }) => {
    const isYes = val === "YES";
    return <span style={{ padding:"2px 8px", borderRadius:10, fontSize:11, fontWeight:600, background:isYes?"#dcfce7":val==="Pending"?"#fef9c3":"#fee2e2", color:isYes?"#16a34a":val==="Pending"?"#92400e":"#dc2626" }}>{val||"—"}</span>;
  };
  return (
    <div>
      <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:18, paddingBottom:18, borderBottom:"1px solid #f1f5f9" }}>
        <div style={{ width:50, height:50, borderRadius:12, background:"linear-gradient(135deg,#2563eb22,#7c3aed22)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, fontWeight:800, color:"#2563eb" }}>
          {c.companyName?.[0]?.toUpperCase()}
        </div>
        <div>
          <h3 style={{ margin:0, fontSize:18, fontWeight:800, color:"#0f172a" }}>{c.companyName}</h3>
          <p style={{ margin:"2px 0 0", color:"#64748b", fontSize:12 }}>{c.contactName} · {c.department}</p>
          <div style={{ display:"flex", gap:6, marginTop:5 }}>
            <span style={{ fontSize:11, background:"#f0f9ff", color:"#2563eb", padding:"2px 8px", borderRadius:10, fontWeight:600 }}>DSC: {c.dsc}</span>
            <span style={{ fontSize:11, background:"#f0fdf4", color:"#16a34a", padding:"2px 8px", borderRadius:10, fontWeight:600 }}>Hardcopy: {c.hardcopy}</span>
          </div>
        </div>
      </div>
      {R("Company", c.companyName)}
      {R("SPOC (Owner)", c.spoc)}
      {R("Contact Person", c.contactName)}
      {R("Department", c.department)}
      {R("Mobile", c.mobile)}
      {R("Email", c.email)}
      {R("Address", c.address)}
      {R("Service Fee", c.serviceFee)}
      <div style={{ display:"flex", borderBottom:"1px solid #f8fafc", padding:"9px 0" }}>
        <div style={{ width:160, fontSize:11, fontWeight:700, color:"#64748b", textTransform:"uppercase", letterSpacing:.4, flexShrink:0 }}>DSC</div>
        <div><span style={{ padding:"2px 8px", borderRadius:10, fontSize:11, fontWeight:600, background:c.dsc==="YES"?"#dcfce7":c.dsc==="Pending"?"#fef9c3":"#fee2e2", color:c.dsc==="YES"?"#16a34a":c.dsc==="Pending"?"#92400e":"#dc2626" }}>{c.dsc||"—"}</span></div>
      </div>
      <div style={{ display:"flex", borderBottom:"1px solid #f8fafc", padding:"9px 0" }}>
        <div style={{ width:160, fontSize:11, fontWeight:700, color:"#64748b", textTransform:"uppercase", letterSpacing:.4, flexShrink:0 }}>Hardcopy</div>
        <div><span style={{ padding:"2px 8px", borderRadius:10, fontSize:11, fontWeight:600, background:c.hardcopy==="YES"?"#dcfce7":c.hardcopy==="Pending"?"#fef9c3":"#fee2e2", color:c.hardcopy==="YES"?"#16a34a":c.hardcopy==="Pending"?"#92400e":"#dc2626" }}>{c.hardcopy||"—"}</span></div>
      </div>
      {R("Agreement PDF", c.agreementUrl, true)}
    </div>
  );
}

// ─── MAIN COMPANIES PAGE ──────────────────────────────────────────────────────
export default function Companies({ user }) {
  const [result, setResult] = useState({ companies:[], total:0, pages:1 });
  const [search, setSearch] = useState("");
  const [filterCompany, setFilterCompany] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [uniqueCompanies, setUniqueCompanies] = useState([]);

  const load = useCallback(async (p=1, s="", fc="") => {
    setLoading(true);
    const params = { page:p, limit:20 };
    if (s) params.search = s;
    if (fc) params.company = fc;
    try {
      const res = await fetch(`https://crm-api-iota-two.vercel.app/api/companies?${new URLSearchParams(params)}`, {
        headers: { "Content-Type":"application/json", Authorization:`Bearer ${localStorage.getItem("crm_token")}` }
      });
      const data = await res.json();
      setResult(data || { companies:[], total:0, pages:1 });
      // Extract unique companies for filter
      if (!fc && !s) {
        const uniq = [...new Set((data.companies||[]).map(c=>c.companyName))].sort();
        setUniqueCompanies(uniq);
      }
    } catch(e) { console.error(e); }
    setLoading(false);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => { load(1, search, filterCompany); setPage(1); }, 400);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => { load(page, search, filterCompany); }, [page, filterCompany]);

  const showMsg = (text) => { setMsg(text); setTimeout(()=>setMsg(""), 3000); };

  const handleSave = async (form) => {
    setSaving(true);
    const token = localStorage.getItem("crm_token");
    const H = { "Content-Type":"application/json", Authorization:`Bearer ${token}` };
    try {
      const url = modal.type==="add"
        ? "https://crm-api-iota-two.vercel.app/api/companies"
        : `https://crm-api-iota-two.vercel.app/api/companies/${modal.data.id}`;
      const r = await fetch(url, { method: modal.type==="add"?"POST":"PUT", headers:H, body:JSON.stringify(form) });
      const data = await r.json();
      if (data.error) { alert("Error: "+data.error); setSaving(false); return; }
      showMsg(modal.type==="add" ? "✅ Company contact added!" : "✅ Company contact updated!");
      setModal(null); load(page, search, filterCompany);
    } catch(e) { alert("Save failed: "+e.message); }
    setSaving(false);
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"?`)) return;
    const token = localStorage.getItem("crm_token");
    try {
      const r = await fetch(`https://crm-api-iota-two.vercel.app/api/companies/${id}`, {
        method:"DELETE", headers:{ Authorization:`Bearer ${token}` }
      });
      const data = await r.json();
      if (data.error) { alert(data.error); return; }
      showMsg("🗑️ Deleted!");
      load(page, search, filterCompany);
    } catch(e) { alert(e.message); }
  };

  const exportCSV = () => {
    const cols = ["ID","Company","SPOC","Contact Name","Department","Mobile","Email","Address","DSC","Hardcopy","Service Fee","Agreement URL"];
    const rows = (result.companies||[]).map(c=>[c.id,c.companyName,c.spoc,c.contactName,c.department,c.mobile,c.email,c.address,c.dsc,c.hardcopy,c.serviceFee,c.agreementUrl]);
    const csv = [cols,...rows].map(r=>r.map(v=>`"${v||""}"`).join(",")).join("\n");
    const a=document.createElement("a"); a.href="data:text/csv;charset=utf-8,"+encodeURIComponent(csv); a.download="companies.csv"; a.click();
  };

  const canEdit = user.role !== "viewer";
  const canDel = user.role === "admin";

  const DSCBadge = ({val}) => <span style={{ padding:"2px 7px", borderRadius:9, fontSize:10, fontWeight:700, background:val==="YES"?"#dcfce7":val==="Pending"?"#fef9c3":"#fee2e2", color:val==="YES"?"#16a34a":val==="Pending"?"#92400e":"#dc2626", whiteSpace:"nowrap" }}>{val||"—"}</span>;

  return (
    <div>
      {/* Header */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:18, flexWrap:"wrap", gap:10 }}>
        <div>
          <h2 style={{ fontSize:20, fontWeight:800, color:"#0f172a", margin:0 }}>Company Contacts</h2>
          <p style={{ color:"#64748b", margin:"3px 0 0", fontSize:13 }}>{result.total} contacts · Client database with agreements</p>
        </div>
        <div style={{ display:"flex", gap:7, flexWrap:"wrap" }}>
          <button onClick={()=>load(page,search,filterCompany)} style={{ display:"flex", alignItems:"center", gap:5, padding:"8px 12px", background:"#f1f5f9", border:"none", borderRadius:8, fontWeight:600, cursor:"pointer", fontSize:12 }}>
            <Icon n="refresh" s={13}/> Refresh
          </button>
          {canEdit && <button onClick={()=>setModal({type:"add"})} style={{ display:"flex", alignItems:"center", gap:5, padding:"8px 14px", background:"linear-gradient(135deg,#2563eb,#7c3aed)", color:"white", border:"none", borderRadius:8, fontWeight:600, cursor:"pointer", fontSize:12 }}>
            <Icon n="plus" s={13}/> Add Contact
          </button>}
          <button onClick={exportCSV} style={{ display:"flex", alignItems:"center", gap:5, padding:"8px 12px", background:"#f1f5f9", border:"none", borderRadius:8, fontWeight:600, cursor:"pointer", fontSize:12 }}>
            <Icon n="dl" s={13}/> Export CSV
          </button>
        </div>
      </div>

      {msg && <div style={{ background:"#dcfce7", color:"#166534", padding:"10px 16px", borderRadius:8, marginBottom:14, fontSize:13, fontWeight:600 }}>{msg}</div>}

      {/* Search + Filter */}
      <div style={{ background:"white", borderRadius:10, padding:12, marginBottom:14, boxShadow:"0 1px 3px rgba(0,0,0,.06)", border:"1px solid #f1f5f9" }}>
        <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
          <div style={{ flex:1, minWidth:180, display:"flex", alignItems:"center", gap:7, background:"#f8fafc", borderRadius:7, padding:"7px 10px", border:"1.5px solid #e2e8f0" }}>
            <Icon n="search" s={13}/>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search company, contact, email, mobile…" style={{ border:"none", background:"none", outline:"none", fontSize:13, width:"100%" }}/>
            {search && <button onClick={()=>{setSearch("");load(1,"",filterCompany);}} style={{ border:"none", background:"none", cursor:"pointer", color:"#94a3b8", display:"flex", padding:0 }}>✕</button>}
          </div>
          <div>
            <select value={filterCompany} onChange={e=>{setFilterCompany(e.target.value);setPage(1);load(1,search,e.target.value);}}
              style={{ padding:"7px 12px", borderRadius:7, border:"1.5px solid #e2e8f0", fontSize:13, background:"white", outline:"none", minWidth:140 }}>
              <option value="">All Companies</option>
              {uniqueCompanies.map(c=><option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          {filterCompany && <button onClick={()=>{setFilterCompany("");load(1,search,"");}} style={{ padding:"7px 12px", borderRadius:7, border:"1.5px solid #fecaca", background:"#fef2f2", color:"#dc2626", fontSize:12, fontWeight:600, cursor:"pointer" }}>Clear</button>}
        </div>
      </div>

      {/* Summary Cards */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(140px,1fr))", gap:10, marginBottom:14 }}>
        {[
          { l:"Total Contacts", v:result.total, c:"#2563eb" },
          { l:"DSC Received", v:(result.companies||[]).filter(c=>c.dsc==="YES").length, c:"#22c55e" },
          { l:"Hardcopy Received", v:(result.companies||[]).filter(c=>c.hardcopy==="YES").length, c:"#8b5cf6" },
          { l:"Agreement Pending", v:(result.companies||[]).filter(c=>!c.agreementUrl).length, c:"#f97316" },
        ].map(card=><div key={card.l} style={{ background:"white", borderRadius:10, padding:14, boxShadow:"0 1px 3px rgba(0,0,0,.06)", border:"1px solid #f1f5f9" }}>
          <div style={{ fontSize:22, fontWeight:800, color:card.c }}>{card.v}</div>
          <div style={{ fontSize:10, color:"#64748b", marginTop:2, fontWeight:500 }}>{card.l}</div>
        </div>)}
      </div>

      {/* Table */}
      <div style={{ background:"white", borderRadius:10, boxShadow:"0 1px 3px rgba(0,0,0,.06)", border:"1px solid #f1f5f9", overflow:"auto" }}>
        {loading ? <div style={{ padding:50, textAlign:"center" }}><Spin/><div style={{ marginTop:10, color:"#94a3b8", fontSize:13 }}>Loading…</div></div> :
        <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12 }}>
          <thead><tr style={{ background:"#f8fafc", borderBottom:"1.5px solid #e2e8f0" }}>
            {[["Company",120],["SPOC",80],["Contact Person",130],["Dept",70],["Mobile",100],["Email",160],["DSC",60],["Hardcopy",75],["Agreement",90],["",80]].map(([l,w])=>
              <th key={l} style={{ padding:"9px 10px", textAlign:"left", fontWeight:700, color:"#475569", fontSize:10, textTransform:"uppercase", letterSpacing:.4, minWidth:w }}>{l}</th>)}
          </tr></thead>
          <tbody>
            {!(result.companies||[]).length && <tr><td colSpan={10} style={{ padding:40, textAlign:"center", color:"#94a3b8" }}>No company contacts found.</td></tr>}
            {(result.companies||[]).map((c,i)=><tr key={c.id} style={{ borderBottom:"1px solid #f8fafc", background:i%2?"#fcfcfd":"white", transition:"background .1s" }}
              onMouseEnter={e=>e.currentTarget.style.background="#f0f9ff"}
              onMouseLeave={e=>e.currentTarget.style.background=i%2?"#fcfcfd":"white"}>
              <td style={{ padding:"9px 10px", fontWeight:700, color:"#1e293b" }}>
                <div style={{ display:"flex", alignItems:"center", gap:7 }}>
                  <div style={{ width:26, height:26, borderRadius:7, background:"linear-gradient(135deg,#2563eb22,#7c3aed22)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:800, color:"#2563eb", flexShrink:0 }}>
                    {c.companyName?.[0]?.toUpperCase()}
                  </div>
                  <span style={{ maxWidth:90, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{c.companyName}</span>
                </div>
              </td>
              <td style={{ padding:"9px 10px", color:"#475569" }}>{c.spoc||"—"}</td>
              <td style={{ padding:"9px 10px", fontWeight:500, color:"#0f172a" }}>{c.contactName||"—"}</td>
              <td style={{ padding:"9px 10px", color:"#64748b" }}>{c.department||"—"}</td>
              <td style={{ padding:"9px 10px", color:"#64748b", fontFamily:"monospace", fontSize:11 }}>{c.mobile||"—"}</td>
              <td style={{ padding:"9px 10px", color:"#2563eb", fontSize:11 }}>
                {c.email ? <a href={`mailto:${c.email}`} style={{ color:"#2563eb", textDecoration:"none" }}>{c.email}</a> : "—"}
              </td>
              <td style={{ padding:"9px 10px" }}><DSCBadge val={c.dsc}/></td>
              <td style={{ padding:"9px 10px" }}><DSCBadge val={c.hardcopy}/></td>
              <td style={{ padding:"9px 10px" }}>
                {c.agreementUrl
                  ? <a href={c.agreementUrl} target="_blank" rel="noreferrer" style={{ display:"inline-flex", alignItems:"center", gap:4, padding:"3px 8px", background:"#eff6ff", color:"#2563eb", borderRadius:6, fontSize:11, fontWeight:600, textDecoration:"none" }}>📄 View</a>
                  : <span style={{ color:"#94a3b8", fontSize:11 }}>No PDF</span>}
              </td>
              <td style={{ padding:"9px 10px" }}>
                <div style={{ display:"flex", gap:3 }}>
                  <button onClick={()=>setModal({type:"view",data:c})} title="View" style={{ padding:4, background:"#f0f9ff", border:"none", borderRadius:5, cursor:"pointer", color:"#2563eb", display:"flex" }}><Icon n="eye" s={12}/></button>
                  {canEdit && <button onClick={()=>setModal({type:"edit",data:c})} title="Edit" style={{ padding:4, background:"#f0fdf4", border:"none", borderRadius:5, cursor:"pointer", color:"#16a34a", display:"flex" }}><Icon n="edit" s={12}/></button>}
                  {canDel && <button onClick={()=>handleDelete(c.id,c.contactName||c.companyName)} title="Delete" style={{ padding:4, background:"#fef2f2", border:"none", borderRadius:5, cursor:"pointer", color:"#dc2626", display:"flex" }}><Icon n="trash" s={12}/></button>}
                </div>
              </td>
            </tr>)}
          </tbody>
        </table>}
      </div>

      {/* Pagination */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:12, flexWrap:"wrap", gap:8 }}>
        <span style={{ fontSize:12, color:"#64748b" }}>Page {page} of {result.pages||1} · {result.total||0} total</span>
        <div style={{ display:"flex", gap:3 }}>
          <button onClick={()=>{setPage(1);load(1,search,filterCompany);}} disabled={page<=1} style={{ padding:"5px 10px", border:"1.5px solid #e2e8f0", borderRadius:6, background:"white", cursor:page<=1?"not-allowed":"pointer", fontSize:12, opacity:page<=1?.4:1 }}>«</button>
          <button onClick={()=>{const p=page-1;setPage(p);load(p,search,filterCompany);}} disabled={page<=1} style={{ padding:"5px 10px", border:"1.5px solid #e2e8f0", borderRadius:6, background:"white", cursor:page<=1?"not-allowed":"pointer", fontSize:12, opacity:page<=1?.4:1 }}>‹ Prev</button>
          <span style={{ padding:"5px 12px", background:"#2563eb", color:"white", borderRadius:6, fontSize:12, fontWeight:700 }}>{page}</span>
          <button onClick={()=>{const p=page+1;setPage(p);load(p,search,filterCompany);}} disabled={page>=result.pages} style={{ padding:"5px 10px", border:"1.5px solid #e2e8f0", borderRadius:6, background:"white", cursor:page>=result.pages?"not-allowed":"pointer", fontSize:12, opacity:page>=result.pages?.4:1 }}>Next ›</button>
          <button onClick={()=>{setPage(result.pages);load(result.pages,search,filterCompany);}} disabled={page>=result.pages} style={{ padding:"5px 10px", border:"1.5px solid #e2e8f0", borderRadius:6, background:"white", cursor:page>=result.pages?"not-allowed":"pointer", fontSize:12, opacity:page>=result.pages?.4:1 }}>»</button>
        </div>
      </div>

      {/* Modals */}
      <Modal open={modal?.type==="add"} onClose={()=>setModal(null)} title="Add Company Contact" wide>
        <CompanyForm onSave={handleSave} onCancel={()=>setModal(null)} saving={saving}/>
      </Modal>
      <Modal open={modal?.type==="edit"} onClose={()=>setModal(null)} title="Edit Company Contact" wide>
        <CompanyForm initial={modal?.data} onSave={handleSave} onCancel={()=>setModal(null)} saving={saving}/>
      </Modal>
      <Modal open={modal?.type==="view"} onClose={()=>setModal(null)} title="Company Contact Details">
        <ViewCompany c={modal?.data}/>
      </Modal>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
