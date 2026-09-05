# Backend upgrade handoff for Gemini 3.8 Flash
Prepared 5 September 2026. Target: C:/Users/akgam/Documents/tvs/tvs-smart-lending-hub.

## Scope and ownership
The React UI has been upgraded. Gemini should implement the backend in this project, preserving the UI and its API contracts. Do not work in the older duplicate under soilguard-cg-full-deliverable.

Gemini 3.8 Flash is the requested coding assistant. Using it as the chatbot's runtime provider is a separate choice. If chosen, Google's documented model identifier is `gemini-3.8-flash`. Keep it in server configuration. It returns text and does not provide audio generation or the Live API; keep transcription and speech synthesis separate. Source: [Google model documentation](https://ai.google.dev/gemini-api/docs/models/gemini-3.8-flash), checked 5 September 2026.

The following findings come from the actual Python source, not the claims in README.md. The current app is a demo. This handoff does not certify real lending readiness.

## Findings and implementation order

### P0 — Replace demo authentication before any real customer use
Files: tvs_lending/api/auth.py, api/app.py, api/schemas.py.

Observed:
- Stored passwords use unsalted SHA-256.
- authenticate_user accepts several shared passwords for existing accounts.
- Email strings containing particular demo names can authenticate without checking the supplied password.
- Random session tokens are returned but not persisted, expired, or validated by protected endpoints.
- GET /auth/me always returns an authenticated status without checking identity.
- Signup trusts the requested role. JSON persistence is not transaction-safe and save failure is ignored.
- CORS permits all origins while enabling credentials.

Implement:
1. Durable users and sessions in PostgreSQL, with migrations and unique normalized email constraints. Use UUIDs instead of four-digit random user identifiers.
2. Argon2 password hashing and a deliberate migration/reset strategy for existing demo hashes. Never preserve password bypasses.
3. Authentication dependencies on protected routes; derive user, role, branch and borrower access from the verified session.
4. Signup always creates the least privileged role. Officer/admin roles require controlled assignment.
5. Server-side expiration, revocation, logout, and session rotation. Rate-limit authentication attempts and avoid account enumeration.
6. Explicit configured origins. Keep credentials and provider keys out of browser bundles and logs.
7. Prefer HttpOnly, Secure, SameSite session cookies for the eventual browser contract, with CSRF protection for mutations. Until that migration is coordinated, validate the existing Bearer token contract rather than silently changing it.

FastAPI's [security example](https://fastapi.tiangolo.com/tutorial/security/oauth2-jwt/) demonstrates password hashing with pwdlib/Argon2 and verified expiring bearer tokens. The application-specific access and session requirements above are design requirements from this audit.

Acceptance: no missing/invalid/expired/revoked session reaches customer data; one borrower cannot access another's assessment/chat; public signup cannot assign an officer role; failed writes cannot produce successful signup responses.

### P1 — Persist the lending workflow and enforce decision gates
Files: api/app.py, models/credit_scorecard.py, recommender/*, fraud/*.

Observed:
- Underwriting produces a response but does not create a durable application with a workflow and audit history.
- Many borrower/environment defaults refer to one sample plot.
- The current scorecard contains deterministic additive rules; this is not evidence of a calibrated ML credit model.
- The API calculates proposed amounts even around high-risk/fraud outcomes. Check every gate against final sanction behavior.
- /agents/deliberate independently recomputes a decision from client-provided score and features; it must not be an alternative approval path.
- Broad dictionaries and missing numeric bounds allow invalid or untrusted inputs to travel through the pipeline.

Implement:
- Persist applications, borrower ownership, plots, assessment input snapshots, scores, policy versions, evidence and decisions.
- States: DRAFT -> SUBMITTED -> ASSESSING -> REVIEW_REQUIRED -> APPROVED / DECLINED; record who performed each transition and why.
- Treat model output as a recommendation. An authenticated authorized officer signs off on lending decisions; chat cannot approve, amend rates or bypass checks.
- Validate positive money and land sizes, tenure and bureau bounds, allowed crops/products, coordinate ranges, nonempty closed polygons, and ownership. Production cannot supply default sample geometry.
- Apply fraud, land-use, missing-data and cloud-confidence gates before terms or recommendations are presented as eligible.
- Make assessment creation idempotent. Separate reusable policy calculations from API handlers and provider calls.
- Use one authoritative decision service for underwriting and deliberation. Record overrides with an explanation.

Acceptance: repeat submission with the same idempotency key creates one assessment; tampered scores/context never alter stored terms; fraud/missing-data cases require review; the same inputs and policy/model version reproduce the same explanation.

### P1 — Build an actual repayment engine
File: recommender/harvest_emi.py.

Observed: the entire generator returns a fixed benefit percentage and one installments_sample entry. It does not compute a full amortization schedule. The upgraded UI shows that no complete installments were returned instead of inventing a schedule.

Implement:
- Exact monetary arithmetic, explicit currency and rounding rules.
- Principal, annual rate, tenure, disbursement date, crop/harvest calendar, fees and approved repayment mode as inputs.
- Full dated schedule with principal, interest, fees, payment, outstanding balance, and final reconciliation.
- Return `repayment_structure.installments` using the compatibility fields below.
- Clearly separate monthly and harvest schedules; define what happens when nominal payments do not cover accrued interest.
- Remove claimed default-reduction percentages unless a documented evaluation supports them.

Acceptance: principal totals reconcile to the proposed principal; final outstanding balance is zero within the declared rounding tolerance; due dates increase; zero interest, short/long tenure, crop season boundaries, leap years and final payment rounding have tests.

### P1 — Make Krishi Saathi trustworthy and session-aware
Files: assistant/krishi_saathi.py, assistant/voice_engine.py, api/schemas.py, api/app.py.

Observed:
- The API accepts arbitrary borrower_context and optional API keys from the client.
- Missing context defaults to an example approved borrower. Internal fallbacks also manufacture amounts, scores, reference numbers and policy assertions.
- In-process conversation storage uses client session IDs, lacks authenticated ownership/expiry, and cannot work reliably across multiple workers.
- Generated answers label grounding/confidence using fixed values; a provider name is not a policy citation.
- Provider calls try multiple vendors and hide failures. The Gemini route currently hardcodes gemini-2.0-flash.
- No durable support escalation, request deduplication, streaming protocol, or language quality evaluation is provided.

Implement:
1. Authenticate and own conversations server-side. Resolve assessment_id/application_id to authorized stored records. Ignore client-supplied rates, approvals and scores in production.
2. General guidance must explicitly have no borrower. Missing context must never create a fictional loan.
3. Keep an approved, versioned policy collection with title, document ID, effective date, language and source location. Retrieve only applicable policy and authorized borrower evidence.
4. Return real source references and excerpts. If evidence is missing or conflicting, say what is missing. Do not output confidence percentages unless calibrated and measured.
5. Configure one primary provider through server env vars; use explicit bounded timeout/retry rules and observable error categories. Any fallback must identify itself and cannot invent financial facts.
6. Validate model responses against a structured schema. Constrain tool access to read-only authorized records. Treat prompts, retrieved documents and attachments as untrusted data.
7. Persist conversation/message records with owner, timestamps, provider/model, policy version and request ID. Apply retention/deletion policy and a per-conversation turn lock.
8. Add message IDs for safe retries. Cancellation should stop provider work where supported and mark a partial/interrupted response; do not append duplicate turns.
9. Add streaming as a versioned endpoint after the JSON path is solid. Suggested events: meta, delta, sources, done, error. The current UI expects JSON and must retain its existing endpoint during migration.
10. Escalation should create a real support ticket only after user confirmation, and return an actual ticket reference.
11. Keep transcript review before sending voice input. Do not claim browser voice support means a language has been evaluated. Add Hindi/English/Hinglish and other displayed languages to evaluation fixtures, reviewed by competent speakers.

Acceptance: no invented sanction/reference when context is absent; no cross-borrower data; untrusted prompts cannot change terms; invalid provider payloads surface as errors; duplicate request IDs do not duplicate messages; provider timeout does not become an approval; language and source quality are evaluated.

### P2 — Replace sample analytics and environmental claims
Files: api/app.py, core/satellite.py, core/cloudgap.py, models/default_model.py, models/xai_explainer.py, ews/*.

Observed:
- /portfolio returns seven fixed districts (₹988 Cr / 23,200 loans).
- /whatif uses another fixed baseline (₹1,250 Cr / 28,400 borrowers), not that portfolio.
- EWS uses fixed sample loans.
- Satellite reflectances are simulated. CloudGap returns supplied indices and fixed image-quality figures instead of doing reconstruction.
- DefaultPredictionModel returns largely fixed probability values; XAIExplainer returns an additive placeholder rather than SHAP.
- The README makes stronger claims than these implementations support.

Implement:
- Explicit DEMO_MODE, default off in production. Return mode, observed_at, source, freshness, data_quality, policy_version and model_version as appropriate.
- Portfolio aggregates from authorized stored loans, with pagination/filtering. Define and test exposure-weighted PAR-90; do not use a fixed average.
- Stress tests reference a selected real portfolio snapshot and a versioned scenario model.
- Provider adapters for satellite, weather and land records with provenance, licensing/access checks, timeouts, stale-data behavior and caches.
- Only call reconstruction/model outputs measured when actual artifacts, inputs and metrics exist. Preserve missing evidence as missing.
- EWS jobs persist alert lifecycle: OPEN -> ACKNOWLEDGED -> ASSIGNED -> RESOLVED, with history, deduplication and an assigned owner.
- Separate recommendation from executed outreach/restructuring. Persist dispatch acknowledgements; do not show success just because a button was clicked.
- Defer repayment collection and sanction-letter generation until authorized records, officer approval, payment provider and callback verification are implemented.

Acceptance: dashboard totals reconcile to records; snapshot dates and provenance are visible; repeated EWS scans do not duplicate alerts; simulated evidence cannot silently enter production decisions.

### P2 — Operability and release controls
Split the monolithic app into routers, services, repositories and adapters. Initialize expensive dependencies with application lifespan. Move long remote-sensing/assessment work to a bounded job queue with status polling. Add structured logs with request IDs and redacted borrower information, latency/error/cost metrics, rate limits, request limits, readiness checks, migrations, environment templates, and database backup/restore instructions.

Keep dependency versions pinned by a lock/constraints file; do not blindly upgrade packages while changing financial behavior. Tests must cover auth/access isolation, database concurrency, monetary reconciliation, decision gates, provider failures, chat grounding and the frontend compatibility responses. A passing health route is not proof that the decision engines work.

## Current frontend compatibility contract
Base path: /api/v1. The UI sends JSON, credentials: same-origin, and an Authorization: Bearer header when a stored token exists. It has a 45-second request deadline and cancellation.

| Endpoint | Used by | Required shape |
| --- | --- | --- |
| GET /health | Header | Successful health response; expose dependency status in the upgrade |
| GET /portfolio | Overview / Portfolio | total_active_agri_loans, total_portfolio_size_crores, portfolio_average_par90_pct, districts_data[] |
| POST /underwrite | Assessment | application_summary, underwriting_verdict, repayment_structure, and evidence sections |
| POST /whatif | Stress testing | baseline_portfolio, stressed_portfolio_impact |
| GET /ews/alerts | Early warnings | alerts[] with borrower_name, loan_id, ews_severity, amounts, days past due and signal text |
| POST /assistant/chat | Assistant | response (nonempty string), source, retrieved_context[], suggested_follow_ups[], session_id |
| POST /auth/login | Sign in | success, token, user; HTTP 401 on invalid credentials |
| POST /auth/signup | Create account | success, token, user; real validation errors |

District rows: district, active_loans, portfolio_cr, par_90_pct, mean_credit_score, top_crop.
Assessment request fields: applicant_name, district, village, khasra_no, land_acres, crop_type, requested_loan_amount_inr, requested_tenure_months, bureau_cibil_score (nullable), annual_banking_turnover_inr, requested_product_type.
Verdict fields: agri_credit_score, tier, decision, recommended_product, sanctioned_amount_inr, risk_adjusted_roi_pct.
Installment fields: installment_number, crop_growth_stage, installment_amount_inr; extend with dated financial breakdown without removing compatibility fields.
Chat request fields: message, language, session_id, borrower_context (temporary compatibility only; replace trust with server lookup).
Current UI languages: ENGLISH, HINDI, CHHATTISGARHI, TAMIL, TELUGU, MARATHI, KANNADA, BENGALI.
Error shape: HTTP 4xx/5xx with detail string or error.message string. Add error.code and request_id without breaking display.

Changing authentication to cookies, adding mandatory assessment IDs, streaming, source URLs, real payments, or job status requires a coordinated frontend adapter update. Do not change these contracts silently. New versioned endpoints may coexist with compatibility routes.

## Copy this instruction into Gemini 3.8 Flash
You are implementing the backend for TVS Smart Lending Hub in C:/Users/akgam/Documents/tvs/tvs-smart-lending-hub. Read BACKEND_UPGRADE_GEMINI.md first, then inspect the code. The new React frontend is already implemented; preserve its design and compatibility endpoints. Work only on the backend unless a narrowly scoped API adapter update is necessary and documented.

Start with P0 authentication and durable identity, followed by persisted applications and real repayment calculations, then authenticated grounded chat. Remove demo auth bypasses, client-trusted decisions, fabricated borrower defaults and invented success responses. Keep all sample environmental/risk outputs explicitly in demo mode. The LLM explains decisions; an authorized officer owns final lending actions.

Use small verified implementation stages. For each stage, report changed files, migration steps, API compatibility, tests actually run, and unresolved limitations. Do not claim production readiness or ML performance without evidence. Never print or commit secrets. Do not modify the older duplicate project. Before changing an endpoint contract, document how the existing frontend will continue working. Begin with the P0 implementation and its negative auth/access tests.

