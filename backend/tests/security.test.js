import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { randomBytes } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import jwt from 'jsonwebtoken';

const temp = fs.mkdtempSync(path.join(path.resolve(import.meta.dirname, '..'), 'security-test-'));
Object.assign(process.env, {
  NODE_ENV: 'test', JWT_SECRET: randomBytes(48).toString('hex'),
  FRONTEND_URL: 'https://app.example.test', TRUST_PROXY: '0', ENABLE_DEMO_DATA: 'false',
  USERS_PATH: path.join(temp, 'users.json'), DB_PATH: path.join(temp, 'db.json')
});
fs.writeFileSync(process.env.DB_PATH, JSON.stringify({
  practitioners: [{ id: 1, name: 'Test Doctor', specialty: 'Test', city: 'Test', address: 'Test' }, { id: 2, name: 'Other Doctor' }],
  appointments: [{ id: 1, practitioner_id: 1, patient_id: 1, patient_name: 'Owned' }, { id: 2, practitioner_id: 2, patient_id: 2, patient_name: 'Other' }, { id: 3, practitioner_id: 1, patient_name: 'Legacy' }],
  prescriptions: [{ id: 1, reference_code: 'OWNED', practitioner_id: 1, patient_id: 1, patient_cin: '12345678', medications_json: '[]' }, { id: 2, reference_code: 'OTHER', practitioner_id: 2, patient_id: 2, medications_json: '[]' }],
  waiting_queue: [{ id: 1, practitioner_id: 1, current_patient_number: 1, estimated_wait_mins: 10 }, { id: 2, practitioner_id: 2, current_patient_number: 1, estimated_wait_mins: 10 }],
  onboarding_requests: [], pricing_plans: []
}));
const { app } = await import('../src/server.js');
const { createUser, usersStore, persistUsers } = await import('../src/db/userStore.js');
const { jwtSecret, jwtOptions } = await import('../src/config.js');
const password = 'Unique-test-password-437!';
const patient = createUser({ name: 'Patient', email: 'patient@example.test', password, role: 'patient' });
const other = createUser({ name: 'Other', email: 'other@example.test', password, role: 'patient' });
const doctor = createUser({ name: 'Doctor', email: 'doctor@example.test', password, role: 'doctor', practitionerId: 1 });
const admin = createUser({ name: 'Admin', email: 'admin@example.test', password, role: 'superadmin' });
let server, base;
const token = (u, opts = {}) => jwt.sign({ id: u.id, version: u.sessionVersion || 0 }, jwtSecret, { ...jwtOptions, ...opts });
async function request(url, { user, headers = {}, body, method = body ? 'POST' : 'GET' } = {}) {
  return fetch(base + url, { method, headers: { ...(body ? { 'Content-Type': 'application/json' } : {}), ...(user ? { Authorization: `Bearer ${token(user)}` } : {}), ...headers }, ...(body ? { body: JSON.stringify(body) } : {}) });
}
before(async () => {
  await new Promise(resolve => { server = app.listen(0, '127.0.0.1', resolve); });
  base = `http://127.0.0.1:${server.address().port}/api`;
});
after(async () => {
  if (server) await new Promise(resolve => server.close(resolve));
  fs.rmSync(temp, { recursive: true, force: true });
});

