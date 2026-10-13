import React, { useState, useEffect } from 'react';
import { fetchDoctorSubscriptionStatus } from '../services/api';

export default function DoctorSubscriptionView({ setView }) {
  const [sub, setSub] = useState(null);

  useEffect(() => {
    fetchDoctorSubscriptionStatus().then(setSub).catch(console.error);
  }, []);

  return (
    <div className="w-full bg-surface min-h-screen pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <span className="font-label-md text-label-md font-bold text-primary">Paramètres Médecin</span>
          <h1 className="font-headline-xl text-headline-xl font-bold text-on-surface">Abonnement MediDesk & Facturation SaaS</h1>
        </div>
        <button onClick={() => setView('tableau-de-bord-medecin')} className="px-4 py-2 rounded-xl bg-surface-container font-bold text-on-surface">
          Retour Dashboard
        </button>
      </div>

      <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm border border-surface-container-high space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-surface-container-low">
          <div>
            <h2 className="font-headline-sm text-headline-sm font-bold text-on-surface">{sub?.plan_name || 'MediDesk Cloud HDS Pro'}</h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant">115 DT / mois • Hébergement HDS Certifié 3 sites</p>
          </div>
          <span className="px-3 py-1 rounded-full bg-primary-fixed text-primary font-bold text-xs">Abonnement Pro Actif</span>
        </div>

        <div className="space-y-2">
          <span className="font-label-sm text-label-sm text-on-surface-variant uppercase font-bold block">Historique Factures SaaS :</span>
          {(sub?.invoices || []).map((inv, i) => (
            <div key={i} className="p-3.5 rounded-xl bg-surface-container-low flex items-center justify-between border border-surface-container-high">
              <div>
                <span className="font-mono font-bold text-primary text-sm">{inv.invoice_no}</span>
                <span className="font-body-sm text-body-sm text-on-surface block">Payé le {inv.date} • {inv.amount} DT</span>
              </div>
              <button onClick={() => window.print()} className="px-3 py-1.5 rounded-lg bg-surface-container-lowest hover:bg-surface-container text-on-surface font-bold text-xs">
                Télécharger Facture PDF
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
