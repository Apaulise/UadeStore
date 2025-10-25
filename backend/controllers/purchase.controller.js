import * as purchaseService from '../services/purchase.service.js';

export const createPurchaseController = async (req, res) => {
  try {
    const purchaseData = req.body; // Tomamos los datos del cuerpo de la petición
    const newPurchase = await purchaseService.createNewPurchase(purchaseData);
    res.status(201).json({ message: 'Compra creada con éxito', data: newPurchase });
  } catch (error) {
    res.status(500).json({ message: 'Error al crear la compra', error: error.message });
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