import React from "react";
import { ContactSection } from "../components/ContactSection";

const ContactPage = () => (
  <div data-testid="contact-page">
    <section className="border-b border-gray-200 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <p className="eyebrow">Contacto</p>
        <h1 className="mt-2 font-display text-4xl md:text-5xl font-semibold tracking-tight">
          Estamos aquí para ayudarte.
        </h1>
        <p className="mt-3 text-gray-600 max-w-xl">
          Visita nuestra tienda, síguenos en Instagram o escríbenos por WhatsApp. Te respondemos rápido.
        </p>
      </div>
    </section>
    <ContactSection compact />
  </div>
);

export default ContactPage;
