# Product Requirements Document (PRD)

## Project Title
**AI-Powered Application Validation, Document Authentication and Regulatory Compliance Verification** (SIH 2026 Prototype)

---

## 1. Executive Summary & Objective

Regulatory bodies governing higher education (such as AICTE, UGC, NBA, and State Technical Boards) process tens of thousands of institutional applications annually for initial approval, extension of approval (EoA), course additions, seat quota variations, and accreditation. 

Currently, manual scrutiny of these applications involves examining dozens of diverse documents per institution (Land Title Deeds, Building Completion Certificates, Fire Safety Certificates, AICTE Previous Approvals, Faculty Lists, Land Use Certificates, Pollution Control NOCs, and Financial Audit Statements). This process is prone to oversight, fatigue, document tampering, submission of expired certificates, cross-document discrepancies (e.g. mismatched institution names, differing survey numbers, conflicting addresses), and deliberate fabrication.

### Core Objective
Build a web-based, explainable, and secure regulatory scrutiny platform that empowers authorized reviewers to systematically validate educational institution applications. 
The platform:
1. Automates the ingestion, hashing, and secure storage of application dossiers and certificates.
2. Extracts structured text and metadata from digital PDFs, scanned PDFs, images, and text files using high-fidelity parsers (PyMuPDF) and OCR (Tesseract with image preprocessing).
3. Executes a multi-stage validation engine evaluating document completeness, validity dates, certificate expiry, cross-document identity consistency, duplicate submissions, and category-specific regulatory mandates.
4. Distinguishes hard factual extractions from heuristic inferences and anomaly indicators.
5. Employs a human-in-the-loop workflow: AI/algorithmic checks assist human scrutiny by highlighting evidence-linked findings without independently declaring fraud or making unappealable regulatory decisions.
6. Connects to an extensible verification layer with simulated/mock official registry adapters (simulating AICTE / State Registry checks) with clear labeling.
7. Produces comprehensive, auditable compliance reports (HTML/JSON/CSV) and an immutable audit log of all reviewer actions.

---

## 2. Target Personas & User Roles

| Role | Responsibilities & Capabilities |
| :--- | :--- |
| **Reviewer / Scrutiny Officer** | Scrutinizes assigned institution applications; views side-by-side document extractions with source evidence; reviews automated findings; marks findings as confirmed, dismissed, resolved, or requiring additional evidence; submits reviewer notes; generates compliance reports. |
| **Administrator** | Manages compliance rules and versioning; configures category requirements and validation thresholds; inspects system-wide audit logs; manages user accounts and institutional master data. |
| **Institution Representative** *(Applicant)* | Creates application records, selects application category (e.g., Extension of Approval, New Institution, Seat Increase), uploads required regulatory documents, and views application review status and deficiency notices. |

---

## 3. Scope & Key Functional Requirements

### Module 1: Application Management
- **FR-1.1**: Multi-category support (e.g., `New Institution Setup`, `Extension of Approval (EoA)`, `Increase in Intake / New Course`, `Closure of Institute/Course`).
- **FR-1.2**: Metadata capture: Institution Name, Permanent Institute ID (PID), Application Category, Academic Year, Affiliating University, State/District, Submission Date, Processing Status (`Draft`, `Submitted`, `In Scrutiny`, `Deficiency Issued`, `Approved`, `Rejected`).
- **FR-1.3**: Status lifecycle transitions driven by reviewer actions with time-stamped history.

### Module 2: Secure Document Upload & Management
- **FR-2.1**: Supported file formats: `.pdf` (digital and scanned), `.png`, `.jpg`, `.jpeg`, `.txt`. Max upload size: 25 MB per file.
- **FR-2.2**: Security controls: File magic bytes validation, safe UUID-based disk storage paths, strict path-traversal prevention, sanitization of original filenames.
- **FR-2.3**: Integrity & Deduplication: Compute cryptographic SHA-256 hash upon upload; instantly identify duplicate document submissions across applications or within the same dossier.
- **FR-2.4**: Tamper-evident metadata: Stores mime-type, byte size, page count, upload timestamp, and uploader identity.

### Module 3: Document Extraction & Evidence Extraction
- **FR-3.1**: Digital PDF parsing via PyMuPDF (`fitz`) extracting text, embedded metadata, and page coordinates.
- **FR-3.2**: Automatic scan detection: If text density falls below minimum threshold (e.g., < 30 characters per page), routes to OCR pipeline.
- **FR-3.3**: OCR Pipeline: Image preprocessing (grayscale, Otsu binarization, noise filtering) feeding into Tesseract OCR.
- **FR-3.4**: Entity & Field Extraction: Structured extraction of key entities:
  - Institution Name & Identifier
  - Document / Certificate Number
  - Issue Date & Expiry / Validity Date
  - Issuing Authority (e.g., Municipal Corporation, Fire & Emergency Services, AICTE, Land Revenue Dept)
  - Land Area / Built-up Area / Survey Numbers
