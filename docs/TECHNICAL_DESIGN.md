# Technical Design Document

## System Architecture

```
+---------------------------------------------------------------------------------------+
|                                    Frontend Web UI                                     |
|  - Modern Vanilla JS + CSS3 (Glassmorphism, Dark/Light Mode, Accessible, Responsive)   |
|  - Role-based views: Admin, Scrutiny Reviewer, Institution User                       |
|  - Real-time Dashboard, Document Viewer, Extraction Inspector, Finding Resolution Hub |
+-------------------------------------------+-------------------------------------------+
                                            | REST API (HTTP / JSON)
                                            v
+---------------------------------------------------------------------------------------+
|                                FastAPI Application Backend                             |
|                                                                                       |
|  +--------------------+  +----------------------+  +-------------------------------+  |
|  |   Auth & RBAC      |  | Application Service  |  |   Document Storage Service    |  |
|  |   (JWT, Hashing)   |  | (Lifecycle & States) |  | (SHA-256, Sanitization, Disk) |  |
|  +--------------------+  +----------------------+  +-------------------------------+  |
|                                                                                       |
|  +--------------------+  +----------------------+  +-------------------------------+  |
|  | Extraction Engine  |  |  Validation Engine   |  | Verification Adapters         |  |
|  | - PyMuPDF (fitz)   |  | - Deterministic Rules|  | - BaseVerificationAdapter     |  |
|  | - Tesseract OCR    |  | - Cross-Doc Matching |  | - MockAICTERegistryAdapter    |  |
|  | - Preprocessing    |  | - Rule Versioning    |  | - MockStateNOCAdapter         |  |
|  +--------------------+  +----------------------+  +-------------------------------+  |
|                                                                                       |
|  +----------------------------------------------+  +-------------------------------+  |
|  |               Audit & Reporting              |  |   Compliance Rule Registry    |  |
|  |  - Immutable Audit Trail                     |  |  - Extensible Dynamic Rules   |  |
|  |  - Scrutiny Report Generator (HTML/JSON/CSV) |  |  - Category-Rule Mapping      |  |
|  +----------------------------------------------+  +-------------------------------+  |
+-------------------------------------------+-------------------------------------------+
                                            | SQLAlchemy ORM (Async/Sync SQLite / Postgres)
                                            v
+---------------------------------------------------------------------------------------+
|                                  Relational Database                                  |
|   Users | Institutions | Applications | Documents | ExtractedFields | Rules           |
|   ValidationRuns | Findings | VerificationAttempts | ReviewActions | AuditLogs        |
+---------------------------------------------------------------------------------------+
```

---

## 1. Database Schema Design (SQLAlchemy ORM)

### Entities & Relationships
1. **`users`**:
   - `id`: UUID (Primary Key)
   - `username`: String(64), unique, indexed
   - `email`: String(120), unique, indexed
   - `password_hash`: String(255)
   - `full_name`: String(120)
   - `role`: Enum(`admin`, `reviewer`, `institution`)
   - `is_active`: Boolean, default True
   - `created_at`: DateTime (UTC)

2. **`institutions`**:
   - `id`: UUID (PK)
   - `institution_code`: String(50), unique, indexed (e.g. `AICTE-1-9876543210`)
   - `name`: String(255), indexed
   - `category`: String(50) (e.g., `Engineering & Technology`, `Management`, `Pharmacy`)
   - `state`: String(100)
   - `district`: String(100)
   - `address`: Text
   - `created_at`: DateTime

3. **`applications`**:
   - `id`: UUID (PK)
   - `application_number`: String(50), unique, indexed (e.g. `APP-2026-0042`)
   - `institution_id`: UUID (FK -> `institutions.id`)
   - `category`: Enum(`NEW_INSTITUTION`, `EXTENSION_OF_APPROVAL`, `INCREASE_INTAKE`, `NEW_COURSE`, `CLOSURE`)
   - `academic_year`: String(20) (e.g. `2026-2027`)
   - `status`: Enum(`DRAFT`, `SUBMITTED`, `IN_SCRUTINY`, `DEFICIENCY_ISSUED`, `APPROVED`, `REJECTED`)
   - `submitted_at`: DateTime (nullable)
   - `created_by_user_id`: UUID (FK -> `users.id`)
   - `created_at`, `updated_at`: DateTime

