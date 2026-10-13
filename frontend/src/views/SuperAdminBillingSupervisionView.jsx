import React, { useState, useEffect } from 'react';
import { fetchSuperAdminBillingSupervision } from '../services/api';

export default function SuperAdminBillingSupervisionView({ setView }) {
  const [billing, setBilling] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBilling();
  }, []);

  const loadBilling = async () => {
    try {
      setLoading(true);
      const data = await fetchSuperAdminBillingSupervision();
      setBilling(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-slate-900 text-slate-300 p-8 text-center">Chargement de la facturation...</div>;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-800/80 p-6 rounded-2xl border border-slate-700">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-emerald-500/20 text-emerald-400 text-xs font-semibold px-2.5 py-1 rounded-full border border-emerald-500/30">
                Supervision Financière MediDesk
              </span>
              <h1 className="text-2xl font-bold text-white">Facturation SaaS & Suivi MRR / ARR</h1>
            </div>
            <p className="text-slate-400 text-sm mt-1">
              Tableau de bord financier, abonnements praticiens et relance des factures en retard.
            </p>
          </div>
          <button onClick={() => setView('superadmin')} className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-xl text-sm font-medium transition-colors">
            ← Dashboard Principal
          </button>
        </div>


        {/* Financial KPI Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-4">
            <span className="text-slate-400 text-xs font-semibold block">MRR Mensuel</span>
            <span className="text-2xl font-extrabold text-emerald-400">{billing?.mrr_tnd} TND</span>
            <span className="text-emerald-500 text-xs block mt-1">{billing?.growth_mom} vs mois dernier</span>
          </div>

          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-4">
            <span className="text-slate-400 text-xs font-semibold block">ARR Projeté</span>
            <span className="text-2xl font-extrabold text-teal-300">{billing?.arr_tnd} TND</span>
            <span className="text-slate-500 text-xs block mt-1">Calculé sur 12 mois</span>
          </div>

          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-4">
            <span className="text-slate-400 text-xs font-semibold block">ARPU Moyen</span>
            <span className="text-2xl font-extrabold text-white">{billing?.arpu_tnd} TND</span>
            <span className="text-slate-500 text-xs block mt-1">Revenu par cabinet</span>
          </div>

          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-4">
            <span className="text-slate-400 text-xs font-semibold block">Taux de Churn</span>
            <span className="text-2xl font-extrabold text-cyan-400">{billing?.churn_rate}</span>
            <span className="text-slate-500 text-xs block mt-1">Fidélité médicale excellente</span>
          </div>

          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-4 col-span-2 md:col-span-1">
            <span className="text-slate-400 text-xs font-semibold block">Avis d'échéance CNAM</span>
            <span className="text-2xl font-extrabold text-amber-400">Ok</span>
            <span className="text-amber-500/80 text-xs block mt-1">Modules certifiés</span>
          </div>
        </div>

        {/* Factures Table */}
        <div className="bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden p-6 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-white">Dernières Factures d'Abonnement MediDesk</h3>
            <span className="text-xs text-slate-400">Mises à jour automatiques au 1er du mois</span>
          </div>

          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-900/60 text-slate-400 text-xs uppercase tracking-wider border-b border-slate-700">
              <tr>
                <th className="p-3">N° Facture</th>
                <th className="p-3">Praticien</th>
                <th className="p-3">Date d'Émission</th>
                <th className="p-3">Montant (TND)</th>
                <th className="p-3">Statut Règlement</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/60">
              {billing?.invoices?.map((inv, idx) => (
                <tr key={idx} className="hover:bg-slate-700/40 transition-colors">
                  <td className="p-3 font-mono text-xs font-semibold text-teal-400">{inv.invoice_no}</td>
                  <td className="p-3 font-semibold text-white">{inv.practitioner}</td>
                  <td className="p-3 text-xs text-slate-400">{inv.date}</td>
                  <td className="p-3 font-bold text-emerald-400">{inv.amount} TND</td>
                  <td className="p-3">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                      inv.status === 'paid' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                      'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    }`}>
                      {inv.status === 'paid' ? 'Réglée ✓' : 'Paiement En Retard ⚠️'}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <button className="px-3 py-1 bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-medium rounded-lg">
                      Télécharger PDF
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
