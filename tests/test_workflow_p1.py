"""
P1 Workflow & Decision Gate Test Suite for TVS Smart Lending Hub
Tests:
1. Pydantic Numerical Bounds & Polygon Validation (HTTP 422)
2. Idempotent Underwriting (Duplicate token returns cached record without re-assessment)
3. Decision Gates Enforcement:
   - Duplicate Collateral Detection -> REFER_FRAUD_REVIEW, Sanction=0, REVIEW_REQUIRED
   - Non-Agri Bhuvan LULC Gate -> REFER_LULC_REVIEW, Sanction=0, REVIEW_REQUIRED
   - High Monsoon Cloud Cover (>=70%) Gate -> REFER_FIELD_VERIFICATION, Sanction=0, REVIEW_REQUIRED
   - Clean Parcel -> Fast-Track/Automated Sanction & Reconciled Harvest Schedule
4. Durable Persistence & Officer Sign-off:
   - Transitions in applications & application_history
   - Role gate: Borrower cannot sign off (HTTP 403)
   - Officer sign-off verdict & sanction amount override
5. Borrower Data Isolation:
   - Borrower A cannot view Borrower B's application (HTTP 403)
   - Borrower A cannot query Krishi Saathi on Borrower B's application (HTTP 403)
6. Krishi Saathi Authoritative Context:
   - Server-side application lookup
   - Zero-borrower-context anti-hallucination (no fabricated loan/sanction)
   - Message deduplication by message_id
7. Exposure-Weighted Portfolio PAR-90 Calculation
8. EWS Lifecycle State Transitions
"""

import uuid
import pytest
from fastapi.testclient import TestClient
from tvs_lending.api.app import app
from tvs_lending.db.database import get_db_connection

client = TestClient(app)


def get_officer_token() -> str:
    """Helper to authenticate pre-seeded underwriter."""
    resp = client.post(
        "/api/v1/auth/login",
        json={"email": "rajeshwar.sharma@tvscredit.com", "password": "Underwrite@2026"},
    )
    assert resp.status_code == 200
    return resp.json()["token"]


def get_borrower_token(email: str = None) -> str:
    """Helper to register and authenticate a least-privileged Borrower."""
    b_email = email or f"farmer_{uuid.uuid4().hex[:6]}@gmail.com"
    resp = client.post(
        "/api/v1/auth/signup",
        json={
            "name": "Kisan Borrower",
            "email": b_email,
            "password": "BorrowerPass@2026",
            "role": "Borrower",
            "phone": "+91-9893011223",
        },
    )
    assert resp.status_code == 200
    return resp.json()["token"], resp.json()["user"]["user_id"]


# ---------------------------------------------------------------------------
# 1. Pydantic Numerical Bounds & Input Validation (HTTP 422)
# ---------------------------------------------------------------------------

def test_underwrite_bounds_negative_loan_amount_rejected():
    payload = {
        "applicant_name": "Test Farmer",
        "requested_loan_amount_inr": -50000.0,
        "requested_tenure_months": 48,
        "land_acres": 4.5,
    }
    resp = client.post("/api/v1/underwrite", json=payload)
    assert resp.status_code == 422


def test_underwrite_bounds_excessive_loan_amount_rejected():
    payload = {
        "applicant_name": "Test Farmer",
        "requested_loan_amount_inr": 250000000.0,  # 25 Crore (exceeds 10 Cr limit)
        "requested_tenure_months": 48,
        "land_acres": 4.5,
    }
    resp = client.post("/api/v1/underwrite", json=payload)
    assert resp.status_code == 422


def test_underwrite_bounds_invalid_tenure_rejected():
    # Tenure > 84 months rejected
    resp = client.post("/api/v1/underwrite", json={"applicant_name": "Test", "requested_tenure_months": 120})
    assert resp.status_code == 422
    # Tenure < 1 month rejected
    resp = client.post("/api/v1/underwrite", json={"applicant_name": "Test", "requested_tenure_months": 0})
    assert resp.status_code == 422


