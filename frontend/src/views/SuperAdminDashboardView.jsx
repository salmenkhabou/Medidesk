import React, { useState, useEffect } from 'react';
import { fetchSuperAdminDashboard, approveSuperAdminApplication, rejectSuperAdminApplication } from '../services/api';

export default function SuperAdminDashboardView({ setView }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const res = await fetchSuperAdminDashboard();
      setData(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      const res = await approveSuperAdminApplication(id);
      showToast(res.message);
      loadDashboard();
    } catch (e) {
      showToast("Erreur lors de la validation");
    }
  };

  const handleReject = async (id) => {
    try {
      const res = await rejectSuperAdminApplication(id);
      showToast(res.message);
      loadDashboard();
    } catch (e) {
      showToast("Erreur lors du rejet");
    }
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  };

  if (loading) {
    return (
      <div className="w-full pt-28 pb-16 flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <span className="font-label-lg text-label-lg text-on-surface-variant font-medium">Chargement de la tour de contrôle SuperAdmin...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-surface min-h-screen flex flex-col pb-16">
      
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-24 right-6 z-50 p-4 rounded-xl bg-primary text-on-primary shadow-2xl flex items-center gap-3 animate-bounce max-w-md">
          <span className="material-symbols-outlined text-[24px]">verified_user</span>
          <span className="font-label-lg text-label-lg font-bold">{toast}</span>
        </div>
      )}

      {/* Main Workspace Wrapper */}
      <div className="px-4 sm:px-6 lg:px-8 py-4 max-w-[1720px] mx-auto w-full space-y-6">
        
        {/* Header Bar */}
        <div className="bg-surface-container-lowest rounded-2xl p-5 shadow-sm border border-surface-container-high flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-surface-container-high text-primary font-label-sm text-label-sm uppercase font-bold tracking-wider">
                SuperAdmin Master Suite
              </span>
              <span className="text-outline">•</span>
              <span className="font-label-sm text-label-sm text-on-surface-variant font-bold">
                {data?.admin?.clock_tunis}
              </span>
            </div>
            <h1 className="font-headline-lg text-headline-lg font-bold text-on-surface tracking-tight">
              Tour de Contrôle & Supervision Nationale MediDesk
            </h1>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Télémétrie temps réel, gouvernance HDS certifiée et arbitrage des candidatures praticiens.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-surface-container-low border border-surface-container-high">
              <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse"></span>
              <span className="font-label-md text-label-md text-primary font-bold">
                {data?.admin?.cluster_status}
              </span>
            </div>

            <button 
              onClick={loadDashboard}
              className="px-4 py-2.5 rounded-xl bg-primary text-on-primary font-label-md text-label-md font-bold hover:bg-primary-container transition-colors shadow-xs flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[18px]">sync</span>
              <span>Actualiser</span>
            </button>
          </div>
        </div>

        {/* High Impact KPI Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          
          <div className="bg-surface-container-lowest p-5 rounded-2xl shadow-sm border border-surface-container-high flex flex-col justify-between">
            <div>
              <span className="font-label-md text-label-md font-bold text-on-surface-variant uppercase">Médecins Actifs</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="font-headline-xl text-headline-xl font-bold text-on-surface">{data?.kpi?.active_doctors || 384}</span>
                <span className="font-label-sm text-label-sm text-primary font-bold">+8.4% ce mois</span>
              </div>
            </div>
            <div className="pt-3 border-t border-surface-container-low mt-3 font-label-sm text-label-sm text-on-surface-variant">
              384 cabinets médicaux certifiés HDS
            </div>
          </div>

          <div className="bg-surface-container-lowest p-5 rounded-2xl shadow-sm border border-surface-container-high flex flex-col justify-between">
            <div>
              <span className="font-label-md text-label-md font-bold text-on-surface-variant uppercase">Candidatures en Attente</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="font-headline-xl text-headline-xl font-bold text-secondary">{data?.kpi?.pending_applications || 14}</span>
                <span className="font-label-sm text-label-sm text-secondary font-bold">6 urgents CNOM</span>
              </div>
            </div>
            <div className="pt-3 border-t border-surface-container-low mt-3 font-label-sm text-label-sm text-secondary font-bold">
              À vérifier avant activation SLA 48h
            </div>
          </div>

          <div className="bg-surface-container-lowest p-5 rounded-2xl shadow-sm border border-surface-container-high flex flex-col justify-between">
            <div>
              <span className="font-label-md text-label-md font-bold text-on-surface-variant uppercase">MRR Revenu Récurrent</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="font-headline-xl text-headline-xl font-bold text-primary">{data?.kpi?.mrr_tnd || 42650} TND</span>
                <span className="font-label-sm text-label-sm text-primary font-bold">+12.3% MoM</span>
              </div>
            </div>
            <div className="pt-3 border-t border-surface-container-low mt-3 font-label-sm text-label-sm text-on-surface-variant">
              ARR Projeté : {data?.kpi?.arr_tnd_projected || 511800} TND
            </div>
          </div>

          <div className="bg-surface-container-lowest p-5 rounded-2xl shadow-sm border border-surface-container-high flex flex-col justify-between">
            <div>
              <span className="font-label-md text-label-md font-bold text-on-surface-variant uppercase">Patients Suivis</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="font-headline-xl text-headline-xl font-bold text-on-surface">{data?.kpi?.monitored_patients_total || 128490}</span>
                <span className="font-label-sm text-label-sm text-primary font-bold">+15.7%</span>
              </div>
            </div>
            <div className="pt-3 border-t border-surface-container-low mt-3 font-label-sm text-label-sm text-on-surface-variant">
              Base nationale certifiée HDS
            </div>
          </div>

        </div>

        {/* Asymmetric Grid: Left Overdue & Applications Stack / Right Financial Trajectory */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column (7 cols): Overdue Payments & Application Stack */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Overdue Payments Card */}
            <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm border-l-4 border-error border-y border-r border-surface-container-high space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-error text-[24px]">warning</span>
                  <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">Impayés & Pre-Alertes Suspension</h3>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-error-container text-on-error-container font-label-sm text-label-sm font-bold">
                  4 cabinets sous préavis
                </span>
              </div>

              <div className="space-y-3">
                {(data?.overdue_payments_alerts || []).map((item, i) => (
                  <div key={i} className="p-4 rounded-xl bg-surface-container-low border border-surface-container-high flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-headline-sm text-headline-sm font-bold text-on-surface">{item.doctor}</span>
                        <span className="px-2 py-0.5 rounded bg-error-container text-error font-label-sm text-label-sm font-bold">
                          J+{item.days_overdue}
                        </span>
                      </div>
                      <span className="font-body-sm text-body-sm text-on-surface-variant block mt-0.5">{item.specialty} • {item.city}</span>
                    </div>

                    <div className="text-right">
                      <span className="font-headline-sm text-headline-sm font-bold text-on-surface block">{item.amount_tnd} TND</span>
                      <button 
                        onClick={() => showToast(`Relance automatique envoyée au ${item.doctor}`)}
                        className="px-3 py-1 rounded-lg bg-surface-container-high hover:bg-surface-container font-label-sm text-label-sm font-bold text-primary mt-1"
                      >
                        {item.action}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Applications Qualification Queue */}
            <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm border border-surface-container-high space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-surface-container-low">
                <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">Candidatures Praticiens à Valider</h3>
                <button onClick={() => setView('candidatures-superadmin')} className="text-primary font-bold text-xs hover:underline">
                  Voir toutes les 14 candidatures →
                </button>
              </div>

              <div className="space-y-3">
                {(data?.pending_applications_list || []).map((app) => (
                  <div key={app.id} className="p-4 rounded-xl bg-surface-container-low border border-surface-container-high flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-headline-sm text-headline-sm font-bold text-on-surface">{app.doctor_name}</h4>
                        <span className="px-2 py-0.5 rounded bg-primary/10 text-primary font-label-sm text-label-sm font-bold">{app.cnom}</span>
                        <span className="px-2 py-0.5 rounded bg-surface-container-high text-on-surface-variant font-label-sm text-label-sm">{app.plan}</span>
                      </div>
                      <span className="font-body-sm text-body-sm text-on-surface-variant block mt-1">{app.specialty} • {app.clinic} ({app.city})</span>
                    </div>

                    {app.status === 'pending' && (
                      <div className="flex items-center gap-2 shrink-0">
                        <button 
                          onClick={() => handleReject(app.id)}
                          className="px-3 py-1.5 rounded-lg bg-error-container text-on-error-container font-label-sm text-label-sm font-bold"
                        >
                          Rejeter
                        </button>
                        <button 
                          onClick={() => handleApprove(app.id)}
                          className="px-4 py-1.5 rounded-lg bg-primary text-on-primary font-label-md text-label-md font-bold shadow-xs"
                        >
                          Valider Compte
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Right Column (5 cols): Plan Typology & Quick SuperAdmin Actions */}
          <div className="lg:col-span-5 bg-surface-container-lowest p-6 rounded-2xl shadow-sm border border-surface-container-high space-y-6">
            <div>
              <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface pb-3 border-b border-surface-container-low">Répartition des Formules Tarification</h3>
              
              <div className="space-y-4 pt-3">
                <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-between">
                  <div>
                    <span className="font-headline-sm text-headline-sm font-bold text-primary block">Cloud Secure Pro</span>
                    <span className="font-body-sm text-body-sm text-on-surface-variant">1 290 TND/an • Hébergement HDS + Restitution 3 sites</span>
                  </div>
                  <span className="font-headline-xl text-headline-xl font-bold text-primary">72%</span>
                </div>

                <div className="p-4 rounded-xl bg-surface-container-low border border-surface-container-high flex items-center justify-between">
                  <div>
                    <span className="font-headline-sm text-headline-sm font-bold text-on-surface block">Stockage Local</span>
                    <span className="font-body-sm text-body-sm text-on-surface-variant">890 TND/an • Mono-poste local cabinet</span>
                  </div>
                  <span className="font-headline-xl text-headline-xl font-bold text-on-surface">28%</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-label-md text-label-md font-bold text-on-surface uppercase">Raccourcis SuperAdmin Master :</h4>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button onClick={() => setView('annuaire-medecins-superadmin')} className="p-3 rounded-xl bg-surface-container-low hover:bg-surface-container font-label-md text-label-md font-bold text-primary flex items-center gap-2 border border-surface-container-high">
                  <span className="material-symbols-outlined text-[18px]">stethoscope</span>
                  <span>Annuaire Médecins</span>
                </button>

                <button onClick={() => setView('supervision-facturation-superadmin')} className="p-3 rounded-xl bg-surface-container-low hover:bg-surface-container font-label-md text-label-md font-bold text-primary flex items-center gap-2 border border-surface-container-high">
                  <span className="material-symbols-outlined text-[18px]">payments</span>
                  <span>Supervision MRR</span>
                </button>

                <button onClick={() => setView('tarification-forfaits-superadmin')} className="p-3 rounded-xl bg-surface-container-low hover:bg-surface-container font-label-md text-label-md font-bold text-primary flex items-center gap-2 border border-surface-container-high">
                  <span className="material-symbols-outlined text-[18px]">tune</span>
                  <span>Paramètres Pricing</span>
                </button>

                <button onClick={() => setView('suggestions-praticiens-superadmin')} className="p-3 rounded-xl bg-surface-container-low hover:bg-surface-container font-label-md text-label-md font-bold text-primary flex items-center gap-2 border border-surface-container-high">
                  <span className="material-symbols-outlined text-[18px]">feedback</span>
                  <span>Suggestions Inbox</span>
                </button>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
