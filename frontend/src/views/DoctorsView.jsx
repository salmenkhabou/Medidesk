import React, { useState, useEffect } from 'react';
import { fetchDoctors } from '../services/api';

export default function DoctorsView({ initialParams = {}, onOpenBooking }) {
  const [doctors, setDoctors] = useState([]);
  const [search, setSearch] = useState(initialParams.search || '');
  const [specialty, setSpecialty] = useState(initialParams.specialty || 'all');
  const [city, setCity] = useState(initialParams.city || 'all');
  const [cnamOnly, setCnamOnly] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDoctors();
  }, [specialty, city, cnamOnly]);

  const loadDoctors = async () => {
    setLoading(true);
    try {
      const params = {};
      if (specialty !== 'all') params.specialty = specialty;
      if (city !== 'all') params.city = city;
      if (cnamOnly) params.cnam = '1';
      if (search) params.search = search;

      const res = await fetchDoctors(params);
      setDoctors(res.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadDoctors();
  };

  return (
    <div className="w-full flex flex-col pt-24 pb-16 px-margin md:px-margin-md lg:px-margin-lg max-w-7xl mx-auto">
      
      {/* Header Banner */}
      <div className="flex flex-col gap-space-xs mb-space-lg">
        <span className="font-label-sm text-label-sm text-primary font-bold uppercase tracking-wider">Annuaire Médical National</span>
        <h1 className="font-headline-xl text-headline-xl text-on-surface font-bold">Trouvez un Médecin ou Spécialiste en Tunisie</h1>
        <p className="font-body-md text-body-md text-on-surface-variant">
          Consultez les créneaux disponibles et préservez votre place en salle d'attente en temps réel.
        </p>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm border border-surface-container-high mb-space-lg">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-space-sm items-end">
          
          <div className="md:col-span-4 flex flex-col gap-1">
            <label className="font-label-sm text-label-sm text-on-surface-variant font-semibold">Recherche par Nom / Mot-clé</label>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Ex: Dr. Ben Salem, Pédiatre..."
              className="h-11 px-space-md rounded-lg bg-surface-container-low border border-outline-variant/60 font-body-md text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="md:col-span-3 flex flex-col gap-1">
            <label className="font-label-sm text-label-sm text-on-surface-variant font-semibold">Spécialité</label>
            <select
              value={specialty}
              onChange={(e) => setSpecialty(e.target.value)}
              className="h-11 px-space-md rounded-lg bg-surface-container-low border border-outline-variant/60 font-body-md text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
            >
              <option value="all">Toutes les spécialités</option>
              <option value="Cardiologie">Cardiologie & Maladies Vasculaires</option>
              <option value="Pédiatrie">Pédiatrie & Néonatologie</option>
              <option value="Dermatologie">Dermatologie & Vénérologie</option>
              <option value="Ophtalmologie">Ophtalmologie</option>
              <option value="Généraliste">Médecine Générale</option>
              <option value="Gynécologie">Gynécologie & Obstétrique</option>
            </select>
          </div>

          <div className="md:col-span-3 flex flex-col gap-1">
            <label className="font-label-sm text-label-sm text-on-surface-variant font-semibold">Gouvernorat</label>
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="h-11 px-space-md rounded-lg bg-surface-container-low border border-outline-variant/60 font-body-md text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
            >
              <option value="all">Toutes les villes</option>
              <option value="Tunis">Tunis</option>
              <option value="Sousse">Sousse</option>
              <option value="Sfax">Sfax</option>
              <option value="Monastir">Monastir</option>
              <option value="Ariana">Ariana</option>
            </select>
          </div>

          <div className="md:col-span-2 flex items-center justify-end">
            <button
              type="submit"
              className="w-full h-11 px-space-md rounded-lg bg-primary-container text-on-primary font-label-lg text-label-lg font-bold flex items-center justify-center gap-1 shadow-sm hover:bg-primary transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">filter_alt</span>
              <span>Filtrer</span>
            </button>
          </div>

        </form>

        <div className="flex items-center gap-space-md pt-space-sm mt-space-sm border-t border-surface-container-low">
          <label className="flex items-center gap-space-xs cursor-pointer select-none">
            <input
              type="checkbox"
              checked={cnamOnly}
              onChange={(e) => setCnamOnly(e.target.checked)}
              className="h-4 w-4 text-primary accent-primary rounded cursor-pointer"
            />
            <span className="font-label-sm text-label-sm text-on-surface font-semibold">Afficher uniquement les médecins conventionnés CNAM</span>
          </label>
        </div>
      </div>

      {/* Results List */}
      {loading ? (
        <div className="py-space-xl text-center font-body-lg text-on-surface-variant">
          Chargement de l'annuaire des médecins...
        </div>
      ) : doctors.length === 0 ? (
        <div className="py-space-xl text-center bg-surface-container-lowest rounded-xl p-space-lg border border-surface-container-high">
          <span className="material-symbols-outlined text-outline text-[48px] block mb-2">search_off</span>
          <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">Aucun médecin ne correspond à vos critères.</h3>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">Essayez d'élargir la recherche ou de réinitialiser la ville.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter-md">
          {doctors.map((doc) => (
            <div key={doc.id} className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm hover:shadow-md transition-all border border-surface-container-high flex flex-col justify-between gap-space-md">
              <div className="flex flex-col gap-space-sm">
                <div className="relative w-full h-48 rounded-lg overflow-hidden bg-surface-container-high">
                  <img src={doc.avatar_url} alt={doc.name} className="w-full h-full object-cover" />
                  <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-surface-container-lowest/90 font-label-sm text-label-sm font-bold text-on-surface shadow-sm backdrop-blur-sm flex items-center gap-1">
                    <span className="text-secondary font-bold">★ {doc.rating}</span>
                    <span className="text-outline-variant">({doc.reviews_count} avis)</span>
                  </div>
                  {doc.cnam_convention === 1 && (
                    <span className="absolute top-2 right-2 px-space-xs py-0.5 rounded bg-surface-container-lowest/90 font-label-sm text-label-sm font-bold text-primary shadow-sm backdrop-blur-sm">
                      CNAM
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">{doc.name}</h3>
                  <p className="font-label-md text-label-md text-primary font-semibold">{doc.title}</p>
                  <p className="font-body-sm text-body-sm text-on-surface-variant flex items-center gap-1 mt-1">
                    <span className="material-symbols-outlined text-outline text-[16px]">location_on</span>
                    {doc.address}
                  </p>
                  {doc.bio && (
                    <p className="font-body-sm text-body-sm text-on-surface-variant/80 mt-2 line-clamp-2">
                      {doc.bio}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-space-xs pt-space-xs border-t border-surface-container-low">
                <div className="flex items-center justify-between text-label-sm font-label-sm text-on-surface-variant">
                  <span>Inscr. Ordre: {doc.cnom_number}</span>
                  <span className="font-bold text-on-surface">{doc.fee_tnd} TND</span>
                </div>
                <button
                  onClick={() => onOpenBooking(doc)}
                  className="w-full py-2.5 rounded-lg bg-primary-container text-on-primary font-label-lg text-label-lg font-bold text-center hover:bg-primary transition-colors shadow-sm flex items-center justify-center gap-1"
                >
                  <span className="material-symbols-outlined text-[18px]">calendar_month</span>
                  <span>Prendre Rendez-vous</span>
                </button>
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
}
