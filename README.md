<div align="center">
  <img src="https://img.shields.io/badge/Wind%20Load%20Engine-Pro%20SaaS-0f172a?style=for-the-badge&logo=react&logoColor=61DAFB" alt="Logo">
  <h1>💨 Wind Load Engine | Eurocode 1 Calculator</h1>
  <p><em>A premium structural engineering suite translating complex codes into high-performance, visually stunning software.</em></p>

  [![React](https://img.shields.io/badge/Frontend-React%2018-blue.svg?style=flat-square&logo=react&logoColor=white)](https://react.dev)
  [![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind%20CSS-38B2AC.svg?style=flat-square&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
  [![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688.svg?style=flat-square&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
  [![Framer Motion](https://img.shields.io/badge/Animations-Framer%20Motion-FF0055.svg?style=flat-square&logo=framer&logoColor=white)](https://framer.com/motion)
  [![License](https://img.shields.io/badge/License-MIT-gray.svg?style=flat-square)](LICENSE)
</div>

<br />

## 🌟 Overview

**Wind Load Engine** is a professional-grade SaaS platform designed for structural engineers. It automates the complex, iterative calculation procedures required by **EN 1991-1-4:2005 (Eurocode 1, Wind Actions)**, transforming hours of manual work into milliseconds of precise, validated results.

### 🚀 Key Engineering Implementations
- **Strict Adherence to Standards**: Full implementation of EN 1991-1-4:2005 including pressure coefficients, zones, and structural factors ($c_s c_d$).
- **Instant Computation**: Get peak velocity pressures ($q_p$), suction zones, and resultant forces in under **50ms**.
- **Professional Reporting**: Generate high-quality Excel (`.xlsx`) and PDF calculation reports instantly.
- **Validated Results**: Engine verified against industry-standard worked examples with 100% test coverage.

---

## 🎨 Premium UI/UX Experience

The platform features a modern, high-end SaaS landing page and a "Dark Glass" inspired dashboard designed for maximum productivity.

- **Glassmorphic Design**: Clean, semi-transparent interfaces with subtle blur effects and deep navy themes.
- **Dynamic Animations**: Staggered entrance effects and floating process indicators powered by **Framer Motion**.
- **Container Scroll Showcase**: An interactive app preview that reveals the dashboard as you scroll.
- **Responsive Architecture**: Fully optimized for Desktop, Tablet, and Mobile workflows.

---

## 🏗️ Project Structure

The repository is organized into three main modules:

| Module | Technology | Description |
|:-------|:-----------|:------------|
| **Landing Page** | React, TS, Shadcn, Framer Motion | High-conversion entry point with premium animations. |
| **Calculation App** | HTML5, Vanilla JS, Three.js | The core interactive dashboard with 3D building visualization. |
| **API Backend** | Python, FastAPI, Pydantic | Validated REST service for Eurocode 1 math logic. |

---

## 🔗 Live Application

The platform is deployed and fully functional on Vercel:
**[https://windload-calculator.vercel.app/](https://windload-calculator.vercel.app/)**

---

## ⚡ Quick Start

### Local Development

1. **Install Python Backend Dependencies**
   ```bash
   pip install -r requirements.txt
   ```

2. **Run the API & Main App**
   ```bash
   uvicorn app.main:app --reload
   ```

3. **Develop the Landing Page**
   ```bash
   cd "landing page"
   npm install
   npm run dev
   ```

### Docker Deployment
```bash
docker build -t wind-load-engine .
docker run -p 8000:8000 wind-load-engine
```

---

## 🧪 Validation & Testing

Engineering integrity is our core value. The test suite validates every formula directly against EN 1991-1-4 standards.

```bash
pytest tests/ -v --cov=api
```

---

## 📐 API Pipeline (EN 1991-1-4)

| Symbol | Description | Standard Reference |
|:------:|:------------|:-------------------|
| **$v_m(z)$** | Mean wind velocity | §4.3.1, Eq. 4.3 |
| **$q_p(z)$** | Peak velocity pressure | §4.5, Eq. 4.8 |
| **$c_{pe}$** | External pressure coefficient | Tables 7.1 - 7.5 |
| **$w_e$** | External wind pressure | §5.2, Eq. 5.1 |
| **$c_s c_d$** | Structural factor | Section 6 |

<br />

<div align="center">
  <p>Built for Structural Engineers and Software Architects.</p>
  <p><i>Engineered for precision. Designed for speed.</i></p>
</div>
