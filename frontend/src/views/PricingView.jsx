import React, { useState, useEffect } from 'react';
import { fetchPricingPlans } from '../services/api';

export default function PricingView({ setView }) {
  const [plans, setPlans] = useState([]);
  const [isAnnual, setIsAnnual] = useState(true);
  const [patientsPerDay, setPatientsPerDay] = useState(25);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPricing();
  }, []);

  const loadPricing = async () => {
    try {
      const res = await fetchPricingPlans();
      setPlans(res.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // ROI calculation based on patients per day
  const hoursSavedPerWeek = Math.round((patientsPerDay * 5 * 6) / 60); // 6 mins saved per patient
  const noShowReduction = Math.round(patientsPerDay * 0.15 * 50); // TND saved from no-shows

  return (
    <div className="w-full flex flex-col pt-24 pb-16 px-margin md:px-margin-md lg:px-margin-lg max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3 mb-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface-container-high text-primary font-label-md text-label-md font-bold uppercase tracking-wider">
          <span className="material-symbols-outlined text-[18px]">payments</span>
          <span>Tarifs Clairs & Sans Surprise</span>
        </div>
        <h1 className="font-headline-xl text-headline-xl text-on-surface font-extrabold tracking-tight">
          Investissez dans l'Efficacité de Votre Cabinet
        </h1>
        <p className="font-body-lg text-body-lg text-on-surface-variant">
          Tarification transparente en Dinars Tunisiens (TND). Choisissez la formule adaptée à votre exercice individuel ou de groupe.
        </p>

        {/* Monthly vs Annual Toggle */}
        <div className="pt-4 flex items-center justify-center gap-4">
          <span className={`font-label-md text-label-md ${!isAnnual ? 'font-bold text-on-surface' : 'text-on-surface-variant'}`}>
            Facturation Mensuelle
          </span>
          <button
            onClick={() => setIsAnnual(!isAnnual)}
            className="w-14 h-7 bg-primary rounded-full relative p-1 transition-all focus:outline-none shadow-sm"
          >
            <div className={`w-5 h-5 bg-white rounded-full shadow-md transition-all ${isAnnual ? 'ml-auto' : 'mr-auto'}`}></div>
          </button>
          <div className="flex items-center gap-1.5">
            <span className={`font-label-md text-label-md ${isAnnual ? 'font-bold text-on-surface' : 'text-on-surface-variant'}`}>
              Facturation Annuelle
            </span>
            <span className="px-2 py-0.5 rounded-full bg-secondary text-on-secondary font-label-sm text-label-sm font-bold tracking-wide animate-pulse">
              -20% Réduction
            </span>
          </div>
        </div>
      </div>

      {/* Pricing Cards Grid */}
      {loading ? (
        <div className="py-space-xl text-center font-body-lg text-on-surface-variant">
          Chargement des forfaits MediDesk...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter-md mb-16">
          {plans.map((plan) => {
            const price = isAnnual ? plan.price_annual : plan.price_monthly;
            return (
              <div
                key={plan.id}
                className={`rounded-2xl p-6 sm:p-8 flex flex-col justify-between transition-all border relative ${
                  plan.is_popular
                    ? 'bg-surface-container-lowest shadow-xl border-primary ring-2 ring-primary'
                    : 'bg-surface-container-lowest shadow-sm border-surface-container-high'
                }`}
              >
                {plan.is_popular === 1 && (
                  <div className="absolute -top-3 right-6 px-3.5 py-0.5 rounded-full bg-primary text-on-primary font-label-sm text-label-sm font-bold uppercase tracking-wider shadow-sm">
                    Choix Praticiens
                  </div>
                )}

                <div className="space-y-4">
                  <div className="space-y-1">
                    <h3 className="font-headline-md text-headline-md font-bold text-on-surface">{plan.name}</h3>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">{plan.description}</p>
                  </div>

                  <div className="py-2 border-y border-surface-container-low flex items-baseline gap-1">
                    <span className="font-headline-xl text-[2.75rem] font-extrabold text-primary tracking-tight">{price}</span>
                    <span className="font-headline-sm text-headline-sm font-bold text-primary">TND</span>
                    <span className="font-label-sm text-label-sm text-on-surface-variant">/ mois</span>
                  </div>

                  <ul className="space-y-3 pt-2">
                    {plan.features.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 font-body-sm text-body-sm text-on-surface">
                        <span className="material-symbols-outlined text-primary text-[18px] shrink-0 mt-0.5">check_circle</span>
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-8">
                  <button
                    onClick={() => setView('onboarding')}
                    className={`w-full py-3 rounded-xl font-label-lg text-label-lg font-bold transition-all shadow-sm ${
                      plan.is_popular === 1
                        ? 'bg-primary-container text-on-primary hover:bg-primary'
                        : 'bg-surface-container-low text-primary hover:bg-surface-container-high'
                    }`}
                  >
                    Démarrer avec le forfait {plan.name}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Interactive Practice ROI Calculator */}
      <div className="bg-surface-container-lowest rounded-2xl p-6 sm:p-10 shadow-lg border border-surface-container-high space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6 border-surface-container-low">
          <div>
            <span className="font-label-sm text-label-sm text-primary font-bold uppercase tracking-wider">Calculateur de Gain de Temps & Rentabilité</span>
            <h2 className="font-headline-md text-headline-md font-bold text-on-surface">Quel est le Retour sur Investissement pour votre cabinet ?</h2>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter-md items-center">
          
          <div className="md:col-span-6 space-y-4">
            <label className="font-label-lg text-label-lg font-bold text-on-surface block">
              Nombre moyen de patients reçus par jour : <span className="text-primary font-headline-md">{patientsPerDay} patients</span>
            </label>
            <input
              type="range"
              min="10"
              max="60"
              value={patientsPerDay}
              onChange={(e) => setPatientsPerDay(parseInt(e.target.value))}
              className="w-full accent-primary h-2 bg-surface-container-high rounded-lg cursor-pointer"
            />
            <div className="flex justify-between font-label-sm text-label-sm text-outline">
              <span>10 patients / jour</span>
              <span>35 patients</span>
              <span>60 patients / jour</span>
            </div>
          </div>

          <div className="md:col-span-6 grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-surface-container-low border border-surface-container-high flex flex-col items-center text-center">
              <span className="font-headline-xl text-headline-xl font-extrabold text-primary-container">{hoursSavedPerWeek}h</span>
              <span className="font-label-md text-label-md font-semibold text-on-surface mt-1">Temps Secrétariat Économisé / sem.</span>
              <span className="font-label-sm text-label-sm text-outline mt-0.5">Saisie DMP & rappels automatiques</span>
            </div>

            <div className="p-4 rounded-xl bg-surface-container-low border border-surface-container-high flex flex-col items-center text-center">
              <span className="font-headline-xl text-headline-xl font-extrabold text-secondary">+{noShowReduction} TND</span>
              <span className="font-label-md text-label-md font-semibold text-on-surface mt-1">Gain / Mois sur No-Shows</span>
              <span className="font-label-sm text-label-sm text-outline mt-0.5">Rappels SMS & WhatsApp</span>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
