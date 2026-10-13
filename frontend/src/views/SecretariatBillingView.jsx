import React, { useState } from 'react';
import { createBillingTransaction } from '../services/api';

export default function SecretariatBillingView({ setView }) {
  const [patientName, setPatientName] = useState('Yasmine Ben Amor');
  const [cin, setCin] = useState('06214589');
  const [selectedAct, setSelectedAct] = useState('Echo');
  const [amountTotal, setAmountTotal] = useState(120);
  const [amountCnam, setAmountCnam] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('Espèces');
  const [cashGiven, setCashGiven] = useState(150);
  const [toast, setToast] = useState(null);
  const [printedReceipt, setPrintedReceipt] = useState(null);

  const actsList = [
    { code: 'Consult', label: 'Consultation Spécialisée', fee: 60, cnamCovered: 0 },
    { code: 'ECG', label: 'Consultation + Électrocardiogramme (ECG)', fee: 70, cnamCovered: 0 },
    { code: 'Echo', label: 'Échocardiographie Doppler', fee: 120, cnamCovered: 0 },
    { code: 'CNAM_AP', label: 'Acte Filière Privée CNAM (APC)', fee: 60, cnamCovered: 45 },
    { code: 'Holter', label: 'Pose & Restitution Holter 24h', fee: 90, cnamCovered: 0 }
  ];

  const handleActChange = (e) => {
    const actCode = e.target.value;
    setSelectedAct(actCode);
    const item = actsList.find(a => a.code === actCode);
    if (item) {
      setAmountTotal(item.fee);
      setAmountCnam(item.cnamCovered);
    }
  };

  const amountPatient = Math.max(0, amountTotal - amountCnam);
  const changeToReturn = Math.max(0, cashGiven - amountPatient);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  };

  const handleCreateBilling = async (e) => {
    e.preventDefault();
    try {
      const actObj = actsList.find(a => a.code === selectedAct);
      const res = await createBillingTransaction({
        patient_name: patientName,
        cin,
        act: actObj?.label || "Consultation",
        amount_total: amountTotal,
        amount_cnam: amountCnam,
        amount_patient: amountPatient,
        payment_method: paymentMethod
      });
      setPrintedReceipt(res.receipt);
      showToast(res.message);
    } catch (err) {
      showToast("Erreur lors de l'enregistrement de l'encaissement");
    }
  };

  return (
    <div className="w-full bg-surface min-h-screen pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-24 right-6 z-50 p-4 rounded-xl bg-primary text-on-primary shadow-2xl flex items-center gap-3 animate-bounce max-w-md">
          <span className="material-symbols-outlined text-[24px]">payments</span>
          <span className="font-label-lg text-label-lg font-bold">{toast}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 text-on-surface-variant font-label-md text-label-md mb-1">
            <button onClick={() => setView('tableau-de-bord')} className="hover:text-primary">Secrétariat</button>
            <span>/</span>
            <span className="text-primary font-bold">Encaissement & POS</span>
          </div>
          <h1 className="font-headline-xl text-headline-xl font-bold text-on-surface">Point de Vente & Facturation Consultation</h1>
        </div>

        <button 
          onClick={() => setView('tableau-de-bord')}
          className="px-4 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high font-label-md text-label-md font-bold text-on-surface transition-colors"
        >
          Retour Dashboard
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Form (7 cols) */}
        <div className="lg:col-span-7 bg-surface-container-lowest p-6 rounded-2xl shadow-sm border border-surface-container-high space-y-6">
          <form onSubmit={handleCreateBilling} className="space-y-5">
            
            <div className="space-y-4">
              <h2 className="font-headline-sm text-headline-sm font-bold text-on-surface border-b pb-2 border-surface-container-low">1. Identité Patient & Acte Médical</h2>
              
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

              <div>
                <label className="block font-label-md text-label-md font-bold text-on-surface mb-1">Sélectionner l'Acte Réalisé</label>
                <select 
                  value={selectedAct} 
                  onChange={handleActChange}
                  className="w-full h-11 px-4 rounded-xl bg-surface-container-low border border-outline-variant/60 font-body-md text-on-surface focus:ring-2 focus:ring-primary focus:outline-none"
                >
                  {actsList.map(a => (
                    <option key={a.code} value={a.code}>{a.label} ({a.fee} TND)</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="font-headline-sm text-headline-sm font-bold text-on-surface border-b pb-2 border-surface-container-low">2. Mode de Règlement</h2>
              
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('Espèces')}
                  className={`py-2.5 px-3 rounded-xl font-label-md text-label-md font-bold transition-all border ${
                    paymentMethod === 'Espèces' ? 'bg-primary text-on-primary border-primary shadow-xs' : 'bg-surface-container-low text-on-surface border-surface-container-high'
                  }`}
                >
                  Espèces
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('Chèque')}
                  className={`py-2.5 px-3 rounded-xl font-label-md text-label-md font-bold transition-all border ${
                    paymentMethod === 'Chèque' ? 'bg-primary text-on-primary border-primary shadow-xs' : 'bg-surface-container-low text-on-surface border-surface-container-high'
                  }`}
                >
                  Chèque
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('Carte TPE')}
                  className={`py-2.5 px-3 rounded-xl font-label-md text-label-md font-bold transition-all border ${
                    paymentMethod === 'Carte TPE' ? 'bg-primary text-on-primary border-primary shadow-xs' : 'bg-surface-container-low text-on-surface border-surface-container-high'
                  }`}
                >
                  Carte TPE
                </button>
              </div>

              {paymentMethod === 'Espèces' && (
                <div className="p-3.5 rounded-xl bg-surface-container-low border border-surface-container-high grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-label-sm text-label-sm font-bold text-on-surface mb-1">Montant Reçu (TND)</label>
                    <input 
                      type="number" 
                      value={cashGiven} 
                      onChange={(e) => setCashGiven(Number(e.target.value))}
                      className="w-full h-10 px-3 rounded-lg bg-surface-container-lowest border border-outline-variant/60 font-mono font-bold text-on-surface"
                    />
                  </div>
                  <div>
                    <span className="block font-label-sm text-label-sm font-bold text-on-surface-variant mb-1">Monnaie à Rendre</span>
                    <span className="font-headline-sm text-headline-sm font-bold text-primary block mt-1">{changeToReturn} TND</span>
                  </div>
                </div>
              )}
            </div>

            <button 
              type="submit" 
              className="w-full py-3.5 rounded-xl bg-primary text-on-primary font-label-lg text-label-lg font-bold hover:bg-primary-container transition-colors shadow-sm flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-[20px]">print</span>
              <span>Valider Encaissement & Imprimer Quittance</span>
            </button>

          </form>
        </div>

        {/* Right Preview Ticket (5 cols) */}
        <div className="lg:col-span-5 bg-surface-container-lowest p-6 rounded-2xl shadow-lg border border-surface-container-high flex flex-col justify-between space-y-6">
          <div>
            <div className="text-center pb-4 border-b border-surface-container-low space-y-1">
              <span className="font-headline-sm text-headline-sm font-bold text-primary tracking-tight">Clinique Alyssa — MediDesk</span>
              <span className="font-label-sm text-label-sm text-on-surface-variant block uppercase">Quittance Officielle de Honoraires</span>
              <span className="font-mono text-xs text-outline">{printedReceipt?.receipt_no || "Aperçu de la Quittance"}</span>
            </div>

            <div className="py-4 space-y-3 font-body-sm text-body-sm">
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Patient :</span>
                <span className="font-bold text-on-surface">{patientName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant">CIN :</span>
                <span className="font-mono font-bold text-on-surface">{cin}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Acte :</span>
                <span className="font-bold text-on-surface">{actsList.find(a => a.code === selectedAct)?.label}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Date :</span>
                <span className="font-bold text-on-surface">{new Date().toLocaleDateString('fr-FR')}</span>
              </div>

              <div className="pt-3 border-t border-surface-container-low space-y-1">
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Total Honoraires :</span>
                  <span className="font-bold text-on-surface">{amountTotal} TND</span>
                </div>
                {amountCnam > 0 && (
                  <div className="flex justify-between text-primary font-bold">
                    <span>Prise en charge CNAM :</span>
                    <span>- {amountCnam} TND</span>
                  </div>
                )}
                <div className="flex justify-between font-headline-sm text-headline-sm font-bold text-primary pt-2 border-t border-surface-container-high">
                  <span>Net Patient à Payer :</span>
                  <span>{amountPatient} TND</span>
                </div>
              </div>
            </div>
          </div>

          <button 
            onClick={() => window.print()}
            className="w-full py-2.5 rounded-xl bg-surface-container-high hover:bg-surface-container font-label-md text-label-md font-bold text-on-surface transition-colors flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">download</span>
            <span>Télécharger PDF Quittance</span>
          </button>
        </div>

      </div>

    </div>
  );
}
