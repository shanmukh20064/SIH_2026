from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from app.models.rule import ComplianceRule

DEFAULT_DEMO_RULES = [
    {
        "rule_code": "RULE-DOC-MANDATORY",
        "title": "Mandatory Regulatory Document Completeness",
        "category": "COMPLETENESS",
        "severity": "CRITICAL",
        "version": 1,
        "is_enabled": True,
        "description": "Verifies that all mandatory regulatory documents required for the specific application category are uploaded in the institutional dossier (Configurable Demonstration Rule).",
        "rule_config": {
            "category_requirements": {
                "EXTENSION_OF_APPROVAL": ["FIRE_SAFETY_NOC", "BUILDING_COMPLETION_CERT", "PREVIOUS_APPROVAL_LETTER"],
                "NEW_INSTITUTION": ["LAND_TITLE_DEED", "FIRE_SAFETY_NOC", "BUILDING_COMPLETION_CERT", "AFFILIATING_UNIVERSITY_NOC"],
                "INCREASE_INTAKE": ["BUILDING_COMPLETION_CERT", "PREVIOUS_APPROVAL_LETTER", "FINANCIAL_AUDIT_REPORT"],
                "NEW_COURSE": ["BUILDING_COMPLETION_CERT", "PREVIOUS_APPROVAL_LETTER", "AFFILIATING_UNIVERSITY_NOC"],
                "CLOSURE": ["PREVIOUS_APPROVAL_LETTER", "AFFILIATING_UNIVERSITY_NOC"]
            }
        }
    },
    {
        "rule_code": "RULE-CERT-EXPIRY",
        "title": "Certificate Expiry & Validity Period Check",
        "category": "EXPIRY",
        "severity": "CRITICAL",
        "version": 1,
        "is_enabled": True,
        "description": "Evaluates normalized expiry dates of time-bound statutory clearances (e.g., Fire Safety NOC, Land Lease). Flags if certificate is already expired as of application submission date or expires before academic term start.",
        "rule_config": {
            "applicable_document_types": ["FIRE_SAFETY_NOC", "AFFILIATING_UNIVERSITY_NOC"],
            "academic_year_start_month": 7  # July
        }
    },
    {
        "rule_code": "RULE-CROSSDOC-NAME",
        "title": "Cross-Document Institution Name Consistency",
        "category": "CONSISTENCY",
        "severity": "MAJOR",
        "version": 1,
        "is_enabled": True,
        "description": "Cross-compares institution name extracted across all uploaded documents against the application master record. Flags significant naming variations or discrepancies.",
        "rule_config": {
            "similarity_threshold": 0.80
        }
    },
    {
        "rule_code": "RULE-CROSSDOC-ID",
        "title": "Permanent Institute ID (PID) Consistency",
        "category": "CONSISTENCY",
        "severity": "CRITICAL",
        "version": 1,
        "is_enabled": True,
        "description": "Validates that the Permanent Institute ID (PID) extracted from certificates matches the institutional master record without conflicts.",
        "rule_config": {}
    },
    {
        "rule_code": "RULE-DATE-COHERENCE",
        "title": "Chronological Coherence of Issue & Expiry Dates",
        "category": "INTEGRITY",
        "severity": "MAJOR",
        "version": 1,
        "is_enabled": True,
        "description": "Ensures that certificate issue dates do not post-date their stated expiry dates or application submission timestamps.",
        "rule_config": {}
    },
    {
        "rule_code": "RULE-DOC-DUPLICATE",
        "title": "Duplicate Document & Hash Collision Detection",
        "category": "INTEGRITY",
        "severity": "MAJOR",
        "version": 1,
        "is_enabled": True,
        "description": "Identifies exact duplicate files submitted under different document types or across multiple application dossiers using cryptographic SHA-256 hashes.",
        "rule_config": {}
    },
    {
        "rule_code": "RULE-ANOMALY-METADATA",
        "title": "Document Anomaly & Discrepancy Heuristic",
        "category": "ANOMALY",
        "severity": "MINOR",
        "version": 1,
        "is_enabled": True,
        "description": "Inspects PDF digital metadata for temporal anomalies, such as digital modification timestamps occurring prior to creation dates, or large chronological gaps between claimed issue date and PDF creation date.",
        "rule_config": {
            "max_creation_issue_gap_years": 5
        }
    }
]

def seed_default_rules(db: Session) -> List[ComplianceRule]:
    """Ensures all default demonstration compliance rules exist in the database."""
    seeded = []
    for r_data in DEFAULT_DEMO_RULES:
        existing = db.query(ComplianceRule).filter(ComplianceRule.rule_code == r_data["rule_code"]).first()
        if not existing:
            rule = ComplianceRule(**r_data)
            db.add(rule)
            seeded.append(rule)
    db.commit()
    return seeded

def get_all_rules(db: Session) -> List[ComplianceRule]:
    return db.query(ComplianceRule).order_by(ComplianceRule.rule_code).all()

def get_rule_by_code(db: Session, rule_code: str) -> Optional[ComplianceRule]:
    return db.query(ComplianceRule).filter(ComplianceRule.rule_code == rule_code).first()

def update_rule(db: Session, rule_code: str, updates: Dict[str, Any]) -> Optional[ComplianceRule]:
    rule = get_rule_by_code(db, rule_code)
    if not rule:
        return None
    
    # Increment version whenever rule configuration or details change
    rule.version += 1
    for key, val in updates.items():
        if hasattr(rule, key) and val is not None:
            setattr(rule, key, val)
    
    db.commit()
    db.refresh(rule)
    return rule
