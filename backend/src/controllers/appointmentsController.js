import { db } from '../db/index.js';

export const getAppointments = (req, res) => {
  try {
    const { practitioner_id, patient_phone } = req.query;
    let sql = `SELECT a.*, p.name as doctor_name, p.specialty, p.address 
               FROM appointments a 
               JOIN practitioners p ON a.practitioner_id = p.id 
               WHERE 1=1`;
    const params = [];

    if (practitioner_id) {
      sql += ` AND a.practitioner_id = ?`;
      params.push(practitioner_id);
    }
    if (patient_phone) {
      sql += ` AND a.patient_phone = ?`;
      params.push(patient_phone);
    }

    sql += ` ORDER BY a.appointment_date DESC, a.appointment_time ASC`;

    const principal = req.user;
    let appointments = db.prepare(sql).all(...params);
    if (principal.role === 'patient') appointments = appointments.filter(a => a.patient_id === principal.id);
    else if (['doctor', 'secretariat'].includes(principal.role) && principal.practitionerId) appointments = appointments.filter(a => a.practitioner_id === principal.practitionerId);
    else return res.status(403).json({ success: false, error: 'ACCESS_DENIED' });
    res.json({ success: true, count: appointments.length, data: appointments });
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const createAppointment = (req, res) => {
  try {
    const { practitioner_id, patient_name, patient_phone, patient_cin, appointment_date, appointment_time, consultation_type, cnam_requested, notes } = req.body;

    if (!practitioner_id || !patient_name || !patient_phone || !appointment_date || !appointment_time) {
      return res.status(400).json({ success: false, message: 'Missing required appointment fields' });
    }

    if (!Number.isSafeInteger(Number(practitioner_id)) || Number(practitioner_id) < 1 || typeof patient_name !== 'string' || typeof patient_phone !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(appointment_date) || !/^([01]\d|2[0-3]):[0-5]\d$/.test(appointment_time)) return res.status(400).json({ success: false, error: 'INVALID_INPUT' });

    const doctor = db.prepare(`SELECT id, name FROM practitioners WHERE id = ?`).get(practitioner_id);
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }

    const insert = db.prepare(`
      INSERT INTO appointments (practitioner_id, patient_name, patient_phone, patient_cin, appointment_date, appointment_time, consultation_type, status, cnam_requested, notes, patient_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'confirmed', ?, ?, ?)
    `);

    const info = insert.run(
      practitioner_id,
      patient_name,
      patient_phone,
      patient_cin || 'Non renseigné',
      appointment_date,
      appointment_time,
      consultation_type || 'Cabinet',
      cnam_requested ? 1 : 0,
      notes || '',
      req.user?.role === 'patient' ? req.user.id : null
    );

    // Update queue total for the practitioner if queue exists
    db.prepare(`
      UPDATE waiting_queue 
      SET total_in_queue = total_in_queue + 1 
      WHERE practitioner_id = ?
    `).run(practitioner_id);

    const newAppointment = db.prepare(`SELECT * FROM appointments WHERE id = ?`).get(info.lastInsertRowid);

    res.status(201).json({
      success: true,
      message: `Rendez-vous confirmé avec ${doctor.name} pour le ${appointment_date} à ${appointment_time}.`,
      data: { ...newAppointment, doctor_name: doctor.name }
    });
  } catch (error) {
    console.error('Error creating appointment:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
