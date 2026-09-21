import express from 'express';
import cors from 'cors';
import doctorsRoutes from './routes/doctorsRoutes.js';
import appointmentsRoutes from './routes/appointmentsRoutes.js';
import onboardingRoutes from './routes/onboardingRoutes.js';
import queueRoutes from './routes/queueRoutes.js';
import prescriptionsRoutes from './routes/prescriptionsRoutes.js';
import pricingRoutes from './routes/pricingRoutes.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/doctors', doctorsRoutes);
app.use('/api/appointments', appointmentsRoutes);
app.use('/api/onboarding', onboardingRoutes);
app.use('/api/queue', queueRoutes);
app.use('/api/prescriptions', prescriptionsRoutes);
app.use('/api/pricing', pricingRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    service: 'MediDesk REST API',
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`🚀 MediDesk Backend Server listening on http://localhost:${PORT}`);
});
