import React, { useState } from 'react';
import { bookAppointment } from '../services/api';

export default function BookingModal({ doctor, doctors = [], onClose, onSuccess }) {
  const [selectedDoctorId, setSelectedDoctorId] = useState(doctor ? doctor.id : (doctors[0]?.id || 1));
  const [patientName, setPatientName] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [patientCin, setPatientCin] = useState('');
  const [appointmentDate, setAppointmentDate] = useState(new Date().toISOString().split('T')[0]);
  const [appointmentTime, setAppointmentTime] = useState('14:30');
  const [consultationType, setConsultationType] = useState('Cabinet');
  const [cnamRequested, setCnamRequested] = useState(true);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const activeDoc = doctor || doctors.find(d => d.id === parseInt(selectedDoctorId)) || doctors[0];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const payload = {
        practitioner_id: activeDoc.id,
        patient_name: patientName,
        patient_phone: patientPhone,
        patient_cin: patientCin,
        appointment_date: appointmentDate,
        appointment_time: appointmentTime,
        consultation_type: consultationType,
        cnam_requested: cnamRequested,
        notes
      };

      const res = await bookAppointment(payload);
      setLoading(false);
      onSuccess(res.message, res.data);
    } catch (err) {
      setLoading(false);
      setError(err.message || 'Erreur lors de la prise de rendez-vous');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-space-md bg-inverse-surface/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-surface-container-lowest w-full max-w-xl rounded-xl shadow-2xl overflow-hidden flex flex-col border border-surface-container-high">
        
        {/* Modal Header */}
        <div className="bg-surface-container-low px-space-lg py-space-md border-b border-surface-container-high flex items-center justify-between">
          <div className="flex items-center gap-space-sm">
            <div className="w-10 h-10 rounded-lg bg-primary-container text-on-primary flex items-center justify-center font-bold">
              <span className="material-symbols-outlined text-[20px]">calendar_month</span>
            </div>
            <div>
              <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">Prise de Rendez-vous Médical</h3>
              <p className="font-label-sm text-label-sm text-on-surface-variant">Réseau Médical Certifié MediDesk Tunisie</p>
            </div>
          </div>
          <button onClick={onClose} className="text-on-surface-variant hover:text-on-surface p-1 rounded-full hover:bg-surface-container">
            <span className="material-symbols-outlined text-[24px]">close</span>
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-space-lg flex flex-col gap-space-md max-h-[80vh] overflow-y-auto">
          
          {error && (
            <div className="p-space-sm rounded-lg bg-error-container text-on-error-container font-label-md text-label-md flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">error</span>
              <span>{error}</span>
            </div>
          )}

          {/* Doctor Selection if not pre-selected */}
          {!doctor && doctors.length > 0 && (
            <div className="flex flex-col gap-1">
              <label className="font-label-md text-label-md font-semibold text-on-surface">Sélectionnez le Médecin</label>
              <select
                value={selectedDoctorId}
                onChange={(e) => setSelectedDoctorId(e.target.value)}
                className="w-full h-11 px-space-md rounded-lg bg-surface-container-low border border-outline-variant/60 font-body-md text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {doctors.map(d => (
                  <option key={d.id} value={d.id}>
                    {d.name} — {d.specialty} ({d.city}) — {d.fee_tnd} TND
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Doctor Info Card */}
          {activeDoc && (
            <div className="p-space-md rounded-xl bg-surface-container-low border border-surface-container-high flex items-center gap-space-md">
              <img
                src={activeDoc.avatar_url}
                alt={activeDoc.name}
                className="w-14 h-14 rounded-lg object-cover bg-surface-container-high border border-outline-variant/40"
              />
              <div className="flex-1 min-w-0">
                <h4 className="font-headline-sm text-headline-sm font-bold text-on-surface">{activeDoc.name}</h4>
                <p className="font-label-sm text-label-sm text-primary font-semibold">{activeDoc.specialty} • {activeDoc.city}</p>
                <div className="flex items-center gap-space-sm text-label-sm font-label-sm text-on-surface-variant mt-0.5">
                  <span className="font-bold text-on-surface">Honoraires: {activeDoc.fee_tnd} TND</span>
                  {activeDoc.cnam_convention === 1 && (
                    <span className="px-2 py-0.5 rounded bg-surface-container text-primary font-bold text-[11px]">
                      CNAM Conventionné
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Patient Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
            <div className="flex flex-col gap-1">
              <label className="font-label-md text-label-md font-semibold text-on-surface">Nom & Prénom du Patient *</label>
              <input
                type="text"
                required
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                placeholder="Ex: Amel Ben Ali"
                className="h-11 px-space-md rounded-lg bg-surface-container-low border border-outline-variant/60 font-body-md text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-label-md text-label-md font-semibold text-on-surface">Téléphone Mobile (SMS) *</label>
              <input
                type="tel"
                required
                value={patientPhone}
                onChange={(e) => setPatientPhone(e.target.value)}
                placeholder="+216 98 123 456"
                className="h-11 px-space-md rounded-lg bg-surface-container-low border border-outline-variant/60 font-body-md text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-space-md">
            <div className="flex flex-col gap-1">
              <label className="font-label-md text-label-md font-semibold text-on-surface">N° Carte d'Identité (CIN)</label>
              <input
                type="text"
                value={patientCin}
                onChange={(e) => setPatientCin(e.target.value)}
                placeholder="08765432"
                className="h-11 px-space-md rounded-lg bg-surface-container-low border border-outline-variant/60 font-body-md text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-label-md text-label-md font-semibold text-on-surface">Date du Rendez-vous *</label>
              <input
                type="date"
                required
                value={appointmentDate}
                onChange={(e) => setAppointmentDate(e.target.value)}
                className="h-11 px-space-md rounded-lg bg-surface-container-low border border-outline-variant/60 font-body-md text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-label-md text-label-md font-semibold text-on-surface">Horaire *</label>
              <select
                value={appointmentTime}
                onChange={(e) => setAppointmentTime(e.target.value)}
                className="h-11 px-space-md rounded-lg bg-surface-container-low border border-outline-variant/60 font-body-md text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="09:00">09:00 Matin</option>
                <option value="10:15">10:15 Matin</option>
                <option value="11:30">11:30 Matin</option>
                <option value="14:30">14:30 Après-midi</option>
                <option value="15:15">15:15 Après-midi</option>
                <option value="16:00">16:00 Après-midi</option>
                <option value="17:00">17:00 Soir</option>
              </select>
            </div>
          </div>

          {/* CNAM & Notes */}
          <div className="flex items-center justify-between p-space-sm rounded-lg bg-surface-container-low border border-surface-container-high">
            <div className="flex items-center gap-space-xs">
              <span className="material-symbols-outlined text-primary text-[20px]">fact_check</span>
              <span className="font-label-md text-label-md text-on-surface font-medium">Demande de Prise en Charge / CNAM</span>
            </div>
            <input
              type="checkbox"
              checked={cnamRequested}
              onChange={(e) => setCnamRequested(e.target.checked)}
              className="h-5 w-5 rounded text-primary accent-primary cursor-pointer"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-label-md text-label-md font-semibold text-on-surface">Motif de Consultation / Symptômes (Optionnel)</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: Bilan de contrôle, douleurs thoraciques, renouvellement d'ordonnance..."
              className="px-space-md py-space-xs rounded-lg bg-surface-container-low border border-outline-variant/60 font-body-md text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Submit Button */}
          <div className="pt-space-xs flex items-center justify-end gap-space-sm">
            <button
              type="button"
              onClick={onClose}
              className="px-space-lg py-2.5 rounded-lg bg-surface-container text-on-surface-variant hover:bg-surface-container-high font-label-lg text-label-lg font-semibold transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-space-xl py-2.5 rounded-lg bg-primary-container text-on-primary hover:bg-primary font-label-lg text-label-lg font-bold transition-all shadow-md flex items-center gap-2"
            >
              {loading ? (
                <span>Confirmation...</span>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px]">check_circle</span>
                  <span>Confirmer le Rendez-vous</span>
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
