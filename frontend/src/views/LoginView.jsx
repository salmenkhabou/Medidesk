import React, { useState } from 'react';
import { loginUser } from '../services/api';

export default function LoginView({ setView, onLoginSuccess }) {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const data = await loginUser({ email: identifier, password });

      if (data.success && data.token && data.user) {
        // Save token and user in localStorage
        localStorage.setItem('medidesk_jwt_token', data.token);
        localStorage.setItem('medidesk_current_user', JSON.stringify(data.user));

        if (onLoginSuccess) {
          onLoginSuccess(data.user);
        }

        // Automatic routing based on user's verified role
        setTimeout(() => {
          if (data.user.role === 'superadmin') {
            setView('superadmin');
          } else if (data.user.role === 'doctor') {
            setView('tableau-de-bord-medecin');
          } else if (data.user.role === 'secretariat') {
            setView('tableau-de-bord');
          } else {
            setView('patient-dashboard');
          }
        }, 400);
      } else {
        setError(data.message || 'Identifiants invalides');
        setLoading(false);
      }
    } catch (err) {
      setError(err.message || 'Erreur lors de la connexion. Vérifiez vos identifiants.');
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-[85vh] flex flex-col items-center justify-center bg-surface px-4 py-8 relative">
      
      {/* Dynamic Ambient Blur Backgrounds */}
      <div className="absolute -top-16 -left-12 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none -z-10"></div>
      <div className="absolute -bottom-16 -right-12 w-64 h-64 bg-secondary-container/10 rounded-full blur-3xl pointer-events-none -z-10"></div>

      <div className="w-full max-w-lg flex flex-col items-center">
        
        {/* Main Authentication Card */}
        <div className="w-full bg-surface-container-lowest rounded-2xl shadow-xl p-6 sm:p-8 relative overflow-hidden border border-surface-container-high/60">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary via-teal-500 to-secondary-container"></div>

          {/* Header Section */}
          <div className="flex flex-col items-center text-center mt-2 mb-6">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-3 shadow-xs">
              <span className="material-symbols-outlined text-[32px]">health_and_safety</span>
            </div>
            <h1 className="font-headline-lg text-headline-lg text-on-surface font-extrabold tracking-tight">
              Connexion Sécurisée MediDesk
            </h1>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-1.5">
              Entrez vos identifiants pour accéder à votre espace dédié (SuperAdmin, Médecin, Secrétariat ou Patient).
            </p>
          </div>

          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-error-container text-on-error-container text-body-sm flex items-center gap-2.5 border border-error/20 animate-shake">
              <span className="material-symbols-outlined text-[20px]">error</span>
              <span className="font-medium">{error}</span>
            </div>
          )}

          {/* Login Form */}
          <form className="space-y-4" onSubmit={handleSubmit}>
            
            {/* Field 1: Identifier */}
            <div className="space-y-1 text-left">
              <label className="font-label-md text-label-md text-on-surface font-semibold flex items-center justify-between" htmlFor="user-identifier">
                <span>Adresse Email Professionnelle ou Personnelle</span>
                <span className="text-secondary font-bold">*</span>
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-3.5 flex items-center pointer-events-none text-on-surface-variant">
                  <span className="material-symbols-outlined text-[20px]">mail</span>
                </div>
                <input
                  id="user-identifier"
                  type="email"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="ex. dr.benmahmoud@medidesk.tn"
                  className="w-full h-11 pl-11 pr-4 bg-surface-container-low text-on-surface font-body-md text-body-md rounded-xl focus:outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/40 placeholder:text-outline transition-all border border-surface-container-high"
                />
              </div>
            </div>

            {/* Field 2: Password */}
            <div className="space-y-1 text-left">
              <div className="flex items-center justify-between">
                <label className="font-label-md text-label-md text-on-surface font-semibold flex items-center gap-1" htmlFor="user-password">
                  <span>Mot de passe</span>
                  <span className="text-secondary font-bold">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setView('forgot-password')}
                  className="font-label-sm text-label-sm text-primary hover:underline transition-all font-semibold"
                >
                  Mot de passe oublié ?
                </button>
              </div>
              <div className="relative flex items-center">
                <div className="absolute left-3.5 flex items-center pointer-events-none text-on-surface-variant">
                  <span className="material-symbols-outlined text-[20px]">lock</span>
                </div>
                <input
                  id="user-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full h-11 pl-11 pr-12 bg-surface-container-low text-on-surface font-body-md text-body-md rounded-xl focus:outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/40 placeholder:text-outline transition-all border border-surface-container-high"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 h-8 w-8 flex items-center justify-center rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors"
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            {/* Checkbox: Remember Device */}
            <div className="pt-1 flex items-start gap-2 text-left">
              <input
                id="remember-device"
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="h-4 w-4 rounded text-primary focus:ring-primary/30 accent-primary cursor-pointer mt-0.5"
              />
              <label htmlFor="remember-device" className="font-label-sm text-label-sm text-on-surface-variant cursor-pointer select-none">
                Mémoriser cet équipement de santé pendant 30 jours
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-primary text-on-primary font-label-lg text-label-lg font-bold rounded-xl shadow-md hover:bg-primary-container active:scale-[0.99] transition-all flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <>
                  <span className="material-symbols-outlined animate-spin text-[20px]">progress_activity</span>
                  <span>Vérification sécurisée des accès...</span>
                </>
              ) : (
                <>
                  <span>Connexion à mon espace</span>
                  <span className="material-symbols-outlined text-[20px]">login</span>
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-5 flex items-center justify-center">
            <div className="w-full h-px bg-surface-container-highest"></div>
            <span className="absolute px-3 bg-surface-container-lowest font-label-sm text-label-sm text-outline uppercase tracking-wider font-semibold">
              Patient sans compte ?
            </span>
          </div>

          {/* Only Patient can register */}
          <div className="rounded-xl bg-surface-container-low p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-left border border-surface-container-high">
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5 text-secondary font-label-md text-label-md font-bold">
                <span className="material-symbols-outlined text-[18px]">person_add</span>
                <span>Inscription Patient</span>
              </div>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Seuls les patients peuvent créer un compte en ligne. Les médecins et secrétariats sont ajoutés par l'administration.
              </p>
            </div>
            <button
              onClick={() => setView('patient-register')}
              className="w-full sm:w-auto px-4 py-2 rounded-xl bg-primary text-on-primary font-label-md text-label-md font-bold shadow-xs hover:bg-primary-container transition-colors flex items-center justify-center gap-1 whitespace-nowrap"
            >
              <span>S'inscrire</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>
          </div>

        </div>

        {/* Security Info */}
        <div className="mt-5 w-full max-w-lg rounded-xl bg-surface-container-low/80 p-3.5 flex items-center justify-between border border-surface-container-high text-xs text-on-surface-variant font-medium">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-primary text-[18px]">lock</span>
            <span>Chiffrement de bout en bout</span>
          </div>
          <span>Conforme INPDP Tunisie & HDS</span>
        </div>

      </div>
    </div>
  );
}
