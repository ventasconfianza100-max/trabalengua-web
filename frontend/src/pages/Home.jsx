import React, { useState, useMemo, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Truck, ShieldCheck, Sparkles, Search, X, Scissors, GraduationCap, SlidersHorizontal, Banknote } from "lucide-react";
import { ContactSection } from "../components/ContactSection";

const DEFAULT_SCHOOLS = [
  {
    id: 1,
    name: "Colegio Talca",
    slug: "colegio-talca",
    description: "Nuestro colegio principal. Uniformes con calidad y detalle.",
    featured: true,
    escudo: "/images/escudos/colegio-talca.png",
    prendas: [
      { name: "Buzo", img: "/images/productos/colegio-talca/buzo-completo.jpg" },
      { name: "Polera", img: "/images/productos/colegio-talca/polera.jpg" },
      { name: "Pantalón", img: "/images/productos/colegio-talca/pantalon.jpg" },
    ],
  },
  {
    id: 2,
    name: "Colegio Concepción",
    slug: "colegio-concepcion",
    description: "Uniformes oficiales del Colegio Concepción.",
    featured: false,
    escudo: "/images/escudos/colegio-concepcion.png",
    prendas: [
      { name: "Buzo", img: "/images/productos/colegio-concepcion/buzo-completo.jpg" },
      { name: "Polera", img: "/images/productos/colegio-concepcion/polera.jpg" },
      { name: "Pantalón", img: "/images/productos/colegio-concepcion/pantalon.jpg" },
    ],
  },
  {
    id: 3,
    name: "Colegio Baltazar",
    slug: "colegio-baltazar",
    description: "Uniformes oficiales del Colegio Baltazar.",
    featured: false,
    escudo: "/images/escudos/colegio-baltazar.png",
    prendas: [
      { name: "Buzo", img: "/images/productos/colegio-baltazar/buzo-completo.jpg" },
      { name: "Polera", img: "/images/productos/colegio-baltazar/polera.jpg" },
      { name: "Pantalón", img: "/images/productos/colegio-baltazar/pantalon.jpg" },
    ],
  },
  {
    id: 4,
    name: "Colegio Montessori",
    slug: "colegio-montessori",
    description: "Uniformes oficiales del Colegio Montessori.",
    featured: false,
    escudo: "/images/escudos/colegio-montessori.png",
    prendas: [
      { name: "Buzo", img: "/images/productos/colegio-montessori/buzo-completo.jpg" },
      { name: "Polera", img: "/images/productos/colegio-montessori/polera.jpg" },
      { name: "Pantalón", img: "/images/productos/colegio-montessori/pantalon.jpg" },
    ],
  },
  {
    id: 5,
    name: "Escuela Carlos Spano",
    slug: "escuela-carlos-spano",
    description: "Uniformes oficiales de la Escuela Carlos Spano.",
    featured: false,
    escudo: "/images/escudos/escuela-carlos-spano.png",
    prendas: [
      { name: "Buzo", img: "/images/productos/escuela-carlos-spano/buzo-completo.jpg" },
      { name: "Polera", img: "/images/productos/escuela-carlos-spano/polera.jpg" },
      { name: "Pantalón", img: "/images/productos/escuela-carlos-spano/pantalon.jpg" },
    ],
  },
  {
    id: 6,
    name: "Escuela Amancay",
    slug: "escuela-amancay",
    description: "Cotonas y delantales para Escuela Amancay.",
    featured: false,
    escudo: "/images/escudos/escuela-amancay.png",
    prendas: [
      { name: "Cotona", img: "/images/productos/escuela-amancay/cotonas-delantales.jpg" },
    ],
  },
];

/* Caja con escudo + fondo difuminado basado en la misma imagen */
const EscudoBox = ({ src, alt, boxClass = "h-36" }) => (
  <div className={`${boxClass} relative overflow-hidden flex items-center justify-center border-b border-gray-100 bg-white`}>
    <img
      src={src}
      alt=""
      aria-hidden
      className="absolute inset-0 w-full h-full object-cover scale-125 blur-xl opacity-20 pointer-events-none select-none"
    />

    <div className="absolute inset-0 bg-white/55 pointer-events-none" />

    <img
      src={src}
      alt={alt}
      className="h-24 w-24 object-contain relative z-10 drop-shadow-sm group-hover:scale-105 transition-transform duration-300"
      onError={(e) => {
        e.target.style.display = "none";
      }}
    />
  </div>
);

