import axios from "axios";

const envUrl = (process.env.REACT_APP_BACKEND_URL || "").trim().replace(/\/$/, "");
const cloudinaryCloudName = (process.env.REACT_APP_CLOUDINARY_CLOUD_NAME || "").trim();
const publicSiteUrl = (process.env.REACT_APP_PUBLIC_SITE_URL || "").trim().replace(/\/$/, "");
const isDev = process.env.NODE_ENV === "development";
const isLocalHost =
  typeof window !== "undefined" &&
  (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");

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

const getRuntimeOrigin = () => (typeof window !== "undefined" ? window.location.origin : "");

const getAbsoluteImageUrl = (url) => {
  if (url.startsWith("http")) return url;
  if (url.startsWith("/")) {
    const origin = publicSiteUrl || (isLocalHost ? "" : getRuntimeOrigin());
    return origin ? `${origin}${url}` : url;
  }
  const base = envUrl || publicSiteUrl || getRuntimeOrigin();
  return `${base}${url.startsWith("/") ? "" : "/"}${url}`;
};

export const resolveImage = (url, options = {}) => {
  const fallback = "https://images.unsplash.com/photo-1600294421265-c354b772e790?w=800";
  const source = url || fallback;
  const absoluteUrl = getAbsoluteImageUrl(source);

  if (cloudinaryCloudName && absoluteUrl.startsWith("http")) {
    const width = Number(options.width || 900);
    const crop = options.crop || "limit";
    const quality = options.quality || "auto";
    const transforms = [`f_auto`, `q_${quality}`, `c_${crop}`, `w_${width}`, "dpr_auto"].join(",");

    return `https://res.cloudinary.com/${cloudinaryCloudName}/image/fetch/${transforms}/${encodeURIComponent(absoluteUrl)}`;
  }

  if (source.startsWith("http")) return source;
  if (typeof window !== "undefined" && source.startsWith("/")) {
    return `${window.location.origin}${source}`;
  }
  return absoluteUrl;
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
