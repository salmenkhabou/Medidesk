-- MediDesk Database Schema

CREATE TABLE IF NOT EXISTS practitioners (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  title TEXT NOT NULL,
  cnom_number TEXT UNIQUE NOT NULL,
  specialty TEXT NOT NULL,
  city TEXT NOT NULL,
  address TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  fee_tnd INTEGER NOT NULL,
  cnam_convention INTEGER DEFAULT 1,
  rating REAL DEFAULT 4.9,
  reviews_count INTEGER DEFAULT 42,
  availability_status TEXT DEFAULT 'Available Today',
  avatar_url TEXT,
  bio TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS appointments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  practitioner_id INTEGER NOT NULL,
  patient_name TEXT NOT NULL,
  patient_phone TEXT NOT NULL,
  patient_cin TEXT NOT NULL,
  appointment_date TEXT NOT NULL,
  appointment_time TEXT NOT NULL,
  consultation_type TEXT DEFAULT 'Cabinet',
  status TEXT DEFAULT 'confirmed',
  cnam_requested INTEGER DEFAULT 1,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (practitioner_id) REFERENCES practitioners(id)
);

CREATE TABLE IF NOT EXISTS waiting_queue (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  practitioner_id INTEGER UNIQUE NOT NULL,
  current_patient_number INTEGER DEFAULT 3,
  total_in_queue INTEGER DEFAULT 8,
  estimated_wait_mins INTEGER DEFAULT 12,
  status_message TEXT DEFAULT 'Dr. in session with patient #03',
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (practitioner_id) REFERENCES practitioners(id)
);

CREATE TABLE IF NOT EXISTS onboarding_requests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tracking_code TEXT UNIQUE NOT NULL,
  doctor_name TEXT NOT NULL,
  cnom_number TEXT NOT NULL,
  specialty TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  clinic_name TEXT NOT NULL,
  city TEXT NOT NULL,
  address TEXT NOT NULL,
  cnam_convention INTEGER DEFAULT 1,
  plan_type TEXT DEFAULT 'cloud_hds',
  secretariat_invited TEXT,
  document_name TEXT,
  status TEXT DEFAULT 'under_review',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS prescriptions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  reference_code TEXT UNIQUE NOT NULL,
  patient_name TEXT NOT NULL,
  patient_cin TEXT NOT NULL,
  doctor_name TEXT NOT NULL,
  doctor_cnom TEXT NOT NULL,
  date TEXT NOT NULL,
  medications_json TEXT NOT NULL,
  contraindication_warning TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS pricing_plans (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  price_monthly INTEGER NOT NULL,
  price_annual INTEGER NOT NULL,
  description TEXT NOT NULL,
  features_json TEXT NOT NULL,
  is_popular INTEGER DEFAULT 0
);
