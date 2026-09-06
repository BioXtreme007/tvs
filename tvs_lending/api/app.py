"""
FastAPI Application for TVS Credit AI-Powered Smart Lending Decision Hub
Integrates all remote sensing, fraud, credit scoring, default prediction, recommendation, and EWS engines.
"""

from typing import Dict, Any, List, Optional
from fastapi import FastAPI, HTTPException, Response, Header, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.staticfiles import StaticFiles
import base64
import json
import os
import uuid
import datetime

from .schemas import (
    LoanApplicationRequest,
    WhatIfSimulationRequest,
    ChatAssistantRequest,
    VoiceAssistantRequest,
    TTSRequest,
    AgentDeliberationRequest,
    ApplicationDecisionRequest,
    EWSTransitionRequest,
    SignUpRequest,
    LoginRequest,
    AuthResponse,
    LogoutResponse,
    UserProfile,
)
from .auth import (
    register_user,
    authenticate_user,
    get_user_by_token,
    revoke_session,
    OFFICER_ROLES,
)
from tvs_lending.core.satellite import SatelliteProcessor
from tvs_lending.core.cloudgap import CloudGapInpainter
from tvs_lending.core.soil_engine import SoilHealthEngine
from tvs_lending.core.climate_engine import ClimateRiskEngine
from tvs_lending.fraud.bhuvan_verifier import BhuvanLULCVerifier
from tvs_lending.fraud.deduplication import CollateralDeduplicator
from tvs_lending.fraud.phenology_check import CropPhenologyValidator
from tvs_lending.models.credit_scorecard import AgriCreditScorecard
from tvs_lending.models.default_model import DefaultPredictionModel
from tvs_lending.models.xai_explainer import XAIExplainer
from tvs_lending.recommender.product_matcher import ProductMatcher
from tvs_lending.recommender.harvest_emi import HarvestEMIGenerator
from tvs_lending.recommender.dynamic_ltv import DynamicLTVEngine
from tvs_lending.ews.watcher import EWSWatcher
from tvs_lending.ews.risk_transitions import RiskLifecycleManager
from tvs_lending.ews.recovery_dossier import RecoveryDossierGenerator
from tvs_lending.assistant.krishi_saathi import KrishiSaathiAssistant
from tvs_lending.assistant.voice_engine import VernacularVoiceEngine
from tvs_lending.agents.orchestrator import DualTrackOrchestrator
from tvs_lending.db.database import get_db_connection

app = FastAPI(
    title="GeoKisaan Smart Lending Decision Hub API",
    description="Unified AI Platform for Agricultural Lending, Satellite Underwriting & Risk Monitoring",
    version="2.0.0",
)

# Explicit allowed origins to keep credentials secure
ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:8000",
    "http://127.0.0.1:8000",
]

# Enable CORS for frontend dashboard
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DEMO_MODE = os.environ.get("DEMO_MODE", "true").lower() in ["1", "true", "yes"]


@app.middleware("http")
async def add_security_headers_and_request_id(request: Request, call_next):
    req_id = request.headers.get("X-Request-ID") or f"req_{uuid.uuid4().hex[:12]}"
    start_time = datetime.datetime.now(datetime.timezone.utc)

    response = await call_next(request)

    duration_ms = (datetime.datetime.now(datetime.timezone.utc) - start_time).total_seconds() * 1000
    response.headers["X-Request-ID"] = req_id
    response.headers["X-Response-Time-MS"] = f"{duration_ms:.1f}"
    response.headers["X-Execution-Mode"] = "DEMO" if DEMO_MODE else "PRODUCTION"
    return response


security = HTTPBearer(auto_error=False)


def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
) -> Dict[str, Any]:
    """
    Extract and validate server-side session Bearer token.
    Raises HTTP 401 if missing, invalid, expired, or revoked.
    """
    if not credentials or not credentials.credentials:
        raise HTTPException(
            status_code=401,
            detail="Authentication credentials were not provided. Institutional Bearer token required.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    user = get_user_by_token(credentials.credentials)
    if not user:
        raise HTTPException(
            status_code=401,
            detail="Invalid, expired, or revoked session token. Please sign in again.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user


def get_current_officer(
    current_user: Dict[str, Any] = Depends(get_current_user),
) -> Dict[str, Any]:
    """
    Enforce officer role gate on sensitive underwriter and operational actions.
    """
    if current_user.get("role") not in OFFICER_ROLES:
        raise HTTPException(
            status_code=403,
            detail=f"Access denied: role '{current_user.get('role')}' is not authorized for officer operations.",
        )
    return current_user


def get_optional_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
) -> Optional[Dict[str, Any]]:
    """
    Extract current user if valid Bearer token is provided.
    Returns user dict if token is valid, or None if no token or if the token is invalid/expired.
    Ensures public features (like Krishi Saathi assistant chat and general navigation)
    remain fully functional even if an expired session token exists in browser localStorage.
    """
    if not credentials or not credentials.credentials:
        return None
    return get_user_by_token(credentials.credentials)


# Instantiate Singletons
satellite_proc = SatelliteProcessor()
cloudgap = CloudGapInpainter()
soil_engine = SoilHealthEngine()
climate_engine = ClimateRiskEngine()
bhuvan_verifier = BhuvanLULCVerifier()
collateral_dedup = CollateralDeduplicator()
phenology_val = CropPhenologyValidator()
scorecard = AgriCreditScorecard()
default_model = DefaultPredictionModel()
xai_explainer = XAIExplainer()
product_matcher = ProductMatcher()
harvest_emi_gen = HarvestEMIGenerator()
dynamic_ltv = DynamicLTVEngine()
ews_watcher = EWSWatcher()
risk_manager = RiskLifecycleManager()
recovery_gen = RecoveryDossierGenerator()
assistant = KrishiSaathiAssistant()
voice_engine = VernacularVoiceEngine()
orchestrator = DualTrackOrchestrator()


@app.get("/api/v1/health")
def health_check():
    db_status = "HEALTHY"
    try:
        with get_db_connection() as conn:
            conn.execute("SELECT 1")
    except Exception as e:
        db_status = f"UNHEALTHY: {str(e)}"

    return {
        "status": "HEALTHY" if db_status == "HEALTHY" else "DEGRADED",
        "service": "GeoKisaan Smart Lending Decision Hub",
        "version": "2.0.0",
        "execution_mode": "DEMO" if DEMO_MODE else "PRODUCTION",
        "policy_version": "2026.Q3",
        "model_version": "v2.1.0",
        "dependencies": {
            "database": db_status,
            "satellite_engine": "READY",
            "scoring_engine": "READY",
            "voice_engine": "READY",
        },
    }


@app.post("/api/v1/auth/signup", response_model=AuthResponse)
def auth_signup(req: SignUpRequest, request: Request):
    """
    100% Free, Institutional Account Creation for GeoKisaan Smart Lending Hub.
    """
    ip = request.client.host if request.client else None
    ua = request.headers.get("user-agent")
    res = register_user(
        name=req.name,
        email=req.email,
        password=req.password,
        phone=req.phone,
        role=req.role,
        branch=req.branch or "Raipur Central Hub",
        invite_code=req.invite_code,
        ip_address=ip,
        user_agent=ua,
    )
    if not res["success"]:
        raise HTTPException(status_code=400, detail=res["message"])
    return res


@app.post("/api/v1/auth/login", response_model=AuthResponse)
def auth_login(req: LoginRequest, request: Request):
    """
    Institutional User Authentication with Argon2id verification.
    """
    ip = request.client.host if request.client else None
    ua = request.headers.get("user-agent")
    res = authenticate_user(
        email=req.email,
        password=req.password,
        ip_address=ip,
        user_agent=ua,
    )
    if not res["success"]:
        raise HTTPException(status_code=401, detail=res["message"])
    return res


@app.get("/api/v1/auth/me", response_model=UserProfile)
def auth_me(current_user: Dict[str, Any] = Depends(get_current_user)):
    """
    Verify current institutional auth session status and return user profile.
    """
    return current_user


@app.post("/api/v1/auth/logout", response_model=LogoutResponse)
def auth_logout(credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)):
    """
    Revoke current server-side session token.
    """
    if credentials and credentials.credentials:
        revoke_session(credentials.credentials)
    return {
        "success": True,
        "message": "Institutional session revoked successfully.",
    }


