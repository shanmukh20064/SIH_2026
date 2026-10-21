from typing import Optional, Dict, Any
from app.services.verification.base import BaseVerificationAdapter, VerificationResult

class MockAICTERegistryAdapter(BaseVerificationAdapter):
    """
    Simulated verification adapter modeling integration with the official AICTE Portal / Central Registry.
    Transparently labeled as a MOCK simulation for hackathon demonstration.
    """
    def __init__(self):
        self.issuer_name = "AICTE Approval Portal (Simulated Mock Adapter)"
        # Known demo fixtures in simulated registry
        self.known_registry = {
            "AICTE-EOA-2025-9988": {
                "status": "VERIFIED",
                "institution_name": "APEX INSTITUTE OF TECHNOLOGY",
                "academic_year": "2025-2026",
                "approval_type": "Extension of Approval",
                "registry_id": "REG-AICTE-DEL-8921",
                "validity": "Valid"
            },
            "AICTE-EOA-2024-EXPIRED": {
                "status": "EXPIRED",
                "institution_name": "ZENITH COLLEGE OF ENGINEERING",
                "academic_year": "2024-2025",
                "approval_type": "Extension of Approval",
                "registry_id": "REG-AICTE-DEL-4412",
                "validity": "Expired on 30-Apr-2025"
            }
        }

    def verify(self, cert_number: Optional[str], institution_name: Optional[str], doc_type: str) -> VerificationResult:
        if not cert_number:
            return VerificationResult(
                status="MANUAL_VERIFICATION_REQUIRED",
                issuer_name=self.issuer_name,
                external_reference=None,
                details={
                    "note": "No certificate number available in extracted evidence. Manual verification required by reviewer.",
                    "disclaimer": "Simulated demonstration adapter. No live government database accessed."
                },
                is_mock=True
            )

        clean_ref = cert_number.strip().upper()
        if clean_ref in self.known_registry:
            record = self.known_registry[clean_ref]
            return VerificationResult(
                status=record["status"],
                issuer_name=self.issuer_name,
                external_reference=record["registry_id"],
                details={
                    "registered_name": record["institution_name"],
                    "academic_year": record["academic_year"],
                    "validity": record["validity"],
                    "match_type": "EXACT_REGISTRY_RECORD_MATCH",
                    "disclaimer": "Simulated demonstration response for SIH 2026 prototype."
                },
                is_mock=True
            )

        # Fallback simulation outcome for arbitrary certificate numbers
        return VerificationResult(
            status="MOCK_SIMULATED",
            issuer_name=self.issuer_name,
            external_reference=f"SIM-{abs(hash(clean_ref)) % 100000:05d}",
            details={
                "inquiry_ref": clean_ref,
                "note": "Simulated verification completed: record found in mock registry ledger.",
                "disclaimer": "This is a demonstration mockup. Real deployment connects to official AICTE API gateway."
            },
            is_mock=True
        )
