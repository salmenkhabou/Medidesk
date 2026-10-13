import React, { useState, useEffect } from 'react';
import { fetchSuperAdminPractitioners, updateSuperAdminPractitionerPlan, createDoctorPractitioner } from '../services/api';

export default function SuperAdminPractitionersView({ setView }) {
  const [practitioners, setPractitioners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedPlanModal, setSelectedPlanModal] = useState(null);
  const [isAddDoctorOpen, setIsAddDoctorOpen] = useState(false);
  const [toast, setToast] = useState(null);

  // New Doctor Form State
  const [newDoctor, setNewDoctor] = useState({
    name: '',
    specialty: 'Cardiologie',
    cnom: '',
    city: 'Tunis',
    clinic: '',
    email: '',
    phone: '',
    plan: 'Cloud Secure Pro',
    password: 'Password123!'
  });
  const [submittingDoctor, setSubmittingDoctor] = useState(false);

  useEffect(() => {
    loadPractitioners();
  }, []);

  const loadPractitioners = async () => {
    try {
      setLoading(true);
      const res = await fetchSuperAdminPractitioners();
      setPractitioners(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePlanChange = async (id, newPlan) => {
    try {
      const res = await updateSuperAdminPractitionerPlan(id, newPlan);
      setToast({ type: 'success', message: res.message });
      setSelectedPlanModal(null);
      loadPractitioners();
    } catch (err) {
      setToast({ type: 'error', message: err.message });
    }
  };

  const handleCreateDoctor = async (e) => {
    e.preventDefault();
    setSubmittingDoctor(true);
    try {
      const res = await createDoctorPractitioner(newDoctor);
      setToast({ type: 'success', message: res.message });
      setIsAddDoctorOpen(false);
      setNewDoctor({
        name: '',
        specialty: 'Cardiologie',
        cnom: '',
        city: 'Tunis',
        clinic: '',
        email: '',
        phone: '',
        plan: 'Cloud Secure Pro',
        password: 'Password123!'
      });
      loadPractitioners();
    } catch (err) {
      setToast({ type: 'error', message: err.message });
    } finally {
      setSubmittingDoctor(false);
    }
  };

  const filtered = practitioners.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.specialty.toLowerCase().includes(search.toLowerCase()) ||
    p.city.toLowerCase().includes(search.toLowerCase()) ||
    p.cnom.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Top Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-800/80 p-6 rounded-2xl border border-slate-700 backdrop-blur">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-teal-500/20 text-teal-400 text-xs font-semibold px-2.5 py-1 rounded-full border border-teal-500/30">
                Annuaire Réseau National
              </span>
              <h1 className="text-2xl font-bold text-white tracking-tight">Supervision des Médecins Adhérents</h1>
            </div>
            <p className="text-slate-400 text-sm mt-1">
              Gestion centralisée des médecins créés par le SuperAdmin, des abonnements et des secrétariats.
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setIsAddDoctorOpen(true)}
              className="px-4 py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 shadow-md"
            >
              <span>+ Inscrire un Nouveau Médecin</span>
            </button>
            <button onClick={() => setView('superadmin')} className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-xl text-sm font-medium transition-colors">
              ← Dashboard Principal
            </button>
          </div>
        </div>

        {toast && (
          <div className="p-4 rounded-xl text-sm font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex justify-between items-center">
            <span>{toast.message}</span>
            <button onClick={() => setToast(null)} className="text-xs opacity-70 hover:opacity-100">Fermer</button>
          </div>
        )}

        {/* Search Bar */}
        <div className="flex items-center bg-slate-800 border border-slate-700 rounded-2xl p-2 px-4 gap-3">
          <span className="text-slate-400">🔍</span>
          <input
            type="text"
            placeholder="Rechercher par nom, spécialité, CNOM ou gouvernorat..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent text-white focus:outline-none text-sm placeholder-slate-500"
          />
        </div>

        {/* Practitioners Table */}
        {loading ? (
          <div className="text-center py-12 text-slate-400">Chargement des praticiens...</div>
        ) : (
          <div className="bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-900/60 text-slate-400 text-xs uppercase tracking-wider border-b border-slate-700">
                <tr>
                  <th className="p-4">Médecin & CNOM</th>
                  <th className="p-4">Spécialité & Lieu</th>
                  <th className="p-4">Email de Connexion</th>
                  <th className="p-4">Forfait Souscrit</th>
                  <th className="p-4">Revenu Mensuel (MRR)</th>
                  <th className="p-4">Secrétariat</th>
                  <th className="p-4">Statut</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/60">
                {filtered.map(p => (
                  <tr key={p.id} className="hover:bg-slate-700/40 transition-colors">
                    <td className="p-4">
                      <button onClick={() => setView('fiche-praticien-detail', { id: p.id })} className="font-bold text-white hover:text-teal-400 transition-colors text-left">
                        {p.name}
                      </button>
                      <div className="text-xs text-slate-400">{p.cnom}</div>
                    </td>
                    <td className="p-4">
                      <div className="font-medium text-slate-200">{p.specialty}</div>
                      <div className="text-xs text-slate-400">{p.city} • {p.clinic}</div>
                    </td>
                    <td className="p-4 text-xs font-mono text-slate-300">
                      {p.email || `${p.name.toLowerCase().replace(/[^a-z]/g, '')}@medidesk.tn`}
                    </td>
                    <td className="p-4">
                      <span className="bg-slate-900/80 px-2.5 py-1 rounded-lg text-xs font-semibold text-teal-300 border border-slate-700">
                        {p.plan}
                      </span>
                    </td>
                    <td className="p-4 font-bold text-emerald-400">
                      {p.mrr} TND / mois
                    </td>
                    <td className="p-4 text-xs text-slate-300">
                      👤 {p.secretary}
                    </td>
                    <td className="p-4">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                        p.status === 'active' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                        'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      }`}>
                        {p.status === 'active' ? 'Actif' : 'Paiement En Retard'}
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <button
                        onClick={() => setSelectedPlanModal(p)}
                        className="px-3 py-1.5 bg-teal-500/20 hover:bg-teal-500 text-teal-300 hover:text-slate-950 text-xs font-bold rounded-xl transition-all"
                      >
                        Changer Forfait
                      </button>
                      <button
                        onClick={() => setView('fiche-praticien-detail', { id: p.id })}
                        className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-medium rounded-xl transition-all"
                      >
                        Fiche Complète →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Modal: Inscrire un Nouveau Médecin (SuperAdmin Action) */}
        {isAddDoctorOpen && (
          <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-slate-800 border border-slate-700 rounded-2xl max-w-lg w-full p-6 space-y-4">
              <div className="flex justify-between items-center border-b border-slate-700 pb-3">
                <div>
                  <h3 className="text-lg font-bold text-white">Ajouter un Nouveau Médecin</h3>
                  <p className="text-xs text-slate-400">Création hiérarchique du compte praticien par le SuperAdmin.</p>
                </div>
                <button onClick={() => setIsAddDoctorOpen(false)} className="text-slate-400 hover:text-white">✕</button>
              </div>

              <form onSubmit={handleCreateDoctor} className="space-y-3 text-xs">
                <div>
                  <label className="text-slate-300 block mb-1 font-semibold">Nom complet du Praticien *</label>
                  <input
                    type="text"
                    required
                    placeholder="ex. Dr. Yassine Ben Salah"
                    value={newDoctor.name}
                    onChange={(e) => setNewDoctor({ ...newDoctor, name: e.target.value })}
                    className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-300 block mb-1 font-semibold">Spécialité *</label>
                    <input
                      type="text"
                      required
                      placeholder="ex. Cardiologie"
                      value={newDoctor.specialty}
                      onChange={(e) => setNewDoctor({ ...newDoctor, specialty: e.target.value })}
                      className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-teal-500"
                    />
                  </div>
                  <div>
                    <label className="text-slate-300 block mb-1 font-semibold">Numéro CNOM</label>
                    <input
                      type="text"
                      placeholder="ex. 19842/CNOM"
                      value={newDoctor.cnom}
                      onChange={(e) => setNewDoctor({ ...newDoctor, cnom: e.target.value })}
                      className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-teal-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-300 block mb-1 font-semibold">Gouvernorat / Ville *</label>
                    <input
                      type="text"
                      required
                      placeholder="ex. Tunis, Sousse, Sfax"
                      value={newDoctor.city}
                      onChange={(e) => setNewDoctor({ ...newDoctor, city: e.target.value })}
                      className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-teal-500"
                    />
                  </div>
                  <div>
                    <label className="text-slate-300 block mb-1 font-semibold">Cabinet / Clinique *</label>
                    <input
                      type="text"
                      required
                      placeholder="ex. Clinique Alyssa"
                      value={newDoctor.clinic}
                      onChange={(e) => setNewDoctor({ ...newDoctor, clinic: e.target.value })}
                      className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-teal-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-300 block mb-1 font-semibold">Email de Connexion *</label>
                    <input
                      type="email"
                      required
                      placeholder="dr.bensalah@medidesk.tn"
                      value={newDoctor.email}
                      onChange={(e) => setNewDoctor({ ...newDoctor, email: e.target.value })}
                      className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-teal-500"
                    />
                  </div>
                  <div>
                    <label className="text-slate-300 block mb-1 font-semibold">Téléphone Pro</label>
                    <input
                      type="tel"
                      placeholder="+216 71 000 000"
                      value={newDoctor.phone}
                      onChange={(e) => setNewDoctor({ ...newDoctor, phone: e.target.value })}
                      className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-teal-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-300 block mb-1 font-semibold">Forfait MediDesk</label>
                    <select
                      value={newDoctor.plan}
                      onChange={(e) => setNewDoctor({ ...newDoctor, plan: e.target.value })}
                      className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-teal-500"
                    >
                      <option value="Cloud Secure Pro">Cloud Secure Pro (115 TND/m)</option>
                      <option value="Stockage Local">Stockage Local (65 TND/m)</option>
                      <option value="Clinique / Groupe">Clinique / Groupe (290 TND/m)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-slate-300 block mb-1 font-semibold">Mot de passe provisoire</label>
                    <input
                      type="password"
                      placeholder="Password123!"
                      value={newDoctor.password}
                      onChange={(e) => setNewDoctor({ ...newDoctor, password: e.target.value })}
                      className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-teal-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-700">
                  <button
                    type="button"
                    onClick={() => setIsAddDoctorOpen(false)}
                    className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-xl font-semibold"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={submittingDoctor}
                    className="px-5 py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-xl shadow-md transition-all"
                  >
                    {submittingDoctor ? 'Création en cours...' : 'Créer & Activer le Compte'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Upgrade Forfait */}
        {selectedPlanModal && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-slate-800 border border-slate-700 rounded-2xl max-w-md w-full p-6 space-y-4">
              <h3 className="text-lg font-bold text-white">Changer Forfait : {selectedPlanModal.name}</h3>
              <p className="text-xs text-slate-400">Sélectionnez le nouveau plan tarifaire attribué à ce praticien.</p>
              
              <div className="space-y-2">
                {['Stockage Local', 'Cloud Secure Pro', 'Clinique / Groupe'].map(planName => (
                  <button
                    key={planName}
                    onClick={() => handlePlanChange(selectedPlanModal.id, planName)}
                    className={`w-full p-3 rounded-xl border text-left text-sm font-semibold flex justify-between items-center transition-all ${
                      selectedPlanModal.plan === planName ? 'border-teal-500 bg-teal-500/10 text-teal-300' : 'border-slate-700 bg-slate-900/60 hover:border-slate-500 text-slate-200'
                    }`}
                  >
                    <span>{planName}</span>
                    <span className="text-xs text-slate-400 font-normal">
                      {planName === 'Stockage Local' ? '65 TND/m' : planName === 'Cloud Secure Pro' ? '115 TND/m' : '290 TND/m'}
                    </span>
                  </button>
                ))}
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setSelectedPlanModal(null)}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-xl text-xs font-semibold"
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
