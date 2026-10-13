import React, { useState, useEffect } from 'react';
import { fetchPractitionerDetail } from '../services/api';

export default function SuperAdminPractitionerDetailView({ setView, id = 1 }) {
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDetail();
  }, [id]);

  const loadDetail = async () => {
    try {
      setLoading(true);
      const data = await fetchPractitionerDetail(id);
      setDoctor(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-slate-900 text-slate-300 p-8 text-center">Chargement de la fiche...</div>;
  if (!doctor) return <div className="min-h-screen bg-slate-900 text-slate-300 p-8 text-center">Praticien non trouvé.</div>;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Navigation Top */}
        <div className="flex justify-between items-center bg-slate-800 p-6 rounded-2xl border border-slate-700">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-teal-500/20 text-teal-400 text-xs font-semibold px-2.5 py-1 rounded-full border border-teal-500/30">
                Fiche Praticien # {doctor.id}
              </span>
              <h1 className="text-2xl font-bold text-white">{doctor.name}</h1>
            </div>
            <p className="text-slate-400 text-sm mt-1">{doctor.specialty} • {doctor.cnom}</p>
          </div>
          <button onClick={() => setView('annuaire-medecins-superadmin')} className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-xl text-sm font-medium transition-colors">
            ← Annuaire Médecins
          </button>
        </div>


        {/* 2 Grid summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card Info Admin */}
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 space-y-4 md:col-span-1">
            <h3 className="text-sm font-bold text-teal-400 uppercase tracking-wider">Informations Cabinet</h3>
            <div className="space-y-3 text-sm">
              <div>
                <span className="text-slate-400 block text-xs">Gouvernorat / Ville</span>
                <span className="font-semibold text-white">{doctor.city}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-xs">Nom du Cabinet / Clinique</span>
                <span className="font-semibold text-white">{doctor.clinic}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-xs">Téléphone Pro</span>
                <span className="font-semibold text-slate-200">{doctor.phone}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-xs">Adresse Email</span>
                <span className="font-semibold text-slate-200">{doctor.email}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-xs">Secrétaire Rattachée</span>
                <span className="font-semibold text-teal-300">👤 {doctor.secretary}</span>
              </div>
            </div>
          </div>

          {/* Card Statut Forfait & Metrics */}
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 space-y-4 md:col-span-2">
            <h3 className="text-sm font-bold text-teal-400 uppercase tracking-wider">Statut Abonnement & Utilisation HDS</h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-900/60 p-4 rounded-xl border border-slate-700/60">
              <div>
                <span className="text-slate-400 block text-xs">Forfait Actif</span>
                <span className="font-bold text-teal-300 text-sm">{doctor.plan}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-xs">MRR Généré</span>
                <span className="font-bold text-emerald-400 text-sm">{doctor.mrr} TND / m</span>
              </div>
              <div>
                <span className="text-slate-400 block text-xs">Patients Suivis</span>
                <span className="font-bold text-white text-sm">{doctor.total_patients}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-xs">Stockage Utilisé</span>
                <span className="font-bold text-white text-sm">{doctor.storage_used}</span>
              </div>
            </div>

            <h4 className="text-xs font-bold text-slate-400 uppercase mt-4">Historique des Connexions & Audit Security</h4>
            <div className="bg-slate-900/60 rounded-xl p-4 border border-slate-700/60 space-y-2">
              {doctor.activity_log.map(log => (
                <div key={log.id} className="flex justify-between items-center text-xs border-b border-slate-800 pb-2 last:border-0 last:pb-0">
                  <span className="text-slate-300 font-medium">⚡ {log.action}</span>
                  <span className="text-slate-500">{log.timestamp}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
