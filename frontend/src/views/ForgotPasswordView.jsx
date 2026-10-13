import React, { useState } from 'react';

export default function ForgotPasswordView({ setView }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await fetch('http://localhost:5000/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
    } catch (err) {
      // Fallback
    }

    setTimeout(() => {
      setView('reset-link-sent', { email });
    }, 600);
  };

  return (
    <div className="w-full min-h-[80vh] flex flex-col items-center justify-center bg-surface px-4 py-8">
      <div className="w-full max-w-md bg-surface-container-lowest rounded-xl shadow-xl p-6 sm:p-8 relative overflow-hidden border border-surface-container-high/60">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary via-primary-container to-secondary-container"></div>

        <div className="flex flex-col items-center text-center mt-2 mb-6">
          <div className="w-14 h-14 rounded-xl bg-surface-container-low flex items-center justify-center text-primary mb-4 shadow-sm">
            <span className="material-symbols-outlined text-[30px]">lock_reset</span>
          </div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface font-bold">
            Réinitialisation du mot de passe
          </h1>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-2">
            Entrez votre adresse email ou votre identifiant professionnel. Nous vous enverrons un lien de réinitialisation sécurisé (Étape 1 sur 2).
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1 text-left">
            <label className="font-label-md text-label-md text-on-surface font-semibold" htmlFor="reset-email">
              Adresse e-mail associée au compte
            </label>
            <div className="relative flex items-center">
              <div className="absolute left-3.5 flex items-center pointer-events-none text-on-surface-variant">
                <span className="material-symbols-outlined text-[20px]">mail</span>
              </div>
              <input
                id="reset-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="praticien@clinique.tn ou patient@gmail.com"
                className="w-full h-11 pl-11 pr-4 bg-surface-container-low text-on-surface font-body-md text-body-md rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/40 placeholder:text-outline transition-all"
              />
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
                <span>Envoi en cours...</span>
              </>
            ) : (
              <>
                <span>Envoyer le lien de réinitialisation</span>
                <span className="material-symbols-outlined text-[20px]">send</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-surface-container-high text-center">
          <button
            onClick={() => setView('login')}
            className="inline-flex items-center gap-1 font-label-md text-label-md text-primary font-semibold hover:underline"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            <span>Retour à la connexion</span>
          </button>
        </div>

      </div>
    </div>
  );
}
