"""
Wind Load Calculation Engine
EN 1991-1-4:2005 — Eurocode 1: Actions on structures — Wind actions

All section references (§) point to the standard.
This module is intentionally framework-free: pure Python + math.
"""

import math
from dataclasses import dataclass
from typing import Literal

# ---------------------------------------------------------------------------
# Terrain category parameters — Table 4.1
# ---------------------------------------------------------------------------

TERRAIN_PARAMS: dict[str, dict] = {
    "0": {
        "description": "Sea, coastal area exposed to open sea",
        "z0": 0.003,   # roughness length [m]
        "z_min": 1.0,  # minimum height [m]
    },
    "I": {
        "description": "Lakes or flat, horizontal area with negligible vegetation",
        "z0": 0.01,
        "z_min": 1.0,
    },
    "II": {
        "description": "Area with low vegetation and isolated obstacles",
        "z0": 0.05,
        "z_min": 2.0,
    },
    "III": {
        "description": "Area with regular vegetation, buildings, or isolated obstacles",
        "z0": 0.3,
        "z_min": 5.0,
    },
    "IV": {
        "description": "Urban area with at least 15% buildings taller than 15 m",
        "z0": 1.0,
        "z_min": 10.0,
    },
}

# Terrain category II is the reference — §4.3.2
Z0_II = 0.05
Z_MIN_II = 2.0


# ---------------------------------------------------------------------------
# Data classes
# ---------------------------------------------------------------------------

@dataclass
class WindInput:
    vb0: float            # fundamental basic wind velocity [m/s]
    z: float              # reference height [m]
    terrain_cat: str      # "0", "I", "II", "III", "IV"
    cdir: float = 1.0     # directional factor (conservative = 1.0) §4.2(2)
    cseason: float = 1.0  # season factor (conservative = 1.0) §4.2(2)
    rho: float = 1.25     # air density [kg/m³] §4.5(1)
    # Orography factor: 1.0 = flat terrain (conservative) §4.3.3
    co: float = 1.0
    # Turbulence intensity factor k1 = 1.0 §4.4(1)
    k1: float = 1.0
    # Internal pressure coefficient cpi §7.2.9
    cpi: float = 0.0
    # Roof geometry
    roof_type: Literal["flat", "monopitch", "duopitch"] = "flat"
    roof_angle: float = 0.0  # degrees
    # Structural factor cs_cd (§6)
    natural_frequency: float = 1.0  # Hz


@dataclass
class PressureCoefficients:
    """External pressure coefficients for vertical walls — Table 7.1"""
    zone: str          # D (windward) or E (leeward)
    h_d_ratio: float   # h/d ratio used
    cpe_10: float      # for loaded area >= 10 m²
    cpe_1: float       # for loaded area < 1 m²


@dataclass
class WindResult:
    # Intermediate values
    vb: float           # basic wind velocity [m/s]         §4.2
    cr: float           # roughness factor                  §4.3.2
    vm: float           # mean wind velocity [m/s]          §4.3.1
    iv: float           # turbulence intensity              §4.4
    qp: float           # peak velocity pressure [Pa]       §4.5
    # Wall pressure coefficients
    cpe_d: float        # windward wall (zone D) cpe,10
    cpe_e: float        # leeward wall  (zone E) cpe,10
    we_d: float         # net wind pressure windward [Pa]   §5.2
    we_e: float         # net wind pressure leeward [Pa]
    # Roof pressure coefficients (Flat Roof §7.2.3)
    cpe_f: float        # Zone F
    cpe_g: float        # Zone G
    cpe_h: float        # Zone H
    cpe_i: float        # Zone I
    we_f: float         # net wind pressure Zone F [Pa]
    we_g: float         # net wind pressure Zone G [Pa]
    we_h: float         # net wind pressure Zone H [Pa]
    we_i: float         # net wind pressure Zone I [Pa]
    # Internal pressure
    cpi: float
    wi: float           # internal pressure [Pa]
    # Net pressures (external + internal)
    wnet_d: float       # net pressure on zone D [Pa]
    wnet_e: float       # net pressure on zone E [Pa]
    # Metadata
    terrain_description: str
    h_d_ratio_used: float


