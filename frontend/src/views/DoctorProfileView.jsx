import React, { useState } from 'react';

export default function DoctorProfileView({ setView, onOpenBooking }) {
  const [activeMotive, setActiveMotive] = useState({
    id: 'c-cardio',
    title: 'Première consultation de Cardiologie',
    price: '70 TND'
  });
  const [selectedDate, setSelectedDate] = useState({
    dayStr: "Aujourd'hui",
    dateStr: "Mercredi 23 Octobre"
  });
  const [selectedTime, setSelectedTime] = useState('15:15');
  const [activeTab, setActiveTab] = useState('parcours');

  const motives = [
    { id: 'c-cardio', title: 'Première consultation de Cardiologie', desc: 'Bilan initial & ECG inclus', price: '70 TND' },
    { id: 'c-suivi', title: 'Consultation de suivi / Contrôle', desc: 'Ajustement traitement & tension', price: '50 TND' },
    { id: 'c-echo', title: 'Échographie Cardiaque Doppler', desc: 'Imagerie ultrasonore haute définition', price: '120 TND' },
    { id: 'c-holter', title: "Bilan d'Hypertension & Pose Holter", desc: 'Enregistrement ambulatoire 24h', price: '90 TND' },
    { id: 'c-tele', title: 'Téléconsultation vidéo', desc: 'Ordonnance numérique signée', price: '60 TND', icon: 'videocam' }
  ];

  const days = [
    { label: "Aujourd'hui", dayNum: '23', month: 'Mer', active: true, fullDate: "Aujourd'hui, 23 Octobre" },
    { label: 'Jeu', dayNum: '24', month: 'Oct', fullDate: "Jeudi 24 Octobre" },
    { label: 'Ven', dayNum: '25', month: 'Oct', fullDate: "Vendredi 25 Octobre" },
    { label: 'Sam', dayNum: '26', month: 'Oct', fullDate: "Samedi 26 Octobre" },
    { label: 'Dim', dayNum: '27', month: 'Fermé', closed: true },
    { label: 'Lun', dayNum: '28', month: 'Oct', fullDate: "Lundi 28 Octobre" },
    { label: 'Mar', dayNum: '29', month: 'Oct', fullDate: "Mardi 29 Octobre" },
    { label: 'Mer', dayNum: '30', month: 'Oct', fullDate: "Mercredi 30 Octobre" },
    { label: 'Jeu', dayNum: '31', month: 'Oct', fullDate: "Jeudi 31 Octobre" },
    { label: 'Ven', dayNum: '01', month: 'Nov', fullDate: "Vendredi 1 Novembre" },
    { label: 'Sam', dayNum: '02', month: 'Nov', fullDate: "Samedi 2 Novembre" },
  ];

  const morningSlots = [
    { time: '09:00', taken: true },
    { time: '09:30', taken: true },
    { time: '10:00', taken: false },
    { time: '10:30', taken: false },
    { time: '11:00', taken: true },
    { time: '11:30', taken: false },
    { time: '12:00', taken: true }
  ];

  const afternoonSlots = [
    { time: '14:00', taken: false },
    { time: '14:30', taken: false },
    { time: '15:15', taken: false },
    { time: '15:45', taken: true },
    { time: '16:15', taken: false },
    { time: '16:45', taken: true },
    { time: '17:15', taken: false },
    { time: '17:45', taken: false }
  ];

  const handleContinueBooking = () => {
    if (onOpenBooking) {
      onOpenBooking({
        name: 'Dr. Karim Ben Mahmoud',
        specialty: 'Cardiologue & Maladies Vasculaires',
        location: 'Les Berges du Lac I, Tunis',
        price: activeMotive.price,
        motive: activeMotive.title,
        date: selectedDate.dateStr,
        time: selectedTime
      });
    } else if (setView) {
      setView('booking-wizard', {
        doctorName: 'Dr. Karim Ben Mahmoud',
        specialty: 'Cardiologue & Maladies Vasculaires',
        location: 'Les Berges du Lac I, Tunis',
        price: activeMotive.price,
        motive: activeMotive.title,
        date: selectedDate.dateStr,
        time: selectedTime
      });
    }
  };

  return (
    <div className="w-full bg-background min-h-screen pt-4 pb-20">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
        
        {/* 1. Breadcrumbs */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-1 font-label-md text-label-md text-on-surface-variant mb-4">
          <button onClick={() => setView && setView('home')} className="hover:text-primary transition-colors flex items-center gap-1">
            <span className="material-symbols-outlined text-[16px]">home</span>
            Accueil
          </button>
          <span className="material-symbols-outlined text-[14px] text-outline-variant">chevron_right</span>
          <button onClick={() => setView && setView('doctors', { specialty: 'Cardiologue', city: 'Tunis' })} className="hover:text-primary transition-colors">
            Cardiologues à Tunis
          </button>
          <span className="material-symbols-outlined text-[14px] text-outline-variant">chevron_right</span>
          <span className="text-on-surface font-semibold truncate">Dr. Karim Ben Mahmoud</span>
        </nav>

        {/* 2. Practitioner Hero Card */}
        <div className="w-full bg-surface-container-lowest rounded-xl p-4 md:p-6 lg:p-8 shadow-sm mb-6 relative overflow-hidden">
          <div className="absolute -right-16 -top-16 w-80 h-80 bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start relative z-10">
            
            {/* Left: Doctor Portrait & Identity Status */}
            <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col items-center sm:items-start lg:items-center text-center sm:text-left lg:text-center gap-4">
              <div className="relative">
                <div className="w-32 h-32 md:w-36 md:h-36 rounded-full overflow-hidden p-1 bg-surface-container-low shadow-sm">
                  <img 
                    className="w-full h-full object-cover rounded-full" 
                    alt="Dr Karim Ben Mahmoud" 
                    src="https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=400&q=80"
                  />
                </div>
                <span className="absolute bottom-1 right-1 flex items-center justify-center w-7 h-7 bg-primary text-on-primary rounded-full shadow-md" title="Praticien certifié CNOM">
                  <span className="material-symbols-outlined text-[18px]">verified</span>
                </span>
              </div>
              <div className="flex flex-col gap-1 w-full">
                <div className="flex items-center justify-center sm:justify-start lg:justify-center gap-2 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded-full bg-surface-container-high text-primary font-label-sm text-label-sm font-semibold">
                    CNOM #18452
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-surface-container-low text-primary-container font-label-sm text-label-sm flex items-center gap-1 font-semibold">
                    <span className="w-2 h-2 rounded-full bg-primary inline-block"></span>
                    Conventionné CNAM
                  </span>
                </div>
                <h1 className="font-headline-lg text-headline-lg text-on-surface mt-1 font-bold">
                  Dr. Karim Ben Mahmoud
                </h1>
                <p className="font-label-lg text-label-lg text-primary font-medium">
                  Cardiologue & Maladies Vasculaires
                </p>
                <div className="flex items-center justify-center sm:justify-start lg:justify-center gap-1 mt-1 bg-surface-container-low/70 py-1 px-3 rounded-lg self-center sm:self-start lg:self-center">
                  <div className="flex text-tertiary-container items-center">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                    ))}
                  </div>
                  <span className="font-label-md text-label-md font-bold text-on-surface">4.9</span>
                  <span className="font-body-sm text-body-sm text-on-surface-variant">(148 avis vérifiés)</span>
                </div>
              </div>
            </div>

            {/* Middle: Bio, Specialties & Badges */}
            <div className="lg:col-span-4 flex flex-col gap-4">
              <div>
                <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant font-semibold">Parcours & Spécialités</span>
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-1 leading-relaxed">
                  Ancien Chef de Clinique aux <strong className="text-on-surface font-semibold">Hôpitaux de Paris (AP-HP)</strong>. Spécialiste reconnu en échocardiographie Doppler tissulaire, prise en charge de l'hypertension artérielle résistante (HTA), bilan coronarien et cardiologie sportive préventive.
                </p>
              </div>
              <div className="flex flex-wrap gap-1.5">
                <span className="px-2.5 py-1 rounded-lg bg-surface-container text-on-surface font-label-sm text-label-sm font-medium">Échocardiographie</span>
                <span className="px-2.5 py-1 rounded-lg bg-surface-container text-on-surface font-label-sm text-label-sm font-medium">Holter ECG / MAPA</span>
                <span className="px-2.5 py-1 rounded-lg bg-surface-container text-on-surface font-label-sm text-label-sm font-medium">Épreuve d'effort</span>
                <span className="px-2.5 py-1 rounded-lg bg-surface-container text-on-surface font-label-sm text-label-sm font-medium">Cardio-pédiatrie (+6 ans)</span>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-1">
                <div className="p-2.5 rounded-lg bg-surface-container-low flex flex-col gap-1">
                  <span className="font-label-sm text-label-sm text-on-surface-variant flex items-center gap-1 font-semibold">
                    <span className="material-symbols-outlined text-[16px] text-primary">translate</span>
                    Langues parlées
                  </span>
                  <span className="font-body-sm text-body-sm font-medium text-on-surface">Français, Arabe (تونسي), Anglais</span>
                </div>
                <div className="p-2.5 rounded-lg bg-surface-container-low flex flex-col gap-1">
                  <span className="font-label-sm text-label-sm text-on-surface-variant flex items-center gap-1 font-semibold">
                    <span className="material-symbols-outlined text-[16px] text-primary">devices</span>
                    Modes d'accès
                  </span>
                  <span className="font-body-sm text-body-sm font-medium text-on-surface">Cabinet & Vidéo-consultation</span>
                </div>
              </div>
            </div>

            {/* Right: Location & Clinic Card */}
            <div className="lg:col-span-4 bg-surface-container-low rounded-xl p-4 flex flex-col justify-between h-full gap-3">
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <span className="font-label-sm text-label-sm text-primary font-semibold flex items-center gap-1">
                    <span className="material-symbols-outlined text-[18px]">domain</span>
                    Cabinet Privé
                  </span>
                  <span className="inline-flex items-center gap-1 font-label-sm text-label-sm text-on-surface-variant bg-surface-container-lowest px-2 py-0.5 rounded-full font-medium">
                    <span className="material-symbols-outlined text-[14px] text-primary">accessible</span>
                    Accès PMR
                  </span>
                </div>
                <p className="font-headline-sm text-headline-sm text-on-surface font-bold">Les Berges du Lac I</p>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Immeuble Carthage Médical, 3<sup>ème</sup> étage (Ascenseur)<br/>
                  Rue du Lac de Constance, 1053 Tunis
                </p>
              </div>

              {/* Map Preview */}
              <div className="relative w-full h-28 rounded-lg overflow-hidden shadow-inner flex items-end p-2 bg-slate-800" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&w=600&q=80')", backgroundSize: 'cover' }}>
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent pointer-events-none"></div>
                <div className="relative z-10 flex items-center justify-between w-full text-white">
                  <div className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[20px] text-secondary-container" style={{ fontVariationSettings: "'FILL' 1" }}>location_on</span>
                    <span className="font-label-sm text-label-sm font-semibold drop-shadow">Lac 1 (Proche Clinique Hannibal)</span>
                  </div>
                  <a href="#map" className="px-2 py-1 rounded bg-surface-container-lowest/90 text-primary font-label-sm text-label-sm font-semibold hover:bg-surface-container-lowest transition-colors flex items-center gap-0.5">
                    <span>Itinéraire</span>
                    <span className="material-symbols-outlined text-[14px]">near_me</span>
                  </a>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1 font-label-sm text-label-sm text-on-surface-variant">
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px] text-primary">local_parking</span>
                  Parking sous-sol réservé
                </span>
                <span className="text-primary font-semibold">Tél: 71 880 900</span>
              </div>
            </div>

          </div>
        </div>

        {/* 3. MAIN BOOKING WORKFLOW CONTAINER */}
        <div className="w-full bg-surface-container-lowest rounded-xl p-4 md:p-6 lg:p-8 shadow-sm mb-8">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-6 pb-2 border-b border-surface-container-high">
            <div>
              <div className="flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-on-primary font-label-sm text-label-sm font-bold">1</span>
                <h2 className="font-headline-md text-headline-md text-on-surface font-bold">Sélectionnez le motif et votre horaire</h2>
              </div>
              <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5 ml-8">Réservation immédiate et sans frais d'avance. Confirmation SMS & WhatsApp instantanée.</p>
            </div>
            <div className="flex items-center gap-1.5 ml-8 md:ml-0">
              <span className="w-2.5 h-2.5 rounded-full bg-primary inline-block"></span>
              <span className="font-label-sm text-label-sm text-on-surface-variant font-medium">Créneau garanti sans attente excessive</span>
            </div>
          </div>

          {/* Motives selection */}
          <div className="mb-6">
            <label className="block font-label-md text-label-md text-on-surface-variant uppercase tracking-wider font-bold mb-3">
              Motif de la consultation :
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {motives.map((motive) => {
                const isSelected = activeMotive.id === motive.id;
                return (
                  <button
                    key={motive.id}
                    onClick={() => setActiveMotive(motive)}
                    className={`text-left p-4 rounded-xl flex flex-col justify-between transition-all ${
                      isSelected 
                        ? 'bg-primary text-on-primary shadow-sm ring-2 ring-primary' 
                        : 'bg-surface-container-low hover:bg-surface-container text-on-surface'
                    }`}
                  >
                    <div className="flex items-start justify-between w-full gap-2">
                      <span className={`font-headline-sm text-headline-sm font-semibold ${isSelected ? 'text-on-primary' : 'text-on-surface'}`}>
                        {motive.title}
                      </span>
                      {isSelected ? (
                        <span className="material-symbols-outlined text-[20px] text-on-primary">check_circle</span>
                      ) : (
                        <span className="material-symbols-outlined text-[20px] text-outline-variant opacity-40">circle</span>
                      )}
                    </div>
                    <div className="flex items-center justify-between mt-4 pt-2">
                      <span className={`font-body-sm text-body-sm ${isSelected ? 'opacity-90' : 'text-on-surface-variant'}`}>
                        {motive.desc}
                      </span>
                      <span className={`font-headline-sm text-headline-sm font-bold px-2 py-0.5 rounded-lg ${
                        isSelected ? 'bg-primary-container text-on-primary-container' : 'text-primary'
                      }`}>
                        {motive.price}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 14-day date strip */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <label className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider font-bold">
                  Date du rendez-vous :
                </label>
                <span className="font-label-md text-label-md text-primary font-semibold">Octobre - Novembre 2024</span>
              </div>
            </div>
            
            <div className="flex gap-2 overflow-x-auto pb-2 scroll-smooth">
              {days.map((d, index) => {
                const isSelected = selectedDate.dateStr === d.fullDate;
                if (d.closed) {
                  return (
                    <button key={index} disabled className="shrink-0 w-24 py-3 px-2 rounded-xl bg-surface-container-low/40 text-outline-variant flex flex-col items-center justify-center gap-1 cursor-not-allowed opacity-60">
                      <span className="font-label-sm text-label-sm font-medium">{d.label}</span>
                      <span className="font-headline-lg text-headline-lg font-bold">{d.dayNum}</span>
                      <span className="font-label-sm text-label-sm">Fermé</span>
                    </button>
                  );
                }

                return (
                  <button
                    key={index}
                    onClick={() => setSelectedDate({ dayStr: d.label, dateStr: d.fullDate })}
                    className={`shrink-0 w-24 py-3 px-2 rounded-xl flex flex-col items-center justify-center gap-1 transition-all ${
                      isSelected
                        ? 'bg-primary text-on-primary shadow-sm font-bold'
                        : 'bg-surface-container-low hover:bg-surface-container text-on-surface'
                    }`}
                  >
                    <span className={`font-label-sm text-label-sm font-semibold uppercase tracking-wider ${isSelected ? 'text-on-primary-container' : 'text-on-surface-variant'}`}>
                      {d.label}
                    </span>
                    <span className="font-headline-lg text-headline-lg font-bold">{d.dayNum}</span>
                    <span className={`font-label-sm text-label-sm ${isSelected ? 'opacity-90' : 'text-on-surface-variant'}`}>{d.month}</span>
                    <span className={`w-1.5 h-1.5 rounded-full mt-0.5 ${isSelected ? 'bg-secondary-container' : 'bg-primary'}`}></span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Time slot grid */}
          <div className="bg-surface-container-low/50 rounded-xl p-4 md:p-6">
            <div className="flex items-center justify-between pb-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[20px]">calendar_clock</span>
                <h3 className="font-headline-sm text-headline-sm text-on-surface">
                  Créneaux horaires pour <span className="text-primary font-bold">{selectedDate.dateStr}</span>
                </h3>
              </div>
              <span className="font-label-sm text-label-sm text-on-surface-variant">Heure de Tunis (UTC+1)</span>
            </div>

            <div className="flex flex-col gap-6">
              {/* Matin */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="material-symbols-outlined text-[18px] text-tertiary">wb_sunny</span>
                  <span className="font-label-md text-label-md font-bold text-on-surface uppercase tracking-wide">Matin (09:00 - 12:30)</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
                  {morningSlots.map((slot, i) => (
                    slot.taken ? (
                      <div key={i} className="py-2.5 px-3 rounded-lg bg-surface-container-high/60 text-outline-variant text-center cursor-not-allowed select-none flex items-center justify-center">
                        <span className="font-label-md text-label-md line-through">{slot.time}</span>
                      </div>
                    ) : (
                      <button
                        key={i}
                        onClick={() => setSelectedTime(slot.time)}
                        className={`py-2.5 px-3 rounded-lg font-headline-sm text-headline-sm font-semibold text-center transition-all shadow-sm ${
                          selectedTime === slot.time
                            ? 'bg-secondary text-on-secondary font-bold scale-105 shadow-md flex items-center justify-center gap-1'
                            : 'bg-surface-container-lowest hover:bg-surface-container text-primary'
                        }`}
                      >
                        {selectedTime === slot.time && <span className="material-symbols-outlined text-[16px]">check</span>}
                        {slot.time}
                      </button>
                    )
                  ))}
                </div>
              </div>

              {/* Après-midi */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="material-symbols-outlined text-[18px] text-secondary">wb_twilight</span>
                  <span className="font-label-md text-label-md font-bold text-on-surface uppercase tracking-wide">Après-midi (14:00 - 18:00)</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2">
                  {afternoonSlots.map((slot, i) => (
                    slot.taken ? (
                      <div key={i} className="py-2.5 px-3 rounded-lg bg-surface-container-high/60 text-outline-variant text-center cursor-not-allowed select-none flex items-center justify-center">
                        <span className="font-label-md text-label-md line-through">{slot.time}</span>
                      </div>
                    ) : (
                      <button
                        key={i}
                        onClick={() => setSelectedTime(slot.time)}
                        className={`py-2.5 px-3 rounded-lg font-headline-sm text-headline-sm font-semibold text-center transition-all shadow-sm ${
                          selectedTime === slot.time
                            ? 'bg-secondary text-on-secondary font-bold scale-105 shadow-md flex items-center justify-center gap-1'
                            : 'bg-surface-container-lowest hover:bg-surface-container text-primary'
                        }`}
                      >
                        {selectedTime === slot.time && <span className="material-symbols-outlined text-[16px]">check</span>}
                        {slot.time}
                      </button>
                    )
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-4 p-3 rounded-lg bg-secondary-container/15 flex items-start gap-2 text-on-secondary-container">
              <span className="material-symbols-outlined text-[20px] text-secondary shrink-0 mt-0.5">info</span>
              <p className="font-body-sm text-body-sm">
                <strong>Urgence cardiologique :</strong> Pour une douleur thoracique aiguë constrictive ou essoufflement brutal, contactez immédiatement le SAMU Tunisie au <strong>190</strong>.
              </p>
            </div>
          </div>

        </div>

        {/* 4. TABBED DETAILS SECTION */}
        <div className="w-full bg-surface-container-lowest rounded-xl shadow-sm mb-12 overflow-hidden">
          <div className="flex items-center border-b border-surface-container-high px-4 md:px-6 bg-surface-container-low/30 overflow-x-auto">
            <button
              onClick={() => setActiveTab('parcours')}
              className={`px-4 py-4 font-label-lg text-label-lg font-semibold flex items-center gap-1.5 shrink-0 transition-colors ${
                activeTab === 'parcours' ? 'text-primary border-b-2 border-primary' : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">school</span>
              Présentation & Parcours
            </button>
            <button
              onClick={() => setActiveTab('tarifs')}
              className={`px-4 py-4 font-label-lg text-label-lg font-semibold flex items-center gap-1.5 shrink-0 transition-colors ${
                activeTab === 'tarifs' ? 'text-primary border-b-2 border-primary' : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">payments</span>
              Tarifs & Prise en charge CNAM
            </button>
            <button
              onClick={() => setActiveTab('acces')}
              className={`px-4 py-4 font-label-lg text-label-lg font-semibold flex items-center gap-1.5 shrink-0 transition-colors ${
                activeTab === 'acces' ? 'text-primary border-b-2 border-primary' : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">location_on</span>
              Accès & Coordonnées
            </button>
            <button
              onClick={() => setActiveTab('avis')}
              className={`px-4 py-4 font-label-lg text-label-lg font-semibold flex items-center gap-1.5 shrink-0 transition-colors ${
                activeTab === 'avis' ? 'text-primary border-b-2 border-primary' : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">reviews</span>
              Avis Patients vérifiés (148)
            </button>
          </div>

          <div className="p-6 md:p-8">
            {activeTab === 'parcours' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="flex flex-col gap-4">
                  <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">workspace_premium</span>
                    Diplômes & Formations Hospitalières
                  </h3>
                  <div className="flex flex-col gap-3 pl-2">
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0"></div>
                      <div>
                        <span className="font-label-lg text-label-lg text-on-surface font-semibold">Diplôme d'État de Docteur en Médecine</span>
                        <p className="font-body-sm text-body-sm text-on-surface-variant">Faculté de Médecine de Paris VI - Pierre et Marie Curie</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0"></div>
                      <div>
                        <span className="font-label-lg text-label-lg text-on-surface font-semibold">Ancien Chef de Clinique Assistant (CCA)</span>
                        <p className="font-body-sm text-body-sm text-on-surface-variant">Hôpital Européen Georges-Pompidou (HEGP), Service de Cardiologie, Paris</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0"></div>
                      <div>
                        <span className="font-label-lg text-label-lg text-on-surface font-semibold">DIU d'Échocardiographie doppler</span>
                        <p className="font-body-sm text-body-sm text-on-surface-variant">Université Paris Descartes</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">psychology_alt</span>
                    Philosophie de Pratique & Équipements
                  </h3>
                  <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                    Le Dr. Ben Mahmoud place l'écoute attentive et la cardiologie préventive au cœur de sa démarche diagnostique. Le cabinet est équipé d'une plateforme d'imagerie ultrasonore (GE Vivid E95) et d'électrocardiogrammes 12 dérivations.
                  </p>
                  <div className="p-3 rounded-lg bg-surface-container-low flex flex-col gap-1">
                    <span className="font-label-sm text-label-sm text-primary font-bold uppercase">Sociétés Savantes</span>
                    <p className="font-body-sm text-body-sm text-on-surface">Membre de la Société Tunisienne de Cardiologie (STCCCV) et de la Société Européenne de Cardiologie (ESC).</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'tarifs' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="flex flex-col gap-3">
                  <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">Grille des Honoraires Médicaux</h3>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-surface-container-low">
                      <span className="font-body-md text-body-md text-on-surface">Première consultation cardiologique + ECG</span>
                      <span className="font-headline-sm text-headline-sm font-bold text-primary">70 TND</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-surface-container-low">
                      <span className="font-body-md text-body-md text-on-surface">Consultation de contrôle (moins de 3 mois)</span>
                      <span className="font-headline-sm text-headline-sm font-bold text-primary">50 TND</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-surface-container-low">
                      <span className="font-body-md text-body-md text-on-surface">Échocardiographie Trans-thoracique (ETT) Doppler</span>
                      <span className="font-headline-sm text-headline-sm font-bold text-primary">120 TND</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-surface-container-low">
                      <span className="font-body-md text-body-md text-on-surface">Pose & Analyse Holter Tensionnel (MAPA)</span>
                      <span className="font-headline-sm text-headline-sm font-bold text-primary">90 TND</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">Prise en charge CNAM & Paiements</h3>
                  <div className="p-4 rounded-xl bg-surface-container-high/40 flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-primary font-bold">
                      <span className="material-symbols-outlined">health_and_safety</span>
                      <span>Conventionné avec la CNAM</span>
                    </div>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">
                      Praticien conventionné en Filière Privée et Médecin de Famille. Remboursement CNAM ou mutuelles privées (Assurances Maghrebia, GAT, STAR, COMAR).
                    </p>
                  </div>
                  <div>
                    <span className="font-label-sm text-label-sm font-semibold uppercase tracking-wider text-on-surface-variant">Moyens de règlement :</span>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <span className="px-3 py-1 rounded bg-surface-container font-label-sm text-label-sm text-on-surface">Espèces (TND)</span>
                      <span className="px-3 py-1 rounded bg-surface-container font-label-sm text-label-sm text-on-surface">Carte Bancaire (TPE)</span>
                      <span className="px-3 py-1 rounded bg-surface-container font-label-sm text-label-sm text-on-surface">Chèques bancaires</span>
                      <span className="px-3 py-1 rounded bg-surface-container font-label-sm text-label-sm text-on-surface">Paiement Mobile D17</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'acces' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">Horaires d'ouverture</h3>
                  <div className="flex flex-col gap-2 mt-3 font-body-sm text-body-sm">
                    <div className="flex justify-between py-1.5 border-b border-surface-container-high">
                      <span className="font-medium text-on-surface">Lundi au Vendredi</span>
                      <span className="text-on-surface font-semibold">08:30 — 17:30</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-surface-container-high">
                      <span className="font-medium text-on-surface">Samedi</span>
                      <span className="text-on-surface font-semibold">08:30 — 13:00</span>
                    </div>
                    <div className="flex justify-between py-1.5 text-on-surface-variant">
                      <span>Dimanche & Jours fériés</span>
                      <span className="font-semibold text-secondary">Fermé</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">Repères d'accès</h3>
                  <ul className="flex flex-col gap-2 mt-3 font-body-sm text-body-sm text-on-surface-variant">
                    <li className="flex items-start gap-2">
                      <span className="material-symbols-outlined text-primary text-[20px] shrink-0">check_circle</span>
                      <span><strong>Carthage Médical :</strong> À 200m de l'ambassade du Canada.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="material-symbols-outlined text-primary text-[20px] shrink-0">elevator</span>
                      <span><strong>Ascenseur PMR :</strong> 3ème étage direct.</span>
                    </li>
                  </ul>
                </div>
              </div>
            )}

            {activeTab === 'avis' && (
              <div className="flex flex-col gap-6">
                <div className="flex flex-col md:flex-row items-center gap-6 p-4 rounded-xl bg-surface-container-low/70">
                  <div className="flex flex-col items-center justify-center text-center pr-0 md:pr-6 md:border-r border-surface-container-high">
                    <span className="font-headline-xl text-headline-xl font-bold text-on-surface">4.9</span>
                    <div className="flex text-tertiary-container my-1">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                      ))}
                    </div>
                    <span className="font-label-sm text-label-sm text-on-surface-variant">148 avis certifiés</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
                    <div>
                      <span className="font-label-sm text-label-sm text-on-surface-variant">Ponctualité</span>
                      <span className="font-headline-sm text-headline-sm text-primary font-bold block">4.9 / 5</span>
                    </div>
                    <div>
                      <span className="font-label-sm text-label-sm text-on-surface-variant">Écoute & Explications</span>
                      <span className="font-headline-sm text-headline-sm text-primary font-bold block">5.0 / 5</span>
                    </div>
                    <div>
                      <span className="font-label-sm text-label-sm text-on-surface-variant">Hygiène</span>
                      <span className="font-headline-sm text-headline-sm text-primary font-bold block">4.9 / 5</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <div className="p-4 rounded-xl bg-surface-container-low flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="font-label-md text-label-md font-bold text-on-surface">Mounir T. • Écho-doppler</span>
                      <div className="flex text-tertiary-container">
                        {[...Array(5)].map((_, i) => (
                          <span key={i} className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                        ))}
                      </div>
                    </div>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">
                      « Médecin d'une bienveillance exceptionnelle. Dr Karim a pris le temps d'expliquer chaque cliché de l'échographie. Accueil parfait. »
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Sticky Bottom Booking Bar */}
      <div className="fixed bottom-0 left-0 w-full z-40 bg-surface-container-lowest/95 backdrop-blur-md border-t border-surface-container-high shadow-lg">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[24px]">event_available</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-headline-sm text-headline-sm text-on-surface font-bold">
                  {selectedDate.dateStr} à {selectedTime}
                </span>
                <span className="font-headline-sm text-headline-sm text-primary font-bold">
                  • {activeMotive.price}
                </span>
              </div>
              <p className="font-body-sm text-body-sm text-on-surface-variant truncate">
                {activeMotive.title} • Les Berges du Lac
              </p>
            </div>
          </div>

          <button
            onClick={handleContinueBooking}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-label-lg text-label-lg bg-secondary text-on-secondary hover:bg-on-secondary-container transition-all shadow-md font-bold"
          >
            <span>Continuer la réservation</span>
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </button>
        </div>
      </div>
    </div>
  );
}
