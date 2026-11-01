import express from 'express';
import { getPrescriptionByRef } from '../controllers/prescriptionsController.js';

import { verifyToken, requireRole } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/:ref', verifyToken, requireRole(['patient', 'doctor']), getPrescriptionByRef);

export default router;
