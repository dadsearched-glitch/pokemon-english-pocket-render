> Latest review update (2026-09-15): v7 now uses Molly only at the user's request. Mitchell selection/audio removed; old voice preferences migrate to Molly without changing profile records. See V7_BROWSER_REVIEW.md for current evidence. Earlier dual-voice statements below are historical.

# Pokémon English Pocket — v7

Family fan game for supplementary English practice. This v7 source continues the published v6 without changing the existing course, pack economy or battle rules.

## Current integrated edition

Version 7 adds up to five named local trainer profiles, preservation-first v6 migration, EX-or-higher reveal effects, visibly different type attacks and stronger camera impact, tablet-wide layouts, adaptive no-hint retry after assisted answers, a small parent learning snapshot and collection discovery goals. No PIN or GPT login is required.

Read `UPGRADE_V7.md` first for the new behavior, `VALIDATION_V7.md` for actual v7 verification, and `UPGRADE_V6.md` / `VALIDATION.md` for retained historical context.

## Play locally

The ZIP includes a built `dist/`. With Node.js installed:

```bash
node server.mjs
```

Then open `http://localhost:4173`. To rebuild from editable `web/` source, run `node build.mjs` first. No npm package installation is required for play/build. See `RUN_LOCAL_KO.md`.

## Profiles and storage

- A new install starts by creating a profile: name + default Year 3 / Year 4 / Year 5.
- Up to five profiles are supported.
- Each profile keeps its own cards, duplicates, XP, packs, collection, battle and learning data.
- Each profile separately banks Year 3 / 4 / 5 learning progress.
- Existing v6 Tony/Kai browser saves use the same storage key and migrate in place. Tony's preserved Year 5 history remains available while his default is Year 4; Kai remains Year 3.
- Saves are local browser `localStorage`. There is no cloud account or automatic device-to-device sync. Settings export/restore remains the portable backup path.
- Normal mode and `?test=1` parent test mode use separate stores.

## Learning and sound

- 24 units per year × 3 years, 96 distinct core words per year = 72 units / 288 core words.
- Each unit follows Vocabulary → Listening → Reading → Sentence → Speaking → Review.
- Speaking remains supplied-sentence-only. Browser `en-NZ` recognition can compare the recognised text to the supplied sentence, but no phoneme-level pronunciation score is claimed. Explicit self-check remains available.
- 1,250 fixed MP3s (625 each for Molly and Mitchell NZ neural voices) are bundled. Existing playback needs no live TTS service.
- The existing 1 / 3 / 7 / 14 / 30 day spaced review remains. v7 distinguishes independent recall from success after help and adds one clean no-hint retry at the end of Vocabulary/Review after an assisted answer.
- The parent snapshot is a game-practice summary, not a diagnostic assessment or a claim to cover the complete NZ school English curriculum.

## Cards and battles

- A1 Genetic Apex 286 card prints + 24 preserved original cards = 310 catalogue entries.
- Existing five-card pack odds and guarantees are unchanged. EX cards now get the stronger v7 reveal room; Crown EX receives the strongest treatment.
- Discovery milestones at 25/50/100/150/200/250/310 unique cards are cosmetic goals only and do not change XP or packs.
- Battle rules remain the independent English-game rules. Full effects now give Electric, Fire, Water, Grass, Psychic, Dark, Metal, Dragon, Fighting and Normal visibly different attack forms. Reduced effects remains available.

## Assets and privacy

Pokémon names/art belong to their respective owners. Card images load from TCGdex and battle art from the PokeAPI community sprite repository as in the prior release; external availability does not grant redistribution rights. The game has no analytics, payments or chat of its own.

## Verification

Run:

```bash
npm test
```

The packaged v7 source passed 25/25 automated tests and a clean build on 2026-09-15. See `VALIDATION_V7.md` for the exact scope and the unverified real-device areas. Do not interpret automated or desktop CSS checks as completed physical-tablet or microphone testing.
