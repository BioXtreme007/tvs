# Krishi Saathi: conversational voice research and Gemini implementation handoff

Research checked: 6 September 2026. Project: TVS Credit E.P.I.C 8 / BioXtreme.
Workspace: `C:\Users\akgam\Documents\tvs\tvs-smart-lending-hub`.

## Recommendation

Build the hackathon voice experience with **Gemini Live native audio**, while retaining the current record-and-transcribe flow as a fallback. This is my architectural recommendation, not a measured quality ranking. Prototype English and Hindi first; test every additional language with native speakers before advertising it. Keep the new farmer portal's large top Saathi card as the entry point.

For a strict no-paid-API deployment, prototype **Pipecat + faster-whisper + a locally served instruction model + local TTS**. That route trades cloud quotas for hardware requirements, integration work and potentially slower responses. It is not a promise of GPT Voice quality on this laptop.

“Free” must distinguish a limited hosted free tier, temporary promotional credits, free framework code, and local inference whose hardware still costs money. No service reviewed here establishes unlimited, production-grade, zero-cost voice conversations.

## Options and verified facts

| Option | What is free? | Fit for this project | Limitation |
|---|---|---|---|
| Gemini Live native audio | Google currently lists free input and output for `gemini-2.5-flash-native-audio-preview-12-2025` | Best first prototype for fluid spoken replies | Preview model; account quotas and data-use terms apply |
| Pipecat with local components | BSD-2-Clause Python framework; local engines can avoid inference API charges | Best fallback architecture when avoiding provider dependence | Framework itself supplies neither intelligence nor free compute |
| LiveKit Agents | Apache-2.0 framework, self-hostable media/agent stack | Useful for WebRTC, turn handling and future multi-user deployment | Managed cloud and model inference have separate pricing |
| OpenAI `gpt-realtime` | No free tier listed for this model | Paid comparison point for native spoken interaction | Budget required; not a free drop-in |
| Existing local transcription | Project already has a faster-whisper endpoint | Preserve for voice questions and degraded-network fallback | Batch recording is not a continuous conversation |

Google's pricing page lists native audio paid rates of $3 / million audio input tokens and $12 / million audio output tokens; text rates are $0.50 input and $2 output. Free-tier content is marked as used to improve products; paid-tier content is marked no. Use synthetic hackathon information in the free prototype, not borrower identity documents or private account records. Recheck the exact model before building. [Google pricing](https://ai.google.dev/gemini-api/docs/pricing)

Google's Live overview describes bidirectional WebSocket audio, interruption handling, tool calls, transcripts and expressive dialogue. The documented audio formats are 16-bit PCM, 16 kHz input and 24 kHz output. The overview currently lists 70 supported languages; this does not establish quality for local accents or dialects. [Live overview](https://ai.google.dev/gemini-api/docs/live-api)

