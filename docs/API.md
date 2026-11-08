# Documentation de l'API — Portfolio professionnel

## 1. Informations générales

- **Adresse de l'API :** `http://localhost:3000`
- **Technologies :** Express, TypeScript, PostgreSQL et Redis.
- **Format des données :** JSON.
- **Authentification :** Sessions stockées dans Redis.
- **Cookie de session :** `portfolio.sid`.

Les routes protégées nécessitent que l'utilisateur soit connecté.

## 2. Vérification des services

| Méthode | Route | Description |
|---|---|---|
| GET | `/api/health` | Vérifie le fonctionnement de PostgreSQL et Redis. |

## 3. Authentification

Préfixe : `/api/auth`

| Méthode | Route | Description |
|---|---|---|
| POST | `/register` | Créer un compte. |
| POST | `/login` | Se connecter. |
| GET | `/me` | Consulter le compte connecté. |
| POST | `/logout` | Se déconnecter. |

## 4. Gestion du profil

Préfixe : `/api/profile`

| Méthode | Route | Description |
|---|---|---|
| GET | `/me` | Consulter le profil. |
| PUT | `/me` | Modifier le profil. |
| PUT | `/visibility` | Modifier la visibilité du portfolio. |

Ces routes nécessitent une connexion.

## 5. Expériences professionnelles

Préfixe : `/api/experiences`

| Méthode | Route | Description |
|---|---|---|
| GET | `/` | Consulter les expériences. |
| POST | `/` | Ajouter une expérience. |
| PUT | `/:id` | Modifier une expérience. |
| DELETE | `/:id` | Supprimer une expérience. |

Ces routes nécessitent une connexion.

## 6. Formations

Préfixe : `/api/education`

| Méthode | Route | Description |
|---|---|---|
| GET | `/` | Consulter les formations. |
| POST | `/` | Ajouter une formation. |
| PUT | `/:id` | Modifier une formation. |
| DELETE | `/:id` | Supprimer une formation. |

Ces routes nécessitent une connexion.

## 7. Compétences

Préfixe : `/api/skills`

| Méthode | Route | Description |
|---|---|---|
| GET | `/` | Consulter les compétences. |
| POST | `/` | Ajouter une compétence. |
| PUT | `/:id` | Modifier une compétence. |
| DELETE | `/:id` | Supprimer une compétence. |

Le niveau d'une compétence doit être un nombre entier entre 1 et 5 lorsqu'il est fourni.

Ces routes nécessitent une connexion.

## 8. Projets

Préfixe : `/api/projects`

| Méthode | Route | Description |
|---|---|---|
| GET | `/` | Consulter les projets. |
| POST | `/` | Ajouter un projet. |
| PUT | `/:id` | Modifier un projet. |
| DELETE | `/:id` | Supprimer un projet. |

Les projets peuvent contenir un titre, une description, des technologies, un lien de dépôt, un lien de démonstration et une image.

Ces routes nécessitent une connexion.

## 9. Portfolio public

Préfixe : `/api/public`

| Méthode | Route | Description |
|---|---|---|
| GET | `/:slug` | Afficher un portfolio public. |

Cette route ne nécessite pas de connexion.

Seuls les portfolios dont la visibilité est activée sont accessibles.

Les données sont mises en cache dans Redis pendant 5 minutes.

## 10. Génération du CV

Préfixe : `/api/cv`

| Méthode | Route | Description |
|---|---|---|
| GET | `/preview` | Afficher un aperçu du CV en PDF. |
| GET | `/download` | Télécharger le CV en PDF. |

Deux modèles sont disponibles :

- `classic`
- `modern`

Exemple :

`http://localhost:3000/api/cv/preview?template=classic`

Ces routes nécessitent une connexion.

## 11. Codes de réponse HTTP

| Code | Signification |
|---|---|
| 200 | Requête réussie. |
| 201 | Ressource créée. |
| 400 | Données invalides. |
| 401 | Connexion nécessaire. |
| 404 | Ressource introuvable. |
| 500 | Erreur interne du serveur. |
| 503 | Service indisponible. |

## 12. Sécurité et stockage

- Les mots de passe sont hachés avec bcrypt.
- Les sessions sont stockées dans Redis.
- Les requêtes SQL utilisent des paramètres.
- Les utilisateurs peuvent uniquement modifier leurs propres données.
- Helmet est utilisé pour les en-têtes de sécurité.
- CORS contrôle les origines autorisées.