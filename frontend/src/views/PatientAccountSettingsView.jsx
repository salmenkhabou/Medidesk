import React, { useState } from 'react';

export default function PatientAccountSettingsView({ setView }) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);
  const [pinCode, setPinCode] = useState(['5', '8', '2', '', '', '']);
  const [statusMessage, setStatusMessage] = useState(null);

  const handlePasswordUpdate = (e) => {
    e.preventDefault();
    if (!newPassword || newPassword !== confirmPassword) {
      showToast('Les mots de passe ne correspondent pas.');
      return;
    }
    fetch('/api/patient/security-settings/update-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentPassword, newPassword })
    })
      .then((res) => res.json())
      .then((data) => {
        showToast(data.message || 'Mot de passe mis à jour !');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      });
  };

  const handleToggle2FA = () => {
    const nextState = !twoFactorEnabled;
    setTwoFactorEnabled(nextState);
    fetch('/api/patient/security-settings/toggle-2fa', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ enabled: nextState })
    })
      .then((res) => res.json())
      .then((data) => {
        showToast(data.message);
      });
  };

  const showToast = (msg) => {
    setStatusMessage(msg);
    setTimeout(() => setStatusMessage(null), 4000);
  };

  return (
    <div className="w-full bg-surface min-h-screen flex flex-col pb-16">
      
      {/* Global Status Message Toast */}
      {statusMessage && (
        <div className="fixed top-24 right-4 z-50 p-4 rounded-xl bg-primary text-on-primary shadow-2xl flex items-center gap-3 border border-primary-container animate-bounce max-w-md">
          <span className="material-symbols-outlined text-[24px]">check_circle</span>
          <span className="font-bold text-xs">{statusMessage}</span>
        </div>
      )}

      <div className="w-full max-w-7xl mx-auto px-4 sm:px-8 pt-6 pb-12 space-y-6">
        
        {/* Breadcrumb Navigation */}
        <nav aria-label="Fil d'Ariane" className="flex items-center gap-2 text-xs text-on-surface-variant font-medium">
          <button onClick={() => setView('patient-dashboard')} className="hover:text-primary transition-colors flex items-center gap-1">
            <span className="material-symbols-outlined text-[16px]">home</span>
            Accueil
          </button>
          <span className="text-outline-variant">/</span>
          <button onClick={() => setView('patient-dashboard')} className="hover:text-primary transition-colors">Mon Compte</button>
          <span className="text-outline-variant">/</span>
          <span className="text-primary font-bold">Paramètres &amp; Sécurité</span>
        </nav>

        {/* Page Title */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2 border-b border-surface-container-high">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 text-primary">
                <span className="material-symbols-outlined text-[20px]">admin_panel_settings</span>
              </span>
              <h1 className="font-headline-xl text-headline-xl text-on-surface font-bold">Paramètres &amp; Sécurité du Compte</h1>
            </div>
            <p className="text-sm text-on-surface-variant max-w-3xl">
              Gérez vos informations personnelles, sécurité d'accès et préférences de confidentialité conformes aux normes INPDP Tunisie.
            </p>
          </div>
          <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-surface-container-high text-xs text-on-surface-variant font-semibold">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
            <span>Dossier #TN-8831</span>
            <span>•</span>
            <span className="text-primary font-bold">Certifié HDS</span>
          </div>
        </div>

        {/* Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LEFT Navigation Column */}
          <aside className="lg:col-span-4 xl:col-span-3 space-y-4">
            <div className="bg-surface-container-lowest rounded-2xl shadow-sm border border-surface-container-high p-3 space-y-1">
              <button className="w-full flex items-center justify-between p-3 rounded-xl text-on-surface-variant hover:bg-surface-container-low transition-all">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-[20px]">person</span>
                  <span className="text-xs font-bold">Informations du profil</span>
                </div>
              </button>
              <div className="relative flex items-center justify-between p-3 rounded-xl bg-primary/10 text-primary font-bold">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-[20px]">shield</span>
                  <span className="text-xs">Sécurité &amp; 2FA</span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-primary text-on-primary text-[10px]">Actif</span>
              </div>
              <button 
                onClick={() => setView('patient-notifications')}
                className="w-full flex items-center justify-between p-3 rounded-xl text-on-surface-variant hover:bg-surface-container-low transition-all"
              >
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-[20px]">notifications</span>
                  <span className="text-xs font-bold">Notifications</span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-surface-container-high text-xs text-on-surface-variant font-semibold">3 actifs</span>
              </button>
            </div>

            {/* Security Index Gauge */}
            <div className="bg-gradient-to-br from-surface-container-lowest to-surface-container-low p-5 rounded-2xl border border-surface-container-high shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[20px]">health_and_safety</span>
                  <span className="font-bold text-xs text-on-surface">Indice de sécurité</span>
                </div>
                <span className="text-xl text-primary font-bold">85%</span>
              </div>
              <div className="w-full bg-surface-container-highest rounded-full h-2 overflow-hidden">
                <div className="bg-primary h-2 rounded-full transition-all duration-700" style={{ width: '85%' }}></div>
              </div>
              <p className="text-xs text-on-surface-variant">
                Niveau : <span className="font-bold text-primary">Élevé</span>. Finalisez la validation 2FA pour atteindre 100%.
              </p>
            </div>
          </aside>

          {/* RIGHT Main Security Panel */}
          <div className="lg:col-span-8 xl:col-span-9 space-y-6">
            
            {/* Password Modification Form */}
            <section className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm border border-surface-container-high space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-primary-container/10 flex items-center justify-center text-primary font-bold">
                    <span className="material-symbols-outlined text-[20px]">key</span>
                  </div>
                  <div>
                    <h3 className="font-headline-md text-headline-md text-on-surface font-bold">Modification du mot de passe</h3>
                    <p className="text-xs text-on-surface-variant">Modifiez régulièrement vos identifiants pour sécuriser vos antécédents.</p>
                  </div>
                </div>
              </div>

              <form onSubmit={handlePasswordUpdate} className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-on-surface" htmlFor="curr-pass">Mot de passe actuel</label>
                  <input
                    id="curr-pass"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full h-11 px-3.5 rounded-xl bg-surface-container-low text-on-surface text-sm focus:outline-none focus:bg-surface-container-lowest border border-transparent focus:border-primary"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-on-surface" htmlFor="new-pass">Nouveau mot de passe</label>
                  <input
                    id="new-pass"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Nouveau mot de passe"
                    className="w-full h-11 px-3.5 rounded-xl bg-surface-container-low text-on-surface text-sm focus:outline-none focus:bg-surface-container-lowest border border-transparent focus:border-primary"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-on-surface" htmlFor="conf-pass">Confirmer le mot de passe</label>
                  <input
                    id="conf-pass"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirmer"
                    className="w-full h-11 px-3.5 rounded-xl bg-surface-container-low text-on-surface text-sm focus:outline-none focus:bg-surface-container-lowest border border-transparent focus:border-primary"
                  />
                </div>

                <div className="md:col-span-3 flex justify-end pt-2">
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-primary text-on-primary text-xs font-bold hover:bg-primary-container transition-colors shadow-sm"
                  >
                    Mettre à jour le mot de passe
                  </button>
                </div>
              </form>
            </section>

            {/* Two-Factor Authentication (2FA) Setup */}
            <section className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm border border-surface-container-high space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-surface-container-low">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-orange-100 text-secondary flex items-center justify-center font-bold">
                    <span className="material-symbols-outlined text-[20px]">phonelink_lock</span>
                  </div>
                  <div>
                    <h3 className="font-headline-md text-headline-md text-on-surface font-bold">Double authentification (2FA / A2F)</h3>
                    <p className="text-xs text-on-surface-variant">Ajoute une couche de sécurité inviolable lors de l'accès à vos résultats.</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-surface-container-low px-4 py-1.5 rounded-full">
                  <span className="text-xs font-bold text-primary">{twoFactorEnabled ? 'Activé' : 'Désactivé'}</span>
                  <button
                    type="button"
                    onClick={handleToggle2FA}
                    className={`w-11 h-6 rounded-full relative p-0.5 transition-colors ${twoFactorEnabled ? 'bg-primary' : 'bg-surface-container-highest'}`}
                  >
                    <span className={`block w-5 h-5 rounded-full bg-white transform transition-transform ${twoFactorEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
                  </button>
                </div>
              </div>

              {twoFactorEnabled && (
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pt-2">
                  <div className="md:col-span-5 bg-surface-container-low rounded-2xl p-4 flex flex-col items-center justify-center text-center space-y-3">
                    <span className="text-xs font-bold text-on-surface-variant uppercase">QR Code de Liaison</span>
                    <div className="bg-white p-3 rounded-xl shadow-sm border border-surface-container-high">
                      <span className="material-symbols-outlined text-[100px] text-primary">qr_code_2</span>
                    </div>
                    <p className="text-xs text-on-surface-variant">Scannez avec Google Authenticator ou Authy.</p>
                  </div>

                  <div className="md:col-span-7 flex flex-col justify-between space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <span className="w-6 h-6 rounded-full bg-primary text-on-primary text-xs font-bold flex items-center justify-center shrink-0">1</span>
                        <p className="text-xs text-on-surface font-medium">Scannez le QR Code avec votre application d'authentification.</p>
                      </div>

                      <div className="flex items-start gap-3">
                        <span className="w-6 h-6 rounded-full bg-primary text-on-primary text-xs font-bold flex items-center justify-center shrink-0">2</span>
                        <div className="space-y-1.5 w-full">
                          <p className="text-xs text-on-surface font-medium">Clé secrète manuelle :</p>
                          <div className="flex items-center justify-between bg-surface-container-low px-3 py-2 rounded-xl border border-surface-container-high">
                            <code className="font-mono text-xs text-primary font-bold">MD24 - YASM - 8831 - SAFE</code>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <span className="w-6 h-6 rounded-full bg-primary text-on-primary text-xs font-bold flex items-center justify-center shrink-0">3</span>
                        <div className="space-y-2">
                          <p className="text-xs text-on-surface font-medium">Code temporaire à 6 chiffres :</p>
                          <div className="flex items-center gap-2">
                            {pinCode.map((digit, idx) => (
                              <input
                                key={idx}
                                type="text"
                                maxLength={1}
                                value={digit}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  const updated = [...pinCode];
                                  updated[idx] = val;
                                  setPinCode(updated);
                                }}
                                className="w-10 h-11 text-center font-bold text-lg rounded-xl bg-surface-container-low text-primary border border-surface-container-high focus:outline-none focus:border-primary"
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => showToast('Code 2FA validé avec succès !')}
                      className="px-6 py-2.5 rounded-xl bg-primary text-on-primary text-xs font-bold hover:bg-primary-container transition-colors shadow-sm self-start"
                    >
                      Vérifier et activer le code 2FA
                    </button>
                  </div>
                </div>
              )}
            </section>

          </div>
        </div>

      </div>
    </div>
  );
}
