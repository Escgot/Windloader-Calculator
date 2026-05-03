<div align="center">
  <img src="https://img.shields.io/badge/Wind%20Load%20Calculator-Pro%20Max-000000?style=for-the-badge&logo=fastapi&logoColor=00E5FF" alt="Logo">
  <h1>💨 Eurocode 1 (EN 1991-1-4) Wind Load API</h1>
  <p><em>A professional-grade engineering engine designed to translate complex structural codes into clean, robust software.</em></p>

  [![Python](https://img.shields.io/badge/Python-3.11+-blue.svg?style=flat-square&logo=python&logoColor=white)](https://www.python.org)
  [![FastAPI](https://img.shields.io/badge/FastAPI-0.115.0-009688.svg?style=flat-square&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
  [![Test Coverage](https://img.shields.io/badge/Coverage-100%25-brightgreen.svg?style=flat-square&logo=pytest)](tests/)
  [![License](https://img.shields.io/badge/License-MIT-gray.svg?style=flat-square)](LICENSE)
</div>

<br />

## 🌟 Executive Summary

This project translates domain-specific structural engineering knowledge into clean, usable software. It handles the complex, iterative calculations required by **EN 1991-1-4:2005 (Eurocode 1, Wind Actions)**. 

What used to take structural engineers ~2 hours of manual spreadsheet manipulation is now fully automated and validated in under **50 milliseconds**.

### 🚀 Key Engineering Implementations
- **Strict Adherence to Standards**: Implemented EN 1991-1-4 wind action calculations in pure Python.
- **Test-Driven Development**: Validated against 6 standard worked examples with **100% test coverage**.
- **RESTful Architecture**: Built a FastAPI REST service with rigid Pydantic schema validation, rejecting physically impossible inputs before they hit the calculation engine.
- **Advanced Geometry Support**: Computes dynamic pressure zones for flat, monopitch, and duopitch roofs (Zones F, G, H, I), including internal pressures ($c_{pi}$) and structural factors ($c_s c_d$).
- **Professional Exports**: Generate high-quality Excel (`.xlsx`) and PDF calculation reports instantly.

---

## 💻 The Premium Interface

The backend is complemented by a "Dark Glass" inspired UI dashboard that provides immediate visual feedback.

- **Dynamic 3D Visualizer**: Real-time `Three.js` integration visually represents the building geometry and roof pitch.
- **Metric / Imperial Bridge**: Real-time unit conversions allowing US and European engineers to collaborate seamlessly.
- **Persistent Workspaces**: SQLite database integration to save, load, and manage complex projects across sessions.
- **Interactive Wind Map**: Integrated Leaflet map to fetch regional basic wind speeds ($v_{b,0}$).

<br />

## ⚡ Quick Start

### Local Development

1. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```
2. **Start the ASGI server**
   ```bash
   uvicorn app.main:app --reload
   ```
3. **Access the application**
   - 🌐 **Dashboard**: [http://localhost:8000/](http://localhost:8000/)
   - 📖 **Interactive API Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)

### Docker Deployment
```bash
docker build -t wind-load-api .
docker run -p 8000:8000 wind-load-api
```

<br />

## 🧪 Validation & Testing

Engineering software must be mathematically perfect. Testing is the core of this project. The test suite validates every individual formula directly against the EN 1991-1-4 standard's worked examples.

```bash
pytest tests/ -v --cov=app
```

<br />

## 📐 API Reference (Calculation Endpoint)

Send a calculation request to the core engine:

```bash
curl -X POST http://localhost:8000/calculate \
  -H "Content-Type: application/json" \
  -d '{
    "vb0": 25.0,
    "z": 10.0,
    "h": 10.0,
    "d": 20.0,
    "terrain_cat": "II",
    "rho": 1.25,
    "cpi": 0.0,
    "roof_type": "flat",
    "roof_angle": 0
  }'
```

<br />

## 📖 Calculation Pipeline

| Symbol | Description | Standard Reference |
|:------:|:------------|:-------------------|
| **$v_b$** | Basic wind velocity | §4.2, Eq. 4.1 |
| **$c_r(z)$** | Terrain roughness factor | §4.3.2, Eq. 4.4 |
| **$v_m(z)$** | Mean wind velocity | §4.3.1, Eq. 4.3 |
| **$I_v(z)$** | Turbulence intensity | §4.4, Eq. 4.7 |
| **$q_p(z)$** | Peak velocity pressure | §4.5, Eq. 4.8 |
| **$c_{pe}$** | External pressure coefficient | Table 7.1 & 7.2 |
| **$w_e$** | External wind pressure | §5.2, Eq. 5.1 |
| **$c_s c_d$** | Structural factor | Section 6 |

<br />

<div align="center">
  <p>Built for Civil Engineers and Software Architects.</p>
</div>
