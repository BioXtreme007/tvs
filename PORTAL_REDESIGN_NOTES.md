# Portal redesign — 6 September 2026

## Active pages

`WebsiteApp.tsx` now imports `AdminCockpit.tsx` and `FarmerWorkspace.tsx`. The former components remain available as historical source. `portals.css` contains the new visual styles. The public website and sign-in photo layout are preserved.

The admin shell uses navy navigation, violet active states, restrained tinted metrics, district exposure bars, a priority brief and a session assessment queue. It exposes portfolio search/sort/detail/CSV export, early-warning filters, stress scenarios, a validated credit assessment and the shared Saathi assistant. Assessment results populate the overview queue and can be inspected/exported. A new assessment clears the form. Data loading/error/retry states are present.

Concurrent edits added GeoKisanDecisionCockpit and changed the initial admin tab to GeoKisan. Those changes were preserved. A separate Credit assessment tab retains the API-backed form and queue workflow, and New assessment opens that form. GeoKisan's mock content is a separate integration and was not validated as actual telemetry, approvals or regulatory certification.

The farmer portal places Saathi first: a navy voice/question feature, custom assistant icon, prompt shortcuts and shared chat access. Lavender, mint and sand cards organize application preparation, repayments and farm insights. A working four-item personal checklist and expandable FAQs make the next steps accessible. Missing account/repayment/farm-report connections are stated instead of showing invented financial data. The checklist is session state, not a backend upload.

## Verification

- TypeScript and Vite production build passed. The integrated build emits a bundle-size advisory above 500 kB; code splitting is a future performance improvement.
- Browser-tested district bar → filtered portfolio → Raipur details.
- Submitted a synthetic UI Test Applicant assessment against the local API; score, proposed amount and installments rendered. Overview queue contained the returned applicant, district, amount and recommendation.
- Stress simulation returned baseline/stressed GNPA and portfolio-impact values.
- Farmer top Saathi button opened the shared accessible assistant dialog.
- Checking a document updated progress from 0 to 1 of 4.
- Checked desktop layouts and phone-sized overview/farmer layouts: no document horizontal overflow. Mobile navigation opened, selected Overview and closed. Temporary viewport reset afterward.
- Fixed an old `.farmer-saathi` CSS collision by using a distinct `farmer-voice-feature` class.
- Preserved other concurrently introduced routing changes and connected assessment context to the shared assistant.

## Data and next work

Portfolio and early warnings are backend sample data. The existing Google login is still a local placeholder, not verified Google OAuth or backend authorization. The redesign does not implement servicing, uploads or continuous conversational voice.

`KRISHI_SAATHI_VOICE_RESEARCH_FOR_GEMINI.md` is the research/build handoff, also copied to the user's Desktop. It recommends testing Gemini Live's limited free native-audio tier first, with a Pipecat/local-model alternative; it covers citations, architecture, cost/privacy constraints, humour, language handling, interruptions, authorized tools and acceptance tests.
