# Original website restoration — 5 September 2026

Restored the original presentation-style website after feedback that the dashboard replacement changed the product's appearance and removed its landing page. This supersedes the visual direction in UI_UPGRADE_NOTES.md.

## Preserved / restored
- Original video hero, headline, TVS logo, warm #EAE1DF background, navy headings and purple calls to action.
- Original top navigation, four innovation cards, lending pipeline, field examples, underwriting layout, geographic portfolio, stress simulator, early warnings and team footer.
- Original separate Sign In / Create Account page, with a return-to-website link. Existing /signin.html redirect remains compatible.
- Dashboard replacement source retained in WorkspaceApp.tsx as a reference, but no dashboard shell is rendered by the active website.

## Selective changes
- Thin scroll-progress bar, gentle once-per-section reveals, scroll cue and navigation hover underline.
- Softer card shadows and refined borders; original card layouts and colors remain.
- Mobile navigation uses a wider breakpoint to avoid crowding, scrolls on short screens, supports Escape and traps focus.
- Motion respects the reduced-motion preference, including pausing the hero video.
- Krishi Saathi section refreshed as a navy/purple conversation card that opens the newer eight-language assistant. One assistant instance retains the conversation when moving between pages.
- Field example selection now populates the underwriting form; successful assessments pass borrower context to the assistant and farmer services.
- Restored login and underwriting UI use the existing API helper. Network failures no longer create a signed-in account or invent a successful assessment. Missing repayment schedules are stated explicitly. Example data is labeled.
- Corrected the early-warning footer anchor and removed false password-reset/newsletter success claims from the restored components.

## Verification
- Final `npm run build` passed (TypeScript and Vite production bundle).
- `node verify-website.mjs`: landing, separate sign-in and farmer routes render successfully; original section IDs and hero are present, with no sidebar shell on those routes.
- Existing `node ../scratch/verify_ui_api.cjs`: all 8 API-helper tests passed.
- Local preview responds at http://localhost:5173; its App module serves WebsiteApp.
- Browser screenshot/interaction QA was not run. Video and font availability depend on the original external asset hosts. Existing illustrative portfolio, stress-model and backend limitations remain; this is a local UI restoration, not a production backend migration.
