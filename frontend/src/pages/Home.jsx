import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Truck, ShieldCheck, Sparkles, Search, X, Scissors } from "lucide-react";
import { ContactSection } from "../components/ContactSection";

const DEFAULT_SCHOOLS = [
  {
    id: 1,
    name: "Colegio Talca",
    slug: "colegio-talca",
    description: "Nuestro colegio principal. Uniformes con calidad y detalle.",
    featured: true,
  },
  {
    id: 2,
    name: "Colegio Concepción",
    slug: "colegio-concepcion",
    description: "Uniformes oficiales del Colegio Concepción.",
    featured: false,
  },
  {
    id: 3,
    name: "Colegio Baltazar",
    slug: "colegio-baltazar",
    description: "Uniformes oficiales del Colegio Baltazar.",
    featured: false,
  },
  {
    id: 4,
    name: "Colegio Montessori",
    slug: "colegio-montessori",
    description: "Uniformes oficiales del Colegio Montessori.",
    featured: false,
  },
  {
    id: 5,
    name: "Escuela Carlos Spano",
    slug: "escuela-carlos-spano",
    description: "Uniformes oficiales de la Escuela Carlos Spano.",
    featured: false,
  },
  {
    id: 6,
    name: "Escuela Amancay",
    slug: "escuela-amancay",
    description: "Cotonas y delantales para Escuela Amancay.",
    featured: false,
  },
];

