import { db } from '../db/index.js';

export const getPrescriptionByRef = (req, res) => {
  try {
    const { ref } = req.params;
    const prescription = db.prepare(`SELECT * FROM prescriptions WHERE reference_code = ? OR patient_cin = ?`).get(ref, ref);

    if (!prescription) {
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
