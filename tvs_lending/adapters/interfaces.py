from typing import Protocol, Dict, Any, List, Optional, Tuple
from dataclasses import dataclass

@dataclass(frozen=True)
class PlotPolygon:
    polygon_id: str
    coordinates: List[Tuple[float, float]]
    khasra_no: str
    village: str
    district: str
    declared_crop: str
    declared_acres: float

@dataclass(frozen=True)
class SpectralIndices:
    ndvi: float
    bsi: float
    ndwi: float
    swir1_nir_ratio: float
    swir1_red_ratio: float
    bsi_ndvi_ratio: float
    canopy_vigor: float
    is_bare_soil: bool

@dataclass(frozen=True)
class InpaintingResult:
    reconstructed_indices: SpectralIndices
    confidence_tier: int
    quality_flag: str
    psnr_db: float
    ssim: float
    allow_automated_yield_scoring: bool
