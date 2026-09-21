import React, { useState } from 'react';
import { LanguageProvider } from './context/LanguageContext';
import Header from './components/Header';
import Footer from './components/Footer';
import BookingModal from './components/BookingModal';

import HomeView from './views/HomeView';
import DoctorsView from './views/DoctorsView';
import OnboardingView from './views/OnboardingView';
import ConfirmationView from './views/ConfirmationView';
import PricingView from './views/PricingView';
import LiveQueueView from './views/LiveQueueView';
import PrescriptionsView from './views/PrescriptionsView';

export default function App() {
  const [currentView, setCurrentView] = useState('home');
  const [viewParams, setViewParams] = useState({});
  const [bookingDoctor, setBookingDoctor] = useState(null);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const navigateTo = (view, params = {}) => {
    setCurrentView(view);
    setViewParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenBooking = (doctor = null) => {
    setBookingDoctor(doctor);
    setIsBookingOpen(true);
  };

  const handleBookingSuccess = (msg) => {
    setIsBookingOpen(false);
    showToast(msg);
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 5000);
  };

  return (
    <LanguageProvider>
      <div className="min-h-screen flex flex-col bg-surface text-on-surface">
        
        {/* Navigation Header */}
        <Header 
          currentView={currentView} 
          setView={navigateTo} 
          onOpenBooking={handleOpenBooking} 
        />

        {/* Global Toast Notification */}
        {toastMessage && (
          <div className="fixed top-24 right-4 z-50 p-4 rounded-xl bg-primary-container text-on-primary shadow-2xl flex items-center gap-3 border border-on-primary-container animate-bounce max-w-md">
            <span className="material-symbols-outlined text-[24px]">check_circle</span>
            <span className="font-label-lg text-label-lg font-bold">{toastMessage}</span>
          </div>
        )}

        {/* Main View Router */}
        <main className="flex-1 w-full">
          {currentView === 'home' && (
            <HomeView setView={navigateTo} onOpenBooking={handleOpenBooking} />
          )}

          {currentView === 'doctors' && (
            <DoctorsView initialParams={viewParams} onOpenBooking={handleOpenBooking} />
          )}

          {currentView === 'onboarding' && (
            <OnboardingView setView={navigateTo} />
          )}

          {currentView === 'confirmation' && (
            <ConfirmationView 
              trackingCode={viewParams.trackingCode} 
              record={viewParams.record} 
              setView={navigateTo} 
            />
          )}

          {currentView === 'pricing' && (
            <PricingView setView={navigateTo} />
          )}

          {currentView === 'queue' && (
            <LiveQueueView doctorId={viewParams.doctorId || 1} onOpenBooking={handleOpenBooking} />
          )}

          {currentView === 'prescriptions' && (
            <PrescriptionsView />
          )}
        </main>

        {/* Appointment Booking Modal */}
        {isBookingOpen && (
          <BookingModal
            doctor={bookingDoctor}
            onClose={() => setIsBookingOpen(false)}
            onSuccess={handleBookingSuccess}
          />
        )}

        {/* Footer */}
        <Footer setView={navigateTo} />

      </div>
    </LanguageProvider>
  );
}
