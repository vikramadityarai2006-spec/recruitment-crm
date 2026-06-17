import { useState, useEffect, useCallback } from "react";
import { api } from "../api";
import { Spin, Modal, Icon } from "../components/UI";

function CompanyForm({ initial, onSave, onCancel, saving }) {
  const blank = { companyName:"",spoc:"",contactName:"",department:"HR",mobile:"",email:"",address:"",dsc:"NO",hardcopy:"NO",serviceFee:"",agreementUrl:"" };
  const [form, setForm] = useState(initial || blank);
  const set = (k,v) => setForm(f=>({...f,[k]:v}));
  const F=(l,k,t="text",p="")=><div style={{marginBottom:14}}>
    <label style={{display:"block",fontSize:11,fontWeight:600,color:"#475569",marginBottom:3,textTransform:"uppercase",letterSpacing:.4}}>{l}</label>
    <input type={t} value={form[k]||""} onChange={e=>set(k,e.target.value)} placeholder={p} style={{width:"100%",padding:"8px 10px",borderRadius:7,border:"1.5px solid #e2e8f0",fontSize:13,boxSizing:"border-box",outline:"none"}}/>
  </div>;
  const S=(l,k,opts)=><div style={{marginBottom:14}}>
    <label style={{display:"block",fontSize:11,fontWeight:600,color:"#475569",marginBottom:3,textTransform:"uppercase",letterSpacing:.4}}>{l}</label>
    <select value={form[k]||""} onChange={e=>set(k,e.target.value)} style={{width:"100%",padding:"8px 10px",borderRadius:7,border:"1.5px solid #e2e8f0",fontSize:13,boxSizing:"border-box",outline:"none",background:"white"}}>
      {opts.map(o=><option key={o} value={o}>{o}</option>)}
    </select>
  </div>;
  return <div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 14px"}}>
      {F("Company Name","companyName","text","e.g. Alicon Group")}
      {F("SPOC (Our Owner)","spoc","text","e.g. Yogita")}
      {F("Contact Person","contactName","text","e.g. Rahul Sharma")}
      {F("Department","department","text","e.g. HR")}
      {F("Mobile","mobile","tel","10-digit number")}
      {F("Email","email","email","e.g. hr@company.com")}
      {S("DSC Received","dsc",["YES","NO","Pending"])}
      {S("Hardcopy Received","hardcopy",["YES","NO","Pending"])}
      {F("Service Fee","serviceFee","text","e.g. 8.33% + GST")}
      {F("Agreement PDF URL","agreementUrl","url","https://drive.google.com/...")}
    </div>
    <div style={{marginBottom:14}}>
      <label style={{display:"block",fontSize:11,fontWeight:600,color:"#475569",marginBottom:3,textTransform:"uppercase",letterSpacing:.4}}>Office Address</label>
      <textarea value={form.address||""} onChange={e=>set("address",e.target.value)} rows={3} placeholder="Full office address…" style={{width:"100%",padding:"8px 10px",borderRadius:7,border:"1.5px solid #e2e8f0",fontSize:13,boxSizing:"border-box",outline:"none",resize:"vertical"}}/>
    </div>
    <div style={{background:"#f0f9ff",border:"1px solid #bae6fd",borderRadius:8,padding:"10px 14px",marginBottom:16,fontSize:12,color:"#0369a1"}}>
      💡 <strong>Agreement PDF:</strong> Upload to Google Drive → share publicly → paste link above.
    </div>
    <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
      <button onClick={onCancel} style={{padding:"9px 18px",background:"#f1f5f9",border:"none",borderRadius:8,fontWeight:600,cursor:"pointer",fontSize:13}}>Cancel</button>
      <button onClick={()=>onSave(form)} disabled={saving} style={{padding:"9px 18px",background:"linear-gradient(135deg,#2563eb,#7c3aed)",color:"white",border:"none",borderRadius:8,fontWeight:600,cursor:"pointer",fontSize:13,opacity:saving?.7:1}}>
        {saving?"Saving…":"Save Company"}
      </button>
    </div>
  </div>;
}

