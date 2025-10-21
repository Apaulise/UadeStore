import { Router } from 'express';
import {
  getCartController,
  addItemController,
  updateItemController,
  removeItemController,
  clearCartController,
} from '../controllers/cart.controller.js';

const router = Router();

router.get('/', getCartController);
router.post('/', addItemController);
router.patch('/:id', updateItemController);
router.delete('/:id', removeItemController);
router.delete('/', clearCartController);

export default router;
