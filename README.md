# Portfolio professionnel avec génération de CV

Application web permettant de créer et de gérer un portfolio professionnel et de générer un CV au format PDF à partir des informations enregistrées.

## Technologies utilisées

- React avec Vite
- TypeScript
- Node.js et Express
- PostgreSQL
- Redis
- Docker et Docker Compose
- PDFKit pour la génération des CV en PDF

## Fonctionnalités

### Authentification
- Création d'un compte.
- Connexion et déconnexion.
- Protection des routes privées.
- Mots de passe sécurisés avec bcrypt.
- Gestion des sessions avec Redis.

### Gestion du portfolio
- Modification du profil professionnel.
- Ajout, modification et suppression des expériences professionnelles.
- Gestion des formations.
- Gestion des compétences.
- Gestion des projets.

### Portfolio public
- Création d'une adresse publique avec un identifiant unique.
- Activation ou désactivation de la visibilité du portfolio.
- Affichage des informations professionnelles.
- Mise en cache des données publiques avec Redis.

### Génération du CV
- Génération d'un CV au format PDF.
- Deux modèles disponibles : classique et moderne.
- Prévisualisation du CV.
- Téléchargement du CV.

## Prérequis

Avant de démarrer le projet, il faut installer :

- Node.js
- Docker Desktop
- Docker Compose

## Installation et démarrage

1. Cloner ou télécharger le projet.
2. Ouvrir le dossier du projet dans un terminal.
3. Créer le fichier `.env` à partir de `.env.example`.
4. Configurer les variables d'environnement.
5. Démarrer les services avec la commande :

```bash
docker compose up --build
```

## Accès à l'application

- Frontend : http://localhost:5173
- API : http://localhost:3000
- Vérification de l'API : http://localhost:3000/api/health
- Portfolio de démonstration : http://localhost:3000/api/public/demo-etudiant

## Structure du projet

```text
portfolio-starter/
├── backend/
│   ├── db/
│   │   └── init.sql
│   └── src/
│       ├── routes/
│       ├── index.ts
│       └── db.ts
├── frontend/
│   └── src/
├── docs/
│   └── API.md
├── docker-compose.yml
├── .env.example
└── README.md
```

## Documentation

La documentation des routes de l'API est disponible dans le dossier `docs`, dans le fichier `API.md`.

## Commandes utiles

Arrêter les conteneurs :

```bash
docker compose down
```

Afficher les journaux du backend :

```bash
docker compose logs -f backend
```

Accéder à PostgreSQL :

```bash
docker compose exec postgres psql -U portfolio -d portfolio
```

Accéder à Redis :

```bash
docker compose exec redis redis-cli
```

Pour réinitialiser complètement la base de données et supprimer les volumes :

```bash
docker compose down -v
```

**Attention :** cette dernière commande supprime les données enregistrées dans les volumes PostgreSQL.