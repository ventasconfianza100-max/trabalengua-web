import React from "react";
import { Sparkles, Check, MessageCircle } from "lucide-react";
import { waLink } from "../lib/contact";

const BordadosPage = () => {
  const wa = waLink("Hola, quiero solicitar un bordado personalizado.");

  return (
    <div data-testid="bordados-page">
      {/* Hero */}
      <section className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 grid md:grid-cols-12 gap-10 items-center">
          <div className="md:col-span-6">
            <div className="inline-flex items-center gap-2 border border-gray-200 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-600">
              <Sparkles size={12} className="text-[#FF4D4D]" />
              Servicio personalizado
            </div>
            <h1 className="mt-6 font-display text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight leading-[1.05]">
              Bordados con el{" "}
              <span className="italic font-light text-gray-500">nombre</span> de tu hijo.
            </h1>
            <p className="mt-6 text-base md:text-lg text-gray-600 max-w-xl leading-relaxed">
              Bordamos nombres, iniciales y detalles personalizados directamente sobre las prendas escolares.
              Un toque único, con terminación profesional y duradera.
            </p>

            <ul className="mt-8 space-y-2.5 text-sm">
              {[
                "Nombre completo o iniciales bordadas",
                "Fuentes y colores a elección",
                "Terminación profesional con hilo de alta resistencia",
                "Disponible sobre buzos, poleras, polares y más",
              ].map((f) => (
                <li key={f} className="flex items-start gap-2">
                  <Check size={16} className="text-emerald-600 mt-0.5 shrink-0" />
                  <span className="text-gray-700">{f}</span>
                </li>
              ))}
            </ul>

            <a
              href={wa}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-10 inline-flex items-center gap-2 btn-brand px-7 py-4 text-sm font-medium tracking-wide rounded-sm"
              data-testid="bordados-whatsapp-btn"
            >
              <MessageCircle size={16} /> Solicitar bordado por WhatsApp
            </a>
          </div>

          <div className="md:col-span-6">
            <div className="relative aspect-[4/5] bg-gray-50 border border-gray-200 overflow-hidden">
              <img
                src="/images/bordados.jpg"
                alt="Máquina bordando un nombre sobre tela"
                className="w-full h-full object-cover"
                data-testid="bordados-hero-image"
              />
              <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur border border-gray-200 p-4">
                <p className="eyebrow">Hecho en Talca</p>
                <p className="mt-1 text-sm font-medium">Bordado a medida con máquina industrial.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Steps */}
      <section className="bg-gray-50 border-b border-gray-200 py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="eyebrow">Cómo funciona</p>
          <h2 className="mt-2 font-display text-3xl md:text-4xl font-semibold tracking-tight">
            Tres pasos simples.
          </h2>
          <div className="mt-10 grid md:grid-cols-3 gap-px bg-gray-200 border border-gray-200">
            {[
              { n: "01", t: "Escríbenos por WhatsApp", d: "Cuéntanos qué necesitas bordar: nombre, colegio, prenda." },
              { n: "02", t: "Confirmamos diseño y precio", d: "Acordamos tipografía, color del hilo y cotización final." },
              { n: "03", t: "Bordado y entrega", d: "Bordamos tu prenda y coordinamos retiro o delivery en Talca." },
            ].map((s) => (
              <div key={s.n} className="bg-white p-8">
                <span className="font-display text-5xl text-gray-200 font-semibold">{s.n}</span>
                <h3 className="mt-3 font-display text-xl font-medium">{s.t}</h3>
                <p className="mt-2 text-sm text-gray-600">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 md:py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-display text-3xl md:text-4xl font-semibold tracking-tight">
            ¿Listo para personalizar tu uniforme?
          </h2>
          <p className="mt-3 text-gray-600">Envíanos un mensaje y resolvemos todo por WhatsApp.</p>
          <a
            href={wa}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#1ebe5d] text-white px-7 py-4 text-sm font-medium tracking-wide rounded-sm transition-colors"
            data-testid="bordados-cta-btn"
          >
            <MessageCircle size={16} /> Solicitar bordado personalizado
          </a>
        </div>
      </section>
    </div>
  );
};

export default BordadosPage;