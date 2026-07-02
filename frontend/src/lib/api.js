import axios from "axios";

// El API vive en el mismo dominio como funciones serverless de Vercel
// (frontend/api). En desarrollo, el dev server proxya /api al puerto 8000.
const envUrl = (process.env.REACT_APP_BACKEND_URL || "").trim().replace(/\/$/, "");

export const BACKEND_ROOT = typeof window !== "undefined" ? window.location.origin : "";

export const API = "/api";

export const api = axios.create({
  baseURL: API,
  timeout: 120000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("tl_admin_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const formatCLP = (value) => {
  const n = Number(value || 0);
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(n);
};

export const resolveImage = (url) => {
  if (!url) return "https://images.unsplash.com/photo-1600294421265-c354b772e790?w=800";
  if (url.startsWith("http")) return url;
  if (typeof window !== "undefined" && url.startsWith("/")) {
    return `${window.location.origin}${url}`;
  }
  const base = envUrl || (typeof window !== "undefined" ? window.location.origin : "");
  return `${base}${url}`;
};

export const formatApiError = (err, fallback) => {
  const d = err?.response?.data?.detail;
  if (typeof d === "string" && d.trim()) return d;
  if (Array.isArray(d)) {
    const msg = d.map((x) => (typeof x === "object" ? x.msg || JSON.stringify(x) : String(x))).join(" · ");
    if (msg) return msg;
  }
  if (err?.message === "Network Error") {
    return "No hay conexión con el servidor. ¿Está el backend en marcha y la URL bien configurada?";
  }
  if (err?.code === "ECONNABORTED" || err?.message?.includes("timeout")) {
    return "La petición tardó demasiado. Revisa que el backend responda (Mongo, API) y vuelve a intentar.";
  }
  const st = err?.response?.status;
  if (st === 504 || st === 502) {
    return (
      "El servidor no respondió a tiempo (504/502). En local: arranca el backend (p. ej. puerto 8000), " +
      "comprueba que Mongo esté accesible y reinicia `npm start`. Si usas un preview en la nube, " +
      "configura `REACT_APP_BACKEND_URL` con la URL pública del API."
    );
  }
  if (st === 503) {
    return "Servicio no disponible (503). El backend puede estar arrancando o en mantenimiento; espera unos segundos e intenta de nuevo.";
  }
  if (st) {
    return `${fallback} (HTTP ${st})`;
  }
  return fallback;
};

export const LOGO_URL = "/trabalengua-logo.png";