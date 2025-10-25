import React, { useMemo, useState, useEffect } from 'react';
import { formatOrderDate } from '../data/orders';
import { usePendingOrder } from '../context/PendingOrderContext';

// --- PASO 1 (MODIFICADO): Importar la API centralizada ---
// Asegúrate de que la ruta sea correcta (el mismo problema de antes)
import { OrdersAPI } from '../services/api.js'; 
//import { useUser } from '@supabase/auth-helpers-react';

const currencyFormatter = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
});

const OrderHistory = () => {
  const { lastOrder } = usePendingOrder();
  const [query, setQuery] = useState('');

  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const userId = 1
  //const user = useUser();
  //const userId = user?.id; // Obtiene el ID del usuario real
  
  console.log('ID de Usuario detectado:', userId);

 useEffect(() => {
    // Si no hay ID de usuario (no logueado), no hagas nada.
    if (!userId) {
      setIsLoading(false);
      setOrders([]);
      return;
    }

    const fetchOrders = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // --- LLAMADA A TU API CENTRAL ---
        const dataFromApi = await OrdersAPI.mine(userId);

        console.log('Datos recibidos de la API:', dataFromApi);

        // --- PASO 3: "Aplanar" y "Traducir" los datos ---
        // Este es el "traductor" que convierte la respuesta
        // anidada del backend a lo que tu JSX espera.
        const adaptedOrders = dataFromApi.map(order => ({
          id: order.id,
          createdAt: order.created_at, // Backend 'created_at' -> 'createdAt'
          total: order.total,
          
          // Mapeamos los 'purchase_items' anidados
          items: order.Item_compra.map(item => {
            // Sacamos el artículo de la estructura anidada
            
            return {
              id: item.id,
              quantity: item.cantidad,
              price: item.subtotal, 
              name: item.Stock.Articulo.Titulo,
              image: item.Stock.Articulo.Imagen[0],
              size: item.Stock.talle,
              color: item.Stock.Color.nombre,
            };
          })
        }));

        setOrders(adaptedOrders); // Guardamos los datos adaptados

      } catch (err) {
        console.error('Falló el fetchOrders:', err);
        // La función 'http' de tu api.js ya formatea bien el error
        setError(err.message || 'Ocurrió un error inesperado.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, [userId]); // Se ejecuta si 'userId' cambia

  
  // --- (Toda la lógica de 'useMemo' y el JSX de abajo sigue 100% igual) ---
  
  const baseOrders = useMemo(() => {
    const combined = [...orders]; 
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
  }, [orders, lastOrder]);

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

        {/* --- Input de búsqueda (sin cambios) --- */}
        <div className="relative mt-6 w-full max-w-sm">
          <label className="sr-only" htmlFor="order-history-search">
            Buscar compra
          </label>
          {/* ... (el resto del input y el ícono de SVG va aquí) ... */}
          <input
            id="order-history-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar"
            className="w-full rounded-full border border-black/15 bg-white py-2 pl-10 pr-3 text-sm text-brand-text placeholder:text-brand-text/50 shadow-sm focus:border-brand-blue focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
          />
        </div>

        {/* --- Lógica de Carga / Error / Lista (sin cambios) --- */}
        {isLoading ? (
          <div className="mt-12 rounded-2xl p-8 text-center text-sm text-brand-text/70">
            Cargando tu historial de compras... ⏳
          </div>
        ) : error ? (
          <div className="mt-12 rounded-2xl border border-red-400 bg-red-100 p-8 text-center text-sm text-red-700">
            <strong>Error:</strong> {error}
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="mt-12 rounded-2xl border border-dashed border-brand-blue/40 bg-white p-8 text-center text-sm text-brand-text/70">
             {query.trim() 
               ? 'No hay compras que coincidan con tu búsqueda.' 
               : 'Aún no tienes compras en tu historial.'
            }
          </div>
        ) : (
          // --- ✅ BLOQUE CORREGIDO ---
          // Aquí restauramos tu JSX original para el .map()
          <div className="mt-10 space-y-8">
            {filteredOrders.map((order) => (
              <section
                key={order.id}
                className="overflow-hidden rounded-3xl border border-black/10 bg-[#EFE7DE] shadow-sm"
              >
                <header className="border-b border-black/10 bg-white/40 px-6 py-4 text-sm font-semibold uppercase tracking-wide text-brand-text/70">
                  {/* Asumiendo que tu API devuelve 'createdAt' o 'created_at' y tu 'adapter' lo mapea a 'createdAt' */}
                  {formatOrderDate(order.createdAt)}
                </header>

                <ul className="divide-y divide-black/10 bg-[#EFE7DE]">
                  {/* Asumiendo que tu API devuelve 'items' */}
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
