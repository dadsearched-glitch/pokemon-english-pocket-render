Use the **English Heroes Builder** agent for this workspace.

Start by reading the canonical V6/V7 design contracts and the current architecture/test/status files.

Then do this pass:

1. Trust the existing repository; do not redesign from scratch.
2. Inspect `package.json`, lockfile, scripts, and current Node/tooling requirements.
3. Run the existing tests first and record the exact result.
4. Attempt the real install/typecheck/build/dev flow and fix actual errors:
   - `npm ci`
   - relevant typecheck command
   - `npm run test:game`
   - `npm run build`
   - `npm run dev`
5. Open the real app route `/?slice=frieza`, not static preview HTML.
6. Verify that Player Hero identity and Companion/Assist identity are separate.
7. Verify that the same Player Hero progression is used for Solo and Multiplayer:
   level / XP / skills / equipment / mastery / companions must persist both ways.
8. Fix any issue you find before moving to visual polish.
9. Preserve the 72-unit canonical learning data and server-authoritative answer validation.
10. Do not expand Pokémon/One Piece yet.

After the baseline is clean, improve D4 graphics only:
- high-resolution Hero presentation;
- separate Dragon Ball Assist presentation;
- stronger run/attack/skill/hit animation states;
- stronger Frieza telegraph/reaction;
- higher-quality VFX;
- keep performance appropriate for modern tablets.

Do not use circles/rectangles as the normal player-facing character presentation.

At the end, update README/CHANGELOG/TEST_REPORT/KNOWN_ISSUES/IMPLEMENTATION_STATUS and show me:
- exact files changed;
- commands run;
- tests passed/failed;
- build status;
- actual route tested;
- screenshots if you can capture them;
- anything still unverified.

Do not stop at analysis. Modify the repository, run it, test it, and fix errors iteratively.
