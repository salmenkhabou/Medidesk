import express from 'express';
import {
  getDashboardSummary,
  getVisitorReservations,
  validateVisitorReservation,
  rejectVisitorReservation,
  createBillingTransaction,
  getTodayBilling,
  sendIntercomMessage,
  getCashCloseoutReport,
  lockCashRegister
} from '../controllers/secretariatController.js';

const router = express.Router();

router.get('/dashboard', getDashboardSummary);
router.get('/visitor-reservations', getVisitorReservations);
router.post('/visitor-reservations/:id/validate', validateVisitorReservation);
router.post('/visitor-reservations/:id/reject', rejectVisitorReservation);
router.get('/billing/today', getTodayBilling);
router.post('/billing', createBillingTransaction);
router.post('/intercom', sendIntercomMessage);
router.get('/cash-closeout', getCashCloseoutReport);
router.post('/cash-closeout', lockCashRegister);

export default router;
