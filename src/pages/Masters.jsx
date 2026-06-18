import { useState, useEffect } from "react";
import { api } from "../api";
import { Spin } from "../components/UI";

export default function Masters({ masters, reload }) {
  const [tab, setTab] = useState("clients");
  const [val, setVal] = useState("");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({text:"",type:"success"});
  const [editId, setEditId] = useState(null);
  const [editVal, setEditVal] = useState("");
  const [showUserForm, setShowUserForm] = useState(false);
  const [newUser, setNewUser] = useState({name:"",email:"",password:"",role:"recruiter"});
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [newCode, setNewCode] = useState({code:"",label:"",color:"#3b82f6"});
  const [savingCode, setSavingCode] = useState(false);
  const [search, setSearch] = useState("");

  const tabs = [
    {k:"clients",l:"Clients",icon:"🏢",desc:"Client companies for dropdown"},
    {k:"owners",l:"Owners",icon:"👤",desc:"Recruiter/owner names"},
    {k:"joiningStatus",l:"Joining Status",icon:"📋",desc:"Candidate joining stages"},
    {k:"resignationStatus",l:"Resignation",icon:"📝",desc:"Resignation acceptance status"},
    {k:"locations",l:"Locations",icon:"📍",desc:"Cities and office locations"},
    {k:"designations",l:"Designations",icon:"💼",desc:"Job titles and positions"},
    {k:"statusCodes",l:"Status Codes",icon:"🎨",desc:"Color-coded status markers"},
    {k:"users",l:"Team",icon:"👥",desc:"CRM user management"},
  ];

  const showMsg = (text,type="success") => { setMsg({text,type}); setTimeout(()=>setMsg({text:"",type:"success"}),3000); };
  const loadUsers = async () => { setLoadingUsers(true); try { setUsers(await api.getUsers()); } catch(e){} setLoadingUsers(false); };
  useEffect(()=>{ if(tab==="users") loadUsers(); },[tab]);

  const addItem = async () => {
    if (!val.trim()) return;
    setSaving(true);
    try {
      const r = await api.addMaster(tab,val.trim());
      if (r.error) showMsg(r.error,"error");
      else { showMsg(`✅ "${val.trim()}" added!`); setVal(""); reload(); }
    } catch(e) { showMsg(e.message,"error"); }
    setSaving(false);
  };

  const deleteItem = async (id,value) => {
    if (!window.confirm(`Delete "${value}"?`)) return;
    try {
      const r = await api.deleteMaster(id);
      if (r.error) showMsg(r.error,"error");
      else { showMsg(`🗑️ "${value}" deleted!`); reload(); }
    } catch(e) { showMsg(e.message,"error"); }
  };

  const saveEdit = async id => {
    if (!editVal.trim()) return;
    try {
      const r = await api.updateMaster(id,editVal);
      if (r.error) showMsg(r.error,"error");
      else { showMsg("✅ Updated!"); setEditId(null); reload(); }
    } catch(e) { showMsg(e.message,"error"); }
  };

  const addUser = async () => {
    if (!newUser.name||!newUser.email||!newUser.password) { showMsg("All fields required","error"); return; }
    setSaving(true);
    try {
      const r = await api.createUser(newUser);
      if (r.error) showMsg(r.error,"error");
      else { showMsg(`✅ "${newUser.name}" added to team!`); setNewUser({name:"",email:"",password:"",role:"recruiter"}); setShowUserForm(false); loadUsers(); }
    } catch(e) { showMsg(e.message,"error"); }
    setSaving(false);
  };

  const toggleUser = async (id,active,name) => {
    if (!window.confirm(`${active?"Deactivate":"Activate"} "${name}"?`)) return;
    try {
      const r = await api.updateUser(id,{active:!active});
      if (r.error) showMsg(r.error,"error");
      else { showMsg(`✅ "${name}" ${active?"deactivated":"activated"}!`); loadUsers(); }
    } catch(e) { showMsg(e.message,"error"); }
  };

  const changeRole = async (id,role,name) => {
    try {
      const r = await api.updateUser(id,{role});
      if (r.error) showMsg(r.error,"error");
      else { showMsg(`✅ ${name} → ${role}`); loadUsers(); }
    } catch(e) { showMsg(e.message,"error"); }
  };

  const addStatusCode = async () => {
    if (!newCode.code||!newCode.label||!newCode.color) { showMsg("All fields required","error"); return; }
    setSavingCode(true);
    try {
      const r = await api.addStatusCode(newCode);
      if (r.error) showMsg(r.error,"error");
      else { showMsg(`✅ Status code "${newCode.code}" saved!`); setNewCode({code:"",label:"",color:"#3b82f6"}); reload(); }
    } catch(e) { showMsg(e.message,"error"); }
    setSavingCode(false);
  };

  const deleteStatusCode = async code => {
    if (!window.confirm(`Delete "${code}"?`)) return;
    try {
      const r = await api.deleteStatusCode(code);
      if (r.error) showMsg(r.error,"error");
      else { showMsg(`🗑️ "${code}" deleted!`); reload(); }
    } catch(e) { showMsg(e.message,"error"); }
  };

  const fullItems = (masters._full?.[tab]||[]).filter(item => !search || item.value.toLowerCase().includes(search.toLowerCase()));
  const currentTab = tabs.find(t=>t.k===tab);

  const Btn = ({onClick,disabled,style,children}) => (
    <button onClick={onClick} disabled={disabled} style={{cursor:disabled?"not-allowed":"pointer",border:"none",fontFamily:"inherit",opacity:disabled?.7:1,...style}}>{children}</button>
  );

  const roleColors = {admin:{bg:"#fef3c7",c:"#92400e"},recruiter:{bg:"#dbeafe",c:"#1d4ed8"},viewer:{bg:"#f3f4f6",c:"#374151"}};

  return (
    <div>
      {/* ── HEADER ── */}
      <div style={{background:"white",borderRadius:16,padding:"20px 24px",marginBottom:18,boxShadow:"0 1px 3px rgba(0,0,0,.06)",border:"1px solid #f1f5f9"}}>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <div style={{width:40,height:40,borderRadius:11,background:"linear-gradient(135deg,#7c3aed,#2563eb)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>⚙️</div>
          <div>
            <h2 style={{fontSize:18,fontWeight:800,color:"#0f172a",margin:0}}>Master Data</h2>
            <p style={{color:"#64748b",margin:0,fontSize:12}}>Manage dropdown values, status codes and team members</p>
          </div>
        </div>
      </div>

      {msg.text && <div style={{background:msg.type==="error"?"#fee2e2":"#dcfce7",color:msg.type==="error"?"#991b1b":"#166534",padding:"12px 18px",borderRadius:10,marginBottom:16,fontSize:13,fontWeight:600,display:"flex",alignItems:"center",gap:8,border:`1px solid ${msg.type==="error"?"#fecaca":"#bbf7d0"}`}}>{msg.text}</div>}

      <div style={{display:"flex",gap:16,alignItems:"flex-start"}}>
        {/* ── SIDEBAR TABS ── */}
        <div style={{width:200,flexShrink:0}}>
          <div style={{background:"white",borderRadius:14,overflow:"hidden",boxShadow:"0 1px 3px rgba(0,0,0,.06)",border:"1px solid #f1f5f9"}}>
            {tabs.map((t,i)=>(
              <button key={t.k} onClick={()=>{setTab(t.k);setSearch("");}} style={{width:"100%",display:"flex",alignItems:"center",gap:10,padding:"12px 14px",border:"none",background:tab===t.k?"linear-gradient(135deg,#eff6ff,#f5f3ff)":"white",cursor:"pointer",fontFamily:"inherit",textAlign:"left",borderLeft:`3px solid ${tab===t.k?"#2563eb":"transparent"}`,borderBottom:i<tabs.length-1?"1px solid #f8fafc":"none",transition:"all .15s"}}>
                <span style={{fontSize:16,flexShrink:0}}>{t.icon}</span>
                <div>
                  <div style={{fontSize:12,fontWeight:tab===t.k?700:500,color:tab===t.k?"#1d4ed8":"#374151"}}>{t.l}</div>
                  <div style={{fontSize:9,color:"#94a3b8",marginTop:1}}>{(masters._full?.[t.k]||[]).length} items</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* ── CONTENT ── */}
        <div style={{flex:1,minWidth:0}}>
          {/* ── STATUS CODES ── */}
          {tab==="statusCodes" && (
            <div>
              <div style={{background:"white",borderRadius:14,padding:22,boxShadow:"0 1px 3px rgba(0,0,0,.06)",border:"1px solid #f1f5f9",marginBottom:16}}>
                <h3 style={{fontSize:14,fontWeight:800,color:"#0f172a",margin:"0 0 16px",display:"flex",alignItems:"center",gap:8}}><span>🎨</span> Add / Edit Status Code</h3>
                <div style={{display:"grid",gridTemplateColumns:"1fr 2fr auto auto",gap:10,alignItems:"flex-end"}}>
                  <div>
                    <label style={{display:"block",fontSize:10,fontWeight:700,color:"#64748b",marginBottom:5,textTransform:"uppercase",letterSpacing:.6}}>Code Name</label>
                    <input value={newCode.code} onChange={e=>setNewCode(n=>({...n,code:e.target.value}))} placeholder="e.g. Purple"
                      style={{width:"100%",padding:"9px 12px",borderRadius:9,border:"1.5px solid #e2e8f0",fontSize:13,outline:"none",boxSizing:"border-box",background:"#fafafa"}}
                      onFocus={e=>e.target.style.borderColor="#2563eb"} onBlur={e=>e.target.style.borderColor="#e2e8f0"}/>
                  </div>
                  <div>
                    <label style={{display:"block",fontSize:10,fontWeight:700,color:"#64748b",marginBottom:5,textTransform:"uppercase",letterSpacing:.6}}>Description / Label</label>
                    <input value={newCode.label} onChange={e=>setNewCode(n=>({...n,label:e.target.value}))} placeholder="e.g. High priority follow-up needed"
                      style={{width:"100%",padding:"9px 12px",borderRadius:9,border:"1.5px solid #e2e8f0",fontSize:13,outline:"none",boxSizing:"border-box",background:"#fafafa"}}
                      onFocus={e=>e.target.style.borderColor="#2563eb"} onBlur={e=>e.target.style.borderColor="#e2e8f0"}/>
                  </div>
                  <div>
                    <label style={{display:"block",fontSize:10,fontWeight:700,color:"#64748b",marginBottom:5,textTransform:"uppercase",letterSpacing:.6}}>Color</label>
                    <div style={{display:"flex",alignItems:"center",gap:6}}>
                      <input type="color" value={newCode.color} onChange={e=>setNewCode(n=>({...n,color:e.target.value}))} style={{width:44,height:40,borderRadius:9,border:"1.5px solid #e2e8f0",cursor:"pointer",padding:3}}/>
                      <span style={{fontSize:10,color:"#94a3b8",fontFamily:"monospace"}}>{newCode.color}</span>
                    </div>
                  </div>
                  <Btn onClick={addStatusCode} disabled={savingCode} style={{padding:"9px 18px",background:"linear-gradient(135deg,#2563eb,#7c3aed)",color:"white",borderRadius:9,fontWeight:700,fontSize:12,whiteSpace:"nowrap",boxShadow:"0 4px 12px rgba(37,99,235,.3)"}}>
                    {savingCode?"Saving…":"💾 Save Code"}
                  </Btn>
                </div>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:12}}>
                {(masters.statusCodes||[]).map(s=>(
                  <div key={s.code} style={{background:"white",borderRadius:12,padding:"16px 18px",border:`2px solid ${s.color}33`,boxShadow:`0 2px 8px ${s.color}11`,display:"flex",alignItems:"center",justifyContent:"space-between",transition:"all .2s"}}
                    onMouseEnter={e=>e.currentTarget.style.boxShadow=`0 4px 16px ${s.color}33`}
                    onMouseLeave={e=>e.currentTarget.style.boxShadow=`0 2px 8px ${s.color}11`}>
                    <div style={{display:"flex",alignItems:"center",gap:12}}>
                      <div style={{width:40,height:40,borderRadius:10,background:s.color,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,boxShadow:`0 4px 12px ${s.color}44`}}>
                        <span style={{color:"white",fontWeight:900,fontSize:14}}>{s.code[0]}</span>
                      </div>
                      <div>
                        <div style={{fontWeight:800,fontSize:14,color:s.color}}>{s.code}</div>
                        <div style={{fontSize:11,color:"#64748b",marginTop:2}}>{s.label}</div>
                      </div>
                    </div>
                    <Btn onClick={()=>deleteStatusCode(s.code)} style={{padding:"5px 12px",background:"#fef2f2",color:"#dc2626",borderRadius:7,fontSize:11,fontWeight:700,border:"1px solid #fecaca"}}>Delete</Btn>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── USERS/TEAM ── */}
          {tab==="users" && (
            <div>
              <div style={{background:"white",borderRadius:14,padding:22,boxShadow:"0 1px 3px rgba(0,0,0,.06)",border:"1px solid #f1f5f9",marginBottom:16}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:showUserForm?20:0}}>
                  <div>
                    <h3 style={{fontSize:14,fontWeight:800,color:"#0f172a",margin:0}}>👥 Team Members ({users.length})</h3>
                    <p style={{fontSize:12,color:"#64748b",margin:"3px 0 0"}}>Manage who can access this CRM</p>
                  </div>
                  <Btn onClick={()=>setShowUserForm(f=>!f)} style={{padding:"9px 18px",background:showUserForm?"white":"linear-gradient(135deg,#2563eb,#7c3aed)",color:showUserForm?"#374151":"white",borderRadius:10,fontWeight:700,fontSize:12,border:showUserForm?"1.5px solid #e2e8f0":"none",boxShadow:showUserForm?"none":"0 4px 12px rgba(37,99,235,.3)"}}>
                    {showUserForm?"✕ Cancel":"+ Add Member"}
                  </Btn>
                </div>
                {showUserForm && (
                  <div style={{background:"#f8fafc",borderRadius:12,padding:18,border:"1px solid #f1f5f9"}}>
                    <h4 style={{margin:"0 0 16px",fontSize:13,fontWeight:700,color:"#0f172a"}}>New Team Member</h4>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 14px"}}>
                      {[["Full Name","name","text","e.g. Rahul Sharma"],["Email Address","email","email","e.g. rahul@ampleleap.com"],["Password","password","password","Minimum 6 characters"]].map(([l,k,t,p])=>(
                        <div key={k} style={{marginBottom:14}}>
                          <label style={{display:"block",fontSize:10,fontWeight:700,color:"#64748b",marginBottom:5,textTransform:"uppercase",letterSpacing:.6}}>{l}</label>
                          <input type={t} value={newUser[k]} onChange={e=>setNewUser(u=>({...u,[k]:e.target.value}))} placeholder={p}
                            style={{width:"100%",padding:"9px 12px",borderRadius:9,border:"1.5px solid #e2e8f0",fontSize:13,outline:"none",boxSizing:"border-box",background:"white"}}
                            onFocus={e=>e.target.style.borderColor="#2563eb"} onBlur={e=>e.target.style.borderColor="#e2e8f0"}/>
                        </div>
                      ))}
                      <div style={{marginBottom:14}}>
                        <label style={{display:"block",fontSize:10,fontWeight:700,color:"#64748b",marginBottom:5,textTransform:"uppercase",letterSpacing:.6}}>Role & Access Level</label>
                        <select value={newUser.role} onChange={e=>setNewUser(u=>({...u,role:e.target.value}))} style={{width:"100%",padding:"9px 12px",borderRadius:9,border:"1.5px solid #e2e8f0",fontSize:13,outline:"none",background:"white"}}>
                          <option value="admin">🔑 Admin — Full access</option>
                          <option value="recruiter">✏️ Recruiter — Add & Edit</option>
                          <option value="viewer">👁️ Viewer — Read only</option>
                        </select>
                      </div>
                    </div>
                    <div style={{display:"flex",gap:10,justifyContent:"flex-end"}}>
                      <Btn onClick={()=>setShowUserForm(false)} style={{padding:"9px 18px",background:"white",color:"#374151",borderRadius:9,fontWeight:600,fontSize:13,border:"1.5px solid #e2e8f0"}}>Cancel</Btn>
                      <Btn onClick={addUser} disabled={saving} style={{padding:"9px 22px",background:"linear-gradient(135deg,#2563eb,#7c3aed)",color:"white",borderRadius:9,fontWeight:700,fontSize:13,boxShadow:"0 4px 12px rgba(37,99,235,.3)"}}>
                        {saving?"Creating…":"Create Member"}
                      </Btn>
                    </div>
                  </div>
                )}
              </div>
              {loadingUsers ? <div style={{padding:40,textAlign:"center"}}><Spin/></div> : (
                <div style={{background:"white",borderRadius:14,overflow:"hidden",boxShadow:"0 1px 3px rgba(0,0,0,.06)",border:"1px solid #f1f5f9"}}>
                  <table style={{width:"100%",borderCollapse:"collapse"}}>
                    <thead><tr style={{background:"linear-gradient(to right,#f8fafc,#f1f5f9)"}}>
                      {["Member","Email","Role","Status","Actions"].map(h=>(
                        <th key={h} style={{padding:"12px 16px",textAlign:"left",fontSize:10,fontWeight:700,color:"#64748b",textTransform:"uppercase",letterSpacing:.7,borderBottom:"2px solid #e2e8f0"}}>{h}</th>
                      ))}
                    </tr></thead>
                    <tbody>
                      {users.map((u,i)=>(
                        <tr key={u.id} style={{borderBottom:"1px solid #f8fafc",background:i%2?"#fcfcfd":"white",transition:"background .1s"}}
                          onMouseEnter={e=>e.currentTarget.style.background="#f0f9ff"}
                          onMouseLeave={e=>e.currentTarget.style.background=i%2?"#fcfcfd":"white"}>
                          <td style={{padding:"14px 16px"}}>
                            <div style={{display:"flex",alignItems:"center",gap:10}}>
                              <div style={{width:36,height:36,borderRadius:10,background:"linear-gradient(135deg,#2563eb,#7c3aed)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,fontWeight:800,color:"white",flexShrink:0,boxShadow:"0 4px 8px rgba(37,99,235,.3)"}}>
                                {u.name[0].toUpperCase()}
                              </div>
                              <div>
                                <div style={{fontWeight:700,color:"#0f172a",fontSize:13}}>{u.name}</div>
                                <div style={{fontSize:10,color:"#94a3b8",marginTop:1}}>ID: {u.id}</div>
                              </div>
                            </div>
                          </td>
                          <td style={{padding:"14px 16px",color:"#64748b",fontSize:12}}>{u.email}</td>
                          <td style={{padding:"14px 16px"}}>
                            <select value={u.role} onChange={e=>changeRole(u.id,e.target.value,u.name)} style={{padding:"5px 10px",borderRadius:8,border:`1.5px solid ${roleColors[u.role]?.c+"44"||"#e2e8f0"}`,fontSize:12,background:roleColors[u.role]?.bg||"white",color:roleColors[u.role]?.c||"#374151",outline:"none",cursor:"pointer",fontWeight:700}}>
                              <option value="admin">Admin</option>
                              <option value="recruiter">Recruiter</option>
                              <option value="viewer">Viewer</option>
                            </select>
                          </td>
                          <td style={{padding:"14px 16px"}}>
                            <div style={{display:"flex",alignItems:"center",gap:6}}>
                              <div style={{width:7,height:7,borderRadius:"50%",background:u.active?"#22c55e":"#ef4444",flexShrink:0}}/>
                              <span style={{fontSize:12,fontWeight:600,color:u.active?"#16a34a":"#dc2626"}}>{u.active?"Active":"Inactive"}</span>
                            </div>
                          </td>
                          <td style={{padding:"14px 16px"}}>
                            <Btn onClick={()=>toggleUser(u.id,u.active,u.name)} style={{padding:"6px 14px",background:u.active?"#fef2f2":"#f0fdf4",color:u.active?"#dc2626":"#16a34a",borderRadius:8,fontSize:11,fontWeight:700,border:`1px solid ${u.active?"#fecaca":"#bbf7d0"}`}}>
                              {u.active?"Deactivate":"Activate"}
                            </Btn>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ── REGULAR LIST TABS ── */}
          {tab!=="statusCodes" && tab!=="users" && (
            <div>
              <div style={{background:"white",borderRadius:14,padding:22,boxShadow:"0 1px 3px rgba(0,0,0,.06)",border:"1px solid #f1f5f9",marginBottom:14}}>
                <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:16,gap:12}}>
                  <div>
                    <h3 style={{fontSize:14,fontWeight:800,color:"#0f172a",margin:0,display:"flex",alignItems:"center",gap:8}}>
                      <span>{currentTab?.icon}</span> {currentTab?.l}
                      <span style={{background:"#eff6ff",color:"#2563eb",borderRadius:20,padding:"1px 10px",fontSize:11,fontWeight:700}}>{(masters._full?.[tab]||[]).length}</span>
                    </h3>
                    <p style={{margin:"3px 0 0",fontSize:12,color:"#64748b"}}>{currentTab?.desc}</p>
                  </div>
                </div>
                <div style={{display:"flex",gap:8,marginBottom:12}}>
                  <input value={val} onChange={e=>setVal(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addItem()}
                    placeholder={`Add new ${currentTab?.l?.toLowerCase()?.replace(/s$/,"")||"item"}… (press Enter)`}
                    style={{flex:1,padding:"9px 14px",borderRadius:10,border:"1.5px solid #e2e8f0",fontSize:13,outline:"none",background:"#fafafa",transition:"border .2s"}}
                    onFocus={e=>e.target.style.borderColor="#2563eb"} onBlur={e=>e.target.style.borderColor="#e2e8f0"}/>
                  <Btn onClick={addItem} disabled={saving} style={{padding:"9px 20px",background:"linear-gradient(135deg,#2563eb,#7c3aed)",color:"white",borderRadius:10,fontWeight:700,fontSize:13,boxShadow:"0 4px 12px rgba(37,99,235,.3)",whiteSpace:"nowrap"}}>
                    {saving?"Adding…":"+ Add"}
                  </Btn>
                </div>
                {(masters._full?.[tab]||[]).length > 6 && (
                  <div style={{display:"flex",alignItems:"center",gap:8,background:"#f8fafc",borderRadius:9,padding:"8px 12px",border:"1.5px solid #e2e8f0"}}>
                    <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth={2.5}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                    <input value={search} onChange={e=>setSearch(e.target.value)} placeholder={`Search ${currentTab?.l?.toLowerCase()}…`}
                      style={{border:"none",background:"none",outline:"none",fontSize:12,flex:1,color:"#374151"}}/>
                    {search&&<button onClick={()=>setSearch("")} style={{border:"none",background:"none",cursor:"pointer",color:"#94a3b8",fontSize:14,padding:0}}>✕</button>}
                  </div>
                )}
              </div>

              <div style={{background:"white",borderRadius:14,boxShadow:"0 1px 3px rgba(0,0,0,.06)",border:"1px solid #f1f5f9",overflow:"hidden"}}>
                {fullItems.length===0 ? (
                  <div style={{padding:50,textAlign:"center"}}>
                    <div style={{fontSize:36,marginBottom:10}}>{currentTab?.icon}</div>
                    <div style={{fontSize:14,fontWeight:700,color:"#0f172a",marginBottom:4}}>{search?"No results found":`No ${currentTab?.l?.toLowerCase()} yet`}</div>
                    <div style={{fontSize:12,color:"#94a3b8"}}>{search?"Try a different search term":"Add your first item above"}</div>
                  </div>
                ) : fullItems.map((item,i)=>(
                  <div key={item.id}
                    style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 18px",background:i%2?"#fcfcfd":"white",borderBottom:"1px solid #f8fafc",transition:"background .1s"}}
                    onMouseEnter={e=>{ e.currentTarget.style.background="#f0f9ff"; }}
                    onMouseLeave={e=>{ e.currentTarget.style.background=i%2?"#fcfcfd":"white"; }}>
                    {editId===item.id ? (
                      <div style={{display:"flex",gap:8,flex:1}}>
                        <input value={editVal} onChange={e=>setEditVal(e.target.value)} onKeyDown={e=>e.key==="Enter"&&saveEdit(item.id)} autoFocus
                          style={{flex:1,padding:"7px 12px",borderRadius:8,border:"1.5px solid #2563eb",fontSize:13,outline:"none",background:"#eff6ff"}}/>
                        <Btn onClick={()=>saveEdit(item.id)} style={{padding:"7px 14px",background:"#2563eb",color:"white",borderRadius:8,fontSize:12,fontWeight:700}}>Save</Btn>
                        <Btn onClick={()=>setEditId(null)} style={{padding:"7px 12px",background:"#f1f5f9",color:"#374151",borderRadius:8,fontSize:12,fontWeight:600}}>Cancel</Btn>
                      </div>
                    ) : (
                      <>
                        <div style={{display:"flex",alignItems:"center",gap:10,flex:1}}>
                          <div style={{width:28,height:28,borderRadius:7,background:"linear-gradient(135deg,#eff6ff,#f5f3ff)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,flexShrink:0}}>{currentTab?.icon}</div>
                          <span style={{fontSize:13,color:"#1e293b",fontWeight:500}}>{item.value}</span>
                        </div>
                        <div style={{display:"flex",gap:6}}>
                          <Btn onClick={()=>{setEditId(item.id);setEditVal(item.value);}} style={{padding:"5px 12px",background:"#f0f9ff",color:"#2563eb",borderRadius:7,fontSize:11,fontWeight:700,border:"1px solid #bfdbfe"}}>✏️ Edit</Btn>
                          <Btn onClick={()=>deleteItem(item.id,item.value)} style={{padding:"5px 12px",background:"#fef2f2",color:"#dc2626",borderRadius:7,fontSize:11,fontWeight:700,border:"1px solid #fecaca"}}>🗑️ Delete</Btn>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