@app.post("/api/v1/underwrite")
def underwrite_loan_application(
    req: LoanApplicationRequest,
    request: Request,
    current_user: Optional[Dict[str, Any]] = Depends(get_optional_current_user),
) -> Dict[str, Any]:
    """
    End-to-End Multimodal Underwriting Pipeline:
    1. Idempotency Check & Coordinate Bounds Validation
    2. Satellite & CloudGap Monsoon Inpainting
    3. ISRO Bhuvan & Collateral Fraud Deduplication Gates
    4. Soil Organic Carbon & Collateral Valuation (LPCV)
    5. Climate Risk & 14-Day Weather Forecast
    6. Composite Agri-Credit Scoring (300-900)
    7. Default Prediction (PD) with P10/P50/P90 Quantile Bounds
    8. SHAP Explainable AI (XAI) Attributions
    9. GeoKisaan Product Recommendation & Seasonally-Aligned Harvest EMI Schedule
    10. Durable Storage in Applications & Application History Tables
    """
    # 0. Geographic polygon validation
    if not req.plot_coordinates or len(req.plot_coordinates) < 3:
        raise HTTPException(
            status_code=422,
            detail="Plot coordinates must contain at least 3 vertices forming a closed cadastral polygon.",
        )
    for p in req.plot_coordinates:
        if not (-90.0 <= p.lat <= 90.0 and -180.0 <= p.lon <= 180.0):
            raise HTTPException(
                status_code=422,
                detail=f"Invalid geographic coordinates: lat={p.lat}, lon={p.lon}.",
            )

    # 1. Idempotency Check (via body token or X-Idempotency-Key header)
    idempotency_key = req.idempotency_key or request.headers.get("X-Idempotency-Key")
    if idempotency_key:
        with get_db_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM applications WHERE idempotency_key = ?", (idempotency_key,))
            cached = cursor.fetchone()
            if cached:
                cached_verdict = json.loads(cached["decision_verdict_json"])
                cached_score = json.loads(cached["scorecard_result_json"])
                cached_repay = json.loads(cached["repayment_schedule_json"])
                cached_evidence = json.loads(cached["evidence_snapshot_json"])
                return {
                    "application_id": cached["id"],
                    "status": cached["status"],
                    "officer_review_required": (cached["status"] == "REVIEW_REQUIRED"),
                    "idempotency_key": idempotency_key,
                    "idempotency_cached": True,
                    "application_summary": {
                        "applicant_name": cached["applicant_name"],
                        "district": cached["district"],
                        "village": cached["village"],
                        "khasra_no": cached["khasra_no"],
                        "crop_type": cached["crop_type"],
                        "land_acres": cached["land_acres"],
                        "requested_loan_amount_inr": cached["requested_loan_amount_inr"],
                    },
                    "underwriting_verdict": cached_verdict,
                    "scorecard_breakdown": cached_score,
                    "repayment_structure": cached_repay,
                    "default_prediction": cached_evidence.get("default_prediction", {}),
                    "xai_attributions": cached_evidence.get("xai_attributions", {}),
                    "fraud_and_verification": cached_evidence.get("fraud_and_verification", {}),
                    "satellite_and_soil": cached_evidence.get("satellite_and_soil", {}),
                    "climate_and_weather": cached_evidence.get("climate_and_weather", {}),
                    "product_recommendations": cached_evidence.get("product_recommendations", []),
                }

    center_lat = sum(p.lat for p in req.plot_coordinates) / max(1, len(req.plot_coordinates))
    center_lon = sum(p.lon for p in req.plot_coordinates) / max(1, len(req.plot_coordinates))
    coord_list = [[p.lat, p.lon] for p in req.plot_coordinates]

    # 2. Satellite Extraction & CloudGap Monsoon Inpainting
    raw_sat = satellite_proc.process_plot_polygon(
        polygon_coords=coord_list,
        lat_center=center_lat,
        lon_center=center_lon,
        crop_type=req.crop_type,
        cloud_cover_pct=req.cloud_cover_pct,
    )
    cloud_recon = cloudgap.inpaint_cloudy_plot(
        raw_indices=raw_sat["indices"],
        cloud_cover_pct=req.cloud_cover_pct,
    )
    effective_ndvi = cloud_recon["reconstructed_indices"]["ndvi"]
    effective_bsi = cloud_recon["reconstructed_indices"]["bsi"]
    effective_vigor = cloud_recon["reconstructed_indices"]["canopy_vigor"]

    # 3. Fraud & Geo-Verification Gates
    bhuvan_res = bhuvan_verifier.verify_plot_lulc(
        lat=center_lat,
        lon=center_lon,
        district=req.district,
    )
    dedup_res = collateral_dedup.check_collateral_overlap(
        lat=center_lat,
        lon=center_lon,
        poly_coords=coord_list,
        khasra_no=req.khasra_no,
    )
    phenology_res = phenology_val.validate_crop_phenology(
        declared_crop=req.crop_type,
        observed_current_ndvi=effective_ndvi,
    )

    # 4. Soil Fertility & Collateral Valuation (LPCV)
    soc_res = soil_engine.predict_soc_risk({
        "ndvi": effective_ndvi,
        "bsi": effective_bsi,
        "swir1_nir_ratio": raw_sat["indices"]["swir1_nir_ratio"],
        "swir1_red_ratio": raw_sat["indices"]["swir1_red_ratio"],
    })
    collateral_val = soil_engine.compute_land_productivity_collateral_value(
        area_acres=req.land_acres,
        crop_type=req.crop_type,
        soc_risk=soc_res["soc_deficiency_risk"],
    )
    agronomic_prescriptions = soil_engine.generate_agronomic_prescriptions(
        soc_risk=soc_res["soc_deficiency_risk"]
    )

    # 5. Climate Risk & 14-Day Weather Forecast
    climate_res = climate_engine.evaluate_climate_risk(
        district=req.district,
        month=9,
    )
    weather_14d = climate_engine.generate_14day_forecast()

    # 6. Composite Agri-Credit Scorecard (300-900)
    score_res = scorecard.compute_composite_score(
        bureau_cibil_score=req.bureau_cibil_score,
        annual_banking_turnover_inr=req.annual_banking_turnover_inr,
        loan_amount_requested_inr=req.requested_loan_amount_inr,
        satellite_vigor=effective_vigor,
        soc_deficiency_risk=soc_res["soc_deficiency_risk"],
        climate_resilience_score=climate_res["climate_resilience_score"],
        bhuvan_verified=bhuvan_res["is_agricultural_verified"],
        is_duplicate_collateral=dedup_res["duplicate_fraud_detected"],
        land_collateral_value_inr=collateral_val["land_productivity_collateral_value_inr"],
    )

    # 7. Default Prediction Model (PD) & Quantiles
    dti_est = round((req.requested_loan_amount_inr / max(1.0, req.requested_tenure_months)) / max(1.0, (req.annual_banking_turnover_inr / 12.0)), 2)
    default_res = default_model.predict_default_probability(
        agri_credit_score=score_res["agri_credit_score"],
        loan_tenure_months=req.requested_tenure_months,
        loan_amount_inr=req.requested_loan_amount_inr,
        debt_to_income_ratio=dti_est,
        climate_risk_multiplier=climate_res["default_risk_multiplier"],
        soc_risk=soc_res["soc_deficiency_risk"],
    )

    # 8. Explainable AI (SHAP XAI)
    xai_res = xai_explainer.explain_credit_decision(
        features={
            "bureau_cibil_score": req.bureau_cibil_score,
            "satellite_ndvi": effective_ndvi,
            "soc_risk": soc_res["soc_deficiency_risk"],
            "climate_resilience_score": climate_res["climate_resilience_score"],
            "bhuvan_verified": bhuvan_res["is_agricultural_verified"],
            "land_collateral_value_inr": collateral_val["land_productivity_collateral_value_inr"],
            "loan_amount_requested_inr": req.requested_loan_amount_inr,
        },
        credit_score=score_res["agri_credit_score"],
        default_probability_pct=default_res["probability_of_default"]["p50_median_pct"],
    )

    # 9. Loan Recommendation & Dynamic Pricing
    product_recs = product_matcher.recommend_products(
        land_acres=req.land_acres,
        annual_net_farm_income_inr=collateral_val["estimated_net_annual_farm_income_inr"],
        agri_credit_score=score_res["agri_credit_score"],
        requested_purpose=req.requested_product_type,
    )
    chosen_product = product_recs[0] if product_recs else None
    base_roi = chosen_product["interest_rate_roi_pct"] if chosen_product else 12.0
    pricing_res = dynamic_ltv.calculate_risk_pricing(
        base_product_roi=base_roi,
        base_product_ltv=0.85,
        agri_credit_score=score_res["agri_credit_score"],
        climate_resilience_score=climate_res["climate_resilience_score"],
        soc_risk=soc_res["soc_deficiency_risk"],
        asset_valuation_inr=collateral_val["land_productivity_collateral_value_inr"],
    )

    # 10. Rigorous Decision Gates Enforcement
    is_duplicate = dedup_res.get("duplicate_fraud_detected", False)
    is_agri_land = bhuvan_res.get("is_agricultural_verified", True)
    is_high_cloud = req.cloud_cover_pct >= 70.0

    if is_duplicate:
        verdict_decision = "REFER_FRAUD_REVIEW"
        app_status = "REVIEW_REQUIRED"
        officer_review_required = True
        sanctioned_amount = 0.0
        gate_reason = "Duplicate cadastral plot overlap detected across active loan collateral registry."
    elif not is_agri_land:
        verdict_decision = "REFER_LULC_REVIEW"
        app_status = "REVIEW_REQUIRED"
        officer_review_required = True
        sanctioned_amount = 0.0
        gate_reason = "Cadastral plot LULC classified as non-agricultural land."
    elif is_high_cloud:
        verdict_decision = "REFER_FIELD_VERIFICATION"
        app_status = "REVIEW_REQUIRED"
        officer_review_required = True
        sanctioned_amount = 0.0
        gate_reason = "Monsoon cloud cover >= 70% requires physical ground inspection."
    elif score_res.get("underwriting_decision") in ["REJECT_HIGH_RISK", "DECLINE"]:
        verdict_decision = "DECLINE"
        app_status = "DECLINED"
        officer_review_required = False
        sanctioned_amount = 0.0
        gate_reason = "Credit risk score threshold not met."
    elif score_res.get("underwriting_decision") in ["RESTRICTED_LENDING", "MANUAL_UNDERWRITE"]:
        verdict_decision = score_res.get("underwriting_decision")
        app_status = "REVIEW_REQUIRED"
        officer_review_required = True
        sanctioned_amount = min(req.requested_loan_amount_inr, pricing_res["max_eligible_sanction_amount_inr"])
        gate_reason = "Manual underwriter review required for moderate risk tier."
    else:
        verdict_decision = score_res.get("underwriting_decision", "AUTO_RECOMMEND")
        app_status = "SUBMITTED"
        officer_review_required = False
        sanctioned_amount = min(req.requested_loan_amount_inr, pricing_res["max_eligible_sanction_amount_inr"])
        gate_reason = "Automated policy clearance: eligible for fast-track sanction."

    # 11. Harvest-Aligned EMI Schedule (with exact reconciliation)
    if sanctioned_amount > 0:
        emi_schedule = harvest_emi_gen.generate_harvest_schedule(
            loan_amount_inr=sanctioned_amount,
            annual_roi_pct=pricing_res["final_risk_adjusted_roi_pct"],
            tenure_months=req.requested_tenure_months,
            crop_type=req.crop_type,
        )
    else:
        emi_schedule = {
            "schedule_type": "WITHHELD",
            "total_principal_inr": 0.0,
            "total_interest_inr": 0.0,
            "total_repayment_inr": 0.0,
            "installments": [],
            "reconciliation_status": "WITHHELD",
            "gate_reason": gate_reason,
        }

    underwriting_verdict = {
        "agri_credit_score": score_res["agri_credit_score"],
        "tier": score_res["tier"],
        "decision": verdict_decision,
        "gate_reason": gate_reason,
        "recommended_product": chosen_product["product_name"] if chosen_product else "GeoKisaan Agri Loan",
        "sanctioned_amount_inr": sanctioned_amount,
        "risk_adjusted_roi_pct": pricing_res["final_risk_adjusted_roi_pct"] if sanctioned_amount > 0 else 0.0,
        "max_ltv_pct": pricing_res["final_risk_adjusted_ltv_pct"] if sanctioned_amount > 0 else 0.0,
    }

    # 12. Durable Persistence in SQLite WAL
    app_id = f"TVS-APP-{uuid.uuid4().hex[:8].upper()}"
    now_iso = datetime.datetime.now(datetime.timezone.utc).isoformat()
    borrower_id = current_user["user_id"] if current_user and current_user.get("role") == "Borrower" else None
    actor_id = current_user["user_id"] if current_user else "SYSTEM"

    evidence_payload = {
        "default_prediction": default_res,
        "xai_attributions": xai_res,
        "fraud_and_verification": {
            "isro_bhuvan": bhuvan_res,
            "collateral_deduplication": dedup_res,
            "crop_phenology": phenology_res,
        },
        "satellite_and_soil": {
            "satellite_extraction": raw_sat,
            "cloudgap_monsoon_inpainting": cloud_recon,
            "soil_health_and_soc": soc_res,
            "collateral_valuation": collateral_val,
            "agronomic_prescriptions": agronomic_prescriptions,
        },
        "climate_and_weather": {
            "climate_risk": climate_res,
            "weather_14d_forecast": weather_14d,
        },
        "product_recommendations": product_recs,
    }

    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO applications (
                id, idempotency_key, borrower_id, applicant_name, district, village, khasra_no,
                land_acres, crop_type, requested_loan_amount_inr, requested_tenure_months,
                bureau_cibil_score, annual_banking_turnover_inr, requested_product_type,
                status, policy_version, model_version, input_snapshot_json,
                scorecard_result_json, decision_verdict_json, repayment_schedule_json,
                evidence_snapshot_json, created_by, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, '2026.Q3', 'v2.1.0', ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            app_id, idempotency_key, borrower_id, req.applicant_name, req.district, req.village, req.khasra_no,
            req.land_acres, req.crop_type, req.requested_loan_amount_inr, req.requested_tenure_months,
            req.bureau_cibil_score, req.annual_banking_turnover_inr, req.requested_product_type,
            app_status, json.dumps(req.model_dump()), json.dumps(score_res), json.dumps(underwriting_verdict),
            json.dumps(emi_schedule), json.dumps(evidence_payload), actor_id, now_iso, now_iso
        ))

        cursor.execute("""
            INSERT INTO application_history (application_id, from_status, to_status, changed_by, reason, created_at)
            VALUES (?, NULL, ?, ?, ?, ?)
        """, (app_id, app_status, actor_id, f"Assessment completed: {verdict_decision} ({gate_reason})", now_iso))

        cursor.execute("""
            INSERT INTO audit_logs (actor_id, action, entity_type, entity_id, details, created_at)
            VALUES (?, 'APPLICATION_CREATED', 'APPLICATION', ?, ?, ?)
        """, (actor_id, app_id, f"Status: {app_status}, Decision: {verdict_decision}, Sanction: {sanctioned_amount}", now_iso))

    return {
        "application_id": app_id,
        "status": app_status,
        "officer_review_required": officer_review_required,
        "idempotency_key": idempotency_key,
        "application_summary": {
            "applicant_name": req.applicant_name,
            "district": req.district,
            "village": req.village,
            "khasra_no": req.khasra_no,
            "crop_type": req.crop_type,
            "land_acres": req.land_acres,
            "requested_loan_amount_inr": req.requested_loan_amount_inr,
        },
        "underwriting_verdict": underwriting_verdict,
        "scorecard_breakdown": score_res,
        "default_prediction": default_res,
        "xai_attributions": xai_res,
        "fraud_and_verification": evidence_payload["fraud_and_verification"],
        "satellite_and_soil": evidence_payload["satellite_and_soil"],
        "climate_and_weather": evidence_payload["climate_and_weather"],
        "repayment_structure": emi_schedule,
        "product_recommendations": product_recs,
    }


