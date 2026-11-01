import 'dotenv/config';
import { randomBytes } from 'node:crypto';

export const isProd = process.env.NODE_ENV === 'production';
export const demoEnabled = !isProd && process.env.ENABLE_DEMO_DATA === 'true';
const configuredSecret = process.env.JWT_SECRET;
if (configuredSecret && (Buffer.byteLength(configuredSecret) < 32 || /change_this|medidesk_hds_secure_jwt/i.test(configuredSecret))) {
  throw new Error('JWT_SECRET must be a new random secret of at least 32 bytes.');
}
if (isProd && !configuredSecret) throw new Error('JWT_SECRET is required in production.');
if (isProd && !process.env.FRONTEND_URL) throw new Error('FRONTEND_URL is required in production.');
if (isProd && !process.env.DB_PATH) throw new Error('DB_PATH is required in production.');
if (isProd && !process.env.USERS_PATH) throw new Error('USERS_PATH is required in production.');
if (isProd) {
  for (const value of process.env.FRONTEND_URL.split(',').map(s => s.trim())) {
    const origin = new URL(value);
    if (origin.protocol !== 'https:' || origin.origin !== value) throw new Error('FRONTEND_URL must contain exact HTTPS origins.');
  }
}
export const jwtSecret = configuredSecret || randomBytes(48).toString('hex');
export const jwtOptions = { algorithm: 'HS256', issuer: 'medidesk', audience: 'medidesk-api', expiresIn: '1h' };
export function demoOnly(req, res, next) {
  if (demoEnabled) return next();
  return res.status(503).json({ success: false, error: 'FEATURE_NOT_IMPLEMENTED', message: 'Cette fonctionnalité de démonstration est indisponible.' });
}
