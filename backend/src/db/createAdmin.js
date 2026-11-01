import { createUser } from './userStore.js';

// Explicit local provisioning; no default administrator or password.
try {
  const user = createUser({ name: process.env.ADMIN_NAME || 'Administrator', email: process.env.ADMIN_EMAIL, password: process.env.ADMIN_PASSWORD, role: 'superadmin' });
  console.log(`Administrator created: ${user.email}`);
} catch (err) {
  console.error(err.message);
  process.exitCode = 1;
}