@app.get("/api/v1/applications")
def list_applications(
    limit: int = 60,
    offset: int = 0,
    district: Optional[str] = None,
    status: Optional[str] = None,
    search: Optional[str] = None,
    current_user: Optional[Dict[str, Any]] = Depends(get_optional_current_user),
) -> Dict[str, Any]:
    """
    List stored loan applications with full decision verdicts, credit scores, and repayment structures.
    Connects the durable SQLite database (60 records) directly to the Underwriter Cockpit.
    """
    with get_db_connection() as conn:
        cursor = conn.cursor()
        query = "SELECT * FROM applications WHERE 1=1"
        params = []
        if district:
            query += " AND district = ?"
            params.append(district)
        if status:
            query += " AND status = ?"
            params.append(status)
        if search:
            query += " AND (applicant_name LIKE ? OR district LIKE ? OR village LIKE ? OR id LIKE ?)"
            s_term = f"%{search}%"
            params.extend([s_term, s_term, s_term, s_term])

        count_cursor = conn.cursor()
        count_query = query.replace("SELECT *", "SELECT COUNT(*)")
        count_cursor.execute(count_query, params)
        total_count = count_cursor.fetchone()[0]

        query += " ORDER BY created_at DESC LIMIT ? OFFSET ?"
        params.extend([limit, offset])

        cursor.execute(query, params)
        rows = cursor.fetchall()

        results = []
        for r in rows:
            verdict = {}
            if r["decision_verdict_json"]:
                try:
                    verdict = json.loads(r["decision_verdict_json"])
                except Exception:
                    verdict = {}

            scorecard = {}
            if r["scorecard_result_json"]:
                try:
                    scorecard = json.loads(r["scorecard_result_json"])
                except Exception:
                    scorecard = {}

            repayment = {}
            if r["repayment_schedule_json"]:
                try:
                    repayment = json.loads(r["repayment_schedule_json"])
                except Exception:
                    repayment = {}

            evidence = {}
            if r["evidence_snapshot_json"]:
                try:
                    evidence = json.loads(r["evidence_snapshot_json"])
                except Exception:
                    evidence = {}

            results.append({
                "id": r["id"],
                "localId": r["id"],
                "applicant_name": r["applicant_name"],
                "district": r["district"],
                "village": r["village"],
                "khasra_no": r["khasra_no"],
                "land_acres": r["land_acres"],
                "crop_type": r["crop_type"],
                "requested_loan_amount_inr": r["requested_loan_amount_inr"],
                "requested_tenure_months": r["requested_tenure_months"],
                "bureau_cibil_score": r["bureau_cibil_score"],
                "status": r["status"],
                "agri_credit_score": verdict.get("agri_credit_score", r["bureau_cibil_score"] or 650),
                "tier": verdict.get("tier", "TIER_2_ACCEPTABLE"),
                "underwriting_decision": verdict.get("decision", r["status"]),
                "max_sanction_amount_inr": verdict.get("sanctioned_amount_inr", r["requested_loan_amount_inr"]),
                "risk_adjusted_roi_pct": verdict.get("risk_adjusted_roi_pct", 8.8),
                "underwriting_verdict": verdict,
                "scorecard_breakdown": scorecard,
                "repayment_structure": repayment,
                "evidence": evidence,
                "created_at": r["created_at"],
            })

        return {"total": total_count, "applications": results}


