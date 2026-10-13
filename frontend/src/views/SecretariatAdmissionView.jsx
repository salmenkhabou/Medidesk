import React, { useState } from 'react';

export default function SecretariatAdmissionView({ setView }) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    gender: 'M',
    dob: '',
    cin: '',
    phone: '+216 ',
    email: '',
    address: '',
    governorate: 'Tunis',
    cnamAffiliated: '1',
    cnamNumber: '',
    cnamQuality: 'assure_social',
    cnamFiliere: 'filiere_privee',
    emergencyContactName: '',
    emergencyContactRelation: '',
    emergencyContactPhone: '',
    notes: ''
  });

  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (actionType) => {
    if (!formData.firstName || !formData.lastName || !formData.cin) {
      alert("Veuillez remplir au moins le nom, prénom et le numéro de CIN du patient.");
      return;
    }
    setSubmitted(true);
    setTimeout(() => {
      if (actionType === 'queue') {
        setView('salle-attente');
      } else if (actionType === 'appointment') {
        setView('planning-rendez-vous');
      } else {
        setView('dossier-patient-sec');
      }
    }, 1200);
  };

  return (
    <div className="w-full bg-surface min-h-screen pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      
      {/* Top Breadcrumb & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 text-on-surface-variant font-label-md text-label-md mb-1">
            <button onClick={() => setView('tableau-de-bord')} className="hover:text-primary">Secrétariat</button>
            <span>/</span>
            <span className="text-primary font-bold">Fiche d'Admission Patient</span>
          </div>
          <h1 className="font-headline-xl text-headline-xl font-bold text-on-surface">Saisie Fiche Patient & Admission</h1>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Enregistrement de la fiche administrative, données d'assurance CNAM et dossier d'accueil.
          </p>
        </div>

        <button 
          onClick={() => setView('tableau-de-bord')}
          className="px-4 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high font-label-md text-label-md font-bold text-on-surface transition-colors"
        >
          Annuler & Retour
        </button>
      </div>

      {submitted && (
        <div className="p-4 rounded-xl bg-primary-container text-on-primary font-label-lg text-label-lg font-bold flex items-center gap-3 mb-6 animate-pulse">
          <span className="material-symbols-outlined text-[24px]">check_circle</span>
          <span>Fiche d'admission créée avec succès ! Redirection en cours...</span>
        </div>
      )}

      {/* Main Admission Form Card */}
      <div className="bg-surface-container-lowest p-6 sm:p-8 rounded-2xl shadow-lg border border-surface-container-high space-y-8">
        
        {/* Section 1: Patient Identity */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b pb-3 border-surface-container-low">
            <span className="material-symbols-outlined text-primary text-[24px]">person</span>
            <h2 className="font-headline-sm text-headline-sm font-bold text-on-surface">1. État Civil & Identité</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block font-label-md text-label-md font-bold text-on-surface mb-1">Nom du Patient *</label>
              <input 
                type="text" 
                name="lastName" 
                value={formData.lastName} 
                onChange={handleChange}
                placeholder="Ex: Ben Salem"
                className="w-full h-11 px-4 rounded-xl bg-surface-container-low border border-outline-variant/60 font-body-md text-on-surface focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-label-md text-label-md font-bold text-on-surface mb-1">Prénom *</label>
              <input 
                type="text" 
                name="firstName" 
                value={formData.firstName} 
                onChange={handleChange}
                placeholder="Ex: Férid"
                className="w-full h-11 px-4 rounded-xl bg-surface-container-low border border-outline-variant/60 font-body-md text-on-surface focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-label-md text-label-md font-bold text-on-surface mb-1">N° CIN (8 chiffres) *</label>
              <input 
                type="text" 
                name="cin" 
                value={formData.cin} 
                onChange={handleChange}
                placeholder="Ex: 08842109"
                className="w-full h-11 px-4 rounded-xl bg-surface-container-low border border-outline-variant/60 font-mono text-body-md text-on-surface focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block font-label-md text-label-md font-bold text-on-surface mb-1">Genre</label>
              <select 
                name="gender" 
                value={formData.gender} 
                onChange={handleChange}
                className="w-full h-11 px-4 rounded-xl bg-surface-container-low border border-outline-variant/60 font-body-md text-on-surface focus:ring-2 focus:ring-primary focus:outline-none"
              >
                <option value="M">Homme</option>
                <option value="F">Femme</option>
              </select>
            </div>

            <div>
              <label className="block font-label-md text-label-md font-bold text-on-surface mb-1">Date de Naissance</label>
              <input 
                type="date" 
                name="dob" 
                value={formData.dob} 
                onChange={handleChange}
                className="w-full h-11 px-4 rounded-xl bg-surface-container-low border border-outline-variant/60 font-body-md text-on-surface focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-label-md text-label-md font-bold text-on-surface mb-1">Téléphone (+216)</label>
              <input 
                type="text" 
                name="phone" 
                value={formData.phone} 
                onChange={handleChange}
                placeholder="+216 98 123 456"
                className="w-full h-11 px-4 rounded-xl bg-surface-container-low border border-outline-variant/60 font-body-md text-on-surface focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-label-md text-label-md font-bold text-on-surface mb-1">Adresse Résidence</label>
              <input 
                type="text" 
                name="address" 
                value={formData.address} 
                onChange={handleChange}
                placeholder="Rue, Immeuble, Ville..."
                className="w-full h-11 px-4 rounded-xl bg-surface-container-low border border-outline-variant/60 font-body-md text-on-surface focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-label-md text-label-md font-bold text-on-surface mb-1">Gouvernorat</label>
              <select 
                name="governorate" 
                value={formData.governorate} 
                onChange={handleChange}
                className="w-full h-11 px-4 rounded-xl bg-surface-container-low border border-outline-variant/60 font-body-md text-on-surface focus:ring-2 focus:ring-primary focus:outline-none"
              >
                <option value="Tunis">Tunis</option>
                <option value="Ariana">Ariana</option>
                <option value="Ben Arous">Ben Arous</option>
                <option value="Manouba">Manouba</option>
                <option value="Sousse">Sousse</option>
                <option value="Monastir">Monastir</option>
                <option value="Sfax">Sfax</option>
                <option value="Nabeul">Nabeul</option>
                <option value="Bizerte">Bizerte</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 2: Affiliation CNAM */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b pb-3 border-surface-container-low">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[24px]">verified_user</span>
              <h2 className="font-headline-sm text-headline-sm font-bold text-on-surface">2. Couverture Sociale & CNAM</h2>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-primary-fixed text-primary font-label-sm text-label-sm font-bold">
              Caisse Nationale d'Assurance Maladie
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block font-label-md text-label-md font-bold text-on-surface mb-1">Assuré CNAM ?</label>
              <select 
                name="cnamAffiliated" 
                value={formData.cnamAffiliated} 
                onChange={handleChange}
                className="w-full h-11 px-4 rounded-xl bg-surface-container-low border border-outline-variant/60 font-body-md text-on-surface focus:ring-2 focus:ring-primary focus:outline-none"
              >
                <option value="1">Oui — Assuré CNAM</option>
                <option value="0">Non — Regime Privé / Plein Tarif</option>
              </select>
            </div>

            {formData.cnamAffiliated === '1' && (
              <>
                <div>
                  <label className="block font-label-md text-label-md font-bold text-on-surface mb-1">N° Immatriculation CNAM</label>
                  <input 
                    type="text" 
                    name="cnamNumber" 
                    value={formData.cnamNumber} 
                    onChange={handleChange}
                    placeholder="Ex: 12345678/01"
                    className="w-full h-11 px-4 rounded-xl bg-surface-container-low border border-outline-variant/60 font-mono text-body-md text-on-surface focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-label-md text-label-md font-bold text-on-surface mb-1">Filière / Regime</label>
                  <select 
                    name="cnamFiliere" 
                    value={formData.cnamFiliere} 
                    onChange={handleChange}
                    className="w-full h-11 px-4 rounded-xl bg-surface-container-low border border-outline-variant/60 font-body-md text-on-surface focus:ring-2 focus:ring-primary focus:outline-none"
                  >
                    <option value="filiere_privee">Filière Privée (Prise en charge directe)</option>
                    <option value="medecin_referent">Médecin Référent (APC)</option>
                    <option value="remboursement">Régime Remboursement</option>
                  </select>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Section 3: Contact d'urgence & Notes secrétariat */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b pb-3 border-surface-container-low">
            <span className="material-symbols-outlined text-primary text-[24px]">contact_emergency</span>
            <h2 className="font-headline-sm text-headline-sm font-bold text-on-surface">3. Contact d'Urgence & Notes Accueil</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block font-label-md text-label-md font-bold text-on-surface mb-1">Nom du Contact d'Urgence</label>
              <input 
                type="text" 
                name="emergencyContactName" 
                value={formData.emergencyContactName} 
                onChange={handleChange}
                placeholder="Ex: Mme Salma Ben Salem"
                className="w-full h-11 px-4 rounded-xl bg-surface-container-low border border-outline-variant/60 font-body-md text-on-surface focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-label-md text-label-md font-bold text-on-surface mb-1">Lien de Parenté</label>
              <input 
                type="text" 
                name="emergencyContactRelation" 
                value={formData.emergencyContactRelation} 
                onChange={handleChange}
                placeholder="Ex: Épouse / Frère..."
                className="w-full h-11 px-4 rounded-xl bg-surface-container-low border border-outline-variant/60 font-body-md text-on-surface focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-label-md text-label-md font-bold text-on-surface mb-1">Téléphone d'Urgence</label>
              <input 
                type="text" 
                name="emergencyContactPhone" 
                value={formData.emergencyContactPhone} 
                onChange={handleChange}
                placeholder="+216 97 000 111"
                className="w-full h-11 px-4 rounded-xl bg-surface-container-low border border-outline-variant/60 font-body-md text-on-surface focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-label-md text-label-md font-bold text-on-surface mb-1">Remarques Secrétariat (Motif d'admission / Antécédents déclarés)</label>
            <textarea 
              rows="3" 
              name="notes" 
              value={formData.notes} 
              onChange={handleChange}
              placeholder="Ex: Première consultation cardiologie. Patient adressé par Dr. Sellami..."
              className="w-full p-4 rounded-xl bg-surface-container-low border border-outline-variant/60 font-body-sm text-on-surface focus:ring-2 focus:ring-primary focus:outline-none"
            ></textarea>
          </div>
        </div>

        {/* Action Buttons Bar */}
        <div className="pt-4 border-t border-surface-container-low flex flex-col sm:flex-row items-center justify-end gap-3">
          <button 
            type="button" 
            onClick={() => handleSubmit('save')}
            className="w-full sm:w-auto px-5 py-3 rounded-xl bg-surface-container-high hover:bg-surface-container font-label-lg text-label-lg font-bold text-on-surface transition-colors"
          >
            Enregistrer Fiche Seule
          </button>

          <button 
            type="button" 
            onClick={() => handleSubmit('appointment')}
            className="w-full sm:w-auto px-5 py-3 rounded-xl bg-primary text-on-primary font-label-lg text-label-lg font-bold hover:bg-primary-container transition-colors shadow-sm"
          >
            Enregistrer & Programmer RDV
          </button>

          <button 
            type="button" 
            onClick={() => handleSubmit('queue')}
            className="w-full sm:w-auto px-5 py-3 rounded-xl bg-secondary text-on-secondary font-label-lg text-label-lg font-bold hover:bg-secondary/90 transition-colors shadow-sm flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-[20px]">airline_seat_recline_normal</span>
            <span>Enregistrer & Placer en Salle d'Attente</span>
          </button>
        </div>

      </div>

    </div>
  );
}
