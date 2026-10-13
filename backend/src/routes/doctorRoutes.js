import express from 'express';
import {
  getDoctorDashboardSummary,
  callPatientF2,
  getDoctorPatientDirectory,
  saveDoctorConsultation,
  generateMedicalCertificate,
  processOcrMedicalScan,
  postDelayAlert,
  getDoctorPracticeAnalytics,
  getDoctorSubscriptionStatus
} from '../controllers/doctorController.js';

const router = express.Router();

router.get('/dashboard', getDoctorDashboardSummary);
router.post('/call-patient', callPatientF2);
router.get('/patients', getDoctorPatientDirectory);
router.post('/consultations', saveDoctorConsultation);
router.post('/certificates', generateMedicalCertificate);
router.post('/ocr-scan', processOcrMedicalScan);
router.post('/delay-alert', postDelayAlert);
router.get('/analytics', getDoctorPracticeAnalytics);
router.get('/subscription', getDoctorSubscriptionStatus);

export default router;
