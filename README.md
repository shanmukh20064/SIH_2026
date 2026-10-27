# AI-Powered Regulatory Scrutiny, Document Authentication & Compliance Verification Platform
### SIH 2026: AICTE Regulatory Dossier Scrutiny & Authentication Platform

[![FastAPI](https://img.shields.io/badge/Backend-FastAPI%200.111-009688.svg)](https://fastapi.tiangolo.com/)
[![React 18](https://img.shields.io/badge/Frontend-React%2018%20%2B%20Vite-61DAFB.svg)](https://reactjs.org/)
[![Database](https://img.shields.io/badge/Database-Supabase%20PostgreSQL%2017-3ECF8E.svg)](https://supabase.com/)
[![Vercel Deployment](https://img.shields.io/badge/Deploy-Vercel%20Serverless-000000.svg)](https://vercel.com/)
[![Tests](https://img.shields.io/badge/Tests-32%20Passed-brightgreen.svg)](tests/)

An end-to-end regulatory compliance verification platform for the **All India Council for Technical Education (AICTE)** and regulatory bodies. The platform provides automated document extraction, heuristic tampering detection, regulatory rule evaluation, role-based scrutiny consoles, and live real-time synchronization.

---

## 1. Directory Structure

The repository is organized for **unified single-project Vercel deployment** containing both the Vite React frontend and the FastAPI serverless backend:

```text
SIH_hackthone/
│
├── frontend/                     # React 18 + Vite Frontend Application
│   ├── src/                      # Components, Dashboards, Modals, State
│   │   ├── components/           # UI components, LoginPage, ProfileSelectionModal
│   │   │   ├── modals/           # 14 specialized scrutiny dialogs
│   │   │   └── workspaces/       # Role-specific dashboard consoles
│   │   ├── data/                 # Data schemas & initial metrics
│   │   ├── api.js                # Unified REST API service (relative paths)
│   │   ├── supabase.js           # Supabase Realtime WebSocket client
│   │   ├── App.jsx               # Root layout & dashboard state router
│   │   └── main.jsx              # React DOM entrypoint
│   ├── public/                   # Public static assets & official SVGs
│   ├── package.json              # Frontend scripts & dependencies
│   ├── vite.config.js            # Vite build & local development proxy
│   ├── tailwind.config.js        # Government & warm ivory palette styling
│   ├── postcss.config.js         # PostCSS configuration
│   └── index.html                # Single-page application entrypoint
│
├── app/                          # Production FastAPI Backend Application
│   ├── main.py                   # FastAPI app instance, CORS, routers & health check
│   ├── config.py                 # Pydantic BaseSettings & environment loader
│   ├── database.py               # SQLAlchemy ORM engine & SessionLocal factory
│   ├── dependencies.py           # JWT token verification & RBAC role guards
│   ├── models/                   # 10 Declarative SQLAlchemy models
│   ├── routers/                  # 10 API route handlers (/api/auth, /api/applications...)
│   ├── schemas/                  # Pydantic input/output schemas
│   └── services/                 # OCR extractor, rule engine, validation & audit
│
├── api/                          # Vercel Serverless Function Bridge
│   ├── index.py                  # Serverless entrypoint exposing FastAPI 'app'
│   └── requirements.txt          # Python dependencies for Vercel deployment
│
├── scripts/                      # Migration tools, SQL exporters & utilities
│   ├── migrate_sqlite_to_supabase.py # Direct database migration script
│   └── export_sqlite_to_supabase_sql.py # SQL file generator for Supabase
│
├── storage/                      # Document storage directory
│   ├── demo_samples/             # Clean & sample PDF files for testing
│   └── documents/                # Physical document files indexed with SHA-256
│
├── tests/                        # Automated unit and integration tests (32 suites)
├── .env.example                  # Environment variable template
├── supabase_schema_and_seed.sql  # Standalone PostgreSQL schema & seed data SQL
├── supabase_setup.sql            # Supabase Realtime publication setup script
├── vercel.json                   # Root unified Vercel deployment routing config
└── README.md                     # Project documentation
```

---

## 2. Architecture & Tech Stack

* **Frontend**: React 18, Vite, Tailwind CSS, Lucide React, Recharts.
* **Backend**: FastAPI, Pydantic V2, Uvicorn, Python-Multipart.
* **Database & Realtime**: Supabase (PostgreSQL 17) with `@supabase/supabase-js` and SQLAlchemy via `psycopg` / `psycopg2-binary`.
* **Document Processing**: PyMuPDF (`fitz`), Pillow, PyTesseract OCR.
* **Security & Auth**: PyJWT, Argon2/Bcrypt password hashing, Role-Based Access Control (RBAC).

---

## 3. Predefined Roles & Dashboards

The application enforces strict authentication and post-login profile verification across three distinct roles:

1. **Administrator**:
   - **Initial**: `S` | **Name**: Shanmukh
   - **Account**: `admin` / `Admin@123`
   - **Console**: System governance, KPI statistics, compliance rules configuration, audit trail log.
2. **Scrutiny Officer**:
   - **Initial**: `R` | **Name**: Dr. Ramesh Kumar
   - **Account**: `reviewer` / `Reviewer@123`
   - **Console**: Technical scrutiny queue, anomaly investigation, evidence extraction review, case escalation.
3. **Institution Representative**:
   - **Initial**: `A` | **Name**: Apex Institute Tech
   - **Account**: `institution` / `Inst@123`
   - **Console**: Institutional portal, statutory document uploads, AI verification checks, deficiency rectification.

---

## 4. Required Environment Variables

Create `.env` in the root directory (refer to `.env.example`):

```ini
# Database Connection (Supabase PostgreSQL)
# Format: postgresql://[user]:[password]@[host]:[port]/[database]
# Note: Special characters like '@' in password must be percent-encoded as '%40'
DATABASE_URL=postgresql://postgres:Shanmukh%402006@db.prezgzkedzlyyjnsegcj.supabase.co:5432/postgres

# Supabase Realtime & API
SUPABASE_URL=https://prezgzkedzlyyjnsegcj.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Backend Security
SECRET_KEY=sih2026-super-secret-regulatory-key-32chars-minimum!!
ACCESS_TOKEN_EXPIRE_MINUTES=1440
```

And in `frontend/.env`:
```ini
VITE_SUPABASE_URL=https://prezgzkedzlyyjnsegcj.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
# VITE_BACKEND_URL is optional; leave empty in production for relative /api routing
VITE_BACKEND_URL=
```

---

## 5. Local Development Setup

### Backend Setup:
```powershell
# 1. Activate Python virtual environment
.\venv\Scripts\Activate.ps1

# 2. Install dependencies
pip install -r requirements.txt

# 3. Start FastAPI server
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

### Frontend Setup:
```powershell
# 1. Navigate to frontend directory
cd frontend

# 2. Install dependencies
npm install

# 3. Start Vite development server
npm run dev
```
Open **`http://localhost:5173`** in your browser. Requests to `/api/*` are automatically proxied to `http://127.0.0.1:8000`.

---

## 6. Single Vercel Deployment Instructions

Deploy both the frontend and the FastAPI backend through **one single Vercel project**:

### Step 1: Push Repository to GitHub
Ensure your repository contains `frontend/`, `app/`, `api/`, and `vercel.json` at the root.

### Step 2: Import into Vercel
1. Open your Vercel Dashboard: [vercel.com](https://vercel.com).
2. Click **Add New...** $\rightarrow$ **Project**.
3. Select your repository (**`SIH_2026`**) and click **Import**.

### Step 3: Configure Project Settings
* **Framework Preset**: Select `Vite` (or `Other`).
* **Root Directory**: Leave as `./` (the root directory).
* `vercel.json` automatically configures:
  * Build command: `cd frontend && npm install && npm run build`
  * Output directory: `frontend/dist`
  * API routing: `/api/(.*)` $\rightarrow$ `api/index.py`
  * SPA fallback: `/(.*)` $\rightarrow$ `/index.html`

### Step 4: Add Environment Variables in Vercel
Under the **Environment Variables** section, add:

| Variable Name | Description | Example / Value |
|---|---|---|
| `DATABASE_URL` | Supabase PostgreSQL Connection String | `postgresql://postgres:Shanmukh%402006@db.prezgzkedzlyyjnsegcj.supabase.co:5432/postgres` |
| `SUPABASE_URL` | Supabase Project URL | `https://prezgzkedzlyyjnsegcj.supabase.co` |
| `SUPABASE_ANON_KEY` | Supabase Public `anon` Key | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |
| `VITE_SUPABASE_URL` | Supabase URL for Frontend | `https://prezgzkedzlyyjnsegcj.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Supabase Anon Key for Frontend | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |
| `SECRET_KEY` | JWT Secret Key (32+ chars) | `sih2026-super-secret-regulatory-key-32chars-minimum!!` |

### Step 5: Click Deploy
Click **Deploy**. Vercel builds the React frontend, sets up the serverless Python handler, and issues a live HTTPS domain.

---

## 7. Database Migration & Realtime Setup

If setting up on a fresh Supabase project:

1. **Option A (Automated Python Migration)**:
   ```powershell
   python scripts/migrate_sqlite_to_supabase.py --target "postgresql://postgres:Shanmukh%402006@db.prezgzkedzlyyjnsegcj.supabase.co:5432/postgres"
   ```
2. **Option B (1-Click SQL Script)**:
   Open your **Supabase Dashboard $\rightarrow$ SQL Editor**, paste the contents of `supabase_schema_and_seed.sql`, and click **Run**.
3. **Enable Realtime**:
   Ensure `supabase_setup.sql` has been executed in the Supabase SQL editor to add `applications`, `findings`, and `audit_events` to the `supabase_realtime` publication.

---

## 8. Automated Testing

Run the full pytest suite (all 32 unit and integration tests):
```powershell
pytest tests
```
All test suites verify:
* API health & database connectivity
* Role-based access control (RBAC) & JWT expiration
* Multi-document upload, hashing & MIME inspection
* AI document extraction & heuristic rule evaluation
* Reviewer decision workflows & audit logging

---

## 9. Troubleshooting

* **Serverless Read-Only File System**: Vercel serverless functions have a read-only root filesystem. The platform automatically redirects document storage to `/tmp/storage/documents` when `VERCEL` environment variable is detected.
* **Password URI Encoding**: In PostgreSQL URIs, passwords containing special characters (such as `@`) must be percent-encoded (e.g., `Shanmukh@2006` becomes `Shanmukh%402006`).
* **SPA 404 on Browser Refresh**: Handled automatically by the root `vercel.json` rewrite rule redirecting non-API routes to `/index.html`.
