import React, { useState } from 'react';

export default function DoctorPatientRecordView({ setView }) {
  const [tab, setTab] = useState('history');
  const [toast, setToast] = useState(null);

  const patient = {
    name: "Mohamed Hédi Guediche",
    cin: "04892144",
    age: "58 ans",
    gender: "Homme",
    phone: "+216 98 420 112",
    blood: "O+",
    allergies: "Allergie Pénicilline (Bêta-lactamines)",
    cnam: "APC Validée (Filière Privée)",
    address: "Avenue Hédi Nouira, Ennasr 2, Tunis"
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  };

  return (
    <div className="w-full bg-surface min-h-screen pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
      
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-24 right-6 z-50 p-4 rounded-xl bg-primary text-on-primary shadow-2xl flex items-center gap-3 animate-bounce max-w-md">
          <span className="material-symbols-outlined text-[24px]">folder</span>
          <span className="font-label-lg text-label-lg font-bold">{toast}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 text-on-surface-variant font-label-md text-label-md mb-1">
            <button onClick={() => setView('tableau-de-bord-medecin')} className="hover:text-primary">Espace Médecin</button>
            <span>/</span>
            <span className="text-primary font-bold">Dossier EMR</span>
          </div>
          <h1 className="font-headline-xl text-headline-xl font-bold text-on-surface">Dossier Médical Patient Complet</h1>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => setView('tableau-de-bord-medecin')}
            className="px-4 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high font-label-md text-label-md font-bold text-on-surface transition-colors"
          >
            Retour Dashboard
          </button>
          <button 
            onClick={() => setView('redaction-ordonnance')}
            className="px-4 py-2 rounded-xl bg-primary text-on-primary font-label-md text-label-md font-bold hover:bg-primary-container transition-colors shadow-xs flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[18px]">prescriptions</span>
            <span>Rédiger Ordonnance</span>
          </button>
        </div>
      </div>

      {/* Patient Header Card */}
      <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm border border-surface-container-high mb-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-primary text-on-primary flex items-center justify-center font-bold text-2xl shadow-sm">
              MH
            </div>
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h2 className="font-headline-md text-headline-md font-bold text-on-surface">{patient.name}</h2>
                <span className="px-2.5 py-0.5 rounded-full bg-primary-fixed text-primary font-label-sm text-label-sm font-bold">
                  {patient.age} • Groupe {patient.blood}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant font-label-sm text-label-sm font-semibold">
                  CIN: {patient.cin}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-on-surface-variant font-body-sm text-body-sm mt-2">
                <span>{patient.phone}</span>
                <span>•</span>
                <span>{patient.address}</span>
              </div>

              {/* Allergy Warning Badge */}
              <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-error-container/40 border border-error-container text-error font-label-sm text-label-sm font-bold">
                <span className="material-symbols-outlined text-[18px]">warning</span>
                <span>ALERTE ALLERGIE : {patient.allergies}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2 shrink-0">
            <button 
              onClick={() => setView('generateur-certificats')}
              className="px-4 py-2 rounded-xl bg-surface-container-high hover:bg-surface-container text-on-surface font-label-md text-label-md font-bold transition-colors flex items-center gap-1.5 justify-center"
            >
              <span className="material-symbols-outlined text-[18px]">article</span>
              <span>Générer Certificat</span>
            </button>
            <button 
              onClick={() => showToast("Exportation du dossier EMR en PDF sécurisé...")}
              className="px-4 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-primary font-label-md text-label-md font-bold transition-colors flex items-center gap-1.5 justify-center"
            >
              <span className="material-symbols-outlined text-[18px]">download</span>
              <span>Exporter EMR PDF</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center bg-surface-container-low p-1.5 rounded-2xl mb-6 border border-surface-container-high overflow-x-auto">
        <button
          onClick={() => setTab('history')}
          className={`flex-1 min-w-[140px] py-2.5 px-4 rounded-xl font-label-md text-label-md font-bold transition-all text-center ${
            tab === 'history' ? 'bg-surface-container-lowest text-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'
          }`}
        >
          Chronologie Consultations
        </button>
        <button
          onClick={() => setTab('lab')}
          className={`flex-1 min-w-[140px] py-2.5 px-4 rounded-xl font-label-md text-label-md font-bold transition-all text-center ${
            tab === 'lab' ? 'bg-surface-container-lowest text-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'
          }`}
        >
          Bilans Biologiques
        </button>
        <button
          onClick={() => setTab('prescriptions')}
          className={`flex-1 min-w-[140px] py-2.5 px-4 rounded-xl font-label-md text-label-md font-bold transition-all text-center ${
            tab === 'prescriptions' ? 'bg-surface-container-lowest text-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'
          }`}
        >
          Traitements & Ordonnances
        </button>
      </div>

      {/* Tab Panels */}
      <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm border border-surface-container-high">
        
        {tab === 'history' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">Historique Chronologique EMR</h3>
              <button onClick={() => setView('consultation-examen')} className="px-3.5 py-1.5 rounded-lg bg-primary text-on-primary font-label-md text-label-md font-bold shadow-xs">
                + Nouvelle Saisie
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-5 rounded-2xl bg-surface-container-low border border-surface-container-high space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-label-sm text-label-sm font-bold text-primary">Aujourd'hui — 24 Octobre 2025 à 11:15</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary font-label-sm text-label-sm font-bold">En cours</span>
                </div>
                <h4 className="font-headline-sm text-headline-sm font-bold text-on-surface">Contrôle post-opératoire & ECG</h4>
                <p className="font-body-sm text-body-sm text-on-surface-variant">TA: 135/85 mmHg • FC: 72 BPM • SpO2: 98% • Diagnostic: I10 HTA Essentielle</p>
                <p className="font-body-sm text-body-sm text-on-surface italic">"Bruits du cœur réguliers, pas de souffle. Légère fatigue à l'effort."</p>
              </div>

              <div className="p-5 rounded-2xl bg-surface-container-low border border-surface-container-high space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-label-sm text-label-sm font-bold text-outline">15 Septembre 2025</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant font-label-sm text-label-sm font-semibold">Archivé</span>
                </div>
                <h4 className="font-headline-sm text-headline-sm font-bold text-on-surface">Échocardiographie Doppler transthoracique</h4>
                <p className="font-body-sm text-body-sm text-on-surface-variant">FEVG: 62% • Dilatation modérée de l'oreillette gauche. Pression artérielle pulmonaire normale.</p>
              </div>
            </div>
          </div>
        )}

        {tab === 'lab' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">Résultats de Laboratoire Extaits</h3>
              <button onClick={() => setView('ocr-import-medical')} className="px-3.5 py-1.5 rounded-lg bg-surface-container-high text-primary font-label-md text-label-md font-bold shadow-xs">
                Import OCR Labo
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-4 rounded-xl bg-surface-container-low border border-surface-container-high">
                <span className="font-label-sm text-label-sm text-on-surface-variant block font-bold">INR / Anticoagulation</span>
                <span className="font-headline-md text-headline-md font-bold text-primary block mt-1">2.1</span>
                <span className="font-body-sm text-body-sm text-primary font-semibold">Dans la zone cible</span>
              </div>

              <div className="p-4 rounded-xl bg-surface-container-low border border-surface-container-high">
                <span className="font-label-sm text-label-sm text-on-surface-variant block font-bold">HbA1c Diabète</span>
                <span className="font-headline-md text-headline-md font-bold text-on-surface block mt-1">6.4 %</span>
                <span className="font-body-sm text-body-sm text-on-surface-variant">Équilibré</span>
              </div>

              <div className="p-4 rounded-xl bg-surface-container-low border border-surface-container-high">
                <span className="font-label-sm text-label-sm text-on-surface-variant block font-bold">Créatinine Sérique</span>
                <span className="font-headline-md text-headline-md font-bold text-on-surface block mt-1">82 µmol/L</span>
                <span className="font-body-sm text-body-sm text-on-surface-variant">Clairance 95 ml/min</span>
              </div>
            </div>
          </div>
        )}

        {tab === 'prescriptions' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">Traitements Actuellement Prescrits</h3>
              <button onClick={() => setView('redaction-ordonnance')} className="px-3.5 py-1.5 rounded-lg bg-primary text-on-primary font-label-md text-label-md font-bold shadow-xs">
                Rédiger Nouvelle Ordonnance
              </button>
            </div>

            <div className="divide-y divide-surface-container-low border border-surface-container-high rounded-xl overflow-hidden">
              <div className="p-4 bg-surface-container-lowest flex items-center justify-between">
                <div>
                  <h4 className="font-headline-sm text-headline-sm font-bold text-on-surface">Amlodipine 5mg</h4>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">1 comprimé le matin • Durée : 30 jours</p>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-primary-fixed text-primary font-label-sm text-label-sm font-bold">Actif</span>
              </div>

              <div className="p-4 bg-surface-container-lowest flex items-center justify-between">
                <div>
                  <h4 className="font-headline-sm text-headline-sm font-bold text-on-surface">Aspegic 100mg</h4>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">1 sachet à midi au cours du repas • Durée : 30 jours</p>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-primary-fixed text-primary font-label-sm text-label-sm font-bold">Actif</span>
              </div>
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
