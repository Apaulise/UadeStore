import {
  getCart,
  addItem,
  updateItemQuantity,
  removeItem,
  clearCart,
} from '../services/cart.service.js';


export const getCartController = async (req, res) => {
  try {
    const { userId } = req.query;
    console.log("1️⃣ Controller: Request recibido. ID:", userId); // <--- LOG 1

    if (!userId) return res.status(400).json({ message: "Falta ID" });

    console.log("2️⃣ Controller: Llamando al servicio..."); // <--- LOG 2
    const cart = await getCart(userId);
    
    console.log("3️⃣ Controller: Servicio respondió. Enviando respuesta..."); // <--- LOG 3
    return res.status(200).json(cart);

  } catch (error) {
    console.error("❌ Controller Error:", error);
    return res.status(500).json({ message: error.message });
  }
};

export const addItemController = async (req, res) => {
  try {
    const { stockId, quantity, userId } = req.body;
    
    // Aquí sí pasamos un objeto porque addItem suele recibir varios parámetros
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
      cartId: Number(id), // El ID del carrito quizás sí sea numérico (id serial), chequealo
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
    // Buscamos en body o query, pero SIN parsear a número
    const userId = req.body?.userId ?? req.query?.userId;

    if (!userId) {
        return res.status(400).json({ message: "UserId es requerido para vaciar carrito" });
    }

    // Pasamos userId directo (sin llaves)
    const cart = await clearCart(userId);
    
    res.status(200).json(cart);
  } catch (error) {
    res.status(400).json({
      message: 'Error al vaciar el carrito',
      error: error.message,
    });
  }
};
