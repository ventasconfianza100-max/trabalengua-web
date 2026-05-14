import React from "react";
import { waLink } from "../lib/contact";

const WhatsIcon = ({ size = 28 }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M19.05 4.91A10 10 0 0 0 12.03 2C6.5 2 2.02 6.48 2.02 12c0 1.76.46 3.45 1.34 4.95L2 22l5.2-1.36a9.97 9.97 0 0 0 4.83 1.23h.01c5.52 0 10-4.48 10.01-10a9.94 9.94 0 0 0-2.99-6.96zM12.04 20.2h-.01a8.3 8.3 0 0 1-4.23-1.16l-.3-.18-3.09.81.82-3.01-.2-.31a8.23 8.23 0 0 1-1.27-4.39c0-4.56 3.71-8.27 8.27-8.27 2.21 0 4.28.86 5.85 2.42a8.22 8.22 0 0 1 2.42 5.85c0 4.56-3.71 8.27-8.26 8.27zm4.53-6.19c-.25-.12-1.47-.72-1.7-.81-.23-.08-.39-.12-.56.12-.17.25-.64.81-.78.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-2-1.23-.74-.66-1.24-1.48-1.38-1.73-.14-.25-.02-.39.11-.51.11-.11.25-.29.37-.43.12-.14.17-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.56-1.35-.77-1.85-.2-.48-.41-.42-.56-.43l-.48-.01c-.17 0-.43.06-.66.31-.23.25-.87.85-.87 2.07 0 1.22.89 2.4 1.02 2.56.12.17 1.75 2.67 4.24 3.75.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.47-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.14-1.18-.06-.11-.22-.17-.47-.29z" />
  </svg>
);

export const WhatsAppFloat = () => (
  <a
    href={waLink("Hola Trabalengua, tengo una consulta.")}
    target="_blank"
    rel="noopener noreferrer"
    aria-label="Chatear por WhatsApp"
    data-testid="whatsapp-float-btn"
    className="fixed bottom-5 right-5 md:bottom-6 md:right-6 z-50 group"
  >
    <span className="absolute inset-0 rounded-full bg-[#25D366] opacity-40 animate-ping" aria-hidden="true" />
    <span
      className="relative flex items-center justify-center h-14 w-14 rounded-full bg-[#25D366] text-white shadow-lg hover:bg-[#1ebe5d] transition-colors"
      style={{ boxShadow: "0 10px 30px -8px rgba(37,211,102,0.6)" }}
    >
      <WhatsIcon />
    </span>
    <span className="hidden md:block absolute right-16 top-1/2 -translate-y-1/2 whitespace-nowrap bg-black text-white text-xs font-medium px-3 py-1.5 rounded-sm opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 transition-all pointer-events-none">
      Escríbenos por WhatsApp
    </span>
  </a>
);

export default WhatsAppFloat;
