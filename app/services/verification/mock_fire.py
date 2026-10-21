from typing import Optional, Dict, Any
from app.services.verification.base import BaseVerificationAdapter, VerificationResult

class MockFireSafetyRegistryAdapter(BaseVerificationAdapter):
    """
    Simulated verification adapter modeling integration with State Fire & Emergency Services NOC portals.
    Clearly labeled as MOCK simulation for hackathon demonstration.
    """
    def __init__(self):
        self.issuer_name = "State Fire & Emergency Services Registry (Simulated Mock Adapter)"
        self.mock_db = {
            "FS-NOC-2025-101": {
                "status": "VERIFIED",
                "institution_name": "APEX INSTITUTE OF TECHNOLOGY",
                "valid_till": "2027-03-31",
                "authority": "Chief Fire Officer, Central Division"
            },
            "FS-NOC-2023-EXPIRED": {
                "status": "EXPIRED",
                "institution_name": "APEX INSTITUTE OF TECHNOLOGY",
                "valid_till": "2024-05-10",
                "authority": "Chief Fire Officer, Central Division"
            }
        }

    def verify(self, cert_number: Optional[str], institution_name: Optional[str], doc_type: str) -> VerificationResult:
        if not cert_number:
            return VerificationResult(
                status="MANUAL_VERIFICATION_REQUIRED",
                issuer_name=self.issuer_name,
                external_reference=None,
                details={
                    "note": "Certificate number missing in document extraction.",
                    "disclaimer": "Simulated demonstration adapter."
                },
                is_mock=True
            )

        ref_key = cert_number.strip().upper()
        if ref_key in self.mock_db:
            rec = self.mock_db[ref_key]
            return VerificationResult(
                status=rec["status"],
                issuer_name=self.issuer_name,
                external_reference=f"FIRE-REG-{ref_key}",
                details={
                    "registered_name": rec["institution_name"],
                    "valid_till": rec["valid_till"],
                    "authority": rec["authority"],
                    "disclaimer": "Simulated demonstration response."
                },
                is_mock=True
            )

        return VerificationResult(
            status="MOCK_SIMULATED",
            issuer_name=self.issuer_name,
            external_reference=f"FIRE-SIM-{abs(hash(ref_key)) % 100000:05d}",
            details={
                "inquiry_ref": ref_key,
                "note": "Simulated state registry lookup completed.",
                "disclaimer": "Demonstration simulation only."
            },
            is_mock=True
        )
