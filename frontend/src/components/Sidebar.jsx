import React from 'react';

export default function Sidebar({
  currentView,
  setView,
  currentUser,
  isCollapsed,
  setIsCollapsed,
  isMobileOpen,
  setIsMobileOpen,
  onOpenLogoutModal
}) {
  const role = currentUser?.role || 'guest';

  // Define navigation sections and items per role
  const getNavSections = () => {
    switch (role) {
      case 'doctor':
        return [
          {
            title: 'Cabinet & Clinique',
            items: [
              { id: 'tableau-de-bord-medecin', label: 'Tableau de bord', icon: 'dashboard' },
              { id: 'consultation-examen', label: 'Examen Clinique', icon: 'stethoscope' },
              { id: 'dossier-medical-complet', label: 'Dossier Médical (EMR)', icon: 'folder_shared' },
              { id: 'redaction-ordonnance', label: 'Ordonnances Sécurisées', icon: 'prescriptions' },
              { id: 'generateur-certificats', label: 'Certificats Médicaux', icon: 'license' },
            ]
          },
          {
            title: 'Patients & Planning',
            items: [
              { id: 'annuaire-patients-medecin', label: 'Annuaire Patients', icon: 'contacts' },
              { id: 'agenda-consultations-medecin', label: 'Agenda & Planning', icon: 'calendar_month' },
              { id: 'declaration-retard', label: 'Gestion des Retards', icon: 'schedule' },
              { id: 'suivi-fenetre-priorite', label: 'File & Priorité Directe', icon: 'timelapse', badge: 'Live', badgeColor: 'bg-emerald-500' },
              { id: 'ocr-import-medical', label: 'Numérisation OCR', icon: 'document_scanner' },
            ]
          },
          {
            title: 'Administration & Équipe',
            items: [
              { id: 'gestion-equipe-secretariat-medecin', label: 'Équipe & Secrétariat', icon: 'support_agent' },
              { id: 'statistiques-honoraires-medecin', label: 'Honoraires & CNAM', icon: 'payments' },
              { id: 'abonnement-facturation-medecin', label: 'Abonnement & Forfait', icon: 'credit_card' },
              { id: 'securite-compte-medecin', label: 'Sécurité & Accès 2FA', icon: 'verified_user' },
            ]
          }
        ];

      case 'secretariat':
        return [
          {
            title: 'Accueil & File d\'attente',
            items: [
              { id: 'tableau-de-bord', label: 'Tableau de bord', icon: 'dashboard' },
              { id: 'admission-patient', label: 'Admission Patient', icon: 'person_add' },
              { id: 'dossier-patient-sec', label: 'Dossiers Patients', icon: 'folder_open' },
              { id: 'planning-rendez-vous', label: 'Planning & Agenda', icon: 'calendar_today' },
              { id: 'salle-attente', label: 'Salle d\'Attente', icon: 'chair', badge: 'Direct', badgeColor: 'bg-indigo-500' },
              { id: 'validation-reservations', label: 'Validation Réservations', icon: 'how_to_reg' },
            ]
          },
          {
            title: 'Caisse & Comptabilité',
            items: [
              { id: 'encaissement-facturation', label: 'Encaissement POS', icon: 'point_of_sale' },
              { id: 'cloture-caisse', label: 'Arrêt Z de Caisse', icon: 'receipt_long' },
              { id: 'parametres-secretariat', label: 'Paramètres & Sécurité', icon: 'lock' },
            ]
          }
        ];

      case 'superadmin':
        return [
          {
            title: 'Tour de Contrôle',
            items: [
              { id: 'superadmin', label: 'Tour de Contrôle', icon: 'admin_panel_settings' },
              { id: 'candidatures-superadmin', label: 'Candidatures CNOM', icon: 'assignment_turned_in', badge: '14', badgeColor: 'bg-amber-500' },
              { id: 'annuaire-medecins-superadmin', label: 'Médecins & Cabinets', icon: 'stethoscope' },
            ]
          },
          {
            title: 'Finances & Supervision',
            items: [
              { id: 'supervision-facturation-superadmin', label: 'Facturation SaaS', icon: 'price_change' },
              { id: 'tarification-forfaits-superadmin', label: 'Forfaits & Tarifs', icon: 'sell' },
              { id: 'analytique-performance-superadmin', label: 'Télémétrie HDS', icon: 'monitoring' },
            ]
          },
          {
            title: 'Gouvernance & Sécurité',
            items: [
              { id: 'suggestions-praticiens-superadmin', label: 'Suggestions Médecins', icon: 'lightbulb' },
              { id: 'equipe-admin-superadmin', label: 'Équipe SuperAdmin', icon: 'group' },
              { id: 'securite-superadmin', label: 'Logs de Sécurité', icon: 'security' },
            ]
          }
        ];

      case 'patient':
        return [
          {
            title: 'Mon Espace Santé',
            items: [
              { id: 'patient-dashboard', label: 'Accueil Patient', icon: 'health_and_safety' },
              { id: 'patient-medical-record', label: 'Mon Dossier Médical', icon: 'medical_services' },
              { id: 'patient-document-upload', label: 'Mes Documents', icon: 'upload_file' },
              { id: 'patient-queue-tracker', label: 'Suivi File en Direct', icon: 'live_tv', badge: 'En cours', badgeColor: 'bg-primary' },
              { id: 'patient-notifications', label: 'Notifications', icon: 'notifications', badge: '3', badgeColor: 'bg-rose-500' },
            ]
          },
          {
            title: 'Services & Compte',
            items: [
              { id: 'suggest-doctor', label: 'Recommander un Médecin', icon: 'recommend' },
              { id: 'patient-account-settings', label: 'Sécurité & Compte', icon: 'manage_accounts' },
            ]
          }
        ];

      default:
        // Guest / Public Visitor Navigation
        return [
          {
            title: 'Navigation Générale',
            items: [
              { id: 'home', label: 'Accueil', icon: 'home' },
              { id: 'doctors', label: 'Trouver un Médecin', icon: 'stethoscope' },
              { id: 'pricing', label: 'Tarifs & Forfaits', icon: 'credit_card' },
              { id: 'patient-queue-tracker', label: 'Suivi Ticket en Direct', icon: 'live_tv', badge: 'Live', badgeColor: 'bg-secondary' },
            ]
          },
          {
            title: 'Accès Plateforme',
            items: [
              { id: 'login', label: 'Connexion Sécurisée', icon: 'login' },
              { id: 'patient-register', label: 'Créer compte Patient', icon: 'person_add' },
            ]
          }
        ];
    }
  };

  const sections = getNavSections();

  const getRoleTheme = () => {
    switch (role) {
      case 'superadmin':
        return {
          accent: 'bg-amber-600',
          badgeText: 'SuperAdmin Master',
          activeBg: 'bg-amber-600 text-white',
          hoverBg: 'hover:bg-amber-50 dark:hover:bg-amber-950/20 text-on-surface hover:text-amber-700',
        };
      case 'doctor':
        return {
          accent: 'bg-teal-700',
          badgeText: 'Espace Praticien',
          activeBg: 'bg-primary text-on-primary',
          hoverBg: 'hover:bg-teal-50 dark:hover:bg-teal-950/20 text-on-surface hover:text-primary',
        };
      case 'secretariat':
        return {
          accent: 'bg-indigo-600',
          badgeText: 'Secrétariat Médical',
          activeBg: 'bg-indigo-600 text-white',
          hoverBg: 'hover:bg-indigo-50 dark:hover:bg-indigo-950/20 text-on-surface hover:text-indigo-700',
        };
      case 'patient':
        return {
          accent: 'bg-emerald-600',
          badgeText: 'Portail Patient',
          activeBg: 'bg-primary text-on-primary',
          hoverBg: 'hover:bg-emerald-50 dark:hover:bg-emerald-950/20 text-on-surface hover:text-emerald-700',
        };
      default:
        return {
          accent: 'bg-primary',
          badgeText: 'Portail Public',
          activeBg: 'bg-primary text-on-primary',
          hoverBg: 'hover:bg-primary/10 text-on-surface hover:text-primary',
        };
    }
  };

  const theme = getRoleTheme();

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isMobileOpen && (
        <div
          onClick={() => setIsMobileOpen(false)}
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs md:hidden transition-opacity"
        />
      )}

      {/* Main Sidebar Element */}
      <aside
        className={`fixed top-16 bottom-0 left-0 z-40 flex flex-col bg-surface-container-lowest/95 backdrop-blur-xl border-r border-surface-container-high transition-all duration-300 shadow-sm ${
          isCollapsed ? 'w-20' : 'w-64'
        } ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Workspace Identity Header */}
        <div className={`p-4 border-b border-surface-container-high flex items-center justify-between gap-3 ${isCollapsed ? 'justify-center' : ''}`}>
          {!isCollapsed && (
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white shrink-0 shadow-xs ${theme.accent}`}>
                <span className="material-symbols-outlined text-[20px]">
                  {role === 'superadmin' ? 'admin_panel_settings' :
                   role === 'doctor' ? 'stethoscope' :
                   role === 'secretariat' ? 'support_agent' :
                   role === 'patient' ? 'health_and_safety' : 'local_hospital'}
                </span>
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-bold text-on-surface truncate">
                  {currentUser ? currentUser.name : 'MediDesk Tunisie'}
                </span>
                <span className="text-[10px] uppercase font-semibold text-on-surface-variant truncate">
                  {theme.badgeText}
                </span>
              </div>
            </div>
          )}

          {/* Toggle Sidebar Collapse Button (Desktop) */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden md:flex p-1.5 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors items-center justify-center shrink-0"
            title={isCollapsed ? 'Agrandir la barre latérale' : 'Réduire la barre latérale'}
          >
            <span className="material-symbols-outlined text-[20px]">
              {isCollapsed ? 'menu_open' : 'menu'}
            </span>
          </button>
        </div>

        {/* Scrollable Navigation Items */}
        <div className="flex-1 overflow-y-auto py-3 px-3 space-y-5 scrollbar-thin">
          {sections.map((section, sIdx) => (
            <div key={sIdx} className="space-y-1">
              {!isCollapsed && (
                <div className="px-3 pb-1 text-[10px] font-extrabold uppercase tracking-wider text-outline select-none">
                  {section.title}
                </div>
              )}

              {section.items.map((item) => {
                const isActive = currentView === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setView(item.id);
                      setIsMobileOpen(false);
                    }}
                    title={isCollapsed ? item.label : undefined}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group relative ${
                      isActive
                        ? `${theme.activeBg} shadow-xs font-bold`
                        : `${theme.hoverBg}`
                    } ${isCollapsed ? 'justify-center px-0' : ''}`}
                  >
                    {/* Material Icon */}
                    <span
                      className={`material-symbols-outlined text-[20px] shrink-0 transition-transform group-hover:scale-110 ${
                        isActive ? 'text-inherit' : 'text-on-surface-variant group-hover:text-inherit'
                      }`}
                    >
                      {item.icon}
                    </span>

                    {/* Label & Badges */}
                    {!isCollapsed && (
                      <div className="flex-1 flex items-center justify-between text-left truncate">
                        <span className="truncate">{item.label}</span>
                        {item.badge && (
                          <span
                            className={`ml-2 px-1.5 py-0.5 rounded-full text-[10px] font-bold text-white shrink-0 ${
                              item.badgeColor || 'bg-primary'
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Compact Mode Tooltip when collapsed */}
                    {isCollapsed && (
                      <div className="absolute left-full ml-2 px-2.5 py-1.5 bg-neutral-900 text-white text-[11px] font-semibold rounded-lg shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap">
                        {item.label}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* Sidebar Footer: System Status & User Actions */}
        <div className={`p-3 border-t border-surface-container-high bg-surface-container-low/50 ${isCollapsed ? 'text-center' : ''}`}>
          {!isCollapsed ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between px-2 text-[10px] text-on-surface-variant font-medium">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  Réseau HDS Tunisie
                </span>
                <span className="font-semibold text-primary">v2.4 Pro</span>
              </div>

              {currentUser ? (
                <button
                  onClick={onOpenLogoutModal}
                  className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 border border-rose-200/60 dark:border-rose-900/30 transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">logout</span>
                  <span>Se déconnecter</span>
                </button>
              ) : (
                <button
                  onClick={() => {
                    setView('login');
                    setIsMobileOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold bg-primary text-on-primary shadow-xs hover:bg-primary-container transition-all"
                >
                  <span className="material-symbols-outlined text-[18px]">login</span>
                  <span>Connexion Sécurisée</span>
                </button>
              )}
            </div>
          ) : (
            currentUser ? (
              <button
                onClick={onOpenLogoutModal}
                title="Se déconnecter"
                className="w-10 h-10 mx-auto rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 flex items-center justify-center transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">logout</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  setView('login');
                  setIsMobileOpen(false);
                }}
                title="Connexion"
                className="w-10 h-10 mx-auto rounded-lg text-primary hover:bg-primary/10 flex items-center justify-center transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">login</span>
              </button>
            )
          )}
        </div>
      </aside>
    </>
  );
}
