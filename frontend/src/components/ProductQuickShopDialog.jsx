import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatCLP, resolveImage } from "@/lib/api";
import { useCart } from "@/context/CartContext";
import { Check, X } from "lucide-react";
import { toast } from "sonner";

const getProductImage = (imageUrl) => {
  if (!imageUrl) return "/images/productos/placeholder.jpg";
  if (imageUrl.startsWith("/images/")) return imageUrl;
  return resolveImage(imageUrl);
};

export function ProductQuickShopDialog({ product, open, onOpenChange }) {
  const [selectedSize, setSelectedSize] = useState(null);
  const [qty, setQty] = useState(1);
  const { addItem } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    if (!open || !product) return;
    setSelectedSize(null);
    setQty(1);
  }, [open, product]);

  const sizeRow = useMemo(
    () => (product?.sizes || []).find((s) => s.size === selectedSize),
    [product, selectedSize]
  );

  const totalStock = useMemo(
    () => (product?.sizes || []).reduce((s, sz) => s + sz.stock, 0),
    [product]
  );

  const stockBanner = useMemo(() => {
    if (!product) return { ok: false, label: "" };
    if (selectedSize && sizeRow) {
      if (sizeRow.stock > 0) {
        return { ok: true, label: "Stock disponible para retiro inmediato" };
      }
      return { ok: false, label: "Sin stock en la talla seleccionada" };
    }
    if (totalStock > 0) {
      return { ok: true, label: "Stock disponible para retiro inmediato" };
    }
    return { ok: false, label: "Sin stock disponible" };
  }, [product, selectedSize, sizeRow, totalStock]);

  useEffect(() => {
    if (!sizeRow) return;
    if (sizeRow.stock > 0 && qty > sizeRow.stock) setQty(sizeRow.stock);
    if (sizeRow.stock === 0 && qty !== 1) setQty(1);
  }, [sizeRow, qty]);

  const handleAdd = () => {
    if (!product) return;
    if (!selectedSize) {
      toast.error("Selecciona una talla");
      return;
    }
    if (!sizeRow || sizeRow.stock < qty) {
      toast.error("Stock insuficiente para la talla seleccionada");
      return;
    }
    addItem({
      product_id: product.id,
      school_name: product.school_name,
      product_name: product.name,
      size: selectedSize,
      quantity: qty,
      unit_price: sizeRow.price,
      image_url: product.image_url,
    });
    toast.success("Agregado al carrito");
    onOpenChange(false);
  };

  const goCheckout = () => {
    onOpenChange(false);
    navigate("/checkout");
  };

  if (!product) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-2xl w-[calc(100vw-1.5rem)] max-h-[min(90vh,860px)] overflow-y-auto p-0 gap-0 border-gray-200 sm:rounded-lg"
        data-testid="quick-shop-dialog"
      >
        <div className="grid sm:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] sm:max-h-[min(85vh,800px)]">
          <div className="aspect-[4/5] max-h-[42vh] sm:max-h-none sm:h-auto sm:min-h-[280px] bg-gray-50 border-b sm:border-b-0 sm:border-r border-gray-200 overflow-hidden">
            <img
              src={getProductImage(product.image_url)}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="p-5 sm:p-6 flex flex-col min-h-0 sm:overflow-y-auto">
            <DialogHeader className="text-left space-y-0">
              <p className="eyebrow">{product.school_name}</p>
              <DialogTitle className="mt-2 font-display text-2xl sm:text-3xl font-semibold tracking-tight text-left pr-6">
                {product.name}
              </DialogTitle>
            </DialogHeader>

            <p className="mt-3 font-display text-xl font-semibold">
              {formatCLP(sizeRow ? sizeRow.price : product.base_price)}
            </p>

            <div className="mt-3 flex items-center gap-2 text-sm text-gray-700">
              <span
                className={`inline-block w-2 h-2 shrink-0 rounded-full ${stockBanner.ok ? "bg-emerald-500" : "bg-gray-400"}`}
                aria-hidden
              />
              <span>{stockBanner.label}</span>
            </div>

            <div className="mt-6">
              <p className="eyebrow">Selecciona tu talla</p>
              <div className="mt-3 grid grid-cols-4 sm:grid-cols-5 gap-2">
                {(product.sizes || []).map((sz) => (
                  <button
                    key={sz.size}
                    type="button"
                    disabled={sz.stock === 0}
                    onClick={() => {
                      setSelectedSize(sz.size);
                      setQty(1);
                    }}
                    className={`size-pill ${selectedSize === sz.size ? "selected" : ""}`}
                    data-testid={`quick-shop-size-${sz.size}`}
                  >
                    {sz.size}
                  </button>
                ))}
              </div>
              {selectedSize && sizeRow && (
                <div className="mt-3 text-sm flex items-center gap-2">
                  {sizeRow.stock > 0 ? (
                    <>
                      <Check size={16} className="text-emerald-600 shrink-0" />
                      <span>
                        Talla {selectedSize}: {sizeRow.stock} unidades disponibles
                      </span>
                    </>
                  ) : (
                    <>
                      <X size={16} className="text-red-500 shrink-0" />
                      <span>Talla {selectedSize} sin stock</span>
                    </>
                  )}
                </div>
              )}
            </div>

            <div className="mt-6">
              <p className="eyebrow">Cantidad</p>
              <div className="mt-3 inline-flex items-center border border-gray-300">
                <button
                  type="button"
                  onClick={() => setQty((v) => Math.max(1, v - 1))}
                  className="px-4 py-2 hover:bg-gray-50"
                  data-testid="quick-shop-qty-minus"
                >
                  −
                </button>
                <span className="px-5 font-medium text-sm" data-testid="quick-shop-qty-value">
                  {qty}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setQty((v) =>
                      sizeRow && sizeRow.stock > 0 ? Math.min(sizeRow.stock, v + 1) : v + 1
                    )
                  }
                  disabled={Boolean(sizeRow) && sizeRow.stock < 1}
                  className="px-4 py-2 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                  data-testid="quick-shop-qty-plus"
                >
                  +
                </button>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <button
                type="button"
                onClick={handleAdd}
                disabled={!selectedSize || !sizeRow || sizeRow.stock < qty}
                className="w-full btn-brand py-3.5 text-sm font-medium tracking-wide rounded-sm disabled:bg-gray-300 disabled:cursor-not-allowed"
                data-testid="quick-shop-add-btn"
              >
                Agregar al carrito
              </button>
              <button
                type="button"
                onClick={goCheckout}
                className="w-full border border-gray-300 bg-white py-3 text-sm font-medium tracking-wide rounded-sm hover:border-black transition-colors"
                data-testid="quick-shop-checkout-btn"
              >
                Ir al checkout
              </button>
              <Link
                to={`/producto/${product.id}`}
                onClick={() => onOpenChange(false)}
                className="block text-center text-sm text-gray-600 underline underline-offset-4 hover:text-black"
                data-testid="quick-shop-full-page-link"
              >
                Ver ficha completa
              </Link>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-200 grid grid-cols-2 gap-3 text-xs text-gray-600">
              <div>
                <p className="eyebrow">Retiro</p>
                <p className="mt-1">Inmediato desde tienda</p>
              </div>
              <div>
                <p className="eyebrow">Pago</p>
                <p className="mt-1">Transferencia bancaria</p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