4. **`documents`**:
   - `id`: UUID (PK)
   - `application_id`: UUID (FK -> `applications.id`, cascade)
   - `document_type`: String(100) (e.g. `LAND_TITLE_DEED`, `BUILDING_COMPLETION_CERT`, `FIRE_SAFETY_NOC`, `OCCUPANCY_CERTIFICATE`, `PREVIOUS_APPROVAL_LETTER`, `AFFILIATING_UNIVERSITY_NOC`, `FINANCIAL_AUDIT_REPORT`)
   - `original_filename`: String(255)
   - `storage_filename`: String(255), unique
   - `file_path`: String(500)
   - `file_size_bytes`: Integer
   - `mime_type`: String(100)
   - `sha256_hash`: String(64), indexed
   - `is_scanned`: Boolean, default False
   - `page_count`: Integer, default 1
   - `processing_status`: Enum(`PENDING`, `EXTRACTED`, `FAILED`, `MANUAL_REVIEW_NEEDED`)
   - `upload_timestamp`: DateTime
   - `uploaded_by_user_id`: UUID (FK -> `users.id`)

5. **`extracted_fields`**:
   - `id`: UUID (PK)
   - `document_id`: UUID (FK -> `documents.id`, cascade)
   - `field_name`: String(100) (e.g., `institution_name`, `institution_id`, `certificate_number`, `issue_date`, `expiry_date`, `issuing_authority`, `land_area_acres`, `built_up_sqm`)
   - `extracted_value`: Text
   - `normalized_value`: Text (normalized dates ISO `YYYY-MM-DD`, alphanumeric IDs uppercase)
   - `confidence`: Float (0.0 to 1.0)
   - `source_page`: Integer (default 1)
   - `raw_text_snippet`: Text
   - `bounding_box`: JSON (nullable, `[x0, y0, x1, y1]`)
   - `is_inferred`: Boolean (False if directly matched, True if inferred via regex context)
   - `reviewer_corrected_value`: Text (nullable)
   - `reviewed_by_user_id`: UUID (FK -> `users.id`, nullable)
   - `created_at`: DateTime

6. **`compliance_rules`**:
   - `id`: UUID (PK)
   - `rule_code`: String(50), unique, indexed (e.g. `RULE-DOC-MANDATORY`, `RULE-CERT-EXPIRY`, `RULE-CROSSDOC-NAME`)
   - `title`: String(255)
   - `category`: String(100) (e.g., `COMPLETENESS`, `EXPIRY`, `CONSISTENCY`, `INTEGRITY`, `CATEGORY_SPECIFIC`)
   - `severity`: Enum(`CRITICAL`, `MAJOR`, `MINOR`, `INFO`)
   - `version`: Integer, default 1
   - `is_enabled`: Boolean, default True
   - `description`: Text
   - `rule_config`: JSON (stores configurable thresholds, required doc types per category, validity buffers)
   - `created_at`, `updated_at`: DateTime

7. **`validation_runs`**:
   - `id`: UUID (PK)
   - `application_id`: UUID (FK -> `applications.id`, cascade)
   - `executed_by_user_id`: UUID (FK -> `users.id`)
   - `rule_versions_snapshot`: JSON (records `{rule_code: version}`)
   - `total_findings`: Integer
   - `critical_findings`: Integer
   - `major_findings`: Integer
   - `minor_findings`: Integer
   - `status`: Enum(`SUCCESS`, `FAILED`, `PARTIAL`)
   - `summary`: Text
   - `started_at`, `completed_at`: DateTime

