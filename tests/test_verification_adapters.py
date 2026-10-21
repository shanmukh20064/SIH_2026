from app.services.verification import ADAPTER_REGISTRY

def test_mock_aicte_adapter_verified():
    adapter = ADAPTER_REGISTRY["MockAICTERegistryAdapter"]
    res = adapter.verify("AICTE-EOA-2025-9988", "APEX INSTITUTE OF TECHNOLOGY", "PREVIOUS_APPROVAL_LETTER")
    assert res.status == "VERIFIED"
    assert res.is_mock is True
    assert "REG-AICTE" in res.external_reference

def test_mock_aicte_adapter_expired():
    adapter = ADAPTER_REGISTRY["MockAICTERegistryAdapter"]
    res = adapter.verify("AICTE-EOA-2024-EXPIRED", "ZENITH COLLEGE", "PREVIOUS_APPROVAL_LETTER")
    assert res.status == "EXPIRED"

def test_mock_adapter_missing_cert_number():
    adapter = ADAPTER_REGISTRY["MockAICTERegistryAdapter"]
    res = adapter.verify(None, None, "PREVIOUS_APPROVAL_LETTER")
    assert res.status == "MANUAL_VERIFICATION_REQUIRED"

def test_mock_fire_safety_adapter():
    adapter = ADAPTER_REGISTRY["MockFireSafetyRegistryAdapter"]
    res = adapter.verify("FS-NOC-2025-101", "APEX INSTITUTE", "FIRE_SAFETY_NOC")
    assert res.status == "VERIFIED"
