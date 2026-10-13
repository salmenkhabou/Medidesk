import React, { useState } from 'react';
import { generateMedicalCertificate } from '../services/api';

export default function DoctorMedicalCertificatesView({ setView }) {
  const [certType, setCertType] = useState('repos');
  const [patientName, setPatientName] = useState('Mohamed Hédi Guediche');
  const [cin, setCin] = useState('04892144');
  const [days, setDays] = useState(3);
  const [notes, setNotes] = useState("Problème cardiaque sous observation, arrêt de travail prescrit.");
  const [toast, setToast] = useState(null);
  const [generatedCert, setGeneratedCert] = useState(null);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  };

  const handleGenerate = async (e) => {
    e?.preventDefault();
    try {
      const res = await generateMedicalCertificate({
        patient_name: patientName,
        cin,
        type: certType === 'repos' ? 'Certificat de Repos Médical' : 'Certificat d\'Aptitude Sportive',
        duration_days: days,
        doctor: "Dr. Karim Ben Mahmoud"
      });
      setGeneratedCert(res.certificate);
      showToast(res.message);
    } catch (err) {
      showToast("Erreur de génération du certificat");
    }
  };

  return (
    <div className="w-full bg-surface min-h-screen pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
      
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-24 right-6 z-50 p-4 rounded-xl bg-primary text-on-primary shadow-2xl flex items-center gap-3 animate-bounce max-w-md">
          <span className="material-symbols-outlined text-[24px]">article</span>
          <span className="font-label-lg text-label-lg font-bold">{toast}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 text-on-surface-variant font-label-md text-label-md mb-1">
            <button onClick={() => setView('tableau-de-bord-medecin')} className="hover:text-primary">Espace Médecin</button>
            <span>/</span>
            <span className="text-primary font-bold">Générateur Certificats</span>
          </div>
          <h1 className="font-headline-xl text-headline-xl font-bold text-on-surface">Générateur de Documents Médicaux & Certificats</h1>
        </div>

        <button 
          onClick={() => setView('tableau-de-bord-medecin')}
          className="px-4 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high font-label-md text-label-md font-bold text-on-surface transition-colors"
        >
          Retour Dashboard
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Form (7 cols) */}
        <div className="lg:col-span-7 bg-surface-container-lowest p-6 rounded-2xl shadow-sm border border-surface-container-high space-y-6">
          <form onSubmit={handleGenerate} className="space-y-4">
            <h2 className="font-headline-sm text-headline-sm font-bold text-on-surface border-b pb-2 border-surface-container-low">Type de Document & Patient</h2>

            <div>
              <label className="block font-label-md text-label-md font-bold text-on-surface mb-1">Sélectionner Modèle de Certificat</label>
              <select 
                value={certType} 
                onChange={(e) => setCertType(e.target.value)}
                className="w-full h-11 px-4 rounded-xl bg-surface-container-low border border-outline-variant/60 font-body-md text-on-surface focus:ring-2 focus:ring-primary focus:outline-none"
              >
                <option value="repos">Certificat de Repos Médical (Arrêt de Travail)</option>
                <option value="aptitude">Certificat d'Aptitude Physique & Sportive</option>
                <option value="presence">Attestation de Présence Consultation</option>
                <option value="orientation">Lettre d'Orientation Confrère / Avis Spécialisé</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-label-md text-label-md font-bold text-on-surface mb-1">Nom du Patient</label>
                <input 
                  type="text" 
                  value={patientName} 
                  onChange={(e) => setPatientName(e.target.value)}
                  className="w-full h-11 px-4 rounded-xl bg-surface-container-low border border-outline-variant/60 font-body-md text-on-surface focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-label-md text-label-md font-bold text-on-surface mb-1">CIN (8 chiffres)</label>
                <input 
                  type="text" 
                  value={cin} 
                  onChange={(e) => setCin(e.target.value)}
                  className="w-full h-11 px-4 rounded-xl bg-surface-container-low border border-outline-variant/60 font-mono text-body-md text-on-surface focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>
            </div>

            {certType === 'repos' && (
              <div>
                <label className="block font-label-md text-label-md font-bold text-on-surface mb-1">Durée du Repos (Jours)</label>
                <input 
                  type="number" 
                  value={days} 
                  onChange={(e) => setDays(Number(e.target.value))}
                  className="w-full h-11 px-4 rounded-xl bg-surface-container-low border border-outline-variant/60 font-body-md text-on-surface focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>
            )}

            <div>
              <label className="block font-label-md text-label-md font-bold text-on-surface mb-1">Observations / Motif Médical</label>
              <textarea 
                rows="3" 
                value={notes} 
                onChange={(e) => setNotes(e.target.value)}
                className="w-full p-3 rounded-xl bg-surface-container-low border border-outline-variant/60 font-body-sm text-on-surface focus:ring-2 focus:ring-primary focus:outline-none"
              ></textarea>
            </div>

            <button 
              type="submit" 
              className="w-full py-3.5 rounded-xl bg-primary text-on-primary font-label-lg text-label-lg font-bold hover:bg-primary-container transition-colors shadow-sm flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-[20px]">verified</span>
              <span>Générer & Signer le Certificat</span>
            </button>
          </form>
        </div>

        {/* Right Preview Card (5 cols) */}
        <div className="lg:col-span-5 bg-surface-container-lowest p-6 rounded-2xl shadow-lg border border-surface-container-high flex flex-col justify-between space-y-6">
          <div>
            <div className="text-center pb-4 border-b border-surface-container-low space-y-1">
              <span className="font-headline-sm text-headline-sm font-bold text-primary tracking-tight">RÉPUBLIQUE TUNISIENNE</span>
              <span className="font-label-sm text-label-sm text-on-surface-variant block uppercase font-bold">Certificat Médical Officiel</span>
              <span className="font-mono text-xs text-outline">{generatedCert?.cert_no || "N° CERT-2025-9901"}</span>
            </div>

            <div className="py-4 space-y-3 font-body-sm text-body-sm leading-relaxed">
              <p className="text-on-surface">
                Je soussigné, <strong>Dr. Karim Ben Mahmoud</strong>, spécialiste en cardiologie (CNOM 18452), certifie avoir examiné ce jour le patient <strong>{patientName}</strong> (CIN: {cin}).
              </p>

              {certType === 'repos' ? (
                <p className="text-on-surface font-semibold">
                  L'état de santé du patient nécessite un arrêt de travail strict d'une durée de <strong>{days} jours</strong> à compter du {new Date().toLocaleDateString('fr-FR')}.
                </p>
              ) : (
                <p className="text-on-surface font-semibold">
                  L'examen clinique ce jour ne présente aucune contre-indication décelable à la pratique des activités physiques et sportives.
                </p>
              )}

              <p className="text-on-surface-variant italic">
                "{notes}"
              </p>
            </div>
          </div>

          <button 
            onClick={() => window.print()}
            className="w-full py-2.5 rounded-xl bg-surface-container-high hover:bg-surface-container font-label-md text-label-md font-bold text-on-surface transition-colors flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">print</span>
            <span>Imprimer Document Certifié</span>
          </button>
        </div>

      </div>

    </div>
  );
}
