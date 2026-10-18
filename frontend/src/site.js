// Shared by browser navigation, metadata generation, robots, sitemap and analytics.
export const pages = {
  directory: {
    path: "/",
    title: "Trouvez votre praticien en Tunisie",
    description:
      "Recherchez un praticien par spécialité ou ville et organisez vos rendez-vous médicaux avec MediDesk.",
    public: true,
    index: true,
  },
  login: {
    path: "/connexion",
    title: "Connexion à votre espace",
    description:
      "Connectez-vous à votre espace personnel MediDesk pour retrouver vos rendez-vous et vos informations.",
    public: true,
  },
  register: {
    path: "/inscription",
    title: "Créer un compte patient",
    description:
      "Créez votre compte patient MediDesk pour prendre rendez-vous et retrouver vos consultations enregistrées.",
    public: true,
  },
  application: {
    path: "/rejoindre",
    title: "Rejoindre MediDesk en tant que praticien",
    description:
      "Présentez votre cabinet et votre activité pour demander un compte professionnel sur MediDesk.",
    public: true,
    index: true,
  },
  privacy: {
    path: "/confidentialite",
    title: "Politique de confidentialité",
    description:
      "Comprenez les données utilisées par MediDesk, les accès à vos informations et vos choix de confidentialité.",
    public: true,
    index: true,
  },
  settings: {
    path: "/parametres",
    title: "Affichage, confort et paramètres",
    description:
      "Adaptez le thème, la taille du texte, le contraste et vos préférences de confidentialité sur MediDesk.",
    public: true,
  },
  dashboard: {
    path: "/espace",
    title: "Vue d’ensemble",
    description:
      "Retrouvez une vue d’ensemble de votre activité et de vos rendez-vous dans votre espace MediDesk.",
  },
  appointments: {
    path: "/rendez-vous",
    title: "Vos rendez-vous",
    description:
      "Consultez et gérez les rendez-vous accessibles depuis votre compte MediDesk.",
  },
  records: {
    path: "/dossier-medical",
    title: "Dossier médical et consultations",
    description:
      "Accédez aux comptes rendus et ordonnances autorisés dans votre espace personnel MediDesk.",
  },
  payments: {
    path: "/reglements",
    title: "Règlements du cabinet",
    description:
      "Consultez les règlements reçus et enregistrés par votre cabinet dans MediDesk.",
  },
  suggestions: {
    path: "/suggestions",
    title: "Suggestions et retours",
    description:
      "Partagez vos besoins avec l’équipe MediDesk et retrouvez les réponses à vos suggestions.",
  },
  team: {
    path: "/equipe",
    title: "Gestion de l’équipe",
    description:
      "Gérez les comptes professionnels et les accès de votre équipe MediDesk.",
  },
  applications: {
    path: "/demandes",
    title: "Demandes de praticiens",
    description:
      "Examinez les demandes de comptes professionnels reçues par MediDesk.",
  },
  audit: {
    path: "/activite",
    title: "Journal d’activité",
    description:
      "Consultez les événements d’administration enregistrés sur votre plateforme MediDesk.",
  },
  analytics: {
    path: "/statistiques",
    title: "Statistiques de fréquentation",
    description:
      "Consultez les compteurs agrégés des pages publiques de MediDesk, recueillis avec consentement.",
  },
  clinical: {
    path: "/patients",
    title: "Dossiers patients et suivi médical",
    description:
      "Consultez les dossiers autorisés, les constantes et les documents de votre parcours de soins.",
  },
  scheduling: {
    path: "/agenda",
    title: "Agenda et liste d’attente",
    description:
      "Organisez les créneaux, les rendez-vous et les demandes en attente de votre cabinet.",
  },
  billing: {
    path: "/factures",
    title: "Factures et assurances",
    description:
      "Retrouvez vos factures, les règlements enregistrés et les dossiers assurance autorisés.",
  },
  messaging: {
    path: "/messagerie",
    title: "Messagerie confidentielle",
    description:
      "Échangez dans votre espace personnel avec les professionnels de votre parcours.",
  },
  reports: {
    path: "/rapports",
    title: "Activité et comptabilité du cabinet",
    description:
      "Consultez les indicateurs autorisés et exportez les encaissements du cabinet.",
  },
  tools: {
    path: "/outils-medecin",
    title: "Modèles et catalogue du praticien",
    description:
      "Gérez vos modèles de documents et votre catalogue personnel de médicaments.",
  },
  notifications: {
    path: "/notifications",
    title: "Notifications et rappels",
    description:
      "Retrouvez vos notifications et gérez votre accord pour les rappels par email.",
  },
  security: {
    path: "/securite",
    title: "Sécurité et intégrations",
    description:
      "Consultez les paramètres techniques de protection et les intégrations de la plateforme.",
  },
  notFound: {
    path: "/404",
    title: "Page introuvable",
    description:
      "Cette page MediDesk est introuvable. Retrouvez l’annuaire des praticiens ou votre espace personnel.",
    public: true,
  },
};
export const shareImageAlt =
  "MediDesk — Votre santé, mieux organisée. Rendez-vous, consultations et organisation du cabinet.";
export function resolvePage(pathname) {
  if (pathname === "/index.html") return "directory";
  if (pathname.endsWith(".html")) pathname = pathname.slice(0, -5);
  const path = pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;
  return (
    Object.keys(pages).find((key) => pages[key].path === path) || "notFound"
  );
}
export function canView(key, user) {
  if (pages[key]?.public) return true;
  if (!user) return false;
  if (key === "clinical" || key === "scheduling")
    return ["doctor", "secretariat", "patient"].includes(user.role);
  if (key === "messaging") return ["doctor", "patient"].includes(user.role);
  if (key === "reports")
    return ["doctor", "secretariat", "superadmin"].includes(user.role);
  if (key === "tools") return user.role === "doctor";
  if (key === "security") return user.role === "superadmin";
  if (["team"].includes(key))
    return ["doctor", "superadmin"].includes(user.role);
  if (["applications", "audit", "analytics"].includes(key))
    return user.role === "superadmin";
  if (key === "records") return ["doctor", "patient"].includes(user.role);
  if (key === "payments") return user.role !== "patient";
  return true;
}
export function buildPublicConfig(env = {}) {
  let siteUrl = "";
  if (env.SITE_URL) {
    const url = new URL(env.SITE_URL);
    if (
      url.protocol !== "https:" ||
      url.username ||
      url.password ||
      url.search ||
      url.hash ||
      url.pathname !== "/"
    )
      throw Error(
        "SITE_URL must be an HTTPS origin without path, credentials, query or fragment.",
      );
    siteUrl = url.origin;
  }
  const operator = (env.PRIVACY_OPERATOR || "").trim();
  const email = (env.PRIVACY_EMAIL || "").trim();
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    throw Error("PRIVACY_EMAIL must be a valid public contact email.");
  return {
    siteUrl,
    operator,
    email,
    policyReviewed:
      env.PRIVACY_POLICY_REVIEWED === "true" && !!operator && !!email,
  };
}
export function isIndexable(key, config) {
  return (
    !!config.siteUrl &&
    !!pages[key]?.index &&
    (key !== "privacy" || config.policyReviewed)
  );
}
