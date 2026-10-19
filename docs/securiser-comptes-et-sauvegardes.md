# Sécuriser les comptes, Gmail et les sauvegardes

## 1. Installer la version

Dans MobaXterm, sur le VPS :

```bash
cd /srv/medidesk/source
git pull --ff-only && bash deploy/update-practice.sh
```

Le script sauvegarde puis met à jour uniquement MediDesk. Une courte interruption est prévue. Il conserve JWT_SECRET et HEALTH_DATA_KEY. Les nouveaux réglages de compte sont ajoutés sans supprimer les comptes ou dossiers existants.

## 2. Activer le second facteur dans MediDesk

Se connecter puis ouvrir **Paramètres > Sécurité > Protéger mon compte**.

1. Cliquer **Configurer la double authentification** après saisie du mot de passe actuel.
2. Dans Google Authenticator, Microsoft Authenticator ou une application compatible, ajouter une **clé manuellement**, de type **basé sur le temps**. Saisir la clé affichée dans MediDesk. Aucun service de QR code externe ne reçoit cette clé.
3. Saisir le code à six chiffres pour activer. La configuration expire après dix minutes.
4. Conserver les **dix codes de secours** dans un gestionnaire de mots de passe, hors du serveur. Ils sont affichés une seule fois. Ne partager ni clé ni code dans le chat ou une capture.
5. Vérifier une nouvelle connexion avec un code de secours. Chaque code ne sert qu'une fois. Le compteur restant est visible dans les paramètres.

L'activation invalide les anciennes sessions et renouvelle la session actuelle. Les codes Authenticator consommés ne peuvent pas être rejoués. Après cinq mauvais essais, il faut recommencer la connexion. La désactivation nécessite le mot de passe actuel et un code Authenticator nouveau ou un code de secours valide. Si tous les codes de secours sont épuisés, désactiver puis reconfigurer avec un nouveau code Authenticator pour en générer dix nouveaux.

Cette protection est disponible pour tous les rôles, mais reste à activer compte par compte. Elle n'est pas imposée automatiquement aux comptes existants pour éviter de les bloquer. Garder l'heure du téléphone et du VPS synchronisée. Sans téléphone ni codes de secours, l'accès peut être perdu.

## 3. Configurer Gmail sans communiquer de secret

Dans le compte Google qui enverra les emails : activer la validation Google en deux étapes, puis créer un **mot de passe d'application** sur <https://myaccount.google.com/apppasswords>. Ce réglage Google est distinct du second facteur MediDesk. Certains comptes Google ne permettent pas les mots de passe d'application ; dans ce cas, il faut une autre configuration SMTP adaptée.

Dans MobaXterm :

```bash
cd /srv/medidesk/source
bash deploy/configure-gmail.sh
```

Saisir l'adresse Gmail puis le **mot de passe d'application Google de 16 lettres**. La seconde saisie est masquée. Ne pas utiliser le mot de passe habituel Google. Le script enregistre seulement les paramètres SMTP dans `/srv/medidesk/.env` (mode 600), conserve les autres réglages, recrée le backend MediDesk et recharge son frontend. Il vérifie TLS et l'authentification SMTP sans envoyer de message de test. Il ne touche à aucun conteneur `mtc_*`.

Dans **Paramètres > Sécurité**, demander ensuite un code de vérification de l'adresse email. Vérifier la réception réelle, y compris les spams, puis saisir le code. Les emails de sécurité ne dépendent pas du consentement aux rappels de rendez-vous : ils sont demandés explicitement par l'utilisateur. Les rappels restent soumis à leur propre consentement. Aucun contenu médical n'est inclus dans les messages de sécurité.

La récupération est accessible depuis **Connexion > Mot de passe oublié ?** : demander un code puis saisir le code reçu avec un nouveau mot de passe. Les codes sont aléatoires, expirent après 30 minutes et sont à usage unique ; seuls leurs condensats sont conservés pour validation. Les messages en attente sont chiffrés. Une demande inconnue reçoit la même réponse qu'une demande connue. Une nouvelle demande pour le même compte et le même type est limitée à une par minute. L'envoi est traité en arrière-plan (jusqu'à une minute), avec au plus trois tentatives. Un échec SMTP n'est pas présenté comme un email livré.

La récupération révoque les sessions et **ne désactive pas le second facteur**. La vérification d'email est disponible, mais ne bloque pas les anciennes connexions. Les changements de mot de passe suivent les critères visibles déjà en place.

## 4. Sauvegarde distante — destination encore nécessaire

La sauvegarde locale quotidienne reste activée. Une copie sur le même VPS ne protège pas d'une perte complète du serveur.

Le transfert SSH/SFTP est prêt, mais **n'est pas activé sans un autre serveur**. Il nécessite : un compte SSH dédié sur le serveur distant, un dossier de destination, une clé SSH dédiée protégée et une empreinte d'hôte vérifiée par une source indépendante. Ne pas accepter aveuglément la sortie de `ssh-keyscan`. Ne pas désactiver StrictHostKeyChecking.

Après choix de la destination, créer avec des chemins absolus le fichier privé `/srv/medidesk/backup-offsite.json` (propriétaire root, mode 600), par exemple :

```json
{
  "host": "backup.example.org",
  "port": 22,
  "user": "medidesk",
  "directory": "/backups/medidesk",
  "identity_file": "/root/.ssh/medidesk_backup",
  "known_hosts": "/root/.ssh/medidesk_backup_known_hosts"
}
```

Ce sont des exemples, pas une destination fonctionnelle. Le serveur distant doit être distinct du VPS actuel. Le compte distant devrait être limité au dossier de sauvegarde. Une destination S3 nécessitera une intégration adaptée ; le script SSH ne la configure pas.

Le timer utilise `/usr/local/sbin/medidesk-backup` : snapshot SQLite cohérent, chiffrement authentifié, suppression de la copie temporaire en clair, puis transfert de la seule archive `.enc`. L'échec du transfert fait échouer la tâche et laisse la copie locale intacte. En l'absence de configuration, un avertissement explicite indique que la copie reste seulement locale.

Après configuration, lancer une sauvegarde manuelle puis vérifier l'arrivée de l'archive :

```bash
sudo /usr/local/sbin/medidesk-backup
sudo systemctl status medidesk-backup.timer --no-pager
```

Conserver **HEALTH_DATA_KEY séparément de ces archives**, dans un emplacement sécurisé hors serveur. Réaliser un exercice de restauration depuis la copie distante selon `docs/restauration.md`, d'abord dans une base isolée. Le transfert, la rétention distante, la supervision des échecs et la restauration sur OVH ne sont pas encore vérifiés. Aucune suppression automatique des anciennes archives n'est ajoutée.

## Vérifications réalisées dans le cloud

- 44 tests API, dont 11 nouveaux tests des comptes : vecteur TOTP RFC 6238, configuration expirée, secrets chiffrés, révocation des sessions, rejeu refusé, codes de secours uniques, limitation des essais, récupération avec maintien du second facteur, vérification email et échec SMTP simulé.
- Parcours navigateur dédié : configuration, connexion par code de secours, désactivation, vérification email, récupération puis reconnexion ; contrôles mobiles et d'accessibilité. SMTP simulé, aucun email externe envoyé.
- 5 tests du transfert distant : refus du clair, injection dans la destination, permissions de clé, vérification d'hôte stricte et conservation locale en cas d'échec. Transferts simulés, aucun stockage distant provisionné.
- Les tests existants de déploiement et les parcours navigateur sont également rejoués. Les nouveaux tests sont ajoutés à la CI ; son exécution sur GitHub reste à vérifier après publication.