# ---------------------------------------------------------------------------
# Core calculation functions
# ---------------------------------------------------------------------------

def basic_wind_velocity(vb0: float, cdir: float, cseason: float) -> float:
    """
    Basic wind velocity — §4.2 (Eq. 4.1)
    vb = cdir · cseason · vb,0
    """
    return cdir * cseason * vb0


def roughness_factor(z: float, terrain_cat: str) -> float:
    """
    Terrain roughness factor cr(z) — §4.3.2 (Eq. 4.4 & 4.5)
    Accounts for variability of mean wind speed at the site height.
    """
    params = TERRAIN_PARAMS[terrain_cat]
    z0 = params["z0"]
    z_min = params["z_min"]

    kr = 0.19 * (z0 / Z0_II) ** 0.07  # Eq. 4.5

    z_eff = max(z, z_min)
    cr = kr * math.log(z_eff / z0)    # Eq. 4.4
    return cr


def mean_wind_velocity(vb: float, cr: float, co: float) -> float:
    """
    Mean wind velocity vm(z) — §4.3.1 (Eq. 4.3)
    """
    return cr * co * vb


def turbulence_intensity(z: float, terrain_cat: str, co: float, k1: float) -> float:
    """
    Wind turbulence intensity Iv(z) — §4.4 (Eq. 4.7)
    """
    params = TERRAIN_PARAMS[terrain_cat]
    z0 = params["z0"]
    z_min = params["z_min"]
    z_eff = max(z, z_min)
    iv = k1 / (co * math.log(z_eff / z0))
    return iv


def peak_velocity_pressure(vm: float, iv: float, rho: float) -> float:
    """
    Peak velocity pressure qp(z) — §4.5 (Eq. 4.8)
    qp = [1 + 7·Iv(z)] · 0.5 · ρ · vm²
    Returns value in Pascals.
    """
    return (1 + 7 * iv) * 0.5 * rho * vm ** 2


def external_pressure_coefficients(h: float, d: float) -> tuple[float, float]:
    """
    External pressure coefficients for vertical walls (zones D and E)
    Table 7.1 — EN 1991-1-4.

    h = building height [m]
    d = building depth in wind direction [m]

    Returns (cpe_D, cpe_E) for loaded area >= 10 m².
    Linear interpolation is used between table breakpoints.
    """
    ratio = h / d

    # Table 7.1 breakpoints: h/d → (cpe_D, cpe_E)
    table = [
        (0.25, +0.7, -0.3),
        (1.00, +0.8, -0.5),
        (5.00, +0.8, -0.7),   # >= 5 extrapolates as constant per note
    ]

    if ratio <= table[0][0]:
        return table[0][1], table[0][2]
    if ratio >= table[-1][0]:
        return table[-1][1], table[-1][2]

    # Linear interpolation
    for i in range(len(table) - 1):
        r0, d0, e0 = table[i]
        r1, d1, e1 = table[i + 1]
        if r0 <= ratio <= r1:
            t = (ratio - r0) / (r1 - r0)
            return d0 + t * (d1 - d0), e0 + t * (e1 - e0)

    return table[-1][1], table[-1][2]


def monopitch_roof_coefficients(angle: float) -> dict[str, float]:
    """
    External pressure coefficients for monopitch roofs (§7.2.4).
    Simplified lookup for cpe,10.
    """
    # Table 7.3a (simplified)
    if angle <= 5: return {"F": -2.3, "G": -1.3, "H": -0.8}
    if angle <= 15: return {"F": -2.5, "G": -1.3, "H": -0.9}
    if angle <= 30: return {"F": -2.1, "G": -1.2, "H": -0.8}
    return {"F": -1.5, "G": -1.0, "H": -0.5}

def duopitch_roof_coefficients(angle: float) -> dict[str, float]:
    """
    External pressure coefficients for duopitch roofs (§7.2.5).
    Simplified lookup for cpe,10.
    """
    # Table 7.4a (simplified)
    if angle <= 5: return {"F": -2.3, "G": -1.2, "H": -0.7}
    if angle <= 15: return {"F": -1.3, "G": -1.0, "H": -0.5}
    if angle <= 30: return {"F": -0.9, "G": -0.8, "H": -0.3}
    return {"F": -0.5, "G": -0.5, "H": -0.2}

