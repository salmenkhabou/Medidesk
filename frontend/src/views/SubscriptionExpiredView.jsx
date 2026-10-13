import React from 'react';

export default function SubscriptionExpiredView({ setView }) {
  return (
    <div className="w-full bg-surface min-h-screen pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-center space-y-6">
      <div className="w-20 h-20 rounded-full bg-error-container text-error mx-auto flex items-center justify-center font-bold">
        <span className="material-symbols-outlined text-[48px]">lock_reset</span>
      </div>

      <div className="space-y-2">
        <h1 className="font-headline-xl text-headline-xl font-bold text-on-surface">Accès Suspendu — Abonnement Expiré</h1>
        <p className="font-body-md text-body-md text-on-surface-variant max-w-lg mx-auto">
          Votre abonnement MediDesk Pro est arrivé à échéance. Veuillez procéder au renouvellement pour débloquer le cabinet.
        </p>
      </div>

      <div className="flex justify-center gap-3">
        <button onClick={() => setView('abonnement-facturation-medecin')} className="px-6 py-3 rounded-xl bg-primary text-on-primary font-bold shadow-sm">
          Renouveler Mon Abonnement
        </button>
        <button onClick={() => setView('tableau-de-bord-medecin')} className="px-6 py-3 rounded-xl bg-surface-container font-bold text-on-surface">
          Accès Démo Réduit
        </button>
      </div>
    </div>
  );
}
