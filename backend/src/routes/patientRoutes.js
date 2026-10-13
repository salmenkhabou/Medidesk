import express from 'express';
import { createUser } from '../db/userStore.js';

const router = express.Router();

// Patient Dashboard Data
router.get('/dashboard', (req, res) => {
  res.json({
    success: true,
    patient: {
      name: 'Yasmine Ben Amor',
      cin: '••••892',
      cnamCode: '8831920192',
      cnamAffiliation: 'CNAM — Filière Publique',
      validityDate: '31/12/2025',
      dossierCode: '#TN-8831'
    },
    upcomingAppointment: {
      id: 501,
      doctorName: 'Dr. Karim Ben Mahmoud',
      specialty: 'Cardiologie & Médecine Interne',
      date: 'Mardi 29 Octobre 2024 à 10:30',
      price: '70 TND',
      location: 'Clinique Alyssa • Cabinet 302, Centre Urbain Nord, Tunis',
      phone: '+216 71 888 999',
      status: 'Confirmé',
      workflowStep: 'Salle d\'attente',
      estimatedWait: '12 min'
    },
    activityStream: [
      {
        id: 1,
        type: 'prescription',
        title: 'Nouvelle ordonnance numérique mise à disposition',
        doctor: 'Dr. Karim Ben Mahmoud',
        date: "Aujourd'hui • 09:15",
        ref: 'ORD-7712',
        details: 'Renouvellement traitement HTA (Bisoprolol & Périndopril)'
      },
      {
        id: 2,
        type: 'lab',
        title: "Compte-rendu d'analyse biologique disponible",
        doctor: "Laboratoire Les Berges du Lac",
        date: '18 Octobre 2024',
        ref: 'LAB-9012',
        details: 'Bilan lipidique complet, cholestérolémie & glycémie à jeun'
      },
      {
        id: 3,
        type: 'consultation',
        title: 'Consultation Dermatologie & Feuille de soins dématérialisée',
        doctor: 'Dr. Sonia Cherif',
        date: '12 Octobre 2024',
        ref: 'CONS-4410',
        details: 'Prise en charge CNAM validée télé-transmise (Remboursement sous 7 jours)'
      }
    ]
  });
});

// Patient Shared Digital Medical Record (Mon Dossier Médical)
router.get('/medical-record', (req, res) => {
  res.json({
    success: true,
    patient: {
      name: 'Yasmine Ben Amor',
      dossierCode: 'TN-8831',
      cin: '••••892',
      birthDate: '14 Mars 1989 (35 ans)',
      bloodGroup: 'Groupe O Rh+',
      cnamAffiliation: 'CNAM - Filière Publique (Valide)',
      uniqueId: 'TUN-19890314-8831',
      doctorReferent: 'Dr. Karim Ben Mahmoud',
      emergencyContact: 'Sami (Époux) +216 22 123 456'
    },
    allergies: [
      { title: 'Pénicilline & Bêta-lactamines', severity: 'Choc anaphylactique', type: 'error' },
      { title: 'AINS / Ibuprofène', severity: 'Érythème pigmenté', type: 'warning' },
      { title: 'Latex naturel', severity: 'Contact cutané léger', type: 'info' }
    ],
    chronicConditions: [
      'Hypertension Artérielle (Stade 1)',
      'Dyslipidémie mixte modérée'
    ],
    activeTreatments: [
      'Bisoprolol 5mg (1/j)',
      'Périndopril 4mg (1/j)',
      'Diffu-K (1/j)'
    ],
    lastVitals: {
      date: '24 Oct. 2024',
      ta: '12.8 / 8.2',
      fc: '68 bpm',
      weight: '64.2 kg',
      imc: '22.4'
    },
    consultations: [
      {
        id: 101,
        doctor: 'Dr. Karim Ben Mahmoud',
        specialty: 'Cardiologue',
        location: 'Clinique Alyssa, Tunis',
        motive: 'Suivi semestriel HTA et adaptation thérapeutique',
        date: 'Jeudi 24 Octobre 2024 à 10:15',
        status: 'Dossier clôturé',
        notes: 'Tension artérielle mesurée à 12.8 / 8.2 cmHg, fréquence cardiaque à 68 bpm au repos, rythme sinusal régulier. Bonne tolérance du Bisoprolol 5mg avec stabilisation tensionnelle.',
        prescriptionLinked: true,
        ecgAttached: true
      },
      {
        id: 102,
        doctor: 'Dr. Sonia Cherif',
        specialty: 'Dermatologue',
        location: 'Cabinet Médical Menzah V',
        motive: 'Bilan nævus et surveillance cutanée annuelle',
        date: 'Samedi 12 Octobre 2024 à 11:30',
        status: 'Contrôle annuel validé',
        notes: 'Examen dermatoscopique corps entier sans lésion suspecte. Cartographie des nævus stable.'
      },
      {
        id: 103,
        doctor: 'Dr. Mehdi Zaouche',
        specialty: 'Ophtalmologie',
        location: 'Clinique Taoufik, El Manar',
        motive: 'Contrôle annuel réfraction & fond d\'œil',
        date: 'Samedi 15 Juin 2024 à 09:00',
        status: 'Archivé',
        notes: 'Acuité visuelle 10/10 aux deux yeux. Tonométrie oculaire normale (14 mmHg). Fond d\'œil sans trace de rétinopathie.'
      }
    ],
    prescriptions: [
      {
        id: '2024-8831-C',
        doctor: 'Dr. Karim Ben Mahmoud',
        date: '24 Octobre 2024',
        validUntil: '24 Janvier 2025',
        status: 'En cours de validité',
        renewable: 'x2',
        medications: [
          { name: 'Bisoprolol 5 mg', form: 'Comprimé', dosage: '1 comprimé chaque matin' },
          { name: 'Périndopril 4 mg', form: 'Comprimé', dosage: '1 comprimé le soir' },
          { name: 'Diffu-K 600 mg', form: 'Gélule', dosage: '1 gélule le midi' }
        ],
        pharmacy: 'Pharmacie du Lac 2 (24 Oct. 2024)'
      }
    ],
    documents: [
      { id: 'D1', name: 'Bilan_Biologique_Lipidique_18Oct2024.pdf', source: 'Laboratoire Berges du Lac', date: '18 Octobre 2024', size: '1.4 Mo', type: 'PDF' },
      { id: 'D2', name: 'Compte_Rendu_Echo_Cardiaque.pdf', source: 'Clinique Alyssa', date: '24 Octobre 2024', size: '6.2 Mo', type: 'PDF' },
      { id: 'D3', name: 'ECG_Trace_Sinusal_Oct2024.png', source: 'Dr. Ben Mahmoud', date: '24 Octobre 2024', size: '2.1 Mo', type: 'PNG' }
    ]
  });
});

