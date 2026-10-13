import React, { useState } from 'react';

export default function SecretariatSecurityView({ setView }) {
  const [pin, setPin] = useState('4421');
  const [toast, setToast] = useState(null);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  };

  return (
    <div className="w-full bg-surface min-h-screen pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-6">
      
      {/* Toast */}
      {toast && (
        <div className="fixed top-24 right-6 z-50 p-4 rounded-xl bg-primary text-on-primary shadow-2xl flex items-center gap-3 animate-bounce max-w-md">
          <span className="material-symbols-outlined text-[24px]">shield</span>
          <span className="font-label-lg text-label-lg font-bold">{toast}</span>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <span className="font-label-md text-label-md font-bold text-primary">Sécurité Secrétariat</span>
          <h1 className="font-headline-xl text-headline-xl font-bold text-on-surface">Paramètres & Sécurité Compte Secrétariat</h1>
        </div>
        <button onClick={() => setView('tableau-de-bord')} className="px-4 py-2 rounded-xl bg-surface-container font-bold text-on-surface">
          Retour Dashboard
        </button>
      </div>

      <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm border border-surface-container-high space-y-6">
        <div className="space-y-3 border-b pb-4 border-surface-container-low">
          <h2 className="font-headline-sm text-headline-sm font-bold text-on-surface">1. Profil Utilisateur Secrétariat</h2>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-label-sm text-label-sm font-bold text-on-surface mb-1">Nom Secrétaire</label>
              <input type="text" defaultValue="Amel Trabelsi" className="w-full h-11 px-4 rounded-xl bg-surface-container-low border border-outline-variant/60 font-body-md text-on-surface" />
            </div>
            <div>
              <label className="block font-label-sm text-label-sm font-bold text-on-surface mb-1">Rôle & Entité</label>
              <input type="text" defaultValue="Secrétariat Principal — Clinique Alyssa" disabled className="w-full h-11 px-4 rounded-xl bg-surface-container-high border border-outline-variant/60 font-body-md text-on-surface" />
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <h2 className="font-headline-sm text-headline-sm font-bold text-on-surface">2. Code PIN d'Accès Rapide Pos/Caisse</h2>
          <div className="max-w-xs">
            <input 
              type="password" 
              maxLength="4"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              className="w-full h-11 px-4 rounded-xl bg-surface-container-low border border-outline-variant/60 font-mono text-center font-bold text-lg text-on-surface"
            />
          </div>
          <button onClick={() => showToast("Code PIN Secrétariat mis à jour avec succès !")} className="px-5 py-2.5 rounded-xl bg-primary text-on-primary font-bold shadow-xs">
            Sauvegarder Sécurité PIN
          </button>
        </div>
      </div>

    </div>
  );
}
