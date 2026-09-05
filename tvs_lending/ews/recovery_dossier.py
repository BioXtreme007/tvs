"""
Prioritized Field Collection & Restructuring Action Dossier Generator
Ranks at-risk agricultural loan accounts and generates automated, actionable field recovery dossiers.
"""

from typing import Dict, Any, List


class RecoveryDossierGenerator:
    """
    Ranks borrower accounts by calculated collection risk:
    Priority Score = Default Risk (PD) * Outstanding Exposure * Climate Vulnerability * Recovery Confidence
    (Adapted from Vayu-AI Prioritized Action Dossier Architecture)
    """

    def __init__(self):
        pass

    def generate_dossier(
        self,
        loan_id: str,
        borrower_name: str,
        phone: str,
        village: str,
        district: str,
        outstanding_inr: float,
        probability_of_default_pct: float,
        days_past_due: int,
        asset_type: str,
        land_acres: float,
        khasra_no: str,
        crop_type: str,
        latest_ndvi: float,
        weather_alert: str,
    ) -> Dict[str, Any]:
        """
        Generates an individual prioritized field recovery dossier for TVS branch managers & field agents.
        """
        # Risk factors
        pd_norm = probability_of_default_pct / 100.0
        exp_factor = min(2.0, outstanding_inr / 300000.0)
        dpd_factor = 1.0 + (days_past_due / 30.0)
        
        # Priority Score (0 to 100)
        raw_priority = (pd_norm * 40.0) + (exp_factor * 25.0) + (dpd_factor * 20.0)
        priority_score = min(100.0, round(raw_priority, 1))

        if priority_score >= 70.0:
            urgency = "TIER_1_IMMEDIATE_ACTION_REQUIRED"
            action_playbook = "Dispatch Field Executive within 24 Hours. Offer 60-day Kharif Harvest Moratorium or One-Time Reschedulement."
        elif priority_score >= 45.0:
            urgency = "TIER_2_PROACTIVE_ENGAGEMENT"
            action_playbook = "Trigger automated WhatsApp advisory + Voice IVR payment reminder with link."
        else:
            urgency = "TIER_3_MONITORING"
            action_playbook = "Standard digital reminder on due date."

        return {
            "dossier_id": f"DOSSIER-{loan_id}",
            "loan_id": loan_id,
            "borrower_name": borrower_name,
            "phone": phone,
            "location": {"village": village, "district": district},
            "outstanding_principal_inr": outstanding_inr,
            "days_past_due": days_past_due,
            "probability_of_default_pct": probability_of_default_pct,
            "priority_score": priority_score,
            "urgency_level": urgency,
            "pledged_collateral": {
                "asset_type": asset_type,
                "land_acres": land_acres,
                "khasra_no": khasra_no,
                "crop": crop_type,
            },
            "satellite_ground_truth": {
                "current_ndvi": latest_ndvi,
                "weather_alert": weather_alert,
            },
            "recommended_action_playbook": action_playbook,
        }