8. **`findings`**:
   - `id`: UUID (PK)
   - `validation_run_id`: UUID (FK -> `validation_runs.id`, cascade)
   - `application_id`: UUID (FK -> `applications.id`, cascade)
   - `document_id`: UUID (FK -> `documents.id`, nullable)
   - `rule_code`: String(50)
   - `rule_version`: Integer
   - `severity`: Enum(`CRITICAL`, `MAJOR`, `MINOR`, `INFO`)
   - `title`: String(255)
   - `explanation`: Text
   - `evidence_text`: Text
   - `detection_method`: String(100) (e.g., `DETERMINISTIC_RULE`, `FUZZY_STRING_MATCH`, `HASH_COLLISION`, `OCR_METADATA_DISCREPANCY`)
   - `recommended_action`: Text
   - `review_status`: Enum(`FLAGGED`, `CONFIRMED`, `DISMISSED`, `RESOLVED`, `NEEDS_ADDITIONAL_EVIDENCE`)
   - `reviewer_notes`: Text (nullable)
   - `reviewed_by_user_id`: UUID (FK -> `users.id`, nullable)
   - `reviewed_at`: DateTime (nullable)

9. **`verification_attempts`**:
   - `id`: UUID (PK)
   - `application_id`: UUID (FK -> `applications.id`, cascade)
   - `document_id`: UUID (FK -> `documents.id`, cascade)
   - `adapter_name`: String(100)
   - `external_reference`: String(100)
   - `status`: Enum(`VERIFIED`, `MISMATCH`, `EXPIRED`, `PENDING`, `SOURCE_UNAVAILABLE`, `MANUAL_VERIFICATION_REQUIRED`, `MOCK_SIMULATED`)
   - `response_payload`: JSON
   - `attempted_at`: DateTime

10. **`audit_events`**:
    - `id`: UUID (PK)
    - `user_id`: UUID (FK -> `users.id`, nullable for system actions)
    - `action`: String(100) (e.g. `LOGIN`, `UPLOAD_DOCUMENT`, `EXECUTE_VALIDATION`, `UPDATE_FINDING`, `UPDATE_RULE`, `APPLICATION_STATUS_CHANGE`)
    - `resource_type`: String(100)
    - `resource_id`: String(100)
    - `ip_address`: String(50)
    - `details`: JSON
    - `timestamp`: DateTime (UTC)

---

## 2. Document Extraction Engine Pipeline

```
Raw Upload (.pdf / .png / .jpg / .txt)
   │
   ├─► Validate Magic Bytes, File Extension & Max Size (25MB)
   │
   ├─► Compute SHA-256 Hash -> Check for Exact Duplicate in DB
   │
   ├─► Extract Content:
   │     ├─ If .txt -> Direct UTF-8 decode
   │     ├─ If .pdf -> PyMuPDF (fitz) text & metadata extraction
   │     │    ├─ Check text density (chars per page)
   │     │    ├─ If text density > threshold -> Digital PDF text stream
   │     │    └─ If text density <= threshold -> Render page as pixmap -> OCR
   │     └─ If image (.png, .jpg) -> Image Preprocessing -> OCR
   │
   ├─► OCR Sub-pipeline (Tesseract with OpenCV/PIL):
   │     ├─ Convert to grayscale
   │     ├─ Adaptive thresholding / Otsu binarization
   │     ├─ Deskewing & noise reduction
   │     └─ pytesseract extraction with bounding box coordinates
   │
   ├─► Field Extraction Service (Hybrid Pattern & Entity Recognition):
   │     ├─ Institution Name (Header heuristic & regex token matching)
   │     ├─ Institution ID / Registration No. (Pattern: [A-Z0-9-]{6,20})
   │     ├─ Certificate Number (Pattern: (No\.|Ref\.|Cert)[\s:]*([A-Za-z0-9\/-]+))
   │     ├─ Issue Date & Expiry Date (Date normalization: DD/MM/YYYY, YYYY-MM-DD, etc.)
   │     ├─ Issuing Authority (Keyword dictionaries: AICTE, Directorate, Fire, Town Planning)
   │     └─ Land / Area metrics (Numerical + unit regex: acres, sq. meters, sq. ft)
   │
   └─► Persist to `extracted_fields` with raw context, coordinates & confidence score
```