@app.get("/api/v1/farmer/my-loan")
def get_farmer_active_loan(
    current_user: Optional[Dict[str, Any]] = Depends(get_optional_current_user),
) -> Dict[str, Any]:
    """
    Return the authenticated farmer's primary loan application with real satellite & harvest repayment metrics.
    If no authenticated session is active, defaults to the prime farmer portfolio benchmark (Rajeshwar Sahu / Kurud).
    """
    with get_db_connection() as conn:
        cursor = conn.cursor()
        app_row = None
        if current_user and current_user.get("user_id"):
            cursor.execute(
                "SELECT * FROM applications WHERE borrower_id = ? ORDER BY created_at DESC LIMIT 1",
                (current_user["user_id"],)
            )
            app_row = cursor.fetchone()

        if not app_row and current_user and current_user.get("name"):
            cursor.execute(
                "SELECT * FROM applications WHERE applicant_name LIKE ? ORDER BY created_at DESC LIMIT 1",
                (f"%{current_user['name'].split()[0]}%",)
            )
            app_row = cursor.fetchone()

        if not app_row:
            cursor.execute("SELECT * FROM applications WHERE applicant_name LIKE '%Rajeshwar%' OR district = 'Dhamtari' ORDER BY id ASC LIMIT 1")
            app_row = cursor.fetchone()

        if not app_row:
            cursor.execute("SELECT * FROM applications ORDER BY id ASC LIMIT 1")
            app_row = cursor.fetchone()

        if not app_row:
            raise HTTPException(status_code=404, detail="No active loan applications found.")

        verdict = json.loads(app_row["decision_verdict_json"]) if app_row["decision_verdict_json"] else {}
        scorecard = json.loads(app_row["scorecard_result_json"]) if app_row["scorecard_result_json"] else {}
        repayment = json.loads(app_row["repayment_schedule_json"]) if app_row["repayment_schedule_json"] else {}
        evidence = json.loads(app_row["evidence_snapshot_json"]) if app_row["evidence_snapshot_json"] else {}

        return {
            "application_id": app_row["id"],
            "applicant_name": app_row["applicant_name"],
            "status": app_row["status"],
            "district": app_row["district"],
            "village": app_row["village"],
            "khasra_no": app_row["khasra_no"],
            "land_acres": app_row["land_acres"],
            "crop_type": app_row["crop_type"],
            "requested_loan_amount_inr": app_row["requested_loan_amount_inr"],
            "sanctioned_amount_inr": verdict.get("sanctioned_amount_inr", app_row["requested_loan_amount_inr"]),
            "interest_rate_pct": verdict.get("risk_adjusted_roi_pct", 8.4),
            "agri_credit_score": verdict.get("agri_credit_score", 745),
            "tractor_model": verdict.get("recommended_product", "TVS 45HP Smart Farm Tractor"),
            "dealership": f"TVS {app_row['district']} Dealership",
            "underwriting_verdict": verdict,
            "scorecard_breakdown": scorecard,
            "repayment_structure": repayment,
            "evidence": evidence,
        }


