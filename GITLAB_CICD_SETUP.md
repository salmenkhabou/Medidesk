# 🚀 Guide de Configuration CI/CD GitLab - MediDesk

Ce document décrit le fonctionnement et la configuration de la chaîne d'intégration et de déploiement continu (**CI/CD**) pour le projet **MediDesk** avec **GitLab CI/CD**.

---

## 📌 Architecture de la Pipeline (`.gitlab-ci.yml`)

La pipeline se compose de 5 étapes successives :

```mermaid
graph LR
    A[1. Security Audit] --> B[2. Tests & Build]
    B --> C[3. Docker Build & Registry]
    C --> D[4. Staging Deploy (auto)]
    C --> E[5. Production Deploy (manuel)]
```

| Étape | Description | Déclenchement |
| :--- | :--- | :--- |
| **`security_audit`** | Audit automatisé des vulnérabilités des dépendances (`npm audit`). | Chaque commit & Merge Request |
| **`test`** | Compilation du bundle Vite React (`npm run build`) + Exécution de la suite de 35 tests d'intégration backend (`npm test`). | Chaque commit & Merge Request |
| **`docker_build`** | Construction des conteneurs Docker Backend & Frontend, tag avec SHA et push sur le **GitLab Container Registry**. | Branches `main` et `develop` |
| **`deploy_staging`** | Déploiement SSH automatique sur le serveur de staging. | Branche `develop` |
| **`deploy_production`** | Déploiement sécurisé sur le serveur de production (avec confirmation manuelle). | Branche `main` (clic bouton requis) |

---

## ⚙️ Configuration des Variables Secrètes dans GitLab

Dans votre projet GitLab, rendez-vous dans :
**Paramètres (Settings) > CI/CD > Variables > Add Variable**

Ajoutez les variables suivantes en cochant **Masked** et **Protect variable** :

| Nom de la Variable | Exemple de Valeur | Description |
| :--- | :--- | :--- |
| `SSH_PRIVATE_KEY` | `-----BEGIN OPENSSH PRIVATE KEY-----...` | Clé SSH privée utilisée par le Runner pour se connecter au serveur. |
| `PROD_SERVER_IP` | `197.26.14.88` | Adresse IP publique de votre serveur de production. |
| `PROD_USER` | `deployer` ou `ubuntu` | Utilisateur Linux disposant des droits Docker. |
| `STAGING_SERVER_IP` | `197.26.14.89` | Adresse IP publique de votre serveur de test/staging. |
| `STAGING_USER` | `deployer` | Utilisateur Linux sur le serveur staging. |

> **Note**: Les identifiants du registre Docker (`CI_REGISTRY_USER`, `CI_REGISTRY_PASSWORD`, `CI_REGISTRY`) sont automatiquement fournis par GitLab.

---

## 🖥️ Préparation du Serveur de Déploiement

Sur votre serveur public (Ubuntu/Debian) :

1. **Installer Docker & Docker Compose** :
   ```bash
   sudo apt update && sudo apt install -y docker.io docker-compose-v2
   sudo usermod -aG docker $USER
   ```

2. **Créer le dossier du projet** :
   ```bash
   sudo mkdir -p /var/www/medidesk
   sudo chown -R $USER:$USER /var/www/medidesk
   cd /var/www/medidesk
   ```

3. **Copier le fichier `docker-compose.yml`** :
   ```bash
   curl -O https://raw.githubusercontent.com/.../docker-compose.yml
   ```

4. **Configurer la clé publique SSH** :
   Ajoutez la clé publique associée à votre `SSH_PRIVATE_KEY` dans `~/.ssh/authorized_keys`.

---

## 🛡️ Fonctionnalités de Sécurité Intégrées

1. **Zero-Downtime Rollout** : Les conteneurs précédents restent actifs jusqu'à ce que les nouvelles versions soient téléchargées et initialisées.
2. **Nettoyage automatique** : `docker image prune -af` libère automatiquement l'espace disque après chaque mise à jour.
3. **Approbation Manuelle en Production** : Empêche tout déploiement accidentel sans validation d'un administrateur.
