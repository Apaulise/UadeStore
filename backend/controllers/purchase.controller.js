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