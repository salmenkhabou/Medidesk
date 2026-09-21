import { db } from '../db/index.js';

export const submitOnboarding = (req, res) => {
  try {
    const { doctor_name, cnom_number, specialty, phone, email, clinic_name, city, address, cnam_convention, plan_type, secretariat_invited, document_name } = req.body;

    if (!doctor_name || !cnom_number || !phone || !email || !clinic_name) {
      return res.status(400).json({ success: false, message: 'Les champs obligatoires du dossier médical doivent être remplis.' });
    }

    const tracking_code = `MD-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const insert = db.prepare(`
      INSERT INTO onboarding_requests (
        tracking_code, doctor_name, cnom_number, specialty, phone, email, clinic_name, city, address, cnam_convention, plan_type, secretariat_invited, document_name, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'under_review')
    `);

    insert.run(
      tracking_code,
      doctor_name,
      cnom_number,
      specialty || 'Généraliste',
      phone,
      email,
      clinic_name,
      city || 'Tunis',
      address || '',
      cnam_convention ? 1 : 0,
      plan_type || 'cloud_hds',
      secretariat_invited || 'Aucun',
      document_name || 'Attestation_CNOM.pdf'
    );

    const record = db.prepare(`SELECT * FROM onboarding_requests WHERE tracking_code = ?`).get(tracking_code);

    res.status(201).json({
      success: true,
      message: "Demande d'adhésion praticien déposée avec succès. Dossier transmis au Conseil de Vérification Médicale.",
      tracking_code,
      data: record
    });
  } catch (error) {
    console.error('Error submitting onboarding request:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getOnboardingByCode = (req, res) => {
  try {
    const { code } = req.params;
    const record = db.prepare(`SELECT * FROM onboarding_requests WHERE tracking_code = ? OR cnom_number LIKE ?`).get(code, `%${code}%`);

    if (!record) {
      return res.status(404).json({ success: false, message: 'Aucun dossier d\'adhésion trouvé pour cette référence.' });
    }

    res.json({ success: true, data: record });
  } catch (error) {
    console.error('Error fetching onboarding request:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
