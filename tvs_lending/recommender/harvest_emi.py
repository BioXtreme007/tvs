"""
Seasonally-Aligned Harvest Repayment Engine
Calculates exact amortization schedules aligned with Chhattisgarh crop phenology 
and harvest cashflow cycles (Kharif/Rabi), as well as standard reducing-balance monthly schedules.

Monetary arithmetic rules:
- All INR monetary components are rounded to nearest whole rupee (or 2 decimals where required).
- Final installment reconciles any cumulative rounding differences to guarantee exactly 0.00 balance.
- Reconciles: Sum(principal_components) == sanctioned_principal.
"""

from typing import Dict, Any, List, Optional
import datetime
import calendar


# Crop growth stages mapped by month in crop season
KHARIF_STAGES = {
    1: "Sowing & Basal Application",
    2: "Vegetative Growth & Tillering",
    3: "Panicle Initiation & Flowering",
    4: "Grain Filling & Maturation",
    5: "Harvest & Mandi Procurement",
    6: "Post-Harvest Liquidation",
}

RABI_STAGES = {
    1: "Sowing & Germination",
    2: "Crown Root & Vegetative",
    3: "Heading & Flowering",
    4: "Grain Formation & Hardening",
    5: "Harvest & Mandi Selling",
    6: "Post-Harvest Settlement",
}


def _add_months(source_date: datetime.date, months: int) -> datetime.date:
    """Safely advance date by N months, correctly handling month length and leap years."""
    month = source_date.month - 1 + months
    year = source_date.year + month // 12
    month = month % 12 + 1
    day = min(source_date.day, calendar.monthrange(year, month)[1])
    return datetime.date(year, month, day)


