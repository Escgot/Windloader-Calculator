"""
Wind Load Calculator API
EN 1991-1-4 — FastAPI application

Run locally:
    uvicorn app.main:app --reload

Interactive docs (Swagger UI):
    http://localhost:8000/docs
"""

from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel, Field, field_validator
from typing import Literal
from app.engine import WindInput, WindResult, calculate_wind_loads, TERRAIN_PARAMS
import sqlite3
import json
import os
import pandas as pd
import io
from fastapi.responses import StreamingResponse

# ---------------------------------------------------------------------------
# Database Setup
# ---------------------------------------------------------------------------

# On Vercel, only /tmp is writable; locally, use project root
DB_PATH = "/tmp/wind_projects.db" if os.environ.get("VERCEL") else "wind_projects.db"

def init_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS projects (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            inputs TEXT NOT NULL,
            results TEXT NOT NULL
        )
    """)
    conn.commit()
    conn.close()

init_db()

# ---------------------------------------------------------------------------
# App
# ---------------------------------------------------------------------------

app = FastAPI(
    title="Wind Load Calculator API",
    description=(
        "Calculates wind actions on buildings per **EN 1991-1-4:2005** (Eurocode 1).\n\n"
        "Provides basic wind velocity, peak velocity pressure, and external "
        "pressure coefficients for vertical walls (zones D and E)."
    ),
    version="1.0.0",
    contact={"name": "Your Name", "url": "https://github.com/yourusername"},
    license_info={"name": "MIT"},
)

# Mount static files only when running locally (Vercel CDN handles them)
if not os.environ.get("VERCEL"):
    app.mount("/static", StaticFiles(directory="public"), name="static")

# ---------------------------------------------------------------------------
# Request / Response schemas
# ---------------------------------------------------------------------------

TerrainCategory = Literal["0", "I", "II", "III", "IV"]

class WindRequest(BaseModel):
    """Input parameters for a wind load calculation."""

    vb0: float = Field(
        ...,
        gt=0,
        le=90,
        description="Fundamental basic wind velocity vb,0 [m/s]. "
                    "Obtained from the national wind map for your country.",
        examples=[25.0],
    )
    z: float = Field(
        ...,
        gt=0,
        le=500,
        description="Reference height z [m] — typically the total building height.",
        examples=[10.0],
    )
    h: float = Field(
        ...,
        gt=0,
        le=500,
        description="Building height h [m].",
        examples=[10.0],
    )
    d: float = Field(
        ...,
        gt=0,
        le=500,
        description="Building depth d [m] in the wind direction.",
        examples=[20.0],
    )
    terrain_cat: TerrainCategory = Field(
        ...,
        description=(
            "Terrain category per Table 4.1:\n"
            "- **0**: Sea / coastal area\n"
            "- **I**: Lakes or flat open area\n"
            "- **II**: Low vegetation, isolated obstacles *(reference)*\n"
            "- **III**: Regular cover — trees, buildings\n"
            "- **IV**: Urban area, 15%+ buildings > 15 m"
        ),
        examples=["II"],
    )
    cdir: float = Field(
        default=1.0,
        ge=0.7,
        le=1.0,
        description="Directional factor cdir [-]. Conservative value = 1.0 (§4.2).",
    )
    cseason: float = Field(
        default=1.0,
        ge=0.5,
        le=1.0,
        description="Season factor cseason [-]. Conservative value = 1.0 (§4.2).",
    )
    rho: float = Field(
        default=1.25,
        ge=1.0,
        le=1.35,
        description="Air density ρ [kg/m³]. Default 1.25 per §4.5(1).",
    )
    co: float = Field(
        default=1.0,
        ge=1.0,
        le=2.5,
        description="Orography factor co [-]. Use 1.0 for flat terrain (§4.3.3).",
    )
    cpi: float = Field(
        default=0.0,
        ge=-1.0,
        le=1.0,
        description="Internal pressure coefficient cpi [-]. Typically between -0.3 and +0.2 (§7.2.9).",
    )
    roof_type: Literal["flat", "monopitch", "duopitch"] = Field(
        default="flat",
        description="Type of roof geometry."
    )
    roof_angle: float = Field(
        default=0.0,
        ge=0,
        le=75,
        description="Roof pitch angle in degrees."
    )

    @field_validator("terrain_cat")
    @classmethod
    def check_terrain(cls, v: str) -> str:
        if v not in TERRAIN_PARAMS:
            raise ValueError(f"terrain_cat must be one of {list(TERRAIN_PARAMS.keys())}")
        return v

    model_config = {
        "json_schema_extra": {
            "example": {
                "vb0": 25.0,
                "z": 10.0,
                "h": 10.0,
                "d": 20.0,
                "terrain_cat": "II",
                "cdir": 1.0,
                "cseason": 1.0,
                "rho": 1.25,
                "co": 1.0,
            }
        }
    }


class WindResponse(BaseModel):
    """Full wind load calculation results."""

    # --- Inputs echoed back ---
    vb0_input: float = Field(description="Input fundamental basic wind speed [m/s]")
    terrain_cat: str = Field(description="Terrain category used")
    terrain_description: str = Field(description="Description of the terrain category")
    h_d_ratio: float = Field(description="h/d ratio used for pressure coefficients")

    # --- Intermediate values ---
    vb: float = Field(description="Basic wind velocity vb [m/s] — Eq. 4.1")
    cr: float = Field(description="Terrain roughness factor cr(z) [-] — Eq. 4.4")
    vm: float = Field(description="Mean wind velocity vm(z) [m/s] — Eq. 4.3")
    iv: float = Field(description="Turbulence intensity Iv(z) [-] — Eq. 4.7")
    qp: float = Field(description="Peak velocity pressure qp(z) [Pa] — Eq. 4.8")

    # --- Pressure coefficients ---
    cpe_d: float = Field(description="External pressure coefficient zone D (windward) — Table 7.1")
    cpe_e: float = Field(description="External pressure coefficient zone E (leeward) — Table 7.1")

    # --- Final pressures ---
    we_d: float = Field(description="Wind pressure on windward wall we,D [Pa] — Eq. 5.1")
    we_e: float = Field(description="Wind pressure on leeward wall we,E [Pa] — Eq. 5.1")

    # --- Roof pressures ---
    cpe_f: float = Field(description="External pressure coefficient zone F (roof)")
    cpe_g: float = Field(description="External pressure coefficient zone G (roof)")
    cpe_h: float = Field(description="External pressure coefficient zone H (roof)")
    cpe_i: float = Field(description="External pressure coefficient zone I (roof)")
    we_f: float = Field(description="Roof pressure zone F [Pa]")
    we_g: float = Field(description="Roof pressure zone G [Pa]")
    we_h: float = Field(description="Roof pressure zone H [Pa]")
    we_i: float = Field(description="Roof pressure zone I [Pa]")

    # --- Convenience ---
    qp_kpa: float = Field(description="Peak velocity pressure [kPa]")
    we_d_kpa: float = Field(description="Windward wall pressure [kPa]")
    we_e_kpa: float = Field(description="Leeward wall pressure [kPa]")
    cpi: float = Field(description="Internal pressure coefficient used")
    wi_kpa: float = Field(description="Internal pressure [kPa]")
    wnet_d_kpa: float = Field(description="Net pressure zone D (we,D - wi) [kPa]")
    wnet_e_kpa: float = Field(description="Net pressure zone E (we,E - wi) [kPa]")
    total_net_kpa: float = Field(description="Net total horizontal wind pressure (wnet,D - wnet,E) [kPa]")


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

@app.get("/", tags=["Frontend"])
def root():
    """Serve the demo frontend."""
    return FileResponse(
        "public/index.html",
        headers={"Cache-Control": "no-cache, no-store, must-revalidate"}
    )


@app.post(
    "/calculate",
    response_model=WindResponse,
    summary="Calculate wind loads",
    tags=["Wind Loads"],
)
def calculate(req: WindRequest) -> WindResponse:
    """
    Calculate wind actions on a rectangular building per EN 1991-1-4.

    Returns all intermediate values (vb, cr, vm, Iv, qp) plus external
    pressure coefficients and final wall pressures for zones D (windward)
    and E (leeward).
    """
    try:
        inp = WindInput(
            vb0=req.vb0,
            z=req.z,
            terrain_cat=req.terrain_cat,
            cdir=req.cdir,
            cseason=req.cseason,
            rho=req.rho,
            co=req.co,
            cpi=req.cpi,
            roof_type=req.roof_type,
            roof_angle=req.roof_angle,
        )
        result: WindResult = calculate_wind_loads(inp, h=req.h, d=req.d)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc))

    return WindResponse(
        vb0_input=req.vb0,
        terrain_cat=req.terrain_cat,
        terrain_description=result.terrain_description,
        h_d_ratio=result.h_d_ratio_used,
        vb=result.vb,
        cr=result.cr,
        vm=result.vm,
        iv=result.iv,
        qp=result.qp,
        cpe_d=result.cpe_d,
        cpe_e=result.cpe_e,
        we_d=result.we_d,
        we_e=result.we_e,
        cpe_f=result.cpe_f,
        cpe_g=result.cpe_g,
        cpe_h=result.cpe_h,
        cpe_i=result.cpe_i,
        we_f=result.we_f,
        we_g=result.we_g,
        we_h=result.we_h,
        we_i=result.we_i,
        qp_kpa=round(result.qp / 1000, 4),
        we_d_kpa=round(result.we_d / 1000, 4),
        we_e_kpa=round(result.we_e / 1000, 4),
        cpi=result.cpi,
        wi_kpa=round(result.wi / 1000, 4),
        wnet_d_kpa=round(result.wnet_d / 1000, 4),
        wnet_e_kpa=round(result.wnet_e / 1000, 4),
        total_net_kpa=round((result.wnet_d - result.wnet_e) / 1000, 4),
    )


@app.post(
    "/report",
    response_class=FileResponse,
    summary="Generate PDF calculation report",
    tags=["Wind Loads"],
)
def generate_report(req: WindRequest, background_tasks: BackgroundTasks):
    """
    Calculate wind actions and return a formatted PDF report.
    """
    try:
        inp = WindInput(
            vb0=req.vb0,
            z=req.z,
            terrain_cat=req.terrain_cat,
            cdir=req.cdir,
            cseason=req.cseason,
            rho=req.rho,
            co=req.co,
            cpi=req.cpi,
            roof_type=req.roof_type,
            roof_angle=req.roof_angle,
        )
        result: WindResult = calculate_wind_loads(inp, h=req.h, d=req.d)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc))

    from app.pdf_generator import generate_calculation_report
    filepath = generate_calculation_report(inp, req.h, req.d, result)
    
    # Clean up the file after sending
    import os
    background_tasks.add_task(os.remove, filepath)

    return FileResponse(filepath, media_type="application/pdf", filename="wind_report.pdf")


@app.post(
    "/export-excel",
    summary="Export results to Excel",
    tags=["Wind Loads"],
)
def export_excel(req: WindRequest):
    """
    Calculate wind loads and return a formatted .xlsx file.
    """
    try:
        inp = WindInput(
            vb0=req.vb0, z=req.z, terrain_cat=req.terrain_cat,
            cdir=req.cdir, cseason=req.cseason, rho=req.rho,
            co=req.co, cpi=req.cpi, roof_type=req.roof_type,
            roof_angle=req.roof_angle
        )
        result = calculate_wind_loads(inp, h=req.h, d=req.d)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc))

    # Create a DataFrame for export
    data = {
        "Parameter": ["vb,0", "Terrain", "Building Height (h)", "Building Depth (d)", "Basic Velocity (vb)", "Peak Pressure (qp)", "cpe,D", "cpe,E", "we,D", "we,E"],
        "Value": [req.vb0, req.terrain_cat, req.h, req.d, result.vb, result.qp, result.cpe_d, result.cpe_e, result.we_d, result.we_e],
        "Unit": ["m/s", "-", "m", "m", "m/s", "Pa", "-", "-", "Pa", "Pa"]
    }
    df = pd.DataFrame(data)

    output = io.BytesIO()
    with pd.ExcelWriter(output, engine='openpyxl') as writer:
        df.to_excel(writer, index=False, sheet_name='Wind Calculation')
        # Add a summary sheet with all result data
        all_results_df = pd.DataFrame([result.__dict__])
        all_results_df.to_excel(writer, index=False, sheet_name='Detailed Results')

    output.seek(0)
    
    return StreamingResponse(
        output,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": "attachment; filename=wind_loads.xlsx"}
    )


def terrain_categories():
    """Return all valid terrain categories with their descriptions and parameters."""
    return {
        cat: {
            "description": params["description"],
            "roughness_length_z0_m": params["z0"],
            "minimum_height_zmin_m": params["z_min"],
        }
        for cat, params in TERRAIN_PARAMS.items()
    }

@app.post("/projects", tags=["Database"])
def save_project(name: str, req: WindRequest):
    """Save a calculation result to the database."""
    try:
        inp = WindInput(
            vb0=req.vb0, z=req.z, terrain_cat=req.terrain_cat,
            cdir=req.cdir, cseason=req.cseason, rho=req.rho,
            co=req.co, cpi=req.cpi, roof_type=req.roof_type,
            roof_angle=req.roof_angle
        )
        result = calculate_wind_loads(inp, h=req.h, d=req.d)
        
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO projects (name, inputs, results) VALUES (?, ?, ?)",
            (name, req.model_dump_json(), json.dumps(result.__dict__))
        )
        conn.commit()
        conn.close()
        return {"status": "success", "message": f"Project '{name}' saved."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/projects", tags=["Database"])
def list_projects():
    """List all saved projects."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute("SELECT id, name, timestamp FROM projects ORDER BY timestamp DESC")
    projects = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return projects

@app.get("/projects/{project_id}", tags=["Database"])
def get_project(project_id: int):
    """Retrieve a specific project."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM projects WHERE id = ?", (project_id,))
    row = cursor.fetchone()
    conn.close()
    if not row:
        raise HTTPException(status_code=404, detail="Project not found")
    
    project = dict(row)
    project["inputs"] = json.loads(project["inputs"])
    project["results"] = json.loads(project["results"])
    return project

@app.delete("/projects/{project_id}", tags=["Database"])
def delete_project(project_id: int):
    """Delete a project."""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("DELETE FROM projects WHERE id = ?", (project_id,))
    conn.commit()
    conn.close()
    return {"status": "deleted"}
