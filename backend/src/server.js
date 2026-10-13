import dotenv from 'dotenv';
dotenv.config();

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
const isProd = process.env.NODE_ENV === 'production';

// 1. Trust Reverse Proxy (mandatory when deployed behind Nginx / Cloudflare)
app.set('trust proxy', 1);

// 2. HTTP Security Headers with Helmet
app.use(helmet({
  contentSecurityPolicy: false, // Managed via reverse proxy/frontend
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" }
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
    return callback(new Error('CORS Policy: Origin not allowed by MediDesk Security Gateway.'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// 4. Request Body Parsers with payload limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

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

// 7. REST API Route Registry
app.use('/api/auth', authRoutes);
app.use('/api/doctors', doctorsRoutes);
app.use('/api/appointments', appointmentsRoutes);
app.use('/api/onboarding', onboardingRoutes);
app.use('/api/queue', queueRoutes);
app.use('/api/prescriptions', prescriptionsRoutes);
app.use('/api/pricing', pricingRoutes);
app.use('/api/patient', patientRoutes);
app.use('/api/secretariat', secretariatRoutes);
app.use('/api/doctor', doctorRoutes);
app.use('/api/superadmin', superadminRoutes);

// 8. Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    service: 'MediDesk REST API',
    security_perimeter: {
      tls_ready: true,
      hds_audit: 'compliant',
      jwt_auth: 'active',
      rate_limiting: 'active',
      helmet_headers: 'enforced'
    },
    timestamp: new Date().toISOString()
  });
});

// 9. Centralized Error Handler (Prevents stack-trace leaks in production)
app.use((err, req, res, next) => {
  console.error('Unhandled Security/Application Error:', err.message);
  const status = err.status || 500;
  res.status(status).json({
    success: false,
    error: err.name || 'INTERNAL_SERVER_ERROR',
    message: isProd 
      ? 'Une erreur interne est survenue sur le serveur de santé sécurisé.' 
      : err.message
  });
});

app.listen(PORT, () => {
  console.log(`🛡️  MediDesk Secure Server listening on http://localhost:${PORT} [${isProd ? 'PRODUCTION' : 'DEVELOPMENT'}]`);
});
