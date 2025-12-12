// frontend/src/services/api.js

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3001/api";

// 👇 HELPER: Busca el token guardado (Asegurate que en AuthContext lo guardes como 'authToken')
const getToken = () => localStorage.getItem('authToken'); 

async function http(path, options = {}) {
  // 1. Preparamos los headers base
  const headers = { 
    "Content-Type": "application/json", 
    ...(options.headers || {}) 
  };

  // 2. MAGIA 🪄: Si hay token, lo agregamos automáticamente
  const token = getToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  // 3. Hacemos la petición con los headers actualizados
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers, // Usamos nuestros headers con token
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    // Intentamos parsear el JSON de error si existe
    try {
        const jsonError = JSON.parse(text);
        throw new Error(jsonError.message || `HTTP ${res.status}`);
    } catch (e) {
        throw new Error(`HTTP ${res.status} ${text}`);
    }
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
  create: (payload) =>
    http(`/products`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  update: (id, payload) =>
    http(`/products/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),
  delete: (id) =>
    http(`/products/${id}`, {
      method: "DELETE",
    }),
  colors: () => http("/products/colors"),
  sizes: () => http("/products/sizes"),
};

// Órdenes
export const OrdersAPI = {
  mine: (userId) => http(`/orders/me?userId=${userId}`),

  create: ({ items, total, userId }) =>
    http("/orders", {
      method: "POST",
      body: JSON.stringify({ items, total, userId }), 
    }),
};

// Carrito
export const CartAPI = {
  get: (userId) => http(`/cart?userId=${userId}`),

  addItem: ({ stockId, quantity = 1, userId }) =>
    http("/cart", {
      method: "POST",
      body: JSON.stringify({ stockId, quantity, userId }),
    }),

  updateQuantity: ({ cartId, quantity, userId }) =>
    http(`/cart/${cartId}`, {
      method: "PATCH",
      body: JSON.stringify({ quantity, userId }),
    }),

  remove: ({ cartId, userId }) =>
    http(`/cart/${cartId}`, {
      method: "DELETE",
      body: JSON.stringify({ userId }),
    }),

  clear: (userId) =>
    http("/cart", {
      method: "DELETE",
      body: JSON.stringify({ userId }),
    }),
};

// Wallet (Billetera)
export const WalletAPI = {
  // Al llamar a http(), automáticamente se pegará el token en el header Authorization
  getMine: () => http('/wallet/mine') 
};