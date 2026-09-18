> Latest review update (2026-09-15): v7 now uses Molly only at the user's request. Mitchell selection/audio removed; old voice preferences migrate to Molly without changing profile records. See V7_BROWSER_REVIEW.md for current evidence. Earlier dual-voice statements below are historical.

# Pokémon English Pocket — v7 upgrade

Date: 2026-09-15 NZ time. This file describes the v7 source in this folder. `UPGRADE_V6.md` is retained as historical implementation context.

## What changed in v7

### 1. Up to five local trainer profiles

- A new install starts with no fixed Tony/Kai buttons. The first screen asks for a trainer name and a default Year 3 / 4 / 5 level.
- Up to five profiles can be created. Each profile has its own cards, duplicates, XP, packs, Pokédex/collection, battle state/history, and learning state.
- Within each profile, Year 3 / 4 / 5 course progress remains independently banked as in v6.
- No PIN, GPT login, server account, analytics, or cloud sync was added. Saves remain browser `localStorage`.
- The normal and `?test=1` parent-test stores remain separate.

### 2. v6 save migration is in-place and preservation-first

The storage key stays `pocket-english-v1` so a deployed v6 browser save can be recognised. The save schema upgrades from version 1 to version 2 without changing the existing Tony/Kai profile keys.

On migration:

- Tony remains available and defaults to Year 4.
- Tony's pre-v6 learning snapshot remains preserved in Year 5 and `legacyLearningV5` exactly as the v6 learning-level migration intended.
- Kai remains available and defaults to Year 3.
- Cards and duplicates, XP, packs, pending pack reveal, collection, battle, wins/activity, sound/voice/effects settings stay outside the per-year learning bank and are retained.
- Existing Year 3 / 4 / 5 progress already created by v6 is not reset.

No profile delete control was added in v7, to avoid introducing an accidental data-loss path while the storage model changes.

### 3. EX-or-higher pack reveal presentation

The pack odds and five-card draw rules are unchanged. The visual reveal now gives a stronger room effect only to EX cards (including EX special-art and Crown EX):

- type-coloured background glow and pulse
- radiant rings and glitter
- brighter card-frame aura and rays
- stronger Crown treatment

Non-EX cards keep the quieter existing reveal. This changes presentation only, not draw probabilities or rewards.

### 4. Battle VFX 2.0 without battle-rule changes

The existing cinematic outcome lock remains: battle damage/reward is determined once by the model, then the screen animation plays with input locked.

Full effects now distinguish every current battle type visually:

- Electric — branching bolt/flash treatment
- Fire — ember/flame burst
- Water — wave and droplets
- Grass — leaf sweep
- Psychic — expanding rings
- Dark — slash and dark flash
- Metal — flying shards
- Dragon — energy beam
- Fighting — impact/fist bursts
- Normal — star impacts

Special attacks get stronger lunge/zoom/impact presentation and retain the v6 cut-in. Reduced effects remains available and respects the existing motion-reduction behavior. Energy costs, attack values, weakness multiplier, guard, switching and +20 XP victory reward are unchanged.

### 5. Tablet-wide layouts

The old phone-centred `max-width: 520px` presentation is retained for small screens, but at 760px+ the app can use up to 1080px. The home screen, collection, profile picker and especially battle use wider tablet compositions. Battle becomes a wide arena plus side console at tablet widths, while learning text stays bounded for readability.

### 6. Adaptive review: independent recall vs assisted success

The existing 1 / 3 / 7 / 14 / 30 day spaced-review schedule remains. v7 adds recall-quality tracking:

- independent correct recall
- correct after one or more failed attempts / answer help
- misses

A word answered correctly only after help is not immediately promoted as mastered. In Vocabulary and Review it is appended once to the end of the same session for a clean retry, with the Korean meaning hint removed on that retry. A later clean success advances the normal spaced-review level.

### 7. Parent learning snapshot

Settings now shows a lightweight summary for the active Year:

- Level 3+ strong words
- words currently due for review
- words that have needed help
- counts for independent recalls, assisted answers and misses

This is a local summary of game practice, not a diagnostic assessment or a claim of official NZ school-English coverage.

### 8. Collection discovery goals

The 310-card catalogue now has visible discovery milestones at 25 / 50 / 100 / 150 / 200 / 250 / 310 unique cards. These are cosmetic progress goals only: they do not add XP, packs, or change pack odds.

## Deliberately unchanged

- 72 units / 288 core words and the existing Year 3 / 4 / 5 course content
- supplied-sentence-only Speaking
- no phoneme-level pronunciation grading
- Molly / Mitchell fixed NZ neural MP3 inventory
- current pack probabilities and guarantees
- current battle model and rewards
- no PIN/login/cloud account
- card and battle artwork sources/provenance

## Files most affected

- `web/model.js` — dynamic profiles, v1→v2 save migration, recall-quality metadata
- `web/learning-level.js` — generic per-profile Year 3/4/5 initialization and preserved migration
- `web/app.js` — profile creation UI, EX reveal presentation, parent summary, discovery goals, adaptive retry wiring
- `web/course.js` — retry questions and no-hint clean retry
- `web/cinematic.js` — type-specific VFX and stronger camera/impact staging
- `web/v7.css` — v7 profile/reveal/VFX/tablet styles
- `web/sandbox.js` — generic v7-compatible parent-test save
- `tests/v7.test.mjs` — v7 migration/profile/review/presentation checks

See `VALIDATION_V7.md` for what was and was not actually verified.
