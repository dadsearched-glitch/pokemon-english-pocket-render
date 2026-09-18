<<<<<<< HEAD
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


## Learning and sound


## Cards and battles


## Assets and privacy

Pokémon names/art belong to their respective owners. Card images load from TCGdex and battle art from the PokeAPI community sprite repository as in the prior release; external availability does not grant redistribution rights. The game has no analytics, payments or chat of its own.

## Verification

Run:

```bash
npm test
```

The packaged v7 source passed 25/25 automated tests and a clean build on 2026-09-15. See `VALIDATION_V7.md` for the exact scope and the unverified real-device areas. Do not interpret automated or desktop CSS checks as completed physical-tablet or microphone testing.
=======
# Pokémon English Pocket

Render deployment repository for the same-origin game and multiplayer signaling service.
>>>>>>> origin/main
The packaged v7 source passed 25/25 automated tests and a clean build on 2026-09-15. See `VALIDATION_V7.md` for the exact scope and the unverified real-device areas. Do not interpret automated or desktop CSS checks as completed physical-tablet or microphone testing.
