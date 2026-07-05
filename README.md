# NoteVault — Fullstack React & Django REST API Auth System

NoteVault is a secure, high-fidelity web application to store and organize personal notes. It features a complete user registration, login, session validation, and full CRUD operations on notes stored in a local SQL (SQLite) database.

## Architecture

- **Frontend**: React (Vite, JavaScript), Vanilla CSS (High-fidelity custom layout, Dark mode, Glassmorphism, Micro-animations), Lucide Icons.
- **Backend**: Django & Django REST Framework (DRF), DRF Token Authentication, django-cors-headers.
- **Database**: SQL (SQLite) via Django ORM.

---

## Getting Started

### 1. Prerequisites
Ensure you have the following installed on your system:
- Python 3.10+
- Node.js v18+ and npm

---

### 2. Backend Setup (Django)

1. **Navigate to the backend folder**:
   ```bash
   cd backend
   ```

2. **Activate the virtual environment**:
   ```bash
   source ../venv/bin/activate
   ```

3. **Run database migrations**:
   ```bash
   python manage.py migrate
   ```

4. **Start the Django development server**:
   ```bash
   python manage.py runserver
   ```
   The backend will be running at `http://127.0.0.1:8000/`.

---

### 3. Frontend Setup (React)

1. **Navigate to the frontend folder**:
   ```bash
   cd frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the Vite development server**:
   ```bash
   npm run dev
   ```
   The frontend will be running at `http://localhost:5173/`.

---

## Project Structure

```text
django-react-auth/
├── backend/                  # Django project root
│   ├── api/                  # Django app for REST API
│   │   ├── migrations/       # Database migrations
│   │   ├── models.py         # Note model defined here
│   │   ├── serializers.py    # Request/Response serializing schemas
│   │   ├── urls.py           # Endpoint routing definitions
│   │   └── views.py          # API Business logic (auth & CRUD)
│   ├── backend/              # Django system configuration
│   │   ├── settings.py       # Global app settings (CORS, REST framework, DB)
│   │   └── urls.py           # Global URL routing mapping
│   └── manage.py             # Django admin CLI utility
├── frontend/                 # React frontend root
│   ├── src/
│   │   ├── App.css           # Local stylesheet (clean resets)
│   │   ├── App.jsx           # Stateful UI flows, layouts, & API calls
│   │   ├── index.css         # Global core theme (dark mode, glass, fonts)
│   │   └── main.jsx          # React app entry point
│   ├── index.html            # Core index page with custom SEO tags
│   ├── package.json          # Node packages and scripts manifest
│   └── vite.config.js        # Vite configurations
└── README.md                 # Project guide & reference
```

---

## API Endpoints Reference

| Method | Endpoint | Description | Authentication Required |
|--------|----------|-------------|-------------------------|
| `POST` | `/api/register/` | Register a new user & receive a token | No |
| `POST` | `/api/login/` | Authenticate username/password & receive a token | No |
| `POST` | `/api/logout/` | Revoke/Delete current active token | **Yes** (Token Header) |
| `GET` | `/api/profile/` | Fetch details of currently logged-in user | **Yes** (Token Header) |
| `GET` | `/api/notes/` | Fetch all notes created by current user | **Yes** (Token Header) |
| `POST` | `/api/notes/` | Create a new note | **Yes** (Token Header) |
| `DELETE`| `/api/notes/<id>/`| Delete note by ID | **Yes** (Token Header) |
# autopilpotdjango-test
