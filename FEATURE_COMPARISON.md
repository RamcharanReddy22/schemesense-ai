# SchemeSense AI vs myScheme.gov.in — Feature Comparison

## PHASE 1: myScheme Research Summary

**myScheme (myscheme.gov.in)** is the GoI's official national platform for scheme discovery.
- Core user flow: category browse → dropdown-based eligibility form → static results list → external ministry link
- Data: 3,000+ central + state schemes, ministry partnerships, NIC-hosted
- Known gaps (validated):
  - Rigid multi-step dropdown form — no conversational/adaptive flow
  - No offline mode or PWA
  - No proactive notifications or deadline alerts
  - Limited Hindi/regional language support; zero voice interface
  - No document readiness tracker or gap analysis
  - No life-event bundling (e.g. "I just had a baby")
  - Passive search-only — user must know what to look for

---

## PHASE 2: Feature Comparison Table

| Feature | myScheme Has It? | We Have It? | Evidence (file/component) | Effort to Improve | Priority |
|---|---|---|---|---|---|
| **1. Conversational / adaptive eligibility flow** | ❌ Rigid dropdown form only | ✅ Partially — step-by-step card-choice wizard with live rule engine | `EligibilityWizard.jsx` (937 lines), `useMemo` filter at L64-120 | Medium — add life-event entry point + dynamic follow-up questions | **HIGH** |
| **2. Offline-first (PWA, cached data, sync queue)** | ❌ None | ✅ Partially — VitePWA configured, Service Worker registered | `vite.config.js`, `src/main.jsx`. No offline eligibility check, no sync queue | Medium — add offline detection banner + localStorage sync queue | **HIGH** |
| **3. Proactive scheme matching + deadline alerts** | ❌ Passive search only | ❌ Not implemented | No component exists | Medium — Web Push / localStorage-based notification scheduler | **HIGH** |
| **4. Document readiness tracker** | ❌ None | ✅ Partially — document list shown in SchemeDetails tab | `SchemeDetails.jsx` L8-65 (checklist state), `schemes.json` has `documents[]` array | Low — convert existing doc list into interactive checklist with % progress | **HIGH** |
| **5. Regional language + voice-first interface** | ⚠️ Hindi partial, no voice | ✅ Partially — EN/HI/TE UI, voice search in HeroSection only | `localization.js` (EN/HI/TE full), `HeroSection.jsx` L17 (isListening state) | Medium — extend voice to Wizard; add voice-read scheme results | **MEDIUM** |
| **6. Life-event bundling** | ❌ None | ❌ Not implemented | No component exists | Medium — new component with event → scheme bundle mapping | **HIGH** |

---

## Priority Summary
- **HIGH (implement now):** Features 1, 2, 3, 4, 6
- **MEDIUM (implement now):** Feature 5
- **LOW (skip for hackathon):** None — all features are HIGH or MEDIUM

---

*Generated during Phase 2 codebase audit. All evidence citations reference actual files in `/src/`.*
