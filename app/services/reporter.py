import io
import csv
from datetime import datetime, timezone
from typing import Dict, Any
from sqlalchemy.orm import Session
from app.models.application import Application
from app.models.document import Document
from app.models.extracted_field import ExtractedField
from app.models.validation import ValidationRun, Finding
from app.models.verification import VerificationAttempt

def build_report_data(application_id: str, db: Session) -> Dict[str, Any]:
    application = db.query(Application).filter(Application.id == application_id).first()
    if not application:
        raise ValueError(f"Application {application_id} not found.")

    documents = db.query(Document).filter(Document.application_id == application_id).all()
    validation_runs = db.query(ValidationRun).filter(ValidationRun.application_id == application_id).order_by(ValidationRun.completed_at.desc()).all()
    latest_run = validation_runs[0] if validation_runs else None

    findings = []
    if latest_run:
        findings = db.query(Finding).filter(Finding.validation_run_id == latest_run.id).all()

    verifications = db.query(VerificationAttempt).filter(VerificationAttempt.application_id == application_id).all()

    docs_data = []
    for d in documents:
        fields = db.query(ExtractedField).filter(ExtractedField.document_id == d.id).all()
        docs_data.append({
            "id": d.id,
            "document_type": d.document_type,
            "original_filename": d.original_filename,
            "sha256_hash": d.sha256_hash,
            "is_scanned": d.is_scanned,
            "processing_status": d.processing_status,
            "upload_timestamp": d.upload_timestamp.isoformat(),
            "extracted_fields": [
                {
                    "field_name": f.field_name,
                    "extracted_value": f.extracted_value,
                    "normalized_value": f.normalized_value,
                    "confidence": f.confidence,
                    "source_page": f.source_page,
                    "raw_text_snippet": f.raw_text_snippet
                } for f in fields
            ]
        })

    findings_data = [
        {
            "id": f.id,
            "rule_code": f.rule_code,
            "rule_version": f.rule_version,
            "severity": f.severity,
            "title": f.title,
            "explanation": f.explanation,
            "evidence_text": f.evidence_text,
            "detection_method": f.detection_method,
            "recommended_action": f.recommended_action,
            "review_status": f.review_status,
            "reviewer_notes": f.reviewer_notes
        } for f in findings
    ]

    verif_data = [
        {
            "adapter_name": v.adapter_name,
            "external_reference": v.external_reference,
            "status": v.status,
            "attempted_at": v.attempted_at.isoformat(),
            "response_payload": v.response_payload
        } for v in verifications
    ]

    return {
        "report_generated_at": datetime.now(timezone.utc).isoformat(),
        "disclaimer": "This regulatory scrutiny report was generated automatically by the SIH 2026 AI-Powered Validation Platform to assist authorized human reviewers. Automated findings represent review indicators and do not constitute an official final regulatory verdict.",
        "application": {
            "id": application.id,
            "application_number": application.application_number,
            "category": application.category,
            "academic_year": application.academic_year,
            "status": application.status,
            "submission_date": application.submission_date.isoformat() if application.submission_date else None,
            "institution": {
                "name": application.institution.name if application.institution else "N/A",
                "institution_code": application.institution.institution_code if application.institution else "N/A",
                "state": application.institution.state if application.institution else "N/A",
                "district": application.institution.district if application.institution else "N/A"
            } if application.institution else None
        },
        "latest_validation_run": {
            "id": latest_run.id if latest_run else None,
            "completed_at": latest_run.completed_at.isoformat() if latest_run else None,
            "rule_versions_snapshot": latest_run.rule_versions_snapshot if latest_run else {},
            "total_findings": latest_run.total_findings if latest_run else 0,
            "critical_findings": latest_run.critical_findings if latest_run else 0,
            "major_findings": latest_run.major_findings if latest_run else 0,
            "minor_findings": latest_run.minor_findings if latest_run else 0,
            "summary": latest_run.summary if latest_run else "No validation executed."
        } if latest_run else None,
        "documents": docs_data,
        "findings": findings_data,
        "verifications": verif_data
    }