const Home = () => {
  const [schools] = useState(DEFAULT_SCHOOLS);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return schools;

    return schools.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.slug.toLowerCase().includes(q)
    );
  }, [schools, query]);

  const featured = filtered.find((s) => s.featured);
  const others = filtered.filter((s) => !s.featured);

  return (
    <div data-testid="home-page">
      {/* HERO */}
      <section className="relative border-b border-gray-200 overflow-hidden">
        <div className="absolute inset-0 grid-backdrop opacity-60 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 relative">
          <div className="grid md:grid-cols-12 gap-10 items-center">
            <div className="md:col-span-7 reveal">
              <div className="inline-flex items-center gap-2 border border-gray-200 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-600">
                <span className="w-1.5 h-1.5 rounded-full bg-[#FF4D4D]" />
                Temporada escolar
              </div>

              <h1 className="mt-6 font-display text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight leading-[1.05]">
                Uniformes escolares <br />
                <span className="italic font-light text-gray-500">simples,</span>{" "}
                <span className="italic font-light text-gray-500">claros</span> y listos
                para <span className="text-[#FF4D4D]">retirar</span>.
              </h1>

              <p className="mt-6 text-base md:text-lg text-gray-600 max-w-xl leading-relaxed">
                Elige tu colegio, revisa el stock por talla y paga por transferencia.
                Un proceso sencillo, sin complicaciones.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  href="#colegios"
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById("colegios")?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="inline-flex items-center gap-2 btn-brand px-6 py-3 text-sm font-medium tracking-wide rounded-sm"
                  data-testid="hero-browse-schools"
                >
                  Ver colegios <ArrowRight size={16} />
                </a>

                <Link
                  to="/colegio/colegio-talca"
                  className="inline-flex items-center gap-2 border border-black px-6 py-3 text-sm font-medium tracking-wide hover:bg-black hover:text-white transition-colors rounded-sm"
                  data-testid="hero-talca-cta"
                >
                  Ir a Colegio Talca
                </Link>
              </div>

              <div className="mt-10 flex flex-wrap gap-x-8 gap-y-3 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Truck size={16} /> Retiro inmediato
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck size={16} /> Pago seguro
                </div>
                <div className="flex items-center gap-2">
                  <Sparkles size={16} /> Tallas 4 al XL
                </div>
              </div>
            </div>

            <div className="md:col-span-5 relative">
              <div
                className="aspect-[4/5] bg-gray-50 border border-gray-200 relative overflow-hidden"
                data-testid="hero-image-frame"
              >
                <img
                  src="/images/hero-uniformes.jpg"
                  alt="Uniformes escolares Trabalengua"
                  className="w-full h-full object-cover"
                  data-testid="hero-image"
                />

                <div className="absolute top-4 left-4 bg-white/95 backdrop-blur border border-gray-200 px-3 py-2">
                  <p className="text-[9px] uppercase tracking-[0.2em] text-gray-500">
                    Est. Escolar
                  </p>
                  <p className="font-display text-sm font-semibold">trabalengua.tl</p>
                </div>

                <div className="absolute bottom-4 right-4 bg-[#FF4D4D] text-white px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em]">
                  Temporada 2026
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* COLEGIOS */}
      <section
        id="colegios"
        className="py-16 md:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
      >
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10">
          <div>
            <p className="eyebrow">01 — Colegios</p>
            <h2 className="mt-2 font-display text-3xl md:text-4xl font-semibold tracking-tight">
              Encuentra tu colegio.
            </h2>
          </div>

          <div className="w-full md:w-80 relative" data-testid="school-search-wrap">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Busca tu colegio..."
              className="w-full border border-gray-300 pl-9 pr-9 py-3 text-sm focus:outline-none focus:border-black rounded-sm bg-white"
              data-testid="school-search-input"
            />

            {query && (
              <button
                onClick={() => setQuery("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black p-1"
                data-testid="school-search-clear"
                aria-label="Limpiar búsqueda"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>

        {filtered.length === 0 ? (
          <p
            className="border border-dashed border-gray-300 py-16 text-center text-gray-500 text-sm"
            data-testid="schools-empty"
          >
            No encontramos colegios con "{query}". Revisa la ortografía o limpia la búsqueda.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
            {featured && (
              <Link
                to={`/colegio/${featured.slug}`}
                className="md:col-span-12 border-2 border-[#8ECEF2]/50 p-8 md:p-12 bg-gradient-to-br from-[#E6F4FB] via-[#F0F9FE] to-white hover:border-[#8ECEF2] transition-colors group block relative overflow-hidden"
                data-testid={`school-card-${featured.slug}`}
              >
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#8ECEF2]/15 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/4" />
                <div className="absolute bottom-0 left-0 w-40 h-40 bg-[#B6DEF0]/25 rounded-full blur-3xl pointer-events-none translate-y-1/2 -translate-x-1/4" />

                <div className="relative flex flex-col md:flex-row md:items-end gap-6 md:justify-between">
                  <div>
                    <div className="inline-flex items-center gap-2 bg-[#FF4D4D] text-white px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.2em]">
                      Principal
                    </div>

                    <h3 className="mt-5 font-display text-4xl md:text-6xl font-semibold tracking-tight leading-[0.95]">
                      {featured.name}
                    </h3>

                    <p className="mt-4 text-gray-600 max-w-md">
                      {featured.description}
                    </p>

                    <div className="mt-5 flex items-center gap-2 flex-wrap">
                      <span className="inline-flex items-center gap-1.5 bg-white border border-[#8ECEF2] text-[#2B7BAA] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.15em]">
                        <span className="w-2 h-2 rounded-full bg-[#8ECEF2]" />
                        Uniforme celeste
                      </span>

                      <span className="inline-flex items-center gap-1.5 bg-white border border-gray-200 text-gray-600 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.15em]">
                        4 prendas disponibles
                      </span>
                    </div>
                  </div>

                  <div className="inline-flex items-center gap-2 text-sm font-medium group-hover:translate-x-1 transition-transform text-[#1E5C86]">
                    Ver catálogo <ArrowRight size={18} />
                  </div>
                </div>
              </Link>
            )}

            {others.map((s) => (
              <Link
                key={s.id}
                to={`/colegio/${s.slug}`}
                className="md:col-span-4 border border-gray-200 p-6 bg-white hover:border-black hover:-translate-y-0.5 transition-all group block"
                data-testid={`school-card-${s.slug}`}
              >
                <p className="eyebrow">Colegio</p>

                <h3 className="mt-3 font-display text-2xl font-semibold tracking-tight">
                  {s.name}
                </h3>

                <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                  {s.description}
                </p>

                <div className="mt-5 inline-flex items-center gap-2 text-sm font-medium group-hover:text-[#FF4D4D] transition-colors">
                  Ver prendas <ArrowRight size={16} />
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* BORDADOS STRIP */}
      <section className="border-t border-gray-200 bg-white" data-testid="bordados-strip">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14">
          <Link
            to="/bordados"
            className="group block border border-gray-200 hover:border-black transition-colors relative overflow-hidden"
            data-testid="bordados-home-link"
          >
            <div className="grid md:grid-cols-12 items-stretch">
              <div className="md:col-span-4 aspect-[4/3] md:aspect-auto bg-gray-100 border-b md:border-b-0 md:border-r border-gray-200 overflow-hidden">
                <img
                  src="/images/bordados.jpg"
                  alt="Bordado de nombre en prenda escolar"
                  className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
                  data-testid="bordados-home-image"
                />
              </div>

              <div className="md:col-span-8 p-6 md:p-10 flex flex-col md:flex-row md:items-center gap-6 md:gap-10 bg-gradient-to-r from-white via-white to-[#FF4D4D]/5">
                <div className="shrink-0 h-12 w-12 rounded-full bg-[#FF4D4D]/10 text-[#FF4D4D] flex items-center justify-center">
                  <Scissors size={20} strokeWidth={1.75} />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="eyebrow">Servicio extra</p>

                  <h3 className="mt-2 font-display text-2xl md:text-3xl font-semibold tracking-tight">
                    También bordamos nombres en tus uniformes.
                  </h3>

                  <p className="mt-2 text-sm md:text-base text-gray-600 max-w-xl">
                    Personaliza cada prenda con el nombre de tu hijo. Terminación profesional,
                    directo desde nuestro taller.
                  </p>
                </div>

                <div className="inline-flex items-center gap-2 text-sm font-medium whitespace-nowrap group-hover:text-[#FF4D4D] transition-colors">
                  Conocer servicio{" "}
                  <ArrowRight
                    size={16}
                    className="group-hover:translate-x-0.5 transition-transform"
                  />
                </div>
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* HOW */}
      <section className="border-t border-gray-200 bg-gray-50 py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <p className="eyebrow">02 — Cómo comprar</p>

            <h2 className="mt-2 font-display text-3xl md:text-4xl font-semibold tracking-tight">
              Tres pasos. Sin vueltas.
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-px bg-gray-200 border border-gray-200">
            {[
              {
                n: "01",
                t: "Elige tu colegio",
                d: "Selecciona el colegio correspondiente a tu familia.",
              },
              {
                n: "02",
                t: "Revisa talla y stock",
                d: "Ve la disponibilidad exacta por talla y agrega al carrito.",
              },
              {
                n: "03",
                t: "Paga por transferencia",
                d: "Completa tus datos y recibe las instrucciones de pago.",
              },
            ].map((step) => (
              <div key={step.n} className="bg-white p-8">
                <span className="font-display text-5xl text-gray-200 font-semibold">
                  {step.n}
                </span>

                <h3 className="mt-3 font-display text-xl font-medium">
                  {step.t}
                </h3>

                <p className="mt-2 text-sm text-gray-600">
                  {step.d}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <ContactSection />
    </div>
  );
};

export default Home;