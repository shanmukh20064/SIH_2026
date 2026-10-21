from abc import ABC, abstractmethod
from datetime import datetime, timezone
from typing import Dict, Any, Optional

class VerificationResult:
    def __init__(
        self,
        status: str,  # VERIFIED, MISMATCH, EXPIRED, PENDING, SOURCE_UNAVAILABLE, MANUAL_VERIFICATION_REQUIRED, MOCK_SIMULATED
        issuer_name: str,
        external_reference: Optional[str],
        details: Dict[str, Any],
        is_mock: bool = True
    ):
        self.status = status
        self.issuer_name = issuer_name
        self.external_reference = external_reference
        self.details = details
        self.is_mock = is_mock
        self.timestamp = datetime.now(timezone.utc)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "status": self.status,
            "issuer_name": self.issuer_name,
            "external_reference": self.external_reference,
            "details": self.details,
            "is_mock": self.is_mock,
            "timestamp": self.timestamp.isoformat()
        }

class BaseVerificationAdapter(ABC):
    @abstractmethod
    def verify(self, cert_number: Optional[str], institution_name: Optional[str], doc_type: str) -> VerificationResult:
        """Submits verification inquiry to external or simulated registry."""
        pass
