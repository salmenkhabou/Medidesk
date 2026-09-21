import { db } from './index.js';

console.log('🌱 Seeding MediDesk Database...');

// Clear existing tables
db.exec(`
  DELETE FROM appointments;
  DELETE FROM waiting_queue;
  DELETE FROM onboarding_requests;
  DELETE FROM prescriptions;
  DELETE FROM pricing_plans;
  DELETE FROM practitioners;
`);

// 1. Seed Practitioners
const insertPractitioner = db.prepare(`
  INSERT INTO practitioners (
    name, title, cnom_number, specialty, city, address, phone, email, fee_tnd, cnam_convention, rating, reviews_count, availability_status, avatar_url, bio
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const practitionersData = [
  {
    name: "Dr. Leila Ben Salem",
    title: "Cardiologue & Maladies Vasculaires",
    cnom_number: "19204/CNOM",
    specialty: "Cardiologie",
    city: "Tunis",
    address: "Centre Urbain Nord, Immeuble Clarita, 4ème étage, Tunis",
    phone: "+216 71 950 120",
    email: "dr.bensalem@cardioclinic.tn",
    fee_tnd: 60,
    cnam_convention: 1,
    rating: 4.9,
    reviews_count: 142,
    availability_status: "Available Today",
    avatar_url: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=400",
    bio: "Ancienne interne des hôpitaux de Tunis. Spécialisée en échocardiographie doppler et cardiologie préventive."
  },
  {
    name: "Dr. Mohamed Triki",
    title: "Pédiatre & Néonatologue",
    cnom_number: "16840/CNOM",
    specialty: "Pédiatrie",
    city: "Sousse",
    address: "Khezama Ouest, Rue du Maghreb Arabe, Sousse",
    phone: "+216 73 240 880",
    email: "dr.triki@pediatrie-sousse.tn",
    fee_tnd: 50,
    cnam_convention: 1,
    rating: 4.8,
    reviews_count: 98,
    availability_status: "Demain 09:00",
    avatar_url: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=400",
    bio: "Suivi pédiatrique global, vaccinations, croissance et urgences néonatales."
  },
  {
    name: "Dr. Sarah Karray",
    title: "Dermatologue & Vénérologue",
    cnom_number: "21055/CNOM",
    specialty: "Dermatologie",
    city: "Tunis",
    address: "Avenue Hédi Nouira, Ennasr 2, Tunis",
    phone: "+216 71 885 300",
    email: "contact@dr-karray-dermato.tn",
    fee_tnd: 65,
    cnam_convention: 0,
    rating: 4.9,
    reviews_count: 128,
    availability_status: "Jeudi 10:30",
    avatar_url: "https://images.unsplash.com/photo-1594824813570-826f63412952?auto=format&fit=crop&q=80&w=400",
    bio: "Expertise en dermatologie esthétique, laser médical et pathologies allergiques cutanées."
  },
  {
    name: "Dr. Yassine Chaabane",
    title: "Ophtalmologiste - Chirurgie Laser",
    cnom_number: "17930/CNOM",
    specialty: "Ophtalmologie",
    city: "Sfax",
    address: "Route de Téniour Km 1.5, Complexe Médical Al Chifa, Sfax",
    phone: "+216 74 400 650",
    email: "dr.chaabane@ophtalmo-sfax.tn",
    fee_tnd: 55,
    cnam_convention: 1,
    rating: 4.7,
    reviews_count: 84,
    availability_status: "Aujourd'hui 17:00",
    avatar_url: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=400",
    bio: "Chirurgie de la cataracte, chirurgie réfractive laser et exploration de la rétine."
  },
  {
    name: "Dr. Karim Ben Mahmoud",
    title: "Médecin Généraliste & Urgentiste",
    cnom_number: "18452/CNOM",
    specialty: "Généraliste",
    city: "Tunis",
    address: "Rue du Lac de Constance, Immeuble Carthage, Les Berges du Lac, Tunis",
    phone: "+216 98 420 811",
    email: "dr.k.benmahmoud@clinique-carthage.tn",
    fee_tnd: 45,
    cnam_convention: 1,
    rating: 4.9,
    reviews_count: 176,
    availability_status: "Available Today",
    avatar_url: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=400",
    bio: "Consultations générales, certificats médicaux, électrocardiogramme de repos et bilans de santé."
  },
  {
    name: "Dr. Chiraz Mansour",
    title: "Gynécologue Obstétricienne",
    cnom_number: "20110/CNOM",
    specialty: "Gynécologie",
    city: "Monastir",
    address: "Avenue Habib Bourguiba, Face Hôpital Fattouma Bourguiba, Monastir",
    phone: "+216 73 468 900",
    email: "dr.mansour@gyneco-monastir.tn",
    fee_tnd: 60,
    cnam_convention: 1,
    rating: 4.8,
    reviews_count: 110,
    availability_status: "Demain 11:00",
    avatar_url: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&q=80&w=400",
    bio: "Suivi de grossesse, échographie 3D/4D, hystéroscopie et chirurgie gynécologique."
  }
];

practitionersData.forEach(p => {
  insertPractitioner.run(
    p.name, p.title, p.cnom_number, p.specialty, p.city, p.address,
    p.phone, p.email, p.fee_tnd, p.cnam_convention, p.rating, p.reviews_count,
    p.availability_status, p.avatar_url, p.bio
  );
});

// 2. Seed Waiting Queue for Practitioner 1 (Dr. Leila Ben Salem) and 5 (Dr. Karim Ben Mahmoud)
const insertQueue = db.prepare(`
  INSERT INTO waiting_queue (practitioner_id, current_patient_number, total_in_queue, estimated_wait_mins, status_message)
  VALUES (?, ?, ?, ?, ?)
`);

insertQueue.run(1, 4, 8, 12, "Dr. in session with patient #03");
insertQueue.run(5, 6, 11, 18, "Dr. in session with patient #05");

// 3. Seed Appointments
const insertAppointment = db.prepare(`
  INSERT INTO appointments (practitioner_id, patient_name, patient_phone, patient_cin, appointment_date, appointment_time, consultation_type, status, cnam_requested, notes)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const todayStr = new Date().toISOString().split('T')[0];

insertAppointment.run(1, "Amel Ben Ali", "+216 97 123 456", "08765432", todayStr, "15:15", "Cabinet", "confirmed", 1, "Bilan annuel hypertension");
insertAppointment.run(1, "Sami Hamdi", "+216 22 987 654", "05432109", todayStr, "16:00", "Cabinet", "confirmed", 1, "Échocardiographie de contrôle");
insertAppointment.run(5, "Youssef Gharbi", "+216 55 444 333", "09871234", todayStr, "14:30", "Cabinet", "confirmed", 1, "Fièvre et toux persistante");

// 4. Seed Onboarding Requests
const insertOnboarding = db.prepare(`
  INSERT INTO onboarding_requests (tracking_code, doctor_name, cnom_number, specialty, phone, email, clinic_name, city, address, cnam_convention, plan_type, secretariat_invited, document_name, status)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

insertOnboarding.run(
  "MD-2024-8841",
  "Dr. Karim Ben Mahmoud",
  "18452 / CNOM",
  "Cardiologie & Maladies Vasculaires",
  "+216 98 420 811",
  "dr.k.benmahmoud@clinique-carthage.tn",
  "Cabinet Médical Les Berges du Lac",
  "Tunis",
  "Rue du Lac de Constance, Immeuble Carthage Médical, 3ème étage, Les Berges du Lac, 1053 Tunis",
  1,
  "cloud_hds",
  "Amira Trabelsi (amira.t@cabinet-lac.tn)",
  "Attestation_CNOM_2024.pdf",
  "under_review"
);

// 5. Seed Prescriptions
const insertPrescription = db.prepare(`
  INSERT INTO prescriptions (reference_code, patient_name, patient_cin, doctor_name, doctor_cnom, date, medications_json, contraindication_warning)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`);

const meds = [
  { name: "Amlodipine 5mg", dosage: "1 comprimé le matin", duration: "30 jours", quantity: 1 },
  { name: "Aspegic 100mg", dosage: "1 sachet à midi au cours du repas", duration: "30 jours", quantity: 1 }
];

insertPrescription.run(
  "ORD-TN-2024-9921",
  "Amel Ben Ali",
  "08765432",
  "Dr. Leila Ben Salem",
  "19204/CNOM",
  todayStr,
  JSON.stringify(meds),
  "Remarque: Antécédent d'allergie Pénicilline noté au dossier. Aucune bêta-lactamine prescrite."
);

// 6. Seed Pricing Plans
const insertPricing = db.prepare(`
  INSERT INTO pricing_plans (code, name, price_monthly, price_annual, description, features_json, is_popular)
  VALUES (?, ?, ?, ?, ?, ?, ?)
`);

const featuresLocal = [
  "Installation sur serveur ou PC cabinet",
  "Dossier Médical & Ordonnances Bilingues (FR/AR)",
  "Module Feuilles de Soins & Bordereaux CNAM",
  "Impression recettes & reçus honoraires"
];

const featuresCloud = [
  "Sauvegarde continue 3 sites certifiés HDS Santé",
  "Synchronisation temps réel médecin & secrétariat",
  "Accès multi-écrans sécurisé (PC, Mac, Tablette)",
  "Rappels automatiques SMS & WhatsApp aux patients",
  "Assistance téléphonique dédiée 7j/7"
];

const featuresPoly = [
  "Multi-praticiens & Secrétariats illimités",
  "Facturation avancée Polyclinique & Tiers payant",
  "Interfaçage matériel médical & laboratoire",
  "Gestionnaire de garde & Planning blocs opératoires",
  "Account Manager dédié à Tunis"
];

insertPricing.run("local", "Stockage Local", 65, 55, "Cabinet autonome mono-poste sans connexion internet permanente.", JSON.stringify(featuresLocal), 0);
insertPricing.run("cloud_hds", "Cloud HDS Sécurisé", 115, 95, "Pratique moderne & mobilité intégrale avec synchronisation temps réel.", JSON.stringify(featuresCloud), 1);
insertPricing.run("polyclinique", "Polyclinique / Clinique", 210, 180, "Infrastructure complète pour centres médicaux pluri-disciplinaires.", JSON.stringify(featuresPoly), 0);

console.log('✅ MediDesk Database Seeded Successfully!');