class HarvestEMIGenerator:
    """
    Financial engine for agricultural credit repayment schedules.
    Provides:
    1. HARVEST_ALIGNED: Bullet/balloon payments concentrated at post-harvest Mandi windows,
       with low interest-servicing installments during vegetative/monsoon months.
    2. EQUAL_MONTHLY: Standard reducing balance EMI amortization schedule.
    """

    def __init__(self, default_currency: str = "INR"):
        self.currency = default_currency

    def generate_harvest_schedule(
        self,
        loan_amount_inr: float,
        annual_roi_pct: float,
        tenure_months: int,
        crop_type: str = "PADDY_KHARIF",
        disbursement_date: Optional[str] = None,
        repayment_mode: str = "HARVEST_ALIGNED",
        processing_fee_pct: float = 1.0,
    ) -> Dict[str, Any]:
        """
        Generate full dated repayment schedule with exact mathematical reconciliation.
        """
        # Validate inputs
        if loan_amount_inr <= 0:
            raise ValueError(f"Loan amount must be positive. Received {loan_amount_inr}")
        if tenure_months < 1:
            raise ValueError(f"Tenure must be at least 1 month. Received {tenure_months}")
        if annual_roi_pct < 0:
            raise ValueError(f"Interest rate cannot be negative. Received {annual_roi_pct}")

        principal = round(float(loan_amount_inr), 2)
        annual_rate = float(annual_roi_pct) / 100.0
        monthly_rate = annual_rate / 12.0

        if disbursement_date:
            try:
                start_date = datetime.date.fromisoformat(disbursement_date)
            except ValueError:
                start_date = datetime.date.today()
        else:
            start_date = datetime.date.today()

        is_kharif = "KHARIF" in crop_type.upper() or "PADDY" in crop_type.upper()
        stage_map = KHARIF_STAGES if is_kharif else RABI_STAGES

        processing_fee_inr = round(principal * (processing_fee_pct / 100.0), 2)

        installments: List[Dict[str, Any]] = []
        remaining_balance = principal
        total_interest_paid = 0.0
        total_principal_paid = 0.0

        if repayment_mode == "EQUAL_MONTHLY":
            # Standard Reducing Balance Monthly Amortization
            if monthly_rate > 0:
                # EMI = P * r * (1+r)^n / ((1+r)^n - 1)
                factor = (1.0 + monthly_rate) ** tenure_months
                base_emi = principal * (monthly_rate * factor) / (factor - 1.0)
            else:
                base_emi = principal / tenure_months

            for m in range(1, tenure_months + 1):
                due_date = _add_months(start_date, m)
                interest_component = round(remaining_balance * monthly_rate, 2)
                
                if m == tenure_months:
                    # Final installment: exact balance payoff
                    principal_component = round(remaining_balance, 2)
                    installment_amount = round(principal_component + interest_component, 2)
                    remaining_balance = 0.0
                else:
                    principal_component = round(base_emi - interest_component, 2)
                    installment_amount = round(principal_component + interest_component, 2)
                    remaining_balance = round(remaining_balance - principal_component, 2)

                total_interest_paid = round(total_interest_paid + interest_component, 2)
                total_principal_paid = round(total_principal_paid + principal_component, 2)

                cycle_idx = ((m - 1) % 6) + 1
                growth_stage = stage_map.get(cycle_idx, "Agricultural Production Cycle")

                installments.append({
                    "installment_number": m,
                    "due_date": due_date.isoformat(),
                    "crop_growth_stage": growth_stage,
                    "installment_amount_inr": installment_amount,
                    "principal_component_inr": principal_component,
                    "interest_component_inr": interest_component,
                    "fee_component_inr": processing_fee_inr if m == 1 else 0.0,
                    "remaining_principal_inr": max(0.0, remaining_balance),
                    "payment_type": "REGULAR_EMI",
                })

        else:
            # HARVEST_ALIGNED: Seasonally-Synchronized Cashflow Structure
            # Cycles are typically 6-month seasonal intervals (Months 1-5 vegetative, Month 6 harvest bullet)
            # Or in multi-year loans (e.g. 12m, 24m, 48m, 84m), every 6th month represents a harvest liquidation.
            
            num_cycles = max(1, tenure_months // 6)
            # Determine harvest months
            harvest_months = set()
            for c in range(1, num_cycles + 1):
                harvest_months.add(min(tenure_months, c * 6))
            if tenure_months not in harvest_months:
                harvest_months.add(tenure_months)

            num_harvests = len(harvest_months)
            principal_per_harvest = round(principal / num_harvests, 2)

            for m in range(1, tenure_months + 1):
                due_date = _add_months(start_date, m)
                interest_component = round(remaining_balance * monthly_rate, 2)
                is_harvest_month = m in harvest_months

                if m == tenure_months:
                    # Final installment clears entire remaining principal
                    principal_component = round(remaining_balance, 2)
                    installment_amount = round(principal_component + interest_component, 2)
                    remaining_balance = 0.0
                    payment_type = "FINAL_HARVEST_SETTLEMENT"
                elif is_harvest_month:
                    principal_component = min(remaining_balance, principal_per_harvest)
                    installment_amount = round(principal_component + interest_component, 2)
                    remaining_balance = round(remaining_balance - principal_component, 2)
                    payment_type = "HARVEST_BALLOON_PAYOUT"
                else:
                    # Vegetative stage: interest-only servicing to prevent interest accumulation without distress
                    principal_component = 0.0
                    installment_amount = interest_component
                    payment_type = "INTEREST_SERVICING_CROP_STAGE"

                total_interest_paid = round(total_interest_paid + interest_component, 2)
                total_principal_paid = round(total_principal_paid + principal_component, 2)

                cycle_idx = ((m - 1) % 6) + 1
                growth_stage = stage_map.get(cycle_idx, "Agricultural Production Cycle")

                installments.append({
                    "installment_number": m,
                    "due_date": due_date.isoformat(),
                    "crop_growth_stage": growth_stage,
                    "installment_amount_inr": installment_amount,
                    "principal_component_inr": principal_component,
                    "interest_component_inr": interest_component,
                    "fee_component_inr": processing_fee_inr if m == 1 else 0.0,
                    "remaining_principal_inr": max(0.0, remaining_balance),
                    "payment_type": payment_type,
                })

        # Calculate exact reconciliation
        sum_principal = round(sum(inst["principal_component_inr"] for inst in installments), 2)
        sum_interest = round(sum(inst["interest_component_inr"] for inst in installments), 2)
        final_balance = installments[-1]["remaining_principal_inr"] if installments else 0.0
        is_reconciled = abs(sum_principal - principal) < 0.01 and final_balance == 0.0

        return {
            "repayment_mode": repayment_mode,
            "currency": self.currency,
            "principal_amount_inr": principal,
            "total_interest_inr": sum_interest,
            "total_fees_inr": processing_fee_inr,
            "total_repayable_inr": round(sum_principal + sum_interest + processing_fee_inr, 2),
            "tenure_months": tenure_months,
            "annual_roi_pct": annual_roi_pct,
            "crop_type": crop_type,
            "disbursement_date": start_date.isoformat(),
            "first_due_date": installments[0]["due_date"] if installments else None,
            "maturity_date": installments[-1]["due_date"] if installments else None,
            "installments": installments,
            "installments_sample": installments[:6],
            "reconciliation": {
                "sanctioned_principal_inr": principal,
                "repaid_principal_inr": sum_principal,
                "discrepancy_inr": round(sum_principal - principal, 2),
                "final_outstanding_balance_inr": final_balance,
                "is_fully_reconciled": is_reconciled,
            },
        }
