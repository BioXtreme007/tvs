# UI upgrade and verification
Date: 5 September 2026
Project: C:/Users/akgam/Documents/tvs/tvs-smart-lending-hub

## Delivered
- Replaced the long presentation-style landing page with a responsive green/ivory lending workspace.
- Persistent sidebar, clear route titles, mobile navigation, status indicator and sample-data labeling.
- Portfolio overview with API totals and district exposure chart; searchable/sortable district table, district details and CSV export.
- Validated borrower assessment form, loading/cancel/error states, API recommendation, score contributions, repayment availability, JSON export, and context passed to Saathi.
- API-backed stress testing, scenario export, filtered early warnings and expandable recommendations.
- Farmer services use the active assessment instead of a fabricated approved loan. Unconnected payment and sanction-letter actions are explained as unavailable.
- Rebuilt sign-in/account-creation UI. Failed requests do not create local authenticated users. /signin.html redirects to the new sign-in route.
- One assistant instance retained while navigating: eight response languages, optional browser dictation, transcript review, read aloud, copy/export, new conversation, contextual question drafts, retry, cancellation, and actual API source metadata.
- Client API helper adds deadlines, cancellation cleanup, bearer headers and consistent errors.
- No new npm dependencies, external background videos or externally hosted fonts in the active UI.

## Source files
- frontend/src/App.tsx: workspace shell, routing, assessment context, assistant drawer.
- frontend/src/components/WorkspaceViews.tsx: overview, portfolio, underwriting, alerts, stress, farmer and auth views.
- frontend/src/components/Assistant.tsx: shared conversational UI and browser voice controls.
- frontend/src/api.ts: requests, resource loading and formatting/export helpers.
- frontend/src/index.css: layout, responsive rules, focus and reduced-motion styles.
- frontend/public/signin.html: compatibility redirect.
- scratch/verify_ui_api.cjs: focused regression tests.
- BACKEND_UPGRADE_GEMINI.md: implementation order, source findings, contracts and copy-ready Gemini prompt.

Older components remain in the source tree but are no longer imported by App. Backend Python was not changed in this UI pass. The Vite build is saved in web/dist, which the existing run_demo.py serves.

## Checks performed
1. npm run build: TypeScript and production bundling pass.
2. node ../scratch/verify_ui_api.cjs (from frontend): 8 tests pass:
   - Successful response preserves numeric zero and sends the bearer token.
   - Guest calls do not manufacture a token.
   - Validation failures remain failures.
   - Unauthorized errors produce a sign-in message.
   - Non-JSON server failures are handled.
   - Network failures do not produce approvals or chatbot answers.
   - In-flight requests can be cancelled.
   - Stalled requests reach the configured deadline.
3. Browser checks against the existing local API:
   - Dashboard shows the API sample totals: INR 988 Cr, 23,200 loans, 7 districts.
   - Searching Korba returns one district and detail values; risk sort is selectable.
   - Synthetic borrower assessment returns a 675 score, manual underwriting recommendation, INR 550,000 proposed amount and 12.25% rate. The missing full repayment schedule is explicitly reported.
   - Contextual assistant draft submits and receives a response; selected synthetic borrower appears in the conversation context.
   - Stress scenario returns baseline 2.45%, stressed 6.47%, INR 50.25 Cr incremental NPA and 1,837 at-risk borrowers from the sample model.
   - Critical alert filter shows two matching sample alerts.
   - At a 390 x 844 viewport, navigation opens/closes, the overview has no page-level horizontal overflow, and the assistant adapts to viewport width.
   - Assistant keyboard wrapping and Escape dismissal exercised. Automated initial/return-focus checks were inconclusive in the browser tool; the code includes deferred focus and a launcher fallback.
   - Invalid synthetic login produces a visible error and stays signed out.
   - Farmer view without an assessment displays unavailable amounts/scores.
   - Legacy /signin.html opens the new sign-in screen.
   - No console errors/warnings were reported when checking the assessment path.

## Verification limits
The browser tool repeatedly reported that screenshots could not be captured. Layout was checked through DOM/accessibility structure and viewport dimensions; visual screenshot QA is not complete. Real microphone permission, recording, language voice availability, physical audio playback and downloaded file contents were not independently exercised. Chat copy/export and portfolio export are implemented, but browser downloads were not inspected.

CodeRabbit CLI was not installed, and this directory is not a Git repository. No external CodeRabbit review ran; source review, build checks and the tests above were used. Optional automated review setup: install the CLI from [the official CodeRabbit source](https://www.coderabbit.ai/cli), authenticate, and use it on a Git working tree without secrets.

## Backend limitations surfaced by the UI
The existing chatbot still returns fixed financial claims from its backend fallback. The UI labels it as demo guidance and does not certify those answers. Auth bypasses, unvalidated sessions, missing durable applications, placeholder repayment calculations and simulated environmental/portfolio outputs remain backend tasks. See BACKEND_UPGRADE_GEMINI.md.

## Run locally
Use the existing running app at http://127.0.0.1:8000.

To rebuild:
    cd frontend
    npm run build

To serve the production UI from the project root when the server is not already running:
    python run_demo.py

For frontend development with API proxy:
    cd frontend
    npm run dev

