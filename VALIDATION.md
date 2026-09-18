# Version 6 integration validation — 2026-09-15

## Scope and retained evidence

Continued from deployed v5 e00d6abe56f967af19eea582e2bd317b6d362a3c. Earlier catalogue, full v4 course and v5 graphics validations below were reused rather than repeated. PIN was cancelled by the user before publication; final code/build and production configuration contain no PIN gate.

## New engine/content checks

- tests/v6.test.mjs: legacy Tony Y5/Kai Y3 snapshots, defaults, repeated level switching, partial question preservation, rewards/cards/packs/battle/voice preservation, JSON restore and invalid per-year backup rejection passed.
- Curriculum samples at units 1/9/17/24 in all three years: all six question kinds, distinct choice options, correct graded hints, supplied-sentence-only Speaking and fixed voice files passed. This changed-content check was rerun alone after the final nine short story repairs; migration and combat tests were not repeated.
- Every year has 24 units and 96 unique core words; all 288 are unique across years. Year 4 uses the supplied 96 candidates without substitutions.
- Model full battle: normal hit, enemy hit, switch, charging, specials, victory and exactly-once 20 XP passed.
- Incremental audio generation finished successfully: 625 prompts per voice, 1,250 MP3 files. Existing recordings were reused.

## Browser samples (desktop in-app browser, 390 × 844 viewport)

- Tony default Year 4/Kai Year 3; existing Tony Year 5 Unit 2 restored on switching. Returning to Year 4 resumed Unit 1 question 3 (follow), preserving partial work.
- Year 4 Unit 1 teaching and answer progression; Unit 9 English meanings with initially open Korean hint; Unit 21 English meanings with optional closed Korean hint.
- Unit 9 reading glossary (core + exposure), Molly audio readyState 4 / Playing, and supplied Speaking sentence panel confirmed.
- Year 5 Unit 2 English choices and manually opened Korean hint confirmed. Other early/mid/late content samples are engine checks, not claimed as full UI walkthroughs.
- One complete three-opponent battle: English answers → basic attack → counterattack → switch → three natural charges → EX special → remaining opponents → Victory. Full effects first: Charizard Ember changed Beedrill 80→44 and own HP160→144; input locked during animation. Pikachu switch and EX cut-in observed; Thunder Dash advanced to next opponent. Reduced effects used for the remaining attacks, ending after 10 English questions with XP60→80. Reload retained Victory and 80 XP without paying again.
- No horizontal overflow, broken images or console errors on checked battle/victory views. Victory text contrast was corrected and visually rechecked.
- Normal-game link opened without PIN or GPT login and retained Kai40 XP / 0 cards. This also confirmed normal/test save separation after the new year migration.

## Practical limits

These are mobile viewport tests on a desktop browser, not physical-tablet performance or microphone tests. Real speech recognition, installation and full offline play remain dependent on the device/browser and unverified in this run. Type-particle implementations cover all existing battle types; each individual type animation was not separately walked through. Card images remain external as in v5.

---

## Historical validation (versions below are not the current implementation)
# Version 5 graphics upgrade — 2026-09-14 NZ

## Completed representative checks

- New home, illustrated backgrounds and existing creature images rendered at 390×844 and 360×800 desktop browser viewports. Normal mode shows learning, pack and battle entry points without the parent toolbar. No horizontal overflow in sampled views.
- Parent map: selected Kai unit 4, saw drizzle/forecast/shelter/waterproof, then entered the correct unit. Cards remained available.
- New cream teaching and quiz panels rendered; a correct drizzle answer advanced to forecast. Long vocabulary headers were refined to avoid splitting a final letter beside the audio control.
- Updated pack wrapper rendered, tear-open transitioned to the first saved card (Eevee). Existing five-card transaction tests were not repeated.
- Illustrated battle arena rendered with health bars and existing Pokémon art. Special attack enabled its type-coloured effect class, dealt 65 damage (enemy 80→15 HP), and returned to the question phase. Player health 160→144. The browser reports prefers-reduced-motion: reduce, so animated effects were correctly hidden. The running animation under normal-motion preferences was not visually verified.
- Normal Kai retained 40 total XP and 0 cards. Map showed locked future units; region 2 preview showed Unit 5 with its entry control disabled.
- Collection displayed 310 kinds/60 special art, two-column card art and filters at narrow width. Visible images were loaded; sampled console error log was empty.
- Model, curriculum, speech and audio inventory checks completed for v4 were not rerun because those engines/assets were not changed.