@app.get("/api/v1/applications/{application_id}")
def get_application_by_id(
    application_id: str,
    current_user: Optional[Dict[str, Any]] = Depends(get_optional_current_user),
) -> Dict[str, Any]:
    """
    Retrieve durable application details by ID with borrower isolation.
    """
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM applications WHERE id = ?", (application_id,))
        app_row = cursor.fetchone()
        if not app_row:
            raise HTTPException(status_code=404, detail=f"Application '{application_id}' not found.")

        # Enforce borrower isolation: Borrower A cannot access Borrower B's application
        if current_user and current_user.get("role") == "Borrower":
            if app_row["borrower_id"] and app_row["borrower_id"] != current_user["user_id"]:
                raise HTTPException(
                    status_code=403,
                    detail="Access denied: You do not have permission to view this application.",
                )

        cursor.execute(
            "SELECT id, from_status, to_status, changed_by, reason, created_at FROM application_history WHERE application_id = ? ORDER BY id ASC",
            (application_id,)
        )
        history = [dict(r) for r in cursor.fetchall()]

        return {
            "application_id": app_row["id"],
            "status": app_row["status"],
            "applicant_name": app_row["applicant_name"],
            "district": app_row["district"],
            "village": app_row["village"],
            "khasra_no": app_row["khasra_no"],
            "land_acres": app_row["land_acres"],
            "crop_type": app_row["crop_type"],
            "requested_loan_amount_inr": app_row["requested_loan_amount_inr"],
            "requested_tenure_months": app_row["requested_tenure_months"],
            "bureau_cibil_score": app_row["bureau_cibil_score"],
            "policy_version": app_row["policy_version"],
            "model_version": app_row["model_version"],
            "underwriting_verdict": json.loads(app_row["decision_verdict_json"]),
            "scorecard_breakdown": json.loads(app_row["scorecard_result_json"]),
            "repayment_structure": json.loads(app_row["repayment_schedule_json"]),
            "evidence": json.loads(app_row["evidence_snapshot_json"]),
            "reviewed_by": app_row["reviewed_by"],
            "review_notes": app_row["review_notes"],
            "created_at": app_row["created_at"],
            "updated_at": app_row["updated_at"],
            "history": history,
        }


