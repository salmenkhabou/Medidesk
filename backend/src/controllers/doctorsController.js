import { db } from '../db/index.js';

export const getDoctors = (req, res) => {
  try {
    const { specialty, city, availability, cnam, search } = req.query;

    let sql = `SELECT * FROM practitioners WHERE 1=1`;
    const params = [];

    if (specialty && specialty !== 'all') {
      sql += ` AND LOWER(specialty) LIKE ?`;
      params.push(`%${specialty.toLowerCase()}%`);
    }

    if (city && city !== 'all') {
      sql += ` AND LOWER(city) LIKE ?`;
      params.push(`%${city.toLowerCase()}%`);
    }

    if (cnam === '1' || cnam === 'true') {
      sql += ` AND cnam_convention = 1`;
    }

    if (search) {
      sql += ` AND (LOWER(name) LIKE ? OR LOWER(specialty) LIKE ? OR LOWER(address) LIKE ?)`;
      const term = `%${search.toLowerCase()}%`;
      params.push(term, term, term);
    }

    sql += ` ORDER BY rating DESC, reviews_count DESC`;

    const doctors = db.prepare(sql).all(...params);
    res.json({ success: true, count: doctors.length, data: doctors });
  } catch (error) {
    console.error('Error fetching doctors:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getDoctorById = (req, res) => {
  try {
    const doctor = db.prepare(`SELECT * FROM practitioners WHERE id = ?`).get(req.params.id);
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }

    const queue = db.prepare(`SELECT * FROM waiting_queue WHERE practitioner_id = ?`).get(doctor.id);

    res.json({ success: true, data: { ...doctor, waiting_queue: queue || null } });
  } catch (error) {
    console.error('Error fetching doctor details:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
