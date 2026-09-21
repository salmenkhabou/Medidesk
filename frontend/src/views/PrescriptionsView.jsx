import React, { useState, useEffect } from 'react';
import { fetchPrescription } from '../services/api';

export default function PrescriptionsView() {
  const [refCode, setRefCode] = useState('ORD-TN-2024-9921');
  const [prescription, setPrescription] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Stepper controls for medications list demo
  const [meds, setMeds] = useState([
    { id: 1, name: "Amlodipine 5mg", dosage: "1 comprimé le matin", duration: "30 jours", qty: 1 },
    { id: 2, name: "Aspegic 100mg", dosage: "1 sachet à midi au cours du repas", duration: "30 jours", qty: 1 }
  ]);

  useEffect(() => {
    loadPrescription();
  }, []);

  const loadPrescription = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchPrescription(refCode);
      setPrescription(res.data);
      if (res.data.medications) {
        setMeds(res.data.medications.map((m, i) => ({ id: i + 1, ...m, qty: m.quantity || 1 })));
      }
    } catch (err) {
      setError("Ordonnance non trouvée ou code invalide.");
    } finally {
      setLoading(false);
    }
  };

  const updateQty = (id, delta) => {
    setMeds(prev => prev.map(m => m.id === id ? { ...m, qty: Math.max(1, m.qty + delta) } : m));
  };

  return (
    <div className="w-full flex flex-col pt-24 pb-16 px-margin md:px-margin-md lg:px-margin-lg max-w-4xl mx-auto">
      
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3 mb-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface-container-high text-primary font-label-md text-label-md font-bold uppercase tracking-wider">
          <span className="material-symbols-outlined text-[18px]">prescriptions</span>
          <span>Ordonnance Électronique & DMP</span>
        </div>
        <h1 className="font-headline-xl text-headline-xl text-on-surface font-bold">Vérification de Prescription Médicale</h1>
        <p className="font-body-md text-body-md text-on-surface-variant">
          Entrez la référence de l'ordonnance ou CIN du patient pour consulter les médicaments prescrits et les contre-indications.
        </p>
      </div>

      {/* Code Search Input */}
      <div className="bg-surface-container-lowest p-4 rounded-xl shadow-sm border border-surface-container-high mb-8">
        <form onSubmit={(e) => { e.preventDefault(); loadPrescription(); }} className="flex gap-3">
          <input
            type="text"
            value={refCode}
            onChange={(e) => setRefCode(e.target.value)}
            placeholder="Ex: ORD-TN-2024-9921"
            className="flex-1 h-11 px-4 rounded-lg bg-surface-container-low border border-outline-variant/60 font-mono text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-6 h-11 rounded-lg bg-primary-container text-on-primary font-label-lg text-label-lg font-bold hover:bg-primary transition-colors flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">search</span>
            <span>Consulter</span>
          </button>
        </form>
      </div>

      {error && (
        <div className="p-space-md rounded-xl bg-error-container text-on-error-container font-label-md text-label-md flex items-center gap-2 mb-8">
          <span className="material-symbols-outlined text-[20px]">error</span>
          <span>{error}</span>
        </div>
      )}

      {/* Prescription Document Card */}
      <div className="bg-surface-container-lowest p-6 sm:p-8 rounded-2xl shadow-lg border border-surface-container-high space-y-6">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4 border-surface-container-low">
          <div>
            <span className="font-label-sm text-label-sm text-outline uppercase font-semibold">Ordonnance N°</span>
            <h2 className="font-headline-md text-headline-md font-bold text-primary font-mono">{prescription?.reference_code || refCode}</h2>
          </div>
          <div className="text-right">
            <span className="font-label-sm text-label-sm text-on-surface-variant block">Délivrée le : {prescription?.date || new Date().toISOString().split('T')[0]}</span>
            <span className="font-label-md text-label-md font-bold text-on-surface">{prescription?.doctor_name || 'Dr. Leila Ben Salem'}</span>
          </div>
        </div>

        {/* Contraindication Alert Box */}
        <div className="p-4 rounded-xl bg-error-container/40 border border-error-container flex items-start gap-3">
          <span className="material-symbols-outlined text-error text-[24px] shrink-0">warning</span>
          <div>
            <h4 className="font-label-lg text-label-lg font-bold text-error">Alerte Détecteur d'Interactions & Allergies</h4>
            <p className="font-body-sm text-body-sm text-on-error-container">
              {prescription?.contraindication_warning || "Remarque: Antécédent d'allergie Pénicilline noté au dossier. Aucune bêta-lactamine prescrite."}
            </p>
          </div>
        </div>

        {/* Medications Dosage Table & Stepper Controls */}
        <div className="space-y-3">
          <h3 className="font-label-lg text-label-lg font-bold text-on-surface uppercase tracking-wider">Traitement Prescrit (Posologie)</h3>
          
          <div className="divide-y divide-surface-container-low border border-surface-container-high rounded-xl overflow-hidden">
            {meds.map((med) => (
              <div key={med.id} className="p-4 bg-surface-container-lowest flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-surface-container-low text-primary flex items-center justify-center font-bold shrink-0">
                    <span className="material-symbols-outlined text-[20px]">pill</span>
                  </div>
                  <div>
                    <h4 className="font-headline-sm text-headline-sm font-bold text-on-surface">{med.name}</h4>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">{med.dosage} • Durée: {med.duration}</p>
                  </div>
                </div>

                {/* Stepper Quantity Counter */}
                <div className="flex items-center gap-3 bg-surface-container-low px-3 py-1.5 rounded-lg border border-surface-container-high shrink-0 w-fit">
                  <span className="font-label-sm text-label-sm text-on-surface-variant font-semibold">Boîtes :</span>
                  <button
                    onClick={() => updateQty(med.id, -1)}
                    className="w-7 h-7 rounded bg-surface-container-lowest text-on-surface hover:bg-surface font-bold flex items-center justify-center border border-outline-variant/40"
                  >
                    -
                  </button>
                  <span className="font-headline-sm text-headline-sm font-bold text-primary min-w-[20px] text-center">
                    {med.qty}
                  </span>
                  <button
                    onClick={() => updateQty(med.id, 1)}
                    className="w-7 h-7 rounded bg-surface-container-lowest text-on-surface hover:bg-surface font-bold flex items-center justify-center border border-outline-variant/40"
                  >
                    +
                  </button>
                </div>

              </div>
            ))}
          </div>
        </div>

        {/* Pharmacy QR Verification Footer */}
        <div className="pt-4 border-t border-surface-container-low flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 bg-surface-container-high rounded-lg flex items-center justify-center border border-outline-variant/40 font-mono font-bold text-xs text-primary text-center">
              QR CODE VALIDÉ
            </div>
            <div>
              <span className="font-label-md text-label-md font-bold text-on-surface block">Attestation Électronique Pharmacie</span>
              <span className="font-label-sm text-label-sm text-on-surface-variant">Document officiel signé électroniquement par le praticien.</span>
            </div>
          </div>

          <button
            onClick={() => window.print()}
            className="px-5 py-2.5 rounded-lg bg-primary-container text-on-primary font-label-lg text-label-lg font-bold hover:bg-primary transition-colors shadow-sm flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">download</span>
            <span>Télécharger le PDF Ordonnance</span>
          </button>
        </div>

      </div>

    </div>
  );
}
