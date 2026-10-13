import React, { useState, useEffect } from 'react';
import { fetchSuperAdminApplications, approveSuperAdminApplication, rejectSuperAdminApplication } from '../services/api';

export default function SuperAdminApplicationsView({ setView }) {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [toast, setToast] = useState(null);

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    try {
      setLoading(true);
      const res = await fetchSuperAdminApplications();
      setApplications(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      const res = await approveSuperAdminApplication(id);
      setToast({ type: 'success', message: res.message });
      loadApplications();
    } catch (err) {
      setToast({ type: 'error', message: err.message });
    }
  };

  const handleReject = async (id) => {
    try {
      const res = await rejectSuperAdminApplication(id);
      setToast({ type: 'info', message: res.message });
      loadApplications();
    } catch (err) {
      setToast({ type: 'error', message: err.message });
    }
  };

  const filtered = applications.filter(app => {
    if (filter === 'pending') return app.status === 'pending';
    if (filter === 'approved') return app.status === 'approved';
    if (filter === 'rejected') return app.status === 'rejected';
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Navigation */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-800/80 p-6 rounded-2xl border border-slate-700 backdrop-blur">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-amber-500/20 text-amber-400 text-xs font-semibold px-2.5 py-1 rounded-full border border-amber-500/30">
                SuperAdmin Tower
              </span>
              <h1 className="text-2xl font-bold text-white tracking-tight">Validation des Candidatures Praticiens</h1>
            </div>
            <p className="text-slate-400 text-sm mt-1">
              Vérification des numéros CNOM Ordre des Médecins & validation des demandes d'adhésion MediDesk.
            </p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setView('superadmin')} className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-xl text-sm font-medium transition-colors">
              ← Dashboard Principal
            </button>
          </div>
        </div>


        {toast && (
          <div className={`p-4 rounded-xl text-sm font-medium flex justify-between items-center ${
            toast.type === 'success' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
            toast.type === 'error' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
            'bg-amber-500/20 text-amber-300 border border-amber-500/30'
          }`}>
            <span>{toast.message}</span>
            <button onClick={() => setToast(null)} className="text-xs opacity-70 hover:opacity-100">Fermer</button>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="flex gap-2 border-b border-slate-700 pb-3">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${filter === 'all' ? 'bg-teal-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
          >
            Toutes les demandes ({applications.length})
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${filter === 'pending' ? 'bg-teal-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
          >
            En attente CNOM ({applications.filter(a => a.status === 'pending').length})
          </button>
          <button
            onClick={() => setFilter('approved')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${filter === 'approved' ? 'bg-teal-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
          >
            Approuvées ({applications.filter(a => a.status === 'approved').length})
          </button>
        </div>

        {/* Applications List */}
        {loading ? (
          <div className="text-center py-12 text-slate-400">Chargement des candidatures...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map(app => (
              <div key={app.id} className="bg-slate-800 border border-slate-700 rounded-2xl p-5 hover:border-teal-500/40 transition-all flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-bold text-white">{app.doctor_name}</h3>
                      <p className="text-teal-400 text-sm font-medium">{app.specialty}</p>
                    </div>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                      app.status === 'pending' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                      app.status === 'approved' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                      'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    }`}>
                      {app.status === 'pending' ? 'En attente' : app.status === 'approved' ? 'Validé' : 'Refusé'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs bg-slate-900/60 p-3 rounded-xl border border-slate-700/50">
                    <div>
                      <span className="text-slate-400 block">Matricule CNOM</span>
                      <span className="font-semibold text-slate-200">{app.cnom}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Vérification CNOM</span>
                      <span className={app.verified_cnom ? 'text-emerald-400 font-semibold' : 'text-amber-400 font-semibold'}>
                        {app.verified_cnom ? '✓ Registre Ordre Validé' : '⚠️ Vérification Manuelle'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Ville / Cabinet</span>
                      <span className="text-slate-200">{app.city} • {app.clinic}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Forfait Choisi</span>
                      <span className="text-slate-200 font-semibold">{app.plan}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-700/60 flex gap-2">
                  {app.status === 'pending' ? (
                    <>
                      <button
                        onClick={() => handleApprove(app.id)}
                        className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-colors"
                      >
                        ✓ Valider & Activer le Compte
                      </button>
                      <button
                        onClick={() => handleReject(app.id)}
                        className="py-2 px-3 bg-rose-600/30 hover:bg-rose-600 text-rose-200 rounded-xl text-xs font-semibold transition-colors"
                      >
                        Refuser
                      </button>
                    </>
                  ) : (
                    <div className="text-xs text-slate-400 italic">Dossier traité</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
