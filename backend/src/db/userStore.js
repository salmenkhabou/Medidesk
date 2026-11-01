import bcrypt from 'bcryptjs';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import '../config.js';

const usersPath = path.resolve(process.env.USERS_PATH || fileURLToPath(new URL('../../data/users.json', import.meta.url)));
// Corrupt stores must stop startup; never reset credentials silently.
export const usersStore = fs.existsSync(usersPath) ? JSON.parse(fs.readFileSync(usersPath, 'utf8')) : [];
if (!Array.isArray(usersStore)) throw new Error('Invalid user store');
export function persistUsers() {
  fs.mkdirSync(path.dirname(usersPath), { recursive: true, mode: 0o700 });
  fs.writeFileSync(`${usersPath}.tmp`, JSON.stringify(usersStore, null, 2), { mode: 0o600 });
  fs.renameSync(`${usersPath}.tmp`, usersPath);
}
export function findUserByEmail(email) {
  if (typeof email !== 'string') return null;
  return usersStore.find(u => u.email === email.trim().toLowerCase()) || null;
}
export function validatePassword(password) {
  if (typeof password !== 'string' || password.length < 12 || Buffer.byteLength(password) > 72) {
    throw new Error('Le mot de passe doit contenir au moins 12 caractères et au plus 72 octets.');
  }
}
export function createUser({ name, email, password, role = 'patient', ...metadata }) {
  if (typeof name !== 'string' || !name.trim() || name.length > 150 || typeof email !== 'string' || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('Nom ou email invalide.');
  validatePassword(password);
  if (!['patient', 'doctor', 'secretariat', 'superadmin'].includes(role)) throw new Error('Rôle invalide.');
  const cleanEmail = email.trim().toLowerCase();
  if (findUserByEmail(cleanEmail)) throw new Error('Impossible de créer ce compte.');
  const safeMetadata = {};
  for (const key of ['cin', 'phone', 'cnamCode', 'specialty', 'cnom', 'city', 'clinic', 'plan', 'permissions', 'doctorId', 'practitionerId']) {
    if (metadata[key] !== undefined) safeMetadata[key] = metadata[key];
  }
  const user = { ...safeMetadata, id: Math.max(0, ...usersStore.map(u => u.id)) + 1, name: name.trim(), email: cleanEmail, passwordHash: bcrypt.hashSync(password, 12), role, sessionVersion: 0, created_at: new Date().toISOString() };
  usersStore.push(user);
  try { persistUsers(); } catch (err) { usersStore.pop(); throw err; }
  return user;
}
