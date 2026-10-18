export function privacySections(config) {
  return [
    {
      title: "Qui est responsable de vos données ?",
      text: config.operator
        ? `L’exploitant déclaré de ce service est ${config.operator}. ${config.email ? `Vous pouvez contacter l’équipe chargée de la confidentialité à ${config.email}.` : "Le contact chargé de la confidentialité doit encore être renseigné."}`
        : "L’identité juridique de l’exploitant et son contact chargé de la confidentialité doivent être renseignés avant l’ouverture du service au public.",
    },
    {
      title: "Quelles informations sont utilisées ?",
      text: "Le service enregistre les informations de compte fournies (nom, email, mot de passe sous forme de condensat, rôle et téléphone facultatif), les profils professionnels, les rendez-vous et leurs motifs, les dossiers patients (identité, couverture, antécédents, allergies et traitements), les consultations et prescriptions saisies par le médecin, les constantes, les documents médicaux, les messages, les factures, les dossiers assurance et les règlements enregistrés, les demandes de praticiens et les suggestions. N’inscrivez aucune information médicale dans une suggestion destinée à l’équipe produit.",
    },
    {
      title: "À quoi servent ces informations ?",
      text: "Les informations permettent de gérer les comptes et les droits d’accès, organiser les rendez-vous, rendre les comptes rendus accessibles aux personnes concernées, enregistrer les règlements reçus et répondre aux demandes adressées à l’équipe. L’exploitant doit préciser et valider les bases juridiques applicables à ces traitements, notamment aux données de santé, avant la mise en production.",
    },
    {
      title: "Qui peut y accéder ?",
      text: "Un patient accède à ses propres rendez-vous et comptes rendus. Le médecin accède aux rendez-vous et aux consultations de ses patients dans ce service. Le secrétariat accède aux informations administratives des patients, à l’agenda, aux factures et aux dossiers assurance du médecin qui lui est assigné, sans accès aux notes cliniques, aux constantes, aux documents médicaux ni à la messagerie. Les partages de documents à un confrère sont explicites et ne lui donnent pas accès à tout le dossier. Les administrateurs gèrent les comptes professionnels, les demandes, les suggestions et le journal d’activité ; aucun accès aux comptes rendus cliniques ne leur est fourni par l’API.",
    },
    {
      title: "Mesure d’audience : votre choix",
      text: "La mesure d’audience est facultative et désactivée tant que vous ne l’acceptez pas. Elle compte uniquement les consultations de pages publiques autorisées, par page et par jour. Elle n’enregistre dans la base statistique ni identité, ni identifiant de compte, ni adresse IP, ni texte saisi, ni URL complète, ni paramètres de recherche, ni référent. Les pages privées et les pages d’authentification sont exclues. Ces compteurs ne mesurent pas des visiteurs uniques. Aucun outil publicitaire ou script d’analyse tiers n’est chargé. Vous pouvez refuser ou retirer votre accord à tout moment dans vos préférences ; le choix « Ne pas me suivre » du navigateur est respecté.",
    },
    {
      title: "Stockage dans votre navigateur",
      text: "Le jeton de session est conservé dans sessionStorage pour maintenir votre connexion dans cet onglet ; il expire au plus tard après huit heures et est retiré à la déconnexion. Les préférences d’affichage et le choix de mesure d’audience sont mémorisés dans localStorage sur cet appareil. Ces stockages ne sont pas des cookies publicitaires. Supprimer les données du site dans votre navigateur supprime aussi ces préférences.",
    },
    {
      title: "Conservation et hébergement",
      text: "Les données de l’application sont enregistrées dans la base SQLite du serveur de l’exploitant. Les statistiques agrégées sont purgées au-delà de 90 jours à la réception ou à la consultation de nouveaux événements statistiques. L’identité de l’hébergeur, le pays de stockage, les éventuels sous-traitants et transferts, les durées de conservation des comptes et dossiers, les sauvegardes et leur effacement restent à documenter et à valider par l’exploitant. Les serveurs et intermédiaires réseau peuvent traiter des adresses IP et conserver leurs propres journaux : leur politique doit être précisée par l’exploitant.",
    },
    {
      title: "Vos demandes et vos droits",
      text: `Vous pouvez demander des informations sur vos données, leur accès, leur correction ou leur suppression, sous réserve des obligations applicables à la conservation des dossiers et des droits des autres personnes. ${config.email ? `Adressez votre demande à ${config.email}.` : "Le contact de confidentialité doit être renseigné par l’exploitant pour permettre l’exercice de ces demandes."} Les voies de recours et l’autorité compétente doivent être précisées en fonction de l’exploitation effective du service.`,
    },
    {
      title: "Sécurité et services externes",
      text: "L’application applique des contrôles d’accès selon le rôle et le cabinet, vérifie les sessions signées et trace les accès sensibles. Les champs cliniques, documents et messages sont chiffrés côté application ; ceci ne constitue pas un chiffrement intégral du serveur. Les rappels email sont facultatifs, génériques et nécessitent votre accord : ils ne contiennent ni résultat médical ni pièce jointe clinique. Ils peuvent transiter par le compte Gmail configuré par l’exploitant. Les SMS et la visioconférence restent désactivés en l’absence de configuration validée. L’exploitant reste responsable de la configuration du chiffrement réseau, de l’hébergement, des sauvegardes et de la revue des accès. Aucune certification de conformité ou d’hébergement de données de santé n’est revendiquée par cette page. Les intégrations d’emails, SMS, OCR, paiement et double authentification ne sont pas activées par défaut ; toute activation doit être accompagnée d’une mise à jour de cette information.",
    },
  ];
}
