import React, { useState, useEffect } from 'react';
import { fetchSuperAdminSuggestions } from '../services/api';

export default function SuperAdminSuggestionsView({ setView }) {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSuggestions();
  }, []);

  const loadSuggestions = async () => {
    try {
      setLoading(true);
      const res = await fetchSuperAdminSuggestions();
      setSuggestions(res.data || []);
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
              <span className="bg-amber-500/20 text-amber-400 text-xs font-semibold px-2.5 py-1 rounded-full border border-amber-500/30">
                Co-construction Produit
              </span>
              <h1 className="text-2xl font-bold text-white">Suggestions & Retours des Médecins</h1>
            </div>
            <p className="text-slate-400 text-sm mt-1">
              Feedback praticiens et demandes d'améliorations remontées depuis les cabinets.
            </p>
          </div>
          <button onClick={() => setView('superadmin')} className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-xl text-sm font-medium transition-colors">
            ← Dashboard Principal
          </button>
        </div>


        {/* Suggestions List */}
        {loading ? (
          <div className="text-center py-12 text-slate-400">Chargement des suggestions...</div>
        ) : (
          <div className="space-y-4">
            {suggestions.map(s => (
              <div key={s.id} className="bg-slate-800 border border-slate-700 rounded-2xl p-5 hover:border-amber-500/40 transition-all space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
                      {s.category}
                    </span>
                    <h3 className="text-base font-bold text-white mt-2">Par {s.doctor_name}</h3>
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                    s.status === 'planned' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-slate-700 text-slate-300'
                  }`}>
                    {s.status === 'planned' ? 'Planifié dans la feuille de route' : 'En cours d\'analyse'}
                  </span>
                </div>

                <p className="text-slate-300 text-sm bg-slate-900/60 p-4 rounded-xl border border-slate-700/50">
                  "{s.suggestion}"
                </p>

                <div className="flex justify-between items-center text-xs text-slate-500">
                  <span>Reçu le {s.date}</span>
                  <div className="flex gap-2">
                    <button className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg transition-colors font-medium">
                      Planifier Sprint
                    </button>
                    <button className="px-3 py-1.5 bg-teal-600 hover:bg-teal-500 text-white rounded-lg transition-colors font-bold">
                      Répondre au Médecin
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
