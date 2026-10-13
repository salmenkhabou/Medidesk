import React, { useState, useEffect } from 'react';

export default function PatientMedicalRecordView({ setView }) {
  const [activeTab, setActiveTab] = useState('consultations');
  const [searchTerm, setSearchTerm] = useState('');
  const [specialtyFilter, setSpecialtyFilter] = useState('all');
  const [recordData, setRecordData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/patient/medical-record')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setRecordData(data);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error loading medical record:', err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="w-full min-h-[60vh] flex items-center justify-center p-8">
        <div className="flex flex-col items-center gap-3">
          <span className="material-symbols-outlined text-4xl text-primary animate-spin">progress_activity</span>
          <p className="font-label-lg text-on-surface-variant font-medium">Chargement du Dossier Médical Partagé...</p>
        </div>
      </div>
    );
  }

  const patient = recordData?.patient || {
    name: 'Yasmine Ben Amor',
    dossierCode: 'TN-8831',
    cin: '••••892',
    birthDate: '14 Mars 1989 (35 ans)',
    bloodGroup: 'Groupe O Rh+',
    cnamAffiliation: 'CNAM - Filière Publique (Valide)',
    uniqueId: 'TUN-19890314-8831',
    doctorReferent: 'Dr. Karim Ben Mahmoud',
    emergencyContact: 'Sami (Époux) +216 22 123 456'
  };

  return (
    <div className="w-full bg-surface min-h-screen flex flex-col pb-16">
      {/* Breadcrumb & Utility Header */}
      <div className="w-full px-4 sm:px-8 py-4 bg-surface-container-lowest border-b border-surface-container-high">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex flex-col gap-1">
            <nav className="flex items-center gap-2 text-sm text-outline">
              <button onClick={() => setView('patient-dashboard')} className="hover:text-primary transition-colors">
                Accueil
              </button>
              <span className="material-symbols-outlined text-[16px]">chevron_right</span>
              <span className="text-on-surface font-semibold">Mon Dossier Médical Partagé</span>
            </nav>
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <h1 className="font-headline-lg text-headline-lg text-on-surface font-bold">Mon Dossier Médical</h1>
              <span className="inline-flex items-center gap-1 bg-surface-container-high px-3 py-1 rounded-full text-primary font-label-sm font-semibold">
                <span className="material-symbols-outlined text-[14px]">verified</span>
                Vérifié INPDP &amp; HDS
              </span>
            </div>
            <p className="text-sm text-on-surface-variant flex items-center gap-1.5 pt-0.5">
              <span className="material-symbols-outlined text-[16px] text-primary">sync</span>
              Dernière mise à jour par <strong>Dr. Karim Ben Mahmoud</strong> le 24 Octobre 2024
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button 
              onClick={() => setView('patient-account-settings')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-surface-container-low text-primary font-label-md hover:bg-surface-container transition-colors"
            >
              <span class="material-symbols-outlined text-[18px]">share</span>
              Partager l'accès médecin
            </button>
            <button 
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-on-primary font-label-md hover:bg-primary-container shadow-sm transition-all font-semibold"
            >
              <span className="material-symbols-outlined text-[18px]">download</span>
              Télécharger l'historique complet (PDF)
            </button>
          </div>
        </div>
      </div>

      {/* Main Viewport Container */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-8 py-6 flex flex-col gap-6">

        {/* Identity & Clinical Summary Bento Profile */}
        <div className="w-full bg-surface-container-lowest rounded-2xl p-6 shadow-sm border border-surface-container-high">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Identity Column */}
            <div className="lg:col-span-4 flex flex-col gap-4">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full bg-primary-container text-on-primary font-headline-md flex items-center justify-center font-bold text-xl shadow-sm">
                    YB
                  </div>
                  <span className="absolute bottom-0 right-0 w-5 h-5 rounded-full bg-emerald-500 ring-2 ring-surface-container-lowest flex items-center justify-center text-[10px] text-white">
                    <span className="material-symbols-outlined text-[12px]">check</span>
                  </span>
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-headline-md text-headline-md text-on-surface font-bold truncate">{patient.name}</span>
                  <div className="flex items-center gap-2 text-outline font-label-sm text-sm">
                    <span>Dossier #{patient.dossierCode}</span>
                    <span>•</span>
                    <span>CIN : {patient.cin}</span>
                  </div>
                  <div className="flex items-center gap-2 pt-1">
                    <span className="bg-surface-container-low px-2.5 py-0.5 rounded text-on-surface-variant text-xs font-medium">{patient.birthDate}</span>
                    <span className="bg-primary/10 text-primary text-xs px-2.5 py-0.5 rounded font-bold">{patient.bloodGroup}</span>
                  </div>
                </div>
              </div>

              {/* Insurance info */}
              <div className="bg-surface-container-low p-3.5 rounded-xl flex flex-col gap-1.5 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-outline text-xs">Affiliation :</span>
                  <span className="font-label-md text-on-surface flex items-center gap-1.5 font-semibold text-xs">
                    <span className="w-2 h-2 rounded-full bg-primary"></span>
                    {patient.cnamAffiliation}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-outline text-xs">Identifiant Unique :</span>
                  <span className="font-label-sm text-on-surface-variant font-mono text-xs">{patient.uniqueId}</span>
                </div>
              </div>

              {/* Contacts */}
              <div className="flex flex-col gap-2 pt-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-outline flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px] text-primary">stethoscope</span>
                    Médecin Référent :
                  </span>
                  <span className="text-primary font-semibold">{patient.doctorReferent}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-outline flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px] text-secondary">contact_emergency</span>
                    Contact d'urgence :
                  </span>
                  <span className="text-on-surface font-medium">{patient.emergencyContact}</span>
                </div>
              </div>
            </div>

            {/* Allergies & Chronic Conditions */}
            <div className="lg:col-span-8 flex flex-col gap-4">
              
              {/* Critical Allergies Alert */}
              <div className="bg-red-50 border border-red-200 p-4 rounded-xl flex flex-col gap-2">
                <div className="flex items-center gap-2 text-red-800 font-bold text-xs uppercase tracking-wide">
                  <span className="material-symbols-outlined text-red-600 text-[20px]">warning</span>
                  Contre-indications &amp; Allergies Médicamenteuses Majeures
                </div>
                <div className="flex flex-wrap gap-2 pt-1">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white text-red-700 font-label-md text-xs shadow-xs font-semibold border border-red-100">
                    <span className="material-symbols-outlined text-[16px] text-red-600">emergency</span>
                    Pénicilline &amp; Bêta-lactamines (Choc anaphylactique)
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white text-orange-700 font-label-md text-xs shadow-xs font-semibold border border-orange-100">
                    <span className="material-symbols-outlined text-[16px] text-orange-600">block</span>
                    AINS / Ibuprofène (Érythème pigmenté)
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white text-slate-700 font-label-md text-xs shadow-xs border border-slate-200">
                    <span className="material-symbols-outlined text-[16px] text-slate-500">touch_app</span>
                    Latex naturel (Contact cutané léger)
                  </span>
                </div>
              </div>

              {/* Chronic Conditions & Active Treatments */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-surface-container-low flex flex-col gap-2">
                  <span className="font-label-sm text-xs text-outline flex items-center gap-1 font-semibold">
                    <span className="material-symbols-outlined text-[16px] text-primary">monitor_heart</span>
                    Pathologies chroniques déclarées
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    <span className="px-3 py-1 rounded-full bg-surface-container-lowest text-primary text-xs font-semibold shadow-xs border border-surface-container">
                      Hypertension Artérielle (Stade 1)
                    </span>
                    <span className="px-3 py-1 rounded-full bg-surface-container-lowest text-primary text-xs font-semibold shadow-xs border border-surface-container">
                      Dyslipidémie mixte modérée
                    </span>
                  </div>
                </div>
                <div className="p-3.5 rounded-xl bg-surface-container-low flex flex-col gap-2">
                  <span className="font-label-sm text-xs text-outline flex items-center gap-1 font-semibold">
                    <span className="material-symbols-outlined text-[16px] text-primary">medical_information</span>
                    Traitements de fond en cours
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    <span className="px-3 py-1 rounded-full bg-surface-container-lowest text-on-surface text-xs font-medium shadow-xs border border-surface-container">
                      Bisoprolol 5mg (1/j)
                    </span>
                    <span className="px-3 py-1 rounded-full bg-surface-container-lowest text-on-surface text-xs font-medium shadow-xs border border-surface-container">
                      Périndopril 4mg (1/j)
                    </span>
                    <span className="px-3 py-1 rounded-full bg-surface-container-lowest text-on-surface text-xs font-medium shadow-xs border border-surface-container">
                      Diffu-K (1/j)
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Vitals Summary Bar */}
              <div className="flex flex-wrap items-center justify-between p-3.5 rounded-xl bg-surface-container text-sm">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">ecg_heart</span>
                  <span className="text-on-surface font-semibold text-xs">Dernier relevé clinique :</span>
                  <span className="text-on-surface-variant text-xs">24 Oct. 2024</span>
                </div>
                <div className="flex items-center gap-4 text-xs">
                  <div>
                    <span className="text-outline">TA : </span>
                    <span className="text-primary font-bold">12.8 / 8.2</span>
                  </div>
                  <div>
                    <span className="text-outline">FC : </span>
                    <span className="text-on-surface font-bold">68 bpm</span>
                  </div>
                  <div>
                    <span className="text-outline">Poids : </span>
                    <span className="text-on-surface font-bold">64.2 kg</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Tabbed Navigation Bar */}
        <div className="w-full flex flex-col gap-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-surface-container-high">
            <button
              onClick={() => setActiveTab('consultations')}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl font-label-lg transition-all text-sm whitespace-nowrap ${
                activeTab === 'consultations'
                  ? 'bg-primary text-on-primary shadow-sm font-bold'
                  : 'text-on-surface-variant hover:bg-surface-container-low'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">clinical_notes</span>
              <span>Consultations</span>
              <span className={`text-xs px-2 py-0.5 rounded-full ${activeTab === 'consultations' ? 'bg-primary-container text-on-primary' : 'bg-surface-container-high text-on-surface-variant'}`}>
                3
              </span>
            </button>

            <button
              onClick={() => setActiveTab('ordonnances')}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl font-label-lg transition-all text-sm whitespace-nowrap ${
                activeTab === 'ordonnances'
                  ? 'bg-primary text-on-primary shadow-sm font-bold'
                  : 'text-on-surface-variant hover:bg-surface-container-low'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">prescriptions</span>
              <span>Ordonnances</span>
              <span className={`text-xs px-2 py-0.5 rounded-full ${activeTab === 'ordonnances' ? 'bg-primary-container text-on-primary' : 'bg-surface-container-high text-on-surface-variant'}`}>
                2
              </span>
            </button>

            <button
              onClick={() => setActiveTab('constantes')}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl font-label-lg transition-all text-sm whitespace-nowrap ${
                activeTab === 'constantes'
                  ? 'bg-primary text-on-primary shadow-sm font-bold'
                  : 'text-on-surface-variant hover:bg-surface-container-low'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">query_stats</span>
              <span>Constantes &amp; Graphiques</span>
            </button>

            <button
              onClick={() => setActiveTab('documents')}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl font-label-lg transition-all text-sm whitespace-nowrap ${
                activeTab === 'documents'
                  ? 'bg-primary text-on-primary shadow-sm font-bold'
                  : 'text-on-surface-variant hover:bg-surface-container-low'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">folder_shared</span>
              <span>Documents &amp; Imagerie</span>
              <span className={`text-xs px-2 py-0.5 rounded-full ${activeTab === 'documents' ? 'bg-primary-container text-on-primary' : 'bg-surface-container-high text-on-surface-variant'}`}>
                3
              </span>
            </button>
          </div>

          {/* TAB 1: CONSULTATIONS */}
          {activeTab === 'consultations' && (
            <div className="flex flex-col gap-4">
              {/* Filter Bar */}
              <div className="flex flex-wrap items-center justify-between gap-4 bg-surface-container-lowest p-4 rounded-xl shadow-sm border border-surface-container-high">
                <div className="flex items-center gap-2 flex-1 min-w-[260px] bg-surface-container-low px-3 py-2 rounded-lg">
                  <span className="material-symbols-outlined text-outline">search</span>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Rechercher une visite, médecin ou motif..."
                    className="w-full bg-transparent text-sm focus:outline-none text-on-surface placeholder:text-outline"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-outline font-medium">Spécialité :</span>
                  <select
                    value={specialtyFilter}
                    onChange={(e) => setSpecialtyFilter(e.target.value)}
                    className="bg-surface-container-low text-on-surface text-xs rounded-lg px-3 py-2 focus:outline-none"
                  >
                    <option value="all">Toutes les spécialités</option>
                    <option value="cardiologie">Cardiologie</option>
                    <option value="dermatologie">Dermatologie</option>
                    <option value="ophtalmologie">Ophtalmologie</option>
                  </select>
                </div>
              </div>

              {/* Consultation Card 1 */}
              <div className="w-full bg-surface-container-lowest rounded-2xl p-6 shadow-sm border border-surface-container-high flex flex-col gap-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[28px]">cardiology</span>
                    </div>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-headline-sm text-headline-sm text-on-surface font-bold">Dr. Karim Ben Mahmoud</span>
                        <span className="material-symbols-outlined text-primary text-[18px]">verified</span>
                        <span className="text-xs font-semibold bg-surface-container px-2.5 py-0.5 rounded text-primary">Cardiologue</span>
                        <span className="text-outline text-xs">Clinique Alyssa, Tunis</span>
                      </div>
                      <span className="text-sm font-semibold text-on-surface pt-0.5">Suivi semestriel HTA et adaptation thérapeutique</span>
                      <span className="text-xs text-outline pt-0.5">Jeudi 24 Octobre 2024 à 10:15</span>
                    </div>
                  </div>
                  <span className="bg-emerald-50 text-emerald-700 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 self-start md:self-auto border border-emerald-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                    Dossier clôturé
                  </span>
                </div>

                <div className="bg-surface-container-low p-4 rounded-xl flex flex-col gap-2">
                  <div className="flex items-center gap-1.5 text-primary text-xs font-bold uppercase tracking-wide">
                    <span className="material-symbols-outlined text-[16px]">notes</span>
                    Notes et Constatations Cliniques
                  </div>
                  <p className="text-sm text-on-surface leading-relaxed">
                    Tension artérielle mesurée à 12.8 / 8.2 cmHg, fréquence cardiaque à 68 bpm au repos, rythme sinusal régulier. Bonne tolérance du traitement par Bisoprolol 5mg avec stabilisation tensionnelle. Adaptation du complément potassique (Diffu-K). Le bilan biologique réalisé au Laboratoire Berges du Lac est satisfaisant.
                  </p>
                  <div className="flex flex-wrap gap-2 pt-2">
                    <span className="bg-surface-container-lowest text-on-surface-variant text-xs font-semibold px-3 py-1 rounded shadow-xs border border-surface-container flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px] text-primary">medication</span>
                      Prescription émise (3 molécules)
                    </span>
                    <span className="bg-surface-container-lowest text-on-surface-variant text-xs font-semibold px-3 py-1 rounded shadow-xs border border-surface-container flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px] text-primary">send_and_archive</span>
                      Feuille de soins CNAM télétransmise
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                  <div className="flex items-center gap-2">
                    <button onClick={() => setActiveTab('ordonnances')} className="px-3.5 py-1.5 rounded-lg bg-surface-container text-primary text-xs font-semibold hover:bg-surface-container-high transition-colors flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px]">prescriptions</span>
                      Voir l'ordonnance liée
                    </button>
                    <button onClick={() => setActiveTab('documents')} className="px-3.5 py-1.5 rounded-lg bg-surface-container-low text-on-surface-variant text-xs font-semibold hover:text-on-surface transition-colors flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px]">ecg</span>
                      Électrocardiogramme (ECG)
                    </button>
                  </div>
                  <button onClick={() => window.print()} className="text-primary text-xs font-bold hover:underline flex items-center gap-1">
                    Télécharger le compte-rendu médical
                    <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                  </button>
                </div>
              </div>

              {/* Consultation Card 2 */}
              <div className="w-full bg-surface-container-lowest rounded-2xl p-6 shadow-sm border border-surface-container-high flex flex-col gap-3">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-orange-50 text-secondary flex items-center justify-center shrink-0 border border-orange-100">
                      <span className="material-symbols-outlined text-[28px]">dermatology</span>
                    </div>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-headline-sm text-headline-sm text-on-surface font-bold">Dr. Sonia Cherif</span>
                        <span className="text-xs font-semibold bg-surface-container px-2.5 py-0.5 rounded text-secondary">Dermatologue</span>
                        <span className="text-outline text-xs">Cabinet Médical Menzah V</span>
                      </div>
                      <span className="text-sm font-semibold text-on-surface pt-0.5">Bilan nævus et surveillance cutanée annuelle</span>
                      <span className="text-xs text-outline pt-0.5">Samedi 12 Octobre 2024 à 11:30</span>
                    </div>
                  </div>
                  <span className="bg-surface-container text-on-surface-variant text-xs font-semibold px-3 py-1 rounded-full self-start md:self-auto">
                    Contrôle annuel validé
                  </span>
                </div>
                <div className="p-3.5 bg-surface-container-low rounded-xl text-sm text-on-surface-variant">
                  Examen dermatoscopique systématique corps entier sans lésion mélanocytaire suspecte. Cartographie des nævus du dos stable par rapport à 2023.
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ORDONNANCES */}
          {activeTab === 'ordonnances' && (
            <div className="flex flex-col gap-4">
              <div className="w-full bg-surface-container-lowest rounded-2xl p-6 shadow-sm border border-surface-container-high flex flex-col gap-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary-container text-on-primary flex items-center justify-center">
                      <span className="material-symbols-outlined text-[26px]">medication_liquid</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-headline-sm text-headline-sm text-on-surface font-bold">Ordonnance N° 2024-8831-C</span>
                        <span className="bg-emerald-100 text-emerald-800 text-xs px-2.5 py-0.5 rounded-full font-bold">En cours de validité</span>
                      </div>
                      <span className="text-xs text-outline">Prescrite par Dr. Karim Ben Mahmoud le 24 Octobre 2024 (Valable jusqu'au 24 Janvier 2025)</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => setView('express-booking')}
                      className="px-4 py-2 rounded-lg bg-primary text-on-primary text-xs font-bold flex items-center gap-1.5 shadow-sm hover:bg-primary-container transition-colors"
                    >
                      <span className="material-symbols-outlined text-[16px]">qr_code_scanner</span>
                      Transmettre à ma pharmacie
                    </button>
                    <button 
                      onClick={() => window.print()}
                      className="px-4 py-2 rounded-lg bg-surface-container-low text-on-surface text-xs font-semibold flex items-center gap-1.5 hover:bg-surface-container transition-colors"
                    >
                      <span className="material-symbols-outlined text-[16px]">download</span>
                      PDF Certifié
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                  <div className="bg-surface-container-low p-4 rounded-xl flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between pb-1">
                        <span className="font-bold text-on-surface text-sm">Bisoprolol 5 mg</span>
                        <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded font-semibold">Comprimé</span>
                      </div>
                      <p className="text-xs text-on-surface-variant mt-1">1 comprimé chaque matin au petit déjeuner.</p>
                    </div>
                    <div className="pt-3 flex items-center justify-between text-xs text-outline">
                      <span>Délivrance : 1/3 boîtes</span>
                      <span className="text-emerald-700 font-bold">Renouvelable x2</span>
                    </div>
                  </div>

                  <div className="bg-surface-container-low p-4 rounded-xl flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between pb-1">
                        <span className="font-bold text-on-surface text-sm">Périndopril 4 mg</span>
                        <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded font-semibold">Comprimé</span>
                      </div>
                      <p className="text-xs text-on-surface-variant mt-1">1 comprimé par jour, le soir.</p>
                    </div>
                    <div className="pt-3 flex items-center justify-between text-xs text-outline">
                      <span>Délivrance : 1/3 boîtes</span>
                      <span className="text-emerald-700 font-bold">Renouvelable x2</span>
                    </div>
                  </div>

                  <div className="bg-surface-container-low p-4 rounded-xl flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between pb-1">
                        <span className="font-bold text-on-surface text-sm">Diffu-K 600 mg</span>
                        <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded font-semibold">Gélule</span>
                      </div>
                      <p className="text-xs text-on-surface-variant mt-1">1 gélule le midi au milieu du repas.</p>
                    </div>
                    <div className="pt-3 flex items-center justify-between text-xs text-outline">
                      <span>Délivrance : 1/3 boîtes</span>
                      <span className="text-emerald-700 font-bold">Renouvelable x2</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: CONSTANTES & GRAPHIQUES */}
          {activeTab === 'constantes' && (
            <div className="flex flex-col gap-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Tension Chart */}
                <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm border border-surface-container-high flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-primary text-[24px]">speed</span>
                      <div>
                        <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">Tension Artérielle (mmHg)</h3>
                        <span className="text-xs text-outline font-medium">Objectif clinique : &lt; 130/85 mmHg</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl text-primary font-bold">128 / 82</span>
                      <span className="block text-xs text-emerald-600 font-bold">Cible atteinte</span>
                    </div>
                  </div>

                  <div className="w-full h-44 flex flex-col justify-end pt-2">
                    <svg className="w-full h-36" viewBox="0 0 500 150" fill="none">
                      <rect x="0" y="70" width="500" height="50" fill="#a1f1eb" fillOpacity="0.15" />
                      <line x1="0" y1="70" x2="500" y2="70" stroke="#85d4cf" strokeDasharray="4 4" strokeWidth="1" />
                      <path d="M 30 20 L 150 45 L 280 60 L 400 78 L 470 75" stroke="#005451" strokeWidth="3.5" strokeLinecap="round" />
                      <path d="M 30 75 L 150 88 L 280 96 L 400 108 L 470 105" stroke="#fd8863" strokeWidth="2.5" strokeLinecap="round" />
                      <circle cx="30" cy="20" r="5" fill="#005451" />
                      <circle cx="150" cy="45" r="5" fill="#005451" />
                      <circle cx="280" cy="60" r="5" fill="#005451" />
                      <circle cx="400" cy="78" r="5" fill="#005451" />
                      <circle cx="470" cy="75" r="6" fill="#005451" stroke="#ffffff" strokeWidth="2" />
                    </svg>
                    <div className="flex justify-between text-xs text-outline font-medium pt-2 px-2">
                      <span>Mai (145/95)</span>
                      <span>Juil (138/90)</span>
                      <span>Août (134/86)</span>
                      <span>Sept (130/84)</span>
                      <span className="font-bold text-primary">24 Oct (128/82)</span>
                    </div>
                  </div>
                </div>

                {/* Weight Chart */}
                <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm border border-surface-container-high flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-primary text-[24px]">scale</span>
                      <div>
                        <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">Poids &amp; IMC</h3>
                        <span className="text-xs text-outline font-medium">Taille : 169 cm • IMC cible : 18.5 - 24.9</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl text-on-surface font-bold">64.2 <span className="text-base font-normal">kg</span></span>
                      <span className="block text-xs text-primary font-bold">IMC 22.4 (Normale)</span>
                    </div>
                  </div>

                  <div className="w-full h-44 flex flex-col justify-end pt-2">
                    <svg className="w-full h-36" viewBox="0 0 500 150" fill="none">
                      <defs>
                        <linearGradient id="weightGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#0f6e6a" stopOpacity="0.25" />
                          <stop offset="100%" stopColor="#0f6e6a" stopOpacity="0.0" />
                        </linearGradient>
                      </defs>
                      <path d="M 30 40 Q 150 50, 260 70 T 470 95 L 470 140 L 30 140 Z" fill="url(#weightGrad)" />
                      <path d="M 30 40 Q 150 50, 260 70 T 470 95" stroke="#0f6e6a" strokeWidth="3" strokeLinecap="round" />
                      <circle cx="470" cy="95" r="6" fill="#0f6e6a" stroke="#ffffff" strokeWidth="2" />
                    </svg>
                    <div className="flex justify-between text-xs text-outline font-medium pt-2 px-2">
                      <span>Mai (67.1 kg)</span>
                      <span>Juin (66.5 kg)</span>
                      <span>Août (65.4 kg)</span>
                      <span>Sept (64.8 kg)</span>
                      <span className="font-bold text-primary">Octobre (64.2 kg)</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB 4: DOCUMENTS & IMAGERIE */}
          {activeTab === 'documents' && (
            <div className="flex flex-col gap-4">
              <div 
                onClick={() => setView('patient-document-upload')}
                className="w-full border-2 border-dashed border-outline-variant bg-surface-container-lowest/60 hover:bg-surface-container-low transition-all rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer group"
              >
                <div className="w-14 h-14 rounded-full bg-primary-container/10 group-hover:bg-primary-container/20 text-primary flex items-center justify-center transition-transform group-hover:scale-105">
                  <span className="material-symbols-outlined text-[30px]">cloud_upload</span>
                </div>
                <span className="font-headline-sm text-headline-sm text-on-surface font-bold pt-3">
                  Glissez-déposez de nouveaux documents ou cliquez pour téléverser
                </span>
                <p className="text-xs text-on-surface-variant max-w-lg pt-1">
                  Formats acceptés : PDF, JPEG, PNG, DICOM jusqu'à 25 Mo. Chiffré AES-256 et certifié HDS.
                </p>
                <button 
                  onClick={(e) => { e.stopPropagation(); setView('patient-document-upload'); }}
                  className="mt-4 px-4 py-2 rounded-lg bg-primary text-on-primary font-label-md text-xs font-bold hover:bg-primary-container transition-colors shadow-sm"
                >
                  Ouvrir le module de téléversement
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-surface-container-lowest rounded-xl p-4 shadow-sm border border-surface-container-high flex flex-col justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-primary">
                      <span className="material-symbols-outlined text-[20px]">description</span>
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="font-bold text-xs text-on-surface truncate">Bilan_Biologique_18Oct2024.pdf</span>
                      <span className="text-[11px] text-outline">Laboratoire Berges du Lac • 1.4 Mo</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-end gap-2 pt-3">
                    <button onClick={() => window.print()} className="text-primary text-xs font-bold hover:underline flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px]">visibility</span>
                      Aperçu
                    </button>
                  </div>
                </div>

                <div className="bg-surface-container-lowest rounded-xl p-4 shadow-sm border border-surface-container-high flex flex-col justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-primary">
                      <span className="material-symbols-outlined text-[20px]">ecg</span>
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="font-bold text-xs text-on-surface truncate">Echo_Cardiaque_Alyssa.pdf</span>
                      <span className="text-[11px] text-outline">Clinique Alyssa • 6.2 Mo</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-end gap-2 pt-3">
                    <button onClick={() => window.print()} className="text-primary text-xs font-bold hover:underline flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px]">visibility</span>
                      Aperçu
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
