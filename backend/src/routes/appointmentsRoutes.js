import express from 'express';
import { getAppointments, createAppointment } from '../controllers/appointmentsController.js';

import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', verifyToken, getAppointments);
router.post('/', (req, res, next) => {
  if (req.headers.authorization || /medidesk_session=/.test(req.headers.cookie || '')) return verifyToken(req, res, next);
  next();
}, createAppointment);

export default router;
