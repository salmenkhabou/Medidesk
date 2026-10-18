# Extension cabinet : fonctions et limites

Cette version ajoute des fonctions persistantes aux espaces existants. Les données
proviennent exclusivement des saisies et des opérations des utilisateurs. Les
identités et documents utilisés par les tests sont temporaires.

| Fonction | Espace et comportement livré |
|---|---|
| Identité, coordonnées, couverture sociale | Médecin et secrétaire : création, recherche et modification des dossiers du cabinet |
| Antécédents, allergies, traitements, diagnostics | Médecin : modification ; patient : lecture de son dossier ; secrétaire et administrateur : aucun accès clinique |
| Historique des consultations | Médecin de la consultation et patient concerné ; motif, examen, diagnostic, observation, ordonnance, bilans, imagerie et certificat |
| Documents | Médecin : ajout de PDF/PNG/JPEG jusqu’à 3 Mo ; patient : téléchargement de ses documents ; accès par identifiant vérifié côté serveur |
| Agenda et rendez-vous | Réservation patient existante conservée ; ajout au cabinet, durées, contrôle des chevauchements, créneaux disponibles, bloqués, urgents et spéciaux ; une fois publiés, les patients choisissent ces créneaux et leur durée réelle |
| Annulations et attente | Annulation libérant le créneau ; demandes en attente, contactées, rendez-vous fixé ou retirées ; aucune confirmation fictive |
| Rappels | Notifications internes dédupliquées ; tâche périodique serveur ; SMTP Gmail prêt à configurer, avec accord du patient et contenu générique uniquement |
| SMS | Désactivés à la demande du propriétaire |
| Modèles | Catalogue personnel du médecin, applicable aux comptes rendus, certificats, ordonnances, bilans et imagerie |
| Médicaments | Catalogue personnel avec source et date de revue ; pas de référentiel validé ni d’alertes pharmacologiques automatiques |
| Constantes | Poids, taille, tension, glycémie et pouls ; historique et courbe avec valeurs accessibles dans un tableau |
| Téléconsultation | Désactivée en attendant le choix d’un prestataire ; point d’intégration HTTPS, accord de l’utilisateur, salle opaque limitée à la période du rendez-vous |
| Factures et reçus | Lignes en TND, quantités, identifiant du cabinet, paiements partiels, solde, reçus et impression/PDF |
| Paiements | Espèces, carte, chèque, virement, tiers payant ; uniquement des règlements déjà reçus, aucun débit bancaire |
| Assurances | Suivi administratif CNAM/mutuelle/assurance : brouillon, déposé, accepté, rejeté, remboursé ; pas de transmission assureur ni de remboursement bancaire automatique |
| Feuille de soins | Informations imprimables de facturation ; le formulaire officiel et les règles de transmission CNAM restent à intégrer et valider |
| Impayés et caisse | Filtre des soldes, encaissements réels, journal, export CSV et XLSX natif ; anciens règlements liés pris en compte sans double encaissement |
| Statistiques | Consultations et recettes par période, diagnostics pour le médecin seulement, occupation calculée sur les minutes publiées, absence renseignée par le cabinet |
| Communication | Messagerie médecin–patient et médecin–médecin ; partage explicite de documents ; aucune pièce médicale envoyée par SMTP |
| Laboratoires externes | Courriers/documents préparables et exportables ; pas d’envoi automatique vers un laboratoire sans intégration convenue |
| Portail patient | Ses consultations, documents, factures, messages et notifications ; rattachement d’un dossier sans compte par code confidentiel à usage unique |
| Droits | Contrôles serveur par rôle et par médecin ; un administrateur technique n’obtient pas les dossiers cliniques |
| Traçabilité | Journal des lectures cliniques/documents/messages et des modifications, sans contenu médical dans les événements |
| Sauvegardes | Copie SQLite cohérente, chiffrement AES-256-GCM, minuterie quotidienne livrée, outil de vérification et restauration hors ligne |

## Rattachement d’un patient

