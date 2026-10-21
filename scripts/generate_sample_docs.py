import os
from pathlib import Path
import pymupdf as fitz

DEMO_DOCS_DIR = Path(__file__).resolve().parent.parent / "storage" / "demo_samples"
DEMO_DOCS_DIR.mkdir(parents=True, exist_ok=True)

def create_pdf(filename: str, title: str, lines: list):
    filepath = DEMO_DOCS_DIR / filename
    doc = fitz.open()
    page = doc.new_page(width=595, height=842)  # A4 size
    
    # Header
    y = 50
    page.insert_text((50, y), title.upper(), fontsize=14, color=(0.1, 0.2, 0.5))
    y += 20
    page.insert_text((50, y), "==================================================================", fontsize=10, color=(0.5, 0.5, 0.5))
    y += 30

    for line in lines:
        if line == "---":
            y += 10
            page.insert_text((50, y), "------------------------------------------------------------------", fontsize=10, color=(0.7, 0.7, 0.7))
            y += 20
        else:
            page.insert_text((50, y), line, fontsize=11, color=(0.1, 0.1, 0.1))
            y += 22

    # Footer
    page.insert_text((50, 800), "Confidential - For Regulatory Scrutiny Demonstration Only [SIH 2026]", fontsize=9, color=(0.6, 0.6, 0.6))

    doc.save(str(filepath))
    doc.close()
    print(f"Generated synthetic document: {filepath.name}")
    return filepath

def generate_all_samples():
    # 1. Clean Previous AICTE Approval Letter
    create_pdf(
        "clean_aicte_approval.pdf",
        "ALL INDIA COUNCIL FOR TECHNICAL EDUCATION (AICTE)",
        [
            "APPROVAL PROCESS 2025-2026 - EXTENSION OF APPROVAL (EOA)",
            "Date of Issue: 15/05/2025",
            "Letter No: AICTE-EOA-2025-9988",
            "---",
            "To The Principal / Director,",
            "Institution Name: APEX INSTITUTE OF TECHNOLOGY",
            "Permanent Institute Id: AICTE-1-10928374",
            "Application ID: 1-9876543210",
            "State: Karnataka    District: Bengaluru Urban",
            "Address: 45 Knowledge Corridor, Whitefield, Bengaluru",
            "---",
            "Sir / Madam,",
            "In terms of the provisions under the All India Council for Technical Education",
            "Regulations, the Council hereby conveys the Extension of Approval to:",
            "APEX INSTITUTE OF TECHNOLOGY for conduct of Technical Programs.",
            "Valid till: 30/06/2026",
            "Issuing Authority: All India Council for Technical Education"
        ]
    )

    # 2. Clean Fire Safety Certificate
    create_pdf(
        "clean_fire_safety_noc.pdf",
        "DEPARTMENT OF FIRE AND EMERGENCY SERVICES",
        [
            "FIRE SAFETY AND NO OBJECTION CERTIFICATE (NOC)",
            "Certificate No: FS-NOC-2025-101",
            "Date of Issue: 20/04/2025",
            "Date of Expiry: 31/03/2027",
            "---",
            "Certified that the educational institution premises occupied by:",
            "Institution Name: APEX INSTITUTE OF TECHNOLOGY",
            "Permanent Institute Id: AICTE-1-10928374",
            "Address: 45 Knowledge Corridor, Whitefield, Bengaluru",
            "---",
            "Have complied with fire prevention and safety requirements in accordance",
            "with the National Building Code of India.",
            "Valid up to: 31/03/2027",
            "Issuing Authority: Fire and Emergency Services"
        ]
    )

    # 3. Clean Building Completion Certificate
    create_pdf(
        "clean_building_completion.pdf",
        "MUNICIPAL CORPORATION & TOWN PLANNING AUTHORITY",
        [
            "CERTIFICATE OF BUILDING COMPLETION & OCCUPANCY",
            "Ref No: MC-BCC-2024-8841",
            "Issue Date: 10/11/2024",
            "---",
            "Institution Name: APEX INSTITUTE OF TECHNOLOGY",
            "Permanent Institute Id: AICTE-1-10928374",
            "Built-up Area: 18,500 Sq. Meters",
            "Survey Number: 42/1, 42/2",
            "---",
            "Certified that the academic and administrative blocks are fully constructed",
            "in accordance with approved sanctioned plans for educational utility.",
            "Issuing Authority: Municipal Corporation"
        ]
    )

    # 4. Expired Fire Safety Certificate (Deficiency case)
    create_pdf(
        "expired_fire_safety_noc.pdf",
        "DEPARTMENT OF FIRE AND EMERGENCY SERVICES",
        [
            "FIRE SAFETY AND NO OBJECTION CERTIFICATE (NOC)",
            "Certificate No: FS-NOC-2023-EXPIRED",
            "Date of Issue: 12/05/2023",
            "Date of Expiry: 10/05/2024",
            "---",
            "Certified that the premises of:",
            "Institution Name: ZENITH COLLEGE OF ENGINEERING & TECHNOLOGY",
            "Permanent Institute Id: AICTE-1-55443322",
            "---",
            "Subject to periodic maintenance. Valid up to: 10/05/2024",
            "Issuing Authority: Fire and Emergency Services"
        ]
    )

    # 5. Name Mismatch Certificate (Altered Name)
    create_pdf(
        "name_mismatch_land_deed.pdf",
        "OFFICE OF THE SUB-REGISTRAR - LAND RECORDS",
        [
            "TITLE DEED & LAND CONVEYANCE ORDER",
            "Order No: REG-LAND-2022-7711",
            "Dated: 18/08/2022",
            "---",
            "Title registered in the name of:",
            "Institution Name: APEX PRIVATE EDUCATIONAL SOCIETY (AFFILIATE UNIT)",
            "Permanent Institute Id: AICTE-1-10928374",
            "Total Land Area: 5.5 Acres",
            "---",
            "Land designated exclusively for educational purposes.",
            "Issuing Authority: Directorate of Town and Country Planning"
        ]
    )

if __name__ == "__main__":
    generate_all_samples()
