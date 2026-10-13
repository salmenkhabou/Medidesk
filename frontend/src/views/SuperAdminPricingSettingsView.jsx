import React, { useState, useEffect } from 'react';
import { fetchPricingSettingsAdmin } from '../services/api';

export default function SuperAdminPricingSettingsView({ setView }) {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const res = await fetchPricingSettingsAdmin();
      setPlans(res.plans || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-800/80 p-6 rounded-2xl border border-slate-700">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-purple-500/20 text-purple-400 text-xs font-semibold px-2.5 py-1 rounded-full border border-purple-500/30">
                Paramétrage Commercial
              </span>
              <h1 className="text-2xl font-bold text-white">Gestion des Tarifs & Offres MediDesk</h1>
            </div>
            <p className="text-slate-400 text-sm mt-1">
              Configuration des forfaits d'abonnement affichés sur la landing page et grille tarifaire.
            </p>
          </div>
          <button onClick={() => setView('superadmin')} className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-xl text-sm font-medium transition-colors">
            ← Dashboard Principal
          </button>
        </div>


        {/* Plans Grid */}
        {loading ? (
          <div className="text-center py-12 text-slate-400">Chargement des forfaits...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {plans.map(plan => (
              <div key={plan.id} className="bg-slate-800 border border-slate-700 rounded-2xl p-6 flex flex-col justify-between hover:border-purple-500/40 transition-all">
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-white">{plan.name}</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-extrabold text-teal-400">{plan.price}</span>
                    <span className="text-slate-400 text-xs font-medium">{plan.period}</span>
                  </div>

                  <ul className="space-y-2 text-xs text-slate-300 border-t border-slate-700/60 pt-4">
                    {plan.features.map((feat, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <span className="text-teal-400">✓</span>
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-700/60">
                  <button className="w-full py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-100 rounded-xl text-xs font-bold transition-colors">
                    Éditer les Caractéristiques
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
