import { getMyBalanceService } from '../services/wallet.service.js';

export const getBalanceController = async (req, res) => {
  try {
    // 1. Extraemos el token que viene desde el Frontend
    // El formato suele ser "Bearer eyJhbGci..."
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({ message: "No se proporcionó token de autorización" });
    }

    // Limpiamos la palabra "Bearer " para quedarnos solo con el código
    const token = authHeader.split(' ')[1]; 

    if (!token) {
        return res.status(401).json({ message: "Formato de token inválido" });
    }

    // 2. Llamamos al servicio pasando el token limpio
    const walletData = await getMyBalanceService(token);

    // 3. Devolvemos la info al frontend
    res.status(200).json(walletData);

  } catch (error) {
    // Si es un error de autenticación del Core, devolvemos 401, sino 500
    const statusCode = error.message.includes('401') ? 401 : 500;
    
    res.status(statusCode).json({
      message: 'Error al consultar el saldo',
      error: error.message
    });
  }
};