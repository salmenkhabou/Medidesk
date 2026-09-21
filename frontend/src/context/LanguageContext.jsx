import React, { createContext, useContext, useState, useEffect } from 'react';

const translations = {
  fr: {
    brand: "MediDesk",
    tagline: "Réseau Médical National & OS Cabinet",
    nav_doctors: "Pour Médecins",
    nav_pricing: "Tarifs & Offres",
    nav_find: "Trouver un Médecin",
    nav_queue: "File d'attente Direct",
    nav_prescriptions: "Ordonnances DMP",
    nav_login: "Se connecter",
    book_appointment: "Prendre Rendez-vous",
    search_placeholder: "Médecin, Spécialité, Clinique...",
    search_btn: "Rechercher",
    for_doctors_banner: "Vous êtes praticien en Tunisie ? Rejoignez +650 médecins certifiés.",
    upgrade_pro: "Optimiser mon cabinet avec MediDesk Pro",
    hero_title: "Réservez votre consultation en quelques clics.",
    hero_sub: "Accédez aux meilleurs spécialistes, polycliniques et médecins de famille en Tunisie. Disponibilités en temps réel et suivi en direct.",
    available_today: "Disponible aujourd'hui",
    cnam_convention: "Conventionné CNAM",
    footer_copyright: "© 2024 MediDesk Tunisie. Conformité Santé INPDP & Ordre des Médecins."
  },
  ar: {
    brand: "ميدي ديسك",
    tagline: "الشبكة الطبية الوطنية ونظام إدارة العيادات",
    nav_doctors: "للأطباء والعيادات",
    nav_pricing: "الأسعار والاشتراكات",
    nav_find: "البحث عن طبيب",
    nav_queue: "قاعة الانتظار المباشرة",
    nav_prescriptions: "الوصفات الطبية الرقمية",
    nav_login: "تسجيل الدخول",
    book_appointment: "حجز موعد الآن",
    search_placeholder: "اسم الطبيب، الاختصاص، العيادة...",
    search_btn: "بحث",
    for_doctors_banner: "هل أنت طبيب في تونس؟ انضم إلى أكثر من 650 طبيب معتمد.",
    upgrade_pro: "ترقية عيادتك مع ميدي ديسك بروفيسيونال",
    hero_title: "احجز موعدك الطبي في دقائق. رعاية بدون انتظار.",
    hero_sub: "احصل على مواعيد فورية مع أفضل الأطباء والمختصين في تونس. متابعة حية لقاعة الانتظار وسجل طبي موحد.",
    available_today: "متاح اليوم",
    cnam_convention: "منظومة الكنام (CNAM)",
    footer_copyright: "© 2024 ميدي ديسك تونس. مطبق لمعايير عمادة الأطباء والهيئة الوطنية لحماية المعطيات الشخصية."
  },
  en: {
    brand: "MediDesk",
    tagline: "Tunisian Healthcare Network & Practice OS",
    nav_doctors: "For Doctors",
    nav_pricing: "Pricing & Plans",
    nav_find: "Find a Doctor",
    nav_queue: "Live Queue",
    nav_prescriptions: "Digital Prescriptions",
    nav_login: "Log in",
    book_appointment: "Book Appointment",
    search_placeholder: "Doctor, Specialty, Clinic...",
    search_btn: "Find Care",
    for_doctors_banner: "Physician in Tunisia? Join 650+ verified practitioners.",
    upgrade_pro: "Upgrade your practice with MediDesk Pro",
    hero_title: "Book your doctor in minutes. Care without waiting.",
    hero_sub: "Access Tunisia's premier network of verified specialists and family doctors. Real-time availability and live queue tracking.",
    available_today: "Available Today",
    cnam_convention: "CNAM Certified",
    footer_copyright: "© 2024 MediDesk Tunisia. Certified INPDP & Medical Board Compliant."
  }
};

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem('medidesk_lang') || 'fr');

  useEffect(() => {
    localStorage.setItem('medidesk_lang', lang);
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang]);

  const t = (key) => translations[lang]?.[key] || translations['fr'][key] || key;

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
