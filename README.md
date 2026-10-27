# AICTE Regulatory Application Verification & Compliance Platform
### SIH 2026 Prototype: Regulatory Document Scrutiny, Authentication & Compliance Verification

[![Python 3.10+](https://img.shields.io/badge/python-3.10+-blue.svg)](https://www.python.org/downloads/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.111+-009688.svg)](https://fastapi.tiangolo.com/)
[![React 18](https://img.shields.io/badge/Frontend-React%2018%20%2B%20Vite-61DAFB.svg)](https://reactjs.org/)
[![Database](https://img.shields.io/badge/Database-SQLite%20(Local)-003B57.svg)](https://www.sqlite.org/)
[![PyMuPDF](https://img.shields.io/badge/Extractor-PyMuPDF-FF5722.svg)](https://pymupdf.readthedocs.io/)
[![Tests](https://img.shields.io/badge/Tests-32%20Passed-brightgreen.svg)](tests/)

An end-to-end, explainable, and secure regulatory document scrutiny and compliance verification platform designed for the **All India Council for Technical Education (AICTE)**, state technical education directorates, and regulatory bodies.

---

## 🚀 One-Click Launch in Google Chrome

To launch the web platform directly in Google Chrome:

1. Open the project root folder: **`c:\hackthons`**
2. Double-click **`Launch_Platform_Google_Chrome.bat`** (or **`Open_Platform.url`**)
3. The platform automatically starts the local FastAPI engine if not already running and launches Google Chrome directly to:
   👉 **`http://127.0.0.1:8000`**

*(To stop the server at any time, run `Launch_Platform\Stop Platform.bat`)*

---

## 🏛️ Key Platform Highlights & Recent Enhancements

### 1. Authentic Government Branding & Header Layout
- **State Emblem of India**: Official Ashoka Lion Capital vector (`/assets/emblem_official.svg`) preserving natural aspect ratio, proportions, and official government-portal styling.
- **Official AICTE Logo**: High-resolution official logo (`/assets/aicte_official_logo.png`) with bilingual lockup ("भारत सरकार / Government of India", "अखिल भारतीय तकनीकी शिक्षा परिषद / AICTE").
- **Right-Aligned Search & Secondary Separation Strip**: Clean search input positioned on the right; horizontal separation strip directly beneath the main header indicating active role workspace and live engine status.
- **Prototype Notice**: Clear prototype demonstration indicator adhering to government disclaimer guidelines.

### 2. Three Distinct Role-Based Workspaces
- **🛡️ Administrator Control Center**:
  - Full platform governance, user & role management, and institutional account oversight.
  - Configurable validation rules (14 active deterministic checks & heuristics).
  - Registry integration health monitoring (Land Records, Fire Dept NOC, University Registries).
  - Central application register with category filters and immutable security audit log.
- **🔍 Security Officer Scrutiny Console**:
  - Technical scrutiny queue of assigned applications with priority tags.
  - Document anomaly and tampering investigation panel with extracted evidence snippets.
  - Advisory forgery notice: heuristics are advisory; decisions require officer verification.
  - Direct scrutiny actions: *Mark Verified*, *Request Additional Evidence*, *Escalate to Competent Authority*.
- **🏛️ Institution Representative Portal**:
  - Institution profile banner strictly isolated to own accredited campus (PID: `AICTE-1-10928374`).
  - Mandatory statutory document checklist (Land Deed, Fire NOC, Building Completion, Faculty List, FDR proof) with live verification states.
  - Actionable compliance deficiency rectification alerts with direct replacement document upload.
  - Submissions tracker and official dossier receipts with cryptographic SHA-256 verification hash.

### 3. Accurate Four Summary Metrics & Interactive Filtering
- Dynamically calculated from persisted database records:
  1. **Total Applications**
  2. **Under Review**
  3. **Verified & Compliant**
  4. **Compliance Issues**
- **Clickable cards**: Clicking any summary metric instantly applies that filter to the operational table below.
- Card counters and list records always agree.

### 4. Rebalanced Workspace (Unwanted Graph Removed)
- The decorative chart was completely removed to eliminate empty space and avoid AI-generated aesthetic clichés.
- Replaced by high-utility task registers, registry integration diagnostics, and evidence-linked discrepancy panels.

---

## 🔐 Default Demonstration Accounts

Switch between roles anytime via the top-right profile pill or login:

| Role | Username | Password | Dedicated Scope |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin` | `Admin@123` | System-wide operations, rules engine, user roles, audit trail |
| **Security Officer** | `reviewer` | `Reviewer@123` | Assigned scrutiny cases, anomaly review, evidence compare |
| **Institution Rep** | `institution` | `Inst@123` | Isolated to Apex Institute of Technology (`AICTE-1-10928374`) |

---

## 🛠️ Technology Architecture

```
Frontend: React 18 + Vite + Tailwind CSS (Gov Portal Theme)
Backend:  FastAPI + SQLAlchemy + Pydantic v2
Storage:  Local Cryptographic Vault (SHA-256 Content-Addressed)
Parser:   PyMuPDF (fitz) + Tesseract OCR (Local Fallback)
Database: SQLite (Immutable WAL Mode)
```

---

## 🧪 Automated Testing

All 32 test suites pass cleanly:
```powershell
.\venv\Scripts\pytest -v
```

Test coverage includes:
- Authentication, token expiration, and RBAC enforcement.
- Cross-institution data isolation (HTTP 403 prevention).
- Document ingestion, MIME validation, and SHA-256 hashing.
- Deterministic rules (Missing documents, expired NOCs, name discrepancies).
- Scrutiny reports generation (HTML, CSV, JSON).

Detailed test execution logs and acceptance matrix are available in:
[docs/SYSTEM_IMPLEMENTATION_REPORT.md](docs/SYSTEM_IMPLEMENTATION_REPORT.md)
