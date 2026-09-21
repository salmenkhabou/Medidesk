import React, { useState, useEffect } from 'react';
import { fetchQueue, advanceQueueTicket } from '../services/api';

export default function LiveQueueView({ doctorId = 1, onOpenBooking }) {
  const [queue, setQueue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [advancing, setAdvancing] = useState(false);
  const [smsAlert, setSmsAlert] = useState(true);

  useEffect(() => {
    loadQueueData();
    const timer = setInterval(() => loadQueueData(), 8000); // Polling simulation
    return () => clearInterval(timer);
  }, [doctorId]);

  const loadQueueData = async () => {
    try {
      const res = await fetchQueue(doctorId);
      setQueue(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleNextPatient = async () => {
    setAdvancing(true);
    try {
      const res = await advanceQueueTicket(doctorId);
      setQueue(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setAdvancing(false);
    }
  };

  if (loading) {
    return (
      <div className="pt-28 pb-16 text-center text-on-surface-variant font-body-lg max-w-4xl mx-auto">
        Chargement de la file d'attente en direct...
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col pt-24 pb-16 px-margin md:px-margin-md lg:px-margin-lg max-w-4xl mx-auto">
      
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3 mb-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-secondary-fixed text-on-secondary-fixed-variant font-label-md text-label-md font-bold uppercase tracking-wider">
          <span className="w-2 h-2 rounded-full bg-secondary animate-ping"></span>
          <span>Suivi en Direct de la Salle d'Attente</span>
        </div>
        <h1 className="font-headline-xl text-headline-xl text-on-surface font-bold">
          {queue?.doctor_name || 'Dr. Leila Ben Salem'}
        </h1>
        <p className="font-body-md text-body-md text-on-surface-variant">
          {queue?.specialty} • {queue?.address}
        </p>
      </div>

      {/* Main Queue Dashboard Container */}
      <div className="bg-surface-container-lowest p-6 sm:p-8 rounded-2xl shadow-xl border border-surface-container-high space-y-6">
        
        {/* Top Real-time Status Counter */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-space-md bg-surface-container-low p-6 rounded-xl border border-surface-container-high text-center">
          
          <div className="flex flex-col items-center justify-center p-2 border-b md:border-b-0 md:border-r border-surface-container-highest">
            <span className="font-label-sm text-label-sm text-on-surface-variant uppercase font-bold">Ticket En Consultation</span>
            <span className="font-headline-xl text-[3rem] font-extrabold text-primary tracking-tight">
              #{queue?.current_patient_number < 10 ? `0${queue?.current_patient_number}` : queue?.current_patient_number}
            </span>
            <span className="font-label-sm text-label-sm text-primary font-semibold">{queue?.status_message}</span>
          </div>

          <div className="flex flex-col items-center justify-center p-2 border-b md:border-b-0 md:border-r border-surface-container-highest">
            <span className="font-label-sm text-label-sm text-on-surface-variant uppercase font-bold">Total Patients Insccrits</span>
            <span className="font-headline-xl text-[3rem] font-extrabold text-on-surface tracking-tight">
              {queue?.total_in_queue}
            </span>
            <span className="font-label-sm text-label-sm text-outline">En salle & en route</span>
          </div>

          <div className="flex flex-col items-center justify-center p-2">
            <span className="font-label-sm text-label-sm text-on-surface-variant uppercase font-bold">Temps d'Attente Estimé</span>
            <span className="font-headline-xl text-[3rem] font-extrabold text-secondary tracking-tight">
              ~{queue?.estimated_wait_mins} min
            </span>
            <span className="font-label-sm text-label-sm text-secondary font-semibold">Arrivez à l'heure</span>
          </div>

        </div>

        {/* Progress Bar Visualization */}
        <div className="space-y-2">
          <div className="flex justify-between font-label-md text-label-md text-on-surface font-semibold">
            <span>Progression de la consultation matinale</span>
            <span>{Math.round((queue?.current_patient_number / queue?.total_in_queue) * 100)}% Effectué</span>
          </div>
          <div className="w-full bg-surface-container h-3 rounded-full overflow-hidden">
            <div
              className="bg-primary h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, Math.round((queue?.current_patient_number / queue?.total_in_queue) * 100))}%` }}
            ></div>
          </div>
        </div>

        {/* Doctor / Secretariat Action Trigger */}
        <div className="p-4 rounded-xl bg-surface-container-low border border-surface-container-high flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-primary text-[24px]">support_agent</span>
            <div>
              <h4 className="font-headline-sm text-headline-sm font-bold text-on-surface">Panneau Secrétariat / Appel Suivant</h4>
              <p className="font-body-sm text-body-sm text-on-surface-variant">Faites avancer la file quand le patient suivant entre dans le cabinet.</p>
            </div>
          </div>
          <button
            onClick={handleNextPatient}
            disabled={advancing}
            className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-primary-container text-on-primary font-label-lg text-label-lg font-bold hover:bg-primary transition-all shadow-sm flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">skip_next</span>
            <span>Appeler le Patient #{queue?.current_patient_number + 1}</span>
          </button>
        </div>

        {/* SMS Alert Subscription Toggle */}
        <div className="p-4 rounded-xl bg-surface-container flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-secondary text-[24px]">sms</span>
            <div>
              <h4 className="font-headline-sm text-headline-sm font-semibold text-on-surface">Alerte SMS SMS quand il reste 2 patients</h4>
              <p className="font-body-sm text-body-sm text-on-surface-variant">Recevez une notification automatique sur votre mobile sans rester en salle.</p>
            </div>
          </div>
          <input
            type="checkbox"
            checked={smsAlert}
            onChange={(e) => setSmsAlert(e.target.checked)}
            className="w-6 h-6 text-secondary accent-secondary rounded cursor-pointer"
          />
        </div>

      </div>

    </div>
  );
}
