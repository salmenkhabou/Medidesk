import React, { useState, useEffect } from 'react';
import { fetchDoctorSecurity } from '../services/api';

export default function DoctorAccountSecurityView({ setView }) {
  const [security, setSecurity] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDoctorSecurity();
  }, []);

  const loadDoctorSecurity = async () => {
    try {
      setLoading(true);
      const data = await fetchDoctorSecurity();
      setSecurity(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-slate-900 text-slate-300 p-8 text-center">Chargement des paramètres de sécurité...</div>;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-800/80 p-6 rounded-2xl border border-slate-700">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-emerald-500/20 text-emerald-400 text-xs font-semibold px-2.5 py-1 rounded-full border border-emerald-500/30">
                Securité du Compte Médecin
              </span>
              <h1 className="text-2xl font-bold text-white">Double Authentification & Sessions Signées</h1>
            </div>
            <p className="text-slate-400 text-sm mt-1">
              Gestion de vos clés 2FA, appareils de confiance et audit des signatures d'ordonnances.
            </p>
          </div>
          <button onClick={() => setView('tableau-de-bord-medecin')} className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-xl text-sm font-medium transition-colors">
            ← Espace Médecin
          </button>
        </div>


        {/* 2FA Card */}
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-bold text-white">Authentification à Deux Facteurs (2FA TOTP)</h3>
              <p className="text-xs text-slate-400 mt-1">Protège vos prescriptions médicales et l'accès aux dossiers patients CNAM.</p>
            </div>
            <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold text-xs rounded-full">
              ✓ Activé
            </span>
          </div>

          <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-700/50 text-xs space-y-2">
            <div>Méthode active : <span className="font-semibold text-teal-300">{security?.method}</span></div>
            <div className="text-slate-400">Pour modifier votre application TOTP (Google Authenticator / Authy), réinitialisez la clé de sécurité.</div>
          </div>
        </div>

        {/* Audit Logs */}
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 space-y-4">
          <h3 className="text-lg font-bold text-white">Historique d'Activité sur votre Compte</h3>

          <div className="space-y-2">
            {security?.audit_logs?.map(log => (
              <div key={log.id} className="flex justify-between items-center p-3 bg-slate-900/60 rounded-xl border border-slate-700/50 text-xs">
                <div>
                  <span className="font-bold text-white block">{log.action}</span>
                  <span className="text-slate-400">Adresse IP : {log.ip}</span>
                </div>
                <span className="text-slate-500">{log.date}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
