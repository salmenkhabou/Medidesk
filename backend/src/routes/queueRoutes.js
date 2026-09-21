import express from 'express';
import { getQueue, advanceQueue } from '../controllers/queueController.js';

const router = express.Router();

router.get('/:practitioner_id', getQueue);
router.post('/:practitioner_id/next', advanceQueue);

export default router;
