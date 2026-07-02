// Persistencia en Vercel Blob. Todo el estado de la tienda vive en dos JSON:
//  - trabalengua/db.json     → stock, precios, overrides de producto y settings
//  - trabalengua/orders.json → pedidos
// En el primer arranque se importan stock y precios desde el Google Sheet
// que usaba la tienda, y desde ahí Vercel Blob es la única fuente.

const { put, list } = require("@vercel/blob");

const DB_PATH = "trabalengua/db.json";
const ORDERS_PATH = "trabalengua/orders.json";

const SHEETS_URL =
  "https://script.google.com/macros/s/AKfycbzLCfNiw7d4ihQ690DQxaGu88HGnoIh4-65O09qbDDzlI2zcBOd2OOmA9Uf3jgJfumq/exec";

const DEFAULT_SETTINGS = {
  hero_image_url: "/images/hero-uniformes.webp",
  bordado_image_url: "/images/bordados.webp",
  bordados_hero_image_url: "/images/bordados.webp",
};

async function readJson(path) {
  const { blobs } = await list({ prefix: path });
  const blob = blobs.find((b) => b.pathname === path);
  if (!blob) return null;
  // Query param único para saltar la caché del CDN de Blob
  const resp = await fetch(`${blob.url}?ts=${Date.now()}`, { cache: "no-store" });
  if (!resp.ok) return null;
  return resp.json();
}

async function writeJson(path, data) {
  await put(path, JSON.stringify(data), {
    access: "public",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "application/json",
  });
}

async function seedFromSheets() {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 20000);
    const resp = await fetch(SHEETS_URL, { signal: controller.signal });
    clearTimeout(timer);
    const json = await resp.json();
    return { stock: json.stock || {}, precios: json.precios || {} };
  } catch {
    return { stock: {}, precios: {} };
  }
}

async function getDb() {
  let db = await readJson(DB_PATH);
  if (!db) {
    const { stock, precios } = await seedFromSheets();
    db = {
      stock,
      precios,
      overrides: {},
      settings: { ...DEFAULT_SETTINGS },
      seeded_at: new Date().toISOString(),
    };
    // Solo persistimos si la importación trajo datos; si el Sheet falló
    // transitoriamente, el próximo request reintenta la semilla.
    if (Object.keys(stock).length > 0) {
      await writeJson(DB_PATH, db);
    }
  }
  db.stock = db.stock || {};
  db.precios = db.precios || {};
  db.overrides = db.overrides || {};
  db.settings = { ...DEFAULT_SETTINGS, ...(db.settings || {}) };
  return db;
}

const saveDb = (db) => writeJson(DB_PATH, db);

async function getOrders() {
  return (await readJson(ORDERS_PATH)) || [];
}

const saveOrders = (orders) => writeJson(ORDERS_PATH, orders);

async function uploadFile(pathname, buffer, contentType) {
  const blob = await put(pathname, buffer, {
    access: "public",
    addRandomSuffix: true,
    contentType: contentType || "application/octet-stream",
  });
  return blob.url;
}

module.exports = { getDb, saveDb, getOrders, saveOrders, uploadFile, DEFAULT_SETTINGS };
