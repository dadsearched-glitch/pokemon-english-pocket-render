# Pokémon English Pocket — Battle V3 / v260929.2

Family fan game for supplementary New Zealand everyday English practice. The editable app is in `web/`; profiles and progress stay in each browser's local storage.

## What is here

- Year 1–6 courses, 24 units per year. Each unit has vocabulary, listening, reading, sentence building, speaking, and review.
- Up to five local profiles, packs and collection, solo team battles, and the optional Together modes.
- Completed map units can be practised again without duplicate mission rewards. The daily solo practice revisits three learned words, chooses a useful sentence in context, then asks the learner to say a personal variation. Its first completion each day gives one pack shard. Five shards make a pack, and each fifth completed solo day grants an unowned legacy collection card when one remains.
- Each four-unit region unlocks a solo guardian battle. Guardian, support and striker cards have different effects in that battle; the first clear grants one pack. Settings offers a short Year preview and a parent snapshot that separates listening, reading support and speaking self-checks.
- Existing browser saves keep the same storage key. Export a backup from Settings before changing devices or clearing browser data.

## Run and test locally

Install the dependencies with `npm install`, then run `npm run together` and open `http://localhost:4190`. This serves the editable `web/` files and the same-origin room/signaling service. `npm test` runs automated checks; `npm run build` copies the web source to `dist/` for the alternate `npm start` server. The `?test=1` URL opens a separate parent-test save and never writes to normal game progress.

## Render

`render.yaml` configures the Node web service with `npm run together`. The existing Render service `pokemon-english-pocket-render` is linked to `dadsearched-glitch/pokemon-english-pocket-render` on `main` and serves `https://pokemon-english-pocket-render.onrender.com/`. Update that service through this repository; a local build alone does not update the live site.

See `RELEASE_READY_V260929_2_KO.md` for the item-by-item review, verification evidence, packaging details and remaining device/content checks.

## Assets and scope

Voice files are pre-generated Molly/NZ English MP3 files. Card images and battle art load from external TCGdex and PokeAPI sprite hosts. This is an independent family fan game, not the official Pokémon TCG. Browser tests and automated checks do not replace testing touch, microphone, storage, and connection recovery on the child's actual device.
