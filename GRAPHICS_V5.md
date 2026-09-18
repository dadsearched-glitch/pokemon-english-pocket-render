# Illustrated adventure upgrade — v5

The supplied comparison image was the visual direction. This release implements an illustrated 2D mobile web presentation rather than embedding that composite image as the interface.

## Changes

- Home: illustrated valley, larger existing Pokémon companion artwork, speech bubble, compact progress/reward panel, tactile learning/pack/battle controls. Main learning and game entry points remain near the first mobile viewport.
- Map: 24 actual course units across six navigable regions, four nodes per region. Current/completed/locked state derives from existing profile progress. Selecting a node previews its vocabulary; entering uses the existing course progression checks. All-unit directory remains available. Parent sandbox can open any unit.
- Learning: opaque cream panels, improved text sizes, consistent vector icons, clear blue answer controls and readable teaching cards over subdued scenery. Listening answers are not exposed through decorative pictures.
- Rewards: illustrated booster wrapper, gold rays and particles, revised card framing and foil presentation. Large collection grids use a static foil treatment until interaction to limit continuous animation.
- Battle: illustrated forest arena, HP panels, type-coloured impact/ring/beam animations and differentiated move buttons. Motion is disabled when the device requests reduced motion.
- Profile/settings/navigation use matching surfaces and icons. A dedicated Map tab is added.

All card definitions, course content, speech matching, pack probabilities, audio files and save schema remain unchanged. `app.js` next-unit routing now follows the existing model's route, including the course-end screen.

## Assets and provenance

Built-in imagegen generated exactly two original environments, once each, without retries. The files are production assets included in dist/art, not references to temporary generated-image locations.

- `dist/art/adventure-valley.png`: 1024×1536, 3,259,577 bytes. Prompt: original polished storybook adventure valley, winding trail, hilltop school, turquoise coast, mountains and lush foliage; portrait composition; no characters, text, logos or UI.
- `dist/art/forest-arena.png`: 1536×1024, 3,018,369 bytes. Prompt: matching illustrated forest arena with a clean grassy ellipse, framing trees, waterfall, blue mountains and golden sunlight; landscape composition; no characters, text, logos or UI.

Exact generated source prompts and outputs were handled by the image asset task. These briefs document the delivered design requirements. Existing Pokémon artwork still uses the previously configured PokeAPI/TCGdex runtime sources. No third-party character-image library was downloaded or bundled for this release.

The two scenery files total about 6 MB. Only backgrounds needed by the current view are referenced by its styling; repeated uses are browser-cached. They are not eagerly added to the service worker core list, so optional art downloads cannot block core installation. Scenery has CSS colour/gradient fallback. Physical-phone loading performance has not been benchmarked.

## Validation scope

Only newly changed representative UI behavior was checked. Earlier course, speech-adapter, audio inventory and pack/battle full-flow tests were not repeated. See VALIDATION.md for the v5 record and prior history.
