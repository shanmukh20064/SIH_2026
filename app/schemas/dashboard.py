from typing import Dict, List, Any
from pydantic import BaseModel

class DashboardStatsResponse(BaseModel):
    total_applications: int
    pending_scrutiny: int
    applications_with_deficiencies: int
    approved_applications: int
    rejected_applications: int
    total_documents: int
    total_findings: int
    findings_by_severity: Dict[str, int]
    findings_by_status: Dict[str, int]
    recent_activity: List[Dict[str, Any]]
