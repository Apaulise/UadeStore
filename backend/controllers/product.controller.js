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

export const listColorsController = async (_req, res) => {
  try {
    const colors = await productService.listColors();
    res.status(200).json(colors);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener los colores', error: error.message });
  }
};

export const listSizesController = async (_req, res) => {
  try {
    const sizes = await productService.listSizes();
    res.status(200).json(sizes);
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Error al obtener los talles', error: error.message });
  }
};

export const updateProductController = async (req, res) => {
  try {
    const { id } = req.params;
    const payload = req.body ?? {};
    const updated = await productService.updateProductWithStock(Number(id), payload);

    if (!updated) {
      return res.status(404).json({ message: 'Articulo no encontrado' });
    }

    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar el articulo', error: error.message });
  }
};

export const deleteProductController = async (req, res) => {
  try {
    const { id } = req.params;
    await productService.deleteProduct(Number(id));
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar el articulo', error: error.message });
  }
};
