// Autenticación simple del panel admin: credenciales por variables de entorno
// (con los mismos valores por defecto que el backend original) y token HMAC.

const crypto = require("crypto");

const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || "admin@trabalengua.cl").toLowerCase().trim();
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";
const SECRET = process.env.JWT_SECRET || `tl-${ADMIN_PASSWORD}`;

const b64url = (buf) => Buffer.from(buf).toString("base64url");

const sign = (payload) =>
  crypto.createHmac("sha256", SECRET).update(payload).digest("base64url");

function createToken(email) {
  const payload = b64url(JSON.stringify({ sub: email, exp: Date.now() + 7 * 86400000 }));
  return `${payload}.${sign(payload)}`;
}

function verifyToken(token) {
  const [payload, sig] = String(token || "").split(".");
  if (!payload || !sig) return null;
  const expected = sign(payload);
  if (sig.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString());
    if (!data.sub || Date.now() > data.exp) return null;
    return data.sub;
  } catch {
    return null;
  }
}

function checkLogin(email, password) {
  return String(email || "").toLowerCase().trim() === ADMIN_EMAIL && String(password || "") === ADMIN_PASSWORD;
}

// Devuelve el email admin o null (y responde 401) según el header Authorization.
function requireAdmin(req, res) {
  const auth = req.headers.authorization || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
  const email = token && verifyToken(token);
  if (!email) {
    res.status(401).json({ detail: "No autorizado" });
    return null;
  }
  return email;
}

module.exports = { createToken, verifyToken, checkLogin, requireAdmin, ADMIN_EMAIL };
