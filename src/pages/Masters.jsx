import { useState, useEffect } from "react";
import { api } from "../api";
import { Spin } from "../components/UI";

export default function Masters({ masters, reload }) {
  const [tab, setTab] = useState("clients");
  const [val, setVal] = useState("");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ text: "", type: "success" });
  const [editId, setEditId] = useState(null);
  const [editVal, setEditVal] = useState("");
  const [showUserForm, setShowUserForm] = useState(false);
  const [newUser, setNewUser] = useState({ name: "", email: "", password: "", role: "recruiter" });
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [newCode, setNewCode] = useState({ code: "", label: "", color: "#3b82f6" });
  const [savingCode, setSavingCode] = useState(false);

  const tabs = [
    { k: "clients", l: "🏢 Clients" },
    { k: "owners", l: "👤 Owners" },
    { k: "joiningStatus", l: "📋 Joining Status" },
    { k: "resignationStatus", l: "📝 Resignation" },
    { k: "locations", l: "📍 Locations" },
    { k: "designations", l: "💼 Designations" },
    { k: "statusCodes", l: "🎨 Status Codes" },
    { k: "users", l: "👥 Team Members" },
  ];

  const showMsg = (text, type = "success") => {
    setMsg({ text, type });
    setTimeout(() => setMsg({ text: "", type: "success" }), 3000);
  };

  const loadUsers = async () => {
    setLoadingUsers(true);
    try { setUsers(await api.getUsers()); }
    catch (e) { console.error(e); }
    setLoadingUsers(false);
  };

  useEffect(() => { if (tab === "users") loadUsers(); }, [tab]);

  const addItem = async () => {
    if (!val.trim()) return;
    setSaving(true);
    try {
      const r = await api.addMaster(tab, val.trim());
      if (r.error) showMsg(r.error, "error");
      else { showMsg(`✅ "${val.trim()}" added successfully!`); setVal(""); reload(); }
    } catch (e) { showMsg(e.message, "error"); }
    setSaving(false);
  };

  const deleteItem = async (id, value) => {
    if (!window.confirm(`Delete "${value}"? This cannot be undone.`)) return;
    try {
      const r = await api.deleteMaster(id);
      if (r.error) showMsg(r.error, "error");
      else { showMsg(`🗑️ "${value}" deleted!`); reload(); }
    } catch (e) { showMsg(e.message, "error"); }
  };

  const saveEdit = async (id) => {
    if (!editVal.trim()) return;
    try {
      const r = await api.updateMaster(id, editVal);
      if (r.error) showMsg(r.error, "error");
      else { showMsg("✅ Updated successfully!"); setEditId(null); reload(); }
    } catch (e) { showMsg(e.message, "error"); }
  };

  const addUser = async () => {
    if (!newUser.name || !newUser.email || !newUser.password) { showMsg("All fields required", "error"); return; }
    setSaving(true);
    try {
      const r = await api.createUser(newUser);
      if (r.error) showMsg(r.error, "error");
      else { showMsg(`✅ User "${newUser.name}" created!`); setNewUser({ name: "", email: "", password: "", role: "recruiter" }); setShowUserForm(false); loadUsers(); }
    } catch (e) { showMsg(e.message, "error"); }
    setSaving(false);
  };

  const toggleUser = async (id, active, name) => {
    if (!window.confirm(`${active ? "Deactivate" : "Activate"} "${name}"?`)) return;
    try {
      const r = await api.updateUser(id, { active: !active });
      if (r.error) showMsg(r.error, "error");
      else { showMsg(`✅ "${name}" ${active ? "deactivated" : "activated"}!`); loadUsers(); }
    } catch (e) { showMsg(e.message, "error"); }
  };

  const changeRole = async (id, role, name) => {
    try {
      const r = await api.updateUser(id, { role });
      if (r.error) showMsg(r.error, "error");
      else { showMsg(`✅ ${name}'s role → ${role}!`); loadUsers(); }
    } catch (e) { showMsg(e.message, "error"); }
  };

  const addStatusCode = async () => {
    if (!newCode.code || !newCode.label || !newCode.color) { showMsg("All fields required", "error"); return; }
    setSavingCode(true);
    try {
      const r = await api.addStatusCode(newCode);
      if (r.error) showMsg(r.error, "error");
      else { showMsg(`✅ Status code "${newCode.code}" saved!`); setNewCode({ code: "", label: "", color: "#3b82f6" }); reload(); }
    } catch (e) { showMsg(e.message, "error"); }
    setSavingCode(false);
  };

  const deleteStatusCode = async (code) => {
    if (!window.confirm(`Delete status code "${code}"?`)) return;
    try {
      const r = await api.deleteStatusCode(code);
      if (r.error) showMsg(r.error, "error");
      else { showMsg(`🗑️ "${code}" deleted!`); reload(); }
    } catch (e) { showMsg(e.message, "error"); }
  };

  const fullItems = masters._full?.[tab] || [];
  const isStatusCodes = tab === "statusCodes";
  const isUsers = tab === "users";

  const Btn = ({ onClick, disabled, style, children }) => (
    <button onClick={onClick} disabled={disabled} style={{ cursor: disabled ? "not-allowed" : "pointer", border: "none", fontFamily: "inherit", opacity: disabled ? .7 : 1, ...style }}>{children}</button>
  );

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: "#0f172a", margin: 0 }}>Master Data</h2>
        <p style={{ color: "#64748b", margin: "3px 0 0", fontSize: 13 }}>Manage all dropdown values, status codes and team members.</p>
      </div>

      {msg.text && (
        <div style={{ background: msg.type === "error" ? "#fee2e2" : "#dcfce7", color: msg.type === "error" ? "#991b1b" : "#166534", padding: "10px 16px", borderRadius: 8, marginBottom: 16, fontSize: 13, fontWeight: 600 }}>
          {msg.text}
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: "flex", gap: 5, marginBottom: 20, flexWrap: "wrap" }}>
        {tabs.map(t => (
          <Btn key={t.k} onClick={() => setTab(t.k)} style={{ padding: "7px 13px", borderRadius: 7, background: tab === t.k ? "#2563eb" : "white", color: tab === t.k ? "white" : "#374151", fontWeight: 600, fontSize: 12, border: `1.5px solid ${tab === t.k ? "#2563eb" : "#e2e8f0"}` }}>{t.l}</Btn>
        ))}
      </div>

      {/* STATUS CODES */}
      {isStatusCodes && (
        <div>
          <div style={{ background: "white", borderRadius: 12, padding: 20, boxShadow: "0 1px 3px rgba(0,0,0,.06)", border: "1px solid #f1f5f9", marginBottom: 16 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", margin: "0 0 14px" }}>Add / Edit Status Code</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr auto auto", gap: 8, alignItems: "flex-end" }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: "#475569", display: "block", marginBottom: 3, textTransform: "uppercase" }}>Code Name</label>
                <input value={newCode.code} onChange={e => setNewCode(n => ({ ...n, code: e.target.value }))} placeholder="e.g. Purple" style={{ width: "100%", padding: "8px 10px", borderRadius: 7, border: "1.5px solid #e2e8f0", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: "#475569", display: "block", marginBottom: 3, textTransform: "uppercase" }}>Label / Description</label>
                <input value={newCode.label} onChange={e => setNewCode(n => ({ ...n, label: e.target.value }))} placeholder="e.g. Special Case - Follow up needed" style={{ width: "100%", padding: "8px 10px", borderRadius: 7, border: "1.5px solid #e2e8f0", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: "#475569", display: "block", marginBottom: 3, textTransform: "uppercase" }}>Color</label>
                <input type="color" value={newCode.color} onChange={e => setNewCode(n => ({ ...n, color: e.target.value }))} style={{ width: 44, height: 36, borderRadius: 7, border: "1.5px solid #e2e8f0", cursor: "pointer", padding: 2 }} />
              </div>
              <Btn onClick={addStatusCode} disabled={savingCode} style={{ padding: "8px 14px", background: "#2563eb", color: "white", borderRadius: 7, fontWeight: 700, fontSize: 12, whiteSpace: "nowrap" }}>
                {savingCode ? "Saving…" : "💾 Save"}
              </Btn>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: 10 }}>
            {(masters.statusCodes || []).map(s => (
              <div key={s.code} style={{ background: "white", borderRadius: 10, padding: "14px 16px", border: `2px solid ${s.color}44`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 18, height: 18, borderRadius: "50%", background: s.color, flexShrink: 0, boxShadow: `0 0 8px ${s.color}66` }} />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 13, color: s.color }}>{s.code}</div>
                    <div style={{ fontSize: 11, color: "#64748b", marginTop: 1 }}>{s.label}</div>
                  </div>
                </div>
                <Btn onClick={() => deleteStatusCode(s.code)} style={{ padding: "5px 10px", background: "#fef2f2", color: "#dc2626", borderRadius: 6, fontSize: 11, fontWeight: 600 }}>Delete</Btn>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* USERS */}
      {isUsers && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", margin: 0 }}>Team Members ({users.length})</h3>
            <Btn onClick={() => setShowUserForm(f => !f)} style={{ padding: "8px 14px", background: "linear-gradient(135deg,#2563eb,#7c3aed)", color: "white", borderRadius: 8, fontWeight: 600, fontSize: 12 }}>
              + Add Team Member
            </Btn>
          </div>

          {showUserForm && (
            <div style={{ background: "white", borderRadius: 12, padding: 20, boxShadow: "0 1px 3px rgba(0,0,0,.06)", border: "1px solid #f1f5f9", marginBottom: 16 }}>
              <h4 style={{ margin: "0 0 14px", fontSize: 13, fontWeight: 700, color: "#0f172a" }}>New Team Member</h4>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 12px" }}>
                {[["Full Name", "name", "text", "e.g. Rahul Sharma"], ["Email Address", "email", "email", "e.g. rahul@ampleleap.com"], ["Password", "password", "password", "Minimum 6 characters"]].map(([l, k, t, p]) => (
                  <div key={k} style={{ marginBottom: 12 }}>
                    <label style={{ fontSize: 11, fontWeight: 600, color: "#475569", display: "block", marginBottom: 3, textTransform: "uppercase" }}>{l}</label>
                    <input type={t} value={newUser[k]} onChange={e => setNewUser(u => ({ ...u, [k]: e.target.value }))} placeholder={p} style={{ width: "100%", padding: "8px 10px", borderRadius: 7, border: "1.5px solid #e2e8f0", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
                  </div>
                ))}
                <div style={{ marginBottom: 12 }}>
                  <label style={{ fontSize: 11, fontWeight: 600, color: "#475569", display: "block", marginBottom: 3, textTransform: "uppercase" }}>Role</label>
                  <select value={newUser.role} onChange={e => setNewUser(u => ({ ...u, role: e.target.value }))} style={{ width: "100%", padding: "8px 10px", borderRadius: 7, border: "1.5px solid #e2e8f0", fontSize: 13, outline: "none", background: "white" }}>
                    <option value="admin">Admin — Full access</option>
                    <option value="recruiter">Recruiter — Add/Edit only</option>
                    <option value="viewer">Viewer — Read only</option>
                  </select>
                </div>
              </div>
              <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                <Btn onClick={() => setShowUserForm(false)} style={{ padding: "8px 16px", background: "#f1f5f9", color: "#374151", borderRadius: 7, fontWeight: 600, fontSize: 12 }}>Cancel</Btn>
                <Btn onClick={addUser} disabled={saving} style={{ padding: "8px 16px", background: "linear-gradient(135deg,#2563eb,#7c3aed)", color: "white", borderRadius: 7, fontWeight: 600, fontSize: 12 }}>
                  {saving ? "Creating…" : "Create User"}
                </Btn>
              </div>
            </div>
          )}

          {loadingUsers ? <div style={{ padding: 30, textAlign: "center" }}><Spin /></div> : (
            <div style={{ background: "white", borderRadius: 12, overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,.06)", border: "1px solid #f1f5f9" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ background: "#f8fafc", borderBottom: "1.5px solid #e2e8f0" }}>
                    {["Name", "Email", "Role", "Status", "Actions"].map(h => (
                      <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: .4 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {users.map((u, i) => (
                    <tr key={u.id} style={{ borderBottom: "1px solid #f8fafc", background: i % 2 ? "#fcfcfd" : "white" }}>
                      <td style={{ padding: "10px 14px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <div style={{ width: 30, height: 30, borderRadius: 8, background: "linear-gradient(135deg,#2563eb,#7c3aed)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, color: "white", flexShrink: 0 }}>{u.name[0]}</div>
                          <span style={{ fontWeight: 600, color: "#0f172a" }}>{u.name}</span>
                        </div>
                      </td>
                      <td style={{ padding: "10px 14px", color: "#64748b" }}>{u.email}</td>
                      <td style={{ padding: "10px 14px" }}>
                        <select value={u.role} onChange={e => changeRole(u.id, e.target.value, u.name)} style={{ padding: "4px 8px", borderRadius: 6, border: "1.5px solid #e2e8f0", fontSize: 12, background: "white", outline: "none", cursor: "pointer" }}>
                          <option value="admin">Admin</option>
                          <option value="recruiter">Recruiter</option>
                          <option value="viewer">Viewer</option>
                        </select>
                      </td>
                      <td style={{ padding: "10px 14px" }}>
                        <span style={{ padding: "3px 9px", borderRadius: 10, fontSize: 11, fontWeight: 600, background: u.active ? "#dcfce7" : "#fee2e2", color: u.active ? "#16a34a" : "#dc2626" }}>
                          {u.active ? "✅ Active" : "❌ Inactive"}
                        </span>
                      </td>
                      <td style={{ padding: "10px 14px" }}>
                        <Btn onClick={() => toggleUser(u.id, u.active, u.name)} style={{ padding: "5px 12px", background: u.active ? "#fef2f2" : "#f0fdf4", color: u.active ? "#dc2626" : "#16a34a", borderRadius: 6, fontSize: 11, fontWeight: 600 }}>
                          {u.active ? "Deactivate" : "Activate"}
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

      {/* REGULAR LIST TABS */}
      {!isStatusCodes && !isUsers && (
        <div style={{ background: "white", borderRadius: 12, padding: 20, boxShadow: "0 1px 3px rgba(0,0,0,.06)", border: "1px solid #f1f5f9", maxWidth: 560 }}>
          <div style={{ display: "flex", gap: 7, marginBottom: 16 }}>
            <input value={val} onChange={e => setVal(e.target.value)} onKeyDown={e => e.key === "Enter" && addItem()}
              placeholder={`Add new ${tabs.find(t => t.k === tab)?.l?.replace(/^[^\s]+ /, "")?.replace(/s$/, "") || "item"}…`}
              style={{ flex: 1, padding: "8px 12px", borderRadius: 7, border: "1.5px solid #e2e8f0", fontSize: 13, outline: "none" }} />
            <Btn onClick={addItem} disabled={saving} style={{ padding: "8px 14px", background: "#2563eb", color: "white", borderRadius: 7, fontWeight: 700, fontSize: 12, display: "flex", alignItems: "center", gap: 4 }}>
              + {saving ? "Adding…" : "Add"}
            </Btn>
          </div>
          <div style={{ maxHeight: 450, overflow: "auto" }}>
            {fullItems.length === 0 && <div style={{ textAlign: "center", color: "#94a3b8", padding: 24, fontSize: 13 }}>No items yet. Add one above!</div>}
            {fullItems.map((item, i) => (
              <div key={item.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "9px 12px", background: i % 2 ? "#f8fafc" : "white", borderRadius: 7, marginBottom: 4, border: "1px solid #f1f5f9" }}>
                {editId === item.id ? (
                  <div style={{ display: "flex", gap: 6, flex: 1 }}>
                    <input value={editVal} onChange={e => setEditVal(e.target.value)} onKeyDown={e => e.key === "Enter" && saveEdit(item.id)} autoFocus
                      style={{ flex: 1, padding: "5px 8px", borderRadius: 6, border: "1.5px solid #2563eb", fontSize: 13, outline: "none" }} />
                    <Btn onClick={() => saveEdit(item.id)} style={{ padding: "5px 10px", background: "#2563eb", color: "white", borderRadius: 6, fontSize: 11, fontWeight: 700 }}>Save</Btn>
                    <Btn onClick={() => setEditId(null)} style={{ padding: "5px 10px", background: "#f1f5f9", color: "#374151", borderRadius: 6, fontSize: 11, fontWeight: 600 }}>Cancel</Btn>
                  </div>
                ) : (
                  <>
                    <span style={{ fontSize: 13, color: "#1e293b", fontWeight: 500, flex: 1 }}>{item.value}</span>
                    <div style={{ display: "flex", gap: 5 }}>
                      <Btn onClick={() => { setEditId(item.id); setEditVal(item.value); }} style={{ padding: "4px 10px", background: "#f0f9ff", color: "#2563eb", borderRadius: 6, fontSize: 11, fontWeight: 600 }}>✏️ Edit</Btn>
                      <Btn onClick={() => deleteItem(item.id, item.value)} style={{ padding: "4px 10px", background: "#fef2f2", color: "#dc2626", borderRadius: 6, fontSize: 11, fontWeight: 600 }}>🗑️ Delete</Btn>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
