import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api, formatCLP, resolveImage } from "../lib/api";
import { useCart } from "../context/CartContext";
import { ChevronLeft, Check, X } from "lucide-react";
import { toast } from "sonner";

const ProductPage = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState(null);
  const [qty, setQty] = useState(1);
  const { addItem } = useCart();

  useEffect(() => {
    setLoading(true);
    api.get(`/products/${id}`).then((r) => setProduct(r.data)).catch(() => setProduct(null)).finally(() => setLoading(false));
  }, [id]);

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

  if (loading) return <div className="max-w-7xl mx-auto px-4 py-24 text-gray-500" data-testid="product-loading">Cargando...</div>;
  if (!product) return <div className="max-w-7xl mx-auto px-4 py-24" data-testid="product-not-found">Producto no encontrado.</div>;

  const handleAdd = () => {
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
  };

  return (
    <div data-testid="product-page">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link to={`/colegio/${product.school_slug}`} className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-black" data-testid="back-school-link">
          <ChevronLeft size={16} /> Volver a {product.school_name}
        </Link>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 grid md:grid-cols-2 gap-10 lg:gap-20">
        <div className="aspect-[4/5] bg-gray-50 border border-gray-200 overflow-hidden">
          <img src={resolveImage(product.image_url)} alt={product.name} className="w-full h-full object-cover" data-testid="product-image" />
        </div>

        <div className="flex flex-col">
          <p className="eyebrow">{product.school_name}</p>
          <h1 className="mt-2 font-display text-3xl md:text-5xl font-semibold tracking-tight" data-testid="product-name">
            {product.name}
          </h1>
          <p className="mt-3 font-display text-2xl font-semibold" data-testid="product-price">
            {formatCLP(sizeRow ? sizeRow.price : product.base_price)}
          </p>

          <div className="mt-4 flex items-center gap-2 text-sm text-gray-700" data-testid="product-immediate-stock">
            <span
              className={`inline-block w-2 h-2 shrink-0 rounded-full ${stockBanner.ok ? "bg-emerald-500" : "bg-gray-400"}`}
              aria-hidden
            />
            <span>{stockBanner.label}</span>
          </div>

          <div className="mt-10">
            <p className="eyebrow">Selecciona tu talla</p>
            <div className="mt-3 grid grid-cols-4 sm:grid-cols-6 gap-2" data-testid="size-selector">
              {(product.sizes || []).map((sz) => (
                <button
                  key={sz.size}
                  disabled={sz.stock === 0}
                  onClick={() => { setSelectedSize(sz.size); setQty(1); }}
                  className={`size-pill ${selectedSize === sz.size ? "selected" : ""}`}
                  data-testid={`size-${sz.size}`}
                >
                  {sz.size}
                </button>
              ))}
            </div>
            {selectedSize && sizeRow && (
              <div className="mt-3 text-sm flex items-center gap-2" data-testid="size-stock-info">
                {sizeRow.stock > 0 ? (
                  <><Check size={16} className="text-emerald-600" /> Talla {selectedSize}: {sizeRow.stock} unidades disponibles</>
                ) : (
                  <><X size={16} className="text-red-500" /> Talla {selectedSize} sin stock</>
                )}
              </div>
            )}
          </div>

          <div className="mt-8">
            <p className="eyebrow">Cantidad</p>
            <div className="mt-3 inline-flex items-center border border-gray-300">
              <button
                onClick={() => setQty((v) => Math.max(1, v - 1))}
                className="px-4 py-2 hover:bg-gray-50"
                data-testid="qty-decrement-btn"
              >
                −
              </button>
              <span className="px-5 font-medium text-sm" data-testid="qty-value">{qty}</span>
              <button
                onClick={() =>
                  setQty((v) =>
                    sizeRow && sizeRow.stock > 0 ? Math.min(sizeRow.stock, v + 1) : v + 1
                  )
                }
                disabled={Boolean(sizeRow) && sizeRow.stock < 1}
                className="px-4 py-2 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                data-testid="qty-increment-btn"
              >
                +
              </button>
            </div>
          </div>

          <button
            onClick={handleAdd}
            disabled={!selectedSize || !sizeRow || sizeRow.stock < qty}
            className="mt-10 btn-brand py-4 w-full sm:w-auto sm:px-12 text-sm font-medium tracking-wide rounded-sm disabled:bg-gray-300 disabled:cursor-not-allowed"
            data-testid="add-to-cart-btn"
          >
            Agregar al carrito
          </button>

          <div className="mt-10 border-t border-gray-200 pt-6 grid grid-cols-2 gap-4 text-sm text-gray-600">
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
    </div>
  );
};

export default ProductPage;
