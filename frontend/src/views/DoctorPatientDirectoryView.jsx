import React, { useState, useEffect } from 'react';
import { fetchDoctorPatients } from '../services/api';

export default function DoctorPatientDirectoryView({ setView }) {
  const [patients, setPatients] = useState([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPatients();
  }, [query]);

  const loadPatients = async () => {
    setLoading(true);
    try {
      const res = await fetchDoctorPatients(query);
      setPatients(res.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full bg-surface min-h-screen pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 text-on-surface-variant font-label-md text-label-md mb-1">
            <button onClick={() => setView('tableau-de-bord-medecin')} className="hover:text-primary">Espace Médecin</button>
            <span>/</span>
            <span className="text-primary font-bold">Annuaire Patients</span>
          </div>
          <h1 className="font-headline-xl text-headline-xl font-bold text-on-surface">Annuaire & Répertoire des Patients</h1>
        </div>

        <button 
          onClick={() => setView('tableau-de-bord-medecin')}
          className="px-4 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high font-label-md text-label-md font-bold text-on-surface transition-colors"
        >
          Retour Dashboard
        </button>
      </div>

      {/* Search Input */}
      <div className="bg-surface-container-lowest p-4 rounded-2xl shadow-sm border border-surface-container-high mb-6">
        <div className="relative">
          <span className="material-symbols-outlined absolute left-3 top-3 text-outline text-[20px]">search</span>
          <input 
            type="text" 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher patient par nom, CIN (8 chiffres) ou numéro de téléphone..."
            className="w-full h-11 pl-10 pr-4 rounded-xl bg-surface-container-low border border-outline-variant/60 font-body-md text-on-surface focus:ring-2 focus:ring-primary focus:outline-none"
          />
        </div>
      </div>

      {/* Patients Table */}
      <div className="bg-surface-container-lowest rounded-2xl shadow-sm border border-surface-container-high overflow-hidden">
        <div className="p-4 bg-surface-container-low border-b border-surface-container-high flex items-center justify-between">
          <h2 className="font-headline-sm text-headline-sm font-bold text-on-surface">Liste des Dossiers Patients Enregistrés</h2>
          <span className="font-label-sm text-label-sm text-primary font-bold">{patients.length} dossiers trouvés</span>
        </div>

        <div className="divide-y divide-surface-container-low">
          {patients.map((p, idx) => (
            <div key={idx} className="p-4 hover:bg-surface-container-low/40 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">{p.name}</h3>
                  <span className="font-label-sm text-label-sm text-outline font-semibold">CIN: {p.cin}</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-primary-fixed text-primary font-label-sm text-label-sm font-bold">
                    {p.cnam}
                  </span>
                </div>
                <div className="flex items-center gap-3 font-body-sm text-body-sm text-on-surface-variant mt-1">
                  <span>{p.age} ans • {p.gender}</span>
                  <span>•</span>
                  <span>Tél: {p.phone}</span>
                  <span>•</span>
                  <span>Pathologie : {p.pathology}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end md:self-center">
                <button 
                  onClick={() => setView('dossier-medical-complet')}
                  className="px-4 py-2 rounded-xl bg-primary text-on-primary font-label-md text-label-md font-bold hover:bg-primary-container transition-colors shadow-xs"
                >
                  Ouvrir EMR
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
