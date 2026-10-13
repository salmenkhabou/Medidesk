import React from 'react';
import { useLanguage } from '../context/LanguageContext';

export default function Header({
  currentView,
  setView,
  currentUser,
  onOpenBooking,
  onOpenLogoutModal,
  onToggleMobileSidebar
}) {
  const { lang, setLang } = useLanguage();

  const userRole = currentUser?.role || null;

  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-surface-container-lowest/95 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] border-b border-surface-container-high">
      <div className="h-16 w-full px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
        
        {/* Left Section: Sidebar Toggle Buttons + Brand Logo */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Mobile Hamburger Toggle */}
          <button
            onClick={onToggleMobileSidebar}
            className="md:hidden p-2 rounded-xl text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors"
            title="Ouvrir la barre latérale"
          >
            <span className="material-symbols-outlined text-[24px]">menu</span>
          </button>

          {/* Brand Logo & Title */}
          <button 
            onClick={() => {
              if (userRole === 'superadmin') setView('superadmin');
              else if (userRole === 'doctor') setView('tableau-de-bord-medecin');
              else if (userRole === 'secretariat') setView('tableau-de-bord');
              else if (userRole === 'patient') setView('patient-dashboard');
              else setView('home');
            }} 
            className="flex items-center gap-2.5 focus:outline-none group text-left"
          >
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xl shadow-xs group-hover:scale-105 transition-transform ${
              userRole === 'superadmin' ? 'bg-amber-600 text-white' :
              userRole === 'doctor' ? 'bg-teal-700 text-white' :
              userRole === 'secretariat' ? 'bg-indigo-600 text-white' :
              userRole === 'patient' ? 'bg-emerald-600 text-white' :
              'bg-primary text-on-primary'
            }`}>
              <span className="material-symbols-outlined text-[22px]">
                {userRole === 'superadmin' ? 'admin_panel_settings' :
                 userRole === 'doctor' ? 'stethoscope' :
                 userRole === 'secretariat' ? 'support_agent' :
                 userRole === 'patient' ? 'health_and_safety' :
                 'local_hospital'}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="font-headline-sm text-headline-sm font-extrabold text-primary tracking-tight leading-none">
                MediDesk
              </span>
              <span className="text-[10px] text-on-surface-variant font-semibold tracking-wider uppercase leading-none mt-1">
                {userRole === 'superadmin' ? 'Tour de Contrôle' :
                 userRole === 'doctor' ? 'Espace Praticien' :
                 userRole === 'secretariat' ? 'Secrétariat Médical' :
                 userRole === 'patient' ? 'Portail Patient' :
                 'Plateforme Santé'}
              </span>
            </div>
          </button>

          {/* Context Badge */}
          <div className="hidden lg:flex items-center gap-2 pl-3 border-l border-surface-container-high text-xs text-on-surface-variant">
            <span className="material-symbols-outlined text-[16px] text-primary">verified</span>
            <span className="font-medium">
              {currentUser ? `Connecté • ${currentUser.name}` : 'Plateforme Médicale Tunisienne'}
            </span>
          </div>

        </div>

        {/* Right Section: System Telemetry & Auth Status */}
        <div className="flex items-center gap-3">
          
          {/* HDS Cloud Cluster Status Pill */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-container-low border border-surface-container-high shadow-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-[11px] font-medium text-on-surface">
              Cluster HDS <strong className="text-primary">99.98%</strong>
            </span>
          </div>

          {currentUser ? (
            // Logged-In User Profile Info & Logout
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2.5 bg-surface-container-low px-3 py-1.5 rounded-xl border border-surface-container-high">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                  userRole === 'superadmin' ? 'bg-amber-600' :
                  userRole === 'doctor' ? 'bg-teal-700' :
                  userRole === 'secretariat' ? 'bg-indigo-600' : 'bg-emerald-600'
                }`}>
                  {currentUser.name ? currentUser.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'MD'}
                </div>
                <div className="hidden sm:flex flex-col text-left">
                  <span className="text-xs font-bold text-on-surface leading-tight">
                    {currentUser.name}
                  </span>
                  <span className="text-[10px] text-on-surface-variant uppercase font-semibold">
                    {userRole === 'superadmin' ? 'SuperAdmin' :
                     userRole === 'doctor' ? 'Médecin' :
                     userRole === 'secretariat' ? 'Secrétariat' : 'Patient'}
                  </span>
                </div>
              </div>

              <button
                onClick={onOpenLogoutModal}
                title="Se déconnecter de la session"
                className="w-9 h-9 rounded-xl text-on-surface-variant hover:bg-rose-50 hover:text-rose-600 border border-surface-container-high transition-colors flex items-center justify-center"
              >
                <span className="material-symbols-outlined text-[19px]">logout</span>
              </button>
            </div>
          ) : (
            // Guest User (Not Logged In): Login & Register Buttons
            <div className="flex items-center gap-2">
              <button
                onClick={() => setView('login')}
                className="px-4 py-2 rounded-xl text-xs font-bold text-primary hover:bg-primary/10 transition-colors flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[18px]">login</span>
                <span>Connexion</span>
              </button>
              <button
                onClick={() => setView('patient-register')}
                className="px-4 py-2 rounded-xl bg-primary text-on-primary text-xs font-bold shadow-xs hover:bg-primary-container transition-all flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[18px]">person_add</span>
                <span className="hidden sm:inline">Créer un compte patient</span>
                <span className="sm:hidden">Inscription</span>
              </button>
            </div>
          )}

        </div>

      </div>
    </header>
  );
}
