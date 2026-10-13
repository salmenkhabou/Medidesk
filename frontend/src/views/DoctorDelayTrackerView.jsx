import React from 'react';

export default function DoctorDelayTrackerView({ setView }) {
  return (
    <div className="w-full bg-surface min-h-screen pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-headline-xl text-headline-xl font-bold text-on-surface">Suivi en Direct & Fenêtre de Priorité</h1>
        <button onClick={() => setView('tableau-de-bord-medecin')} className="px-4 py-2 rounded-xl bg-surface-container font-bold text-on-surface">
          Retour Dashboard
        </button>
      </div>

      <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm border border-surface-container-high space-y-4">
        <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-between">
          <div>
            <span className="font-label-sm text-label-sm text-primary font-bold block">Patient en Consultation Actuelle</span>
            <h2 className="font-headline-md text-headline-md font-bold text-on-surface">Mohamed Hédi Guediche (11:15)</h2>
            <span className="font-body-sm text-body-sm text-on-surface-variant">Temps écoulé : 16 minutes • Prochain : Tahar Khelil (12:00)</span>
          </div>
          <button onClick={() => setView('consultation-examen')} className="px-4 py-2 rounded-xl bg-primary text-on-primary font-bold shadow-xs">
            Examen Clinique →
          </button>
        </div>
      </div>
    </div>
  );
}
