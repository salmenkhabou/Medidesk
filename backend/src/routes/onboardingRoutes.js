import express from 'express';
import { submitOnboarding, getOnboardingByCode } from '../controllers/onboardingController.js';

const router = express.Router();

router.post('/', submitOnboarding);
router.get('/:code', getOnboardingByCode);

export default router;
