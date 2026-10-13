import React, { useState, useEffect } from 'react';
import { fetchDoctors } from '../services/api';
import { useLanguage } from '../context/LanguageContext';

export default function HomeView({ setView, onOpenBooking }) {
  const { t } = useLanguage();
  const [doctors, setDoctors] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchCity, setSearchCity] = useState('tunis');
  const [searchDate, setSearchDate] = useState('any');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDoctors();
  }, []);

  const loadDoctors = async () => {
    try {
      const res = await fetchDoctors();
      setDoctors(res.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setView('doctors', { search: searchQuery, city: searchCity });
  };

  return (
    <div className="w-full flex flex-col pt-20 bg-surface">
      
      {/* 1. Top Practitioner Floating Alert Banner */}
      <section className="w-full bg-surface-container-high py-space-xs px-margin md:px-margin-md lg:px-margin-lg">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-space-sm text-on-surface">
          <div className="flex items-center gap-space-sm">
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary-container text-on-primary">
              <span className="material-symbols-outlined text-[14px]">medical_services</span>
            </span>
            <span className="font-label-md text-label-md text-on-surface-variant">
              Are you a physician or clinic manager in Tunisia? Join <strong className="text-primary-container font-semibold">650+ verified practitioners</strong>.
            </span>
          </div>
          <button
            onClick={() => setView('onboarding')}
            className="inline-flex items-center gap-space-xs font-label-sm text-label-sm text-primary font-bold hover:text-primary-container transition-colors group"
          >
            <span>Upgrade your practice with MediDesk Pro</span>
            <span className="material-symbols-outlined text-[16px] group-hover:translate-x-0.5 transition-transform">arrow_forward</span>
          </button>
        </div>
      </section>

      {/* 2. Hero Section */}
      <section className="relative w-full px-margin md:px-margin-md lg:px-margin-lg pt-space-xl pb-space-xl overflow-hidden">
        {/* Ambient background blur blobs */}
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-primary-fixed/30 blur-3xl pointer-events-none -z-10"></div>
        <div className="absolute top-1/2 -left-20 w-80 h-80 rounded-full bg-secondary-fixed/40 blur-3xl pointer-events-none -z-10"></div>
        
        <div className="max-w-7xl mx-auto flex flex-col gap-space-lg">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter-lg items-center">
            
            {/* Left Column: Headline */}
            <div className="lg:col-span-7 flex flex-col gap-space-md">
              <div className="inline-flex items-center gap-space-xs px-space-md py-space-xs rounded-full bg-surface-container-highest text-primary-container w-fit shadow-sm">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                <span className="font-label-sm text-label-sm uppercase tracking-wider">Tunisian Medical Network • Réseau Médical National</span>
              </div>
              
              <h1 className="font-headline-xl text-headline-xl text-on-surface tracking-tight max-w-2xl font-bold">
                Book your doctor in minutes. Care without the waiting.
              </h1>
              
              <p className="font-body-lg text-body-lg text-on-surface-variant max-w-xl">
                Access Tunisia’s premier network of verified specialists, polyclinics, and family doctors. Real-time availability, live queue tracking, and synchronized bilingual health records.
              </p>
              
              {/* Micro trust highlights */}
              <div className="flex flex-wrap items-center gap-x-space-md gap-y-space-xs pt-space-xs">
                <div className="flex items-center gap-space-xs">
                  <span className="material-symbols-outlined text-primary text-[18px]">verified</span>
                  <span className="font-label-sm text-label-sm text-on-surface-variant font-medium">100% Free for patients</span>
                </div>
                <div className="flex items-center gap-space-xs">
                  <span className="material-symbols-outlined text-primary text-[18px]">mark_chat_read</span>
                  <span className="font-label-sm text-label-sm text-on-surface-variant font-medium">Instant SMS &amp; WhatsApp alerts</span>
                </div>
                <div className="flex items-center gap-space-xs">
                  <span className="material-symbols-outlined text-secondary text-[18px]">timelapse</span>
                  <span className="font-label-sm text-label-sm text-on-surface-variant font-medium">No more crowded waiting rooms</span>
                </div>
              </div>
            </div>

            {/* Right Column: Live Interactive Visual Hero Card */}
            <div className="lg:col-span-5 relative">
              <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-xl flex flex-col gap-space-md relative overflow-hidden border border-surface-container-high">
                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-primary-container"></div>
                
                <div className="flex items-start justify-between gap-space-sm pl-space-xs">
                  <div className="flex items-center gap-space-sm">
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-surface-container-high flex-shrink-0">
                      <img 
                        className="w-full h-full object-cover" 
                        alt="Dr. Leila Ben Salem" 
                        src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=400"
                      />
                    </div>
                    <div>
                      <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">Dr. Leila Ben Salem</h3>
                      <p className="font-label-sm text-label-sm text-on-surface-variant">Cardiologue • Centre Urbain Nord, Tunis</p>
                    </div>
                  </div>
                  <span className="inline-flex items-center px-space-sm py-space-xs rounded-full bg-surface-container-high text-primary font-label-sm text-label-sm font-semibold">
                    Available Today
                  </span>
                </div>

                {/* Real-Time Waiting Room Glance Box */}
                <div 
                  onClick={() => setView('queue')}
                  className="bg-surface-container-low rounded-lg p-space-sm flex items-center justify-between cursor-pointer hover:bg-surface-container transition-colors border border-surface-container-high"
                >
                  <div className="flex items-center gap-space-sm">
                    <div className="w-10 h-10 rounded-md bg-primary-container text-on-primary flex items-center justify-center font-headline-sm text-headline-sm font-bold">
                      04
                    </div>
                    <div>
                      <p className="font-label-sm text-label-sm text-on-surface-variant">Current queue position</p>
                      <p className="font-label-md text-label-md text-on-surface font-semibold">Dr. in session with patient #03</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="inline-block px-space-xs py-0.5 rounded bg-secondary-fixed text-on-secondary-container font-label-sm text-label-sm font-bold">
                      ~12 min wait
                    </span>
                  </div>
                </div>

                {/* Interactive Appointment Slot Row */}
                <div className="flex flex-col gap-space-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-label-sm text-label-sm text-on-surface-variant font-semibold">Next open consultations:</span>
                    <button onClick={() => setView('doctors')} className="font-label-sm text-label-sm text-primary hover:underline font-semibold">Full schedule</button>
                  </div>
                  <div className="grid grid-cols-3 gap-space-xs">
                    <button onClick={() => onOpenBooking(doctors[0])} className="py-space-sm px-space-xs rounded bg-surface hover:bg-primary-container hover:text-on-primary transition-all text-center text-on-surface shadow-sm focus:outline-none focus:ring-2 focus:ring-primary border border-outline-variant/40" type="button">
                      <span className="block font-label-md text-label-md font-bold">14:30</span>
                      <span className="block font-label-sm text-label-sm opacity-80">Cabinet</span>
                    </button>
                    <button onClick={() => onOpenBooking(doctors[0])} className="py-space-sm px-space-xs rounded bg-primary-container text-on-primary font-label-md text-label-md font-bold text-center shadow-md" type="button">
                      <span className="block font-label-md text-label-md">15:15</span>
                      <span className="block font-label-sm text-label-sm opacity-90">Selected</span>
                    </button>
                    <button onClick={() => onOpenBooking(doctors[0])} className="py-space-sm px-space-xs rounded bg-surface hover:bg-primary-container hover:text-on-primary transition-all text-center text-on-surface shadow-sm focus:outline-none focus:ring-2 focus:ring-primary border border-outline-variant/40" type="button">
                      <span className="block font-label-md text-label-md font-bold">16:00</span>
                      <span className="block font-label-sm text-label-sm opacity-80">Cabinet</span>
                    </button>
                  </div>
                </div>

                {/* Patient Assurance Strip */}
                <div className="flex items-center justify-between pt-space-xs text-on-surface-variant font-label-sm text-label-sm border-t border-surface-container-low">
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px] text-primary">verified_user</span>
                    Conventionnée CNAM
                  </span>
                  <span className="font-semibold text-on-surface">Consultation: 60 TND</span>
                </div>

              </div>
            </div>

          </div>

          {/* High-Performance Multi-Field Search Engine */}
          <div className="w-full bg-surface-container-lowest rounded-xl shadow-lg p-space-md md:p-space-lg border border-surface-container-high">
            <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-space-sm items-end" id="search-form">
              
              <div className="md:col-span-4 flex flex-col gap-space-xs">
                <label className="font-label-sm text-label-sm text-on-surface-variant font-semibold flex items-center gap-1" htmlFor="search-specialty">
                  <span className="material-symbols-outlined text-primary text-[18px]">stethoscope</span>
                  Doctor, Specialty, or Clinic
                </label>
                <div className="relative flex items-center">
                  <input 
                    className="w-full h-11 px-space-md rounded bg-surface-container-low text-on-surface placeholder:text-outline font-body-md text-body-md focus:bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary transition-all border border-outline-variant/40" 
                    id="search-specialty" 
                    placeholder="e.g. Cardiologue, Dr. Ben Salem, Pédiatre..." 
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              <div className="md:col-span-3 flex flex-col gap-space-xs">
                <label className="font-label-sm text-label-sm text-on-surface-variant font-semibold flex items-center gap-1" htmlFor="search-city">
                  <span className="material-symbols-outlined text-primary text-[18px]">location_on</span>
                  City or Region (Tunisia)
                </label>
                <div className="relative flex items-center">
                  <select 
                    className="w-full h-11 px-space-md rounded bg-surface-container-low text-on-surface font-body-md text-body-md focus:bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary transition-all appearance-none cursor-pointer border border-outline-variant/40" 
                    id="search-city"
                    value={searchCity}
                    onChange={(e) => setSearchCity(e.target.value)}
                  >
                    <option value="all">All Governorates (Toutes Régions)</option>
                    <option value="tunis">Tunis (Centre, Ennasr, Menzah, Lac)</option>
                    <option value="ariana">Ariana</option>
                    <option value="sousse">Sousse</option>
                    <option value="sfax">Sfax</option>
                    <option value="monastir">Monastir</option>
                    <option value="nabeul">Nabeul &amp; Hammamet</option>
                  </select>
                  <span className="material-symbols-outlined text-outline pointer-events-none absolute right-3 text-[20px]">expand_more</span>
                </div>
              </div>

              <div className="md:col-span-3 flex flex-col gap-space-xs">
                <label className="font-label-sm text-label-sm text-on-surface-variant font-semibold flex items-center gap-1" htmlFor="search-date">
                  <span className="material-symbols-outlined text-primary text-[18px]">calendar_month</span>
                  Availability
                </label>
                <div className="relative flex items-center">
                  <select 
                    className="w-full h-11 px-space-md rounded bg-surface-container-low text-on-surface font-body-md text-body-md focus:bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary transition-all appearance-none cursor-pointer border border-outline-variant/40" 
                    id="search-date"
                    value={searchDate}
                    onChange={(e) => setSearchDate(e.target.value)}
                  >
                    <option value="any">Anytime this week</option>
                    <option value="today">Aujourd'hui (Urgent / Immediate)</option>
                    <option value="tomorrow">Demain</option>
                    <option value="saturday">Samedi Matin</option>
                  </select>
                  <span className="material-symbols-outlined text-outline pointer-events-none absolute right-3 text-[20px]">expand_more</span>
                </div>
              </div>

              <div className="md:col-span-2 flex">
                <button 
                  className="w-full h-11 px-space-md rounded bg-primary-container text-on-primary font-label-lg text-label-lg font-bold flex items-center justify-center gap-space-xs shadow-md hover:bg-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary" 
                  type="submit"
                >
                  <span className="material-symbols-outlined text-[20px]">search</span>
                  <span>Find Care</span>
                </button>
              </div>

            </form>
          </div>

          {/* Specialty Quick Filter Pill Bar */}
          <div className="flex flex-col gap-space-xs">
            <span className="font-label-sm text-label-sm text-on-surface-variant font-bold uppercase tracking-wider">Popular specialties:</span>
            <div className="flex items-center gap-space-xs overflow-x-auto pb-space-xs scrollbar-none">
              <button onClick={() => setView('doctors', { specialty: 'Généraliste' })} className="shrink-0 px-space-md py-space-xs rounded-full bg-surface-container-lowest text-on-surface font-label-sm text-label-sm hover:bg-primary-container hover:text-on-primary transition-colors shadow-sm flex items-center gap-space-xs border border-surface-container-high" type="button">
                <span className="material-symbols-outlined text-primary text-[18px]">health_and_safety</span>
                <span>Généraliste</span>
              </button>
              <button onClick={() => setView('doctors', { specialty: 'Cardiologie' })} className="shrink-0 px-space-md py-space-xs rounded-full bg-primary-container text-on-primary font-label-sm text-label-sm shadow-sm flex items-center gap-space-xs font-semibold" type="button">
                <span className="material-symbols-outlined text-[18px]">favorite</span>
                <span>Cardiologie</span>
              </button>
              <button onClick={() => setView('doctors', { specialty: 'Gynécologie' })} className="shrink-0 px-space-md py-space-xs rounded-full bg-surface-container-lowest text-on-surface font-label-sm text-label-sm hover:bg-primary-container hover:text-on-primary transition-colors shadow-sm flex items-center gap-space-xs border border-surface-container-high" type="button">
                <span className="material-symbols-outlined text-primary text-[18px]">female</span>
                <span>Gynécologie</span>
              </button>
              <button onClick={() => setView('doctors', { specialty: 'Pédiatrie' })} className="shrink-0 px-space-md py-space-xs rounded-full bg-surface-container-lowest text-on-surface font-label-sm text-label-sm hover:bg-primary-container hover:text-on-primary transition-colors shadow-sm flex items-center gap-space-xs border border-surface-container-high" type="button">
                <span className="material-symbols-outlined text-primary text-[18px]">child_care</span>
                <span>Pédiatrie</span>
              </button>
              <button onClick={() => setView('doctors', { specialty: 'Dermatologie' })} className="shrink-0 px-space-md py-space-xs rounded-full bg-surface-container-lowest text-on-surface font-label-sm text-label-sm hover:bg-primary-container hover:text-on-primary transition-colors shadow-sm flex items-center gap-space-xs border border-surface-container-high" type="button">
                <span className="material-symbols-outlined text-primary text-[18px]">dermatology</span>
                <span>Dermatologie</span>
              </button>
              <button onClick={() => setView('doctors', { specialty: 'Ophtalmologie' })} className="shrink-0 px-space-md py-space-xs rounded-full bg-surface-container-lowest text-on-surface font-label-sm text-label-sm hover:bg-primary-container hover:text-on-primary transition-colors shadow-sm flex items-center gap-space-xs border border-surface-container-high" type="button">
                <span className="material-symbols-outlined text-primary text-[18px]">visibility</span>
                <span>Ophtalmologie</span>
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* 3. Key Metric / Social Proof Strip */}
      <section className="w-full bg-surface-container-low py-space-lg px-margin md:px-margin-md lg:px-margin-lg border-y border-surface-container-high">
        <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-gutter-md">
          <div className="flex flex-col items-center text-center p-space-sm">
            <span className="font-headline-xl text-headline-xl font-bold text-primary-container tracking-tight">250,000+</span>
            <span className="font-label-md text-label-md text-on-surface-variant font-semibold mt-1">Appointments Booked</span>
            <span className="font-label-sm text-label-sm text-outline">Across 24 Governorates</span>
          </div>
          <div className="flex flex-col items-center text-center p-space-sm">
            <span className="font-headline-xl text-headline-xl font-bold text-primary-container tracking-tight">650+</span>
            <span className="font-label-md text-label-md text-on-surface-variant font-semibold mt-1">Active Verified Clinicians</span>
            <span className="font-label-sm text-label-sm text-outline">Cabinet &amp; Polyclinics</span>
          </div>
          <div className="flex flex-col items-center text-center p-space-sm">
            <span className="font-headline-xl text-headline-xl font-bold text-secondary tracking-tight">&lt; 12 min</span>
            <span className="font-label-md text-label-md text-on-surface-variant font-semibold mt-1">Average Waiting Time</span>
            <span className="font-label-sm text-label-sm text-outline">Reduced from 65 mins</span>
          </div>
          <div className="flex flex-col items-center text-center p-space-sm">
            <span className="font-headline-xl text-headline-xl font-bold text-primary-container tracking-tight">98.4%</span>
            <span className="font-label-md text-label-md text-on-surface-variant font-semibold mt-1">Patient Satisfaction</span>
            <span className="font-label-sm text-label-sm text-outline">Verified post-consultation reviews</span>
          </div>
        </div>
      </section>

      {/* 4. Patient Solutions Section */}
      <section className="w-full px-margin md:px-margin-md lg:px-margin-lg py-space-xl">
        <div className="max-w-7xl mx-auto flex flex-col gap-space-xl">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md">
            <div className="flex flex-col gap-space-xs max-w-2xl">
              <div className="inline-flex items-center gap-1 font-label-sm text-label-sm text-secondary font-bold uppercase tracking-wider">
                <span className="material-symbols-outlined text-[16px]">person_pin</span>
                For Patients — Healthcare without the friction
              </div>
              <h2 className="font-headline-lg text-headline-lg text-on-surface font-bold">
                Designed for human comfort, punctuality, and medical clarity
              </h2>
              <p className="font-body-md text-body-md text-on-surface-variant">
                Say goodbye to endless phone busy tones and overcrowded waiting rooms. Manage your family's health in Tunisia with transparency.
              </p>
            </div>
            <button onClick={() => setView('doctors')} className="inline-flex items-center gap-space-xs font-label-lg text-label-lg text-primary font-bold hover:text-primary-container transition-colors">
              <span>Search all specialists</span>
              <span className="material-symbols-outlined text-[18px]">chevron_right</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter-md">
            {/* Feature 1 */}
            <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between gap-space-md relative overflow-hidden border border-surface-container-high">
              <div className="absolute top-0 left-0 right-0 h-1 bg-primary-container"></div>
              <div className="flex flex-col gap-space-sm">
                <div className="w-12 h-12 rounded-lg bg-surface-container-high text-primary-container flex items-center justify-center">
                  <span className="material-symbols-outlined text-[26px]">calendar_clock</span>
                </div>
                <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">Easy Online Booking in 3 Clicks</h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Confirm appointments 24/7 without making phone calls. Filter by CNAM convention, language (Arabic/French), location, or urgency.
                </p>
              </div>
              <div className="bg-surface-container-low rounded-lg p-space-sm flex flex-col gap-space-xs">
                <div className="flex items-center justify-between">
                  <span className="font-label-sm text-label-sm font-semibold text-on-surface">SMS + WhatsApp Notification</span>
                  <span className="px-space-xs py-0.5 rounded bg-surface-container-highest text-primary font-label-sm text-label-sm font-bold">Confirmed</span>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  « RDV confirmé le 14 Oct à 10:30 avec Dr. Mahmoudi (Pédiatre, Ennasr 2) »
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between gap-space-md relative overflow-hidden border border-surface-container-high">
              <div className="absolute top-0 left-0 right-0 h-1 bg-secondary-container"></div>
              <div className="flex flex-col gap-space-sm">
                <div className="w-12 h-12 rounded-lg bg-secondary-fixed text-secondary flex items-center justify-center">
                  <span className="material-symbols-outlined text-[26px]">stream</span>
                </div>
                <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">Live Waiting Room Queue Tracker</h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Know the exact queue status before leaving your home or office. Spend less time sitting around sick patients and arrive precisely when it's your turn.
                </p>
              </div>
              <div className="bg-surface-container-low rounded-lg p-space-sm flex flex-col gap-space-xs">
                <div className="flex items-center justify-between text-on-surface">
                  <span className="font-label-sm text-label-sm font-bold flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-secondary-container animate-ping"></span>
                    Cabinet Dr. Mansour
                  </span>
                  <span className="font-label-sm text-label-sm text-secondary font-bold">2 patients ahead</span>
                </div>
                <div className="w-full bg-surface-container-highest h-2 rounded-full overflow-hidden">
                  <div className="bg-secondary-container h-full rounded-full" style={{ width: '70%' }}></div>
                </div>
                <div className="flex justify-between font-label-sm text-label-sm text-outline pt-0.5">
                  <span>Patient #06 in room</span>
                  <span>Your ticket: #08</span>
                </div>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between gap-space-md relative overflow-hidden border border-surface-container-high">
              <div className="absolute top-0 left-0 right-0 h-1 bg-primary-container"></div>
              <div className="flex flex-col gap-space-sm">
                <div className="w-12 h-12 rounded-lg bg-surface-container-high text-primary-container flex items-center justify-center">
                  <span className="material-symbols-outlined text-[26px]">folder_shared</span>
                </div>
                <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">Your Medical History, Always Accessible</h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Encrypted digital storage for your blood tests, bilingual prescriptions (Ordonnances en Français/العربية), vaccine records, and CNAM reimbursement vouchers.
                </p>
              </div>
              <div className="bg-surface-container-low rounded-lg p-space-sm flex items-center justify-between">
                <div className="flex items-center gap-space-xs">
                  <span className="material-symbols-outlined text-primary text-[20px]">prescriptions</span>
                  <div className="flex flex-col">
                    <span className="font-label-sm text-label-sm font-bold text-on-surface">Ordonnance Électronique</span>
                    <span className="font-label-sm text-label-sm text-on-surface-variant">Validée avec QR code pharmacie</span>
                  </div>
                </div>
                <span className="material-symbols-outlined text-outline text-[20px]">download</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Doctor & Practice OS Section */}
      <section className="w-full bg-surface-container-low px-margin md:px-margin-md lg:px-margin-lg py-space-xl border-y border-surface-container-high">
        <div className="max-w-7xl mx-auto flex flex-col gap-space-xl">
          <div className="flex flex-col gap-space-xs max-w-3xl">
            <div className="inline-flex items-center gap-1 font-label-sm text-label-sm text-primary font-bold uppercase tracking-wider">
              <span className="material-symbols-outlined text-[16px]">stethoscope_check</span>
              For Doctors &amp; Medical Centers — Reclaim 2 hours every day
            </div>
            <h2 className="font-headline-xl text-headline-xl text-on-surface font-bold">
              An intelligent clinical OS engineered for Tunisian medical practices
            </h2>
            <p className="font-body-lg text-body-lg text-on-surface-variant">
              Co-designed with practicing physicians and secretariat staff across Tunis, Sousse, and Sfax to eradicate no-shows, streamline billing, and elevate patient care.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter-md">
            {/* Pillar 1 */}
            <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col justify-between gap-space-md border border-surface-container-high">
              <div className="flex flex-col gap-space-sm">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-surface-container-high text-primary-container">
                    <span className="material-symbols-outlined text-[24px]">event_available</span>
                  </span>
                  <span className="font-label-sm text-label-sm px-space-xs py-0.5 rounded bg-surface-container font-semibold text-primary">
                    -72% No-Shows
                  </span>
                </div>
                <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">Smart Agenda &amp; Emergency Rescheduling</h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Multi-channel automated SMS &amp; WhatsApp confirmations. When emergencies happen, reschedule an entire morning with a single broadcast tap.
                </p>
              </div>
              <div className="bg-surface-container-low rounded-lg p-space-sm flex flex-col gap-space-xs">
                <div className="flex justify-between items-center text-on-surface font-label-sm text-label-sm font-semibold">
                  <span>Appointment Attendance</span>
                  <span className="text-primary font-bold">96.8% filled</span>
                </div>
                <div className="flex h-3 w-full rounded-full bg-surface-container-highest overflow-hidden">
                  <div className="bg-primary h-full" style={{ width: '82%' }}></div>
                  <div className="bg-primary-fixed-dim h-full" style={{ width: '14%' }}></div>
                  <div className="bg-secondary-container h-full" style={{ width: '4%' }}></div>
                </div>
                <div className="flex justify-between text-outline font-label-sm text-label-sm pt-0.5">
                  <span>Completed (82%)</span>
                  <span>Rescheduled (14%)</span>
                  <span>No-Show (4%)</span>
                </div>
              </div>
            </div>

            {/* Pillar 2 */}
            <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col justify-between gap-space-md border border-surface-container-high">
              <div className="flex flex-col gap-space-sm">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-surface-container-high text-primary-container">
                    <span className="material-symbols-outlined text-[24px]">clinical_notes</span>
                  </span>
                  <span className="font-label-sm text-label-sm px-space-xs py-0.5 rounded bg-surface-container font-semibold text-primary">
                    Instant RTL/LTR
                  </span>
                </div>
                <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">Unified Medical Record &amp; Fast EMR</h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Specialty-tailored consultation templates (Cardio, Pediatrie, Dermato). Built-in drug interaction detector with local Tunisian pharmaceutical database.
                </p>
              </div>
              <div className="bg-surface-container-low rounded-lg p-space-sm flex flex-col gap-space-xs">
                <div className="flex items-center gap-space-xs">
                  <span className="material-symbols-outlined text-error text-[18px]">warning</span>
                  <span className="font-label-sm text-label-sm text-error font-bold">Contraindication Alert Detected</span>
                </div>
                <p className="font-label-sm text-label-sm text-on-surface-variant">
                  Amoxicilline + Patient allergy recorded in 2023. Substitution suggested automatically.
                </p>
              </div>
            </div>

            {/* Pillar 3 */}
            <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col justify-between gap-space-md border border-surface-container-high">
              <div className="flex flex-col gap-space-sm">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-surface-container-high text-primary-container">
                    <span className="material-symbols-outlined text-[24px]">receipt_long</span>
                  </span>
                  <span className="font-label-sm text-label-sm px-space-xs py-0.5 rounded bg-surface-container font-semibold text-secondary font-bold">
                    CNAM Ready
                  </span>
                </div>
                <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">Automated Billing &amp; CNAM Bordereaux</h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Generate standardized CNAM refund sheets (Filière privée / Médecin de famille), print clean honoraires receipts (TND), and reconcile daily cash intake instantly.
                </p>
              </div>
              <div className="bg-surface-container-low rounded-lg p-space-sm flex flex-col gap-space-xs">
                <div className="flex justify-between items-center font-label-sm text-label-sm">
                  <span className="text-on-surface-variant">Today's Clinic Receipts</span>
                  <span className="font-bold text-on-surface">1,420 TND</span>
                </div>
                <div className="flex justify-between items-center font-label-sm text-label-sm text-outline">
                  <span>CNAM Direct Claims (APC)</span>
                  <span className="font-medium text-primary">6 Files Exported</span>
                </div>
              </div>
            </div>
          </div>

          {/* Lead Magnet Showcase Banner */}
          <div className="bg-surface-container-highest rounded-xl p-space-lg md:p-space-xl flex flex-col md:flex-row items-center justify-between gap-space-lg border border-surface-container-high">
            <div className="flex flex-col gap-space-xs max-w-xl">
              <span className="font-label-sm text-label-sm text-primary font-bold uppercase tracking-wider">Practice Transformation</span>
              <h3 className="font-headline-md text-headline-md text-on-surface font-bold">
                Ready to give your secretariat and patients a world-class experience?
              </h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Zero setup fees. Free migration from old desktop software or Excel files. Fully supported by our local team based in Tunis.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-space-sm w-full md:w-auto">
              <button onClick={() => setView('onboarding')} className="inline-flex items-center justify-center px-space-lg py-space-sm rounded-lg bg-primary-container text-on-primary font-label-lg text-label-lg font-bold shadow hover:bg-primary transition-colors">
                Schedule 15-Min Practice Demo
              </button>
              <button onClick={() => setView('pricing')} className="inline-flex items-center justify-center px-space-lg py-space-sm rounded-lg bg-surface-container-lowest text-primary font-label-lg text-label-lg font-semibold hover:bg-surface transition-colors shadow-sm">
                View Pricing Plans
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Clinic Network & Verified Specialists Showcase */}
      <section className="w-full px-margin md:px-margin-md lg:px-margin-lg py-space-xl">
        <div className="max-w-7xl mx-auto flex flex-col gap-space-lg">
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-space-sm">
            <div>
              <span className="font-label-sm text-label-sm text-primary font-bold uppercase tracking-wider">Tunisian Medical Excellence</span>
              <h2 className="font-headline-lg text-headline-lg text-on-surface font-bold">Verified Practitioners on MediDesk</h2>
              <p className="font-body-md text-body-md text-on-surface-variant">Available for online booking right now</p>
            </div>
            <button onClick={() => setView('doctors')} className="font-label-md text-label-md text-primary font-bold flex items-center gap-1 hover:underline">
              <span>Browse all specialties in your city</span>
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter-md">
            {doctors.map((doc) => (
              <div key={doc.id} className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between gap-space-md border border-surface-container-high">
                <div className="flex flex-col gap-space-sm">
                  <div className="relative w-full h-44 rounded-lg overflow-hidden bg-surface-container-high">
                    <img className="w-full h-full object-cover" src={doc.avatar_url} alt={doc.name} />
                    {doc.cnam_convention === 1 && (
                      <span className="absolute top-2 right-2 px-space-xs py-0.5 rounded bg-surface-container-lowest/90 font-label-sm text-label-sm font-bold text-primary shadow-sm backdrop-blur-sm">
                        Conventionné
                      </span>
                    )}
                  </div>
                  <div>
                    <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">{doc.name}</h3>
                    <p className="font-label-md text-label-md text-primary font-medium">{doc.specialty}</p>
                    <p className="font-body-sm text-body-sm text-on-surface-variant flex items-center gap-1 mt-0.5">
                      <span className="material-symbols-outlined text-outline text-[16px]">location_on</span>
                      {doc.city} • {doc.address}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col gap-space-xs pt-space-xs border-t border-surface-container-low">
                  <div className="flex items-center justify-between text-label-sm font-label-sm text-on-surface-variant">
                    <span>Next: {doc.availability_status}</span>
                    <span className="font-bold text-on-surface">{doc.fee_tnd} TND</span>
                  </div>
                  <button 
                    onClick={() => onOpenBooking(doc)}
                    className="w-full py-space-xs rounded bg-surface-container-low hover:bg-primary hover:text-on-primary text-primary font-label-sm text-label-sm font-bold text-center transition-colors"
                  >
                    Book Appointment
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. Trust, Data Privacy & Medical Compliance Strip */}
      <section className="w-full bg-surface-container-highest px-margin md:px-margin-md lg:px-margin-lg py-space-xl border-y border-surface-container-high">
        <div className="max-w-7xl mx-auto flex flex-col gap-space-lg">
          <div className="text-center max-w-2xl mx-auto flex flex-col gap-space-xs">
            <span className="font-label-sm text-label-sm text-primary font-bold uppercase tracking-wider">Health Data Protection</span>
            <h2 class="font-headline-lg text-headline-lg text-on-surface font-bold">Enterprise-Grade Medical Security &amp; Compliance</h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Your personal medical dossier and clinical histories are protected according to the highest health data encryption standards in Tunisia.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter-md">
            <div className="bg-surface-container-lowest rounded-xl p-space-md flex flex-col gap-space-xs shadow-sm border border-surface-container-high">
              <div className="w-10 h-10 rounded-lg bg-surface-container text-primary flex items-center justify-center">
                <span className="material-symbols-outlined text-[24px]">cloud_lock</span>
              </div>
              <h4 className="font-headline-sm text-headline-sm text-on-surface font-bold">HDS-Certified Cloud</h4>
              <p className="font-body-sm text-body-sm text-on-surface-variant">Hosted exclusively on sovereign health-grade servers with ISO-27001 medical tier redundancy.</p>
            </div>
            <div className="bg-surface-container-lowest rounded-xl p-space-md flex flex-col gap-space-xs shadow-sm border border-surface-container-high">
              <div className="w-10 h-10 rounded-lg bg-surface-container text-primary flex items-center justify-center">
                <span className="material-symbols-outlined text-[24px]">enhanced_encryption</span>
              </div>
              <h4 className="font-headline-sm text-headline-sm text-on-surface font-bold">End-to-End AES 256</h4>
              <p className="font-body-sm text-body-sm text-on-surface-variant">Clinical notes, lab results, and patient IDs are encrypted at rest and in transit.</p>
            </div>
            <div className="bg-surface-container-lowest rounded-xl p-space-md flex flex-col gap-space-xs shadow-sm border border-surface-container-high">
              <div className="w-10 h-10 rounded-lg bg-surface-container text-primary flex items-center justify-center">
                <span className="material-symbols-outlined text-[24px]">phonelink_lock</span>
              </div>
              <h4 className="font-headline-sm text-headline-sm text-on-surface font-bold">Mandatory 2FA</h4>
              <p className="font-body-sm text-body-sm text-on-surface-variant">Two-factor verification for secretarial and clinician portals prevents unauthorized access.</p>
            </div>
            <div className="bg-surface-container-lowest rounded-xl p-space-md flex flex-col gap-space-xs shadow-sm border border-surface-container-high">
              <div className="w-10 h-10 rounded-lg bg-surface-container text-primary flex items-center justify-center">
                <span className="material-symbols-outlined text-[24px]">verified</span>
              </div>
              <h4 className="font-headline-sm text-headline-sm text-on-surface font-bold">INPDP &amp; RGPD Accrédité</h4>
              <p className="font-body-sm text-body-sm text-on-surface-variant">Full compliance with Tunisian National Authority for Personal Data Protection (INPDP) guidelines.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 8. Pre-Footer Dual Call-to-Action */}
      <section className="w-full bg-surface-container-low px-margin md:px-margin-md lg:px-margin-lg py-space-xl">
        <div className="max-w-7xl mx-auto rounded-xl bg-gradient-to-br from-primary-container to-primary text-on-primary p-space-lg md:p-space-xl shadow-xl flex flex-col lg:flex-row items-center justify-between gap-space-lg relative overflow-hidden">
          <div className="flex flex-col gap-space-xs max-w-xl z-10">
            <span className="font-label-sm text-label-sm text-secondary-fixed uppercase tracking-wider font-bold">Modern Healthcare Experience</span>
            <h2 className="font-headline-xl text-headline-xl font-bold tracking-tight text-on-primary">
              Ready to experience frictionless healthcare in Tunisia?
            </h2>
            <p className="font-body-md text-body-md opacity-90">
              Whether you need a consultation this afternoon or want to bring your medical practice into the digital age, MediDesk is built for you.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-space-md w-full lg:w-auto z-10">
            <button onClick={() => setView('doctors')} className="w-full sm:w-auto inline-flex items-center justify-center px-space-lg py-3 rounded-lg bg-secondary-container text-on-secondary font-label-lg text-label-lg font-bold shadow-lg hover:bg-secondary transition-all">
              <span className="material-symbols-outlined mr-space-xs text-[20px]">search</span>
              Find a Specialist Near You
            </button>
            <button onClick={() => setView('onboarding')} className="w-full sm:w-auto inline-flex items-center justify-center px-space-lg py-3 rounded-lg bg-surface text-primary font-label-lg text-label-lg font-bold hover:bg-surface-container-high transition-colors shadow">
              <span className="material-symbols-outlined mr-space-xs text-[20px]">medical_services</span>
              Start 30-Day Doctor Trial
            </button>
          </div>
        </div>
      </section>

    </div>
  );
}
