import { useState, useEffect } from "react";
import { api } from "../api";
import { Spin } from "../components/UI";

// ─── ROLE CONFIG ──────────────────────────────────────────────────────────────
const ROLES = {
  admin:     { label: "Admin",     icon: "🔑", color: "#d97706", bg: "#fef3c7", border: "#fde68a", desc: "Full access to all features" },
  recruiter: { label: "Recruiter", icon: "✏️", color: "#2563eb", bg: "#eff6ff", border: "#bfdbfe", desc: "Can add and edit candidates" },
  viewer:    { label: "Viewer",    icon: "👁️", color: "#16a34a", bg: "#f0fdf4", border: "#bbf7d0", desc: "Read-only access" },
};

// ─── USER CARD ────────────────────────────────────────────────────────────────
function UserCard({ u, currentUserId, onRoleChange, onToggle, onDelete, onResetPassword }) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [newPass, setNewPass] = useState("");
  const [showReset, setShowReset] = useState(false);
  const [saving, setSaving] = useState(false);
  const isSelf = u.id === currentUserId;
  const role = ROLES[u.role] || ROLES.viewer;

  const handleReset = async () => {
    if (!newPass || newPass.length < 6) return;
    setSaving(true);
    await onResetPassword(u.id, newPass);
    setNewPass(""); setShowReset(false); setSaving(false);
  };

  return (
    <div style={{
      background: "white", borderRadius: 14, border: `1px solid ${u.active ? "#f1f5f9" : "#fecaca"}`,
      boxShadow: "0 1px 4px rgba(0,0,0,.06)", overflow: "hidden", transition: "box-shadow .2s",
    }}>
      {/* Header */}
      <div style={{ padding: "16px 18px", display: "flex", alignItems: "center", gap: 12, borderBottom: "1px solid #f8fafc" }}>
        <div style={{
          width: 44, height: 44, borderRadius: 12, flexShrink: 0,
          background: u.active ? `linear-gradient(135deg, ${role.color}22, ${role.color}44)` : "#f1f5f9",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 18, fontWeight: 800, color: u.active ? role.color : "#94a3b8",
          border: `1.5px solid ${u.active ? role.border : "#e2e8f0"}`,
        }}>
          {u.name[0].toUpperCase()}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: u.active ? "#0f172a" : "#94a3b8" }}>{u.name}</span>
            {isSelf && <span style={{ fontSize: 9, background: "#eff6ff", color: "#2563eb", padding: "1px 6px", borderRadius: 8, fontWeight: 700, textTransform: "uppercase", letterSpacing: .5 }}>You</span>}
          </div>
          <div style={{ fontSize: 11, color: "#64748b", marginTop: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{u.email}</div>
        </div>
        <div style={{
          width: 8, height: 8, borderRadius: "50%", flexShrink: 0,
          background: u.active ? "#22c55e" : "#ef4444",
          boxShadow: `0 0 6px ${u.active ? "#22c55e66" : "#ef444466"}`,
        }} title={u.active ? "Active" : "Inactive"} />
      </div>

      {/* Role + actions */}
      <div style={{ padding: "12px 18px" }}>
        {/* Role selector */}
        <div style={{ marginBottom: 12 }}>
          <label style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: .6, display: "block", marginBottom: 5 }}>Role & Access</label>
          <select
            value={u.role}
            onChange={e => !isSelf && onRoleChange(u.id, e.target.value, u.name)}
            disabled={isSelf}
            style={{
              width: "100%", padding: "8px 10px", borderRadius: 8,
              border: `1.5px solid ${role.border}`, background: role.bg,
              color: role.color, fontSize: 12, fontWeight: 700, outline: "none",
              cursor: isSelf ? "not-allowed" : "pointer", opacity: isSelf ? .6 : 1,
            }}
          >
            {Object.entries(ROLES).map(([k, v]) => (
              <option key={k} value={k}>{v.icon} {v.label} — {v.desc}</option>
            ))}
          </select>
        </div>

        {/* Action buttons */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {/* Activate / Deactivate */}
          {!isSelf && (
            <button onClick={() => onToggle(u.id, u.active, u.name)} style={{
              flex: 1, padding: "7px 10px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 11, fontWeight: 700,
              background: u.active ? "#fee2e2" : "#dcfce7", color: u.active ? "#dc2626" : "#16a34a",
            }}>
              {u.active ? "🚫 Deactivate" : "✅ Activate"}
            </button>
          )}

          {/* Reset Password */}
          <button onClick={() => setShowReset(v => !v)} style={{
            flex: 1, padding: "7px 10px", borderRadius: 8, border: "1px solid #e2e8f0", cursor: "pointer", fontSize: 11, fontWeight: 700,
            background: showReset ? "#eff6ff" : "white", color: "#2563eb",
          }}>
            🔑 Reset PW
          </button>

          {/* Delete — only for non-self */}
          {!isSelf && (
            confirmDelete ? (
              <div style={{ display: "flex", gap: 4, width: "100%" }}>
                <span style={{ fontSize: 11, color: "#dc2626", fontWeight: 600, alignSelf: "center", flex: 1 }}>Sure?</span>
                <button onClick={() => { onDelete(u.id, u.name); setConfirmDelete(false); }} style={{ padding: "7px 12px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 11, fontWeight: 700, background: "#dc2626", color: "white" }}>Yes, Delete</button>
                <button onClick={() => setConfirmDelete(false)} style={{ padding: "7px 12px", borderRadius: 8, border: "1px solid #e2e8f0", cursor: "pointer", fontSize: 11, fontWeight: 600, background: "white", color: "#374151" }}>Cancel</button>
              </div>
            ) : (
              <button onClick={() => setConfirmDelete(true)} style={{
                padding: "7px 10px", borderRadius: 8, border: "1px solid #fecaca", cursor: "pointer", fontSize: 11, fontWeight: 700,
                background: "#fef2f2", color: "#dc2626",
              }}>
                🗑️ Delete
              </button>
            )
          )}
        </div>

        {/* Password reset form */}
        {showReset && (
          <div style={{ marginTop: 10, padding: "12px", background: "#f8fafc", borderRadius: 9, border: "1px solid #e2e8f0" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#374151", marginBottom: 8 }}>Set new password (min 6 chars)</div>
            <div style={{ display: "flex", gap: 6 }}>
              <input
                type="password" value={newPass} onChange={e => setNewPass(e.target.value)}
                placeholder="New password…" minLength={6}
                style={{ flex: 1, padding: "7px 10px", borderRadius: 7, border: "1.5px solid #e2e8f0", fontSize: 12, outline: "none" }}
                onFocus={e => e.target.style.borderColor = "#2563eb"}
                onBlur={e => e.target.style.borderColor = "#e2e8f0"}
                onKeyDown={e => e.key === "Enter" && handleReset()}
              />
              <button onClick={handleReset} disabled={saving || newPass.length < 6} style={{ padding: "7px 12px", borderRadius: 7, border: "none", cursor: newPass.length < 6 ? "not-allowed" : "pointer", fontSize: 11, fontWeight: 700, background: "#2563eb", color: "white", opacity: newPass.length < 6 ? .5 : 1 }}>
                {saving ? "…" : "Set"}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Last seen / created */}
      <div style={{ padding: "8px 18px", borderTop: "1px solid #f8fafc", fontSize: 10, color: "#94a3b8" }}>
        Added {new Date(u.createdAt).toLocaleDateString("en-IN", { day:"2-digit", month:"short", year:"numeric" })}
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

  return (
    <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 14, padding: 20, marginBottom: 18 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a" }}>➕ Add New Team Member</div>
        <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8", fontSize: 18, padding: 2 }}>✕</button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 14px" }}>
        {[["Full Name", "name", "text", "e.g. Rahul Sharma"], ["Email Address", "email", "email", "e.g. rahul@ampleleap.com"]].map(([l, k, t, p]) => (
          <div key={k} style={{ marginBottom: 14 }}>
            <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#64748b", marginBottom: 4, textTransform: "uppercase", letterSpacing: .5 }}>{l}</label>
            <input type={t} value={form[k]} onChange={e => set(k, e.target.value)} placeholder={p}
              style={{ width: "100%", padding: "9px 12px", borderRadius: 9, border: "1.5px solid #e2e8f0", fontSize: 13, boxSizing: "border-box", outline: "none", background: "white" }}
              onFocus={e => e.target.style.borderColor = "#2563eb"}
              onBlur={e => e.target.style.borderColor = "#e2e8f0"} />
          </div>
        ))}
        <div style={{ marginBottom: 14 }}>
          <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#64748b", marginBottom: 4, textTransform: "uppercase", letterSpacing: .5 }}>Password</label>
          <div style={{ position: "relative" }}>
            <input type={showPass ? "text" : "password"} value={form.password} onChange={e => set("password", e.target.value)} placeholder="Min 6 characters"
              style={{ width: "100%", padding: "9px 36px 9px 12px", borderRadius: 9, border: "1.5px solid #e2e8f0", fontSize: 13, boxSizing: "border-box", outline: "none", background: "white" }}
              onFocus={e => e.target.style.borderColor = "#2563eb"}
              onBlur={e => e.target.style.borderColor = "#e2e8f0"} />
            <button type="button" onClick={() => setShowPass(v => !v)} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#94a3b8", fontSize: 14 }}>
              {showPass ? "🙈" : "👁"}
            </button>
          </div>
          {form.password && form.password.length < 6 && <div style={{ fontSize: 10, color: "#ef4444", marginTop: 3 }}>At least 6 characters required</div>}
        </div>
        <div style={{ marginBottom: 14 }}>
          <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#64748b", marginBottom: 4, textTransform: "uppercase", letterSpacing: .5 }}>Role</label>
          <select value={form.role} onChange={e => set("role", e.target.value)}
            style={{ width: "100%", padding: "9px 12px", borderRadius: 9, border: "1.5px solid #e2e8f0", fontSize: 13, outline: "none", background: "white" }}>
            <option value="admin">🔑 Admin — Full access</option>
            <option value="recruiter">✏️ Recruiter — Add & Edit</option>
            <option value="viewer">👁️ Viewer — Read only</option>
          </select>
        </div>
      </div>
      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
        <button onClick={onClose} style={{ padding: "9px 18px", background: "white", border: "1.5px solid #e2e8f0", borderRadius: 9, fontWeight: 600, cursor: "pointer", fontSize: 13, color: "#374151" }}>Cancel</button>
        <button onClick={() => valid && onAdd(form)} disabled={!valid || saving}
          style={{ padding: "9px 22px", background: valid ? "linear-gradient(135deg,#2563eb,#7c3aed)" : "#e2e8f0", color: valid ? "white" : "#94a3b8", border: "none", borderRadius: 9, fontWeight: 700, cursor: valid ? "pointer" : "not-allowed", fontSize: 13 }}>
          {saving ? "Creating…" : "Create Member"}
        </button>
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
  const [newCode, setNewCode] = useState({ code: "", label: "", color: "#3b82f6" });
  const [savingCode, setSavingCode] = useState(false);
  const [search, setSearch] = useState("");

  const tabs = [
    { k: "clients",          l: "Clients",        icon: "🏢", desc: "Client company names" },
    { k: "owners",           l: "Owners",          icon: "👤", desc: "Recruiter/owner names" },
    { k: "joiningStatus",    l: "Joining Status",  icon: "📋", desc: "Joining stage values" },
    { k: "resignationStatus",l: "Resignation",     icon: "📝", desc: "Resignation status values" },
    { k: "locations",        l: "Locations",       icon: "📍", desc: "Cities and locations" },
    { k: "designations",     l: "Designations",    icon: "💼", desc: "Job titles" },
    { k: "statusCodes",      l: "Status Codes",    icon: "🎨", desc: "Color-coded markers" },
    { k: "users",            l: "Team Members",    icon: "👥", desc: "User management" },
  ];

  const showMsg = (text, type = "success") => {
    setMsg({ text, type });
    setTimeout(() => setMsg({ text: "", type: "success" }), 3000);
  };

  const loadUsers = async () => {
    setLoadingUsers(true);
    try { const u = await api.getUsers(); setUsers(Array.isArray(u) ? u : []); }
    catch (e) { showMsg("Failed to load users", "error"); }
    setLoadingUsers(false);
  };

  useEffect(() => { if (tab === "users") loadUsers(); }, [tab]);

  // ── Master data actions ──────────────────────────────────────────────────
  const addItem = async () => {
    if (!val.trim()) return;
    setSaving(true);
    const r = await api.addMaster(tab, val.trim());
    if (r.error) showMsg(r.error, "error");
    else { showMsg(`✅ "${val.trim()}" added!`); setVal(""); reload(); }
    setSaving(false);
  };

  const deleteItem = async (id, value) => {
    if (!window.confirm(`Delete "${value}" from the list?`)) return;
    const r = await api.deleteMaster(id);
    if (r.error) showMsg(r.error, "error");
    else { showMsg(`🗑️ "${value}" removed`); reload(); }
  };

  const saveEdit = async id => {
    if (!editVal.trim()) return;
    const r = await api.updateMaster(id, editVal);
    if (r.error) showMsg(r.error, "error");
    else { showMsg("✅ Updated!"); setEditId(null); reload(); }
  };

  // ── Status code actions ──────────────────────────────────────────────────
  const addStatusCode = async () => {
    if (!newCode.code || !newCode.label || !newCode.color) { showMsg("All fields required", "error"); return; }
    setSavingCode(true);
    const r = await api.addStatusCode(newCode);
    if (r.error) showMsg(r.error, "error");
    else { showMsg(`✅ Code "${newCode.code}" saved!`); setNewCode({ code: "", label: "", color: "#3b82f6" }); reload(); }
    setSavingCode(false);
  };

  const deleteStatusCode = async code => {
    if (!window.confirm(`Delete status code "${code}"?`)) return;
    const r = await api.deleteStatusCode(code);
    if (r.error) showMsg(r.error, "error");
    else { showMsg(`🗑️ "${code}" deleted!`); reload(); }
  };

  // ── User actions ─────────────────────────────────────────────────────────
  const addUser = async form => {
    setSavingUser(true);
    const r = await api.createUser(form);
    if (r.error) showMsg(r.error, "error");
    else { showMsg(`✅ ${r.name} added to team!`); setShowAddUser(false); loadUsers(); }
    setSavingUser(false);
  };

  const changeRole = async (id, role, name) => {
    const r = await api.updateUser(id, { role });
    if (r.error) showMsg(r.error, "error");
    else { showMsg(`✅ ${name} is now ${role}`); loadUsers(); }
  };

  const toggleUser = async (id, active, name) => {
    const action = active ? "Deactivate" : "Activate";
    if (!window.confirm(`${action} "${name}"?`)) return;
    const r = await api.updateUser(id, { active: !active });
    if (r.error) showMsg(r.error, "error");
    else { showMsg(`✅ "${name}" ${active ? "deactivated" : "activated"}!`); loadUsers(); }
  };

  const deleteUser = async (id, name) => {
    const r = await api.deleteUser(id);
    if (r.error) showMsg(r.error, "error");
    else { showMsg(`🗑️ "${name}" deleted from team`); loadUsers(); }
  };

  const resetPassword = async (id, password) => {
    const r = await api.updateUser(id, { password });
    if (r.error) showMsg(r.error, "error");
    else showMsg("🔑 Password updated!");
  };

  const currentTab = tabs.find(t => t.k === tab);
  const fullItems = (masters._full?.[tab] || []).filter(item =>
    !search || item.value.toLowerCase().includes(search.toLowerCase())
  );
  const activeUsers = users.filter(u => u.active).length;
  const inactiveUsers = users.filter(u => !u.active).length;

  return (
    <div>
      {/* Header */}
      <div style={{ background: "white", borderRadius: 16, padding: "20px 24px", marginBottom: 18, boxShadow: "0 1px 3px rgba(0,0,0,.06)", border: "1px solid #f1f5f9" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 11, background: "linear-gradient(135deg,#7c3aed,#2563eb)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>⚙️</div>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: "#0f172a", margin: 0 }}>Master Data</h2>
            <p style={{ color: "#64748b", margin: 0, fontSize: 12 }}>Manage dropdown values, status codes and team members</p>
          </div>
        </div>
      </div>

      {msg.text && (
        <div style={{ background: msg.type === "error" ? "#fee2e2" : "#dcfce7", color: msg.type === "error" ? "#991b1b" : "#166534", padding: "12px 18px", borderRadius: 10, marginBottom: 16, fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", gap: 8, border: `1px solid ${msg.type === "error" ? "#fecaca" : "#bbf7d0"}` }}>
          {msg.text}
        </div>
      )}

      <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
        {/* Sidebar */}
        <div style={{ width: 210, flexShrink: 0 }}>
          <div style={{ background: "white", borderRadius: 14, overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,.06)", border: "1px solid #f1f5f9" }}>
            {tabs.map((t, i) => (
              <button key={t.k} onClick={() => { setTab(t.k); setSearch(""); }}
                style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", border: "none", background: tab === t.k ? "linear-gradient(135deg,#eff6ff,#f5f3ff)" : "white", cursor: "pointer", fontFamily: "inherit", textAlign: "left", borderLeft: `3px solid ${tab === t.k ? "#2563eb" : "transparent"}`, borderBottom: i < tabs.length - 1 ? "1px solid #f8fafc" : "none", transition: "all .15s" }}>
                <span style={{ fontSize: 16, flexShrink: 0 }}>{t.icon}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: tab === t.k ? 700 : 500, color: tab === t.k ? "#1d4ed8" : "#374151" }}>{t.l}</div>
                  <div style={{ fontSize: 9, color: "#94a3b8", marginTop: 1 }}>
                    {t.k === "users" ? `${activeUsers} active` : `${(masters._full?.[t.k] || []).length} items`}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, minWidth: 0 }}>

          {/* ── STATUS CODES ── */}
          {tab === "statusCodes" && (
            <div>
              <div style={{ background: "white", borderRadius: 14, padding: 22, boxShadow: "0 1px 3px rgba(0,0,0,.06)", border: "1px solid #f1f5f9", marginBottom: 16 }}>
                <h3 style={{ fontSize: 14, fontWeight: 800, color: "#0f172a", margin: "0 0 16px", display: "flex", alignItems: "center", gap: 8 }}>🎨 Add / Edit Status Code</h3>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr auto auto", gap: 10, alignItems: "flex-end" }}>
                  <div>
                    <label style={{ display: "block", fontSize: 10, fontWeight: 700, color: "#64748b", marginBottom: 4, textTransform: "uppercase", letterSpacing: .6 }}>Code Name</label>
                    <input value={newCode.code} onChange={e => setNewCode(n => ({ ...n, code: e.target.value }))} placeholder="e.g. Purple"
                      style={{ width: "100%", padding: "9px 12px", borderRadius: 9, border: "1.5px solid #e2e8f0", fontSize: 13, outline: "none", boxSizing: "border-box", background: "#fafafa" }}
                      onFocus={e => e.target.style.borderColor = "#2563eb"} onBlur={e => e.target.style.borderColor = "#e2e8f0"} />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: 10, fontWeight: 700, color: "#64748b", marginBottom: 4, textTransform: "uppercase", letterSpacing: .6 }}>Description</label>
                    <input value={newCode.label} onChange={e => setNewCode(n => ({ ...n, label: e.target.value }))} placeholder="e.g. High priority follow-up"
                      style={{ width: "100%", padding: "9px 12px", borderRadius: 9, border: "1.5px solid #e2e8f0", fontSize: 13, outline: "none", boxSizing: "border-box", background: "#fafafa" }}
                      onFocus={e => e.target.style.borderColor = "#2563eb"} onBlur={e => e.target.style.borderColor = "#e2e8f0"} />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: 10, fontWeight: 700, color: "#64748b", marginBottom: 4, textTransform: "uppercase", letterSpacing: .6 }}>Color</label>
                    <input type="color" value={newCode.color} onChange={e => setNewCode(n => ({ ...n, color: e.target.value }))}
                      style={{ width: 44, height: 40, borderRadius: 9, border: "1.5px solid #e2e8f0", cursor: "pointer", padding: 3 }} />
                  </div>
                  <button onClick={addStatusCode} disabled={savingCode} style={{ padding: "9px 18px", background: "linear-gradient(135deg,#2563eb,#7c3aed)", color: "white", border: "none", borderRadius: 9, fontWeight: 700, fontSize: 12, cursor: "pointer", whiteSpace: "nowrap", opacity: savingCode ? .7 : 1 }}>
                    {savingCode ? "Saving…" : "💾 Save"}
                  </button>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 12 }}>
                {(masters.statusCodes || []).map(s => (
                  <div key={s.code} style={{ background: "white", borderRadius: 12, padding: "16px 18px", border: `2px solid ${s.color}44`, display: "flex", alignItems: "center", justifyContent: "space-between", transition: "box-shadow .2s" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ width: 40, height: 40, borderRadius: 10, background: s.color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: `0 4px 12px ${s.color}44` }}>
                        <span style={{ color: "white", fontWeight: 900, fontSize: 16 }}>{s.code[0]}</span>
                      </div>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: 14, color: s.color }}>{s.code}</div>
                        <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>{s.label}</div>
                      </div>
                    </div>
                    <button onClick={() => deleteStatusCode(s.code)} style={{ padding: "5px 12px", background: "#fef2f2", color: "#dc2626", borderRadius: 7, fontSize: 11, fontWeight: 700, border: "1px solid #fecaca", cursor: "pointer" }}>🗑️ Delete</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── TEAM MEMBERS ── */}
          {tab === "users" && (
            <div>
              {/* Stats bar */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 16 }}>
                {[
                  { l: "Total Members", v: users.length, c: "#2563eb", bg: "#eff6ff" },
                  { l: "Active", v: activeUsers, c: "#16a34a", bg: "#f0fdf4" },
                  { l: "Inactive", v: inactiveUsers, c: "#dc2626", bg: "#fef2f2" },
                ].map(s => (
                  <div key={s.l} style={{ background: "white", borderRadius: 12, padding: "14px 16px", border: "1px solid #f1f5f9", display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 9, background: s.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 800, color: s.c, flexShrink: 0 }}>{s.v}</div>
                    <div style={{ fontSize: 11, color: "#64748b", fontWeight: 500 }}>{s.l}</div>
                  </div>
                ))}
              </div>

              {/* Add user form */}
              {showAddUser ? (
                <AddUserForm onAdd={addUser} onClose={() => setShowAddUser(false)} saving={savingUser} />
              ) : (
                <button onClick={() => setShowAddUser(true)} style={{ width: "100%", padding: "12px", background: "linear-gradient(135deg,#2563eb,#7c3aed)", color: "white", border: "none", borderRadius: 12, fontWeight: 700, cursor: "pointer", fontSize: 13, marginBottom: 16, boxShadow: "0 4px 12px rgba(37,99,235,.3)", display: "flex", alignItems: "center", justifyContent: "center", gap: 7 }}>
                  ➕ Add New Team Member
                </button>
              )}

              {/* User cards */}
              {loadingUsers ? (
                <div style={{ padding: 40, textAlign: "center" }}><Spin /></div>
              ) : users.length === 0 ? (
                <div style={{ padding: 40, textAlign: "center", color: "#94a3b8" }}>No team members yet. Add your first one above.</div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: 14 }}>
                  {users.map(u => (
                    <UserCard
                      key={u.id} u={u}
                      currentUserId={currentUser?.id}
                      onRoleChange={changeRole}
                      onToggle={toggleUser}
                      onDelete={deleteUser}
                      onResetPassword={resetPassword}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── REGULAR LIST TABS ── */}
          {tab !== "statusCodes" && tab !== "users" && (
            <div>
              <div style={{ background: "white", borderRadius: 14, padding: 22, boxShadow: "0 1px 3px rgba(0,0,0,.06)", border: "1px solid #f1f5f9", marginBottom: 14 }}>
                <div style={{ marginBottom: 14 }}>
                  <h3 style={{ fontSize: 14, fontWeight: 800, color: "#0f172a", margin: "0 0 2px", display: "flex", alignItems: "center", gap: 8 }}>
                    <span>{currentTab?.icon}</span> {currentTab?.l}
                    <span style={{ background: "#eff6ff", color: "#2563eb", borderRadius: 20, padding: "1px 10px", fontSize: 11, fontWeight: 700 }}>{(masters._full?.[tab] || []).length}</span>
                  </h3>
                  <p style={{ margin: 0, fontSize: 12, color: "#64748b" }}>{currentTab?.desc} — used in candidate dropdowns</p>
                </div>
                <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                  <input
                    value={val} onChange={e => setVal(e.target.value)} onKeyDown={e => e.key === "Enter" && addItem()}
                    placeholder={`Add new ${currentTab?.l?.toLowerCase()?.replace(/s$/, "") || "item"}… (press Enter)`}
                    style={{ flex: 1, padding: "9px 14px", borderRadius: 10, border: "1.5px solid #e2e8f0", fontSize: 13, outline: "none", background: "#fafafa", transition: "border .2s" }}
                    onFocus={e => e.target.style.borderColor = "#2563eb"} onBlur={e => e.target.style.borderColor = "#e2e8f0"} />
                  <button onClick={addItem} disabled={saving || !val.trim()} style={{ padding: "9px 20px", background: saving || !val.trim() ? "#e2e8f0" : "linear-gradient(135deg,#2563eb,#7c3aed)", color: saving || !val.trim() ? "#94a3b8" : "white", border: "none", borderRadius: 10, fontWeight: 700, fontSize: 13, cursor: saving || !val.trim() ? "not-allowed" : "pointer" }}>
                    {saving ? "Adding…" : "+ Add"}
                  </button>
                </div>
                {(masters._full?.[tab] || []).length > 5 && (
                  <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#f8fafc", borderRadius: 9, padding: "8px 12px", border: "1.5px solid #e2e8f0" }}>
                    <span style={{ fontSize: 13, color: "#94a3b8" }}>🔍</span>
                    <input value={search} onChange={e => setSearch(e.target.value)} placeholder={`Search ${currentTab?.l?.toLowerCase()}…`}
                      style={{ border: "none", background: "none", outline: "none", fontSize: 12, flex: 1, color: "#374151" }} />
                    {search && <button onClick={() => setSearch("")} style={{ border: "none", background: "none", cursor: "pointer", color: "#94a3b8", fontSize: 14, padding: 0 }}>✕</button>}
                  </div>
                )}
              </div>

              <div style={{ background: "white", borderRadius: 14, boxShadow: "0 1px 3px rgba(0,0,0,.06)", border: "1px solid #f1f5f9", overflow: "hidden" }}>
                {fullItems.length === 0 ? (
                  <div style={{ padding: 50, textAlign: "center" }}>
                    <div style={{ fontSize: 36, marginBottom: 10 }}>{currentTab?.icon}</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", marginBottom: 4 }}>{search ? "No results" : `No ${currentTab?.l?.toLowerCase()} yet`}</div>
                    <div style={{ fontSize: 12, color: "#94a3b8" }}>{search ? "Try a different search" : "Add your first item above"}</div>
                  </div>
                ) : fullItems.map((item, i) => (
                  <div key={item.id}
                    style={{ display: "flex", alignItems: "center", padding: "11px 18px", background: i % 2 ? "#fcfcfd" : "white", borderBottom: "1px solid #f8fafc", transition: "background .1s", gap: 10 }}
                    onMouseEnter={e => e.currentTarget.style.background = "#f0f9ff"}
                    onMouseLeave={e => e.currentTarget.style.background = i % 2 ? "#fcfcfd" : "white"}>
                    {editId === item.id ? (
                      <>
                        <input value={editVal} onChange={e => setEditVal(e.target.value)} onKeyDown={e => { if (e.key === "Enter") saveEdit(item.id); if (e.key === "Escape") setEditId(null); }} autoFocus
                          style={{ flex: 1, padding: "6px 10px", borderRadius: 8, border: "1.5px solid #2563eb", fontSize: 13, outline: "none", background: "#eff6ff" }} />
                        <button onClick={() => saveEdit(item.id)} style={{ padding: "6px 14px", background: "#2563eb", color: "white", borderRadius: 8, fontSize: 12, fontWeight: 700, border: "none", cursor: "pointer" }}>Save</button>
                        <button onClick={() => setEditId(null)} style={{ padding: "6px 12px", background: "#f1f5f9", color: "#374151", borderRadius: 8, fontSize: 12, fontWeight: 600, border: "none", cursor: "pointer" }}>Cancel</button>
                      </>
                    ) : (
                      <>
                        <div style={{ width: 28, height: 28, borderRadius: 7, background: "linear-gradient(135deg,#eff6ff,#f5f3ff)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, flexShrink: 0 }}>{currentTab?.icon}</div>
                        <span style={{ fontSize: 13, color: "#1e293b", fontWeight: 500, flex: 1 }}>{item.value}</span>
                        <div style={{ display: "flex", gap: 6 }}>
                          <button onClick={() => { setEditId(item.id); setEditVal(item.value); }} style={{ padding: "5px 12px", background: "#f0f9ff", color: "#2563eb", borderRadius: 7, fontSize: 11, fontWeight: 700, border: "1px solid #bfdbfe", cursor: "pointer" }}>✏️ Edit</button>
                          <button onClick={() => deleteItem(item.id, item.value)} style={{ padding: "5px 12px", background: "#fef2f2", color: "#dc2626", borderRadius: 7, fontSize: 11, fontWeight: 700, border: "1px solid #fecaca", cursor: "pointer" }}>🗑️ Delete</button>
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
