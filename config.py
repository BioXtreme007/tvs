"""
TVS Credit AI-Powered Smart Lending Decision Hub
Global Configuration and Constants
"""

import os
from pathlib import Path

# Base Paths
HUB_ROOT = Path(__file__).resolve().parent
DATA_DIR = HUB_ROOT / "data"
OUTPUTS_DIR = HUB_ROOT / "outputs"
MODELS_DIR = HUB_ROOT / "models_cache"

for d in [DATA_DIR, OUTPUTS_DIR, MODELS_DIR]:
    d.mkdir(parents=True, exist_ok=True)

# GeoKisaan Loan Products
GEOKISAAN_LOAN_PRODUCTS = {
    "TRACTOR_NEW": {
        "name": "GeoKisaan New Tractor Loan",
        "min_amount": 250000,
        "max_amount": 1200000,
        "base_roi": 11.5,
        "max_tenure_months": 60,
        "base_ltv": 0.85,
        "min_land_acres": 3.0,
    },
    "TRACTOR_USED": {
        "name": "GeoKisaan Used Tractor Loan",
        "min_amount": 100000,
        "max_amount": 600000,
        "base_roi": 13.5,
        "max_tenure_months": 48,
        "base_ltv": 0.75,
        "min_land_acres": 2.0,
    },
    "KISAN_TWO_WHEELER": {
        "name": "GeoKisaan Kisan Rural Two-Wheeler Loan",
        "min_amount": 35000,
        "max_amount": 140000,
        "base_roi": 14.0,
        "max_tenure_months": 36,
        "base_ltv": 0.90,
        "min_land_acres": 0.5,
    },
    "AGRI_EQUIPMENT": {
        "name": "GeoKisaan Farm Harvester & Implement Loan",
        "min_amount": 80000,
        "max_amount": 800000,
        "base_roi": 12.5,
        "max_tenure_months": 48,
        "base_ltv": 0.80,
        "min_land_acres": 2.5,
    },
    "CROP_INPUT_CREDIT": {
        "name": "GeoKisaan Krishi Seasonal Input Line of Credit",
        "min_amount": 20000,
        "max_amount": 300000,
        "base_roi": 10.5,
        "max_tenure_months": 12,
        "base_ltv": 0.70,
        "min_land_acres": 1.0,
    },
}
TVS_LOAN_PRODUCTS = GEOKISAAN_LOAN_PRODUCTS

# Crop Harvest Schedules in India (Month numbers 1-12)
CROP_CALENDARS = {
    "PADDY_KHARIF": {
        "sowing": [6, 7],      # Jun-Jul
        "growing": [8, 9, 10],  # Aug-Oct
        "harvest": [11, 12],    # Nov-Dec (Peak Liquidity)
        "mandi_liquidity": [11, 12, 1],
        "base_yield_tha": 3.8,  # tonnes per hectare
        "msp_per_quintal": 2300 # INR
    },
    "WHEAT_RABI": {
        "sowing": [10, 11],     # Oct-Nov
        "growing": [12, 1, 2],  # Dec-Feb
        "harvest": [3, 4],      # Mar-Apr (Peak Liquidity)
        "mandi_liquidity": [4, 5],
        "base_yield_tha": 4.2,
        "msp_per_quintal": 2275
    },
    "SOYBEAN_KHARIF": {
        "sowing": [6, 7],
        "growing": [8, 9],
        "harvest": [10, 11],
        "mandi_liquidity": [10, 11, 12],
        "base_yield_tha": 2.2,
        "msp_per_quintal": 4892
    },
    "COTTON_KHARIF": {
        "sowing": [5, 6],
        "growing": [7, 8, 9, 10],
        "harvest": [11, 12, 1],
        "mandi_liquidity": [12, 1, 2],
        "base_yield_tha": 1.8,
        "msp_per_quintal": 7121
    },
    "SUGARCANE_ANNUAL": {
        "sowing": [2, 3],
        "growing": [4, 5, 6, 7, 8, 9, 10, 11],
        "harvest": [12, 1, 2, 3],
        "mandi_liquidity": [1, 2, 3, 4],
        "base_yield_tha": 75.0,
        "msp_per_quintal": 340
    }
}

# Scoring Weights
SCORECARD_WEIGHTS = {
    "FINANCIAL_BUREAU": 0.40,
    "SATELLITE_LAND_HEALTH": 0.30,
    "CLIMATE_RESILIENCE": 0.20,
    "COLLATERAL_COVER": 0.10,
}

# Score Tier Thresholds (300 to 900)
SCORE_TIERS = {
    "PRIME": {"min": 750, "max": 900, "decision": "AUTO_APPROVE", "roi_discount": -1.5, "ltv_boost": 0.05},
    "GOOD": {"min": 680, "max": 749, "decision": "FAST_TRACK_APPROVE", "roi_discount": -0.5, "ltv_boost": 0.0},
    "MODERATE": {"min": 600, "max": 679, "decision": "MANUAL_UNDERWRITE", "roi_discount": 0.5, "ltv_boost": -0.05},
    "HIGH_RISK": {"min": 500, "max": 599, "decision": "RESTRICTED_LENDING", "roi_discount": 2.0, "ltv_boost": -0.15},
    "REJECT": {"min": 300, "max": 499, "decision": "REJECT", "roi_discount": 0.0, "ltv_boost": -0.50},
}
