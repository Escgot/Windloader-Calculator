"""
Test suite for the wind load engine.
All reference values are hand-calculated from EN 1991-1-4 worked examples
and standard textbook references (e.g. Gulvanessian et al., 2012).

Run with:
    pytest tests/ -v
"""

import math
import pytest
from app.engine import (
    WindInput,
    basic_wind_velocity,
    roughness_factor,
    mean_wind_velocity,
    turbulence_intensity,
    peak_velocity_pressure,
    external_pressure_coefficients,
    wind_pressure,
    calculate_wind_loads,
    TERRAIN_PARAMS,
)

TOL = 1e-2  # 1% tolerance for engineering calculations


# ---------------------------------------------------------------------------
# Unit tests — individual functions
# ---------------------------------------------------------------------------

class TestBasicWindVelocity:
    def test_conservative_factors(self):
        """cdir=cseason=1.0 → vb = vb0"""
        assert basic_wind_velocity(25.0, 1.0, 1.0) == pytest.approx(25.0)

    def test_directional_factor(self):
        assert basic_wind_velocity(30.0, 0.9, 1.0) == pytest.approx(27.0)

    def test_both_factors(self):
        assert basic_wind_velocity(28.0, 0.9, 0.8) == pytest.approx(20.16)


class TestRoughnessFactor:
    def test_terrain_II_reference(self):
        """Terrain II at z=10m: kr=0.19, cr = 0.19·ln(10/0.05)"""
        kr = 0.19 * (0.05 / 0.05) ** 0.07  # = 0.19
        expected = kr * math.log(10 / 0.05)
        cr = roughness_factor(10.0, "II")
        assert cr == pytest.approx(expected, rel=TOL)

    def test_terrain_0_lower_than_II(self):
        """Smoother terrain → higher cr (less roughness attenuation)"""
        cr_0 = roughness_factor(10.0, "0")
        cr_II = roughness_factor(10.0, "II")
        assert cr_0 > cr_II

    def test_terrain_IV_lower_than_II(self):
        """Rougher urban terrain → lower cr"""
        cr_IV = roughness_factor(10.0, "IV")
        cr_II = roughness_factor(10.0, "II")
        assert cr_IV < cr_II

    def test_z_below_zmin_clamps(self):
        """Height below z_min for terrain IV (10m) should clamp to z_min"""
        cr_5 = roughness_factor(5.0, "IV")
        cr_10 = roughness_factor(10.0, "IV")
        assert cr_5 == pytest.approx(cr_10)

    def test_increases_with_height(self):
        """cr should increase monotonically above z_min"""
        crs = [roughness_factor(z, "II") for z in [2, 5, 10, 20, 50, 100]]
        assert all(crs[i] < crs[i + 1] for i in range(len(crs) - 1))


class TestTurbulenceIntensity:
    def test_decreases_with_height(self):
        """Iv should decrease as z increases above z_min"""
        ivs = [turbulence_intensity(z, "II", 1.0, 1.0) for z in [2, 5, 10, 20, 50]]
        assert all(ivs[i] > ivs[i + 1] for i in range(len(ivs) - 1))

    def test_terrain_IV_higher_than_II(self):
        """Rougher terrain → higher turbulence at same height"""
        iv_IV = turbulence_intensity(20.0, "IV", 1.0, 1.0)
        iv_II = turbulence_intensity(20.0, "II", 1.0, 1.0)
        assert iv_IV > iv_II


class TestPeakVelocityPressure:
    def test_textbook_value(self):
        """
        Reference: vb=25 m/s, terrain II, z=10m.
        Expected qp ≈ 600 Pa (typical Central European value).
        """
        cr = roughness_factor(10.0, "II")
        vm = mean_wind_velocity(25.0, cr, 1.0)
        iv = turbulence_intensity(10.0, "II", 1.0, 1.0)
        qp = peak_velocity_pressure(vm, iv, 1.25)
        assert 800 < qp < 1000  # terrain II, z=10m, vb=25: cr~1.007 => qp~919 Pa

    def test_higher_speed_gives_higher_pressure(self):
        def qp_for_speed(v):
            cr = roughness_factor(10.0, "II")
            vm = mean_wind_velocity(v, cr, 1.0)
            iv = turbulence_intensity(10.0, "II", 1.0, 1.0)
            return peak_velocity_pressure(vm, iv, 1.25)
        assert qp_for_speed(30) > qp_for_speed(25)


