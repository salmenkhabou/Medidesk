import React, { useState, useEffect } from 'react';
import { fetchDoctorTeam, addDoctorSecretary } from '../services/api';

export default function DoctorTeamManagementView({ setView }) {
  const [teamData, setTeamData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAddSecretaryOpen, setIsAddSecretaryOpen] = useState(false);
  const [toast, setToast] = useState(null);

  // New Secretary Form State
  const [newSecretary, setNewSecretary] = useState({
    name: '',
    role: 'Secrétaire Médicale',
    email: '',
    phone: '',
    permissions: 'Accueil, Prise de RDV, Encaissement',
    password: 'Password123!'
  });
  const [submittingSecretary, setSubmittingSecretary] = useState(false);

  useEffect(() => {
    loadDoctorTeam();
  }, []);

  const loadDoctorTeam = async () => {
    try {
      setLoading(true);
      const data = await fetchDoctorTeam();
      setTeamData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSecretary = async (e) => {
    e.preventDefault();
    setSubmittingSecretary(true);
    try {
      const res = await addDoctorSecretary(newSecretary);
      setToast({ type: 'success', message: res.message });
      setIsAddSecretaryOpen(false);
      setNewSecretary({
        name: '',
        role: 'Secrétaire Médicale',
        email: '',
        phone: '',
        permissions: 'Accueil, Prise de RDV, Encaissement',
        password: 'Password123!'
      });
      loadDoctorTeam();
    } catch (err) {
      setToast({ type: 'error', message: err.message });
    } finally {
      setSubmittingSecretary(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-slate-900 text-slate-300 p-8 text-center">Chargement des membres du cabinet...</div>;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-800/80 p-6 rounded-2xl border border-slate-700">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-teal-500/20 text-teal-400 text-xs font-semibold px-2.5 py-1 rounded-full border border-teal-500/30">
                Espace Cabinet Praticien
              </span>
              <h1 className="text-2xl font-bold text-white">Gestion de l'Équipe & Secrétariat</h1>
            </div>
            <p className="text-slate-400 text-sm mt-1">
              Praticien référent : <span className="text-white font-semibold">{teamData?.doctor}</span> • {teamData?.clinic}
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setIsAddSecretaryOpen(true)}
              className="px-4 py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 shadow-md"
            >
              <span>+ Ajouter une Secrétaire</span>
            </button>
            <button onClick={() => setView('tableau-de-bord-medecin')} className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-xl text-sm font-medium transition-colors">
              ← Espace Médecin
            </button>
          </div>
        </div>

        {toast && (
          <div className="p-4 rounded-xl text-sm font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex justify-between items-center">
            <span>{toast.message}</span>
            <button onClick={() => setToast(null)} className="text-xs opacity-70 hover:opacity-100">Fermer</button>
          </div>
        )}

        {/* Members List */}
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-bold text-white">Membres du Secrétariat Rattachés</h3>
              <p className="text-xs text-slate-400">Collaborateurs disposant d'un compte de secrétariat créé par le médecin.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {teamData?.members?.map(m => (
              <div key={m.id} className="bg-slate-900/60 border border-slate-700/60 rounded-xl p-5 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-base font-bold text-white">{m.name}</h4>
                    <span className="text-xs text-teal-400 font-medium">{m.role}</span>
                  </div>
                  <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-medium">
                    {m.status}
                  </span>
                </div>

                <div className="text-xs space-y-1 text-slate-300">
                  <div>📧 {m.email}</div>
                  <div>📞 {m.phone}</div>
                </div>

                <div className="pt-2 border-t border-slate-800 text-xs">
                  <span className="text-slate-400 block">Permissions accordées:</span>
                  <span className="text-slate-200 font-semibold">{m.permissions}</span>
                </div>

                <div className="flex gap-2 pt-2">
                  <button className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs rounded-lg font-medium">
                    Modifier Droits
                  </button>
                  <button className="px-3 py-1.5 bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-white text-xs rounded-lg font-medium">
                    Révoquer Accès
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Modal: Ajouter une Secrétaire */}
        {isAddSecretaryOpen && (
          <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-slate-800 border border-slate-700 rounded-2xl max-w-md w-full p-6 space-y-4">
              <div className="flex justify-between items-center border-b border-slate-700 pb-3">
                <div>
                  <h3 className="text-lg font-bold text-white">Ajouter une Secrétaire</h3>
                  <p className="text-xs text-slate-400">Création des accès secrétariat sous la supervision du médecin.</p>
                </div>
                <button onClick={() => setIsAddSecretaryOpen(false)} className="text-slate-400 hover:text-white">✕</button>
              </div>

              <form onSubmit={handleAddSecretary} className="space-y-3 text-xs">
                <div>
                  <label className="text-slate-300 block mb-1 font-semibold">Nom complet de la secrétaire *</label>
                  <input
                    type="text"
                    required
                    placeholder="ex. Amira Trabelsi"
                    value={newSecretary.name}
                    onChange={(e) => setNewSecretary({ ...newSecretary, name: e.target.value })}
                    className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-300 block mb-1 font-semibold">Intitulé du poste</label>
                    <input
                      type="text"
                      placeholder="ex. Secrétaire Médicale"
                      value={newSecretary.role}
                      onChange={(e) => setNewSecretary({ ...newSecretary, role: e.target.value })}
                      className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-teal-500"
                    />
                  </div>
                  <div>
                    <label className="text-slate-300 block mb-1 font-semibold">Téléphone Pro</label>
                    <input
                      type="tel"
                      placeholder="+216 98 000 000"
                      value={newSecretary.phone}
                      onChange={(e) => setNewSecretary({ ...newSecretary, phone: e.target.value })}
                      className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-teal-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-slate-300 block mb-1 font-semibold">Email de Connexion *</label>
                  <input
                    type="email"
                    required
                    placeholder="amira.t@cabinet-alyssa.tn"
                    value={newSecretary.email}
                    onChange={(e) => setNewSecretary({ ...newSecretary, email: e.target.value })}
                    className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="text-slate-300 block mb-1 font-semibold">Permissions accordées</label>
                  <input
                    type="text"
                    placeholder="Accueil, Prise de RDV, Encaissement, Arrêt de caisse"
                    value={newSecretary.permissions}
                    onChange={(e) => setNewSecretary({ ...newSecretary, permissions: e.target.value })}
                    className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="text-slate-300 block mb-1 font-semibold">Mot de passe provisoire</label>
                  <input
                    type="password"
                    placeholder="Password123!"
                    value={newSecretary.password}
                    onChange={(e) => setNewSecretary({ ...newSecretary, password: e.target.value })}
                    className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-700">
                  <button
                    type="button"
                    onClick={() => setIsAddSecretaryOpen(false)}
                    className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-xl font-semibold"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={submittingSecretary}
                    className="px-5 py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-xl shadow-md transition-all"
                  >
                    {submittingSecretary ? 'Création en cours...' : 'Ajouter & Créer les Accès'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
