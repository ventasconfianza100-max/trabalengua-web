// API de Trabalengua como una única función serverless de Vercel.
// Reemplaza al backend FastAPI: los datos viven en Vercel Blob (ver _lib/store.js).

const { SIZES, allProducts, resolveProductRef, buildProduct } = require("./_lib/catalog");
const { getDb, saveDb, getOrders, saveOrders, uploadFile } = require("./_lib/store");
const { createToken, checkLogin, requireAdmin } = require("./_lib/auth");

const DELIVERY_FEE = 4990;
const ORDER_STATUSES = ["pending", "paid", "delivered", "cancelled"];

const uuid = () =>
  "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
  });

const settingsOut = (db) => ({
  hero_image_url: db.settings.hero_image_url,
  bordado_image_url: db.settings.bordado_image_url,
  bordados_hero_image_url: db.settings.bordados_hero_image_url,
});

// --- Stock helpers (mapas {slug: {type_key: {talla: unidades}}}) ---
const getStock = (db, slug, tk, size) => Number(((db.stock[slug] || {})[tk] || {})[size]) || 0;

const setStock = (db, slug, tk, size, value) => {
  db.stock[slug] = db.stock[slug] || {};
  db.stock[slug][tk] = db.stock[slug][tk] || {};
  db.stock[slug][tk][size] = Math.max(0, Math.floor(Number(value) || 0));
};

const setPrice = (db, slug, tk, size, value) => {
  db.precios[slug] = db.precios[slug] || {};
  db.precios[slug][tk] = db.precios[slug][tk] || {};
  db.precios[slug][tk][size] = Math.max(0, Math.floor(Number(value) || 0));
};

const adjustStockForOrder = (db, order, sign) => {
  for (const item of order.items || []) {
    const ref = resolveProductRef(item.product_id);
    if (!ref) continue;
    const cur = getStock(db, ref.school.slug, ref.tpl.type_key, item.size);
    setStock(db, ref.school.slug, ref.tpl.type_key, item.size, cur + sign * item.quantity);
  }
};

// --- Handlers ---
async function createOrder(req, res) {
  const data = req.body || {};
  const items = data.items || [];
  if (!items.length) return res.status(400).json({ detail: "Carrito vacío" });
  if (!["pickup", "delivery"].includes(data.delivery_method || "pickup"))
    return res.status(400).json({ detail: "Método de entrega inválido" });

  const db = await getDb();
  let subtotal = 0;
  const itemsSaved = [];
  for (const item of items) {
    const ref = resolveProductRef(item.product_id || "");
    if (!ref) return res.status(400).json({ detail: `Producto no existe: ${item.product_name}` });
    const { school, tpl } = ref;
    const qty = Math.max(1, Math.floor(Number(item.quantity) || 0));
    const available = getStock(db, school.slug, tpl.type_key, item.size);
    if (available < qty)
      return res.status(400).json({ detail: `Stock insuficiente para ${item.product_name} talla ${item.size} (máx ${available})` });
    const priceMap = (db.precios[school.slug] || {})[tpl.type_key] || {};
    const unitPrice = Number(priceMap[item.size]) || tpl.base_price;
    setStock(db, school.slug, tpl.type_key, item.size, available - qty);
    const itemSubtotal = unitPrice * qty;
    subtotal += itemSubtotal;
    itemsSaved.push({
      product_id: `${school.slug}-${tpl.type_key}`,
      school_name: item.school_name || school.name,
      product_name: item.product_name || tpl.name,
      size: item.size,
      quantity: qty,
      unit_price: unitPrice,
      subtotal: itemSubtotal,
    });
  }

  const deliveryFee = data.delivery_method === "delivery" ? DELIVERY_FEE : 0;
  const order = {
    id: uuid(),
    customer_name: data.customer_name || "",
    whatsapp: data.whatsapp || "",
    email: data.email || "",
    items: itemsSaved,
    subtotal,
    delivery_method: data.delivery_method || "pickup",
    delivery_fee: deliveryFee,
    total: subtotal + deliveryFee,
    status: "pending",
    is_deleted: false,
    created_at: new Date().toISOString(),
  };

  const orders = await getOrders();
  orders.unshift(order);
  await Promise.all([saveDb(db), saveOrders(orders)]);
  return res.status(200).json(order);
}

