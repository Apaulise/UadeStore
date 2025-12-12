// frontend/src/services/api.js

//para centralizar llamadas (luego lo usarás en páginas/contexts):

//Con esto, cuando tengas el backend levantado, el front ya puede consumir datos reales sin tocar más configuración.

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3001/api";



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



// Órdenes (lo que otros consumen de nosotros)

export const OrdersAPI = {

  mine: (userId) => http(`/orders/me?userId=${userId}`),



  create: ({ items, total, userId }) =>

    http("/orders", { // Ya no lo mandamos por URL

      method: "POST",

      body: JSON.stringify({ items, total, userId }),

    }),

};



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



export const WalletAPI = {

  getMine: () => http('/wallet/mine')

};