import React, { useState, useEffect } from 'react';
import { fetchSuperAdminSecurity } from '../services/api';

export default function SuperAdminSecurityView({ setView }) {
  const [securityData, setSecurityData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSecurity();
  }, []);

  const loadSecurity = async () => {
    try {
      setLoading(true);
      const data = await fetchSuperAdminSecurity();
      setSecurityData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-slate-900 text-slate-300 p-8 text-center">Chargement des logs de sécurité...</div>;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-800/80 p-6 rounded-2xl border border-slate-700">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-rose-500/20 text-rose-400 text-xs font-semibold px-2.5 py-1 rounded-full border border-rose-500/30">
                Audit Trail & Conformité HDS
              </span>
              <h1 className="text-2xl font-bold text-white">Sécurité Plateforme & Protection des Données</h1>
            </div>
            <p className="text-slate-400 text-sm mt-1">
              Surveillance des accès, filtrage IP et journal d'audit des données de santé à caractère personnel.
            </p>
          </div>
          <button onClick={() => setView('superadmin')} className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-xl text-sm font-medium transition-colors">
            ← Dashboard Principal
          </button>
        </div>


        {/* Security Settings Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5">
            <span className="text-slate-400 text-xs font-semibold block">Double Authentification (MFA)</span>
            <span className="text-lg font-bold text-emerald-400 mt-1 block">Obligatoire pour tous les Admins</span>
            <span className="text-xs text-slate-500 block mt-1">TOTP + SMS OTP fallback</span>
          </div>

          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5">
            <span className="text-slate-400 text-xs font-semibold block">Expiration de Session</span>
            <span className="text-lg font-bold text-white mt-1 block">{securityData?.session_timeout_minutes} minutes de non-activité</span>
            <span className="text-xs text-slate-500 block mt-1">Déconnexion automatique de sécurité</span>
          </div>

          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5">
            <span className="text-slate-400 text-xs font-semibold block">Chiffrement de la Base HDS</span>
            <span className="text-lg font-bold text-teal-300 mt-1 block">AES-256 + TLS 1.3 Strict</span>
            <span className="text-xs text-slate-500 block mt-1">Certifié CNOM & Agence Numérique Santé</span>
          </div>
        </div>

        {/* Security Audit Events Log */}
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 space-y-4">
          <h3 className="text-lg font-bold text-white">Journal d'Événements de Sécurité Récents</h3>

          <div className="space-y-2">
            {securityData?.security_events?.map(ev => (
              <div key={ev.id} className="flex justify-between items-center p-3 bg-slate-900/60 rounded-xl border border-slate-700/50 text-xs">
                <div className="flex items-center gap-3">
                  <span className={`w-2 h-2 rounded-full ${ev.severity === 'warning' ? 'bg-amber-400' : 'bg-emerald-400'}`}></span>
                  <div>
                    <span className="font-bold text-slate-200 block">{ev.event}</span>
                    <span className="text-slate-400">Utilisateur: {ev.user} • IP: {ev.ip}</span>
                  </div>
                </div>
                <span className="text-slate-500 font-mono">{ev.date}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
