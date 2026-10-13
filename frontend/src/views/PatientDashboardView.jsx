import React, { useState, useEffect } from 'react';

export default function PatientDashboardView({ setView }) {
  const [dashboardData, setDashboardData] = useState(null);
  const [showPrepModal, setShowPrepModal] = useState(false);

  useEffect(() => {
    fetch('http://localhost:5000/api/patient/dashboard')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setDashboardData(data);
        }
      })
      .catch((err) => {
        console.warn('Backend offline, using fallback dashboard data');
      });
  }, []);

  const patient = dashboardData?.patient || {
    name: 'Yasmine Ben Amor',
    cin: '••••892',
    cnamCode: '8831920192',
    cnamAffiliation: 'CNAM — Filière Publique',
    validityDate: '31/12/2025'
  };

  const nextAppt = dashboardData?.upcomingAppointment || {
    id: 501,
    doctorName: 'Dr. Karim Ben Mahmoud',
    specialty: 'Cardiologie & Médecine Interne',
    date: 'Demain, Mardi 24 Octobre 2024 à 10:30',
    price: '70 TND',
    location: 'Clinique Alyssa • Cabinet 302, Centre Urbain Nord, Tunis',
    phone: '+216 71 888 999',
    status: 'Confirmé',
    workflowStep: 'Confirmé'
  };

  return (
    <div className="w-full bg-surface min-h-screen pb-20 pt-4">
      
      {/* Preparation Consignes Modal */}
      {showPrepModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-surface-container-lowest rounded-xl max-w-lg w-full p-6 shadow-2xl relative border border-surface-container-high animate-fadeIn">
            <div className="flex items-center justify-between pb-4 border-b border-surface-container-high">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined">clinical_notes</span>
                </div>
                <div>
                  <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">Consignes de Préparation</h3>
                  <p className="font-label-sm text-label-sm text-on-surface-variant">Consultation Dr. Karim Ben Mahmoud</p>
                </div>
              </div>
              <button
                onClick={() => setShowPrepModal(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="space-y-3 py-4">
              <div className="p-3 bg-surface-container-low rounded-lg flex items-start gap-3">
                <span className="material-symbols-outlined text-primary text-[22px] mt-0.5">ecg</span>
                <div>
                  <span className="font-label-lg text-label-lg text-on-surface font-semibold block">Électrocardiogramme (ECG) de contrôle</span>
                  <span className="font-body-sm text-body-sm text-on-surface-variant">Portez une tenue confortable et à ouverture aisée pour la pose rapide des électrodes thoraciques.</span>
                </div>
              </div>

              <div className="p-3 bg-surface-container-low rounded-lg flex items-start gap-3">
                <span className="material-symbols-outlined text-secondary text-[22px] mt-0.5">no_food</span>
                <div>
                  <span className="font-label-lg text-label-lg text-on-surface font-semibold block">Prise de sang / Bilan complémentaire</span>
                  <span className="font-body-sm text-body-sm text-on-surface-variant">Si une analyse lipidique d'appoint est prescrite sur place, être à jeun depuis 2 heures est préférable.</span>
                </div>
              </div>

              <div className="p-3 bg-surface-container rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-2 text-on-surface">
                  <span className="material-symbols-outlined text-primary">badge</span>
                  <span className="font-label-md text-label-md font-semibold">Documents à présenter : Carte CNAM & Bilan d'octobre</span>
                </div>
                <span className="font-label-sm text-label-sm text-primary font-bold">Obligatoire</span>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowPrepModal(false)}
                className="px-5 py-2.5 bg-primary text-on-primary font-label-lg text-label-lg rounded-lg hover:bg-primary-container font-bold"
              >
                Compris, j'ai noté
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 space-y-8">
        
        {/* SECTION 1: Welcome & Health Reassurance Status Banner */}
        <section className="relative overflow-hidden bg-surface-container-lowest rounded-xl p-6 shadow-sm border border-surface-container-high/60">
          <div className="absolute -right-16 -top-16 w-80 h-80 rounded-full bg-gradient-to-br from-primary-fixed/20 via-surface-container-high/40 to-transparent pointer-events-none blur-2xl"></div>
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-1 max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-surface-container font-label-sm text-label-sm text-primary font-medium mb-1">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                <span>Dossier #TN-8831</span>
                <span className="text-outline-variant">•</span>
                <span>Sécurisé INPDP Tunisie & HDS</span>
              </div>
              <h1 className="font-headline-xl text-headline-xl text-on-surface font-extrabold tracking-tight">
                Bonjour {patient.name} <span className="inline-block animate-bounce origin-bottom">👋</span>
              </h1>
              <p className="font-body-md text-body-md text-on-surface-variant max-w-2xl">
                Bienvenue sur votre espace de santé personnel. Vos données médicales sont à jour, synchronisées directement avec le cabinet de votre médecin traitant.
              </p>
              <div className="flex flex-wrap items-center gap-3 pt-2 font-label-sm text-label-sm text-on-surface-variant">
                <span className="inline-flex items-center gap-1 text-primary font-semibold">
                  <span className="material-symbols-outlined text-[16px]">sync</span>
                  Cabinet Dr. Karim Ben Mahmoud connecté
                </span>
                <span className="hidden sm:inline text-outline-variant">•</span>
                <span className="inline-flex items-center gap-1 text-on-surface-variant">
                  <span className="material-symbols-outlined text-[16px] text-tertiary">schedule</span>
                  Dernière mise à jour : Aujourd'hui à 09:15
                </span>
              </div>
            </div>

            {/* CNAM Card Pill */}
            <div className="bg-surface-container-low rounded-xl p-4 flex flex-col gap-2 min-w-[280px] border border-surface-container-high">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-surface-container-highest flex items-center justify-center text-primary shrink-0">
                  <span className="material-symbols-outlined text-[20px]">health_and_safety</span>
                </div>
                <div>
                  <span className="font-label-sm text-label-sm text-on-surface-variant block uppercase tracking-wider font-semibold">Couverture Sociale</span>
                  <span className="font-label-md text-label-md font-bold text-on-surface">{patient.cnamAffiliation}</span>
                </div>
              </div>
              <div className="flex items-center justify-between text-on-surface-variant font-label-sm text-label-sm bg-surface-container-lowest px-3 py-1 rounded-lg">
                <span>Validité des droits :</span>
                <span className="font-semibold text-primary">{patient.validityDate}</span>
              </div>
              <div className="flex items-center gap-1.5 text-secondary font-label-sm text-label-sm font-semibold">
                <span className="material-symbols-outlined text-[16px]">info</span>
                <span>Pensez à apporter votre carnet de soins.</span>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 2: HERO COMPONENT — Prochain Rendez-vous */}
        <section className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[22px]">calendar_clock</span>
              <h2 className="font-headline-md text-headline-md text-on-surface font-bold tracking-tight">Prochain Rendez-vous</h2>
            </div>
            <span className="font-label-sm text-label-sm bg-primary/10 text-primary px-3 py-1 rounded-full font-bold">
              Priorité Haute • Demain
            </span>
          </div>

          <div className="relative bg-surface-container-lowest rounded-xl shadow-md overflow-hidden p-6 border border-surface-container-high">
            <div className="absolute left-0 top-0 bottom-0 w-2 bg-primary"></div>
            <div className="space-y-6 pl-2">
              
              {/* Doctor Details & Workflow Pill Tracker */}
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <img
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover shadow-sm bg-surface-container-high"
                    alt="Dr Karim Ben Mahmoud"
                    src="https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=400&q=80"
                  />
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-label-sm text-label-sm uppercase tracking-wider px-2 py-0.5 rounded bg-surface-container text-primary font-bold">
                        {nextAppt.specialty}
                      </span>
                      <span className="font-label-sm text-label-sm text-on-surface-variant font-medium">
                        Consultation programmée
                      </span>
                    </div>
                    <h3 className="font-headline-lg text-headline-lg text-on-surface font-bold">
                      {nextAppt.doctorName}
                    </h3>
                    <div className="flex flex-wrap items-center gap-4 text-on-surface-variant font-body-sm text-body-sm">
                      <span className="flex items-center gap-1 font-bold text-primary">
                        <span className="material-symbols-outlined text-[18px]">alarm</span>
                        {nextAppt.date}
                      </span>
                      <span className="flex items-center gap-1 font-semibold">
                        <span className="material-symbols-outlined text-[18px] text-outline">payments</span>
                        {nextAppt.price} (Conventionné CNAM)
                      </span>
                    </div>
                  </div>
                </div>

                {/* Workflow Pill Tracker */}
                <div className="bg-surface-container-low p-1.5 rounded-xl flex flex-col sm:flex-row items-stretch sm:items-center gap-1 self-start border border-surface-container-high">
                  <div className="px-3 py-1.5 rounded-lg font-label-sm text-label-sm text-on-surface-variant flex items-center gap-1.5 opacity-60">
                    <span className="material-symbols-outlined text-[16px]">check_circle</span>
                    <span>En attente</span>
                  </div>
                  <div className="px-3 py-1.5 rounded-lg bg-surface-container-lowest shadow-sm font-label-sm text-label-sm text-primary font-bold flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                    </span>
                    <span>Confirmé</span>
                  </div>
                  <button 
                    onClick={() => setView('patient-queue-tracker')}
                    className="px-3 py-1.5 rounded-lg font-label-sm text-label-sm text-on-surface-variant hover:text-primary transition-colors flex items-center gap-1.5 font-semibold"
                  >
                    <span className="material-symbols-outlined text-[16px]">meeting_room</span>
                    <span>Salle d'attente</span>
                  </button>
                  <div className="px-3 py-1.5 rounded-lg font-label-sm text-label-sm text-on-surface-variant flex items-center gap-1.5 opacity-60">
                    <span className="material-symbols-outlined text-[16px]">stethoscope</span>
                    <span>En consultation</span>
                  </div>
                </div>
              </div>

              {/* Location & Priority Alert */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                <div className="bg-surface-container-low p-4 rounded-xl space-y-1 border border-surface-container-high">
                  <div className="flex items-center justify-between">
                    <span className="font-label-lg text-label-lg text-primary font-bold flex items-center gap-1">
                      <span className="material-symbols-outlined text-[20px]">domain</span>
                      {nextAppt.location}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 pt-2">
                    <button onClick={() => setView('patient-queue-tracker')} className="inline-flex items-center gap-1 font-label-sm text-label-sm text-primary font-bold hover:underline">
                      <span className="material-symbols-outlined text-[16px]">near_me</span>
                      Itinéraire & Suivi Direct
                    </button>
                    <span className="text-outline-variant">•</span>
                    <a href={`tel:${nextAppt.phone}`} className="inline-flex items-center gap-1 font-label-sm text-label-sm text-on-surface-variant hover:text-primary font-medium">
                      <span className="material-symbols-outlined text-[16px]">call</span>
                      {nextAppt.phone}
                    </a>
                  </div>
                </div>

                <div className="bg-surface-container p-4 rounded-xl flex flex-col justify-between gap-3 border border-surface-container-high">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-secondary-container/30 text-secondary flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[20px]">update</span>
                    </div>
                    <div>
                      <span className="font-label-md text-label-md text-on-secondary-container font-bold block">
                        Créneau de reprogrammation prioritaire actif
                      </span>
                      <p className="font-body-sm text-body-sm text-on-surface-variant">
                        Vous pouvez modifier votre créneau sans frais ni pénalité jusqu'à ce soir 20h00.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => setView('express-booking')}
                      className="px-3 py-1.5 bg-primary text-on-primary rounded-lg font-label-md text-label-md font-bold hover:bg-primary-container transition-colors inline-flex items-center gap-1 shadow-sm"
                    >
                      <span className="material-symbols-outlined text-[16px]">event_repeat</span>
                      Reprogrammer
                    </button>
                    <button
                      onClick={() => setShowPrepModal(true)}
                      className="px-3 py-1.5 bg-surface-container-lowest text-primary rounded-lg font-label-md text-label-md font-bold hover:bg-surface-container-high transition-colors inline-flex items-center gap-1 shadow-sm"
                    >
                      <span className="material-symbols-outlined text-[16px]">info</span>
                      Consignes préparation
                    </button>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* SECTION 3: Quick Action Tiles (4 Tiles) */}
        <section className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <h2 className="font-headline-md text-headline-md text-on-surface font-bold tracking-tight">Accès Rapides</h2>
            <span className="font-label-sm text-label-sm text-on-surface-variant">Services disponibles 24/7</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Tile 1: Express Booking */}
            <button
              onClick={() => setView('express-booking')}
              className="text-left group bg-surface-container-lowest rounded-xl p-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between h-full border border-surface-container-high"
            >
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-xl bg-primary text-on-primary flex items-center justify-center group-hover:scale-105 transition-transform">
                  <span className="material-symbols-outlined text-[24px]">calendar_add_on</span>
                </div>
                <div>
                  <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface group-hover:text-primary transition-colors">
                    Prendre un RDV Express
                  </h3>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                    Réservation 1-clic pour patient connecté avec pré-remplissage CNAM.
                  </p>
                </div>
              </div>
              <div className="pt-4 flex items-center gap-1 text-primary font-label-md text-label-md font-bold group-hover:translate-x-1 transition-transform">
                <span>Explorer les créneaux</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </div>
            </button>

            {/* Tile 2: Patient Queue Tracker */}
            <button
              onClick={() => setView('patient-queue-tracker')}
              className="text-left group bg-surface-container-lowest rounded-xl p-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between h-full border border-surface-container-high"
            >
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-xl bg-surface-container text-primary flex items-center justify-center group-hover:scale-105 transition-transform">
                  <span className="material-symbols-outlined text-[24px]">meeting_room</span>
                </div>
                <div>
                  <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface group-hover:text-primary transition-colors">
                    Suivi de File en Direct
                  </h3>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                    Position en temps réel ("Rang 3 sur 12") et temps d'attente estimé.
                  </p>
                </div>
              </div>
              <div className="pt-4 flex items-center gap-1 text-primary font-label-md text-label-md font-bold group-hover:translate-x-1 transition-transform">
                <span>Voir le rang en direct</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </div>
            </button>

            {/* Tile 3: Prescriptions */}
            <button
              onClick={() => setView('prescriptions')}
              className="text-left group bg-surface-container-lowest rounded-xl p-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between h-full border border-surface-container-high"
            >
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-xl bg-surface-container-highest text-primary flex items-center justify-center group-hover:scale-105 transition-transform">
                  <span className="material-symbols-outlined text-[24px]">folder_shared</span>
                </div>
                <div>
                  <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface group-hover:text-primary transition-colors">
                    Ordonnances & DMP
                  </h3>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                    Consultez vos ordonnances certifiées QR et contre-indications.
                  </p>
                </div>
              </div>
              <div className="pt-4 flex items-center gap-1 text-primary font-label-md text-label-md font-bold group-hover:translate-x-1 transition-transform">
                <span>Consulter mes pièces</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </div>
            </button>

            {/* Tile 4: Suggest a Doctor */}
            <button
              onClick={() => setView('suggest-doctor')}
              className="text-left group bg-surface-container-lowest rounded-xl p-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between h-full border border-surface-container-high"
            >
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-xl bg-surface-container-high text-primary flex items-center justify-center group-hover:scale-105 transition-transform">
                  <span className="material-symbols-outlined text-[24px]">person_add</span>
                </div>
                <div>
                  <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface group-hover:text-primary transition-colors">
                    Suggérer un praticien
                  </h3>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                    Invitez votre médecin de famille à se synchroniser sur MediDesk.
                  </p>
                </div>
              </div>
              <div className="pt-4 flex items-center gap-1 text-primary font-label-md text-label-md font-bold group-hover:translate-x-1 transition-transform">
                <span>Envoyer une recommandation</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </div>
            </button>
          </div>
        </section>

        {/* SECTION 4: Timeline Activity & Emergency Shortcuts */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Main Timeline (8 cols) */}
          <section className="lg:col-span-8 space-y-4">
            <div className="flex items-center justify-between px-1">
              <div>
                <h2 className="font-headline-md text-headline-md text-on-surface font-bold tracking-tight">Activité & Événements Médicaux</h2>
                <p className="font-label-sm text-label-sm text-on-surface-variant">Historique des 30 derniers jours</p>
              </div>
            </div>

            <div className="space-y-3">
              {/* Event 1 */}
              <article className="bg-surface-container-lowest rounded-xl p-4 shadow-sm border border-surface-container-high relative overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary"></div>
                <div className="flex flex-col sm:flex-row items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                      <span className="material-symbols-outlined text-[20px]">prescriptions</span>
                    </div>
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-label-sm text-label-sm text-primary font-bold">Aujourd'hui • 09:15</span>
                        <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-label-sm text-label-sm font-semibold">Ordonnance Valide (3 mois)</span>
                      </div>
                      <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">
                        Nouvelle ordonnance numérique mise à disposition
                      </h3>
                      <p className="font-body-sm text-body-sm text-on-surface-variant">
                        Dr. Karim Ben Mahmoud — Renouvellement traitement HTA (Bétabloquant & Complément potassique).
                      </p>
                    </div>
                  </div>
                  <span className="font-label-sm text-label-sm text-on-surface-variant bg-surface-container px-2.5 py-1 rounded-md shrink-0 font-semibold">
                    Réf: ORD-7712
                  </span>
                </div>
              </article>

              {/* Event 2 */}
              <article className="bg-surface-container-lowest rounded-xl p-4 shadow-sm border border-surface-container-high relative overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-surface-tint"></div>
                <div className="flex flex-col sm:flex-row items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-surface-container text-primary flex items-center justify-center shrink-0 mt-0.5">
                      <span className="material-symbols-outlined text-[20px]">science</span>
                    </div>
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-label-sm text-label-sm text-on-surface-variant font-medium">18 Octobre 2024</span>
                        <span className="px-2 py-0.5 rounded bg-surface-container font-label-sm text-label-sm text-primary font-semibold">Biologie Médicale</span>
                      </div>
                      <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">
                        Compte-rendu d'analyse biologique disponible
                      </h3>
                      <p className="font-body-sm text-body-sm text-on-surface-variant">
                        Laboratoire d'Analyses Médicales Les Berges du Lac — Bilan lipidique complet & glycémie à jeun.
                      </p>
                    </div>
                  </div>
                  <span className="font-label-sm text-label-sm text-on-surface-variant bg-surface-container px-2.5 py-1 rounded-md shrink-0 font-semibold">
                    PDF 1.4 Mo
                  </span>
                </div>
              </article>
            </div>
          </section>

          {/* Right Column: Emergency Hotlines & Care Team (4 cols) */}
          <aside className="lg:col-span-4 space-y-4">
            
            {/* Emergency Numbers Tunisia */}
            <div className="bg-gradient-to-br from-secondary/10 via-surface-container-low to-surface-container rounded-xl p-4 shadow-sm border border-surface-container-high space-y-3">
              <div className="flex items-center gap-2 text-secondary">
                <span className="material-symbols-outlined text-[20px]">e911_emergency</span>
                <h3 className="font-headline-sm text-headline-sm font-bold">Urgences Médicales Tunisie</h3>
              </div>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                En cas d'urgence vitale, contactez immédiatement les services nationaux :
              </p>

              <div className="grid grid-cols-1 gap-2 pt-1">
                <a href="tel:190" className="bg-surface-container-lowest hover:bg-secondary hover:text-on-secondary p-2.5 rounded-lg flex items-center justify-between transition-colors group shadow-sm">
                  <div className="flex items-center gap-3">
                    <span className="font-headline-sm text-headline-sm font-bold text-secondary group-hover:text-on-secondary">190</span>
                    <span className="font-label-md text-label-md text-on-surface group-hover:text-on-secondary font-bold">SAMU Tunisie</span>
                  </div>
                  <span className="material-symbols-outlined text-[18px] text-secondary group-hover:text-on-secondary">call</span>
                </a>

                <a href="tel:198" className="bg-surface-container-lowest hover:bg-secondary hover:text-on-secondary p-2.5 rounded-lg flex items-center justify-between transition-colors group shadow-sm">
                  <div className="flex items-center gap-3">
                    <span className="font-headline-sm text-headline-sm font-bold text-secondary group-hover:text-on-secondary">198</span>
                    <span className="font-label-md text-label-md text-on-surface group-hover:text-on-secondary font-bold">Protection Civile</span>
                  </div>
                  <span className="material-symbols-outlined text-[18px] text-secondary group-hover:text-on-secondary">call</span>
                </a>
              </div>
            </div>

            {/* Care Team */}
            <div className="bg-surface-container-lowest rounded-xl p-4 shadow-sm border border-surface-container-high space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">diversity_1</span>
                  <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">Mon Équipe Soignante</h3>
                </div>
              </div>
              
              <div className="p-3 bg-surface-container-low rounded-xl flex items-center justify-between gap-3 border border-surface-container-high">
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    className="w-10 h-10 rounded-lg object-cover bg-surface-container-high shrink-0"
                    alt="Dr Karim Ben Mahmoud"
                    src="https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=300&q=80"
                  />
                  <div className="min-w-0">
                    <h4 className="font-label-lg text-label-lg text-on-surface font-bold truncate">Dr. Karim Ben Mahmoud</h4>
                    <span className="font-label-sm text-label-sm text-on-surface-variant block truncate">Cardiologue Traitant</span>
                  </div>
                </div>
                <button onClick={() => setView('doctor-profile')} className="w-8 h-8 rounded-lg bg-surface-container-lowest text-primary hover:bg-primary hover:text-on-primary flex items-center justify-center transition-colors shrink-0 shadow-sm">
                  <span className="material-symbols-outlined text-[18px]">calendar_today</span>
                </button>
              </div>
            </div>

          </aside>
        </div>

      </div>
    </div>
  );
}