## Limits retained

These are desktop browser views at mobile sizes, not physical-phone tests. Real microphone recognition, actual installation, full offline use and device-specific performance remain unverified. New scenery is about 6 MB total, with normal browser/service-worker caching after use. Initial download performance has not been benchmarked on a phone.

---
# Version 4 sample validation — 2026-09-14 NZ

User requested representative samples and no repetition of completed checks. The historical records below are retained as history, not current content descriptions.

## Completed before this resumption

- Seven targeted tests in tests/course.test.mjs passed: all 48 units and 96 unique core words per trainer; preserving game rewards during course migration; 24-unit progression and reward deduplication; spaced review; varied battle prompts; strict transcript matching; recognition lifecycle with a fake recognition adapter. A narrow progression test passed after the final course-completion condition fix.
- All 904 MP3s (452 prompts in each of two voices) were nonempty. No audio regeneration or repeated audio inventory check during resumption.
- Tony unit 1: all six stages through 60 XP reward screen. Speaking used explicit self-check twice, not real microphone recognition. Mitchell listening playback reached readyState 4 without error, including 0.75× speed.
- Existing sandbox cards and ongoing battle remained available.

## Remaining samples completed on resumption

- Resumed the persisted Tony reward screen, selected Next unit, and saw unit 2 with include, considerate, hesitate, encourage and retained 60 XP/320 cards. One Start button shown.
- Kai Year 3 unit 1 showed borrow, return, ready, carefully. At 390×844 desktop viewport, teaching heading precedes readable vocabulary cards. Quiz labels A–D are correctly rendered.
- Course hub displayed all 24 Kai units and parent-mode access.
- Selected Molly in Settings: bundled audio/e83994a.mp3 reached readyState 4, duration 5.52 seconds, no media error. Mitchell was already verified and was not repeated.
- No old pack or battle full-flow tests were repeated. Legacy model test data references were updated to the new course shape; that historical suite was not rerun.

## Explicit limits

Physical Android/iPhone use, microphone permission and recognition of a real child's speech remain unverified. Transcript matching tests use an injected fake adapter and do not establish acoustic accuracy or phone compatibility. Self-check is not an assessed speaking pass. No phoneme-level pronunciation scoring, complete school curriculum, full offline-first use or actual installation is claimed.

---

## Historical validation through version 3

# Sample validation record

Scope changed by user: representative feature samples are sufficient; do not repeat completed full-flow checks.

## Already verified in the in-app browser

- 390×844 and 360×800 viewport settings (desktop browser rendered at mobile sizes).
- Tony: all six missions, correct vocabulary → automatic Listening route, sentence construction, speaking self-check and review.
- Double-click on correct answers does not duplicate XP; each completed mission gives 10 XP. Six missions give 60 XP and one pack.
- Five sequential reveals including guaranteed EX and special presentation. Refresh during card 2 restores the same pending pack/index.
- Five owned cards remain after collection refresh.
- Team selection of three owned cards, wrong-answer damage (10), energy charging, special move lock, protect reducing a 16 hit to 6, teammate switching, opponent transitions and victory.
- Tony battle victory: 19 English questions, total XP 60 → 80, five cards retained. Refresh of victory does not award another 20 XP.
- Kai starts independently at 0 XP and no cards. All six mission tiles open and their in-app Back buttons work.
- Kai: wrong-answer retry; vocabulary/listening; explicit reading fallback; reading and the shorter `I help my friend.` sentence. Last validated checkpoint: Speaking, 40 XP.
- NZ MP3 media reached readyState 4, no media error, and playback reached full duration. Sample normal sentence 2.904s; slow word 1.536s at playbackRate 0.75. This verifies decoding/playback state, not subjective speaker or headphone quality.

