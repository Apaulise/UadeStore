import React, { createContext, useContext, useMemo, useState } from "react";

// Contexto liviano para persistir la orden recién confirmada entre Checkout y Success.
// Servirá luego para sincronizar con Supabase o Rabbit.
const PendingOrderContext = createContext(null);

export const PendingOrderProvider = ({ children }) => {
  const [lastOrder, setLastOrder] = useState(null);

  const value = useMemo(
    () => ({
      lastOrder,
      setLastOrder,
      clearLastOrder: () => setLastOrder(null),
    }),
    [lastOrder]
  );

  return (
    <PendingOrderContext.Provider value={value}>
      {children}
    </PendingOrderContext.Provider>
  );
};

export const usePendingOrder = () => {
  const ctx = useContext(PendingOrderContext);
  if (!ctx) {
    throw new Error("usePendingOrder must be used within PendingOrderProvider");
  }
  return ctx;
};
