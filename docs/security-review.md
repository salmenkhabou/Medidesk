# Revue de sécurité MediDesk — 19 octobre 2026

## Périmètre et résultats

Tests réalisés dans l'environnement de développement sur des bases temporaires, des comptes de test et des conteneurs distincts. Aucun essai offensif sur le VPS, aucune donnée de patient ni ressource de l'autre site utilisées. Cette revue ne certifie ni l'absence de faille ni la conformité réglementaire.

- **33 tests API réussis**, dont **11 nouveaux tests de sécurité**. Les tests existants couvrent aussi les accès entre cabinets/patients, documents, consultations, factures, paiements, consentement des rappels et sauvegardes authentifiées.
- **19 tests de déploiement réussis**, dont les chemins d'échec et de restauration et trois contrôles du script de vérification serveur : en-têtes manquants, port interne exposé, absence de modification et de fuite de secrets.
- **5 tests des routes et métadonnées réussis** ; parcours navigateur complets et contrôles mobiles/accessibilité réussis.
- `npm audit` backend et frontend : **0 vulnérabilité connue signalée**, dépendances de développement comprises, selon les bases consultées ce jour. Cela ne couvre pas les paquets système des images Docker.
- Recherche de signatures usuelles de clés privées, jetons GitHub/AWS et fichiers `.env` sur les **107 fichiers de la branche de déploiement avant cette revue** : aucune correspondance. Recherche limitée à cet instantané, pas à tout l'historique ni à toutes les formes possibles de secrets.

## Contrôles effectués

| Surface | Vérification |
|---|---|
| Authentification | JWT falsifié/non signé, algorithme différent, mauvais émetteur, expiration, compte inexistant, version de session invalide refusés |
| Autorisations | Rôle relu depuis la base ; un rôle administrateur transmis dans un formulaire ou un jeton ne donne pas de droits supplémentaires |
| Confidentialité | Refus des requêtes anonymes ; secrétaire et administrateur sans accès aux fonctions cliniques ; autres cabinets/patients sans accès aux dossiers et documents |
| Sessions | Mot de passe actuel obligatoire ; changement du mot de passe et déconnexion invalident les anciennes sessions |
| Injections SQL | Tentatives dans la connexion, la recherche et les identifiants ; requêtes refusées ou résultats cloisonnés, tables préservées |
| Entrées | JSON mal formé, tableaux, null et dépassement de taille ; absence de secrets et de piles d'erreur dans les réponses |
| Navigateur | Origines CORS hostiles refusées ; HTML malveillant stocké affiché comme texte ; script inline injecté bloqué par CSP sur le bundle de production |
| Fichiers | Types/signatures et taille des documents contrôlés ; accès par dossier/partage explicite ; fichiers cachés, clés, bases et source maps non servis |
| Chiffrement | AES-256-GCM : valeurs identiques produisent des chiffrés différents ; altération/mauvaise clé refusées |
| Sauvegardes | Archive altérée refusée ; fichier partiellement déchiffré supprimé ; fichier cible préexistant conservé |
| Réseau applicatif | Certificat de test vérifié avec une autorité de test locale ; TLS 1.2/1.3 acceptés, TLS 1.0/1.1 refusés ; backend/frontend non publiés dans la configuration dédiée |
| Limitation de connexion | 429 après dépassement ; usurpation X-Forwarded-For inefficace ; deux clients réels gardent des compteurs distincts à travers les deux Nginx |

Les essais HTTPS utilisent la configuration Nginx réelle, le bundle compilé et le backend de production dans trois conteneurs isolés. Le navigateur de test fait confiance uniquement à l'empreinte du certificat temporaire. Ce résultat ne valide pas le certificat public actuellement installé sur OVH.

## Problèmes corrigés

1. **Restauration — risque de perte locale de fichier** : un échec d'ouverture exclusive pendant le déchiffrement pouvait supprimer un fichier cible préexistant. La destination est désormais acquise exclusivement avant toute logique de nettoyage ; test de régression ajouté.
2. **Cache API** : ajout de `Cache-Control: no-store` à toutes les réponses API, y compris les erreurs.
3. **Adresse IP à travers les deux proxys** : le backend pouvait compter tous les utilisateurs dans le même quota. Le gateway remplace l'en-tête reçu du client et le frontend transmet cette adresse fiable. Vérification avec deux clients et des en-têtes falsifiés. Le frontend reste un service privé derrière le gateway, conformément au déploiement dédié.
4. **Protection du site statique** : CSP, refus d'intégration dans une iframe, `nosniff`, politique de référent et restrictions de permissions sur HTML et assets ; refus explicite des fichiers sensibles.
5. **Messages d'erreur** : réponses génériques pour JSON invalide et corps trop volumineux, sans réafficher le contenu soumis.

Le contrôle navigateur de visibilité du bouton principal a été actualisé pour cibler le nouveau lien « Trouver un praticien » ; la contrainte de visibilité avant défilement est conservée.

## Vérifications encore nécessaires en production

La mise à jour doit être installée sur OVH avant que ces corrections y soient actives. Après installation, lancer depuis `/srv/medidesk/source` :

```bash
bash deploy/security-check-host.sh
```

Ce script est en lecture seule, vise uniquement MediDesk et ne lit ni n'affiche les secrets. Il contrôle HTTPS, les en-têtes, la santé API/base, les droits du fichier `.env`, les ports internes et l'état des timers connus. Il n'a pas été exécuté sur le VPS dans cette revue. Une erreur indique un contrôle à examiner, pas une autorisation de modifier l'autre site.

À examiner séparément : pare-feu OVH/UFW, SSH et mises à jour Ubuntu/Docker ; inventaire et vulnérabilités système des images ; renouvellement réel du certificat ; réception effective des alertes ; sauvegardes chiffrées hors serveur et exercice de restauration complet. Les données structurées non cliniques et identifiants ne sont pas couverts par un chiffrement intégral du volume SQLite. La politique de conservation et la conformité INPDP nécessitent une validation juridique et organisationnelle.

L'authentification multifacteur, la recherche des mots de passe compromis, la détection d'attaques distribuées et l'analyse antivirus des documents ne sont pas implémentées. Les tokens restent dans sessionStorage : une faille XSS résiduelle pourrait les exposer ; CSP réduit ce risque sans le supprimer. Recommander des mots de passe uniques plus longs pour les professionnels et un audit indépendant avant utilisation clinique à grande échelle.

## Rejouer les tests

Avec la version Node indiquée par le dépôt et les dépendances installées selon les lockfiles :

```bash
npm test --prefix backend
npm test --prefix frontend
node --test deploy/test/*.mjs
npm run build --prefix frontend
npm run test:e2e --prefix frontend
npm audit --prefix backend
npm audit --prefix frontend
```

Les essais navigateur nécessitent Chromium/Playwright et utilisent leurs propres comptes et fichiers temporaires. Les résultats d'audit des dépendances évoluent avec les avis publiés.
