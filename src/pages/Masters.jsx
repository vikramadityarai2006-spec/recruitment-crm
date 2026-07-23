import { useState, useEffect } from "react";
import { api } from "../api";
import { Spin } from "../components/UI";

// ─── ROLE CONFIG ──────────────────────────────────────────────────────────────
const ROLES = {
  admin:     { label: "Admin",     icon: "admin_panel_settings", cls: "text-secondary bg-secondary-fixed border-secondary", desc: "Full access to all features" },
  recruiter: { label: "Recruiter", icon: "edit_square",          cls: "text-primary-container bg-primary-fixed border-primary-container", desc: "Can add and edit candidates" },
  viewer:    { label: "Viewer",    icon: "visibility",           cls: "text-green-600 bg-green-50 border-green-600", desc: "Read-only access" },
};

const TAB_ICONS = {
  clients: "apartment", owners: "person_search", joiningStatus: "assignment_turned_in",
  resignationStatus: "person_off", locations: "location_on", designations: "work",
  statusCodes: "palette", users: "group",
};

function PrimaryButton({ onClick, disabled, children, className = "" }) {
  return (
    <button onClick={onClick} disabled={disabled}
      className={`flex items-center justify-center gap-1.5 bg-secondary hover:bg-accent-hover text-white rounded-xl font-bold transition-all shadow-md active:scale-95 disabled:bg-outline-variant disabled:text-text-tertiary disabled:cursor-not-allowed disabled:shadow-none ${className}`}>
      {children}
    </button>
  );
}

