import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { formatCLP, resolveImage } from "../lib/api";
import { ChevronLeft, Search, X } from "lucide-react";
import { ProductQuickShopDialog } from "../components/ProductQuickShopDialog";

const SHEETS_URL = "https://script.google.com/macros/s/AKfycbzLCfNiw7d4ihQ690DQxaGu88HGnoIh4-65O09qbDDzlI2zcBOd2OOmA9Uf3jgJfumq/exec";

const SIZES = ["4", "6", "8", "10", "12", "14", "16", "S", "M", "L", "XL"];

const DEFAULT_SCHOOLS = [
  {
    id: "colegio-talca",
    slug: "colegio-talca",
    name: "Colegio Talca",
    description: "Nuestro colegio principal. Uniformes con calidad y detalle.",
  },
  {
    id: "colegio-concepcion",
    slug: "colegio-concepcion",
    name: "Colegio Concepción",
    description: "Uniformes oficiales del Colegio Concepción.",
  },
  {
    id: "colegio-baltazar",
    slug: "colegio-baltazar",
    name: "Colegio Baltazar",
    description: "Uniformes oficiales del Colegio Baltazar.",
  },
  {
    id: "colegio-montessori",
    slug: "colegio-montessori",
    name: "Colegio Montessori",
    description: "Uniformes oficiales del Colegio Montessori.",
  },
  {
    id: "escuela-carlos-spano",
    slug: "escuela-carlos-spano",
    name: "Escuela Carlos Spano",
    description: "Uniformes oficiales de la Escuela Carlos Spano.",
  },
  {
    id: "escuela-amancay",
    slug: "escuela-amancay",
    name: "Escuela Amancay",
    description: "Cotonas y delantales para Escuela Amancay.",
  },
];

const PRODUCT_TEMPLATES = [
  {
    type_key: "buzo_completo",
    name: "Buzo Completo",
    base_price: 32000,
    image_file: "buzo-completo.jpg",
  },
  {
    type_key: "pantalon_buzo",
    name: "Pantalón de Buzo",
    base_price: 18000,
    image_file: "pantalon.jpg",
  },
  {
    type_key: "polera_buzo",
    name: "Polerón de buzo",
    base_price: 19000,
    image_file: "buzo.jpg",
  },
  {
    type_key: "polera_corta",
    name: "Polera manga corta",
    base_price: 10500,
    image_file: "polera-corta.jpg",
    image_files_by_school: {
      "colegio-talca": "polera.jpg",
      "colegio-montessori": "polera.jpg",
    },
  },
  {
    type_key: "polera_larga",
    name: "Polera manga larga",
    base_price: 12000,
    image_file: "polera-manga-larga.jpg",
  },
  {
    type_key: "polar",
    name: "Polar",
    base_price: 21000,
    image_file: "polar.jpg",
  },
  {
    type_key: "delantal_cotona",
    name: "Delantales",
    base_price: 13990,
    image_file: "delantal.jpg",
  },
  {
    type_key: "cotonas",
    name: "Cotonas",
    base_price: 12990,
    image_file: "cotona.jpg",
  },
];

const AMANCAY_PRODUCT_TEMPLATES = [
  {
    type_key: "cotonas_delantales",
    name: "Cotonas y delantales",
    base_price: 13990,
    image_file: "cotonas-delantales.jpg",
  },
];

const buildProducts = (slug, stockData, preciosData) => {
  const school = DEFAULT_SCHOOLS.find((s) => s.slug === slug);
  if (!school) return null;

  const templates =
    slug === "escuela-amancay"
      ? AMANCAY_PRODUCT_TEMPLATES
      : PRODUCT_TEMPLATES;

  const schoolStock = stockData[slug] || {};
  const schoolPrecios = preciosData[slug] || {};

  const filteredTemplates =
    slug === "escuela-amancay"
      ? templates
      : templates.filter((p) => schoolStock[p.type_key] !== undefined);

  const products = filteredTemplates.map((product) => {
    const sizeStock = schoolStock[product.type_key] || {};
    const sizePrecios = schoolPrecios[product.type_key] || {};

    const sizes = SIZES.map((size) => {
      const precio = Number(sizePrecios[size]) || product.base_price;

      return {
        size,
        stock: Number(sizeStock[size]) || 0,
        price: precio,
      };
    });

    const precios = sizes.map((s) => s.price).filter((p) => p > 0);
    const base_price =
      precios.length > 0 ? Math.min(...precios) : product.base_price;

    const imageFile =
      product.image_files_by_school?.[school.slug] || product.image_file;
    const image_url = `/images/productos/${school.slug}/${imageFile}`;

    return {
      id: `${school.slug}-${product.type_key}`,
      school_id: school.id,
      school_slug: school.slug,
      school_name: school.name,
      type_key: product.type_key,
      name: product.name,
      image_url,
      base_price,
      sizes,
    };
  });

  return { school, products };
};

