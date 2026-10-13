import React, { useState } from 'react';
import { LanguageProvider } from './context/LanguageContext';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Footer from './components/Footer';
import BookingModal from './components/BookingModal';
import PatientLogoutModal from './components/PatientLogoutModal';

import HomeView from './views/HomeView';
import DoctorsView from './views/DoctorsView';
import OnboardingView from './views/OnboardingView';
import ConfirmationView from './views/ConfirmationView';
import PricingView from './views/PricingView';
import LiveQueueView from './views/LiveQueueView';
import PrescriptionsView from './views/PrescriptionsView';

import DoctorProfileView from './views/DoctorProfileView';
import LoginView from './views/LoginView';
import ForgotPasswordView from './views/ForgotPasswordView';
import ResetLinkSentView from './views/ResetLinkSentView';
import TwoFactorView from './views/TwoFactorView';
import BookingWizardView from './views/BookingWizardView';
import BookingSuccessView from './views/BookingSuccessView';
import StyleGuideView from './views/StyleGuideView';

import PatientDashboardView from './views/PatientDashboardView';
import PatientRegisterView from './views/PatientRegisterView';
import ExpressBookingView from './views/ExpressBookingView';
import PatientQueueTrackerView from './views/PatientQueueTrackerView';
import SuggestDoctorView from './views/SuggestDoctorView';
import PatientMedicalRecordView from './views/PatientMedicalRecordView';
import PatientDocumentUploadView from './views/PatientDocumentUploadView';
import PatientAccountSettingsView from './views/PatientAccountSettingsView';
import PatientNotificationCenterView from './views/PatientNotificationCenterView';

// Medical Secretariat Views
import SecretariatDashboardView from './views/SecretariatDashboardView';
import SecretariatAdmissionView from './views/SecretariatAdmissionView';
import SecretariatPatientFileView from './views/SecretariatPatientFileView';
import SecretariatPlanningView from './views/SecretariatPlanningView';
import SecretariatWaitingRoomView from './views/SecretariatWaitingRoomView';
import SecretariatValidationQueueView from './views/SecretariatValidationQueueView';
import SecretariatBillingView from './views/SecretariatBillingView';
import SecretariatCashCloseoutView from './views/SecretariatCashCloseoutView';
import SecretariatSecurityView from './views/SecretariatSecurityView';

// Doctor / Practitioner Persona Views
import DoctorDashboardView from './views/DoctorDashboardView';
import DoctorConsultationEntryView from './views/DoctorConsultationEntryView';
import DoctorPatientRecordView from './views/DoctorPatientRecordView';
import DoctorPrescriptionWriterView from './views/DoctorPrescriptionWriterView';
import DoctorMedicalCertificatesView from './views/DoctorMedicalCertificatesView';
import DoctorOcrImportView from './views/DoctorOcrImportView';
import DoctorPatientDirectoryView from './views/DoctorPatientDirectoryView';
import DoctorPlanningView from './views/DoctorPlanningView';
import DoctorDelayDeclarationView from './views/DoctorDelayDeclarationView';
import DoctorAnalyticsView from './views/DoctorAnalyticsView';
import DoctorDelayTrackerView from './views/DoctorDelayTrackerView';
import DoctorSubscriptionView from './views/DoctorSubscriptionView';
import SubscriptionExpiredView from './views/SubscriptionExpiredView';

// SuperAdmin Tower Views
import SuperAdminDashboardView from './views/SuperAdminDashboardView';
import SuperAdminApplicationsView from './views/SuperAdminApplicationsView';
import SuperAdminPractitionersView from './views/SuperAdminPractitionersView';
import SuperAdminPractitionerDetailView from './views/SuperAdminPractitionerDetailView';
import SuperAdminBillingSupervisionView from './views/SuperAdminBillingSupervisionView';
import SuperAdminPricingSettingsView from './views/SuperAdminPricingSettingsView';
import SuperAdminAnalyticsView from './views/SuperAdminAnalyticsView';
import SuperAdminSuggestionsView from './views/SuperAdminSuggestionsView';
import SuperAdminTeamPermissionsView from './views/SuperAdminTeamPermissionsView';
import SuperAdminSecurityView from './views/SuperAdminSecurityView';

// Doctor Team & Security Views
import DoctorTeamManagementView from './views/DoctorTeamManagementView';
import DoctorAccountSecurityView from './views/DoctorAccountSecurityView';


