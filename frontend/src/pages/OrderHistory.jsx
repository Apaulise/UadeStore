import React, { useEffect, useMemo, useState } from 'react';
import { formatOrderDate } from '../data/orders';
import { usePendingOrder } from '../context/PendingOrderContext';
import { OrdersAPI } from '../services/api.js';

const PAGE_SIZE = 5;

const currencyFormatter = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  minimumFractionDigits: 2,
});

const SearchIcon = () => (
  <svg
    aria-hidden="true"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="h-4 w-4 text-brand-text/60"
  >
    <path
      d="m20 20-4.35-4.35m1.1-3.73a5.85 5.85 0 1 1-11.7 0 5.85 5.85 0 0 1 11.7 0Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const OrderHistory = () => {
  const { lastOrder } = usePendingOrder();
  const [query, setQuery] = useState('');
  const [orders, setOrders] = useState([]);
  const [totalOrders, setTotalOrders] = useState(0);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const userId = 1;

  useEffect(() => {
    let isMounted = true;

    const fetchOrders = async () => {
      if (!userId) {
        setOrders([]);
        setTotalOrders(0);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);
      try {
        const response = await OrdersAPI.mine({ userId, page, limit: PAGE_SIZE });
        if (!isMounted) return;

        const adaptedOrders =
          response?.items?.map((order) => ({
            id: order.id,
            createdAt: order.created_at,
            total: order.total_compra ?? order.total ?? 0,
            items:
              order.Item_compra?.map((item) => {
                const articulo = item.Stock?.Articulo;
                const imagen = articulo?.Imagen?.[0]?.imagen ?? null;
                return {
                  id: item.id,
                  quantity: item.cantidad ?? 0,
                  price: item.subtotal ?? 0,
                  name: articulo?.Titulo ?? 'Producto',
                  image: imagen,
                  size: item.Stock?.talle ?? null,
                  color: item.Stock?.Color?.nombre ?? null,
                };
              }) ?? [],
          })) ?? [];

        setOrders(adaptedOrders);
        setTotalOrders(response?.total ?? adaptedOrders.length);
      } catch (err) {
        console.error('Fallo fetchOrders:', err);
        if (!isMounted) return;
        setError(err.message || 'Ocurrio un error inesperado.');
        setOrders([]);
        setTotalOrders(0);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchOrders();

    return () => {
      isMounted = false;
    };
  }, [userId, page]);

  useEffect(() => {
    setPage(1);
  }, [query]);

  const baseOrders = useMemo(() => {
    const combined = [...orders];
    if (lastOrder) {
      const exists = combined.some((order) => order.id === lastOrder.id);
      if (!exists) {
        combined.unshift({
          id: lastOrder.id || `temp-${Date.now()}`,
          createdAt: lastOrder.createdAt,
          total: lastOrder.total || 0,
          items: lastOrder.items || [],
        });
      }
    }
    return combined;
  }, [orders, lastOrder]);

  const sortedOrders = useMemo(
    () =>
      baseOrders
        .slice()
        .sort(
          (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime(),
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

  const displayOrders = filteredOrders.slice(0, PAGE_SIZE);
  const effectiveTotal = query.trim()
    ? filteredOrders.length
    : Math.max(totalOrders, filteredOrders.length);
  const totalPages = effectiveTotal > 0 ? Math.ceil(effectiveTotal / PAGE_SIZE) : 1;

  const handlePrevPage = () => setPage((prev) => Math.max(1, prev - 1));
  const handleNextPage = () => setPage((prev) => Math.min(totalPages, prev + 1));

  return (
    <div className="min-h-[70vh] bg-brand-cream text-brand-text">
      <div className="mx-auto max-w-4xl px-5 py-10">
        <h1 className="text-3xl font-bold">Mis Compras</h1>

        <div className="relative mt-6 w-full max-w-sm">
          <label className="sr-only" htmlFor="order-history-search">
            Buscar compra
          </label>
          <input
            id="order-history-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar"
            className="w-full rounded-full border border-black/15 bg-white py-2 pl-10 pr-3 text-sm text-brand-text placeholder:text-brand-text/50 shadow-sm focus:border-brand-blue focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
          />
          <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">
            <SearchIcon />
          </div>
        </div>

        {isLoading ? (
          <div className="mt-12 rounded-2xl p-8 text-center text-sm text-brand-text/70">
            Cargando tu historial de compras...
          </div>
        ) : error ? (
          <div className="mt-12 rounded-2xl border border-red-400 bg-red-100 p-8 text-center text-sm text-red-700">
            <strong>Error:</strong> {error}
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="mt-12 rounded-2xl border border-dashed border-brand-blue/40 bg-white p-8 text-center text-sm text-brand-text/70">
            {query.trim()
              ? 'No hay compras que coincidan con tu busqueda.'
              : 'Aun no tienes compras en tu historial.'}
          </div>
        ) : (
          <div className="mt-10 space-y-8">
            {displayOrders.map((order) => (
              <section
                key={order.id}
                className="overflow-hidden rounded-3xl border border-black/10 bg-[#EFE7DE] shadow-sm"
              >
                <header className="border-b border-black/10 bg-white/40 px-6 py-4 text-sm font-semibold uppercase tracking-wide text-brand-text/70">
                  {formatOrderDate(order.createdAt) || 'Sin fecha'}
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
                          <p className="text-sm font-semibold text-brand-text">{item.name}</p>
                          <p className="text-xs text-brand-text/70">{item.color ?? 'Color: N/A'}</p>
                          <p className="text-xs text-brand-text/70">
                            Cantidad: {item.quantity}
                            {item.size ? ` - Talle: ${item.size}` : ''}
                          </p>
                        </div>
                      </div>
                      <span className="text-sm font-semibold text-brand-text">
                        {currencyFormatter.format((Number(item.price) || 0) * (item.quantity || 1))}
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

            {effectiveTotal > 0 && (
              <div className="flex items-center justify-between rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-brand-text">
                <span>
                  Pagina {page} de {totalPages}
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handlePrevPage}
                    disabled={page === 1}
                    className="rounded-full border border-black/20 px-3 py-1 font-semibold disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Anterior
                  </button>
                  <button
                    type="button"
                    onClick={handleNextPage}
                    disabled={page === totalPages || effectiveTotal === 0}
                    className="rounded-full border border-black/20 px-3 py-1 font-semibold disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Siguiente
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderHistory;
