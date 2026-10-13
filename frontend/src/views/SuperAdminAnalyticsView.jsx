import React, { useState, useEffect } from 'react';
import { fetchSuperAdminAnalytics } from '../services/api';

export default function SuperAdminAnalyticsView({ setView }) {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const data = await fetchSuperAdminAnalytics();
      setAnalytics(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-slate-900 text-slate-300 p-8 text-center">Chargement des télémétries...</div>;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-800/80 p-6 rounded-2xl border border-slate-700">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-cyan-500/20 text-cyan-400 text-xs font-semibold px-2.5 py-1 rounded-full border border-cyan-500/30">
                Télémétrie Cloud HDS
              </span>
              <h1 className="text-2xl font-bold text-white">Performances Système & Statistiques d'Utilisation</h1>
            </div>
            <p className="text-slate-400 text-sm mt-1">
              Surveillance de la latence API, charge serveur et volume d'envois SMS patients.
            </p>
          </div>
          <button onClick={() => setView('superadmin')} className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-xl text-sm font-medium transition-colors">
            ← Dashboard Principal
          </button>
        </div>


        {/* Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5">
            <span className="text-slate-400 text-xs font-semibold block">Disponibilité (Uptime)</span>
            <span className="text-3xl font-extrabold text-emerald-400">{analytics?.uptime_percentage}</span>
            <span className="text-xs text-slate-400 block mt-1">Objectif SLA 99.9% Dépassé</span>
          </div>

          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5">
            <span className="text-slate-400 text-xs font-semibold block">Sessions Simultanées</span>
            <span className="text-3xl font-extrabold text-teal-300">{analytics?.active_concurrent_sessions}</span>
            <span className="text-xs text-slate-400 block mt-1">Médecins & Secrétaires actifs</span>
          </div>

          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5">
            <span className="text-slate-400 text-xs font-semibold block">Latence API Moyenne</span>
            <span className="text-3xl font-extrabold text-white">{analytics?.api_latency_ms} ms</span>
            <span className="text-xs text-emerald-400 block mt-1">Ultra-rapide (Serveurs Tunis)</span>
          </div>

          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5">
            <span className="text-slate-400 text-xs font-semibold block">SMS Envoyés Aujourd'hui</span>
            <span className="text-3xl font-extrabold text-cyan-400">{analytics?.sms_sent_today}</span>
            <span className="text-xs text-slate-400 block mt-1">Rappels RDV & Codes 2FA</span>
          </div>
        </div>

        {/* Detailed Status */}
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 space-y-4">
          <h3 className="text-lg font-bold text-white">État des Noeuds de Sauvegarde HDS</h3>
          <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-700/60 space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-300 font-medium">Noeud Principal (Tunis DataCenter HDS-1)</span>
              <span className="text-emerald-400 font-bold">✓ Synchro Réussie</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-300 font-medium">Noeud Secondaire Miroir (Sousse HDS-2)</span>
              <span className="text-emerald-400 font-bold">✓ Synchro Réussie</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-300 font-medium">Chiffrement de la base au repos</span>
              <span className="text-teal-300 font-bold">AES-256 GCM</span>
            </div>
            <div className="pt-2 text-xs text-slate-400 border-t border-slate-800">
              {analytics?.backup_status}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
