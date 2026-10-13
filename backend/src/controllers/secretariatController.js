import { db } from '../db/index.js';

// Global in-memory state for secretariat dynamic actions if DB table isn't present
let visitorReservationsStore = [
  { id: 1, patient_name: "Mohamed Hedi Guediche", phone: "+216 98 456 123", requested_time: "11:30", type: "Première Consultation", status: "pending", notes: "Demande web sans compte patient. Validez par appel ou SMS.", date: new Date().toISOString().split('T')[0] },
  { id: 2, patient_name: "Sarra Mansour", phone: "+216 22 789 012", requested_time: "14:15", type: "Suivi Échographie", status: "pending", notes: "SMS automatique envoyé", date: new Date().toISOString().split('T')[0] },
  { id: 3, patient_name: "Bilel Ben Ammar", phone: "+216 50 112 334", requested_time: "15:45", type: "Bilan Annuel", status: "pending", notes: "Demande via portail patient mobile", date: new Date().toISOString().split('T')[0] },
  { id: 4, patient_name: "Ines Kallel", phone: "+216 99 887 766", requested_time: "16:30", type: "Consultation générale", status: "pending", notes: "Recommandée par Dr. Triki", date: new Date().toISOString().split('T')[0] }
];

let billingRecordsStore = [
  { id: 1, receipt_no: "Q-2024-8891", patient_name: "Ahmed Trabelsi", cin: "04512993", doctor_name: "Dr. Karim Ben Mahmoud", date: new Date().toISOString().split('T')[0], time: "09:30", act: "Consultation + ECG", amount_total: 70, amount_cnam: 0, amount_patient: 70, payment_method: "Espèces", status: "paid" },
  { id: 2, receipt_no: "Q-2024-8892", patient_name: "Leila Khemir", cin: "07198234", doctor_name: "Dr. Karim Ben Mahmoud", date: new Date().toISOString().split('T')[0], time: "10:00", act: "Bilan Pre-op CNAM", amount_total: 60, amount_cnam: 45, amount_patient: 15, payment_method: "Carte TPE", status: "paid" },
  { id: 3, receipt_no: "Q-2024-8893", patient_name: "Yasmine Ben Amor", cin: "06214589", doctor_name: "Dr. Karim Ben Mahmoud", date: new Date().toISOString().split('T')[0], time: "10:45", act: "Échocardiographie Doppler", amount_total: 120, amount_cnam: 0, amount_patient: 120, payment_method: "Chèque", status: "paid" }
];

let intercomMessagesStore = [];

let cashCloseoutsStore = [];

