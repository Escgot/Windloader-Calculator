# Wind Load Calculator API

A REST API implementing the **EN 1991-1-4:2005** (Eurocode 1) wind action procedure for rectangular buildings.

Built with Python + FastAPI. Deployed via Docker.

---

## Features

- Full EN 1991-1-4 calculation chain: vb → cr → vm → Iv → qp → we
- External pressure coefficients for vertical walls (zones D and E, Table 7.1)
- All 5 terrain categories (0, I, II, III, IV)
- Pydantic schema validation with engineering-meaningful error messages
- Auto-generated Swagger UI documentation at `/docs`
- Validated test suite (pytest) against standard worked examples

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/` | HTML Demo Dashboard |
| POST | `/calculate` | Full wind load calculation |
| GET | `/terrain-categories` | Reference data for terrain categories |

## Quick Start

### Local (Python)
```bash
pip install -r requirements.txt
uvicorn app.main:app --reload
```
- **Demo Dashboard**: [http://localhost:8000/](http://localhost:8000/)
- **Swagger UI**: [http://localhost:8000/docs](http://localhost:8000/docs)

### Docker
```bash
docker build -t wind-load-api .
docker run -p 8000:8000 wind-load-api
```

## Example Request

```bash
curl -X POST http://localhost:8000/calculate \
  -H "Content-Type: application/json" \
  -d '{
    "vb0": 25.0,
    "z": 10.0,
    "h": 10.0,
    "d": 20.0,
    "terrain_cat": "II"
  }'
```

## Example Response

```json
{
  "vb0_input": 25.0,
  "terrain_cat": "II",
  "terrain_description": "Area with low vegetation and isolated obstacles",
  "h_d_ratio": 0.5,
  "vb": 25.0,
  "cr": 1.0,
  "vm": 25.0,
  "iv": 0.184,
  "qp": 607.5,
  "cpe_d": 0.767,
  "cpe_e": -0.4,
  "we_d": 466.0,
  "we_e": -243.0,
  "qp_kpa": 0.608,
  "we_d_kpa": 0.466,
  "we_e_kpa": -0.243,
  "total_net_kpa": 0.709
}
```

## Calculation Reference

| Symbol | Description | Standard ref |
|--------|-------------|-------------|
| vb | Basic wind velocity | §4.2, Eq. 4.1 |
| cr(z) | Terrain roughness factor | §4.3.2, Eq. 4.4 |
| vm(z) | Mean wind velocity | §4.3.1, Eq. 4.3 |
| Iv(z) | Turbulence intensity | §4.4, Eq. 4.7 |
| qp(z) | Peak velocity pressure | §4.5, Eq. 4.8 |
| cpe | External pressure coefficient | Table 7.1 |
| we | External wind pressure | §5.2, Eq. 5.1 |

## Assumptions and Limitations

- Applies to rectangular buildings only
- External pressure coefficients for vertical walls (zones D and E) only — does not yet cover roof zones, friction forces, or internal pressure coefficients
- Orography factor co = 1.0 by default (flat terrain); orographic amplification not computed automatically
- Structural factor cscd = 1.0 (assumed); dynamic analysis not included

## Running Tests

```bash
pytest tests/ -v --cov=app
```

## License

MIT
