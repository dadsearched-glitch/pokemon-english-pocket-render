# Year 3 / Year 4 / Year 5 and cinematic battles — v6

## Learning design

Kai defaults to Year 3 and Tony to Year 4. Each profile can select any of the three years in Settings. Each year has 24 units, 96 unique assessed core words and the same six mission types. There are 288 distinct core words across all three years; the supplied Year 4 candidate list needed no substitutions. Shared themes connect everyday school, family, community, environment and reflection tasks.

| Course | Vocabulary choices | Reading and reasoning |
|---|---|---|
| Year 3 | Korean meanings with English definitions taught first | Everyday requests, sequence, a simple reason or clue |
| Year 4 units 1–8 | Korean meanings | Concrete decisions and reasons |
| Year 4 units 9–16 | Simple English; Korean hint initially open | Connecting ideas and finding a supporting clue |
| Year 4 units 17–24 | Simple English; optional Korean hint | Comparing choices, checking a plan and explaining a next step |
| Year 5 | English meanings; optional Korean hint | Inference, evidence, sources, alternative explanations and reasoned proposals |

Year 4 has original stories, two listening/speaking sentences and two comprehension questions per unit. One or two additional exposure expressions have contextual glossaries and are not added to the assessed/review pool. Year 5 has two supported exposure expressions per unit from its existing stories. Every reading lesson can open Word support. Speaking remains repetition of the two supplied sentences only; no free-response or phoneme scoring was added.

Year 5 core word identities and speaking sentences stay stable. Definitions were simplified for precaution, counterargument, transferable, contradict, assumption, significance, responsibility, infer, perspective, conservation, sustainable, justify and evaluate. Precaution remains in the concrete weather-preparation context (unit 4); significance is supported through family customs (16); assumption/contradict remain in an evidence-checking task (21); counterargument and transferable stay late (23–24). This keeps useful challenge with assistance and preserves existing word-history keys. Nine short context repairs explicitly reinforce otherwise weakly represented core words: Year 3 units 2/8/9/16/17/20 and Year 5 units 7/20/23. Existing exercise indices and answer choices remain valid.

This is an original supplementary English course, not the complete NZ school curriculum or an official mastery assessment. The design uses explicit vocabulary instruction, supported access to texts and comprehension/inference informed by the Ministry's [English Phase 1](https://newzealandcurriculum.tahurangi.education.govt.nz/5637288579.p) and [English Phase 2](https://newzealandcurriculum.tahurangi.education.govt.nz/nzc---english-phase-2/5637238346.p) guidance, reviewed September 2026. Year placement is a selectable learning preference, not a diagnosis.

## Saving and compatibility

`web/learning-level.js` stores snapshots at `courseProgress.year3/year4/year5`. Active legacy fields remain the projection used by the existing engine. `persist()` synchronises that projection before writing localStorage. Switching snapshots the old year and restores the selected year. Per-year fields include current unit, completed missions, partial question state, review scheduling, mistakes, completed-unit records and speaking counters.

On first v6 migration, the exact pre-v6 learning snapshot is kept in `legacyLearningV5`. Existing Tony learning goes into Year 5; Kai learning goes into Year 3. Tony's new Year 4 starts at unit 1. Cards, duplicates, XP, earned packs, pending reveals, battles, wins, aggregate mission count, daily activity and voice/sound preferences remain outside the year bank. Completing the course offers an explicit next-year choice; it never silently moves the learner. JSON backups include every year. Original and parent-test saves stay separate.

## Presentation

The completed v5 illustrated backgrounds and UI are retained. `web/cinematic.js` presents committed battle results through zoom/lunge, speed lines, type particles, impact/shake, floating damage, HP animation, EX cut-ins, free-switch animation and opponent transitions. The original model applies damage and rewards once before animation. Input is locked during the sequence; cancellation finishes presentation without replaying model actions. Full and Reduced settings are available; an unset preference follows the device's reduced-motion setting. The victory view shows the team and saved reward.

No combat balance, energy costs, weaknesses, pack odds or catalogue entries were changed. This is an original web presentation inspired by arcade battle excitement; it does not reproduce an official Ga-Olé engine or cinematic assets.

## Audio, source and access

625 fixed prompts per voice / 1,250 MP3s, including retained legacy recordings. Molly and Mitchell remain selectable; no device TTS or API key is needed for playback. Browser sentence recognition remains optional and provider-dependent with its existing consent and explicit self-check fallback.

Editable source is `web/`; `node build.mjs` copies it to deployable `dist/`; `node server.mjs` serves that build at localhost:4173. No npm dependency is required to play/build. Audio generation is incremental and requires Python plus edge-tts only when adding content. Runtime card art remains externally referenced as before.

The user cancelled PIN access before publication. Final output is a public static game with no PIN, app account or GPT login. PIN code and the two temporary production secret values were removed. No source ZIP password is used. Browser save data remains local; knowing the public link does not expose another browser's progress.