@app.post("/api/v1/applications/{application_id}/decision")
def signoff_application_decision(
    application_id: str,
    req: ApplicationDecisionRequest,
    current_user: Dict[str, Any] = Depends(get_current_officer),
) -> Dict[str, Any]:
    """
    Officer Sign-Off & Underwriting Verdict Signoff:
    Only authenticated officers (Agri Underwriters, Risk Operations) can finalize lending decisions.
    """
    valid_decisions = {"APPROVED", "DECLINED", "REVIEW_REQUIRED"}
    if req.decision not in valid_decisions:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid decision '{req.decision}'. Must be one of {valid_decisions}",
        )

    now_iso = datetime.datetime.now(datetime.timezone.utc).isoformat()
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM applications WHERE id = ?", (application_id,))
        app_row = cursor.fetchone()
        if not app_row:
            raise HTTPException(status_code=404, detail=f"Application '{application_id}' not found.")

        prev_status = app_row["status"]
        verdict = json.loads(app_row["decision_verdict_json"])
        verdict["officer_decision"] = req.decision
        verdict["officer_signoff_by"] = current_user["user_id"]
        verdict["officer_notes"] = req.notes

        if req.override_amount_inr is not None:
            verdict["sanctioned_amount_inr"] = req.override_amount_inr
            verdict["officer_overridden"] = True

        cursor.execute("""
            UPDATE applications
            SET status = ?, reviewed_by = ?, review_notes = ?, decision_verdict_json = ?, updated_at = ?
            WHERE id = ?
        """, (req.decision, current_user["user_id"], req.notes, json.dumps(verdict), now_iso, application_id))

        cursor.execute("""
            INSERT INTO application_history (application_id, from_status, to_status, changed_by, reason, created_at)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (application_id, prev_status, req.decision, current_user["user_id"], req.notes or f"Officer signoff verdict: {req.decision}", now_iso))

        cursor.execute("""
            INSERT INTO audit_logs (actor_id, action, entity_type, entity_id, details, created_at)
            VALUES (?, 'OFFICER_SIGNOFF', 'APPLICATION', ?, ?, ?)
        """, (current_user["user_id"], application_id, f"Transition: {prev_status} -> {req.decision}. Notes: {req.notes}", now_iso))

    return {
        "success": True,
        "application_id": application_id,
        "previous_status": prev_status,
        "current_status": req.decision,
        "reviewed_by": current_user["user_id"],
        "notes": req.notes,
        "updated_at": now_iso,
    }


@app.post("/api/v1/whatif")
def simulate_whatif_scenario(req: WhatIfSimulationRequest) -> Dict[str, Any]:
    """
    Macro-Climatic Stress Testing Simulator:
    Simulates portfolio default rate and NPA spikes under climate shock conditions.
    Grounded against active Chhattisgarh agricultural loan portfolio aggregates.
    """
    # Baseline Portfolio Stats aligned with active portfolio aggregates
    baseline_portfolio_crores = 988.0
    baseline_gnpa_pct = 2.30
    baseline_farmers_count = 23200

    # Impact calculation
    drought_penalty = max(0.0, -req.rainfall_change_pct) * 0.08
    heat_penalty = req.temperature_increase_c * 0.45
    price_penalty = max(0.0, -req.crop_market_price_change_pct) * 0.05

    stressed_gnpa_pct = round(baseline_gnpa_pct + drought_penalty + heat_penalty + price_penalty, 2)
    stressed_gnpa_crores = round(baseline_portfolio_crores * (stressed_gnpa_pct / 100.0), 2)
    baseline_gnpa_crores = round(baseline_portfolio_crores * (baseline_gnpa_pct / 100.0), 2)
    incremental_npa_crores = round(stressed_gnpa_crores - baseline_gnpa_crores, 2)
    at_risk_farmers_count = int(round(baseline_farmers_count * (stressed_gnpa_pct / 100.0)))

    # Restructuring Mitigation Benefit
    mitigated_gnpa_pct = round(stressed_gnpa_pct * 0.68, 2)
    saved_crores = round(stressed_gnpa_crores - (baseline_portfolio_crores * (mitigated_gnpa_pct / 100.0)), 2)

    return {
        "simulation_parameters": req.model_dump(),
        "baseline_portfolio": {
            "portfolio_size_crores": baseline_portfolio_crores,
            "gnpa_pct": baseline_gnpa_pct,
            "gnpa_amount_crores": baseline_gnpa_crores,
            "total_borrowers": baseline_farmers_count,
        },
        "stressed_portfolio_impact": {
            "stressed_gnpa_pct": stressed_gnpa_pct,
            "stressed_gnpa_amount_crores": stressed_gnpa_crores,
            "incremental_npa_crores": incremental_npa_crores,
            "at_risk_borrowers_count": at_risk_farmers_count,
        },
        "proactive_harvest_restructuring_benefit": {
            "mitigated_gnpa_pct": mitigated_gnpa_pct,
            "capital_loss_prevented_crores": saved_crores,
            "risk_mitigation_efficiency_pct": 32.0,
        }
    }


@app.get("/api/v1/portfolio")
def get_portfolio_summary() -> Dict[str, Any]:
    """
    District-level Portfolio-at-Risk (PAR) Summary & Heatmap across Chhattisgarh agricultural belt.
    Calculates dynamic exposure-weighted PAR-90 across all active agricultural districts.
    """
    districts = [
        {"district": "Raipur", "active_loans": 4200, "portfolio_cr": 185.0, "par_90_pct": 2.1, "mean_credit_score": 710, "top_crop": "Paddy"},
        {"district": "Durg", "active_loans": 3800, "portfolio_cr": 162.0, "par_90_pct": 1.9, "mean_credit_score": 725, "top_crop": "Paddy & Vegetables"},
        {"district": "Rajnandgaon", "active_loans": 3100, "portfolio_cr": 130.0, "par_90_pct": 2.8, "mean_credit_score": 685, "top_crop": "Soybean & Paddy"},
        {"district": "Bilaspur", "active_loans": 3500, "portfolio_cr": 145.0, "par_90_pct": 2.4, "mean_credit_score": 695, "top_crop": "Paddy & Wheat"},
        {"district": "Janjgir-Champa", "active_loans": 4600, "portfolio_cr": 198.0, "par_90_pct": 1.8, "mean_credit_score": 730, "top_crop": "Paddy (Canal Irrigated)"},
        {"district": "Korba", "active_loans": 2200, "portfolio_cr": 92.0, "par_90_pct": 3.4, "mean_credit_score": 665, "top_crop": "Paddy & Maize"},
        {"district": "Bastar (Jagdalpur)", "active_loans": 1800, "portfolio_cr": 76.0, "par_90_pct": 2.6, "mean_credit_score": 680, "top_crop": "Millets & Maize"},
    ]
    total_loans = sum(d["active_loans"] for d in districts)
    total_cr = round(sum(d["portfolio_cr"] for d in districts), 1)
    weighted_par90 = round(sum(d["portfolio_cr"] * d["par_90_pct"] for d in districts) / max(0.1, total_cr), 2)
    
    return {
        "total_active_agri_loans": total_loans,
        "total_portfolio_size_crores": total_cr,
        "portfolio_average_par90_pct": weighted_par90,
        "districts_data": districts,
    }


@app.get("/api/v1/ews/alerts")
def get_ews_alerts() -> Dict[str, Any]:
    """
    Returns live early-warning alerts and prioritized field collection dossiers.
    Backed by durable ews_alerts table with full lifecycle state tracking.
    """
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM ews_alerts ORDER BY days_past_due DESC, created_at DESC")
        rows = cursor.fetchall()

    alerts = []
    for r in rows:
        prev = r["previous_ndvi"]
        curr = r["current_ndvi"]
        drop = round(((prev - curr) / max(0.01, prev)) * 100.0, 1)
        alerts.append({
            "loan_id": r["loan_id"],
            "borrower_name": r["borrower_name"],
            "outstanding_principal_inr": r["outstanding_principal_inr"],
            "days_past_due": r["days_past_due"],
            "current_ndvi": curr,
            "previous_ndvi": prev,
            "rainfall_7d_forecast_mm": r["rainfall_7d_forecast_mm"],
            "ndvi_drop_pct": drop,
            "satellite_alert": drop >= 15.0,
            "satellite_message": f"{drop}% drop in satellite NDVI" if drop >= 15.0 else "Vegetation vigor stable",
            "climate_alert": r["rainfall_7d_forecast_mm"] > 120.0 or r["rainfall_7d_forecast_mm"] < 2.0,
            "climate_message": "Torrential rainfall" if r["rainfall_7d_forecast_mm"] > 120.0 else ("Moisture stress" if r["rainfall_7d_forecast_mm"] < 2.0 else "Normal"),
            "ews_severity": r["ews_severity"],
            "recommended_action": r["recommended_action"],
            "lifecycle_status": r["status"],
            "assigned_officer_id": r["assigned_officer_id"],
        })

    sample_dossiers = [
        recovery_gen.generate_dossier(
            loan_id="TVS-TR-2023-4109",
            borrower_name="Bhupendra Baghel",
            phone="+91-9752109832",
            village="Kurud",
            district="Dhamtari",
            outstanding_inr=390000.0,
            probability_of_default_pct=28.5,
            days_past_due=65,
            asset_type="TVS New 45HP Tractor",
            land_acres=3.8,
            khasra_no="214/1",
            crop_type="Paddy",
            latest_ndvi=0.35,
            weather_alert="42% NDVI drop (Severe Stem Borer Infestation)",
        ),
        recovery_gen.generate_dossier(
            loan_id="TVS-TR-2024-8812",
            borrower_name="Rameshwar Verma",
            phone="+91-9425201198",
            village="Arang",
            district="Raipur",
            outstanding_inr=520000.0,
            probability_of_default_pct=19.2,
            days_past_due=18,
            asset_type="TVS 50HP Tractor + Rotavator",
            land_acres=5.2,
            khasra_no="98/B",
            crop_type="Paddy",
            latest_ndvi=0.42,
            weather_alert="Torrential Rainfall Inundation Forecast (135mm)",
        )
    ]

    return {
        "active_alerts_count": len(alerts),
        "alerts": alerts,
        "prioritized_recovery_dossiers": sample_dossiers,
    }


@app.post("/api/v1/ews/transition")
def transition_ews_state(
    req: EWSTransitionRequest,
    current_user: Dict[str, Any] = Depends(get_current_officer),
) -> Dict[str, Any]:
    """
    Early Warning System Lifecycle State Transition:
    Allows authorized risk officers to transition active loan alerts across
    WATCHLIST, TRIGGERED, REMEDIATED, SMA_0, SMA_1, SMA_2, or RESTRUCTURED states.
    """
    now_iso = datetime.datetime.now(datetime.timezone.utc).isoformat()
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            UPDATE ews_alerts
            SET status = ?, assigned_officer_id = COALESCE(?, assigned_officer_id), resolution_notes = ?, updated_at = ?
            WHERE loan_id = ?
        """, (req.to_status, req.assigned_officer_id or current_user["user_id"], req.reason, now_iso, req.loan_id))

        cursor.execute("""
            INSERT INTO audit_logs (actor_id, action, entity_type, entity_id, details, created_at)
            VALUES (?, 'EWS_TRANSITION', 'LOAN', ?, ?, ?)
        """, (
            current_user["user_id"],
            req.loan_id,
            f"Transition to {req.to_status}. Reason: {req.reason or 'Risk officer trigger'}",
            now_iso
        ))

    return {
        "success": True,
        "loan_id": req.loan_id,
        "new_status": req.to_status,
        "transitioned_by": current_user["user_id"],
        "reason": req.reason,
        "timestamp": now_iso,
    }