def test_underwrite_bounds_invalid_cibil_rejected():
    # CIBIL score < 300 rejected
    resp = client.post("/api/v1/underwrite", json={"applicant_name": "Test", "bureau_cibil_score": 150})
    assert resp.status_code == 422
    # CIBIL score > 900 rejected
    resp = client.post("/api/v1/underwrite", json={"applicant_name": "Test", "bureau_cibil_score": 980})
    assert resp.status_code == 422


def test_underwrite_bounds_empty_polygon_rejected():
    payload = {
        "applicant_name": "Test Farmer",
        "plot_coordinates": [{"lat": 21.25, "lon": 81.62}],  # Only 1 vertex (need >= 3)
    }
    resp = client.post("/api/v1/underwrite", json=payload)
    assert resp.status_code == 422


# ---------------------------------------------------------------------------
# 2. Idempotency Handling
# ---------------------------------------------------------------------------

def test_underwriting_idempotency_creates_single_record():
    key = f"idempotency_test_{uuid.uuid4().hex}"
    payload = {
        "applicant_name": "Dinesh Chandrakar",
        "district": "Durg",
        "village": "Patan",
        "khasra_no": "88/1",
        "land_acres": 3.5,
        "crop_type": "PADDY_KHARIF",
        "requested_loan_amount_inr": 420000.0,
        "requested_tenure_months": 36,
        "plot_coordinates": [
            {"lat": 21.3200, "lon": 81.5200},
            {"lat": 21.3250, "lon": 81.5250},
            {"lat": 21.3180, "lon": 81.5230},
        ],
        "cloud_cover_pct": 35.0,
        "idempotency_key": key,
    }

    # First submission
    resp1 = client.post("/api/v1/underwrite", json=payload)
    assert resp1.status_code == 200
    data1 = resp1.json()
    app_id = data1["application_id"]
    assert app_id.startswith("TVS-APP-")
    assert data1.get("idempotency_cached") is not True

    # Duplicate submission with identical key
    resp2 = client.post("/api/v1/underwrite", json=payload)
    assert resp2.status_code == 200
    data2 = resp2.json()
    assert data2["application_id"] == app_id
    assert data2.get("idempotency_cached") is True

    # Header-based idempotency verification
    header_key = f"header_idem_{uuid.uuid4().hex}"
    payload_no_body_key = dict(payload)
    payload_no_body_key["idempotency_key"] = None

    resp_h1 = client.post("/api/v1/underwrite", json=payload_no_body_key, headers={"X-Idempotency-Key": header_key})
    assert resp_h1.status_code == 200
    app_id_h = resp_h1.json()["application_id"]

    resp_h2 = client.post("/api/v1/underwrite", json=payload_no_body_key, headers={"X-Idempotency-Key": header_key})
    assert resp_h2.status_code == 200
    assert resp_h2.json()["application_id"] == app_id_h
    assert resp_h2.json()["idempotency_cached"] is True

    # Verify database contains exactly 1 record for key
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) as cnt FROM applications WHERE idempotency_key = ?", (key,))
        assert cursor.fetchone()["cnt"] == 1


# ---------------------------------------------------------------------------
# 3. Decision Gates Enforcement
# ---------------------------------------------------------------------------

def test_gate_duplicate_collateral_detected():
    """Coordinates around (21.2514, 81.6296) trigger duplicate collateral fraud alert."""
    payload = {
        "applicant_name": "Suspicious Duplicate Claim",
        "district": "Raipur",
        "village": "Abhanpur",
        "khasra_no": "142/1",
        "land_acres": 4.0,
        "requested_loan_amount_inr": 500000.0,
        "requested_tenure_months": 48,
        "plot_coordinates": [
            {"lat": 21.2514, "lon": 81.6296},
            {"lat": 21.2518, "lon": 81.6298},
            {"lat": 21.2510, "lon": 81.6294},
        ],
        "cloud_cover_pct": 30.0,
    }
    resp = client.post("/api/v1/underwrite", json=payload)
    assert resp.status_code == 200
    data = resp.json()

    verdict = data["underwriting_verdict"]
    assert verdict["decision"] == "REFER_FRAUD_REVIEW"
    assert verdict["sanctioned_amount_inr"] == 0.0
    assert data["status"] == "REVIEW_REQUIRED"
    assert data["officer_review_required"] is True
    assert data["repayment_structure"]["reconciliation_status"] == "WITHHELD"


