// Catálogo base: mismas plantillas que usa la tienda (SchoolPage.jsx).
// El stock y los precios por talla viven en Vercel Blob (ver store.js).

const SIZES = ["4", "6", "8", "10", "12", "14", "16", "S", "M", "L", "XL"];

const SCHOOLS = [
  { slug: "colegio-talca", name: "Colegio Talca", description: "Nuestro colegio principal. Uniformes con calidad y detalle." },
  { slug: "colegio-concepcion", name: "Colegio Concepción", description: "Uniformes oficiales del Colegio Concepción." },
  { slug: "colegio-baltazar", name: "Colegio Baltazar", description: "Uniformes oficiales del Colegio Baltazar." },
  { slug: "colegio-montessori", name: "Colegio Montessori", description: "Uniformes oficiales del Colegio Montessori." },
  { slug: "escuela-carlos-spano", name: "Escuela Carlos Spano", description: "Uniformes oficiales de la Escuela Carlos Spano." },
  { slug: "escuela-amancay", name: "Escuela Amancay", description: "Cotonas y delantales para Escuela Amancay." },
];

const TEMPLATES = [
  { type_key: "buzo_completo", name: "Buzo Completo", base_price: 32000, image_file: "buzo-completo.webp" },
  { type_key: "pantalon_buzo", name: "Pantalón de Buzo", base_price: 18000, image_file: "pantalon.webp" },
  { type_key: "polera_buzo", name: "Polerón de buzo", base_price: 19000, image_file: "buzo.webp" },
  {
    type_key: "polera_corta", name: "Polera manga corta", base_price: 10500, image_file: "polera-corta.webp",
    image_files_by_school: {
      "colegio-concepcion": "polera-corta.webp",
      "colegio-talca": "polera.webp",
      "colegio-montessori": "polera-corta.webp",
    },
  },
  { type_key: "polera_larga", name: "Polera manga larga", base_price: 12000, image_file: "polera-manga-larga.webp" },
  { type_key: "polar", name: "Polar", base_price: 21000, image_file: "polar.webp" },
  { type_key: "delantal_cotona", name: "Delantales", base_price: 13990, image_file: "delantal.webp" },
  { type_key: "cotonas", name: "Cotonas", base_price: 12990, image_file: "cotona.webp" },
];

const AMANCAY_TEMPLATES = [
  { type_key: "cotonas_delantales", name: "Cotonas y delantales", base_price: 13990, image_file: "cotonas-delantales.webp" },
];

const TYPE_KEYS = Array.from(new Set([...TEMPLATES, ...AMANCAY_TEMPLATES].map((t) => t.type_key)));

const templatesFor = (slug) => (slug === "escuela-amancay" ? AMANCAY_TEMPLATES : TEMPLATES);

const buildProduct = (school, tpl, db) => {
  const sizeStock = (db.stock[school.slug] || {})[tpl.type_key] || {};
  const sizePrecios = (db.precios[school.slug] || {})[tpl.type_key] || {};
  const id = `${school.slug}-${tpl.type_key}`;
  const ov = (db.overrides || {})[id] || {};
  const sizes = SIZES.map((size) => ({
    size,
    stock: Number(sizeStock[size]) || 0,
    price: Number(sizePrecios[size]) || tpl.base_price,
  }));
  const prices = sizes.map((s) => s.price).filter((p) => p > 0);
  const imageFile = (tpl.image_files_by_school && tpl.image_files_by_school[school.slug]) || tpl.image_file;
  return {
    id,
    school_id: school.slug,
    school_slug: school.slug,
    school_name: school.name,
    type_key: tpl.type_key,
    name: ov.name || tpl.name,
    image_url: ov.image_url || `/images/productos/${school.slug}/${imageFile}`,
    base_price: Number(ov.base_price) || (prices.length ? Math.min(...prices) : tpl.base_price),
    sizes,
  };
};

// Productos visibles por colegio: los que tienen entrada de stock (igual que la
// tienda). Amancay muestra siempre su plantilla única.
const productsForSchool = (school, db) => {
  const schoolStock = db.stock[school.slug] || {};
  const templates =
    school.slug === "escuela-amancay"
      ? AMANCAY_TEMPLATES
      : TEMPLATES.filter((t) => schoolStock[t.type_key] !== undefined);
  return templates.map((t) => buildProduct(school, t, db));
};

const allProducts = (db) => SCHOOLS.flatMap((s) => productsForSchool(s, db));

// product_id con forma "{slug}-{type_key}"
const resolveProductRef = (productId) => {
  const keys = [...TYPE_KEYS].sort((a, b) => b.length - a.length);
  for (const tk of keys) {
    const suffix = `-${tk}`;
    if (!productId.endsWith(suffix)) continue;
    const slug = productId.slice(0, -suffix.length);
    const school = SCHOOLS.find((s) => s.slug === slug);
    if (!school) continue;
    const tpl = templatesFor(slug).find((t) => t.type_key === tk);
    if (tpl) return { school, tpl };
  }
  return null;
};

module.exports = { SIZES, SCHOOLS, TEMPLATES, AMANCAY_TEMPLATES, TYPE_KEYS, templatesFor, buildProduct, productsForSchool, allProducts, resolveProductRef };