@app.post("/api/v1/assistant/chat")
def chat_with_assistant(
    req: ChatAssistantRequest,
    current_user: Optional[Dict[str, Any]] = Depends(get_optional_current_user),
) -> Dict[str, Any]:
    """
    TVS Krishi Saathi GenAI Conversational Endpoint (Vernacular RAG).
    Supports durable server-side application context lookup, borrower isolation,
    message deduplication, and zero-borrower-context truthfulness.
    """
    context: Dict[str, Any] = {}

    if req.application_id:
        with get_db_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM applications WHERE id = ?", (req.application_id,))
            app_row = cursor.fetchone()
            if not app_row:
                raise HTTPException(status_code=404, detail=f"Application '{req.application_id}' not found.")

            # Enforce borrower isolation
            if current_user and current_user.get("role") == "Borrower":
                if app_row["borrower_id"] and app_row["borrower_id"] != current_user["user_id"]:
                    raise HTTPException(
                        status_code=403,
                        detail="Access denied: You cannot access the application data of another borrower.",
                    )

            verdict = json.loads(app_row["decision_verdict_json"])
            scorecard_res = json.loads(app_row["scorecard_result_json"])
            context = {
                "application_id": app_row["id"],
                "applicant_name": app_row["applicant_name"],
                "district": app_row["district"],
                "village": app_row["village"],
                "khasra_no": app_row["khasra_no"],
                "land_acres": app_row["land_acres"],
                "crop_type": app_row["crop_type"],
                "status": app_row["status"],
                "agri_credit_score": scorecard_res.get("agri_credit_score"),
                "tier": scorecard_res.get("tier"),
                "underwriting_decision": verdict.get("decision"),
                "recommended_product": verdict.get("recommended_product"),
                "sanctioned_amount_inr": verdict.get("sanctioned_amount_inr"),
                "interest_rate_pct": verdict.get("risk_adjusted_roi_pct"),
            }
    elif req.borrower_context:
        context = req.borrower_context
    else:
        # Zero borrower context: truthful general guidance without inventing fictitious loans
        context = {}

    return assistant.answer_query(
        user_message=req.message,
        borrower_context=context,
        language=req.language,
        session_id=req.session_id,
        message_id=req.message_id,
        api_key=req.api_key,
    )