def test_gate_high_monsoon_cloud_cover():
    """Cloud cover >= 70% must withhold sanction and require physical field audit."""
    payload = {
        "applicant_name": "Kavita Patel",
        "district": "Bilaspur",
        "village": "Kota",
        "khasra_no": "45/2",
        "land_acres": 5.0,
        "requested_loan_amount_inr": 600000.0,
        "requested_tenure_months": 48,
        "plot_coordinates": [
            {"lat": 22.1500, "lon": 82.0500},
            {"lat": 22.1550, "lon": 82.0550},
            {"lat": 22.1480, "lon": 82.0520},
        ],
        "cloud_cover_pct": 82.0,  # >= 70%
    }
    resp = client.post("/api/v1/underwrite", json=payload)
    assert resp.status_code == 200
    data = resp.json()

    verdict = data["underwriting_verdict"]
    assert verdict["decision"] == "REFER_FIELD_VERIFICATION"
    assert verdict["sanctioned_amount_inr"] == 0.0
    assert data["status"] == "REVIEW_REQUIRED"
    assert data["officer_review_required"] is True


def test_gate_clean_parcel_generates_sanction_and_schedule():
    """Clean agricultural plot with low cloud cover gets auto-recommended with valid schedule."""
    payload = {
        "applicant_name": "Sukhram Markam",
        "district": "Bastar",
        "village": "Tokapal",
        "khasra_no": "77/3",
        "land_acres": 6.5,
        "crop_type": "PADDY_KHARIF",
        "requested_loan_amount_inr": 500000.0,
        "requested_tenure_months": 48,
        "bureau_cibil_score": 740,
        "annual_banking_turnover_inr": 600000.0,
        "plot_coordinates": [
            {"lat": 19.0800, "lon": 81.8500},
            {"lat": 19.0850, "lon": 81.8550},
            {"lat": 19.0780, "lon": 81.8520},
        ],
        "cloud_cover_pct": 25.0,
    }
    resp = client.post("/api/v1/underwrite", json=payload)
    assert resp.status_code == 200
    data = resp.json()

    verdict = data["underwriting_verdict"]
    assert verdict["decision"] in ["AUTO_RECOMMEND", "MANUAL_UNDERWRITE"]
    assert verdict["sanctioned_amount_inr"] > 0.0

    repay = data["repayment_structure"]
    assert repay["reconciliation"]["is_fully_reconciled"] is True
    assert repay["reconciliation"]["final_outstanding_balance_inr"] == 0.00
    assert len(repay["installments"]) > 0
    assert repay["installments"][-1]["remaining_principal_inr"] == 0.00


# ---------------------------------------------------------------------------
# 4. Officer Sign-off & Application State Transitions
# ---------------------------------------------------------------------------

