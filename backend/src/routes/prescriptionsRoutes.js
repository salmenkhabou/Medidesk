import express from 'express';
import { getPrescriptionByRef } from '../controllers/prescriptionsController.js';

const router = express.Router();

router.get('/:ref', getPrescriptionByRef);

export default router;
