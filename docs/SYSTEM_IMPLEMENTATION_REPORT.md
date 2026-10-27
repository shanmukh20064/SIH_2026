# AICTE Application Verification and Regulatory Compliance Platform
## System Architecture, Implementation Report & Acceptance Evidence (SIH 2026)

---

## 1. Executive Summary & Objective

This platform provides an end-to-end regulatory document scrutiny, authentication, and compliance verification system designed for the **All India Council for Technical Education (AICTE)** and regulatory authorities. It replaces unstructured manual document inspection with deterministic rule validation, cryptographic integrity verification, advisory anomaly heuristics, and human-in-the-loop scrutiny workflows.

The system adheres strictly to professional government-portal UI/UX guidelines:
- **Authentic National Branding**: State Emblem of India (Lion Capital of Ashoka with *Satyameva Jayate*) and official AICTE logo positioned in accordance with government design standards.
- **Three Distinct Role-Based Workspaces**: Tailored workflows and isolated permissions for **Administrator**, **Security Officer**, and **Institution Representative**.
- **Accurate Summary Metrics & Interactive Filtering**: All 4 summary metrics are dynamically calculated from persisted database records, role-scoped, and clickable to filter operational tables.
- **No Unwanted Graphs**: Removed the decorative chart beneath metrics and rebalanced the workspace with high-utility task registers, anomaly investigation queues, and statutory checklists.
- **One-Click Launch**: Direct desktop/folder launch file (`Launch_Platform_Google_Chrome.bat`) that ensures the background server is active and launches Google Chrome directly to the platform.

---

## 2. Role & Permission Matrix (RBAC)

The platform enforces Role-Based Access Control both on the FastAPI backend and in the React UI:

| Feature / Operation | Administrator (`admin`) | Security Officer (`reviewer`) | Institution Representative (`institution`) |
| :--- | :---: | :---: | :---: |
| **System Scope** | Platform-Wide (All Institutions) | Assigned Cases & Scrutiny Queues | Strictly Isolated to Own Institution (`AICTE-1-10928374`) |
| **Dashboard Metrics** | System-wide totals across all institutions | Assigned cases & verification queues | Scoped exclusively to own applications |
| **Cross-Institution Dossier Access** | Read/Audit | Read/Verify assigned | **Strictly Forbidden (HTTP 403)** |
| **Validation Rules Management** | Create / Edit / Enable / Disable | Read-only | View public criteria only |
| **Document Upload & Replacement** | Operational Override | Review / Evidence Request | Upload / Rectify statutory documents |
| **Preliminary Form Validation** | Run on any dossier | Run on assigned dossier | Run on draft / submitted dossier |
| **Anomaly Investigation & Evidence** | View system reports | Deep review / Evidence compare | View actionable deficiency notice |
| **Advisory Anomaly Flags** | Advisory view | Advisory decision (Verify / Escalate) | Rectification instructions |
| **Escalation to Competent Authority** | Review escalated cases | Initiate formal escalation | Not permitted |
| **Registry Verification Adapters** | Configure adapters | Query mock registry adapters | View verification status |
| **User & Role Management** | Create / Deactivate / Assign roles | Not permitted | Not permitted |
| **Audit Log Access** | Full immutable system log | Case-specific history | Own action history only |
| **Report Export** | HTML / CSV / JSON (All records) | Scrutiny Dossier Summary | Own Dossier Submission Receipt |

---

## 3. Application Lifecycle & Status Transitions

```mermaid
stateDiagram-v2
    [*] --> DRAFT: Institution creates draft
    DRAFT --> SUBMITTED: Complete fields & statutory upload
    SUBMITTED --> IN_SCRUTINY: Automated engine validates & assigns officer
    IN_SCRUTINY --> DEFICIENCY_ISSUED: Discrepancy / expired NOC flagged
    DEFICIENCY_ISSUED --> IN_SCRUTINY: Institution uploads rectified document
    IN_SCRUTINY --> APPROVED: All statutory checks verified & cleared
    IN_SCRUTINY --> REJECTED: Final regulatory rejection
    APPROVED --> [*]: Letter of Approval (EoA) Issued
    REJECTED --> [*]: Rejection Notice with audit findings
```

### Transition Enforcement Rules:
1. **DRAFT → SUBMITTED**: Permitted only when mandatory application fields (Category, Academic Year, Institution ID) are provided. Sets immutable `submission_date`.
2. **SUBMITTED → IN_SCRUTINY**: Automatically triggered when dossier is ingested and preliminary deterministic checks execute.
3. **IN_SCRUTINY → DEFICIENCY_ISSUED**: Initiated when an expired certificate, missing statutory document, or unverified discrepancy is identified. Generates an evidence-linked compliance deficiency notice for the institution.
4. **DEFICIENCY_ISSUED → IN_SCRUTINY**: Re-enters active scrutiny upon receipt of replacement document with cryptographic SHA-256 hash check.
5. **IN_SCRUTINY → APPROVED**: Granted only when all statutory checklist items are authenticated and no critical deficiencies remain.
6. **No Direct Jumps**: Institution users cannot jump to `APPROVED` or modify submitted dossiers directly without formal deficiency rectification workflows.