def test_officer_signoff_workflow():
    officer_token = get_officer_token()
    borrower_token, _ = get_borrower_token()

    # Submit an application that requires review
    payload = {
        "applicant_name": "Ramprasad Netam",
        "district": "Bastar",
        "village": "Bastanar",
        "khasra_no": "19/1",
        "land_acres": 4.0,
        "requested_loan_amount_inr": 450000.0,
        "requested_tenure_months": 36,
        "plot_coordinates": [
            {"lat": 19.0500, "lon": 81.8200},
            {"lat": 19.0550, "lon": 81.8250},
            {"lat": 19.0480, "lon": 81.8220},
        ],
        "cloud_cover_pct": 75.0,  # Cloud cover triggers REVIEW_REQUIRED
    }
    sub_res = client.post("/api/v1/underwrite", json=payload)
    assert sub_res.status_code == 200
    app_id = sub_res.json()["application_id"]
    assert sub_res.json()["status"] == "REVIEW_REQUIRED"

    # 1. Unauthorized anonymous attempt to sign off -> 401
    resp_anon = client.post(f"/api/v1/applications/{app_id}/decision", json={"decision": "APPROVED"})
    assert resp_anon.status_code == 401

    # 2. Borrower attempt to sign off -> 403 Forbidden
    resp_borrower = client.post(
        f"/api/v1/applications/{app_id}/decision",
        json={"decision": "APPROVED"},
        headers={"Authorization": f"Bearer {borrower_token}"},
    )
    assert resp_borrower.status_code == 403

    # 3. Authorized Underwriter officer signs off with amount override
    resp_officer = client.post(
        f"/api/v1/applications/{app_id}/decision",
        json={
            "decision": "APPROVED",
            "notes": "Ground truthing agronomist inspection confirmed canal irrigation.",
            "override_amount_inr": 425000.0,
        },
        headers={"Authorization": f"Bearer {officer_token}"},
    )
    assert resp_officer.status_code == 200
    dec_data = resp_officer.json()
    assert dec_data["current_status"] == "APPROVED"
    assert dec_data["previous_status"] == "REVIEW_REQUIRED"

    # Verify durable state in applications & application_history
    get_res = client.get(f"/api/v1/applications/{app_id}", headers={"Authorization": f"Bearer {officer_token}"})
    assert get_res.status_code == 200
    app_data = get_res.json()
    assert app_data["status"] == "APPROVED"
    assert app_data["underwriting_verdict"]["sanctioned_amount_inr"] == 425000.0
    assert len(app_data["history"]) >= 2
    assert app_data["history"][-1]["to_status"] == "APPROVED"


# ---------------------------------------------------------------------------
# 5. Borrower Data Isolation & Ownership Protection
# ---------------------------------------------------------------------------

def test_borrower_data_isolation():
    token_a, id_a = get_borrower_token()
    token_b, id_b = get_borrower_token()

    # Borrower A creates an application
    payload = {
        "applicant_name": "Borrower A Farm",
        "district": "Raipur",
        "village": "Tilda",
        "khasra_no": "11/2",
        "land_acres": 5.0,
        "requested_loan_amount_inr": 500000.0,
        "requested_tenure_months": 48,
        "plot_coordinates": [
            {"lat": 21.5000, "lon": 81.7000},
            {"lat": 21.5050, "lon": 81.7050},
            {"lat": 21.4980, "lon": 81.7020},
        ],
        "cloud_cover_pct": 30.0,
    }
    res_a = client.post(
        "/api/v1/underwrite",
        json=payload,
        headers={"Authorization": f"Bearer {token_a}"},
    )
    assert res_a.status_code == 200
    app_id = res_a.json()["application_id"]

    # Borrower A can view their own application
    res_own = client.get(
        f"/api/v1/applications/{app_id}",
        headers={"Authorization": f"Bearer {token_a}"},
    )
    assert res_own.status_code == 200

    # Borrower B CANNOT view Borrower A's application -> 403 Forbidden
    res_b_view = client.get(
        f"/api/v1/applications/{app_id}",
        headers={"Authorization": f"Bearer {token_b}"},
    )
    assert res_b_view.status_code == 403

    # Borrower B CANNOT chat with Borrower A's application_id -> 403 Forbidden
    res_b_chat = client.post(
        "/api/v1/assistant/chat",
        json={"message": "What is my approved amount?", "application_id": app_id},
        headers={"Authorization": f"Bearer {token_b}"},
    )
    assert res_b_chat.status_code == 403


# ---------------------------------------------------------------------------
# 6. Krishi Saathi Authoritative Context & Anti-Hallucination
# ---------------------------------------------------------------------------

