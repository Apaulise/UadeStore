import { Router } from 'express';
import {
  createPurchaseController,
  getPurchaseHistoryController,
} from '../controllers/purchase.controller.js';

const router = Router();

router.post('/', createPurchaseController);
router.get('/me', getPurchaseHistoryController);

export default router;
