import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ShoppingBag, Menu, X, Sparkles } from "lucide-react";
import { useCart } from "../context/CartContext";
import { LOGO_URL } from "../lib/api";
import { ADDRESS, INSTAGRAM_URL, INSTAGRAM_HANDLE, WHATSAPP_HUMAN, waLink } from "../lib/contact";

const NAV_LINKS = [
  { to: "/", label: "Inicio", id: "nav-home" },
  { to: "/#colegios", label: "Colegios", id: "nav-schools", scrollTo: "colegios" },
  { to: "/bordados", label: "Bordados", id: "nav-bordados" },
  { to: "/contacto", label: "Contacto", id: "nav-contact" },
];

export const Header = () => {
  const { count, setOpen } = useCart();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  React.useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const handleScrollLink = (scrollId) => (e) => {
    if (location.pathname === "/") {
      e.preventDefault();
      document.getElementById(scrollId)?.scrollIntoView({ behavior: "smooth" });
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
            <img
              src={LOGO_URL}
              alt="Trabalengua Escolares"
              className="h-11 w-11 rounded-full object-contain border border-gray-200 bg-white"
            />
            <div className="hidden sm:flex flex-col leading-tight">
              <span className="font-display text-base font-semibold tracking-tight">Trabalengua</span>
              <span className="text-[10px] uppercase tracking-[0.2em] text-gray-500 -mt-0.5">
                Uniformes Escolares
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-7">
            {NAV_LINKS.map((l) => {
              if (l.id === "nav-bordados") {
                return (
                  <Link
                    key={l.id}
                    to={l.to}
                    className="relative inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-white bg-[#FF4D4D] hover:bg-[#E63E3E] rounded-full transition-colors shadow-[0_4px_14px_-4px_rgba(255,77,77,0.55)]"
                    data-testid={l.id}
                  >
                    <Sparkles size={12} strokeWidth={2.2} />
                    {l.label}
                    <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-white border border-[#FF4D4D]" />
                  </Link>
                );
              }
              return (
                <Link
                  key={l.id}
                  to={l.to}
                  onClick={l.scrollTo ? handleScrollLink(l.scrollTo) : undefined}
                  className="text-sm font-medium text-gray-700 hover:text-black transition-colors"
                  data-testid={l.id}
                >
                  {l.label}
                </Link>
              );
            })}
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
                <span
                  className="absolute -top-1 -right-1 bg-[#FF4D4D] text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1"
                  data-testid="cart-count-badge"
                >
                  {count}
                </span>
              )}
            </button>
            <button
              className="md:hidden p-2 hover:bg-gray-100 rounded-sm"
              onClick={() => setMobileOpen((v) => !v)}
              data-testid="mobile-menu-btn"
              aria-label="Menú"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
        {mobileOpen && (
          <div
            className="md:hidden border-t border-gray-100 py-3 flex flex-col gap-1"
            data-testid="mobile-menu"
          >
            {NAV_LINKS.map((l) => {
              const isBordados = l.id === "nav-bordados";
              return (
                <button
                  key={l.id}
                  onClick={() => {
                    setMobileOpen(false);
                    navigate(l.to);
                    if (l.scrollTo) {
                      setTimeout(
                        () => document.getElementById(l.scrollTo)?.scrollIntoView({ behavior: "smooth" }),
                        50
                      );
                    }
                  }}
                  className={
                    isBordados
                      ? "mx-2 my-1 px-3 py-2.5 text-xs font-semibold uppercase tracking-[0.12em] text-white bg-[#FF4D4D] rounded-full inline-flex items-center justify-center gap-1.5"
                      : "px-2 py-2.5 text-sm text-left hover:bg-gray-50 rounded-sm"
                  }
                  data-testid={`mobile-${l.id}`}
                >
                  {isBordados && <Sparkles size={12} strokeWidth={2.2} />}
                  {l.label}
                </button>
              );
            })}
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
        <p className="mt-4 text-sm text-gray-600 max-w-xs">
          Uniformes escolares y bordados personalizados en Talca.
        </p>
      </div>
      <div>
        <p className="eyebrow">Colegios</p>
        <ul className="mt-3 space-y-2 text-sm text-gray-700">
          <li>Colegio Talca</li>
          <li>Colegio Concepción</li>
          <li>Colegio Baltazar</li>
          <li>Colegio Montessori</li>
          <li>Escuela Carlos Spano</li>
          <li>Escuela Amancay</li>
        </ul>
      </div>
      <div>
        <p className="eyebrow">Secciones</p>
        <ul className="mt-3 space-y-2 text-sm text-gray-700">
          <li><Link to="/" className="hover:text-[#FF4D4D]">Inicio</Link></li>
          <li><Link to="/bordados" className="hover:text-[#FF4D4D]">Bordados</Link></li>
          <li><Link to="/contacto" className="hover:text-[#FF4D4D]">Contacto</Link></li>
          <li>
            <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="hover:text-[#FF4D4D]">
              Instagram {INSTAGRAM_HANDLE}
            </a>
          </li>
        </ul>
      </div>
      <div>
        <p className="eyebrow">Contacto</p>
        <ul className="mt-3 space-y-2 text-sm text-gray-700">
          <li>{ADDRESS}</li>
          <li>
            <a href={waLink()} target="_blank" rel="noopener noreferrer" className="hover:text-[#FF4D4D]">
              WhatsApp {WHATSAPP_HUMAN}
            </a>
          </li>
          <li>trabalenguaescolares@gmail.com</li>
          <li>RUT: 78.286.443.2</li>
        </ul>
      </div>
    </div>
    <div className="border-t border-[#FFD5D0] py-5 flex flex-col sm:flex-row items-center justify-between gap-2 px-6 max-w-7xl mx-auto">
      <p className="text-xs text-gray-500">
        © {new Date().getFullYear()} Trabalengua Escolares. Todos los derechos reservados.
      </p>
      <Link
        to="/admin/login"
        className="text-[10px] uppercase tracking-[0.2em] text-gray-300 hover:text-gray-500 transition-colors"
        data-testid="footer-admin-link"
      >
        · admin ·
      </Link>
    </div>
  </footer>
);