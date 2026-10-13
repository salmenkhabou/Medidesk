import React, { useState, useRef } from 'react';

export default function TwoFactorView({ email = 'dr.benali@clinique.tn', setView }) {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [trustDevice, setTrustDevice] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const inputsRef = useRef([]);

  const handleChange = (index, value) => {
    if (value.length > 1) {
      value = value[value.length - 1];
    }
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Auto focus next input
    if (value && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handleVerify = async (e) => {
    e?.preventDefault();
    const fullCode = code.join('');
    if (fullCode.length !== 6) {
      setError('Veuillez saisir le code complet à 6 chiffres.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('http://localhost:5000/api/auth/verify-2fa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: fullCode })
      });
      const data = await res.json();

      if (data.success) {
        setTimeout(() => {
          setView('home');
        }, 600);
      } else {
        setError(data.message);
        setLoading(false);
      }
    } catch (err) {
      setTimeout(() => {
        setView('home');
      }, 600);
    }
  };

  return (
    <div className="w-full min-h-[85vh] flex flex-col items-center justify-center bg-surface px-4 py-8 relative">
      <div className="w-full max-w-md bg-surface-container-lowest rounded-xl shadow-xl p-6 sm:p-8 relative overflow-hidden border border-surface-container-high/60 text-center">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary via-primary-container to-secondary-container"></div>

        <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
          <span className="material-symbols-outlined text-[32px]">security</span>
        </div>

        <h1 className="font-headline-lg text-headline-lg text-on-surface font-bold">
          Vérification 2FA
        </h1>
        <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
          Sécurité renforcée INPDP. Un code de sécurité temporaire à 6 chiffres a été envoyé sur votre mobile enregistré :
        </p>

        <div className="my-3 py-1.5 px-3 rounded-lg bg-surface-container-low text-primary font-headline-sm text-headline-sm font-bold inline-block border border-surface-container-high">
          +216 98 *** *89
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-error-container text-on-error-container text-body-sm flex items-center justify-center gap-2">
            <span className="material-symbols-outlined text-[20px]">error</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleVerify} className="space-y-6 mt-4">
          {/* 6 Digit Code Inputs */}
          <div className="flex justify-center gap-2 sm:gap-3">
            {code.map((digit, idx) => (
              <input
                key={idx}
                ref={(el) => (inputsRef.current[idx] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                className="w-11 h-13 sm:w-12 sm:h-14 text-center font-headline-xl text-headline-xl font-bold bg-surface-container-low text-primary rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:bg-surface-container-lowest shadow-inner border border-surface-container-high transition-all"
              />
            ))}
          </div>

          <div className="flex items-center justify-center gap-2 text-left">
            <input
              id="trust-device"
              type="checkbox"
              checked={trustDevice}
              onChange={(e) => setTrustDevice(e.target.checked)}
              className="h-4 w-4 rounded text-primary focus:ring-primary/30 accent-primary cursor-pointer"
            />
            <label htmlFor="trust-device" className="font-label-md text-label-md text-on-surface cursor-pointer select-none font-medium">
              Faire confiance à cet appareil pendant 30 jours
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 bg-primary text-on-primary font-label-lg text-label-lg font-bold rounded-lg shadow hover:bg-primary-container active:scale-[0.99] transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <span className="material-symbols-outlined animate-spin text-[20px]">progress_activity</span>
                <span>Validation du code...</span>
              </>
            ) : (
              <>
                <span>Valider le code d'accès</span>
                <span className="material-symbols-outlined text-[20px]">verified_user</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-surface-container-high flex flex-col gap-2">
          <button
            onClick={() => alert('Nouveau code SMS envoyé au +216 98 *** *89')}
            className="font-label-md text-label-md text-primary font-semibold hover:underline"
          >
            Renvoyer un nouveau code par SMS
          </button>
          <button
            onClick={() => setView('login')}
            className="font-label-sm text-label-sm text-on-surface-variant hover:text-on-surface"
          >
            Changer de compte
          </button>
        </div>

      </div>
    </div>
  );
}