def generate_csv_report(application_id: str, db: Session) -> str:
    data = build_report_data(application_id, db)
    output = io.StringIO()
    writer = csv.writer(output)
    
    # Headers
    writer.writerow(["SIH 2026 Regulatory Scrutiny Report - Findings Export"])
    writer.writerow(["Application Number", data["application"]["application_number"]])
    writer.writerow(["Institution", data["application"]["institution"]["name"] if data["application"]["institution"] else ""])
    writer.writerow(["PID", data["application"]["institution"]["institution_code"] if data["application"]["institution"] else ""])
    writer.writerow(["Academic Year", data["application"]["academic_year"]])
    writer.writerow(["Report Date", data["report_generated_at"]])
    writer.writerow([])
    
    writer.writerow(["Finding ID", "Severity", "Rule Code", "Rule Version", "Title", "Explanation", "Detection Method", "Review Status", "Reviewer Notes", "Evidence Snippet"])
    for f in data["findings"]:
        writer.writerow([
            f["id"],
            f["severity"],
            f["rule_code"],
            f["rule_version"],
            f["title"],
            f["explanation"],
            f["detection_method"],
            f["review_status"],
            f["reviewer_notes"] or "",
            f["evidence_text"] or ""
        ])
        
    return output.getvalue()

def generate_html_report(application_id: str, db: Session) -> str:
    data = build_report_data(application_id, db)
    app = data["application"]
    inst = app["institution"] or {}
    val = data["latest_validation_run"] or {}
    findings = data["findings"]
    docs = data["documents"]
    verifs = data["verifications"]

    crit_count = sum(1 for f in findings if f["severity"] == "CRITICAL")
    maj_count = sum(1 for f in findings if f["severity"] == "MAJOR")
    min_count = sum(1 for f in findings if f["severity"] == "MINOR")

    findings_html = ""
    if not findings:
        findings_html = """<div class="empty-state">No compliance violations or discrepancies identified. All checks passed.</div>"""
    else:
        for f in findings:
            sev_class = f["severity"].lower()
            status_badge = f'<span class="badge badge-{f["review_status"].lower()}">{f["review_status"]}</span>'
            notes_p = f'<p class="reviewer-notes"><strong>Reviewer Notes:</strong> {f["reviewer_notes"]}</p>' if f["reviewer_notes"] else ''
            findings_html += f"""
            <div class="finding-card finding-{sev_class}">
                <div class="finding-header">
                    <span class="badge badge-{sev_class}">{f["severity"]}</span>
                    <span class="rule-tag">{f["rule_code"]} (v{f["rule_version"]})</span>
                    <span class="method-tag">Method: {f["detection_method"]}</span>
                    <div class="status-wrap">{status_badge}</div>
                </div>
                <h4 class="finding-title">{f["title"]}</h4>
                <p class="finding-explanation">{f["explanation"]}</p>
                <div class="evidence-box">
                    <strong>Evidence Reference:</strong>
                    <pre>{f["evidence_text"] or 'No raw text attached'}</pre>
                </div>
                <p class="finding-action"><strong>Recommended Action:</strong> {f["recommended_action"]}</p>
                {notes_p}
            </div>
            """

    docs_rows = ""
    for d in docs:
        fields_summary = ", ".join([f"{f['field_name']}: {f['extracted_value']}" for f in d["extracted_fields"][:3]])
        docs_rows += f"""
        <tr>
            <td><strong>{d["document_type"]}</strong></td>
            <td>{d["original_filename"]}</td>
            <td><code>{d["sha256_hash"][:16]}...</code></td>
            <td>{'Scanned (OCR)' if d['is_scanned'] else 'Digital PDF'}</td>
            <td><span class="status-pill">{d["processing_status"]}</span></td>
            <td><small>{fields_summary or 'No structured fields'}</small></td>
        </tr>
        """

    verif_rows = ""
    for v in verifs:
        verif_rows += f"""
        <tr>
            <td>{v["adapter_name"]}</td>
            <td><strong>{v["external_reference"] or 'N/A'}</strong></td>
            <td><span class="status-pill status-{v["status"].lower()}">{v["status"]}</span></td>
            <td><small>{v["response_payload"].get("disclaimer", "")}</small></td>
            <td>{v["attempted_at"][:19].replace('T', ' ')}</td>
        </tr>
        """
    if not verifs:
        verif_rows = "<tr><td colspan='5' class='text-muted'>No external verification attempts recorded for this dossier.</td></tr>"

    html = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Regulatory Scrutiny Report - {app["application_number"]}</title>
    <style>
        :root {{
            --primary: #1e3a8a;
            --primary-light: #3b82f6;
            --success: #059669;
            --warning: #d97706;
            --danger: #dc2626;
            --dark: #0f172a;
            --light: #f8fafc;
            --border: #e2e8f0;
        }}
        body {{
            font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, sans-serif;
            background: #f1f5f9;
            color: #1e293b;
            margin: 0;
            padding: 30px;
        }}
        .report-container {{
            max-width: 1000px;
            margin: 0 auto;
            background: #ffffff;
            border-radius: 12px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.08);
            padding: 40px;
            border: 1px solid var(--border);
        }}
        .report-header {{
            border-bottom: 2px solid var(--primary);
            padding-bottom: 20px;
            margin-bottom: 30px;
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
        }}
        .title-block h1 {{
            margin: 0 0 8px 0;
            color: var(--primary);
            font-size: 26px;
        }}
        .title-block p {{
            margin: 0;
            color: #64748b;
            font-size: 14px;
        }}
        .disclaimer-banner {{
            background: #fffbeb;
            border-left: 4px solid var(--warning);
            padding: 12px 16px;
            margin-bottom: 25px;
            font-size: 13px;
            color: #92400e;
            border-radius: 4px;
        }}
        .meta-grid {{
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
            gap: 16px;
            margin-bottom: 30px;
            background: #f8fafc;
            padding: 20px;
            border-radius: 8px;
            border: 1px solid var(--border);
        }}
        .meta-item label {{
            display: block;
            font-size: 12px;
            text-transform: uppercase;
            color: #64748b;
            font-weight: 600;
            margin-bottom: 4px;
        }}
        .meta-item span {{
            font-size: 15px;
            font-weight: 600;
            color: var(--dark);
        }}
        .kpi-row {{
            display: flex;
            gap: 15px;
            margin-bottom: 30px;
        }}
        .kpi-card {{
            flex: 1;
            padding: 16px;
            border-radius: 8px;
            text-align: center;
            background: #f8fafc;
            border: 1px solid var(--border);
        }}
        .kpi-card.kpi-crit {{ border-top: 4px solid var(--danger); }}
        .kpi-card.kpi-maj {{ border-top: 4px solid var(--warning); }}
        .kpi-card.kpi-min {{ border-top: 4px solid #3b82f6; }}
        .kpi-value {{ font-size: 28px; font-weight: 700; margin: 4px 0; }}
        .kpi-label {{ font-size: 12px; color: #64748b; text-transform: uppercase; }}

        h2 {{
            color: var(--primary);
            border-bottom: 1px solid var(--border);
            padding-bottom: 8px;
            margin-top: 35px;
            font-size: 18px;
        }}
        table {{
            width: 100%;
            border-collapse: collapse;
            margin-top: 15px;
            font-size: 13px;
        }}
        th, td {{
            padding: 10px 12px;
            text-align: left;
            border-bottom: 1px solid var(--border);
        }}
        th {{
            background: #f1f5f9;
            color: #475569;
            font-weight: 600;
        }}
        .badge {{
            display: inline-block;
            padding: 3px 8px;
            border-radius: 4px;
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
        }}
        .badge-critical {{ background: #fee2e2; color: #991b1b; }}
        .badge-major {{ background: #fef3c7; color: #92400e; }}
        .badge-minor {{ background: #e0f2fe; color: #075985; }}
        .badge-info {{ background: #f1f5f9; color: #475569; }}
        .badge-flagged {{ background: #fef3c7; color: #92400e; }}
        .badge-confirmed {{ background: #fee2e2; color: #991b1b; }}
        .badge-resolved {{ background: #dcfce7; color: #166534; }}
        .badge-dismissed {{ background: #e2e8f0; color: #475569; }}

        .finding-card {{
            border: 1px solid var(--border);
            border-radius: 8px;
            padding: 16px;
            margin-bottom: 16px;
            background: #ffffff;
        }}
        .finding-critical {{ border-left: 5px solid var(--danger); }}
        .finding-major {{ border-left: 5px solid var(--warning); }}
        .finding-minor {{ border-left: 5px solid #3b82f6; }}
        .finding-header {{
            display: flex;
            align-items: center;
            gap: 10px;
            margin-bottom: 8px;
        }}
        .rule-tag, .method-tag {{
            font-size: 11px;
            color: #64748b;
            background: #f1f5f9;
            padding: 2px 6px;
            border-radius: 3px;
        }}
        .finding-title {{
            margin: 0 0 6px 0;
            font-size: 16px;
            color: var(--dark);
        }}
        .finding-explanation {{
            margin: 0 0 10px 0;
            font-size: 14px;
            color: #334155;
            line-height: 1.5;
        }}
        .evidence-box {{
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            padding: 10px;
            border-radius: 6px;
            font-size: 12px;
            margin-bottom: 10px;
        }}
        .evidence-box pre {{
            margin: 5px 0 0 0;
            white-space: pre-wrap;
            font-family: 'Consolas', monospace;
            color: #0f172a;
        }}
        .finding-action {{
            margin: 0;
            font-size: 13px;
            color: #0369a1;
        }}
        .reviewer-notes {{
            margin: 8px 0 0 0;
            padding-top: 8px;
            border-top: 1px dashed var(--border);
            font-size: 13px;
            color: #475569;
        }}
        .footer {{
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid var(--border);
            display: flex;
            justify-content: space-between;
            color: #94a3b8;
            font-size: 12px;
        }}
        @media print {{
            body {{ background: #fff; padding: 0; }}
            .report-container {{ box-shadow: none; border: none; padding: 0; }}
        }}
    </style>
</head>
<body>
    <div class="report-container">
        <div class="report-header">
            <div class="title-block">
                <h1>Regulatory Scrutiny & Compliance Dossier</h1>
                <p>AI-Assisted Application Validation & Document Authentication (SIH 2026)</p>
            </div>
            <div>
                <span class="badge badge-info">{app["status"]}</span>
            </div>
        </div>

        <div class="disclaimer-banner">
            <strong>Transparency Notice:</strong> {data["disclaimer"]}
        </div>

        <div class="meta-grid">
            <div class="meta-item">
                <label>Application ID</label>
                <span>{app["application_number"]}</span>
            </div>
            <div class="meta-item">
                <label>Institution Name</label>
                <span>{inst.get("name", "N/A")}</span>
            </div>
            <div class="meta-item">
                <label>Permanent Institute ID (PID)</label>
                <span>{inst.get("institution_code", "N/A")}</span>
            </div>
            <div class="meta-item">
                <label>Approval Category</label>
                <span>{app["category"]}</span>
            </div>
            <div class="meta-item">
                <label>Academic Year</label>
                <span>{app["academic_year"]}</span>
            </div>
            <div class="meta-item">
                <label>Location</label>
                <span>{inst.get("district", "N/A")}, {inst.get("state", "N/A")}</span>
            </div>
        </div>

        <div class="kpi-row">
            <div class="kpi-card kpi-crit">
                <div class="kpi-value" style="color: var(--danger);">{crit_count}</div>
                <div class="kpi-label">Critical Findings</div>
            </div>
            <div class="kpi-card kpi-maj">
                <div class="kpi-value" style="color: var(--warning);">{maj_count}</div>
                <div class="kpi-label">Major Deficiencies</div>
            </div>
            <div class="kpi-card kpi-min">
                <div class="kpi-value" style="color: #3b82f6;">{min_count}</div>
                <div class="kpi-label">Minor Warnings</div>
            </div>
            <div class="kpi-card">
                <div class="kpi-value" style="color: #059669;">{len(docs)}</div>
                <div class="kpi-label">Documents Submitted</div>
            </div>
        </div>

        <h2>Validation Findings & Discrepancies ({len(findings)})</h2>
        {findings_html}

        <h2>Submitted Documents & Extracted Metadata</h2>
        <table>
            <thead>
                <tr>
                    <th>Type</th>
                    <th>Filename</th>
                    <th>SHA-256 Hash</th>
                    <th>Mode</th>
                    <th>Status</th>
                    <th>Sample Extracted Fields</th>
                </tr>
            </thead>
            <tbody>
                {docs_rows}
            </tbody>
        </table>

        <h2>Simulated Issuer Registry Verification Attempts</h2>
        <table>
            <thead>
                <tr>
                    <th>Registry Adapter</th>
                    <th>Reference</th>
                    <th>Status</th>
                    <th>Simulated Note / Disclosure</th>
                    <th>Timestamp (UTC)</th>
                </tr>
            </thead>
            <tbody>
                {verif_rows}
            </tbody>
        </table>

        <div class="footer">
            <span>Generated by Antigravity SIH 2026 Engine</span>
            <span>Report Timestamp: {data["report_generated_at"]}</span>
        </div>
    </div>
</body>
</html>
"""
    return html
