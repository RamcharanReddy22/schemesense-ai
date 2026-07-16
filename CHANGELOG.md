# SchemeSense AI — CHANGELOG

---

## [2.1.0] — Phase 3 Feature Sprint — 2026-07-16

### Added: Feature 6 — Life-Event Bundler (`LifeEventBundler.jsx`)
**What:** A new section on the home page with 8 life-event cards (e.g. "I just had a baby", "I lost my job", "I'm a farmer in distress"). Clicking any card instantly filters the scheme catalog for all relevant schemes across multiple categories — no category browsing required.

**How to demo:** Open the home page, scroll below the hero section. Click "I'm a student needing aid" → you'll instantly see the catalog pre-filtered with all education + scholarship schemes. Click "I just had a baby" → get maternity, child nutrition, and girl child savings schemes bundled together.

**Why it wins vs myScheme:** myScheme forces dropdown category browsing. This is zero-cognitive-load discovery.

---

### Added: Feature 4 — Document Readiness Tracker (`DocumentTracker.jsx`)
**What:** Replaced the plain document list in `SchemeDetails.jsx` (Process & Documents tab) with a rich, persistent interactive tracker. Features an animated SVG progress ring showing % readiness, clickable checkboxes for each required document (state persists across browser sessions via localStorage), and a "Ready to Apply!" status when 100% complete.

**How to demo:** Open any scheme → go to "Process & Documents" tab → tick off 2-3 documents → notice the ring animate to your progress percentage → close the modal → reopen the same scheme → your checkboxes are still ticked (localStorage persistence).

**Why it wins vs myScheme:** myScheme just lists documents. It never tells you which ones you already have or how close you are to applying.

---

### Added: Feature 3 — Proactive Scheme Alerts (`SchemeAlerts.jsx`)
**What:** A `useSchemeAlerts()` hook + two components:
1. `SubscribeButton` — added to every `SchemeDetails` modal header. Click it to subscribe to deadline alerts for that scheme.
2. `AlertBanner` — shown at the top of the app (below header) whenever any subscribed scheme has a deadline within 7 days. Banner includes scheme name, days remaining, a direct "View" link, and a dismiss button.

**How to demo:** Open any scheme → click the "🔔 Notify Me" button → banner will appear at top of page with "X days left" countdown. To simulate urgency for a demo: open browser console and run `localStorage.setItem('scheme_alerts_v1', JSON.stringify([{id:"national-merit-scholarship",title:"National Merit Scholarship",deadline:new Date(Date.now()+86400000*2).toISOString()}]))` then refresh.

**Why it wins vs myScheme:** myScheme is 100% passive. This is the first proactive welfare notification system in the category.

---

### Added: Feature 2 — Offline Detection + Sync Queue (`OfflineBanner.jsx`)
**What:** A `useOnlineStatus()` hook that listens to real browser `online`/`offline` events. When offline: shows a dark blue banner reassuring the user that all 124 schemes are cached and available (via the existing VitePWA Service Worker). When reconnecting: shows a green "You're back online!" confirmation. Also exports `queueOfflineAction()` for logging "apply later" intents in localStorage for future sync.

**How to demo:** Open the site → open Chrome DevTools → Network tab → change throttling to "Offline" → notice the banner appear immediately. Switch back to "Online" → see the "You're back online!" banner flash.

**Why it wins vs myScheme:** myScheme shows a blank error page when offline. SchemeSense serves full cached content.

---

### Modified: `SchemeDetails.jsx`
- Imported `DocumentTracker` and `SubscribeButton`
- Replaced legacy static document list with `<DocumentTracker />` in the "Process & Documents" tab
- Added `<SubscribeButton />` in the modal header action row

### Modified: `App.jsx`
- Imported `LifeEventBundler`, `OfflineBanner`, `AlertBanner`, `useOnlineStatus`, `useSchemeAlerts`
- Added `LifeEventBundler` between HeroSection and IndiaMap on the home view
- Added `OfflineBanner` and `AlertBanner` immediately after `<Header />`
- Wired `urgentAlerts`, `dismissAlert` from `useSchemeAlerts()`
- Wired `isOnline`, `justCameOnline` from `useOnlineStatus()`

---

## How to Run & Demo Locally

```bash
cd schemeSense_AI
npm run dev
```

Then open: http://localhost:5173

**Demo sequence for hackathon judges:**
1. **Home page** → scroll to see "Tell us your situation" life-event cards → click "I'm a farmer in distress"
2. **Catalog opens** pre-filtered with farmer schemes
3. **Click any scheme** → go to "Process & Documents" tab → tick off documents → watch progress ring animate
4. **Click "🔔 Notify Me"** in the modal header → close modal → banner appears at top
5. **DevTools → Network → Offline** → show the offline banner proving rural resilience
