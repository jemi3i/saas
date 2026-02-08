# NovaInvoice API Backend

Backend API NestJS pour NovaInvoice SaaS.

## Stack

- **NestJS** - Framework Node.js
- **TypeORM** - ORM
- **PostgreSQL** - Base de données
- **JWT** - Authentification
- **Swagger** - Documentation API

## Installation

```bash
cd backend
npm install
```

## Configuration

1. Créer la base de données PostgreSQL:

```sql
CREATE DATABASE novainvoice;
```

2. Configurer le fichier `.env`:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_DATABASE=novainvoice

JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=your-refresh-secret-key
JWT_REFRESH_EXPIRES_IN=7d

PORT=3000
NODE_ENV=development
```

## Lancer le serveur

```bash
# Development
npm run start:dev

# Production
npm run build
npm run start:prod
```

## API Endpoints

### Authentication

| Method | Endpoint                | Description             |
| ------ | ----------------------- | ----------------------- |
| POST   | `/api/v1/auth/register` | Inscription utilisateur |
| POST   | `/api/v1/auth/login`    | Connexion               |
| POST   | `/api/v1/auth/refresh`  | Rafraîchir le token     |
| POST   | `/api/v1/auth/logout`   | Déconnexion             |
| GET    | `/api/v1/auth/me`       | Profil utilisateur      |

### Enterprises

| Method | Endpoint                            | Description            |
| ------ | ----------------------------------- | ---------------------- |
| GET    | `/api/v1/enterprises`               | Liste (Admin)          |
| GET    | `/api/v1/enterprises/my-enterprise` | Mon entreprise         |
| GET    | `/api/v1/enterprises/:id`           | Détails                |
| POST   | `/api/v1/enterprises`               | Créer (Admin)          |
| PUT    | `/api/v1/enterprises/:id`           | Modifier               |
| PATCH  | `/api/v1/enterprises/:id/status`    | Changer statut (Admin) |
| DELETE | `/api/v1/enterprises/:id`           | Supprimer (Admin)      |

### Businesses

| Method | Endpoint                           | Description    |
| ------ | ---------------------------------- | -------------- |
| GET    | `/api/v1/businesses`               | Liste (Admin)  |
| GET    | `/api/v1/businesses/my-businesses` | Mes businesses |
| GET    | `/api/v1/businesses/:id`           | Détails        |
| POST   | `/api/v1/businesses`               | Créer          |
| PUT    | `/api/v1/businesses/:id`           | Modifier       |
| DELETE | `/api/v1/businesses/:id`           | Supprimer      |

## Documentation Swagger

Disponible sur: `http://localhost:3000/api/docs`

## Structure du projet

```
backend/
├── src/
│   ├── common/
│   │   ├── decorators/     # Décorateurs personnalisés
│   │   ├── enums/          # Enums partagés
│   │   └── guards/         # Guards personnalisés
│   ├── modules/
│   │   ├── auth/           # Module authentification
│   │   ├── business/       # Module business
│   │   ├── enterprise/     # Module enterprise
│   │   └── user/           # Module utilisateur
│   ├── app.module.ts
│   └── main.ts
├── .env
├── nest-cli.json
├── package.json
└── tsconfig.json
```