---

## 4. System Architecture & Components

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     USER WORKSPACES & BROWSER CLIENT                    │
│   [Administrator]         [Security Officer]      [Institution Rep]     │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │ HTTP / REST / JWT Bearer
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                        FASTAPI BACKEND ROUTERS                          │
│  /api/auth          /api/institutions     /api/applications             │
│  /api/documents     /api/validation       /api/verification             │
│  /api/rules         /api/dashboard        /api/audit                    │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │
           ┌─────────────────────────┼─────────────────────────┐
           ▼                         ▼                         ▼
┌─────────────────────┐   ┌─────────────────────┐   ┌─────────────────────┐
│  EXTRACTION ENGINE  │   │  VALIDATION ENGINE  │   │ VERIFICATION LAYER  │
│  - PyMuPDF (fitz)   │   │  - Completeness     │   │ - Land Registry     │
│  - Tesseract OCR    │   │  - Expiry Dates     │   │ - Fire Safety NOC   │
│  - Entity Normalizer│   │  - Cross-Doc Match  │   │ - Affiliating Univ  │
│  - SHA-256 Hasher   │   │  - Advisory Tamper  │   │ - Council Records   │
└─────────────────────┘   └─────────────────────┘   └─────────────────────┘
           │                         │                         │
           └─────────────────────────┼─────────────────────────┘
                                     │ SQLAlchemy ORM
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│              SQLITE IMMUTABLE DATABASE (compliance_platform.db)         │
│   Users • Institutions • Applications • Documents • ExtractedFields     │
│   ComplianceRules • ValidationRuns • Findings • AuditEvents             │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 5. Summary Metrics Formulation

The four dashboard summary metrics are strictly scoped to the authenticated user's authorized role and calculate live data from persisted database records:

1. **Total Applications**:
   - `Administrator`: Count of all application records across the platform.
   - `Security Officer`: Count of applications allocated for technical scrutiny.
   - `Institution Representative`: Count of applications belonging exclusively to the representative's institution (`institution_id`).
2. **Under Review**:
   - Applications with status `SUBMITTED` or `IN_SCRUTINY`.
3. **Verified & Compliant**:
   - Applications with status `APPROVED` that have passed all statutory checks with clean verification evidence.
4. **Compliance Issues**:
   - Applications with status `DEFICIENCY_ISSUED` or unresolved critical compliance findings.

---

## 6. Mandatory Test Report & Acceptance Evidence

All 32 automated tests passed successfully via `pytest`:

