import React from "react";
import { MapPin, Clock, Instagram, MessageCircle, ArrowUpRight } from "lucide-react";
import {
  ADDRESS,
  MAPS_SHARE_URL,
  MAPS_EMBED_URL,
  INSTAGRAM_URL,
  INSTAGRAM_HANDLE,
  HOURS,
  WHATSAPP_HUMAN,
  waLink,
} from "../lib/contact";

export const ContactSection = ({ compact = false }) => {
  return (
    <section
      id="contacto"
      className={`border-t border-gray-200 bg-white ${compact ? "py-8" : "py-8 md:py-8"} relative overflow-hidden`}
      data-testid="contact-section"
    >
      {/* Location pin + clock pattern */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" className="absolute inset-0">
          <defs>
            <pattern id="contactPattern" x="0" y="0" width="90" height="90" patternUnits="userSpaceOnUse">
              {/* Location pin */}
              <g transform="translate(8,6)">
                <path d="M10,0 C4.5,0 0,4.5 0,10 C0,17 10,26 10,26 C10,26 20,17 20,10 C20,4.5 15.5,0 10,0 Z" fill="none" stroke="#b8c4c8" strokeWidth="1.1" />
                <circle cx="10" cy="10" r="3.5" fill="none" stroke="#b8c4c8" strokeWidth="1" />
              </g>
              {/* Clock */}
              <g transform="translate(58,50)">
                <circle cx="10" cy="10" r="10" fill="none" stroke="#b8c4c8" strokeWidth="1.1" />
                <line x1="10" y1="4" x2="10" y2="10" stroke="#b8c4c8" strokeWidth="1" strokeLinecap="round" />
                <line x1="10" y1="10" x2="15" y2="13" stroke="#b8c4c8" strokeWidth="1" strokeLinecap="round" />
              </g>
              {/* Small pin */}
              <g transform="translate(62,8) scale(0.6)">
                <path d="M10,0 C4.5,0 0,4.5 0,10 C0,17 10,26 10,26 C10,26 20,17 20,10 C20,4.5 15.5,0 10,0 Z" fill="none" stroke="#b8c4c8" strokeWidth="1.3" />
                <circle cx="10" cy="10" r="3.5" fill="none" stroke="#b8c4c8" strokeWidth="1.1" />
              </g>
              {/* Dot */}
              <circle cx="38" cy="72" r="1.8" fill="none" stroke="#b8c4c8" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#contactPattern)" opacity="0.25" />
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">

        {/* Header */}
        <div className="mb-4">
          <p className="eyebrow">03 — Contacto & Ubicación</p>
          <h2 className="mt-1.5 font-display text-2xl md:text-3xl font-semibold tracking-tight flex items-center gap-3">
            Visítanos en Talca.
            <span className="hidden sm:inline-flex items-center justify-center w-8 h-8 bg-[#FF4D4D]/8 border border-[#FF4D4D]/20 shrink-0">
              <MapPin size={15} strokeWidth={1.5} className="text-[#FF4D4D]" />
            </span>
          </h2>
          <p className="mt-1 text-sm text-gray-600 max-w-xl">
            Te esperamos en nuestra tienda. Escríbenos por WhatsApp para consultas.
          </p>
        </div>

        {/* MÓVIL: layout compacto */}
        <div className="md:hidden space-y-3">
          {/* Mapa reducido + dirección */}
          <a href={MAPS_SHARE_URL} target="_blank" rel="noopener noreferrer"
            className="border border-gray-200 overflow-hidden group block bg-gray-50 hover:border-black transition-colors"
            data-testid="map-card-mobile">
            <div className="h-40 w-full">
              <iframe title="Mapa Trabalengua" src={MAPS_EMBED_URL}
                className="w-full h-full border-0" loading="lazy"
                referrerPolicy="no-referrer-when-downgrade" allowFullScreen />
            </div>
            <div className="px-3 py-2 border-t border-gray-200 bg-white flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <MapPin size={13} className="text-[#FF4D4D] shrink-0" />
                <p className="text-sm font-medium truncate">{ADDRESS}</p>
              </div>
              <span className="inline-flex items-center gap-1 text-xs text-gray-500 shrink-0 ml-2">
                Ver <ArrowUpRight size={12} />
              </span>
            </div>
          </a>

          {/* Horario compacto */}
          <div className="border border-gray-200 px-4 py-3 bg-gray-50 flex items-start gap-3" data-testid="hours-card-mobile">
            <Clock size={15} strokeWidth={1.5} className="text-gray-500 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-[10px] uppercase tracking-[0.15em] text-gray-500 font-semibold mb-1.5">Horario</p>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                {HOURS.map((h) => (
                  <React.Fragment key={h.day}>
                    <span className="text-gray-600">{h.day}</span>
                    <span className="font-medium text-right">{h.time}</span>
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>

          {/* Instagram + WhatsApp en fila */}
          <div className="grid grid-cols-2 gap-3">
            <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer"
              className="border border-gray-200 p-3 bg-white flex items-center gap-2.5 group hover:border-black transition-colors"
              data-testid="instagram-card-mobile">
              <div className="h-8 w-8 bg-gradient-to-br from-[#F58529] via-[#DD2A7B] to-[#8134AF] text-white flex items-center justify-center shrink-0">
                <Instagram size={15} strokeWidth={1.8} />
              </div>
              <div className="min-w-0">
                <p className="text-[9px] uppercase tracking-widest text-gray-400">Síguenos</p>
                <p className="text-xs font-medium truncate">{INSTAGRAM_HANDLE}</p>
              </div>
            </a>
            <a href={waLink("Hola Trabalengua, tengo una consulta.")} target="_blank" rel="noopener noreferrer"
              className="border border-[#25D366]/40 p-3 bg-[#F2FBF5] flex items-center gap-2.5 group hover:border-[#25D366] transition-colors"
              data-testid="whatsapp-card-mobile">
              <div className="h-8 w-8 bg-[#25D366] text-white flex items-center justify-center shrink-0 rounded-full">
                <MessageCircle size={15} strokeWidth={1.8} />
              </div>
              <div className="min-w-0">
                <p className="text-[9px] uppercase tracking-widest text-[#1b7a3a]">WhatsApp</p>
                <p className="text-xs font-medium truncate">{WHATSAPP_HUMAN}</p>
              </div>
            </a>
          </div>

          <p className="flex items-center gap-1.5 text-[11px] text-gray-400 pt-1">
            <MapPin size={11} /> Delivery disponible únicamente dentro de Talca.
          </p>
        </div>

        {/* DESKTOP: layout original */}
        <div className="hidden md:grid md:grid-cols-12 gap-6">
          <a href={MAPS_SHARE_URL} target="_blank" rel="noopener noreferrer"
            className="md:col-span-7 border border-gray-200 overflow-hidden group relative block bg-gray-50 hover:border-black transition-colors"
            data-testid="map-card">
            <div className="aspect-[16/9] w-full">
              <iframe title="Mapa Trabalengua Escolares" src={MAPS_EMBED_URL}
                className="w-full h-full border-0" loading="lazy"
                referrerPolicy="no-referrer-when-downgrade" allowFullScreen />
            </div>
            <div className="p-4 border-t border-gray-200 bg-white flex items-center justify-between">
              <div className="min-w-0">
                <p className="eyebrow">Dirección</p>
                <p className="mt-0.5 font-display text-base font-medium truncate">{ADDRESS}</p>
              </div>
              <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-600 group-hover:text-[#FF4D4D] transition-colors shrink-0">
                Ver en Maps <ArrowUpRight size={14} />
              </span>
            </div>
          </a>
          <div className="md:col-span-5 grid grid-cols-1 gap-4">
            <div className="border border-gray-200 p-4 bg-gray-50" data-testid="hours-card">
              <div className="flex items-start gap-3">
                <div className="h-9 w-9 bg-white border border-gray-200 flex items-center justify-center shrink-0">
                  <Clock size={16} strokeWidth={1.5} />
                </div>
                <div className="flex-1">
                  <p className="eyebrow">Horario de atención</p>
                  <ul className="mt-2 divide-y divide-gray-200">
                    {HOURS.map((h) => (
                      <li key={h.day} className="flex items-center justify-between py-1.5 text-sm">
                        <span className="text-gray-700">{h.day}</span>
                        <span className="font-medium">{h.time}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
            <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer"
              className="border border-gray-200 p-4 bg-white hover:border-black transition-colors group flex items-center gap-3"
              data-testid="instagram-card">
              <div className="h-10 w-10 bg-gradient-to-br from-[#F58529] via-[#DD2A7B] to-[#8134AF] text-white flex items-center justify-center shrink-0">
                <Instagram size={18} strokeWidth={1.8} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="eyebrow">Síguenos</p>
                <p className="mt-0.5 font-display text-base font-medium">{INSTAGRAM_HANDLE}</p>
              </div>
              <ArrowUpRight size={16} className="text-gray-400 group-hover:text-[#FF4D4D] transition-colors" />
            </a>
            <a href={waLink("Hola Trabalengua, tengo una consulta.")} target="_blank" rel="noopener noreferrer"
              className="border border-[#25D366]/40 p-4 bg-[#F2FBF5] hover:bg-[#E8F7EE] hover:border-[#25D366] transition-colors group flex items-center gap-3"
              data-testid="whatsapp-contact-card">
              <div className="h-10 w-10 bg-[#25D366] text-white flex items-center justify-center shrink-0 rounded-full shadow-sm">
                <MessageCircle size={18} strokeWidth={1.8} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] uppercase tracking-[0.2em] text-[#1b7a3a]">Consultas</p>
                <p className="mt-0.5 font-display text-base font-medium text-[#0A0A0A]">Escríbenos por WhatsApp</p>
                <p className="text-xs text-gray-600 mt-0.5">{WHATSAPP_HUMAN}</p>
              </div>
              <ArrowUpRight size={16} className="text-[#1b7a3a] group-hover:text-[#116b2d] transition-colors" />
            </a>
          </div>
        </div>

        <div className="hidden md:flex mt-4 items-center gap-2 text-xs text-gray-500">
          <MapPin size={14} /> Delivery disponible únicamente dentro de Talca.
        </div>
      </div>
    </section>
  );
};
