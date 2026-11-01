import { test } from 'node:test';
import assert from 'node:assert/strict';
import { apiFetch, fetchDoctorPatients } from '../src/services/api.js';

globalThis.window = { location: { origin: 'https://app.example.test' } };
test('API client uses same-origin cookies and CSRF header without browser-stored tokens', async () => {
  let sent;
  globalThis.fetch = async (url, options) => { sent = { url, options }; return { ok: true }; };
  await apiFetch('/api/auth/logout', { method: 'POST' });
  assert.equal(sent.url.origin, window.location.origin);
  assert.equal(sent.options.credentials, 'same-origin');
  assert.equal(sent.options.headers['X-Requested-With'], 'MediDesk');
  assert.equal(sent.options.headers.Authorization, undefined);
});
test('API client refuses cross-origin and non-API destinations', () => {
  for (const url of ['https://evil.example/api/auth/logout', '//evil.example/api/health', '/admin', '/api/../secret']) {
    assert.throws(() => apiFetch(url), /Invalid API target/);
  }
});
test('patient directory search cannot inject additional query parameters', async () => {
  let sent;
  globalThis.fetch = async (url) => { sent = url; return { ok: true, json: async () => ({}) }; };
  await fetchDoctorPatients('name&practitioner_id=2');
  assert.equal(sent.searchParams.get('query'), 'name&practitioner_id=2');
  assert.equal(sent.searchParams.has('practitioner_id'), false);
});
