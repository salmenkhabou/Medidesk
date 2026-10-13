import React, { useState, useEffect } from 'react';
import { fetchVisitorReservations, validateVisitorReservation, rejectVisitorReservation } from '../services/api';

export default function SecretariatValidationQueueView({ setView }) {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    loadReservations();
  }, []);

  const loadReservations = async () => {
    setLoading(true);
    try {
      const res = await fetchVisitorReservations();
      setList(res.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  };

  const handleValidate = async (id) => {
    try {
      const res = await validateVisitorReservation(id);
      showToast(res.message);
      loadReservations();
    } catch (e) {
      showToast("Erreur lors de la validation");
    }
  };

  const handleReject = async (id) => {
    try {
      const res = await rejectVisitorReservation(id);
      showToast(res.message);
      loadReservations();
    } catch (e) {
      showToast("Erreur lors du rejet");
    }
  };

  return (
    <div className="w-full bg-surface min-h-screen pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
      
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-24 right-6 z-50 p-4 rounded-xl bg-primary text-on-primary shadow-2xl flex items-center gap-3 animate-bounce max-w-md">
          <span className="material-symbols-outlined text-[24px]">verified</span>
          <span className="font-label-lg text-label-lg font-bold">{toast}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 text-on-surface-variant font-label-md text-label-md mb-1">
            <button onClick={() => setView('tableau-de-bord')} className="hover:text-primary">Secrétariat</button>
            <span>/</span>
            <span className="text-primary font-bold">Validation Visiteurs</span>
          </div>
          <h1 className="font-headline-xl text-headline-xl font-bold text-on-surface">File de Validation des Réservations Visiteurs</h1>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Demandes de rendez-vous en ligne soumises par des patients visiteurs sans compte préalable.
          </p>
        </div>

        <button 
          onClick={() => setView('tableau-de-bord')}
          className="px-4 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high font-label-md text-label-md font-bold text-on-surface transition-colors"
        >
          Retour Dashboard
        </button>
      </div>

      {/* List Container */}
      <div className="bg-surface-container-lowest rounded-2xl shadow-sm border border-surface-container-high overflow-hidden">
        
        <div className="p-4 bg-surface-container-low border-b border-surface-container-high flex items-center justify-between">
          <h2 className="font-headline-sm text-headline-sm font-bold text-on-surface">Demandes En Attente de Vérification</h2>
          <span className="font-label-sm text-label-sm px-2.5 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed font-bold">
            {list.filter(item => item.status === 'pending').length} demandes non traitées
          </span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-on-surface-variant font-label-lg text-label-lg font-medium">Chargement des demandes...</div>
        ) : (
          <div className="divide-y divide-surface-container-low">
            {list.map((item) => (
              <div key={item.id} className="p-5 hover:bg-surface-container-low/40 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
                
                <div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">{item.patient_name}</h3>
                    <span className="px-2.5 py-0.5 rounded-full bg-secondary/10 text-secondary font-label-sm text-label-sm font-bold">
                      Créneau {item.requested_time}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full font-label-sm text-label-sm font-bold ${
                      item.status === 'confirmed' ? 'bg-primary-fixed text-primary' : item.status === 'rejected' ? 'bg-error-container text-on-error-container' : 'bg-surface-container-high text-on-surface-variant'
                    }`}>
                      {item.status === 'confirmed' ? 'Validé' : item.status === 'rejected' ? 'Refusé' : 'En attente validation'}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 font-body-sm text-body-sm text-on-surface-variant mt-1.5">
                    <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[16px] text-primary">phone</span> {item.phone}</span>
                    <span>•</span>
                    <span>Motif : {item.type}</span>
                    <span>•</span>
                    <span className="italic">{item.notes}</span>
                  </div>
                </div>

                {/* Actions */}
                {item.status === 'pending' && (
                  <div className="flex items-center gap-2 self-end md:self-center">
                    <button 
                      onClick={() => showToast(`Appel téléphonique vers ${item.phone} en cours...`)}
                      className="px-3.5 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-label-sm text-label-sm font-bold transition-colors flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-[18px]">call</span>
                      <span>Appeler</span>
                    </button>

                    <button 
                      onClick={() => handleReject(item.id)}
                      className="px-3.5 py-2 rounded-xl bg-error-container text-on-error-container font-label-sm text-label-sm font-bold hover:bg-error-container/80 transition-colors"
                    >
                      Refuser
                    </button>

                    <button 
                      onClick={() => handleValidate(item.id)}
                      className="px-4 py-2 rounded-xl bg-primary text-on-primary font-label-md text-label-md font-bold hover:bg-primary-container transition-colors shadow-xs flex items-center gap-1.5"
                    >
                      <span className="material-symbols-outlined text-[18px]">check_circle</span>
                      <span>Valider & Inscrire</span>
                    </button>
                  </div>
                )}

              </div>
            ))}
          </div>
        )}

      </div>

    </div>
  );
}