## Model tests completed earlier (6 tests passed)

- 24 combinations of profile × chapter: questions, duplicate mission prevention, pack threshold, pack size, guaranteed EX and next chapter.
- Pending pack JSON restart at every reveal index without duplicate rewards.
- Energy costs, guard, switching, victory and single payment.
- Clean loss and healed restart.
- Review scheduling and profile isolation.
- All 121 audio files present and nonempty.

## Fixes during sample checks

- Prevent an intentional audio stop on navigation from reporting a playback failure.
- Listening answers unlock after playing audio or explicitly selecting the reading fallback.
- Disable buttons during transitions so an apparently active button cannot silently discard a fast tap.
- Do not show “pack ready” after that pack was already opened.
- Provide an explicit read-aloud path when speaking audio cannot be played.

## Not claimed as verified

- Physical Samsung/Android or iPhone hardware, OS Back navigation, haptics, actual home-screen installation.
- Real microphone permission/recording on a phone or pronunciation evaluation (no automatic evaluation implemented).
- Full offline first-use support, all external image URLs under every network, simultaneous multi-tab writes, malformed-backup fuzz testing.
- Every chapter visually played, every collection filter, backup import/export interaction. These were outside the reduced sample scope.

Current scope: playable representative browser samples passed. Real-device testing is a separate remaining check, not a claim of this delivery.

## Parent sandbox addition

Focused test only; prior full flows were not rerun. New isolation model test passed (separate keys, backup boundary, pack/battle mutations leave normal save untouched). Browser sample: test Tony starts with 24 cards/10 packs/0 XP, opens a free pack and reveals a card, starts a three-card battle immediately, fills energy to 3 and uses Thunder Dash for 48 damage. Returning to the ordinary game restored Kai at 40 XP and 0 cards, with no sandbox controls.

## A1 catalogue restoration — 2026-09-14 NZ time

- Shared normal/sandbox catalogue: 286 A1 card prints plus 24 preserved original entries. 60 special illustrations, including 3 crowns. Two TCGdex missing rarity values (A1-265 and A1-279) are corrected to Two Star in the adapter with a source pointer.
- Four focused `tests/catalogue.test.mjs` checks passed: IDs/counts/recorded-move coverage; seeded 10,000-pack sample reaches all 286 entries and preserves unique cards, EX + special-art guarantees and >=3 battle Pokémon; old save/unfinished pack/duplicate preservation with idempotent sandbox expansion; new string-ID battle and trainer-card exclusion. Existing full chapter/learning tests were not rerun.
- Browser UI used the in-app browser at 390×844 (not physical hardware). The prior sandbox's unfinished original Charmander pack survived the update; it was finished before testing the new pack. Existing sandbox expanded to 310 distinct cards and 286/286 A1.
- Crown filter showed all 3 entries. Charizard ex A1-284 full-resolution card artwork rendered in the mobile detail dialog, with foil frame, readable name and close/back controls.
- New sample pack: A1-258 Articuno ex, A1-023 Exeggutor ex, A1-032 Gogoat, A1-251 Venusaur ex, A1-257 Starmie ex. Special artwork rendered during reveal. Reload at slot 5 retained the Starmie ex reveal; Add to collection completed normally.
- Immediate test battle used crown Charizard/Pikachu/Mewtwo. Energy fill unlocked Flame Spiral, which dealt 65 super-effective damage (Butterfree 80→15 HP; Charizard 160→144 HP after retaliation).
- Normal-game link restored Kai at 40 XP / 4 completed missions / 0 cards and no test controls. Normal records were not edited for this test.
- Final JS syntax and diff whitespace checks passed. External art was sampled, not all 286 image downloads. Immersive cards use still artwork and a foil effect, not the official video. Physical phone, installation, offline and other prior coverage limits remain unchanged.
