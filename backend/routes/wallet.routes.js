import { Router } from 'express';
import { getBalanceController } from '../controllers/wallet.controller.js';

const router = Router();

// Definimos la ruta GET /api/wallet/mine
router.get('/mine', getBalanceController);

export default router;