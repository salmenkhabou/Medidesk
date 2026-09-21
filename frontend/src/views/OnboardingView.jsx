import React, { useState } from 'react';
import { submitPractitionerOnboarding } from '../services/api';

export default function OnboardingView({ setView }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [doctorName, setDoctorName] = useState('Dr. Karim Ben Mahmoud');
  const [cnomNumber, setCnomNumber] = useState('18452 / CNOM');
  const [specialty, setSpecialty] = useState('Cardiologie & Maladies Vasculaires');
  const [phone, setPhone] = useState('98 420 811');
  const [email, setEmail] = useState('dr.k.benmahmoud@clinique-carthage.tn');
  const [clinicName, setClinicName] = useState('Cabinet Médical Les Berges du Lac');
  const [city, setCity] = useState('Tunis');
  const [address, setAddress] = useState('Rue du Lac de Constance, Immeuble Carthage Médical, 3ème étage, Les Berges du Lac, 1053 Tunis');
  const [cnamConvention, setCnamConvention] = useState(true);
  
  // Step 2: Team & Secretariat
  const [assistantName, setAssistantName] = useState('Amira Trabelsi');
  const [assistantEmail, setAssistantEmail] = useState('amira.t@cabinet-lac.tn');
  
  // Step 3: Plan selection
  const [selectedPlan, setSelectedPlan] = useState('cloud_hds');
  
  // Step 4: Submission
  const [fileName, setFileName] = useState('Attestation_CNOM_2024.pdf');
  const [honestyChecked, setHonestyChecked] = useState(true);
  const [inpdpChecked, setInpdpChecked] = useState(true);
  
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleFinalSubmit = async () => {
    if (!honestyChecked || !inpdpChecked) {
      setError("Veuillez accepter les certifications d'honneur et la déclaration INPDP.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const payload = {
        doctor_name: doctorName,
        cnom_number: cnomNumber,
        specialty,
        phone,
        email,
        clinic_name: clinicName,
        city,
        address,
        cnam_convention: cnamConvention,
        plan_type: selectedPlan,
        secretariat_invited: `${assistantName} (${assistantEmail})`,
        document_name: fileName
      };

      const res = await submitPractitionerOnboarding(payload);
      setSubmitting(false);
      setView('confirmation', { trackingCode: res.tracking_code, record: res.data });
    } catch (err) {
      setSubmitting(false);
      setError(err.message || 'Erreur lors de la soumission du dossier');
    }
  };

  return (
    <div className="w-full flex flex-col pt-24 pb-16 px-margin md:px-margin-md lg:px-margin-lg max-w-5xl mx-auto">
      
      {/* Header Context Banner */}
      <div className="text-center max-w-3xl mx-auto space-y-3 mb-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface-container-high text-on-surface-variant font-label-md text-label-md uppercase tracking-wider shadow-sm border border-outline-variant/30">
          <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
          <span>Vérification Médicale Préalable</span>
        </div>
        <h1 className="font-headline-xl text-headline-xl text-on-surface tracking-tight font-bold">
          Demande d'Adhésion Praticien & Cabinet
        </h1>
        <p className="font-body-lg text-body-lg text-on-surface-variant">
          Rejoignez le réseau national MediDesk. Complétez votre dossier professionnel pour validation par notre conseil de conformité.
        </p>
      </div>

      {/* Stepper Tabs Bar */}
      <div className="bg-surface-container-lowest p-3 rounded-xl shadow-sm border border-surface-container-high mb-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {[
            { id: 1, label: 'Étape 1', title: 'Identité & Cabinet' },
            { id: 2, label: 'Étape 2', title: 'Équipe & Secrétariat' },
            { id: 3, label: 'Étape 3', title: 'Choix du Forfait' },
            { id: 4, label: 'Étape 4', title: 'Vérification & Envoi' }
          ].map((s) => (
            <button
              key={s.id}
              onClick={() => setCurrentStep(s.id)}
              className={`text-left flex items-center gap-3 p-3 rounded-lg transition-all ${
                currentStep === s.id
                  ? 'bg-surface-container-high text-on-surface ring-2 ring-primary'
                  : currentStep > s.id
                  ? 'bg-surface-container-low text-primary'
                  : 'hover:bg-surface-container-low text-on-surface-variant'
              }`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${
                currentStep === s.id
                  ? 'bg-primary text-on-primary shadow-sm'
                  : currentStep > s.id
                  ? 'bg-primary-container text-on-primary'
                  : 'bg-surface-container text-on-surface-variant'
              }`}>
                {currentStep > s.id ? '✓' : s.id}
              </div>
              <div className="min-w-0 hidden sm:block">
                <span className="block font-label-sm text-[10px] uppercase font-semibold text-primary">{s.label}</span>
                <span className="block font-label-lg text-label-lg font-bold truncate">{s.title}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="mb-6 p-space-md rounded-xl bg-error-container text-on-error-container font-label-md text-label-md flex items-center gap-2">
          <span className="material-symbols-outlined text-[20px]">error</span>
          <span>{error}</span>
        </div>
      )}

      {/* STEP 1: Identité & Cabinet */}
      {currentStep === 1 && (
        <div className="space-y-6">
          <div className="bg-surface-container-lowest p-6 sm:p-8 rounded-xl shadow-sm border border-surface-container-high space-y-6">
            <div className="flex items-center justify-between border-b pb-4 border-surface-container-low">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-surface-container-low text-primary flex items-center justify-center shrink-0 font-bold">
                  <span className="material-symbols-outlined text-[24px]">stethoscope</span>
                </div>
                <div>
                  <h2 className="font-headline-md text-headline-md text-on-surface font-semibold">Informations Personnelles & Titularisation</h2>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">Attestation auprès du Conseil de l'Ordre des Médecins.</p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-surface-container-low text-primary font-label-sm text-label-sm font-semibold flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px]">verified_user</span> CNOM-TN
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="block font-label-lg text-label-lg text-on-surface">Nom & Prénom du Médecin *</label>
                <input
                  type="text"
                  value={doctorName}
                  onChange={(e) => setDoctorName(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-lg bg-surface-container-low text-on-surface font-body-md text-body-md border border-outline-variant/60 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block font-label-lg text-label-lg text-on-surface">Numéro Inscription Ordre (CNOM) *</label>
                <input
                  type="text"
                  value={cnomNumber}
                  onChange={(e) => setCnomNumber(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-lg bg-surface-container-low text-on-surface font-body-md text-body-md border border-outline-variant/60 focus:outline-none focus:ring-2 focus:ring-primary font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block font-label-lg text-label-lg text-on-surface">Spécialité Principale *</label>
                <select
                  value={specialty}
                  onChange={(e) => setSpecialty(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-lg bg-surface-container-low text-on-surface font-body-md text-body-md border border-outline-variant/60 focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
                >
                  <option value="Cardiologie & Maladies Vasculaires">Cardiologie & Maladies Vasculaires</option>
                  <option value="Médecine Générale">Médecine Générale</option>
                  <option value="Pédiatrie & Néonatologie">Pédiatrie & Néonatologie</option>
                  <option value="Dermatologie & Vénérologie">Dermatologie & Vénérologie</option>
                  <option value="Gynécologie & Obstétrique">Gynécologie & Obstétrique</option>
                  <option value="Ophtalmologie">Ophtalmologie</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block font-label-lg text-label-lg text-on-surface">Téléphone Mobile Professionnel *</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-lg bg-surface-container-low text-on-surface font-body-md text-body-md border border-outline-variant/60 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="md:col-span-2 space-y-1.5">
                <label className="block font-label-lg text-label-lg text-on-surface">Courriel Professionnel *</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-lg bg-surface-container-low text-on-surface font-body-md text-body-md border border-outline-variant/60 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
          </div>

          <div className="bg-surface-container-lowest p-6 sm:p-8 rounded-xl shadow-sm border border-surface-container-high space-y-6">
            <div className="flex items-center justify-between border-b pb-4 border-surface-container-low">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-surface-container-low text-primary flex items-center justify-center shrink-0 font-bold">
                  <span className="material-symbols-outlined text-[24px]">local_hospital</span>
                </div>
                <div>
                  <h2 className="font-headline-md text-headline-md text-on-surface font-semibold">Structure Clinique & Localisation</h2>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">Lieu d'exercice pour le référencement des patients et les feuilles CNAM.</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="block font-label-lg text-label-lg text-on-surface">Nom du Cabinet ou Établissement *</label>
                <input
                  type="text"
                  value={clinicName}
                  onChange={(e) => setClinicName(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-lg bg-surface-container-low text-on-surface font-body-md text-body-md border border-outline-variant/60 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block font-label-lg text-label-lg text-on-surface">Gouvernorat *</label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-lg bg-surface-container-low text-on-surface font-body-md text-body-md border border-outline-variant/60 focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
                >
                  <option value="Tunis">Tunis</option>
                  <option value="Sousse">Sousse</option>
                  <option value="Sfax">Sfax</option>
                  <option value="Monastir">Monastir</option>
                  <option value="Ariana">Ariana</option>
                  <option value="Nabeul">Nabeul</option>
                </select>
              </div>

              <div className="md:col-span-2 space-y-1.5">
                <label className="block font-label-lg text-label-lg text-on-surface">Adresse Postale Complète *</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-lg bg-surface-container-low text-on-surface font-body-md text-body-md border border-outline-variant/60 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="md:col-span-2 p-4 rounded-xl bg-surface-container-low flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary text-[24px]">fact_check</span>
                  <div>
                    <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold">Conventionnement CNAM</h3>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">Générez automatiquement les bordereaux filière privée & médecin de famille.</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={cnamConvention}
                  onChange={(e) => setCnamConvention(e.target.checked)}
                  className="w-6 h-6 text-primary accent-primary rounded cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: Équipe & Secrétariat */}
      {currentStep === 2 && (
        <div className="bg-surface-container-lowest p-6 sm:p-8 rounded-xl shadow-sm border border-surface-container-high space-y-6">
          <div className="flex items-center justify-between border-b pb-4 border-surface-container-low">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-surface-container-low text-primary flex items-center justify-center shrink-0 font-bold">
                <span className="material-symbols-outlined text-[24px]">group_add</span>
              </div>
              <div>
                <h2 className="font-headline-md text-headline-md text-on-surface font-semibold">Équipe de Secrétariat & Assistants Médicaux</h2>
                <p className="font-body-sm text-body-sm text-on-surface-variant">Déléguez la prise de rendez-vous et la salle d'attente en toute sécurité.</p>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-surface-container text-on-surface-variant font-label-sm text-label-sm">
              Optionnel
            </span>
          </div>

          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-surface-container-low flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-secondary-fixed text-on-secondary-fixed flex items-center justify-center font-bold">
                  AT
                </div>
                <div>
                  <h4 className="font-headline-sm text-headline-sm font-semibold">{assistantName}</h4>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">Secrétaire Médicale Principale • {assistantEmail}</p>
                </div>
              </div>
              <span className="px-3 py-1 rounded-lg bg-surface-container-highest text-primary font-label-sm text-label-sm font-semibold">
                Invitation active
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <input
                type="text"
                value={assistantName}
                onChange={(e) => setAssistantName(e.target.value)}
                placeholder="Nom collaborateur"
                className="h-11 px-3.5 rounded-lg bg-surface-container-low border border-outline-variant/60 text-on-surface"
              />
              <input
                type="email"
                value={assistantEmail}
                onChange={(e) => setAssistantEmail(e.target.value)}
                placeholder="Email collaborateur"
                className="h-11 px-3.5 rounded-lg bg-surface-container-low border border-outline-variant/60 text-on-surface"
              />
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: Choix du Forfait */}
      {currentStep === 3 && (
        <div className="bg-surface-container-lowest p-6 sm:p-8 rounded-xl shadow-sm border border-surface-container-high space-y-6">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <h2 class="font-headline-md text-headline-md text-on-surface font-semibold">Formules Adaptées à Votre Pratique</h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant">Facturation transparente en Dinars Tunisiens (TND). Sans engagement de durée.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
            <div
              onClick={() => setSelectedPlan('local')}
              className={`p-6 rounded-2xl border transition-all cursor-pointer ${
                selectedPlan === 'local' ? 'ring-2 ring-primary border-primary bg-surface-container-low' : 'border-surface-container-high bg-surface-container-lowest'
              }`}
            >
              <h3 className="font-headline-sm text-headline-sm font-bold">Stockage Local</h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">Cabinet autonome mono-poste</p>
              <div className="my-4 flex items-baseline gap-1">
                <span className="font-headline-xl text-headline-xl font-extrabold text-on-surface">55</span>
                <span className="font-headline-sm text-headline-sm font-semibold">TND</span>
                <span className="font-label-sm text-label-sm text-on-surface-variant">/ mois</span>
              </div>
              <ul className="space-y-2 text-body-sm text-on-surface-variant">
                <li>✓ Server local cabinet</li>
                <li>✓ DMP & Ordonnances Bilingues</li>
                <li>✓ Module CNAM de base</li>
              </ul>
            </div>

            <div
              onClick={() => setSelectedPlan('cloud_hds')}
              className={`p-6 rounded-2xl border transition-all cursor-pointer relative ${
                selectedPlan === 'cloud_hds' ? 'ring-2 ring-primary border-primary bg-surface-container-low' : 'border-surface-container-high bg-surface-container-lowest'
              }`}
            >
              <span className="absolute -top-3 right-6 px-3 py-0.5 rounded-full bg-primary text-on-primary font-label-sm text-label-sm font-bold">
                Recommandé
              </span>
              <h3 className="font-headline-sm text-headline-sm font-bold text-primary">Cloud HDS Sécurisé</h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">Pratique moderne & mobilité intégrale</p>
              <div className="my-4 flex items-baseline gap-1">
                <span className="font-headline-xl text-headline-xl font-extrabold text-primary">95</span>
                <span className="font-headline-sm text-headline-sm font-semibold text-primary">TND</span>
                <span className="font-label-sm text-label-sm text-on-surface-variant">/ mois</span>
              </div>
              <ul className="space-y-2 text-body-sm text-on-surface">
                <li>✓ Sauvegarde continuous 3 sites HDS</li>
                <li>✓ Synchro temps réel Médecin & Secrétariat</li>
                <li>✓ Multi-écrans (PC, Mac, iPad)</li>
                <li>✓ Assistance dédiée 7j/7</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* STEP 4: Vérification & Envoi */}
      {currentStep === 4 && (
        <div className="bg-surface-container-lowest p-6 sm:p-8 rounded-xl shadow-sm border border-surface-container-high space-y-6">
          <div className="p-4 rounded-xl bg-secondary-fixed/40 border border-secondary-fixed flex items-start gap-4">
            <span className="material-symbols-outlined text-secondary text-[28px] shrink-0">verified_user</span>
            <div className="space-y-1">
              <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">
                Délai d'instruction du dossier : 48 heures ouvrées
              </h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Votre compte praticien sera activé après validation auprès du Conseil National de l'Ordre des Médecins (CNOM) et conformité INPDP.
              </p>
            </div>
          </div>

          <div className="rounded-lg bg-surface-container-low p-5 space-y-3">
            <h4 className="font-label-lg text-label-lg font-bold text-on-surface uppercase tracking-wider">Récapitulatif de la Demande</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-body-sm font-body-sm">
              <div>
                <span className="text-on-surface-variant block font-label-sm text-label-sm">Praticien déclarant :</span>
                <span className="font-bold text-on-surface">{doctorName} ({cnomNumber})</span>
              </div>
              <div>
                <span className="text-on-surface-variant block font-label-sm text-label-sm">Établissement :</span>
                <span className="font-bold text-on-surface">{clinicName} — {city}</span>
              </div>
              <div>
                <span className="text-on-surface-variant block font-label-sm text-label-sm">Formule souscrite :</span>
                <span className="font-bold text-primary">{selectedPlan === 'cloud_hds' ? 'Cloud HDS Sécurisé (95 TND / mois)' : 'Stockage Local (55 TND / mois)'}</span>
              </div>
              <div>
                <span className="text-on-surface-variant block font-label-sm text-label-sm">Convention CNAM :</span>
                <span className="font-bold text-on-surface">{cnamConvention ? 'Oui (Bordereaux automatique)' : 'Non'}</span>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-surface-container flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-primary text-[24px]">description</span>
              <div>
                <span className="font-label-lg text-label-lg font-semibold text-on-surface block">Attestation Ordre des Médecins</span>
                <span className="font-label-sm text-label-sm text-on-surface-variant block">{fileName} (Fichier téléversé)</span>
              </div>
            </div>
            <span className="px-3 py-1 rounded bg-surface-container-lowest text-primary font-bold text-xs">Fichier Valide</span>
          </div>

          <div className="space-y-3 pt-2">
            <label className="flex items-start gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={honestyChecked}
                onChange={(e) => setHonestyChecked(e.target.checked)}
                className="mt-1 h-5 w-5 rounded text-primary accent-primary"
              />
              <span className="font-body-sm text-body-sm text-on-surface">
                Je certifie sur l'honneur l'exactitude des informations ci-dessus et mon inscription à l'Ordre des Médecins de Tunisie.
              </span>
            </label>

            <label className="flex items-start gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={inpdpChecked}
                onChange={(e) => setInpdpChecked(e.target.checked)}
                className="mt-1 h-5 w-5 rounded text-primary accent-primary"
              />
              <span className="font-body-sm text-body-sm text-on-surface">
                J'accepte le traitement des données de santé conformément à la loi tunisienne n° 2004-63 (INPDP).
              </span>
            </label>
          </div>
        </div>
      )}

      {/* Stepper Sticky Action Footer */}
      <div className="mt-8 bg-surface-container-lowest p-4 sm:p-5 rounded-xl shadow-sm border border-surface-container-high flex items-center justify-between gap-4">
        <button
          disabled={currentStep === 1}
          onClick={() => setCurrentStep(prev => prev - 1)}
          className={`px-5 h-11 rounded-lg bg-surface-container-low text-on-surface-variant font-label-lg text-label-lg font-semibold flex items-center gap-2 ${
            currentStep === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-surface-container'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          <span>Précédent</span>
        </button>

        {currentStep < 4 ? (
          <button
            onClick={() => setCurrentStep(prev => prev + 1)}
            className="px-6 h-11 rounded-lg bg-primary text-on-primary font-label-lg text-label-lg font-bold flex items-center gap-2 hover:bg-primary-container shadow-sm"
          >
            <span>Continuer vers l'étape {currentStep + 1}</span>
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </button>
        ) : (
          <button
            onClick={handleFinalSubmit}
            disabled={submitting}
            className="px-6 h-11 rounded-lg bg-secondary text-on-secondary font-label-lg text-label-lg font-bold flex items-center gap-2 hover:bg-secondary-container shadow-md"
          >
            {submitting ? (
              <span>Transmission du dossier...</span>
            ) : (
              <>
                <span className="material-symbols-outlined text-[18px]">send</span>
                <span>Déposer ma demande d'adhésion</span>
              </>
            )}
          </button>
        )}
      </div>

    </div>
  );
}
