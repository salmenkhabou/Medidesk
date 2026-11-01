import { db } from '../db/index.js';

export const getPrescriptionByRef = (req, res) => {
  try {
    const { ref } = req.params;
    const prescription = db.prepare(`SELECT * FROM prescriptions WHERE reference_code = ?`).get(ref);

    const owned = prescription && (req.user.role === 'patient' ? prescription.patient_id === req.user.id : Number.isSafeInteger(req.user.practitionerId) && prescription.practitioner_id === req.user.practitionerId);
    if (!owned) {
      return res.status(404).json({ success: false, message: 'Ordonnance introuvable' });
    }

    res.json({
      success: true,
      data: {
        ...prescription,
        medications: JSON.parse(prescription.medications_json)
      }
    });
  } catch (error) {
    console.error('Error fetching prescription:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
