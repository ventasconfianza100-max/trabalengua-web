import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ShoppingBag, Menu, X, Sparkles, ChevronDown } from "lucide-react";
import { useCart } from "../context/CartContext";
import { LOGO_URL } from "../lib/api";
import { ADDRESS, INSTAGRAM_URL, INSTAGRAM_HANDLE, WHATSAPP_HUMAN, waLink } from "../lib/contact";

const SCHOOLS = [
  { name: "Colegio Talca", slug: "colegio-talca", escudo: "/images/escudos/colegio-talca.png", desc: "Uniforme celeste" },
  { name: "Colegio Concepción", slug: "colegio-concepcion", escudo: "/images/escudos/colegio-concepcion.png", desc: "Uniforme oficial" },
  { name: "Colegio Baltazar", slug: "colegio-baltazar", escudo: "/images/escudos/colegio-baltazar.png", desc: "Uniforme oficial" },
  { name: "Colegio Montessori", slug: "colegio-montessori", escudo: "/images/escudos/colegio-montessori.png", desc: "Uniforme oficial" },
  { name: "Escuela Carlos Spano", slug: "escuela-carlos-spano", escudo: "/images/escudos/escuela-carlos-spano.png", desc: "Uniforme oficial" },
  { name: "Escuela Amancay", slug: "escuela-amancay", escudo: "/images/escudos/escuela-amancay.png", desc: "Cotonas y delantales" },
];

