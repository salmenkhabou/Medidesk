import { db } from '../db/index.js';
import { createUser } from '../db/userStore.js';

let superadminApplicationsStore = [
  { id: 1, doctor_name: "Dr. Amina Mansour", cnom: "16402/CNOM", specialty: "Cardiologie & Rythmologie", city: "Tunis", clinic: "Les Berges du Lac 1", plan: "Cloud Secure Pro", status: "pending", verified_cnom: true },
  { id: 2, doctor_name: "Dr. Mehdi Khemir", cnom: "18290/CNOM", specialty: "Médecine Générale", city: "Nabeul", clinic: "Nabeul Centre", plan: "Cloud Secure Pro", status: "pending", verified_cnom: true },
  { id: 3, doctor_name: "Dr. Zeineb Triki", cnom: "15112/CNOM", specialty: "Dermatologie", city: "Ariana", clinic: "Ennasr 2", plan: "Stockage Local", status: "pending", verified_cnom: false }
];

let superadminPractitionersStore = [
  { id: 5, name: "Dr. Karim Ben Mahmoud", email: "dr.benmahmoud@medidesk.tn", cnom: "18452/CNOM", specialty: "Cardiologie", city: "Tunis", clinic: "Clinique Alyssa", plan: "Cloud Secure Pro", status: "active", mrr: 115, secretary: "Amel Trabelsi" },
  { id: 1, name: "Dr. Leila Ben Salem", email: "dr.bensalem@cardioclinic.tn", cnom: "19204/CNOM", specialty: "Cardiologie", city: "Tunis", clinic: "Centre Urbain Nord", plan: "Cloud Secure Pro", status: "active", mrr: 115, secretary: "Sarra Ben Ali" },
  { id: 2, name: "Dr. Mohamed Triki", email: "dr.triki@pediatrie-sousse.tn", cnom: "16840/CNOM", specialty: "Pédiatrie", city: "Sousse", clinic: "Khezama Ouest", plan: "Stockage Local", status: "active", mrr: 65, secretary: "Rim Khemir" },
  { id: 3, name: "Dr. Sarah Karray", email: "contact@dr-karray-dermato.tn", cnom: "21055/CNOM", specialty: "Dermatologie", city: "Tunis", clinic: "Ennasr 2", plan: "Cloud Secure Pro", status: "active", mrr: 115, secretary: "Ines Jaziri" },
  { id: 4, name: "Dr. Hichem Baccouche", email: "dr.chaabane@ophtalmo-sfax.tn", cnom: "14120/CNOM", specialty: "Ophtalmologie", city: "Sfax", clinic: "El Bassatine", plan: "Cloud Secure Pro", status: "overdue", mrr: 115, secretary: "Sonia Sellami" }
];

let doctorTeamMembersStore = [
  { id: 1, name: "Amel Trabelsi", role: "Secrétaire Principale", email: "amel.trabelsi@medidesk.tn", phone: "+216 98 123 456", permissions: "Accueil, Encaissement, RDV", status: "Actif" },
  { id: 2, name: "Leila Hamdi", role: "Secrétaire Remplaçante", email: "leila.h@alyssa.tn", phone: "+216 22 456 789", permissions: "Lecture Agenda & File d'attente", status: "Actif" }
];


let superadminSuggestionsStore = [
  { id: 1, doctor_name: "Dr. Leila Ben Salem", category: "Évolution Produit", suggestion: "Ajouter la saisie automatique des scores de risque cardiovasculaire SCORE2 dans le dossier EMR.", status: "under_review", date: "22/10/2025" },
  { id: 2, doctor_name: "Dr. Mohamed Triki", category: "Facturation CNAM", suggestion: "Possibilité d'imprimer les bordereaux récapitulatifs mensuels en format paysage.", status: "planned", date: "18/10/2025" }
];

