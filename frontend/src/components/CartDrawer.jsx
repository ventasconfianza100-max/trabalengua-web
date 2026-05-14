import React from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "../components/ui/sheet";
import { useCart } from "../context/CartContext";
import { formatCLP, resolveImage } from "../lib/api";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";

export const CartDrawer = () => {
  const { items, open, setOpen, updateQty, removeItem, total } = useCart();

  const goWhatsApp = () => {
    const lineas = items.map(
      (it) => `• ${it.product_name} - Talla ${it.size} x${it.quantity} - ${formatCLP(it.unit_price * it.quantity)}`
    ).join("\n");
    const mensaje = `Hola! Quiero hacer un pedido de Trabalengua 🛍️\n\n${lineas}\n\nTotal: ${formatCLP(total)}`;
    const url = `https://wa.me/56978838174?text=${encodeURIComponent(mensaje)}`;
    window.open(url, "_blank");
    setOpen(false);
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
                    <img src={resolveImage(it.image_url)} alt={it.product_name} className="w-full h-full object-cover" />
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