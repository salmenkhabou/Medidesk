import React, { useState } from 'react';

export default function SecretariatPlanningView({ setView }) {
  const [selectedDoc, setSelectedDoc] = useState('doc1');
  const [viewMode, setViewMode] = useState('day');
  const [filterType, setFilterType] = useState('all');
  const [toast, setToast] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newRdv, setNewRdv] = useState({ patientName: '', cin: '', time: '11:45', type: 'Consultation' });

  const appointments = [
    { id: 1, time: "09:00 - 09:30", patient: "Ahmed Trabelsi", cin: "04512993", type: "Consultation + ECG", status: "finished", statusText: "Terminé", color: "bg-surface-container-high text-on-surface-variant border-surface-container-high" },
    { id: 2, time: "09:30 - 10:00", patient: "Leila Khemir", cin: "07198234", type: "Bilan pré-op CNAM", status: "finished", statusText: "Terminé", color: "bg-surface-container-high text-on-surface-variant border-surface-container-high" },
    { id: 3, time: "10:30 - 11:00", patient: "Yasmine Ben Amor", cin: "06214589", type: "Échocardiographie Doppler", status: "active", statusText: "En consultation", color: "bg-primary text-on-primary border-primary" },
    { id: 4, time: "11:00 - 11:15", patient: "Férid Ben Salem", cin: "08842109", type: "Palpitations aiguës (Sans RDV)", status: "urgent", statusText: "Urgence Prioritaire", color: "bg-secondary text-on-secondary border-secondary" },
    { id: 5, time: "11:15 - 11:45", patient: "Mohamed Hedi Guediche", cin: "09112233", type: "Première Consultation Web", status: "pending", statusText: "Visiteur à valider", color: "bg-tertiary-container text-on-tertiary-container border-tertiary-container" },
    { id: 6, time: "11:45 - 12:15", patient: "Radhia Chaabane", cin: "05441920", type: "Restitution Holter ECG", status: "confirmed", statusText: "Arrivée signalée", color: "bg-primary-container text-on-primary border-primary-container" },
    { id: 7, time: "14:00 - 14:30", patient: "Moncef Jaziri", cin: "02198004", type: "Suivi post-infarctus", status: "confirmed", statusText: "Confirmé SMS", color: "bg-surface-container-lowest text-on-surface border-surface-container-high" }
  ];

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  };

  const handleAddRdv = (e) => {
    e.preventDefault();
    if (!newRdv.patientName) return;
    showToast(`Rendez-vous ajouté pour ${newRdv.patientName} à ${newRdv.time}`);
    setIsModalOpen(false);
    setNewRdv({ patientName: '', cin: '', time: '11:45', type: 'Consultation' });
  };

  return (
    <div className="w-full bg-surface min-h-screen pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-24 right-6 z-50 p-4 rounded-xl bg-primary text-on-primary shadow-2xl flex items-center gap-3 animate-bounce max-w-md">
          <span className="material-symbols-outlined text-[24px]">event_available</span>
          <span className="font-label-lg text-label-lg font-bold">{toast}</span>
        </div>
      )}

      {/* Header & Doctor Switcher */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 text-on-surface-variant font-label-md text-label-md mb-1">
            <button onClick={() => setView('tableau-de-bord')} className="hover:text-primary">Secrétariat</button>
            <span>/</span>
            <span className="text-primary font-bold">Planning & Agenda</span>
          </div>
          <h1 className="font-headline-xl text-headline-xl font-bold text-on-surface">Planning Général des Consultations</h1>
        </div>

        {/* Doctor Switcher Pills */}
        <div className="flex items-center bg-surface-container p-1 rounded-2xl gap-1 border border-surface-container-high">
          <button 
            onClick={() => setSelectedDoc('doc1')}
            className={`px-4 py-2 rounded-xl font-label-md text-label-md font-bold transition-all flex items-center gap-2 ${
              selectedDoc === 'doc1' ? 'bg-surface-container-lowest text-primary shadow-xs' : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span>🩺 Dr. Karim Ben Mahmoud</span>
            <span className="px-1.5 py-0.5 rounded-full bg-primary/10 text-primary text-[11px]">32 RDV</span>
          </button>
          
          <button 
            onClick={() => setSelectedDoc('doc2')}
            className={`px-4 py-2 rounded-xl font-label-md text-label-md font-bold transition-all flex items-center gap-2 ${
              selectedDoc === 'doc2' ? 'bg-surface-container-lowest text-primary shadow-xs' : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span>🩺 Dr. Sonia Cherif</span>
            <span className="px-1.5 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant text-[11px]">19 RDV</span>
          </button>
        </div>
      </div>

      {/* Controls & Filter Sub-Bar */}
      <div className="bg-surface-container-lowest p-4 rounded-2xl shadow-sm border border-surface-container-high flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        
        {/* Date Selector & Mode Toggle */}
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-surface-container-low px-3 py-1.5 rounded-xl border border-surface-container-high">
            <button className="p-1 hover:text-primary"><span className="material-symbols-outlined text-[20px]">chevron_left</span></button>
            <span className="font-label-lg text-label-lg font-bold text-on-surface px-3">Jeudi 24 Octobre 2024</span>
            <button className="p-1 hover:text-primary"><span className="material-symbols-outlined text-[20px]">chevron_right</span></button>
          </div>

          <div className="flex items-center bg-surface-container-low p-1 rounded-xl">
            <button 
              onClick={() => setViewMode('day')} 
              className={`px-3 py-1 rounded-lg font-label-sm text-xs font-bold ${viewMode === 'day' ? 'bg-surface-container-lowest text-primary shadow-xs' : 'text-on-surface-variant'}`}
            >
              Jour
            </button>
            <button 
              onClick={() => setViewMode('week')} 
              className={`px-3 py-1 rounded-lg font-label-sm text-xs font-bold ${viewMode === 'week' ? 'bg-surface-container-lowest text-primary shadow-xs' : 'text-on-surface-variant'}`}
            >
              Semaine
            </button>
          </div>
        </div>

        {/* Action button */}
        <button 
          onClick={() => setIsModalOpen(true)}
          className="px-5 py-2.5 rounded-xl bg-primary text-on-primary font-label-lg text-label-lg font-bold hover:bg-primary-container transition-colors shadow-sm flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-[20px]">add</span>
          <span>Ajouter Rendez-vous</span>
        </button>
      </div>

      {/* Agenda Time Slots Matrix */}
      <div className="bg-surface-container-lowest rounded-2xl shadow-sm border border-surface-container-high overflow-hidden">
        
        <div className="p-4 bg-surface-container-low border-b border-surface-container-high flex items-center justify-between">
          <span className="font-label-lg text-label-lg font-bold text-on-surface uppercase tracking-wider">Créneaux du Jour • {selectedDoc === 'doc1' ? 'Dr. Karim Ben Mahmoud (Cardiologie)' : 'Dr. Sonia Cherif (Dermatologie)'}</span>
          <span className="font-label-sm text-label-sm text-on-surface-variant">Cabinet 1 • 08:30 - 18:00</span>
        </div>

        <div className="divide-y divide-surface-container-low">
          {appointments.map((slot) => (
            <div key={slot.id} className="p-4 hover:bg-surface-container-low/50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
              
              <div className="flex items-start gap-4">
                <div className="min-w-[110px]">
                  <span className="font-headline-sm text-headline-sm font-bold text-on-surface block">{slot.time}</span>
                  <span className="font-label-sm text-label-sm text-outline">30 min</span>
                </div>

                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">{slot.patient}</h3>
                    <span className="font-label-sm text-label-sm text-outline font-semibold">CIN: {slot.cin}</span>
                    <span className={`px-2.5 py-0.5 rounded-full font-label-sm text-label-sm font-bold border ${slot.color}`}>
                      {slot.statusText}
                    </span>
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">{slot.type}</p>
                </div>
              </div>

              {/* Slot Quick Controls */}
              <div className="flex items-center gap-2 self-end md:self-center">
                <button 
                  onClick={() => setView('dossier-patient-sec')}
                  className="px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-label-sm text-label-sm font-bold transition-colors"
                >
                  Fiche
                </button>
                <button 
                  onClick={() => showToast(`Rendez-vous de ${slot.patient} reporté`)}
                  className="px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-label-sm text-label-sm font-bold transition-colors"
                >
                  Reporter
                </button>
              </div>

            </div>
          ))}
        </div>

      </div>

      {/* New Appointment Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-on-surface/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-2xl border border-surface-container-high w-full max-w-lg space-y-4 animate-scale-in">
            <div className="flex items-center justify-between pb-3 border-b border-surface-container-low">
              <h3 className="font-headline-md text-headline-md font-bold text-on-surface">Ajouter un Rendez-vous</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-on-surface-variant hover:text-on-surface">
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleAddRdv} className="space-y-4">
              <div>
                <label className="block font-label-md text-label-md font-bold text-on-surface mb-1">Nom Complexe du Patient</label>
                <input 
                  type="text" 
                  value={newRdv.patientName} 
                  onChange={(e) => setNewRdv(prev => ({ ...prev, patientName: e.target.value }))}
                  placeholder="Ex: Moncef Ben Slimane"
                  className="w-full h-11 px-4 rounded-xl bg-surface-container-low border border-outline-variant/60 font-body-md text-on-surface focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-label-md text-label-md font-bold text-on-surface mb-1">CIN (8 chiffres)</label>
                  <input 
                    type="text" 
                    value={newRdv.cin} 
                    onChange={(e) => setNewRdv(prev => ({ ...prev, cin: e.target.value }))}
                    placeholder="07788990"
                    className="w-full h-11 px-4 rounded-xl bg-surface-container-low border border-outline-variant/60 font-mono text-body-md text-on-surface focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-label-md text-label-md font-bold text-on-surface mb-1">Heure Créneau</label>
                  <input 
                    type="text" 
                    value={newRdv.time} 
                    onChange={(e) => setNewRdv(prev => ({ ...prev, time: e.target.value }))}
                    className="w-full h-11 px-4 rounded-xl bg-surface-container-low border border-outline-variant/60 font-body-md text-on-surface focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-label-md text-label-md font-bold text-on-surface mb-1">Motif de Consultation</label>
                <select 
                  value={newRdv.type}
                  onChange={(e) => setNewRdv(prev => ({ ...prev, type: e.target.value }))}
                  className="w-full h-11 px-4 rounded-xl bg-surface-container-low border border-outline-variant/60 font-body-md text-on-surface focus:ring-2 focus:ring-primary focus:outline-none"
                >
                  <option value="Consultation">Consultation Générale / Contrôle</option>
                  <option value="ECG">Électrocardiogramme (ECG)</option>
                  <option value="Échocardiographie">Échocardiographie Doppler</option>
                  <option value="Holter">Pose / Restitution Holter</option>
                  <option value="CNAM">Suivi Prise en Charge CNAM</option>
                </select>
              </div>

              <div className="pt-3 border-t border-surface-container-low flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high font-label-md text-label-md font-bold text-on-surface"
                >
                  Annuler
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2 rounded-xl bg-primary text-on-primary font-label-md text-label-md font-bold hover:bg-primary-container shadow-xs"
                >
                  Valider et Inscrire
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
