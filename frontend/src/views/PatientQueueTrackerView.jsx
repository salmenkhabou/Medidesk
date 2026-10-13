import React, { useState, useEffect } from 'react';

export default function PatientQueueTrackerView({ setView }) {
  const [queueInfo, setQueueInfo] = useState({
    appointment: {
      id: 'RDV-2024-8941',
      doctorName: 'Dr. Karim Ben Mahmoud',
      specialty: 'Cardiologie & Médecine Interne',
      location: 'Clinique Alyssa • Cabinet 302, 3ème étage, Tunis',
      phone: '+216 71 888 999',
      currentStep: 4,
      totalSteps: 6,
      stepLabel: 'Salle d\'attente (Salle B • 3e étage)',
      currentCallingTicket: '#B-19',
      patientPosition: '2ème dans la file',
      estimatedWaitMins: 12,
      urgentNotice: {
        active: true,
        title: 'Urgence cardiologique en cours d\'intervention',
        newTime: 'Aujourd\'hui à 11h15',
        originalTime: '10h30',
        remainingSeconds: 702
      }
    }
  });

  const [acceptedNotice, setAcceptedNotice] = useState(false);
  const [delayNotified, setDelayNotified] = useState(false);

  useEffect(() => {
    fetch('/api/patient/queue-status')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setQueueInfo(data);
        }
      })
      .catch((err) => {
        console.error('Queue status fetch error:', err);
      });
  }, []);

  const handleNotifyDelay = () => {
    setDelayNotified(true);
    alert('Notification envoyée au Dr. Karim Ben Mahmoud : Votre retard estimé de 10 min a été pris en compte.');
  };

  const appt = queueInfo?.appointment;

  return (
    <div className="w-full bg-surface min-h-screen flex flex-col pb-16">
      
      {/* Top Banner Bar */}
      <div className="w-full bg-surface-container-low border-b border-surface-container-high">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3 flex flex-wrap items-center justify-between gap-3 text-xs">
          <nav aria-label="Fil d'Ariane" className="flex items-center gap-2 text-on-surface-variant font-medium">
            <button onClick={() => setView('patient-dashboard')} className="hover:text-primary transition-colors flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px]">home</span>
              Accueil
            </button>
            <span className="text-outline-variant">/</span>
            <span className="text-primary font-bold">Consultation #{appt?.id || 'RDV-2024-8941'}</span>
          </nav>

          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container text-primary font-semibold">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
              Actualisé en direct
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-6 w-full flex flex-col gap-6">
        
        {/* Title & Action Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="font-headline-xl text-headline-xl text-on-surface font-bold tracking-tight">
                Suivi en direct de votre consultation
              </h1>
              <span className="px-3 py-0.5 rounded-full bg-surface-container-high text-primary text-xs font-bold uppercase tracking-wider">
                En Cours
              </span>
            </div>
            <p className="text-on-surface-variant text-sm">
              Prise en charge temps réel au sein du service cardiologique de la Clinique Alyssa (Tunis).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button onClick={() => window.print()} className="px-4 py-2.5 rounded-xl bg-surface-container-lowest text-on-surface hover:bg-surface-container text-xs font-bold transition-all shadow-sm border border-surface-container-high flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-primary">print</span>
              Imprimer la convocation
            </button>
          </div>
        </div>

        {/* Live Urgence Notice Banner */}
        {appt?.urgentNotice?.active && (
          <div className="rounded-2xl bg-gradient-to-r from-orange-100 via-surface-container-lowest to-surface-container p-5 shadow-sm border border-orange-200">
            <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4">
              <div className="flex items-start gap-4 max-w-3xl">
                <div className="w-12 h-12 rounded-xl bg-secondary text-on-secondary flex-shrink-0 flex items-center justify-center shadow-md">
                  <span className="material-symbols-outlined text-[26px]">medical_services</span>
                </div>
                <div className="flex flex-col gap-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider bg-secondary text-on-secondary px-2.5 py-0.5 rounded">
                      Avis Médical Prioritaire
                    </span>
                    <span className="text-xs text-secondary font-bold">
                      {appt.urgentNotice.title}
                    </span>
                  </div>
                  <p className="text-sm text-on-surface leading-snug">
                    Le <strong>{appt.doctorName}</strong> a pris en charge un cas d'urgence au bloc. Votre nouveau créneau proposé est :{' '}
                    <strong className="text-secondary font-bold text-base">{appt.urgentNotice.newTime}</strong>{' '}
                    <span className="text-on-surface-variant line-through text-xs ml-1">(initialement {appt.urgentNotice.originalTime})</span>.
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3">
                <button
                  onClick={() => setAcceptedNotice(true)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm ${
                    acceptedNotice ? 'bg-emerald-600 text-white' : 'bg-primary text-on-primary hover:bg-primary-container'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">check_circle</span>
                  <span>{acceptedNotice ? 'Horaire 11h15 Confirme ✓' : 'Accepter 11h15'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 6-Step Stepper Progress Bar */}
        <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm border border-surface-container-high space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-surface-container-low">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-primary animate-ping"></span>
              <span className="font-headline-sm text-headline-sm text-on-surface font-bold">Progression de la consultation</span>
            </div>
            <span className="text-xs text-on-surface-variant bg-surface-container px-3 py-1 rounded-full font-bold">
              Étape 4 sur 6 : {appt?.stepLabel}
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-6 gap-4 text-center pt-2">
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold mb-2 shadow-xs">
                <span className="material-symbols-outlined text-[18px]">check</span>
              </div>
              <span className="font-bold text-xs text-on-surface">1. Demandé</span>
              <span className="text-[11px] text-outline">En ligne</span>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold mb-2 shadow-xs">
                <span className="material-symbols-outlined text-[18px]">task_alt</span>
              </div>
              <span className="font-bold text-xs text-on-surface">2. Confirmé</span>
              <span className="text-[11px] text-outline">Secrétariat</span>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold mb-2 shadow-xs">
                <span className="material-symbols-outlined text-[18px]">how_to_reg</span>
              </div>
              <span className="font-bold text-xs text-on-surface">3. Enregistré</span>
              <span className="text-[11px] text-outline">Borne Alyssa</span>
            </div>

            <div className="flex flex-col items-center">
              <div className="relative mb-2">
                <span className="absolute -inset-1 rounded-full bg-primary-fixed animate-ping opacity-75"></span>
                <div className="w-10 h-10 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold relative z-10 shadow-md">
                  <span className="material-symbols-outlined text-[20px]">airline_seat_recline_normal</span>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-primary text-on-primary text-[10px] font-bold uppercase">
                Vous êtes ici
              </span>
              <span className="font-bold text-xs text-primary mt-1">4. Salle d'attente</span>
            </div>

            <div className="flex flex-col items-center opacity-60">
              <div className="w-10 h-10 rounded-full bg-surface-container text-on-surface-variant flex items-center justify-center mb-2 font-bold">
                <span className="material-symbols-outlined text-[18px]">stethoscope</span>
              </div>
              <span className="font-bold text-xs text-on-surface">5. En consultation</span>
            </div>

            <div className="flex flex-col items-center opacity-40">
              <div className="w-10 h-10 rounded-full bg-surface-container text-on-surface-variant flex items-center justify-center mb-2 font-bold">
                <span className="material-symbols-outlined text-[18px]">clinical_notes</span>
              </div>
              <span className="font-bold text-xs text-on-surface">6. Clôture &amp; Ordo</span>
            </div>
          </div>

          {/* Telemetry Box */}
          <div className="p-4 rounded-xl bg-surface-container-low flex flex-col md:flex-row items-center justify-between gap-4 border border-surface-container-high">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-surface-container-lowest text-primary flex items-center justify-center font-bold shadow-xs">
                <span className="material-symbols-outlined text-[20px]">timer</span>
              </div>
              <div>
                <span className="text-xs text-outline font-semibold block uppercase">Télémétrie de salle d'attente</span>
                <span className="font-bold text-on-surface text-sm">Temps estimé avant appel : ~{appt?.estimatedWaitMins || 12} minutes</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-xs text-on-surface-variant font-medium">Position : <strong className="text-secondary font-bold">{appt?.patientPosition}</strong></span>
              <span className="text-xs text-on-surface-variant font-medium">Appel en cours : <strong className="text-primary font-bold">{appt?.currentCallingTicket}</strong></span>
            </div>
          </div>
        </div>

        {/* Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Details */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm border border-surface-container-high space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="text-xs font-bold text-primary bg-primary/10 px-2.5 py-0.5 rounded">Cardiologue Traitant</span>
                  <h2 className="font-headline-lg text-headline-lg text-on-surface font-bold mt-1">{appt?.doctorName}</h2>
                  <p className="text-sm text-on-surface-variant">{appt?.specialty}</p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-surface-container-low space-y-1 text-xs">
                <span className="font-bold text-on-surface block">Lieu de consultation :</span>
                <p className="text-on-surface-variant">{appt?.location}</p>
                <p className="text-primary font-bold pt-1">Téléphone cabinet : {appt?.phone}</p>
              </div>
            </div>
          </div>

          {/* Right Fast-Track Pass QR & Actions */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm border border-surface-container-high text-center space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-primary">Fast-Track Pass Numérique</span>
              <div className="p-4 bg-white rounded-xl shadow-md border border-surface-container-high inline-block">
                <span className="material-symbols-outlined text-[120px] text-on-surface">qr_code_2</span>
              </div>
              <div className="font-bold text-sm text-on-surface">RDV-8941-KB</div>

              <div className="pt-2 space-y-2">
                <button
                  onClick={handleNotifyDelay}
                  disabled={delayNotified}
                  className={`w-full py-2.5 rounded-xl font-bold text-xs transition-colors flex items-center justify-center gap-2 ${
                    delayNotified ? 'bg-surface-container text-on-surface-variant' : 'bg-orange-100 text-secondary hover:bg-orange-200'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">more_time</span>
                  <span>{delayNotified ? 'Retard de 10 min signalé' : 'Signaler un retard (+10 min)'}</span>
                </button>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
