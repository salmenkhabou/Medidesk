import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { jwtSecret, jwtOptions } from '../config.js';
import { verifyToken, setSessionCookie, clearSessionCookie } from '../middleware/authMiddleware.js';
import { findUserByEmail, persistUsers } from '../db/userStore.js';

const router = express.Router();
const dummyHash = bcrypt.hashSync('unused-timing-equalization-password', 12);
export const publicUser = u => ({ id: u.id, name: u.name, email: u.email, role: u.role });
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (typeof email !== 'string' || email.length > 254 || typeof password !== 'string' || Buffer.byteLength(password) > 72) {
      return res.status(400).json({ success: false, error: 'INVALID_CREDENTIALS' });
    }
    const user = findUserByEmail(email);
    const matches = await bcrypt.compare(password, user?.passwordHash || dummyHash);
    if (!user || !matches || user.disabled) return res.status(401).json({ success: false, error: 'INVALID_CREDENTIALS', message: 'Identifiants invalides.' });
    const token = jwt.sign({ id: user.id, version: user.sessionVersion || 0 }, jwtSecret, jwtOptions);
    setSessionCookie(res, token);
    res.json({ success: true, user: publicUser(user) });
  } catch (err) { next(err); }
});
router.get('/me', verifyToken, (req, res) => res.json({ success: true, user: publicUser(req.user) }));
router.post('/logout', verifyToken, (req, res) => {
  req.user.sessionVersion = (req.user.sessionVersion || 0) + 1;
  persistUsers();
  clearSessionCookie(res);
  res.json({ success: true });
});
// Fail closed until delivery, expiry, replay protection and TOTP enrollment exist.
for (const endpoint of ['/forgot-password', '/verify-2fa']) {
  router.post(endpoint, (req, res) => res.status(503).json({ success: false, error: 'FEATURE_NOT_IMPLEMENTED', message: 'Service indisponible. Contactez votre administrateur.' }));
}
export default router;
