const BASE_URL = "https://crm-api-iota-two.vercel.app/api";
const getToken = () => localStorage.getItem("crm_token");
export const H = () => ({
  "Content-Type": "application/json",
  ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
});

export const api = {
  login: (e, p) => fetch(`${BASE_URL}/auth/login`, { method: "POST", headers: H(), body: JSON.stringify({ email: e, password: p }) }).then(r => r.json()),
  getCandidates: (p = {}) => fetch(`${BASE_URL}/candidates?${new URLSearchParams(p)}`, { headers: H() }).then(r => r.json()),
  createCandidate: (d) => fetch(`${BASE_URL}/candidates`, { method: "POST", headers: H(), body: JSON.stringify(d) }).then(r => r.json()),
  updateCandidate: (id, d) => fetch(`${BASE_URL}/candidates/${id}`, { method: "PUT", headers: H(), body: JSON.stringify(d) }).then(r => r.json()),
  deleteCandidate: (id) => fetch(`${BASE_URL}/candidates/delete`, { method: "POST", headers: H(), body: JSON.stringify({ id }) }).then(r => r.json()),
  getMasters: () => fetch(`${BASE_URL}/masters`, { headers: H() }).then(r => r.json()),
  addMaster: (category, value) => fetch(`${BASE_URL}/masters`, { method: "POST", headers: H(), body: JSON.stringify({ category, value }) }).then(r => r.json()),
  updateMaster: (id, value) => fetch(`${BASE_URL}/masters/${id}`, { method: "PUT", headers: H(), body: JSON.stringify({ value }) }).then(r => r.json()),
  deleteMaster: (id) => fetch(`${BASE_URL}/masters/${id}`, { method: "DELETE", headers: H() }).then(r => r.json()),
  getDashboard: () => fetch(`${BASE_URL}/dashboard`, { headers: H() }).then(r => r.json()),
  getAudit: () => fetch(`${BASE_URL}/audit`, { headers: H() }).then(r => r.json()),
  getUsers: () => fetch(`${BASE_URL}/users`, { headers: H() }).then(r => r.json()),
  createUser: (d) => fetch(`${BASE_URL}/users`, { method: "POST", headers: H(), body: JSON.stringify(d) }).then(r => r.json()),
  updateUser: (id, d) => fetch(`${BASE_URL}/users/${id}`, { method: "PUT", headers: H(), body: JSON.stringify(d) }).then(r => r.json()),
  addStatusCode: (d) => fetch(`${BASE_URL}/masters/status-codes`, { method: "POST", headers: H(), body: JSON.stringify(d) }).then(r => r.json()),
  deleteStatusCode: (code) => fetch(`${BASE_URL}/masters/status-codes`, { method: "DELETE", headers: H(), body: JSON.stringify({ code }) }).then(r => r.json()),
};

export const BASE = BASE_URL;
