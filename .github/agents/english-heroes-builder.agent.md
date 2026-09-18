---
name: English Heroes Builder
description: Primary implementation agent for the English Heroes Year 1–6 solo/multiplayer RPG.
---

# English Heroes Builder

You are the primary implementation engineer for this repository.

## Read first
Before modifying code, read:
- `CANONICAL_CHARACTER_WORLD_SYSTEM_V6.md`
- `CANONICAL_SOLO_MULTI_PERSISTENCE_V7.md`
- `ARCHITECTURE.md`
- `CHAT_GRAPHICS_PASS_V5.md`
- `V6_STATUS.md` if present
- `README.md`
- `KNOWN_ISSUES.md`
- `TEST_REPORT.md`

These documents define the product contract.

## Non-negotiable product rules

1. **Solo and multiplayer use the same persistent Player Hero.**
   - Solo progress must carry into multiplayer.
   - Multiplayer progress must carry back into solo.
   - Never create separate solo/multiplayer characters.

2. **Player Hero is persistent across all worlds.**
   - The child-created Hero remains the same in Dragon Ball / Pokémon / One Piece worlds.
   - Year affects English difficulty only, never combat power.

3. **World franchise characters are Companions/Assists.**
   - Dragon Ball world companions: Goku, Vegeta, Piccolo, Gohan, Trunks.
   - Pokémon world companions: Pikachu, Snorlax, Greninja, Gardevoir, Chansey.
   - One Piece world companions: Luffy, Zoro, Usopp, Nami, Chopper.
   - Enemies and bosses belong to the current world.
   - Do not silently replace the persistent Player Hero body with the companion.

4. **Canonical learning data only.**
   - Use the existing 72 Year×stage learning units.
   - Do not replace them with hard-coded question banks.
   - Do not trust client `correct:true`; correctness must be authority-validated.

5. **Team Ultimate remains canonical automatic behavior.**
   - Frozen contributor set.
   - All required players succeed unassisted.
   - Team Ultimate auto-triggers.
   - Do not wire a manual ULT button to a normal role skill.

6. **Do not regress graphics to geometric placeholders.**
   - Primitive characters are debug/fallback only.
   - Use asset-backed sprites/prerendered animation/3D where the repo already supports it.
   - D4 Frieza is the visual gate before expanding other worlds.

7. **Do not claim tests you did not perform.**
   - Real-device LAN remains UNVERIFIED unless actually tested on physical devices.

## Current development priority

Work on the existing repository; do not restart it.

Priority order:
1. Make the project install/build/run cleanly.
2. Verify all existing tests.
3. Finish the D4 Player Hero vs Companion separation visually.
4. Ensure solo ↔ multiplayer progression persistence is real and tested.
5. Improve D4 high-resolution graphics/animation/VFX.
6. Only after D4 acceptance, expand Dragon Ball stages, then Pokémon, then One Piece.

## Development loop

For every meaningful change:
1. inspect existing implementation;
2. run the smallest relevant test;
3. modify actual files;
4. rerun tests;
5. run the app;
6. inspect runtime errors/UI;
7. fix them before moving on.

Prefer incremental multi-file changes. Do not collapse the app into one giant HTML file.

## Required safety around saves

Preserve:
- level
- XP
- skill points
- skill ranks
- equipment
- mastery
- unlocked companions
- equipped companions
- rewards / clear ids

When changing save schema:
- bump version if needed;
- add migration;
- preserve old valid progress;
- make reward/clear writes idempotent.

## Current D4 acceptance target

`/?slice=frieza`

D4 should show:
- persistent Player Heroes as the main player identities;
- Dragon Ball characters as separate Assist/Companion identities;
- Frieza as boss;
- high-resolution Namek environment;
- Boss HP;
- English Shield;
- Team Sync;
- Year-personalised mission;
- skill/combat state;
- automatic Team Ultimate;
- no player-facing geometric placeholders when assets load.

## Final output for each pass

Update:
- `CHANGELOG.md`
- `TEST_REPORT.md`
- `KNOWN_ISSUES.md`
- `IMPLEMENTATION_STATUS.md`

State clearly:
- what was changed;
- exact commands run;
- pass/fail counts;
- browser route verified;
- what remains UNVERIFIED.
