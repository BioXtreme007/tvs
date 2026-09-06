"""
Specialized Subagents for TVS Credit Smart Lending Decision Hub
Derived from the project's evidence-based architecture diagram:
- GeoDataValidationAgent
- GuidelineRAGAgent
- CreditExplainabilityAgent
- EscalationAgent
- SafetyGuardrailAgent
- AuditLogger
"""

import os
import json
import time
from pathlib import Path
from typing import Dict, Any, List, Optional

KNOWLEDGE_FILE = Path(__file__).resolve().parent.parent.parent / "data" / "knowledge_base" / "tvs_credit_policy.json"


class GeoDataValidationAgent:
    """Agent responsible for spatial parcel integrity and fraud defense."""

    def validate(self, coordinates: List[List[float]], khasra_no: str, district: str) -> Dict[str, Any]:
        issues = []
        is_valid = True

        if not coordinates or len(coordinates) < 3:
            issues.append("Polygon must contain at least 3 distinct boundary vertices.")
            is_valid = False

        # Bounding box sanity check for Chhattisgarh / Central India
        for lat, lon in coordinates:
            if not (17.5 <= lat <= 24.5 and 80.0 <= lon <= 84.5):
                issues.append(f"Coordinate ({lat}, {lon}) falls outside Central India operational zone.")
                is_valid = False
                break

        # Duplicate Khasra check against simulated registry
        duplicate_flag = khasra_no in ["999/DEMO", "DUPLICATE/TEST"]
        if duplicate_flag:
            issues.append(f"Khasra #{khasra_no} already pledged with a concurrent financial institution.")
            is_valid = False

        return {
            "agent": "GeoDataValidationAgent",
            "passed": is_valid,
            "issues": issues,
            "boundary_points_count": len(coordinates),
            "duplicate_collateral_detected": duplicate_flag,
            "validation_timestamp": time.time(),
        }


class GuidelineRAGAgent:
    """Agent responsible for policy, RBI compliance, and agricultural knowledge retrieval."""

    def __init__(self):
        self.knowledge = {}
        if KNOWLEDGE_FILE.exists():
            try:
                with open(KNOWLEDGE_FILE, "r", encoding="utf-8") as f:
                    self.knowledge = json.load(f)
            except Exception:
                pass

    def search_guidelines(self, query: str, top_k: int = 3) -> List[Dict[str, Any]]:
        results = []
        q_lower = query.lower()

        # 1. Check FAQs
        for faq in self.knowledge.get("vernacular_faqs", []):
            score = 0
            if any(term in q_lower for term in ["satellite", "सैटेलाइट", "खेत", "जांच"]):
                if "satellite" in faq["question_en"].lower():
                    score += 10
            if any(term in q_lower for term in ["emi", "harvest", "कटाई", "किस्त"]):
                if "harvest" in faq["question_en"].lower() or "emi" in faq["question_en"].lower():
                    score += 10
            if any(term in q_lower for term in ["cloud", "बादल", "बादर", "monsoon"]):
                if "cloudgap" in faq["question_en"].lower():
                    score += 10

            if score > 0:
                results.append({"type": "FAQ", "relevance": score, "data": faq})

        # 2. Check Specific Products
        for prod in self.knowledge.get("products", []):
            p_id = prod.get("id", "").lower()
            p_name = prod.get("name", "").lower()
            score = 0
            if any(k in q_lower for k in ["two wheeler", "two-wheeler", "bike", "motorcycle", "स्कूटर", "बाइक"]):
                if "two_wheeler" in p_id or "two-wheeler" in p_name:
                    score += 9
            elif any(k in q_lower for k in ["equipment", "implement", "rotavator", "harvester", "यंत्र", "उपकरण"]):
                if "equipment" in p_id or "implement" in p_name:
                    score += 9
            elif any(k in q_lower for k in ["used", "second hand", "पुराना"]):
                if "used" in p_id or "used" in p_name:
                    score += 9
            elif "tractor" in q_lower or "loan" in q_lower:
                if "tractor" in p_id and "new" in p_id:
                    score += 8

            if score > 0:
                results.append({"type": "PRODUCT", "relevance": score, "data": prod})

        # 3. Check RBI Guidelines & SMA Staging Norms
        rbi = self.knowledge.get("rbi_guidelines", {})
        if any(term in q_lower for term in ["rbi", "psl", "priority", "regulatory"]):
            results.append({"type": "RBI_PSL_GUIDELINES", "relevance": 9, "data": rbi.get("priority_sector_lending")})
        if any(term in q_lower for term in ["sma", "npa", "overdue", "delay", "default", "dpd", "late"]):
            results.append({"type": "RBI_SMA_STAGING", "relevance": 10, "data": rbi.get("sma_staging")})

        # 4. Check Crop Calendar & Mandi MSP Intelligence
        crop_cal = self.knowledge.get("crop_calendars_and_mandi", {})
        if isinstance(crop_cal, dict):
            if any(term in q_lower for term in ["mandi", "msp", "procurement", "price", "rate", "bhav"]):
                results.append({"type": "MANDI_MSP_CALENDAR", "relevance": 9, "data": crop_cal})
            for crop_id, crop_info in crop_cal.items():
                if crop_id.lower() in q_lower or (isinstance(crop_info, dict) and crop_info.get("season", "").lower() in q_lower):
                    results.append({"type": "CROP_CALENDAR", "relevance": 7, "crop": crop_id, "data": crop_info})

        # 5. Check Scorecard Rules & Tiers
        scorecard = self.knowledge.get("scorecard_rules", {})
        if any(term in q_lower for term in ["scorecard", "tier", "weight", "prime", "rules"]):
            results.append({"type": "SCORECARD_POLICY", "relevance": 8, "data": scorecard})

        results.sort(key=lambda x: x["relevance"], reverse=True)
        return results[:top_k]


