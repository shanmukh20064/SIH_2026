import os
from pathlib import Path
from datetime import datetime, timezone
from app.database import engine, Base, SessionLocal
from app.models.user import User
from app.models.institution import Institution
from app.models.application import Application
from app.models.document import Document
from app.models.extracted_field import ExtractedField
from app.services.security import get_password_hash
from app.services.rules import seed_default_rules
from app.services.storage import save_upload_file
from app.services.extractor import extract_document_content
from app.services.field_parser import parse_fields_from_pages
from app.services.validator import execute_application_validation
from app.services.verification import ADAPTER_REGISTRY
from app.models.verification import VerificationAttempt
from scripts.generate_sample_docs import generate_all_samples, DEMO_DOCS_DIR

def seed_demo():
    print("--- Initializing Database Schema ---")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # 1. Seed Compliance Rules
        print("--- Seeding Demonstration Compliance Rules ---")
        seed_default_rules(db)

        # 2. Seed Users
        print("--- Seeding Default Demonstration Users ---")
        users_data = [
            {
                "username": "admin",
                "email": "admin@regulatory.gov.in",
                "password_hash": get_password_hash("Admin@123"),
                "full_name": "Lead Scrutiny Administrator",
                "role": "admin"
            },
            {
                "username": "reviewer",
                "email": "ananya.sharma@regulatory.gov.in",
                "password_hash": get_password_hash("Reviewer@123"),
                "full_name": "Dr. Ananya Sharma (Senior Scrutiny Officer)",
                "role": "reviewer"
            },
            {
                "username": "institution",
                "email": "nodal@apextech.edu.in",
                "password_hash": get_password_hash("Inst@123"),
                "full_name": "Apex Tech Institutional Representative",
                "role": "institution"
            }
        ]

        seeded_users = {}
        for u in users_data:
            existing = db.query(User).filter(User.username == u["username"]).first()
            if not existing:
                user = User(**u)
                db.add(user)
                db.flush()
                seeded_users[u["username"]] = user
                print(f"Created user: {u['username']} ({u['role']})")
            else:
                seeded_users[u["username"]] = existing

        admin_user = seeded_users["admin"]
        reviewer_user = seeded_users["reviewer"]

        # 3. Seed Institutions
        print("--- Seeding Institutions ---")
        institutions_data = [
            {
                "institution_code": "AICTE-1-10928374",
                "name": "APEX INSTITUTE OF TECHNOLOGY",
                "category": "Engineering & Technology",
                "state": "Karnataka",
                "district": "Bengaluru Urban",
                "address": "45 Knowledge Corridor, Whitefield, Bengaluru - 560066"
            },
            {
                "institution_code": "AICTE-1-55443322",
                "name": "ZENITH COLLEGE OF ENGINEERING & TECHNOLOGY",
                "category": "Engineering & Technology",
                "state": "Maharashtra",
                "district": "Pune",
                "address": "Survey 88, Hinjewadi Phase 2, Pune - 411057"
            },
            {
                "institution_code": "AICTE-1-88997766",
                "name": "ROYAL ACADEMY OF PHARMACEUTICAL SCIENCES",
                "category": "Pharmacy",
                "state": "Tamil Nadu",
                "district": "Chennai",
                "address": "12 Grand Southern Trunk Road, Guindy, Chennai - 600032"
            }
        ]

        inst_map = {}
        for inst_d in institutions_data:
            inst = db.query(Institution).filter(Institution.institution_code == inst_d["institution_code"]).first()
            if not inst:
                inst = Institution(**inst_d)
                db.add(inst)
                db.flush()
                print(f"Created institution: {inst.name}")
            inst_map[inst.institution_code] = inst

        # 4. Generate sample documents
        generate_all_samples()

        def ingest_sample_document(app_id: str, doc_type: str, sample_filename: str):
            source_file = DEMO_DOCS_DIR / sample_filename
            with open(source_file, "rb") as f:
                content = f.read()

            storage_filename, file_path, mime_type, file_size, sha256_hash = save_upload_file(
                original_filename=sample_filename,
                content=content
            )

            doc_record = Document(
                application_id=app_id,
                document_type=doc_type,
                original_filename=sample_filename,
                storage_filename=storage_filename,
                file_path=file_path,
                file_size_bytes=file_size,
                mime_type=mime_type,
                sha256_hash=sha256_hash,
                is_scanned=False,
                page_count=1,
                processing_status="EXTRACTED",
                uploaded_by_user_id=reviewer_user.id
            )
            db.add(doc_record)
            db.flush()

            # Extract content & structure
            extraction_res = extract_document_content(file_path, mime_type)
            doc_record.is_scanned = extraction_res.get("is_scanned", False)
            doc_record.page_count = extraction_res.get("page_count", 1)

            parsed_fields = parse_fields_from_pages(extraction_res.get("pages", []))
            for pf in parsed_fields:
                field_model = ExtractedField(
                    document_id=doc_record.id,
                    field_name=pf["field_name"],
                    extracted_value=pf["extracted_value"],
                    normalized_value=pf["normalized_value"],
                    confidence=pf["confidence"],
                    source_page=pf["source_page"],
                    raw_text_snippet=pf["raw_text_snippet"],
                    is_inferred=pf["is_inferred"]
                )
                db.add(field_model)

            db.commit()
            return doc_record

        # 5. Seed Demonstration Applications
        print("--- Seeding Applications & Ingesting Dossiers ---")

        # Application 1: Apex Institute (Clean Extension of Approval)
        app1 = db.query(Application).filter(Application.application_number == "APP-2026-0001").first()
        if not app1:
            app1 = Application(
                application_number="APP-2026-0001",
                institution_id=inst_map["AICTE-1-10928374"].id,
                category="EXTENSION_OF_APPROVAL",
                academic_year="2026-2027",
                status="SUBMITTED",
                submission_date=datetime.now(timezone.utc),
                created_by_user_id=reviewer_user.id
            )
            db.add(app1)
            db.commit()
            db.refresh(app1)

            # Ingest clean documents
            doc_app1_1 = ingest_sample_document(app1.id, "PREVIOUS_APPROVAL_LETTER", "clean_aicte_approval.pdf")
            doc_app1_2 = ingest_sample_document(app1.id, "FIRE_SAFETY_NOC", "clean_fire_safety_noc.pdf")
            doc_app1_3 = ingest_sample_document(app1.id, "BUILDING_COMPLETION_CERT", "clean_building_completion.pdf")

            # Run validation
            execute_application_validation(db, app1.id, reviewer_user.id)

            # Run simulated verification
            aicte_adapter = ADAPTER_REGISTRY["MockAICTERegistryAdapter"]
            ver_res = aicte_adapter.verify("AICTE-EOA-2025-9988", "APEX INSTITUTE OF TECHNOLOGY", "PREVIOUS_APPROVAL_LETTER")
            ver_attempt = VerificationAttempt(
                application_id=app1.id,
                document_id=doc_app1_1.id,
                adapter_name="MockAICTERegistryAdapter",
                external_reference=ver_res.external_reference,
                status=ver_res.status,
                response_payload=ver_res.details
            )
            db.add(ver_attempt)
            db.commit()
            print(f"Created Application 1: {app1.application_number} (Clean EOA with 3 docs & validation executed)")

        # Application 2: Zenith College (Deficiency: Expired Fire NOC & Missing Docs)
        app2 = db.query(Application).filter(Application.application_number == "APP-2026-0002").first()
        if not app2:
            app2 = Application(
                application_number="APP-2026-0002",
                institution_id=inst_map["AICTE-1-55443322"].id,
                category="EXTENSION_OF_APPROVAL",
                academic_year="2026-2027",
                status="SUBMITTED",
                submission_date=datetime.now(timezone.utc),
                created_by_user_id=reviewer_user.id
            )
            db.add(app2)
            db.commit()
            db.refresh(app2)

            # Ingest expired fire NOC only (Building Completion and Previous Approval missing)
            doc_app2_1 = ingest_sample_document(app2.id, "FIRE_SAFETY_NOC", "expired_fire_safety_noc.pdf")
            execute_application_validation(db, app2.id, reviewer_user.id)
            print(f"Created Application 2: {app2.application_number} (Deficiency Scenario: Expired Fire NOC)")

        # Application 3: Apex Institute Course Expansion (Name Mismatch / Anomaly)
        app3 = db.query(Application).filter(Application.application_number == "APP-2026-0003").first()
        if not app3:
            app3 = Application(
                application_number="APP-2026-0003",
                institution_id=inst_map["AICTE-1-10928374"].id,
                category="NEW_COURSE",
                academic_year="2026-2027",
                status="SUBMITTED",
                submission_date=datetime.now(timezone.utc),
                created_by_user_id=reviewer_user.id
            )
            db.add(app3)
            db.commit()
            db.refresh(app3)

            ingest_sample_document(app3.id, "LAND_TITLE_DEED", "name_mismatch_land_deed.pdf")
            execute_application_validation(db, app3.id, reviewer_user.id)
            print(f"Created Application 3: {app3.application_number} (Anomaly Scenario: Cross-document name mismatch)")

        # Application 4: Royal Academy (Fresh Draft Application)
        app4 = db.query(Application).filter(Application.application_number == "APP-2026-0004").first()
        if not app4:
            app4 = Application(
                application_number="APP-2026-0004",
                institution_id=inst_map["AICTE-1-88997766"].id,
                category="NEW_INSTITUTION",
                academic_year="2026-2027",
                status="DRAFT",
                created_by_user_id=reviewer_user.id
            )
            db.add(app4)
            db.commit()
            print(f"Created Application 4: {app4.application_number} (Fresh Draft)")

        db.commit()
        print("\n=== DEMO DATA SEEDED SUCCESSFULLY ===")
        print("You can log in with:")
        print("  Administrator: admin / Admin@123")
        print("  Reviewer:      reviewer / Reviewer@123")
        print("  Institution:   institution / Inst@123")

    finally:
        db.close()

if __name__ == "__main__":
    seed_demo()
