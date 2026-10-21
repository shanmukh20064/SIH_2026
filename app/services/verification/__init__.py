from app.services.verification.base import BaseVerificationAdapter, VerificationResult
from app.services.verification.mock_aicte import MockAICTERegistryAdapter
from app.services.verification.mock_fire import MockFireSafetyRegistryAdapter

ADAPTER_REGISTRY = {
    "MockAICTERegistryAdapter": MockAICTERegistryAdapter(),
    "MockFireSafetyRegistryAdapter": MockFireSafetyRegistryAdapter()
}

__all__ = [
    "BaseVerificationAdapter",
    "VerificationResult",
    "MockAICTERegistryAdapter",
    "MockFireSafetyRegistryAdapter",
    "ADAPTER_REGISTRY"
]
