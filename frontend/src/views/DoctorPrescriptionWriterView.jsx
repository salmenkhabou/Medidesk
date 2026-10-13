import React, { useState } from 'react';

export default function DoctorPrescriptionWriterView({ setView }) {
  const [patientName, setPatientName] = useState('Mohamed Hédi Guediche');
  const [cin, setCin] = useState('04892144');
  const [medsList, setMedsList] = useState([
    { id: 1, name: 'Amlodipine 5mg', dosage: '1 comprimé le matin', duration: '30 jours', qty: 1 },
    { id: 2, name: 'Aspegic 100mg', dosage: '1 sachet à midi au cours du repas', duration: '30 jours', qty: 1 }
  ]);
  const [newMedName, setNewMedName] = useState('');
  const [newMedDosage, setNewMedDosage] = useState('1 comprimé le matin');
  const [allergyAlert, setAllergyAlert] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  };

  const handleAddMedication = (e) => {
    e.preventDefault();
    if (!newMedName.trim()) return;

    // Allergy detector trigger
    if (newMedName.toLowerCase().includes('amoxicilline') || newMedName.toLowerCase().includes('penicilline') || newMedName.toLowerCase().includes('augmentin')) {
      setAllergyAlert("ATTENTION: Antécédent d'Allergie Pénicilline (Bêta-lactamines) détecté pour ce patient ! Prescription bloquée par sécurité.");
      return;
    }

    setAllergyAlert(null);
    setMedsList(prev => [...prev, {
      id: prev.length + 1,
      name: newMedName,
      dosage: newMedDosage,
      duration: '30 jours',
      qty: 1
    }]);
    setNewMedName('');
    showToast(`Médicament ${newMedName} ajouté à la prescription.`);
  };

  const handleRemoveMed = (id) => {
    setMedsList(prev => prev.filter(m => m.id !== id));
  };

  return (
    <div className="w-full bg-surface min-h-screen pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
      
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-24 right-6 z-50 p-4 rounded-xl bg-primary text-on-primary shadow-2xl flex items-center gap-3 animate-bounce max-w-md">
          <span className="material-symbols-outlined text-[24px]">prescriptions</span>
          <span className="font-label-lg text-label-lg font-bold">{toast}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 text-on-surface-variant font-label-md text-label-md mb-1">
            <button onClick={() => setView('tableau-de-bord-medecin')} className="hover:text-primary">Espace Médecin</button>
            <span>/</span>
            <span className="text-primary font-bold">Rédaction Ordonnance</span>
          </div>
          <h1 className="font-headline-xl text-headline-xl font-bold text-on-surface">Rédaction d'Ordonnance Médicale & Contrôle Sécurisé</h1>
        </div>

        <button 
          onClick={() => setView('tableau-de-bord-medecin')}
          className="px-4 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high font-label-md text-label-md font-bold text-on-surface transition-colors"
        >
          Retour Dashboard
        </button>
      </div>

      {/* Allergy Alert Banner if triggered */}
      {allergyAlert && (
        <div className="p-4 rounded-xl bg-error-container text-on-error-container font-label-lg text-label-lg font-bold flex items-center gap-3 mb-6 animate-pulse border border-error">
          <span className="material-symbols-outlined text-error text-[28px]">warning</span>
          <span>{allergyAlert}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Form: Add Medication (7 cols) */}
        <div className="lg:col-span-7 bg-surface-container-lowest p-6 rounded-2xl shadow-sm border border-surface-container-high space-y-6">
          <div className="space-y-4">
            <h2 className="font-headline-sm text-headline-sm font-bold text-on-surface border-b pb-2 border-surface-container-low">1. Patient & Recherche Médicament (DCI / Marque)</h2>

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

            <form onSubmit={handleAddMedication} className="space-y-3 pt-2">
              <div>
                <label className="block font-label-md text-label-md font-bold text-on-surface mb-1">Rechercher Médicament ou DCI</label>
                <input 
                  type="text" 
                  value={newMedName} 
                  onChange={(e) => setNewMedName(e.target.value)}
                  placeholder="Ex: Bisoprolol 5mg, Atorvastatine 20mg..."
                  className="w-full h-11 px-4 rounded-xl bg-surface-container-low border border-outline-variant/60 font-body-md text-on-surface focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-label-md text-label-md font-bold text-on-surface mb-1">Posologie & Instructions</label>
                <input 
                  type="text" 
                  value={newMedDosage} 
                  onChange={(e) => setNewMedDosage(e.target.value)}
                  placeholder="1 comprimé le matin..."
                  className="w-full h-11 px-4 rounded-xl bg-surface-container-low border border-outline-variant/60 font-body-md text-on-surface focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>

              <button 
                type="submit" 
                className="w-full py-2.5 rounded-xl bg-primary text-on-primary font-label-md text-label-md font-bold hover:bg-primary-container transition-colors shadow-xs flex items-center justify-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[18px]">add</span>
                <span>Ajouter à la prescription</span>
              </button>
            </form>
          </div>
        </div>

        {/* Right Preview Card (5 cols) */}
        <div className="lg:col-span-5 bg-surface-container-lowest p-6 rounded-2xl shadow-lg border border-surface-container-high flex flex-col justify-between space-y-6">
          <div>
            <div className="text-center pb-4 border-b border-surface-container-low space-y-1">
              <span className="font-headline-sm text-headline-sm font-bold text-primary tracking-tight">Dr. Karim Ben Mahmoud</span>
              <span className="font-label-sm text-label-sm text-on-surface-variant block">Cardiologie & Angiologie • CNOM 18452</span>
              <span className="font-mono text-xs text-outline">Ordonnance Médicale N° ORD-TN-2025-9921</span>
            </div>

            <div className="py-4 space-y-3 font-body-sm text-body-sm">
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Patient :</span>
                <span className="font-bold text-on-surface">{patientName} (CIN: {cin})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Date :</span>
                <span className="font-bold text-on-surface">{new Date().toLocaleDateString('fr-FR')}</span>
              </div>

              <div className="pt-3 border-t border-surface-container-low space-y-2">
                <span className="font-label-sm text-label-sm font-bold text-on-surface uppercase block">Médicaments Prescrits :</span>
                
                {medsList.map((m) => (
                  <div key={m.id} className="p-3 rounded-xl bg-surface-container-low flex items-center justify-between">
                    <div>
                      <h4 className="font-headline-sm text-headline-sm font-bold text-on-surface">{m.name}</h4>
                      <span className="font-body-sm text-body-sm text-on-surface-variant block">{m.dosage}</span>
                    </div>
                    <button 
                      onClick={() => handleRemoveMed(m.id)}
                      className="p-1 text-on-surface-variant hover:text-red-600"
                    >
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <button 
              onClick={() => showToast("Ordonnance signée électroniquement & envoyée sur le DMP !")}
              className="w-full py-3 rounded-xl bg-primary text-on-primary font-label-lg text-label-lg font-bold hover:bg-primary-container transition-colors shadow-sm flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-[20px]">draw</span>
              <span>Signer & Valider Ordonnance</span>
            </button>

            <button 
              onClick={() => window.print()}
              className="w-full py-2.5 rounded-xl bg-surface-container-high hover:bg-surface-container font-label-md text-label-md font-bold text-on-surface transition-colors flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">print</span>
              <span>Imprimer Ordonnance (Format A4/A5)</span>
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
