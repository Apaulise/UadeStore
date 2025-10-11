import { Router } from 'express';
import { getProductsController , getProductByIdController} from '../controllers/product.controller.js';

const router = Router();

// Cuando llegue una petición GET a '/', la manejará getProductsController
router.get('/', getProductsController);

router.get('/:id', getProductByIdController);

export default router;