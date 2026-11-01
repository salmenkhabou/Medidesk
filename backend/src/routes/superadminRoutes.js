import express from 'express';
import {
  getSuperAdminDashboardSummary,
  getSuperAdminApplications,
  approveApplication,
  rejectApplication,
  getSuperAdminPractitioners,
  updatePractitionerPlan,
  getSuperAdminBillingSupervision,
  getSuperAdminAnalytics,
  getSuperAdminSuggestions,
  getPractitionerDetail,
  getPricingSettings,
  getSuperAdminTeam,
  getSuperAdminSecurityLogs,
  getDoctorTeam,
  getDoctorSecuritySettings,
  createPractitioner,
  addDoctorSecretary
} from '../controllers/superadminController.js';

import { requireRole } from '../middleware/authMiddleware.js';
import { demoOnly } from '../config.js';

const router = express.Router();

router.use(['/doctor-team', '/doctor-security'], requireRole(['doctor']));
router.use((req, res, next) => {
  if (['/doctor-team', '/doctor-security'].includes(req.path)) return next();
  return requireRole(['superadmin'])(req, res, next);
});
router.use(demoOnly);

router.get('/dashboard', getSuperAdminDashboardSummary);
router.get('/applications', getSuperAdminApplications);
router.post('/applications/:id/approve', approveApplication);
router.post('/applications/:id/reject', rejectApplication);
router.get('/practitioners', getSuperAdminPractitioners);
router.post('/practitioners', createPractitioner);
router.get('/practitioners/:id', getPractitionerDetail);
router.put('/practitioners/:id/plan', updatePractitionerPlan);
router.get('/billing', getSuperAdminBillingSupervision);
router.get('/analytics', getSuperAdminAnalytics);
router.get('/suggestions', getSuperAdminSuggestions);
router.get('/pricing-settings', getPricingSettings);
router.get('/team', getSuperAdminTeam);
router.get('/security', getSuperAdminSecurityLogs);

// Doctor specific team & security endpoints
router.get('/doctor-team', getDoctorTeam);
router.post('/doctor-team', addDoctorSecretary);
router.get('/doctor-security', getDoctorSecuritySettings);

export default router;


