import React from 'react';
import { useLanguage } from '../context/LanguageContext';

export default function Header({ currentView, setView, onOpenBooking }) {
  const { lang, setLang, t } = useLanguage();

  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-surface/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] border-b border-surface-container-high/60">
      <div className="h-20 w-full max-w-7xl mx-auto px-margin md:px-margin-md lg:px-margin-lg flex items-center justify-between gap-space-md">
        
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-space-lg">
          <button 
            onClick={() => setView('home')} 
            className="flex items-center gap-space-sm text-left focus:outline-none"
          >
            <div className="w-10 h-10 rounded-lg bg-primary-container text-on-primary flex items-center justify-center font-bold text-xl shadow-sm">
              <span className="material-symbols-outlined text-[24px]">health_and_safety</span>
            </div>
            <div className="flex flex-col">
              <span className="font-headline-sm text-headline-sm font-bold text-primary-container tracking-tight leading-tight">
                {t('brand')}
              </span>
              <span className="font-label-sm text-[10px] text-on-surface-variant font-medium hidden sm:inline-block">
                {t('tagline')}
              </span>
            </div>
          </button>

          {/* Navigation Items */}
          <nav className="hidden lg:flex items-center gap-space-xs p-space-xs bg-surface-container-lowest rounded-xl shadow-sm border border-surface-container-high">
            <button
              onClick={() => setView('home')}
              className={`px-space-md py-space-sm rounded-lg font-label-lg text-label-lg transition-colors ${
                currentView === 'home'
                  ? 'bg-primary-container text-on-primary font-bold'
                  : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
              }`}
            >
              Accueil
            </button>
            <button
              onClick={() => setView('doctors')}
              className={`px-space-md py-space-sm rounded-lg font-label-lg text-label-lg transition-colors ${
                currentView === 'doctors'
                  ? 'bg-primary-container text-on-primary font-bold'
                  : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
              }`}
            >
              {t('nav_find')}
            </button>
            <button
              onClick={() => setView('queue')}
              className={`px-space-md py-space-sm rounded-lg font-label-lg text-label-lg transition-colors flex items-center gap-1 ${
                currentView === 'queue'
                  ? 'bg-primary-container text-on-primary font-bold'
                  : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-secondary animate-ping"></span>
              {t('nav_queue')}
            </button>
            <button
              onClick={() => setView('onboarding')}
              className={`px-space-md py-space-sm rounded-lg font-label-lg text-label-lg transition-colors ${
                currentView === 'onboarding' || currentView === 'confirmation'
                  ? 'bg-primary-container text-on-primary font-bold'
                  : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
              }`}
            >
              {t('nav_doctors')}
            </button>
            <button
              onClick={() => setView('pricing')}
              className={`px-space-md py-space-sm rounded-lg font-label-lg text-label-lg transition-colors ${
                currentView === 'pricing'
                  ? 'bg-primary-container text-on-primary font-bold'
                  : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
              }`}
            >
              {t('nav_pricing')}
            </button>
            <button
              onClick={() => setView('prescriptions')}
              className={`px-space-md py-space-sm rounded-lg font-label-lg text-label-lg transition-colors ${
                currentView === 'prescriptions'
                  ? 'bg-primary-container text-on-primary font-bold'
                  : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
              }`}
            >
              DMP & Ordonnances
            </button>
          </nav>
        </div>

        {/* Right Section: Language Switcher & CTAs */}
        <div className="flex items-center gap-space-sm">
          
          {/* Language Switcher Toggle */}
          <div className="flex items-center bg-surface-container-low p-1 rounded-lg border border-outline-variant/40">
            <button
              onClick={() => setLang('fr')}
              className={`px-2 py-1 rounded text-xs font-bold transition-all ${
                lang === 'fr' ? 'bg-primary text-on-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              FR
            </button>
            <button
              onClick={() => setLang('ar')}
              className={`px-2 py-1 rounded text-xs font-bold transition-all ${
                lang === 'ar' ? 'bg-primary text-on-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              عربي
            </button>
            <button
              onClick={() => setLang('en')}
              className={`px-2 py-1 rounded text-xs font-bold transition-all ${
                lang === 'en' ? 'bg-primary text-on-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              EN
            </button>
          </div>

          <button
            onClick={() => onOpenBooking(null)}
            className="inline-flex items-center justify-center px-space-md md:px-space-lg py-2.5 rounded-lg bg-secondary-container text-on-secondary font-label-lg text-label-lg font-bold shadow-sm hover:bg-secondary transition-all hover:scale-[1.02]"
          >
            <span className="material-symbols-outlined text-[18px] mr-1">calendar_month</span>
            <span className="hidden sm:inline">{t('book_appointment')}</span>
            <span className="sm:hidden">Rendez-vous</span>
          </button>
        </div>

      </div>
    </header>
  );
}
