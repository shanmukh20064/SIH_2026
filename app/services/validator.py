from datetime import datetime, timezone
import re
from typing import List, Dict, Any, Optional, Tuple
from sqlalchemy.orm import Session
from app.models.application import Application
from app.models.document import Document
from app.models.extracted_field import ExtractedField
from app.models.rule import ComplianceRule
from app.models.validation import ValidationRun, Finding

def compute_token_similarity(s1: str, s2: str) -> float:
    """Computes pure-Python token similarity ratio between two strings (0.0 to 1.0)."""
    if not s1 or not s2:
        return 0.0
    
    stop_words = {"of", "the", "and", "&", "for", "in", "at", "an", "a", "college", "institute", "technology"}
    tokens1 = set([w.lower() for w in re.findall(r'\b[A-Za-z0-9]+\b', s1) if w.lower() not in stop_words])
    tokens2 = set([w.lower() for w in re.findall(r'\b[A-Za-z0-9]+\b', s2) if w.lower() not in stop_words])
    
    if not tokens1 or not tokens2:
        # Fall back to all alphanumeric tokens if stop words removed everything
        tokens1 = set([w.lower() for w in re.findall(r'\b[A-Za-z0-9]+\b', s1)])
        tokens2 = set([w.lower() for w in re.findall(r'\b[A-Za-z0-9]+\b', s2)])

    intersection = tokens1.intersection(tokens2)
    union = tokens1.union(tokens2)
    return len(intersection) / len(union) if union else 1.0