- **FR-3.5**: Evidence linkage: Every extracted field preserves its source document ID, page number, raw matched snippet, and extraction confidence level (0.0 - 1.0).
- **FR-3.6**: Reviewer overrides: Reviewers can manually correct misrecognized fields; corrections are logged with the reviewer's ID.

### Module 4: Application Validation Engine
- **FR-4.1**: **Completeness Check**: Verifies presence of mandatory documents based on the active application category.
- **FR-4.2**: **Certificate Expiry Check**: Validates whether certificates (e.g. Fire Safety, Building Safety, Affiliation) were expired as of submission date or will expire during the upcoming academic cycle.
- **FR-4.3**: **Cross-Document Identity Consistency**: Compares Institution Name, Permanent Institute ID, and Address across all uploaded documents (e.g., Land Title vs. Fire NOC vs. Previous Approval). Flag fuzzy variations (Levenshtein distance / Token Set Ratio).
- **FR-4.4**: **Conflicting Dates & Certificate Numbers**: Identifies contradictions, such as an issue date occurring after an expiry date, or duplicate certificate numbers assigned to different authorities.
- **FR-4.5**: **Duplicate Document Detection**: Exact hash collision detection.
- **FR-4.6**: **Anomaly & Tampering Heuristics**: Detects suspicious metadata mismatches (e.g. PDF creation date newer than claimed certificate issue date, mismatched font signatures or zero-text image scans posing as digital vector PDFs).

### Module 5: Configurable Compliance Rules
- **FR-5.1**: Rules defined in dynamic database records rather than hardcoded client logic.
- **FR-5.2**: Parameters: Rule ID, Title, Category, Severity (`CRITICAL`, `MAJOR`, `MINOR`, `INFO`), Version, Enabled Flag, JSON rule configuration (e.g., allowed validity window, required document types).
- **FR-5.3**: Version locking: Validation runs record the exact rule version used, preserving historical compliance fidelity.

### Module 6: Issuer Verification Integration
- **FR-6.1**: Modular adapter architecture for external verification APIs.
- **FR-6.2**: Standardized verification response model:
  - Status: `VERIFIED`, `MISMATCH`, `EXPIRED`, `PENDING`, `SOURCE_UNAVAILABLE`, `MANUAL_VERIFICATION_REQUIRED`, `MOCK_SIMULATED`.
  - Details: Issuer Name, Reference Registry, Verification Timestamp, Registry Response Code, Notes.
- **FR-6.3**: Simulated Mock Adapter with realistic edge cases (pre-configured to simulate valid registries, expired records, and server timeouts for demonstration).

### Module 7: Reviewer Workflow
- **FR-7.1**: Unified scrutiny interface showing application dossier, documents, side-by-side extracted text, and validation findings.
- **FR-7.2**: Interactive finding management: Reviewers can set status (`FLAGGED`, `CONFIRMED`, `DISMISSED`, `RESOLVED`, `NEEDS_EVIDENCE`) and input reviewer rationale.
- **FR-7.3**: Final Recommendation: Reviewer can recommend Approval, Deficiencies/Notice, or Rejection with formal notes.

### Module 8: Dashboard, Analytics & Reporting
- **FR-8.1**: Real-time aggregated metrics: Total Applications, Pending Scrutiny, Expired Certificates Flagged, Incomplete Dossiers, Critical Violations Count.
- **FR-8.2**: Search, multi-attribute filter (by Category, Academic Year, Status, Severity), and pagination.
- **FR-8.3**: Formal Scrutiny Report Generation in downloadable formats (HTML, JSON, CSV).

### Module 9: Security, RBAC & Auditability
- **FR-9.1**: PBKDF2/bcrypt password hashing with JWT bearer authentication.
- **FR-9.2**: Role-Based Access Control enforcing permissions at backend API endpoints.
- **FR-9.3**: Comprehensive Audit Log: Logs User ID, Action (`DOCUMENT_UPLOAD`, `VALIDATION_RUN`, `FINDING_REVIEW`, `STATUS_CHANGE`, `RULE_UPDATE`), Timestamp, IP Address, and Resource Reference.

---

## 4. Non-Functional Requirements
- **Performance**: Document processing (< 3s for digital PDFs under 10 pages; < 8s for OCR scanned images).
- **Security**: Local-first; no data transmitted to third-party paid AI endpoints. OWASP compliant file upload and auth validation.
- **Reliability & Portability**: Runs natively on Windows and Linux using Python 3.10+ and SQLite/PostgreSQL.
- **Transparency**: Every flag includes explicit human-readable reasons, source document references, and regulatory rule citations.
