import 'dotenv/config';

const CORE_URL = process.env.CORE_BACKEND_URL;

export const getMyBalanceService = async (userToken) => {
  if (!CORE_URL) throw new Error("CORE_BACKEND_URL no definida");

  try {
    // Construimos la URL completa: https://...amazonaws.com/api/wallets/mine
    const response = await fetch(`${CORE_URL}/api/wallets/mine`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${userToken}`, // El token viaja aquí
        'Content-Type': 'application/json'
        // Nota: La cookie de refresh_token no suele ser necesaria para leer datos,
        // con el Bearer token debería alcanzar.
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Error del Core: ${response.status}`);
    }

    const json = await response.json();
    
    // LA RESPUESTA VIENE ASÍ: { success: true, data: [ { balance: ... } ] }
    // Vamos a devolver solo el primer objeto de la billetera para facilitarte la vida
    if (json.data && json.data.length > 0) {
        return json.data[0]; 
    }

    return null; // O un objeto vacío si no tiene billetera

  } catch (error) {
    console.error("Error al obtener wallet:", error.message);
    throw error;
  }
};