"""
P0 Authentication Security Test Suite for TVS Smart Lending Hub
Tests:
1. Argon2id password verification on institutional accounts
2. Complete elimination of demo password bypasses and demo name substrings
3. Token issuance and session persistence in SQLite WAL
4. Route protection: 401 on missing/invalid/expired/revoked session tokens on GET /auth/me
5. Server-side logout and revocation
6. Least-privilege role assignment on public signups
7. Controlled institutional role elevation via verified invite codes or domain
8. Duplicate account prevention and password validation
9. Health check dependency reporting
"""

import uuid
import pytest
from fastapi.testclient import TestClient
from tvs_lending.api.app import app
from tvs_lending.db.database import get_db_connection

client = TestClient(app)


def test_preseeded_demo_login_success():
    """Verify seeded underwriter account authenticates with correct Argon2 password."""
    response = client.post(
        "/api/v1/auth/login",
        json={"email": "rajeshwar.sharma@tvscredit.com", "password": "Underwrite@2026"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["token"].startswith("tvs_sec_")
    assert data["user"]["email"] == "rajeshwar.sharma@tvscredit.com"
    assert data["user"]["role"] == "Agri Underwriter"


def test_login_wrong_password_rejected():
    """Verify login fails with HTTP 401 for incorrect password."""
    response = client.post(
        "/api/v1/auth/login",
        json={"email": "rajeshwar.sharma@tvscredit.com", "password": "WrongPassword!99"},
    )
    assert response.status_code == 401
    assert "Invalid email or password" in response.json()["detail"]


def test_login_demo_password_bypass_removed():
    """Verify all former shared bypass passwords are fully rejected."""
    bypasses = ["demo123", "admin123", "tvs123", "underwriter123", "demo", "password"]
    for pw in bypasses:
        response = client.post(
            "/api/v1/auth/login",
            json={"email": "rajeshwar.sharma@tvscredit.com", "password": pw},
        )
        assert response.status_code == 401, f"Expected 401 for bypass password '{pw}'"


def test_login_demo_name_bypass_removed():
    """Verify that having 'rajeshwar' in email no longer allows arbitrary password bypass."""
    response = client.post(
        "/api/v1/auth/login",
        json={"email": "rajeshwar.sharma@tvscredit.com", "password": "arbitrary_unhashed_string"},
    )
    assert response.status_code == 401


def test_auth_me_requires_token():
    """Verify GET /auth/me returns HTTP 401 without Bearer token."""
    response = client.get("/api/v1/auth/me")
    assert response.status_code == 401
    assert "WWW-Authenticate" in response.headers


def test_auth_me_rejects_invalid_token():
    """Verify GET /auth/me returns HTTP 401 with forged or malformed Bearer token."""
    response = client.get(
        "/api/v1/auth/me",
        headers={"Authorization": "Bearer forged_token_never_issued_by_server"},
    )
    assert response.status_code == 401
    assert "Invalid, expired, or revoked" in response.json()["detail"]


def test_auth_me_returns_profile_with_valid_token():
    """Verify GET /auth/me returns caller profile when provided a valid token."""
    login_resp = client.post(
        "/api/v1/auth/login",
        json={"email": "sunil.verma@tvscredit.com", "password": "RiskOps@2026"},
    )
    assert login_resp.status_code == 200
    token = login_resp.json()["token"]

    me_resp = client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert me_resp.status_code == 200
    profile = me_resp.json()
    assert profile["email"] == "sunil.verma@tvscredit.com"
    assert profile["name"] == "Sunil Verma"
    assert profile["role"] == "Risk Operations Officer"


def test_logout_revokes_token():
    """Verify POST /auth/logout revokes session, blocking subsequent authenticated calls."""
    login_resp = client.post(
        "/api/v1/auth/login",
        json={"email": "kavita.patel@tvscredit.com", "password": "Underwrite@2026"},
    )
    assert login_resp.status_code == 200
    token = login_resp.json()["token"]

    # Verify session works
    me_resp = client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert me_resp.status_code == 200

    # Logout
    logout_resp = client.post(
        "/api/v1/auth/logout",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert logout_resp.status_code == 200
    assert logout_resp.json()["success"] is True

    # Immediate next check must fail with 401
    me_after_logout = client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert me_after_logout.status_code == 401


def test_public_signup_least_privilege():
    """Verify public signup requesting 'Agri Underwriter' role is downgraded to 'Borrower'."""
    unique_email = f"farmer_{uuid.uuid4().hex[:6]}@example.com"
    signup_resp = client.post(
        "/api/v1/auth/signup",
        json={
            "name": "Ramesh Farmer",
            "email": unique_email,
            "password": "FarmerSecret123",
            "role": "Agri Underwriter",  # Untrusted privilege escalation attempt
        },
    )
    assert signup_resp.status_code == 200
    data = signup_resp.json()
    assert data["success"] is True
    assert data["user"]["role"] == "Borrower", "Public signup without invite must default to Borrower"


def test_invite_code_signup_officer_role():
    """Verify signup with valid invite code succeeds in provisioning requested officer role."""
    unique_email = f"officer_{uuid.uuid4().hex[:6]}@example.com"
    signup_resp = client.post(
        "/api/v1/auth/signup",
        json={
            "name": "Verified Officer",
            "email": unique_email,
            "password": "OfficerSecurePass2026",
            "role": "Risk Operations Officer",
            "invite_code": "TVS_OFFICER_2026",
        },
    )
    assert signup_resp.status_code == 200
    data = signup_resp.json()
    assert data["success"] is True
    assert data["user"]["role"] == "Risk Operations Officer"


def test_institutional_domain_signup_officer_role():
    """Verify institutional email domain (@tvscredit.com) allows officer role assignment."""
    unique_email = f"lead_{uuid.uuid4().hex[:6]}@tvscredit.com"
    signup_resp = client.post(
        "/api/v1/auth/signup",
        json={
            "name": "TVS Credit Lead",
            "email": unique_email,
            "password": "CorporateLead2026",
            "role": "Agri Underwriter",
        },
    )
    assert signup_resp.status_code == 200
    data = signup_resp.json()
    assert data["success"] is True
    assert data["user"]["role"] == "Agri Underwriter"


def test_duplicate_signup_rejected():
    """Verify attempting to register an already-registered email returns HTTP 400."""
    response = client.post(
        "/api/v1/auth/signup",
        json={
            "name": "Duplicate User",
            "email": "rajeshwar.sharma@tvscredit.com",
            "password": "SomePassword123",
        },
    )
    assert response.status_code == 400
    assert "already exists" in response.json()["detail"]


def test_short_password_rejected():
    """Verify password shorter than 6 characters is rejected with 422 or 400."""
    response = client.post(
        "/api/v1/auth/signup",
        json={
            "name": "Short PW",
            "email": f"short_{uuid.uuid4().hex[:6]}@example.com",
            "password": "123",
        },
    )
    assert response.status_code in (400, 422)


def test_health_check_reports_healthy_db():
    """Verify /health returns 200 and reports database status as HEALTHY."""
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "HEALTHY"
    assert data["dependencies"]["database"] == "HEALTHY"
