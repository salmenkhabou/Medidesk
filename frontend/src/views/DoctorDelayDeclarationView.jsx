import React, { useState } from 'react';
import { postDelayAlert } from '../services/api';

export default function DoctorDelayDeclarationView({ setView }) {
  const [minutes, setMinutes] = useState(20);
  const [scenarioTitle, setScenarioTitle] = useState('Retard Mineur (+20 min)');
  const [toast, setToast] = useState(null);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  };

  const handleTriggerAlert = async (m, title) => {
    setMinutes(m);
    setScenarioTitle(title);
    try {
      const res = await postDelayAlert({ minutes: m, scenario_title: title, notify_sms: true });
      showToast(res.message);
    } catch (e) {
      showToast("Erreur lors de la déclaration du retard");
    }
  };

  return (
    <div className="w-full bg-surface min-h-screen pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-24 right-6 z-50 p-4 rounded-xl bg-secondary text-on-secondary shadow-2xl flex items-center gap-3 animate-bounce max-w-md">
          <span className="material-symbols-outlined text-[24px]">crisis_alert</span>
          <span className="font-label-lg text-label-lg font-bold">{toast}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 text-on-surface-variant font-label-md text-label-md mb-1">
            <button onClick={() => setView('tableau-de-bord-medecin')} className="hover:text-primary">Espace Médecin</button>
            <span>/</span>
            <span className="text-primary font-bold">Déclaration Retard</span>
          </div>
          <h1 className="font-headline-xl text-headline-xl font-bold text-on-surface">Déclaration de Retard & Réajustement de Planning</h1>
        </div>

        <button 
          onClick={() => setView('tableau-de-bord-medecin')}
          className="px-4 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high font-label-md text-label-md font-bold text-on-surface transition-colors"
        >
          Retour Dashboard
        </button>
      </div>

      <div className="bg-surface-container-lowest p-6 sm:p-8 rounded-2xl shadow-lg border border-surface-container-high space-y-6">
        
        <div className="flex items-center gap-3 pb-3 border-b border-surface-container-low">
          <span className="material-symbols-outlined text-secondary text-[28px]">crisis_alert</span>
          <div>
            <h2 className="font-headline-sm text-headline-sm font-bold text-on-surface">Protocole de Gestion des Délais & Urgences</h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant">L'envoi de SMS automatique prévient les patients pour éviter l'encombrement en salle.</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-surface-container-low border border-surface-container-high flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">Retard léger (+15 à +20 min)</h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant">Décalage modéré. Envoi de SMS de courtoisie invite à décaler la venue.</p>
            </div>
            <button 
              onClick={() => handleTriggerAlert(20, 'Retard mineur (+20 min)')}
              className="px-5 py-2.5 rounded-xl bg-primary text-on-primary font-label-md text-label-md font-bold hover:bg-primary-container shadow-xs"
            >
              Déclencher Retard +20 min
            </button>
          </div>

          <div className="p-5 rounded-2xl bg-surface-container-low border border-surface-container-high flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">Urgence Bloc / Retard majeur (+1h)</h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant">Intervention imprévue au bloc opératoire. Proposition de report d'après-midi.</p>
            </div>
            <button 
              onClick={() => handleTriggerAlert(60, 'Urgence Bloc (+1h)')}
              className="px-5 py-2.5 rounded-xl bg-secondary text-on-secondary font-label-md text-label-md font-bold hover:bg-secondary/90 shadow-xs"
            >
              Déclencher Urgence Bloc (+1h)
            </button>
          </div>

          <div className="p-5 rounded-2xl bg-surface-container-low border border-surface-container-high flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">Annulation / Report de Demi-journée</h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant">Impossibilité de consulter ce matin. Reprogrammation sous 48h prioritaire.</p>
            </div>
            <button 
              onClick={() => handleTriggerAlert(120, 'Annulation Demi-journée')}
              className="px-5 py-2.5 rounded-xl bg-error-container text-on-error-container font-label-md text-label-md font-bold hover:bg-error-container/80 shadow-xs"
            >
              Reprogrammer Demi-journée
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
