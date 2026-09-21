import React, { useState, useEffect } from 'react';
import { fetchDoctors } from '../services/api';
import { useLanguage } from '../context/LanguageContext';

export default function HomeView({ setView, onOpenBooking }) {
  const { t } = useLanguage();
  const [doctors, setDoctors] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchCity, setSearchCity] = useState('all');
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
    <div className="w-full flex flex-col pt-20">
      
      {/* Practitioner Announcement Banner */}
      <section className="w-full bg-surface-container-high py-space-xs px-margin md:px-margin-md lg:px-margin-lg border-b border-surface-container-highest">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-space-sm text-on-surface">
          <div className="flex items-center gap-space-sm">
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary-container text-on-primary">
              <span className="material-symbols-outlined text-[14px]">medical_services</span>
            </span>
            <span className="font-label-md text-label-md text-on-surface-variant">
              Vous êtes médecin ou gestionnaire de clinique en Tunisie ? Rejoignez <strong className="text-primary-container font-semibold">650+ praticiens agréés</strong>.
            </span>
          </div>
          <button 
            onClick={() => setView('onboarding')}
            className="inline-flex items-center gap-space-xs font-label-sm text-label-sm text-primary font-bold hover:text-primary-container transition-colors group"
          >
            <span>{t('upgrade_pro')}</span>
            <span className="material-symbols-outlined text-[16px] group-hover:translate-x-0.5 transition-transform">arrow_forward</span>
          </button>
        </div>
      </section>

      {/* Hero Section */}
      <section className="relative w-full px-margin md:px-margin-md lg:px-margin-lg pt-space-xl pb-space-xl overflow-hidden">
        {/* Glow ambient background elements */}
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-primary-fixed/30 blur-3xl pointer-events-none -z-10"></div>
        <div className="absolute top-1/2 -left-20 w-80 h-80 rounded-full bg-secondary-fixed/40 blur-3xl pointer-events-none -z-10"></div>

        <div className="max-w-7xl mx-auto flex flex-col gap-space-lg">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter-lg items-center">
            
            {/* Left Column: Headline */}
            <div className="lg:col-span-7 flex flex-col gap-space-md">
              <div className="inline-flex items-center gap-space-xs px-space-md py-space-xs rounded-full bg-surface-container-highest text-primary-container w-fit shadow-sm border border-outline-variant/30">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                <span className="font-label-sm text-label-sm uppercase tracking-wider font-semibold">
                  Réseau Médical National • Tunis • Sousse • Sfax
                </span>
              </div>

              <h1 className="font-headline-xl text-headline-xl text-on-surface tracking-tight max-w-2xl font-bold">
                {t('hero_title')}
              </h1>

              <p className="font-body-lg text-body-lg text-on-surface-variant max-w-xl">
                {t('hero_sub')}
              </p>

              {/* Trust Features Strip */}
              <div className="flex flex-wrap items-center gap-x-space-md gap-y-space-xs pt-space-xs">
                <div className="flex items-center gap-space-xs">
                  <span className="material-symbols-outlined text-primary text-[18px]">verified</span>
                  <span className="font-label-sm text-label-sm text-on-surface-variant font-medium">100% Gratuit pour les patients</span>
                </div>
                <div className="flex items-center gap-space-xs">
                  <span className="material-symbols-outlined text-primary text-[18px]">mark_chat_read</span>
                  <span className="font-label-sm text-label-sm text-on-surface-variant font-medium">Alertes SMS & WhatsApp immédiates</span>
                </div>
                <div className="flex items-center gap-space-xs">
                  <span className="material-symbols-outlined text-secondary text-[18px]">timelapse</span>
                  <span className="font-label-sm text-label-sm text-on-surface-variant font-medium">Zéro attente inutile en salle</span>
                </div>
              </div>
            </div>

            {/* Right Column: Live Doctor Status Mockup Widget */}
            <div className="lg:col-span-5 relative">
              <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-xl flex flex-col gap-space-md relative overflow-hidden border border-surface-container-high">
                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-primary-container"></div>
                
                <div className="flex items-start justify-between gap-space-sm pl-space-xs">
                  <div className="flex items-center gap-space-sm">
                    <img 
                      src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=200" 
                      alt="Dr Leila Ben Salem"
                      className="w-12 h-12 rounded-lg object-cover bg-surface-container-high shrink-0 border border-outline-variant/40"
                    />
                    <div>
                      <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">Dr. Leila Ben Salem</h3>
                      <p className="font-label-sm text-label-sm text-on-surface-variant">Cardiologue • Centre Urbain Nord, Tunis</p>
                    </div>
                  </div>
                  <span className="inline-flex items-center px-space-sm py-space-xs rounded-full bg-surface-container-high text-primary font-label-sm text-label-sm font-semibold">
                    Disponible Aujourd'hui
                  </span>
                </div>

                {/* Real-Time Queue Glance Box */}
                <div 
                  onClick={() => setView('queue')}
                  className="bg-surface-container-low rounded-lg p-space-sm flex items-center justify-between cursor-pointer hover:bg-surface-container transition-colors border border-surface-container-high"
                >
                  <div className="flex items-center gap-space-sm">
                    <div className="w-10 h-10 rounded-md bg-primary-container text-on-primary flex items-center justify-center font-headline-sm text-headline-sm font-bold">
                      04
                    </div>
                    <div>
                      <p className="font-label-sm text-label-sm text-on-surface-variant">Position dans la file d'attente</p>
                      <p className="font-label-md text-label-md text-on-surface font-semibold">Médecin en consultation avec patient #03</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="inline-block px-space-xs py-0.5 rounded bg-secondary-fixed text-on-secondary-container font-label-sm text-label-sm font-bold">
                      ~12 min d'attente
                    </span>
                  </div>
                </div>

                {/* Interactive Time Slot Row */}
                <div className="flex flex-col gap-space-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-label-sm text-label-sm text-on-surface-variant font-semibold">Prochaines consultations :</span>
                    <button onClick={() => setView('doctors')} className="font-label-sm text-label-sm text-primary hover:underline">Voir l'agenda complet</button>
                  </div>
                  <div className="grid grid-cols-3 gap-space-xs">
                    <button onClick={() => onOpenBooking(doctors[0])} className="py-space-sm px-space-xs rounded bg-surface hover:bg-primary-container hover:text-on-primary transition-all text-center text-on-surface border border-outline-variant/40">
                      <span className="block font-label-md text-label-md font-bold">14:30</span>
                      <span className="block font-label-sm text-label-sm opacity-80">Cabinet</span>
                    </button>
                    <button onClick={() => onOpenBooking(doctors[0])} className="py-space-sm px-space-xs rounded bg-primary-container text-on-primary font-label-md text-label-md font-bold text-center shadow-md">
                      <span className="block font-label-md text-label-md">15:15</span>
                      <span className="block font-label-sm text-label-sm opacity-90">Disponible</span>
                    </button>
                    <button onClick={() => onOpenBooking(doctors[0])} className="py-space-sm px-space-xs rounded bg-surface hover:bg-primary-container hover:text-on-primary transition-all text-center text-on-surface border border-outline-variant/40">
                      <span className="block font-label-md text-label-md font-bold">16:00</span>
                      <span className="block font-label-sm text-label-sm opacity-80">Cabinet</span>
                    </button>
                  </div>
                </div>

                {/* CNAM Strip */}
                <div className="flex items-center justify-between pt-space-xs text-on-surface-variant font-label-sm text-label-sm border-t border-surface-container-low">
                  <span className="flex items-center gap-1 font-medium text-primary">
                    <span className="material-symbols-outlined text-[16px]">verified_user</span>
                    Conventionné CNAM
                  </span>
                  <span className="font-bold text-on-surface">Honoraires: 60 TND</span>
                </div>

              </div>
            </div>

          </div>

          {/* Multi-Field Search Form Engine */}
          <div className="w-full bg-surface-container-lowest rounded-xl shadow-lg p-space-md md:p-space-lg border border-surface-container-high">
            <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-space-sm items-end">
              
              <div className="md:col-span-5 flex flex-col gap-space-xs">
                <label className="font-label-sm text-label-sm text-on-surface-variant font-semibold flex items-center gap-1">
                  <span className="material-symbols-outlined text-primary text-[18px]">stethoscope</span>
                  Médecin, Spécialité ou Établissement
                </label>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Ex: Cardiologue, Dr. Ben Salem, Pédiatre..."
                  className="w-full h-11 px-space-md rounded-lg bg-surface-container-low text-on-surface placeholder:text-outline font-body-md text-body-md focus:bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary border border-outline-variant/40 transition-all"
                />
              </div>

              <div className="md:col-span-4 flex flex-col gap-space-xs">
                <label className="font-label-sm text-label-sm text-on-surface-variant font-semibold flex items-center gap-1">
                  <span className="material-symbols-outlined text-primary text-[18px]">location_on</span>
                  Gouvernorat ou Ville (Tunisie)
                </label>
                <select
                  value={searchCity}
                  onChange={(e) => setSearchCity(e.target.value)}
                  className="w-full h-11 px-space-md rounded-lg bg-surface-container-low text-on-surface font-body-md text-body-md focus:bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary border border-outline-variant/40 transition-all cursor-pointer"
                >
                  <option value="all">Toutes Régions (Tous Gouvernorats)</option>
                  <option value="Tunis">Tunis (Centre, Ennasr, Berges du Lac)</option>
                  <option value="Sousse">Sousse (Khezama, Ville)</option>
                  <option value="Sfax">Sfax (Téniour, Ville)</option>
                  <option value="Monastir">Monastir</option>
                  <option value="Ariana">Ariana</option>
                  <option value="Nabeul">Nabeul & Hammamet</option>
                </select>
              </div>

              <div className="md:col-span-3 flex">
                <button
                  type="submit"
                  className="w-full h-11 px-space-md rounded-lg bg-primary-container text-on-primary font-label-lg text-label-lg font-bold flex items-center justify-center gap-space-xs shadow-md hover:bg-primary transition-all focus:outline-none"
                >
                  <span className="material-symbols-outlined text-[20px]">search</span>
                  <span>{t('search_btn')}</span>
                </button>
              </div>

            </form>
          </div>

          {/* Quick Specialty Pills */}
          <div className="flex flex-col gap-space-xs pt-space-xs">
            <span className="font-label-sm text-label-sm text-on-surface-variant font-bold uppercase tracking-wider">
              Spécialités les plus consultées :
            </span>
            <div className="flex items-center gap-space-xs overflow-x-auto pb-space-xs scrollbar-none">
              {['Généraliste', 'Cardiologie', 'Pédiatrie', 'Dermatologie', 'Ophtalmologie', 'Gynécologie'].map((spec) => (
                <button
                  key={spec}
                  onClick={() => setView('doctors', { specialty: spec })}
                  className="shrink-0 px-space-md py-space-xs rounded-full bg-surface-container-lowest text-on-surface font-label-sm text-label-sm hover:bg-primary-container hover:text-on-primary transition-all shadow-sm border border-surface-container-high flex items-center gap-space-xs font-medium"
                >
                  <span className="material-symbols-outlined text-primary text-[16px]">medical_information</span>
                  <span>{spec}</span>
                </button>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* Metric Proof Strip */}
      <section className="w-full bg-surface-container-low py-space-lg px-margin md:px-margin-md lg:px-margin-lg border-y border-surface-container-high">
        <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-gutter-md">
          <div className="flex flex-col items-center text-center p-space-sm">
            <span className="font-headline-xl text-headline-xl font-extrabold text-primary-container tracking-tight">250,000+</span>
            <span className="font-label-md text-label-md text-on-surface-variant font-semibold mt-1">Rendez-vous confirmés</span>
            <span className="font-label-sm text-label-sm text-outline">Sur 24 Gouvernorats</span>
          </div>
          <div className="flex flex-col items-center text-center p-space-sm">
            <span className="font-headline-xl text-headline-xl font-extrabold text-primary-container tracking-tight">650+</span>
            <span className="font-label-md text-label-md text-on-surface-variant font-semibold mt-1">Médecins Spécialistes</span>
            <span className="font-label-sm text-label-sm text-outline">Cabinets & Polycliniques</span>
          </div>
          <div className="flex flex-col items-center text-center p-space-sm">
            <span className="font-headline-xl text-headline-xl font-extrabold text-secondary tracking-tight">&lt; 12 min</span>
            <span className="font-label-md text-label-md text-on-surface-variant font-semibold mt-1">Délai d'attente moyen</span>
            <span className="font-label-sm text-label-sm text-outline">Réduit de 65 minutes</span>
          </div>
          <div className="flex flex-col items-center text-center p-space-sm">
            <span className="font-headline-xl text-headline-xl font-extrabold text-primary-container tracking-tight">98.4%</span>
            <span className="font-label-md text-label-md text-on-surface-variant font-semibold mt-1">Satisfaction Patient</span>
            <span className="font-label-sm text-label-sm text-outline">Avis vérifiés post-consultation</span>
          </div>
        </div>
      </section>

      {/* Featured Verified Practitioners Grid */}
      <section className="w-full px-margin md:px-margin-md lg:px-margin-lg py-space-xl">
        <div className="max-w-7xl mx-auto flex flex-col gap-space-lg">
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-space-sm">
            <div>
              <span className="font-label-sm text-label-sm text-primary font-bold uppercase tracking-wider">Praticiens Agréés</span>
              <h2 className="font-headline-lg text-headline-lg text-on-surface font-bold">Médecins disponibles sur MediDesk</h2>
              <p className="font-body-md text-body-md text-on-surface-variant">Prise de rendez-vous en ligne immédiate</p>
            </div>
            <button 
              onClick={() => setView('doctors')}
              className="font-label-md text-label-md text-primary font-bold flex items-center gap-1 hover:underline"
            >
              <span>Voir l'annuaire complet</span>
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter-md">
            {doctors.map((doc) => (
              <div key={doc.id} className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm hover:shadow-md transition-all border border-surface-container-high flex flex-col justify-between gap-space-md">
                <div className="flex flex-col gap-space-sm">
                  <div className="relative w-full h-44 rounded-lg overflow-hidden bg-surface-container-high">
                    <img src={doc.avatar_url} alt={doc.name} className="w-full h-full object-cover" />
                    {doc.cnam_convention === 1 && (
                      <span className="absolute top-2 right-2 px-space-xs py-0.5 rounded bg-surface-container-lowest/90 font-label-sm text-label-sm font-bold text-primary shadow-sm backdrop-blur-sm">
                        Conventionné CNAM
                      </span>
                    )}
                  </div>
                  <div>
                    <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">{doc.name}</h3>
                    <p className="font-label-md text-label-md text-primary font-semibold">{doc.title}</p>
                    <p className="font-body-sm text-body-sm text-on-surface-variant flex items-center gap-1 mt-0.5">
                      <span className="material-symbols-outlined text-outline text-[16px]">location_on</span>
                      {doc.address}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col gap-space-xs pt-space-xs border-t border-surface-container-low">
                  <div className="flex items-center justify-between text-label-sm font-label-sm text-on-surface-variant">
                    <span>Prochain rdv: {doc.availability_status}</span>
                    <span className="font-bold text-on-surface">{doc.fee_tnd} TND</span>
                  </div>
                  <button
                    onClick={() => onOpenBooking(doc)}
                    className="w-full py-2 rounded-lg bg-primary-container text-on-primary font-label-lg text-label-lg font-bold text-center hover:bg-primary transition-colors shadow-sm flex items-center justify-center gap-1"
                  >
                    <span className="material-symbols-outlined text-[18px]">calendar_month</span>
                    <span>Prendre Rendez-vous</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
