import React from 'react';
import { useLanguage } from '../context/LanguageContext';

export default function Footer({ setView, className = '' }) {
  const { lang, setLang } = useLanguage();

  return (
    <footer className={`w-full bg-surface-container-low pt-8 pb-6 border-t border-surface-container-high mt-auto transition-all duration-300 ${className}`}>
      <div className="w-full px-4 md:px-6 lg:px-8 max-w-7xl mx-auto">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 pb-8">
          
          <div className="lg:col-span-2 flex flex-col gap-4 pr-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary-container text-on-primary flex items-center justify-center font-bold text-lg">
                <span className="material-symbols-outlined text-[20px]">health_and_safety</span>
              </div>
              <span className="font-headline-sm text-headline-sm font-bold text-primary-container tracking-tight">MediDesk</span>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant max-w-sm">
              Ergonomie de santé unifiée pour cabinets privés, polycliniques et patients à travers la Tunisie. L'efficacité médicale alliée à l'empathie clinique.
            </p>
            <div className="flex items-center gap-2 p-2 rounded-lg bg-surface max-w-xs border border-surface-container-high">
              <span className="material-symbols-outlined text-primary text-[20px]">verified_user</span>
              <span className="font-label-sm text-label-sm text-on-surface-variant">Conforme INPDP • Certifié Protocole National Santé</span>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <span className="font-label-lg text-label-lg text-on-surface font-semibold">Portail Patient</span>
            <button onClick={() => setView('patient-dashboard')} className="text-left font-body-sm text-body-sm text-on-surface-variant hover:text-primary transition-colors">Mon Tableau de Bord</button>
            <button onClick={() => setView('express-booking')} className="text-left font-body-sm text-body-sm text-on-surface-variant hover:text-primary transition-colors">RDV Express (1-Clic)</button>
            <button onClick={() => setView('patient-queue-tracker')} className="text-left font-body-sm text-body-sm text-on-surface-variant hover:text-primary transition-colors">Suivi de File en Direct</button>
            <button onClick={() => setView('patient-register')} className="text-left font-body-sm text-body-sm text-on-surface-variant hover:text-primary transition-colors">Créer un compte Patient</button>
            <button onClick={() => setView('suggest-doctor')} className="text-left font-body-sm text-body-sm text-on-surface-variant hover:text-primary transition-colors">Suggérer un praticien</button>
          </div>

          <div className="flex flex-col gap-2">
            <span className="font-label-lg text-label-lg text-on-surface font-semibold">Médecins & Offres</span>
            <button onClick={() => setView('doctors')} className="text-left font-body-sm text-body-sm text-on-surface-variant hover:text-primary transition-colors">Trouver un Médecin</button>
            <button onClick={() => setView('doctor-profile')} className="text-left font-body-sm text-body-sm text-on-surface-variant hover:text-primary transition-colors">Dr. Karim Ben Mahmoud</button>
            <button onClick={() => setView('login')} className="text-left font-body-sm text-body-sm text-on-surface-variant hover:text-primary transition-colors">Connexion Praticien / Patient</button>
            <button onClick={() => setView('pricing')} className="text-left font-body-sm text-body-sm text-on-surface-variant hover:text-primary transition-colors">Tarifs & Offres</button>
            <button onClick={() => setView('style-guide')} className="text-left font-body-sm text-body-sm text-on-surface-variant hover:text-primary transition-colors">Design System UI Kit</button>
          </div>

          <div className="flex flex-col gap-4">
            <span className="font-label-lg text-label-lg text-on-surface font-semibold">Langue / Context</span>
            <div className="inline-flex items-center p-1 rounded-lg bg-surface-container gap-1 w-fit">
              <button onClick={() => setLang('fr')} className={`px-2 py-1 rounded font-label-sm text-label-sm ${lang === 'fr' ? 'bg-surface text-primary font-bold shadow-sm' : 'text-on-surface-variant'}`}>FR</button>
              <button onClick={() => setLang('ar')} className={`px-2 py-1 rounded font-label-sm text-label-sm ${lang === 'ar' ? 'bg-surface text-primary font-bold shadow-sm' : 'text-on-surface-variant'}`}>عربي</button>
              <button onClick={() => setLang('en')} className={`px-2 py-1 rounded font-label-sm text-label-sm ${lang === 'en' ? 'bg-surface text-primary font-bold shadow-sm' : 'text-on-surface-variant'}`}>EN</button>
            </div>
            <p className="font-label-sm text-label-sm text-outline">Passez instantanément de l'arabe au français et à l'anglais.</p>
          </div>

        </div>

        <div className="pt-4 border-t border-surface-container-high flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="font-label-sm text-label-sm text-outline">© 2025 MediDesk Tunisie. Tous droits réservés.</span>
          <div className="flex items-center gap-4">
            <span className="font-label-sm text-label-sm text-outline">Conformité Loi INPDP n° 2004-63</span>
            <span className="font-label-sm text-label-sm text-outline">Hébergement Santé HDS Certifié</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
