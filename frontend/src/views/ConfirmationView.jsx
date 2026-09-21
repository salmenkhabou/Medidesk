import React, { useState } from 'react';
import { fetchOnboardingByCode } from '../services/api';

export default function ConfirmationView({ trackingCode, record: initialRecord, setView }) {
  const [searchCode, setSearchCode] = useState(trackingCode || 'MD-2024-8841');
  const [record, setRecord] = useState(initialRecord || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetchOnboardingByCode(searchCode);
      setRecord(res.data);
    } catch (err) {
      setError(err.message || 'Dossier introuvable');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full flex flex-col pt-24 pb-16 px-margin md:px-margin-md lg:px-margin-lg max-w-4xl mx-auto">
      
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3 mb-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface-container-high text-primary font-label-md text-label-md font-bold uppercase tracking-wider">
          <span className="material-symbols-outlined text-[18px]">verified</span>
          <span>Suivi de Demande d'Adhésion Praticien</span>
        </div>
        <h1 className="font-headline-xl text-headline-xl text-on-surface font-bold">Statut de Validation du Compte Médical</h1>
        <p className="font-body-md text-body-md text-on-surface-variant">
          Entrez votre identifiant de dossier (ex: MD-2024-8841) ou numéro CNOM pour vérifier la progression auprès du Conseil d'Éthique.
        </p>
      </div>

      {/* Code Search Input */}
      <div className="bg-surface-container-lowest p-4 rounded-xl shadow-sm border border-surface-container-high mb-8">
        <form onSubmit={handleSearch} className="flex gap-3">
          <input
            type="text"
            value={searchCode}
            onChange={(e) => setSearchCode(e.target.value)}
            placeholder="Identifiant de suivi (ex: MD-2024-8841)"
            className="flex-1 h-11 px-4 rounded-lg bg-surface-container-low border border-outline-variant/60 font-mono text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-6 h-11 rounded-lg bg-primary-container text-on-primary font-label-lg text-label-lg font-bold hover:bg-primary transition-colors flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">search</span>
            <span>Vérifier le Statut</span>
          </button>
        </form>
      </div>

      {error && (
        <div className="p-space-md rounded-xl bg-error-container text-on-error-container font-label-md text-label-md flex items-center gap-2 mb-8">
          <span className="material-symbols-outlined text-[20px]">error</span>
          <span>{error}</span>
        </div>
      )}

      {/* Application Record Display */}
      {record ? (
        <div className="bg-surface-container-lowest p-6 sm:p-8 rounded-xl shadow-md border border-surface-container-high space-y-6">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4 border-surface-container-low">
            <div>
              <span className="font-label-sm text-label-sm text-outline uppercase font-semibold">Référence de Dossier</span>
              <h2 className="font-headline-md text-headline-md font-bold text-primary font-mono">{record.tracking_code}</h2>
            </div>
            <span className="px-3.5 py-1.5 rounded-full bg-secondary-fixed text-on-secondary-fixed-variant font-label-md text-label-md font-bold flex items-center gap-1.5 w-fit">
              <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
              En cours d'instruction (Validation 48h)
            </span>
          </div>

          {/* Verification Timeline Progress Bar */}
          <div className="space-y-3 py-2">
            <h3 className="font-label-lg text-label-lg font-bold text-on-surface uppercase tracking-wider">Étapes d'Approbation Médicale</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-lg bg-surface-container-low border border-primary-container/40 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold text-xs">✓</span>
                <span className="font-label-sm text-label-sm font-semibold text-on-surface">1. Dépôt du Dossier</span>
              </div>
              <div className="p-3 rounded-lg bg-surface-container-high border border-primary-container flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-primary-container text-on-primary font-bold text-xs animate-spin">⚙</span>
                <span className="font-label-sm text-label-sm font-bold text-primary">2. Inscription CNOM</span>
              </div>
              <div className="p-3 rounded-lg bg-surface-container opacity-60 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-outline-variant text-on-surface-variant font-bold text-xs">3</span>
                <span className="font-label-sm text-label-sm font-medium text-on-surface-variant">3. Activation Compte</span>
              </div>
            </div>
          </div>

          {/* Summary Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-surface-container-low text-body-sm font-body-sm">
            <div>
              <span className="text-on-surface-variant block font-label-sm text-label-sm">Praticien :</span>
              <span className="font-bold text-on-surface">{record.doctor_name}</span>
            </div>
            <div>
              <span className="text-on-surface-variant block font-label-sm text-label-sm">Numéro Ordre CNOM :</span>
              <span className="font-bold text-on-surface font-mono">{record.cnom_number}</span>
            </div>
            <div>
              <span className="text-on-surface-variant block font-label-sm text-label-sm">Spécialité & Ville :</span>
              <span className="font-bold text-on-surface">{record.specialty} • {record.city}</span>
            </div>
            <div>
              <span className="text-on-surface-variant block font-label-sm text-label-sm">Établissement déclaré :</span>
              <span className="font-bold text-on-surface">{record.clinic_name}</span>
            </div>
            <div>
              <span className="text-on-surface-variant block font-label-sm text-label-sm">Forfait Choisi :</span>
              <span className="font-bold text-primary">{record.plan_type === 'cloud_hds' ? 'Cloud HDS Sécurisé (95 TND)' : 'Stockage Local'}</span>
            </div>
            <div>
              <span className="text-on-surface-variant block font-label-sm text-label-sm">Document Joint :</span>
              <span className="font-bold text-on-surface">{record.document_name}</span>
            </div>
          </div>

          <div className="pt-4 border-t border-surface-container-low flex justify-between items-center">
            <button
              onClick={() => setView('home')}
              className="px-4 py-2 rounded-lg bg-surface-container text-on-surface-variant font-label-md text-label-md font-bold hover:bg-surface-container-high transition-colors"
            >
              Retour à l'Accueil
            </button>
            <button
              onClick={() => window.print()}
              className="px-4 py-2 rounded-lg bg-surface-container-low text-primary font-label-md text-label-md font-bold hover:bg-surface-container transition-colors flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[16px]">print</span>
              <span>Imprimer l'Attestation Dépôt</span>
            </button>
          </div>

        </div>
      ) : (
        <div className="py-space-xl text-center bg-surface-container-lowest rounded-xl p-space-lg border border-surface-container-high">
          <span className="material-symbols-outlined text-outline text-[48px] block mb-2">find_in_page</span>
          <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">Rechercher votre dossier d'adhésion.</h3>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">Saisissez votre code de suivi (ex: MD-2024-8841) reçu par SMS ou email.</p>
        </div>
      )}

    </div>
  );
}