---

## 3. Validation Rules Engine

The validation engine runs a deterministic rule-graph:
1. **Rule 101: Mandatory Document Completeness (`RULE-DOC-MANDATORY`)**
   - For `EXTENSION_OF_APPROVAL`: Requires `FIRE_SAFETY_NOC`, `BUILDING_COMPLETION_CERT`, `PREVIOUS_APPROVAL_LETTER`.
   - For `NEW_INSTITUTION`: Requires above + `LAND_TITLE_DEED`, `LAND_USE_CERTIFICATE`, `AFFILIATING_UNIVERSITY_NOC`.
2. **Rule 102: Certificate Expiry Check (`RULE-CERT-EXPIRY`)**
   - Parses normalized certificate expiry dates.
   - Flags if `expiry_date < application.submission_date` (`CRITICAL`).
   - Flags if `expiry_date < academic_year_end` (`MAJOR`, warning for upcoming expiry).
3. **Rule 103: Cross-Document Identity Consistency (`RULE-CROSSDOC-NAME`)**
   - Compares institution name across all submitted documents.
   - Calculates string similarity (Levenshtein ratio / token overlap).
   - If similarity < 0.85, flags discrepancy with specific text evidence from conflicting docs.
4. **Rule 104: Permanent Institution ID Consistency (`RULE-CROSSDOC-ID`)**
   - Confirms that the extracted Institution ID across all documents matches the application master ID.
5. **Rule 105: Chronological Coherence (`RULE-DATE-COHERENCE`)**
   - Ensures `issue_date <= expiry_date`.
   - Ensures document `issue_date <= application.submission_date`.
6. **Rule 106: Duplicate Submission Check (`RULE-DOC-DUPLICATE`)**
   - Flags documents with identical SHA-256 hashes attached to different document types or applications.
7. **Rule 107: Anomaly & Tampering Indicator (`RULE-ANOMALY-METADATA`)**
   - Inspects PDF metadata: modification date before creation date, mismatch between claimed certificate date and document digital creation timestamp (> 5 years gap).

---

## 4. Verification Adapter Architecture

An abstract base class `BaseVerificationAdapter` defines:
```python
class VerificationResult:
    status: VerificationStatus  # VERIFIED, MISMATCH, EXPIRED, SOURCE_UNAVAILABLE, MOCK_SIMULATED
    issuer_name: str
    registry_reference: str
    details: dict
    timestamp: datetime
    is_mock: bool = True

class BaseVerificationAdapter(ABC):
    @abstractmethod
    def verify_certificate(self, cert_number: str, institution_name: str, doc_type: str) -> VerificationResult:
        pass
```
Implementations:
- `MockAICTERegistryAdapter`: Simulates AICTE Approval Portal registry.
- `MockFireSafetyRegistryAdapter`: Simulates State Fire & Emergency Services NOC registry.
- Clear transparency labels: All verification cards on the frontend and in the audit reports explicitly badge mock outcomes as `MOCK / SIMULATED REGISTRY`.

---

## 5. Security & RBAC Implementation

- **JWT Tokens**: 24-hour expiration, HS256 algorithm with secret key configurable via environment variable.
- **Password Security**: Passlib with bcrypt or PBKDF2 with SHA-256 (no external C binary dependency if bcrypt unavailable).
- **Safe File Storage**:
  - Uploads saved in `storage/documents/<safe_uuid>.<safe_ext>`.
  - Database stores relative path and sanitized original name.
  - Downloads streamed via authenticated endpoint checking user permissions.
  - No executable extensions allowed (`.exe`, `.bat`, `.sh`, `.php`, `.py`, `.js` strictly rejected).
- **Audit Logging**: Asynchronous/hook-based recording of every mutating action into `audit_events`.
