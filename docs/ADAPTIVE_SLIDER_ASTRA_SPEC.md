# PRD & Technical Design Specification: Unified Adaptive Slider System
**Target Platform:** GeoKisaan Smart Lending Decision Hub (TVS Credit E.P.I.C 8)  
**Target Code Generator:** GPT Astra / Frontier Model  
**Tech Stack:** React 18+, TypeScript, Tailwind CSS, Framer Motion (`framer-motion`), Lucide React  

---

## 1. Executive Summary & Design Vision

This specification defines the architecture, design tokens, mathematical shock models, and vernacular UI patterns for a unified **Adaptive Slider Component System**. 

The system serves two distinct user archetypes from a single, shared physics and visual engine:
1. **Executive Mode (`ExecutiveStressSlider`)**: Designed for Credit Risk Committees and Underwriting Officers. Provides precision mathematical shocks (Rainfall Deficit %, Temperature Rise °C, Mandi Price Shock %), rolling digit-by-digit mechanical odometers, risk-gradient color shifts, and institutional portfolio GNPA & capital loss calculations.
2. **Farmer Mode (`FarmerCropSafetySlider`)**: Designed for rural Indian smallholder farmers with limited formal education. Converts complex climatic beta-shocks into sensory visual milestones (☀️ Parched Drought → ⛅ Optimal Monsoon → ⛈️ Waterlogged Flood), one-tap weather presets, 3 plain-language outcome cards (Crop Health, Automatic 60-Day Moratorium Protection, Today's Agronomy Action), 🎙️ Krishi Saathi Voice AI integration ("बोलकर देखें"), and 🔊 vernacular audio narration ("सुनें").

---

## 2. Design System & Typography Rules (STRICT ENFORCEMENT)

To maintain absolute visual consistency across the entire GeoKisaan platform, all generated code must strictly obey these design tokens:

### 2.1 Typography Stack
- **Headings & Primary Numbers**: 
  - CSS Variable: `var(--font-heading)`
  - Font Stack: `'Mazzard H', 'Helvetica Now Display Bold', 'Inter', -apple-system, sans-serif`
  - Characteristics: Tight negative tracking (`tracking-tight`, `-0.03em` to `-0.045em`), bold/extra-bold (`font-bold`, `font-extrabold`), high contrast against white and `#F9F9F7` backgrounds.
- **Body & Labels**: 
  - CSS Variable: `var(--font-body)`
  - Font Stack: `'Mazzard H', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`
  - Characteristics: Clean legibility, neutral slate tones (`text-slate-600` / `text-slate-700`).
- **Telemetry & Quantitative Units**: 
  - Font Stack: `font-mono` (`ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace`)
  - Usage: Monospace metadata tags, currency notation (`₹3,40,000`), H3 hexagon IDs, and percentage deltas (`-30%`, `+2.5°C`).

### 2.2 Color Palette & Semantic Tokens
- **Core Brand Colors**:
  - `TVS Navy / Primary`: `#0B2545` (`var(--color-primary)`) — Used for primary buttons, executive titles, and dark contrast cards.
  - `Ink Text`: `#192837` (`var(--color-text)`, `var(--ink)`) — Primary high-contrast text color.
  - `Canvas Cream`: `#F9F9F7` / `#EAE1DF` — Warm, institutional, anti-glare canvas.
  - `Panel White`: `#FFFFFF` — Pure white card surface with subtle border.
  - `Border Line`: `#E2E8F0` / `#E1E4ED` (`var(--line)`) — Crisp 1px structural dividing lines.
- **Semantic Risk & Weather Gradients**:
  - **Drought / Severe Stress (0% to 35% of scale)**:
    - Text: `#DC2626` (Crimson) or `#EA580C` (Ochre Amber)
    - Gradient: `linear-gradient(to right, #EF4444, #F97316)` (Crimson Red to Vibrant Orange)
    - Background Tint: `#FEF2F2` / `#FFF7ED` (Soft parched terracotta)
  - **Optimal / Resilient Window (35% to 70% of scale)**:
    - Text: `#059669` (Emerald Green)
    - Gradient: `linear-gradient(to right, #10B981, #059669)` (Agronomic Emerald)
    - Background Tint: `#ECFDF5` (Lush green hydration)
  - **Excess Rain / Flood Shock (70% to 100% of scale)**:
    - Text: `#2563EB` (Monsoon Blue)
    - Gradient: `linear-gradient(to right, #3B82F6, #1D4ED8)` (Deep Monsoon Blue)
    - Background Tint: `#EFF6FF` (Waterlogged field)

### 2.3 Strict Anti-"AI Slop" Guidelines
- **NO Rainbow Candy Pills**: Never use neon pastel badge pills (`bg-emerald-50`, `bg-blue-50`, `bg-purple-50`) with flashing dots.
- **Subtle Institutional Metadata**: Use high-contrast headings with subdued monospace tags (`text-slate-500 font-mono text-xs`) and clean slate containers (`bg-slate-50 border border-slate-200/70`).
- **Tactile Surfaces**: Use crisp pill tracks, subtle interior shadows (`shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)]`), and spring-animated thumbs (`type: 'spring', stiffness: 320, damping: 30`).

---

## 3. Component Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│                        AdaptiveSliderBase                              │
│  (Pointer drag, touch events, Framer Motion spring track, guide dots,  │
│       digit-by-digit AnimatedText odometer, accessible hidden input)   │
└──────────────────┬─────────────────────────────────┬───────────────────┘
                   │                                 │
                   ▼                                 ▼
       ExecutiveStressSlider               FarmerCropSafetySlider
 ┌───────────────────────────────────┐ ┌───────────────────────────────────┐
 │ • Rainfall Deficit (-50% to +20%) │ │ • ☀️ सूखा ─ ⛅ सामान्य ─ ⛈️ बाढ़  │
 │ • Heatwave Rise (0°C to +5°C)     │ │ • One-Tap Weather Preset Pills    │
 │ • Price Crash (-40% to +20%)      │ │ • 3 Farmer Outcome Cards          │
 │ • GNPA & Capital Loss Formulas    │ │ • 🎙️ "बोलकर पूछें" Voice AI      │
 │ • Restructuring Shield Calculator │ │ • 🔊 "सुनें" Vernacular Speech    │
 └───────────────────────────────────┘ └───────────────────────────────────┘
```

---

## 4. Module 1: `AdaptiveSliderBase` (Core Physics Engine)

### 4.1 Features
1. **Touch & Drag Scrubbing**: Supports smooth scrubbing via native `<input type="range">` hidden over a visual Framer Motion spring track.
2. **Animated Mechanical Odometer (`AnimatedText`)**: Digits slide and transition individually using Framer Motion's `<AnimatePresence mode="popLayout">`.
3. **Guide Indicator Dots**: 6 subtle equidistant dots inside the pill track showing scale increments.
4. **Dynamic Context-Aware Gradient Fill**: Smoothly animates track fill width and gradient color as the user drags.

### 4.2 TypeScript API Definition
```typescript
export interface SliderColorConfig {
  low: { text: string; gradient: string; thumbBorder?: string };
  mid: { text: string; gradient: string; thumbBorder?: string };
  high: { text: string; gradient: string; thumbBorder?: string };
}

export interface AdaptiveSliderBaseProps {
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  prefix?: string;
  label: string;
  sublabel?: string;
  icon?: React.ComponentType<{ size?: number; className?: string }>;
  colorConfig?: SliderColorConfig;
  onChange: (val: number) => void;
  disabled?: boolean;
  className?: string;
}
```

### 4.3 Spring Animation Specifications
- **Thumb Translation**:
  ```typescript
  transition: { type: 'spring', stiffness: 320, damping: 28, mass: 0.8 }
  ```
- **Track Fill Expansion**:
  ```typescript
  animate: {
    width: `calc((${percentage} / 100) * (100% - 48px) + 48px)`,
    background: activeColor.gradient,
  }
  ```
- **Digit Odometer Spring**:
  ```typescript
  initial: { opacity: 0, y: -12, scale: 0.95 }
  animate: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 350, damping: 25 } }
  exit: { opacity: 0, y: 12, scale: 0.95, transition: { duration: 0.12 } }
  ```

---

## 5. Module 2: `ExecutiveStressSlider` (Risk Committee View)

### 5.1 Business Logic & Mathematical Formulas
Baseline Portfolio Assumptions:
- `Portfolio Size`: ₹1,250.0 Crores
- `Baseline GNPA`: 2.45% (₹30.6 Cr)
- `Borrower Base`: 28,400 farmers

Input Parameter Sliders:
1. **Rainfall Deficit / Surplus**:
   - Range: `-50%` (Severe Drought) to `+20%` (Monsoon Deluge), step `5%`.
   - Formula: `droughtPenalty = Math.max(0, -rainfallChange) * 0.08`
2. **Temperature Heatwave Rise**:
   - Range: `+0.0°C` (Normal) to `+5.0°C` (Extreme Heat), step `0.5°C`.
   - Formula: `heatPenalty = tempIncrease * 0.45`
3. **Crop Market Price Shock**:
   - Range: `-40%` (Mandi Price Crash) to `+20%` (Price Rally), step `5%`.
   - Formula: `pricePenalty = Math.max(0, -priceChange) * 0.05`

Output Calculations:
```typescript
// Unmitigated Stressed GNPA
const stressedGnpaPct = parseFloat((baseGnpa + droughtPenalty + heatPenalty + pricePenalty).toFixed(2));

