import React, { useState } from 'react';
import { saveDoctorConsultation } from '../services/api';

export default function DoctorConsultationEntryView({ setView }) {
  const [formData, setFormData] = useState({
    patient_name: "Mohamed Hédi Guediche",
    cin: "04892144",
    motive: "Contrôle post-opératoire & ECG",
    ta: "135/85",
    bpm: "72",
    spo2: "98",
    temp: "36.8",
    weight: "82",
    height: "175",
    auscultation: "Bruits du cœur réguliers, pas de souffle. Poumons libres.",
    symptoms: "Légère fatigue à l'effort, pas de douleur thoracique.",
    icd10: "I10 - Hypertension Artérielle Essentielle",
    acts: "Consultation Spécialisée, Électrocardiogramme (ECG)"
  });

  const [toast, setToast] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  };

  const handleSubmit = async (e, nextAction) => {
    e?.preventDefault();
    try {
      const res = await saveDoctorConsultation(formData);
      showToast(res.message);
      setTimeout(() => {
        if (nextAction === 'prescription') {
          setView('redaction-ordonnance');
        } else {
          setView('dossier-medical-complet');
        }
      }, 1000);
    } catch (err) {
      showToast("Erreur d'enregistrement de la consultation");
    }
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

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 text-on-surface-variant font-label-md text-label-md mb-1">
            <button onClick={() => setView('tableau-de-bord-medecin')} className="hover:text-primary">Espace Médecin</button>
            <span>/</span>
            <span className="text-primary font-bold">Examen Clinique</span>
          </div>
          <h1 className="font-headline-xl text-headline-xl font-bold text-on-surface">Saisie de Consultation & Examen Clinique</h1>
        </div>

        <button 
          onClick={() => setView('tableau-de-bord-medecin')}
          className="px-4 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high font-label-md text-label-md font-bold text-on-surface transition-colors"
        >
          Annuler & Retour
        </button>
      </div>

      {/* Patient Banner */}
      <div className="bg-surface-container-lowest p-5 rounded-2xl shadow-sm border border-surface-container-high mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-primary text-on-primary flex items-center justify-center font-bold text-xl">
            MH
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="font-headline-sm text-headline-sm font-bold text-on-surface">{formData.patient_name}</h2>
              <span className="px-2.5 py-0.5 rounded-full bg-primary-fixed text-primary font-label-sm text-label-sm font-bold">
                58 ans • Homme
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant font-label-sm text-label-sm font-semibold">
                CIN: {formData.cin}
              </span>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
              Antécédents : HTA sévère, Diabète T2 • CNAM Filière Privée (Prise en charge active)
            </p>
          </div>
        </div>

        <button 
          onClick={() => setView('dossier-medical-complet')}
          className="px-4 py-2 rounded-xl bg-surface-container-high hover:bg-surface-container text-primary font-label-md text-label-md font-bold transition-colors"
        >
          Ouvrir Dossier EMR →
        </button>
      </div>

      {/* Main Form Card */}
      <form onSubmit={(e) => handleSubmit(e, 'dossier')} className="bg-surface-container-lowest p-6 sm:p-8 rounded-2xl shadow-lg border border-surface-container-high space-y-8">
        
        {/* Section 1: Motifs */}
        <div className="space-y-4">
          <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface border-b pb-2 border-surface-container-low">1. Motif de Consultation & Symptômes Déclarés</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-label-md text-label-md font-bold text-on-surface mb-1">Motif Principal</label>
              <input 
                type="text" 
                name="motive" 
                value={formData.motive} 
                onChange={handleChange}
                className="w-full h-11 px-4 rounded-xl bg-surface-container-low border border-outline-variant/60 font-body-md text-on-surface focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-label-md text-label-md font-bold text-on-surface mb-1">Symptômes & Histoire de la Maladie</label>
              <input 
                type="text" 
                name="symptoms" 
                value={formData.symptoms} 
                onChange={handleChange}
                className="w-full h-11 px-4 rounded-xl bg-surface-container-low border border-outline-variant/60 font-body-md text-on-surface focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Constantes & Biométrie */}
        <div className="space-y-4">
          <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface border-b pb-2 border-surface-container-low">2. Constantes Vitales & Biométrie</h3>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            <div>
              <label className="block font-label-sm text-label-sm font-bold text-on-surface mb-1">TA (mmHg)</label>
              <input 
                type="text" 
                name="ta" 
                value={formData.ta} 
                onChange={handleChange}
                className="w-full h-10 px-3 rounded-xl bg-surface-container-low border border-outline-variant/60 font-mono text-center font-bold text-on-surface focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-label-sm text-label-sm font-bold text-on-surface mb-1">FC (BPM)</label>
              <input 
                type="number" 
                name="bpm" 
                value={formData.bpm} 
                onChange={handleChange}
                className="w-full h-10 px-3 rounded-xl bg-surface-container-low border border-outline-variant/60 font-mono text-center font-bold text-on-surface focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-label-sm text-label-sm font-bold text-on-surface mb-1">SpO2 (%)</label>
              <input 
                type="number" 
                name="spo2" 
                value={formData.spo2} 
                onChange={handleChange}
                className="w-full h-10 px-3 rounded-xl bg-surface-container-low border border-outline-variant/60 font-mono text-center font-bold text-on-surface focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-label-sm text-label-sm font-bold text-on-surface mb-1">Temp (°C)</label>
              <input 
                type="text" 
                name="temp" 
                value={formData.temp} 
                onChange={handleChange}
                className="w-full h-10 px-3 rounded-xl bg-surface-container-low border border-outline-variant/60 font-mono text-center font-bold text-on-surface focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-label-sm text-label-sm font-bold text-on-surface mb-1">Poids (kg)</label>
              <input 
                type="number" 
                name="weight" 
                value={formData.weight} 
                onChange={handleChange}
                className="w-full h-10 px-3 rounded-xl bg-surface-container-low border border-outline-variant/60 font-mono text-center font-bold text-on-surface focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-label-sm text-label-sm font-bold text-on-surface mb-1">Taille (cm)</label>
              <input 
                type="number" 
                name="height" 
                value={formData.height} 
                onChange={handleChange}
                className="w-full h-10 px-3 rounded-xl bg-surface-container-low border border-outline-variant/60 font-mono text-center font-bold text-on-surface focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Auscultation & Exam Result */}
        <div className="space-y-4">
          <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface border-b pb-2 border-surface-container-low">3. Examen Clinique & Auscultation</h3>
          <div>
            <textarea 
              rows="3"
              name="auscultation" 
              value={formData.auscultation} 
              onChange={handleChange}
              className="w-full p-4 rounded-xl bg-surface-container-low border border-outline-variant/60 font-body-sm text-on-surface focus:ring-2 focus:ring-primary focus:outline-none"
            ></textarea>
          </div>
        </div>

        {/* Section 4: Diagnostic CIM-10 */}
        <div className="space-y-4">
          <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface border-b pb-2 border-surface-container-low">4. Code Diagnostic CIM-10 & Actes Réalisés</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-label-md text-label-md font-bold text-on-surface mb-1">Code CIM-10</label>
              <input 
                type="text" 
                name="icd10" 
                value={formData.icd10} 
                onChange={handleChange}
                className="w-full h-11 px-4 rounded-xl bg-surface-container-low border border-outline-variant/60 font-body-md text-on-surface focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-label-md text-label-md font-bold text-on-surface mb-1">Actes Cliniques</label>
              <input 
                type="text" 
                name="acts" 
                value={formData.acts} 
                onChange={handleChange}
                className="w-full h-11 px-4 rounded-xl bg-surface-container-low border border-outline-variant/60 font-body-md text-on-surface focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Submit Actions Bar */}
        <div className="pt-4 border-t border-surface-container-low flex flex-col sm:flex-row items-center justify-end gap-3">
          <button 
            type="button"
            onClick={(e) => handleSubmit(e, 'dossier')}
            className="w-full sm:w-auto px-5 py-3 rounded-xl bg-surface-container-high hover:bg-surface-container font-label-lg text-label-lg font-bold text-on-surface transition-colors"
          >
            Enregistrer Fiche Consultation
          </button>

          <button 
            type="button"
            onClick={(e) => handleSubmit(e, 'prescription')}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-primary text-on-primary font-label-lg text-label-lg font-bold hover:bg-primary-container transition-colors shadow-sm flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-[20px]">prescriptions</span>
            <span>Enregistrer & Rédiger Ordonnance</span>
          </button>
        </div>

      </form>

    </div>
  );
}
