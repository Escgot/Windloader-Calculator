# Wind Load Calculator API — EN 1991-1-4

"REST API implementing the Eurocode wind loading procedure; deployed on Docker with auto-generated OpenAPI documentation and a validated test suite."

This project translates domain-specific structural engineering knowledge into clean, usable software. It is a professional-grade engineering tool designed to handle the complex, iterative calculations required by **EN 1991-1-4:2005 (Eurocode 1, Wind Actions)**. 

### 🌟 Key Highlights

- **Implemented EN 1991-1-4 wind action calculations in pure Python**, validated against 6 standard worked examples with 100% test coverage (TDD approach).
- **Built a FastAPI REST service** with Pydantic schema validation, handling edge cases and invalid engineering inputs gracefully.
- **Containerized with Docker** and prepared for deployment to public endpoints; fully documented via an auto-generated Swagger UI.
- **Reduced manual wind loading calculation time** from ~2 hours to under 5 seconds.
- **Advanced Engineering Support**: Includes structural factors ($c_s c_d$), internal pressures ($c_{pi}$), and advanced roof geometry coefficients for flat, monopitch, and duopitch shapes.

**Tech Stack**: Python · FastAPI · Pydantic · Docker · SQLite · Eurocode · REST API · pytest · React/Vanilla JS Frontend

---

## 🛠 Features

- **Full EN 1991-1-4 calculation chain**: vb → cr → vm → Iv → qp → we
- **Dynamic Pressure Zones**: Calculates exact wind pressure coefficients for vertical walls (Zones D, E) and complex roof geometries (Zones F, G, H, I).
- **Global Usability**: Built-in, real-time Metric (SI) to US Imperial unit conversion.
- **Project Persistence**: Includes a SQLite backend for saving and loading complex calculation states.
- **Professional Exports**: Generate high-quality Excel (`.xlsx`) and PDF calculation reports directly from the API.
- **Premium Frontend Dashboard**: A glassmorphism-inspired UI featuring an interactive 3D Three.js visualizer and a regional wind-speed Leaflet map.

## 🚀 Quick Start

### Local Development
```bash
# Install dependencies
pip install -r requirements.txt

# Start the server
uvicorn app.main:app --reload
```
- **Demo Dashboard**: [http://localhost:8000/](http://localhost:8000/)
- **Swagger UI**: [http://localhost:8000/docs](http://localhost:8000/docs)

### Docker Deployment
```bash
docker build -t wind-load-api .
docker run -p 8000:8000 wind-load-api
```

## 🧪 Testing and Validation

Testing is the heart of this project. It proves the calculations are correct, not just that the code runs.

```bash
# Run the test suite with coverage
pytest tests/ -v --cov=app
```

The test suite validates every formula against the standard's own worked examples, guaranteeing engineering accuracy before any API endpoint processes a request.

## 📐 Example Request (Calculation Endpoint)

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

## 📖 Calculation Reference

| Symbol | Description | Standard ref |
|--------|-------------|-------------|
| vb | Basic wind velocity | §4.2, Eq. 4.1 |
| cr(z) | Terrain roughness factor | §4.3.2, Eq. 4.4 |
| vm(z) | Mean wind velocity | §4.3.1, Eq. 4.3 |
| Iv(z) | Turbulence intensity | §4.4, Eq. 4.7 |
| qp(z) | Peak velocity pressure | §4.5, Eq. 4.8 |
| cpe | External pressure coefficient | Table 7.1 & 7.2 |
| we | External wind pressure | §5.2, Eq. 5.1 |
| cs cd | Structural factor | Section 6 |

## ⚠️ Assumptions and Limitations

- Orography factor $c_0 = 1.0$ by default (assumes flat terrain); orographic amplification is not computed automatically.
- Friction forces on extremely long buildings (Section 5.3) are currently outside the scope of the main engine.

## License
MIT
