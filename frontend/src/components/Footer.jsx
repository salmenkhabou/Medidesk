import React from 'react';
import { useLanguage } from '../context/LanguageContext';

export default function Footer({ setView }) {
  const { t } = useLanguage();

  return (
    <footer className="w-full bg-surface-container-lowest py-10 border-t border-surface-container-high mt-auto">
      <div className="max-w-7xl mx-auto px-margin md:px-margin-md lg:px-margin-lg flex flex-col gap-space-lg">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-gutter-md pb-space-lg border-b border-surface-container-low">
          
          <div className="flex flex-col gap-space-xs">
            <div className="flex items-center gap-space-xs text-primary-container font-bold text-xl">
              <span className="material-symbols-outlined text-[24px]">health_and_safety</span>
              <span>MediDesk</span>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Plateforme nationale de santé numérique pour médecins, cabinets et patients en Tunisie.
            </p>
          </div>

          <div className="flex flex-col gap-space-xs">
            <h4 className="font-label-lg text-label-lg font-bold text-on-surface">Patients</h4>
            <button onClick={() => setView('doctors')} className="text-left font-body-sm text-body-sm text-on-surface-variant hover:text-primary transition-colors">Rechercher un médecin</button>
            <button onClick={() => setView('queue')} className="text-left font-body-sm text-body-sm text-on-surface-variant hover:text-primary transition-colors">File d'attente en direct</button>
            <button onClick={() => setView('prescriptions')} className="text-left font-body-sm text-body-sm text-on-surface-variant hover:text-primary transition-colors">Ordonnances électroniques</button>
          </div>

          <div className="flex flex-col gap-space-xs">
            <h4 className="font-label-lg text-label-lg font-bold text-on-surface">Praticiens & Cliniques</h4>
            <button onClick={() => setView('onboarding')} className="text-left font-body-sm text-body-sm text-on-surface-variant hover:text-primary transition-colors">Adhésion & Inscription CNOM</button>
            <button onClick={() => setView('pricing')} className="text-left font-body-sm text-body-sm text-on-surface-variant hover:text-primary transition-colors">Tarifs & Forfaits Cabinet</button>
            <button onClick={() => setView('confirmation')} className="text-left font-body-sm text-body-sm text-on-surface-variant hover:text-primary transition-colors">Suivi de demande d'adhésion</button>
          </div>

          <div className="flex flex-col gap-space-xs">
            <h4 className="font-label-lg text-label-lg font-bold text-on-surface">Conformité & Contact</h4>
            <div className="flex items-center gap-2 text-body-sm text-on-surface-variant">
              <span className="material-symbols-outlined text-primary text-[18px]">verified</span>
              <span>Ordre des Médecins TN</span>
            </div>
            <div className="flex items-center gap-2 text-body-sm text-on-surface-variant">
              <span className="material-symbols-outlined text-primary text-[18px]">shield</span>
              <span>Loi INPDP n° 2004-63</span>
            </div>
            <div className="flex items-center gap-2 text-body-sm text-on-surface-variant">
              <span className="material-symbols-outlined text-primary text-[18px]">phone</span>
              <span>+216 71 880 900</span>
            </div>
          </div>

        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-space-md text-on-surface-variant font-label-sm text-label-sm">
          <p>{t('footer_copyright')}</p>
          <div className="flex items-center gap-space-md">
            <span>Tunis • Sousse • Sfax • Monastir • Bizerte • Nabeul</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
