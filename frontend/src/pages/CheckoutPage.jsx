import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { api, formatApiError, formatCLP } from "../lib/api";
import { CheckCircle2, Copy, Truck, Store, Info } from "lucide-react";
import { toast } from "sonner";
import { DELIVERY_FEE } from "../lib/contact";

const BANK = {
  business: "TRABALENGUA SPA",
  rut: "78.286.443.2",
  bank: "Mercado Pago",
  accountType: "Cuenta Vista",
  accountNumber: "1025957476",
  email: "trabalenguaescolares@gmail.com",
};

const BankDetails = ({ total }) => {
  const copy = (val) => {
    navigator.clipboard.writeText(String(val));
    toast.success("Copiado");
  };
  const rows = [
    ["Empresa", BANK.business],
    ["RUT", BANK.rut],
    ["Banco", BANK.bank],
    ["Tipo de cuenta", BANK.accountType],
    ["N° de cuenta", BANK.accountNumber],
    ["Email", BANK.email],
    ["Monto a transferir", formatCLP(total)],
  ];
  return (
    <div className="border border-gray-200 bg-gray-50 p-6" data-testid="bank-details">
      <p className="eyebrow">Datos de transferencia</p>
      <dl className="mt-4 divide-y divide-gray-200">
        {rows.map(([k, v]) => (
          <div key={k} className="flex items-center justify-between gap-3 py-2.5">
            <dt className="text-xs text-gray-500 uppercase tracking-wider">{k}</dt>
            <dd className="text-sm font-medium flex items-center gap-2">
              <span data-testid={`bank-${k}`}>{v}</span>
              <button onClick={() => copy(v)} className="text-gray-400 hover:text-black" aria-label="Copiar">
                <Copy size={13} />
              </button>
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
};

const CheckoutPage = () => {
  const { items, total: subtotal, clear } = useCart();
  const [form, setForm] = useState({ customer_name: "", whatsapp: "", email: "" });
  const [deliveryMethod, setDeliveryMethod] = useState("pickup");
  const [submitting, setSubmitting] = useState(false);
  const [order, setOrder] = useState(null);
  const navigate = useNavigate();

  const deliveryFee = deliveryMethod === "delivery" ? DELIVERY_FEE : 0;
  const finalTotal = subtotal + deliveryFee;

  const handleChange = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    if (!form.customer_name || !form.whatsapp || !form.email) {
      toast.error("Completa todos los datos");
      return;
    }
    if (items.length === 0) {
      toast.error("Tu carrito está vacío");
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        delivery_method: deliveryMethod,
        items: items.map((i) => ({
          product_id: i.product_id,
          school_name: i.school_name,
          product_name: i.product_name,
          size: i.size,
          quantity: i.quantity,
          unit_price: i.unit_price,
        })),
      };
      const { data } = await api.post("/orders", payload);
      setOrder(data);
      clear();
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      toast.error(formatApiError(err, "Error al crear el pedido"));
    } finally {
      setSubmitting(false);
    }
  };

  // Confirmation screen
  if (order) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 space-y-6" data-testid="order-confirmation">
        <div className="border border-gray-200 p-6 md:p-10 bg-white">
          <div className="flex items-center gap-3">
            <CheckCircle2 size={28} className="text-emerald-500 shrink-0" />
            <h1 className="font-display text-2xl md:text-4xl font-semibold tracking-tight">
              ¡Pedido recibido!
            </h1>
          </div>
          <p className="mt-3 text-gray-600">
            Hola {order.customer_name}, tu pedido <strong>#{order.id.slice(0, 8).toUpperCase()}</strong> fue registrado.
          </p>
        </div>

        <ConfirmedSummary order={order} />
        <BankDetails total={order.total} />

        <div className="flex flex-col sm:flex-row gap-3">
          <Link to="/" className="border border-black px-6 py-3 text-sm font-medium hover:bg-black hover:text-white transition-colors rounded-sm text-center" data-testid="go-home-btn">
            Volver al inicio
          </Link>
          <p className="text-xs text-gray-500 self-center">
            Envía el comprobante a <strong>{BANK.email}</strong> o por WhatsApp.
          </p>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24 text-center" data-testid="empty-checkout">
        <h1 className="font-display text-3xl font-semibold">Tu carrito está vacío</h1>
        <p className="mt-3 text-gray-600">Explora nuestros colegios y agrega prendas.</p>
        <button onClick={() => navigate("/")} className="mt-6 btn-brand px-6 py-3 rounded-sm text-sm" data-testid="empty-browse-btn">
          Ver colegios
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16" data-testid="checkout-page">
      <p className="eyebrow">Checkout</p>
      <h1 className="mt-2 font-display text-3xl md:text-5xl font-semibold tracking-tight">
        Finaliza tu compra
      </h1>

      <div className="mt-8 md:mt-10 grid md:grid-cols-5 gap-8 md:gap-10">
        {/* LEFT: FORM */}
        <form onSubmit={submit} className="md:col-span-3 space-y-10" data-testid="checkout-form">
          {/* Customer data */}
          <section>
            <p className="eyebrow">1. Tus datos</p>
            <div className="mt-4 space-y-4">
              <div>
                <label className="text-sm font-medium">Nombre completo</label>
                <input
                  type="text"
                  value={form.customer_name}
                  onChange={handleChange("customer_name")}
                  className="mt-1 w-full border border-gray-300 px-4 py-3 focus:outline-none focus:border-black rounded-sm"
                  placeholder="Ej. María González"
                  required
                  data-testid="checkout-name"
                />
              </div>
              <div>
                <label className="text-sm font-medium">WhatsApp</label>
                <input
                  type="tel"
                  value={form.whatsapp}
                  onChange={handleChange("whatsapp")}
                  className="mt-1 w-full border border-gray-300 px-4 py-3 focus:outline-none focus:border-black rounded-sm"
                  placeholder="Ej. +56 9 1234 5678"
                  required
                  data-testid="checkout-whatsapp"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Correo electrónico</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={handleChange("email")}
                  className="mt-1 w-full border border-gray-300 px-4 py-3 focus:outline-none focus:border-black rounded-sm"
                  placeholder="tu@correo.cl"
                  required
                  data-testid="checkout-email"
                />
              </div>
            </div>
          </section>

          {/* Delivery selector */}
          <section>
            <p className="eyebrow">2. Tipo de entrega</p>
            <div className="mt-4 grid sm:grid-cols-2 gap-3" data-testid="delivery-selector">
              <DeliveryCard
                selected={deliveryMethod === "pickup"}
                onClick={() => setDeliveryMethod("pickup")}
                icon={<Store size={18} />}
                title="Retiro en tienda"
                sub="Gratis · desde Talca"
                testId="delivery-pickup"
              />
              <DeliveryCard
                selected={deliveryMethod === "delivery"}
                onClick={() => setDeliveryMethod("delivery")}
                icon={<Truck size={18} />}
                title="Delivery"
                sub={`${formatCLP(DELIVERY_FEE)} · solo en Talca`}
                testId="delivery-delivery"
              />
            </div>
            {deliveryMethod === "pickup" ? (
              <DeliveryNote testId="pickup-note">
                Una vez realizada la transferencia, dentro de <strong>3 días hábiles</strong> te contactaremos para confirmar que puedes venir a retirar tu pedido.
              </DeliveryNote>
            ) : (
              <DeliveryNote testId="delivery-note">
                Si eliges delivery, debes contactarnos por <strong>WhatsApp</strong> indicando que tu pedido es con delivery y enviando tu dirección. El tiempo estimado de entrega es de <strong>5 días hábiles</strong>. Delivery disponible únicamente dentro de Talca.
              </DeliveryNote>
            )}
          </section>

          <button
            type="submit"
            disabled={submitting}
            className="btn-brand px-8 py-4 text-sm font-medium tracking-wide rounded-sm disabled:opacity-60 w-full sm:w-auto"
            data-testid="submit-order-btn"
          >
            {submitting ? "Procesando..." : "Confirmar pedido"}
          </button>
        </form>

        {/* RIGHT: FIXED SUMMARY STACK */}
        <aside className="md:col-span-2 space-y-5 md:sticky md:top-24 md:self-start" data-testid="checkout-aside">
          {/* Big total */}
          <div className="border border-black bg-[#0A0A0A] text-white p-6" data-testid="big-total-card">
            <p className="text-[10px] uppercase tracking-[0.25em] text-gray-400">Total a pagar</p>
            <p className="mt-2 font-display text-5xl md:text-6xl font-semibold tracking-tight" data-testid="checkout-total">
              {formatCLP(finalTotal)}
            </p>
            <div className="mt-4 pt-4 border-t border-white/15 text-sm space-y-1.5 text-gray-300">
              <div className="flex justify-between"><span>Subtotal</span><span className="text-white">{formatCLP(subtotal)}</span></div>
              <div className="flex justify-between">
                <span>Despacho</span>
                <span className="text-white" data-testid="summary-delivery-fee">
                  {deliveryFee === 0 ? "Gratis" : formatCLP(deliveryFee)}
                </span>
              </div>
            </div>
          </div>

          {/* Entrega */}
          <div className="border border-gray-200 p-5 bg-white" data-testid="summary-delivery-method">
            <p className="eyebrow">Método de entrega</p>
            <p className="mt-2 font-medium flex items-center gap-2">
              {deliveryMethod === "pickup" ? (<><Store size={16} /> Retiro en tienda</>) : (<><Truck size={16} /> Delivery en Talca</>)}
            </p>
          </div>

          {/* Datos cliente preview */}
          <div className="border border-gray-200 p-5 bg-white" data-testid="summary-customer">
            <p className="eyebrow">Datos del cliente</p>
            <dl className="mt-2 space-y-1 text-sm">
              <div className="flex justify-between gap-2"><dt className="text-gray-500">Nombre</dt><dd className="font-medium truncate">{form.customer_name || "—"}</dd></div>
              <div className="flex justify-between gap-2"><dt className="text-gray-500">WhatsApp</dt><dd className="font-medium truncate">{form.whatsapp || "—"}</dd></div>
              <div className="flex justify-between gap-2"><dt className="text-gray-500">Email</dt><dd className="font-medium truncate">{form.email || "—"}</dd></div>
            </dl>
          </div>

          {/* Resumen productos */}
          <div className="border border-gray-200 p-5 bg-white" data-testid="summary-items">
            <p className="eyebrow">Resumen del pedido</p>
            <div className="mt-3 divide-y divide-gray-100">
              {items.map((it) => (
                <div key={`${it.product_id}-${it.size}`} className="py-2.5 flex justify-between gap-3 text-sm">
                  <div className="min-w-0">
                    <p className="font-medium truncate">{it.product_name}</p>
                    <p className="text-xs text-gray-500 truncate">{it.school_name} · Talla {it.size} · x{it.quantity}</p>
                  </div>
                  <p className="font-semibold whitespace-nowrap">{formatCLP(it.unit_price * it.quantity)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Bank data */}
          <BankDetails total={finalTotal} />
        </aside>
      </div>
    </div>
  );
};

const DeliveryCard = ({ selected, onClick, icon, title, sub, testId }) => (
  <button
    type="button"
    onClick={onClick}
    data-testid={testId}
    className={`text-left border p-4 transition-all ${
      selected ? "border-black bg-black text-white" : "border-gray-200 bg-white hover:border-black"
    }`}
    aria-pressed={selected}
  >
    <div className="flex items-center gap-2">
      <span className={`h-8 w-8 flex items-center justify-center border ${selected ? "border-white/20" : "border-gray-200"}`}>{icon}</span>
      <div>
        <p className="font-medium">{title}</p>
        <p className={`text-xs ${selected ? "text-gray-300" : "text-gray-500"}`}>{sub}</p>
      </div>
    </div>
  </button>
);

const DeliveryNote = ({ children, testId }) => (
  <div
    className="mt-4 border border-gray-200 bg-[#FF4D4D]/5 p-4 flex items-start gap-3 text-sm text-gray-700"
    data-testid={testId}
  >
    <Info size={16} className="text-[#FF4D4D] mt-0.5 shrink-0" />
    <p className="leading-relaxed">{children}</p>
  </div>
);

const ConfirmedSummary = ({ order }) => (
  <div className="space-y-5">
    {/* Big total */}
    <div className="border border-black bg-[#0A0A0A] text-white p-6" data-testid="confirmed-total">
      <p className="text-[10px] uppercase tracking-[0.25em] text-gray-400">Total pagado</p>
      <p className="mt-2 font-display text-5xl md:text-6xl font-semibold tracking-tight">
        {formatCLP(order.total)}
      </p>
      <div className="mt-4 pt-4 border-t border-white/15 text-sm space-y-1.5 text-gray-300">
        <div className="flex justify-between"><span>Subtotal</span><span className="text-white">{formatCLP(order.subtotal || (order.total - (order.delivery_fee || 0)))}</span></div>
        <div className="flex justify-between"><span>Despacho</span><span className="text-white">{order.delivery_fee ? formatCLP(order.delivery_fee) : "Gratis"}</span></div>
      </div>
    </div>

    {/* Entrega */}
    <div className="border border-gray-200 p-5 bg-white">
      <p className="eyebrow">Método de entrega</p>
      <p className="mt-2 font-medium flex items-center gap-2">
        {order.delivery_method === "pickup" ? (<><Store size={16} /> Retiro en tienda</>) : (<><Truck size={16} /> Delivery en Talca</>)}
      </p>
      <p className="mt-2 text-xs text-gray-600">
        {order.delivery_method === "pickup"
          ? "Te contactaremos dentro de 3 días hábiles para confirmar el retiro."
          : "Contáctanos por WhatsApp con tu dirección. Entrega en 5 días hábiles (solo Talca)."}
      </p>
    </div>

    {/* Datos cliente */}
    <div className="border border-gray-200 p-5 bg-white">
      <p className="eyebrow">Datos del cliente</p>
      <dl className="mt-2 space-y-1 text-sm">
        <div className="flex justify-between gap-2"><dt className="text-gray-500">Nombre</dt><dd className="font-medium">{order.customer_name}</dd></div>
        <div className="flex justify-between gap-2"><dt className="text-gray-500">WhatsApp</dt><dd className="font-medium">{order.whatsapp}</dd></div>
        <div className="flex justify-between gap-2"><dt className="text-gray-500">Email</dt><dd className="font-medium">{order.email}</dd></div>
      </dl>
    </div>

    {/* Items */}
    <div className="border border-gray-200 p-5 bg-white">
      <p className="eyebrow">Productos</p>
      <div className="mt-3 divide-y divide-gray-100">
        {order.items.map((it, idx) => (
          <div key={idx} className="py-2.5 flex justify-between gap-3 text-sm">
            <div>
              <p className="font-medium">{it.product_name}</p>
              <p className="text-xs text-gray-500">{it.school_name} · Talla {it.size} · x{it.quantity}</p>
            </div>
            <p className="font-semibold whitespace-nowrap">{formatCLP(it.subtotal || it.unit_price * it.quantity)}</p>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default CheckoutPage;
