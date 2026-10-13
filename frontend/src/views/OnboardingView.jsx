import React, { useState } from 'react';
import { submitPractitionerOnboarding } from '../services/api';

export default function OnboardingView({ setView }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [doctorName, setDoctorName] = useState('Dr. Karim Ben Mahmoud');
  const [cnomNumber, setCnomNumber] = useState('18452 / CNOM');
  const [specialty, setSpecialty] = useState('cardio');
  const [phone, setPhone] = useState('98 420 811');
  const [email, setEmail] = useState('dr.k.benmahmoud@clinique-carthage.tn');
  const [clinicName, setClinicName] = useState('Cabinet Médical Les Berges du Lac');
  const [city, setCity] = useState('tunis');
  const [address, setAddress] = useState('Rue du Lac de Constance, Immeuble Carthage Médical, 3ème étage, Les Berges du Lac, 1053 Tunis');
  const [cnamConvention, setCnamConvention] = useState(true);
  
  // Step 2
  const [assistantName, setAssistantName] = useState('Amira Trabelsi');
  const [assistantEmail, setAssistantEmail] = useState('amira.t@cabinet-lac.tn');
  const [newCollabName, setNewCollabName] = useState('');
  const [newCollabEmail, setNewCollabEmail] = useState('');
  
  // Step 3
  const [isAnnual, setIsAnnual] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState('cloud_hds');
  
  // Step 4
  const [fileName, setFileName] = useState('Attestation_CNOM_2024.pdf');
  const [honestyChecked, setHonestyChecked] = useState(true);
  const [inpdpChecked, setInpdpChecked] = useState(true);
  
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleNextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(prev => prev + 1);
      window.scrollTo({ top: 120, behavior: 'smooth' });
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
      window.scrollTo({ top: 120, behavior: 'smooth' });
    }
  };

  const handleFinalSubmit = async () => {
    if (!honestyChecked || !inpdpChecked) {
      setError("Veuillez cocher les certifications d'exactitude et la conformité INPDP.");
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
    <div className="w-full pt-20 bg-surface flex-1">
      <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        
        {/* Glow Ambient background shapes */}
        <div className="absolute top-10 left-1/4 w-96 h-96 bg-primary-fixed/20 rounded-full blur-3xl pointer-events-none -z-10"></div>
        <div className="absolute top-48 right-10 w-80 h-80 bg-secondary-fixed/30 rounded-full blur-3xl pointer-events-none -z-10"></div>

        {/* 1. Header & Context Banner */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface-container-high text-on-surface-variant font-label-md text-label-md uppercase tracking-wider shadow-sm border border-outline-variant/30">
            <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
            <span>Vérification Médicale Préalable</span>
          </div>
          <h1 className="font-headline-xl text-headline-xl text-on-surface tracking-tight font-bold">
            Demande d'Adhésion Praticien &amp; Cabinet
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant">
            Rejoignez le réseau national MediDesk. Complétez votre dossier professionnel pour validation rigoureuse par notre conseil d'éthique et conformité.
          </p>

          {/* Trust Badges Strip */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-y-2 gap-x-6 text-on-surface-variant font-label-sm text-label-sm">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-primary text-[18px]">verified</span>
              <span>Agrément Conseil de l'Ordre des Médecins de Tunisie</span>
            </div>
            <span className="hidden sm:inline text-outline-variant">•</span>
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-primary text-[18px]">health_and_safety</span>
              <span>Hébergement Santé HDS Certifié</span>
            </div>
            <span className="hidden sm:inline text-outline-variant">•</span>
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-primary text-[18px]">shield</span>
              <span>Conformité INPDP n° 2004-63</span>
            </div>
          </div>
        </div>

        {/* 2. Master Stepper Component */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="bg-surface-container-lowest p-3 sm:p-4 rounded-xl shadow-sm border border-surface-container-high">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4 relative">
              
              <button
                onClick={() => setCurrentStep(1)}
                className={`text-left flex items-center gap-3 p-3 rounded-lg transition-all ${
                  currentStep === 1
                    ? 'bg-surface-container-high text-on-surface ring-2 ring-primary'
                    : currentStep > 1
                    ? 'hover:bg-surface-container-low text-primary'
                    : 'hover:bg-surface-container-low text-on-surface-variant'
                }`}
                type="button"
              >
                <div className={`w-9 h-9 rounded-full flex items-center justify-center font-headline-sm text-headline-sm shrink-0 ${
                  currentStep === 1
                    ? 'bg-primary text-on-primary shadow-sm'
                    : currentStep > 1
                    ? 'bg-primary-container text-on-primary'
                    : 'bg-surface-container text-on-surface-variant'
                }`}>
                  {currentStep > 1 ? <span className="material-symbols-outlined text-[18px]">check</span> : '1'}
                </div>
                <div className="min-w-0">
                  <span className="block font-label-sm text-label-sm text-primary font-semibold uppercase tracking-wider">Étape 1</span>
                  <span className="block font-label-lg text-label-lg font-bold truncate">Identité &amp; Cabinet</span>
                </div>
              </button>

              <button
                onClick={() => setCurrentStep(2)}
                className={`text-left flex items-center gap-3 p-3 rounded-lg transition-all ${
                  currentStep === 2
                    ? 'bg-surface-container-high text-on-surface ring-2 ring-primary'
                    : currentStep > 2
                    ? 'hover:bg-surface-container-low text-primary'
                    : 'hover:bg-surface-container-low text-on-surface-variant'
                }`}
                type="button"
              >
                <div className={`w-9 h-9 rounded-full flex items-center justify-center font-headline-sm text-headline-sm shrink-0 ${
                  currentStep === 2
                    ? 'bg-primary text-on-primary shadow-sm'
                    : currentStep > 2
                    ? 'bg-primary-container text-on-primary'
                    : 'bg-surface-container text-on-surface-variant'
                }`}>
                  {currentStep > 2 ? <span className="material-symbols-outlined text-[18px]">check</span> : '2'}
                </div>
                <div className="min-w-0">
                  <span className="block font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Étape 2</span>
                  <span className="block font-label-lg text-label-lg font-semibold truncate">Équipe &amp; Secrétariat</span>
                </div>
              </button>

              <button
                onClick={() => setCurrentStep(3)}
                className={`text-left flex items-center gap-3 p-3 rounded-lg transition-all ${
                  currentStep === 3
                    ? 'bg-surface-container-high text-on-surface ring-2 ring-primary'
                    : currentStep > 3
                    ? 'hover:bg-surface-container-low text-primary'
                    : 'hover:bg-surface-container-low text-on-surface-variant'
                }`}
                type="button"
              >
                <div className={`w-9 h-9 rounded-full flex items-center justify-center font-headline-sm text-headline-sm shrink-0 ${
                  currentStep === 3
                    ? 'bg-primary text-on-primary shadow-sm'
                    : currentStep > 3
                    ? 'bg-primary-container text-on-primary'
                    : 'bg-surface-container text-on-surface-variant'
                }`}>
                  {currentStep > 3 ? <span className="material-symbols-outlined text-[18px]">check</span> : '3'}
                </div>
                <div className="min-w-0">
                  <span className="block font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Étape 3</span>
                  <span className="block font-label-lg text-label-lg font-semibold truncate">Choix du Forfait</span>
                </div>
              </button>

              <button
                onClick={() => setCurrentStep(4)}
                className={`text-left flex items-center gap-3 p-3 rounded-lg transition-all ${
                  currentStep === 4
                    ? 'bg-surface-container-high text-on-surface ring-2 ring-primary'
                    : 'hover:bg-surface-container-low text-on-surface-variant'
                }`}
                type="button"
              >
                <div className={`w-9 h-9 rounded-full flex items-center justify-center font-headline-sm text-headline-sm shrink-0 ${
                  currentStep === 4
                    ? 'bg-primary text-on-primary shadow-sm'
                    : 'bg-surface-container text-on-surface-variant'
                }`}>
                  4
                </div>
                <div className="min-w-0">
                  <span className="block font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Étape 4</span>
                  <span className="block font-label-lg text-label-lg font-semibold truncate">Vérification &amp; Envoi</span>
                </div>
              </button>

            </div>
          </div>
        </div>

        {error && (
          <div className="max-w-4xl mx-auto mb-6 p-4 rounded-xl bg-error-container text-on-error-container font-label-md text-label-md flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px]">error</span>
            <span>{error}</span>
          </div>
        )}

        {/* 3. Form Core Containers */}
        <div className="max-w-4xl mx-auto space-y-6">
          
          {/* STEP 1: Identité & Cabinet */}
          {currentStep === 1 && (
            <section className="space-y-6">
              
              {/* Section A */}
              <div className="bg-surface-container-lowest p-6 sm:p-8 rounded-xl shadow-sm border border-surface-container-high space-y-6">
                <div className="flex items-start justify-between border-b pb-4 border-surface-container-low">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-surface-container-low text-primary flex items-center justify-center shrink-0 font-bold">
                      <span className="material-symbols-outlined text-[24px]">stethoscope</span>
                    </div>
                    <div>
                      <h2 className="font-headline-md text-headline-md text-on-surface font-semibold">Informations Personnelles &amp; Titularisation</h2>
                      <p className="font-body-sm text-body-sm text-on-surface-variant">Attestation de votre statut médical auprès de l'Ordre des Médecins.</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-surface-container-low text-primary font-label-sm text-label-sm font-semibold flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px]">verified_user</span> Réf. CNOM-TN
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="block font-label-lg text-label-lg text-on-surface">Nom &amp; Prénom du Médecin <span className="text-secondary">*</span></label>
                    <div className="relative">
                      <input 
                        type="text" 
                        value={doctorName}
                        onChange={(e) => setDoctorName(e.target.value)}
                        className="w-full h-11 pl-3.5 pr-10 rounded-lg bg-surface-container-low text-on-surface font-body-md text-body-md focus:outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary border border-outline-variant/50 transition-all"
                      />
                      <span className="absolute right-3 top-2.5 text-primary flex items-center gap-1 font-label-sm text-label-sm font-semibold">
                        <span className="material-symbols-outlined text-[18px]">check_circle</span>
                      </span>
                    </div>
                    <p className="font-label-sm text-label-sm text-primary flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">done</span> Conforme aux registres nationaux
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block font-label-lg text-label-lg text-on-surface">Numéro Inscription à l'Ordre (CNOM) <span className="text-secondary">*</span></label>
                    <div className="relative">
                      <input 
                        type="text" 
                        value={cnomNumber}
                        onChange={(e) => setCnomNumber(e.target.value)}
                        className="w-full h-11 pl-3.5 pr-28 rounded-lg bg-surface-container-low text-on-surface font-body-md text-body-md focus:outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary border border-outline-variant/50 transition-all font-mono tracking-wider"
                      />
                      <span className="absolute right-3 top-2.5 px-2 py-0.5 rounded bg-surface-container-high text-primary font-label-sm text-label-sm font-semibold">
                        Format vérifié
                      </span>
                    </div>
                    <p className="font-label-sm text-label-sm text-on-surface-variant">Série nationale enregistrée auprès du Conseil Régional</p>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block font-label-lg text-label-lg text-on-surface">Spécialité Principale <span className="text-secondary">*</span></label>
                    <div className="relative">
                      <select 
                        value={specialty}
                        onChange={(e) => setSpecialty(e.target.value)}
                        className="w-full h-11 pl-3.5 pr-10 rounded-lg bg-surface-container-low text-on-surface font-body-md text-body-md focus:outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary border border-outline-variant/50 transition-all appearance-none cursor-pointer"
                      >
                        <option value="cardio">Cardiologie &amp; Maladies Vasculaires</option>
                        <option value="med_gen">Médecine Générale</option>
                        <option value="pediatrie">Pédiatrie &amp; Néonatologie</option>
                        <option value="dermato">Dermatologie &amp; Vénérologie</option>
                        <option value="gyneco">Gynécologie &amp; Obstétrique</option>
                        <option value="ophtalmo">Ophtalmologie</option>
                      </select>
                      <span className="material-symbols-outlined absolute right-3 top-3 pointer-events-none text-on-surface-variant text-[20px]">expand_more</span>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block font-label-lg text-label-lg text-on-surface">Téléphone Mobile Professionnel <span className="text-secondary">*</span></label>
                    <div className="relative flex items-center">
                      <div className="absolute left-3 flex items-center gap-1.5 text-on-surface-variant font-label-md text-label-md pointer-events-none">
                        <span className="w-4 h-3 bg-secondary rounded-xs flex items-center justify-center text-on-secondary text-[8px] font-bold">TN</span>
                        <span>+216</span>
                      </div>
                      <input 
                        type="tel" 
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full h-11 pl-20 pr-24 rounded-lg bg-surface-container-low text-on-surface font-body-md text-body-md focus:outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary border border-outline-variant/50 transition-all"
                      />
                      <span className="absolute right-3 px-2 py-0.5 rounded-full bg-surface-container text-primary font-label-sm text-label-sm font-semibold flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">sms</span> Validé
                      </span>
                    </div>
                    <p className="font-label-sm text-label-sm text-on-surface-variant">Utilisé pour les alertes de garde et 2FA SMS</p>
                  </div>

                  <div className="md:col-span-2 space-y-1.5">
                    <label className="block font-label-lg text-label-lg text-on-surface">Courriel Professionnel Direct <span className="text-secondary">*</span></label>
                    <div className="relative">
                      <input 
                        type="email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full h-11 pl-10 pr-4 rounded-lg bg-surface-container-low text-on-surface font-body-md text-body-md focus:outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary border border-outline-variant/50 transition-all"
                      />
                      <span className="material-symbols-outlined absolute left-3 top-2.5 text-on-surface-variant text-[20px]">mail</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section B */}
              <div className="bg-surface-container-lowest p-6 sm:p-8 rounded-xl shadow-sm border border-surface-container-high space-y-6">
                <div className="flex items-start justify-between border-b pb-4 border-surface-container-low">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-surface-container-low text-primary flex items-center justify-center shrink-0 font-bold">
                      <span className="material-symbols-outlined text-[24px]">local_hospital</span>
                    </div>
                    <div>
                      <h2 className="font-headline-md text-headline-md text-on-surface font-semibold">Structure Clinique &amp; Localisation</h2>
                      <p className="font-body-sm text-body-sm text-on-surface-variant">Lieu d'exercice pour le référencement des patients et les feuilles CNAM.</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded bg-secondary-fixed text-on-secondary-fixed-variant font-label-sm text-label-sm font-semibold">
                    Convention CNAM
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="block font-label-lg text-label-lg text-on-surface">Nom de l'Établissement ou Cabinet <span className="text-secondary">*</span></label>
                    <input 
                      type="text" 
                      value={clinicName}
                      onChange={(e) => setClinicName(e.target.value)}
                      className="w-full h-11 px-3.5 rounded-lg bg-surface-container-low text-on-surface font-body-md text-body-md focus:outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary border border-outline-variant/50 transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block font-label-lg text-label-lg text-on-surface">Gouvernorat d'Exercice <span className="text-secondary">*</span></label>
                    <div className="relative">
                      <select 
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full h-11 pl-3.5 pr-10 rounded-lg bg-surface-container-low text-on-surface font-body-md text-body-md focus:outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary border border-outline-variant/50 transition-all appearance-none cursor-pointer"
                      >
                        <option value="tunis">Tunis (Capitale)</option>
                        <option value="ariana">Ariana</option>
                        <option value="benarous">Ben Arous</option>
                        <option value="sousse">Sousse</option>
                        <option value="sfax">Sfax</option>
                        <option value="monastir">Monastir</option>
                        <option value="nabeul">Nabeul</option>
                      </select>
                      <span className="material-symbols-outlined absolute right-3 top-3 pointer-events-none text-on-surface-variant text-[20px]">expand_more</span>
                    </div>
                  </div>

                  <div className="md:col-span-2 space-y-1.5">
                    <label className="block font-label-lg text-label-lg text-on-surface">Adresse Postale Complète &amp; Étage <span className="text-secondary">*</span></label>
                    <input 
                      type="text" 
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full h-11 px-3.5 rounded-lg bg-surface-container-low text-on-surface font-body-md text-body-md focus:outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary border border-outline-variant/50 transition-all"
                    />
                  </div>

                  <div className="md:col-span-2 p-4 rounded-xl bg-surface-container-low flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-surface-container-high">
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-full bg-surface-container-lowest text-primary flex items-center justify-center shrink-0 mt-0.5 font-bold shadow-sm">
                        <span className="material-symbols-outlined text-[20px]">fact_check</span>
                      </div>
                      <div>
                        <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold">Conventionnement avec la Caisse Nationale d'Assurance Maladie (CNAM)</h3>
                        <p className="font-body-sm text-body-sm text-on-surface-variant">Générez automatiquement les bordereaux mensuels filière privée &amp; médecin de famille.</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer shrink-0">
                      <input 
                        type="checkbox" 
                        checked={cnamConvention}
                        onChange={(e) => setCnamConvention(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-12 h-6 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>

                </div>
              </div>

            </section>
          )}

          {/* STEP 2: Équipe & Secrétariat */}
          {currentStep === 2 && (
            <section className="space-y-6">
              <div className="bg-surface-container-lowest p-6 sm:p-8 rounded-xl shadow-sm border border-surface-container-high space-y-6">
                <div className="flex items-start justify-between border-b pb-4 border-surface-container-low">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-surface-container-low text-primary flex items-center justify-center shrink-0 font-bold">
                      <span className="material-symbols-outlined text-[24px]">group_add</span>
                    </div>
                    <div>
                      <h2 className="font-headline-md text-headline-md text-on-surface font-semibold">Équipe de Secrétariat &amp; Assistants Médicaux</h2>
                      <p className="font-body-sm text-body-sm text-on-surface-variant">Déléguez la prise de rendez-vous, la salle d'attente et l'accueil en toute sécurité.</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-surface-container text-on-surface-variant font-label-sm text-label-sm font-medium">
                    Optionnel
                  </span>
                </div>

                <div className="p-4 rounded-lg bg-surface-container-low flex items-center gap-3 border border-surface-container-high">
                  <span className="material-symbols-outlined text-primary text-[22px] shrink-0">info</span>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    Vous pourrez inviter vos collaboratrices et assistants médicaux dès aujourd'hui ou ultérieurement depuis vos paramètres de cabinet.
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="p-4 rounded-xl bg-surface-container-low flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-surface-container-high">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-secondary-fixed text-on-secondary-fixed flex items-center justify-center font-headline-sm text-headline-sm font-bold">
                        AT
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-headline-sm text-headline-sm text-on-surface font-semibold">{assistantName}</span>
                          <span className="px-2 py-0.5 rounded-full bg-surface-container-high text-primary font-label-sm text-label-sm font-medium">Prêt pour invitation</span>
                        </div>
                        <span className="font-body-sm text-body-sm text-on-surface-variant">Secrétaire Médicale Principale • {assistantEmail}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                      <span className="font-label-md text-label-md text-on-surface-variant bg-surface-container-lowest px-3 py-1.5 rounded-lg shadow-sm border border-outline-variant/40">
                        Agenda &amp; Accueil
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-surface-container flex flex-col md:flex-row items-center gap-3">
                  <div className="flex-1 w-full">
                    <input 
                      type="text" 
                      value={newCollabName}
                      onChange={(e) => setNewCollabName(e.target.value)}
                      placeholder="Nom et prénom du collaborateur"
                      className="w-full h-10 px-3 rounded-lg bg-surface-container-lowest text-on-surface font-body-sm text-body-sm focus:outline-none focus:ring-2 focus:ring-primary border border-outline-variant/40"
                    />
                  </div>
                  <div className="flex-1 w-full">
                    <input 
                      type="email" 
                      value={newCollabEmail}
                      onChange={(e) => setNewCollabEmail(e.target.value)}
                      placeholder="Adresse courriel professionnelle"
                      className="w-full h-10 px-3 rounded-lg bg-surface-container-lowest text-on-surface font-body-sm text-body-sm focus:outline-none focus:ring-2 focus:ring-primary border border-outline-variant/40"
                    />
                  </div>
                  <button 
                    type="button"
                    onClick={() => {
                      if (newCollabName) {
                        setAssistantName(newCollabName);
                        if (newCollabEmail) setAssistantEmail(newCollabEmail);
                        setNewCollabName('');
                        setNewCollabEmail('');
                      }
                    }}
                    className="w-full md:w-auto px-4 h-10 rounded-lg bg-primary text-on-primary font-label-md text-label-md font-semibold flex items-center justify-center gap-1.5 shrink-0 shadow-sm hover:bg-primary-container"
                  >
                    <span className="material-symbols-outlined text-[18px]">add</span>
                    <span>Ajouter</span>
                  </button>
                </div>

                <div className="pt-2">
                  <label className="flex items-start gap-3 cursor-pointer select-none">
                    <input type="checkbox" defaultChecked className="mt-1 h-5 w-5 rounded text-primary focus:ring-primary accent-primary" />
                    <div>
                      <span className="font-label-lg text-label-lg text-on-surface font-semibold block">Autoriser la gestion déléguée des bordereaux CNAM</span>
                      <span className="font-body-sm text-body-sm text-on-surface-variant block">Le secrétariat peut préparer les récapitulatifs sans accès aux détails cliniques intimes.</span>
                    </div>
                  </label>
                </div>

              </div>
            </section>
          )}

          {/* STEP 3: Choix du Forfait */}
          {currentStep === 3 && (
            <section className="space-y-6">
              <div className="bg-surface-container-lowest p-6 sm:p-8 rounded-xl shadow-sm border border-surface-container-high space-y-6">
                <div className="text-center max-w-xl mx-auto space-y-2">
                  <h2 className="font-headline-md text-headline-md text-on-surface font-semibold">Formules Claires Adaptées à Votre Pratique</h2>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">Facturation transparente en Dinars Tunisiens (TND). Sans engagement de durée.</p>
                  
                  <div className="pt-4 flex items-center justify-center gap-3">
                    <span className={`font-label-md text-label-md ${!isAnnual ? 'font-bold text-on-surface' : 'text-on-surface-variant'}`}>Facturation mensuelle</span>
                    <button 
                      onClick={() => setIsAnnual(!isAnnual)}
                      className="w-12 h-6 bg-primary rounded-full relative p-0.5 cursor-pointer shadow-inner"
                      type="button"
                    >
                      <div className={`w-5 h-5 bg-surface-container-lowest rounded-full shadow-sm transition-all ${isAnnual ? 'ml-auto' : 'mr-auto'}`}></div>
                    </button>
                    <div className="flex items-center gap-1.5">
                      <span className={`font-label-md text-label-md ${isAnnual ? 'font-bold text-on-surface' : 'text-on-surface-variant'}`}>Facturation annuelle</span>
                      <span className="px-2 py-0.5 rounded-full bg-secondary text-on-secondary font-label-sm text-label-sm font-bold tracking-wide">
                        -20% d'économie
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                  
                  {/* Local Storage Plan */}
                  <div 
                    onClick={() => setSelectedPlan('local')}
                    className={`p-6 rounded-2xl transition-all relative flex flex-col justify-between cursor-pointer border ${
                      selectedPlan === 'local' ? 'bg-surface-container-low ring-2 ring-primary border-primary' : 'bg-surface-container-low hover:shadow-md border-surface-container-high'
                    }`}
                  >
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">Stockage Local</h3>
                          <p className="font-body-sm text-body-sm text-on-surface-variant">Cabinet autonome mono-poste</p>
                        </div>
                        <span className="material-symbols-outlined text-outline text-[24px]">desktop_windows</span>
                      </div>
                      <div className="flex items-baseline gap-1">
                        <span className="font-headline-xl text-headline-xl text-on-surface font-extrabold">{isAnnual ? '55' : '69'}</span>
                        <span className="font-headline-sm text-headline-sm text-on-surface-variant font-medium">TND</span>
                        <span className="font-label-sm text-label-sm text-on-surface-variant">/ mois</span>
                      </div>
                      <ul className="space-y-2.5 pt-2 text-on-surface-variant font-body-sm text-body-sm">
                        <li className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-primary text-[18px]">check</span>
                          <span>Installation sur serveur ou PC cabinet</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-primary text-[18px]">check</span>
                          <span>Dossier Médical &amp; Ordonnances Bilingues</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-primary text-[18px]">check</span>
                          <span>Module Feuilles de Soins CNAM</span>
                        </li>
                      </ul>
                    </div>
                  </div>

                  {/* Cloud HDS Plan */}
                  <div 
                    onClick={() => setSelectedPlan('cloud_hds')}
                    className={`p-6 rounded-2xl shadow-md relative flex flex-col justify-between cursor-pointer border ${
                      selectedPlan === 'cloud_hds' ? 'bg-surface-container-lowest ring-2 ring-primary border-primary' : 'bg-surface-container-lowest border-surface-container-high'
                    }`}
                  >
                    <div className="absolute -top-3 right-6 px-3 py-0.5 rounded-full bg-primary text-on-primary font-label-sm text-label-sm font-bold uppercase tracking-wider">
                      Recommandé Praticiens
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">Cloud HDS Sécurisé</h3>
                          <p className="font-body-sm text-body-sm text-on-surface-variant">Pratique moderne &amp; mobilité intégrale</p>
                        </div>
                        <span className="material-symbols-outlined text-primary text-[28px]">cloud_done</span>
                      </div>
                      <div className="flex items-baseline gap-1">
                        <span className="font-headline-xl text-headline-xl text-primary font-extrabold">{isAnnual ? '95' : '119'}</span>
                        <span className="font-headline-sm text-headline-sm text-primary font-semibold">TND</span>
                        <span className="font-label-sm text-label-sm text-on-surface-variant">/ mois</span>
                      </div>
                      <ul className="space-y-2.5 pt-2 text-on-surface font-body-sm text-body-sm">
                        <li className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-primary text-[18px]">check_circle</span>
                          <span className="font-medium">Sauvegarde continue 3 sites certifiés HDS</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-primary text-[18px]">check_circle</span>
                          <span>Synchronisation temps réel médecin &amp; secrétariat</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-primary text-[18px]">check_circle</span>
                          <span>Accès multi-écrans sécurisé (PC, Mac, iPad)</span>
                        </li>
                      </ul>
                    </div>
                  </div>

                </div>
              </div>
            </section>
          )}

          {/* STEP 4: Vérification & Envoi */}
          {currentStep === 4 && (
            <section className="space-y-6">
              <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-surface-container-high space-y-4">
                
                <div className="p-4 rounded-xl bg-secondary-fixed/40 border border-secondary-fixed flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-secondary text-on-secondary flex items-center justify-center shrink-0 font-bold">
                    <span className="material-symbols-outlined text-[24px]">verified_user</span>
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">
                      Délai d'instruction du dossier : 48 heures ouvrées
                    </h3>
                    <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                      Votre compte praticien ne sera activé qu'après validation de votre inscription auprès du <strong>Conseil National de l'Ordre des Médecins (CNOM)</strong> et vérification de conformité INPDP. Aucun prélèvement bancaire ne sera initié avant l'activation formelle.
                    </p>
                  </div>
                </div>

                <div className="rounded-lg bg-surface-container-low p-5 space-y-4 border border-surface-container-high">
                  <h4 className="font-label-lg text-label-lg text-on-surface font-bold uppercase tracking-wider">Synthèse du Dossier Déposé</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-body-sm font-body-sm">
                    <div>
                      <span className="text-on-surface-variant block font-label-sm text-label-sm">Praticien déclarant :</span>
                      <span className="font-semibold text-on-surface">{doctorName}</span>
                      <span className="text-outline block text-[13px]">Insc. CNOM : {cnomNumber}</span>
                    </div>
                    <div>
                      <span className="text-on-surface-variant block font-label-sm text-label-sm">Cabinet :</span>
                      <span className="font-semibold text-on-surface">{clinicName}</span>
                      <span className="text-outline block text-[13px]">{city} • {cnamConvention ? 'Conventionné CNAM' : 'Non conventionné'}</span>
                    </div>
                    <div>
                      <span className="text-on-surface-variant block font-label-sm text-label-sm">Formule souscrite :</span>
                      <span className="font-semibold text-primary">{selectedPlan === 'cloud_hds' ? 'Cloud HDS Sécurisé (95 TND / mois)' : 'Stockage Local (55 TND / mois)'}</span>
                    </div>
                    <div>
                      <span className="text-on-surface-variant block font-label-sm text-label-sm">Secrétariat invité :</span>
                      <span className="font-semibold text-on-surface">{assistantName} ({assistantEmail})</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-surface-container flex flex-col sm:flex-row items-center justify-between gap-4 border border-surface-container-high">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-primary text-[28px]">description</span>
                    <div>
                      <span className="font-label-lg text-label-lg font-semibold text-on-surface block">Attestation d'inscription à l'Ordre</span>
                      <span className="font-label-sm text-label-sm text-on-surface-variant block">PDF ou Scan JPEG haute résolution (Max 10 Mo)</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-label-sm text-label-sm text-primary font-semibold flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px]">check_circle</span> {fileName}
                    </span>
                  </div>
                </div>

                <div className="pt-4 space-y-3">
                  <label className="flex items-start gap-3 cursor-pointer select-none">
                    <input 
                      type="checkbox" 
                      checked={honestyChecked}
                      onChange={(e) => setHonestyChecked(e.target.checked)}
                      className="mt-1 h-5 w-5 rounded text-primary focus:ring-primary accent-primary" 
                    />
                    <span className="font-body-sm text-body-sm text-on-surface">
                      Je certifie sur l'honneur l'exactitude des informations mentionnées ci-dessus et mon inscription régulière au Conseil National de l'Ordre des Médecins de Tunisie.
                    </span>
                  </label>

                  <label className="flex items-start gap-3 cursor-pointer select-none">
                    <input 
                      type="checkbox" 
                      checked={inpdpChecked}
                      onChange={(e) => setInpdpChecked(e.target.checked)}
                      className="mt-1 h-5 w-5 rounded text-primary focus:ring-primary accent-primary" 
                    />
                    <span className="font-body-sm text-body-sm text-on-surface">
                      J'accepte les conditions de traitement des données de santé à caractère personal conformément aux dispositions de la loi organique tunisienne n° 2004-63 et aux directives de l'INPDP.
                    </span>
                  </label>
                </div>

              </div>
            </section>
          )}

          {/* 4. Unified Sticky Action Footer */}
          <div className="bg-surface-container-lowest p-4 sm:p-5 rounded-xl shadow-sm border border-surface-container-high flex flex-col sm:flex-row items-center justify-between gap-4">
            <button
              onClick={handlePrevStep}
              disabled={currentStep === 1}
              className={`w-full sm:w-auto px-5 h-11 rounded-lg bg-surface-container-low text-on-surface-variant font-label-lg text-label-lg font-semibold flex items-center justify-center gap-2 transition-colors ${
                currentStep === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-surface-container hover:text-on-surface'
              }`}
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">arrow_back</span>
              <span>Précédent</span>
            </button>

            <div className="flex items-center gap-2 text-on-surface-variant font-label-sm text-label-sm">
              <span className="material-symbols-outlined text-primary text-[16px]">cloud_done</span>
              <span>Brouillon sauvegardé automatiquement</span>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              {currentStep < 4 ? (
                <button
                  onClick={handleNextStep}
                  className="w-full sm:w-auto px-6 h-11 rounded-lg bg-primary text-on-primary font-label-lg text-label-lg font-bold flex items-center justify-center gap-2 hover:bg-primary-container transition-all shadow-sm"
                  type="button"
                >
                  <span>Continuer vers l'Étape {currentStep + 1}</span>
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </button>
              ) : (
                <button
                  onClick={handleFinalSubmit}
                  disabled={submitting}
                  className="w-full sm:w-auto px-6 h-11 rounded-lg bg-secondary text-on-secondary font-label-lg text-label-lg font-bold flex items-center justify-center gap-2 hover:bg-secondary-container transition-all shadow-md"
                  type="button"
                >
                  {submitting ? (
                    <span>Déposement du dossier...</span>
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

        </div>
      </div>
    </div>
  );
}
