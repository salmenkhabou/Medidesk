import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbFilePath = path.join(__dirname, '../../medidesk-db.json');

const initialData = {
  practitioners: [],
  appointments: [],
  waiting_queue: [],
  onboarding_requests: [],
  prescriptions: [],
  pricing_plans: []
};

function loadData() {
  if (fs.existsSync(dbFilePath)) {
    try {
      const raw = fs.readFileSync(dbFilePath, 'utf8');
      return JSON.parse(raw);
    } catch (e) {
      console.error('Error loading DB file, resetting:', e);
    }
  }
  fs.writeFileSync(dbFilePath, JSON.stringify(initialData, null, 2));
  return { ...initialData };
}

function saveData(data) {
  fs.writeFileSync(dbFilePath, JSON.stringify(data, null, 2));
}

let store = loadData();

export const db = {
  exec(sql) {
    if (sql.includes('DELETE FROM')) {
      store = {
        practitioners: [],
        appointments: [],
        waiting_queue: [],
        onboarding_requests: [],
        prescriptions: [],
        pricing_plans: []
      };
      saveData(store);
    }
  },

  prepare(sql) {
    return {
      all(...params) {
        if (sql.includes('FROM practitioners')) {
          let list = [...store.practitioners];
          let paramIdx = 0;

          if (sql.includes('LOWER(specialty) LIKE ?')) {
            const spec = params[paramIdx++].replace(/%/g, '').toLowerCase();
            list = list.filter(p => p.specialty.toLowerCase().includes(spec));
          }
          if (sql.includes('LOWER(city) LIKE ?')) {
            const city = params[paramIdx++].replace(/%/g, '').toLowerCase();
            list = list.filter(p => p.city.toLowerCase().includes(city));
          }
          if (sql.includes('cnam_convention = 1')) {
            list = list.filter(p => p.cnam_convention === 1);
          }
          if (sql.includes('LOWER(name) LIKE ?')) {
            const term = params[paramIdx++].replace(/%/g, '').toLowerCase();
            list = list.filter(p => 
              p.name.toLowerCase().includes(term) ||
              p.specialty.toLowerCase().includes(term) ||
              p.address.toLowerCase().includes(term)
            );
          }
          return list;
        }

        if (sql.includes('FROM appointments')) {
          let list = store.appointments.map(a => {
            const doc = store.practitioners.find(p => p.id === a.practitioner_id) || {};
            return { ...a, doctor_name: doc.name || 'Dr.', specialty: doc.specialty || '', address: doc.address || '' };
          });

          if (sql.includes('a.practitioner_id = ?')) {
            const pid = parseInt(params[0]);
            list = list.filter(a => a.practitioner_id === pid);
          }
          if (sql.includes('a.patient_phone = ?')) {
            const phone = params[params.length - 1];
            list = list.filter(a => a.patient_phone === phone);
          }
          return list;
        }

        if (sql.includes('FROM pricing_plans')) {
          return [...store.pricing_plans];
        }

        return [];
      },

      get(...params) {
        if (sql.includes('FROM practitioners WHERE id = ?')) {
          const id = parseInt(params[0]);
          return store.practitioners.find(p => p.id === id) || null;
        }

        if (sql.includes('FROM waiting_queue')) {
          const pid = parseInt(params[0]);
          const q = store.waiting_queue.find(item => item.practitioner_id === pid);
          if (!q) return null;
          const doc = store.practitioners.find(p => p.id === pid) || {};
          return { ...q, doctor_name: doc.name || 'Dr.', specialty: doc.specialty || '', address: doc.address || '' };
        }

        if (sql.includes('FROM appointments WHERE id = ?')) {
          const id = parseInt(params[0]);
          return store.appointments.find(a => a.id === id) || null;
        }

        if (sql.includes('FROM onboarding_requests')) {
          const code = params[0];
          return store.onboarding_requests.find(r => r.tracking_code === code || r.cnom_number.includes(code)) || null;
        }

        if (sql.includes('FROM prescriptions')) {
          const ref = params[0];
          return store.prescriptions.find(p => p.reference_code === ref || p.patient_cin === ref) || null;
        }

        return null;
      },

      run(...params) {
        if (sql.includes('INSERT INTO practitioners')) {
          const newId = store.practitioners.length ? Math.max(...store.practitioners.map(p => p.id)) + 1 : 1;
          const item = {
            id: newId,
            name: params[0],
            title: params[1],
            cnom_number: params[2],
            specialty: params[3],
            city: params[4],
            address: params[5],
            phone: params[6],
            email: params[7],
            fee_tnd: params[8],
            cnam_convention: params[9],
            rating: params[10],
            reviews_count: params[11],
            availability_status: params[12],
            avatar_url: params[13],
            bio: params[14]
          };
          store.practitioners.push(item);
          saveData(store);
          return { lastInsertRowid: newId };
        }

        if (sql.includes('INSERT INTO waiting_queue')) {
          const newId = store.waiting_queue.length ? Math.max(...store.waiting_queue.map(q => q.id)) + 1 : 1;
          const item = {
            id: newId,
            practitioner_id: params[0],
            current_patient_number: params[1],
            total_in_queue: params[2],
            estimated_wait_mins: params[3],
            status_message: params[4]
          };
          store.waiting_queue.push(item);
          saveData(store);
          return { lastInsertRowid: newId };
        }

        if (sql.includes('INSERT INTO appointments')) {
          const newId = store.appointments.length ? Math.max(...store.appointments.map(a => a.id)) + 1 : 1;
          const item = {
            id: newId,
            practitioner_id: parseInt(params[0]),
            patient_name: params[1],
            patient_phone: params[2],
            patient_cin: params[3],
            appointment_date: params[4],
            appointment_time: params[5],
            consultation_type: params[6],
            status: 'confirmed',
            cnam_requested: params[7],
            notes: params[8],
            created_at: new Date().toISOString()
          };
          store.appointments.push(item);
          saveData(store);
          return { lastInsertRowid: newId };
        }

        if (sql.includes('UPDATE waiting_queue SET total_in_queue = total_in_queue + 1')) {
          const pid = parseInt(params[0]);
          const q = store.waiting_queue.find(item => item.practitioner_id === pid);
          if (q) {
            q.total_in_queue += 1;
            saveData(store);
          }
          return { changes: 1 };
        }

        if (sql.includes('UPDATE waiting_queue') && sql.includes('current_patient_number = ?')) {
          const nextPatient = params[0];
          const estWait = params[1];
          const msg = params[2];
          const pid = parseInt(params[3]);
          const q = store.waiting_queue.find(item => item.practitioner_id === pid);
          if (q) {
            q.current_patient_number = nextPatient;
            q.estimated_wait_mins = estWait;
            q.status_message = msg;
            saveData(store);
          }
          return { changes: 1 };
        }

        if (sql.includes('INSERT INTO onboarding_requests')) {
          const newId = store.onboarding_requests.length ? Math.max(...store.onboarding_requests.map(r => r.id)) + 1 : 1;
          const item = {
            id: newId,
            tracking_code: params[0],
            doctor_name: params[1],
            cnom_number: params[2],
            specialty: params[3],
            phone: params[4],
            email: params[5],
            clinic_name: params[6],
            city: params[7],
            address: params[8],
            cnam_convention: params[9],
            plan_type: params[10],
            secretariat_invited: params[11],
            document_name: params[12],
            status: 'under_review',
            created_at: new Date().toISOString()
          };
          store.onboarding_requests.push(item);
          saveData(store);
          return { lastInsertRowid: newId };
        }

        if (sql.includes('INSERT INTO prescriptions')) {
          const newId = store.prescriptions.length ? Math.max(...store.prescriptions.map(p => p.id)) + 1 : 1;
          const item = {
            id: newId,
            reference_code: params[0],
            patient_name: params[1],
            patient_cin: params[2],
            doctor_name: params[3],
            doctor_cnom: params[4],
            date: params[5],
            medications_json: params[6],
            contraindication_warning: params[7],
            created_at: new Date().toISOString()
          };
          store.prescriptions.push(item);
          saveData(store);
          return { lastInsertRowid: newId };
        }

        if (sql.includes('INSERT INTO pricing_plans')) {
          const newId = store.pricing_plans.length ? Math.max(...store.pricing_plans.map(p => p.id)) + 1 : 1;
          const item = {
            id: newId,
            code: params[0],
            name: params[1],
            price_monthly: params[2],
            price_annual: params[3],
            description: params[4],
            features_json: params[5],
            is_popular: params[6]
          };
          store.pricing_plans.push(item);
          saveData(store);
          return { lastInsertRowid: newId };
        }

        return { changes: 0 };
      }
    };
  }
};

export default db;
