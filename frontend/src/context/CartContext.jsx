import React, { createContext, useContext, useEffect, useState } from "react";

const CartContext = createContext(null);
const STORAGE_KEY = "tl_cart";

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });
  const [open, setOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addItem = (item) => {
    setItems((prev) => {
      const key = (i) => `${i.product_id}__${i.size}`;
      const idx = prev.findIndex((i) => key(i) === key(item));
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], quantity: next[idx].quantity + item.quantity };
        return next;
      }
      return [...prev, item];
    });
    setOpen(true);
  };

  const updateQty = (product_id, size, quantity) => {
    setItems((prev) =>
      prev
        .map((i) =>
          i.product_id === product_id && i.size === size
            ? { ...i, quantity: Math.max(1, quantity) }
            : i
        )
    );
  };

  const removeItem = (product_id, size) => {
    setItems((prev) => prev.filter((i) => !(i.product_id === product_id && i.size === size)));
  };

  const clear = () => setItems([]);

  const total = items.reduce((s, i) => s + i.unit_price * i.quantity, 0);
  const count = items.reduce((s, i) => s + i.quantity, 0);

  return (
    <CartContext.Provider
      value={{ items, addItem, updateQty, removeItem, clear, total, count, open, setOpen }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
