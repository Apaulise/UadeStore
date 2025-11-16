import { Router } from 'express';
import {
  createProductController,
  getProductsController,
  getProductByIdController,
  listColorsController,
  listSizesController,
  updateProductController,
  deleteProductController,
} from '../controllers/product.controller.js';

const router = Router();

router.get('/', getProductsController);
router.post('/', createProductController);
router.get('/colors', listColorsController);
router.get('/sizes', listSizesController);
router.get('/:id', getProductByIdController);
router.put('/:id', updateProductController);
router.delete('/:id', deleteProductController);

export default router;

