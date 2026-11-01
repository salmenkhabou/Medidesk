import { isProd, demoOnly } from './config.js';
import { verifyToken, requireRole } from './middleware/authMiddleware.js';

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

import doctorsRoutes from './routes/doctorsRoutes.js';
import appointmentsRoutes from './routes/appointmentsRoutes.js';
import onboardingRoutes from './routes/onboardingRoutes.js';
import queueRoutes from './routes/queueRoutes.js';
import prescriptionsRoutes from './routes/prescriptionsRoutes.js';
import pricingRoutes from './routes/pricingRoutes.js';
import authRoutes from './routes/authRoutes.js';
import patientRoutes from './routes/patientRoutes.js';
import secretariatRoutes from './routes/secretariatRoutes.js';
import doctorRoutes from './routes/doctorRoutes.js';
import superadminRoutes from './routes/superadminRoutes.js';

const app = express();
const PORT = process.env.PORT || 5000;


// 1. Trust Reverse Proxy (mandatory when deployed behind Nginx / Cloudflare)
app.set('trust proxy', process.env.TRUST_PROXY === '1' ? 1 : false);
app.disable('x-powered-by');

// 2. HTTP Security Headers with Helmet
app.use(helmet({
  contentSecurityPolicy: true,
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "same-origin" }
}));

// 3. Strict CORS Whitelist Configuration
const allowedOrigins = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(',').map(s => s.trim())
  : ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:3000'];

app.use(cors({
  origin: (origin, callback) => {
    // Allow non-browser requests (curl, server-to-server healthchecks, background jobs)
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(Object.assign(new Error('Origin not allowed'), { status: 403 }));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// 4. Request Body Parsers with payload limits
app.use('/api', (req, res, next) => {
  res.set('Cache-Control', 'no-store');
  if (['POST', 'PUT', 'PATCH'].includes(req.method) && req.headers['content-length'] !== '0' && !req.is('application/json')) return res.status(415).json({ success: false, error: 'JSON_REQUIRED' });
  next();
});

// 5. Global Rate Limiter (Protects against DDoS / Scrapers)
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // Max 300 requests per IP per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'TOO_MANY_REQUESTS',
    message: 'Trop de requêtes. Veuillez patienter 15 minutes.'
  }
});
app.use('/api', globalLimiter);

// 6. Strict Authentication Rate Limiter (Protects against Brute-Force Attacks)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20, // Max 20 attempts per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'TOO_MANY_LOGIN_ATTEMPTS',
    message: 'Trop de tentatives de connexion. Accès temporairement restreint par mesure de sécurité.'
  }
});
app.use('/api/auth', authLimiter);
app.use('/api/patient/register', authLimiter);
app.use(express.json({ limit: '256kb', inflate: false }));
// Reject nested/non-string input on public write endpoints before business logic.
app.use('/api', (req, res, next) => {
  req.body ??= {};
  if (['/patient/register', '/onboarding', '/appointments'].includes(req.path) && req.method === 'POST') {
    if (Array.isArray(req.body) || Object.values(req.body).some(v => v !== null && !['string', 'number', 'boolean'].includes(typeof v)) || Object.values(req.body).some(v => typeof v === 'string' && v.length > 2000)) return res.status(400).json({ success: false, error: 'INVALID_INPUT' });
  }
  next();
});

// 7. REST API Route Registry
app.use('/api/auth', authRoutes);
app.use('/api/doctors', doctorsRoutes);
app.use('/api/appointments', appointmentsRoutes);
app.use('/api/onboarding', onboardingRoutes);
app.use('/api/queue', queueRoutes);
app.use('/api/prescriptions', prescriptionsRoutes);
app.use('/api/pricing', pricingRoutes);
app.use('/api/patient', patientRoutes);
app.use('/api/secretariat', verifyToken, requireRole(['secretariat']), demoOnly, secretariatRoutes);
app.use('/api/doctor', verifyToken, requireRole(['doctor']), demoOnly, doctorRoutes);
app.use('/api/superadmin', verifyToken, superadminRoutes);

// 8. Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    service: 'MediDesk REST API',
    timestamp: new Date().toISOString()
  });
});

// 9. Centralized Error Handler (Prevents stack-trace leaks in production)
app.use((err, req, res, next) => {
  if (!err.status || err.status >= 500) console.error('Application error:', err.name);
  const status = err.status || 500;
  res.status(status).json({
    success: false,
    error: status < 500 ? 'INVALID_REQUEST' : 'INTERNAL_SERVER_ERROR',
    message: isProd 
      ? 'Une erreur interne est survenue sur le serveur de santé sécurisé.' 
      : err.message
  });
});

export { app };

if (process.env.NODE_ENV !== 'test') app.listen(PORT, () => {
  console.log(`🛡️  MediDesk Secure Server listening on http://localhost:${PORT} [${isProd ? 'PRODUCTION' : 'DEVELOPMENT'}]`);
});
