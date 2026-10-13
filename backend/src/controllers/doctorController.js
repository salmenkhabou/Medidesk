import { db } from '../db/index.js';

// In-memory mock storage for doctor specific features
let doctorConsultationsStore = [
  {
    id: 1,
    patient_name: "Mohamed Hédi Guediche",
    cin: "04892144",
    age: 58,
    gender: "Homme",
    date: new Date().toISOString().split('T')[0],
    time: "11:15",
    motive: "Contrôle post-opératoire & ECG",
    ta: "135/85",
    bpm: 72,
    spo2: 98,
    temp: 36.8,
    weight: 82,
    height: 175,
    auscultation: "Bruits du cœur réguliers, pas de souffle. Poumons libres.",
    symptoms: "Légère fatigue à l'effort, pas de douleur thoracique.",
    acts: ["Consultation Spécialisée", "Électrocardiogramme (ECG) 12 dérivations"],
    icd10: "I10 - Hypertension Artérielle Essentielle",
    prescription: [
      { name: "Amlodipine 5mg", dosage: "1 comprimé le matin", duration: "30 jours", qty: 1 },
      { name: "Aspegic 100mg", dosage: "1 sachet à midi", duration: "30 jours", qty: 1 }
    ],
    status: "completed"
  }
];

let doctorCertificatesStore = [
  {
    id: 1,
    cert_no: "CERT-2025-9901",
    patient_name: "Kamel Laroussi",
    cin: "04512993",
    type: "Certificat de Repos Médical (Arrêt de travail)",
    duration_days: 3,
    start_date: new Date().toISOString().split('T')[0],
    doctor: "Dr. Karim Ben Mahmoud",
    created_at: new Date().toISOString()
  }
];

let doctorDelayAlertsStore = [];

