"""
EWS Real-Time Anomaly Watcher Daemon
Monitors active agricultural loan portfolios against satellite crop health drops and 14-day climate shocks.
"""

from typing import Dict, Any, List


class EWSWatcher:
    """
    Scans active borrower accounts to identify early default triggers 14-30 days before cheque bounces occur.
    """

    def __init__(self):
        pass

    def scan_active_loan_risk(
        self,
        loan_id: str,
        borrower_name: str,
        current_ndvi: float,
        previous_ndvi: float,
        rainfall_7d_forecast_mm: float,
        days_past_due: int = 0,
        outstanding_principal_inr: float = 450000.0,
    ) -> Dict[str, Any]:
        """
        Evaluates early warning signals for an active borrower.
        """
        # 1. Satellite Vegetation Shock Detection
        ndvi_drop_pct = round(((previous_ndvi - current_ndvi) / max(0.01, previous_ndvi)) * 100.0, 1)
        satellite_alert = False
        satellite_message = "Vegetation vigor stable"

        if ndvi_drop_pct >= 25.0:
            satellite_alert = True
            satellite_message = f"CRITICAL CROP SHOCK: {ndvi_drop_pct}% sudden drop in satellite NDVI (Pest/Hail/Drought damage)"
        elif ndvi_drop_pct >= 15.0:
            satellite_alert = True
            satellite_message = f"MODERATE CROP STRESS: {ndvi_drop_pct}% NDVI decline detected"

        # 2. Climate Shock Detection
        climate_alert = False
        climate_message = "Weather forecasts within normal range"
        if rainfall_7d_forecast_mm > 120.0:
            climate_alert = True
            climate_message = f"TORRENTIAL FLOOD THREAT: {rainfall_7d_forecast_mm}mm precipitation forecast in 7 days"
        elif rainfall_7d_forecast_mm < 2.0:
            climate_alert = True
            climate_message = "ACUTE DRY SPELL: Sustained moisture stress forecast in 7 days"

        # 3. Overall EWS Trigger Level
        if days_past_due > 60 or (satellite_alert and ndvi_drop_pct >= 25.0 and days_past_due > 0):
            ews_severity = "CRITICAL_RED_ALERT"
            recommended_action = "DISPATCH_FIELD_RECOVERY_OFFICER_IMMEDIATE_RESTRUCTURE"
        elif days_past_due > 30 or (satellite_alert and climate_alert):
            ews_severity = "HIGH_AMBER_ALERT"
            recommended_action = "OFFER_SEASONAL_EMI_MORATORIUM_VIA_WHATSAPP"
        elif satellite_alert or climate_alert or days_past_due > 0:
            ews_severity = "WATCHLIST_YELLOW_ALERT"
            recommended_action = "DISPATCH_AGRONOMIC_ADVISORY_SMS"
        else:
            ews_severity = "GREEN_HEALTHY"
            recommended_action = "NORMAL_SERVICING"

        return {
            "loan_id": loan_id,
            "borrower_name": borrower_name,
            "outstanding_principal_inr": outstanding_principal_inr,
            "days_past_due": days_past_due,
            "current_ndvi": current_ndvi,
            "previous_ndvi": previous_ndvi,
            "rainfall_7d_forecast_mm": rainfall_7d_forecast_mm,
            "ndvi_drop_pct": ndvi_drop_pct,
            "satellite_alert": satellite_alert,
            "satellite_message": satellite_message,
            "climate_alert": climate_alert,
            "climate_message": climate_message,
            "ews_severity": ews_severity,
            "recommended_action": recommended_action,
        }
