const API_BASE = '/api';

export async function fetchDoctors(params = {}) {
  const query = new URLSearchParams(params).toString();
  const res = await fetch(`${API_BASE}/doctors${query ? `?${query}` : ''}`);
  if (!res.ok) throw new Error('Failed to fetch doctors');
  return res.json();
}

export async function fetchDoctorById(id) {
  const res = await fetch(`${API_BASE}/doctors/${id}`);
  if (!res.ok) throw new Error('Failed to fetch doctor');
  return res.json();
}

export async function bookAppointment(data) {
  const res = await fetch(`${API_BASE}/appointments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || 'Booking failed');
  }
  return res.json();
}

export async function submitPractitionerOnboarding(data) {
  const res = await fetch(`${API_BASE}/onboarding`, {
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
  const res = await fetch(`${API_BASE}/onboarding/${code}`);
  if (!res.ok) throw new Error('Application record not found');
  return res.json();
}

export async function fetchQueue(practitionerId) {
  const res = await fetch(`${API_BASE}/queue/${practitionerId}`);
  if (!res.ok) throw new Error('Failed to fetch queue status');
  return res.json();
}

export async function advanceQueueTicket(practitionerId) {
  const res = await fetch(`${API_BASE}/queue/${practitionerId}/next`, {
    method: 'POST'
  });
  if (!res.ok) throw new Error('Failed to advance queue');
  return res.json();
}

export async function fetchPrescription(ref) {
  const res = await fetch(`${API_BASE}/prescriptions/${ref}`);
  if (!res.ok) throw new Error('Prescription not found');
  return res.json();
}

export async function fetchPricingPlans() {
  const res = await fetch(`${API_BASE}/pricing`);
  if (!res.ok) throw new Error('Failed to fetch pricing plans');
  return res.json();
}
