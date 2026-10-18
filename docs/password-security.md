# Mots de passe et protections

Les nouveaux mots de passe doivent contenir au moins 8 caractères Unicode, une majuscule, une minuscule, un chiffre ASCII et un symbole (les espaces ne comptent pas comme symboles). Limite bcrypt : 72 octets UTF-8, sans troncature silencieuse. Les phrases longues restent possibles. La connexion accepte les mots de passe existants ; la règle est appliquée à leur prochaine modification.

La vérification visuelle est locale et ne transmet pas chaque caractère au serveur. La validation serveur est obligatoire pour l'inscription, les comptes créés par l'équipe, la modification du mot de passe et le script administrateur. Le bouton afficher/masquer est disponible sur les nouveaux mots de passe.

Protections existantes examinées : bcrypt avec coût 12, limitation des requêtes et tentatives d'authentification, en-têtes Helmet, autorisations par rôle et cabinet, expiration des sessions et révocation lors du changement de mot de passe, chiffrement des données médicales avec HEALTH_DATA_KEY. Les tests de l'API couvrent aussi les accès interdits et le cloisonnement.

Ce changement ne constitue pas un audit de sécurité complet ni une attestation de conformité. L'authentification multifacteur et la vérification des mots de passe compromis ne sont pas ajoutées ici. Conserver HTTPS, les clés hors du dépôt et des sauvegardes chiffrées hors serveur ; prévoir un audit indépendant avant une utilisation clinique à grande échelle.
