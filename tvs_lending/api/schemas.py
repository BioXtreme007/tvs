"""
Pydantic Schemas for TVS Smart Lending Decision Hub REST API
"""

from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field


class PlotCoordinate(BaseModel):
    lat: float
    lon: float


class LoanApplicationRequest(BaseModel):
    applicant_name: str = Field(..., min_length=1, example="Rajesh Sahu")
    phone: str = Field(default="+91-9827104421", min_length=8, example="+91-9827104421")
    district: str = Field(default="Raipur", min_length=1, example="Raipur")
    village: str = Field(default="Abhanpur", min_length=1, example="Abhanpur")
    khasra_no: str = Field(default="142/1", min_length=1, example="142/1")
    land_acres: float = Field(default=4.5, gt=0.0, le=5000.0, example=4.5)
    crop_type: str = Field(default="PADDY_KHARIF", min_length=1, example="PADDY_KHARIF")
    requested_loan_amount_inr: float = Field(default=550000.0, gt=0.0, le=100000000.0, example=550000.0)
    requested_tenure_months: int = Field(default=48, ge=1, le=84, example=48)
    requested_product_type: str = Field(default="TRACTOR_NEW", min_length=1, example="TRACTOR_NEW")
    bureau_cibil_score: Optional[int] = Field(default=None, ge=300, le=900, example=690)
    annual_banking_turnover_inr: float = Field(default=480000.0, ge=0.0, example=480000.0)
    plot_coordinates: List[PlotCoordinate] = Field(
        default_factory=lambda: [
            PlotCoordinate(lat=21.2514, lon=81.6296),
            PlotCoordinate(lat=21.2530, lon=81.6320),
            PlotCoordinate(lat=21.2495, lon=81.6315),
            PlotCoordinate(lat=21.2514, lon=81.6296),
        ]
    )
    cloud_cover_pct: float = Field(default=45.0, ge=0.0, le=100.0, example=45.0)
    idempotency_key: Optional[str] = Field(default=None, description="Optional unique idempotency token to prevent duplicate application submissions")


class WhatIfSimulationRequest(BaseModel):
    rainfall_change_pct: float = Field(default=-30.0, example=-30.0)
    temperature_increase_c: float = Field(default=2.5, example=2.5)
    crop_market_price_change_pct: float = Field(default=-10.0, example=-10.0)


class ChatAssistantRequest(BaseModel):
    message: str = Field(..., min_length=1, example="What is my approved loan amount and EMI schedule?")
    language: str = Field(default="ENGLISH", example="ENGLISH")
    borrower_context: Optional[Dict[str, Any]] = None
    application_id: Optional[str] = Field(default=None, description="Durable application ID for authenticated borrower lookup")
    session_id: Optional[str] = Field(default=None, description="Conversational session ID")
    message_id: Optional[str] = Field(default=None, description="Unique client message ID for request deduplication")
    api_key: Optional[str] = Field(default=None, description="Optional free Groq / Gemini / OpenAI API key")


class ApplicationDecisionRequest(BaseModel):
    decision: str = Field(..., example="APPROVED", description="Officer verdict: APPROVED, DECLINED, or REVIEW_REQUIRED")
    notes: Optional[str] = Field(default=None, example="Field inspection confirmed drip irrigation and healthy Kharif paddy crop.")
    override_amount_inr: Optional[float] = Field(default=None, ge=0.0, description="Optional officer override for approved loan amount")


class EWSTransitionRequest(BaseModel):
    loan_id: str = Field(..., min_length=1, example="TVS-TR-2024-8812")
    to_status: str = Field(..., example="WATCHLIST", description="Target EWS status: WATCHLIST, TRIGGERED, REMEDIATED, RESTRUCTURED")
    reason: Optional[str] = Field(default=None, example="Torrential rain inundation alert triggered field restructuring")
    assigned_officer_id: Optional[str] = Field(default=None, example="TVS-USR-1002")


class VoiceAssistantRequest(BaseModel):
    audio_base64: Optional[str] = Field(default=None, description="Base64 encoded audio bytes")
    transcript: Optional[str] = Field(default=None, description="Direct text transcript from browser Web Speech API")
    language: str = Field(default="HINDI", example="HINDI")
    borrower_context: Optional[Dict[str, Any]] = None


class TTSRequest(BaseModel):
    text: str = Field(..., example="नमस्ते राजेश जी, आपका लोन स्वीकृत है।")
    language: str = Field(default="HINDI", example="HINDI")


class AgentDeliberationRequest(BaseModel):
    applicant_name: str = Field(default="Rajesh Sahu")
    district: str = Field(default="Raipur")
    khasra_no: str = Field(default="142/1")
    credit_score: int = Field(default=735)
    tier: str = Field(default="GOOD")
    plot_coordinates: List[PlotCoordinate] = Field(
        default_factory=lambda: [
            PlotCoordinate(lat=21.2514, lon=81.6296),
            PlotCoordinate(lat=21.2530, lon=81.6320),
            PlotCoordinate(lat=21.2495, lon=81.6315),
        ]
    )
    features: Optional[Dict[str, Any]] = None


class SignUpRequest(BaseModel):
    name: str = Field(..., example="Rajeshwar Sharma")
    email: str = Field(..., example="rajeshwar.sharma@tvscredit.com")
    phone: str = Field(default="+91 98271 04421", example="+91 98271 04421")
    role: str = Field(default="Agri Underwriter", example="Agri Underwriter")
    branch: Optional[str] = Field(default="Raipur Hub", example="Raipur Hub")
    password: str = Field(..., min_length=6, example="SecurePass@2026")
    invite_code: Optional[str] = Field(default=None, example="TVS_OFFICER_2026", description="Institutional authorization code for officer/manager roles")


class LoginRequest(BaseModel):
    email: str = Field(..., example="rajeshwar.sharma@tvscredit.com")
    password: str = Field(..., example="Underwrite@2026")


class UserProfile(BaseModel):
    user_id: str
    name: str
    email: str
    phone: Optional[str] = None
    role: str
    branch: Optional[str] = None
    created_at: Optional[str] = None


class AuthResponse(BaseModel):
    success: bool
    message: str
    token: Optional[str] = None
    user: Optional[UserProfile] = None


class LogoutResponse(BaseModel):
    success: bool
    message: str

