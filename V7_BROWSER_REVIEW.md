# v7 sample review — 2026-09-15

The public v6 site must remain untouched. This checkout is connected only to a newly created separate v7 sample Site. Website deployment is sufficient; no APK is required.

## Fixes

- Hint opening now persists assistance, including after closing the hint; default-open hints also count as help. Correct-after-help schedules the existing no-hint retry.
- Special Art without EX now receives enhanced reveal presentation; Special Art and Crown have distinct halos. Removed duplicate Crown label.
- Explicit Full battle effects overrides OS reduced-motion hiding of typed attacks. Reduced retains its short effect path.
- User requested Molly only: removed Mitchell UI and 625 male MP3 files; existing voice preferences migrate to Molly. The remaining 625 original Molly files are retained.
- v7 local server defaults to port 4177 to isolate old localhost:4173 records. Copied v6 hosting ID was removed before creating a separate sample Site.

## Verified; do not repeat without relevant changes

Prior package recorded 25 automated tests and build passed. That full suite was not rerun unnecessarily.

Additional tests: tests/v7-review-fixes.test.mjs passed both hint/recall persistence and all-three-year bank preservation. After Molly change, five affected migration/content/voice/recall tests passed. App syntax and updated build passed.

Unchanged compared with v6: all 72-unit content source, catalogue and Speaking source (text equal after newline normalization), pack draw, mission XP, battle damage/energy/switching/rewards functions. All 1,250 audio hashes matched before the user-requested Mitchell removal.

Actual browser at localhost:4177 (test data only):

- Blank first-run screen; created five names with Years 3/4/5; sixth creation form unavailable with clear limit message.
- QA Five earned 10 XP; other four profiles remained 0 XP.
- Y5 Unit 1 independent answer, hint-open-and-close answer and wrong-then-correct answer; latter two appended clean retries. Parent summary: independent 4, assisted 2, misses 1, after successful retries.
- 768x1024 learning display uses width without horizontal overflow.
- Imported synthetic schema-v1 JSON generated using the original v6 model. Tony 370 XP, 8 packs, 311 cards/310 unique, 2 wins and ongoing battle restored; Tony Year 4, Kai Year 3. Three banks show Y3 Unit 3 1/6, Y4 Unit 9 1/6, Y5 Unit 7 3/6; switching to Y5 restored Unit 7 3/6.
- 1024x768 wide battle has arena and side controls; no horizontal overflow. Fire special cut-in, normal Fire embers, Water wave/drops, Electric bolts were actually rendered and screenshots inspected. Full attacks lock controls and release afterward. Reduced uses short path without typed attack layer.
- Synthetic ongoing battle completed with 7 answered questions. Victory XP 370 -> 390, retained 390 after reload. No duplicate damage observed in sampled actions.
- Fixture pack: normal Bulbasaur, EX Venusaur, illustration Bulbasaur, Special Art Venusaur, Crown Charizard. Images loaded, distinct halos/room effects, no broken images or overflow; collection shows Discovery Goals 310/310.
- Supplied-sentence Speaking UI unchanged. Molly audio readyState=4, no media error; no browser console errors in sampled local flows. Male voice selection absent after migration.

Synthetic fixtures in tests/fixtures contain no real user data. Original public v6 localStorage was not accessed or modified.

## Still required at this checkpoint

- Separate sample deployment and browser end-to-end test of that deployed URL.
- Physical tablet performance, long-session heat/touch feel and actual child microphone recognition remain unverified. APK/install/full offline flow and every type/card combination are not certified.
- No authorization to replace the public v6 deployment; replacement requires a later user approval.

## 2026-09-16 continuation

The initial saved sample version was not deployed. Browser testing found that newly created parent-test profiles had no cards, so quick battle failed. Creation now seeds the existing sandbox catalogue and 10 test packs, only in parent-test storage. Normal creation is unchanged. 768px battle layout was also checked: no overflow, 139px-wide move buttons, readable HUD.

Retest passed: created Test Ready in parent mode and clicked quick battle; entered arena with Charizard EX, Pikachu EX and Mewtwo EX without reload.
