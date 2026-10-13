import React, { useState, useEffect } from 'react';

export default function ResetLinkSentView({ email = 'praticien@clinique.tn', setView }) {
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  const handleResend = () => {
    setCountdown(60);
    setCanResend(false);
  };

  return (
    <div className="w-full min-h-[80vh] flex flex-col items-center justify-center bg-surface px-4 py-8">
      <div className="w-full max-w-md bg-surface-container-lowest rounded-xl shadow-xl p-6 sm:p-8 relative overflow-hidden text-center border border-surface-container-high/60">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary via-primary-container to-secondary-container"></div>

        <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4 animate-pulse">
          <span className="material-symbols-outlined text-[36px]">mark_email_read</span>
        </div>

        <h1 className="font-headline-lg text-headline-lg text-on-surface font-bold">
          Lien envoyé avec succès !
        </h1>

        <p className="font-body-sm text-body-sm text-on-surface-variant mt-2 leading-relaxed">
          Un e-mail contenant les instructions de réinitialisation sécurisée a été transmis à :
        </p>
        
        <div className="my-3 py-2 px-4 rounded-lg bg-surface-container-low text-primary font-headline-sm text-headline-sm font-bold border border-surface-container-high">
          {email}
        </div>

        <p className="font-body-sm text-body-sm text-on-surface-variant mb-6">
          Veuillez consulter votre boîte de réception et cliquer sur le lien sous 15 minutes. N'oubliez pas de vérifier le dossier spam.
        </p>

        <div className="space-y-3">
          <button
            onClick={() => window.open('https://mail.google.com', '_blank')}
            className="w-full h-12 bg-primary text-on-primary font-label-lg text-label-lg font-bold rounded-lg shadow hover:bg-primary-container transition-all flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-[20px]">open_in_new</span>
            <span>Ouvrir ma boîte de messagerie</span>
          </button>

          {canResend ? (
            <button
              onClick={handleResend}
              className="w-full py-2.5 rounded-lg bg-surface-container-low text-primary font-label-md text-label-md font-bold hover:bg-surface-container-high transition-colors flex items-center justify-center gap-1"
            >
              <span className="material-symbols-outlined text-[18px]">refresh</span>
              <span>Renvoyer le lien de réinitialisation</span>
            </button>
          ) : (
            <p className="font-label-sm text-label-sm text-outline">
              Possibilité de renvoyer un lien dans <strong className="text-primary">{countdown}s</strong>
            </p>
          )}
        </div>

        <div className="mt-6 pt-4 border-t border-surface-container-high">
          <button
            onClick={() => setView('login')}
            className="inline-flex items-center gap-1 font-label-md text-label-md text-on-surface-variant hover:text-primary transition-colors font-semibold"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            <span>Retour à l'écran de connexion</span>
          </button>
        </div>

      </div>
    </div>
  );
}