function ViewCompany({c}) {
  if(!c) return null;
  const R=(l,v,link=false)=><div style={{display:"flex",borderBottom:"1px solid #f8fafc",padding:"9px 0"}}>
    <div style={{width:160,fontSize:11,fontWeight:700,color:"#64748b",textTransform:"uppercase",letterSpacing:.4,flexShrink:0}}>{l}</div>
    <div style={{fontSize:13,color:"#0f172a",fontWeight:500}}>{link&&v?<a href={v} target="_blank" rel="noreferrer" style={{color:"#2563eb",textDecoration:"none"}}>📄 View Agreement</a>:v||"—"}</div>
  </div>;
  const DB=({v})=><span style={{padding:"2px 8px",borderRadius:10,fontSize:11,fontWeight:600,background:v==="YES"?"#dcfce7":v==="Pending"?"#fef9c3":"#fee2e2",color:v==="YES"?"#16a34a":v==="Pending"?"#92400e":"#dc2626"}}>{v||"—"}</span>;
  return <div>
    <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:18,paddingBottom:18,borderBottom:"1px solid #f1f5f9"}}>
      <div style={{width:52,height:52,borderRadius:13,background:"linear-gradient(135deg,#2563eb22,#7c3aed22)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,fontWeight:800,color:"#2563eb"}}>{c.companyName?.[0]?.toUpperCase()}</div>
      <div>
        <h3 style={{margin:0,fontSize:18,fontWeight:800,color:"#0f172a"}}>{c.companyName}</h3>
        <p style={{margin:"2px 0 0",color:"#64748b",fontSize:12}}>{c.contactName} · {c.department}</p>
        <div style={{display:"flex",gap:6,marginTop:5}}>
          <span style={{fontSize:11,background:"#f0f9ff",color:"#2563eb",padding:"2px 8px",borderRadius:10,fontWeight:600}}>DSC: {c.dsc}</span>
          <span style={{fontSize:11,background:"#f0fdf4",color:"#16a34a",padding:"2px 8px",borderRadius:10,fontWeight:600}}>Hardcopy: {c.hardcopy}</span>
        </div>
      </div>
    </div>
    {R("Company",c.companyName)}{R("SPOC",c.spoc)}{R("Contact",c.contactName)}
    {R("Department",c.department)}{R("Mobile",c.mobile)}{R("Email",c.email)}
    {R("Address",c.address)}{R("Service Fee",c.serviceFee)}
    <div style={{display:"flex",borderBottom:"1px solid #f8fafc",padding:"9px 0"}}><div style={{width:160,fontSize:11,fontWeight:700,color:"#64748b",textTransform:"uppercase",letterSpacing:.4,flexShrink:0}}>DSC</div><DB v={c.dsc}/></div>
    <div style={{display:"flex",borderBottom:"1px solid #f8fafc",padding:"9px 0"}}><div style={{width:160,fontSize:11,fontWeight:700,color:"#64748b",textTransform:"uppercase",letterSpacing:.4,flexShrink:0}}>Hardcopy</div><DB v={c.hardcopy}/></div>
    {R("Agreement PDF",c.agreementUrl,true)}
  </div>;
}

export default function Companies({user}) {
  const [result,setResult]=useState({companies:[],total:0,pages:1});
  const [search,setSearch]=useState("");
  const [fc,setFc]=useState("");
  const [page,setPage]=useState(1);
  const [loading,setLoading]=useState(true);
  const [modal,setModal]=useState(null);
  const [saving,setSaving]=useState(false);
  const [msg,setMsg]=useState({text:"",type:"success"});
  const [uniq,setUniq]=useState([]);

  const showMsg=(text,type="success")=>{setMsg({text,type});setTimeout(()=>setMsg({text:"",type:"success"}),3000);};

  const load=useCallback(async(p=1,s="",f="")=>{
    setLoading(true);
    try {
      const params={page:p,limit:50};
      if(s) params.search=s;
      if(f) params.company=f;
      const res=await api.getCompanies(params);
      if(res&&!res.error){
        setResult(res);
        if(!f&&!s&&res.companies){
          setUniq([...new Set(res.companies.map(c=>c.companyName))].sort());
        }
      } else {
        showMsg(res?.error||"Failed to load","error");
      }
    } catch(e){showMsg("Error: "+e.message,"error");}
    setLoading(false);
  },[]);

  useEffect(()=>{const t=setTimeout(()=>{load(1,search,fc);setPage(1);},400);return()=>clearTimeout(t);},[search]);
  useEffect(()=>{load(page,search,fc);},[page,fc]);

  const handleSave=async(form)=>{
    if(!form.companyName){showMsg("Company name required","error");return;}
    setSaving(true);
    try{
      const r=modal.type==="add"?await api.createCompany(form):await api.updateCompany(modal.data.id,form);
      if(r.error){showMsg(r.error,"error");setSaving(false);return;}
      showMsg(modal.type==="add"?"✅ Company added!":"✅ Company updated!");
      setModal(null);load(page,search,fc);
    }catch(e){showMsg("Save failed: "+e.message,"error");}
    setSaving(false);
  };

  const handleDelete=async(id,name)=>{
    if(!window.confirm(`Delete "${name}"?`)) return;
    try{
      const r=await api.deleteCompany(id);
      if(r.error){showMsg(r.error,"error");return;}
      showMsg("🗑️ Deleted!");load(page,search,fc);
    }catch(e){showMsg(e.message,"error");}
  };

  const exportCSV=()=>{
    const cols=["ID","Company","SPOC","Contact","Dept","Mobile","Email","Address","DSC","Hardcopy","Service Fee","Agreement"];
    const rows=(result.companies||[]).map(c=>[c.id,c.companyName,c.spoc,c.contactName,c.department,c.mobile,c.email,c.address,c.dsc,c.hardcopy,c.serviceFee,c.agreementUrl]);
    const csv=[cols,...rows].map(r=>r.map(v=>`"${v||""}"`).join(",")).join("\n");
    const a=document.createElement("a");a.href="data:text/csv;charset=utf-8,"+encodeURIComponent(csv);a.download="companies.csv";a.click();
  };

  const canEdit=user.role!=="viewer";
  const canDel=user.role==="admin";
  const cos=result.companies||[];
  const DB=({v})=><span style={{padding:"2px 7px",borderRadius:9,fontSize:10,fontWeight:700,whiteSpace:"nowrap",background:v==="YES"?"#dcfce7":v==="Pending"?"#fef9c3":"#fee2e2",color:v==="YES"?"#16a34a":v==="Pending"?"#92400e":"#dc2626"}}>{v||"—"}</span>;

  return <div>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18,flexWrap:"wrap",gap:10}}>
      <div>
        <h2 style={{fontSize:20,fontWeight:800,color:"#0f172a",margin:0}}>Company Contacts</h2>
        <p style={{color:"#64748b",margin:"3px 0 0",fontSize:13}}>{result.total} contacts · Client database</p>
      </div>
      <div style={{display:"flex",gap:7,flexWrap:"wrap"}}>
        <button onClick={()=>load(page,search,fc)} style={{display:"flex",alignItems:"center",gap:5,padding:"8px 12px",background:"#f1f5f9",border:"none",borderRadius:8,fontWeight:600,cursor:"pointer",fontSize:12}}><Icon n="refresh" s={13}/> Refresh</button>
        {canEdit&&<button onClick={()=>setModal({type:"add"})} style={{display:"flex",alignItems:"center",gap:5,padding:"8px 14px",background:"linear-gradient(135deg,#2563eb,#7c3aed)",color:"white",border:"none",borderRadius:8,fontWeight:600,cursor:"pointer",fontSize:12}}><Icon n="plus" s={13}/> Add Company</button>}
        <button onClick={exportCSV} style={{display:"flex",alignItems:"center",gap:5,padding:"8px 12px",background:"#f1f5f9",border:"none",borderRadius:8,fontWeight:600,cursor:"pointer",fontSize:12}}><Icon n="dl" s={13}/> Export CSV</button>
      </div>
    </div>

    {msg.text&&<div style={{background:msg.type==="error"?"#fee2e2":"#dcfce7",color:msg.type==="error"?"#991b1b":"#166534",padding:"10px 16px",borderRadius:8,marginBottom:14,fontSize:13,fontWeight:600}}>{msg.text}</div>}

    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(140px,1fr))",gap:10,marginBottom:14}}>
      {[{l:"Total Contacts",v:result.total,c:"#2563eb"},{l:"DSC Received",v:cos.filter(c=>c.dsc==="YES").length,c:"#22c55e"},{l:"Hardcopy Done",v:cos.filter(c=>c.hardcopy==="YES").length,c:"#8b5cf6"},{l:"Agreement Done",v:cos.filter(c=>c.agreementUrl).length,c:"#06b6d4"},{l:"Agr. Pending",v:cos.filter(c=>!c.agreementUrl).length,c:"#f97316"}].map(card=>
        <div key={card.l} style={{background:"white",borderRadius:10,padding:14,boxShadow:"0 1px 3px rgba(0,0,0,.06)",border:"1px solid #f1f5f9"}}>
          <div style={{fontSize:22,fontWeight:800,color:card.c}}>{card.v}</div>
          <div style={{fontSize:10,color:"#64748b",marginTop:2,fontWeight:500}}>{card.l}</div>
        </div>
      )}
    </div>

    <div style={{background:"white",borderRadius:10,padding:12,marginBottom:14,boxShadow:"0 1px 3px rgba(0,0,0,.06)",border:"1px solid #f1f5f9"}}>
      <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
        <div style={{flex:1,minWidth:180,display:"flex",alignItems:"center",gap:7,background:"#f8fafc",borderRadius:7,padding:"7px 10px",border:"1.5px solid #e2e8f0"}}>
          <Icon n="search" s={13}/>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search company, contact, email, mobile…" style={{border:"none",background:"none",outline:"none",fontSize:13,width:"100%"}}/>
          {search&&<button onClick={()=>{setSearch("");load(1,"",fc);}} style={{border:"none",background:"none",cursor:"pointer",color:"#94a3b8",display:"flex",padding:0}}>✕</button>}
        </div>
        <select value={fc} onChange={e=>{setFc(e.target.value);setPage(1);load(1,search,e.target.value);}} style={{padding:"7px 12px",borderRadius:7,border:"1.5px solid #e2e8f0",fontSize:13,background:"white",outline:"none",minWidth:140}}>
          <option value="">All Companies</option>
          {uniq.map(c=><option key={c} value={c}>{c}</option>)}
        </select>
        {fc&&<button onClick={()=>{setFc("");load(1,search,"");}} style={{padding:"7px 12px",borderRadius:7,border:"1.5px solid #fecaca",background:"#fef2f2",color:"#dc2626",fontSize:12,fontWeight:600,cursor:"pointer"}}>Clear</button>}
      </div>
    </div>

    <div style={{background:"white",borderRadius:10,boxShadow:"0 1px 3px rgba(0,0,0,.06)",border:"1px solid #f1f5f9",overflow:"auto"}}>
      {loading?<div style={{padding:60,textAlign:"center"}}><Spin/><div style={{marginTop:10,color:"#94a3b8",fontSize:13}}>Loading…</div></div>:
      cos.length===0?<div style={{padding:60,textAlign:"center"}}>
        <div style={{fontSize:40,marginBottom:10}}>🏢</div>
        <div style={{fontSize:15,fontWeight:700,color:"#0f172a",marginBottom:6}}>No company contacts yet</div>
        <div style={{fontSize:13,color:"#64748b",marginBottom:16}}>Add your first company contact to get started</div>
        {canEdit&&<button onClick={()=>setModal({type:"add"})} style={{padding:"10px 20px",background:"linear-gradient(135deg,#2563eb,#7c3aed)",color:"white",border:"none",borderRadius:9,fontWeight:700,cursor:"pointer",fontSize:13}}>+ Add Company Contact</button>}
      </div>:
      <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
        <thead><tr style={{background:"#f8fafc",borderBottom:"1.5px solid #e2e8f0"}}>
          {[["Company",120],["SPOC",80],["Contact",130],["Dept",70],["Mobile",100],["Email",160],["DSC",60],["Hardcopy",80],["Agreement",90],["",85]].map(([l,w])=>
            <th key={l} style={{padding:"9px 10px",textAlign:"left",fontWeight:700,color:"#475569",fontSize:10,textTransform:"uppercase",letterSpacing:.4,minWidth:w}}>{l}</th>)}
        </tr></thead>
        <tbody>
          {cos.map((c,i)=><tr key={c.id} style={{borderBottom:"1px solid #f8fafc",background:i%2?"#fcfcfd":"white",transition:"background .1s"}}
            onMouseEnter={e=>e.currentTarget.style.background="#f0f9ff"}
            onMouseLeave={e=>e.currentTarget.style.background=i%2?"#fcfcfd":"white"}>
            <td style={{padding:"9px 10px"}}>
              <div style={{display:"flex",alignItems:"center",gap:7}}>
                <div style={{width:26,height:26,borderRadius:7,background:"linear-gradient(135deg,#2563eb22,#7c3aed22)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:800,color:"#2563eb",flexShrink:0}}>{c.companyName?.[0]?.toUpperCase()}</div>
                <span style={{fontWeight:700,color:"#1e293b",maxWidth:90,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.companyName}</span>
              </div>
            </td>
            <td style={{padding:"9px 10px",color:"#475569"}}>{c.spoc||"—"}</td>
            <td style={{padding:"9px 10px",fontWeight:500,color:"#0f172a"}}>{c.contactName||"—"}</td>
            <td style={{padding:"9px 10px",color:"#64748b"}}>{c.department||"—"}</td>
            <td style={{padding:"9px 10px",color:"#64748b",fontFamily:"monospace",fontSize:11}}>{c.mobile||"—"}</td>
            <td style={{padding:"9px 10px",fontSize:11}}>{c.email?<a href={`mailto:${c.email}`} style={{color:"#2563eb",textDecoration:"none"}}>{c.email}</a>:"—"}</td>
            <td style={{padding:"9px 10px"}}><DB v={c.dsc}/></td>
            <td style={{padding:"9px 10px"}}><DB v={c.hardcopy}/></td>
            <td style={{padding:"9px 10px"}}>{c.agreementUrl?<a href={c.agreementUrl} target="_blank" rel="noreferrer" style={{display:"inline-flex",alignItems:"center",gap:4,padding:"3px 8px",background:"#eff6ff",color:"#2563eb",borderRadius:6,fontSize:11,fontWeight:600,textDecoration:"none"}}>📄 View</a>:<span style={{color:"#94a3b8",fontSize:11}}>No PDF</span>}</td>
            <td style={{padding:"9px 10px"}}>
              <div style={{display:"flex",gap:3}}>
                <button onClick={()=>setModal({type:"view",data:c})} title="View" style={{padding:4,background:"#f0f9ff",border:"none",borderRadius:5,cursor:"pointer",color:"#2563eb",display:"flex"}}><Icon n="eye" s={12}/></button>
                {canEdit&&<button onClick={()=>setModal({type:"edit",data:c})} title="Edit" style={{padding:4,background:"#f0fdf4",border:"none",borderRadius:5,cursor:"pointer",color:"#16a34a",display:"flex"}}><Icon n="edit" s={12}/></button>}
                {canDel&&<button onClick={()=>handleDelete(c.id,c.contactName||c.companyName)} title="Delete" style={{padding:4,background:"#fef2f2",border:"none",borderRadius:5,cursor:"pointer",color:"#dc2626",display:"flex"}}><Icon n="trash" s={12}/></button>}
              </div>
            </td>
          </tr>)}
        </tbody>
      </table>}
    </div>

    {result.pages>1&&<div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:12}}>
      <span style={{fontSize:12,color:"#64748b"}}>Page {page} of {result.pages} · {result.total} total</span>
      <div style={{display:"flex",gap:3}}>
        <button onClick={()=>{const p=page-1;setPage(p);load(p,search,fc);}} disabled={page<=1} style={{padding:"5px 10px",border:"1.5px solid #e2e8f0",borderRadius:6,background:"white",cursor:page<=1?"not-allowed":"pointer",fontSize:12,opacity:page<=1?.4:1}}>← Prev</button>
        <span style={{padding:"5px 12px",background:"#2563eb",color:"white",borderRadius:6,fontSize:12,fontWeight:700}}>{page}</span>
        <button onClick={()=>{const p=page+1;setPage(p);load(p,search,fc);}} disabled={page>=result.pages} style={{padding:"5px 10px",border:"1.5px solid #e2e8f0",borderRadius:6,background:"white",cursor:page>=result.pages?"not-allowed":"pointer",fontSize:12,opacity:page>=result.pages?.4:1}}>Next →</button>
      </div>
    </div>}

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
  </div>;
}
