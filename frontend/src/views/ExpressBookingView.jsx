import React, { useState } from 'react';

export default function ExpressBookingView({ setView }) {
  const [selectedDoctor, setSelectedDoctor] = useState({
    id: 1,
    name: 'Dr. Karim Ben Mahmoud',
    specialty: 'Cardiologie & Médecine Interne',
    location: 'Clinique Alyssa • Cabinet 302, Tunis',
    fee: '70 TND (Conventionné CNAM)'
  });
  const [selectedSlot, setSelectedSlot] = useState({
    day: 'Mardi 29 Octobre 2024',
    time: '10:00'
  });
  const [consultationMode, setConsultationMode] = useState('cabinet');
  const [motive, setMotive] = useState('Suivi cardiologique & ECG');
  const [loading, setLoading] = useState(false);

  const doctors = [
    {
      id: 1,
      name: 'Dr. Karim Ben Mahmoud',
      specialty: 'Cardiologie & Médecine Interne',
      location: 'Clinique Alyssa • Cabinet 302, Tunis',
      lastVisit: '24 Octobre 2024',
      fee: '70 TND (Conventionné CNAM)',
      badge: 'Médecin Traitant Déclaré',
      img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD4lhFkVbbRXzOFQeGM6mLrCMInku9fOl9SeccI6V7h-vOiKZ2Q_OcJK1IWrZCabDNcz3Ekwbc-M7RNZ8Xp3DqQAYJ5aBqMPzhKV_arq-J-RQTFW50WWQ3Z7Mi9e1Tkp9j8BDizNrCBUZq3H3fdiOjFm7E-fk9kGKbTYe1kcfiGdK_vpp8Aon5111mPE5UEtZH1GNlvdi86Qc9qVYcLij6_kBw8stkl54MeeNVJltXwmgfU0g_UF0Y3'
    },
    {
      id: 2,
      name: 'Dr. Sonia Cherif',
      specialty: 'Dermatologie & Vénérologie',
      location: 'Centre Médical El Menzah V, Tunis',
      lastVisit: '12 Octobre 2024',
      fee: '60 TND (Secteur 1)',
      badge: 'Visite de contrôle',
      img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDm4SO92820tvamQH_XmNM9EPb4bNyzOYA-QAhT_zhEIEoXc4QzX_-LJIWLhDSkeIBwDvQaTYiSIl9ijLhO9EABs5ryT2OrRO-U5IscJmLEpXdUuD8Rw4-ILxDoHjzKewWQAq_7t6ZEnIIh-0CB6yRgZP_mMH-S0fwFbwvAEDrXp9C_BgezM4TF6rnZ2f4Pv4YE0-jNtjQXoipA-aW60fFjmFhg85srP6AObZseZfu8jptZfHICKRv8'
    },
    {
      id: 3,
      name: 'Dr. Mehdi Zaouche',
      specialty: 'Ophtalmologie',
      location: 'Clinique Taoufik • El Manar, Tunis',
      lastVisit: 'Juin 2024',
      fee: '65 TND',
      badge: 'Bilan annuel',
      img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB6fpSm8nfx3yfQfEeHMAUpPIR4p-dUlrjJYOD641bqGtm3kozl_Z7rG6L1-QT1PFuTdzbeWG4fguXrfVuIczjhcpS5yqJ7s2Gi-ZSPGKYtDzgUQOiE8KUt_fpuLWmpdslYglmHEjHygRNGN4LEhHQWgnOxsG4ULIA6PDvvdc7l-T9M6iIu330gvDWXdqhI0cOvCTE5zCElUrH0yyh9UePepzseCdMQLGqAorl36qJvRrUnX0BIADLe'
    }
  ];

  const handleConfirmExpressBooking = () => {
    setLoading(true);
    fetch('/api/patient/express-booking', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        doctorId: selectedDoctor.id,
        date: selectedSlot.day,
        time: selectedSlot.time,
        consultationMode,
        motive
      })
    })
      .then((res) => res.json())
      .then((data) => {
        setLoading(false);
        if (data.success) {
          setView('booking-confirmation', {
            trackingCode: data.booking.trackingCode,
            booking: {
              doctorName: selectedDoctor.name,
              specialty: selectedDoctor.specialty,
              location: selectedDoctor.location,
              motive,
              price: selectedDoctor.fee,
              date: selectedSlot.day,
              time: selectedSlot.time,
              patientName: 'Yasmine Ben Amor'
            }
          });
        }
      })
      .catch((err) => {
        console.error('Express booking error:', err);
        setLoading(false);
      });
  };

  return (
    <div className="w-full bg-surface min-h-screen flex flex-col pb-16">
      
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-8 py-6 space-y-6">
        
        {/* Breadcrumb & Header */}
        <section className="space-y-4">
          <nav aria-label="Fil d'Ariane" className="flex items-center gap-2 text-xs text-on-surface-variant font-medium">
            <button onClick={() => setView('patient-dashboard')} className="hover:text-primary transition-colors flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px]">home</span>
              Accueil
            </button>
            <span className="material-symbols-outlined text-[14px] text-outline-variant">chevron_right</span>
            <span className="text-primary font-bold">Prendre un rendez-vous rapide</span>
          </nav>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-container/10 text-primary text-xs font-bold uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                Espace Patient Connecté • Réservation Flash
              </div>
              <h1 className="font-headline-xl text-headline-xl text-on-surface font-bold tracking-tight">
                Prendre un rendez-vous rapide
              </h1>
              <p className="text-body-md text-on-surface-variant text-sm max-w-3xl">
                Réservation simplifiée en 1 clic : vos coordonnées, dossier médical et droits CNAM sont déjà associés automatiquement.
              </p>
            </div>
          </div>

          {/* Verified Patient Ribbon */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary-container via-primary to-primary-container text-on-primary p-5 shadow-md">
            <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center font-bold text-lg">
                    YB
                  </div>
                  <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-400 rounded-full"></span>
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-base">Yasmine Ben Amor</span>
                    <span className="px-2 py-0.5 rounded-full bg-white/20 text-xs font-medium">CIN: ••••892</span>
                    <span className="px-2 py-0.5 rounded-full bg-secondary text-on-secondary text-xs font-bold">Dossier #TN-8831</span>
                  </div>
                  <p className="text-xs text-on-primary-container mt-0.5 flex items-center gap-1 font-medium">
                    <span className="material-symbols-outlined text-[16px]">check_circle</span>
                    Couverture CNAM active • Aucune ressaisie d'identité requise
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Regular Doctors Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[22px]">history</span>
              <h2 className="font-headline-lg text-headline-lg text-on-surface font-bold">
                Vos praticiens réguliers
              </h2>
            </div>
            <span className="text-xs text-on-surface-variant">3 praticiens enregistrés</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {doctors.map((doc) => {
              const isSelected = selectedDoctor.id === doc.id;
              return (
                <div
                  key={doc.id}
                  onClick={() => setSelectedDoctor(doc)}
                  className={`bg-surface-container-lowest rounded-2xl p-5 shadow-sm hover:shadow-md transition-all cursor-pointer border flex flex-col justify-between ${
                    isSelected ? 'ring-2 ring-primary border-primary' : 'border-surface-container-high'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <img className="w-14 h-14 rounded-full object-cover shadow-xs shrink-0" src={doc.img} alt={doc.name} />
                      <div className="min-w-0">
                        <span className="inline-flex items-center px-2 py-0.5 rounded bg-primary-container/15 text-primary text-[10px] font-bold mb-1">
                          {doc.badge}
                        </span>
                        <h3 className="font-bold text-sm text-on-surface truncate">{doc.name}</h3>
                        <p className="text-xs text-primary font-semibold">{doc.specialty}</p>
                      </div>
                    </div>
                    <div className="space-y-1 text-xs text-on-surface-variant pt-1">
                      <div className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[16px] text-outline">domain</span>
                        <span className="truncate">{doc.location}</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-surface-container-low flex items-center justify-between">
                    <span className="text-xs font-bold text-on-surface">{doc.fee}</span>
                    <button
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                        isSelected ? 'bg-primary text-on-primary' : 'bg-surface-container-high text-on-surface hover:bg-primary hover:text-on-primary'
                      }`}
                    >
                      {isSelected ? 'Sélectionné ✓' : 'Choisir'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Slot Matrix & Instant Confirmation */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Schedule Column */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm border border-surface-container-high space-y-4">
              
              {/* Doctor Header */}
              <div className="flex items-center justify-between pb-3 border-b border-surface-container-low">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-on-primary font-bold text-sm">
                    KM
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-on-surface">{selectedDoctor.name}</h3>
                    <p className="text-xs text-primary font-medium">{selectedDoctor.specialty}</p>
                  </div>
                </div>
              </div>

              {/* Consultation Mode */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-on-surface">Mode de consultation</label>
                <div className="grid grid-cols-2 gap-2 bg-surface-container-low p-1 rounded-xl">
                  <button
                    onClick={() => setConsultationMode('cabinet')}
                    className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-bold transition-all ${
                      consultationMode === 'cabinet' ? 'bg-primary text-on-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[18px]">domain</span>
                    Cabinet Médical
                  </button>
                  <button
                    onClick={() => setConsultationMode('video')}
                    className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-bold transition-all ${
                      consultationMode === 'video' ? 'bg-primary text-on-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[18px]">videocam</span>
                    Téléconsultation
                  </button>
                </div>
              </div>

              {/* Slot Picker */}
              <div className="space-y-3 pt-2">
                <h3 className="font-bold text-sm text-on-surface flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[20px]">calendar_month</span>
                  Créneaux disponibles
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {[
                    { day: 'Mardi 29 Octobre 2024', time: '10:00' },
                    { day: 'Mardi 29 Octobre 2024', time: '11:15' },
                    { day: 'Mardi 29 Octobre 2024', time: '14:00' },
                    { day: 'Mercredi 30 Octobre 2024', time: '09:30' },
                    { day: 'Mercredi 30 Octobre 2024', time: '10:45' },
                    { day: 'Jeudi 31 Octobre 2024', time: '15:00' }
                  ].map((s, idx) => {
                    const isSelected = selectedSlot.time === s.time && selectedSlot.day === s.day;
                    return (
                      <button
                        key={idx}
                        onClick={() => setSelectedSlot(s)}
                        className={`p-3 rounded-xl border text-center transition-all ${
                          isSelected
                            ? 'bg-primary text-on-primary border-primary font-bold shadow-sm'
                            : 'bg-surface-container-low hover:bg-surface-container border-surface-container-high text-primary font-semibold'
                        }`}
                      >
                        <div className="text-[11px] opacity-80">{s.day.split(' ')[0]} {s.day.split(' ')[1]}</div>
                        <div className="text-base font-bold mt-0.5">{s.time}</div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Right Summary & Confirmation Box */}
          <div className="lg:col-span-5 space-y-4 lg:sticky lg:top-20">
            <div className="bg-surface-container-lowest rounded-2xl shadow-md border border-surface-container-high overflow-hidden">
              <div className="bg-surface-container-high px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[20px]">bolt</span>
                  <span className="font-bold text-sm text-on-surface">Récapitulatif express</span>
                </div>
                <span className="px-2 py-0.5 rounded bg-surface-container-lowest text-primary text-xs font-bold">1-Clic</span>
              </div>

              <div className="p-5 space-y-4">
                <div className="p-4 rounded-xl bg-primary/10 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary text-on-primary flex flex-col items-center justify-center shrink-0 font-bold">
                    <span className="text-[10px] uppercase">MAR</span>
                    <span className="text-base font-bold leading-none mt-0.5">29</span>
                  </div>
                  <div>
                    <div className="font-bold text-primary text-sm">{selectedSlot.day} à {selectedSlot.time}</div>
                    <div className="text-xs text-on-surface-variant">Durée estimée : 30 minutes</div>
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-outline">Patient :</span>
                    <span className="font-bold text-on-surface">Yasmine Ben Amor (#TN-8831)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-outline">Praticien :</span>
                    <span className="font-bold text-on-surface">{selectedDoctor.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-outline">Tarif :</span>
                    <span className="font-bold text-primary">{selectedDoctor.fee}</span>
                  </div>
                </div>

                <button
                  onClick={handleConfirmExpressBooking}
                  disabled={loading}
                  className="w-full h-12 rounded-xl bg-primary text-on-primary font-bold text-xs hover:bg-primary-container shadow-md transition-all flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <span className="material-symbols-outlined animate-spin">progress_activity</span>
                  ) : (
                    <>
                      <span>Confirmer le rendez-vous instantanément</span>
                      <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

        </section>

      </div>
    </div>
  );
}
