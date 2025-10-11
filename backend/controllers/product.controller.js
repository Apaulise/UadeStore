import * as productService from '../services/product.service.js';

export const getProductsController = async (req, res) => {
  try {
    const products = await productService.getAllArticulos();
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener los productos', error: error.message });
  }
};

export const getProductByIdController = async (req, res) => {
  try {
    const { id } = req.params; // Obtenemos el ID que viene en la URL (ej: /api/products/123)
    const product = await productService.getArticuloById(id);
    
    if (!product) {
      return res.status(404).json({ message: 'Articulo no encontrado' });
    }
    
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener el Articulo', error: error.message });
  }
};