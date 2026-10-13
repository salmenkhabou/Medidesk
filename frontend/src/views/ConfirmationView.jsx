import React, { useState } from 'react';
import { fetchOnboardingByCode } from '../services/api';

export default function ConfirmationView({ trackingCode, record: initialRecord, setView }) {
  const [searchCode, setSearchCode] = useState(trackingCode || 'MD-2024-8841');
  const [record, setRecord] = useState(initialRecord || {
    tracking_code: 'MD-2024-8841',
    doctor_name: 'Dr. Karim Ben Mahmoud',
    cnom_number: '18452 / CNOM',
    specialty: 'Cardiologie Médicale & Vasculaire',
    city: 'Tunis',
    clinic_name: 'Cabinet Médical Les Berges du Lac',
    plan_type: 'cloud_hds',
    document_name: 'Attestation_CNOM_2024.pdf',
    created_at: new Date().toISOString()
  });

  return (
    <div className="w-full pt-20 bg-surface flex-1">
      <div className="relative w-full overflow-hidden py-10 px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center">
        
        {/* Ambient subtle background depth shapes */}
        <div className="absolute -top-24 -left-20 w-96 h-96 rounded-full bg-primary/5 blur-3xl pointer-events-none"></div>
        <div className="absolute top-1/2 -right-24 w-96 h-96 rounded-full bg-secondary-container/10 blur-3xl pointer-events-none"></div>

        <div className="relative w-full max-w-3xl flex flex-col items-center">
          
          {/* Main Status Card */}
          <div className="w-full bg-surface-container-lowest rounded-xl shadow-[0_10px_30px_rgba(15,110,106,0.06),0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden border border-surface-container-high">
            
            {/* Top Visual Banner Section */}
            <div className="relative w-full bg-gradient-to-b from-surface-container-low to-surface-container-lowest pt-10 pb-8 px-6 sm:px-12 flex flex-col items-center text-center">
              
              {/* Verification Hourglass & Shield Graphic */}
              <div className="relative w-28 h-28 mb-6 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full bg-primary/10 animate-ping opacity-30"></div>
                <div className="relative w-24 h-24 rounded-full bg-surface-container-lowest shadow-md flex items-center justify-center border border-surface-container-high">
                  <svg className="w-14 h-14" fill="none" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="32" cy="32" r="28" stroke="#d9e3f6" strokeDasharray="4 3" strokeWidth="2.5"></circle>
                    <path d="M 32 4 A 28 28 0 0 1 60 32" stroke="#0f6e6a" strokeLinecap="round" strokeWidth="3"></path>
                    <path d="M22 18H42M22 46H42M25 18C25 28 39 26 39 36C39 46 25 44 25 46M39 18C39 28 25 26 25 36C25 46 39 44 39 46" stroke="#0f6e6a" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2"></path>
                    <path d="M28 42C28 39 36 39 36 42" fill="#fd8863" stroke="#9f4122" strokeWidth="1"></path>
                    <circle cx="32" cy="27" fill="#733c00" r="1.5"></circle>
                    <circle cx="32" cy="32" fill="#733c00" r="1.2"></circle>
                    <path d="M27 22H37L32 28L27 22Z" fill="#ffb77d" opacity="0.8"></path>
                  </svg>
                </div>
                <span className="absolute bottom-1 right-1 w-7 h-7 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center shadow-sm">
                  <span className="material-symbols-outlined text-[16px]">schedule</span>
                </span>
              </div>

              {/* Status Pill */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-tertiary-fixed text-on-tertiary-container font-label-md text-label-md mb-4 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-tertiary animate-pulse"></span>
                <span className="tracking-wide font-semibold">En attente de validation • Pending Review</span>
              </div>

              {/* Headline & Notice */}
              <h1 className="font-headline-xl text-headline-xl text-on-surface tracking-tight max-w-xl font-bold">
                Votre dossier d'adhésion est en cours d'examen
              </h1>
              <p className="font-body-md text-body-md text-on-surface-variant max-w-xl mt-3 leading-relaxed">
                Notre cellule de conformité et de déontologie médicale vérifie actuellement vos attestations auprès du Conseil National de l’Ordre des Médecins (CNOM) et les informations de votre cabinet.
              </p>

              <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 rounded-md bg-surface-container text-on-surface-variant font-label-sm text-label-sm">
                <span className="material-symbols-outlined text-[15px] text-primary">gavel</span>
                <span>Accès sécurisé bloqué jusqu’à validation définitive (Norme INPDP &amp; Sécurité Santé)</span>
              </div>

            </div>

            {/* Summary & Steps */}
            <div className="px-6 sm:px-12 py-8 space-y-8">
              
              <div className="bg-surface-container-low rounded-xl p-5 sm:p-6 border border-surface-container-high">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 gap-2 border-b border-surface-container-high">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-[20px]">assignment_turned_in</span>
                    <span className="font-headline-sm text-headline-sm text-on-surface font-bold">Récapitulatif de transmission</span>
                  </div>
                  <span className="font-label-md text-label-md text-primary font-semibold px-2.5 py-1 rounded-md bg-surface-container-lowest shadow-sm self-start sm:self-auto font-mono">
                    Réf: #{record?.tracking_code || 'MED-2024-88421'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                  <div className="space-y-1">
                    <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Praticien déclarant</p>
                    <p className="font-headline-sm text-headline-sm text-on-surface flex items-center gap-1.5 font-bold">
                      <span>{record?.doctor_name || 'Dr. Karim Ben Mahmoud'}</span>
                      <span className="material-symbols-outlined text-[16px] text-primary">verified</span>
                    </p>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">Spécialité : {record?.specialty || 'Cardiologie'}</p>
                  </div>

                  <div className="space-y-1">
                    <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Date &amp; Heure d'enregistrement</p>
                    <p className="font-body-md text-body-md font-semibold text-on-surface flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[18px] text-on-surface-variant">event</span>
                      <span>Aujourd'hui à 14:35</span>
                      <span className="font-label-sm text-label-sm text-on-surface-variant">(Heure de Tunis)</span>
                    </p>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">Délai indicatif d'instruction : 24h à 48h ouvrées</p>
                  </div>

                  <div className="space-y-1">
                    <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Offre souscrite</p>
                    <p className="font-body-md text-body-md font-semibold text-on-surface flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[18px] text-primary">cloud_done</span>
                      <span>Cabinet Numérique HDS Sécurisé</span>
                    </p>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">Certificats télé-prescription &amp; agenda inclus</p>
                  </div>

                  <div className="space-y-1">
                    <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Canaux d'activation configurés</p>
                    <p className="font-body-md text-body-md font-semibold text-on-surface flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[18px] text-primary">mark_email_read</span>
                      <span>SMS (+216 98 ••• •12) &amp; Courriel</span>
                    </p>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">Lien chiffré à usage unique envoyé à validation</p>
                  </div>
                </div>
              </div>

              {/* Timeline: Next Steps Progression */}
              <div className="space-y-4">
                <h2 className="font-headline-sm text-headline-sm text-on-surface flex items-center gap-2 font-bold">
                  <span className="material-symbols-outlined text-primary text-[20px]">linear_scale</span>
                  <span>Processus de certification en 3 étapes</span>
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="bg-surface-container-low/60 rounded-xl p-4 flex flex-col justify-between border border-surface-container-high">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant font-bold">Étape 01</span>
                      <span className="w-6 h-6 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold text-xs">✓</span>
                    </div>
                    <div>
                      <h3 className="font-label-lg text-label-lg font-semibold text-on-surface">Dossier reçu &amp; archivé</h3>
                      <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">Pièces justificatives chiffrées au coffre-fort santé.</p>
                    </div>
                    <div className="mt-3 flex items-center gap-1.5 text-primary font-label-sm text-label-sm font-semibold">
                      <span className="material-symbols-outlined text-[14px]">done_all</span>
                      <span>Complété avec succès</span>
                    </div>
                  </div>

                  <div className="bg-tertiary-fixed/30 rounded-xl p-4 flex flex-col justify-between border border-tertiary-fixed relative overflow-hidden">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-label-sm text-label-sm uppercase tracking-wider text-tertiary font-bold">Étape 02</span>
                      <span className="w-6 h-6 rounded-full bg-tertiary text-on-tertiary flex items-center justify-center font-bold text-xs animate-pulse">⏳</span>
                    </div>
                    <div>
                      <h3 className="font-label-lg text-label-lg font-semibold text-on-surface">Contrôle Déontologique</h3>
                      <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">Authentification CNOM et registre d'exercice INPDP.</p>
                    </div>
                    <div className="mt-3 flex items-center gap-1.5 text-tertiary font-label-sm text-label-sm font-semibold">
                      <span className="w-1.5 h-1.5 rounded-full bg-tertiary animate-ping"></span>
                      <span>En cours d'instruction</span>
                    </div>
                  </div>

                  <div className="bg-surface-container-low/40 rounded-xl p-4 flex flex-col justify-between opacity-85 border border-surface-container-high">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant font-bold">Étape 03</span>
                      <span className="w-6 h-6 rounded-full bg-surface-container-high text-on-surface-variant flex items-center justify-center font-bold text-xs">🔒</span>
                    </div>
                    <div>
                      <h3 className="font-label-lg text-label-lg font-semibold text-on-surface">Déploiement Sécurisé</h3>
                      <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">Génération des accès praticien et invitation secrétariat.</p>
                    </div>
                    <div className="mt-3 flex items-center gap-1.5 text-on-surface-variant font-label-sm text-label-sm">
                      <span className="material-symbols-outlined text-[14px]">lock_clock</span>
                      <span>En attente validation</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 rounded-lg bg-surface-container border border-surface-container-high">
                <span className="material-symbols-outlined text-primary text-[22px] shrink-0 mt-0.5">info</span>
                <div className="text-on-surface-variant font-body-sm text-body-sm leading-relaxed">
                  <span className="font-semibold text-on-surface">Besoin d'accélérer l'installation de votre cabinet ?</span> Si votre cabinet ouvre dans moins de 24h ou si vous assurez des gardes urgentes, vous pouvez contacter directement notre référent au <span className="font-semibold text-on-surface whitespace-nowrap">+216 71 880 900</span>.
                </div>
              </div>

            </div>

            {/* Action Footer */}
            <div className="bg-surface-container-low px-6 sm:px-12 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-surface-container-high">
              <button onClick={() => window.print()} className="flex items-center gap-2 text-on-surface-variant hover:text-primary font-label-lg text-label-lg transition-colors p-2 rounded-lg hover:bg-surface-container">
                <span className="material-symbols-outlined text-[18px]">download</span>
                <span>Télécharger l'accusé de réception (PDF)</span>
              </button>
              <button onClick={() => setView('home')} className="h-11 px-6 rounded-lg bg-surface-container-lowest text-on-surface hover:bg-surface-container-high font-label-lg text-label-lg shadow-sm transition-all text-center border border-outline-variant/40">
                Retour à l'accueil
              </button>
            </div>

          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-on-surface-variant font-label-md text-label-md text-center">
            <span className="inline-flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-primary">verified</span>
              Agrément Ordre National des Médecins
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-primary">enhanced_encryption</span>
              Conformité INPDP &amp; RGPD Santé
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-primary">headset_mic</span>
              Support Dédié : <strong className="text-on-surface font-semibold ml-0.5">+216 71 880 900</strong>
            </span>
          </div>

        </div>
      </div>
    </div>
  );
}
