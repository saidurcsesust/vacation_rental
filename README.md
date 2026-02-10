# Explore Rentals Platform

A full-stack vacation rental search application with:
- `backend/`: Django + Django REST Framework API
- `frontend/`: React + Material UI client

Users can search properties by location, apply filters, and view property details.

## Repository

- Clone (SSH): `git@github.com:saidurcsesust/vacation_rental.git`
- Clone (HTTPS): `https://github.com/saidurcsesust/vacation_rental.git`

```bash
git clone git@github.com:saidurcsesust/vacation_rental.git
cd vacation_rental
```

## Tech Stack

- Backend: Python, Django, Django REST Framework, SQLite
- Frontend: React (Create React App), Material UI, Axios

## Project Structure

```text
vacation_rental/
├── README.md
├── backend/
│   ├── manage.py
│   ├── requirements.txt
│   ├── properties.csv
│   ├── db.sqlite3
│   ├── backend/
│   │   ├── __init__.py
│   │   ├── asgi.py
│   │   ├── settings.py
│   │   ├── urls.py
│   │   └── wsgi.py
│   ├── properties/
│   │   ├── __init__.py
│   │   ├── admin.py
│   │   ├── apps.py
│   │   ├── models.py
│   │   ├── pagination.py
│   │   ├── serializers.py
│   │   ├── urls.py
│   │   ├── views.py
│   │   ├── management/
│   │   └── migrations/
│   └── media/
│       └── properties/
└── frontend/
    ├── .gitignore
    ├── README.md
    ├── package.json
    ├── package-lock.json
    ├── public/
    └── src/
        ├── App.css
        ├── App.js
        ├── App.test.js
        ├── index.css
        ├── index.js
        ├── reportWebVitals.js
        ├── setupTests.js
        ├── assets/
        ├── components/
        ├── pages/
        └── services/
```

## Prerequisites

- Python 3.10+ (project currently uses Python 3.12)
- Node.js 18+ and npm
- Git

## Backend Setup (Django API)

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

Backend runs at: `http://127.0.0.1:8000`

## Frontend Setup (React App)

Open a second terminal:

```bash
cd frontend
npm install
npm start
```

Frontend runs at: `http://localhost:3000`

## Environment Variables

Frontend API base URL can be overridden:

```bash
# frontend/.env
REACT_APP_API_BASE_URL=http://127.0.0.1:8000/api
```

Default is already: `http://127.0.0.1:8000/api`





## Admin Access (Local Development)

- Username: `admin`
- Password: `admin`

Admin panel URL: `http://127.0.0.1:8000/admin/`


## Import Property Data (CSV)

A CSV importer is available at `backend/properties/management/commands/import_properties.py`.

Example:

```bash
cd backend
source .venv/bin/activate
python manage.py import_properties properties.csv --clear
```

Notes:
- `--clear` deletes existing properties/images before import.
- CSV path can be absolute or relative.

## API Endpoints

Base URL: `http://127.0.0.1:8000/api`

- `GET /properties/` - list properties (paginated)
- `GET /properties/<slug>/` - property details
- `GET /locations/autocomplete/?q=<term>` - location suggestions

### Query Parameters for `/properties/`

- `location`: location filter
- `q`: text search (title/description/location)
- `min_price`: minimum nightly price
- `max_price`: maximum nightly price
- `page`: page number
- `page_size`: page size (max 100)

## API Usage Examples

```bash
curl "http://127.0.0.1:8000/api/properties/?location=Paris&page=1&page_size=20"
curl "http://127.0.0.1:8000/api/properties/?q=beach&min_price=100&max_price=400"
curl "http://127.0.0.1:8000/api/properties/cozy-villa-near-beach/"
curl "http://127.0.0.1:8000/api/locations/autocomplete/?q=lon"
```

## Run Both Services (Quick Start)

Terminal 1:

```bash
cd backend
source .venv/bin/activate
python manage.py runserver
```

Terminal 2:

```bash
cd frontend
npm start
```

Then open `http://localhost:3000`.



## Current Status

- Development configuration is enabled (`DEBUG=True` in backend settings).
- SQLite database file is `backend/db.sqlite3`.
- Media files are served from `backend/media/` in debug mode.
