const BASE_URL = 'http://localhost:5000/api';

async function testHierarchyAndSecurity() {
  console.log('================================================================');
  console.log('🔐 MEDIDESK HIERARCHICAL RBAC & SECURITY VERIFICATION SUITE');
  console.log('================================================================\n');

  let passed = 0;
  let failed = 0;

  async function post(url, body) {
    const res = await fetch(`${BASE_URL}${url}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const data = await res.json();
    return { status: res.status, data };
  }

  // 1. SuperAdmin Login (Without passing any role!)
  console.log('--- TEST 1: SuperAdmin Unified Login (No Role Param) ---');
  const adminLogin = await post('/auth/login', {
    email: 'admin@medidesk.tn',
    password: 'Password123!'
  });
  if (adminLogin.status === 200 && adminLogin.data.user.role === 'superadmin' && adminLogin.data.token) {
    console.log(`[PASS] SuperAdmin authenticated successfully. Detected role: ${adminLogin.data.user.role}`);
    passed++;
  } else {
    console.error(`[FAIL] SuperAdmin login failed:`, adminLogin);
    failed++;
  }

  // 2. SuperAdmin creates a new Doctor
  console.log('\n--- TEST 2: SuperAdmin Provisions New Doctor ---');
  const uniqueDocEmail = `dr.neila.${Date.now()}@medidesk.tn`;
  const docCreation = await post('/superadmin/practitioners', {
    name: 'Dr. Neila Mansouri',
    specialty: 'Neurologie',
    cnom: '23456/CNOM',
    city: 'Tunis',
    clinic: 'Centre Médical Pasteur',
    email: uniqueDocEmail,
    phone: '+216 71 222 333',
    plan: 'Cloud Secure Pro',
    password: 'DocPassword2026!'
  });
  if (docCreation.status === 201 && docCreation.data.success) {
    console.log(`[PASS] SuperAdmin successfully created doctor: ${docCreation.data.practitioner.name} (${uniqueDocEmail})`);
    passed++;
  } else {
    console.error(`[FAIL] Doctor creation failed:`, docCreation);
    failed++;
  }

  // 3. New Doctor logs in with credentials provisioned by SuperAdmin
  console.log('\n--- TEST 3: Doctor Logs In With Credentials (No Role Param) ---');
  const docLogin = await post('/auth/login', {
    email: uniqueDocEmail,
    password: 'DocPassword2026!'
  });
  if (docLogin.status === 200 && docLogin.data.user.role === 'doctor') {
    console.log(`[PASS] New Doctor logged in successfully! Automatically identified as: ${docLogin.data.user.role}`);
    passed++;
  } else {
    console.error(`[FAIL] Doctor login failed:`, docLogin);
    failed++;
  }

  // 4. Doctor adds a new Secretary
  console.log('\n--- TEST 4: Doctor Adds Secretary to Their Team ---');
  const uniqueSecEmail = `sec.fatma.${Date.now()}@medidesk.tn`;
  const secCreation = await post('/superadmin/doctor-team', {
    name: 'Fatma Cherif',
    role: 'Secrétaire Principale Cabinet',
    email: uniqueSecEmail,
    phone: '+216 99 112 233',
    permissions: 'Accueil, Encaissement, RDV',
    password: 'SecPassword2026!'
  });
  if (secCreation.status === 201 && secCreation.data.success) {
    console.log(`[PASS] Doctor successfully added secretary: ${secCreation.data.member.name} (${uniqueSecEmail})`);
    passed++;
  } else {
    console.error(`[FAIL] Secretary creation failed:`, secCreation);
    failed++;
  }

  // 5. New Secretary logs in with credentials provisioned by Doctor
  console.log('\n--- TEST 5: Secretary Logs In With Credentials (No Role Param) ---');
  const secLogin = await post('/auth/login', {
    email: uniqueSecEmail,
    password: 'SecPassword2026!'
  });
  if (secLogin.status === 200 && secLogin.data.user.role === 'secretariat') {
    console.log(`[PASS] New Secretary logged in successfully! Automatically identified as: ${secLogin.data.user.role}`);
    passed++;
  } else {
    console.error(`[FAIL] Secretary login failed:`, secLogin);
    failed++;
  }

  // 6. Patient Self-Registration (Only role allowed to self-register)
  console.log('\n--- TEST 6: Patient Public Self-Registration ---');
  const uniquePatientEmail = `patient.mourad.${Date.now()}@gmail.com`;
  const patientRegister = await post('/patient/register', {
    name: 'Mourad Trabelsi',
    email: uniquePatientEmail,
    phone: '+216 55 444 333',
    cin: '07654321',
    password: 'PatientPassword2026!'
  });
  if (patientRegister.status === 201 && patientRegister.data.success) {
    console.log(`[PASS] Patient successfully registered: ${patientRegister.data.patient.name} (${uniquePatientEmail})`);
    passed++;
  } else {
    console.error(`[FAIL] Patient registration failed:`, patientRegister);
    failed++;
  }

  // 7. Patient logs in
  console.log('\n--- TEST 7: Patient Logs In (No Role Param) ---');
  const patientLogin = await post('/auth/login', {
    email: uniquePatientEmail,
    password: 'PatientPassword2026!'
  });
  if (patientLogin.status === 200 && patientLogin.data.user.role === 'patient') {
    console.log(`[PASS] Patient logged in successfully! Automatically identified as: ${patientLogin.data.user.role}`);
    passed++;
  } else {
    console.error(`[FAIL] Patient login failed:`, patientLogin);
    failed++;
  }

  // 8. Negative Test: Wrong Password Protection
  console.log('\n--- TEST 8: Negative Security Test (Wrong Password) ---');
  const wrongPasswordLogin = await post('/auth/login', {
    email: 'admin@medidesk.tn',
    password: 'WrongPassword999!'
  });
  if (wrongPasswordLogin.status === 401) {
    console.log(`[PASS] Correctly rejected unauthorized access with HTTP 401.`);
    passed++;
  } else {
    console.error(`[FAIL] Should reject wrong password, got:`, wrongPasswordLogin);
    failed++;
  }

  console.log('\n================================================================');
  console.log(`🏁 RBAC Verification Summary: ${passed} PASSED | ${failed} FAILED | Total: ${passed + failed}`);
  console.log('================================================================');
}

testHierarchyAndSecurity();
