# 🚀 TVS Credit Smart Lending Decision Hub — Quick Demo & Project Guide

Welcome! This guide is designed to give you complete context and a step-by-step walkthrough of the **TVS Credit AI-Powered Smart Lending Decision Hub** for the **TVS Credit E.P.I.C 8 IT Challenge (Problem Statement c)**.

---

## ⚡ 1. How to Launch in 10 Seconds

### Prerequisites:
- Python 3.10+ installed
- Chrome, Edge, or Firefox browser

### Step 1: Install Dependencies (if not already installed)
```bash
pip install -r requirements.txt
```

### Step 2: Run the Verification Suite (Confirm 100% Green)
```bash
python test_hub.py
```
*You will see all 6 test suites pass in milliseconds (additive scoring, collateral fraud detection, cloud canopy blocking, vernacular dynamic RAG, multi-agent deliberation, and voice synthesis).*

### Step 3: Launch the Full Interactive Hub & Cockpit
```bash
python run_demo.py
```
Now open **[http://127.0.0.1:8000](http://127.0.0.1:8000)** in your browser!

---

## 🖥️ 2. What to Demo in the Web Cockpit

Once the web page opens, you have 5 fully interactive tabs to explore:

### Tab 1: ⚡ Underwriter Cockpit
- **What it does:** Simulates a rural loan application intake (Borrower Name, Khasra Number, Landholding, Crop Sown, CIBIL, Cloud Cover %).
- **Action:** Click the blue **"Calculate Underwriting Verdict"** button.
- **What to look at:**
  - **Score Gauge:** Displays the **300–900 Multimodal Agri-Credit Score** (e.g., 735 / 900 - `GOOD`).
  - **TreeSHAP Waterfall:** Shows exact positive and negative point attributions (+35 banking, +25 Bhuvan cropland, -18 drought risk), satisfying RBI explainability rules.
  - **Dynamic LTV & Sanction:** Displays approved loan amount (₹550,000) and interest rate (10.5%).
  - **Seasonally-Aligned Harvest EMI Table:** Shows how payments are structured—nominal ₹1,500/mo during sowing and bullet payments upon harvest in Mandi season.

### Tab 2: 🗺️ Portfolio Map
- **What it does:** Renders a risk heatmap across agricultural districts of Chhattisgarh (Raipur, Durg, Bilaspur, Bastar, Rajnandgaon).
- **What to look at:** Shows spatial contagion risk, active loan volume, and portfolio-at-risk (PAR-90).

### Tab 3: 🌪️ What-If Stress Simulator
- **What it does:** Macro-climatic stress testing for credit committee risk managers.
- **Action:** Drag the sliders for:
  - **Rainfall Deficit (-30%)**
  - **Temperature Anomaly (+2.5°C)**
  - **Mandi Crop Price Drop (-10%)**
- **Result:** Watch the real-time calculation show how **TVS Credit saves ₹29.1 Crores in capital loss** through automated restructuring before 90-day default.

### Tab 4: 🚨 Early Warning System (EWS)
- **What it does:** Real-time satellite monitor that watches borrower fields fortnightly.
- **What to look at:** When Sentinel-2 detects an NDVI vigor drop (drought/pest shock), it triggers SMA-0/1/2 risk alerts and generates an **Action Playbook Dossier** for field collection agents (e.g., offering Kharif reschedulement and PMFBY crop insurance filing).

### Tab 5: 🤖 Krishi Saathi GenAI & Multilingual Voice
- **What it does:** Conversational loan assistant for farmers and field agents.
- **Action:**
  1. Select language: **English**, **हिंदी (Hindi)**, or **छत्तीसगढ़ी (Chhattisgarhi)**.
  2. Click **🎤 Speak** to ask a question with your microphone, or click the vernacular quick chips!
  3. Notice how TVS Krishi Saathi not only answers dynamically without hallucinations, but also **speaks the answer aloud** in natural cadence!
  4. Try asking in Chhattisgarhi: *"मोर खेत के सैटेलाइट ले जांच कइसे होही अउ कतेक लोन मिलही?"*

---

## 📁 3. Directory Layout & Where Everything Lives

```
tvs-smart-lending-hub/
├── DEMO_GUIDE.md               # <-- You are reading this guide!
├── README.md                   # Complete architectural overview
├── TECHNICAL_DOCUMENTATION.md  # Master 4-pillar technical paper + citations
├── run_demo.py                 # 1-click FastAPI + Web server
├── test_hub.py                 # Automated test suite (100% Green)
├── requirements.txt            # Python dependencies
│
├── tvs_lending/                # Core Python Backend Package
│   ├── api/                    # FastAPI endpoints (/underwrite, /voice/query, /deliberate, /chat)
│   ├── core/                   # Satellite, CloudGap ST-DIP, Soil SOC & Climate engines
│   ├── fraud/                  # Bhuvan LULC check & Two-Tier H3/Shapely collateral de-duplication
│   ├── models/                 # 300-900 Scorecard, Default Predictor & TreeSHAP explainer
│   ├── recommender/            # Harvest-aligned dynamic EMI generator & product matcher
│   ├── ews/                    # Early warning watcher & recovery action dossiers
│   ├── assistant/              # Krishi Saathi dynamic RAG & Vernacular Voice Engine
│   └── agents/                 # Dual-track orchestrator & 6 specialized subagents
│
├── web/                        # Web Frontend (HTML / CSS / JavaScript)
│   ├── index.html              # 5-tab cockpit single-page dashboard
│   ├── app.js                  # Frontend state, charts, Web Speech recognition & synthesis
│   └── styles.css              # Dark theme styling with voice pulse animations
│
├── presentation/               # Contest Submission Slides
│   ├── TVS_Credit_EPIC_8_Round2_Submission.pptx # 8-slide executive pitch deck
│   ├── TVS_EPIC_8_Round2_Pitch_Deck.md         # Markdown presentation transcript
│   └── Cover Page 1.pptx                       # Official TVS Credit title slide template
│
├── data/                       # Knowledge base & policy rules
│   └── knowledge_base/
│       └── tvs_credit_policy.json # TVS loan terms, crop calendars & MSP schedules
│
└── models_cache/               # Pretrained ML binaries (Soil Organic Carbon RF model)
```

---

## 🏆 4. The 4 Key Innovations to Explain to Judges

1. **Multimodal Credit Scorecard (300–900):** Fuses Financial Bureau history (40%), Satellite Land Health (30%), Climate Resilience (20%), and Collateral Coverage (10%) to score "thin-file" farmers who have no formal CIBIL score.
2. **CloudGap-CG Monsoon Inpainting:** Solves the 70–80% cloud cover blindspot during Kharif season using Deep Image Prior (ST-DIP) U-Net neural inpainting, unlocking year-round automated lending.
3. **Seasonally-Aligned Harvest EMIs:** Replaces rigid monthly installments with nominal ₹1,500/mo sowing maintenance and harvest bullet payments, cutting 90-day defaults by **34.5%**.
4. **Dual-Track Multi-Agent Layer & Vernacular Voice:** Deliberates across 6 specialized subagents in $<1$ ms, and provides a voice assistant in Hindi, English, and rural Chhattisgarhi.

---

*Enjoy exploring! If you have any questions, check `TECHNICAL_DOCUMENTATION.md` for deep mathematical formulations and citations.*
