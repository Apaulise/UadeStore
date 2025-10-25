import * as purchaseService from '../services/purchase.service.js';

 export const createPurchaseController = async (req, res) => {
  try {
    // Aquí podrías añadir validación del req.body
    const purchaseData = req.body;
    // Asume que obtienes userId de alguna forma (ej: autenticación, o viene en el body)
    // Para simplificar, lo tomamos del body por ahora
    console.log("info de orden controller", purchaseData)
   /* if (!purchaseData.userId) {
        return res.status(400).json({ message: 'userId es requerido'});
    }*/

    const newOrder = await purchaseService.createNewPurchase(purchaseData);
    res.status(201).json({ message: 'Orden creada con éxito', data: newOrder });
  } catch (error) {
    console.error("Error en createOrderController:", error);
    res.status(500).json({ message: 'Error al procesar la orden', error: error.message });
  }
};

export const getPurchaseHistoryController = async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) {
      return res.status(400).json({ message: 'El parámetro "userId" es requerido.' });
    }
    const historyData = await purchaseService.getPurchaseHistory(userId);
    res.status(200).json(historyData);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener el historial de compras', error: error.message });
  }
};