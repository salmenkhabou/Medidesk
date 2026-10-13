import React, { useState } from 'react';
import { registerPatient } from '../services/api';

export default function PatientRegisterView({ setView }) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    cin: '',
    phone: '',
    email: '',
    birthDate: '',
    gender: 'homme',
    address: '',
    city: 'Tunis',
    cnamCode: '',
    cnamFiliere: 'publique',
    allergies: '',
    antecedents: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.acceptTerms) {
      setError("Veuillez accepter les conditions d'utilisation et la charte INPDP.");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await registerPatient(formData);

      if (data.success) {
        setSuccessMsg("Votre compte patient a été créé avec succès ! Redirection vers la page de connexion...");
        setTimeout(() => {
          setView('login');
        }, 1200);
      } else {
        setError(data.message || 'Erreur lors de la création du compte.');
        setLoading(false);
      }
    } catch (err) {
      setError(err.message || 'Erreur lors de la création du compte.');
      setLoading(false);
    }
  };


  return (
    <div className="w-full min-h-screen bg-background py-8 pb-16">
      <div className="max-w-3xl mx-auto px-4 md:px-6">
        
        {/* Header Card */}
        <div className="bg-surface-container-lowest rounded-xl p-6 sm:p-8 shadow-xl border border-surface-container-high relative overflow-hidden mb-6">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary via-primary-container to-secondary-container"></div>

          <div className="flex flex-col items-center text-center">
            <div className="w-14 h-14 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-3">
              <span className="material-symbols-outlined text-[32px]">person_add</span>
            </div>
            <h1 className="font-headline-lg text-headline-lg text-on-surface font-extrabold">
              Création de compte patient
            </h1>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-1 max-w-lg">
              Créez votre dossier médical personnel sécurisé conforme INPDP Tunisie. Suivez vos consultations, ordonnances et téléconsultations en direct.
            </p>
          </div>
        </div>

        {successMsg && (
          <div className="mb-4 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 text-body-sm flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px] text-emerald-600">check_circle</span>
            <span className="font-semibold">{successMsg}</span>
          </div>
        )}

        {error && (
          <div className="mb-4 p-4 rounded-xl bg-error-container text-on-error-container text-body-sm flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px]">error</span>
            <span>{error}</span>
          </div>
        )}

        {/* Form Container */}
        <form onSubmit={handleSubmit} className="bg-surface-container-lowest rounded-xl p-6 sm:p-8 shadow-sm border border-surface-container-high space-y-6">
          
          {/* Section 1: Identité */}
          <div className="space-y-4">
            <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold border-b pb-2 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[20px]">badge</span>
              1. Identité du patient
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="font-label-md text-label-md text-on-surface font-semibold">Prénom *</label>
                <input
                  type="text"
                  required
                  placeholder="ex. Yasmine"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="w-full h-11 px-4 bg-surface-container-low text-on-surface rounded-lg border border-surface-container-high"
                />
              </div>
              <div className="space-y-1">
                <label className="font-label-md text-label-md text-on-surface font-semibold">Nom de famille *</label>
                <input
                  type="text"
                  required
                  placeholder="ex. Ben Amor"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="w-full h-11 px-4 bg-surface-container-low text-on-surface rounded-lg border border-surface-container-high"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="font-label-md text-label-md text-on-surface font-semibold">Numéro CIN (8 chiffres) *</label>
                <input
                  type="text"
                  required
                  maxLength={8}
                  placeholder="08920182"
                  value={formData.cin}
                  onChange={(e) => setFormData({ ...formData, cin: e.target.value })}
                  className="w-full h-11 px-4 bg-surface-container-low text-on-surface rounded-lg border border-surface-container-high"
                />
              </div>
              <div className="space-y-1">
                <label className="font-label-md text-label-md text-on-surface font-semibold">Date de naissance *</label>
                <input
                  type="date"
                  required
                  value={formData.birthDate}
                  onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                  className="w-full h-11 px-4 bg-surface-container-low text-on-surface rounded-lg border border-surface-container-high"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Contact */}
          <div className="space-y-4 pt-2">
            <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold border-b pb-2 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[20px]">call</span>
              2. Coordonnées & Téléphone (+216)
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="font-label-md text-label-md text-on-surface font-semibold">Téléphone Mobile Tunisie *</label>
                <input
                  type="tel"
                  required
                  placeholder="+216 98 000 000"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full h-11 px-4 bg-surface-container-low text-on-surface rounded-lg border border-surface-container-high"
                />
              </div>
              <div className="space-y-1">
                <label className="font-label-md text-label-md text-on-surface font-semibold">Adresse E-mail *</label>
                <input
                  type="email"
                  required
                  placeholder="yasmine.benamor@gmail.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full h-11 px-4 bg-surface-container-low text-on-surface rounded-lg border border-surface-container-high"
                />
              </div>
            </div>
          </div>

          {/* Section 3: CNAM */}
          <div className="space-y-4 pt-2">
            <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold border-b pb-2 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[20px]">health_and_safety</span>
              3. Assurance CNAM & Couverture Sociale
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="font-label-md text-label-md text-on-surface font-semibold">Matricule CNAM (Code Unique)</label>
                <input
                  type="text"
                  placeholder="Code unique à 10 chiffres"
                  value={formData.cnamCode}
                  onChange={(e) => setFormData({ ...formData, cnamCode: e.target.value })}
                  className="w-full h-11 px-4 bg-surface-container-low text-on-surface rounded-lg border border-surface-container-high"
                />
              </div>
              <div className="space-y-1">
                <label className="font-label-md text-label-md text-on-surface font-semibold">Régime / Filière CNAM</label>
                <select
                  value={formData.cnamFiliere}
                  onChange={(e) => setFormData({ ...formData, cnamFiliere: e.target.value })}
                  className="w-full h-11 px-4 bg-surface-container-low text-on-surface rounded-lg border border-surface-container-high font-semibold"
                >
                  <option value="publique">Filière Publique (Carnet)</option>
                  <option value="privee">Filière Privée (Remboursement)</option>
                  <option value="famille">Médecin de Famille</option>
                  <option value="aucune">Aucune / Assuré Privé</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 4: Mot de passe */}
          <div className="space-y-4 pt-2">
            <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold border-b pb-2 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[20px]">lock</span>
              4. Sécurité du compte
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="font-label-md text-label-md text-on-surface font-semibold">Mot de passe *</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full h-11 px-4 bg-surface-container-low text-on-surface rounded-lg border border-surface-container-high"
                />
              </div>
              <div className="space-y-1">
                <label className="font-label-md text-label-md text-on-surface font-semibold">Confirmer le mot de passe *</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="w-full h-11 px-4 bg-surface-container-low text-on-surface rounded-lg border border-surface-container-high"
                />
              </div>
            </div>

            <div className="flex items-start gap-2 pt-2">
              <input
                id="terms"
                type="checkbox"
                checked={formData.acceptTerms}
                onChange={(e) => setFormData({ ...formData, acceptTerms: e.target.checked })}
                className="h-4 w-4 rounded text-primary focus:ring-primary/30 accent-primary cursor-pointer mt-0.5"
              />
              <label htmlFor="terms" className="font-label-sm text-label-sm text-on-surface cursor-pointer select-none">
                J'accepte les conditions d'utilisation et la charte de confidentialité conforme à la loi tunisienne INPDP n° 2004-63.
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 bg-primary text-on-primary font-label-lg text-label-lg font-bold rounded-lg shadow hover:bg-primary-container transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <span className="material-symbols-outlined animate-spin text-[20px]">progress_activity</span>
                <span>Création du dossier en cours...</span>
              </>
            ) : (
              <>
                <span>Créer mon compte patient</span>
                <span className="material-symbols-outlined text-[20px]">check_circle</span>
              </>
            )}
          </button>
        </form>

      </div>
    </div>
  );
}