export default function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('medidesk_current_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [currentView, setCurrentView] = useState(() => {
    try {
      const saved = localStorage.getItem('medidesk_current_user');
      if (saved) {
        const u = JSON.parse(saved);
        if (u.role === 'superadmin') return 'superadmin';
        if (u.role === 'doctor') return 'tableau-de-bord-medecin';
        if (u.role === 'secretariat') return 'tableau-de-bord';
        if (u.role === 'patient') return 'patient-dashboard';
      }
    } catch {}
    return 'home';
  });

  const [viewParams, setViewParams] = useState({});
  const [bookingDoctor, setBookingDoctor] = useState(null);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

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

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    showToast(`Bienvenue, ${user.name} (${user.role.toUpperCase()}) !`);
  };

  const handleConfirmLogout = () => {
    localStorage.removeItem('medidesk_jwt_token');
    localStorage.removeItem('medidesk_current_user');
    setCurrentUser(null);
    setIsLogoutOpen(false);
    showToast('Vous avez été déconnecté avec succès.');
    navigateTo('home');
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
          currentUser={currentUser}
          onOpenBooking={handleOpenBooking}
          onOpenLogoutModal={() => setIsLogoutOpen(true)}
          onToggleMobileSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
        />

        {/* Main Navigation Sidebar */}
        <Sidebar
          currentView={currentView}
          setView={navigateTo}
          currentUser={currentUser}
          isCollapsed={isSidebarCollapsed}
          setIsCollapsed={setIsSidebarCollapsed}
          isMobileOpen={isMobileSidebarOpen}
          setIsMobileOpen={setIsMobileSidebarOpen}
          onOpenLogoutModal={() => setIsLogoutOpen(true)}
        />

        {/* Global Toast Notification */}
        {toastMessage && (
          <div className="fixed top-24 right-4 z-50 p-4 rounded-xl bg-primary-container text-on-primary shadow-2xl flex items-center gap-3 border border-on-primary-container animate-bounce max-w-md">
            <span className="material-symbols-outlined text-[24px]">check_circle</span>
            <span className="font-label-lg text-label-lg font-bold">{toastMessage}</span>
          </div>
        )}

        {/* Main View Router */}
        <main className={`flex-1 w-full pt-16 transition-all duration-300 ${
          isSidebarCollapsed ? 'md:pl-20' : 'md:pl-64'
        }`}>
          {currentView === 'home' && (
            <HomeView setView={navigateTo} onOpenBooking={handleOpenBooking} />
          )}

          {currentView === 'doctors' && (
            <DoctorsView initialParams={viewParams} onOpenBooking={handleOpenBooking} setView={navigateTo} />
          )}

          {currentView === 'doctor-profile' && (
            <DoctorProfileView setView={navigateTo} onOpenBooking={handleOpenBooking} />
          )}

          {currentView === 'login' && (
            <LoginView setView={navigateTo} onLoginSuccess={handleLoginSuccess} />
          )}


          {currentView === 'forgot-password' && (
            <ForgotPasswordView setView={navigateTo} />
          )}

          {currentView === 'reset-link-sent' && (
            <ResetLinkSentView email={viewParams.email} setView={navigateTo} />
          )}

          {currentView === '2fa-verify' && (
            <TwoFactorView email={viewParams.email} setView={navigateTo} />
          )}

          {currentView === 'booking-wizard' && (
            <BookingWizardView initialDoctor={viewParams} setView={navigateTo} />
          )}

          {currentView === 'booking-confirmation' && (
            <BookingSuccessView trackingCode={viewParams.trackingCode} booking={viewParams.booking} setView={navigateTo} />
          )}

          {currentView === 'style-guide' && (
            <StyleGuideView />
          )}

          {currentView === 'patient-dashboard' && (
            <PatientDashboardView setView={navigateTo} />
          )}

          {currentView === 'patient-medical-record' && (
            <PatientMedicalRecordView setView={navigateTo} />
          )}

          {currentView === 'patient-document-upload' && (
            <PatientDocumentUploadView setView={navigateTo} />
          )}

          {currentView === 'patient-account-settings' && (
            <PatientAccountSettingsView setView={navigateTo} />
          )}

          {currentView === 'patient-notifications' && (
            <PatientNotificationCenterView setView={navigateTo} />
          )}

          {currentView === 'patient-register' && (
            <PatientRegisterView setView={navigateTo} />
          )}

          {currentView === 'express-booking' && (
            <ExpressBookingView setView={navigateTo} />
          )}

          {currentView === 'patient-queue-tracker' && (
            <PatientQueueTrackerView setView={navigateTo} />
          )}

          {currentView === 'suggest-doctor' && (
            <SuggestDoctorView setView={navigateTo} />
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

          {/* Medical Secretariat Views */}
          {currentView === 'tableau-de-bord' && (
            <SecretariatDashboardView setView={navigateTo} />
          )}

          {currentView === 'admission-patient' && (
            <SecretariatAdmissionView setView={navigateTo} />
          )}

          {currentView === 'dossier-patient-sec' && (
            <SecretariatPatientFileView setView={navigateTo} />
          )}

          {currentView === 'planning-rendez-vous' && (
            <SecretariatPlanningView setView={navigateTo} />
          )}

          {currentView === 'salle-attente' && (
            <SecretariatWaitingRoomView setView={navigateTo} />
          )}

          {currentView === 'validation-reservations' && (
            <SecretariatValidationQueueView setView={navigateTo} />
          )}

          {currentView === 'encaissement-facturation' && (
            <SecretariatBillingView setView={navigateTo} />
          )}

          {currentView === 'cloture-caisse' && (
            <SecretariatCashCloseoutView setView={navigateTo} />
          )}

          {currentView === 'parametres-secretariat' && (
            <SecretariatSecurityView setView={navigateTo} />
          )}

          {/* Doctor / Practitioner Persona Views */}
          {currentView === 'tableau-de-bord-medecin' && (
            <DoctorDashboardView setView={navigateTo} />
          )}

          {currentView === 'consultation-examen' && (
            <DoctorConsultationEntryView setView={navigateTo} />
          )}

          {currentView === 'dossier-medical-complet' && (
            <DoctorPatientRecordView setView={navigateTo} />
          )}

          {currentView === 'redaction-ordonnance' && (
            <DoctorPrescriptionWriterView setView={navigateTo} />
          )}

          {currentView === 'generateur-certificats' && (
            <DoctorMedicalCertificatesView setView={navigateTo} />
          )}

          {currentView === 'ocr-import-medical' && (
            <DoctorOcrImportView setView={navigateTo} />
          )}

          {currentView === 'annuaire-patients-medecin' && (
            <DoctorPatientDirectoryView setView={navigateTo} />
          )}

          {currentView === 'agenda-consultations-medecin' && (
            <DoctorPlanningView setView={navigateTo} />
          )}

          {currentView === 'declaration-retard' && (
            <DoctorDelayDeclarationView setView={navigateTo} />
          )}

          {currentView === 'statistiques-honoraires-medecin' && (
            <DoctorAnalyticsView setView={navigateTo} />
          )}

          {currentView === 'suivi-fenetre-priorite' && (
            <DoctorDelayTrackerView setView={navigateTo} />
          )}

          {currentView === 'abonnement-facturation-medecin' && (
            <DoctorSubscriptionView setView={navigateTo} />
          )}

          {currentView === 'acces-suspendu' && (
            <SubscriptionExpiredView setView={navigateTo} />
          )}

          {/* SuperAdmin Platform Tower Views */}
          {(currentView === 'superadmin' || currentView === 'tour-de-controle-superadmin') && (
            <SuperAdminDashboardView setView={navigateTo} />
          )}

          {currentView === 'candidatures-superadmin' && (
            <SuperAdminApplicationsView setView={navigateTo} />
          )}

          {currentView === 'annuaire-medecins-superadmin' && (
            <SuperAdminPractitionersView setView={navigateTo} />
          )}

          {currentView === 'fiche-praticien-detail' && (
            <SuperAdminPractitionerDetailView setView={navigateTo} />
          )}

          {currentView === 'supervision-facturation-superadmin' && (
            <SuperAdminBillingSupervisionView setView={navigateTo} />
          )}

          {currentView === 'tarification-forfaits-superadmin' && (
            <SuperAdminPricingSettingsView setView={navigateTo} />
          )}

          {currentView === 'analytique-performance-superadmin' && (
            <SuperAdminAnalyticsView setView={navigateTo} />
          )}

          {currentView === 'suggestions-praticiens-superadmin' && (
            <SuperAdminSuggestionsView setView={navigateTo} />
          )}

          {currentView === 'equipe-admin-superadmin' && (
            <SuperAdminTeamPermissionsView setView={navigateTo} />
          )}

          {currentView === 'securite-superadmin' && (
            <SuperAdminSecurityView setView={navigateTo} />
          )}

          {/* Doctor Team & Security Views */}
          {currentView === 'gestion-equipe-secretariat-medecin' && (
            <DoctorTeamManagementView setView={navigateTo} />
          )}

          {currentView === 'securite-compte-medecin' && (
            <DoctorAccountSecurityView setView={navigateTo} />
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

        {/* Patient Logout Modal */}
        <PatientLogoutModal
          isOpen={isLogoutOpen}
          onClose={() => setIsLogoutOpen(false)}
          onConfirm={handleConfirmLogout}
        />

        {/* Footer */}
        <Footer setView={navigateTo} className={isSidebarCollapsed ? 'md:pl-20' : 'md:pl-64'} />

      </div>
    </LanguageProvider>
  );
}
