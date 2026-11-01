import { db } from '../db/index.js';

export const getQueue = (req, res) => {
  try {
    const { practitioner_id } = req.params;
    let queue = db.prepare(`SELECT q.*, p.name as doctor_name, p.specialty, p.address 
                            FROM waiting_queue q 
                            JOIN practitioners p ON q.practitioner_id = p.id 
                            WHERE q.practitioner_id = ?`).get(practitioner_id);

    if (!queue) {
      return res.status(404).json({ success: false, message: 'Queue not found' });
    }

    res.json({ success: true, data: queue });
  } catch (error) {
    console.error('Error fetching queue:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const advanceQueue = (req, res) => {
  try {
    const { practitioner_id } = req.params;

    const queue = db.prepare(`SELECT * FROM waiting_queue WHERE practitioner_id = ?`).get(practitioner_id);
    if (!queue) return res.status(404).json({ success: false, message: 'Queue not found' });

    const nextPatient = queue.current_patient_number + 1;
    const estWait = Math.max(0, queue.estimated_wait_mins - 5);

    db.prepare(`
      UPDATE waiting_queue 
      SET current_patient_number = ?, 
          estimated_wait_mins = ?,
          status_message = ?,
          updated_at = CURRENT_TIMESTAMP
      WHERE practitioner_id = ?
    `).run(nextPatient, estWait, `Dr. in session with patient #${nextPatient < 10 ? '0' + nextPatient : nextPatient}`, practitioner_id);

    const updated = db.prepare(`SELECT * FROM waiting_queue WHERE practitioner_id = ?`).get(practitioner_id);
    res.json({ success: true, message: `File d'attente mise à jour: Patient #${nextPatient} en consultation`, data: updated });
  } catch (error) {
    console.error('Error advancing queue:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
