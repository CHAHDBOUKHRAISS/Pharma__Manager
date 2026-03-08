# PharmaManager

Application de gestion de pharmacie 

## Stack Technique

- **Backend** : Django 4.x + Django REST Framework + PostgreSQL
- **Frontend** : React.js (Vite)
- **Documentation API** : Swagger (drf-spectacular)

## Structure du Projet

```
PharmaManager/
├── backend/          # API Django REST Framework
│   ├── config/       # Configuration du projet
│   ├── apps/         # Applications Django
│   └── fixtures/     # Données de test
├── frontend/         # Application React.js (Vite)
│   └── src/
└── README.md
```

## Installation Backend

```bash
cd backend
python -m venv venv

# Activation
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

pip install -r requirements.txt
cp .env.example .env
# Configurer les variables dans .env (DB_NAME, DB_USER, DB_PASSWORD...)

python manage.py migrate
python manage.py loaddata fixtures/initial_data.json
python manage.py runserver
```

## Variables d'Environnement Backend (.env)

```
DEBUG=True
SECRET_KEY=votre-secret-key
DB_NAME=pharma_db
DB_USER=postgres
DB_PASSWORD=password
DB_HOST=localhost
DB_PORT=5432
```

## Installation Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

## Variables d'Environnement Frontend (.env)

```
VITE_API_URL=http://localhost:8000/api/v1
```

## Documentation API

Swagger UI disponible sur : [http://localhost:8000/api/schema/swagger-ui/](http://localhost:8000/api/schema/swagger-ui/)

## Fonctionnalités

- **Gestion des médicaments** : CRUD complet, filtres, recherche, alertes de stock bas
- **Gestion des ventes** : Création avec déduction automatique du stock, annulation avec réintégration
- **Dashboard** : Vue d'ensemble avec statistiques, alertes et ventes du jour
- **API REST** : Endpoints RESTful avec pagination, filtrage et documentation Swagger
