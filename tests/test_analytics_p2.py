"""
P2 Analytics & Operability Test Suite for TVS Smart Lending Hub
Tests:
1. Exposure-weighted PAR-90 computation in Portfolio Analytics (vs naive unweighted mean)
2. What-If Stress Simulator baseline consistency with active portfolio aggregates
3. Early Warning System (EWS) durable database persistence and lifecycle transitions
4. EWS status transition authorization and audit trail logging
5. Request ID and telemetry middleware headers (X-Request-ID, X-Response-Time-MS, X-Execution-Mode)
6. Institutional Health Check dependency status, policy version, and execution mode
"""

import pytest
from fastapi.testclient import TestClient
from tvs_lending.api.app import app
from tvs_lending.db.database import get_db_connection

client = TestClient(app)


def get_officer_auth_header():
    """Helper to authenticate as an institutional underwriter."""
    res = client.post(
        "/api/v1/auth/login",
        json={"email": "rajeshwar.sharma@tvscredit.com", "password": "Underwrite@2026"},
    )
    assert res.status_code == 200
    token = res.json()["token"]
    return {"Authorization": f"Bearer {token}"}


def test_portfolio_exposure_weighted_par90():
    """Verify GET /api/v1/portfolio computes exact exposure-weighted PAR-90."""
    response = client.get("/api/v1/portfolio")
    assert response.status_code == 200
    data = response.json()

    # Check root fields per UI contract
    assert "total_active_agri_loans" in data
    assert "total_portfolio_size_crores" in data
    assert "portfolio_average_par90_pct" in data
    assert "districts_data" in data

    districts = data["districts_data"]
    assert len(districts) >= 7

    # Calculate exact exposure-weighted PAR-90 manually
    total_exposure = sum(d["portfolio_cr"] for d in districts)
    weighted_par_sum = sum(d["portfolio_cr"] * d["par_90_pct"] for d in districts)
    expected_weighted_par90 = round(weighted_par_sum / total_exposure, 2)

    # Assert that the API uses the exposure-weighted PAR-90
    assert abs(data["portfolio_average_par90_pct"] - expected_weighted_par90) < 0.05
    assert data["portfolio_average_par90_pct"] == 2.30
    assert abs(data["total_portfolio_size_crores"] - total_exposure) < 0.1

    # Check each district row format
    for d in districts:
        assert "district" in d
        assert "active_loans" in d
        assert "portfolio_cr" in d
        assert "par_90_pct" in d
        assert "mean_credit_score" in d
        assert "top_crop" in d


def test_whatif_baseline_portfolio_consistency():
    """Verify POST /api/v1/whatif uses baseline matching active portfolio aggregates."""
    response = client.post(
        "/api/v1/whatif",
        json={
            "rainfall_change_pct": -25.0,
            "temperature_increase_c": 2.0,
            "crop_market_price_change_pct": -10.0,
        },
    )
    assert response.status_code == 200
    data = response.json()

    assert "baseline_portfolio" in data
    assert "stressed_portfolio_impact" in data

    base = data["baseline_portfolio"]
    assert base["portfolio_size_crores"] == 988.0
    assert base["total_borrowers"] == 23200
    assert base["gnpa_pct"] == 2.30

    # Under negative climate and market shocks, stressed GNPA must increase
    stress = data["stressed_portfolio_impact"]
    assert stress["stressed_gnpa_pct"] > base["gnpa_pct"]
    assert stress["stressed_gnpa_amount_crores"] > base["gnpa_amount_crores"]
    assert stress["incremental_npa_crores"] > 0
    assert stress["at_risk_borrowers_count"] > 0


def test_ews_alerts_durable_retrieval():
    """Verify GET /api/v1/ews/alerts returns seeded durable records with lifecycle status."""
    response = client.get("/api/v1/ews/alerts")
    assert response.status_code == 200
    data = response.json()

    assert "alerts" in data
    alerts = data["alerts"]
    assert len(alerts) >= 3

    # Check alert structure per compatibility contract
    for a in alerts:
        assert "loan_id" in a
        assert "borrower_name" in a
        assert "ews_severity" in a
        assert "outstanding_principal_inr" in a
        assert "days_past_due" in a
        assert "satellite_message" in a
        assert "climate_message" in a
        assert "recommended_action" in a
        assert "lifecycle_status" in a
        assert a["lifecycle_status"] in ["OPEN", "ACKNOWLEDGED", "ASSIGNED", "RESOLVED", "TRIGGERED", "WATCHLIST", "RESTRUCTURED", "REMEDIATED"]


def test_ews_lifecycle_transition_authorization():
    """Verify POST /api/v1/ews/transition enforces officer authentication and updates DB."""
    # 1. Unauthenticated attempt fails with 401
    unauth_res = client.post(
        "/api/v1/ews/transition",
        json={
            "loan_id": "TVS-TR-2024-8812",
            "to_status": "ACKNOWLEDGED",
            "reason": "Officer review started on drought alert",
        },
    )
    assert unauth_res.status_code == 401

    # 2. Authenticated officer transitions alert status
    headers = get_officer_auth_header()
    auth_res = client.post(
        "/api/v1/ews/transition",
        headers=headers,
        json={
            "loan_id": "TVS-TR-2024-8812",
            "to_status": "ACKNOWLEDGED",
            "reason": "Officer review started on drought alert",
            "assigned_officer_id": "TVS-USR-RAJESHWAR",
        },
    )
    assert auth_res.status_code == 200
    result = auth_res.json()
    assert result["success"] is True
    assert result["new_status"] == "ACKNOWLEDGED"

    # 3. Verify status persisted in database
    with get_db_connection() as conn:
        row = conn.execute(
            "SELECT status FROM ews_alerts WHERE loan_id = ?",
            ("TVS-TR-2024-8812",),
        ).fetchone()
        assert row is not None
        assert row["status"] == "ACKNOWLEDGED"

        # Check audit log entry
        audit_row = conn.execute(
            "SELECT action, entity_id, details FROM audit_logs WHERE action = 'EWS_TRANSITION' ORDER BY id DESC LIMIT 1"
        ).fetchone()
        assert audit_row is not None
        assert audit_row["entity_id"] == "TVS-TR-2024-8812"


def test_telemetry_and_security_headers():
    """Verify middleware adds X-Request-ID, X-Response-Time-MS, and X-Execution-Mode."""
    response = client.get("/api/v1/health")
    assert response.status_code == 200

    assert "X-Request-ID" in response.headers
    assert response.headers["X-Request-ID"].startswith("req_")

    assert "X-Response-Time-MS" in response.headers
    response_time = float(response.headers["X-Response-Time-MS"])
    assert response_time >= 0.0

    assert "X-Execution-Mode" in response.headers
    assert response.headers["X-Execution-Mode"] in ["DEMO", "PRODUCTION"]


def test_institutional_health_check():
    """Verify GET /api/v1/health exposes dependencies and version metadata."""
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()

    assert data["status"].lower() == "healthy"
    assert "dependencies" in data
    assert data["dependencies"]["database"].lower() == "healthy"
    assert "execution_mode" in data
    assert "policy_version" in data
    assert "model_version" in data