// Patient Notifications Center
router.get('/notifications', (req, res) => {
  res.json({
    success: true,
    unreadCount: 3,
    groups: [
      {
        title: "Aujourd'hui",
        items: [
          {
            id: 'n1',
            category: 'appointments',
            read: false,
            time: 'Il y a 25 min',
            badge: 'Consultation',
            subtitle: 'Cabinet 302 • Clinique Alyssa',
            title: 'Rendez-vous confirmé — Dr. Karim Ben Mahmoud',
            description: 'Votre consultation de suivi en Cardiologie est confirmée pour aujourd\'hui. Présentez-vous 10 min avant au guichet.',
            action: 'Voir le détail & QR Code'
          },
          {
            id: 'n2',
            category: 'appointments',
            read: false,
            time: 'Il y a 1 heure',
            badge: 'Action requise',
            priority: true,
            title: 'Urgence vitale au cabinet — Décalage de créneau',
            description: 'Le Dr. Ben Mahmoud a pris en charge une urgence au bloc. Votre nouveau créneau proposé est aujourd\'hui à 11:15.',
            action: 'Accepter 11h15'
          },
          {
            id: 'n3',
            category: 'documents',
            read: false,
            time: 'Aujourd\'hui 09:15',
            badge: 'E-Ordonnance',
            title: 'Nouvelle ordonnance numérique mise à disposition',
            description: 'Le Dr. Karim Ben Mahmoud a déposé votre ordonnance de renouvellement (Bisoprolol & Périndopril) valable 6 mois.',
            action: 'Télécharger PDF'
          }
        ]
      },
      {
        title: 'Hier',
        items: [
          {
            id: 'n4',
            category: 'documents',
            read: true,
            time: 'Hier à 16:40',
            badge: 'Biologie Médicale',
            title: 'Résultats d\'analyses disponibles — Bilan Lipidique',
            description: 'Votre bilan lipidique complet et glycémie à jeun ont été validés par le laboratoire Berges du Lac.',
            action: 'Consulter le compte-rendu'
          }
        ]
      }
    ]
  });
});

router.post('/notifications/read-all', (req, res) => {
  res.json({ success: true, message: 'Toutes les notifications ont été marquées comme lues.' });
});

