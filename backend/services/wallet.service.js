import 'dotenv/config';
const CORE_URL = process.env.CORE_ENDPOINT ;

export const getMyBalanceService = async (userToken) => {
  if (!CORE_URL) {
    throw new Error("La URL del Core no está configurada en .env");
  }

  try {
    // Hacemos la petición al endpoint que nos pasaste
    const response = await fetch(`${CORE_URL}/api/wallets/mine`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${userToken}`, // 🔑 Pasamos el token del usuario
        'Content-Type': 'application/json'
      }
    });

    // Si el Core responde error (ej: 401 token vencido, 404 no tiene wallet)
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Error del Core: ${response.status}`);
    }

    const data = await response.json();
    return data; // Devolvemos la info de la wallet (saldo, moneda, etc.)

  } catch (error) {
    console.error("Error en getMyBalanceService:", error.message);
    throw error;
  }
};