import express from 'express';
import { getQueue, advanceQueue } from '../controllers/queueController.js';

import { verifyToken, requireRole, requirePractitioner } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/:practitioner_id', getQueue);
router.post('/:practitioner_id/next', verifyToken, requireRole(['doctor', 'secretariat']), requirePractitioner, advanceQueue);

export default router;
