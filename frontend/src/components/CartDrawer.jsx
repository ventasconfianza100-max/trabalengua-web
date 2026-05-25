import React, { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "../components/ui/sheet";
import { useCart } from "../context/CartContext";
import { formatCLP, resolveImage } from "../lib/api";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";

export const CartDrawer = () => {
  const { items, open, setOpen, updateQty, removeItem, total } = useCart();
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [telefono, setTelefono] = useState("");
  const [error, setError] = useState("");

  const goWhatsApp = () => {
    if (!nombre.trim() || !apellido.trim() || !telefono.trim()) {
      setError("Por favor completa tu nombre, apellido y teléfono.");
      return;
    }
    setError("");

    const lineas = items.map(
      (it) => `• ${it.school_name} - ${it.product_name} - Talla ${it.size} x${it.quantity} - ${formatCLP(it.unit_price * it.quantity)}`
    ).join("\n");

    const mensaje = `Hola! Quiero hacer un pedido de Trabalengua\n\nNombre: ${nombre.trim()} ${apellido.trim()}\nTeléfono: +569${telefono.trim()}\n\n${lineas}\n\nTotal: ${formatCLP(total)}`;
    const url = `https://wa.me/56978838174?text=${encodeURIComponent(mensaje)}`;
    window.open(url, "_blank");
    setOpen(false);
    setNombre("");
    setApellido("");
    setTelefono("");
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent side="right" className="w-full sm:max-w-md flex flex-col p-0" data-testid="cart-drawer">
        <SheetHeader className="px-6 pt-6 pb-4 border-b border-gray-100">
          <SheetTitle className="font-display text-2xl tracking-tight flex items-center gap-2">
            <ShoppingBag size={20} strokeWidth={1.75} />
            Tu carrito
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex items-center justify-center flex-col gap-3 px-6 text-center" data-testid="cart-empty">
            <div className="h-14 w-14 rounded-full bg-gray-100 flex items-center justify-center">
              <ShoppingBag size={22} strokeWidth={1.5} className="text-gray-500" />
            </div>
            <p className="text-sm text-gray-600">Tu carrito está vacío.</p>
            <button
              onClick={() => setOpen(false)}
              className="mt-2 text-sm underline underline-offset-4 hover:text-[#FF4D4D]"
              data-testid="cart-keep-shopping"
            >
              Seguir comprando
            </button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto divide-y divide-gray-100" data-testid="cart-items-list">
              {items.map((it) => (
                <div key={`${it.product_id}-${it.size}`} className="flex gap-4 p-5" data-testid={`cart-item-${it.product_id}-${it.size}`}>
                  <div className="h-20 w-20 bg-gray-50 border border-gray-100 shrink-0 overflow-hidden">
                    <img
                      src={resolveImage(it.image_url, { width: 220 })}
                      alt={it.product_name}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-500 uppercase tracking-widest">{it.school_name}</p>
                    <p className="font-medium text-sm mt-0.5 truncate">{it.product_name}</p>
                    <p className="text-xs text-gray-600 mt-0.5">Talla: <strong>{it.size}</strong></p>
                    <div className="flex items-center justify-between mt-2">
                      <div className="inline-flex items-center border border-gray-200">
                        <button
                          onClick={() => updateQty(it.product_id, it.size, it.quantity - 1)}
                          className="p-1.5 hover:bg-gray-50"
                          data-testid={`cart-decrement-${it.product_id}-${it.size}`}
                          aria-label="Disminuir"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="px-3 text-sm font-medium min-w-[28px] text-center">{it.quantity}</span>
                        <button
                          onClick={() => updateQty(it.product_id, it.size, it.quantity + 1)}
                          className="p-1.5 hover:bg-gray-50"
                          data-testid={`cart-increment-${it.product_id}-${it.size}`}
                          aria-label="Aumentar"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                      <p className="font-semibold text-sm" data-testid={`cart-item-subtotal-${it.product_id}-${it.size}`}>
                        {formatCLP(it.unit_price * it.quantity)}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => removeItem(it.product_id, it.size)}
                    className="text-gray-400 hover:text-[#FF4D4D] transition-colors self-start"
                    data-testid={`cart-remove-${it.product_id}-${it.size}`}
                    aria-label="Eliminar"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-200 px-6 py-5 space-y-4 bg-gray-50">
              {/* Formulario */}
              <div className="space-y-2">
                <p className="text-xs font-medium text-gray-700 uppercase tracking-wide">Tus datos</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Nombre"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    className="w-full border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-black rounded-sm"
                  />
                  <input
                    type="text"
                    placeholder="Apellido"
                    value={apellido}
                    onChange={(e) => setApellido(e.target.value)}
                    className="w-full border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-black rounded-sm"
                  />
                </div>
                <div className="flex items-center border border-gray-300 rounded-sm overflow-hidden focus-within:border-black">
                  <span className="px-3 py-2 text-sm text-gray-500 bg-gray-100 border-r border-gray-300">+569</span>
                  <input
                    type="tel"
                    placeholder="12345678"
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value.replace(/\D/g, "").slice(0, 8))}
                    className="flex-1 px-3 py-2 text-sm focus:outline-none bg-white"
                  />
                </div>
                {error && <p className="text-xs text-red-500">{error}</p>}
              </div>

              <div className="flex justify-between items-baseline">
                <span className="text-sm text-gray-600">Total</span>
                <span className="font-display text-2xl font-semibold" data-testid="cart-total">{formatCLP(total)}</span>
              </div>

              <button
                onClick={goWhatsApp}
                className="w-full btn-brand py-3.5 text-sm font-medium tracking-wide rounded-sm"
                data-testid="cart-checkout-btn"
              >
                Finalizar pedido por WhatsApp 💬
              </button>
              <p className="text-[11px] text-center text-gray-500">
                Pago por transferencia. Confirmamos tu pedido por WhatsApp.
              </p>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
};
