"""
TVS Loan Product Recommender Engine
Matches borrower land profile, credit tier, and cashflow needs to the optimal TVS Credit lending product.
"""

from typing import Dict, Any, List
import sys
from pathlib import Path

# Add project root to sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent.parent))
import config


class ProductMatcher:
    """
    Recommends optimal loan products from TVS Credit's portfolio:
    - TVS New Tractor Loan
    - TVS Used Tractor Loan
    - TVS Kisan Two-Wheeler Loan
    - TVS Farm Harvester & Agri-Implement Loan
    - TVS Krishi Seasonal Input Line of Credit
    """

    def __init__(self):
        self.products = config.TVS_LOAN_PRODUCTS

    def recommend_products(
        self,
        land_acres: float,
        annual_net_farm_income_inr: float,
        agri_credit_score: int,
        requested_purpose: str = "TRACTOR",
    ) -> List[Dict[str, Any]]:
        """
        Recommends eligible loan products with tailored loan limits, interest rates, and maximum tenures.
        """
        recommendations = []

        # Determine credit adjustment
        if agri_credit_score >= 750:
            rate_discount = -1.50
            ltv_boost = 0.05
        elif agri_credit_score >= 680:
            rate_discount = -0.50
            ltv_boost = 0.0
        elif agri_credit_score >= 600:
            rate_discount = 0.75
            ltv_boost = -0.05
        else:
            rate_discount = 2.00
            ltv_boost = -0.15

        for p_key, p_info in self.products.items():
            # Check land eligibility
            is_land_eligible = land_acres >= p_info["min_land_acres"]
            
            # Max borrowing power based on net farm income (max 50% FOIR / Fixed Obligation to Income Ratio)
            max_annual_emi_capacity = annual_net_farm_income_inr * 0.50
            
            # Maximum affordable principal across product tenure
            tenure_years = p_info["max_tenure_months"] / 12.0
            affordable_principal = min(p_info["max_amount"], max_annual_emi_capacity * tenure_years * 0.75)
            max_sanction_amount = max(p_info["min_amount"], min(affordable_principal, p_info["max_amount"]))

            final_roi = max(8.5, round(p_info["base_roi"] + rate_discount, 2))
            final_ltv = min(0.95, round(p_info["base_ltv"] + ltv_boost, 2))

            match_score = 0.0
            if requested_purpose in p_key:
                match_score += 0.50
            if is_land_eligible:
                match_score += 0.30
            if agri_credit_score >= 650:
                match_score += 0.20

            recommendations.append({
                "product_key": p_key,
                "product_name": p_info["name"],
                "eligible": is_land_eligible and agri_credit_score >= 500,
                "match_score": round(match_score, 2),
                "recommended_max_amount_inr": round(max_sanction_amount, 2),
                "interest_rate_roi_pct": final_roi,
                "max_tenure_months": p_info["max_tenure_months"],
                "maximum_ltv_pct": round(final_ltv * 100, 1),
                "min_land_required_acres": p_info["min_land_acres"],
            })

        # Sort by match score descending
        recommendations.sort(key=lambda x: (x["eligible"], x["match_score"]), reverse=True)
        return recommendations