// Document Upload
router.post('/documents/upload', (req, res) => {
  const { category, doctorId, note, fileName } = req.body;
  res.json({
    success: true,
    message: 'Document téléversé et chiffré AES-256 avec succès !',
    file: {
      id: `DOC-${Math.floor(1000 + Math.random() * 9000)}`,
      fileName: fileName || 'Document_Medical_Patient.pdf',
      category: category || 'laboratoire',
      status: 'Certifié INPDP',
      date: new Date().toISOString()
    }
  });
});

// Security & Account Settings
router.get('/security-settings', (req, res) => {
  res.json({
    success: true,
    securityScore: 85,
    twoFactorEnabled: true,
    twoFactorStatus: 'En cours de configuration',
    activeSessions: [
      { id: 1, device: 'MacBook Pro • Safari', location: 'Tunis, Tunisie', current: true, ip: '197.0.24.112' },
      { id: 2, device: 'iPhone 14 Pro • App MediDesk', location: 'Tunis, Berges du Lac', current: false, ip: '197.0.24.89' }
    ]
  });
});

router.post('/security-settings/update-password', (req, res) => {
  res.json({ success: true, message: 'Mot de passe mis à jour avec succès.' });
});

router.post('/security-settings/toggle-2fa', (req, res) => {
  const { enabled } = req.body;
  res.json({ success: true, enabled, message: enabled ? 'Double authentification activée !' : 'Double authentification désactivée.' });
});

// Express Booking
router.post('/express-booking', (req, res) => {
  const { doctorId, date, time, consultationMode, motive, notes } = req.body;
  res.json({
    success: true,
    message: 'Rendez-vous confirmé instantanément sans avance de frais !',
    booking: {
      trackingCode: `RDV-2024-${Math.floor(1000 + Math.random() * 9000)}`,
      doctorName: 'Dr. Karim Ben Mahmoud',
      specialty: 'Cardiologie & Médecine Interne',
      date: date || 'Mardi 29 Octobre 2024',
      time: time || '10:00',
      consultationMode: consultationMode || 'Cabinet Médical',
      location: 'Clinique Alyssa • Cabinet 302, Tunis',
      price: '70 TND (Prise en charge CNAM)'
    }
  });
});

// Real-time Queue Tracking Status
router.get('/queue-status', (req, res) => {
  res.json({
    success: true,
    appointment: {
      id: 'RDV-2024-8941',
      doctorName: 'Dr. Karim Ben Mahmoud',
      specialty: 'Cardiologie & Médecine Interne',
      location: 'Clinique Alyssa • Cabinet 302, 3ème étage, Tunis',
      phone: '+216 71 888 999',
      currentStep: 4,
      totalSteps: 6,
      stepLabel: 'Salle d\'attente (Salle B • 3e étage)',
      currentCallingTicket: '#B-19',
      patientPosition: '2ème dans la file',
      estimatedWaitMins: 12,
      urgentNotice: {
        active: true,
        title: 'Urgence cardiologique en cours d\'intervention',
        newTime: 'Aujourd\'hui à 11h15',
        originalTime: '10h30',
        remainingSeconds: 702
      }
    }
  });
});

router.post('/register', (req, res) => {
  let { firstName, lastName, name, cin, phone, email, password, cnamCode } = req.body;
  if (name && (!firstName || !lastName)) {
    const parts = name.trim().split(' ');
    firstName = firstName || parts[0];
    lastName = lastName || parts.slice(1).join(' ') || parts[0];
  }
  if (!firstName || !lastName || !phone || !email) {
    return res.status(400).json({ success: false, message: 'Prénom, nom, email et téléphone requis.' });
  }

  try {
    const newUser = createUser({
      name: `${firstName} ${lastName}`,
      email,
      password: password || 'Password123!',
      role: 'patient',
      cin: cin || '00000000',
      phone,
      cnamCode: cnamCode || ''
    });

    return res.status(201).json({
      success: true,
      message: 'Compte patient créé avec succès ! Vous pouvez maintenant vous connecter.',
      patient: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        cin: newUser.cin
      }
    });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
});

router.post('/suggest-doctor', (req, res) => {
  const { doctorName, specialty, city, phone, notes } = req.body;
  if (!doctorName || !specialty) {
    return res.status(400).json({ success: false, message: 'Nom du médecin et spécialité requis' });
  }

  res.json({
    success: true,
    message: `Merci ! Votre recommandation pour le ${doctorName} a été enregistrée. L'équipe MediDesk contactera le cabinet.`,
    referenceCode: `REC-${Math.floor(10000 + Math.random() * 90000)}`
  });
});

export default router;

