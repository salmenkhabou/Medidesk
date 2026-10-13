import bcrypt from 'bcryptjs';

const DEMO_HASH = bcrypt.hashSync('Password123!', 10);

export let usersStore = [
  {
    id: 1,
    name: 'Anis Zouari',
    email: 'admin@medidesk.tn',
    passwordHash: DEMO_HASH,
    role: 'superadmin',
    department: 'Tour de Contrôle MediDesk'
  },
  {
    id: 2,
    name: 'Dr. Karim Ben Mahmoud',
    email: 'dr.benmahmoud@medidesk.tn',
    passwordHash: DEMO_HASH,
    role: 'doctor',
    specialty: 'Cardiologie',
    cnom: '18452/CNOM',
    clinic: 'Clinique Alyssa',
    city: 'Tunis',
    plan: 'Cloud Secure Pro',
    phone: '+216 98 420 811'
  },
  {
    id: 3,
    name: 'Amel Trabelsi',
    email: 'amel.trabelsi@medidesk.tn',
    passwordHash: DEMO_HASH,
    role: 'secretariat',
    doctorId: 2,
    clinic: 'Clinique Alyssa',
    phone: '+216 98 123 456',
    permissions: 'Accueil, Encaissement, RDV'
  },
  {
    id: 4,
    name: 'Yasmine Ben Amor',
    email: 'patient@medidesk.tn',
    passwordHash: DEMO_HASH,
    role: 'patient',
    cin: '08765432',
    phone: '+216 98 000 000'
  }
];

export function findUserByEmail(email) {
  if (!email) return null;
  const clean = email.trim().toLowerCase();
  return usersStore.find(u => u.email.toLowerCase() === clean) || null;
}

export function createUser({ name, email, password, role, ...metadata }) {
  const cleanEmail = email.trim().toLowerCase();
  const existing = findUserByEmail(cleanEmail);
  if (existing) {
    throw new Error(`Un compte avec l'adresse email ${cleanEmail} existe déjà.`);
  }

  const newId = usersStore.length ? Math.max(...usersStore.map(u => u.id)) + 1 : 1;
  const passwordHash = password ? bcrypt.hashSync(password, 10) : DEMO_HASH;

  const newUser = {
    id: newId,
    name,
    email: cleanEmail,
    passwordHash,
    role: role || 'patient',
    created_at: new Date().toISOString(),
    ...metadata
  };

  usersStore.push(newUser);
  return newUser;
}
