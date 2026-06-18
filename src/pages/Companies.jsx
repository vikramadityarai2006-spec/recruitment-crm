import { useState, useEffect, useCallback } from "react";
import { api } from "../api";
import { Spin, Modal, Icon } from "../components/UI";

// ─── COMPANY FORM ─────────────────────────────────────────────────────────────
function CompanyForm({ initial, onSave, onCancel, saving }) {
  const blank = { companyName:"",spoc:"",contactName:"",department:"HR",mobile:"",email:"",address:"",dsc:"NO",hardcopy:"NO",serviceFee:"",agreementUrl:"" };
  const [form, setForm] = useState(initial ? {
    companyName:initial.companyName||"", spoc:initial.spoc||"", contactName:initial.contactName||"",
    department:initial.department||"HR", mobile:initial.mobile||"", email:initial.email||"",
    address:initial.address||"", dsc:initial.dsc||"NO", hardcopy:initial.hardcopy||"NO",
    serviceFee:initial.serviceFee||"", agreementUrl:initial.agreementUrl||""
  } : blank);
  const set = (k,v) => setForm(f=>({...f,[k]:v}));

  const F=(l,k,t="text",p="")=>(
    <div style={{marginBottom:16}}>
      <label style={{display:"block",fontSize:11,fontWeight:700,color:"#64748b",marginBottom:5,textTransform:"uppercase",letterSpacing:.6}}>{l}</label>
      <input type={t} value={form[k]||""} onChange={e=>set(k,e.target.value)} placeholder={p}
        style={{width:"100%",padding:"9px 12px",borderRadius:9,border:"1.5px solid #e2e8f0",fontSize:13,boxSizing:"border-box",outline:"none",transition:"border .2s",background:"#fafafa"}}
        onFocus={e=>e.target.style.borderColor="#2563eb"}
        onBlur={e=>e.target.style.borderColor="#e2e8f0"}/>
    </div>
  );
  const S=(l,k,opts)=>(
    <div style={{marginBottom:16}}>
      <label style={{display:"block",fontSize:11,fontWeight:700,color:"#64748b",marginBottom:5,textTransform:"uppercase",letterSpacing:.6}}>{l}</label>
      <select value={form[k]||""} onChange={e=>set(k,e.target.value)}
        style={{width:"100%",padding:"9px 12px",borderRadius:9,border:"1.5px solid #e2e8f0",fontSize:13,boxSizing:"border-box",outline:"none",background:"#fafafa"}}>
        {opts.map(o=><option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );

  return (
    <div>
      <div style={{background:"linear-gradient(135deg,#f0f9ff,#eff6ff)",borderRadius:12,padding:16,marginBottom:20,border:"1px solid #bfdbfe"}}>
        <div style={{fontSize:13,fontWeight:700,color:"#1d4ed8",marginBottom:2}}>📋 Company Contact Details</div>
        <div style={{fontSize:12,color:"#64748b"}}>Fill in all fields. Agreement PDF link can be added anytime after uploading to Google Drive.</div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 16px"}}>
        {F("🏢 Company Name","companyName","text","e.g. Alicon Group")}
        {F("👤 SPOC (Our Owner)","spoc","text","e.g. Yogita, Sameer")}
        {F("🙍 Contact Person Name","contactName","text","e.g. Rahul Sharma")}
        {F("🏬 Department","department","text","e.g. HR, Operations")}
        {F("📱 Mobile Number","mobile","tel","10-digit mobile")}
        {F("📧 Email Address","email","email","e.g. hr@company.com")}
        {S("📄 DSC Received","dsc",["YES","NO","Pending"])}
        {S("📁 Hardcopy Received","hardcopy",["YES","NO","Pending"])}
        {F("💰 Service Fee","serviceFee","text","e.g. 8.33% + GST")}
        {F("🔗 Agreement PDF URL","agreementUrl","url","https://drive.google.com/...")}
      </div>
      <div style={{marginBottom:16}}>
        <label style={{display:"block",fontSize:11,fontWeight:700,color:"#64748b",marginBottom:5,textTransform:"uppercase",letterSpacing:.6}}>📍 Office Address</label>
        <textarea value={form.address||""} onChange={e=>set("address",e.target.value)} rows={3} placeholder="Full office address with pincode…"
          style={{width:"100%",padding:"9px 12px",borderRadius:9,border:"1.5px solid #e2e8f0",fontSize:13,boxSizing:"border-box",outline:"none",resize:"vertical",background:"#fafafa"}}
          onFocus={e=>e.target.style.borderColor="#2563eb"}
          onBlur={e=>e.target.style.borderColor="#e2e8f0"}/>
      </div>
      <div style={{background:"#f0fdf4",border:"1px solid #bbf7d0",borderRadius:10,padding:"10px 14px",marginBottom:20,fontSize:12,color:"#16a34a",display:"flex",alignItems:"center",gap:8}}>
        💡 <span><strong>Agreement PDF:</strong> Upload to Google Drive → Right-click → Share → Anyone with link → Copy link → Paste above.</span>
      </div>
      <div style={{display:"flex",gap:10,justifyContent:"flex-end"}}>
        <button onClick={onCancel} style={{padding:"10px 20px",background:"white",border:"1.5px solid #e2e8f0",borderRadius:10,fontWeight:600,cursor:"pointer",fontSize:13,color:"#374151"}}>Cancel</button>
        <button onClick={()=>onSave(form)} disabled={saving}
          style={{padding:"10px 24px",background:"linear-gradient(135deg,#2563eb,#7c3aed)",color:"white",border:"none",borderRadius:10,fontWeight:700,cursor:"pointer",fontSize:13,opacity:saving?.7:1,boxShadow:"0 4px 12px rgba(37,99,235,.3)"}}>
          {saving?"Saving…":"Save Company Contact"}
        </button>
      </div>
    </div>
  );
}

// ─── VIEW COMPANY ─────────────────────────────────────────────────────────────
function ViewCompany({ c }) {
  if (!c) return null;
  const StatusBadge = ({v,label}) => {
    const s = v==="YES"?{bg:"#dcfce7",c:"#16a34a",icon:"✅"} : v==="Pending"?{bg:"#fef9c3",c:"#92400e",icon:"⏳"} : {bg:"#fee2e2",c:"#dc2626",icon:"❌"};
    return <div style={{background:s.bg,border:`1px solid ${s.c}33`,borderRadius:10,padding:"10px 16px",textAlign:"center"}}>
      <div style={{fontSize:18,marginBottom:4}}>{s.icon}</div>
      <div style={{fontSize:11,fontWeight:700,color:s.c}}>{label}</div>
      <div style={{fontSize:13,fontWeight:800,color:s.c,marginTop:2}}>{v||"NO"}</div>
    </div>;
  };
  const R=(l,v,link=false)=>(
    <div style={{display:"flex",padding:"10px 0",borderBottom:"1px solid #f8fafc",alignItems:"flex-start"}}>
      <div style={{width:160,fontSize:10,fontWeight:700,color:"#94a3b8",textTransform:"uppercase",letterSpacing:.8,flexShrink:0,paddingTop:2}}>{l}</div>
      <div style={{fontSize:13,color:"#0f172a",fontWeight:500,flex:1}}>
        {link&&v ? <a href={v} target="_blank" rel="noreferrer" style={{color:"#2563eb",textDecoration:"none",display:"inline-flex",alignItems:"center",gap:6,background:"#eff6ff",padding:"4px 12px",borderRadius:8,fontWeight:600,fontSize:12,border:"1px solid #bfdbfe"}}>📄 View Agreement PDF ↗</a> : v||"—"}
      </div>
    </div>
  );
  return (
    <div>
      <div style={{background:"linear-gradient(135deg,#0f172a,#1e3a5f)",borderRadius:14,padding:22,marginBottom:20}}>
        <div style={{display:"flex",alignItems:"center",gap:16}}>
          <div style={{width:56,height:56,borderRadius:14,background:"linear-gradient(135deg,#2563eb,#7c3aed)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,fontWeight:900,color:"white",boxShadow:"0 8px 24px rgba(37,99,235,.4)",flexShrink:0}}>
            {c.companyName?.[0]?.toUpperCase()}
          </div>
          <div style={{flex:1}}>
            <h3 style={{margin:0,fontSize:20,fontWeight:800,color:"white"}}>{c.companyName}</h3>
            <p style={{margin:"4px 0 0",color:"#94a3b8",fontSize:12}}>{c.contactName} · {c.department}</p>
            {c.serviceFee && <div style={{marginTop:6,background:"rgba(34,197,94,.15)",border:"1px solid rgba(34,197,94,.3)",borderRadius:8,padding:"3px 10px",display:"inline-block",fontSize:11,color:"#22c55e",fontWeight:600}}>💰 {c.serviceFee}</div>}
          </div>
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:16}}>
        <StatusBadge v={c.dsc} label="DSC"/>
        <StatusBadge v={c.hardcopy} label="Hardcopy"/>
        <StatusBadge v={c.agreementUrl?"YES":"NO"} label="Agreement"/>
      </div>
      {R("SPOC",c.spoc)}{R("Contact",c.contactName)}{R("Department",c.department)}
      {R("Mobile",c.mobile)}{R("Email",c.email)}{R("Service Fee",c.serviceFee)}
      {R("Address",c.address)}
      {R("Agreement PDF",c.agreementUrl,true)}
    </div>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
export default function Companies({ user }) {
  const [result, setResult] = useState({companies:[],total:0,pages:1});
  const [search, setSearch] = useState("");
  const [filterCompany, setFilterCompany] = useState("");
  const [filterDsc, setFilterDsc] = useState("");
  const [filterHardcopy, setFilterHardcopy] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({text:"",type:"success"});
  const [uniqCompanies, setUniqCompanies] = useState([]);

  const showMsg = (text,type="success") => { setMsg({text,type}); setTimeout(()=>setMsg({text:"",type:"success"}),3000); };

  const load = useCallback(async (p=1,s="",fc="") => {
    setLoading(true);
    try {
      const params = {page:p,limit:50};
      if (s) params.search=s;
      if (fc) params.company=fc;
      const res = await api.getCompanies(params);
      if (res&&!res.error) {
        setResult(res);
        if (!fc&&!s&&res.companies) setUniqCompanies([...new Set(res.companies.map(c=>c.companyName))].sort());
      }
    } catch(e) { showMsg("Failed to load","error"); }
    setLoading(false);
  }, []);

  useEffect(()=>{ const t=setTimeout(()=>{load(1,search,filterCompany);setPage(1);},400); return()=>clearTimeout(t); },[search]);
  useEffect(()=>{ load(page,search,filterCompany); },[page,filterCompany]);

  const handleSave = async form => {
    if (!form.companyName) { showMsg("Company name required","error"); return; }
    setSaving(true);
    try {
      const r = modal.type==="add" ? await api.createCompany(form) : await api.updateCompany(modal.data.id,form);
      if (r.error) { showMsg(r.error,"error"); setSaving(false); return; }
      showMsg(modal.type==="add"?"✅ Company contact added!":"✅ Updated successfully!");
      setModal(null); load(page,search,filterCompany);
    } catch(e) { showMsg(e.message,"error"); }
    setSaving(false);
  };

  const handleDelete = async (id,name) => {
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return;
    try {
      const r = await api.deleteCompany(id);
      if (r.error) { showMsg(r.error,"error"); return; }
      showMsg("🗑️ Contact deleted!"); load(page,search,filterCompany);
    } catch(e) { showMsg(e.message,"error"); }
  };

  const exportCSV = () => {
    const cols=["ID","Company","SPOC","Contact","Dept","Mobile","Email","Address","DSC","Hardcopy","Service Fee","Agreement"];
    const rows=(result.companies||[]).map(c=>[c.id,c.companyName,c.spoc,c.contactName,c.department,c.mobile,c.email,c.address,c.dsc,c.hardcopy,c.serviceFee,c.agreementUrl]);
    const csv=[cols,...rows].map(r=>r.map(v=>`"${v||""}"`).join(",")).join("\n");
    const a=document.createElement("a");a.href="data:text/csv;charset=utf-8,"+encodeURIComponent(csv);a.download="companies.csv";a.click();
  };

  const canEdit = user.role!=="viewer";
  const canDel = user.role==="admin";
  const cos = result.companies||[];

  // Client-side filter for DSC/Hardcopy
  const filtered = cos.filter(c => {
    if (filterDsc && c.dsc!==filterDsc) return false;
    if (filterHardcopy && c.hardcopy!==filterHardcopy) return false;
    return true;
  });

  const stats = [
    {l:"Total Contacts",v:result.total,c:"#2563eb",bg:"#eff6ff",icon:"👥"},
    {l:"DSC Received",v:cos.filter(c=>c.dsc==="YES").length,c:"#22c55e",bg:"#f0fdf4",icon:"✅"},
    {l:"Hardcopy Done",v:cos.filter(c=>c.hardcopy==="YES").length,c:"#8b5cf6",bg:"#f5f3ff",icon:"📁"},
    {l:"Agreements",v:cos.filter(c=>c.agreementUrl).length,c:"#f97316",bg:"#fff7ed",icon:"📄"},
    {l:"Pending Agreement",v:cos.filter(c=>!c.agreementUrl).length,c:"#ef4444",bg:"#fef2f2",icon:"⚠️"},
  ];

  const DSCBadge = ({v}) => {
    const s = v==="YES"?{bg:"#dcfce7",c:"#16a34a"} : v==="Pending"?{bg:"#fef9c3",c:"#92400e"} : {bg:"#fee2e2",c:"#dc2626"};
    return <span style={{padding:"3px 8px",borderRadius:8,fontSize:10,fontWeight:700,whiteSpace:"nowrap",background:s.bg,color:s.c}}>{v||"NO"}</span>;
  };

  return (
    <div>
      {/* ── HEADER ── */}
      <div style={{background:"white",borderRadius:16,padding:"20px 24px",marginBottom:18,boxShadow:"0 1px 3px rgba(0,0,0,.06)",border:"1px solid #f1f5f9"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:12}}>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <div style={{width:40,height:40,borderRadius:11,background:"linear-gradient(135deg,#0f172a,#1e3a5f)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>🏢</div>
            <div>
              <h2 style={{fontSize:18,fontWeight:800,color:"#0f172a",margin:0}}>Company Contacts</h2>
              <p style={{color:"#64748b",margin:0,fontSize:12}}><strong style={{color:"#0f172a"}}>{result.total}</strong> client contacts · agreement & compliance tracker</p>
            </div>
          </div>
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
            {canEdit && <button onClick={()=>setModal({type:"add"})} style={{display:"flex",alignItems:"center",gap:6,padding:"9px 18px",background:"linear-gradient(135deg,#2563eb,#7c3aed)",color:"white",border:"none",borderRadius:10,fontWeight:700,cursor:"pointer",fontSize:13,boxShadow:"0 4px 12px rgba(37,99,235,.3)"}}
              onMouseEnter={e=>e.currentTarget.style.transform="translateY(-1px)"}
              onMouseLeave={e=>e.currentTarget.style.transform="translateY(0)"}>
              <Icon n="plus" s={14}/> Add Contact
            </button>}
            <button onClick={()=>load(page,search,filterCompany)} style={{display:"flex",alignItems:"center",gap:6,padding:"9px 14px",background:"white",border:"1.5px solid #e2e8f0",borderRadius:10,fontWeight:600,cursor:"pointer",fontSize:12,color:"#374151"}}>
              <Icon n="refresh" s={13}/> Refresh
            </button>
            <button onClick={exportCSV} style={{display:"flex",alignItems:"center",gap:6,padding:"9px 14px",background:"white",border:"1.5px solid #e2e8f0",borderRadius:10,fontWeight:600,cursor:"pointer",fontSize:12,color:"#374151"}}>
              <Icon n="dl" s={13}/> Export
            </button>
          </div>
        </div>
      </div>

      {/* ── STATS ── */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(150px,1fr))",gap:12,marginBottom:18}}>
        {stats.map(s=>(
          <div key={s.l} style={{background:"white",borderRadius:12,padding:"16px 18px",boxShadow:"0 1px 3px rgba(0,0,0,.06)",border:"1px solid #f1f5f9",display:"flex",alignItems:"center",gap:12}}>
            <div style={{width:40,height:40,borderRadius:10,background:s.bg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>{s.icon}</div>
            <div>
              <div style={{fontSize:22,fontWeight:800,color:s.c,lineHeight:1}}>{s.v}</div>
              <div style={{fontSize:10,color:"#64748b",marginTop:3,fontWeight:500,lineHeight:1.2}}>{s.l}</div>
            </div>
          </div>
        ))}
      </div>

      {msg.text && <div style={{background:msg.type==="error"?"#fee2e2":"#dcfce7",color:msg.type==="error"?"#991b1b":"#166534",padding:"12px 18px",borderRadius:10,marginBottom:14,fontSize:13,fontWeight:600,display:"flex",alignItems:"center",gap:8}}>{msg.text}</div>}

      {/* ── SEARCH & FILTERS ── */}
      <div style={{background:"white",borderRadius:14,padding:16,marginBottom:16,boxShadow:"0 1px 3px rgba(0,0,0,.06)",border:"1px solid #f1f5f9"}}>
        <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
          <div style={{flex:1,minWidth:200,display:"flex",alignItems:"center",gap:8,background:"#f8fafc",borderRadius:10,padding:"10px 14px",border:"1.5px solid #e2e8f0"}}>
            <Icon n="search" s={14}/>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search company, contact, email, mobile…"
              style={{border:"none",background:"none",outline:"none",fontSize:13,width:"100%",color:"#374151"}}/>
            {search && <button onClick={()=>{setSearch("");load(1,"",filterCompany);}} style={{border:"none",background:"none",cursor:"pointer",color:"#94a3b8",fontSize:16,display:"flex",padding:0}}>✕</button>}
          </div>
          <select value={filterCompany} onChange={e=>{setFilterCompany(e.target.value);setPage(1);load(1,search,e.target.value);}}
            style={{padding:"10px 14px",borderRadius:10,border:"1.5px solid #e2e8f0",fontSize:12,background:"white",outline:"none",minWidth:160,fontWeight:500,color:"#374151"}}>
            <option value="">🏢 All Companies</option>
            {uniqCompanies.map(c=><option key={c} value={c}>{c}</option>)}
          </select>
          <select value={filterDsc} onChange={e=>setFilterDsc(e.target.value)}
            style={{padding:"10px 14px",borderRadius:10,border:`1.5px solid ${filterDsc?"#2563eb":"#e2e8f0"}`,fontSize:12,background:filterDsc?"#eff6ff":"white",outline:"none",color:filterDsc?"#1d4ed8":"#374151",fontWeight:filterDsc?600:500}}>
            <option value="">📄 DSC: All</option>
            <option value="YES">DSC: Received</option>
            <option value="NO">DSC: Not Received</option>
            <option value="Pending">DSC: Pending</option>
          </select>
          <select value={filterHardcopy} onChange={e=>setFilterHardcopy(e.target.value)}
            style={{padding:"10px 14px",borderRadius:10,border:`1.5px solid ${filterHardcopy?"#2563eb":"#e2e8f0"}`,fontSize:12,background:filterHardcopy?"#eff6ff":"white",outline:"none",color:filterHardcopy?"#1d4ed8":"#374151",fontWeight:filterHardcopy?600:500}}>
            <option value="">📁 Hardcopy: All</option>
            <option value="YES">Hardcopy: Done</option>
            <option value="NO">Hardcopy: Pending</option>
          </select>
          {(filterCompany||filterDsc||filterHardcopy) && <button onClick={()=>{setFilterCompany("");setFilterDsc("");setFilterHardcopy("");load(1,search,"");}}
            style={{padding:"10px 14px",borderRadius:10,border:"1.5px solid #fecaca",background:"#fef2f2",color:"#dc2626",fontSize:12,fontWeight:700,cursor:"pointer"}}>
            Clear ✕
          </button>}
        </div>
      </div>

      {/* ── TABLE ── */}
      <div style={{background:"white",borderRadius:14,boxShadow:"0 1px 3px rgba(0,0,0,.06)",border:"1px solid #f1f5f9",overflow:"hidden"}}>
        {loading ? (
          <div style={{padding:80,textAlign:"center"}}>
            <div style={{width:40,height:40,border:"3px solid #f1f5f9",borderTop:"3px solid #2563eb",borderRadius:"50%",animation:"spin 0.8s linear infinite",margin:"0 auto 14px"}}/>
            <div style={{color:"#64748b",fontSize:13}}>Loading company contacts…</div>
          </div>
        ) : filtered.length===0 ? (
          <div style={{padding:80,textAlign:"center"}}>
            <div style={{width:64,height:64,borderRadius:18,background:"linear-gradient(135deg,#f1f5f9,#e2e8f0)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 16px",fontSize:28}}>🏢</div>
            <div style={{fontSize:16,fontWeight:700,color:"#0f172a",marginBottom:6}}>No company contacts found</div>
            <div style={{fontSize:13,color:"#94a3b8",marginBottom:16}}>Try adjusting filters or add your first company contact</div>
            {canEdit && <button onClick={()=>setModal({type:"add"})} style={{padding:"10px 20px",background:"linear-gradient(135deg,#2563eb,#7c3aed)",color:"white",border:"none",borderRadius:10,fontWeight:700,cursor:"pointer",fontSize:13}}>+ Add Company Contact</button>}
          </div>
        ) : (
          <>
          <div style={{overflow:"auto"}}>
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
              <thead>
                <tr style={{background:"linear-gradient(to right,#f8fafc,#f1f5f9)"}}>
                  {[["Company",130],["SPOC",80],["Contact Person",140],["Dept",70],["Mobile",105],["Email",170],["DSC",65],["Hardcopy",85],["Agreement",95],["",90]].map(([l,w])=>(
                    <th key={l} style={{padding:"12px 12px",textAlign:"left",fontWeight:700,color:"#64748b",fontSize:10,textTransform:"uppercase",letterSpacing:.7,minWidth:w,whiteSpace:"nowrap",borderBottom:"2px solid #e2e8f0"}}>{l}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((c,i)=>(
                  <tr key={c.id}
                    style={{borderBottom:"1px solid #f8fafc",background:i%2===0?"white":"#fcfcfd",transition:"all .1s"}}
                    onMouseEnter={e=>{ e.currentTarget.style.background="#f0f9ff"; e.currentTarget.style.boxShadow="inset 3px 0 0 #2563eb"; }}
                    onMouseLeave={e=>{ e.currentTarget.style.background=i%2===0?"white":"#fcfcfd"; e.currentTarget.style.boxShadow="none"; }}>
                    <td style={{padding:"12px 12px"}}>
                      <div style={{display:"flex",alignItems:"center",gap:8}}>
                        <div style={{width:30,height:30,borderRadius:8,background:"linear-gradient(135deg,#0f172a,#1e3a5f)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:800,color:"white",flexShrink:0}}>
                          {c.companyName?.[0]?.toUpperCase()}
                        </div>
                        <span style={{fontWeight:700,color:"#1e293b",maxWidth:95,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.companyName}</span>
                      </div>
                    </td>
                    <td style={{padding:"12px 12px"}}>
                      {c.spoc ? <span style={{background:"#f0f9ff",color:"#0369a1",border:"1px solid #bae6fd",padding:"2px 8px",borderRadius:8,fontSize:11,fontWeight:600}}>{c.spoc}</span> : <span style={{color:"#94a3b8"}}>—</span>}
                    </td>
                    <td style={{padding:"12px 12px"}}>
                      <div style={{fontWeight:600,color:"#0f172a"}}>{c.contactName||"—"}</div>
                    </td>
                    <td style={{padding:"12px 12px"}}>
                      <span style={{background:"#f8fafc",border:"1px solid #e2e8f0",color:"#64748b",padding:"2px 8px",borderRadius:7,fontSize:11}}>{c.department||"—"}</span>
                    </td>
                    <td style={{padding:"12px 12px",fontFamily:"monospace",fontSize:11,color:"#475569"}}>{c.mobile||"—"}</td>
                    <td style={{padding:"12px 12px",fontSize:11}}>
                      {c.email ? <a href={`mailto:${c.email}`} style={{color:"#2563eb",textDecoration:"none",maxWidth:160,display:"block",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.email}</a> : "—"}
                    </td>
                    <td style={{padding:"12px 12px"}}><DSCBadge v={c.dsc}/></td>
                    <td style={{padding:"12px 12px"}}><DSCBadge v={c.hardcopy}/></td>
                    <td style={{padding:"12px 12px"}}>
                      {c.agreementUrl
                        ? <a href={c.agreementUrl} target="_blank" rel="noreferrer" style={{display:"inline-flex",alignItems:"center",gap:5,padding:"4px 10px",background:"#eff6ff",color:"#2563eb",borderRadius:8,fontSize:11,fontWeight:700,textDecoration:"none",border:"1px solid #bfdbfe"}}>📄 View</a>
                        : <span style={{color:"#94a3b8",fontSize:11,background:"#fef2f2",padding:"3px 8px",borderRadius:7,border:"1px solid #fecaca",fontWeight:600}}>⚠️ Missing</span>}
                    </td>
                    <td style={{padding:"12px 12px"}}>
                      <div style={{display:"flex",gap:4}}>
                        <button onClick={()=>setModal({type:"view",data:c})} title="View" style={{padding:"5px 7px",background:"#f0f9ff",border:"1px solid #bfdbfe",borderRadius:6,cursor:"pointer",color:"#2563eb",display:"flex"}}
                          onMouseEnter={e=>e.currentTarget.style.background="#dbeafe"}
                          onMouseLeave={e=>e.currentTarget.style.background="#f0f9ff"}>
                          <Icon n="eye" s={12}/>
                        </button>
                        {canEdit && <button onClick={()=>setModal({type:"edit",data:c})} title="Edit" style={{padding:"5px 7px",background:"#f0fdf4",border:"1px solid #bbf7d0",borderRadius:6,cursor:"pointer",color:"#16a34a",display:"flex"}}
                          onMouseEnter={e=>e.currentTarget.style.background="#dcfce7"}
                          onMouseLeave={e=>e.currentTarget.style.background="#f0fdf4"}>
                          <Icon n="edit" s={12}/>
                        </button>}
                        {canDel && <button onClick={()=>handleDelete(c.id,c.contactName||c.companyName)} title="Delete" style={{padding:"5px 7px",background:"#fef2f2",border:"1px solid #fecaca",borderRadius:6,cursor:"pointer",color:"#dc2626",display:"flex"}}
                          onMouseEnter={e=>e.currentTarget.style.background="#fee2e2"}
                          onMouseLeave={e=>e.currentTarget.style.background="#fef2f2"}>
                          <Icon n="trash" s={12}/>
                        </button>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{padding:"14px 20px",borderTop:"1px solid #f1f5f9",background:"#fafafa",display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:8}}>
            <div style={{fontSize:12,color:"#64748b"}}>
              Showing <strong style={{color:"#0f172a"}}>{filtered.length}</strong> of <strong style={{color:"#0f172a"}}>{result.total}</strong> contacts
            </div>
            <div style={{display:"flex",gap:4}}>
              <button onClick={()=>{const p=page-1;setPage(p);load(p,search,filterCompany);}} disabled={page<=1} style={{padding:"6px 12px",border:"1.5px solid #e2e8f0",borderRadius:8,background:"white",cursor:page<=1?"not-allowed":"pointer",fontSize:12,opacity:page<=1?.4:1,fontWeight:600}}>‹ Prev</button>
              <span style={{padding:"6px 14px",background:"#2563eb",color:"white",borderRadius:8,fontSize:12,fontWeight:700}}>{page}</span>
              <button onClick={()=>{const p=page+1;setPage(p);load(p,search,filterCompany);}} disabled={page>=result.pages} style={{padding:"6px 12px",border:"1.5px solid #e2e8f0",borderRadius:8,background:"white",cursor:page>=result.pages?"not-allowed":"pointer",fontSize:12,opacity:page>=result.pages?.4:1,fontWeight:600}}>Next ›</button>
            </div>
          </div>
          </>
        )}
      </div>

      <Modal open={modal?.type==="add"} onClose={()=>setModal(null)} title="Add Company Contact" wide>
        <CompanyForm onSave={handleSave} onCancel={()=>setModal(null)} saving={saving}/>
      </Modal>
      <Modal open={modal?.type==="edit"} onClose={()=>setModal(null)} title="Edit Company Contact" wide>
        <CompanyForm initial={modal?.data} onSave={handleSave} onCancel={()=>setModal(null)} saving={saving}/>
      </Modal>
      <Modal open={modal?.type==="view"} onClose={()=>setModal(null)} title="Company Details">
        <ViewCompany c={modal?.data}/>
      </Modal>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