const getProductImage = (imageUrl) => {
  if (!imageUrl) return "/images/productos/placeholder.jpg";
  if (imageUrl.startsWith("/images/")) return imageUrl;
  return resolveImage(imageUrl);
};

const SchoolLoadingSkeleton = () => {
  return (
    <div
      className="min-h-[70vh] bg-[#F7F7F5] pt-24 pb-16"
      data-testid="school-loading"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="animate-pulse">
          <div className="h-4 w-28 bg-gray-200 rounded mb-4" />
          <div className="h-10 w-64 bg-gray-200 rounded mb-3" />
          <div className="h-5 w-80 max-w-full bg-gray-200 rounded mb-8" />

          <div className="h-12 w-full bg-white border border-gray-200 rounded-sm mb-6" />

          <div className="flex gap-2 mb-10 overflow-hidden">
            <div className="h-8 w-24 bg-gray-200 rounded-sm shrink-0" />
            <div className="h-8 w-32 bg-gray-200 rounded-sm shrink-0" />
            <div className="h-8 w-28 bg-gray-200 rounded-sm shrink-0" />
            <div className="h-8 w-36 bg-gray-200 rounded-sm shrink-0" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[1, 2, 3, 4].map((item) => (
              <div key={item}>
                <div className="aspect-[4/5] bg-gray-200 border border-gray-200 rounded-sm" />

                <div className="mt-4">
                  <div className="h-3 w-24 bg-gray-200 rounded mb-3" />
                  <div className="h-5 w-36 bg-gray-200 rounded mb-3" />
                  <div className="h-4 w-44 bg-gray-200 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const SchoolPage = () => {
  const { slug } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [activeType, setActiveType] = useState("all");
  const [quickShop, setQuickShop] = useState(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
    setLoading(true);
    setQuery("");
    setActiveType("all");

    fetch(SHEETS_URL)
      .then((r) => r.json())
      .then(({ stock, precios }) => {
        const built = buildProducts(slug, stock, precios);
        setData(built);
      })
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [slug]);

  const filtered = useMemo(() => {
    if (!data) return [];

    let list = data.products;

    if (activeType !== "all") {
      list = list.filter((p) => p.type_key === activeType);
    }

    const q = query.trim().toLowerCase();

    if (q) {
      list = list.filter((p) =>
        `${p.name} ${p.type_key}`.toLowerCase().includes(q)
      );
    }

    return list;
  }, [data, query, activeType]);

  if (loading) return <SchoolLoadingSkeleton />;

  if (!data) {
    return (
      <div
        className="max-w-7xl mx-auto px-4 py-24"
        data-testid="school-not-found"
      >
        Colegio no encontrado.
      </div>
    );
  }

  const { school, products } = data;

  return (
    <div data-testid="school-page">
      <section className="border-b border-gray-200 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 md:py-4">
          <Link
            to="/"
            className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-black"
            data-testid="back-home-link"
          >
            <ChevronLeft size={16} /> Volver al inicio
          </Link>

          <div className="mt-2 flex items-end justify-between flex-wrap gap-4">
            <div>
              <p className="eyebrow">Catálogo</p>

              <h1 className="mt-1 font-display text-4xl md:text-5xl font-semibold tracking-tight">
                {school.name}
              </h1>

              {school.description && (
                <p className="mt-1 text-gray-600 max-w-xl">
                  {school.description}
                </p>
              )}
            </div>

            <p className="text-sm text-gray-500">
              {products.length}{" "}
              {products.length === 1
                ? "prenda disponible"
                : "prendas disponibles"}
            </p>
          </div>
        </div>
      </section>

      <section
        className="border-b border-gray-100 bg-white sticky top-16 z-30"
        data-testid="catalog-toolbar"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-3">
          <div className="relative">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Busca buzo, polera, delantal, cotona..."
              className="w-full border border-gray-300 pl-9 pr-9 py-3 text-sm focus:outline-none focus:border-black rounded-sm bg-white"
              data-testid="catalog-search-input"
            />

            {query && (
              <button
                onClick={() => setQuery("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black p-1"
                data-testid="catalog-search-clear"
                aria-label="Limpiar"
              >
                <X size={16} />
              </button>
            )}
          </div>

          <div
            className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1"
            data-testid="quick-index"
          >
            <Chip
              active={activeType === "all"}
              onClick={() => setActiveType("all")}
              testId="chip-all"
            >
              Todo ({products.length})
            </Chip>

            {products.map((p) => (
              <Chip
                key={p.type_key}
                active={activeType === p.type_key}
                onClick={() => setActiveType(p.type_key)}
                testId={`chip-${p.type_key}`}
              >
                {p.name}
              </Chip>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-12">
        {filtered.length === 0 ? (
          <div
            className="border border-dashed border-gray-300 py-16 text-center"
            data-testid="products-empty"
          >
            <p className="text-gray-500 text-sm">
              No hay resultados para "{query || activeType}".
            </p>

            <button
              onClick={() => {
                setQuery("");
                setActiveType("all");
              }}
              className="mt-3 text-sm underline underline-offset-4 hover:text-[#FF4D4D]"
              data-testid="reset-filters"
            >
              Limpiar filtros
            </button>
          </div>
        ) : (
          <div
            className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8"
            data-testid="products-grid"
          >
            {filtered.map((p) => {
              const totalStock = (p.sizes || []).reduce(
                (s, sz) => s + sz.stock,
                0
              );

              return (
                <div
                  key={p.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => setQuickShop(p)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setQuickShop(p);
                    }
                  }}
                  className="group block cursor-pointer text-left rounded-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-black"
                  data-testid={`product-card-${p.type_key}`}
                >
                  <div className="aspect-[4/5] overflow-hidden bg-[#E8F5F0] border border-[#A8D5C2] group-hover:border-[#2ECC71] transition-colors relative">
                    <img
                      src={getProductImage(p.image_url)}
                      alt={p.name}
                      className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
                    />
                  </div>

                  <div className="mt-2.5 flex items-start justify-between gap-1">
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] uppercase tracking-widest text-gray-500 hidden sm:block">
                        {school.name}
                      </p>

                      <h3 className="font-display text-sm sm:text-lg font-medium leading-tight">
                        {p.name}
                      </h3>

                      <p
                        className="mt-1 flex items-center gap-1.5 text-[10px] sm:text-xs text-gray-600"
                        data-testid={`product-card-stock-${p.type_key}`}
                      >
                        <span
                          className={`inline-block w-1.5 h-1.5 shrink-0 rounded-full ${
                            totalStock > 0 ? "bg-emerald-500" : "bg-gray-400"
                          }`}
                          aria-hidden
                        />
                        <span className="hidden sm:inline">
                          {totalStock > 0
                            ? "Stock disponible para retiro inmediato"
                            : "Sin stock disponible"}
                        </span>
                        <span className="sm:hidden">
                          {totalStock > 0 ? "Disponible" : "Sin stock"}
                        </span>
                      </p>
                    </div>

                    <span
                      className="font-semibold shrink-0 text-sm sm:text-base"
                      data-testid={`product-price-${p.type_key}`}
                    >
                      {formatCLP(p.base_price)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <ProductQuickShopDialog
        product={quickShop}
        open={Boolean(quickShop)}
        onOpenChange={(next) => {
          if (!next) setQuickShop(null);
        }}
      />
    </div>
  );
};

const Chip = ({ active, onClick, children, testId }) => (
  <button
    onClick={onClick}
    className={`whitespace-nowrap px-3.5 py-1.5 text-xs font-medium tracking-wide border transition-colors rounded-sm ${
      active
        ? "bg-black text-white border-black"
        : "bg-white text-gray-700 border-gray-300 hover:border-black"
    }`}
    data-testid={testId}
  >
    {children}
  </button>
);

export default SchoolPage;
