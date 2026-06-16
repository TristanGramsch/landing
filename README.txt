tristan.systems

A terminal-themed personal landing page (no frameworks) for essays and small technical projects.

What you can visit

Routes are implemented client-side (single-page app behavior via pushState).

- / — home (boot typing animation + entry points)
- /sociological — entry point for sociology/ideas
- /sociological/government-flexibility — “Government flexibility” essay
- /sociological/ditto-pitch-80 — “Ditto-Pitch-80” (password-gated)
- /technological — entry point for technical work
- /technological/optoelectronica — “Optoelectrónica Icalma” project page
- /technological/system-health — shows the latest run of /api/health-log

Text animates when scrolled into view: scramble → final.

Local development

npm install
npm run dev

For production builds:

npm run build
npm run preview

Opinionated code organization (general → specific)

1) App wiring and behavior
- src/main.js: boot flow, routing dispatch, navigation + analytics events, and event listeners.

2) Routing rules
- src/router.js: ROUTES, path normalization, and route lookup.

3) UI templates
- src/routes.js: HTML template generators for each route.

4) Content and parsing
- src/content.js: loads raw text and parses it into structured sections.
- src/content/*.txt: site essays/projects stored as plain text.

5) Reusable “effects” / integrations
- src/lib/animation.js: typeInto() helper.
- src/lib/scrollTextRerender.js: scroll-triggered scramble → final text effect.
- src/lib/audio.js: selection sound.
- src/lib/analytics.js: Plausible pageview + Time on Page.
- src/lib/health.js + src/lib/healthTransport.js: /api/health-log fetch and UI initialization.
- src/lib/dittoGate.js: password gate + the “twitch” effect while locked.

Content authoring

To edit an essay:
1. Update the corresponding file under src/content/ (plain text).
2. If you change the structure of “Government flexibility”, ensure the section headings still match the parser’s expected strings in src/content.js.

The “Government flexibility” parser looks for these exact headings:
- The pains of inflexibility at local public health
- Incentivizing flexibility at local public health

System health log

The backend for this page is in vite.config.js:
- GET /api/health-log reads ~/.local/state/stack-health.log
- It extracts the latest ############ Stack Health Check ... run
- It strips ANSI escape sequences so the browser renders it cleanly

The frontend integration is in src/lib/health.js (called from src/main.js).

Security note (Ditto gate)

/sociological/ditto-pitch-80 is gated client-side.

- The unlock password is hardcoded in src/lib/dittoGate.js.
- Unlock state is stored in sessionStorage.

This is obfuscation/privacy-by-convention, not cryptographic security.
