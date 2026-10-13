import React, { useState, useEffect } from 'react';
import { fetchDoctorDashboard, callPatientF2 } from '../services/api';

export default function DoctorDashboardView({ setView }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const res = await fetchDoctorDashboard();
      setData(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCallF2 = async () => {
    try {
      const res = await callPatientF2();
      showToast(res.message);
    } catch (e) {
      showToast("Signal d'appel transmis à la salle d'attente");
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
          <span className="font-label-lg text-label-lg text-on-surface-variant font-medium">Chargement du tableau de bord médecin...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-surface min-h-screen flex flex-col pb-16">
      
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-24 right-6 z-50 p-4 rounded-xl bg-primary text-on-primary shadow-2xl flex items-center gap-3 animate-bounce max-w-md">
          <span className="material-symbols-outlined text-[24px]">campaign</span>
          <span className="font-label-lg text-label-lg font-bold">{toast}</span>
        </div>
      )}

      {/* Main Workspace Container */}
      <div className="w-full px-4 sm:px-6 lg:px-8 py-4 space-y-6 max-w-[1680px] mx-auto">
        
        {/* 1. Welcome Header */}
        <section className="bg-surface-container-lowest rounded-2xl p-5 shadow-sm border border-surface-container-high">
          <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
            
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0 text-primary">
                <span className="material-symbols-outlined text-[32px]">stethoscope</span>
              </div>
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="font-headline-md text-headline-md text-on-surface font-bold">Bonjour, Dr. Karim Ben Mahmoud</h1>
                  <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-primary/10 text-primary font-label-sm text-label-sm font-bold">
                    <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                    Consultations du matin : En cours
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 font-body-sm text-body-sm text-on-surface-variant">
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[18px] text-outline">calendar_today</span>
                    Jeudi 24 Octobre 2025
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[18px] text-outline">meeting_room</span>
                    Cabinet N° 01 (Étage 1)
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[18px] text-secondary">support_agent</span>
                    Secrétariat : <strong className="text-on-surface font-semibold">Amel Trabelsi</strong> (En poste)
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap items-center gap-2">
              <button 
                onClick={() => setView('salle-attente')}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-primary font-label-lg text-label-lg font-bold transition-colors shadow-xs"
              >
                <span className="material-symbols-outlined text-[20px]">groups</span>
                <span>Salle d'Attente</span>
                <span className="px-2 py-0.5 rounded-full bg-secondary text-on-secondary font-label-sm text-label-sm font-bold">
                  {data?.kpi?.patients_in_waiting || 3} prêts
                </span>
              </button>

              <button 
                onClick={handleCallF2}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-secondary hover:bg-secondary/90 text-on-secondary font-label-lg text-label-lg font-bold transition-transform active:scale-95 shadow-sm"
              >
                <span className="material-symbols-outlined text-[20px]">volume_up</span>
                <span>Appel Patient [F2]</span>
              </button>

              <button 
                onClick={() => setView('consultation-examen')}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-label-lg text-label-lg font-bold shadow-sm transition-all"
              >
                <span className="material-symbols-outlined text-[20px]">add_circle</span>
                <span>+ Saisie Consultation</span>
              </button>
            </div>

          </div>
        </section>

        {/* 2. KPI Cards */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div className="bg-surface-container-lowest rounded-2xl p-5 shadow-sm border border-surface-container-high flex flex-col justify-between">
            <div>
              <p className="font-label-md text-label-md text-on-surface-variant uppercase font-bold">Patients Aujourd'hui</p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="font-headline-xl text-headline-xl font-bold text-on-surface">{data?.kpi?.patients_today_total || 18}</span>
                <span className="font-label-sm text-label-sm text-primary font-bold">+12% vs hier</span>
              </div>
            </div>
            <div className="pt-3 border-t border-surface-container-low mt-3 flex items-center justify-between font-label-sm text-label-sm text-on-surface-variant">
              <span>{data?.kpi?.patients_today_seen || 11} vus</span>
              <span>•</span>
              <span className="text-secondary font-bold">{data?.kpi?.patients_in_waiting || 3} en salle</span>
              <span>•</span>
              <span>{data?.kpi?.patients_scheduled_remaining || 4} prévus</span>
            </div>
          </div>

          <div className="bg-surface-container-lowest rounded-2xl p-5 shadow-sm border border-surface-container-high flex flex-col justify-between">
            <div>
              <p className="font-label-md text-label-md text-on-surface-variant uppercase font-bold">Attente Moyenne</p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="font-headline-xl text-headline-xl font-bold text-on-surface">{data?.kpi?.avg_wait_mins || 11} min</span>
                <span className="font-label-sm text-label-sm text-primary font-bold">Ponctualité {data?.kpi?.punctuality_rate || "91.4%"}</span>
              </div>
            </div>
            <div className="pt-3 border-t border-surface-container-low mt-3 flex items-center justify-between font-label-sm text-label-sm text-primary font-bold">
              <span>Prochain : Mohamed Hédi Guediche</span>
            </div>
          </div>

          <div className="bg-surface-container-lowest rounded-2xl p-5 shadow-sm border border-surface-container-high flex flex-col justify-between">
            <div>
              <p className="font-label-md text-label-md text-on-surface-variant uppercase font-bold">Honoraires du Mois</p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="font-headline-xl text-headline-xl font-bold text-primary">{data?.kpi?.monthly_revenue_tnd || 14850} DT</span>
                <span className="font-label-sm text-label-sm text-on-surface-variant">CNAM {data?.kpi?.monthly_cnam_percentage || 82}%</span>
              </div>
            </div>
            <div className="pt-3 border-t border-surface-container-low mt-3 flex items-center justify-between font-label-sm text-label-sm">
              <button onClick={() => setView('statistiques-honoraires-medecin')} className="text-primary font-bold hover:underline">
                Voir statistiques financières →
              </button>
            </div>
          </div>

          <div className="bg-surface-container-lowest rounded-2xl p-5 shadow-sm border border-surface-container-high flex flex-col justify-between">
            <div>
              <p className="font-label-md text-label-md text-on-surface-variant uppercase font-bold">Nouveaux Patients (Semaine)</p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="font-headline-xl text-headline-xl font-bold text-on-surface">{data?.kpi?.new_patients_week || 14}</span>
                <span className="font-label-sm text-label-sm text-primary font-bold">+4 cette semaine</span>
              </div>
            </div>
            <div className="pt-3 border-t border-surface-container-low mt-3 flex items-center justify-between font-label-sm text-label-sm text-on-surface-variant">
              <span>9 portail en ligne</span>
              <span>•</span>
              <span>5 recommandés</span>
            </div>
          </div>

        </section>

        {/* 3. Active Patient & Today's Schedule Strip */}
        <section className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm border border-surface-container-high space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-surface-container-low">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-primary text-[24px]">schedule</span>
              <div>
                <h2 className="font-headline-sm text-headline-sm font-bold text-on-surface">Déroulé de la Journée & Patient Actif</h2>
                <p className="font-body-sm text-body-sm text-on-surface-variant">Cabinet N° 01 • Dr. Karim Ben Mahmoud</p>
              </div>
            </div>

            <button 
              onClick={() => setView('agenda-consultations-medecin')}
              className="px-4 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high font-label-md text-label-md font-bold text-primary transition-colors"
            >
              Voir l'agenda complet →
            </button>
          </div>

          {/* Active Consultation Highlight Box */}
          <div className="p-5 rounded-2xl bg-primary/5 border-2 border-primary shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary text-on-primary flex items-center justify-center font-bold text-lg">
                MH
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-headline-sm text-headline-sm font-bold text-primary">11:15</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-label-sm text-label-sm font-bold animate-pulse">
                    EN SALLE D'ATTENTE
                  </span>
                  <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">{data?.current_active_slot?.patient_name}</h3>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                  Motif : {data?.current_active_slot?.motive} • CIN: {data?.current_active_slot?.cin} • Arrivé à {data?.current_active_slot?.arrived_at}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end md:self-center">
              <button 
                onClick={handleCallF2}
                className="px-4 py-2.5 rounded-xl bg-primary text-on-primary font-label-md text-label-md font-bold hover:bg-primary-container transition-colors shadow-xs flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[18px]">campaign</span>
                <span>Faire Entrer [F2]</span>
              </button>

              <button 
                onClick={() => setView('consultation-examen')}
                className="px-4 py-2.5 rounded-xl bg-secondary text-on-secondary font-label-md text-label-md font-bold hover:bg-secondary/90 transition-colors shadow-xs flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[18px]">edit_note</span>
                <span>Démarrer Consultation</span>
              </button>
            </div>
          </div>
        </section>

        {/* 4. Two-Column Tools Section: Delay Manager & Quick Shortcuts */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left 7 Cols: Delay Manager */}
          <div className="lg:col-span-7 bg-surface-container-lowest p-6 rounded-2xl shadow-sm border border-surface-container-high space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-surface-container-low">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary text-[24px]">crisis_alert</span>
                <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">Gestionnaire de Retards & Reprogrammation</h3>
              </div>
              <button onClick={() => setView('declaration-retard')} className="text-primary font-bold text-xs hover:underline">
                Ajuster retards →
              </button>
            </div>

            <p className="font-body-sm text-body-sm text-on-surface-variant">
              En cas d'urgence au bloc opératoire ou de dépassement horaire, déclenchez une alerte instantanée aux patients.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <button 
                onClick={() => setView('declaration-retard')}
                className="p-3.5 rounded-xl bg-surface-container-low hover:bg-surface-container border border-surface-container-high text-left transition-colors"
              >
                <span className="font-label-md text-label-md font-bold text-primary block">Retard +20 min</span>
                <span className="font-body-sm text-body-sm text-on-surface-variant block mt-1">Notifier file d'attente par SMS</span>
              </button>

              <button 
                onClick={() => setView('declaration-retard')}
                className="p-3.5 rounded-xl bg-secondary-fixed/30 hover:bg-secondary-fixed/50 border border-secondary-fixed text-left transition-colors"
              >
                <span className="font-label-md text-label-md font-bold text-secondary block">Urgence Bloc (+1h)</span>
                <span className="font-body-sm text-body-sm text-on-surface-variant block mt-1">Bascule créneaux après-midi</span>
              </button>

              <button 
                onClick={() => setView('declaration-retard')}
                className="p-3.5 rounded-xl bg-error-container/30 hover:bg-error-container/50 border border-error-container text-left transition-colors"
              >
                <span className="font-label-md text-label-md font-bold text-error block">Annulation Demi-journée</span>
                <span className="font-body-sm text-body-sm text-on-surface-variant block mt-1">Reprogrammation prioritaire 48h</span>
              </button>
            </div>
          </div>

          {/* Right 5 Cols: Quick Clinical Tools */}
          <div className="lg:col-span-5 bg-surface-container-lowest p-6 rounded-2xl shadow-sm border border-surface-container-high space-y-4">
            <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface pb-3 border-b border-surface-container-low">Raccourcis Cliniques</h3>

            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => setView('redaction-ordonnance')}
                className="p-3 rounded-xl bg-surface-container-low hover:bg-surface-container border border-surface-container-high font-label-md text-label-md font-bold text-primary flex items-center gap-2 transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">prescriptions</span>
                <span>Rédiger Ordonnance</span>
              </button>

              <button 
                onClick={() => setView('generateur-certificats')}
                className="p-3 rounded-xl bg-surface-container-low hover:bg-surface-container border border-surface-container-high font-label-md text-label-md font-bold text-primary flex items-center gap-2 transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">article</span>
                <span>Certificat Médical</span>
              </button>

              <button 
                onClick={() => setView('ocr-import-medical')}
                className="p-3 rounded-xl bg-surface-container-low hover:bg-surface-container border border-surface-container-high font-label-md text-label-md font-bold text-primary flex items-center gap-2 transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">document_scanner</span>
                <span>Extraction OCR Labo</span>
              </button>

              <button 
                onClick={() => setView('annuaire-patients-medecin')}
                className="p-3 rounded-xl bg-surface-container-low hover:bg-surface-container border border-surface-container-high font-label-md text-label-md font-bold text-primary flex items-center gap-2 transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">folder_shared</span>
                <span>Annuaire Patients</span>
              </button>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
