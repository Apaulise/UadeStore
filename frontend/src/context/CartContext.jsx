import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

// Cart item shape (future DB-ready):
// { id, name, price, image, color, size, quantity }

const CartContext = createContext(null);

const STORAGE_KEY = "uadestore_cart_v1";

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  // Load from localStorage (placeholder until backend integration)
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch (_) {
      // ignore
    }
  }, []);

  // Persist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (_) {
      // ignore
    }
  }, [items]);

  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);
  const toggle = () => setIsOpen((v) => !v);

  const addItem = (item) => {
    // Merge by id+size+color to avoid duplicates
    setItems((prev) => {
      const idx = prev.findIndex(
        (i) => i.id === item.id && i.size === item.size && i.color === item.color && i.image === item.image
      );
      if (idx !== -1) {
        const next = [...prev];
        next[idx] = { ...next[idx], quantity: (next[idx].quantity || 1) + (item.quantity || 1) };
        return next;
      }
      return [...prev, { ...item, quantity: item.quantity || 1 }];
    });
    setIsOpen(true);
  };

  const removeItem = (id, { size, color } = {}) => {
    setItems((prev) => prev.filter((i) => !(i.id === id && i.size === size && i.color === color)));
  };

  const increment = (id, { size, color } = {}) => {
    setItems((prev) =>
      prev.map((i) =>
        i.id === id && i.size === size && i.color === color && i.image === i.image
          ? { ...i, quantity: (i.quantity || 1) + 1 }
          : i
      )
    );
  };

  const decrement = (id, { size, color } = {}) => {
    setItems((prev) =>
      prev
        .map((i) =>
          i.id === id && i.size === size && i.color === color
            ? { ...i, quantity: Math.max(1, (i.quantity || 1) - 1) }
            : i
        )
        .filter(Boolean)
    );
  };

  const clear = () => setItems([]);

  const total = useMemo(() => items.reduce((acc, i) => acc + (Number(i.price) || 0) * (i.quantity || 1), 0), [items]);

  const value = {
    items,
    isOpen,
    open,
    close,
    toggle,
    addItem,
    removeItem,
    increment,
    decrement,
    clear,
    total,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
};
