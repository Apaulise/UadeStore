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



// frontend/src/services/api.js

// ... (todo tu código anterior de http, ProductsAPI, etc. dejalo igual) ...

// 👇 CAMBIAMOS ESTO PARA PEGARLE DIRECTO AL CORE
export const WalletAPI = {
  getMine: async () => {
    // 1. URL Directa de AWS (Core)
    const CORE_URL = "https://jtseq9puk0.execute-api.us-east-1.amazonaws.com";
    
    // 2. Recuperamos el token manualmente
    const token = localStorage.getItem('authToken');
    console.log("Token de auth recuperado en WalletAPI:", token);
    console.log("CORE_URL usada en WalletAPI:", CORE_URL);
    
    // 3. Fetch directo a AWS
    const res = await fetch(`${CORE_URL}/api/wallets/mine`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}` // Le pegamos el token aquí
      }
    });

    if (!res.ok) {
       throw new Error(`Error del Core: ${res.status}`);
    }

    const json = await res.json();
    
    // 4. Devolvemos el dato limpio (el primer objeto del array 'data')
    // El Core devuelve: { success: true, data: [ { balance: ... } ] }
    return json.data && json.data[0] ? json.data[0] : null;
  },

  pay: async ({ fromWalletId, amount, currency, description }) => {
    const CORE_URL = "https://jtseq9puk0.execute-api.us-east-1.amazonaws.com";
    const token = localStorage.getItem('authToken');

    const payload = {
      from: fromWalletId,   // El UUID de TU billetera
      to: "SYSTEM",         // ⚠️ REGLA DE NEGOCIO: Para compras, va a SYSTEM
      currency: currency,   // Ej: "ARG" o "USD"
      amount: Number(amount),
      type: "payment",      // Tipo de movimiento
      description: description // Ej: "Compra orden #123"
    };

    const res = await fetch(`${CORE_URL}/api/transfers`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const errorText = await res.text().catch(() => "");
      throw new Error(`Error en el pago: ${errorText || res.status}`);
    }

    return await res.json();
  }

};