import React, { useState } from 'react';

export default function DoctorPlanningView({ setView }) {
  const [viewMode, setViewMode] = useState('day');
  const [toast, setToast] = useState(null);

  const slots = [
    { time: "09:00", patient: "Kamel Laroussi", motive: "Consultation suivi + ECG", status: "Terminé", color: "bg-surface-container-high text-on-surface-variant" },
    { time: "09:45", patient: "Fatma Chaabane", motive: "Épreuve d'effort cardiaque", status: "Terminé", color: "bg-surface-container-high text-on-surface-variant" },
    { time: "10:30", patient: "Yasmine Ben Amor", motive: "Échocardiographie Doppler", status: "Terminé", color: "bg-surface-container-high text-on-surface-variant" },
    { time: "11:15", patient: "Mohamed Hédi Guediche", motive: "Contrôle post-opératoire & ECG", status: "En cours", color: "bg-primary text-on-primary font-bold" },
    { time: "12:00", patient: "Tahar Khelil", motive: "Échocardiographie", status: "En attente", color: "bg-primary-container text-on-primary" },
    { time: "14:30", patient: "Moncef Jaziri", motive: "Bilan d'hypertension artérielle", status: "Confirmé SMS", color: "bg-surface-container-low text-on-surface" }
  ];

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  };

  return (
    <div className="w-full bg-surface min-h-screen pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
      
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-24 right-6 z-50 p-4 rounded-xl bg-primary text-on-primary shadow-2xl flex items-center gap-3 animate-bounce max-w-md">
          <span className="material-symbols-outlined text-[24px]">calendar_today</span>
          <span className="font-label-lg text-label-lg font-bold">{toast}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 text-on-surface-variant font-label-md text-label-md mb-1">
            <button onClick={() => setView('tableau-de-bord-medecin')} className="hover:text-primary">Espace Médecin</button>
            <span>/</span>
            <span className="text-primary font-bold">Agenda & Consultations</span>
          </div>
          <h1 className="font-headline-xl text-headline-xl font-bold text-on-surface">Agenda Médical & Consultations</h1>
        </div>

        <button 
          onClick={() => setView('tableau-de-bord-medecin')}
          className="px-4 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high font-label-md text-label-md font-bold text-on-surface transition-colors"
        >
          Retour Dashboard
        </button>
      </div>

      {/* Controls Bar */}
      <div className="bg-surface-container-lowest p-4 rounded-2xl shadow-sm border border-surface-container-high flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <span className="font-label-lg text-label-lg font-bold text-on-surface">Jeudi 24 Octobre 2025</span>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => setView('declaration-retard')}
            className="px-4 py-2 rounded-xl bg-secondary-container text-on-secondary-container font-label-md text-label-md font-bold hover:opacity-90 transition-colors shadow-xs flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[18px]">alarm_add</span>
            <span>Signaler Retard</span>
          </button>
        </div>
      </div>

      {/* Agenda Slot List */}
      <div className="bg-surface-container-lowest rounded-2xl shadow-sm border border-surface-container-high overflow-hidden">
        <div className="p-4 bg-surface-container-low border-b border-surface-container-high flex items-center justify-between">
          <h2 className="font-headline-sm text-headline-sm font-bold text-on-surface">Créneaux de la Journée — Dr. Karim Ben Mahmoud</h2>
          <span className="font-label-sm text-label-sm text-primary font-bold">Cabinet N° 01</span>
        </div>

        <div className="divide-y divide-surface-container-low">
          {slots.map((s, i) => (
            <div key={i} className="p-4 hover:bg-surface-container-low/40 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <span className="font-headline-sm text-headline-sm font-bold text-primary min-w-[80px]">{s.time}</span>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">{s.patient}</h3>
                    <span className={`px-2.5 py-0.5 rounded-full font-label-sm text-label-sm font-bold ${s.color}`}>
                      {s.status}
                    </span>
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">{s.motive}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end md:self-center">
                <button 
                  onClick={() => setView('consultation-examen')}
                  className="px-3.5 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-label-sm text-label-sm font-bold"
                >
                  Examen
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
