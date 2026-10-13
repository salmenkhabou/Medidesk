import React from 'react';

export default function BookingSuccessView({ trackingCode = 'MDK-8942-TN', booking, setView }) {
  const doctorName = booking?.doctorName || 'Dr. Karim Ben Mahmoud';
  const specialty = booking?.specialty || 'Cardiologue & Maladies Vasculaires';
  const location = booking?.location || 'Les Berges du Lac I, Tunis';
  const date = booking?.date || 'Mercredi 23 Octobre 2024';
  const time = booking?.time || '15:15';
  const patientName = booking?.patientName || booking?.patientFirstName ? `${booking.patientFirstName} ${booking.patientLastName}` : 'Sami Ben Ali';

  return (
    <div className="w-full min-h-screen bg-background py-8 pb-16">
      <div className="max-w-2xl mx-auto px-4 md:px-6">
        
        {/* Success Header Card */}
        <div className="bg-surface-container-lowest rounded-xl p-6 sm:p-8 shadow-xl text-center border border-surface-container-high relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-primary via-primary-container to-secondary-container"></div>

          <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4 animate-bounce">
            <span className="material-symbols-outlined text-[36px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
          </div>

          <h1 className="font-headline-lg text-headline-lg text-on-surface font-bold">
            Rendez-vous confirmé avec succès !
          </h1>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
            Un SMS et un e-mail de récapitulatif ont été transmis au patient. Présentez ce Pass numérique à l'accueil du cabinet.
          </p>

          {/* QR Pass Box */}
          <div className="my-6 p-6 rounded-2xl bg-surface-container-low border border-surface-container-high flex flex-col items-center">
            <span className="font-label-sm text-label-sm text-on-surface-variant font-semibold uppercase tracking-wider mb-2">
              Pass d'accès numérique & QR Code
            </span>
            
            {/* SVG QR Code */}
            <div className="p-3 bg-white rounded-xl shadow-md border border-slate-200 mb-3">
              <svg className="w-36 h-36" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="100" height="100" fill="white"/>
                <path d="M10 10H40V40H10V10ZM15 15V35H35V15H15Z" fill="#005451"/>
                <path d="M20 20H30V30H20V20Z" fill="#005451"/>
                <path d="M60 10H90V40H60V10ZM65 15V35H85V15H65Z" fill="#005451"/>
                <path d="M70 20H80V30H70V20Z" fill="#005451"/>
                <path d="M10 60H40V90H10V60ZM15 65V85H35V65H15Z" fill="#005451"/>
                <path d="M20 70H30V80H20V70Z" fill="#005451"/>
                <rect x="50" y="50" width="10" height="10" fill="#005451"/>
                <rect x="70" y="50" width="20" height="10" fill="#005451"/>
                <rect x="50" y="70" width="10" height="20" fill="#005451"/>
                <rect x="70" y="80" width="20" height="10" fill="#005451"/>
              </svg>
            </div>

            <span className="font-headline-sm text-headline-sm font-bold text-primary tracking-widest bg-surface-container-lowest px-4 py-1 rounded-lg border">
              {trackingCode}
            </span>
          </div>

          {/* Appointment Recap */}
          <div className="p-4 rounded-xl bg-surface-container-low/70 border border-surface-container-high text-left space-y-2 mb-6">
            <div className="flex justify-between">
              <span className="font-body-sm text-on-surface-variant font-medium">Praticien :</span>
              <span className="font-body-sm text-on-surface font-bold">{doctorName}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-body-sm text-on-surface-variant font-medium">Spécialité :</span>
              <span className="font-body-sm text-primary font-semibold">{specialty}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-body-sm text-on-surface-variant font-medium">Date & Heure :</span>
              <span className="font-body-sm text-secondary font-bold">{date} à {time}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-body-sm text-on-surface-variant font-medium">Lieu :</span>
              <span className="font-body-sm text-on-surface font-semibold">{location}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-body-sm text-on-surface-variant font-medium">Patient :</span>
              <span className="font-body-sm text-on-surface font-bold">{patientName}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={() => alert('Fichier d\'événement agenda (.ics) téléchargé pour Google & Apple Calendar')}
              className="py-3 px-4 rounded-lg bg-surface-container-low text-primary font-label-md text-label-md font-bold hover:bg-surface-container-high transition-colors flex items-center justify-center gap-2 border border-surface-container-high"
            >
              <span className="material-symbols-outlined text-[18px]">calendar_add_on</span>
              <span>Ajouter à mon agenda</span>
            </button>

            <button
              onClick={() => setView('queue', { doctorId: 1 })}
              className="py-3 px-4 rounded-lg bg-primary text-on-primary font-label-md text-label-md font-bold hover:bg-primary-container transition-all flex items-center justify-center gap-2 shadow-sm"
            >
              <span className="material-symbols-outlined text-[18px]">meeting_room</span>
              <span>Voir la file d'attente en direct</span>
            </button>
          </div>

          <div className="mt-6 pt-4 border-t border-surface-container-high">
            <button
              onClick={() => setView('home')}
              className="inline-flex items-center gap-1 font-label-md text-label-md text-on-surface-variant hover:text-primary transition-colors font-semibold"
            >
              <span className="material-symbols-outlined text-[18px]">home</span>
              <span>Retour à la page d'accueil</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
