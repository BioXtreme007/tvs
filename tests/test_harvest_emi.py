"""
Comprehensive Unit Tests for HarvestEMIGenerator
Verifies:
1. Exact principal reconciliation across short and long tenures
2. Final outstanding balance is 0.00 within floating point rounding tolerance
3. Strictly increasing calendar due dates
4. Zero interest rate (0% ROI) edge case
5. Leap year month advance handling
6. Mode switching (HARVEST_ALIGNED vs EQUAL_MONTHLY)
7. Robust validation against negative or zero monetary inputs
"""

import datetime
import pytest
from tvs_lending.recommender.harvest_emi import HarvestEMIGenerator, _add_months


def test_standard_kharif_harvest_schedule():
    gen = HarvestEMIGenerator()
    res = gen.generate_harvest_schedule(
        loan_amount_inr=500000.0,
        annual_roi_pct=11.5,
        tenure_months=48,
        crop_type="PADDY_KHARIF",
        disbursement_date="2026-09-01",
        repayment_mode="HARVEST_ALIGNED",
    )
    
    assert res["principal_amount_inr"] == 500000.0
    assert len(res["installments"]) == 48
    assert res["reconciliation"]["is_fully_reconciled"] is True
    assert res["reconciliation"]["final_outstanding_balance_inr"] == 0.0
    assert abs(res["reconciliation"]["discrepancy_inr"]) < 0.01

    # Check due dates are strictly increasing
    dates = [datetime.date.fromisoformat(inst["due_date"]) for inst in res["installments"]]
    for i in range(1, len(dates)):
        assert dates[i] > dates[i - 1], f"Dates not strictly increasing: {dates[i-1]} -> {dates[i]}"


def test_equal_monthly_amortization():
    gen = HarvestEMIGenerator()
    res = gen.generate_harvest_schedule(
        loan_amount_inr=350000.0,
        annual_roi_pct=12.0,
        tenure_months=24,
        repayment_mode="EQUAL_MONTHLY",
    )

    assert len(res["installments"]) == 24
    assert res["reconciliation"]["is_fully_reconciled"] is True
    assert res["reconciliation"]["final_outstanding_balance_inr"] == 0.0

    # In equal monthly, regular payments (before final payoff) are approx equal
    amounts = [inst["installment_amount_inr"] for inst in res["installments"]]
    assert max(amounts[:-1]) - min(amounts[:-1]) < 2.0


def test_zero_interest_rate():
    gen = HarvestEMIGenerator()
    res = gen.generate_harvest_schedule(
        loan_amount_inr=120000.0,
        annual_roi_pct=0.0,
        tenure_months=12,
        repayment_mode="EQUAL_MONTHLY",
    )

    assert res["total_interest_inr"] == 0.0
    for inst in res["installments"]:
        assert inst["interest_component_inr"] == 0.0
        assert inst["installment_amount_inr"] == 10000.0
    assert res["reconciliation"]["is_fully_reconciled"] is True
    assert res["reconciliation"]["final_outstanding_balance_inr"] == 0.0


def test_short_tenure_6_months():
    gen = HarvestEMIGenerator()
    res = gen.generate_harvest_schedule(
        loan_amount_inr=75000.0,
        annual_roi_pct=9.5,
        tenure_months=6,
        crop_type="WHEAT_RABI",
    )
    assert len(res["installments"]) == 6
    assert res["reconciliation"]["is_fully_reconciled"] is True
    assert res["installments"][-1]["remaining_principal_inr"] == 0.0


def test_long_tenure_84_months():
    gen = HarvestEMIGenerator()
    res = gen.generate_harvest_schedule(
        loan_amount_inr=950000.0,
        annual_roi_pct=10.25,
        tenure_months=84,
    )
    assert len(res["installments"]) == 84
    assert res["reconciliation"]["is_fully_reconciled"] is True
    assert res["reconciliation"]["final_outstanding_balance_inr"] == 0.0


def test_leap_year_date_advancement():
    # 2024 is a leap year (Feb 29 exists)
    start = datetime.date(2024, 1, 31)
    # Next month must clamp to 2024-02-29
    m1 = _add_months(start, 1)
    assert m1 == datetime.date(2024, 2, 29)

    # In 2025 (not leap), Jan 31 + 1 month must clamp to 2025-02-28
    start_non_leap = datetime.date(2025, 1, 31)
    m1_non_leap = _add_months(start_non_leap, 1)
    assert m1_non_leap == datetime.date(2025, 2, 28)


def test_invalid_monetary_inputs():
    gen = HarvestEMIGenerator()
    with pytest.raises(ValueError, match="positive"):
        gen.generate_harvest_schedule(loan_amount_inr=-5000, annual_roi_pct=10, tenure_months=12)

    with pytest.raises(ValueError, match="at least 1 month"):
        gen.generate_harvest_schedule(loan_amount_inr=50000, annual_roi_pct=10, tenure_months=0)

    with pytest.raises(ValueError, match="cannot be negative"):
        gen.generate_harvest_schedule(loan_amount_inr=50000, annual_roi_pct=-2.0, tenure_months=12)
