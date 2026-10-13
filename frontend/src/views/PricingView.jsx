import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';

export default function PricingView({ setView }) {
  const [isAnnual, setIsAnnual] = useState(true);
  const [openFaq, setOpenFaq] = useState(null);

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="w-full pt-20 bg-surface flex-1">
      
      {/* Top Decorative Clinic Glow */}
      <div className="relative w-full overflow-hidden">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[720px] h-[360px] bg-gradient-to-b from-primary-fixed-dim/20 via-surface-container-high/30 to-transparent blur-3xl pointer-events-none -z-10"></div>
        
        {/* Hero Header */}
        <section className="w-full px-margin md:px-margin-md lg:px-margin-lg pt-space-xl pb-space-lg max-w-7xl mx-auto flex flex-col items-center text-center">
          
          <div className="inline-flex items-center gap-space-xs px-space-md py-1 rounded-full bg-surface-container-high text-primary font-label-sm text-label-sm mb-space-md shadow-sm border border-outline-variant/30 font-semibold">
            <span className="material-symbols-outlined text-[16px]">verified</span>
            <span>TARIFS TRANSPARENTS • SANS ENGAGEMENT • CERTIFIÉ INPDP</span>
          </div>

          <h1 className="font-headline-xl text-headline-xl text-on-surface max-w-4xl tracking-tight font-extrabold">
            Des formules claires adaptées à l'exercice médical en Tunisie
          </h1>

          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mt-space-md">
            Choisissez entre la souveraineté d'un stockage local ou la sérénité absolue du cloud médical certifié HDS. Essai gratuit de 30 jours sans carte bancaire.
          </p>

          {/* Billing Frequency Segmented Switch */}
          <div className="mt-space-xl flex items-center justify-center p-1.5 rounded-full bg-surface-container-high shadow-inner gap-1 border border-surface-container-highest">
            <button 
              onClick={() => setIsAnnual(false)}
              className={`px-space-lg py-2.5 rounded-full font-label-lg text-label-lg transition-all ${
                !isAnnual ? 'bg-surface-container-lowest text-primary shadow-sm font-bold' : 'text-on-surface-variant hover:text-on-surface'
              }`}
              type="button"
            >
              <span>Paiement mensuel</span>
            </button>
            <button 
              onClick={() => setIsAnnual(true)}
              className={`px-space-lg py-2.5 rounded-full font-label-lg text-label-lg transition-all flex items-center gap-2 ${
                isAnnual ? 'bg-surface-container-lowest text-primary shadow-sm font-bold' : 'text-on-surface-variant hover:text-on-surface'
              }`}
              type="button"
            >
              <span>Facturation annuelle</span>
              <span className="px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary font-label-sm text-label-sm font-bold tracking-tight">
                -20% d'économie
              </span>
            </button>
          </div>

          {/* Quick Context Micro-bar */}
          <div className="flex flex-wrap items-center justify-center gap-x-space-lg gap-y-space-xs mt-space-md font-label-sm text-label-sm text-outline">
            <span className="inline-flex items-center gap-1">
              <span className="material-symbols-outlined text-primary text-[15px]">lock_reset</span>
              Chiffrement AES-256
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="material-symbols-outlined text-primary text-[15px]">receipt_long</span>
              Feuilles &amp; bordereaux CNAM inclus
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="material-symbols-outlined text-primary text-[15px]">support_agent</span>
              Assistance locale en Tunisie
            </span>
          </div>
        </section>

        {/* Pricing Cards Section */}
        <section className="w-full px-margin md:px-margin-md lg:px-margin-lg pb-space-xl max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-gutter-lg items-stretch">
            
            {/* CARD 1: Local Storage Plan */}
            <div className="flex flex-col justify-between p-space-xl rounded-xl bg-surface-container-lowest shadow-sm hover:shadow-md transition-shadow relative border border-surface-container-high">
              <div className="absolute top-0 left-0 right-0 h-1.5 rounded-t-xl bg-outline-variant"></div>
              <div>
                <div className="flex items-center justify-between gap-space-sm mb-space-md">
                  <span className="px-3 py-1 rounded-full bg-surface-container text-on-surface-variant font-label-sm text-label-sm">
                    Pour cabinets avec infrastructure existante
                  </span>
                  <span className="inline-flex items-center gap-1 font-label-sm text-label-sm text-outline">
                    <span className="material-symbols-outlined text-[16px]">hard_drive</span>
                    On-premise
                  </span>
                </div>

                <h2 className="font-headline-lg text-headline-lg text-on-surface font-bold">Stockage Local</h2>
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                  Vos données restent stockées directement au sein de votre cabinet sur votre machine ou serveur local.
                </p>

                <div className="mt-space-lg p-space-md rounded-lg bg-surface-container-low flex flex-col justify-center border border-surface-container-high">
                  <div className="flex items-baseline gap-space-xs">
                    <span className="font-headline-xl text-headline-xl text-primary font-extrabold tracking-tight">
                      {isAnnual ? '55' : '69'}
                    </span>
                    <span className="font-headline-sm text-headline-sm text-on-surface font-semibold">TND</span>
                    <span className="font-body-sm text-body-sm text-on-surface-variant">/ mois</span>
                  </div>
                  <span className="font-label-sm text-label-sm text-outline mt-1">
                    {isAnnual ? 'Facturé annuellement (660 TND / an). Données hébergées sur votre poste.' : 'Facturé mensuellement sans engagement. Résiliable à tout moment.'}
                  </span>
                </div>

                <div className="mt-space-lg space-y-space-sm">
                  <div className="font-label-md text-label-md text-on-surface font-bold uppercase tracking-wider">Ce qui est inclus :</div>
                  <ul className="space-y-space-sm">
                    <li className="flex items-start gap-space-sm">
                      <div className="w-5 h-5 rounded-full bg-surface-container-high text-primary flex items-center justify-center shrink-0 mt-0.5 font-bold">✓</div>
                      <span className="font-body-sm text-body-sm text-on-surface">Données patients stockées sur votre poste / serveur local (souveraineté totale)</span>
                    </li>
                    <li className="flex items-start gap-space-sm">
                      <div className="w-5 h-5 rounded-full bg-surface-container-high text-primary flex items-center justify-center shrink-0 mt-0.5 font-bold">✓</div>
                      <span className="font-body-sm text-body-sm text-on-surface">Sauvegardes manuelles sur clé USB / NAS sous votre responsabilité</span>
                    </li>
                    <li className="flex items-start gap-space-sm">
                      <div className="w-5 h-5 rounded-full bg-surface-container-high text-primary flex items-center justify-center shrink-0 mt-0.5 font-bold">✓</div>
                      <span className="font-body-sm text-body-sm text-on-surface"><strong>Toutes fonctionnalités cliniques</strong> (Agenda intelligent, Dossier patient, Ordonnances FR/AR)</span>
                    </li>
                    <li className="flex items-start gap-space-sm">
                      <div className="w-5 h-5 rounded-full bg-surface-container-high text-primary flex items-center justify-center shrink-0 mt-0.5 font-bold">✓</div>
                      <span className="font-body-sm text-body-sm text-on-surface">Facturation CNAM normalisée &amp; timbres fiscaux tunisiens</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="mt-space-xl pt-space-lg">
                <button onClick={() => setView('onboarding')} className="w-full h-11 flex items-center justify-center rounded-lg bg-surface-container text-primary font-label-lg text-label-lg font-bold hover:bg-surface-container-high transition-colors shadow-sm text-center">
                  Commencer en Local (30j gratuits)
                </button>
              </div>
            </div>

            {/* CARD 2: Cloud HDS Plan */}
            <div className="flex flex-col justify-between p-space-xl rounded-xl bg-surface-container-lowest shadow-xl relative overflow-hidden border border-primary">
              <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-primary via-primary-container to-secondary-container"></div>
              <div>
                <div className="flex items-center justify-between gap-space-sm mb-space-md">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary-container text-on-secondary font-label-sm text-label-sm font-bold shadow-sm">
                    <span className="material-symbols-outlined text-[16px]">stars</span>
                    RECOMMANDÉ POUR LES CABINETS EN TUNISIE
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-surface-container-high text-primary font-label-sm text-label-sm font-bold">
                    Certifié HDS
                  </span>
                </div>

                <h2 className="font-headline-lg text-headline-lg text-on-surface font-bold">Cloud HDS Sécurisé</h2>
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                  Zéro gestion technique. Vos dossiers sauvegardés en continu, synchronisés en temps réel avec votre secrétariat.
                </p>

                <div className="mt-space-lg p-space-md rounded-lg bg-surface-container-high/60 flex flex-col justify-center border border-surface-container-highest">
                  <div className="flex items-baseline gap-space-xs">
                    <span className="font-headline-xl text-headline-xl text-primary font-extrabold tracking-tight">
                      {isAnnual ? '95' : '119'}
                    </span>
                    <span className="font-headline-sm text-headline-sm text-on-surface font-semibold">TND</span>
                    <span className="font-body-sm text-body-sm text-on-surface-variant">/ mois</span>
                  </div>
                  <span className="font-label-sm text-label-sm text-primary font-medium mt-1">
                    {isAnnual ? 'Facturé annuellement (1 140 TND / an). Sérénité totale avec sauvegarde continue.' : 'Facturé mensuellement sans engagement. Résiliable à tout moment.'}
                  </span>
                </div>

                <div className="mt-space-lg space-y-space-sm">
                  <div className="font-label-md text-label-md text-primary font-bold uppercase tracking-wider">
                    Tout ce qui est dans Local Storage, plus :
                  </div>
                  <ul className="space-y-space-sm">
                    <li className="flex items-start gap-space-sm">
                      <div className="w-5 h-5 rounded-full bg-primary text-on-primary flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">✓</div>
                      <span className="font-body-sm text-body-sm text-on-surface"><strong>Hébergement Cloud HDS souverain</strong> : conforme à la réglementation INPDP Tunisie</span>
                    </li>
                    <li className="flex items-start gap-space-sm">
                      <div className="w-5 h-5 rounded-full bg-primary text-on-primary flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">✓</div>
                      <span className="font-body-sm text-body-sm text-on-surface"><strong>Sauvegardes automatiques en temps réel</strong> chiffrées sur 3 centres de données sécurisés</span>
                    </li>
                    <li className="flex items-start gap-space-sm">
                      <div className="w-5 h-5 rounded-full bg-primary text-on-primary flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">✓</div>
                      <span className="font-body-sm text-body-sm text-on-surface"><strong>Accès multi-appareils sécurisé</strong> (PC du cabinet, tablette tactile, smartphone, domicile)</span>
                    </li>
                    <li className="flex items-start gap-space-sm">
                      <div className="w-5 h-5 rounded-full bg-primary text-on-primary flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">✓</div>
                      <span className="font-body-sm text-body-sm text-on-surface"><strong>Synchronisation instantanée</strong> cabinet ↔ poste secrétaire ↔ salle d'attente</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="mt-space-xl pt-space-lg">
                <button onClick={() => setView('onboarding')} className="w-full h-11 flex items-center justify-center rounded-lg bg-primary hover:bg-primary-container text-on-primary font-label-lg text-label-lg font-bold transition-colors shadow-md text-center">
                  Démarrer l'essai Cloud (30j gratuits)
                </button>
              </div>
            </div>

          </div>
        </section>
      </div>

      {/* Medical Practice Context Bar */}
      <section className="w-full bg-surface-container-low py-space-xl px-margin md:px-margin-md lg:px-margin-lg border-y border-surface-container-high">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-gutter-md">
          <div className="p-space-lg rounded-xl bg-surface-container-lowest shadow-sm flex flex-col gap-space-sm border border-surface-container-high">
            <div className="w-10 h-10 rounded-lg bg-surface-container text-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-[24px]">verified_user</span>
            </div>
            <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">Conformité INPDP &amp; RGPD</h3>
            <p className="font-body-sm text-body-sm text-on-surface-variant">Respect scrupuleux de la loi organique tunisienne n° 2004-63 sur la protection des données personnelles médicales.</p>
          </div>
          <div className="p-space-lg rounded-xl bg-surface-container-lowest shadow-sm flex flex-col gap-space-sm border border-surface-container-high">
            <div className="w-10 h-10 rounded-lg bg-surface-container text-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-[24px]">sync_saved_locally</span>
            </div>
            <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">Migration Clé en Main</h3>
            <p className="font-body-sm text-body-sm text-on-surface-variant">Nos ingénieurs importent gratuitement vos anciens fichiers Excel, dossiers papier numérisés ou ancien logiciel médical.</p>
          </div>
          <div className="p-space-lg rounded-xl bg-surface-container-lowest shadow-sm flex flex-col gap-space-sm border border-surface-container-high">
            <div className="w-10 h-10 rounded-lg bg-surface-container text-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-[24px]">headset_mic</span>
            </div>
            <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">Assistance Clinique Locale</h3>
            <p className="font-body-sm text-body-sm text-on-surface-variant">Équipe basée à Tunis, Sousse et Sfax disponible par téléphone et WhatsApp pour vos secrétaires et assistants.</p>
          </div>
        </div>
      </section>

      {/* Detailed Feature Comparison Matrix */}
      <section className="w-full px-margin md:px-margin-md lg:px-margin-lg py-space-xl max-w-7xl mx-auto">
        <div className="flex flex-col items-center text-center mb-space-xl">
          <span className="px-space-md py-1 rounded-full bg-surface-container-high text-primary font-label-sm text-label-sm mb-space-xs font-semibold">
            ANALYSE COMPARATIVE
          </span>
          <h2 className="font-headline-xl text-headline-xl text-on-surface font-bold">Comparatif détaillé des fonctionnalités</h2>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-xl mt-1">Visualisez point par point les caractéristiques de chaque formule pour votre cabinet.</p>
        </div>

        <div className="w-full overflow-x-auto rounded-xl bg-surface-container-lowest shadow-sm border border-surface-container-high">
          <table className="w-full text-left border-collapse min-w-[640px]">
            <thead>
              <tr className="bg-surface-container-high/70 text-on-surface">
                <th className="p-space-md font-headline-sm text-headline-sm w-1/2">Fonctionnalités &amp; Spécifications</th>
                <th className="p-space-md font-headline-sm text-headline-sm text-center w-1/4">Stockage Local</th>
                <th className="p-space-md font-headline-sm text-headline-sm text-center w-1/4 bg-primary text-on-primary rounded-t-lg">Cloud HDS Sécurisé</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container">
              <tr className="bg-surface-container-low/60">
                <td className="px-space-md py-space-sm font-label-lg text-label-lg text-primary font-bold uppercase tracking-wider" colSpan="3">
                  Gestion Clinique &amp; Agenda Cabinet
                </td>
              </tr>
              <tr className="hover:bg-surface-container-low transition-colors">
                <td className="p-space-md font-body-sm text-body-sm text-on-surface">Agenda partagé médecin &amp; secrétariat</td>
                <td className="p-space-md text-center"><span class="material-symbols-outlined text-primary text-[20px]">check_circle</span></td>
                <td className="p-space-md text-center bg-surface-container-high/30"><span class="material-symbols-outlined text-primary text-[20px]">check_circle</span></td>
              </tr>
              <tr className="hover:bg-surface-container-low transition-colors">
                <td className="p-space-md font-body-sm text-body-sm text-on-surface">Dossier médical patient &amp; historique clinique</td>
                <td className="p-space-md text-center"><span class="material-symbols-outlined text-primary text-[20px]">check_circle</span></td>
                <td className="p-space-md text-center bg-surface-container-high/30"><span class="material-symbols-outlined text-primary text-[20px]">check_circle</span></td>
              </tr>
              <tr className="hover:bg-surface-container-low transition-colors">
                <td className="p-space-md font-body-sm text-body-sm text-on-surface">Édition d'ordonnances bilingues (Français / العربية)</td>
                <td className="p-space-md text-center"><span class="material-symbols-outlined text-primary text-[20px]">check_circle</span></td>
                <td className="p-space-md text-center bg-surface-container-high/30"><span class="material-symbols-outlined text-primary text-[20px]">check_circle</span></td>
              </tr>
              <tr className="hover:bg-surface-container-low transition-colors">
                <td className="p-space-md font-body-sm text-body-sm text-on-surface">Feuille de soins &amp; bordereaux CNAM normalisés</td>
                <td className="p-space-md text-center"><span class="material-symbols-outlined text-primary text-[20px]">check_circle</span></td>
                <td className="p-space-md text-center bg-surface-container-high/30"><span class="material-symbols-outlined text-primary text-[20px]">check_circle</span></td>
              </tr>
              <tr className="bg-surface-container-low/60">
                <td className="px-space-md py-space-sm font-label-lg text-label-lg text-primary font-bold uppercase tracking-wider" colSpan="3">
                  Stockage &amp; Infrastructure Données
                </td>
              </tr>
              <tr className="hover:bg-surface-container-low transition-colors">
                <td className="p-space-md font-body-sm text-body-sm text-on-surface">Sauvegardes automatiques journalières sécurisées</td>
                <td className="p-space-md text-center font-label-sm text-label-sm text-outline">Manuelles (USB/NAS)</td>
                <td className="p-space-md text-center font-label-sm text-label-sm text-primary font-bold bg-surface-container-high/30">Automatiques (3 sites distants)</td>
              </tr>
              <tr className="hover:bg-surface-container-low transition-colors">
                <td className="p-space-md font-body-sm text-body-sm text-on-surface">Accès distant (depuis domicile ou smartphone)</td>
                <td className="p-space-md text-center font-label-sm text-label-sm text-outline">Réseau local seul</td>
                <td className="p-space-md text-center bg-surface-container-high/30"><span class="material-symbols-outlined text-primary text-[20px]">check_circle</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* FAQ Accordion Section */}
      <section className="w-full px-margin md:px-margin-md lg:px-margin-lg py-space-xl max-w-4xl mx-auto">
        <div className="text-center mb-space-lg">
          <span className="px-space-md py-1 rounded-full bg-surface-container-high text-primary font-label-sm text-label-sm font-semibold">
            RÉPONSES PRATIQUES
          </span>
          <h2 className="font-headline-xl text-headline-xl text-on-surface font-bold mt-space-xs">Questions fréquentes des médecins</h2>
        </div>

        <div className="space-y-space-sm">
          {[
            { q: "Que se passe-t-il si j'arrête mon abonnement ou si je tarde à payer ?", a: "Vos données médicales restent strictement et inconditionnellement votre propriété. En plan Local, vous conservez vos fichiers sur votre ordinateur. En plan Cloud, nous vous fournissons une archive chiffrée sous 48h." },
            { q: "Qu'est-ce que l'hébergement certifié HDS et pourquoi est-il important en Tunisie ?", a: "La certification HDS (Hébergeur de Données de Santé) garantit des serveurs répondant aux normes médicales INPDP pour protéger les dossiers contre pannes ou cyberattaques." },
            { q: "Puis-je changer de formule à tout moment (passer du Local au Cloud) ?", a: "Oui, en un clic. L'assistant de migration synchronise automatiquement la base locale vers le cloud sans interruption de vos consultations." },
            { q: "La facturation CNAM et la réglementation fiscale tunisienne sont-elles prises en charge ?", a: "Absolument. MediDesk intègre les grilles d'actes tunisiennes, la gestion des filières CNAM (AP1/AP2), et l'application automatique du timbre fiscal." }
          ].map((faq, idx) => (
            <div key={idx} className="rounded-xl bg-surface-container-lowest shadow-sm overflow-hidden border border-surface-container-high">
              <button 
                onClick={() => toggleFaq(idx)}
                className="w-full p-space-lg text-left flex items-center justify-between gap-space-md focus:outline-none" 
                type="button"
              >
                <span className="font-headline-sm text-headline-sm text-on-surface font-bold">{faq.q}</span>
                <span className={`material-symbols-outlined text-primary text-[24px] transition-transform ${openFaq === idx ? 'rotate-180' : ''}`}>
                  expand_more
                </span>
              </button>
              {openFaq === idx && (
                <div className="px-space-lg pb-space-lg font-body-sm text-body-sm text-on-surface-variant leading-relaxed border-t border-surface-container-low pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Bottom Conversion Banner */}
      <section className="w-full px-margin md:px-margin-md lg:px-margin-lg pb-space-xl pt-space-lg max-w-7xl mx-auto">
        <div className="w-full rounded-2xl bg-gradient-to-br from-primary-container via-primary to-primary text-on-primary p-space-xl relative overflow-hidden shadow-xl">
          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-gutter-lg">
            <div className="max-w-2xl text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container-lowest/15 backdrop-blur-md text-on-primary-container font-label-sm text-label-sm mb-space-md">
                <span className="material-symbols-outlined text-[16px]">local_hospital</span>
                DÉPLOIEMENT RAPIDE EN CABINET
              </div>
              <h2 className="font-headline-xl text-headline-xl font-bold tracking-tight text-on-primary">
                Prêt à moderniser votre cabinet médical ?
              </h2>
              <p className="font-body-lg text-body-lg text-on-primary/90 mt-space-sm max-w-xl">
                Rejoignez plus de 650 médecins et cliniques en Tunisie. Configuration personnalisée en 15 minutes et accompagnement gratuit.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row lg:flex-col gap-space-md w-full sm:w-auto shrink-0 z-10">
              <button onClick={() => setView('onboarding')} className="h-12 px-space-xl rounded-lg bg-secondary-container text-on-secondary font-label-lg text-label-lg font-bold flex items-center justify-center shadow-lg hover:bg-secondary transition-colors text-center">
                Déposer ma demande d'adhésion
              </button>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