def structural_factor(h: float) -> float:
    """
    Simplified structural factor cs_cd (§6).
    For buildings < 15m, cs_cd = 1.0 (§6.3.1).
    """
    if h < 15:
        return 1.0
    # Very simplified approximation for taller buildings
    return 1.0 + 0.1 * (h / 100)

def wind_pressure(qp: float, cpe: float) -> float:
    """
    External wind pressure on a surface — §5.2 (Eq. 5.1)
    we = qp · cpe
    """
    return qp * cpe


# ---------------------------------------------------------------------------
# Top-level function
# ---------------------------------------------------------------------------

def calculate_wind_loads(inp: WindInput, h: float, d: float) -> WindResult:
    """
    Full EN 1991-1-4 wind load calculation for a rectangular building.

    Parameters
    ----------
    inp : WindInput   — site and climate parameters
    h   : float       — building height [m]
    d   : float       — building depth in wind direction [m]

    Returns
    -------
    WindResult with all intermediate values and final pressures.
    """
    if inp.terrain_cat not in TERRAIN_PARAMS:
        raise ValueError(f"terrain_cat must be one of {list(TERRAIN_PARAMS.keys())}")
    if h <= 0 or d <= 0:
        raise ValueError("Building dimensions must be positive.")
    if inp.vb0 <= 0:
        raise ValueError("Basic wind speed vb0 must be positive.")

    vb   = basic_wind_velocity(inp.vb0, inp.cdir, inp.cseason)
    cr   = roughness_factor(inp.z, inp.terrain_cat)
    vm   = mean_wind_velocity(vb, cr, inp.co)
    iv   = turbulence_intensity(inp.z, inp.terrain_cat, inp.co, inp.k1)
    qp   = peak_velocity_pressure(vm, iv, inp.rho)
    cscd = structural_factor(h)

    cpe_d, cpe_e = external_pressure_coefficients(h, d)
    
    if inp.roof_type == "monopitch":
        roof_cpes = monopitch_roof_coefficients(inp.roof_angle)
        # Map missing zones to standard baseline
        if "I" not in roof_cpes: roof_cpes["I"] = -0.2 
    elif inp.roof_type == "duopitch":
        roof_cpes = duopitch_roof_coefficients(inp.roof_angle)
        if "I" not in roof_cpes: roof_cpes["I"] = -0.2
    else:
        # Default Flat Roof
        roof_cpes = {
            "F": -1.8, "G": -1.2, "H": -0.7, "I": 0.2
        }

    we_d = wind_pressure(qp, cpe_d) * cscd
    we_e = wind_pressure(qp, cpe_e) * cscd
    we_f = wind_pressure(qp, roof_cpes["F"]) * cscd
    we_g = wind_pressure(qp, roof_cpes["G"]) * cscd
    we_h = wind_pressure(qp, roof_cpes["H"]) * cscd
    we_i = wind_pressure(qp, roof_cpes["I"]) * cscd

    wi = wind_pressure(qp, inp.cpi)
    wnet_d = we_d - wi
    wnet_e = we_e - wi

    return WindResult(
        vb=round(vb, 3),
        cr=round(cr, 4),
        vm=round(vm, 3),
        iv=round(iv, 4),
        qp=round(qp, 2),
        cpe_d=round(cpe_d, 3),
        cpe_e=round(cpe_e, 3),
        we_d=round(we_d, 2),
        we_e=round(we_e, 2),
        cpe_f=roof_cpes["F"],
        cpe_g=roof_cpes["G"],
        cpe_h=roof_cpes["H"],
        cpe_i=roof_cpes["I"],
        we_f=round(we_f, 2),
        we_g=round(we_g, 2),
        we_h=round(we_h, 2),
        we_i=round(we_i, 2),
        cpi=inp.cpi,
        wi=round(wi, 2),
        wnet_d=round(wnet_d, 2),
        wnet_e=round(wnet_e, 2),
        terrain_description=TERRAIN_PARAMS[inp.terrain_cat]["description"],
        h_d_ratio_used=round(h / d, 3),
    )