// Portfolio at Risk in INR Crores
const stressedCr = parseFloat(((portfolioCr * stressedGnpaPct) / 100).toFixed(1));
const incrementalNpaCr = parseFloat((stressedCr - baseCr).toFixed(1));
const atRiskFarmersCount = Math.round(baseFarmers * (stressedGnpaPct / 100));

// Restructuring Shield Mitigated Impact (GeoKisaan Seasonally-Linked Restructuring)
const mitigatedGnpaPct = parseFloat((stressedGnpaPct * 0.68).toFixed(2));
const capitalLossPreventedCr = parseFloat((incrementalNpaCr * 0.65).toFixed(1));
```

### 5.2 UI Layout Specifications
- 2-Column Responsive Grid (`grid-cols-1 lg:grid-cols-12 gap-8`):
  - **Left (7 cols)**: Shock Input Panel with 3 `AdaptiveSliderBase` components.
  - **Right (5 cols)**: Stressed Impact Dossier:
    - Comparison tile: Baseline GNPA (`2.45%`) → Stressed GNPA with red delta pill (`+3.85%`).
    - Detail metrics grid: Incremental NPA (`₹18.4 Cr`), At-Risk Borrowers (`1,842`).
    - GeoKisaan Restructuring Shield banner: Showing restructured GNPA (`3.62%`) and Capital Saved (`₹12.0 Cr`).
    - One-click `Export Scenario Dossier (JSON)` button.

---

## 6. Module 3: `FarmerCropSafetySlider` (Rural Smallholder View)

### 6.1 Farmer Psychology & Accessibility Principles
1. **Zero Math Jargon**: No "% Deficits", "Basis Points", or "GNPA". Replace with physical real-world outcomes.
2. **Thumb-Friendly Touch Targets**: Minimum 48px height on all interactive elements.
3. **Visual Sensory Dial**: The slider uses 3 physical milestones:
   - ☀️ **सूखा (Drought)**: Parched cracked earth visual, ochre/crimson tint.
   - ⛅ **सामान्य बारिश (Normal Monsoon)**: Healthy emerald sprout, optimal hydration.
   - ⛈️ **अतिवृष्टि / बाढ़ (Flood)**: Waterlogged deep blue field, drainage alert.
4. **Instant Actionable Reassurance**: Every farmer's primary fear is loan default and land seizure. Reassure them with the **Automatic 60-Day Satellite Moratorium Guarantee**.

### 6.2 The 3 Farmer Outcome Cards
1. **🌱 फसल की स्थिति (Crop Health Forecast)**:
   - *Normal*: "✅ बढ़िया पैदावार — 90% से अधिक अच्छी फसल की उम्मीद।"
   - *Drought*: "⚠️ फसल को पानी की कमी — 30% से 40% पैदावार प्रभावित होने का जोखिम।"
   - *Flood*: "🌊 खेत में जलभराव — धान की जड़ों में पानी भरने का ख़तरा।"
2. **🛡️ आपकी क़िस्त (TVS Credit Moratorium Protection)**:
   - *Normal*: "🟢 सामान्य क़िस्त — फसल कटाई के बाद समय पर आसान भुगतान।"
   - *Drought / Flood*: "🛡️ 60-दिन मोराटोरियम सक्रिय! — सैटेलाइट से सूखा देखकर टीवीएस क्रेडिट आपकी क़िस्त को 60 दिन आगे बढ़ा देगा। कोई पेनल्टी या ज़ुर्माना नहीं लगेगा।"
3. **💡 आज क्या करें? (Today's Actionable Advice)**:
   - *Normal*: "समय पर यूरिया/डीएपी का छिड़काव करें।"
   - *Drought*: "कम पानी वाली धान की किस्म (MTU 1010) लगाएं और ड्रिप सिंचाई का उपयोग करें।"
   - *Flood*: "खेत की मेड़ काटकर तुरंत पानी निकासी की नाली बनाएं।"

### 6.3 Multilingual i18n Dictionary
The component must support 4 languages selectable via state:

| Key | Hindi (hi) | Chhattisgarhi (hne) | Tamil (ta) | English (en) |
|---|---|---|---|---|
| **title** | फसल व क़िस्त सुरक्षा सिम्युलेटर | फसल अउ किश्त सुरक्षा सिम्युलेटर | பயிர் மற்றும் கடன் தவணை பாதுகாப்பு | Weather & Loan Safety Simulator |
| **subtitle** | देखें मौसम बदलने पर आपकी फसल और क़िस्त पर क्या असर होगा | देखव मौसम बदले ले तुंहर फसल अउ किश्त म का असर होही | வானிலை மாறினால் உங்கள் பயிர் மற்றும் தவணைக்கு என்ன நடக்கும் | See how weather shifts protect your crop and repayment |
| **preset_dry** | ☀️ कम बारिश (सूखा) | ☀️ कम पानी (सूखा) | ☀️ குறைவான மழை (வறட்சி) | ☀️ Low Rain (Drought) |
| **preset_normal** | ⛅ सामान्य मानसून | ⛅ बनेच पानी (सामान्य) | ⛅ இயல்பான மழை | ⛅ Normal Monsoon |
| **preset_wet** | ⛈️ भारी बारिश (बाढ़) | ⛈️ भारी झड़ी (बाढ़) | ⛈️ அதிக மழை (வெள்ளம்) | ⛈️ Excess Rain (Flood) |
| **listen_btn** | 🔊 सुनें | 🔊 सुनव | 🔊 கேளுங்கள் | 🔊 Listen |
| **voice_btn** | 🎙️ बोलकर पूछें | 🎙️ गोठिया के पूछव | 🎙️ பேசி கேளுங்கள் | 🎙️ Ask with Voice |
| **moratorium_badge**| 60 दिन क़िस्त राहत (मुफ़्त) | 60 दिन किश्त म छूट | 60 நாட்கள் தவணை விலக்கு | 60-Day Free Moratorium |

### 6.4 Voice AI Integration Protocol
- When the farmer taps **🎙️ "बोलकर पूछें"**:
  ```typescript
  window.dispatchEvent(
    new CustomEvent('open-krishi-saathi', {
      detail: {
        query: 'अगर इस साल बारिश कम हुई तो मेरी क़िस्त का क्या होगा?',
        voiceMode: true,
      },
    })
  );
  ```
- When the farmer taps **🔊 "सुनें"** on any card:
  Trigger browser SpeechSynthesis or the backend voice engine endpoint (`POST /api/voice/speak`) with the localized text.

---

## 7. Delivery Checklist for GPT Astra Code Generation

When generating the code, ensure the following constraints are met:
- [ ] Uses `framer-motion` imports (do NOT import from `motion/react`).
- [ ] Uses Tailwind CSS utility classes compatible with existing CSS.
- [ ] Font family for headings explicitly uses `'Mazzard H', var(--font-heading), sans-serif`.
- [ ] Font family for body text explicitly uses `var(--font-body), 'Inter', sans-serif`.
- [ ] Font family for numbers/metrics uses `font-mono`.
- [ ] No colorful candy badge pills in the executive view.
- [ ] Export `ExecutiveStressSlider` and `FarmerCropSafetySlider` as modular, self-contained React components.
- [ ] Pure client-side calculation with zero latency and full keyboard accessibility.

---
*Authored by BioXtreme007 for GeoKisaan Autonomous Lending Platform.*
