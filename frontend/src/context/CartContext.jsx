import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { CartAPI } from "../services/api";
import { useAuth } from '../context/AuthContext';

const CartContext = createContext(null);

const normalizeItems = (items = []) =>
  items.map((item) => ({
    ...item,
    id: item.cartId ?? item.id,
  }));

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  const userId = user?.sub;
  const syncCart = useCallback((cart) => {
    if (!cart) return;
    setItems(normalizeItems(cart.items));
    setTotal(Number(cart.total ?? 0));
  }, []);

  const fetchCart = useCallback(async () => {
    console.log("Fetching cart for userId:", userId);
    setIsLoading(true);
    try {
      const cart = await CartAPI.get(userId);
      syncCart(cart);
      setError(null);
    } catch (err) {
      console.error("Error al obtener el carrito", err);
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, [syncCart]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);
  const toggle = () => setIsOpen((v) => !v);

  const handleRequest = useCallback(
    async (requestFn) => {
      setIsLoading(true);
      try {
        const cart = await requestFn();
        syncCart(cart);
        setError(null);
        return cart;
      } catch (err) {
        console.error("Error en operación del carrito", err);
        setError(err);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [syncCart],
  );

  const addItem = useCallback(
    async ({ stockId, quantity = 1 }) => {
      const cart = await handleRequest(() =>
        CartAPI.addItem({ stockId, quantity, userId: userId }),
      );
      setIsOpen(true);
      return cart;
    },
    [handleRequest],
  );

  const findItemByCartId = useCallback(
    (cartId) => items.find((item) => item.cartId === cartId || item.id === cartId),
    [items],
  );

  const updateQuantity = useCallback(
    async (cartId, nextQuantity) => {
      if (!cartId) return;
      const safeQuantity = Math.max(1, Number.parseInt(nextQuantity, 10) || 1);
      await handleRequest(() =>
        CartAPI.updateQuantity({
          cartId,
          quantity: safeQuantity,
          userId: userId,
        }),
      );
    },
    [handleRequest],
  );

  const increment = useCallback(
    async (cartId) => {
      const item = findItemByCartId(cartId);
      const nextQuantity = (item?.quantity ?? 1) + 1;
      await updateQuantity(item?.cartId ?? cartId, nextQuantity);
    },
    [findItemByCartId, updateQuantity],
  );

  const decrement = useCallback(
    async (cartId) => {
      const item = findItemByCartId(cartId);
      const nextQuantity = Math.max(1, (item?.quantity ?? 1) - 1);
      await updateQuantity(item?.cartId ?? cartId, nextQuantity);
    },
    [findItemByCartId, updateQuantity],
  );

  const removeItem = useCallback(
    async (cartId) => {
      await handleRequest(() =>
        CartAPI.remove({
          cartId,
          userId: userId,
        }),
      );
    },
    [handleRequest],
  );

  const clear = useCallback(async () => {
    await handleRequest(() => CartAPI.clear(userId));
  }, [handleRequest]);

  const value = useMemo(
    () => ({
      items,
      total,
      isOpen,
      isLoading,
      error,
      open,
      close,
      toggle,
      addItem,
      removeItem,
      increment,
      decrement,
      clear,
      refresh: fetchCart,
    }),
    [
      items,
      total,
      isOpen,
      isLoading,
      error,
      addItem,
      removeItem,
      increment,
      decrement,
      clear,
      fetchCart,
    ],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
// eslint-disable-next-line react-refresh/only-export-components
export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
};
