// frontend/src/services/api.js
//para centralizar llamadas (luego lo usarás en páginas/contexts):
//Con esto, cuando tengas el backend levantado, el front ya puede consumir datos reales sin tocar más configuración.
const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000/api";

async function http(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status} ${text}`);
  }
  return res.status !== 204 ? res.json() : null;
}

// Productos
export const ProductsAPI = {
  list: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return http(`/products${qs ? `?${qs}` : ""}`);
  },
  get: (id) => http(`/products/${id}`),
};

// Órdenes (lo que otros consumen de nosotros)
export const OrdersAPI = {
  mine: (userId = 1) => http(`/orders/me?userId=${userId}`), // MOCK userId
  create: ({ items, total, userId = 1 }) =>
    http(`/orders?userId=${userId}`, {
      method: "POST",
      body: JSON.stringify({ items, total }),
    }),
};