// ─── USER CARD ────────────────────────────────────────────────────────────────
function UserCard({ u, currentUserId, onRoleChange, onToggle, onDelete, onResetPassword, onUpdateEmail }) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [editEmail, setEditEmail] = useState(false);
  const [emailVal, setEmailVal] = useState(u.email || "");
  const [emailErr, setEmailErr] = useState("");
  const [newPass, setNewPass] = useState("");
  const [showReset, setShowReset] = useState(false);
  const [saving, setSaving] = useState(false);
  const isSelf = u.id === currentUserId;
  const role = ROLES[u.role] || ROLES.viewer;

  const saveEmail = async () => {
    setEmailErr("");
    const v = emailVal.trim();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v)) { setEmailErr("Enter a valid email"); return; }
    setSaving(true);
    const r = await onUpdateEmail(u.id, v);
    setSaving(false);
    if (r && r.error) setEmailErr(r.error); else setEditEmail(false);
  };

  const handleReset = async () => {
    if (!newPass || newPass.length < 6) return;
    setSaving(true);
    await onResetPassword(u.id, newPass);
    setNewPass(""); setShowReset(false); setSaving(false);
  };

  return (
    <div className={`bg-surface-container-lowest border rounded-xl overflow-hidden transition-all hover:shadow-md ${u.active ? "border-surface-variant" : "border-red-200 opacity-85"}`}>
      <div className="p-4 flex items-center gap-3 border-b border-surface-variant bg-surface-container-low">
        <div className={`w-11 h-11 rounded-lg shrink-0 flex items-center justify-center font-bold text-white text-lg ${u.active ? "bg-gradient-to-br from-primary to-on-primary-container" : "bg-gray-400"}`}>
          {u.name[0].toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-sm font-bold truncate ${u.active ? "text-text-primary" : "text-text-tertiary line-through"}`}>{u.name}</span>
            <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wider ${role.cls}`}>
              <span className="material-symbols-outlined text-[12px]">{role.icon}</span> {role.label}
            </div>
            {isSelf && <span className="text-[9px] bg-primary/5 text-primary px-1.5 py-0.5 rounded font-bold uppercase">You</span>}
          </div>
          {editEmail ? (
            <div className="mt-1">
              <div className="flex items-center gap-1">
                <input value={emailVal} onChange={e=>{setEmailVal(e.target.value);setEmailErr("");}}
                  className="flex-1 min-w-0 px-2 py-1 text-xs border border-outline-variant rounded-md outline-none focus:border-primary"/>
                <button onClick={saveEmail} disabled={saving}
                  className="px-2 py-1 text-[10px] font-bold bg-primary text-white rounded-md">Save</button>
                <button onClick={()=>{setEditEmail(false);setEmailVal(u.email||"");setEmailErr("");}}
                  className="px-2 py-1 text-[10px] font-bold text-text-secondary">Cancel</button>
              </div>
              {emailErr && <p className="text-[10px] text-error font-bold mt-1">{emailErr}</p>}
            </div>
          ) : (
            <div className="flex items-center gap-1 mt-0.5">
              <span className="text-xs text-text-secondary truncate">{u.email || <em className="text-error">No email — cannot log in</em>}</span>
              <button onClick={()=>setEditEmail(true)} title="Edit email"
                className="shrink-0 text-text-tertiary hover:text-primary">
                <span className="material-symbols-outlined text-[14px]">edit</span>
              </button>
            </div>
          )}
        </div>
        <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${u.active ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]" : "bg-red-500"}`} title={u.active ? "Active" : "Inactive"}/>
      </div>

      <div className="p-4">
        {!u.active ? (
          <button onClick={() => onToggle(u.id, u.active, u.name)} className="w-full bg-green-50 text-green-700 border border-green-200 py-2.5 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5">
            <span className="material-symbols-outlined text-base">check_circle</span> Enable Account
          </button>
        ) : (
          <>
            <div className="mb-4">
              <label className="block text-[10px] font-bold text-outline uppercase tracking-wider mb-1.5">Access Permissions</label>
              <select value={u.role} onChange={e => !isSelf && onRoleChange(u.id, e.target.value, u.name)} disabled={isSelf}
                className="w-full px-3 py-2 rounded-lg border border-surface-variant bg-surface-container text-primary font-semibold text-sm outline-none cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed">
                {Object.entries(ROLES).map(([k, v]) => <option key={k} value={k}>{v.label} — {v.desc}</option>)}
              </select>
            </div>

            <div className="flex gap-2 flex-wrap">
              {!isSelf && (
                <button onClick={() => onToggle(u.id, u.active, u.name)} className="flex-1 py-2 rounded-lg border border-red-200 bg-red-50 text-error font-bold text-xs hover:bg-error hover:text-white transition-colors">
                  Disable
                </button>
              )}
              <button onClick={() => setShowReset(v => !v)} className={`flex-1 py-2 rounded-lg border border-surface-variant font-bold text-xs transition-colors ${showReset ? "bg-primary/5 text-primary" : "bg-surface-container-lowest text-primary hover:bg-surface-container-low"}`}>
                Reset Pass
              </button>
              {!isSelf && (confirmDelete ? (
                <div className="flex gap-1.5 w-full items-center">
                  <span className="text-xs text-error font-semibold flex-1">Sure?</span>
                  <button onClick={() => { onDelete(u.id, u.name); setConfirmDelete(false); }} className="px-3 py-2 rounded-lg text-xs font-bold bg-error text-white">Yes, Delete</button>
                  <button onClick={() => setConfirmDelete(false)} className="px-3 py-2 rounded-lg text-xs font-semibold bg-white border border-surface-variant text-text-secondary">Cancel</button>
                </div>
              ) : (
                <button onClick={() => setConfirmDelete(true)} className="px-3 py-2 rounded-lg border border-surface-variant bg-surface-container-lowest text-error hover:bg-error-bg transition-colors">
                  <span className="material-symbols-outlined text-lg">delete</span>
                </button>
              ))}
            </div>

            {showReset && (
              <div className="mt-3 p-3 bg-surface-container-low rounded-lg border border-surface-variant">
                <div className="text-xs font-bold text-text-secondary mb-2">Set new password (min 6 chars)</div>
                <div className="flex gap-1.5">
                  <input type="password" value={newPass} onChange={e => setNewPass(e.target.value)} placeholder="New password…" minLength={6}
                    onKeyDown={e => e.key === "Enter" && handleReset()}
                    className="flex-1 px-3 py-1.5 rounded-lg border border-surface-variant text-sm outline-none focus:border-primary"/>
                  <button onClick={handleReset} disabled={saving || newPass.length < 6} className="px-3 py-1.5 rounded-lg text-xs font-bold bg-primary text-white disabled:opacity-50">
                    {saving ? "…" : "Set"}
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <div className="px-4 py-2 border-t border-surface-variant bg-surface-container-lowest text-[10px] text-outline italic">
        Joined: {new Date(u.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
      </div>
    </div>
  );
}

// ─── ADD USER FORM ────────────────────────────────────────────────────────────
function AddUserForm({ onAdd, onClose, saving }) {
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "recruiter" });
  const [showPass, setShowPass] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const valid = form.name.trim() && form.email.trim() && form.password.length >= 6;
  const inputCls = "w-full px-4 py-2.5 rounded-lg border border-surface-variant text-sm outline-none bg-white focus:border-primary transition-all";
  const labelCls = "block text-[11px] font-bold text-text-secondary mb-1 uppercase tracking-wider";

  return (
    <div className="bg-surface-container-low border border-surface-variant rounded-2xl p-5 mb-5">
      <div className="flex justify-between items-center mb-4">
        <div className="text-sm font-bold text-primary flex items-center gap-2">
          <span className="material-symbols-outlined text-lg">person_add</span> Onboard New Team Member
        </div>
        <button onClick={onClose} className="text-outline hover:text-text-primary text-xl leading-none">✕</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
        <div className="mb-3.5"><label className={labelCls}>Full Name</label><input type="text" value={form.name} onChange={e=>set("name",e.target.value)} placeholder="e.g. Rahul Sharma" className={inputCls}/></div>
        <div className="mb-3.5"><label className={labelCls}>Email Address</label><input type="email" value={form.email} onChange={e=>set("email",e.target.value)} placeholder="e.g. rahul@ampleleap.com" className={inputCls}/></div>
        <div className="mb-3.5">
          <label className={labelCls}>Password</label>
          <div className="relative">
            <input type={showPass ? "text" : "password"} value={form.password} onChange={e => set("password", e.target.value)} placeholder="Min 6 characters" className={`${inputCls} pr-10`}/>
            <button type="button" onClick={() => setShowPass(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-outline">
              <span className="material-symbols-outlined text-lg">{showPass ? "visibility_off" : "visibility"}</span>
            </button>
          </div>
          {form.password && form.password.length < 6 && <div className="text-[10px] text-error mt-1">At least 6 characters required</div>}
        </div>
        <div className="mb-3.5">
          <label className={labelCls}>Role</label>
          <select value={form.role} onChange={e => set("role", e.target.value)} className={inputCls}>
            <option value="admin">Admin — Full access</option>
            <option value="recruiter">Recruiter — Add & Edit</option>
            <option value="viewer">Viewer — Read only</option>
          </select>
        </div>
      </div>
      <div className="flex gap-2 justify-end">
        <button onClick={onClose} className="px-5 py-2.5 bg-white border border-surface-variant rounded-lg font-semibold text-sm text-text-secondary">Cancel</button>
        <PrimaryButton onClick={() => valid && onAdd(form)} disabled={!valid || saving} className="px-6 py-2.5 text-sm">
          {saving ? "Creating…" : "Create Member"}
        </PrimaryButton>
      </div>
    </div>
  );
}

// ─── MAIN MASTERS PAGE ────────────────────────────────────────────────────────
export default function Masters({ masters, reload, currentUser }) {
  const [tab, setTab] = useState("clients");
  const [val, setVal] = useState("");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ text: "", type: "success" });
  const [editId, setEditId] = useState(null);
  const [editVal, setEditVal] = useState("");
  const [showAddUser, setShowAddUser] = useState(false);
  const [savingUser, setSavingUser] = useState(false);
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [newCode, setNewCode] = useState({ code: "", label: "", color: "#001c3e" });
  const [savingCode, setSavingCode] = useState(false);
  const [search, setSearch] = useState("");

  const tabs = [
    { k: "clients",           l: "Clients",        desc: "Client company names" },
    { k: "owners",            l: "Owners",         desc: "Recruiter/owner names" },
    { k: "joiningStatus",     l: "Joining Status", desc: "Joining stage values" },
    { k: "resignationStatus", l: "Resignation",    desc: "Resignation status values" },
    { k: "locations",         l: "Locations",      desc: "Cities and locations" },
    { k: "designations",      l: "Designations",   desc: "Job titles" },
    { k: "statusCodes",       l: "Status Codes",   desc: "Color-coded markers" },
    { k: "users",             l: "Team Members",   desc: "User management" },
  ];

  const showMsg = (text, type = "success") => { setMsg({ text, type }); setTimeout(() => setMsg({ text: "", type: "success" }), 3000); };

  const loadUsers = async () => {
    setLoadingUsers(true);
    try { const u = await api.getUsers(); setUsers(Array.isArray(u) ? u : []); }
    catch (e) { showMsg("Failed to load users", "error"); }
    setLoadingUsers(false);
  };

  useEffect(() => { if (tab === "users") loadUsers(); }, [tab]);

  const addItem = async () => {
    if (!val.trim()) return;
    setSaving(true);
    const r = await api.addMaster(tab, val.trim());
    if (r.error) showMsg(r.error, "error");
    else { showMsg(`"${val.trim()}" added!`); setVal(""); reload(); }
    setSaving(false);
  };

  const deleteItem = async (id, value) => {
    if (!window.confirm(`Delete "${value}" from the list?`)) return;
    const r = await api.deleteMaster(id);
    if (r.error) showMsg(r.error, "error");
    else { showMsg(`"${value}" removed`); reload(); }
  };

  const saveEdit = async id => {
    if (!editVal.trim()) return;
    const r = await api.updateMaster(id, editVal);
    if (r.error) showMsg(r.error, "error");
    else { showMsg("Updated!"); setEditId(null); reload(); }
  };

  const addStatusCode = async () => {
    if (!newCode.code || !newCode.label || !newCode.color) { showMsg("All fields required", "error"); return; }
    setSavingCode(true);
    const r = await api.addStatusCode(newCode);
    if (r.error) showMsg(r.error, "error");
    else { showMsg(`Code "${newCode.code}" saved!`); setNewCode({ code: "", label: "", color: "#001c3e" }); reload(); }
    setSavingCode(false);
  };

  const deleteStatusCode = async code => {
    if (!window.confirm(`Delete status code "${code}"?`)) return;
    const r = await api.deleteStatusCode(code);
    if (r.error) showMsg(r.error, "error");
    else { showMsg(`"${code}" deleted!`); reload(); }
  };

  const addUser = async form => {
    setSavingUser(true);
    const r = await api.createUser(form);
    if (r.error) showMsg(r.error, "error");
    else { showMsg(`${r.name} added to team!`); setShowAddUser(false); loadUsers(); }
    setSavingUser(false);
  };

  const changeRole = async (id, role, name) => {
    const r = await api.updateUser(id, { role });
    if (r.error) showMsg(r.error, "error");
    else { showMsg(`${name} is now ${role}`); loadUsers(); }
  };

  const deleteUser = async (id, name) => {
    const r = await api.deleteUser(id);
    if (r.error) { showMsg(r.error, "error"); return; }
    setUsers(prev => prev.filter(u => u.id !== id));
    showMsg(`"${name}" permanently deleted from team`);
  };

  const toggleUser = async (id, active, name) => {
    const action = active ? "Deactivate" : "Activate";
    if (!window.confirm(`${action} "${name}"?`)) return;
    const r = await api.updateUser(id, { active: !active });
    if (r.error) { showMsg(r.error, "error"); return; }
    if (active) { setUsers(prev => prev.filter(u => u.id !== id)); showMsg(`"${name}" deactivated and removed from list`); }
    else { setUsers(prev => prev.map(u => u.id === id ? { ...u, active: true } : u)); showMsg(`"${name}" activated!`); }
  };

  const resetPassword = async (id, password) => {
    const r = await api.updateUser(id, { password });
    if (r.error) showMsg(r.error, "error"); else showMsg("Password updated!");
  };

  // Each recruiter signs in with their own address, so a typo has to be
  // fixable without deleting and recreating the account.
  const updateEmail = async (id, email) => {
    const r = await api.updateUser(id, { email });
    if (r.error) { showMsg(r.error, "error"); return r; }
    setUsers(us => us.map(u => u.id === id ? { ...u, email } : u));
    showMsg("Email updated!");
    return r;
  };

  const currentTab = tabs.find(t => t.k === tab);
  const fullItems = (masters._full?.[tab] || []).filter(item => !search || item.value.toLowerCase().includes(search.toLowerCase()));
  const activeUsers = users.filter(u => u.active).length;
  const inactiveUsers = users.filter(u => !u.active).length;
  const inputCls = "w-full px-4 py-3 rounded-xl border border-outline-variant bg-surface-container-low focus:border-primary focus:ring-1 focus:ring-primary outline-none text-sm transition-all";

  return (
    <div className="max-w-[1440px] mx-auto">
      {/* Header */}
      <header className="bg-primary shadow-xl rounded-2xl p-8 mb-8 flex items-center justify-between overflow-hidden relative">
        <div className="relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl flex items-center justify-center">
              <span className="material-symbols-outlined text-3xl text-white">settings</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">Master Data Engine</h1>
              <p className="text-primary-fixed text-sm font-medium mt-1">Configuration portal for candidate dropdowns and team access</p>
            </div>
          </div>
        </div>
        <div className="absolute right-[-20px] top-[-20px] opacity-10">
          <span className="material-symbols-outlined text-[180px] text-white">settings</span>
        </div>
      </header>

      {msg.text && (
        <div className={`px-5 py-3 rounded-lg mb-4 text-sm font-semibold ${msg.type==="error"?"bg-error-bg text-error":"bg-green-100 text-green-700"}`}>{msg.text}</div>
      )}

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Sidebar Navigation */}
        <aside className="w-full lg:w-64 shrink-0">
          <div className="bg-surface-container-lowest rounded-2xl border border-surface-variant overflow-hidden shadow-sm">
            <div className="p-4 bg-surface-container-low border-b border-surface-variant text-[11px] font-bold text-outline uppercase tracking-widest">
              Settings Navigation
            </div>
            <nav>
              {tabs.map(t => (
                <button key={t.k} onClick={() => { setTab(t.k); setSearch(""); }}
                  className={`w-full flex items-center gap-4 px-5 py-4 text-left transition-all relative ${tab===t.k ? "bg-primary-fixed text-primary" : "text-text-secondary hover:bg-surface-container hover:text-text-primary"}`}>
                  {tab===t.k && <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-primary rounded-r-full"></div>}
                  <span className="material-symbols-outlined text-xl">{TAB_ICONS[t.k]}</span>
                  <div className="flex-1 overflow-hidden">
                    <div className={`text-sm ${tab===t.k ? "font-bold" : "font-semibold"}`}>{t.l}</div>
                    <div className="text-[10px] opacity-60 truncate">
                      {t.k === "users" ? `${activeUsers} active` : `${(masters._full?.[t.k] || []).length} items`}
                    </div>
                  </div>
                </button>
              ))}
            </nav>
          </div>
          <div className="mt-6 p-5 bg-primary-container/5 border border-primary-container/10 rounded-2xl">
            <div className="text-xs font-bold text-primary flex items-center gap-2 mb-2">
              <span className="material-symbols-outlined text-sm">cloud_sync</span> System Status
            </div>
            <div className="flex items-center gap-2 text-xs text-text-secondary">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> Live &amp; Synchronized
            </div>
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1 min-w-0 w-full">
          {/* ── STATUS CODES ── */}
          {tab === "statusCodes" && (
            <div>
              <div className="bg-surface-container-lowest border border-surface-variant rounded-2xl p-8 mb-8 shadow-sm">
                <h3 className="text-lg font-bold text-primary flex items-center gap-3 mb-6">
                  <span className="material-symbols-outlined">palette</span> Add/Edit Status Code
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-5 items-end">
                  <div>
                    <label className="block text-[11px] font-bold text-outline uppercase tracking-wider mb-2">Code Name</label>
                    <input value={newCode.code} onChange={e => setNewCode(n => ({ ...n, code: e.target.value }))} placeholder="e.g. Hot" className={inputCls}/>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-outline uppercase tracking-wider mb-2">Description</label>
                    <input value={newCode.label} onChange={e => setNewCode(n => ({ ...n, label: e.target.value }))} placeholder="e.g. High priority" className={inputCls}/>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-outline uppercase tracking-wider mb-2">Marker Color</label>
                    <input type="color" value={newCode.color} onChange={e => setNewCode(n => ({ ...n, color: e.target.value }))} className="w-full h-11 rounded-xl border border-outline-variant p-1 cursor-pointer bg-white"/>
                  </div>
                  <PrimaryButton onClick={addStatusCode} disabled={savingCode} className="py-3 px-6">
                    <span className="material-symbols-outlined text-sm">save</span> {savingCode ? "Saving…" : "Save Code"}
                  </PrimaryButton>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {(masters.statusCodes || []).map(s => (
                  <div key={s.code} className="bg-white rounded-xl p-4 border-2 flex items-center justify-between" style={{ borderColor: s.color + "44" }}>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ background: s.color, boxShadow: `0 4px 12px ${s.color}44` }}>
                        <span className="text-white font-black text-base">{s.code[0]}</span>
                      </div>
                      <div>
                        <div className="font-extrabold text-sm" style={{ color: s.color }}>{s.code}</div>
                        <div className="text-[11px] text-text-tertiary mt-0.5">{s.label}</div>
                      </div>
                    </div>
                    <button onClick={() => deleteStatusCode(s.code)} className="px-3 py-1.5 bg-white text-error rounded-lg text-[11px] font-bold border border-red-200">Delete</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── TEAM MEMBERS ── */}
          {tab === "users" && (
            <div>
              <div className="grid grid-cols-3 gap-3 mb-6">
                {[
                  { l: "Total Members", v: users.length, c: "text-primary", bg: "bg-primary/5" },
                  { l: "Active", v: activeUsers, c: "text-green-600", bg: "bg-green-50" },
                  { l: "Inactive", v: inactiveUsers, c: "text-error", bg: "bg-error-bg" },
                ].map(s => (
                  <div key={s.l} className="bg-white rounded-xl p-3.5 border border-surface-variant flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-lg ${s.bg} flex items-center justify-center text-base font-extrabold ${s.c} shrink-0`}>{s.v}</div>
                    <div className="text-[11px] text-text-secondary font-medium">{s.l}</div>
                  </div>
                ))}
              </div>

              {showAddUser ? (
                <AddUserForm onAdd={addUser} onClose={() => setShowAddUser(false)} saving={savingUser} />
              ) : (
                <button onClick={() => setShowAddUser(true)} className="bg-secondary text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-accent-hover transition-all shadow-md w-full mb-6">
                  <span className="material-symbols-outlined">person_add</span> Onboard New Member
                </button>
              )}

              {loadingUsers ? (
                <div className="p-10 text-center"><Spin/></div>
              ) : users.length === 0 ? (
                <div className="p-10 text-center text-text-tertiary">No team members yet. Add your first one above.</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {users.map(u => (
                    <UserCard key={u.id} u={u} currentUserId={currentUser?.id}
                      onRoleChange={changeRole} onToggle={toggleUser} onDelete={deleteUser} onResetPassword={resetPassword} onUpdateEmail={updateEmail}/>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── REGULAR LIST TABS ── */}
          {tab !== "statusCodes" && tab !== "users" && (
            <div>
              <div className="bg-surface-container-lowest border border-surface-variant rounded-2xl p-8 mb-6 shadow-sm">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                  <div>
                    <h3 className="text-xl font-bold text-primary flex items-center gap-3">
                      <span className="material-symbols-outlined text-3xl text-primary-container">{TAB_ICONS[tab]}</span> {currentTab?.l}
                      <span className="bg-primary-fixed text-primary px-3 py-0.5 rounded-full text-xs font-bold">{(masters._full?.[tab] || []).length} Total</span>
                    </h3>
                    <p className="text-text-secondary text-sm font-medium mt-1">{currentTab?.desc} — used in candidate dropdowns</p>
                  </div>
                  {(masters._full?.[tab] || []).length > 5 && (
                    <div className="relative w-full md:w-64">
                      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-lg">search</span>
                      <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search items..." className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-outline-variant bg-surface-container-low focus:border-primary focus:ring-1 focus:ring-primary outline-none text-sm transition-all"/>
                    </div>
                  )}
                </div>
                <div className="flex gap-3 p-1.5 bg-surface-container-low rounded-2xl border border-surface-variant">
                  <input value={val} onChange={e => setVal(e.target.value)} onKeyDown={e => e.key === "Enter" && addItem()}
                    placeholder={`Add new ${currentTab?.l?.toLowerCase()?.replace(/s$/, "") || "item"}…`}
                    className="flex-1 px-5 py-3 rounded-xl border-none bg-transparent text-sm font-semibold focus:outline-none"/>
                  <PrimaryButton onClick={addItem} disabled={saving || !val.trim()} className="px-8 py-3">
                    <span className="material-symbols-outlined text-sm">add</span> {saving ? "Adding…" : "Add"}
                  </PrimaryButton>
                </div>
              </div>

              <div className="border border-surface-variant rounded-2xl shadow-sm divide-y divide-surface-variant overflow-hidden bg-white">
                {fullItems.length === 0 ? (
                  <div className="p-12 text-center">
                    <span className="material-symbols-outlined text-4xl text-outline-variant">{TAB_ICONS[tab]}</span>
                    <div className="text-sm font-bold text-text-primary mt-2">{search ? "No results" : `No ${currentTab?.l?.toLowerCase()} yet`}</div>
                    <div className="text-xs text-text-tertiary mt-1">{search ? "Try a different search" : "Add your first item above"}</div>
                  </div>
                ) : fullItems.map(item => (
                  <div key={item.id} className="p-4 flex items-center justify-between hover:bg-surface-container transition-colors group gap-3">
                    {editId === item.id ? (
                      <>
                        <input value={editVal} onChange={e => setEditVal(e.target.value)}
                          onKeyDown={e => { if (e.key === "Enter") saveEdit(item.id); if (e.key === "Escape") setEditId(null); }} autoFocus
                          className="flex-1 px-3 py-1.5 rounded-lg border border-primary bg-primary/5 text-sm outline-none"/>
                        <button onClick={() => saveEdit(item.id)} className="px-3.5 py-1.5 bg-primary text-white rounded-lg text-xs font-bold">Save</button>
                        <button onClick={() => setEditId(null)} className="px-3 py-1.5 bg-surface-container text-text-secondary rounded-lg text-xs font-semibold">Cancel</button>
                      </>
                    ) : (
                      <>
                        <div className="flex items-center gap-4 flex-1">
                          <div className="w-10 h-10 rounded-lg bg-primary-fixed/30 flex items-center justify-center text-primary shrink-0">
                            <span className="material-symbols-outlined text-xl">{TAB_ICONS[tab]}</span>
                          </div>
                          <span className="font-semibold text-text-primary text-sm">{item.value}</span>
                        </div>
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => { setEditId(item.id); setEditVal(item.value); }} className="p-2 text-primary hover:bg-primary-fixed rounded-lg transition-all">
                            <span className="material-symbols-outlined text-lg">edit</span>
                          </button>
                          <button onClick={() => deleteItem(item.id, item.value)} className="p-2 text-error hover:bg-error-bg rounded-lg transition-all">
                            <span className="material-symbols-outlined text-lg">delete</span>
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
