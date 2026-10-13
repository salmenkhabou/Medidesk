import React, { useState } from 'react';

export default function BookingWizardView({ initialDoctor, setView }) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    doctorName: initialDoctor?.name || 'Dr. Karim Ben Mahmoud',
    specialty: initialDoctor?.specialty || 'Cardiologue & Maladies Vasculaires',
    location: initialDoctor?.location || 'Les Berges du Lac I, Tunis',
    motive: initialDoctor?.motive || 'Première consultation de Cardiologie',
    price: initialDoctor?.price || '70 TND',
    date: initialDoctor?.date || 'Mercredi 23 Octobre 2024',
    time: initialDoctor?.time || '15:15',
    patientFirstName: '',
    patientLastName: '',
    phone: '',
    email: '',
    cnamCode: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);

  const handleNextStep = (e) => {
    e.preventDefault();
    if (step < 3) {
      setStep(step + 1);
    } else {
      handleSubmitBooking();
    }
  };

  const handleSubmitBooking = async () => {
    setLoading(true);
    const trackingCode = `MDK-${Math.floor(1000 + Math.random() * 9000)}-TN`;

    try {
      await fetch('http://localhost:5000/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          doctor_name: formData.doctorName,
          specialty: formData.specialty,
          location: formData.location,
          motive: formData.motive,
          price: formData.price,
          appointment_date: formData.date,
          appointment_time: formData.time,
          patient_name: `${formData.patientFirstName} ${formData.patientLastName}`,
          patient_phone: formData.phone,
          patient_email: formData.email,
          cnam_code: formData.cnamCode,
          notes: formData.notes
        })
      });
    } catch (err) {
      // Fallback
    }

    setTimeout(() => {
      setView('booking-confirmation', {
        trackingCode,
        booking: { ...formData, trackingCode }
      });
    }, 800);
  };

  return (
    <div className="w-full min-h-screen bg-background py-8 pb-16">
      <div className="max-w-3xl mx-auto px-4 md:px-6">
        
        {/* Step Progress Bar Header */}
        <div className="bg-surface-container-lowest rounded-xl p-4 md:p-6 shadow-sm mb-6 border border-surface-container-high">
          <div className="flex items-center justify-between mb-4">
            <h1 className="font-headline-md text-headline-md text-on-surface font-bold">
              Réservation de consultation en ligne
            </h1>
            <span className="font-label-md text-label-md text-primary font-bold px-3 py-1 rounded-full bg-surface-container-low">
              Étape {step} sur 3
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className={`h-2 rounded-full transition-all ${step >= 1 ? 'bg-primary' : 'bg-surface-container-high'}`}></div>
            <div className={`h-2 rounded-full transition-all ${step >= 2 ? 'bg-primary' : 'bg-surface-container-high'}`}></div>
            <div className={`h-2 rounded-full transition-all ${step >= 3 ? 'bg-primary' : 'bg-surface-container-high'}`}></div>
          </div>
          <div className="flex justify-between font-label-sm text-label-sm text-on-surface-variant mt-2 font-medium">
            <span>1. Pratcien & Motif</span>
            <span>2. Informations Patient</span>
            <span>3. Confirmation</span>
          </div>
        </div>

        {/* Form Container */}
        <div className="bg-surface-container-lowest rounded-xl p-6 md:p-8 shadow-sm border border-surface-container-high">
          
          {step === 1 && (
            <div className="space-y-6">
              <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold border-b pb-2">
                1. Récapitulatif du praticien et du créneau
              </h2>

              <div className="p-4 rounded-xl bg-surface-container-low border border-surface-container-high flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">{formData.doctorName}</h3>
                  <p className="font-body-sm text-body-sm text-primary font-medium">{formData.specialty}</p>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">{formData.location}</p>
                </div>
                <div className="text-right">
                  <span className="font-headline-sm text-headline-sm text-primary font-bold block">{formData.price}</span>
                  <span className="font-label-sm text-label-sm text-on-surface-variant">Conventionné CNAM</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-label-md text-label-md text-on-surface font-semibold">Motif sélectionné</label>
                  <input
                    type="text"
                    value={formData.motive}
                    onChange={(e) => setFormData({ ...formData, motive: e.target.value })}
                    className="w-full h-11 px-4 bg-surface-container-low text-on-surface font-body-md rounded-lg focus:outline-none border border-surface-container-high"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-label-md text-label-md text-on-surface font-semibold">Date & Heure retenues</label>
                  <input
                    type="text"
                    value={`${formData.date} à ${formData.time}`}
                    disabled
                    className="w-full h-11 px-4 bg-surface-container-high/50 text-on-surface font-body-md rounded-lg cursor-not-allowed font-bold"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={() => setStep(2)}
                className="w-full h-12 bg-primary text-on-primary font-label-lg text-label-lg font-bold rounded-lg shadow hover:bg-primary-container transition-all flex items-center justify-center gap-2"
              >
                <span>Continuer vers mes coordonnées</span>
                <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
              </button>
            </div>
          )}

          {step === 2 && (
            <form onSubmit={handleNextStep} className="space-y-4">
              <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold border-b pb-2">
                2. Coordonnées du patient
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-label-md text-label-md text-on-surface font-semibold">Prénom *</label>
                  <input
                    type="text"
                    required
                    placeholder="ex. Sami"
                    value={formData.patientFirstName}
                    onChange={(e) => setFormData({ ...formData, patientFirstName: e.target.value })}
                    className="w-full h-11 px-4 bg-surface-container-low text-on-surface rounded-lg border border-surface-container-high"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-label-md text-label-md text-on-surface font-semibold">Nom de famille *</label>
                  <input
                    type="text"
                    required
                    placeholder="ex. Ben Ali"
                    value={formData.patientLastName}
                    onChange={(e) => setFormData({ ...formData, patientLastName: e.target.value })}
                    className="w-full h-11 px-4 bg-surface-container-low text-on-surface rounded-lg border border-surface-container-high"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-label-md text-label-md text-on-surface font-semibold">Numéro Téléphone Mobile Tunisie (+216) *</label>
                  <input
                    type="tel"
                    required
                    placeholder="+216 98 123 456"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full h-11 px-4 bg-surface-container-low text-on-surface rounded-lg border border-surface-container-high"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-label-md text-label-md text-on-surface font-semibold">Adresse E-mail pour la confirmation *</label>
                  <input
                    type="email"
                    required
                    placeholder="sami.benali@gmail.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full h-11 px-4 bg-surface-container-low text-on-surface rounded-lg border border-surface-container-high"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-label-md text-label-md text-on-surface font-semibold">Identifiant CNAM (Optionnel)</label>
                <input
                  type="text"
                  placeholder="Code unique CNAM à 10 chiffres"
                  value={formData.cnamCode}
                  onChange={(e) => setFormData({ ...formData, cnamCode: e.target.value })}
                  className="w-full h-11 px-4 bg-surface-container-low text-on-surface rounded-lg border border-surface-container-high"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="w-1/3 h-12 bg-surface-container-low text-on-surface font-label-lg rounded-lg font-semibold hover:bg-surface-container-high"
                >
                  Retour
                </button>
                <button
                  type="submit"
                  className="w-2/3 h-12 bg-primary text-on-primary font-label-lg font-bold rounded-lg shadow hover:bg-primary-container flex items-center justify-center gap-2"
                >
                  <span>Passer au récapitulatif</span>
                  <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                </button>
              </div>
            </form>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold border-b pb-2">
                3. Confirmation et validation du rendez-vous
              </h2>

              <div className="p-4 rounded-xl bg-surface-container-low border border-surface-container-high space-y-3">
                <div className="flex justify-between border-b pb-2">
                  <span className="font-body-sm text-on-surface-variant font-medium">Praticien :</span>
                  <span className="font-body-sm text-on-surface font-bold">{formData.doctorName}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="font-body-sm text-on-surface-variant font-medium">Date & Heure :</span>
                  <span className="font-body-sm text-primary font-bold">{formData.date} à {formData.time}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="font-body-sm text-on-surface-variant font-medium">Patient :</span>
                  <span className="font-body-sm text-on-surface font-bold">{formData.patientFirstName} {formData.patientLastName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-body-sm text-on-surface-variant font-medium">Tarif consultation :</span>
                  <span className="font-headline-sm text-primary font-bold">{formData.price}</span>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-surface-container-low flex items-center gap-2 text-on-surface">
                <span className="material-symbols-outlined text-primary text-[20px]">check_circle</span>
                <span className="font-label-sm text-label-sm">Réservation instantanée sans paiement immédiat. Annulation gratuite jusqu'à 2h avant.</span>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="w-1/3 h-12 bg-surface-container-low text-on-surface font-label-lg rounded-lg font-semibold"
                >
                  Modifier
                </button>
                <button
                  type="button"
                  disabled={loading}
                  onClick={handleSubmitBooking}
                  className="w-2/3 h-12 bg-secondary text-on-secondary font-label-lg font-bold rounded-lg shadow hover:bg-on-secondary-container flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <span className="material-symbols-outlined animate-spin text-[20px]">progress_activity</span>
                      <span>Confirmation en cours...</span>
                    </>
                  ) : (
                    <>
                      <span>Confirmer le rendez-vous</span>
                      <span className="material-symbols-outlined text-[20px]">check_circle</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
