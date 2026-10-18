# Sauvegardes et restauration de MediDesk

Les commandes concernent exclusivement le projet Compose `medidesk`. Ne jamais
arrêter le daemon Docker ni modifier les conteneurs `mtc_*` pour cette opération.

## Vérifier les sauvegardes

Après l’extension cabinet, la minuterie `medidesk-backup.timer` lance une sauvegarde
SQLite quotidienne cohérente puis son chiffrement AES-256-GCM. Vérifier son résultat :

```sh
sudo systemctl status medidesk-backup.timer
sudo journalctl -u medidesk-backup.service --since today
sudo /usr/local/sbin/medidesk-backup
```

Les fichiers `.sqlite.enc` sont dans `data/backups` du volume du backend. Les noms
ne contiennent pas d’identités. Choisir une destination hors serveur et transférer
les fichiers chiffrés avec des accès restreints. Conserver la clé de santé dans un
emplacement sécurisé distinct. Définir la rétention, vérifier les copies et ne pas
pruner les volumes Docker. La minuterie ne supprime pas silencieusement d’archives.

Dans un backend en fonctionnement, `node src/restore.js CHEMIN_DU_FICHIER.enc`
vérifie l’authenticité et l’intégrité SQLite vers un fichier temporaire privé, puis
le supprime, sans remplacer la base active. Un fichier modifié ou une mauvaise clé
est refusé. Faire aussi une répétition complète sur un environnement isolé.

## Restauration réelle (maintenance de MediDesk)

1. Identifier l’archive, la clé correspondante et les versions applicatives compatibles.
   Arrêter la minuterie MediDesk pendant la maintenance.
2. Prendre une dernière sauvegarde et conserver la base actuelle.
3. Arrêter uniquement la passerelle et le backend du projet MediDesk. Confirmer
   qu’aucun autre processus ne peut écrire sur son volume.
4. Avec les mêmes fichiers Compose et `.env`, lancer un conteneur backend ponctuel
   `run --rm --no-deps`, avec `RESTORE_CONFIRMED_BACKEND_STOPPED=YES`, exécutant
   `node src/restore.js CHEMIN_DU_FICHIER.enc --restore`. Il authentifie, vérifie
   SQLite et conserve l’ancienne base et ses fichiers WAL avant de remplacer la base.
5. Relancer les images compatibles du backend, du frontend et de la passerelle.
   Vérifier HTTPS, la base, une connexion et un dossier autorisé de chaque rôle.
6. Relancer la minuterie et vérifier un nouveau cycle.

Ne pas restaurer des fichiers bruts sur une base ouverte. Ne pas supprimer le WAL
pour contourner un problème. La clé chiffrante doit correspondre à l’archive et aux
champs qu’elle contient. Une ancienne version applicative ne sait pas forcément
lire le schéma ou les champs chiffrés d’une version récente.

`deploy/update-practice.sh` réalise la migration de cette version en maintenance :
il construit avant d’arrêter MediDesk, conserve les images précédentes, prend et
chiffre un instantané hors écriture, puis migre et vérifie. En cas d’échec au démarrage,
il restaure l’instantané et les images précédentes. Une restauration revient à
l’état de cet instantané ; ce mécanisme ne remplace pas une politique de reprise.
