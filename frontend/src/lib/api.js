import axios from "axios";

const envUrl = (process.env.REACT_APP_BACKEND_URL || "").trim().replace(/\/$/, "");
const isDev = process.env.NODE_ENV === "development";
const isLocalHost =
  typeof window !== "undefined" &&
  (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");

/** Sin REACT_APP_BACKEND_URL en dev local: mismo origen + proxy (ver craco.config.js) → evita `undefined/api` y CORS. */
const useRelativeApi = isDev && isLocalHost && !envUrl;

export const BACKEND_ROOT = useRelativeApi
  ? typeof window !== "undefined"
    ? window.location.origin
    : ""
  : envUrl || (typeof window !== "undefined" ? window.location.origin : "");

export const API = useRelativeApi ? "/api" : `${envUrl || (typeof window !== "undefined" ? window.location.origin : "")}/api`;

export const api = axios.create({
  baseURL: API,
  timeout: 120000,
});

// Attach token on each request if present
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

/** Mensaje legible para toasts cuando falla axios (red, 4xx, 5xx, validación). */
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

export const LOGO_URL =
  "https://customer-assets.emergentagent.com/job_943ebc25-bc5f-4d6e-b906-83667be0dcb5/artifacts/akmnrxla_logo%20trabalengua.png";