La création d’un dossier au cabinet ne crée pas de mot de passe patient partagé.
L’utilisateur technique hors portail a un identifiant interne non délivrable et un
mot de passe aléatoire inconnu. Son email de contact réel reste dans le dossier
chiffré. Le patient crée son compte personnel normalement. Après vérification de
son identité, le médecin lui remet un code confidentiel à usage unique valable
24 heures. Le patient utilise « Mon dossier de santé → Rattacher un dossier ».
Le système refuse une fusion si un dossier existe déjà dans ce cabinet : une
réconciliation explicite est alors nécessaire. Ne publiez jamais ces codes.

## Confidentialité et périmètre du chiffrement

Les champs cliniques, les motifs, les données du dossier, les documents, messages
et dossiers de facturation sensibles utilisent AES-256-GCM avec une clé serveur
indépendante de la clé JWT. Les comptes existants et les rendez-vous sont conservés.
La migration chiffre les anciennes notes, ordonnances et motifs de rendez-vous.
Le démarrage vérifie la clé conservée pour empêcher une rotation involontaire.

Ce mécanisme ne chiffre pas l’intégralité du fichier SQLite : certains identifiants,
noms de compte, dates, liens et montants restent structurés pour les contrôles et
la comptabilité. Le chiffrement du volume/disque, les accès système et les copies
hors serveur doivent être configurés dans l’infrastructure. Les sauvegardes
produites en exploitation sont intégralement chiffrées et authentifiées.

En développement, une clé locale privée est conservée près de la base SQLite ;
elle ne doit jamais être commitée. En production, `HEALTH_DATA_KEY` est obligatoire,
indépendante et conservée hors serveur dans un gestionnaire de secrets. La perdre
rend les champs chiffrés et les sauvegardes irrécupérables. La rotation n’est pas
une simple modification de variable : elle nécessite une migration dédiée.

## Loi tunisienne et secret médical

Les contrôles techniques ne prouvent pas la conformité à la loi organique tunisienne
n° 2004-63 ni l’accomplissement des formalités INPDP. L’exploitant doit faire valider
les traitements de données de santé, les rôles, l’information et les accords des
personnes, la conservation, les accès, les sous-traitants et les transferts selon
son activité réelle. Le serveur actuel est à l’étranger ; Gmail et un éventuel
prestataire vidéo doivent aussi être examinés avant activation. Ne présentez pas
ces services comme certifiés par l’INPDP.

Les ordonnances et certificats sont des textes du praticien imprimables, pas des
signatures électroniques certifiées. Les alertes médicamenteuses nécessitent un
référentiel sous licence/validé, des règles cliniques et leur validation ; cette
version ne les remplace pas par des règles approximatives. La présence d’une URL
vidéo ne garantit pas la confidentialité du fournisseur : choisir et vérifier
son contrôle des participants, ses contrats et son hébergement avant activation.

## Gmail SMTP (après déploiement)

1. Sur le compte Gmail retenu, activer la validation en deux étapes et créer un
   mot de passe d’application « MediDesk » si Google autorise cette fonction.
2. Sur le serveur, éditer `/srv/medidesk/.env` avec un éditeur local protégé.
   Renseigner `SMTP_HOST=smtp.gmail.com`, `SMTP_USER`, `SMTP_FROM` (le compte retenu),
   et `SMTP_PASSWORD` (mot de passe d’application). Ne pas utiliser le mot de passe
   habituel du compte et ne communiquer aucun secret dans le chat ou dans Git.
3. Recréer uniquement le backend MediDesk pour appliquer ces variables, puis tester
   l’authentification avec `node src/smtp-verify.js` dans ce conteneur.
4. Tester un rappel avec un compte réel ayant accepté les emails. Une variable
   renseignée ne prouve pas la délivrabilité. Le destinataire et la date d’envoi
   doivent être confirmés lors du test effectif.

Les rappels restent internes si SMTP n’est pas configuré. Le retrait de l’accord
ou l’annulation du rendez-vous empêche l’envoi des rappels encore en attente.
Les tentatives SMTP sont limitées ; aucun succès n’est enregistré en cas d’erreur.

## Exploitation et restauration

Consulter `deployment.md` et `restauration.md`. La minuterie locale n’est pas une
sauvegarde hors site ; la destination et la politique de rétention doivent être
choisies. Tester une restauration et les accès de chaque rôle avant de confier
au service des dossiers médicaux réels.
