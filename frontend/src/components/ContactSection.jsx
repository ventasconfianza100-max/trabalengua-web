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
      className={`border-t border-gray-200 bg-white ${compact ? "py-8" : "py-8 md:py-12"} relative overflow-hidden`}
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
        <div className="mb-6">
          <p className="eyebrow">03 — Contacto & Ubicación</p>
          <h2 className="mt-2 font-display text-3xl md:text-4xl font-semibold tracking-tight flex items-center gap-3">
            Visítanos en Talca.
            {/* Decorative pin accent */}
            <span className="hidden sm:inline-flex items-center justify-center w-8 h-8 bg-[#FF4D4D]/8 border border-[#FF4D4D]/20 shrink-0">
              <MapPin size={15} strokeWidth={1.5} className="text-[#FF4D4D]" />
            </span>
          </h2>
          <p className="mt-3 text-gray-600 max-w-xl">
            Te esperamos en nuestra tienda. Para consultas adicionales escríbenos por WhatsApp y te respondemos al instante.
          </p>
        </div>

        <div className="grid md:grid-cols-12 gap-6">
          {/* Map */}
          <a
            href={MAPS_SHARE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="md:col-span-7 border border-gray-200 overflow-hidden group relative block bg-gray-50 hover:border-black transition-colors"
            data-testid="map-card"
          >
            <div className="aspect-[4/3] md:aspect-[16/10] w-full">
              <iframe
                title="Mapa Trabalengua Escolares"
                src={MAPS_EMBED_URL}
                className="w-full h-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
            </div>
            <div className="p-5 border-t border-gray-200 bg-white flex items-center justify-between">
              <div className="min-w-0">
                <p className="eyebrow">Dirección</p>
                <p className="mt-1 font-display text-lg font-medium truncate">{ADDRESS}</p>
              </div>
              <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-600 group-hover:text-[#FF4D4D] transition-colors shrink-0">
                Ver en Maps <ArrowUpRight size={14} />
              </span>
            </div>
          </a>

          {/* Right side stack */}
          <div className="md:col-span-5 grid grid-cols-1 gap-6">
            {/* Hours */}
            <div className="border border-gray-200 p-6 bg-gray-50" data-testid="hours-card">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 bg-white border border-gray-200 flex items-center justify-center shrink-0">
                  <Clock size={18} strokeWidth={1.5} />
                </div>
                <div className="flex-1">
                  <p className="eyebrow">Horario de atención</p>
                  <ul className="mt-3 divide-y divide-gray-200">
                    {HOURS.map((h) => (
                      <li key={h.day} className="flex items-center justify-between py-2 text-sm">
                        <span className="text-gray-700">{h.day}</span>
                        <span className="font-medium">{h.time}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Instagram */}
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="border border-gray-200 p-6 bg-white hover:border-black transition-colors group flex items-center gap-4"
              data-testid="instagram-card"
            >
              <div className="h-12 w-12 bg-gradient-to-br from-[#F58529] via-[#DD2A7B] to-[#8134AF] text-white flex items-center justify-center shrink-0">
                <Instagram size={20} strokeWidth={1.8} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="eyebrow">Síguenos</p>
                <p className="mt-0.5 font-display text-lg font-medium">{INSTAGRAM_HANDLE}</p>
              </div>
              <ArrowUpRight size={18} className="text-gray-400 group-hover:text-[#FF4D4D] transition-colors" />
            </a>

            {/* WhatsApp note */}
            <a
              href={waLink("Hola Trabalengua, tengo una consulta.")}
              target="_blank"
              rel="noopener noreferrer"
              className="border border-[#25D366]/40 p-6 bg-[#F2FBF5] hover:bg-[#E8F7EE] hover:border-[#25D366] transition-colors group flex items-center gap-4"
              data-testid="whatsapp-contact-card"
            >
              <div className="h-12 w-12 bg-[#25D366] text-white flex items-center justify-center shrink-0 rounded-full shadow-sm">
                <MessageCircle size={20} strokeWidth={1.8} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] uppercase tracking-[0.2em] text-[#1b7a3a]">Consultas</p>
                <p className="mt-0.5 font-display text-lg font-medium text-[#0A0A0A]">Escríbenos por WhatsApp</p>
                <p className="text-xs text-gray-600 mt-0.5">{WHATSAPP_HUMAN}</p>
              </div>
              <ArrowUpRight size={18} className="text-[#1b7a3a] group-hover:text-[#116b2d] transition-colors" />
            </a>
          </div>
        </div>

        <div className="mt-6 flex items-center gap-2 text-xs text-gray-500">
          <MapPin size={14} /> Delivery disponible únicamente dentro de Talca.
        </div>
      </div>
    </section>
  );
};
