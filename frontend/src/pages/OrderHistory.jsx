import React, { useMemo, useState } from 'react';
import { mockOrders, formatOrderDate } from '../data/orders';
import { usePendingOrder } from '../context/PendingOrderContext';

const currencyFormatter = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
});

const OrderHistory = () => {
  const { lastOrder } = usePendingOrder();
  const [query, setQuery] = useState('');

  const baseOrders = useMemo(() => {
    const combined = [...mockOrders];
    if (lastOrder) {
      const exists = combined.some((order) => order.id === lastOrder.id);
      if (!exists) {
        combined.push({
          id: lastOrder.id || `order-${lastOrder.createdAt}`,
          createdAt: lastOrder.createdAt,
          items: lastOrder.items || [],
          total: lastOrder.total || 0,
        });
      }
    }
    return combined;
  }, [lastOrder]);

  const sortedOrders = useMemo(
    () =>
      baseOrders
        .slice()
        .sort(
          (a, b) =>
            new Date(b.createdAt || 0).getTime() -
            new Date(a.createdAt || 0).getTime(),
        ),
    [baseOrders],
  );

  const filteredOrders = useMemo(() => {
    if (!query.trim()) return sortedOrders;
    const term = query.trim().toLowerCase();
    return sortedOrders.filter((order) =>
      order.items?.some((item) =>
        [item.name, item.color, item.size]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
          .includes(term),
      ),
    );
  }, [sortedOrders, query]);

  return (
    <div className="min-h-[70vh] bg-brand-cream text-brand-text">
      <div className="mx-auto max-w-4xl px-5 py-10">
        <h1 className="text-3xl font-bold">Mis Compras</h1>

        <div className="relative mt-6 w-full max-w-sm">
          <label className="sr-only" htmlFor="order-history-search">
            Buscar compra
          </label>
          <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-brand-text/60">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="h-5 w-5"
              aria-hidden="true"
            >
              <path
                d="m20 20-4.35-4.35m1.1-3.73a5.85 5.85 0 1 1-11.7 0 5.85 5.85 0 0 1 11.7 0Z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <input
            id="order-history-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar"
            className="w-full rounded-full border border-black/15 bg-white py-2 pl-10 pr-3 text-sm text-brand-text placeholder:text-brand-text/50 shadow-sm focus:border-brand-blue focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
          />
        </div>

        {filteredOrders.length === 0 ? (
          <div className="mt-12 rounded-2xl border border-dashed border-brand-blue/40 bg-white p-8 text-center text-sm text-brand-text/70">
            Aún no registramos compras con ese criterio. Volvé a intentarlo o
            seguí explorando el catálogo.
          </div>
        ) : (
          <div className="mt-10 space-y-8">
            {filteredOrders.map((order) => (
              <section
                key={order.id}
                className="overflow-hidden rounded-3xl border border-black/10 bg-[#EFE7DE] shadow-sm"
              >
                <header className="border-b border-black/10 bg-white/40 px-6 py-4 text-sm font-semibold uppercase tracking-wide text-brand-text/70">
                  {formatOrderDate(order.createdAt)}
                </header>

                <ul className="divide-y divide-black/10 bg-[#EFE7DE]">
                  {order.items?.map((item, index) => (
                    <li
                      key={`${order.id}-${item.id}-${index}`}
                      className="flex items-center justify-between gap-4 px-6 py-4"
                    >
                      <div className="flex items-center gap-4">
                        <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-xl bg-white shadow">
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="h-full w-full object-cover"
                              loading="lazy"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-[10px] text-brand-text/50">
                              Sin imagen
                            </div>
                          )}
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-semibold text-brand-text">
                            {item.name}
                          </p>
                          <p className="text-xs text-brand-text/70">
                            {item.color ?? 'Color: N/A'}
                          </p>
                          <p className="text-xs text-brand-text/70">
                            Cantidad: {item.quantity}
                            {item.size ? ` · Talle: ${item.size}` : ''}
                          </p>
                        </div>
                      </div>
                      <span className="text-sm font-semibold text-brand-text">
                        {currencyFormatter.format(
                          (Number(item.price) || 0) * (item.quantity || 1),
                        )}
                      </span>
                    </li>
                  ))}
                </ul>

                <footer className="flex items-center justify-between bg-white px-6 py-4 text-sm font-semibold text-brand-text">
                  <span>Total:</span>
                  <span>{currencyFormatter.format(order.total || 0)}</span>
                </footer>
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderHistory;