Quota values depend on project tier/account and can be inspected in AI Studio. Do not copy an old “unlimited” or fixed concurrency claim into this product. Account-specific capacity was not inspected in this research. [Rate limits](https://ai.google.dev/gemini-api/docs/rate-limits)

For a direct browser connection, issue a short-lived token from a trusted backend. Google's default token window allows one minute to start a session and thirty minutes to send messages; expiration/session handling still needs implementation. Keep the permanent API key server-side. [Ephemeral tokens](https://ai.google.dev/gemini-api/docs/live-api/ephemeral-tokens)

Pipecat is an open-source Python orchestration framework for realtime voice and multimodal agents. It is a good match for the existing Python backend, but choosing it does not make paid STT/LLM/TTS integrations free. [Pipecat repository and license](https://github.com/pipecat-ai/pipecat)

LiveKit Agents supports realtime media, turn detection, interruptions and provider integrations, with self-hosted or managed deployment. Its cloud pricing separates agent/inference costs; adding it solely to a small web prototype introduces infrastructure. Use it when WebRTC and session operations justify that work. [Agents documentation](https://docs.livekit.io/agents/), [Cloud pricing](https://livekit.com/pricing)

OpenAI's `gpt-realtime` page lists audio at $32 input / $64 output per million tokens and text at $4 / $16, excluding cached rates. The model's free tier is unsupported. These figures describe this named model, not every OpenAI audio model. [Official model and pricing](https://developers.openai.com/api/docs/models/gpt-realtime)

## Local alternative: concrete starting architecture

Use browser audio capture → WebRTC or a local streaming transport → VAD/turn detection → faster-whisper → local instruction model via Ollama → sentence-streamed Kokoro TTS → browser playback. Use Pipecat to coordinate cancellation and pipeline events rather than writing unrelated loops for each engine.

faster-whisper uses CTranslate2, offers CPU int8 execution and a Silero VAD integration. Choose multilingual weights, not an English-only model. The existing base model is a convenient baseline; benchmark before upgrading its size. [faster-whisper documentation](https://github.com/SYSTRAN/faster-whisper)

Ollama provides a local model runtime/API. Select a model whose weights license, memory footprint and tool-calling reliability fit this deployment; Ollama's installation alone does not establish those properties for every model. Pin the exact model/version in the implementation notes. [Ollama quickstart](https://docs.ollama.com/quickstart)

Kokoro-82M is an open-weight TTS candidate with an Apache-2.0 model card and a separate voice/language listing. Audit the chosen voice and any pronunciation dependencies. Do not assume it covers all eight languages in the current chat selector; support only tested voices and offer text otherwise. [Model card](https://huggingface.co/hexgrad/Kokoro-82M), [Voice inventory](https://huggingface.co/hexgrad/Kokoro-82M/blob/main/VOICES.md)

Benchmark end-of-user-speech to first audible reply on the actual machine, both quiet and noisy. CPU transcription, local LLM generation and TTS share resources. Start with one simultaneous session; measure RAM, CPU/GPU load and warm/cold start times. Network independence still requires downloading weights initially. Browser speech synthesis can be a last fallback, but do not market it as a consistent branded multilingual voice.

## Current repository: what Gemini should preserve

- `frontend/src/components/Assistant.tsx`: shared chat, language selection, microphone capture and transcript review. Audit current file before changing it; it has been edited during the project.
- `frontend/src/saathi-i18n.ts`: translated UI copy. Audio language and interface language must move together.
- `tvs_lending/api/speech.py`: local `POST /api/v1/assistant/stt/transcribe`, currently batch transcription. Keep this path operational.
- `frontend/src/WebsiteApp.tsx`: shared assistant and `open-krishi-saathi` event. Both page entry points should open the same session.
- `frontend/src/components/FarmerWorkspace.tsx`: redesigned farmer page. The assistant is the first feature, with question shortcuts and a preparation checklist.
- `frontend/src/components/AdminCockpit.tsx`: redesigned cockpit, API portfolio metrics, district views, warnings, stress testing and session assessment queue.
- `frontend/src/components/WorkspaceViews.tsx`: existing API-backed assessment, portfolio, warning and stress components used inside the cockpit.
- `frontend/src/portals.css`: scoped visual language for these pages. Preserve the public landing page and image-backed sign-in layout.

The current Google sign-in flow is a local placeholder: it classifies a role using name/email strings and creates a local token. This is not verified Google OAuth or server-enforced admin authorization. Before connecting private tools, replace it with real identity verification, server-assigned roles and ownership checks. Never trust a browser-supplied role, applicant identity or loan ID for access. The UI redesign does not claim to solve authentication.

The portfolio/warning API currently supplies sample data. A synthetic assessment produces a computed illustrative score. The farmer page has no verified loan-servicing or farm-report connection, so it does not invent a balance, payment date or live weather. Tool responses must retain source and availability information.

## Implementation plan for Gemini

### 1. Prove a short native-audio conversation

Create a separate voice session controller/hook; keep the text assistant intact. First prove microphone input, spoken output and interruption with synthetic data, then add project tools. Make the model configurable in the backend; validate the current preview identifier and SDK examples against the live docs.

Suggested additions:

- `frontend/src/hooks/useSaathiVoice.ts`: lifecycle, media ownership, reducer and cleanup.
- `frontend/src/components/SaathiVoiceSession.tsx`: voice panel using the current navy/violet styling.
- `tvs_lending/api/voice_sessions.py`: authenticated session creation, token issuance, quota enforcement.
- `tvs_lending/assistant/tools.py`: allowlisted, authorized read-only project tools.
- Configuration: `SAATHI_VOICE_PROVIDER`, `GEMINI_LIVE_MODEL`, server-only `GEMINI_API_KEY`, maximum session length and concurrent sessions. Names are proposed; inspect existing settings first.

Do not put an API key into a `VITE_` variable. If using a server relay, authenticate its WebSocket and restrict origins. If using direct ephemeral-token streaming, enforce business-tool calls through the backend; browser-side tool arguments are untrusted.

### 2. Implement a conversation, not just dictation

Use explicit states: idle → requesting permission → connecting → listening → thinking → speaking, with interrupted, reconnecting, error and ended states. A user starts the microphone deliberately. Show captions, mute, end-call and text fallback; do not start recording merely because the chat opens.

Support automatic turn completion, interruption while the assistant speaks, and a small playback buffer. On interruption, stop scheduled playback immediately and discard obsolete audio chunks. Track turn IDs so late tool responses cannot speak over a newer turn. Stop every media track, playback node and network session when the user ends voice, signs out or closes the voice panel. Handle tab/background transitions explicitly.

Use an AudioWorklet or equivalent supported streaming capture for the model's PCM format. The current MediaRecorder WebM upload cannot simply be forwarded as PCM. Keep echo cancellation/noise suppression where supported and test with speakers as well as headphones. Browser permission errors, silence, busy microphone, connection loss and quota exhaustion need distinct messages and a working typed fallback.

### 3. Ground responses in project tools

Proposed read-only tools: `get_document_checklist`, `explain_current_assessment`, `get_authorized_application_status`, `get_authorized_repayment_schedule`, and an officer-only portfolio/risk summary. Only expose endpoints that actually exist and return useful data; return `unavailable` for missing integrations. Separate public education from private account access.

A tool result should include `status`, `source`, `as_of`, `is_sample`, and `data`. Pass minimal context. Never let conversational style generate balances, approval status, weather, mandi rates or loan terms. Do not permit payment, restructuring, approval or outbound outreach tools in this first voice release.

### 4. Make it personable

Suggested instruction draft (project design, not copied provider text):

> You are Krishi Saathi, a warm, practical farm-lending companion. Speak in the user's chosen language and follow their language changes. Keep most answers to two or three short sentences, then ask one useful question. Sound conversational rather than reading a document. Light humour is welcome when the user is relaxed; keep it occasional and never joke about debt, distress, identity, accents or crop losses. Do not pretend to be human. Explain difficult terms with a simple example. Obtain account facts from authorized tools. If information is missing, say what is missing and help with the next step. An assessment is not a final loan approval.

For example, “We can keep the paperwork from growing faster than the crop. Let’s start with your land record.” Treat humour as optional; match the user's tone, not a fixed joke schedule. Evaluate with actual speakers rather than assuming that translated humour works.

### 5. Acceptance tests and delivery

1. Twenty scripted conversations in English and Hindi, including code switching, names, rupee amounts, dates and interruptions. Record correctness and observed latency, not only a successful connection.
2. No-speech, denied permission, unavailable microphone, noisy input, weak network, expired token, quota exhaustion and backend downtime. Each must offer a recoverable state or text fallback.
3. Interrupt ten spoken answers; confirm obsolete audio never resumes. End a call and verify microphone capture stops.
4. Ask for a nonexistent loan balance and another user's loan. The assistant must not invent data or bypass authorization.
5. Farmer and admin tools must have different server-enforced access; changing localStorage must not grant access.
6. Verify captions, keyboard controls, readable focus states and 390 px mobile layout. The farmer top CTA must open the same conversation as the floating launcher.
7. Set an initial engineering target of median under two seconds from end of speech to first reply audio on the demo network; this is a target to measure, not a provider guarantee. Report P50/P95, hardware, language and connection used.
8. Deliver `.env.example` without secrets, a setup guide, pinned dependencies/model IDs, automated lifecycle/authorization tests and a short demo script. Re-run `npm run build` and relevant backend tests.

Do not switch on paid billing automatically. For cost reporting, use measured audio/text token totals and the chosen model's rates; conversation minutes alone do not determine native-audio token cost. Keep sessions short for the free prototype and show a useful fallback when its quota is reached.

## Scope of this handoff

The two portal redesigns are implemented separately. This file is research plus a concrete build plan for Gemini; continuous conversational voice, new cloud accounts and production OAuth have not been implemented as part of the UI task. Provider availability and regional-language quality still require account-level and device-level validation.