export const Header = () => {
  const { count, setOpen } = useCart();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [megaOpen, setMegaOpen] = React.useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const megaRef = React.useRef(null);

  React.useEffect(() => {
    setMobileOpen(false);
    setMegaOpen(false);
  }, [location.pathname]);

  React.useEffect(() => {
    const handler = (e) => {
      if (megaRef.current && !megaRef.current.contains(e.target)) {
        setMegaOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const goToColegios = () => {
    setMegaOpen(false);
    if (location.pathname === "/") {
      document.getElementById("colegios")?.scrollIntoView({ behavior: "smooth" });
    } else {
      navigate("/");
      setTimeout(() => {
        document.getElementById("colegios")?.scrollIntoView({ behavior: "smooth" });
      }, 300);
    }
  };

  return (
    <header
      className="sticky top-0 z-40 border-b border-gray-200 bg-[#F2F0E8]/95 backdrop-blur-xl shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
      data-testid="site-header"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          <Link to="/" className="flex items-center gap-3" data-testid="header-logo-link">
            <img src={LOGO_URL} alt="Trabalengua Escolares" className="h-11 w-11 rounded-full object-contain border border-gray-200 bg-white" />
            <div className="hidden sm:flex flex-col leading-tight">
              <span className="font-display text-base font-semibold tracking-tight">Trabalengua</span>
              <span className="text-[10px] uppercase tracking-[0.2em] text-gray-500 -mt-0.5">Uniformes Escolares</span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-7">
            <Link to="/" className="text-sm font-medium text-gray-700 hover:text-black transition-colors" data-testid="nav-home">Inicio</Link>

            <div className="relative" ref={megaRef}>
              <button
                onMouseEnter={() => setMegaOpen(true)}
                onClick={() => setMegaOpen((v) => !v)}
                className="relative inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-white bg-[#4D9EFF] hover:bg-[#3A8AE6] rounded-full transition-colors shadow-[0_4px_14px_-4px_rgba(77,158,255,0.55)]"
                data-testid="nav-schools"
              >
                Colegios
                <ChevronDown size={12} className={`transition-transform ${megaOpen ? "rotate-180" : ""}`} />
              </button>

              {megaOpen && (
                <div
                  className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-[600px] bg-white border border-gray-200 shadow-xl rounded-sm overflow-hidden z-50"
                  onMouseLeave={() => setMegaOpen(false)}
                >
                  <div className="p-4 border-b border-gray-100">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-semibold">Nuestros colegios</p>
                  </div>
                  <div className="grid grid-cols-2 gap-px bg-gray-100">
                    {SCHOOLS.map((s) => (
                      <Link
                        key={s.slug}
                        to={`/colegio/${s.slug}`}
                        onClick={() => setMegaOpen(false)}
                        className="flex items-center gap-3 p-4 bg-white hover:bg-[#F7F7F5] transition-colors group"
                      >
                        <div className="w-12 h-12 rounded-full border border-gray-200 bg-gray-50 overflow-hidden flex-shrink-0 flex items-center justify-center">
                          <img src={s.escudo} alt={s.name} className="w-10 h-10 object-contain group-hover:scale-105 transition-transform" onError={(e) => { e.target.style.display = "none"; }} />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-800 group-hover:text-[#4D9EFF] transition-colors">{s.name}</p>
                          <p className="text-xs text-gray-400">{s.desc}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                  <div className="p-3 border-t border-gray-100 bg-gray-50 text-center">
                    <button onClick={goToColegios} className="text-xs font-semibold text-[#4D9EFF] hover:underline">
                      Ver todos los colegios →
                    </button>
                  </div>
                </div>
              )}
            </div>

            <Link
              to="/bordados"
              className="relative inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-white bg-[#FF4D4D] hover:bg-[#E63E3E] rounded-full transition-colors shadow-[0_4px_14px_-4px_rgba(255,77,77,0.55)]"
              data-testid="nav-bordados"
            >
              <Sparkles size={12} strokeWidth={2.2} />
              Bordados
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-white border border-[#FF4D4D]" />
            </Link>

            <Link to="/contacto" className="text-sm font-medium text-gray-700 hover:text-black transition-colors" data-testid="nav-contact">Contacto</Link>
          </nav>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setOpen(true)}
              className="relative flex items-center gap-2 px-3 py-2 hover:bg-gray-100 transition-colors rounded-sm"
              data-testid="open-cart-btn"
              aria-label="Abrir carrito"
            >
              <ShoppingBag size={20} strokeWidth={1.75} />
              <span className="hidden sm:inline text-sm font-medium">Carrito</span>
              {count > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#FF4D4D] text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1" data-testid="cart-count-badge">
                  {count}
                </span>
              )}
            </button>
            <button className="md:hidden p-2 hover:bg-gray-100 rounded-sm" onClick={() => setMobileOpen((v) => !v)} data-testid="mobile-menu-btn" aria-label="Menú">
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="md:hidden border-t border-gray-100 py-3 flex flex-col gap-1" data-testid="mobile-menu">
            <button onClick={() => { setMobileOpen(false); navigate("/"); }} className="px-2 py-2.5 text-sm text-left hover:bg-gray-50 rounded-sm">Inicio</button>
            <div className="px-2 py-2 border-b border-gray-100">
              <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-2">Colegios</p>
              {SCHOOLS.map((s) => (
                <button key={s.slug} onClick={() => { setMobileOpen(false); navigate(`/colegio/${s.slug}`); }} className="flex items-center gap-2 w-full px-2 py-2 hover:bg-gray-50 rounded-sm">
                  <img src={s.escudo} alt={s.name} className="w-6 h-6 object-contain rounded-full border border-gray-200" onError={(e) => { e.target.style.display = "none"; }} />
                  <span className="text-sm">{s.name}</span>
                </button>
              ))}
            </div>
            <button onClick={() => { setMobileOpen(false); navigate("/bordados"); }} className="mx-2 my-1 px-3 py-2.5 text-xs font-semibold uppercase tracking-[0.12em] text-white bg-[#FF4D4D] rounded-full inline-flex items-center justify-center gap-1.5">
              <Sparkles size={12} strokeWidth={2.2} /> Bordados
            </button>
            <button onClick={() => { setMobileOpen(false); navigate("/contacto"); }} className="px-2 py-2.5 text-sm text-left hover:bg-gray-50 rounded-sm">Contacto</button>
          </div>
        )}
      </div>
    </header>
  );
};

export const Footer = () => (
  <footer className="border-t border-gray-200 mt-24 bg-[#FFF0EE]" data-testid="site-footer">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid md:grid-cols-4 gap-10">
      <div>
        <div className="flex items-center gap-3">
          <img src={LOGO_URL} alt="" className="h-10 w-10 rounded-full border border-gray-200" />
          <div>
            <p className="font-display font-semibold">Trabalengua SPA</p>
            <p className="text-xs text-gray-500 uppercase tracking-widest">Uniformes Escolares</p>
          </div>
        </div>
        <p className="mt-4 text-sm text-gray-600 max-w-xs">Uniformes escolares y bordados personalizados en Talca.</p>
      </div>
      <div>
        <p className="eyebrow">Colegios</p>
        <ul className="mt-3 space-y-2 text-sm text-gray-700">
          {SCHOOLS.map((s) => (
            <li key={s.slug}><Link to={`/colegio/${s.slug}`} className="hover:text-[#FF4D4D]">{s.name}</Link></li>
          ))}
        </ul>
      </div>
      <div>
        <p className="eyebrow">Secciones</p>
        <ul className="mt-3 space-y-2 text-sm text-gray-700">
          <li><Link to="/" className="hover:text-[#FF4D4D]">Inicio</Link></li>
          <li><Link to="/bordados" className="hover:text-[#FF4D4D]">Bordados</Link></li>
          <li><Link to="/contacto" className="hover:text-[#FF4D4D]">Contacto</Link></li>
          <li><a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="hover:text-[#FF4D4D]">Instagram {INSTAGRAM_HANDLE}</a></li>
        </ul>
      </div>
      <div>
        <p className="eyebrow">Contacto</p>
        <ul className="mt-3 space-y-2 text-sm text-gray-700">
          <li>{ADDRESS}</li>
          <li><a href={waLink()} target="_blank" rel="noopener noreferrer" className="hover:text-[#FF4D4D]">WhatsApp {WHATSAPP_HUMAN}</a></li>
          <li>trabalenguaescolares@gmail.com</li>
          <li>RUT: 78.286.443.2</li>
        </ul>
      </div>
    </div>
    <div className="border-t border-[#FFD5D0] py-5 flex flex-col sm:flex-row items-center justify-between gap-2 px-6 max-w-7xl mx-auto">
      <p className="text-xs text-gray-500">© {new Date().getFullYear()} Trabalengua Escolares. Todos los derechos reservados.</p>
      <Link to="/admin/login" className="text-[10px] uppercase tracking-[0.2em] text-gray-300 hover:text-gray-500 transition-colors" data-testid="footer-admin-link">· admin ·</Link>
    </div>
  </footer>
);