export const getSuperAdminDashboardSummary = (req, res) => {
  try {
    return res.json({
      admin: {
        name: "Anis Zouari",
        role: "Admin Principal SuperAdmin",
        cluster_status: "Cluster Production HDS: 100% Opérationnel",
        uptime: "99.98%",
        clock_tunis: new Date().toLocaleDateString('fr-FR') + " • " + new Date().toLocaleTimeString('fr-FR') + " (Tunis)"
      },
      kpi: {
        active_doctors: superadminPractitionersStore.filter(p => p.status === 'active').length + 380,
        pending_applications: superadminApplicationsStore.filter(a => a.status === 'pending').length,
        mrr_tnd: 42650,
        arr_tnd_projected: 511800,
        monitored_patients_total: 128490
      },
      overdue_payments_alerts: [
        { doctor: "Dr. Hichem Baccouche", specialty: "Ophtalmologie", city: "Sfax", days_overdue: 4, amount_tnd: 1290, action: "Relance SMS/Mail" },
        { doctor: "Dr. Sonia Ben Amor", specialty: "Pédiatrie", city: "Tunis", days_overdue: 2, amount_tnd: 890, action: "Relance SMS" },
        { doctor: "Cabinet Les Jasmins", specialty: "Gynécologie", city: "Sousse", days_overdue: 1, amount_tnd: 1290, action: "Relance Mail" }
      ],
      pending_applications_list: superadminApplicationsStore,
      plan_breakdown: {
        cloud_secure_percentage: 72,
        local_storage_percentage: 28
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getSuperAdminApplications = (req, res) => {
  res.json({ data: superadminApplicationsStore });
};

export const approveApplication = (req, res) => {
  const { id } = req.params;
  const item = superadminApplicationsStore.find(a => a.id === parseInt(id));
  if (item) {
    item.status = 'approved';
    return res.json({ success: true, message: `Candidature de ${item.doctor_name} validée ! Compte médecin activé.`, application: item });
  }
  res.status(404).json({ error: "Candidature non trouvée" });
};

export const rejectApplication = (req, res) => {
  const { id } = req.params;
  const item = superadminApplicationsStore.find(a => a.id === parseInt(id));
  if (item) {
    item.status = 'rejected';
    return res.json({ success: true, message: `Candidature de ${item.doctor_name} refusée.`, application: item });
  }
  res.status(404).json({ error: "Candidature non trouvée" });
};

export const getSuperAdminPractitioners = (req, res) => {
  res.json({ data: superadminPractitionersStore });
};

export const updatePractitionerPlan = (req, res) => {
  const { id } = req.params;
  const { new_plan } = req.body;
  const item = superadminPractitionersStore.find(p => p.id === parseInt(id));
  if (item) {
    item.plan = new_plan || "Cloud Secure Pro";
    return res.json({ success: true, message: `Forfait de ${item.name} modifié vers ${item.plan} !`, practitioner: item });
  }
  res.status(404).json({ error: "Praticien non trouvé" });
};

export const getSuperAdminBillingSupervision = (req, res) => {
  res.json({
    mrr_tnd: 42650,
    arr_tnd: 511800,
    arpu_tnd: 1330,
    churn_rate: "0.8%",
    growth_mom: "+9.4%",
    invoices: [
      { invoice_no: "FAC-2025-1088", practitioner: "Dr. Karim Ben Mahmoud", date: "01/10/2025", amount: 115, status: "paid" },
      { invoice_no: "FAC-2025-1089", practitioner: "Dr. Leila Ben Salem", date: "01/10/2025", amount: 115, status: "paid" },
      { invoice_no: "FAC-2025-1090", practitioner: "Dr. Hichem Baccouche", date: "01/10/2025", amount: 1290, status: "overdue" }
    ]
  });
};

export const getSuperAdminAnalytics = (req, res) => {
  res.json({
    uptime_percentage: "99.98%",
    active_concurrent_sessions: 248,
    api_latency_ms: 14,
    hds_nodes_synced: 3,
    sms_sent_today: 1420,
    server_load: "18%",
    database_connections: 42,
    storage_used_gb: 1420,
    storage_total_gb: 5000,
    backup_status: "Sauvegarde HDS automatique effectuée il y a 22 minutes (Complète & Chiffrée AES-256)"
  });
};

export const getSuperAdminSuggestions = (req, res) => {
  res.json({ data: superadminSuggestionsStore });
};

export const getPractitionerDetail = (req, res) => {
  const { id } = req.params;
  const p = superadminPractitionersStore.find(item => item.id === parseInt(id)) || superadminPractitionersStore[0];
  res.json({
    id: p.id,
    name: p.name,
    cnom: p.cnom,
    specialty: p.specialty,
    city: p.city,
    clinic: p.clinic,
    plan: p.plan,
    status: p.status,
    mrr: p.mrr,
    secretary: p.secretary,
    phone: "+216 71 889 400",
    email: p.name.toLowerCase().replace(/[^a-z]/g, '') + "@medidesk.tn",
    joined_date: "12/03/2024",
    total_patients: 1480,
    storage_used: "4.2 GB",
    last_login: "Aujourd'hui à 09:42",
    activity_log: [
      { id: 1, action: "Connexion 2FA réussie", timestamp: "10/10/2026 09:42" },
      { id: 2, action: "Export Dossier Patient CNAM", timestamp: "09/10/2026 16:15" },
      { id: 3, action: "Paiement Mensuel Validé (FAC-2025-1089)", timestamp: "01/10/2026 10:00" }
    ]
  });
};

export const getPricingSettings = (req, res) => {
  res.json({
    plans: [
      { id: "free", name: "Découverte / Stagiaire", price: 0, period: "Gratuit", features: ["1 Praticien", "20 Patients / mois", "Stockage 1 Go"] },
      { id: "local", name: "Stockage Local", price: 65, period: "TND / mois", features: ["1 Praticien + 1 Secrétaire", "Dossiers Illimités", "Base Locale Sync"] },
      { id: "cloud", name: "Cloud Secure Pro", price: 115, period: "TND / mois", features: ["Praticiens Illimités", "Dossiers Cloud HDS", "Téléconsultation + CNAM auto"] },
      { id: "enterprise", name: "Clinique / Groupe", price: 290, period: "TND / mois", features: ["Multi-praticiens + Multi-secrétariats", "Support dédié 24/7", "API & ERP sur-mesure"] }
    ]
  });
};

export const getSuperAdminTeam = (req, res) => {
  res.json({
    team: [
      { id: 1, name: "Anis Zouari", role: "SuperAdmin Owner", email: "anis.zouari@medidesk.tn", status: "Actif", "2fa": true, permissions: "Accès Total" },
      { id: 2, name: "Sonia Ghorbel", role: "Support & Compliance HDS", email: "sonia.g@medidesk.tn", status: "Actif", "2fa": true, permissions: "Validation CNOM & Support" },
      { id: 3, name: "Youssef Ben Romdhane", role: "Ingénieur Infrastructures", email: "youssef.br@medidesk.tn", status: "Actif", "2fa": true, permissions: "Supervision Cluster & DevOps" }
    ]
  });
};

export const getSuperAdminSecurityLogs = (req, res) => {
  res.json({
    security_events: [
      { id: 1, event: "Authentification 2FA Réussie", user: "Anis Zouari", ip: "197.26.14.88 (Tunis)", date: "10/10/2026 10:45", severity: "info" },
      { id: 2, event: "Tentative d'accès non autorisée bloquée", user: "Inconnu", ip: "41.226.12.9 (Sousse)", date: "10/10/2026 04:12", severity: "warning" },
      { id: 3, event: "Sauvegarde Chiffrée Complétée", user: "System Auto", ip: "127.0.0.1", date: "10/10/2026 03:00", severity: "info" }
    ],
    mfa_enforced: true,
    ip_whitelist: ["197.26.14.88", "197.26.14.89"],
    session_timeout_minutes: 15
  });
};

export const getDoctorTeam = (req, res) => {
  res.json({
    doctor: "Dr. Karim Ben Mahmoud",
    clinic: "Clinique Alyssa",
    members: doctorTeamMembersStore
  });
};

export const addDoctorSecretary = (req, res) => {
  try {
    const { name, role, email, phone, permissions, password } = req.body;
    if (!name || !email) {
      return res.status(400).json({ success: false, message: "Nom et email de la secrétaire requis." });
    }

    const newId = doctorTeamMembersStore.length ? Math.max(...doctorTeamMembersStore.map(m => m.id)) + 1 : 1;
    const newSec = {
      id: newId,
      name,
      role: role || "Secrétaire Médicale",
      email,
      phone: phone || "+216 98 000 000",
      permissions: permissions || "Accueil, Encaissement, RDV",
      status: "Actif"
    };

    doctorTeamMembersStore.push(newSec);

    createUser({
      name,
      email,
      password: password || 'Password123!',
      role: 'secretariat',
      phone: newSec.phone,
      permissions: newSec.permissions
    });

    return res.status(201).json({
      success: true,
      message: `Secrétaire ${name} ajoutée et compte créé avec succès !`,
      member: newSec
    });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
};

export const createPractitioner = (req, res) => {
  try {
    const { name, specialty, cnom, city, clinic, email, phone, plan, password } = req.body;
    if (!name || !specialty || !email) {
      return res.status(400).json({ success: false, message: "Nom, spécialité et email requis." });
    }

    const newId = superadminPractitionersStore.length ? Math.max(...superadminPractitionersStore.map(p => p.id)) + 1 : 1;
    const newDoc = {
      id: newId,
      name,
      email,
      cnom: cnom || `${Math.floor(10000 + Math.random() * 90000)}/CNOM`,
      specialty,
      city: city || 'Tunis',
      clinic: clinic || 'Cabinet Médical',
      plan: plan || 'Cloud Secure Pro',
      status: 'active',
      mrr: plan === 'Stockage Local' ? 65 : 115,
      secretary: 'Non assignée'
    };

    superadminPractitionersStore.unshift(newDoc);

    createUser({
      name,
      email,
      password: password || 'Password123!',
      role: 'doctor',
      specialty,
      cnom: newDoc.cnom,
      city: newDoc.city,
      clinic: newDoc.clinic,
      phone: phone || '+216 71 000 000'
    });

    return res.status(201).json({
      success: true,
      message: `Compte médecin pour ${name} créé avec succès ! Identifiants d'accès activés.`,
      practitioner: newDoc
    });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
};

export const getDoctorSecuritySettings = (req, res) => {
  res.json({
    two_factor_enabled: true,
    method: "Application Authenticator (TOTP)",
    trusted_devices: [
      { device: "MacBook Pro - Chrome", location: "Tunis, Tunisie", last_active: "Aujourd'hui à 10:30" },
      { device: "iPad Air - MediDesk App", location: "Tunis, Tunisie", last_active: "Hier à 18:15" }
    ],
    audit_logs: [
      { id: 1, action: "Consultation dossier patient #8491", date: "10/10/2026 10:20", ip: "197.26.14.88" },
      { id: 2, action: "Ordonnance signée numériquement", date: "10/10/2026 09:55", ip: "197.26.14.88" }
    ]
  });
};