const SchoolCard = ({ school }) => (
  <Link
    to={`/colegio/${school.slug}`}
    className="bg-white border border-gray-200 hover:border-[#FF4D4D] transition-all group block rounded-sm overflow-hidden"
    data-testid={`school-card-${school.slug}`}
  >
    {/* MÓVIL: fila horizontal compacta */}
    <div className="flex sm:hidden items-center gap-3 px-4 py-3">
      <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center bg-gray-50 border border-gray-100 rounded-sm overflow-hidden">
        <img
          src={school.escudo}
          alt={school.name}
          className="w-full h-full object-contain p-1"
          onError={(e) => { e.target.style.display = "none"; }}
        />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-display text-sm font-semibold leading-tight truncate">{school.name}</h3>
        <p className="text-[11px] text-gray-500 truncate mt-0.5">{school.description}</p>
      </div>
      <div className="flex items-center gap-1 text-[#FF4D4D] flex-shrink-0">
        <span className="text-xs font-semibold">Ver</span>
        <ArrowRight size={13} />
      </div>
    </div>

    {/* DESKTOP: tarjeta vertical original */}
    <div className="hidden sm:block">
      <EscudoBox src={school.escudo} alt={`Escudo ${school.name}`} />
      <div className="p-5">
        <h3 className="font-display text-lg font-semibold tracking-tight">{school.name}</h3>
        <p className="mt-1 text-xs text-gray-500 line-clamp-2">{school.description}</p>
        {school.prendas?.length > 0 && (
          <div className="mt-4 flex gap-2">
            {school.prendas.map((p, i) => (
              <div key={i} className="w-14 h-14 border border-gray-200 rounded-sm bg-gray-50 overflow-hidden flex-shrink-0" title={p.name}>
                <img src={p.img} alt={p.name} className="w-full h-full object-cover"
                  onError={(e) => { e.target.parentElement.style.display = "none"; }} />
              </div>
            ))}
          </div>
        )}
        <div className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-[#FF4D4D] group-hover:gap-2.5 transition-all">
          Ver prendas <ArrowRight size={13} />
        </div>
      </div>
    </div>
  </Link>
);

const Home = () => {
  const [schools] = useState(DEFAULT_SCHOOLS);
  const [query, setQuery] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const searchRef = useRef(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    if (!q) return schools;

    return schools.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.slug.toLowerCase().includes(q)
    );
  }, [schools, query]);

  const dropdownResults = useMemo(() => {
    const q = query.trim().toLowerCase();

    if (!q) return schools;

    return schools.filter((s) => s.name.toLowerCase().includes(q));
  }, [schools, query]);

  useEffect(() => {
    const handler = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handler);

    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const featured = schools.find((s) => s.featured);
  const others = schools.filter((s) => !s.featured);

  return (
    <div data-testid="home-page">
      {/* HERO */}
      <section className="relative border-b border-gray-200 overflow-hidden bg-[#faf8f4]">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <svg
            width="100%"
            height="100%"
            xmlns="http://www.w3.org/2000/svg"
            className="absolute inset-0"
          >
            <defs>
              <pattern
                id="schoolPattern"
                x="0"
                y="0"
                width="120"
                height="120"
                patternUnits="userSpaceOnUse"
              >
                <g transform="translate(12,18) rotate(15)">
                  <rect
                    width="44"
                    height="11"
                    rx="2"
                    fill="none"
                    stroke="#ddd3c0"
                    strokeWidth="1.2"
                  />
                  <line x1="8" y1="0" x2="8" y2="4" stroke="#ddd3c0" strokeWidth="1" />
                  <line x1="16" y1="0" x2="16" y2="4" stroke="#ddd3c0" strokeWidth="1" />
                  <line x1="24" y1="0" x2="24" y2="4" stroke="#ddd3c0" strokeWidth="1" />
                  <line x1="32" y1="0" x2="32" y2="4" stroke="#ddd3c0" strokeWidth="1" />
                  <line x1="40" y1="0" x2="40" y2="4" stroke="#ddd3c0" strokeWidth="1" />
                </g>

                <g transform="translate(100,10) rotate(-25)">
                  <rect
                    x="0"
                    y="0"
                    width="7"
                    height="26"
                    rx="1"
                    fill="none"
                    stroke="#ddd3c0"
                    strokeWidth="1.2"
                  />
                  <polygon
                    points="0,26 7,26 3.5,33"
                    fill="none"
                    stroke="#ddd3c0"
                    strokeWidth="1.2"
                  />
                  <line x1="0" y1="5" x2="7" y2="5" stroke="#ddd3c0" strokeWidth="0.8" />
                </g>

                <g transform="translate(130,80) rotate(8)">
                  <rect
                    width="30"
                    height="24"
                    rx="2"
                    fill="none"
                    stroke="#ddd3c0"
                    strokeWidth="1.2"
                  />
                  <line x1="15" y1="0" x2="15" y2="24" stroke="#ddd3c0" strokeWidth="1" />
                  <line x1="3" y1="8" x2="12" y2="8" stroke="#ddd3c0" strokeWidth="0.8" />
                  <line x1="3" y1="13" x2="12" y2="13" stroke="#ddd3c0" strokeWidth="0.8" />
                </g>

                <g transform="translate(20,110) rotate(-40)">
                  <circle cx="5" cy="5" r="5" fill="none" stroke="#ddd3c0" strokeWidth="1.2" />
                  <circle cx="14" cy="5" r="5" fill="none" stroke="#ddd3c0" strokeWidth="1.2" />
                  <line x1="8" y1="1" x2="22" y2="-8" stroke="#ddd3c0" strokeWidth="1.2" />
                  <line x1="11" y1="9" x2="22" y2="18" stroke="#ddd3c0" strokeWidth="1.2" />
                </g>

                <g transform="translate(75,130)">
                  <circle cx="10" cy="10" r="10" fill="none" stroke="#ddd3c0" strokeWidth="1.2" />
                  <line x1="10" y1="4" x2="10" y2="10" stroke="#ddd3c0" strokeWidth="1" />
                  <line x1="10" y1="10" x2="15" y2="10" stroke="#ddd3c0" strokeWidth="1" />
                </g>
              </pattern>
            </defs>

            <rect width="100%" height="100%" fill="url(#schoolPattern)" opacity="0.25" />
          </svg>
        </div>

        <div className="absolute inset-0 grid-backdrop opacity-30 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-12 relative">

          {/* MÓVIL: layout compacto con imagen al lado */}
          <div className="flex gap-4 items-start md:hidden">
            {/* Texto izquierda */}
            <div className="flex-1 min-w-0 reveal">
              <div className="inline-flex items-center gap-1.5 border border-gray-200 bg-white px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-gray-600">
                <span className="w-1.5 h-1.5 rounded-full bg-[#FF4D4D]" />
                Temporada escolar
              </div>
              <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight leading-[1.05]">
                Uniformes<br />
                <span className="italic font-light text-gray-500">simples,</span>{" "}
                <span className="italic font-light text-gray-500">claros</span><br />
                y listos para{" "}
                <span className="text-[#FF4D4D]">retirar</span>.
              </h1>
              <div className="mt-4 flex flex-col gap-2">
                <a
                  href="#colegios"
                  onClick={(e) => { e.preventDefault(); document.getElementById("colegios")?.scrollIntoView({ behavior: "smooth" }); }}
                  className="inline-flex items-center justify-center gap-2 btn-brand px-4 py-2.5 text-sm font-medium rounded-sm"
                  data-testid="hero-browse-schools-mobile"
                >
                  Ver colegios <ArrowRight size={14} />
                </a>
                <Link
                  to="/colegio/colegio-talca"
                  className="inline-flex items-center justify-center gap-2 border border-black px-4 py-2.5 text-sm font-medium rounded-sm"
                  data-testid="hero-talca-cta-mobile"
                >
                  Colegio Talca
                </Link>
              </div>
              <div className="mt-4 flex flex-col gap-1.5 text-xs text-gray-600">
                <div className="flex items-center gap-1.5"><Truck size={13} /> Retiro inmediato</div>
                <div className="flex items-center gap-1.5"><ShieldCheck size={13} /> Pago seguro</div>
                <div className="flex items-center gap-1.5"><Sparkles size={13} /> Tallas 4 al XL</div>
              </div>
            </div>

            {/* Imagen derecha pequeña */}
            <div className="w-36 flex-shrink-0">
              <div className="aspect-[3/4] bg-gray-50 border border-gray-200 relative overflow-hidden rounded-sm">
                <img
                  src="/images/hero-uniformes.jpg"
                  alt="Uniformes escolares Trabalengua"
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-2 right-2 bg-[#FF4D4D] text-white px-2 py-0.5 text-[8px] font-bold uppercase tracking-[0.15em]">
                  2026
                </div>
              </div>
            </div>
          </div>

          {/* DESKTOP: layout original */}
          <div className="hidden md:grid md:grid-cols-12 gap-10 items-center">
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
                Elige tu colegio, revisa el stock por talla y paga por transferencia. Un proceso sencillo, sin complicaciones.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  href="#colegios"
                  onClick={(e) => { e.preventDefault(); document.getElementById("colegios")?.scrollIntoView({ behavior: "smooth" }); }}
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
                <div className="flex items-center gap-2"><Truck size={16} /> Retiro inmediato</div>
                <div className="flex items-center gap-2"><ShieldCheck size={16} /> Pago seguro</div>
                <div className="flex items-center gap-2"><Sparkles size={16} /> Tallas 4 al XL</div>
              </div>
            </div>

            <div className="md:col-span-5 relative">
              <div className="aspect-[4/5] bg-gray-50 border border-gray-200 relative overflow-hidden" data-testid="hero-image-frame">
                <img src="/images/hero-uniformes.jpg" alt="Uniformes escolares Trabalengua" className="w-full h-full object-cover" data-testid="hero-image" />
                <div className="absolute top-4 left-4 bg-white/95 backdrop-blur border border-gray-200 px-3 py-2">
                  <p className="text-[9px] uppercase tracking-[0.2em] text-gray-500">Est. Escolar</p>
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
      <section id="colegios" className="py-8 md:py-12 bg-[#F7F7F5] relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <svg
            width="100%"
            height="100%"
            xmlns="http://www.w3.org/2000/svg"
            className="absolute inset-0"
          >
            <defs>
              <pattern
                id="colegiosPattern"
                x="0"
                y="0"
                width="120"
                height="120"
                patternUnits="userSpaceOnUse"
              >
                <g transform="translate(8,8) rotate(5)">
                  <rect
                    x="0"
                    y="10"
                    width="30"
                    height="22"
                    fill="none"
                    stroke="#b8c4c8"
                    strokeWidth="1.1"
                  />
                  <rect
                    x="11"
                    y="18"
                    width="8"
                    height="14"
                    fill="none"
                    stroke="#b8c4c8"
                    strokeWidth="0.9"
                  />
                  <polygon
                    points="0,10 15,0 30,10"
                    fill="none"
                    stroke="#b8c4c8"
                    strokeWidth="1.1"
                  />
                </g>

                <g transform="translate(78,12) rotate(-15)">
                  <rect
                    x="2"
                    y="4"
                    width="20"
                    height="22"
                    rx="3"
                    fill="none"
                    stroke="#b8c4c8"
                    strokeWidth="1.1"
                  />
                  <path
                    d="M7,4 Q12,-2 17,4"
                    fill="none"
                    stroke="#b8c4c8"
                    strokeWidth="1.1"
                  />
                </g>

                <g transform="translate(48,48) rotate(10)">
                  <line x1="0" y1="0" x2="0" y2="22" stroke="#b8c4c8" strokeWidth="1" />
                  <polygon
                    points="0,2 14,7 0,12"
                    fill="none"
                    stroke="#b8c4c8"
                    strokeWidth="1"
                  />
                </g>
              </pattern>
            </defs>

            <rect width="100%" height="100%" fill="url(#colegiosPattern)" opacity="0.25" />
          </svg>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-6">
            <div>
              <p className="eyebrow">01 — Colegios</p>
              <h2 className="mt-2 font-display text-3xl md:text-4xl font-semibold tracking-tight">
                Encuentra tu colegio.
              </h2>
              {/* Decorative accent line */}
              <div className="mt-3 flex items-center gap-2">
                <span className="w-8 h-[2px] bg-[#FF4D4D] rounded-full" />
                <span className="w-3 h-[2px] bg-gray-300 rounded-full" />
                <span className="w-1.5 h-[2px] bg-gray-200 rounded-full" />
              </div>
            </div>

            <div
              className="w-full md:w-80 relative"
              ref={searchRef}
              data-testid="school-search-wrap"
            >
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10"
              />

              <input
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setDropdownOpen(true);
                }}
                onFocus={() => setDropdownOpen(true)}
                placeholder="Busca tu colegio..."
                className="w-full border border-gray-300 pl-9 pr-9 py-3 text-sm focus:outline-none focus:border-black rounded-sm bg-white"
                data-testid="school-search-input"
              />

              {query && (
                <button
                  onClick={() => {
                    setQuery("");
                    setDropdownOpen(false);
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black p-1 z-10"
                  data-testid="school-search-clear"
                >
                  <X size={16} />
                </button>
              )}

              {dropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 shadow-lg z-50 rounded-sm overflow-hidden">
                  {dropdownResults.length === 0 ? (
                    <p className="px-4 py-3 text-sm text-gray-500">Sin resultados</p>
                  ) : (
                    dropdownResults.map((s) => (
                      <Link
                        key={s.id}
                        to={`/colegio/${s.slug}`}
                        onClick={() => {
                          setDropdownOpen(false);
                          setQuery("");
                        }}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0"
                      >
                        <div className="w-10 h-10 rounded-sm overflow-hidden flex-shrink-0 relative bg-white">
                          <img
                            src={s.escudo}
                            alt=""
                            aria-hidden
                            className="absolute inset-0 w-full h-full object-cover scale-125 blur-md opacity-20"
                          />

                          <div className="absolute inset-0 bg-white/50" />

                          <img
                            src={s.escudo}
                            alt=""
                            className="w-full h-full object-contain relative z-10 p-1"
                            onError={(e) => {
                              e.target.style.display = "none";
                            }}
                          />
                        </div>

                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{s.name}</p>
                          <p className="text-xs text-gray-400 truncate">{s.description}</p>
                        </div>
                      </Link>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Tarjeta destacada */}
{featured && (
  <Link
    to={`/colegio/${featured.slug}`}
    className="block mb-4 border-2 border-[#8ECEF2]/50 hover:border-[#8ECEF2] transition-colors group relative overflow-hidden rounded-sm bg-gradient-to-br from-[#E6F4FB] via-[#F0F9FE] to-white"
    data-testid={`school-card-${featured.slug}`}
  >
    <div className="relative min-h-[160px] sm:min-h-[260px] md:min-h-[190px] p-4 sm:p-6 md:p-8 flex items-center overflow-hidden">

      {/* Logo Colegio Talca responsive */}
      <img
        src={featured.escudo}
        alt={`Escudo ${featured.name}`}
        className="
          absolute right-4 top-1/2 -translate-y-1/2
          w-24 h-24 opacity-15
          object-contain mix-blend-multiply pointer-events-none select-none
          sm:left-1/2 sm:right-auto sm:top-[46px] sm:-translate-x-1/2 sm:translate-y-0 sm:w-52 sm:h-52 sm:opacity-20
          md:left-[455px] md:top-1/2 md:-translate-y-1/2 md:translate-x-0
          md:w-56 md:h-56 md:opacity-95
          lg:left-[550px] lg:w-64 lg:h-64
        "
        onError={(e) => { e.target.style.display = "none"; }}
      />

      <div className="relative z-10 flex-1 max-w-md pt-0 sm:pt-24 md:pt-0">
        <div className="inline-flex items-center gap-2 bg-[#FF4D4D] text-white px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.2em]">
          Principal
        </div>

        <h3 className="mt-2 font-display text-2xl sm:text-4xl md:text-5xl font-semibold tracking-tight">
          {featured.name}
        </h3>

        <p className="mt-1 text-sm sm:text-base text-gray-600 max-w-md hidden sm:block">
          {featured.description}
        </p>

        <div className="mt-3 flex gap-2">
          {featured.prendas.map((p, i) => (
            <div
              key={i}
              className="w-10 h-10 sm:w-14 sm:h-14 border border-[#8ECEF2]/60 rounded-sm bg-white overflow-hidden"
              title={p.name}
            >
              <img
                src={p.img}
                alt={p.name}
                className="w-full h-full object-cover"
                onError={(e) => { e.target.parentElement.style.display = "none"; }}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="relative z-10 ml-auto inline-flex items-center gap-2 text-sm font-medium group-hover:translate-x-1 transition-transform text-[#1E5C86] flex-shrink-0">
        Ver catálogo <ArrowRight size={18} />
      </div>
    </div>
  </Link>
)}

          {/* Grid resto */}
          {filtered.length === 0 ? (
            <p
              className="border border-dashed border-gray-300 py-16 text-center text-gray-500 text-sm"
              data-testid="schools-empty"
            >
              No encontramos colegios con "{query}".
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {others.map((s) => (
                <SchoolCard key={s.id} school={s} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* BORDADOS STRIP */}
      <section
        className="border-t border-b border-gray-200 bg-white py-10 md:py-14 relative overflow-hidden"
        data-testid="bordados-strip"
      >
        {/* Decorative stitch line top */}
        <div className="absolute top-0 left-0 right-0 h-[3px] pointer-events-none"
          style={{ backgroundImage: "repeating-linear-gradient(90deg, #FF4D4D 0, #FF4D4D 8px, transparent 8px, transparent 16px)", opacity: 0.25 }}
        />
        {/* Cross-stitch + needle pattern */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" className="absolute inset-0">
            <defs>
              <pattern id="bordadosPattern" x="0" y="0" width="90" height="90" patternUnits="userSpaceOnUse">
                {/* Cross-stitch X */}
                <g transform="translate(10,10)">
                  <line x1="0" y1="0" x2="12" y2="12" stroke="#e8c0bc" strokeWidth="1.1" strokeLinecap="round" />
                  <line x1="12" y1="0" x2="0" y2="12" stroke="#e8c0bc" strokeWidth="1.1" strokeLinecap="round" />
                </g>
                {/* Needle with eye */}
                <g transform="translate(55,15) rotate(-35)">
                  <line x1="0" y1="0" x2="0" y2="28" stroke="#e8c0bc" strokeWidth="1.2" strokeLinecap="round" />
                  <ellipse cx="0" cy="4" rx="2.5" ry="1.5" fill="none" stroke="#e8c0bc" strokeWidth="1" />
                  <line x1="-1.5" y1="28" x2="0" y2="32" stroke="#e8c0bc" strokeWidth="1" strokeLinecap="round" />
                  <line x1="1.5" y1="28" x2="0" y2="32" stroke="#e8c0bc" strokeWidth="1" strokeLinecap="round" />
                </g>
                {/* Running stitch */}
                <g transform="translate(8,65)">
                  <line x1="0" y1="0" x2="7" y2="0" stroke="#e8c0bc" strokeWidth="1" strokeLinecap="round" />
                  <line x1="11" y1="0" x2="18" y2="0" stroke="#e8c0bc" strokeWidth="1" strokeLinecap="round" />
                  <line x1="22" y1="0" x2="29" y2="0" stroke="#e8c0bc" strokeWidth="1" strokeLinecap="round" />
                </g>
                {/* Small cross-stitch X bottom-right */}
                <g transform="translate(62,60)">
                  <line x1="0" y1="0" x2="8" y2="8" stroke="#e8c0bc" strokeWidth="1" strokeLinecap="round" />
                  <line x1="8" y1="0" x2="0" y2="8" stroke="#e8c0bc" strokeWidth="1" strokeLinecap="round" />
                </g>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#bordadosPattern)" opacity="0.25" />
          </svg>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            to="/bordados"
            className="group block border border-gray-200 hover:border-black transition-colors relative overflow-hidden"
            data-testid="bordados-home-link"
          >
            {/* MÓVIL: horizontal compacto */}
            <div className="flex md:hidden items-stretch">
              <div className="w-28 flex-shrink-0 overflow-hidden">
                <img
                  src="/images/bordados.jpg"
                  alt="Bordado de nombre en prenda escolar"
                  className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
                  data-testid="bordados-home-image-mobile"
                />
              </div>
              <div className="flex-1 p-4 flex flex-col justify-center gap-2 bg-gradient-to-r from-white to-[#FF4D4D]/5">
                <p className="eyebrow text-[9px]">Servicio extra</p>
                <h3 className="font-display text-base font-semibold tracking-tight leading-tight">
                  También bordamos nombres en tus uniformes.
                </h3>
                <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#FF4D4D]">
                  Conocer servicio <ArrowRight size={13} />
                </div>
              </div>
            </div>

            {/* DESKTOP: layout original */}
            <div className="hidden md:grid md:grid-cols-12 items-stretch">
              <div className="md:col-span-4 md:aspect-auto bg-gray-100 border-r border-gray-200 overflow-hidden">
                <img
                  src="/images/bordados.jpg"
                  alt="Bordado de nombre en prenda escolar"
                  className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
                  data-testid="bordados-home-image"
                />
              </div>
              <div className="md:col-span-8 p-10 flex flex-row items-center gap-10 bg-gradient-to-r from-white via-white to-[#FF4D4D]/5">
                <div className="shrink-0 h-12 w-12 rounded-full bg-[#FF4D4D]/10 text-[#FF4D4D] flex items-center justify-center">
                  <Scissors size={20} strokeWidth={1.75} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="eyebrow">Servicio extra</p>
                  <h3 className="mt-2 font-display text-3xl font-semibold tracking-tight">
                    También bordamos nombres en tus uniformes.
                  </h3>
                  <p className="mt-2 text-base text-gray-600 max-w-xl">
                    Personaliza cada prenda con el nombre de tu hijo. Terminación profesional, directo desde nuestro taller.
                  </p>
                </div>
                <div className="inline-flex items-center gap-2 text-sm font-medium whitespace-nowrap group-hover:text-[#FF4D4D] transition-colors">
                  Conocer servicio <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* HOW */}
      <section className="border-b border-gray-200 bg-[#F7F7F5] py-8 md:py-12 relative overflow-hidden">
        {/* Checkmark + arrow process pattern */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" className="absolute inset-0">
            <defs>
              <pattern id="howPattern" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
                {/* Checkmark in circle */}
                <g transform="translate(8,8)">
                  <circle cx="10" cy="10" r="9" fill="none" stroke="#b8c4c8" strokeWidth="1.1" />
                  <polyline points="5,10 9,14 15,7" fill="none" stroke="#b8c4c8" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                </g>
                {/* Arrow right */}
                <g transform="translate(52,46)">
                  <line x1="0" y1="6" x2="16" y2="6" stroke="#b8c4c8" strokeWidth="1.1" strokeLinecap="round" />
                  <polyline points="11,1 16,6 11,11" fill="none" stroke="#b8c4c8" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" />
                </g>
                {/* Small dot */}
                <circle cx="20" cy="62" r="2" fill="none" stroke="#b8c4c8" strokeWidth="1" />
                <circle cx="60" cy="18" r="2" fill="none" stroke="#b8c4c8" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#howPattern)" opacity="0.25" />
          </svg>
        </div>
        {/* Decorative large background number */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 select-none pointer-events-none hidden lg:block">
          <span className="font-display text-[160px] font-semibold text-gray-100 leading-none tracking-tight pr-8">
            3
          </span>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="mb-6 flex items-end gap-4">
            <div>
              <p className="eyebrow">02 — Cómo comprar</p>
              <h2 className="mt-2 font-display text-3xl md:text-4xl font-semibold tracking-tight">
                Tres pasos. Sin vueltas.
              </h2>
            </div>
            {/* Decorative step dots */}
            <div className="hidden md:flex items-center gap-1.5 pb-1 ml-2">
              {[0,1,2].map(i => (
                <span key={i} className={`rounded-full ${i === 0 ? "w-2.5 h-2.5 bg-[#FF4D4D]" : "w-2 h-2 bg-gray-300"}`} />
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-3 relative">
            {/* Desktop connector line */}
            <div className="absolute hidden md:block top-8 left-[calc(33.33%+1rem)] right-[calc(33.33%+1rem)] h-px border-t border-dashed border-gray-300 z-10" />

            {[
              { n: "01", t: "Elige tu colegio",      d: "Selecciona el colegio correspondiente a tu familia.",               icon: GraduationCap },
              { n: "02", t: "Revisa talla y stock",   d: "Ve la disponibilidad exacta por talla y agrega al carrito.",        icon: SlidersHorizontal },
              { n: "03", t: "Paga por transferencia", d: "Completa tus datos y recibe las instrucciones de pago.",            icon: Banknote },
            ].map((step, i) => {
              const Icon = step.icon;
              return (
                <div key={step.n} className={`bg-white p-8 border border-gray-200 ${i > 0 ? "border-l-0" : ""} relative`}>
                  {/* Icon badge */}
                  <div className="w-10 h-10 bg-[#FF4D4D]/8 border border-[#FF4D4D]/20 flex items-center justify-center mb-4">
                    <Icon size={18} strokeWidth={1.5} className="text-[#FF4D4D]" />
                  </div>

                  <span className="font-display text-5xl text-gray-100 font-semibold leading-none">
                    {step.n}
                  </span>

                  <h3 className="mt-3 font-display text-xl font-medium">{step.t}</h3>
                  <p className="mt-2 text-sm text-gray-600">{step.d}</p>

                  {/* Step indicator dot */}
                  <div className="absolute top-8 right-6 w-2 h-2 rounded-full bg-gray-200" />
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <ContactSection />
    </div>
  );
};

export default Home;