test('every private API rejects anonymous users', async () => {
  const paths = ['/auth/me', '/appointments', '/prescriptions/OWNED', '/patient/dashboard', '/patient/medical-record', '/patient/notifications', '/patient/security-settings', '/doctor/dashboard', '/doctor/patients', '/doctor/analytics', '/secretariat/dashboard', '/secretariat/billing/today', '/superadmin/dashboard', '/superadmin/practitioners', '/superadmin/team', '/superadmin/security', '/superadmin/doctor-team'];
  for (const url of paths) assert.equal((await request(url)).status, 401, url);
  for (const url of ['/queue/1/next', '/doctor/consultations', '/secretariat/billing', '/superadmin/practitioners', '/patient/documents/upload']) assert.equal((await request(url, { method: 'POST' })).status, 401, url);
});
test('sample, unsigned, forged, expired and wrong-audience tokens fail', async () => {
  const bad = ['mdk_jwt_token_sample_anything', jwt.sign({ id: admin.id }, '', { algorithm: 'none' }), jwt.sign({ id: admin.id }, 'old-public-secret'), token(admin, { expiresIn: -1 }), token(admin, { audience: 'other-app' })];
  for (const value of bad) assert.equal((await request('/superadmin/dashboard', { headers: { Authorization: `Bearer ${value}` } })).status, 401);
});
test('roles are checked from current stored account, with no admin clinical bypass', async () => {
  for (const url of ['/doctor/dashboard', '/secretariat/dashboard', '/superadmin/dashboard', '/superadmin/doctor-team']) assert.equal((await request(url, { user: patient })).status, 403, url);
  assert.equal((await request('/patient/medical-record', { user: admin })).status, 403);
  assert.equal((await request('/superadmin/dashboard', { user: doctor })).status, 403);
  assert.equal((await request('/superadmin/doctor-team', { user: doctor })).status, 503);
});
test('mock data is unavailable without explicit demo mode', async () => {
  for (const [url, user] of [['/patient/medical-record', patient], ['/doctor/dashboard', doctor], ['/superadmin/dashboard', admin]]) assert.equal((await request(url, { user })).status, 503);
});
test('shared password bypass removed and errors do not enumerate accounts', async () => {
  const wrong = await request('/auth/login', { body: { email: patient.email, password: 'Password123!' } });
  const missing = await request('/auth/login', { body: { email: 'missing@example.test', password } });
  assert.equal(wrong.status, 401);
  assert.equal(missing.status, 401);
  assert.deepEqual(await wrong.json(), await missing.json());
});
test('login uses HttpOnly cookie; CSRF checks, logout revocation and safe /me output', async () => {
  const login = await request('/auth/login', { body: { email: patient.email, password } });
  assert.equal(login.status, 200);
  const data = await login.json();
  assert.equal(data.token, undefined);
  const setCookie = login.headers.get('set-cookie');
  assert.match(setCookie, /HttpOnly/i);
  assert.match(setCookie, /SameSite=Strict/i);
  const cookie = setCookie.split(';')[0];
  const headers = { Cookie: cookie };
  const me = await request('/auth/me', { headers });
  assert.equal(me.status, 200);
  assert.deepEqual(Object.keys((await me.json()).user).sort(), ['email', 'id', 'name', 'role']);
  assert.equal((await request('/auth/logout', { headers, method: 'POST' })).status, 403);
  assert.equal((await request('/auth/logout', { headers: { ...headers, 'X-Requested-With': 'MediDesk' }, method: 'POST' })).status, 200);
  assert.equal((await request('/auth/me', { headers })).status, 401);
});
test('appointments are scoped by server-owned identity, including malicious query overrides', async () => {
  for (const query of ['', '?patient_phone=other&practitioner_id=2']) {
    const res = await request('/appointments' + query, { user: patient });
    assert.equal(res.status, 200);
    assert.ok((await res.json()).data.every(a => a.patient_id === patient.id));
  }
  const res = await request('/appointments', { user: doctor });
  assert.ok((await res.json()).data.every(a => a.practitioner_id === 1));
  assert.equal((await request('/appointments', { user: admin })).status, 403);
  const fields = { practitioner_id: 1, patient_name: 'Booking Test', patient_phone: '12345678', appointment_date: '2030-01-10', appointment_time: '10:30', patient_id: other.id };
  const ownBooking = await request('/appointments', { user: patient, body: fields });
  assert.equal(ownBooking.status, 201);
  assert.equal((await ownBooking.json()).data.patient_id, patient.id);
  const guestBooking = await request('/appointments', { body: fields });
  assert.equal(guestBooking.status, 201);
  assert.equal((await guestBooking.json()).data.patient_id, null);
});
test('prescriptions require ownership; CIN and guessed references cannot bypass it', async () => {
  assert.equal((await request('/prescriptions/OWNED', { user: patient })).status, 200);
  for (const ref of ['OTHER', '12345678']) assert.equal((await request('/prescriptions/' + ref, { user: patient })).status, 404);
  assert.equal((await request('/prescriptions/OWNED', { user: other })).status, 404);
  assert.equal((await request('/prescriptions/OTHER', { user: doctor })).status, 404);
});
test('queue writes are restricted to the assigned practice', async () => {
  assert.equal((await request('/queue/2/next', { user: doctor, method: 'POST' })).status, 403);
  assert.equal((await request('/queue/1/next', { user: patient, method: 'POST' })).status, 403);
  assert.equal((await request('/queue/1/next', { user: doctor, method: 'POST' })).status, 200);
});
test('registration validates passwords/types and ignores privileged identity fields', async () => {
  const fields = { firstName: 'New', lastName: 'Patient', phone: '12345678', email: 'new@example.test' };
  for (const bad of [{}, { password: 'short' }, { password: 'a'.repeat(73) }, { password, email: {} }]) assert.equal((await request('/patient/register', { body: { ...fields, ...bad } })).status, 400);
  const res = await request('/patient/register', { body: { ...fields, password, role: 'superadmin', id: 999, sessionVersion: 99 } });
  assert.equal(res.status, 201);
  assert.equal(usersStore.find(u => u.email === fields.email).role, 'patient');
  assert.notEqual(usersStore.find(u => u.email === fields.email).id, 999);
});
test('onboarding uses high-entropy exact tracking codes and public status excludes PII', async () => {
  const res = await request('/onboarding', { body: { doctor_name: 'Test', cnom_number: '98765', phone: '12345', email: 'test@example.test', clinic_name: 'Test Clinic' } });
  assert.equal(res.status, 201);
  const data = await res.json();
  assert.match(data.tracking_code, /^MD-[a-f0-9]{48}$/);
  assert.equal((await request('/onboarding/98765')).status, 404);
  const status = await (await request('/onboarding/' + data.tracking_code)).json();
  assert.deepEqual(Object.keys(status.data).sort(), ['status', 'tracking_code']);
});
test('password changes verify old password, persist, and invalidate existing sessions', async () => {
  const oldToken = token(other);
  assert.equal((await request('/patient/security-settings/update-password', { user: other, body: { currentPassword: 'wrong', newPassword: 'new-long-password-123!' } })).status, 400);
  assert.equal((await request('/patient/security-settings/update-password', { user: other, body: { currentPassword: password, newPassword: 'new-long-password-123!' } })).status, 200);
  assert.equal((await request('/auth/me', { headers: { Authorization: `Bearer ${oldToken}` } })).status, 401);
  assert.equal((await request('/auth/login', { body: { email: other.email, password } })).status, 401);
  assert.equal((await request('/auth/login', { body: { email: other.email, password: 'new-long-password-123!' } })).status, 200);
  const saved = JSON.parse(fs.readFileSync(process.env.USERS_PATH));
  assert.ok(saved.find(u => u.id === other.id).passwordHash.startsWith('$2'));
  assert.ok(!fs.readFileSync(process.env.USERS_PATH, 'utf8').includes('new-long-password'));
});
test('unimplemented reset and MFA cannot report success', async () => {
  for (const url of ['/auth/forgot-password', '/auth/verify-2fa']) assert.equal((await request(url, { body: { email: patient.email, code: '123456' } })).status, 503);
  assert.equal((await request('/patient/security-settings/toggle-2fa', { user: patient, body: { enabled: true } })).status, 503);
});
test('disabled accounts and changed roles take effect immediately', async () => {
  const bearer = token(other);
  other.disabled = true;
  assert.equal((await request('/auth/me', { headers: { Authorization: `Bearer ${bearer}` } })).status, 401);
  other.disabled = false;
  const adminToken = token(admin);
  admin.role = 'patient';
  assert.equal((await request('/superadmin/dashboard', { headers: { Authorization: `Bearer ${adminToken}` } })).status, 403);
  admin.role = 'superadmin';
  persistUsers();
});
test('CORS, security headers, body size, content types and malformed JSON', async () => {
  assert.equal((await request('/health', { headers: { Origin: 'https://evil.example' } })).status, 403);
  const health = await request('/health', { headers: { Origin: 'https://app.example.test' } });
  assert.equal(health.headers.get('access-control-allow-origin'), 'https://app.example.test');
  assert.equal(health.headers.get('x-content-type-options'), 'nosniff');
  assert.equal(health.headers.get('cache-control'), 'no-store');
  assert.equal(health.headers.get('x-powered-by'), null);
  assert.equal((await health.json()).security_perimeter, undefined);
  assert.equal((await fetch(base + '/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{bad' })).status, 400);
  assert.equal((await fetch(base + '/auth/login', { method: 'POST', body: 'email=x' })).status, 415);
  assert.equal((await request('/onboarding', { body: { text: 'a'.repeat(270000) } })).status, 413);
});
test('production refuses weak/missing secrets and cannot enable mock features', () => {
  for (const secret of ['', 'medidesk_hds_secure_jwt_token_key_2026_super_secret_tn', 'short']) {
    const result = spawnSync(process.execPath, ['--input-type=module', '-e', "await import('./src/config.js')"], { cwd: path.resolve(import.meta.dirname, '..'), env: { ...process.env, NODE_ENV: 'production', JWT_SECRET: secret }, encoding: 'utf8' });
    assert.notEqual(result.status, 0);
  }
  const result = spawnSync(process.execPath, ['--input-type=module', '-e', "const {demoEnabled}=await import('./src/config.js'); if(demoEnabled) process.exit(1)"], { cwd: path.resolve(import.meta.dirname, '..'), env: { ...process.env, NODE_ENV: 'production', ENABLE_DEMO_DATA: 'true' }, encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);
  const secureCookie = spawnSync(process.execPath, ['--input-type=module', '-e', "const {setSessionCookie}=await import('./src/middleware/authMiddleware.js'); setSessionCookie({cookie(name,value,options){if(name!=='__Host-medidesk_session'||!options.httpOnly||!options.secure||options.sameSite!=='strict'||options.path!=='/')process.exit(1)}},'test')"], { cwd: path.resolve(import.meta.dirname, '..'), env: { ...process.env, NODE_ENV: 'production' }, encoding: 'utf8' });
  assert.equal(secureCookie.status, 0, secureCookie.stderr);
  const beforeSeed = fs.readFileSync(process.env.DB_PATH, 'utf8');
  const seed = spawnSync(process.execPath, ['src/db/seed.js'], { cwd: path.resolve(import.meta.dirname, '..'), env: { ...process.env, NODE_ENV: 'production', ENABLE_DEMO_DATA: 'true' }, encoding: 'utf8' });
  assert.notEqual(seed.status, 0);
  assert.equal(fs.readFileSync(process.env.DB_PATH, 'utf8'), beforeSeed);
});
test('auth rate limiter rejects brute force even with spoofed forwarding headers', async () => {
  let response;
  for (let i = 0; i < 22; i++) response = await request('/auth/me', { headers: { 'X-Forwarded-For': `192.0.2.${i}` } });
  assert.equal(response.status, 429);
});
