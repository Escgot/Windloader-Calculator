from fpdf import FPDF
import datetime
from app.engine import WindInput, WindResult

def generate_calculation_report(inp: WindInput, h: float, d: float, result: WindResult) -> str:
    """
    Generates a PDF calculation report and returns the filepath.
    """
    pdf = FPDF()
    pdf.add_page()
    
    # Title
    pdf.set_font("helvetica", "B", 16)
    pdf.cell(0, 10, "Wind Load Calculation Report (EN 1991-1-4)", new_x="LMARGIN", new_y="NEXT", align="C")
    pdf.ln(10)
    
    # Metadata
    pdf.set_font("helvetica", "", 10)
    pdf.cell(0, 6, f"Date: {datetime.datetime.now().strftime('%Y-%m-%d %H:%M')}", new_x="LMARGIN", new_y="NEXT")
    pdf.ln(5)
    
    # Inputs
    pdf.set_font("helvetica", "B", 12)
    pdf.cell(0, 8, "1. Building & Site Parameters", new_x="LMARGIN", new_y="NEXT")
    pdf.set_font("helvetica", "", 10)
    pdf.cell(50, 6, "Basic Wind Speed (vb0):")
    pdf.cell(0, 6, f"{inp.vb0} m/s", new_x="LMARGIN", new_y="NEXT")
    
    pdf.cell(50, 6, "Terrain Category:")
    pdf.cell(0, 6, f"{inp.terrain_cat} - {result.terrain_description}", new_x="LMARGIN", new_y="NEXT")
    
    pdf.cell(50, 6, "Building Dimensions:")
    pdf.cell(0, 6, f"h = {h} m, d = {d} m (Ratio h/d: {result.h_d_ratio_used})", new_x="LMARGIN", new_y="NEXT")
    
    pdf.cell(50, 6, "Reference Height (z):")
    pdf.cell(0, 6, f"{inp.z} m", new_x="LMARGIN", new_y="NEXT")
    pdf.ln(5)
    
    # Intermediate Values
    pdf.set_font("helvetica", "B", 12)
    pdf.cell(0, 8, "2. Intermediate Calculations", new_x="LMARGIN", new_y="NEXT")
    pdf.set_font("helvetica", "", 10)
    pdf.cell(50, 6, "Basic Wind Vel. (vb):")
    pdf.cell(0, 6, f"{result.vb} m/s", new_x="LMARGIN", new_y="NEXT")
    
    pdf.cell(50, 6, "Roughness Factor (cr):")
    pdf.cell(0, 6, f"{result.cr}", new_x="LMARGIN", new_y="NEXT")
    
    pdf.cell(50, 6, "Mean Wind Vel. (vm):")
    pdf.cell(0, 6, f"{result.vm} m/s", new_x="LMARGIN", new_y="NEXT")
    
    pdf.cell(50, 6, "Turbulence Intensity (Iv):")
    pdf.cell(0, 6, f"{result.iv}", new_x="LMARGIN", new_y="NEXT")
    
    pdf.cell(50, 6, "Peak Velocity Press. (qp):")
    pdf.cell(0, 6, f"{result.qp} Pa", new_x="LMARGIN", new_y="NEXT")
    pdf.ln(5)
    
    # Final Pressures
    pdf.set_font("helvetica", "B", 12)
    pdf.cell(0, 8, "3. Final External Pressures (Vertical Walls)", new_x="LMARGIN", new_y="NEXT")
    pdf.set_font("helvetica", "", 10)
    
    pdf.cell(80, 6, "Zone D (Windward) Coefficient (cpe,D):")
    pdf.cell(0, 6, f"{result.cpe_d}", new_x="LMARGIN", new_y="NEXT")
    pdf.cell(80, 6, "Zone E (Leeward) Coefficient (cpe,E):")
    pdf.cell(0, 6, f"{result.cpe_e}", new_x="LMARGIN", new_y="NEXT")
    pdf.ln(2)
    
    pdf.set_font("helvetica", "B", 10)
    pdf.cell(80, 6, "Windward Pressure (we,D):")
    pdf.cell(0, 6, f"{result.we_d} Pa ({round(result.we_d/1000, 2)} kPa)", new_x="LMARGIN", new_y="NEXT")
    pdf.cell(80, 6, "Leeward Pressure (we,E):")
    pdf.cell(0, 6, f"{result.we_e} Pa ({round(result.we_e/1000, 2)} kPa)", new_x="LMARGIN", new_y="NEXT")
    
    pdf.cell(80, 6, "Net Total Pressure:")
    pdf.cell(0, 6, f"{round(result.we_d - result.we_e, 2)} Pa ({round((result.we_d - result.we_e)/1000, 2)} kPa)", new_x="LMARGIN", new_y="NEXT")
    pdf.ln(5)

    # Roof Pressures
    pdf.set_font("helvetica", "B", 12)
    pdf.cell(0, 8, "4. External Pressures (Flat Roof)", new_x="LMARGIN", new_y="NEXT")
    pdf.set_font("helvetica", "", 10)
    
    pdf.cell(80, 6, "Zone F (Corner) Pressure:")
    pdf.cell(0, 6, f"{result.we_f} Pa ({round(result.we_f/1000, 2)} kPa)", new_x="LMARGIN", new_y="NEXT")
    pdf.cell(80, 6, "Zone G (Edge) Pressure:")
    pdf.cell(0, 6, f"{result.we_g} Pa ({round(result.we_g/1000, 2)} kPa)", new_x="LMARGIN", new_y="NEXT")
    pdf.cell(80, 6, "Zone H (Interior) Pressure:")
    pdf.cell(0, 6, f"{result.we_h} Pa ({round(result.we_h/1000, 2)} kPa)", new_x="LMARGIN", new_y="NEXT")
    pdf.cell(80, 6, "Zone I (Interior) Pressure:")
    pdf.cell(0, 6, f"{result.we_i} Pa ({round(result.we_i/1000, 2)} kPa)", new_x="LMARGIN", new_y="NEXT")
    
    filepath = "/tmp/wind_report.pdf"
    import os
    if os.name == 'nt':
        filepath = "wind_report.pdf"
    
    pdf.output(filepath)
    return filepath