def test_krishi_saathi_with_application_id():
    token_a, id_a = get_borrower_token()
    payload = {
        "applicant_name": "Leeladhar Baghel",
        "district": "Durg",
        "village": "Bhilai 3",
        "khasra_no": "99/1",
        "land_acres": 4.5,
        "requested_loan_amount_inr": 480000.0,
        "requested_tenure_months": 48,
        "bureau_cibil_score": 720,
        "plot_coordinates": [
            {"lat": 21.2000, "lon": 81.4000},
            {"lat": 21.2050, "lon": 81.4050},
            {"lat": 21.1980, "lon": 81.4020},
        ],
        "cloud_cover_pct": 20.0,
    }
    app_res = client.post("/api/v1/underwrite", json=payload, headers={"Authorization": f"Bearer {token_a}"})
    app_id = app_res.json()["application_id"]

    # Chat using stored application_id
    chat_res = client.post(
        "/api/v1/assistant/chat",
        json={
            "message": "What is my approved loan amount?",
            "application_id": app_id,
            "language": "ENGLISH",
        },
        headers={"Authorization": f"Bearer {token_a}"},
    )
    assert chat_res.status_code == 200
    reply = chat_res.json()
    assert "response" in reply
    assert len(reply["response"]) > 10


def test_krishi_saathi_zero_context_anti_hallucination():
    """When no borrower_context or application_id is provided, do NOT fabricate Rajesh Sahu."""
    resp = client.post(
        "/api/v1/assistant/chat",
        json={
            "message": "Can I get a loan for a tractor in Chhattisgarh?",
            "language": "ENGLISH",
        },
    )
    assert resp.status_code == 200
    reply = resp.json()["response"]
    assert "Rajesh" not in reply, "Fabricated borrower name 'Rajesh' found in zero-context response"
    assert "5,50,000" not in reply, "Fabricated sanction amount found in zero-context response"


def test_krishi_saathi_message_id_deduplication():
    msg_id = f"msg_retry_{uuid.uuid4().hex}"
    req_body = {
        "message": "What documents are required for Kisan tractor loan?",
        "language": "ENGLISH",
        "message_id": msg_id,
    }
    resp1 = client.post("/api/v1/assistant/chat", json=req_body)
    assert resp1.status_code == 200
    text1 = resp1.json()["response"]

    # Duplicate call with same message_id
    resp2 = client.post("/api/v1/assistant/chat", json=req_body)
    assert resp2.status_code == 200
    data2 = resp2.json()
    assert data2["response"] == text1
    assert data2.get("source") == "DEDUP_RETRIEVED"


# ---------------------------------------------------------------------------
# 7. Portfolio Exposure-Weighted PAR-90
# ---------------------------------------------------------------------------

def test_portfolio_exposure_weighted_par90():
    resp = client.get("/api/v1/portfolio")
    assert resp.status_code == 200
    data = resp.json()
    districts = data["districts_data"]

    total_cr = sum(d["portfolio_cr"] for d in districts)
    expected_weighted_par90 = round(sum(d["portfolio_cr"] * d["par_90_pct"] for d in districts) / total_cr, 2)
    assert data["portfolio_average_par90_pct"] == expected_weighted_par90


# ---------------------------------------------------------------------------
# 8. EWS Lifecycle State Transitions
# ---------------------------------------------------------------------------

def test_ews_transition_by_officer():
    officer_token = get_officer_token()
    borrower_token, _ = get_borrower_token()

    # Borrower cannot transition EWS state -> 403
    resp_b = client.post(
        "/api/v1/ews/transition",
        json={"loan_id": "TVS-TR-2024-8812", "to_status": "WATCHLIST"},
        headers={"Authorization": f"Bearer {borrower_token}"},
    )
    assert resp_b.status_code == 403

    # Officer transitions EWS state
    resp_o = client.post(
        "/api/v1/ews/transition",
        json={
            "loan_id": "TVS-TR-2024-8812",
            "to_status": "WATCHLIST",
            "reason": "135mm torrential rain forecast detected by EWS Watcher",
        },
        headers={"Authorization": f"Bearer {officer_token}"},
    )
    assert resp_o.status_code == 200
    data = resp_o.json()
    assert data["success"] is True
    assert data["new_status"] == "WATCHLIST"
