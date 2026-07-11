import { useState, useEffect, useCallback } from "react";
import { api } from "../api";
import { fmtD, daysUntil } from "../utils/constants";
import { Modal, ContactButtons } from "../components/UI";

// ─── AGREEMENT STATUS BADGE ───────────────────────────────────────────────────
function AgreementBadge({ endDate }) {
  if (!endDate) return <span className="text-outline text-[11px] bg-surface px-2 py-1 rounded-md border border-outline-variant font-semibold whitespace-nowrap">No date set</span>;
  const days = daysUntil(endDate);
  let cls, icon, label;
  if (days < 0) { cls = "bg-error-bg text-error"; icon = "block"; label = `Expired ${Math.abs(days)}d ago`; }
  else if (days <= 30) { cls = "bg-amber-100 text-amber-800"; icon = "schedule"; label = `${days}d left`; }
  else { cls = "bg-green-100 text-green-700"; icon = "check_circle"; label = `${days}d left`; }
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-bold whitespace-nowrap ${cls}`}>
      <span className="material-symbols-outlined text-[14px]">{icon}</span>{label}
    </span>
  );
}

const fieldCls = "w-full px-4 py-2.5 rounded-lg border border-outline-variant focus:ring-2 focus:ring-primary/10 focus:border-primary outline-none text-sm font-medium bg-white transition-all";
const labelCls = "block text-[10px] font-black text-text-secondary uppercase tracking-widest mb-1.5";

// ─── COMPANY FORM ─────────────────────────────────────────────────────────────
function CompanyForm({ initial, onSave, onCancel, saving }) {
  const blank = { companyName:"",spoc:"",contactName:"",department:"HR",mobile:"",email:"",address:"",dsc:"NO",hardcopy:"NO",serviceFee:"",agreementUrl:"",agreementStartDate:"",agreementEndDate:"" };
  const [form, setForm] = useState(initial ? {
    companyName:initial.companyName||"", spoc:initial.spoc||"", contactName:initial.contactName||"",
    department:initial.department||"HR", mobile:initial.mobile||"", email:initial.email||"",
    address:initial.address||"", dsc:initial.dsc||"NO", hardcopy:initial.hardcopy||"NO",
    serviceFee:initial.serviceFee||"", agreementUrl:initial.agreementUrl||"",
    agreementStartDate: initial.agreementStartDate ? initial.agreementStartDate.split("T")[0] : "",
    agreementEndDate: initial.agreementEndDate ? initial.agreementEndDate.split("T")[0] : "",
  } : blank);
  const set = (k,v) => setForm(f=>({...f,[k]:v}));

  const F = (l,k,t="text",p="") => (
    <div className="space-y-1.5 mb-4">
      <label className={labelCls}>{l}</label>
      <input type={t} value={form[k]||""} onChange={e=>set(k,e.target.value)} placeholder={p} className={fieldCls}/>
    </div>
  );
  const S = (l,k,opts) => (
    <div className="space-y-1.5 mb-4">
      <label className={labelCls}>{l}</label>
      <select value={form[k]||""} onChange={e=>set(k,e.target.value)} className={fieldCls}>
        {opts.map(o=><option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );

  const previewDays = form.agreementEndDate ? daysUntil(form.agreementEndDate) : null;

  return (
    <div>
      <div className="bg-surface rounded-xl p-5 mb-6 border-l-4 border-primary">
        <div className="text-sm font-bold text-primary mb-1">📋 Company Contact Details</div>
        <div className="text-xs text-text-tertiary">Fill in all fields. Agreement PDF link can be added anytime after uploading to Google Drive.</div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
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

      <div className="bg-secondary-fixed border border-orange-200 rounded-xl p-5 mb-6">
        <div className="flex items-center gap-2 text-xs font-bold text-on-secondary-fixed mb-4 uppercase tracking-wider">
          <span className="material-symbols-outlined text-lg">calendar_today</span> Agreement Validity Period
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-on-secondary-fixed uppercase tracking-widest">Start Date</label>
            <input type="date" value={form.agreementStartDate||""} onChange={e=>set("agreementStartDate",e.target.value)} className="w-full px-4 py-2 bg-white border border-orange-200 rounded-lg text-sm"/>
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-on-secondary-fixed uppercase tracking-widest">End Date</label>
            <input type="date" value={form.agreementEndDate||""} onChange={e=>set("agreementEndDate",e.target.value)} className="w-full px-4 py-2 bg-white border border-orange-200 rounded-lg text-sm"/>
          </div>
        </div>
        {previewDays !== null && (
          <div className={`mt-3 text-xs font-semibold ${previewDays<0?"text-error":previewDays<=30?"text-on-secondary-fixed":"text-green-700"}`}>
            {previewDays < 0 ? `⛔ This agreement expired ${Math.abs(previewDays)} days ago` : previewDays <= 30 ? `⏳ Expires in ${previewDays} days — will trigger renewal alert` : `✅ Valid for ${previewDays} more days`}
          </div>
        )}
      </div>

      <div className="mb-4">
        <label className={labelCls}>📍 Office Address</label>
        <textarea value={form.address||""} onChange={e=>set("address",e.target.value)} rows={3} placeholder="Full office address with pincode…" className={`${fieldCls} resize-y`}/>
      </div>
      <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-2.5 mb-6 text-xs text-green-700 flex items-center gap-2">
        💡 <span><strong>Agreement PDF:</strong> Upload to Google Drive → Right-click → Share → Anyone with link → Copy link → Paste above.</span>
      </div>
      <div className="flex justify-end gap-3">
        <button onClick={onCancel} className="px-6 py-2.5 border-2 border-outline-variant text-text-primary rounded-lg font-bold text-sm hover:bg-surface transition-all">Cancel</button>
        <button onClick={()=>onSave(form)} disabled={saving} className="px-8 py-2.5 bg-secondary text-white rounded-lg font-black text-sm shadow-xl shadow-secondary/20 hover:scale-[1.02] transition-all disabled:opacity-70">
          {saving?"Saving…":"Save Contact"}
        </button>
      </div>
    </div>
  );
}

// ─── VIEW COMPANY ─────────────────────────────────────────────────────────────
function ViewCompany({ c }) {
  if (!c) return null;
  const StatusBadge = ({v,label}) => {
    const s = v==="YES" ? { bg:"bg-green-50", c:"text-green-600", icon:"check_circle" } : v==="Pending" ? { bg:"bg-amber-50", c:"text-amber-800", icon:"schedule" } : { bg:"bg-red-50", c:"text-error", icon:"cancel" };
    return (
      <div className={`${s.bg} border border-current/10 rounded-lg p-3 text-center`}>
        <span className={`material-symbols-outlined ${s.c} text-xl mb-1`}>{s.icon}</span>
        <div className={`text-[11px] font-bold ${s.c}`}>{label}</div>
        <div className={`text-sm font-black ${s.c} mt-0.5`}>{v||"NO"}</div>
      </div>
    );
  };
  const R = (l,v,link=false) => (
    <div className="flex py-2.5 border-b border-surface-container items-start">
      <div className="w-40 text-[10px] font-bold text-text-tertiary uppercase tracking-widest flex-shrink-0 pt-0.5">{l}</div>
      <div className="text-sm text-text-primary font-medium flex-1">
        {link && v ? <a href={v} target="_blank" rel="noreferrer" className="text-primary inline-flex items-center gap-1.5 bg-primary/5 px-3 py-1 rounded-lg font-bold text-xs border border-primary/20">📄 View Agreement PDF ↗</a> : v||"—"}
      </div>
    </div>
  );
  return (
    <div>
      <div className="bg-primary rounded-2xl p-6 mb-5 flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center text-xl font-black text-white shrink-0">
          {c.companyName?.[0]?.toUpperCase()}
        </div>
        <div className="flex-1">
          <h3 className="m-0 text-xl font-extrabold text-white">{c.companyName}</h3>
          <p className="m-0 mt-1 text-white/60 text-xs">{c.contactName} · {c.department}</p>
          {c.serviceFee && <div className="mt-1.5 bg-green-500/20 border border-green-400/30 rounded-lg px-2.5 py-0.5 inline-block text-[11px] text-green-300 font-semibold">💰 {c.serviceFee}</div>}
        </div>
        <ContactButtons phone={c.mobile} email={c.email} waMessage={`Hi ${c.contactName||""}, this is regarding ${c.companyName}.`} size="lg"/>
      </div>
      <div className="grid grid-cols-3 gap-2.5 mb-4">
        <StatusBadge v={c.dsc} label="DSC"/>
        <StatusBadge v={c.hardcopy} label="Hardcopy"/>
        <StatusBadge v={c.agreementUrl?"YES":"NO"} label="Agreement"/>
      </div>
      {(c.agreementStartDate || c.agreementEndDate) && (
        <div className="bg-secondary-fixed border border-orange-200 rounded-lg px-4 py-3 mb-4 flex justify-between items-center">
          <div className="text-xs text-on-secondary-fixed"><strong>Agreement Period:</strong> {fmtD(c.agreementStartDate)} → {fmtD(c.agreementEndDate)}</div>
          <AgreementBadge endDate={c.agreementEndDate}/>
        </div>
      )}
      {R("SPOC",c.spoc)}{R("Contact",c.contactName)}{R("Department",c.department)}
      {R("Mobile",c.mobile)}{R("Email",c.email)}{R("Service Fee",c.serviceFee)}
      {R("Address",c.address)}
      {R("Agreement PDF",c.agreementUrl,true)}
    </div>
  );
}

const DSCBadge = ({v}) => {
  const cls = v==="YES" ? "bg-green-100 text-green-700" : v==="Pending" ? "bg-amber-100 text-amber-800" : "bg-error-bg text-error";
  return <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-tighter whitespace-nowrap ${cls}`}>{v||"NO"}</span>;
};

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
export default function Companies({ user, openCompanyId, onOpenedCompany }) {
  const [result, setResult] = useState({companies:[],total:0,pages:1});
  const [search, setSearch] = useState("");
  const [filterCompany, setFilterCompany] = useState("");
  const [filterDsc, setFilterDsc] = useState("");
  const [filterHardcopy, setFilterHardcopy] = useState("");
  const [filterAgreement, setFilterAgreement] = useState("");
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

  useEffect(() => {
    if (!openCompanyId) return;
    (async () => {
      try {
        const c = await api.getCompany(openCompanyId);
        if (c && !c.error) setModal({ type: "edit", data: c });
      } catch (e) { console.error(e); }
      onOpenedCompany && onOpenedCompany();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openCompanyId]);

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
    const cols=["ID","Company","SPOC","Contact","Dept","Mobile","Email","Address","DSC","Hardcopy","Service Fee","Agreement","Agreement Start","Agreement End"];
    const rows=(result.companies||[]).map(c=>[c.id,c.companyName,c.spoc,c.contactName,c.department,c.mobile,c.email,c.address,c.dsc,c.hardcopy,c.serviceFee,c.agreementUrl,c.agreementStartDate,c.agreementEndDate]);
    const csv=[cols,...rows].map(r=>r.map(v=>`"${v||""}"`).join(",")).join("\n");
    const a=document.createElement("a");a.href="data:text/csv;charset=utf-8,"+encodeURIComponent(csv);a.download="companies.csv";a.click();
  };

  const canEdit = user.role!=="viewer";
  const canDel = user.role==="admin";
  const cos = result.companies||[];

  const filtered = cos.filter(c => {
    if (filterDsc && c.dsc!==filterDsc) return false;
    if (filterHardcopy && c.hardcopy!==filterHardcopy) return false;
    if (filterAgreement) {
      const days = c.agreementEndDate ? daysUntil(c.agreementEndDate) : null;
      if (filterAgreement==="expiring" && !(days!==null && days>=0 && days<=30)) return false;
      if (filterAgreement==="expired" && !(days!==null && days<0)) return false;
      if (filterAgreement==="missing" && c.agreementEndDate) return false;
    }
    return true;
  });

  const expiringCount = cos.filter(c => { const d = c.agreementEndDate ? daysUntil(c.agreementEndDate) : null; return d!==null && d>=0 && d<=30; }).length;
  const expiredCount = cos.filter(c => { const d = c.agreementEndDate ? daysUntil(c.agreementEndDate) : null; return d!==null && d<0; }).length;

  const stats = [
    { l:"Total Contacts", v:result.total, icon:"groups", c:"text-primary-container", bg:"bg-primary-fixed" },
    { l:"DSC Received", v:cos.filter(c=>c.dsc==="YES").length, icon:"verified", c:"text-green-600", bg:"bg-green-50" },
    { l:"Hardcopy Done", v:cos.filter(c=>c.hardcopy==="YES").length, icon:"folder_special", c:"text-secondary", bg:"bg-secondary-fixed" },
    { l:"Expiring ≤30d", v:expiringCount, icon:"pending_actions", c:"text-on-secondary-fixed", bg:"bg-amber-50" },
    { l:"Expired", v:expiredCount, icon:"warning", c:"text-error", bg:"bg-error-bg" },
  ];

  const filterActive = filterCompany||filterDsc||filterHardcopy||filterAgreement;
  const selectCls = (active) => `px-4 py-2.5 bg-white border rounded-lg text-sm font-semibold outline-none min-w-[150px] transition-all ${active ? "border-primary text-primary" : "border-outline-variant text-text-secondary"}`;

  return (
    <div className="max-w-[1440px] mx-auto">
      {/* Header */}
      <div className="bg-white rounded-xl p-6 mb-6 shadow-sm border border-surface-container">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-primary-container flex items-center justify-center text-white shadow-md">
              <span className="material-symbols-outlined text-2xl">corporate_fare</span>
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-text-primary tracking-tight">Company Contacts</h1>
              <p className="text-sm text-text-tertiary"><strong className="text-primary">{result.total}</strong> client contacts · compliance tracker</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            {canEdit && <button onClick={()=>setModal({type:"add"})} className="flex items-center gap-2 px-6 py-2.5 bg-secondary text-white rounded-lg font-bold text-sm shadow-lg hover:bg-accent-hover transition-all transform hover:-translate-y-0.5 active:translate-y-0">
              <span className="material-symbols-outlined text-lg">add</span> Add Contact
            </button>}
            <button onClick={()=>load(page,search,filterCompany)} className="flex items-center gap-2 px-4 py-2.5 bg-white border border-outline-variant text-text-secondary rounded-lg font-semibold text-sm hover:bg-surface-container-low transition-colors">
              <span className="material-symbols-outlined text-lg">refresh</span> Refresh
            </button>
            <button onClick={exportCSV} className="flex items-center gap-2 px-4 py-2.5 bg-white border border-outline-variant text-text-secondary rounded-lg font-semibold text-sm hover:bg-surface-container-low transition-colors">
              <span className="material-symbols-outlined text-lg">download</span> Export
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        {stats.map(s => (
          <div key={s.l} className="bg-white rounded-xl p-5 shadow-sm border border-surface-container flex items-center gap-4">
            <div className={`w-11 h-11 rounded-lg ${s.bg} flex items-center justify-center ${s.c} shrink-0`}>
              <span className="material-symbols-outlined text-2xl">{s.icon}</span>
            </div>
            <div>
              <div className={`text-2xl font-extrabold leading-none tracking-tight ${s.c}`}>{s.v}</div>
              <div className="text-[11px] text-text-tertiary font-bold uppercase tracking-wider mt-1">{s.l}</div>
            </div>
          </div>
        ))}
      </div>

      {msg.text && (
        <div className={`px-5 py-3 rounded-lg mb-4 text-sm font-semibold ${msg.type==="error"?"bg-error-bg text-error":"bg-green-100 text-green-700"}`}>{msg.text}</div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl p-5 mb-6 shadow-sm border border-surface-container">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex-1 min-w-[250px] relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary text-lg">search</span>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search companies, contacts, emails..." className="w-full pl-10 pr-4 py-2.5 bg-surface rounded-lg border border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/10 text-sm outline-none transition-all"/>
          </div>
          <select value={filterCompany} onChange={e=>{setFilterCompany(e.target.value);setPage(1);load(1,search,e.target.value);}} className={selectCls(filterCompany)}>
            <option value="">🏢 All Companies</option>
            {uniqCompanies.map(c=><option key={c} value={c}>{c}</option>)}
          </select>
          <select value={filterDsc} onChange={e=>setFilterDsc(e.target.value)} className={selectCls(filterDsc)}>
            <option value="">📄 DSC: All</option>
            <option value="YES">DSC: Received</option>
            <option value="NO">DSC: Not Received</option>
            <option value="Pending">DSC: Pending</option>
          </select>
          <select value={filterHardcopy} onChange={e=>setFilterHardcopy(e.target.value)} className={selectCls(filterHardcopy)}>
            <option value="">📁 Hardcopy: All</option>
            <option value="YES">Hardcopy: Done</option>
            <option value="NO">Hardcopy: Pending</option>
          </select>
          <select value={filterAgreement} onChange={e=>setFilterAgreement(e.target.value)} className={selectCls(filterAgreement)}>
            <option value="">📅 Agreement: All</option>
            <option value="expiring">Expiring ≤30 days</option>
            <option value="expired">Already expired</option>
            <option value="missing">No date set</option>
          </select>
          {filterActive && (
            <button onClick={()=>{setFilterCompany("");setFilterDsc("");setFilterHardcopy("");setFilterAgreement("");load(1,search,"");}}
              className="flex items-center gap-2 px-4 py-2.5 bg-error-bg text-error rounded-lg font-bold text-sm hover:bg-error hover:text-white transition-all">
              Clear <span className="text-lg">✕</span>
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-surface-container overflow-hidden">
        {loading ? (
          <div className="p-20 text-center">
            <div className="w-10 h-10 border-4 border-primary/10 border-t-secondary rounded-full animate-spin-fast mx-auto mb-4"></div>
            <div className="text-text-tertiary text-sm">Loading company contacts…</div>
          </div>
        ) : filtered.length===0 ? (
          <div className="p-20 text-center">
            <span className="material-symbols-outlined text-5xl text-outline-variant">corporate_fare</span>
            <div className="text-lg font-bold text-text-primary mt-3 mb-1">No company contacts found</div>
            <div className="text-sm text-text-tertiary mb-4">Try adjusting filters or add your first company contact</div>
            {canEdit && <button onClick={()=>setModal({type:"add"})} className="px-5 py-2.5 bg-secondary text-white rounded-lg font-bold text-sm">+ Add Company Contact</button>}
          </div>
        ) : (
          <>
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-surface text-left">
                  {["Company","SPOC","Contact Person","Dept","Mobile","Email","DSC","Hardcopy","Agreement PDF","Agreement Status","Connect","Actions"].map(l=>(
                    <th key={l} className="p-4 text-[11px] font-bold text-text-secondary uppercase tracking-widest border-b-2 border-surface-container-high whitespace-nowrap">{l}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container">
                {filtered.map((c,i)=>(
                  <tr key={c.id} className={`hover:bg-surface-container-lowest transition-colors ${i%2!==0 ? "bg-surface-container-low" : ""}`}>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary-container text-white flex items-center justify-center font-black text-xs shrink-0">{c.companyName?.[0]?.toUpperCase()}</div>
                        <span className="font-bold text-text-primary truncate max-w-[110px]">{c.companyName}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      {c.spoc ? <span className="bg-primary-fixed text-primary-container text-[11px] font-bold px-2 py-1 rounded">{c.spoc}</span> : <span className="text-text-tertiary">—</span>}
                    </td>
                    <td className="p-4"><div className="text-sm font-semibold text-text-primary">{c.contactName||"—"}</div></td>
                    <td className="p-4"><span className="bg-surface border border-outline-variant text-text-secondary px-2 py-1 rounded text-[11px]">{c.department||"—"}</span></td>
                    <td className="p-4 text-xs font-mono text-text-secondary">{c.mobile||"—"}</td>
                    <td className="p-4 text-xs">
                      {c.email ? <a href={`mailto:${c.email}`} className="text-primary truncate max-w-[160px] block">{c.email}</a> : "—"}
                    </td>
                    <td className="p-4"><DSCBadge v={c.dsc}/></td>
                    <td className="p-4"><DSCBadge v={c.hardcopy}/></td>
                    <td className="p-4">
                      {c.agreementUrl
                        ? <a href={c.agreementUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary-fixed text-primary-container rounded-lg text-[11px] font-bold border border-primary/20 hover:bg-primary-container hover:text-white transition-all"><span className="material-symbols-outlined text-sm">link</span> View</a>
                        : <span className="inline-block px-3 py-1 bg-error-bg text-error rounded-lg text-[10px] font-bold border border-error/20">MISSING</span>}
                    </td>
                    <td className="p-4"><AgreementBadge endDate={c.agreementEndDate}/></td>
                    <td className="p-4"><ContactButtons phone={c.mobile} email={c.email} waMessage={`Hi ${c.contactName||""}, this is regarding ${c.companyName}.`}/></td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <button onClick={()=>setModal({type:"view",data:c})} title="View" className="p-1.5 bg-surface-container rounded-md text-primary hover:bg-primary hover:text-white transition-all">
                          <span className="material-symbols-outlined text-lg">visibility</span>
                        </button>
                        {canEdit && <button onClick={()=>setModal({type:"edit",data:c})} title="Edit" className="p-1.5 bg-secondary-fixed rounded-md text-secondary hover:bg-secondary hover:text-white transition-all">
                          <span className="material-symbols-outlined text-lg">edit</span>
                        </button>}
                        {canDel && <button onClick={()=>handleDelete(c.id,c.contactName||c.companyName)} title="Delete" className="p-1.5 bg-error-bg rounded-md text-error hover:bg-error hover:text-white transition-all">
                          <span className="material-symbols-outlined text-lg">delete</span>
                        </button>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-4 bg-surface border-t border-surface-container flex flex-wrap items-center justify-between gap-4">
            <div className="text-sm font-medium text-text-secondary">
              Displaying <strong className="text-text-primary">{filtered.length}</strong> of <strong className="text-text-primary">{result.total}</strong> contact records
            </div>
            <div className="flex items-center gap-2">
              <button onClick={()=>{const p=page-1;setPage(p);load(p,search,filterCompany);}} disabled={page<=1}
                className="px-4 py-2 bg-white border border-outline-variant rounded-lg text-sm font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-surface-container-low transition-colors">‹ Prev</button>
              <span className="w-10 h-10 flex items-center justify-center bg-primary-container text-white rounded-lg text-sm font-black shadow-md">{page}</span>
              <button onClick={()=>{const p=page+1;setPage(p);load(p,search,filterCompany);}} disabled={page>=result.pages}
                className="px-4 py-2 bg-white border border-outline-variant rounded-lg text-sm font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-surface-container-low transition-colors">Next ›</button>
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
    </div>
  );
}
