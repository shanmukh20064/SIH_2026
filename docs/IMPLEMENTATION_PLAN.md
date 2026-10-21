# Implementation Plan

## Overview
This document outlines the step-by-step phased execution plan for the SIH 2026 prototype: AI-Powered Application Validation, Document Authentication, and Regulatory Compliance Verification.

---

## Phases & Milestones

### Phase 1: Environment & Foundations (Complete / In Progress)
- [x] Workspace inspection and Git repository initialization.
- [x] Python 3.14 virtual environment setup (`venv`).
- [x] Architecture & specifications documents (`PRD.md`, `TECHNICAL_DESIGN.md`, `IMPLEMENTATION_PLAN.md`, `TEST_PLAN.md`, `DECISIONS.md`, `README.md`, `AGENTS.md`).
- [ ] Requirements definition (`requirements.txt`) with pinned, stable dependencies.
- [ ] Core package installation and local environment verification.

### Phase 2: Backend Architecture & Database Models
- [ ] Configure database connection (`app/database.py`) using SQLite with foreign keys enabled, easily switchable to PostgreSQL via `DATABASE_URL`.
- [ ] Implement SQLAlchemy ORM models (`app/models/`):
  - User & Role models with password hashing
  - Institution model
  - Application model with lifecycle enums
  - Document model with SHA-256 and metadata
  - ExtractedField model with confidence and evidence coordinates
  - ComplianceRule model with JSON rule configurations
  - ValidationRun and Finding models with severity, status, and evidence
  - VerificationAttempt model with adapter metadata
  - AuditEvent model with user and resource tracking
- [ ] Database initialization script (`app/db_init.py`) with seed data for default admin, reviewer, sample institutions, and standard regulatory rules.

### Phase 3: Core API Services & Authentication
- [ ] FastAPI application factory (`app/main.py`) with CORS, middleware, and exception handlers.
- [ ] Authentication system (`app/routers/auth.py`):
  - JWT token generation & validation
  - Passlib password hashing
  - Endpoints: `POST /api/auth/login`, `GET /api/auth/me`
  - Role-based dependency guards (`require_role(["admin", "reviewer"])`).
- [ ] Application endpoints (`app/routers/applications.py`):
  - CRUD for regulatory applications
  - List with search, filtering, and pagination
  - Status transition state machine.

### Phase 4: Document Storage & Extraction Pipeline
- [ ] Safe file storage manager (`app/services/storage.py`):
  - File extension & magic bytes validation
  - SHA-256 hash calculation and duplicate detection
  - Safe UUID filename generation in `storage/documents/`
  - Path traversal protection.
- [ ] Text & Metadata extraction engine (`app/services/extractor.py`):
  - PyMuPDF integration (`fitz`) for digital PDF parsing
  - Text density heuristic to detect scanned PDFs
  - Fallback OCR using Tesseract / PIL preprocessing with graceful degradation notice when binary missing
  - Plain text file parser
  - Image document extractor.
- [ ] Entity & Field extraction service (`app/services/field_parser.py`):
  - Regex & pattern extractors for Institution Name, PID, Certificate Numbers, Issue/Expiry Dates, Authorities
  - Date normalization engine (DD/MM/YYYY, YYYY-MM-DD, month names to standard ISO 8601)
  - Confidence scoring and evidence snippet capture
  - Persistence to `extracted_fields`.

### Phase 5: Validation Engine & Rule Engine
- [ ] Configurable compliance rule service (`app/services/rules.py`):
  - Rule seeding with AICTE/regulatory approval criteria
  - CRUD for rules with version incrementing on update
  - Dynamic rule loader.
- [ ] Validation execution engine (`app/services/validator.py`):
  - Completeness validation (missing mandatory documents per category)
  - Expiry date validation against submission date & academic year
  - Cross-document institution name consistency (fuzzy matching)
  - Cross-document institution ID consistency
  - Chronological consistency (issue date <= expiry date)
  - Duplicate file submission detection
  - Anomaly heuristics (PDF creation date vs claimed issue date).
- [ ] Findings generator persisting findings linked to validation runs and rule snapshots.

### Phase 6: Verification Adapters, Reviewer Workflow & Audit
- [ ] Verification adapter layer (`app/services/verification/`):
  - `BaseVerificationAdapter` interface
  - `MockAICTERegistryAdapter` simulating AICTE Approval Portal
  - `MockFireSafetyRegistryAdapter` simulating Municipal Fire NOC Registry
  - Transparent badges and metadata marking simulations.
- [ ] Reviewer workflow endpoints (`app/routers/findings.py`, `app/routers/applications.py`):
  - Update finding status (`FLAGGED`, `CONFIRMED`, `DISMISSED`, `RESOLVED`, `NEEDS_ADDITIONAL_EVIDENCE`)
  - Reviewer notes and rationale tracking
  - Field correction override endpoints.
- [ ] Audit trail system (`app/services/audit.py`):
  - Logging of all mutations with timestamp, user ID, and IP address.
  - Endpoint `GET /api/audit`.

### Phase 7: Dashboard, Analytics & Reporting
- [ ] Summary analytics endpoint (`app/routers/dashboard.py`):
  - Total applications, pending scrutiny, expired certificates, incomplete dossiers
  - Finding distribution by severity and status.
- [ ] Export service (`app/services/reporter.py`):
  - Export comprehensive Scrutiny Report as HTML, JSON, and CSV.

### Phase 8: Frontend Web Application
- [ ] Modern, high-aesthetic Vanilla JS & CSS UI (`frontend/`):
  - Glassmorphism, tailored dark/light palettes, responsive layouts
  - Navigation bar with user profile and role badge
  - Real-time Dashboard with KPI counters and alert cards
  - Application Management Hub (list, filter, create modal)
  - Application Scrutiny Workspace:
    * Application metadata and lifecycle progress bar
    * Document upload zone with drag-and-drop and instant hash feedback
    * Side-by-side Document & Extracted Field evidence inspector
    * Validation Engine execution trigger
    * Findings List with severity filters, evidence viewer, and review action modal
    * Verification Status panel with simulated registry results
    * Download Report buttons (HTML, JSON, CSV)
  - Rule Management Panel (enable/disable rules, view parameters)
  - Audit Trail Viewer.

### Phase 9: Automated Testing & Verification
- [ ] Comprehensive pytest test suite (`tests/`):
  - Test authentication & RBAC guards
  - Test document upload security & deduplication
  - Test digital PDF extraction and field parsing
  - Test date normalization & edge cases
  - Test validation engine: completeness, expiry, cross-document inconsistencies
  - Test mock verification adapters
  - Test finding review workflow
  - Test audit log generation
  - Test report generation
  - Test dashboard live aggregations.
- [ ] Synthetic test documents generator (`scripts/generate_sample_docs.py`) to create realistic PDF/image samples for demonstration.

### Phase 10: Final Documentation & Presentation Demo Script
- [ ] Windows quickstart script (`run.bat` / PowerShell)
- [ ] Seed script for demo data (`scripts/seed_demo_data.py`)
- [ ] End-to-end demonstration guide.
