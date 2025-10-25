import * as purchaseService from '../services/purchase.service.js';

 export const createPurchaseController = async (req, res) => {
  try {
    // Aquí podrías añadir validación del req.body
    const purchaseData = req.body;
    // Asume que obtienes userId de alguna forma (ej: autenticación, o viene en el body)
    // Para simplificar, lo tomamos del body por ahora
    if (!purchaseData.userId) {
        return res.status(400).json({ message: 'userId es requerido'});
    }

    const newOrder = await purchaseService.createOrder(purchaseData);
    res.status(201).json({ message: 'Orden creada con éxito', data: newOrder });
  } catch (error) {
    console.error("Error en createOrderController:", error);
    res.status(500).json({ message: 'Error al procesar la orden', error: error.message });
  }
};