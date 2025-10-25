import { Router } from 'express';
import { createPurchaseController } from '../controllers/purchase.controller.js';
import {getPurchaseHistoryController } from '../controllers/purchase.controller.js';

const router = Router();

// Cuando llegue una petición POST a '/', la manejará createPurchaseController
router.post('/', createPurchaseController);
router.get('/me', getPurchaseHistoryController);

export default router;