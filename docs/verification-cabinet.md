# Vérification de l’extension cabinet

Validation locale du 18 octobre 2026, Node 22.23.3, dans l’environnement cloud.
Aucune de ces opérations n’a accédé à des dossiers réels du serveur OVH.

- API : 21 tests d’intégration réussis, sur bases temporaires. Authentification,
  cloisonnement des cabinets, dossiers, documents, constantes, messagerie,
  rattachement par code, agenda, chevauchements, paiements partiels, assurances,
  consentement, chiffrement, migration et fichiers Excel sont exercés.
- Métadonnées et routes : 5 tests réussis, incluant les nouvelles pages privées.
- Déploiement : 16 tests réussis. Les tests des scripts simulent les commandes
  externes pour vérifier l’ordre sauvegarde/migration, les erreurs et la reprise.
- Navigateur : parcours réels React/API pour patient, médecin, secrétaire et
  administrateur ; contrôles axe et débordements à 320, 360, 390, 430 et 768 pixels,
  bureau, paysage, confort, documents, factures, assurances et consentement email.
- PDF : factures et ordonnances réellement générées par Chromium ; texte extrait
  pour contrôler le contenu. Les autres consultations, notifications et commandes
  d’interface sont exclues du document sélectionné ; le texte reste lisible en mode sombre.
- Conteneurs : deux images construites ; passerelle Nginx stable avec certificat
  de test explicitement approuvé par le client de test, sans désactivation TLS.
  Une base de l’image précédente contenant deux comptes de test et une consultation
  a été migrée. Les comptes et le texte ont été conservés et les champs chiffrés.
  Un document de plus de 128 Ko a traversé la pile HTTPS/API ; les nouvelles routes
  ont répondu et les inconnues ont conservé leur véritable statut 404.
- Sauvegarde et restauration : production d’une archive chiffrée en conteneur,
  vérification de l’authentification et de SQLite ; arrêt du backend de test, puis
  restauration effective de l’instantané antérieur à la migration. Les comptes et
  notes de cet instantané ont été retrouvés. Les volumes temporaires ont été supprimés.
- Dépendances : audit npm sans vulnérabilité signalée après mise à jour et verrouillage.
- Syntaxe des scripts, espaces Git et workflows GitHub contrôlés.

## Non exécuté sur le serveur OVH

Le push ne déploie pas automatiquement cette branche. Le script de mise à jour
reste à exécuter par l’exploitant dans MobaXterm. L’installation de la minuterie,
les copies hors serveur, le renouvellement effectif du certificat et un test
Gmail avec le compte choisi ne sont pas prétendus vérifiés par les tests locaux.
Le client cloud n’a pas de connexion SSH utilisable vers ce serveur.

Les SMS et la vidéo ne sont pas activés. Il n’existe pas encore de référentiel
médicamenteux validé, de transmission CNAM/laboratoire ou de certification INPDP.
Consulter la matrice `fonctionnalites-cabinet.md` et le guide `restauration.md`.