export const getDoctorDashboardSummary = (req, res) => {
  try {
    return res.json({
      doctor: {
        id: 5,
        name: "Dr. Karim Ben Mahmoud",
        specialty: "Cardiologie & Angiologie",
        clinic: "Clinique Alyssa — Cabinet Médical Central (Tunis)",
        room: "Cabinet N° 01 (Étage 1)",
        subscription: "Abonnement Pro — Actif",
        secretary_on_duty: "Amel Trabelsi"
      },
      kpi: {
        patients_today_total: 18,
        patients_today_seen: 11,
        patients_in_waiting: 3,
        patients_scheduled_remaining: 4,
        punctuality_rate: "91.4%",
        avg_wait_mins: 11,
        monthly_revenue_tnd: 14850,
        monthly_cnam_percentage: 82,
        new_patients_week: 14
      },
      current_active_slot: {
        time: "11:15",
        patient_name: "Mohamed Hédi Guediche",
        cin: "04892144",
        arrived_at: "11:02",
        motive: "Contrôle post-opératoire & ECG",
        status: "EN SALLE"
      },
      activity_feed: [
        { id: 1, time: "Il y a 12 min", title: "Résultat de Laboratoire", desc: "Laboratoire Bio-Alyssa a téléversé le bilan lipidique & INR de Mounir Zoghlam (Dossier #TN-7712).", icon: "biotech" },
        { id: 2, time: "Il y a 45 min", title: "Orientation Confrère", desc: "Recommandation reçue de Dr. Mehdi Karray (Chirurgie Vasculaire) pour bilan pré-opératoire.", icon: "person_check" },
        { id: 3, time: "Il y a 2h", title: "Télétransmission CNAM", desc: "Bordereau #AP2-889 (5 dossiers) certifié et acquitté par le centre CNAM Tunis Ouest.", icon: "task_alt" }
      ]
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const callPatientF2 = (req, res) => {
  res.json({
    success: true,
    message: "Signal d'appel patient [F2] transmis à l'écran de la salle d'attente !",
    called_patient: "Mohamed Hédi Guediche"
  });
};

export const getDoctorPatientDirectory = (req, res) => {
  const { query } = req.query;
  const list = [
    { cin: "04892144", name: "Mohamed Hédi Guediche", age: 58, gender: "H", phone: "+216 98 420 112", pathology: "HTA & Diabète T2", cnam: "Filière Privée", lastVisit: "24/10/2025" },
    { cin: "06214589", name: "Yasmine Ben Amor", age: 42, gender: "F", phone: "+216 98 420 811", pathology: "Échocardiographie", cnam: "APC Validée", lastVisit: "24/10/2025" },
    { cin: "04512993", name: "Ahmed Trabelsi", age: 64, gender: "H", phone: "+216 97 123 456", pathology: "Post-Infarctus", cnam: "Filière Privée", lastVisit: "12/09/2025" },
    { cin: "07198234", name: "Leila Khemir", age: 51, gender: "F", phone: "+216 22 987 654", pathology: "Bilan Pre-op", cnam: "APC CNAM", lastVisit: "05/08/2025" }
  ];

  if (query) {
    const q = query.toLowerCase();
    const filtered = list.filter(p => p.name.toLowerCase().includes(q) || p.cin.includes(q) || p.phone.includes(q));
    return res.json({ data: filtered });
  }

  res.json({ data: list });
};

export const saveDoctorConsultation = (req, res) => {
  const { patient_name, cin, motive, ta, bpm, spo2, temp, weight, height, auscultation, symptoms, acts, icd10, prescription } = req.body;
  const consultation = {
    id: doctorConsultationsStore.length + 1,
    patient_name: patient_name || "Patient Anonyme",
    cin: cin || "00000000",
    date: new Date().toISOString().split('T')[0],
    time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
    motive: motive || "Consultation Médicale",
    ta: ta || "120/80",
    bpm: Number(bpm) || 75,
    spo2: Number(spo2) || 98,
    temp: Number(temp) || 37.0,
    weight: Number(weight) || 75,
    height: Number(height) || 170,
    auscultation: auscultation || "Examen clinique normal.",
    symptoms: symptoms || "Aucun symptôme grave.",
    acts: acts || ["Consultation Spécialisée"],
    icd10: icd10 || "Z00.0 - Examen Médical Général",
    prescription: prescription || [],
    status: "completed"
  };
  doctorConsultationsStore.push(consultation);
  res.json({ success: true, message: "Consultation enregistrée avec succès dans le dossier EMR !", consultation });
};

export const generateMedicalCertificate = (req, res) => {
  const { patient_name, cin, type, duration_days, doctor } = req.body;
  const cert = {
    id: doctorCertificatesStore.length + 1,
    cert_no: `CERT-2025-${Math.floor(1000 + Math.random() * 9000)}`,
    patient_name: patient_name || "Patient",
    cin: cin || "00000000",
    type: type || "Certificat de Repos Médical",
    duration_days: Number(duration_days) || 3,
    start_date: new Date().toISOString().split('T')[0],
    doctor: doctor || "Dr. Karim Ben Mahmoud",
    created_at: new Date().toISOString()
  };
  doctorCertificatesStore.push(cert);
  res.json({ success: true, message: "Certificat médical certifié et généré avec succès !", certificate: cert });
};

export const processOcrMedicalScan = (req, res) => {
  res.json({
    success: true,
    extracted_data: {
      patient_name: "Mohamed Hédi Guediche",
      cin: "04892144",
      lab_name: "Bio-Alyssa Tunis",
      document_date: "23/10/2025",
      metrics: {
        glycemie_jeun: "5.8 mmol/L (Normal)",
        hba1c: "6.4% (Équilibré)",
        inr: "2.1 (Zone cible)",
        cholesterol_total: "1.95 g/L",
        hdl: "0.45 g/L",
        ldl: "1.10 g/L",
        creatinine: "82 umol/L"
      },
      conclusion: "Bilan lipidique et anticoagulation dans les normes. Poursuite du traitement."
    }
  });
};

export const postDelayAlert = (req, res) => {
  const { minutes, scenario_title, notify_sms } = req.body;
  const alert = {
    id: doctorDelayAlertsStore.length + 1,
    minutes: Number(minutes) || 20,
    scenario_title: scenario_title || "Retard Clinique",
    notify_sms: notify_sms ?? true,
    timestamp: new Date().toISOString()
  };
  doctorDelayAlertsStore.push(alert);
  res.json({
    success: true,
    message: `Alerte retard (+${alert.minutes} min) activée ! Secrétariat Amel Trabelsi & SMS envoyés aux patients.`,
    data: alert
  });
};

export const getDoctorPracticeAnalytics = (req, res) => {
  res.json({
    revenue_month_total: 14850,
    revenue_target: 18000,
    breakdown_by_payment: {
      cash: 7200,
      cheque: 2400,
      tpe: 1800,
      cnam_reimbursements: 3450
    },
    top_acts: [
      { name: "Consultation Spécialisée", count: 85, revenue: 5100 },
      { name: "Échocardiographie Doppler", count: 42, revenue: 5040 },
      { name: "ECG 12 dérivations", count: 64, revenue: 1280 },
      { name: "Restitution Holter 24h", count: 28, revenue: 2520 }
    ],
    cnam_pending_claims_tnd: 3840
  });
};

export const getDoctorSubscriptionStatus = (req, res) => {
  res.json({
    plan_name: "MediDesk Cloud HDS Pro",
    price_monthly_tnd: 115,
    status: "active",
    renews_at: "2026-10-01",
    hds_certified_nodes: 3,
    storage_used_gb: 42.5,
    storage_limit_gb: 500,
    invoices: [
      { invoice_no: "FAC-2025-1044", date: "01/10/2025", amount: 115, status: "paid" },
      { invoice_no: "FAC-2025-0912", date: "01/09/2025", amount: 115, status: "paid" }
    ]
  });
};
