"""
Crop Phenology & Satellite Growth Curve Consistency Validator
Validates borrower-declared crop against multi-temporal NDVI vegetation signatures.
"""

from typing import Dict, Any, List
import numpy as np


class CropPhenologyValidator:
    """
    Compares declared crop phenology lifecycle against multi-temporal Sentinel-2 NDVI time-series.
    Flags fake agricultural declarations (e.g. claiming Sugarcane/Cotton on barren/fallow land).
    """

    # Expected peak NDVI and lifecycle length in months
    EXPECTED_PHENOLOGY = {
        "PADDY_KHARIF": {"peak_ndvi_min": 0.60, "growth_months": 4, "peak_month": 9},
        "WHEAT_RABI": {"peak_ndvi_min": 0.58, "growth_months": 4, "peak_month": 1},
        "SOYBEAN_KHARIF": {"peak_ndvi_min": 0.55, "growth_months": 3.5, "peak_month": 8},
        "COTTON_KHARIF": {"peak_ndvi_min": 0.62, "growth_months": 6, "peak_month": 10},
        "SUGARCANE_ANNUAL": {"peak_ndvi_min": 0.70, "growth_months": 12, "peak_month": 7},
    }

    def __init__(self):
        pass

    def validate_crop_phenology(
        self,
        declared_crop: str,
        observed_current_ndvi: float,
        current_month: int = 9,
    ) -> Dict[str, Any]:
        """
        Evaluates whether current observed NDVI is consistent with the declared crop's biological stage.
        """
        crop_spec = self.EXPECTED_PHENOLOGY.get(
            declared_crop,
            {"peak_ndvi_min": 0.50, "growth_months": 4, "peak_month": 9}
        )

        expected_peak = crop_spec["peak_ndvi_min"]
        peak_month = crop_spec["peak_month"]

        # Month delta from peak
        month_diff = abs(current_month - peak_month)
        if month_diff > 6:
            month_diff = 12 - month_diff

        # Expected NDVI for current month
        expected_stage_ndvi = max(0.20, expected_peak - (0.08 * month_diff))

        # Check deviation
        ndvi_deviation = observed_current_ndvi - expected_stage_ndvi
        is_consistent = ndvi_deviation >= -0.22

        phenology_match_score = float(np.clip(1.0 - abs(ndvi_deviation) / 0.5, 0.1, 1.0))

        return {
            "declared_crop": declared_crop,
            "current_month": current_month,
            "observed_ndvi": round(observed_current_ndvi, 3),
            "expected_stage_ndvi": round(expected_stage_ndvi, 3),
            "phenology_match_score": round(phenology_match_score, 3),
            "is_phenology_consistent": is_consistent,
            "phenology_alert": (
                "CONSISTENT_CROP_GROWTH"
                if is_consistent
                else f"CROP_INCONSISTENCY_WARNING: Observed NDVI ({observed_current_ndvi:.2f}) far below expected {declared_crop} vigor ({expected_stage_ndvi:.2f})"
            ),
        }
