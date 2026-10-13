import React, { useState } from 'react';
import { processOcrMedicalScan } from '../services/api';

export default function DoctorOcrImportView({ setView }) {
  const [loading, setLoading] = useState(false);
  const [extracted, setExtracted] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  };

  const handleScan = async () => {
    setLoading(true);
    try {
      const res = await processOcrMedicalScan();
      setExtracted(res.extracted_data);
      showToast("Extraction OCR terminée avec succès !");
    } catch (e) {
      showToast("Erreur lors de l'analyse OCR");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full bg-surface min-h-screen pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-24 right-6 z-50 p-4 rounded-xl bg-primary text-on-primary shadow-2xl flex items-center gap-3 animate-bounce max-w-md">
          <span className="material-symbols-outlined text-[24px]">document_scanner</span>
          <span className="font-label-lg text-label-lg font-bold">{toast}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 text-on-surface-variant font-label-md text-label-md mb-1">
            <button onClick={() => setView('tableau-de-bord-medecin')} className="hover:text-primary">Espace Médecin</button>
            <span>/</span>
            <span className="text-primary font-bold">Extraction OCR</span>
          </div>
          <h1 className="font-headline-xl text-headline-xl font-bold text-on-surface">Importation & Extraction OCR de Compte-Rendu</h1>
        </div>

        <button 
          onClick={() => setView('tableau-de-bord-medecin')}
          className="px-4 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high font-label-md text-label-md font-bold text-on-surface transition-colors"
        >
          Retour Dashboard
        </button>
      </div>

      <div className="space-y-6">
        
        {/* Upload Zone */}
        <div className="bg-surface-container-lowest p-8 rounded-2xl shadow-sm border-2 border-dashed border-primary/40 text-center flex flex-col items-center justify-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold">
            <span className="material-symbols-outlined text-[36px]">cloud_upload</span>
          </div>

          <div>
            <h2 className="font-headline-sm text-headline-sm font-bold text-on-surface">Déposez un compte-rendu biologique ou examen (PDF, PNG, JPG)</h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant">L'OCR MediDesk extrait automatiquement les valeurs cliniques et les mappe au dossier EMR.</p>
          </div>

          <button 
            onClick={handleScan}
            disabled={loading}
            className="px-6 py-3 rounded-xl bg-primary text-on-primary font-label-lg text-label-lg font-bold hover:bg-primary-container transition-colors shadow-sm flex items-center gap-2"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-on-primary border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <span className="material-symbols-outlined text-[20px]">document_scanner</span>
            )}
            <span>{loading ? "Analyse OCR en cours..." : "Lancer Extraction OCR Automatique"}</span>
          </button>
        </div>

        {/* Extracted Results Card */}
        {extracted && (
          <div className="bg-surface-container-lowest p-6 sm:p-8 rounded-2xl shadow-lg border border-surface-container-high space-y-6 animate-scale-in">
            <div className="flex items-center justify-between pb-3 border-b border-surface-container-low">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[24px]">task_alt</span>
                <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">Données Extraintes & Structurées</h3>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-primary-fixed text-primary font-label-sm text-label-sm font-bold">
                Mappé : {extracted.patient_name}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              <div className="p-4 rounded-xl bg-surface-container-low border border-surface-container-high">
                <span className="font-label-sm text-label-sm text-on-surface-variant font-bold block">Glycémie à jeun</span>
                <span className="font-headline-sm text-headline-sm font-bold text-primary">{extracted.metrics.glycemie_jeun}</span>
              </div>
              <div className="p-4 rounded-xl bg-surface-container-low border border-surface-container-high">
                <span className="font-label-sm text-label-sm text-on-surface-variant font-bold block">HbA1c Diabète</span>
                <span className="font-headline-sm text-headline-sm font-bold text-on-surface">{extracted.metrics.hba1c}</span>
              </div>
              <div className="p-4 rounded-xl bg-surface-container-low border border-surface-container-high">
                <span className="font-label-sm text-label-sm text-on-surface-variant font-bold block">INR / Anticoagulation</span>
                <span className="font-headline-sm text-headline-sm font-bold text-primary">{extracted.metrics.inr}</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-surface-container-low border border-surface-container-high">
              <span className="font-label-sm text-label-sm text-on-surface-variant font-bold block mb-1">Conclusion OCR Extraite :</span>
              <p className="font-body-sm text-body-sm text-on-surface italic">{extracted.conclusion}</p>
            </div>

            <div className="pt-3 border-t border-surface-container-low flex justify-end gap-3">
              <button 
                onClick={() => { showToast("Données validées et fusionnées avec le dossier EMR !"); setView('dossier-medical-complet'); }}
                className="px-6 py-3 rounded-xl bg-primary text-on-primary font-label-lg text-label-lg font-bold hover:bg-primary-container transition-colors shadow-sm"
              >
                Valider & Intégrer au Dossier Patient
              </button>
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