export const getDashboardSummary = (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const totalCashToday = billingRecordsStore.reduce((acc, curr) => acc + curr.amount_patient, 0);

    return res.json({
      secretary: {
        name: "Amel Trabelsi",
        role: "Secrétariat Principal",
        clinic: "Clinique Alyssa — Cabinet Médical Central (Tunis)",
        date_formatted: "Jeudi 24 Octobre 2024"
      },
      current_doctor: {
        id: 5,
        name: "Dr. Karim Ben Mahmoud",
        specialty: "Cardiologie",
        scheduled_today: 32,
        completed_today: 11
      },
      triage_alert: {
        active: true,
        patient_name: "Férid Ben Salem",
        cin: "08842109",
        reason: "Suspicion d'angor aigu (Palpitations)",
        action_required: "Faire entrer en priorité"
      },
      waiting_room: {
        count: 6,
        avg_wait_mins: 18,
        current_in_session: {
          name: "Yasmine Ben Amor",
          entered_at: "10:28",
          duration_mins: 16,
          motive: "Suivi HTA"
        },
        next_up: "Férid Ben Salem"
      },
      visitor_reservations_pending: visitorReservationsStore.filter(r => r.status === 'pending'),
      today_billing_summary: {
        total_revenue_tnd: totalCashToday,
        cash_tnd: billingRecordsStore.filter(r => r.payment_method === 'Espèces').reduce((a, b) => a + b.amount_patient, 0),
        cheque_tnd: billingRecordsStore.filter(r => r.payment_method === 'Chèque').reduce((a, b) => a + b.amount_patient, 0),
        tpe_tnd: billingRecordsStore.filter(r => r.payment_method === 'Carte TPE').reduce((a, b) => a + b.amount_patient, 0),
        cnam_files_pending: 3
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getVisitorReservations = (req, res) => {
  res.json({ data: visitorReservationsStore });
};

export const validateVisitorReservation = (req, res) => {
  const { id } = req.params;
  const item = visitorReservationsStore.find(r => r.id === parseInt(id));
  if (item) {
    item.status = 'confirmed';
    return res.json({ success: true, message: `Réservation de ${item.patient_name} confirmée avec succès !`, reservation: item });
  }
  res.status(404).json({ error: "Réservation introuvable" });
};

export const rejectVisitorReservation = (req, res) => {
  const { id } = req.params;
  const item = visitorReservationsStore.find(r => r.id === parseInt(id));
  if (item) {
    item.status = 'rejected';
    return res.json({ success: true, message: `Réservation de ${item.patient_name} refusée.`, reservation: item });
  }
  res.status(404).json({ error: "Réservation introuvable" });
};

export const createBillingTransaction = (req, res) => {
  const { patient_name, cin, doctor_name, act, amount_total, amount_cnam, amount_patient, payment_method } = req.body;
  const newReceipt = `Q-2024-${Math.floor(1000 + Math.random() * 9000)}`;
  const record = {
    id: billingRecordsStore.length + 1,
    receipt_no: newReceipt,
    patient_name: patient_name || "Patient Anonyme",
    cin: cin || "00000000",
    doctor_name: doctor_name || "Dr. Karim Ben Mahmoud",
    date: new Date().toISOString().split('T')[0],
    time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
    act: act || "Consultation Médicale",
    amount_total: Number(amount_total) || 60,
    amount_cnam: Number(amount_cnam) || 0,
    amount_patient: Number(amount_patient) || 60,
    payment_method: payment_method || "Espèces",
    status: "paid"
  };
  billingRecordsStore.push(record);
  res.json({ success: true, message: "Encaissement enregistré avec succès !", receipt: record });
};

export const getTodayBilling = (req, res) => {
  res.json({ data: billingRecordsStore });
};

export const sendIntercomMessage = (req, res) => {
  const { message, priority } = req.body;
  const msg = {
    id: intercomMessagesStore.length + 1,
    message,
    priority: priority || "normal",
    timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  };
  intercomMessagesStore.push(msg);
  res.json({ success: true, message: "Message transmis au moniteur du praticien !", data: msg });
};

export const getCashCloseoutReport = (req, res) => {
  const totalCash = billingRecordsStore.filter(r => r.payment_method === 'Espèces').reduce((a, b) => a + b.amount_patient, 0);
  const totalCheque = billingRecordsStore.filter(r => r.payment_method === 'Chèque').reduce((a, b) => a + b.amount_patient, 0);
  const totalTpe = billingRecordsStore.filter(r => r.payment_method === 'Carte TPE').reduce((a, b) => a + b.amount_patient, 0);
  const totalCnam = billingRecordsStore.reduce((a, b) => a + b.amount_cnam, 0);

  res.json({
    date: new Date().toISOString().split('T')[0],
    cashier: "Amel Trabelsi",
    total_gross: totalCash + totalCheque + totalTpe + totalCnam,
    breakdown: {
      cash: totalCash,
      cheque: totalCheque,
      tpe: totalTpe,
      cnam: totalCnam
    },
    transactions_count: billingRecordsStore.length,
    history: cashCloseoutsStore
  });
};

export const lockCashRegister = (req, res) => {
  const { counted_cash, notes } = req.body;
  const closeout = {
    id: cashCloseoutsStore.length + 1,
    date: new Date().toISOString().split('T')[0],
    timestamp: new Date().toISOString(),
    cashier: "Amel Trabelsi",
    counted_cash: Number(counted_cash) || 0,
    notes: notes || "Arrêt de caisse journalier effectué.",
    status: "closed"
  };
  cashCloseoutsStore.push(closeout);
  res.json({ success: true, message: "Caisse clôturée et verrouillée avec succès !", data: closeout });
};
