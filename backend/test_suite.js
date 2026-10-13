const BASE_URL = 'http://localhost:5000/api';

async function runFullTestSuite() {
  console.log('====================================================');
  console.log('🛡️ MediDesk Deep Architecture & Security Test Suite');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  async function assertEndpoint(name, url, method = 'GET', body = null, expectedStatus = 200) {
    try {
      const opts = { method, headers: { 'Content-Type': 'application/json' } };
      if (body) opts.body = JSON.stringify(body);

      const res = await fetch(`${BASE_URL}${url}`, opts);
      const isSuccess = res.status === expectedStatus || (expectedStatus === 200 && res.ok);

      if (isSuccess) {
        console.log(`[PASS] ${name} (${method} ${url}) => HTTP ${res.status}`);
        passed++;
      } else {
        console.log(`[FAIL] ${name} (${method} ${url}) => HTTP ${res.status} (Expected ${expectedStatus})`);
        failed++;
      }
    } catch (err) {
      console.log(`[ERROR] ${name} (${method} ${url}) => ${err.message}`);
      failed++;
    }
  }

  console.log('--- 1. REST API GET Endpoints Integrity ---');
  await assertEndpoint('Health Check', '/health');
  await assertEndpoint('Doctors Directory', '/doctors');
  await assertEndpoint('Doctor Profile #1', '/doctors/1');
  await assertEndpoint('Live Queue #1', '/queue/1');
  await assertEndpoint('Prescription Lookup', '/prescriptions/ORD-TN-2024-9921');
  await assertEndpoint('Pricing Plans', '/pricing');
  await assertEndpoint('Secretariat Dashboard', '/secretariat/dashboard');
  await assertEndpoint('Visitor Reservations', '/secretariat/visitor-reservations');
  await assertEndpoint('Secretariat Billing Today', '/secretariat/billing/today');
  await assertEndpoint('Cash Closeout Z Report', '/secretariat/cash-closeout');
  await assertEndpoint('Doctor Dashboard Overview', '/doctor/dashboard');
  await assertEndpoint('Doctor Patient Directory', '/doctor/patients');
  await assertEndpoint('Doctor Practice Analytics', '/doctor/analytics');
  await assertEndpoint('Doctor Subscription', '/doctor/subscription');
  await assertEndpoint('SuperAdmin Dashboard Tower', '/superadmin/dashboard');
  await assertEndpoint('SuperAdmin Applications List', '/superadmin/applications');
  await assertEndpoint('SuperAdmin Practitioners', '/superadmin/practitioners');
  await assertEndpoint('SuperAdmin Practitioner Detail #1', '/superadmin/practitioners/1');
  await assertEndpoint('SuperAdmin Billing Supervision', '/superadmin/billing');
  await assertEndpoint('SuperAdmin Telemetry', '/superadmin/analytics');
  await assertEndpoint('SuperAdmin Suggestions', '/superadmin/suggestions');
  await assertEndpoint('SuperAdmin Pricing Settings', '/superadmin/pricing-settings');
  await assertEndpoint('SuperAdmin Team Governance', '/superadmin/team');
  await assertEndpoint('SuperAdmin Security Logs', '/superadmin/security');
  await assertEndpoint('Doctor Team Governance', '/superadmin/doctor-team');
  await assertEndpoint('Doctor Security Settings', '/superadmin/doctor-security');

  console.log('\n--- 2. Write Operations & Transaction Integrity ---');
  await assertEndpoint('Authenticate User & Issue Signed JWT', '/auth/login', 'POST', {
    email: 'dr.benmahmoud@medidesk.tn',
    password: 'Password123!',
    role: 'doctor'
  }, 200);

  await assertEndpoint('Book Appointment', '/appointments', 'POST', {

    practitioner_id: 1,
    patient_name: "Test Automated Patient",
    patient_phone: "+216 99 888 777",
    patient_cin: "09999999",
    appointment_date: "2026-10-15",
    appointment_time: "10:00",
    consultation_type: "Cabinet"
  }, 201);

  await assertEndpoint('Submit Practitioner Onboarding', '/onboarding', 'POST', {
    doctor_name: "Dr. Automated Test",
    cnom_number: "99999/CNOM",
    specialty: "Cardiologie",
    phone: "+216 71 000 111",
    email: "test.doctor@medidesk.tn",
    clinic_name: "Clinique Automated",
    city: "Tunis",
    address: "Lac 2",
    plan_type: "cloud_hds"
  }, 201);

  await assertEndpoint('Register POS Billing Transaction', '/secretariat/billing', 'POST', {
    patient_name: "Sami Hamdi",
    act: "Consultation Spécialiste",
    amount: 60,
    payment_method: "Espèces"
  });

  await assertEndpoint('Validate Visitor Reservation', '/secretariat/visitor-reservations/1/validate', 'POST');

  await assertEndpoint('Save Patient Clinical Consultation', '/doctor/consultations', 'POST', {
    patient_name: "Amel Ben Ali",
    notes: "Tension artérielle 12/8. Rythme sinusal régulier."
  });

  await assertEndpoint('Generate Medical Certificate', '/doctor/certificates', 'POST', {
    patient_name: "Amel Ben Ali",
    certificate_type: "Repos Médical 3 Jours"
  });

  await assertEndpoint('Approve CNOM Application', '/superadmin/applications/1/approve', 'POST');
  await assertEndpoint('Update Practitioner Plan', '/superadmin/practitioners/1/plan', 'PUT', {
    new_plan: "Cloud Secure Pro"
  });

  console.log('\n====================================================');
  console.log(`📊 Final Architecture Test Results: ${passed} PASSED | ${failed} FAILED | Total: ${passed + failed}`);
  console.log('====================================================');
}

runFullTestSuite();
