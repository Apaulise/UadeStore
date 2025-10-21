import {
  getCart,
  addItem,
  updateItemQuantity,
  removeItem,
  clearCart,
} from '../services/cart.service.js';

const parseUserId = (value) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? undefined : parsed;
};

export const getCartController = async (req, res) => {
  try {
    const userId = parseUserId(req.query.userId);
    const cart = await getCart({ userId });
    res.status(200).json(cart);
  } catch (error) {
    res.status(500).json({
      message: 'Error al obtener el carrito',
      error: error.message,
    });
  }
};

export const addItemController = async (req, res) => {
  try {
    const { stockId, quantity, userId } = req.body;
    const cart = await addItem({ stockId, quantity, userId });
    res.status(200).json(cart);
  } catch (error) {
    res.status(400).json({
      message: 'Error al agregar el item al carrito',
      error: error.message,
    });
  }
};

export const updateItemController = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity, userId } = req.body;

    const cart = await updateItemQuantity({
      cartId: Number(id),
      quantity,
      userId,
    });

    res.status(200).json(cart);
  } catch (error) {
    res.status(400).json({
      message: 'Error al actualizar el item del carrito',
      error: error.message,
    });
  }
};

export const removeItemController = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    const cart = await removeItem({
      cartId: Number(id),
      userId,
    });

    res.status(200).json(cart);
  } catch (error) {
    res.status(400).json({
      message: 'Error al eliminar el item del carrito',
      error: error.message,
    });
  }
};

export const clearCartController = async (req, res) => {
  try {
    const userId = parseUserId(req.body?.userId ?? req.query?.userId);
    const cart = await clearCart({ userId });
    res.status(200).json(cart);
  } catch (error) {
    res.status(400).json({
      message: 'Error al vaciar el carrito',
      error: error.message,
    });
  }
};
