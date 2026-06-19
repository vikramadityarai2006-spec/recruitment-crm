export const STATUS_COLOR = {
  Joined:"#22c55e", joined:"#22c55e", Offered:"#f97316", offered:"#f97316",
  Backout:"#ef4444", Left:"#8b5cf6", Rejected:"#dc2626", Hold:"#eab308", Cancelled:"#6b7280"
};
export const STATUS_BG = {
  Joined:"#dcfce7", joined:"#dcfce7", Offered:"#ffedd5", offered:"#ffedd5",
  Backout:"#fee2e2", Left:"#ede9fe", Rejected:"#fee2e2", Hold:"#fef9c3", Cancelled:"#f3f4f6"
};
export const CODE_COLORS = {
  Red:"#ef4444", RED:"#ef4444", red:"#ef4444",
  Orange:"#f97316", orange:"#f97316",
  Brown:"#92400e", Yellow:"#eab308",
  Green:"#22c55e", GREEN:"#22c55e", green:"#22c55e",
  Blue:"#3b82f6"
};

export const fmt = n => n?.toLocaleString("en-IN") ?? "—";
export const fmtD = d => {
  if (!d) return "—";
  try { return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }); }
  catch { return d; }
};

// Clean a phone number to digits only, prefix with 91 if it's a 10-digit Indian number
export const cleanPhone = (phone) => {
  if (!phone) return "";
  const digits = String(phone).replace(/\D/g, "");
  if (digits.length === 10) return "91" + digits;
  return digits;
};

export const waLink = (phone, message = "") => {
  const num = cleanPhone(phone);
  if (!num) return null;
  const text = message ? `?text=${encodeURIComponent(message)}` : "";
  return `https://wa.me/${num}${text}`;
};

export const mailLink = (email, subject = "", body = "") => {
  if (!email) return null;
  const params = [];
  if (subject) params.push(`subject=${encodeURIComponent(subject)}`);
  if (body) params.push(`body=${encodeURIComponent(body)}`);
  return `mailto:${email}${params.length ? "?" + params.join("&") : ""}`;
};

export const daysUntil = (date) => {
  if (!date) return null;
  const diff = new Date(date) - new Date();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

