# AI-Powered Regulatory Scrutiny & Compliance Verification Platform
### SIH 2026 Prototype: Application Validation & Document Authentication

[![Python 3.10+](https://img.shields.io/badge/python-3.10+-blue.svg)](https://www.python.org/downloads/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.111+-009688.svg)](https://fastapi.tiangolo.com/)
[![SQLite/Postgres](https://img.shields.io/badge/Database-SQLite%20%7C%20PostgreSQL-003B57.svg)](https://www.sqlite.org/)
[![PyMuPDF](https://img.shields.io/badge/Extractor-PyMuPDF-FF5722.svg)](https://pymupdf.readthedocs.io/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

An intelligent, secure, and explainable regulatory validation platform built to assist scrutiny officers in reviewing educational institution approval applications (AICTE / UGC / State Boards).

---

## Key Features

1. **Application Dossier Management**: Track approval cycles (`Extension of Approval`, `New Institution`, `Course Expansion`, `Seat Increase`) across diverse academic years.
2. **Secure Document Management**: 
   - Cryptographic SHA-256 hashing and instantaneous duplicate file collision detection.
   - Strict path-traversal prevention, safe UUID storage, and file magic byte verification.
   - Ingestion of PDF (digital & scanned), TXT, PNG, and JPEG documents.
3. **High-Fidelity Document Extraction**:
   - PyMuPDF (`fitz`) text stream extraction with exact page coordinates and text density analysis.
   - Local OCR integration (Tesseract + PIL image preprocessing) with automatic fallback and transparent missing-binary warnings.
   - Automated entity recognition: Institution Name, Permanent Institute ID (PID), Certificate Number, Issue Date, Expiry Date, Issuing Authority.
   - Comprehensive date normalization (standard ISO 8601 formatting).
4. **Multi-Stage Validation Engine**:
   - **Completeness**: Evaluates mandatory document requirements dynamically per category.
   - **Expiry Verification**: Detects expired certificates or certificates expiring before academic session commencement.
   - **Cross-Document Identity Consistency**: Flags discrepancy in institution names and IDs across disparate documents using token-level fuzzy similarity.
   - **Chronological Coherence**: Flags conflicting dates (e.g., issue date after expiry date).
   - **Tampering & Anomaly Heuristics**: Flags metadata inconsistencies (creation timestamp vs claimed certificate date).
5. **Configurable Compliance Rules**: Admin panel to dynamically enable/disable rules, configure thresholds, and preserve rule versions per validation run.
6. **Issuer Verification Adapters**: Extensible verification layer with simulated mock adapters for AICTE and State Fire NOC registries.
7. **Human-in-the-Loop Reviewer Workflow**:
   - Scrutiny officers inspect side-by-side document extractions with highlighted source evidence.
   - Reviewers mark findings (`CONFIRMED`, `DISMISSED`, `RESOLVED`, `NEEDS_ADDITIONAL_EVIDENCE`) and input justification notes.
   - Manual override of extracted fields with audit tracking.
8. **Live Real-Time Dashboard & Reporting**:
   - Live KPI aggregates computed directly from database records.
   - Export official Scrutiny Dossier Reports in **HTML**, **JSON**, and **CSV**.
9. **Enterprise-Grade Security & Audit Trail**:
   - Role-Based Access Control (`admin`, `reviewer`, `institution`).
   - Immutable audit log capturing all system mutations with user ID, action, timestamp, and IP address.

---

## Architecture Overview

```
Frontend (Vanilla JS + CSS Glassmorphism UI)
       │
       ▼ REST API (FastAPI)
Backend Services:
  ├── Auth & RBAC Service (JWT + PBKDF2)
  ├── Application & Dossier Service
  ├── Secure Storage Service (SHA-256 + UUID)
  ├── Extraction Engine (PyMuPDF + Tesseract OCR)
  ├── Field Parsing & Normalization Engine
  ├── Validation Engine (Deterministic & Heuristic Rules)
  ├── Verification Adapter Layer (Mock AICTE / Fire Registries)
  ├── Audit Trail & Reporting Engine
       │
       ▼ SQLAlchemy ORM
Database (SQLite / PostgreSQL)
```

---

## Quickstart Guide (Windows / Linux)

### 1. Prerequisites
- Python 3.10+ (Tested on Python 3.14 on Windows)
- Git
- *(Optional)* Tesseract OCR for scanned PDF/image OCR. If not installed, digital PDFs work 100% and scanned files will be flagged for manual review gracefully.

### 2. Setup Environment
```powershell
# Clone and enter the repository
cd c:\hackthons

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows PowerShell:
.\venv\Scripts\Activate.ps1
# Windows Command Prompt:
.\venv\Scripts\activate.bat
# Linux / macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 3. Initialize Database & Seed Demo Data
```powershell
# Run the database initialization and seed synthetic test applications
python -m scripts.seed_demo_data
```

### 4. Run the Application
```powershell
# Start the FastAPI server and UI
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
Open your browser to: **http://127.0.0.1:8000**

Interactive API Docs: **http://127.0.0.1:8000/docs**

---

## Default Demo Credentials

| Role | Username | Password | Notes |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin` | `Admin@123` | Full access: manage rules, system audit logs, applications |
| **Scrutiny Reviewer** | `reviewer` | `Reviewer@123` | Scrutiny review, validate dossiers, update findings |
| **Institution** | `institution` | `Inst@123` | Create application, upload documents |

---

## Running Automated Tests
```powershell
pytest -v
```
To run with coverage:
```powershell
pytest --cov=app tests/ -v
```

---

## Synthetic Demonstration Scenarios

1. **Scenario A: Clean Institution Application (AICTE Extension of Approval)**
   - All required documents present (Fire NOC, Building Completion, Previous Approval).
   - Valid dates, consistent institution names and IDs across all certificates.
   - Result: 0 Critical / 0 Major findings, high confidence rating.
2. **Scenario B: Flagged Incomplete & Expired Fire Safety Certificate**
   - Application has an expired Fire NOC (expired 2024-05-10).
   - Missing Building Completion Certificate.
   - Result: Engine flags 2 Critical findings with exact text snippets and dates.
3. **Scenario C: Name Discrepancy & Potential Tampering**
   - Land Title Deed contains altered institution name ("Apex Private Technical Society" vs "Apex Institute of Technology").
   - Result: Engine detects token mismatch (Similarity: 68%) and highlights contradictory evidence.
4. **Scenario D: Duplicate Submission Collisions**
   - Same certificate uploaded under two different slots.
   - Result: SHA-256 collision identified immediately.
