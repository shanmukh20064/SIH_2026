import os
import pytest
from pathlib import Path
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.database import Base, get_db
from app.main import app
from app.models.user import User
from app.models.institution import Institution
from app.models.application import Application
from app.services.security import get_password_hash, create_access_token
from app.services.rules import seed_default_rules

TEST_DB_PATH = Path("./test_compliance.db")
TEST_DATABASE_URL = f"sqlite:///{TEST_DB_PATH.resolve()}"

test_engine = create_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False}
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)

@pytest.fixture(scope="session", autouse=True)
def setup_test_db():
    Base.metadata.create_all(bind=test_engine)
    db = TestingSessionLocal()
    seed_default_rules(db)
    
    # Create test users
    admin = User(
        username="test_admin",
        email="test_admin@test.gov",
        password_hash=get_password_hash("TestPass123!"),
        full_name="Test Admin User",
        role="admin"
    )
    reviewer = User(
        username="test_reviewer",
        email="test_reviewer@test.gov",
        password_hash=get_password_hash("TestPass123!"),
        full_name="Test Reviewer Officer",
        role="reviewer"
    )
    applicant = User(
        username="test_inst",
        email="test_inst@college.edu",
        password_hash=get_password_hash("TestPass123!"),
        full_name="Test Institution Rep",
        role="institution"
    )
    db.add_all([admin, reviewer, applicant])

    # Create test institution
    inst = Institution(
        institution_code="AICTE-1-TEST999",
        name="TEST INSTITUTE OF TECHNOLOGY",
        category="Engineering & Technology",
        state="Karnataka",
        district="Bengaluru",
        address="100 Innovation Road"
    )
    db.add(inst)
    db.commit()
    db.close()

    yield

    # Teardown
    Base.metadata.drop_all(bind=test_engine)
    if TEST_DB_PATH.exists():
        try:
            os.remove(TEST_DB_PATH)
        except Exception:
            pass

@pytest.fixture
def db_session():
    connection = test_engine.connect()
    transaction = connection.begin()
    session = TestingSessionLocal(bind=connection)
    yield session
    session.close()
    transaction.rollback()
    connection.close()

@pytest.fixture
def client(db_session):
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()

@pytest.fixture
def admin_token():
    return create_access_token({"sub": "test_admin", "role": "admin"})

@pytest.fixture
def reviewer_token():
    return create_access_token({"sub": "test_reviewer", "role": "reviewer"})

@pytest.fixture
def applicant_token():
    return create_access_token({"sub": "test_inst", "role": "institution"})

@pytest.fixture
def auth_headers(reviewer_token):
    return {"Authorization": f"Bearer {reviewer_token}"}

@pytest.fixture
def admin_headers(admin_token):
    return {"Authorization": f"Bearer {admin_token}"}

@pytest.fixture
def applicant_headers(applicant_token):
    return {"Authorization": f"Bearer {applicant_token}"}