class TestPressureCoefficients:
    def test_low_building_hd_025(self):
        """h/d = 0.25 → cpe_D=0.7, cpe_E=-0.3 per Table 7.1"""
        cpe_d, cpe_e = external_pressure_coefficients(h=5, d=20)
        assert cpe_d == pytest.approx(0.7, abs=0.01)
        assert cpe_e == pytest.approx(-0.3, abs=0.01)

    def test_square_building_hd_1(self):
        """h/d = 1.0 → cpe_D=0.8, cpe_E=-0.5"""
        cpe_d, cpe_e = external_pressure_coefficients(h=10, d=10)
        assert cpe_d == pytest.approx(0.8, abs=0.01)
        assert cpe_e == pytest.approx(-0.5, abs=0.01)

    def test_tall_building_hd_5(self):
        """h/d >= 5 → cpe_D=0.8, cpe_E=-0.7"""
        cpe_d, cpe_e = external_pressure_coefficients(h=50, d=10)
        assert cpe_d == pytest.approx(0.8, abs=0.01)
        assert cpe_e == pytest.approx(-0.7, abs=0.01)

    def test_interpolation_hd_05(self):
        """h/d = 0.5 should interpolate between 0.25 and 1.0 breakpoints"""
        cpe_d, cpe_e = external_pressure_coefficients(h=5, d=10)
        assert 0.7 < cpe_d < 0.8
        assert -0.5 < cpe_e < -0.3


class TestWindPressure:
    def test_positive_cpe_gives_positive_pressure(self):
        assert wind_pressure(600, 0.8) == pytest.approx(480.0)

    def test_negative_cpe_gives_negative_pressure(self):
        """Negative we = suction"""
        assert wind_pressure(600, -0.5) == pytest.approx(-300.0)


# ---------------------------------------------------------------------------
# Integration test — full calculation chain
# ---------------------------------------------------------------------------

class TestFullCalculation:
    def setup_method(self):
        """Standard reference building: 25 m/s, terrain II, 10×10×20 m"""
        self.inp = WindInput(vb0=25.0, z=10.0, terrain_cat="II")
        self.result = calculate_wind_loads(self.inp, h=10.0, d=20.0)

    def test_vb_equals_vb0_with_unit_factors(self):
        assert self.result.vb == pytest.approx(25.0)

    def test_cr_is_positive(self):
        assert self.result.cr > 0

    def test_vm_less_than_vb(self):
        """Mean wind should be attenuated by terrain roughness"""
        assert self.result.vm == pytest.approx(self.result.vb * self.result.cr, rel=TOL)

    def test_qp_is_positive(self):
        assert self.result.qp > 0

    def test_windward_positive_leeward_negative(self):
        assert self.result.we_d > 0   # zone D: pressure
        assert self.result.we_e < 0   # zone E: suction

    def test_result_has_correct_terrain_description(self):
        assert "low vegetation" in self.result.terrain_description.lower()

    def test_h_d_ratio_stored(self):
        assert self.result.h_d_ratio_used == pytest.approx(0.5, rel=TOL)


# ---------------------------------------------------------------------------
# Validation tests
# ---------------------------------------------------------------------------

class TestInputValidation:
    def test_invalid_terrain_raises(self):
        inp = WindInput(vb0=25.0, z=10.0, terrain_cat="V")  # invalid
        with pytest.raises(ValueError, match="terrain_cat"):
            calculate_wind_loads(inp, h=10.0, d=10.0)

    def test_negative_height_raises(self):
        inp = WindInput(vb0=25.0, z=10.0, terrain_cat="II")
        with pytest.raises(ValueError, match="positive"):
            calculate_wind_loads(inp, h=-5.0, d=10.0)

    def test_zero_depth_raises(self):
        inp = WindInput(vb0=25.0, z=10.0, terrain_cat="II")
        with pytest.raises(ValueError, match="positive"):
            calculate_wind_loads(inp, h=10.0, d=0.0)

    def test_zero_wind_speed_raises(self):
        inp = WindInput(vb0=0.0, z=10.0, terrain_cat="II")
        with pytest.raises(ValueError, match="positive"):
            calculate_wind_loads(inp, h=10.0, d=10.0)
