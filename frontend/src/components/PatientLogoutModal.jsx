import React from 'react';

export default function PatientLogoutModal({ isOpen, onClose, onConfirm }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-inverse-surface/60 backdrop-blur-sm transition-opacity">
      <div className="relative w-full max-w-md bg-surface-container-lowest rounded-2xl shadow-2xl p-6 sm:p-8 flex flex-col items-center text-center border border-surface-container-high">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors"
        >
          <span className="material-symbols-outlined text-[20px]">close</span>
        </button>

        {/* Icon Badge */}
        <div className="w-14 h-14 rounded-full bg-surface-container-high text-on-surface-variant flex items-center justify-center mb-4 shadow-xs">
          <span className="material-symbols-outlined text-[26px]">logout</span>
        </div>

        {/* Headline */}
        <h2 className="font-headline-md text-headline-md text-on-surface font-bold">
          Êtes-vous sûr de vouloir vous déconnecter ?
        </h2>
        <span className="text-xs text-on-surface-variant mt-0.5">Are you sure you want to log out?</span>

        {/* Session Pill */}
        <div className="my-4 px-4 py-1.5 bg-surface-container-low rounded-full flex items-center gap-2 text-on-surface text-xs font-medium">
          <span className="w-2 h-2 rounded-full bg-primary"></span>
          <span>Session active : <strong>Yasmine Ben Amor</strong> (#TN-8831)</span>
        </div>

        {/* Description */}
        <p className="text-xs text-on-surface-variant leading-relaxed mb-6">
          Pour protéger la confidentialité de vos données médicales et de vos ordonnances (normes INPDP &amp; HDS), assurez-vous de fermer votre session sur équipement partagé.
        </p>

        {/* Buttons */}
        <div className="w-full flex flex-col-reverse sm:flex-row items-center gap-3">
          <button
            onClick={onClose}
            className="w-full sm:flex-1 h-11 px-4 rounded-xl bg-surface-container text-on-surface font-bold text-xs hover:bg-surface-container-high transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={onConfirm}
            className="w-full sm:flex-1 h-11 px-4 rounded-xl bg-red-600 text-white font-bold text-xs hover:bg-red-700 transition-colors flex items-center justify-center gap-2 shadow-sm"
          >
            <span className="material-symbols-outlined text-[18px]">logout</span>
            <span>Se déconnecter</span>
          </button>
        </div>

      </div>
    </div>
  );
}
