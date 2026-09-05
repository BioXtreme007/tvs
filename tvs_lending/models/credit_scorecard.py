from typing import Dict, Any, Optional
import numpy as np

class AgriCreditScorecard:
    def __init__(self):
        self.base_score = 550

    def compute_composite_score(
        self,
        bureau_cibil_score: Optional[int],
        annual_banking_turnover_inr: float,
        loan_amount_requested_inr: float,
        satellite_vigor: float,
        soc_deficiency_risk: float,
        climate_resilience_score: float,
        bhuvan_verified: bool,
        is_duplicate_collateral: bool,
        land_collateral_value_inr: float,
        past_tvs_defaults: int = 0,
    ) -> Dict[str, Any]:
        score = self.base_score
        attributions = []

        if is_duplicate_collateral or not bhuvan_verified:
            return {
                "agri_credit_score": 300,
                "tier": "REJECT",
                "underwriting_decision": "REJECT_HIGH_RISK",
                "roi_adjustment_pct": 0.0,
                "ltv_adjustment_pct": -0.50,
                "subscores": {"bureau_pts": 0, "satellite_pts": 0, "climate_pts": 0, "collateral_pts": -150},
                "additive_attributions": ["FRAUD_GATE_TRIGGERED"]
            }

        # 1. Financial Bureau
        bureau_pts = 0
        if past_tvs_defaults > 0:
            bureau_pts = -90
        elif bureau_cibil_score is not None and bureau_cibil_score > 0:
            if bureau_cibil_score >= 750: bureau_pts = 65
            elif bureau_cibil_score >= 680: bureau_pts = 35
            elif bureau_cibil_score >= 600: bureau_pts = -10
            else: bureau_pts = -30
        else:
            coverage = annual_banking_turnover_inr / max(1.0, loan_amount_requested_inr)
            bureau_pts = 10 if coverage >= 1.5 else -30
        
        score += bureau_pts
        attributions.append(f"Bureau: {bureau_pts:+d}")

        # 2. Satellite
        sat_pts = 0
        if satellite_vigor >= 0.65: sat_pts += 45
        elif satellite_vigor >= 0.50: sat_pts += 20
        elif satellite_vigor >= 0.35: sat_pts += -18
        else: sat_pts += -50
        
        if soc_deficiency_risk < 0.35: sat_pts += 35
        elif soc_deficiency_risk < 0.58: sat_pts += 10
        elif soc_deficiency_risk < 0.75: sat_pts += -20
        else: sat_pts += -45
        
        score += sat_pts
        attributions.append(f"Satellite: {sat_pts:+d}")

        # 3. Climate
        clim_pts = 0
        if climate_resilience_score >= 0.75: clim_pts = 30
        elif climate_resilience_score >= 0.55: clim_pts = 8
        elif climate_resilience_score >= 0.35: clim_pts = -25
        else: clim_pts = -60
        
        score += clim_pts
        attributions.append(f"Climate: {clim_pts:+d}")

        # 4. Collateral
        col_pts = 20  # bhuvan_verified is True
        ltv_cover = land_collateral_value_inr / max(1.0, loan_amount_requested_inr)
        if ltv_cover >= 2.0: col_pts += 25
        elif ltv_cover >= 1.0: col_pts += 15
        else: col_pts += -35
        
        score += col_pts
        attributions.append(f"Collateral: {col_pts:+d}")

        score = int(np.clip(score, 300, 900))

        if score >= 750:
            tier, decision, roi, ltv = "PRIME", "AUTO_RECOMMEND", -1.50, 0.05
        elif score >= 680:
            tier, decision, roi, ltv = "GOOD", "AUTO_RECOMMEND", -0.50, 0.0
        elif score >= 600:
            tier, decision, roi, ltv = "MODERATE", "MANUAL_UNDERWRITE", 0.75, -0.05
        elif score >= 500:
            tier, decision, roi, ltv = "HIGH_RISK", "RESTRICTED_LENDING", 2.25, -0.15
        else:
            tier, decision, roi, ltv = "REJECT", "REJECT_HIGH_RISK", 0.0, -0.50

        return {
            "agri_credit_score": score,
            "tier": tier,
            "underwriting_decision": decision,
            "roi_adjustment_pct": roi,
            "ltv_adjustment_pct": ltv,
            "subscores": {"bureau_pts": bureau_pts, "satellite_pts": sat_pts, "climate_pts": clim_pts, "collateral_pts": col_pts},
            "additive_attributions": attributions
        }
