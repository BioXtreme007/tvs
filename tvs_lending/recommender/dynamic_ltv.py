class DynamicLTVEngine:
    def calculate_risk_pricing(self, base_product_roi, base_product_ltv, agri_credit_score, climate_resilience_score, soc_risk, asset_valuation_inr, **kwargs):
        adj_ltv = min(0.90, base_product_ltv + 0.05) # Capped at 90%
        max_sanction = round(asset_valuation_inr * adj_ltv, 2)
        return {
            "final_risk_adjusted_roi_pct": base_product_roi,
            "final_risk_adjusted_ltv": adj_ltv,
            "final_risk_adjusted_ltv_pct": round(adj_ltv * 100.0, 1),
            "max_eligible_sanction_amount_inr": max_sanction
        }
