> Latest review update (2026-09-15): v7 now uses Molly only at the user's request. Mitchell selection/audio removed; old voice preferences migrate to Molly without changing profile records. See V7_BROWSER_REVIEW.md for current evidence. Earlier dual-voice statements below are historical.

# Pokémon English Pocket v7 — validation record

Date: 2026-09-15 NZ time

This validation is change-focused. Earlier v4/v5/v6 evidence in `VALIDATION.md` was not repeated unless v7 changed the relevant path.

## Automated model/content regression

Command: `npm test`

Result: **25 / 25 tests passed**.

The suite includes the retained catalogue/course/speech/battle checks plus v7-specific checks for:

- blank new install and creation of up to five named profiles
- independent default Year 3 / 4 / 5 selection
- rejection of a sixth profile
- v6 Tony/Kai save migration to schema v2
- preservation of Tony Year 5 learning snapshot
- preservation of Tony cards, XP, packs, ongoing battle and sound/voice/effects settings
- switching Tony back to Year 5 after migration and restoring his saved unit state
- assisted recall staying due instead of being promoted as mastered
- same-session clean retry being appended, with the hint removed
- EX-only strong reveal gate
- visual implementation branches for all ten current battle types
- tablet-wide stylesheet breakpoint and width rules
- retained pack guarantees, battle costs/damage/switching/guard and exactly-once rewards
- fixed audio inventory checks retained by the existing suite

## JavaScript syntax

`node --check` passed for every `web/*.js` and `tests/*.mjs` source file.

## Build and static deploy output

Command: `npm run build`

Result: success. `web/` and `dist/` were compared with `diff -qr` and were identical after the build. The build contains the existing **1,250 MP3** files. `v7.css` and the v7 service-worker cache version are present in `dist/`.

The included Node static server started successfully and returned HTTP 200 for the local root with `curl` on port 4173.

## Chromium CSS/layout engine sample

The container's managed Chromium has a system `URLBlocklist: ["*"]`, so it cannot navigate to the local game URL for an interactive end-to-end visual walkthrough. That limitation is environment-specific and is why this record does **not** claim that the whole v7 UI was visually played through in this container.

The actual v7 stylesheets were nevertheless injected into an allowed blank Chromium document and parsed by Chromium's CSS engine. Sample computed layout checks:

- 390 × 844 viewport: app width ~375px, battle arena 320px, phone single-column battle layout
- 768 × 1024 viewport: app width ~753px, battle arena 520px, two-column battle grid active
- 1024 × 768 viewport: app width ~1009px, battle arena 560px, wider two-column battle grid active
- `color-mix()` and `:has()` support were confirmed in the installed Chromium version
- EX glitter animation properties and type-effect positioning produced valid computed values

This is a CSS-engine/layout sample, not a substitute for playing the whole game in a normal browser.

## Not verified here

The following remain explicitly unverified and should be checked on the children's real devices:

- Tony/Kai's actual tablet performance, heat and long-session feel
- real touch ergonomics across the whole game
- actual child microphone recognition accuracy and browser-specific speech behavior
- every card rarity and every battle type/card combination visually, one by one
- installation and complete offline behavior
- real learning outcomes or teacher assessment of year-level suitability

The package therefore should be treated as **automated/build-validated v7 source ready for user device testing**, not as already device-certified or production-redeployed.
