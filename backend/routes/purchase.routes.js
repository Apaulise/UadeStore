import { Router } from 'express';
import { createPurchaseController } from '../controllers/purchase.controller.js';

const router = Router();

// Cuando llegue una petición POST a '/', la manejará createPurchaseController
router.post('/', createPurchaseController);

export default router;