async function patchProduct(req, res, productId) {
  const ref = resolveProductRef(productId);
  if (!ref) return res.status(404).json({ detail: "Producto no encontrado" });
  const { school, tpl } = ref;
  const data = req.body || {};
  const db = await getDb();

  if (Array.isArray(data.sizes)) {
    for (const s of data.sizes) {
      if (!SIZES.includes(String(s.size))) continue;
      setStock(db, school.slug, tpl.type_key, s.size, s.stock);
      setPrice(db, school.slug, tpl.type_key, s.size, s.price);
    }
  }
  const ov = db.overrides[productId] || {};
  if (data.name !== undefined) {
    const name = String(data.name).trim();
    if (!name) return res.status(400).json({ detail: "Nombre vacío" });
    ov.name = name;
  }
  if (data.base_price !== undefined) ov.base_price = Math.max(0, Number(data.base_price) || 0);
  if (data.image_url !== undefined) ov.image_url = data.image_url;
  db.overrides[productId] = ov;

  await saveDb(db);
  return res.status(200).json(buildProduct(school, tpl, db));
}

async function readUpload(req, res) {
  const body = req.body;
  const buffer = Buffer.isBuffer(body) ? body : body ? Buffer.from(body) : null;
  if (!buffer || !buffer.length) {
    res.status(400).json({ detail: "Archivo vacío" });
    return null;
  }
  const filename = decodeURIComponent(req.headers["x-filename"] || "imagen.jpg");
  const contentType = req.headers["x-file-type"] || "image/jpeg";
  return { buffer, filename, contentType };
}

