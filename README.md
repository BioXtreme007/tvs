# TVS Credit — Smart Lending Decision Hub

> TVS Credit E.P.I.C 8 · Problem Statement (c) · Multimodal Agri-Credit Underwriting Platform  
> Live Demo: https://tvs-credit-nu.vercel.app

---

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Directory Layout](#directory-layout)
- [Backend](#backend)
  - [Authentication](#authentication)
  - [Underwriting Pipeline](#underwriting-pipeline)
  - [Krishi Saathi Assistant](#krishi-saathi-assistant)
  - [Early Warning System](#early-warning-system)
  - [Portfolio Analytics](#portfolio-analytics)
- [Frontend](#frontend)
  - [Landing Page](#landing-page)
  - [Underwriting Cockpit](#underwriting-cockpit)
  - [Krishi Saathi UI](#krishi-saathi-ui)
- [API Reference](#api-reference)
- [Configuration](#configuration)
- [Installation](#installation)
- [Running](#running)
- [Testing](#testing)
- [Deployment](#deployment)
- [Environment Variables](#environment-variables)
- [Known Limitations](#known-limitations)

---

## Overview

TVS Credit Smart Lending Decision Hub is an enterprise-grade agricultural credit underwriting platform for rural India. It processes multi-source signals — satellite imagery, climate telemetry, ISRO land records, and bureau credit history — through a deliberating multi-agent AI layer to produce autonomous loan decisions in under 3 minutes.

**Key capabilities:**

| Capability | Technology |
|---|---|
| Satellite land assessment | Sentinel-2 10m NDVI, BSI, NDWI |
| Cloud-gap inpainting | CloudGap-CG ST-DIP U-Net (Kharif season) |
| Cadastral fraud detection | Uber H3 Res-11 + Shapely 2.0 STRtree |
| LULC validation | ISRO Bhuvan API |
| Credit scoring | LightGBM multimodal scorecard (300–900) |
| Repayment scheduling | Seasonally-aligned harvest EMIs |
| Voice AI | Whisper STT + Gemini 3.8 Flash vernacular RAG |
| Multi-agent deliberation | 6-subagent dual-track orchestrator |

---

## Architecture

```
                ┌─────────────────────────────────────┐
                │         React + TypeScript SPA        │
                │   (Vite · Tailwind · Framer Motion)   │
                └──────────────┬──────────────────────┘
                               │ REST /api/v1/*
                ┌──────────────▼──────────────────────┐
                │          FastAPI (Uvicorn)            │
                │    Sessions · CORS · Telemetry HDs    │
                └──┬────────┬────────┬────────┬────────┘
                   │        │        │        │
           ┌───────▼─┐  ┌───▼───┐  ┌▼──────┐ ┌▼──────────┐
           │ Auth &  │  │Under- │  │ Port- │ │  Krishi   │
           │Sessions │  │writing│  │ folio │ │  Saathi   │
           │(Argon2) │  │Engine │  │ &EWS  │ │  (RAG)    │
           └─────────┘  └───┬───┘  └───────┘ └───────────┘
                            │
              ┌─────────────▼───────────────┐
              │     6-Subagent Orchestrator   │
              │  Validation · RAG · Explain  │
              │  Escalation · Guardrail · Audit│
              └─────────────────────────────┘
                            │
        ┌───────────────────┼──────────────────────┐
        │                   │                      │
  ┌─────▼──────┐  ┌─────────▼──────┐  ┌───────────▼──────┐
  │ Satellite  │  │ Fraud / LULC   │  │  Credit Model    │
  │ + CloudGap │  │ Bhuvan + H3    │  │  LightGBM + SHAP │
  └────────────┘  └────────────────┘  └──────────────────┘
                            │
                   ┌────────▼───────┐
                   │  SQLite (WAL)  │
                   │  users·apps·   │
                   │  ews_alerts    │
                   └────────────────┘
```

---

## Directory Layout

```
tvs-smart-lending-hub/
│
├── README.md                       # This file
├── TECHNICAL_DOCUMENTATION.md      # Mathematical formulas, academic citations
├── DEMO_GUIDE.md                   # Step-by-step demo walkthrough
├── BACKEND_UPGRADE_GEMINI.md       # Backend hardening specification
│
├── run_demo.py                     # Entry point: starts FastAPI + serves web/
├── test_hub.py                     # End-to-end regression suite
├── config.py                       # Runtime configuration loader
├── requirements.txt                # Python dependencies
├── vercel.json                     # Vercel deployment config (frontend)
│
├── tvs_lending/                    # Core Python package
│   ├── api/
│   │   ├── app.py                  # FastAPI app, middleware, route mounts
│   │   └── schemas.py              # Pydantic v2 request/response schemas
│   ├── core/
│   │   ├── satellite.py            # Sentinel-2 spectral index engine
│   │   ├── cloudgap.py             # ST-DIP monsoon cloud-gap inpainting
│   │   ├── soil_engine.py          # SOC regressor + Land Productivity Collateral
│   │   └── climate_engine.py       # 40-yr NASA POWER + Open-Meteo forecasts
│   ├── fraud/
│   │   ├── bhuvan_verifier.py      # ISRO LULC validation (non-agri flagging)
│   │   ├── deduplication.py        # H3 Res-11 + Shapely STRtree dedup
│   │   └── phenology_check.py      # NDVI temporal curve consistency check
│   ├── models/
│   │   ├── credit_scorecard.py     # Multimodal 300–900 agri-credit scorecard
│   │   ├── default_model.py        # LightGBM PD model with P10/P50/P90 bands
│   │   └── xai_explainer.py        # SHAP TreeExplainer attributions
│   ├── recommender/
│   │   ├── product_matcher.py      # TVS product selector (tractor/2W/equipment)
│   │   ├── harvest_emi.py          # Seasonally-aligned repayment scheduler
│   │   └── dynamic_ltv.py          # Risk-adjusted LTV + interest rate tiers
│   ├── ews/
│   │   ├── watcher.py              # Real-time NDVI drop + weather shock watcher
│   │   ├── risk_transitions.py     # RBI SMA-0/1/2 + NPA lifecycle manager
│   │   └── recovery_dossier.py     # Field collection + restructuring dossier generator
│   ├── assistant/
│   │   ├── krishi_saathi.py        # Grounded RAG assistant engine
│   │   ├── voice_engine.py         # Whisper STT + TTS pipeline
│   │   └── vernacular_prompts.py   # Prompt templates (EN/HI/CHH/TA/TE/MR/KN/BN)
│   ├── agents/
│   │   ├── subagents.py            # 6 specialized deliberation subagents
│   │   └── orchestrator.py         # Dual-track fast + deep orchestrator
│   ├── adapters/                   # External API adapters (Bhuvan, Open-Meteo, NASA)
│   └── db/
│       └── database.py             # SQLite WAL + Argon2id session store
│
├── frontend/                       # React + TypeScript application
│   ├── src/
│   │   ├── WebsiteApp.tsx          # Landing page + section routing
│   │   ├── WorkspaceApp.tsx        # Underwriting cockpit workspace
│   │   ├── components/             # UI components (Navbar, SignInPage, Assistant, etc.)
│   │   ├── registry/magicui/       # Magic UI components (BorderBeam, OrbitingCircles, Text3DFlip)
│   │   ├── lib/                    # Utilities (cn, api client)
│   │   ├── index.css               # Global styles + design tokens
│   │   └── workspace.css           # Cockpit workspace styles
│   ├── public/                     # Static assets (farmers_login.jpg, saathi-icon.png)
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── package.json
│
├── web/                            # Static fallback HTML + built dist/
│   ├── index.html                  # Landing page static entry
│   ├── signin.html                 # Sign-in static entry
│   └── dist/                       # Vite production build output
│
├── data/
│   └── knowledge_base/
│       └── tvs_credit_policy.json  # Loan terms, crop calendars, Mandi MSP schedules
│
└── tests/                          # Pytest institutional test suites
    ├── test_auth_p0.py             # P0: Auth, sessions, route guards (14 tests)
    ├── test_harvest_emi.py         # P1: Repayment engine (7 tests)
    ├── test_workflow_p1.py         # P1: Decision gates + Krishi Saathi (16 tests)
    └── test_analytics_p2.py        # P2: Portfolio, EWS, telemetry (6 tests)
```

---

## Backend

### Authentication

Implemented in `tvs_lending/db/database.py` and `tvs_lending/api/app.py`.

- Passwords hashed with **Argon2id** via `pwdlib[argon2]`
- Sessions use `secrets.token_urlsafe(32)` stored in SQLite WAL
- Session expiry enforced server-side; revocation on `POST /auth/logout`
- Role ladder: `Borrower` → `Field Agronomist` → `Agri Underwriter` → `Risk Operations Officer`
- Public registration always assigns `Borrower`; officer elevation requires `TVS_OFFICER_INVITE_CODE`

**Pre-seeded accounts** (dev only):

| Email | Role | Branch |
|---|---|---|
| `rajeshwar.sharma@tvscredit.com` | Agri Underwriter | Raipur Central Hub |
| `sunil.verma@tvscredit.com` | Risk Operations Officer | Zonal Risk Command |
| `kavita.patel@tvscredit.com` | Field Agronomist | Bilaspur Cluster |
| `ramesh.patel@tvsdealers.in` | TVS Tractor Dealer | Durg Dealership |

---

### Underwriting Pipeline

Entry: `POST /api/v1/underwrite`

```
Request → Input Validation → Idempotency Check
       → Duplicate Collateral Gate (H3 + Shapely)
       → LULC Non-Agri Gate (Bhuvan)
       → Kharif Cloud Cover Gate (≥70% → REFER_FIELD_VERIFICATION)
       → Satellite scoring (NDVI, BSI, NDWI, SWIR)
       → CloudGap-CG inpainting (monsoon season)
       → Climate resilience (NASA POWER 40-yr baseline)
       → LightGBM PD model + SHAP attributions
       → Multimodal scorecard (300–900)
       → Product match + Harvest EMI schedule
       → Application record + audit history
       → Response
```

**Decision gates:**

| Gate | Trigger | Outcome |
|---|---|---|
| Duplicate Collateral | Overlapping H3 polygon coordinates | `REFER_FRAUD_REVIEW`, sanction = ₹0 |
| Non-Agricultural LULC | Urban/barren ISRO classification | `REFER_LULC_REVIEW`, sanction = ₹0 |
| Heavy Cloud Cover | Canopy cloud ≥ 70% | `REFER_FIELD_VERIFICATION`, flag only |

**Scorecard weights:**

| Component | Weight | Source |
|---|---|---|
| Bureau / CIBIL history | 40% | Input parameter |
| Satellite land health | 30% | Sentinel-2 spectral indices |
| Climate resilience | 20% | NASA POWER + Open-Meteo |
| Collateral coverage | 10% | LTV + land valuation |

---

### Krishi Saathi Assistant

Entry: `POST /api/v1/assistant/chat`

- Context-grounded: resolves `application_id` from server-side DB; ignores client-supplied rates/amounts
- Message deduplication via `message_id` prevents duplicate LLM calls
- Policy RAG grounded in RBI Master Directions (SMA staging), Mandi MSP calendars, TVS Credit product parameters
- Model: `gemini-3.8-flash` with fallback chain → Groq Llama-3.3-70B → Cerebras → deterministic local rules
- Vernacular: English · हिन्दी · छत्तीसगढ़ी · தமிழ் · తెలుగు · मराठी · ಕನ್ನಡ · বাংলা

---

### Early Warning System

Entry: `GET /api/v1/ews/alerts` · `POST /api/v1/ews/transition`

Alert lifecycle: `OPEN → ACKNOWLEDGED → ASSIGNED → RESOLVED`

State transitions managed by authorized Risk Operations Officers only.

---

### Portfolio Analytics

Entry: `GET /api/v1/portfolio` · `POST /api/v1/whatif`

Portfolio PAR-90 computed as exposure-weighted average:

```
weighted_par90 = Σ(credit_crores_i × par90_i) / Σ(credit_crores_i)
```

What-if stress simulation parameters: rainfall deficit, heatwave intensity, commodity price shock, borrower count delta.

---

## Frontend

### Landing Page

Source: `frontend/src/WebsiteApp.tsx`

Sections (in scroll order):
1. **Hero** — Full-viewport looping video + headline + CTA
2. **Innovation Pillars** (`#innovations`) — 4 multimodal technology cards
3. **Lending Pipeline** — 3-minute autonomous flow, 4 steps
4. **Field Case Scenarios** — Carousel of 4 borrower profiles
5. **Underwriting Cockpit** (`#underwriting`) — Interactive scoring workspace
6. **Portfolio Map** (`#portfolio`) — District PAR-90 heatmap
7. **What-If Stress Simulator** (`#whatif`)
8. **Early Warning System** (`#ews`)
9. **Krishi Saathi** (`#krishi-saathi`) — Voice AI section

### Underwriting Cockpit

Source: `frontend/src/WorkspaceApp.tsx`

- Form-based loan application input (borrower, coordinates, land, CIBIL)
- Real-time SHAP attribution bar chart
- Harvest EMI schedule table
- Multi-agent deliberation modal
- Officer sign-off flow

### Krishi Saathi UI

Source: `frontend/src/components/Assistant.tsx`

- Floating drawer with conversation history
- Skeleton loading state during LLM response
- Follow-up prompt chips with auto-scroll
- Mic button with 5.5s silence auto-stop + friendly "Oops, didn't hear anything!" notice
- 8-language vernacular support

---

## API Reference

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/v1/auth/register` | — | Register new user (Borrower role) |
| `POST` | `/api/v1/auth/login` | — | Issue session token |
| `GET` | `/api/v1/auth/me` | Session | Current user profile |
| `POST` | `/api/v1/auth/logout` | Session | Revoke session |
| `POST` | `/api/v1/underwrite` | Session | Submit loan application |
| `GET` | `/api/v1/applications` | Session | List own applications |
| `POST` | `/api/v1/applications/{id}/decision` | Underwriter | Officer sign-off / override |
| `GET` | `/api/v1/portfolio` | Session | Portfolio aggregates + PAR-90 |
| `POST` | `/api/v1/whatif` | Session | Stress simulation |
| `GET` | `/api/v1/ews/alerts` | Session | Active EWS alerts |
| `POST` | `/api/v1/ews/transition` | Risk Officer | Alert lifecycle transition |
| `POST` | `/api/v1/assistant/chat` | Session | Krishi Saathi conversation turn |
| `POST` | `/api/v1/voice/transcribe` | Session | STT audio upload |
| `GET` | `/api/v1/health` | — | Health check |

All responses include telemetry headers: `X-Request-ID`, `X-Response-Time-MS`, `X-Execution-Mode`.

---

## Configuration

`config.py` reads from environment. Copy `.env.example` to `.env` and fill values.

See [Environment Variables](#environment-variables) for all supported keys.

---

## Installation

**Requirements:** Python 3.10+, Node.js 18+

```bash
# Clone
git clone https://github.com/<your-org>/tvs-smart-lending-hub.git
cd tvs-smart-lending-hub

# Python dependencies
pip install -r requirements.txt

# Frontend dependencies
cd frontend && npm install && cd ..
```

---

## Running

### Development (backend + static web)

```bash
python run_demo.py
```

Starts FastAPI on `http://127.0.0.1:8000` and serves `web/` as static files.

### Frontend dev server (hot-reload)

```bash
cd frontend
npm run dev
```

Starts Vite on `http://localhost:5173` with API proxy to `:8000`.

### Production build

```bash
cd frontend && npm run build
```

Outputs to `web/dist/`.

---

## Testing

### End-to-end regression suite

```bash
python test_hub.py
```

Covers: credit scoring, fraud detection, cloud-gap inpainting, vernacular voice, dual-track orchestrator.

### Pytest institutional suite

```bash
python -m pytest tests/ -v
```

| Suite | File | Tests |
|---|---|---|
| P0 Auth & Route Guards | `tests/test_auth_p0.py` | 14 |
| P1 Harvest EMI Engine | `tests/test_harvest_emi.py` | 7 |
| P1 Workflow & Gates | `tests/test_workflow_p1.py` | 16 |
| P2 Analytics & EWS | `tests/test_analytics_p2.py` | 6 |
| **Total** | | **43** |

---

## Deployment

### Vercel (frontend)

Configured via `vercel.json`. The frontend SPA deploys automatically.

```bash
vercel deploy --prod
```

Production alias: `https://tvs-credit-nu.vercel.app`

### Self-hosted

```bash
python run_demo.py
# Serves on http://0.0.0.0:8000
```

---

## Environment Variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `GEMINI_API_KEY` | Yes | — | Google Gemini API key for Krishi Saathi |
| `TVS_OFFICER_INVITE_CODE` | No | `TVS_EPIC8` | Secret code to elevate role to Officer/Dealer |
| `ALLOWED_ORIGINS` | No | `*` | Comma-separated CORS allowed origins |
| `DATABASE_URL` | No | `tvs_lending.db` | SQLite database path |
| `SESSION_TTL_HOURS` | No | `24` | Session expiry in hours |
| `GROQ_API_KEY` | No | — | Groq fallback LLM key |

See `.env.example` for the complete list.

---

## Known Limitations

- Satellite imagery uses deterministic simulations; production integration requires authenticated Sentinel Hub or Google Earth Engine API access.
- CloudGap-CG inpainting runs a lightweight proxy model; full ST-DIP U-Net requires a GPU environment.
- Voice STT via Whisper runs locally; production should use a streaming endpoint with WebSocket transport.
- The Bhuvan LULC adapter uses a simulated response; production requires ISRO API credentials.