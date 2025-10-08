import React from "react";
import { useCart } from "../../context/CartContext";

const CloseIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" {...props}>
    <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const TrashIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" {...props}>
    <path d="M3 6h18M9 6V4h6v2m-8 0l1 14a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2l1-14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const CartDrawer = () => {
  const { items, isOpen, close, removeItem, increment, decrement, total } = useCart();

  return (
    <div className={`fixed inset-0 z-50 ${isOpen ? "pointer-events-auto" : "pointer-events-none"}`} aria-hidden={!isOpen}>
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black/30 transition-opacity ${isOpen ? "opacity-100" : "opacity-0"}`}
        onClick={close}
      />

      {/* Panel */}
      <aside
        className={`absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Carrito de compras"
      >
        <div className="flex items-center justify-between border-b px-5 py-4">
          <h2 className="text-lg font-bold">Carrito de Compras</h2>
          <button onClick={close} aria-label="Cerrar carrito" className="rounded p-1 hover:bg-black/5">
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="divide-y overflow-y-auto px-5">
          {items.length === 0 && (
            <p className="py-8 text-center text-sm text-gray-600">Tu carrito está vacío.</p>
          )}

          {items.map((item, idx) => (
            <div key={`${item.id}-${item.size || "_"}-${item.color || "_"}-${idx}`} className="flex gap-3 py-4">
              <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md bg-gray-200">
                {item.image ? (
                  <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                ) : null}
              </div>
              <div className="flex min-w-0 flex-1 flex-col">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{item.name}</p>
                    {item.color && <p className="text-xs text-gray-600">{item.color}</p>}
                    {item.size && <p className="text-xs text-gray-600">Talle: {item.size}</p>}
                    <p className="text-xs text-gray-600">Cantidad: {item.quantity}</p>
                  </div>
                  <p className="whitespace-nowrap text-sm font-bold">${(Number(item.price) * (item.quantity || 1)).toFixed(2)}</p>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button onClick={() => decrement(item.id, { size: item.size, color: item.color })} className="h-6 w-6 rounded bg-gray-200 text-sm font-semibold">-</button>
                    <span className="w-6 text-center text-sm">{item.quantity}</span>
                    <button onClick={() => increment(item.id, { size: item.size, color: item.color })} className="h-6 w-6 rounded bg-gray-200 text-sm font-semibold">+</button>
                  </div>
                  <button
                    onClick={() => removeItem(item.id, { size: item.size, color: item.color })}
                    className="rounded p-1 text-gray-600 hover:bg-black/5"
                    aria-label="Eliminar del carrito"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-auto border-t px-5 py-4">
          <div className="flex items-center justify-between text-sm font-semibold">
            <span>Total:</span>
            <span>${total.toFixed(2)}</span>
          </div>
          <button className="mt-3 w-full rounded-lg bg-[#1F3B67] py-2 text-white transition hover:brightness-110">
            Comprar
          </button>
        </div>
      </aside>
    </div>
  );
};

export default CartDrawer;
