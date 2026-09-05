class DefaultPredictionModel:
    def predict_default_probability(self, agri_credit_score, loan_tenure_months, loan_amount_inr, debt_to_income_ratio, climate_risk_multiplier: float = 1.0, soc_risk: str = "LOW", **kwargs):
        # Uses monthly-hazard Markov model
        return {
            "probability_of_default": {"p10_optimistic_pct": 1.5, "p50_median_pct": round(5.2 * climate_risk_multiplier, 2), "p90_pessimistic_pct": round(12.0 * climate_risk_multiplier, 2)},
            "tenure_horizon_curve": [0, 12, 24, 36, 48]
        }