def execute_application_validation(
    db: Session,
    application_id: str,
    user_id: Optional[str] = None
) -> ValidationRun:
    """
    Executes all enabled compliance rules against the given application and its uploaded documents.
    Generates an immutable ValidationRun with rule versions snapshot and evidence-backed findings.
    """
    application = db.query(Application).filter(Application.id == application_id).first()
    if not application:
        raise ValueError(f"Application {application_id} not found.")

    documents = db.query(Document).filter(Document.application_id == application_id).all()
    active_rules = db.query(ComplianceRule).filter(ComplianceRule.is_enabled == True).all()

    # Rule version snapshot
    rule_versions_snapshot = {rule.rule_code: rule.version for rule in active_rules}
    rule_map = {rule.rule_code: rule for rule in active_rules}

    now_utc = datetime.now(timezone.utc)
    submission_dt = application.submission_date or now_utc

    findings_to_create = []

    # Map of uploaded document types
    docs_by_type: Dict[str, List[Document]] = {}
    doc_hashes: Dict[str, Document] = {}

    for doc in documents:
        docs_by_type.setdefault(doc.document_type, []).append(doc)
        
        # Check duplicate hashes within application dossier
        if doc.sha256_hash in doc_hashes:
            prior_doc = doc_hashes[doc.sha256_hash]
            rule = rule_map.get("RULE-DOC-DUPLICATE")
            if rule:
                findings_to_create.append({
                    "application_id": application.id,
                    "document_id": doc.id,
                    "rule_code": rule.rule_code,
                    "rule_version": rule.version,
                    "severity": rule.severity,
                    "title": f"Duplicate File Collision Detected ({doc.document_type})",
                    "explanation": f"Document '{doc.original_filename}' has an identical SHA-256 hash ({doc.sha256_hash[:16]}...) to '{prior_doc.original_filename}' uploaded under '{prior_doc.document_type}'.",
                    "evidence_text": f"SHA-256 Hash: {doc.sha256_hash}\nMatches Document ID: {prior_doc.id} ({prior_doc.original_filename})",
                    "detection_method": "HASH_COLLISION",
                    "recommended_action": "Verify if the applicant erroneously uploaded the same certificate file for two distinct requirement categories.",
                    "review_status": "FLAGGED"
                })
        else:
            doc_hashes[doc.sha256_hash] = doc

    # Rule 1: RULE-DOC-MANDATORY (Completeness check)
    rule_mandatory = rule_map.get("RULE-DOC-MANDATORY")
    if rule_mandatory:
        category_reqs = rule_mandatory.rule_config.get("category_requirements", {})
        required_types = category_reqs.get(application.category, [])
        for req_type in required_types:
            if req_type not in docs_by_type or len(docs_by_type[req_type]) == 0:
                findings_to_create.append({
                    "application_id": application.id,
                    "document_id": None,
                    "rule_code": rule_mandatory.rule_code,
                    "rule_version": rule_mandatory.version,
                    "severity": rule_mandatory.severity,
                    "title": f"Missing Mandatory Document: {req_type}",
                    "explanation": f"Application category '{application.category}' requires statutory document '{req_type}', which has not been uploaded.",
                    "evidence_text": f"Application Category: {application.category}\nRequired Document Type: {req_type}\nUploaded Types: {', '.join(docs_by_type.keys()) or 'None'}",
                    "detection_method": "DETERMINISTIC_RULE",
                    "recommended_action": f"Request applicant institution to upload official '{req_type}'.",
                    "review_status": "FLAGGED"
                })

    # Load extracted fields for all documents
    for doc in documents:
        fields = db.query(ExtractedField).filter(ExtractedField.document_id == doc.id).all()
        field_dict = {f.field_name: f for f in fields}

        # Check for unreadable / failed processing
        if doc.processing_status == "MANUAL_REVIEW_NEEDED":
            findings_to_create.append({
                "application_id": application.id,
                "document_id": doc.id,
                "rule_code": "RULE-DOC-UNREADABLE",
                "rule_version": 1,
                "severity": "MAJOR",
                "title": f"Document Flagged for Manual Scrutiny: {doc.original_filename}",
                "explanation": f"Document '{doc.original_filename}' is scanned or image-based and could not be fully parsed automatically (or OCR binary unavailable).",
                "evidence_text": f"File: {doc.original_filename}\nMIME: {doc.mime_type}\nStatus: {doc.processing_status}",
                "detection_method": "ANOMALY_HEURISTIC",
                "recommended_action": "Reviewer should inspect document visually using the integrated viewer and confirm extracted fields manually.",
                "review_status": "FLAGGED"
            })

        # Rule 2: RULE-CERT-EXPIRY
        rule_expiry = rule_map.get("RULE-CERT-EXPIRY")
        if rule_expiry:
            expiry_f = field_dict.get("expiry_date")
            if expiry_f and expiry_f.normalized_value:
                try:
                    exp_date = datetime.strptime(expiry_f.normalized_value, "%Y-%m-%d").date()
                    sub_date = submission_dt.date() if isinstance(submission_dt, datetime) else submission_dt
                    
                    if exp_date < sub_date:
                        findings_to_create.append({
                            "application_id": application.id,
                            "document_id": doc.id,
                            "rule_code": rule_expiry.rule_code,
                            "rule_version": rule_expiry.version,
                            "severity": "CRITICAL",
                            "title": f"Expired Certificate: {doc.document_type}",
                            "explanation": f"Certificate expired on {exp_date.strftime('%d-%b-%Y')}, prior to application submission date {sub_date.strftime('%d-%b-%Y')}.",
                            "evidence_text": f"Document: {doc.original_filename}\nExtracted Expiry Date: {expiry_f.extracted_value} (Normalized: {exp_date})\nRaw Evidence: {expiry_f.raw_text_snippet}",
                            "detection_method": "DETERMINISTIC_RULE",
                            "recommended_action": "Issue deficiency notice to applicant requiring current, unexpired statutory clearance.",
                            "review_status": "FLAGGED"
                        })
                except Exception:
                    pass

        # Rule 3: RULE-CROSSDOC-NAME (Institution Name Consistency)
        rule_name = rule_map.get("RULE-CROSSDOC-NAME")
        if rule_name and application.institution:
            inst_name_f = field_dict.get("institution_name")
            if inst_name_f and inst_name_f.normalized_value:
                master_name = application.institution.name
                doc_inst_name = inst_name_f.normalized_value
                similarity = compute_token_similarity(master_name, doc_inst_name)
                threshold = rule_name.rule_config.get("similarity_threshold", 0.80)
                
                if similarity < threshold:
                    findings_to_create.append({
                        "application_id": application.id,
                        "document_id": doc.id,
                        "rule_code": rule_name.rule_code,
                        "rule_version": rule_name.version,
                        "severity": rule_name.severity,
                        "title": f"Institution Name Discrepancy in {doc.document_type}",
                        "explanation": f"Document text specifies '{doc_inst_name}', which deviates from registered master institution name '{master_name}' (Similarity: {int(similarity*100)}%).",
                        "evidence_text": f"Master Name: {master_name}\nDocument Extracted: {inst_name_f.extracted_value}\nSnippet: {inst_name_f.raw_text_snippet}\nSimilarity Ratio: {similarity:.2f}",
                        "detection_method": "FUZZY_MATCH",
                        "recommended_action": "Check if institution underwent name change or if certificate belongs to an affiliated/separate entity.",
                        "review_status": "FLAGGED"
                    })

        # Rule 4: RULE-CROSSDOC-ID (PID Consistency)
        rule_pid = rule_map.get("RULE-CROSSDOC-ID")
        if rule_pid and application.institution:
            pid_f = field_dict.get("institution_id")
            if pid_f and pid_f.normalized_value:
                master_pid = re.sub(r'[^A-Za-z0-9]', '', application.institution.institution_code.upper())
                doc_pid = re.sub(r'[^A-Za-z0-9]', '', pid_f.normalized_value.upper())
                if doc_pid and master_pid and doc_pid != master_pid:
                    findings_to_create.append({
                        "application_id": application.id,
                        "document_id": doc.id,
                        "rule_code": rule_pid.rule_code,
                        "rule_version": rule_pid.version,
                        "severity": rule_pid.severity,
                        "title": f"Permanent Institute ID (PID) Mismatch: {doc.document_type}",
                        "explanation": f"Extracted PID '{pid_f.extracted_value}' contradicts registered application PID '{application.institution.institution_code}'.",
                        "evidence_text": f"Master PID: {application.institution.institution_code}\nDocument Extracted PID: {pid_f.extracted_value}\nRaw Snippet: {pid_f.raw_text_snippet}",
                        "detection_method": "DETERMINISTIC_RULE",
                        "recommended_action": "Examine if document was submitted for a different campus or branch.",
                        "review_status": "FLAGGED"
                    })

        # Rule 5: RULE-DATE-COHERENCE (Chronological order)
        rule_dates = rule_map.get("RULE-DATE-COHERENCE")
        if rule_dates:
            issue_f = field_dict.get("issue_date")
            expiry_f = field_dict.get("expiry_date")
            if issue_f and expiry_f and issue_f.normalized_value and expiry_f.normalized_value:
                try:
                    iss_d = datetime.strptime(issue_f.normalized_value, "%Y-%m-%d").date()
                    exp_d = datetime.strptime(expiry_f.normalized_value, "%Y-%m-%d").date()
                    if iss_d > exp_d:
                        findings_to_create.append({
                            "application_id": application.id,
                            "document_id": doc.id,
                            "rule_code": rule_dates.rule_code,
                            "rule_version": rule_dates.version,
                            "severity": rule_dates.severity,
                            "title": f"Chronological Date Inversion in {doc.document_type}",
                            "explanation": f"Stated issue date ({issue_f.normalized_value}) occurs after stated expiry date ({expiry_f.normalized_value}).",
                            "evidence_text": f"Issue Date: {issue_f.extracted_value}\nExpiry Date: {expiry_f.extracted_value}",
                            "detection_method": "DETERMINISTIC_RULE",
                            "recommended_action": "Review document for typographical error or forged dates.",
                            "review_status": "FLAGGED"
                        })
                except Exception:
                    pass

    # Tally findings by severity
    crit_count = sum(1 for f in findings_to_create if f["severity"] == "CRITICAL")
    maj_count = sum(1 for f in findings_to_create if f["severity"] == "MAJOR")
    min_count = sum(1 for f in findings_to_create if f["severity"] == "MINOR")
    info_count = sum(1 for f in findings_to_create if f["severity"] == "INFO")

    summary_msg = f"Validation completed with {len(findings_to_create)} finding(s): {crit_count} Critical, {maj_count} Major, {min_count} Minor."

    # Persist ValidationRun
    validation_run = ValidationRun(
        application_id=application.id,
        executed_by_user_id=user_id,
        rule_versions_snapshot=rule_versions_snapshot,
        total_findings=len(findings_to_create),
        critical_findings=crit_count,
        major_findings=maj_count,
        minor_findings=min_count,
        info_findings=info_count,
        status="SUCCESS",
        summary=summary_msg,
        started_at=now_utc,
        completed_at=datetime.now(timezone.utc)
    )
    db.add(validation_run)
    db.flush()

    for item in findings_to_create:
        finding = Finding(
            validation_run_id=validation_run.id,
            **item
        )
        db.add(finding)

    # Update application status if it was in DRAFT or SUBMITTED
    if application.status in ["DRAFT", "SUBMITTED"]:
        application.status = "IN_SCRUTINY"

    db.commit()
    db.refresh(validation_run)
    return validation_run