module.exports = async (req, res) => {
  const url = new URL(req.url, "http://localhost");
  const parts = url.pathname.replace(/^\/api\/?/, "").split("/").filter(Boolean);
  const [p0, p1, p2, p3] = parts;
  const method = req.method;

  try {
    // --- Público ---
    if (p0 === "auth" && p1 === "login" && method === "POST") {
      const { email, password } = req.body || {};
      if (!checkLogin(email, password)) return res.status(401).json({ detail: "Credenciales inválidas" });
      return res.status(200).json({ access_token: createToken(String(email).toLowerCase().trim()), token_type: "bearer" });
    }

    if (p0 === "auth" && p1 === "me" && method === "GET") {
      const email = requireAdmin(req, res);
      if (!email) return;
      return res.status(200).json({ email, role: "admin" });
    }

    if (p0 === "sheets" && method === "GET") {
      const db = await getDb();
      return res.status(200).json({ stock: db.stock, precios: db.precios });
    }

    if (p0 === "settings" && !p1 && method === "GET") {
      const db = await getDb();
      return res.status(200).json(settingsOut(db));
    }

    if (p0 === "products" && p1 && method === "GET") {
      const ref = resolveProductRef(p1);
      if (!ref) return res.status(404).json({ detail: "Producto no encontrado" });
      const db = await getDb();
      return res.status(200).json(buildProduct(ref.school, ref.tpl, db));
    }

    if (p0 === "orders" && !p1 && method === "POST") return createOrder(req, res);

    // --- Admin ---
    if (p0 === "admin") {
      const email = requireAdmin(req, res);
      if (!email) return;

      if (p1 === "products" && !p2 && method === "GET") {
        const db = await getDb();
        return res.status(200).json(allProducts(db));
      }

      if (p1 === "products" && p2 && !p3 && method === "PATCH") return patchProduct(req, res, p2);

      if (p1 === "products" && p2 && p3 === "image" && method === "POST") {
        const ref = resolveProductRef(p2);
        if (!ref) return res.status(404).json({ detail: "Producto no encontrado" });
        const up = await readUpload(req, res);
        if (!up) return;
        const imageUrl = await uploadFile(`trabalengua/products/${p2}/${up.filename}`, up.buffer, up.contentType);
        const db = await getDb();
        db.overrides[p2] = { ...(db.overrides[p2] || {}), image_url: imageUrl };
        await saveDb(db);
        return res.status(200).json(buildProduct(ref.school, ref.tpl, db));
      }

      if (p1 === "orders" && !p2 && method === "GET") {
        const trash = url.searchParams.get("trash") === "true";
        const orders = await getOrders();
        return res.status(200).json(orders.filter((o) => Boolean(o.is_deleted) === trash));
      }

      if (p1 === "orders" && p2 && !p3 && method === "PATCH") {
        const { status } = req.body || {};
        if (!ORDER_STATUSES.includes(status)) return res.status(400).json({ detail: "Estado inválido" });
        const orders = await getOrders();
        const order = orders.find((o) => o.id === p2);
        if (!order) return res.status(404).json({ detail: "Pedido no encontrado" });

        const wasRestored = Boolean(order.is_stock_restored);
        const willBeCancelled = status === "cancelled";
        if (!wasRestored && willBeCancelled) {
          const db = await getDb();
          adjustStockForOrder(db, order, +1);
          await saveDb(db);
          order.is_stock_restored = true;
        } else if (wasRestored && !willBeCancelled) {
          const db = await getDb();
          adjustStockForOrder(db, order, -1);
          await saveDb(db);
          order.is_stock_restored = false;
        }
        order.status = status;
        await saveOrders(orders);
        return res.status(200).json(order);
      }

      if (p1 === "orders" && p2 && p3 === "restore" && method === "POST") {
        const orders = await getOrders();
        const order = orders.find((o) => o.id === p2);
        if (!order) return res.status(404).json({ detail: "Pedido no encontrado" });
        order.is_deleted = false;
        await saveOrders(orders);
        return res.status(200).json({ ok: true });
      }

      if (p1 === "orders" && p2 && p3 === "permanent" && method === "DELETE") {
        const orders = await getOrders();
        const next = orders.filter((o) => o.id !== p2);
        if (next.length === orders.length) return res.status(404).json({ detail: "Pedido no encontrado" });
        await saveOrders(next);
        return res.status(200).json({ ok: true });
      }

      if (p1 === "orders" && p2 && !p3 && method === "DELETE") {
        const orders = await getOrders();
        const order = orders.find((o) => o.id === p2);
        if (!order) return res.status(404).json({ detail: "Pedido no encontrado" });
        order.is_deleted = true;
        await saveOrders(orders);
        return res.status(200).json({ ok: true });
      }

      if (p1 === "settings" && !p2 && method === "PATCH") {
        const data = req.body || {};
        const db = await getDb();
        for (const field of ["hero_image_url", "bordado_image_url", "bordados_hero_image_url"]) {
          if (data[field] !== undefined) db.settings[field] = data[field];
        }
        await saveDb(db);
        return res.status(200).json(settingsOut(db));
      }

      const settingsImageField = {
        "hero-image": "hero_image_url",
        "bordado-image": "bordado_image_url",
        "bordados-hero-image": "bordados_hero_image_url",
      }[p2];
      if (p1 === "settings" && settingsImageField && method === "POST") {
        const up = await readUpload(req, res);
        if (!up) return;
        const imageUrl = await uploadFile(`trabalengua/settings/${p2}-${up.filename}`, up.buffer, up.contentType);
        const db = await getDb();
        db.settings[settingsImageField] = imageUrl;
        await saveDb(db);
        return res.status(200).json(settingsOut(db));
      }
    }

    return res.status(404).json({ detail: "Ruta no encontrada" });
  } catch (err) {
    console.error("API error:", err);
    return res.status(500).json({ detail: err.message || "Error interno" });
  }
};
