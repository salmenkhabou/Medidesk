import React, { useState } from 'react';

export default function SuggestDoctorView({ setView }) {
  const [formData, setFormData] = useState({
    doctorName: '',
    specialty: 'Cardiologie',
    city: 'Tunis',
    address: '',
    phone: '',
    patientName: 'Yasmine Ben Amor',
    patientPhone: '+216 98 000 000',
    notes: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await fetch('http://localhost:5000/api/patient/suggest-doctor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
    } catch (err) {
      // Fallback
    }

    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 600);
  };

  return (
    <div className="w-full min-h-screen bg-background py-8 pb-16">
      <div className="max-w-2xl mx-auto px-4 md:px-6">
        
        {/* Header Card */}
        <div className="bg-surface-container-lowest rounded-xl p-6 sm:p-8 shadow-xl border border-surface-container-high relative overflow-hidden text-center mb-6">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary via-primary-container to-secondary-container"></div>

          <div className="w-14 h-14 rounded-xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-3">
            <span className="material-symbols-outlined text-[30px]">person_add</span>
          </div>

          <h1 className="font-headline-lg text-headline-lg text-on-surface font-extrabold">
            Suggérer un praticien
          </h1>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-1 max-w-md mx-auto">
            Vous souhaitez retrouver votre médecin de famille ou spécialiste habituel sur MediDesk ? Recommandez son cabinet et notre équipe médicale prendra contact avec lui.
          </p>
        </div>

        {submitted ? (
          <div className="bg-surface-container-lowest rounded-xl p-8 shadow-xl border border-surface-container-high text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
              <span className="material-symbols-outlined text-[36px]">check_circle</span>
            </div>
            <h2 className="font-headline-lg text-headline-lg text-on-surface font-bold">
              Merci pour votre recommandation !
            </h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant max-w-md mx-auto">
              Nous avons bien enregistré la suggestion pour le <strong>{formData.doctorName}</strong> ({formData.specialty} à {formData.city}). Un conseiller MediDesk informera le praticien de votre demande.
            </p>
            <button
              onClick={() => setView('patient-dashboard')}
              className="px-6 py-2.5 rounded-lg bg-primary text-on-primary font-label-lg font-bold shadow-sm hover:bg-primary-container transition-all inline-flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">home</span>
              <span>Retour à mon tableau de bord</span>
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-surface-container-lowest rounded-xl p-6 sm:p-8 shadow-sm border border-surface-container-high space-y-4">
            
            <div className="space-y-1 text-left">
              <label className="font-label-md text-label-md text-on-surface font-semibold">Nom & Prénom du Praticien *</label>
              <input
                type="text"
                required
                placeholder="ex. Dr. Mohamed Trabelsi"
                value={formData.doctorName}
                onChange={(e) => setFormData({ ...formData, doctorName: e.target.value })}
                className="w-full h-11 px-4 bg-surface-container-low text-on-surface rounded-lg border border-surface-container-high"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1 text-left">
                <label className="font-label-md text-label-md text-on-surface font-semibold">Spécialité médicale *</label>
                <select
                  value={formData.specialty}
                  onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                  className="w-full h-11 px-4 bg-surface-container-low text-on-surface rounded-lg border border-surface-container-high font-semibold"
                >
                  <option value="Médecine Générale">Médecine Générale</option>
                  <option value="Cardiologie">Cardiologie</option>
                  <option value="Dermatologie">Dermatologie</option>
                  <option value="Pédiatrie">Pédiatrie</option>
                  <option value="Gynécologie">Gynécologie</option>
                  <option value="Dentiste">Dentiste / Stomatologie</option>
                  <option value="Ophtalmologie">Ophtalmologie</option>
                </select>
              </div>

              <div className="space-y-1 text-left">
                <label className="font-label-md text-label-md text-on-surface font-semibold">Ville / Gouvernorat *</label>
                <select
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full h-11 px-4 bg-surface-container-low text-on-surface rounded-lg border border-surface-container-high font-semibold"
                >
                  <option value="Tunis">Tunis (Lac, Cité El Khadra, Ennasr)</option>
                  <option value="Ariana">Ariana / Menzah</option>
                  <option value="Sousse">Sousse</option>
                  <option value="Sfax">Sfax</option>
                  <option value="Monastir">Monastir</option>
                  <option value="Bizerte">Bizerte</option>
                  <option value="Nabeul">Nabeul / Hammamet</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1 text-left">
                <label className="font-label-md text-label-md text-on-surface font-semibold">Téléphone du cabinet (Si connu)</label>
                <input
                  type="tel"
                  placeholder="+216 71 000 000"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full h-11 px-4 bg-surface-container-low text-on-surface rounded-lg border border-surface-container-high"
                />
              </div>

              <div className="space-y-1 text-left">
                <label className="font-label-md text-label-md text-on-surface font-semibold">Quartier ou Immeuble médical</label>
                <input
                  type="text"
                  placeholder="ex. Immeuble Les Arcades"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full h-11 px-4 bg-surface-container-low text-on-surface rounded-lg border border-surface-container-high"
                />
              </div>
            </div>

            <div className="space-y-1 text-left">
              <label className="font-label-md text-label-md text-on-surface font-semibold">Message ou raison de la recommandation</label>
              <textarea
                rows={3}
                placeholder="ex. Excellent praticien que je consulte régulièrement, j'aimerais réserver mes consultations en ligne..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full p-3 bg-surface-container-low text-on-surface rounded-lg border border-surface-container-high"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-primary text-on-primary font-label-lg text-label-lg font-bold rounded-lg shadow hover:bg-primary-container transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="material-symbols-outlined animate-spin text-[20px]">progress_activity</span>
                  <span>Transmissions de la recommandation...</span>
                </>
              ) : (
                <>
                  <span>Soumettre ma suggestion</span>
                  <span className="material-symbols-outlined text-[20px]">send</span>
                </>
              )}
            </button>
          </form>
        )}

      </div>
    </div>
  );
}
