import * as purchaseService from '../services/purchase.service.js';

export const createPurchaseController = async (req, res) => {
  try {
    const purchaseData = req.body;
    console.log('info de orden controller', purchaseData);
    const newOrder = await purchaseService.createNewPurchase(purchaseData);
    res.status(201).json({ message: 'Orden creada con éxito', data: newOrder });
  } catch (error) {
    console.error('Error en createPurchaseController:', error);
    res.status(500).json({ message: 'Error al procesar la orden', error: error.message });
  }
};

export const getPurchaseHistoryController = async (req, res) => {
  try {
    const { userId, page: pageParam, limit: limitParam } = req.query;
    if (!userId) {
      return res.status(400).json({ message: 'El parámetro "userId" es requerido.' });
    }
    const page = Math.max(Number.parseInt(pageParam, 10) || 1, 1);
    const limit = Math.max(Number.parseInt(limitParam, 10) || 5, 1);
    const { data, count } = await purchaseService.getPurchaseHistory(userId, { page, limit });
    res.status(200).json({
      items: data,
      total: count ?? data.length,
      page,
      limit,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener el historial de compras', error: error.message });
  }
};
