const API_BASE = '/api';

export function apiFetch(url, options = {}) {
  const target = new URL(url, window.location.origin);
  if (target.origin !== window.location.origin || !target.pathname.startsWith('/api/')) throw new Error('Invalid API target');
  return fetch(target, { ...options, credentials: 'same-origin', headers: { ...getAuthHeaders(), ...options.headers, 'X-Requested-With': 'MediDesk' } });
}

export function getAuthHeaders(custom = {}) {

  const headers = { 'Content-Type': 'application/json', ...custom };
  return headers;
}

export async function fetchDoctors(params = {}) {
  const query = new URLSearchParams(params).toString();
  const res = await apiFetch(`${API_BASE}/doctors${query ? `?${query}` : ''}`, {
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error('Failed to fetch doctors');
  return res.json();
}

export async function fetchDoctorById(id) {
  const res = await apiFetch(`${API_BASE}/doctors/${id}`, {
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error('Failed to fetch doctor');
  return res.json();
}

export async function bookAppointment(data) {
  const res = await apiFetch(`${API_BASE}/appointments`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data)
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || 'Booking failed');
  }
  return res.json();
}

export async function submitPractitionerOnboarding(data) {
  const res = await apiFetch(`${API_BASE}/onboarding`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || 'Onboarding submission failed');
  }
  return res.json();
}

export async function fetchOnboardingByCode(code) {
  const res = await apiFetch(`${API_BASE}/onboarding/${code}`);
  if (!res.ok) throw new Error('Application record not found');
  return res.json();
}

export async function fetchQueue(practitionerId) {
  const res = await apiFetch(`${API_BASE}/queue/${practitionerId}`);
  if (!res.ok) throw new Error('Failed to fetch queue status');
  return res.json();
}

export async function advanceQueueTicket(practitionerId) {
  const res = await apiFetch(`${API_BASE}/queue/${practitionerId}/next`, {
    method: 'POST'
  });
  if (!res.ok) throw new Error('Failed to advance queue');
  return res.json();
}

export async function fetchPrescription(ref) {
  const res = await apiFetch(`${API_BASE}/prescriptions/${ref}`);
  if (!res.ok) throw new Error('Prescription not found');
  return res.json();
}

export async function fetchPricingPlans() {
  const res = await apiFetch(`${API_BASE}/pricing`);
  if (!res.ok) throw new Error('Failed to fetch pricing plans');
  return res.json();
}

// Secretariat API Helpers
export async function fetchSecretariatDashboard() {
  const res = await apiFetch(`${API_BASE}/secretariat/dashboard`);
  if (!res.ok) throw new Error('Failed to fetch secretariat dashboard');
  return res.json();
}

export async function fetchVisitorReservations() {
  const res = await apiFetch(`${API_BASE}/secretariat/visitor-reservations`);
  if (!res.ok) throw new Error('Failed to fetch visitor reservations');
  return res.json();
}

export async function validateVisitorReservation(id) {
  const res = await apiFetch(`${API_BASE}/secretariat/visitor-reservations/${id}/validate`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to validate visitor reservation');
  return res.json();
}

export async function rejectVisitorReservation(id) {
  const res = await apiFetch(`${API_BASE}/secretariat/visitor-reservations/${id}/reject`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to reject visitor reservation');
  return res.json();
}

export async function createBillingTransaction(data) {
  const res = await apiFetch(`${API_BASE}/secretariat/billing`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Billing transaction failed');
  return res.json();
}

export async function fetchTodayBilling() {
  const res = await apiFetch(`${API_BASE}/secretariat/billing/today`);
  if (!res.ok) throw new Error('Failed to fetch today billing');
  return res.json();
}

export async function sendIntercomMessage(data) {
  const res = await apiFetch(`${API_BASE}/secretariat/intercom`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to send intercom message');
  return res.json();
}

export async function fetchCashCloseoutReport() {
  const res = await apiFetch(`${API_BASE}/secretariat/cash-closeout`);
  if (!res.ok) throw new Error('Failed to fetch cash closeout report');
  return res.json();
}

export async function lockCashRegister(data) {
  const res = await apiFetch(`${API_BASE}/secretariat/cash-closeout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to lock cash register');
  return res.json();
}

// Doctor API Helpers
export async function fetchDoctorDashboard() {
  const res = await apiFetch(`${API_BASE}/doctor/dashboard`);
  if (!res.ok) throw new Error('Failed to fetch doctor dashboard');
  return res.json();
}

export async function callPatientF2() {
  const res = await apiFetch(`${API_BASE}/doctor/call-patient`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to call patient F2');
  return res.json();
}

export async function fetchDoctorPatients(query = '') {
  const res = await apiFetch(`${API_BASE}/doctor/patients${query ? `?query=${encodeURIComponent(query)}` : ''}`);
  if (!res.ok) throw new Error('Failed to fetch doctor patient directory');
  return res.json();
}

export async function saveDoctorConsultation(data) {
  const res = await apiFetch(`${API_BASE}/doctor/consultations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to save consultation');
  return res.json();
}

export async function generateMedicalCertificate(data) {
  const res = await apiFetch(`${API_BASE}/doctor/certificates`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to generate medical certificate');
  return res.json();
}

export async function processOcrMedicalScan() {
  const res = await apiFetch(`${API_BASE}/doctor/ocr-scan`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to process OCR scan');
  return res.json();
}

export async function postDelayAlert(data) {
  const res = await apiFetch(`${API_BASE}/doctor/delay-alert`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to trigger delay alert');
  return res.json();
}

export async function fetchDoctorPracticeAnalytics() {
  const res = await apiFetch(`${API_BASE}/doctor/analytics`);
  if (!res.ok) throw new Error('Failed to fetch practice analytics');
  return res.json();
}

export async function fetchDoctorSubscriptionStatus() {
  const res = await apiFetch(`${API_BASE}/doctor/subscription`);
  if (!res.ok) throw new Error('Failed to fetch subscription status');
  return res.json();
}

// SuperAdmin API Helpers
export async function fetchSuperAdminDashboard() {
  const res = await apiFetch(`${API_BASE}/superadmin/dashboard`);
  if (!res.ok) throw new Error('Failed to fetch superadmin dashboard');
  return res.json();
}

export async function fetchSuperAdminApplications() {
  const res = await apiFetch(`${API_BASE}/superadmin/applications`);
  if (!res.ok) throw new Error('Failed to fetch applications');
  return res.json();
}

export async function approveSuperAdminApplication(id) {
  const res = await apiFetch(`${API_BASE}/superadmin/applications/${id}/approve`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to approve application');
  return res.json();
}

export async function rejectSuperAdminApplication(id) {
  const res = await apiFetch(`${API_BASE}/superadmin/applications/${id}/reject`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to reject application');
  return res.json();
}

export async function fetchSuperAdminPractitioners() {
  const res = await apiFetch(`${API_BASE}/superadmin/practitioners`);
  if (!res.ok) throw new Error('Failed to fetch superadmin practitioners');
  return res.json();
}

export async function updateSuperAdminPractitionerPlan(id, newPlan) {
  const res = await apiFetch(`${API_BASE}/superadmin/practitioners/${id}/plan`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ new_plan: newPlan })
  });
  if (!res.ok) throw new Error('Failed to update practitioner plan');
  return res.json();
}

export async function fetchSuperAdminBillingSupervision() {
  const res = await apiFetch(`${API_BASE}/superadmin/billing`);
  if (!res.ok) throw new Error('Failed to fetch billing supervision');
  return res.json();
}

export async function fetchSuperAdminAnalytics() {
  const res = await apiFetch(`${API_BASE}/superadmin/analytics`);
  if (!res.ok) throw new Error('Failed to fetch superadmin analytics');
  return res.json();
}

export async function fetchSuperAdminSuggestions() {
  const res = await apiFetch(`${API_BASE}/superadmin/suggestions`);
  if (!res.ok) throw new Error('Failed to fetch superadmin suggestions');
  return res.json();
}

export async function fetchPractitionerDetail(id) {
  const res = await apiFetch(`${API_BASE}/superadmin/practitioners/${id}`);
  if (!res.ok) throw new Error('Failed to fetch practitioner detail');
  return res.json();
}

export async function fetchPricingSettingsAdmin() {
  const res = await apiFetch(`${API_BASE}/superadmin/pricing-settings`);
  if (!res.ok) throw new Error('Failed to fetch pricing settings');
  return res.json();
}

export async function fetchSuperAdminTeam() {
  const res = await apiFetch(`${API_BASE}/superadmin/team`);
  if (!res.ok) throw new Error('Failed to fetch superadmin team');
  return res.json();
}

export async function fetchSuperAdminSecurity() {
  const res = await apiFetch(`${API_BASE}/superadmin/security`);
  if (!res.ok) throw new Error('Failed to fetch superadmin security logs');
  return res.json();
}

export async function fetchDoctorTeam() {
  const res = await apiFetch(`${API_BASE}/superadmin/doctor-team`);
  if (!res.ok) throw new Error('Failed to fetch doctor team');
  return res.json();
}

export async function fetchDoctorSecurity() {
  const res = await apiFetch(`${API_BASE}/superadmin/doctor-security`);
  if (!res.ok) throw new Error('Failed to fetch doctor security settings');
  return res.json();
}

export async function createDoctorPractitioner(doctorData) {
  const res = await apiFetch(`${API_BASE}/superadmin/practitioners`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(doctorData)
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || 'Ã‰chec de la crÃ©ation du praticien');
  }
  return res.json();
}

export async function addDoctorSecretary(secretaryData) {
  const res = await apiFetch(`${API_BASE}/superadmin/doctor-team`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(secretaryData)
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || 'Ã‰chec de l\'ajout de la secrÃ©taire');
  }
  return res.json();
}

export async function registerPatient(patientData) {
  const res = await apiFetch(`${API_BASE}/patient/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(patientData)
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || 'Ã‰chec de l\'inscription patient');
  }
  return res.json();
}

export async function loginUser(credentials) {
  const res = await apiFetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials)
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || 'Ã‰chec de l\'authentification');
  }
  return res.json();
}