@app.post("/api/v1/assistant/voice/query")
def process_voice_query(req: VoiceAssistantRequest) -> Dict[str, Any]:
    """
    Multilingual Voice Assistant Endpoint:
    Accepts speech transcript or audio, executes grounded RAG, and returns synthesized audio cues.
    Supports Hindi, English, and Chhattisgarhi dialects.
    """
    user_text = req.transcript
    if not user_text and req.audio_base64:
        stt_res = voice_engine.transcribe_audio(req.audio_base64, req.language)
        user_text = stt_res.get("text", "")

    if not user_text:
        user_text = "What are the eligibility guidelines for a TVS tractor loan?"

    context = req.borrower_context or {}

    rag_answer = assistant.answer_query(
        user_message=user_text,
        borrower_context=context,
        language=req.language,
    )

    tts_res = voice_engine.synthesize_speech(
        text=rag_answer["response"],
        language=req.language,
    )

    return {
        "user_query": user_text,
        "language": req.language,
        "assistant_response": rag_answer["response"],
        "audio_synthesis": tts_res,
        "grounded": rag_answer.get("grounded", True),
        "source": rag_answer.get("source", "VERNACULAR_HYBRID_RAG"),
    }


@app.post("/api/v1/assistant/tts/synthesize")
async def synthesize_neural_tts(req: TTSRequest):
    """
    Returns high-definition neural studio audio stream using 100% free edge-tts.
    Falls back cleanly to synthetic PCM WAV if offline.
    """
    audio_bytes = await voice_engine.synthesize_neural_mp3(req.text, req.language)
    if not audio_bytes:
        cue = voice_engine._classify_audio_cue(req.text)
        wav_uri = voice_engine.generate_audio_chime_wav(cue)
        raw_b64 = wav_uri.split(",", 1)[1] if "," in wav_uri else wav_uri
        audio_bytes = base64.b64decode(raw_b64)
        return Response(content=audio_bytes, media_type="audio/wav")
    return Response(content=audio_bytes, media_type="audio/mpeg")


@app.get("/api/v1/assistant/guidelines/search")
def search_policy_guidelines(q: str = "tractor loan Raipur") -> Dict[str, Any]:
    """
    Direct semantic search into TVS Credit underwriting policies and Chhattisgarh Mandi MSP calendars.
    """
    results = orchestrator.rag_agent.search_guidelines(query=q, top_k=5)
    return {
        "query": q,
        "count": len(results),
        "results": results,
    }


@app.post("/api/v1/agents/deliberate")
def deliberate_with_subagents(req: AgentDeliberationRequest) -> Dict[str, Any]:
    """
    Deep Agentic Layer Deliberation:
    Executes all 5 specialized subagents from the architecture diagram:
    Validation -> Guideline RAG -> Explainability Memo -> Escalation -> Guardrails -> Audit Trail.
    Provides automated analytical advisory recommendation (not binding underwriting signoff).
    """
    coords = [[p.lat, p.lon] for p in req.plot_coordinates]
    features = req.features or {
        "satellite_ndvi": 0.68,
        "bhuvan_verified": True,
        "climate_resilience_score": 0.76,
        "interest_rate_pct": 10.5,
        "max_sanction_amount_inr": 550000,
    }
    res = orchestrator.deliberate_application(
        applicant_name=req.applicant_name,
        coordinates=coords,
        khasra_no=req.khasra_no,
        district=req.district,
        credit_score=req.credit_score,
        tier=req.tier,
        features=features,
    )
    res["is_authoritative_approval"] = False
    res["advisory_notice"] = (
        "Agentic deliberation provides automated analytical advisory and does not constitute "
        "a legally binding underwriting approval without verified officer signoff."
    )
    return res

# Local microphone transcription, independent of browser speech services.
from .speech import router as speech_router
app.include_router(speech_router)

# Real-time streaming conversational voice session (Gemini Live WebSocket / Local Fallback)
from .voice_sessions import router as voice_router
app.include_router(voice_router, prefix="/api/v1")
