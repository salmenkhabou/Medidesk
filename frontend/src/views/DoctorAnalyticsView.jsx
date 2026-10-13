import React, { useState, useEffect } from 'react';
import { fetchDoctorPracticeAnalytics } from '../services/api';

export default function DoctorAnalyticsView({ setView }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const res = await fetchDoctorPracticeAnalytics();
      setData(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full bg-surface min-h-screen pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 text-on-surface-variant font-label-md text-label-md mb-1">
            <button onClick={() => setView('tableau-de-bord-medecin')} className="hover:text-primary">Espace Médecin</button>
            <span>/</span>
            <span className="text-primary font-bold">Statistiques & Honoraires</span>
          </div>
          <h1 className="font-headline-xl text-headline-xl font-bold text-on-surface">Statistiques & Honoraires du Cabinet</h1>
        </div>

        <button 
          onClick={() => setView('tableau-de-bord-medecin')}
          className="px-4 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high font-label-md text-label-md font-bold text-on-surface transition-colors"
        >
          Retour Dashboard
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        <div className="bg-surface-container-lowest p-5 rounded-2xl shadow-sm border border-surface-container-high flex flex-col">
          <span className="font-label-sm text-label-sm font-bold text-primary uppercase">Recettes du Mois (TND)</span>
          <span className="font-headline-xl text-headline-xl font-bold text-primary mt-1">{data?.revenue_month_total || 14850} DT</span>
          <span className="font-body-sm text-body-sm text-on-surface-variant mt-1">Objectif : {data?.revenue_target || 18000} DT</span>
        </div>

        <div className="bg-surface-container-lowest p-5 rounded-2xl shadow-sm border border-surface-container-high flex flex-col">
          <span className="font-label-sm text-label-sm font-bold text-on-surface-variant uppercase">Espèces Encaissées</span>
          <span className="font-headline-xl text-headline-xl font-bold text-on-surface mt-1">{data?.breakdown_by_payment?.cash || 7200} DT</span>
          <span className="font-body-sm text-body-sm text-on-surface-variant mt-1">Caisse cabinet</span>
        </div>

        <div className="bg-surface-container-lowest p-5 rounded-2xl shadow-sm border border-surface-container-high flex flex-col">
          <span className="font-label-sm text-label-sm font-bold text-on-surface-variant uppercase">Remboursements CNAM</span>
          <span className="font-headline-xl text-headline-xl font-bold text-on-surface mt-1">{data?.breakdown_by_payment?.cnam_reimbursements || 3450} DT</span>
          <span className="font-body-sm text-body-sm text-on-surface-variant mt-1">AP2 filière privée</span>
        </div>

        <div className="bg-surface-container-lowest p-5 rounded-2xl shadow-sm border border-surface-container-high flex flex-col">
          <span className="font-label-sm text-label-sm font-bold text-on-surface-variant uppercase">Chèques / TPE</span>
          <span className="font-headline-xl text-headline-xl font-bold text-on-surface mt-1">{(data?.breakdown_by_payment?.cheque || 2400) + (data?.breakdown_by_payment?.tpe || 1800)} DT</span>
          <span className="font-body-sm text-body-sm text-on-surface-variant mt-1">En caisse bancaire</span>
        </div>
      </div>

      {/* Top Acts Table */}
      <div className="bg-surface-container-lowest rounded-2xl shadow-sm border border-surface-container-high overflow-hidden">
        <div className="p-4 bg-surface-container-low border-b border-surface-container-high flex items-center justify-between">
          <h2 className="font-headline-sm text-headline-sm font-bold text-on-surface">Répartition des Actes Réalisés Ce Mois</h2>
          <span className="font-label-sm text-label-sm text-primary font-bold">Cabinet N° 01</span>
        </div>

        <div className="divide-y divide-surface-container-low">
          {(data?.top_acts || []).map((act, i) => (
            <div key={i} className="p-4 flex items-center justify-between">
              <div>
                <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">{act.name}</h3>
                <span className="font-body-sm text-body-sm text-on-surface-variant">{act.count} actes effectués ce mois</span>
              </div>
              <span className="font-headline-sm text-headline-sm font-bold text-primary">{act.revenue} DT</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
