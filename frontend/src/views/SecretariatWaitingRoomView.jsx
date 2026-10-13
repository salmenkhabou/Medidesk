import React, { useState } from 'react';

export default function SecretariatWaitingRoomView({ setView }) {
  const [toast, setToast] = useState(null);
  const [queueList, setQueueList] = useState([
    { id: 101, rank: 1, name: "Férid Ben Salem", cin: "08842109", arrivedAt: "10:40", waitMins: 25, motive: "Palpitations (Urgent)", status: "urgent", statusText: "Prioritaire Urgence" },
    { id: 102, rank: 2, name: "Radhia Chaabane", cin: "05441920", arrivedAt: "10:50", waitMins: 15, motive: "Holter ECG 24h", status: "waiting", statusText: "En attente" },
    { id: 103, rank: 3, name: "Mohamed Hedi Guediche", cin: "09112233", arrivedAt: "11:00", waitMins: 5, motive: "Première Consultation", status: "waiting", statusText: "En attente" },
    { id: 104, rank: 4, name: "Sami Kallel", cin: "04992211", arrivedAt: "11:05", waitMins: 0, motive: "Suivi HTA", status: "waiting", statusText: "En attente" }
  ]);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  };

  const handleCallPatient = (patient) => {
    showToast(`Patient ${patient.name} appelé pour entrer dans le Cabinet 1 !`);
    setQueueList(prev => prev.filter(p => p.id !== patient.id));
  };

  const handleSendSms = (patient) => {
    showToast(`SMS de rappel transmis au téléphone de ${patient.name}`);
  };

  const handleMoveUp = (index) => {
    if (index === 0) return;
    const newList = [...queueList];
    const temp = newList[index];
    newList[index] = newList[index - 1];
    newList[index - 1] = temp;
    newList.forEach((item, i) => item.rank = i + 1);
    setQueueList(newList);
    showToast("Ordre de passage mis à jour !");
  };

  return (
    <div className="w-full bg-surface min-h-screen pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-24 right-6 z-50 p-4 rounded-xl bg-primary text-on-primary shadow-2xl flex items-center gap-3 animate-bounce max-w-md">
          <span className="material-symbols-outlined text-[24px]">airline_seat_recline_normal</span>
          <span className="font-label-lg text-label-lg font-bold">{toast}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 text-on-surface-variant font-label-md text-label-md mb-1">
            <button onClick={() => setView('tableau-de-bord')} className="hover:text-primary">Secrétariat</button>
            <span>/</span>
            <span className="text-primary font-bold">Salle d'Attente</span>
          </div>
          <h1 className="font-headline-xl text-headline-xl font-bold text-on-surface">Gestion Salle d'Attente & Pointage Temps Réel</h1>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => showToast("Affichage TV de la salle d'attente synchronisé en direct !")}
            className="px-4 py-2.5 rounded-xl bg-primary-container text-on-primary font-label-md text-label-md font-bold hover:bg-primary transition-colors flex items-center gap-2 shadow-xs"
          >
            <span className="material-symbols-outlined text-[20px]">tv</span>
            <span>Synchroniser Écran TV Salle</span>
            <span className="w-2 h-2 rounded-full bg-on-primary animate-ping"></span>
          </button>
        </div>
      </div>

      {/* Live Counter Dashboard Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-surface-container-lowest p-5 rounded-2xl shadow-sm border border-surface-container-high flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
            <span className="material-symbols-outlined text-[28px]">groups</span>
          </div>
          <div>
            <span className="font-label-sm text-label-sm text-on-surface-variant font-bold block">Patients Présents en Salle</span>
            <span className="font-headline-xl text-headline-xl font-bold text-on-surface">{queueList.length}</span>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-5 rounded-2xl shadow-sm border border-surface-container-high flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center font-bold">
            <span className="material-symbols-outlined text-[28px]">door_open</span>
          </div>
          <div>
            <span className="font-label-sm text-label-sm text-on-surface-variant font-bold block">En Consultation Cabinet 1</span>
            <span className="font-headline-sm text-headline-sm font-bold text-secondary">Yasmine Ben Amor (16 min)</span>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-5 rounded-2xl shadow-sm border border-surface-container-high flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-tertiary/10 text-tertiary flex items-center justify-center font-bold">
            <span className="material-symbols-outlined text-[28px]">timer</span>
          </div>
          <div>
            <span className="font-label-sm text-label-sm text-on-surface-variant font-bold block">Temps d'Attente Moyen</span>
            <span className="font-headline-xl text-headline-xl font-bold text-tertiary">18 min</span>
          </div>
        </div>
      </div>

      {/* Queue List Table */}
      <div className="bg-surface-container-lowest rounded-2xl shadow-sm border border-surface-container-high overflow-hidden">
        
        <div className="p-4 bg-surface-container-low border-b border-surface-container-high flex items-center justify-between">
          <h2 className="font-headline-sm text-headline-sm font-bold text-on-surface">File d'Attente Active (Ordre de Passage)</h2>
          <span className="font-label-sm text-label-sm text-primary font-bold flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
            Mise à jour en temps réel
          </span>
        </div>

        <div className="divide-y divide-surface-container-low">
          {queueList.map((patient, index) => (
            <div key={patient.id} className="p-4 hover:bg-surface-container-low/40 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
              
              <div className="flex items-center gap-4">
                <div className="flex flex-col items-center">
                  <span className="w-9 h-9 rounded-xl bg-surface-container-high font-headline-sm text-headline-sm font-bold text-primary flex items-center justify-center">
                    #{patient.rank}
                  </span>
                  {index > 0 && (
                    <button onClick={() => handleMoveUp(index)} className="mt-1 text-on-surface-variant hover:text-primary text-xs" title="Monter la priorité">
                      ▲
                    </button>
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">{patient.name}</h3>
                    <span className="font-label-sm text-label-sm text-outline font-semibold">CIN: {patient.cin}</span>
                    <span className={`px-2.5 py-0.5 rounded-full font-label-sm text-label-sm font-bold ${
                      patient.status === 'urgent' ? 'bg-secondary text-on-secondary' : 'bg-primary-fixed text-primary'
                    }`}>
                      {patient.statusText}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 font-body-sm text-body-sm text-on-surface-variant mt-1">
                    <span>Arrivée à {patient.arrivedAt} ({patient.waitMins} min d'attente)</span>
                    <span>•</span>
                    <span>Motif : {patient.motive}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 self-end md:self-center">
                <button 
                  onClick={() => handleSendSms(patient)}
                  className="px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high font-label-sm text-label-sm font-bold text-on-surface flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-[16px]">sms</span> SMS
                </button>

                <button 
                  onClick={() => handleCallPatient(patient)}
                  className="px-4 py-2 rounded-xl bg-primary text-on-primary font-label-md text-label-md font-bold hover:bg-primary-container transition-colors shadow-xs flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[18px]">campaign</span>
                  <span>Faire Entrer</span>
                </button>
              </div>

            </div>
          ))}
        </div>

      </div>

    </div>
  );
}
