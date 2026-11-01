import jwt from 'jsonwebtoken';
import { jwtSecret, jwtOptions, isProd } from '../config.js';
import { usersStore } from '../db/userStore.js';

export const cookieName = isProd ? '__Host-medidesk_session' : 'medidesk_session';
export function setSessionCookie(res, token) {
  res.cookie(cookieName, token, { httpOnly: true, secure: isProd, sameSite: 'strict', path: '/', maxAge: 3600000 });
}
export function clearSessionCookie(res) {
  res.clearCookie(cookieName, { httpOnly: true, secure: isProd, sameSite: 'strict', path: '/' });
}
export function verifyToken(req, res, next) {
  const bearer = /^Bearer ([^\s]+)$/.exec(req.headers.authorization || '');
  const cookie = (req.headers.cookie || '').split(';').map(p => p.trim()).find(p => p.startsWith(`${cookieName}=`));
  const token = bearer?.[1] || cookie?.slice(cookieName.length + 1);
  if (!token) return res.status(401).json({ success: false, error: 'AUTHENTICATION_REQUIRED' });
  if (!bearer && !['GET', 'HEAD', 'OPTIONS'].includes(req.method) && req.get('X-Requested-With') !== 'MediDesk') {
    return res.status(403).json({ success: false, error: 'CSRF_CHECK_FAILED' });
  }
  try {
    const decoded = jwt.verify(token, jwtSecret, { algorithms: ['HS256'], issuer: jwtOptions.issuer, audience: jwtOptions.audience });
    const user = usersStore.find(u => u.id === decoded.id && !u.disabled);
    if (!user || decoded.version !== (user.sessionVersion || 0)) throw new Error('Invalid session');
    req.user = user;
    next();
  } catch {
    return res.status(401).json({ success: false, error: 'INVALID_TOKEN' });
  }
}
export function requireRole(allowedRoles = []) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ success: false, error: 'AUTHENTICATION_REQUIRED' });
    if (!allowedRoles.includes(req.user.role)) return res.status(403).json({ success: false, error: 'ACCESS_DENIED' });
    next();
  };
}
export function requirePractitioner(req, res, next) {
  const id = Number(req.params.practitioner_id);
  if (!Number.isSafeInteger(id) || id < 1 || id !== req.user.practitionerId) return res.status(403).json({ success: false, error: 'ACCESS_DENIED' });
  next();
}
