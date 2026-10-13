import React, { useState } from 'react';

export default function SecretariatPatientFileView({ setView }) {
  const [activeTab, setActiveTab] = useState('consultations');
  const [toast, setToast] = useState(null);

  const patient = {
    name: "Yasmine Ben Amor",
    cin: "06214589",
    fileNo: "#8902",
    age: "42 ans",
    gender: "Femme",
    phone: "+216 98 420 811",
    email: "yasmine.benamor@gmail.com",
    address: "Résidence Alyssa, Les Berges du Lac 2, Tunis",
    cnamStatus: "Filière Privée (Prise en charge active)",
    cnamNo: "18942055/02",
    doctorReferrent: "Dr. Ridha Sellami",
    lastVisit: "24 Octobre 2024 (Aujourd'hui)"
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
          <span className="material-symbols-outlined text-[24px]">check_circle</span>
          <span className="font-label-lg text-label-lg font-bold">{toast}</span>
        </div>
      )}

      {/* Top Header Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 text-on-surface-variant font-label-md text-label-md mb-1">
            <button onClick={() => setView('tableau-de-bord')} className="hover:text-primary">Secrétariat</button>
            <span>/</span>
            <span className="text-primary font-bold">Dossier Patient</span>
          </div>
          <h1 className="font-headline-xl text-headline-xl font-bold text-on-surface">Vue Secrétariat • Dossier Medical Patient</h1>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => setView('tableau-de-bord')}
            className="px-4 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high font-label-md text-label-md font-bold text-on-surface transition-colors"
          >
            Retour Dashboard
          </button>

          <button 
            onClick={() => setView('encaissement-facturation')}
            className="px-4 py-2 rounded-xl bg-secondary text-on-secondary font-label-md text-label-md font-bold hover:bg-secondary/90 transition-colors shadow-sm flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[18px]">payments</span>
            <span>Facturer Consultation</span>
          </button>
        </div>
      </div>

      {/* Patient Summary Header Card */}
      <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm border border-surface-container-high mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-primary text-on-primary flex items-center justify-center font-bold text-2xl shadow-sm shrink-0">
              YB
            </div>
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h2 className="font-headline-md text-headline-md font-bold text-on-surface">{patient.name}</h2>
                <span className="px-2.5 py-0.5 rounded-full bg-primary-fixed text-primary font-label-sm text-label-sm font-bold">
                  {patient.fileNo}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant font-label-sm text-label-sm font-semibold">
                  CIN: {patient.cin}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-on-surface-variant font-body-sm text-body-sm mt-2">
                <span>{patient.age} • {patient.gender}</span>
                <span>•</span>
                <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[16px] text-primary">phone</span> {patient.phone}</span>
                <span>•</span>
                <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[16px] text-primary">location_on</span> {patient.address}</span>
              </div>

              <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-surface-container-low border border-surface-container-high font-label-sm text-label-sm font-bold text-primary">
                <span className="material-symbols-outlined text-[18px]">verified</span>
                <span>CNAM: {patient.cnamStatus} ({patient.cnamNo})</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2 shrink-0">
            <button 
              onClick={() => showToast("Attestation de présence imprimée avec succès !")}
              className="px-4 py-2 rounded-xl bg-surface-container-high hover:bg-surface-container text-on-surface font-label-md text-label-md font-bold transition-colors flex items-center gap-1.5 justify-center"
            >
              <span className="material-symbols-outlined text-[18px]">print</span>
              <span>Attestation de Présence</span>
            </button>
            <button 
              onClick={() => setView('planning-rendez-vous')}
              className="px-4 py-2 rounded-xl bg-primary text-on-primary font-label-md text-label-md font-bold hover:bg-primary-container transition-colors flex items-center gap-1.5 justify-center shadow-xs"
            >
              <span className="material-symbols-outlined text-[18px]">calendar_add_on</span>
              <span>Programmer RDV</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex items-center bg-surface-container-low p-1.5 rounded-2xl mb-6 border border-surface-container-high overflow-x-auto">
        <button
          onClick={() => setActiveTab('consultations')}
          className={`flex-1 min-w-[140px] py-2.5 px-4 rounded-xl font-label-md text-label-md font-bold transition-all text-center ${
            activeTab === 'consultations' ? 'bg-surface-container-lowest text-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'
          }`}
        >
          Historique RDV & Actes
        </button>
        <button
          onClick={() => setActiveTab('billing')}
          className={`flex-1 min-w-[140px] py-2.5 px-4 rounded-xl font-label-md text-label-md font-bold transition-all text-center ${
            activeTab === 'billing' ? 'bg-surface-container-lowest text-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'
          }`}
        >
          Quittances & Encaissements
        </button>
        <button
          onClick={() => setActiveTab('cnam')}
          className={`flex-1 min-w-[140px] py-2.5 px-4 rounded-xl font-label-md text-label-md font-bold transition-all text-center ${
            activeTab === 'cnam' ? 'bg-surface-container-lowest text-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'
          }`}
        >
          Dossiers & APC CNAM
        </button>
        <button
          onClick={() => setActiveTab('notes')}
          className={`flex-1 min-w-[140px] py-2.5 px-4 rounded-xl font-label-md text-label-md font-bold transition-all text-center ${
            activeTab === 'notes' ? 'bg-surface-container-lowest text-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'
          }`}
        >
          Notes Secrétariat
        </button>
      </div>

      {/* Tab Content Panels */}
      <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm border border-surface-container-high">
        
        {activeTab === 'consultations' && (
          <div className="space-y-4">
            <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">Historique des Visites au Cabinet</h3>
            
            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-surface-container-low border border-surface-container-high flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="font-label-sm text-label-sm text-primary font-bold">Aujourd'hui — 24 Octobre 2024 à 10:30</span>
                  <h4 className="font-headline-sm text-headline-sm font-bold text-on-surface">Échocardiographie Doppler & Suivi HTA</h4>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">Praticien : Dr. Karim Ben Mahmoud • Statut : En cours</p>
                </div>
                <span className="px-3 py-1 rounded-full bg-primary text-on-primary font-label-sm text-label-sm font-bold w-fit">En consultation</span>
              </div>

              <div className="p-4 rounded-xl bg-surface-container-low border border-surface-container-high flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="font-label-sm text-label-sm text-outline font-bold">12 Septembre 2024</span>
                  <h4 className="font-headline-sm text-headline-sm font-bold text-on-surface">Consultation Spécialisée & ECG 12 dérivations</h4>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">Praticien : Dr. Karim Ben Mahmoud • Statut : Effectué</p>
                </div>
                <span className="px-3 py-1 rounded-full bg-surface-container-high text-on-surface-variant font-label-sm text-label-sm font-bold w-fit">Terminé (Honoraires réglés)</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'billing' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">Quittances & Reçus de Règlement</h3>
              <button 
                onClick={() => setView('encaissement-facturation')}
                className="px-3.5 py-1.5 rounded-lg bg-primary text-on-primary font-label-md text-label-md font-bold shadow-xs"
              >
                + Nouvelle Quittance
              </button>
            </div>

            <div className="divide-y divide-surface-container-low border border-surface-container-high rounded-xl overflow-hidden">
              <div className="p-4 bg-surface-container-lowest flex items-center justify-between">
                <div>
                  <span className="font-mono font-bold text-primary text-sm">Quittance N° Q-2024-8893</span>
                  <p className="font-body-sm text-body-sm text-on-surface">Échocardiographie Doppler — 120 TND (Chèque)</p>
                  <span className="font-label-sm text-label-sm text-on-surface-variant">Payé le 24/10/2024</span>
                </div>
                <button 
                  onClick={() => showToast("Quittance Q-2024-8893 réimprimée !")}
                  className="px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high font-label-sm text-label-sm font-bold text-on-surface"
                >
                  Imprimer Reçu
                </button>
              </div>

              <div className="p-4 bg-surface-container-lowest flex items-center justify-between">
                <div>
                  <span className="font-mono font-bold text-primary text-sm">Quittance N° Q-2024-7712</span>
                  <p className="font-body-sm text-body-sm text-on-surface">Consultation + ECG — 70 TND (Espèces)</p>
                  <span className="font-label-sm text-label-sm text-on-surface-variant">Payé le 12/09/2024</span>
                </div>
                <button 
                  onClick={() => showToast("Quittance Q-2024-7712 réimprimée !")}
                  className="px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high font-label-sm text-label-sm font-bold text-on-surface"
                >
                  Imprimer Reçu
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'cnam' && (
          <div className="space-y-4">
            <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">Dossier CNAM & Prises en Charge AP</h3>
            <div className="p-4 rounded-xl bg-surface-container-low border border-surface-container-high flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="px-2 py-0.5 rounded bg-primary/10 text-primary font-label-sm text-label-sm font-bold">APC - Prise en charge Accordée</span>
                <h4 className="font-headline-sm text-headline-sm font-bold text-on-surface mt-1">Échocardiographie & Explorations Cardiologiques</h4>
                <p className="font-body-sm text-body-sm text-on-surface-variant">N° Accord CNAM : APC-2024-9910 • Valable jusqu'au 31/12/2024</p>
              </div>
              <button 
                onClick={() => showToast("Document Bordereau CNAM téléchargé !")}
                className="px-4 py-2 rounded-lg bg-primary-container text-on-primary font-label-md text-label-md font-bold shadow-xs"
              >
                Télécharger Accord PDF
              </button>
            </div>
          </div>
        )}

        {activeTab === 'notes' && (
          <div className="space-y-4">
            <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">Notes d'Accueil Secrétariat</h3>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Notes internes secrétariat (ex: préférences horaire, rappels de paiement, accompagnants).
            </p>
            <div className="p-4 rounded-xl bg-surface-container-low border border-surface-container-high">
              <p className="font-body-md text-body-md text-on-surface italic">
                "Patiente ponctuelle. Préfère les rendez-vous en milieu de matinée. Assurée CNAM filière privée active sans retard de paiement."
              </p>
              <span className="font-label-sm text-label-sm text-outline font-bold mt-2 block">— Amel Trabelsi (Secrétariat Central)</span>
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
