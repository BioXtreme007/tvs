"""
Special Mention Account (SMA) & Loan Risk Lifecycle State Manager
Implements RBI-aligned SMA-0, SMA-1, SMA-2, and NPA state transitions with proactive restructuring triggers.
"""

from typing import Dict, Any


class RiskLifecycleManager:
    """
    Manages transitions across RBI asset classifications:
    - STANDARD_PERFORMING (0 DPD)
    - SPECIAL_WATCHLIST (0 DPD with severe agro-climatic stress)
    - SMA_0 (1-30 DPD)
    - SMA_1 (31-60 DPD)
    - SMA_2 (61-90 DPD)
    - NPA_DEFAULT (>90 DPD)
    """

    def __init__(self):
        pass

    def evaluate_account_state(
        self,
        days_past_due: int,
        ews_severity: str,
        cumulative_restructure_count: int = 0,
    ) -> Dict[str, Any]:
        """
        Determines current loan classification and automated collection protocol.
        """
        if days_past_due > 90:
            stage = "NPA_DEFAULT"
            provision_pct = 25.0
            action = "LEGAL_RECOVERY_ASSET_SEIZURE"
        elif days_past_due > 60:
            stage = "SMA_2"
            provision_pct = 15.0
            action = "SENIOR_FIELD_OFFICER_VISIT_ONE_TIME_SETTLEMENT"
        elif days_past_due > 30:
            stage = "SMA_1"
            provision_pct = 10.0
            action = "PROACTIVE_HARVEST_RESTRUCTURING_OR_TOPUP"
        elif days_past_due > 0:
            stage = "SMA_0"
            provision_pct = 5.0
            action = "DIGITAL_IVR_WHATSAPP_PAYMENT_LINK"
        elif ews_severity in ["CRITICAL_RED_ALERT", "HIGH_AMBER_ALERT"]:
            stage = "SPECIAL_WATCHLIST_EARLY_WARNING"
            provision_pct = 2.0
            action = "PROACTIVE_SEASONAL_EMI_EXTENSION_PREVENT_DEFAULT"
        else:
            stage = "STANDARD_PERFORMING"
            provision_pct = 0.40
            action = "REGULAR_ACCOUNT_MAINTENANCE"

        is_restructure_eligible = (
            stage in ["SPECIAL_WATCHLIST_EARLY_WARNING", "SMA_0", "SMA_1"]
            and cumulative_restructure_count < 2
        )

        return {
            "asset_classification": stage,
            "days_past_due": days_past_due,
            "regulatory_provision_pct": provision_pct,
            "recommended_collections_action": action,
            "is_restructure_eligible": is_restructure_eligible,
        }
