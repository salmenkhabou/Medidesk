import React, { useState, useEffect } from 'react';
import { fetchCashCloseoutReport, lockCashRegister } from '../services/api';

export default function SecretariatCashCloseoutView({ setView }) {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [notes, setNotes] = useState('');

  // Denominations breakdown counters
  const [counts, setCounts] = useState({
    b50: 15, // 15 x 50 = 750
    b20: 10, // 10 x 20 = 200
    b10: 3,  // 3 x 10 = 30
    p5: 0,
    p2: 0,
    p1: 0
  });

  useEffect(() => {
    loadReport();
  }, []);

  const loadReport = async () => {
    setLoading(true);
    try {
      const res = await fetchCashCloseoutReport();
      setReport(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const totalCalculatedCash = 
    (counts.b50 * 50) + 
    (counts.b20 * 20) + 
    (counts.b10 * 10) + 
    (counts.p5 * 5) + 
    (counts.p2 * 2) + 
    (counts.p1 * 1);

  const theoreticalCash = report?.breakdown?.cash || 980;
  const discrepancy = totalCalculatedCash - theoreticalCash;

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  };

  const handleLockRegister = async () => {
    try {
      const res = await lockCashRegister({ counted_cash: totalCalculatedCash, notes });
      showToast(res.message);
      loadReport();
    } catch (e) {
      showToast("Erreur lors de la clôture de caisse");
    }
  };

  return (
    <div className="w-full bg-surface min-h-screen pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
      
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-24 right-6 z-50 p-4 rounded-xl bg-primary text-on-primary shadow-2xl flex items-center gap-3 animate-bounce max-w-md">
          <span className="material-symbols-outlined text-[24px]">lock</span>
          <span className="font-label-lg text-label-lg font-bold">{toast}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 text-on-surface-variant font-label-md text-label-md mb-1">
            <button onClick={() => setView('tableau-de-bord')} className="hover:text-primary">Secrétariat</button>
            <span>/</span>
            <span className="text-primary font-bold">Clôture de Caisse</span>
          </div>
          <h1 className="font-headline-xl text-headline-xl font-bold text-on-surface">Clôture de Caisse Journalière — Arrêt Z</h1>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Rapprochement financier des encaissements en espèces, chèques, TPE et bordereaux CNAM du jour.
          </p>
        </div>

        <button 
          onClick={() => setView('tableau-de-bord')}
          className="px-4 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high font-label-md text-label-md font-bold text-on-surface transition-colors"
        >
          Retour Dashboard
        </button>
      </div>

      {/* Financial Summary Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        <div className="bg-surface-container-lowest p-5 rounded-2xl shadow-sm border border-surface-container-high flex flex-col">
          <span className="font-label-sm text-label-sm font-bold text-primary uppercase">Total Brut du Jour</span>
          <span className="font-headline-xl text-headline-xl font-bold text-primary mt-1">{report?.total_gross || 1420} TND</span>
          <span className="font-body-sm text-body-sm text-on-surface-variant mt-1">{report?.transactions_count || 3} consultations encassées</span>
        </div>

        <div className="bg-surface-container-lowest p-5 rounded-2xl shadow-sm border border-surface-container-high flex flex-col">
          <span className="font-label-sm text-label-sm font-bold text-on-surface-variant uppercase">Espèces (Théorique)</span>
          <span className="font-headline-xl text-headline-xl font-bold text-on-surface mt-1">{theoreticalCash} TND</span>
          <span className="font-body-sm text-body-sm text-on-surface-variant mt-1">À compter en caisse</span>
        </div>

        <div className="bg-surface-container-lowest p-5 rounded-2xl shadow-sm border border-surface-container-high flex flex-col">
          <span className="font-label-sm text-label-sm font-bold text-on-surface-variant uppercase">Chèques Encaissés</span>
          <span className="font-headline-xl text-headline-xl font-bold text-on-surface mt-1">{report?.breakdown?.cheque || 240} TND</span>
          <span className="font-body-sm text-body-sm text-on-surface-variant mt-1">1 chèque enregistré</span>
        </div>

        <div className="bg-surface-container-lowest p-5 rounded-2xl shadow-sm border border-surface-container-high flex flex-col">
          <span className="font-label-sm text-label-sm font-bold text-on-surface-variant uppercase">Carte TPE Bank</span>
          <span className="font-headline-xl text-headline-xl font-bold text-on-surface mt-1">{report?.breakdown?.tpe || 200} TND</span>
          <span className="font-body-sm text-body-sm text-on-surface-variant mt-1">Télécollecte TPE validée</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Denomination Counter (7 cols) */}
        <div className="lg:col-span-7 bg-surface-container-lowest p-6 rounded-2xl shadow-sm border border-surface-container-high space-y-6">
          <div className="flex items-center justify-between border-b pb-3 border-surface-container-low">
            <h2 className="font-headline-sm text-headline-sm font-bold text-on-surface">Décompte des Billets & Pièces en Caisse</h2>
            <span className="font-label-sm text-label-sm text-outline font-bold">Monnaie TND</span>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-xl bg-surface-container-low border border-surface-container-high">
              <span className="font-label-lg text-label-lg font-bold text-on-surface">Billets de 50 TND</span>
              <div className="flex items-center gap-3">
                <input 
                  type="number" 
                  value={counts.b50}
                  onChange={(e) => setCounts(prev => ({ ...prev, b50: Number(e.target.value) }))}
                  className="w-20 h-10 px-3 rounded-lg bg-surface-container-lowest border border-outline-variant/60 font-mono font-bold text-center"
                />
                <span className="font-mono font-bold text-primary min-w-[70px] text-right">{counts.b50 * 50} TND</span>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-surface-container-low border border-surface-container-high">
              <span className="font-label-lg text-label-lg font-bold text-on-surface">Billets de 20 TND</span>
              <div className="flex items-center gap-3">
                <input 
                  type="number" 
                  value={counts.b20}
                  onChange={(e) => setCounts(prev => ({ ...prev, b20: Number(e.target.value) }))}
                  className="w-20 h-10 px-3 rounded-lg bg-surface-container-lowest border border-outline-variant/60 font-mono font-bold text-center"
                />
                <span className="font-mono font-bold text-primary min-w-[70px] text-right">{counts.b20 * 20} TND</span>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-surface-container-low border border-surface-container-high">
              <span className="font-label-lg text-label-lg font-bold text-on-surface">Billets de 10 TND</span>
              <div className="flex items-center gap-3">
                <input 
                  type="number" 
                  value={counts.b10}
                  onChange={(e) => setCounts(prev => ({ ...prev, b10: Number(e.target.value) }))}
                  className="w-20 h-10 px-3 rounded-lg bg-surface-container-lowest border border-outline-variant/60 font-mono font-bold text-center"
                />
                <span className="font-mono font-bold text-primary min-w-[70px] text-right">{counts.b10 * 10} TND</span>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-surface-container-low border border-surface-container-high">
              <span className="font-label-lg text-label-lg font-bold text-on-surface">Pièces (5 TND, 2 TND, 1 TND)</span>
              <div className="flex items-center gap-3">
                <input 
                  type="number" 
                  value={counts.p5}
                  onChange={(e) => setCounts(prev => ({ ...prev, p5: Number(e.target.value) }))}
                  className="w-20 h-10 px-3 rounded-lg bg-surface-container-lowest border border-outline-variant/60 font-mono font-bold text-center"
                />
                <span className="font-mono font-bold text-primary min-w-[70px] text-right">{counts.p5 * 5} TND</span>
              </div>
            </div>
          </div>

          <div>
            <label className="block font-label-md text-label-md font-bold text-on-surface mb-1">Notes & Observations Clôture de Caisse</label>
            <textarea 
              rows="2"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: Fond de caisse initial 100 TND laissé en caisse..."
              className="w-full p-3 rounded-xl bg-surface-container-low border border-outline-variant/60 font-body-sm text-on-surface focus:ring-2 focus:ring-primary focus:outline-none"
            ></textarea>
          </div>
        </div>

        {/* Right Reconciliation Summary (5 cols) */}
        <div className="lg:col-span-5 bg-surface-container-lowest p-6 rounded-2xl shadow-lg border border-surface-container-high flex flex-col justify-between space-y-6">
          <div>
            <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface pb-3 border-b border-surface-container-low">Rapprochement & Écart de Caisse</h3>
            
            <div className="py-4 space-y-4 font-body-sm text-body-sm">
              <div className="flex justify-between items-center">
                <span className="text-on-surface-variant font-medium">Total Décompté (Compté) :</span>
                <span className="font-headline-sm text-headline-sm font-bold text-on-surface">{totalCalculatedCash} TND</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-on-surface-variant font-medium">Total Théorique (Système) :</span>
                <span className="font-headline-sm text-headline-sm font-bold text-on-surface">{theoreticalCash} TND</span>
              </div>

              <div className="p-4 rounded-xl bg-surface-container-low border border-surface-container-high flex items-center justify-between">
                <span className="font-label-lg text-label-lg font-bold text-on-surface">Écart de Caisse :</span>
                <span className={`font-headline-md text-headline-md font-bold ${discrepancy === 0 ? 'text-primary' : 'text-error'}`}>
                  {discrepancy > 0 ? `+${discrepancy} TND (Surplus)` : discrepancy < 0 ? `${discrepancy} TND (Manquant)` : '0.00 TND (Parfait)'}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <button 
              onClick={() => window.print()}
              className="w-full py-3 rounded-xl bg-surface-container-high hover:bg-surface-container font-label-md text-label-md font-bold text-on-surface transition-colors flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">print</span>
              <span>Générer Rapport Z en PDF</span>
            </button>

            <button 
              onClick={handleLockRegister}
              className="w-full py-3.5 rounded-xl bg-primary text-on-primary font-label-lg text-label-lg font-bold hover:bg-primary-container transition-colors shadow-sm flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-[20px]">lock</span>
              <span>Valider & Verrouiller la Caisse Journalière</span>
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