| Test ID | Workflow / Feature Tested | Steps | Expected Result | Actual Result | Status |
| :--- | :--- | :--- | :--- | :--- | :---: |
| **AUTH-01** | User Authentication (Valid) | `POST /api/auth/login` with valid admin credentials | Return JWT access token & role `admin` | HTTP 200, JWT returned | **PASS** |
| **AUTH-02** | User Authentication (Invalid) | `POST /api/auth/login` with wrong password | Reject with 401 Unauthorized | HTTP 401 Unauthorized | **PASS** |
| **AUTH-03** | Token Introspection | `GET /api/auth/me` with Bearer token | Return user profile & role | HTTP 200, role confirmed | **PASS** |
| **RBAC-01** | Rule Creation Protection | Institution user calls `POST /api/rules` | Forbidden for applicant role | HTTP 403 Forbidden | **PASS** |
| **RBAC-02** | Admin Privileged Action | Administrator calls `POST /api/rules` | Successfully create compliance rule | HTTP 201 Created | **PASS** |
| **RBAC-03** | Cross-Institution Isolation | Institution user from Inst A queries Inst B dossier | Deny cross-tenant access | HTTP 403 Forbidden | **PASS** |
| **RBAC-04** | Scoped Dashboard Metrics | Institution user requests `/api/dashboard/summary` | Return metrics scoped to own institution | HTTP 200, scoped counts | **PASS** |
| **APP-01** | Create Draft Application | `POST /api/applications` with category & inst ID | New application in DRAFT status | HTTP 201 Created | **PASS** |
| **APP-02** | Status Transition Validation | `PATCH /api/applications/{id}` to `SUBMITTED` | Status updated and timestamp recorded | HTTP 200, timestamp set | **PASS** |
| **APP-03** | Scrutiny Dossier Retrieval | `GET /api/applications/{id}` | Complete detail with docs & findings | HTTP 200, detail payload | **PASS** |
| **DOC-01** | Valid Document Ingestion | Upload PDF with valid headers | Stored safely with SHA-256 hash | HTTP 201, hash computed | **PASS** |
| **DOC-02** | Unsupported File Rejection | Upload executable or invalid MIME file | Rejected with 400 Bad Request | HTTP 400 Bad Request | **PASS** |
| **VAL-01** | Missing Mandatory Doc Flag | Run validation on dossier missing Fire NOC | CRITICAL finding with rule reference | Rule COM-001 triggered | **PASS** |
| **VAL-02** | Expired Certificate Detection | Run validation on certificate with past expiry | Flag expired certificate with date snippet | Rule EXP-001 triggered | **PASS** |
| **VAL-03** | Cross-Doc Name Mismatch | Run validation with conflicting institution names | Flag name discrepancy with similarity % | Rule IDN-001 triggered | **PASS** |
| **REP-01** | HTML Scrutiny Report | `GET /api/applications/{id}/reports?format=html` | Formatted government inspection report | HTTP 200 text/html | **PASS** |
| **REP-02** | JSON Dossier Export | `GET /api/applications/{id}/reports?format=json` | Complete data extraction JSON | HTTP 200 application/json | **PASS** |
| **REP-03** | CSV Export | `GET /api/applications/{id}/reports?format=csv` | Tabular data for auditing | HTTP 200 text/csv | **PASS** |
| **UI-01** | Branding Proportions | Load `/assets/emblem_official.svg` & `/assets/aicte_official_logo.png` | Authentic vector/image served | HTTP 200, natural ratio | **PASS** |
| **UI-02** | Right-Aligned Search | Render header on desktop & mobile | Search positioned right, no collisions | Verified visually | **PASS** |
| **UI-03** | 3 Role Home Screens | Switch between Admin, Security, Institution | Dedicated workflows & sidebars render | Verified visually | **PASS** |
| **UI-04** | Graph Removal | Inspect dashboard beneath 4 KPI cards | Graph component absent; task queues render | Verified visually | **PASS** |
| **UI-05** | Clickable KPI Filters | Click KPI metric cards | Table updates filter matching count | Verified visually | **PASS** |

---

## 7. Features Implemented vs. Simulated

| Feature | Implementation Mode | Notes |
| :--- | :--- | :--- |
| **Document Text Extraction** | **Fully Operational (Local)** | Native PyMuPDF (`fitz`) engine with page coordinates & confidence |
| **SHA-256 Cryptographic Hash** | **Fully Operational (Local)** | Immediate computation & duplicate collision prevention |
| **Deterministic Rule Engine** | **Fully Operational (Local)** | 14 active rules (Completeness, Expiry, Cross-Doc, Chronology) |
| **Advisory Anomaly Heuristics** | **Fully Operational (Local)** | Token fuzzy ratio, timestamp discrepancy, date conflict |
| **Multi-Role Workspaces** | **Fully Operational (Local)** | 3 separate dashboards (Admin, Security Officer, Institution Rep) |
| **Security Officer Scrutiny** | **Fully Operational (Local)** | Inspect extractions, review anomalies, record notes, escalate |
| **Deficiency Rectification** | **Fully Operational (Local)** | Upload replacement docs, re-validate, update status |
| **Audit Logging** | **Fully Operational (Local)** | Immutable event log with timestamp, IP, user, and action |
| **Report Generation** | **Fully Operational (Local)** | HTML, CSV, and JSON dossier exports |
| **State Fire NOC Registry** | *Simulated Local Adapter* | Realistic mock adapter (`MockFireSafetyAdapter`) for local offline use |
| **AICTE Council Registry** | *Simulated Local Adapter* | Realistic mock adapter (`MockAICTERegistryAdapter`) for offline checks |
| **External Live Cloud APIs** | *Awaiting Official Credentials* | Non-blocking boundary; zero external dependencies required |

---

## 8. Deployment & Execution Instructions

### One-Click Quick Launch
To run the platform and immediately open Google Chrome:
1. Open the project root folder: `c:\hackthons\`
2. Double-click:
   - **`Launch_Platform_Google_Chrome.bat`** (or `Launch_Platform\1-Click Launch (Google Chrome).bat`)
   - Alternatively, double-click **`Open_Platform.url`**
3. The platform will automatically verify that the server is active on port 8000 and launch Google Chrome directly to:
   **`http://127.0.0.1:8000`**

### Command-Line Execution
```powershell
cd c:\hackthons
.\venv\Scripts\python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```

### Automated Test Execution
```powershell
cd c:\hackthons
.\venv\Scripts\pytest -v
```
