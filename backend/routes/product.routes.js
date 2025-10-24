import { Router } from 'express';
import {
  getProductsController,
  getProductByIdController,
  listColorsController,
  listSizesController,
  updateProductController,
  deleteProductController,
} from '../controllers/product.controller.js';

const router = Router();

router.get('/', getProductsController);
router.get('/colors', listColorsController);
router.get('/sizes', listSizesController);
router.get('/:id', getProductByIdController);
router.put('/:id', updateProductController);
router.delete('/:id', deleteProductController);

export default router;

