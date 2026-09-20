# Known issues

- Real-device LAN validation (two or four physical devices) is **UNVERIFIED** in this environment.
- Cloud deployment and Render smoke testing are **UNVERIFIED**; the production entry point is wired to `npm run together`.
- Relay rooms remain in-memory and expire on server restart; no durable room history is intended.
- Browser-specific reconnect UX still needs a physical-device pass.
# Phase B/C verification note (2026-09-20)

- Playwright browser/UI checks are unavailable in this checkout because the `playwright` package is not installed; responsive overflow and touch-target behavior were implemented via CSS breakpoints but remain **UNVERIFIED** in a browser.
- The Phase B/C structural redesign was validated by syntax, unit tests, build, and diff checks; live visual confirmation of the new solo arena, Together card grid, and raid layout remains **UNVERIFIED** without Playwright.
- Real-device LAN validation (two or four physical devices), reconnect UX, and cloud deployment remain **UNVERIFIED**.