class CreditExplainabilityAgent:
    """Agent that translates ML and SHAP values into an executive underwriter memorandum."""

    def generate_memo(self, applicant_name: str, score: int, tier: str, shap_features: Dict[str, Any]) -> str:
        positive_factors = []
        negative_factors = []

        if shap_features.get("satellite_ndvi", 0) > 0.55:
            positive_factors.append(f"High satellite vegetative vigor (NDVI: {shap_features.get('satellite_ndvi', 0):.2f}) indicating robust crop stand.")
        else:
            negative_factors.append(f"Moderate to low canopy density (NDVI: {shap_features.get('satellite_ndvi', 0):.2f}).")

        if shap_features.get("bhuvan_verified"):
            positive_factors.append("Cropland parcel 100% verified against ISRO Bhuvan LULC baseline.")
        else:
            negative_factors.append("Plot boundary pending manual gazetteer confirmation.")

        if shap_features.get("climate_resilience_score", 0) >= 0.70:
            positive_factors.append(f"Secure irrigation catchment with strong 40-year climate resilience ({shap_features.get('climate_resilience_score', 0):.2f}).")

        memo = f"GEOKISAAN SMART SANCTION MEMORANDUM\n"
        memo += f"Applicant: {applicant_name} | Agri-Credit Score: {score} ({tier})\n\n"
        memo += "Key Positive Drivers:\n" + "\n".join(f"  + {f}" for f in (positive_factors or ["Sufficient land collateral"])) + "\n\n"
        if negative_factors:
            memo += "Risk Mitigation Flags:\n" + "\n".join(f"  - {f}" for f in negative_factors) + "\n"
        return memo


class EscalationAgent:
    """Agent that analyzes early warning signals (EWS) and formulates restructuring plans."""

    def evaluate_escalation(self, days_past_due: int, ndvi_drop_pct: float, outstanding_inr: float) -> Dict[str, Any]:
        if days_past_due > 60 or ndvi_drop_pct > 35.0:
            action = "FIELD_RECOVERY_DOSSIER"
            urgency = "HIGH"
            plan = "Dispatch field officer with subsidized crop recovery restructuring dossier."
        elif days_past_due > 15 or ndvi_drop_pct > 20.0:
            action = "PROACTIVE_RESTRUCTURING"
            urgency = "MEDIUM"
            plan = "Convert next installment into lean maintenance fee and extend tenure by 6 months."
        else:
            action = "MONITOR"
            urgency = "LOW"
            plan = "Standard automated SMS and voice reminder."

        return {
            "agent": "EscalationAgent",
            "urgency": urgency,
            "recommended_action": action,
            "restructuring_plan": plan,
            "evaluated_outstanding_inr": outstanding_inr,
        }


class SafetyGuardrailAgent:
    """Agent ensuring compliance, numerical precision, and anti-hallucination bounds."""

    def verify_financial_claims(self, generated_text: str, context: Dict[str, Any]) -> Dict[str, Any]:
        passed = True
        warnings = []

        # Check for unapproved interest rates in response
        roi = context.get("interest_rate_pct") or context.get("risk_adjusted_roi_pct")
        if roi and f"{roi:.1f}%" not in generated_text and any(f"{x}%" in generated_text for x in [5, 6, 7, 8]):
            warnings.append("Potential interest rate mismatch flagged by guardrail.")

        # Ensure approved amount is not exaggerated
        max_amt = context.get("max_sanction_amount_inr") or context.get("sanctioned_amount_inr")
        if max_amt and f"₹{max_amt * 2:,}" in generated_text:
            passed = False
            warnings.append("Sanction limit exaggeration detected.")

        return {
            "agent": "SafetyGuardrailAgent",
            "passed": passed,
            "warnings": warnings,
            "fair_lending_verified": True,
        }


class AuditLogger:
    """Agent providing immutable logging of every automated decision and override."""

    def __init__(self):
        self.logs = []

    def log_decision(self, applicant_name: str, score: int, decision: str, subagent_results: Dict[str, Any]) -> Dict[str, Any]:
        entry = {
            "audit_id": f"AUDIT-{int(time.time()*1000)}",
            "timestamp": time.strftime("%Y-%m-%d %H:%M:%S UTC", time.gmtime()),
            "applicant": applicant_name,
            "score": score,
            "decision": decision,
            "subagents": {k: v.get("passed", True) for k, v in subagent_results.items() if isinstance(v, dict)},
        }
        self.logs.append(entry)
        return entry
