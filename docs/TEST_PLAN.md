# Test Plan & Verification Strategy

## 1. Testing Philosophy
The system handles sensitive regulatory compliance workflows. As automated algorithms advise human reviewers, our tests must rigorously verify:
1. Determinism and reproducibility of validation rules.
2. Robust error handling for malformed, corrupt, or unsupported documents.
3. Edge cases in date parsing, format variations, and OCR ambiguity.
4. Prevention of security vulnerabilities (path traversal, file injection, unauthorized role access).
5. Accurate live aggregation of dashboard metrics without mock artifacts in production pathways.

---

## 2. Test Suites & Coverage Matrix

| Test Suite | File | Focus Areas |
| :--- | :--- | :--- |
| **Health & Core API** | `tests/test_api_health.py` | API status, OpenAPI doc generation, database connectivity. |
| **Auth & RBAC** | `tests/test_auth_rbac.py` | Login, JWT lifecycle, password hashing, role enforcement (`admin`, `reviewer`, `institution`). |
| **Application Lifecycle** | `tests/test_applications.py` | CRUD operations, category requirements, status transitions. |
| **Document Upload & Security** | `tests/test_document_upload.py` | Allowed file types, file size limits, safe filename generation, path traversal defense, duplicate SHA-256 detection, corrupt files. |
| **Extraction & Parsers** | `tests/test_extraction.py` | PyMuPDF digital PDF parsing, text extraction, OCR fallback detection, plain text parsing, corrupt file handling. |
| **Field Parsing & Normalization** | `tests/test_field_parser.py` | Regex pattern matching for names, IDs, certificate numbers, date normalization across DD/MM/YYYY, YYYY-MM-DD, month names, fuzzy similarity scoring. |
| **Validation Engine** | `tests/test_validation_engine.py` | Mandatory document completeness per category, expired certificate detection, conflicting issue/expiry dates, cross-document name mismatch, institution ID mismatch, duplicate document submissions, rule version snapshotting. |
| **Verification Adapters** | `tests/test_verification_adapters.py` | Mock AICTE adapter, Mock Fire Safety adapter, status handling (`VERIFIED`, `MISMATCH`, `EXPIRED`, `MOCK_SIMULATED`). |
| **Reviewer Workflow & Audit** | `tests/test_reviewer_workflow.py` | Finding status mutations, reviewer notes, field overrides, audit event logging. |
| **Dashboard & Reports** | `tests/test_dashboard_reports.py` | Dynamic KPI calculations from actual DB rows, HTML report generation, JSON export, CSV export. |

---

## 3. Test Fixtures & Synthetic Test Assets
- `sample_clean_pdf`: Synthetic digital PDF with standard regulatory metadata.
- `sample_expired_cert_pdf`: Synthetic Fire NOC with past expiry date.
- `sample_name_mismatch_pdf`: Synthetic certificate with slightly altered institution name (e.g. "Apex Institute of Engg" vs "Apex Engineering College").
- `sample_duplicate_pdf`: Re-submitted identical document.
- `sample_corrupt_file`: Zero-byte file or random binary content.
- `sample_image_doc`: Synthetic PNG/JPEG document for OCR image extraction.

---

## 4. Execution Commands
```bash
# Run full automated test suite with verbose output
pytest -v --tb=short

# Run specific validation engine tests
pytest tests/test_validation_engine.py -v

# Run with test coverage
pytest --cov=app tests/
```
