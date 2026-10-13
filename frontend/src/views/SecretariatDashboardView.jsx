import React, { useState, useEffect } from 'react';
import { fetchSecretariatDashboard, validateVisitorReservation, sendIntercomMessage } from '../services/api';

export default function SecretariatDashboardView({ setView }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [intercomMsg, setIntercomMsg] = useState('');
  const [toast, setToast] = useState(null);
  const [checkinCin, setCheckinCin] = useState('');

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const res = await fetchSecretariatDashboard();
      setData(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleValidateVisitor = async (id) => {
    try {
      const res = await validateVisitorReservation(id);
      showToast(res.message);
      loadDashboard();
    } catch (e) {
      showToast("Erreur lors de la confirmation");
    }
  };

  const handleSendIntercom = async (e) => {
    e?.preventDefault();
    if (!intercomMsg.trim()) return;
    try {
      await sendIntercomMessage({ message: intercomMsg, priority: 'urgent' });
      showToast("Message envoyé au moniteur du Dr. Ben Mahmoud");
      setIntercomMsg('');
    } catch (e) {
      showToast("Erreur d'envoi interphone");
    }
  };

  const handleCheckinSubmit = (e) => {
    e.preventDefault();
    if (!checkinCin.trim()) return;
    showToast(`Présence enregistrée pour CIN / QR : ${checkinCin}`);
    setCheckinCin('');
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  };

  if (loading) {
    return (
      <div className="w-full pt-28 pb-16 flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <span className="font-label-lg text-label-lg text-on-surface-variant font-medium">Chargement du tableau de bord secrétariat...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-surface min-h-screen flex flex-col pb-16">
      
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-24 right-6 z-50 p-4 rounded-xl bg-primary text-on-primary shadow-2xl flex items-center gap-3 animate-bounce max-w-md">
          <span className="material-symbols-outlined text-[24px]">info</span>
          <span className="font-label-lg text-label-lg font-bold">{toast}</span>
        </div>
      )}

      {/* Header Context Sub-Bar */}
      <section className="w-full px-4 sm:px-6 lg:px-8 py-4 bg-surface-container-lowest shadow-sm mb-6 border-b border-surface-container-high">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-14 h-14 rounded-xl bg-primary-container/10 flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-[32px]">support_agent</span>
              </div>
              <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary ring-2 ring-surface-container-lowest">
                <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-primary-fixed opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-on-primary"></span>
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="font-headline-md text-headline-md font-bold text-on-surface">Bonjour {data?.secretary?.name || 'Amel'}</h1>
                <span className="px-2.5 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant font-label-sm text-label-sm font-semibold">
                  {data?.secretary?.role || 'Secrétariat Central'}
                </span>
                <span className="text-outline font-body-sm">|</span>
                <span className="font-label-lg text-label-lg text-primary flex items-center gap-1 font-bold">
                  <span className="material-symbols-outlined text-[18px]">calendar_today</span>
                  {data?.secretary?.date_formatted || 'Jeudi 24 Octobre 2024'}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-on-surface-variant font-body-sm text-body-sm mt-0.5">
                <span className="material-symbols-outlined text-primary text-[18px]">local_hospital</span>
                <span>{data?.secretary?.clinic || 'Clinique Alyssa • Cabinet Cardiologie Central'}</span>
              </div>
            </div>
          </div>

          {/* Direct Quick Actions */}
          <div className="flex items-center gap-2 flex-wrap">
            <button 
              onClick={() => setView('admission-patient')}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-secondary hover:bg-secondary/90 text-on-secondary font-label-lg text-label-lg font-bold shadow-sm transition-all active:scale-95"
            >
              <span className="material-symbols-outlined text-[20px]">person_add</span>
              <span>+ Fiche Admission</span>
            </button>

            <button 
              onClick={() => setView('planning-rendez-vous')}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-label-lg text-label-lg font-bold shadow-sm transition-all"
            >
              <span className="material-symbols-outlined text-[20px]">calendar_add_on</span>
              <span>+ Nouveau RDV</span>
            </button>

            <button 
              onClick={() => setView('encaissement-facturation')}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-primary font-label-lg text-label-lg font-bold shadow-sm transition-all"
            >
              <span className="material-symbols-outlined text-[20px]">payments</span>
              <span>Encaissement</span>
            </button>
          </div>
        </div>
      </section>

      {/* Live Pulse Triage Alert Banner */}
      <div className="w-full px-4 sm:px-6 lg:px-8 mb-6">
        <div className="w-full bg-gradient-to-r from-primary-container via-primary to-primary-container text-on-primary rounded-xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-md">
          <div className="flex items-center gap-3">
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-secondary"></span>
            </span>
            <span className="font-label-lg text-label-lg font-semibold tracking-wide">
              Flash Urgence Salle : {data?.triage_alert?.patient_name} (CIN: {data?.triage_alert?.cin}) — {data?.triage_alert?.reason}
            </span>
          </div>
          <button 
            onClick={() => setView('salle-attente')}
            className="px-3.5 py-1.5 rounded-lg bg-surface-container-lowest text-primary font-label-md text-label-md font-bold hover:bg-surface-container-low transition-colors shadow-xs"
          >
            Faire entrer en priorité
          </button>
        </div>
      </div>

      {/* KPI & Realtime Status Cards */}
      <section className="w-full px-4 sm:px-6 lg:px-8 mb-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Card 1: Waiting Room Realtime (5 cols) */}
          <div className="lg:col-span-5 rounded-2xl bg-surface-container-lowest p-5 shadow-sm border border-surface-container-high flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-surface-container-low">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[24px]">airline_seat_recline_normal</span>
                  <h2 className="font-headline-sm text-headline-sm font-bold text-on-surface">Salle d'attente en direct</h2>
                </div>
                <span className="flex items-center gap-1.5 font-label-sm text-label-sm text-primary bg-primary-fixed/30 px-2.5 py-0.5 rounded-full font-bold">
                  <span className="w-2 h-2 rounded-full bg-primary animate-ping"></span>
                  Temps réel
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-surface-container-low rounded-xl p-3.5 flex flex-col">
                  <span className="font-label-md text-label-md text-on-surface-variant flex items-center gap-1 font-semibold">
                    <span className="material-symbols-outlined text-[16px] text-tertiary">hourglass_top</span> En attente
                  </span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="font-headline-xl text-headline-xl font-bold text-on-surface">{data?.waiting_room?.count || 6}</span>
                    <span className="font-label-sm text-label-sm text-tertiary font-bold">Moy. {data?.waiting_room?.avg_wait_mins || 18} min</span>
                  </div>
                </div>

                <div className="bg-primary/5 rounded-xl p-3.5 flex flex-col border border-primary/10">
                  <span className="font-label-md text-label-md text-primary flex items-center gap-1 font-semibold">
                    <span className="material-symbols-outlined text-[16px]">stethoscope</span> En consultation
                  </span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="font-headline-xl text-headline-xl font-bold text-primary">1</span>
                    <span className="font-label-sm text-label-sm text-on-surface-variant font-medium">Cabinet 1</span>
                  </div>
                </div>
              </div>

              {/* Current Patient Banner */}
              <div className="p-3.5 rounded-xl bg-surface-container-low flex items-center justify-between mb-4 border border-surface-container-high">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold text-sm">
                    YB
                  </div>
                  <div>
                    <span className="font-label-sm text-label-sm text-outline uppercase font-bold block">Actuellement en consultation</span>
                    <span className="font-headline-sm text-headline-sm font-bold text-on-surface">{data?.waiting_room?.current_in_session?.name}</span>
                    <span className="font-body-sm text-body-sm text-on-surface-variant block">Entré à 10:28 (16 min) • {data?.waiting_room?.current_in_session?.motive}</span>
                  </div>
                </div>
              </div>
            </div>

            <button 
              onClick={() => setView('salle-attente')}
              className="w-full py-3 rounded-xl bg-primary text-on-primary font-label-lg text-label-lg font-bold flex items-center justify-center gap-2 hover:bg-primary-container shadow-sm transition-all"
            >
              <span>Appeler patient suivant : {data?.waiting_room?.next_up}</span>
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </button>
          </div>

          {/* Card 2: Visitor Pending Reservations (4 cols) */}
          <div className="lg:col-span-4 rounded-2xl bg-surface-container-lowest p-5 shadow-sm border border-surface-container-high flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 mb-2 border-b border-surface-container-low">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-secondary text-[24px]">notification_important</span>
                  <h2 className="font-headline-sm text-headline-sm font-bold text-on-surface">Réservations à valider</h2>
                </div>
                <span className="font-label-sm text-label-sm px-2.5 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed font-bold">
                  {data?.visitor_reservations_pending?.length || 4} à vérifier
                </span>
              </div>
              <p className="font-body-sm text-body-sm text-on-surface-variant mb-3">
                Demandes web sans compte patient. Validez par appel ou SMS avant intégration au planning.
              </p>

              <div className="space-y-2">
                {(data?.visitor_reservations_pending || []).slice(0, 3).map((item) => (
                  <div key={item.id} className="p-3 rounded-xl bg-surface-container-low hover:bg-surface-container transition-colors flex items-center justify-between border border-surface-container-high">
                    <div className="flex flex-col min-w-0 pr-2">
                      <div className="flex items-center gap-2">
                        <span className="font-label-md text-label-md text-on-surface font-bold truncate">{item.patient_name}</span>
                        <span className="px-1.5 py-0.5 rounded bg-secondary/10 text-secondary font-label-sm text-[11px] font-bold">{item.requested_time}</span>
                      </div>
                      <div className="font-body-sm text-body-sm text-on-surface-variant flex items-center gap-1 mt-0.5">
                        <span className="material-symbols-outlined text-[14px]">phone</span> {item.phone}
                      </div>
                    </div>
                    <button 
                      onClick={() => handleValidateVisitor(item.id)}
                      className="p-2 rounded-lg bg-primary text-on-primary hover:bg-primary-container transition-colors shadow-xs"
                      title="Confirmer"
                    >
                      <span className="material-symbols-outlined text-[16px]">check</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <button 
              onClick={() => setView('validation-reservations')}
              className="mt-4 text-center font-label-md text-label-md text-secondary hover:text-on-secondary-fixed-variant font-bold flex items-center justify-center gap-1"
            >
              <span>Voir les demandes de réservation en ligne</span>
              <span className="material-symbols-outlined text-[16px]">chevron_right</span>
            </button>
          </div>

          {/* Card 3: Today's Financial & Shift Summary (3 cols) */}
          <div className="lg:col-span-3 rounded-2xl bg-surface-container-lowest p-5 shadow-sm border border-surface-container-high flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-surface-container-low">
                <h2 className="font-headline-sm text-headline-sm font-bold text-on-surface">Encaissement du jour</h2>
                <span className="material-symbols-outlined text-primary text-[24px]">payments</span>
              </div>

              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-primary/10 border border-primary/20 flex flex-col">
                  <span className="font-label-sm text-label-sm text-primary font-bold uppercase">Total Encaissé aujourd'hui</span>
                  <span className="font-headline-xl text-headline-xl font-bold text-primary">{data?.today_billing_summary?.total_revenue_tnd || 1420} TND</span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 bg-surface-container-low rounded-lg border border-surface-container-high">
                    <span className="text-on-surface-variant block font-medium">Espèces</span>
                    <span className="font-bold text-on-surface text-sm">{data?.today_billing_summary?.cash_tnd || 980} TND</span>
                  </div>
                  <div className="p-2.5 bg-surface-container-low rounded-lg border border-surface-container-high">
                    <span className="text-on-surface-variant block font-medium">Chèque / TPE</span>
                    <span className="font-bold text-on-surface text-sm">{(data?.today_billing_summary?.cheque_tnd || 240) + (data?.today_billing_summary?.tpe_tnd || 200)} TND</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-surface-container-low flex flex-col gap-2">
              <button 
                onClick={() => setView('encaissement-facturation')}
                className="w-full py-2 rounded-lg bg-surface-container-high hover:bg-surface-container text-primary font-label-md text-label-md font-bold transition-colors"
              >
                Encasser une consultation
              </button>
              <button 
                onClick={() => setView('cloture-caisse')}
                className="w-full py-2 rounded-lg bg-primary text-on-primary hover:bg-primary-container font-label-md text-label-md font-bold transition-colors"
              >
                Arrêt Z de Caisse
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* Main Section: Schedule & Intercom Cockpit */}
      <section className="w-full px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left 8 Cols: Timeline Overview */}
          <div className="lg:col-span-8 flex flex-col gap-4">
            <div className="bg-surface-container-lowest p-5 rounded-2xl shadow-sm border border-surface-container-high flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-headline-md text-headline-md font-bold text-on-surface">Consultations Prévues Aujourd'hui</h2>
                <p className="font-body-sm text-body-sm text-on-surface-variant">Dr. Karim Ben Mahmoud • Cabinet 1 Cardiologie</p>
              </div>
              <button 
                onClick={() => setView('planning-rendez-vous')}
                className="px-4 py-2 rounded-xl bg-primary text-on-primary font-label-md text-label-md font-bold hover:bg-primary-container transition-colors shadow-xs"
              >
                Ouvrir Planning Complet
              </button>
            </div>

            {/* Quick slots preview */}
            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-surface-container-lowest shadow-sm border border-surface-container-high flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="font-headline-sm text-headline-sm font-bold text-outline">09:00</span>
                  <div>
                    <span className="font-headline-sm text-headline-sm font-bold text-on-surface block">Ahmed Trabelsi</span>
                    <span className="font-body-sm text-body-sm text-on-surface-variant">Consultation de contrôle HTA + ECG</span>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full bg-surface-container-high text-on-surface-variant font-label-sm text-label-sm font-bold">Terminé</span>
              </div>

              <div className="p-4 rounded-xl bg-surface-container-lowest shadow-sm border-2 border-primary flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="font-headline-sm text-headline-sm font-bold text-primary">10:30</span>
                  <div>
                    <span className="font-headline-sm text-headline-sm font-bold text-on-surface block">Yasmine Ben Amor</span>
                    <span className="font-body-sm text-body-sm text-on-surface">Échocardiographie Doppler</span>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full bg-primary text-on-primary font-label-sm text-label-sm font-bold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-on-primary animate-ping"></span>
                  En cours
                </span>
              </div>

              <div className="p-4 rounded-xl bg-surface-container-lowest shadow-sm border-2 border-secondary flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="font-headline-sm text-headline-sm font-bold text-secondary">11:00</span>
                  <div>
                    <span className="font-headline-sm text-headline-sm font-bold text-on-surface block">Férid Ben Salem</span>
                    <span className="font-body-sm text-body-sm text-secondary font-bold">Sans RDV — Palpitations aiguës</span>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full bg-secondary-fixed text-on-secondary-fixed font-label-sm text-label-sm font-bold">Urgent</span>
              </div>
            </div>
          </div>

          {/* Right 4 Cols: Fast Checkin & Intercom Box */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            
            {/* Tool 1: Pointage Rapide */}
            <div className="bg-surface-container-lowest p-5 rounded-2xl shadow-sm border border-surface-container-high">
              <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface mb-2">Pointage Rapide Arrivée</h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant mb-3">Saisissez le CIN patient (8 chiffres) ou scannez le pass QR :</p>
              <form onSubmit={handleCheckinSubmit} className="space-y-3">
                <input 
                  type="text"
                  value={checkinCin}
                  onChange={(e) => setCheckinCin(e.target.value)}
                  placeholder="Ex: 08842109..."
                  className="w-full h-11 px-4 rounded-xl bg-surface-container-low border border-outline-variant/60 font-mono text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <button type="submit" className="w-full py-2.5 rounded-xl bg-primary text-on-primary font-label-lg text-label-lg font-bold hover:bg-primary-container transition-colors shadow-sm">
                  Valider Présence
                </button>
              </form>
            </div>

            {/* Tool 2: Direct Intercom */}
            <div className="bg-surface-container-lowest p-5 rounded-2xl shadow-sm border border-surface-container-high">
              <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface mb-2">Interphone Cabinet 1</h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant mb-3">Envoyer un message au moniteur du Dr. Ben Mahmoud :</p>
              <form onSubmit={handleSendIntercom} className="space-y-3">
                <textarea 
                  rows="2"
                  value={intercomMsg}
                  onChange={(e) => setIntercomMsg(e.target.value)}
                  placeholder="Message instantané pour le médecin..."
                  className="w-full p-3 rounded-xl bg-surface-container-low border border-outline-variant/60 font-body-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                ></textarea>
                <button type="submit" className="w-full py-2 rounded-xl bg-secondary text-on-secondary font-label-md text-label-md font-bold hover:bg-secondary/90 transition-colors shadow-sm">
                  Transmettre au Médecin
                </button>
              </form>
            </div>

          </div>

        </div>
      </section>

    </div>
  );
}
