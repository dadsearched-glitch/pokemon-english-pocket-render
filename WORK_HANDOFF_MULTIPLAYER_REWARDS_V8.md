# Pokémon English Pocket v8 — Multiplayer + Rewards Work Handoff
## Detailed design for Trainer Duel, Co-op Raid, Co-op Dungeon, Duo Tag Battle, and a durable reward economy

**Target source:** `Pocket_English_v8_FINAL_20260916.zip` or a newer Work build only if it is demonstrably based on this v8 line and preserves all v8 learning data.

**Scope:** Add multiplayer/co-op gameplay and a reward layer to the current completed game.  
**Do not redesign or replace the Year 1–6 learning system, current pack algorithm, current solo battle rules, current cinematic battle effects, Molly learning audio, card catalogue, backup/restore, profile system, or current graphics unless a minimal integration change is required.**

---

# 0. First action in Work

Before editing, audit the latest source and report, concisely:

1. exact source/version/commit being used,
2. whether it still matches the v8 architecture described below,
3. current deployment type and whether it can run a signaling/backend service,
4. current save schema/version,
5. current pack acquisition paths,
6. whether the 24 legacy adventure cards are obtainable by a newly-created normal profile,
7. networking architecture proposed for two real phones,
8. files/modules to add/change,
9. migration risks,
10. phased implementation plan.

Do **not** build a fake “Create Room” screen before proving that two separate devices can actually exchange session state.

---

# 1. Audited v8 baseline — preserve this

The supplied v8 source was reviewed before this handoff.

Verified source facts:

- Version: `8.0.0`.
- Static deployment: `.openai/hosting.json` publishes `dist/` as a static site.
- Local development server is a simple static Node HTTP server.
- Learning: Year 1–6, 24 units per year, 96 Core Words per year, 576 unique Core Words total.
- Learning flow: Vocabulary → Listening → Reading → Sentence → Speaking → Review.
- Molly is the fixed learning voice.
- Each completed learning mission gives +10 XP.
- Six unique mission completions in a unit give +60 XP total and +1 pack.
- Revisiting completed learning does not grant duplicate rewards.
- A pack consumes 1 stored pack and reveals 5 cards.
- Current pack logic draws from the 286 A1 `SET_CARDS`.
- The pack has strong unseen-card bias and preserves its current EX / special-art guarantees.
- Total catalogue shown to the player is 310 entries: 286 A1 entries + 24 preserved legacy adventure cards.
- Existing collection discovery milestones are at 25 / 50 / 100 / 150 / 200 / 250 / 310 unique cards.
- Those milestones are currently display/cosmetic goals only.
- Solo battle uses a 3-card team, English answers, energy, basic/special moves, guard and switching.
- Solo battle victory currently gives exactly +20 XP once.
- Current battle state and rewards are protected against duplicate victory payout.
- Save data is local browser `localStorage`; there is no cloud sync.
- Up to five local profiles are supported.
- Normal mode and `?test=1` use separate stores.
- Current source has no WebRTC / WebSocket / room / peer multiplayer implementation.
- Current automated suite passed 32/32 tests before this handoff.

### Important current economy observation

A full Year 1–6 learning run contains:

**144 units × 1 pack = 144 normal packs = 720 card pulls**

A simulation of the current `openPack()` algorithm using the v8 code showed approximately:

| Packs opened | Mean unique A1 cards |
|---:|---:|
| 24 | ~107 |
| 48 | ~161 |
| 72 | ~202 |
| 96 | ~241 |
| 120 | ~276 |
| 144 | ~286 |

This is a design simulation, not player telemetry.

**Implication:** multiplayer must not hand out normal packs too aggressively.  
Learning should remain the primary/fastest pack source.

### Important 310-card collection gap to verify

The current `openPack()` function draws only from `SET_CARDS` (286 A1 entries), while the catalogue also contains 24 `LEGACY_CARDS`.

A fresh profile starts with no cards.

Unless the latest Work build has added another acquisition path, a new normal profile can naturally reach the 286 A1 cards but not all 310 catalogue entries.

**Use multiplayer/co-op first-clear rewards as an intentional acquisition path for those 24 legacy adventure cards, unless Work finds an existing normal acquisition route.**

Do not duplicate an existing route if one is found.

---

# 2. Research patterns from official Pokémon games

The design below adapts patterns, not assets/UI.

## Pokémon Sword / Shield — Max Raid Battles

Official references:
- https://swordshield.pokemon.com/en-us/gameplay/max-raid-battles/how-to-max-raid/
- https://swordshield.pokemon.com/en-us/gameplay/dynamax-powerful-pokemon/
- https://www.pokemon.com/uk/strategy/pokemon-sword-and-pokemon-shield-max-raid-battle-tips

Useful patterns:
- friends cooperate against one large boss,
- players can still contribute after a Pokémon is knocked out by cheering,
- boss barriers create phases,
- raids provide valuable rewards beyond ordinary battle,
- rewards encourage repeated raids without requiring PvP victory over another child.

Adaptation:
- use a **Cheer / Rescue** learning action when a player is knocked out,
- use lightweight boss shield phases,
- give first-clear collection rewards and repeatable medals/shards.

## Pokémon Scarlet / Violet — Tera Raid Battles

Official examples:
- https://www.pokemon.com/us/news/challenge-chesnaught-great-tusk-and-iron-treads-in-tera-raid-battles
- https://www.pokemon.com/us/news/chesnaught-with-the-mightiest-mark-returns-to-7-star-tera-raid-battles

Useful patterns:
- group boss battles have star/difficulty tiers,
- raid rewards include resources useful outside the raid,
- higher difficulty provides prestige.

Adaptation:
- 1–5 star raid ladders,
- first-clear Adventure Card / cosmetic rewards,
- repeat clear Adventure Medals and limited Pack Shards.

## Pokémon TCG Pocket — missions, Wonder Pick, flair, event drops

Official references:
- https://www.pokemon.com/us/strategy/a-guide-to-collecting-cards-and-using-wonder-picks-in-pokemon-trading-card-game-pocket
- https://www.pokemon.com/us/pokemon-news/pokemon-tcg-pocket-pawmot-drop-event
- https://support.pokemon.com/hc/en-us/articles/30330309361172-Pok%C3%A9mon-TCG-Pocket-Gameplay-FAQ

Useful patterns:
- separate currencies/tickets are used instead of always giving another booster,
- extra card copies can feed cosmetic presentation,
- first-time clears give stronger guaranteed rewards,
- repeat clears give smaller/chance-based rewards,
- social interaction can award small value without taking a card away from another player.

Adaptation:
- **Adventure Medals** for multiplayer cosmetics,
- **Pack Shards** as a slow path to one existing normal pack,
- **Duplicate Spark** for card-specific visual progression,
- strong **first-clear** raid rewards, weaker repeat rewards.

## Pokémon Masters EX — Battle Rally

Official reference:
- https://www.pokemon.com/us/strategy/earn-battle-rally-medals-in-pokemon-masters-exs-battle-rally-mode

Useful patterns:
- a sequence of battles,
- run-specific temporary items,
- points/medals converted into permanent value,
- deeper collections matter because different team compositions become useful.

Adaptation:
- Co-op Dungeon uses temporary run-only items,
- cards/types have more reasons to be selected,
- run power does not permanently distort PvP balance.

## Pokémon UNITE — Energy Rewards

Official reference:
- https://support.pokemon.com/hc/en-us/articles/4404740700948-How-do-Energy-Rewards-work-in-Pok%C3%A9mon-UNITE-and-what-is-the-difference-between-Extra-Energy-Tanks-and-Energy-Boost-Tanks

Useful pattern:
- participation builds a separate reward resource,
- reward output can be capped/controlled.

Adaptation:
- multiplayer resource is separate from XP and normal unit-pack rewards,
- Pack Shards are throttled so the education loop remains valuable.

## Pokémon GO — Party Challenges / raid commemorative rewards

Official examples:
- https://gotour.pokemongolive.com/gowildarea/global/
- https://gotour.pokemongolive.com/gowildarea/gameplay/

Useful patterns:
- group challenges reward the whole party,
- raids can provide commemorative backgrounds/collectibles,
- co-op gives a reason to play together beyond direct competition.

Adaptation:
- Boss Badges,
- Team Bond,
- arena/background cosmetics,
- joint “both players succeeded” moments.

### Community signal — use cautiously

Community discussion around TCG Pocket duplicates often asks for duplicates to have more meaningful uses than weak cosmetic conversion alone. Treat this only as anecdotal community feedback, not authoritative design evidence.

Design response:
- Duplicate Spark should visibly affect card entrance/battle presentation,
- no card deletion is required,
- do not make the effect so subtle that a child cannot notice it.

---

# 3. Product direction

Add a new home entry:

## TOGETHER

Do not replace the existing solo Battle tile.

Suggested home structure:

- Learn
- Open Pack
- Solo Battle
- **Together**

Together opens a dedicated hub:

1. **Trainer Duel · 1 vs 1**
2. **Boss Raid · 2-player co-op**
3. **Co-op Dungeon**
4. **Duo Tag Battle · 2 players vs 2 AI**
5. Team / rewards summary

### Initial human-player scope

Phase 1 should support **two real devices / two real players** reliably.

For “2v2 Tag Battle”, initial release should mean:

**Tony + Kai (2 humans) vs 2 AI opponents**

Do not make 4-human networking a launch blocker.

Architect the session protocol so 3–4 human peers can be added later.

---

# 4. Critical networking reality

The current v8 deployment is static.

“Both phones are on the same Wi-Fi” by itself does **not** make two browser pages communicate.

Do not use `BroadcastChannel` as the cross-device solution. It is for same-origin browsing contexts such as tabs/windows, not a two-phone multiplayer transport.

For browser-to-browser data, WebRTC `RTCDataChannel` is appropriate, but peers still need to exchange signaling/ICE information.

MDN references:
- https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API/Using_data_channels
- https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API/Signaling_and_video_calling
- https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API/Protocols

## Preferred production architecture

**WebRTC DataChannel for game traffic + a very small ephemeral signaling service for room setup.**

Desired UX:

Host:
`Together → Create Room → 6-character code / QR`

Joiner:
`Together → Join Room → code`

Then:
- signaling service exchanges offer/answer/ICE,
- game state moves over encrypted WebRTC data channel,
- signaling room expires quickly.

### Signaling privacy requirements

The signaling service should store only temporary room negotiation/session information.

Do not store:
- learning answers,
- speech transcripts,
- audio,
- full profile backups,
- card collection history.

Recommended:
- random 6-character room code,
- room TTL 10 minutes before match start,
- no searchable public lobby,
- host explicitly approves/accepts join,
- maximum players enforced,
- invalid/old room codes rejected.

### Deployment constraint

The existing `chatgpt.site` configuration publishes only static `dist/`.

Before implementation, Work must determine whether its deployment environment can also host a signaling endpoint.

If not:

1. do not pretend room multiplayer is complete,
2. build/test the game-side multiplayer module separately,
3. create a minimal signaling service as a clearly separate deployable component **only if the user approves the additional service**, or
4. provide a no-server manual pairing prototype only as a fallback/proof of concept, clearly labeled less convenient.

Do not silently add a third-party hosted multiplayer service or expose secret keys in frontend JavaScript.

---

# 5. Multiplayer protocol design

Create a multiplayer module separate from the existing solo `battle` state.

Suggested modules (adapt to current code style):

- `web/multiplayer.js`
- `web/multiplayer-protocol.js`
- `web/multiplayer-model.js`
- `web/multiplayer-ui.js`
- `web/multiplayer.css`
- `web/rewards.js`
- optional separate signaling service folder if approved

Do not turn `web/model.js` into one giant multiplayer file if avoidable.

## Stable player identity

Each profile needs a persistent random public multiplayer ID, e.g.:

`multiplayerPublicId: crypto.randomUUID()`

This is not an account.

Do not derive it from the child’s name.

Migration should generate it once and preserve it.

## Session envelope

Conceptually:

```js
{
  protocolVersion: 1,
  gameVersion: "...",
  matchId: "...",
  roomId: "...",
  mode: "duel|raid|dungeon|tag",
  stateVersion: 17,
  hostPlayerId: "...",
  players: [
    {
      playerId: "...",
      displayName: "...",
      companionId: 25,
      learningLevel: 3,
      team: [...]
    }
  ],
  phase: "...",
  state: {...}
}
```

Do not transmit full profile saves.

## Message types

At minimum:

- `hello`
- `join_request`
- `join_accept`
- `ready`
- `team_submit`
- `state_snapshot`
- `question_result`
- `battle_action`
- `ack`
- `ping`
- `pause`
- `reconnect`
- `match_end`
- `reward_commit`

Validate every message:
- protocol version,
- match ID,
- sender ID,
- sequence/state version,
- expected phase,
- allowed action.

## Authority model

For first release:

**Host is authoritative for shared combat state.**

Host calculates:
- damage,
- HP,
- shields,
- phase transitions,
- AI actions,
- final result.

Clients calculate:
- their own local learning question,
- their own answer correctness.

Client sends only something like:
`{correct: true, questionToken: ...}`

Do not send the actual child speech transcript or full question text unless required.

This is a private family game; anti-cheat is not a priority, but state consistency is.

## Version mismatch

If devices run incompatible game/protocol versions:

Show:
“Both devices need the same game version.”

Do not attempt unsafe mixed-version sessions.

---

# 6. Learning fairness in multiplayer

Tony and Kai may be on different learning levels.

Do **not** make multiplayer a speed race using the exact same question.

Each player should receive questions appropriate to their own selected learning level and learned word pool.

### Do not reward easier Year levels with faster combat

For PvP, use alternating turns rather than “first correct answer attacks first”.

For co-op, concurrent questions are fine because both players benefit.

### Wrong-answer philosophy

Avoid harsh punishment for language mistakes.

Recommended:
- PvP wrong answer → turn ends / no energy gained.
- Raid/Dungeon wrong answer → no energy or reduced contribution that round.
- Do not take cards, XP, packs, medals, or collection progress away.

---

# 7. Mode A — Trainer Duel (1 vs 1)

## Goal

Friendly sibling competition that uses the existing 3-card collection and current cinematic battle language.

## Team

Each player selects 3 owned battle-eligible cards.

No card is lost or transferred.

## Turn structure

Recommended simple launch structure:

1. Player A turn.
2. A receives a local English question at A’s current level.
3. Correct:
   - +1 energy, max 3,
   - choose Basic / Special if affordable / Guard / Switch / Charge.
4. Wrong:
   - no energy,
   - turn passes.
5. Resolve animation/state.
6. Player B turn.

This avoids latency/speed advantage.

## PvP battle changes from solo battle

Do not directly reuse the current PvE counterattack side effects.

PvP Guard:
- remains active until the next incoming attack,
- reduces that damage,
- then clears.

Faint:
- choose next living team member,
- no permanent loss.

## Reward

On a completed legitimate duel:

- Winner: **3 Adventure Medals**
- Other player: **2 Adventure Medals**

No Pack Shard from ordinary 1v1.

Reason:
- prevents deliberate win-trading from becoming the fastest card farm,
- loser still gets participation value,
- reward difference is small enough for siblings.

Optional:
- first completed friendly duel of the day: +1 Medal to both.

No ranking/ELO in first release.

Store:
- played,
- wins,
- losses,
- last opponent,
- friendly streak if useful.

Keep the tone friendly, not humiliating.

---

# 8. Mode B — 2-player Boss Raid

This should be the flagship multiplayer mode.

## Core idea

Two children answer their own English questions to power attacks against one shared large boss.

## Round flow

1. Both players receive local questions.
2. Each answers.
3. Correct answer:
   - +1 personal energy,
   - contributes to Team Gauge.
4. Both choose action.
5. Host resolves both actions.
6. Boss acts.
7. Next round.

## Team Gauge

When both players succeed together, the game should visibly celebrate it.

Recommended:
- if both answer correctly in the same round → +1 Team Gauge,
- at 3 Team Gauge → `TEAM ATTACK READY`,
- either player can trigger it when both are connected/alive,
- large cinematic attack using both active Pokémon.

Do not copy Ga-Olé UI; use the current game’s original cinematic language.

## Boss phases / shield

Inspired by Max Raid barriers but simplified.

Suggested:
- 1★–2★: no shield or one light shield,
- 3★: shield around 50% HP,
- 4★–5★: two phase transitions.

Shield breaks by successful team hits, not raw timer pressure.

Do not make young learners wait through long invulnerability animations.

## Knockout / Cheer

If one player’s active team is temporarily down:

Enter **Cheer Mode** instead of making the child sit idle.

Cheer question:
- child answers a normal local English question,
- correct answer adds Rescue progress or Team Gauge,
- after 2 successful Cheer answers, return one Pokémon at ~35% HP,
- partner continues fighting.

This is strongly recommended because it keeps both children participating.

## Difficulty targets

Use star difficulty rather than “Easy/Hard”.

Design target, not hard-coded HP requirement:

- 1★: ~3–4 min
- 2★: ~4–5 min
- 3★: ~5–7 min
- 4★: ~6–8 min
- 5★: ~7–10 min

No strict countdown timer in the first release.

Learning should not be rushed.

---

# 9. Raid ladder and the 24 legacy Adventure Cards

Assuming Work confirms those 24 cards currently have no new-profile acquisition path:

Use raid first-clear rewards to make them intentionally collectible.

This also makes the 310/310 milestone achievable for new profiles.

## Electric Raid Ladder

Suggested boss family: Ampharos / electric arena.

- 1★ first clear → Pichu
- 2★ → Pikachu
- 3★ → Jolteon
- 4★ → Ampharos
- 5★ → Electric Arena / Team Attack cosmetic

## Fire Raid Ladder

Suggested boss family: Charizard.

- 1★ → Charmander
- 2★ → Vulpix
- 3★ → Charizard
- 4★ → Fire Aura cosmetic
- 5★ → Flame Team Attack cosmetic

## Water Raid Ladder

Suggested boss family: Blastoise.

- 1★ → Psyduck
- 2★ → Squirtle
- 3★ → Dratini
- 4★ → Lapras
- 5★ → Blastoise

Note: Dratini is typed `water` in the current legacy battle dataset; preserve current game semantics unless intentionally changed elsewhere.

## Grass Raid Ladder

Suggested boss family: Venusaur.

- 1★ → Chikorita
- 2★ → Bulbasaur
- 3★ → Venusaur
- 4★ → Forest Arena cosmetic
- 5★ → Leaf Team Attack cosmetic

## Psychic Raid Ladder

Suggested boss family: Mewtwo.

- 1★ → Clefairy
- 2★ → Gengar
- 3★ → Lucario
- 4★ → Mew
- 5★ → Mewtwo

## Normal Raid Ladder

Suggested boss family: Snorlax / Dragonite prestige ladder.

- 1★ → Jigglypuff
- 2★ → Eevee
- 3★ → Snorlax
- 4★ → Dragonite
- 5★ → Champion Arena cosmetic

### First-clear behavior

A legacy Adventure Card is a **guaranteed first-clear reward**, not random.

If the profile already owns that legacy card from an older save:
- do not delete/replace anything,
- grant a Duplicate Spark presentation reward and/or a small Medal substitute.

Do not repeatedly give the guaranteed first-clear card.

### Raid badges

Each ladder displays 1–5 stars earned.

This is the persistent boss achievement record.

---

# 10. Raid repeat rewards

A completed repeat Raid should still feel worthwhile, but not flood packs.

Recommended base clear:

- 4 Adventure Medals each
- Team Bond progress
- first eligible Raid clear of the local day: +1 Pack Shard

Do not give one full normal pack per raid.

Higher stars may add Medal bonuses:
- 1★–2★: 4
- 3★: 5
- 4★: 6
- 5★: 7

Tune after playtesting.

Defeat:
- no rare first-clear item,
- optional 1 “Good try” Medal if the raid progressed meaningfully,
- never subtract rewards.

Disconnect/abandon:
- no completion reward.

---

# 11. Mode C — Co-op Dungeon

## Purpose

A 10–15 minute shared adventure where the existing card collection matters across multiple encounters.

Do not build an open world.

Use a compact node/room map.

## Suggested run

6–7 nodes:

1. Battle
2. Choice / route fork
3. Treasure
4. Battle or Quiz Gate
5. Camp / recovery
6. Mini-boss
7. Final boss

A shorter 5-node version is acceptable if mobile pacing is better.

## Deterministic run seed

Generate the dungeon from the match/session seed.

Both devices must see the same:
- room choices,
- enemies,
- treasure options,
- boss.

## Run-only items

Inspired by rally/roguelite structure.

Examples:

### Healing Berry
Heal active Pokémon.

### Energy Orb
Start the next battle with +1 energy.

### Type Charm
Small bonus to one type for the current dungeon only.

### Rescue Shield
Prevent one knockout during the run.

### Team Spark
Team Gauge fills faster for one battle.

### Camp Kit
Restore team HP at a rest node.

All these disappear when the dungeon ends.

**Do not turn them into permanent PvP power.**

## Shared choice

When treasure offers two options:
- both players vote,
- if tied, host may choose or use a deterministic tie-break.

Avoid one child taking the only permanent reward away from the other.

## Dungeon reward

Full clear:
- 6 Adventure Medals each
- Team Bond progress
- first eligible Dungeon clear of the day: +1 Pack Shard
- first clear of a dungeon theme: cosmetic / Dungeon Badge

Fail after meaningful progress:
- 1–2 Medals,
- no Pack Shard.

---

# 12. Mode D — Duo Tag Battle

## Launch scope

**2 humans vs 2 AI opponents**

This satisfies the fun “2v2” idea without making four-device networking a release blocker.

## Team

Each human selects owned battle cards.

Suggested:
- 2 cards per player for a shorter battle,
or
- 3 if current pacing remains acceptable.

## Round flow

Both humans answer local questions.

If both are correct in the same round:
- `TAG CHAIN +1`.

At 3 Tag Chain:
- unlock a cinematic `DUO MOVE`.

AI opponents can have simple role patterns:
- attacker,
- defender,
- support/heal,
- type specialist.

Use deterministic AI so both clients remain in sync.

## Reward

Win:
- 4 Adventure Medals each
- Team Bond progress
- first eligible Tag win of the day: +1 Pack Shard

Loss:
- 2 Adventure Medals each if battle completes normally.

Future optional:
- 4 human 2v2 after two-device stability is proven.

---

# 13. Persistent reward system

Use only a few clearly understandable reward types.

## A. Adventure Medals 🏅

Persistent per-profile multiplayer currency.

Earn from:
- PvP,
- Raid,
- Dungeon,
- Tag.

Spend on **cosmetics and presentation**, not PvP stats.

Suggested shop categories:
- Trainer profile frame
- Victory banner
- battle entrance effect
- card entrance aura
- arena theme
- Team Attack visual skin
- collection background
- title/nameplate

Suggested initial pricing:
- small badge/title: 10
- entrance effect: 15
- victory effect: 20
- type aura: 25
- arena theme: 30
- premium Duo/Team Attack skin: 40–50

Tune after testing.

Do not add monetization.

## B. Pack Shards 🧩

Persistent per-profile.

**5 Pack Shards → +1 existing normal pack**

Use the current pack transaction and odds unchanged.

Recommended initial daily earning:
- first Raid clear: 1
- first Dungeon clear: 1
- first Tag win: 1
- PvP: 0

Maximum normal route:
3 shards/day if all three co-op modes are played.

This keeps learning as the main source of packs.

Provide a visible:
`3 / 5 Pack Shards`

When 5:
`Craft 1 Pack`

Do not auto-spend shards.

## C. Team Bond ⭐

Pair-specific co-op progression.

This belongs to a pair of persistent multiplayer profile IDs, not only one profile.

Use for:
- Team banner upgrades,
- new Team Attack cinematics,
- small co-op-only convenience bonuses.

Do **not** increase PvP damage.

Suggested progression:
- Bond Lv 1: base Team Attack
- Lv 2: team nameplate
- Lv 3: alternate Duo Attack visual
- Lv 4: Cheer/Rescue slightly improved
- Lv 5: start Raid Team Gauge with a small head start
- later levels: cosmetics / co-op-only quality-of-life

Keep mechanical bonuses modest.

## D. Boss / Dungeon Badges 🏆

Persistent achievement records.

Examples:
- Electric Raid ★★★★☆
- Fire Raid ★★★★★
- Forest Dungeon clear
- Duo Tag 10 wins

Badges are not currency.

---

# 14. Duplicate Spark ✨

Current collection already records duplicate copies because `p.cards` may contain repeated card IDs and the UI shows `×N`.

Make duplicates feel useful.

### Design

Do **not** destroy cards.

Derive Spark progress from the number of extra copies:

`Duplicate Spark = max(0, copies - 1)`

Example unlocks:
- 1 Spark → subtle card aura
- 2 Sparks → entrance glint
- 4 Sparks → battle trail
- 7 Sparks → Master Holo presentation

Exact thresholds may be tuned.

### Pack reveal

When a duplicate is revealed, show:

`DUPLICATE!  ✨ Spark +1`

instead of making the child feel the pull was wasted.

### Trainer / non-battle cards

Spark can upgrade:
- collection frame,
- binder/background presentation,

without creating battle stats.

### No destructive duplicate exchange in v1

Do not consume high-rarity cards.

If a later exchange system is added, it should be a separate decision.

---

# 15. Existing Discovery Goals become real cosmetic milestones

Current milestones:
25 / 50 / 100 / 150 / 200 / 250 / 310

Keep the thresholds.

Suggested permanent unlocks:

- 25 → Explorer badge
- 50 → Profile frame
- 100 → Collection background
- 150 → Battle banner
- 200 → Pack-room visual theme
- 250 → Trainer aura
- 310 → Master Collector frame/title

Do not award large quantities of packs.

The 310 reward should feel prestigious.

If the raid-based 24 legacy-card path is implemented, a new profile can intentionally work toward the full 310 milestone.

---

# 16. Save schema / migration

Current save version is 2 in the audited v8 source.

If multiplayer fields materially change the schema, bump to a new save version and migrate preservation-first.

Do not wipe existing profiles.

Suggested profile additions:

```js
multiplayerPublicId
adventureMedals
packShards
multiplayerStats
raidProgress
dungeonProgress
ownedCosmetics
equippedCosmetics
rewardedMatchIds
```

Pair state can be stored separately inside each profile:

```js
teamBonds: {
  [pairId]: {
    partnerPublicId,
    partnerDisplayName,
    bondXp,
    level,
    eventIds: [...]
  }
}
```

Do not use names as the pair key.

### Reward exactly-once

Every completed multiplayer match gets a globally random `matchId`.

For every permanent reward transaction:

- if `matchId` already exists in `rewardedMatchIds`, do not pay again,
- append the match ID only after a complete reward commit,
- keep a bounded history or compacted ledger so localStorage does not grow forever.

For first-clear rewards, also check the explicit raid/dungeon completion state.

### Pack Shard craft

Crafting:
- require >=5 shards,
- subtract 5 once,
- add exactly +1 `packs`,
- survive refresh without double craft.

---

# 17. Reward synchronization across two devices

Both devices keep their own local profile save.

Shared match state is networked; permanent rewards are committed locally for each player.

Recommended end-of-match handshake:

1. host computes final result and reward summary,
2. sends `match_end`,
3. each client validates the `matchId` is not already rewarded,
4. client persists its own rewards,
5. client sends `reward_ack`,
6. final victory screen shows both acknowledgements.

If connection breaks after the result but before both acknowledgements:
- store a small `pendingMultiplayerReward` record,
- on reconnect/reload, reconcile by `matchId`,
- never pay twice.

No server-authoritative account economy is required for this private family game.

Be explicit that this is not cheat-proof; the objective is consistency and child-safe family use.

---

# 18. Disconnect / reconnect rules

During a match:

- heartbeat/ping periodically,
- after short timeout: pause and show `Reconnecting…`,
- allow ~60 seconds for reconnection,
- host sends full state snapshot on reconnect.

If reconnection fails:
- match ends without rare/first-clear completion reward,
- do not corrupt solo battle or learning progress.

For Raid/Dungeon, optionally allow a controlled AI takeover later, but not required for launch.

For 1v1, do not award a “win” merely because the sibling’s Wi-Fi dropped.

---

# 19. UI / UX requirements

## Home

Keep learning visually primary.

Add `Together` without making the home screen crowded.

## Together lobby

Show:
- Create Room
- Join Room
- local player name/companion
- connection status
- room code
- ready status

Do not expose IP addresses to children.

## Lobby team select

Reuse current owned-card filtering.

Show opponent/partner:
- display name,
- companion,
- ready/not ready,

but not private learning history.

## During answering

Keep current rule:
- battle effects must not obscure English choices.

Remote side should see:
`Tony is answering…`

not Tony’s exact question/answer.

## Rewards screen

Show separate rows:

- Adventure Medals
- Pack Shards
- Team Bond
- First-clear card/badge if applicable
- Spark if duplicate

Make the reward reason clear.

---

# 20. Parent-test mode

Expand `?test=1` without modifying normal saves.

Add tools to simulate:

- fake local peer,
- room state,
- PvP turn,
- Raid 1★ / 5★,
- boss shield,
- knockout + Cheer,
- Team Attack ready,
- Dungeon node selection,
- Tag battle,
- reward commit,
- duplicate reward replay attempt,
- Pack Shard craft,
- all 24 legacy first-clear rewards.

Where possible, create a loopback/simulated peer adapter so automated/browser tests do not require two physical phones for every regression test.

---

# 21. Automated tests required

Existing 32 tests must continue passing unless an intentional schema-version assertion requires a carefully updated expectation.

Add focused tests for:

1. save v2 → new version migration preserves:
   - Year 1–6 progress,
   - cards and duplicates,
   - XP,
   - packs,
   - solo battle,
   - settings,
   - Molly,
   - profile IDs.

2. multiplayer public IDs are generated once and stay stable.

3. protocol rejects:
   - wrong version,
   - wrong match ID,
   - illegal phase/action,
   - duplicate/out-of-order state version.

4. PvP:
   - alternating turns,
   - correct answer energy,
   - wrong answer no harsh damage,
   - guard,
   - switch,
   - faint,
   - victory,
   - exactly-once medals.

5. Raid:
   - both players contribute,
   - Team Gauge,
   - Team Attack,
   - shield phase,
   - knockout,
   - Cheer/rescue,
   - first-clear reward only once,
   - repeat reward,
   - disconnect does not duplicate payout.

6. legacy-card reward route:
   - all 24 are obtainable exactly through intended first clears,
   - existing owners are not harmed,
   - 286 A1 + 24 legacy allows 310 unique.

7. Pack Shards:
   - 5 → exactly 1 normal pack,
   - refresh does not double craft,
   - normal pack odds/guarantees unchanged.

8. Dungeon:
   - same seed → same map/items,
   - run-only items disappear after run,
   - permanent reward only at correct end state.

9. Tag:
   - both human answers,
   - deterministic AI,
   - Tag Chain / Duo Move,
   - reward once.

10. Duplicate Spark:
   - derives correctly from copy count,
   - no card deletion,
   - old duplicates remain valid.

11. Discovery milestone unlocks do not grant duplicate cosmetics.

12. normal mode / test mode stay isolated.

---

# 22. Browser / device validation

Minimum browser validation before claiming multiplayer complete:

## Desktop two-context test

Two independent browser contexts with separate storage:

- create room,
- join,
- ready,
- team select,
- full 1v1,
- full raid,
- reconnect,
- reward commit.

## Mobile viewport

At least:
- 390 × 844
- representative tablet width

Check no horizontal overflow and readable questions.

## Real-device network validation

If Work has access to real devices:
- Android + Android same Wi-Fi,
- iPhone/Safari + Android/Chrome if possible.

If physical devices are unavailable, clearly state:
**“real two-phone same-Wi-Fi validation not completed.”**

Do not substitute two desktop tabs for a claim of real phone networking.

---

# 23. Performance

Reuse the current cinematic engine where possible.

Do not create a second heavyweight battle renderer.

Multiplayer should transmit small JSON state/actions, not images/audio.

Do not transmit:
- card art blobs,
- MP3 files,
- full profile saves.

All assets should remain locally loaded by each client.

Respect current Reduced Effects behavior.

---

# 24. Privacy and child-safety design

This family game does not need:
- text chat,
- voice chat,
- public matchmaking,
- friend search,
- location sharing.

Do not add them.

Room code joining only.

Learning/speech privacy:
- speech recognition stays local/browser-provider behavior as current,
- multiplayer layer should send success/action state, not raw speech.

No analytics are required.

---

# 25. What not to change

Do not change without a direct technical need:

- Year 1–6 curriculum data,
- learning progression,
- Molly audio,
- pack odds,
- five-card pack transaction,
- solo battle reward (+20 XP),
- current battle damage values for solo,
- current A1 catalogue,
- current card art sources,
- backup/restore semantics,
- profile max unless required,
- current graphics direction.

Do not replace current battle cinematics with a simpler renderer.

---

# 26. Recommended implementation phases

## Phase 0 — architecture proof

- verify current static hosting constraints,
- implement multiplayer protocol abstraction,
- establish real peer communication in local/dev environment,
- prove two separate clients exchange state.

STOP and report if deployment cannot support the selected signaling method.

## Phase 1 — Trainer Duel

- room/create/join,
- profile handshake,
- team select,
- alternating PvP,
- Medal rewards,
- exactly-once ledger.

Validate before moving on.

## Phase 2 — Boss Raid + core reward economy

- Raid,
- Team Attack,
- Cheer/rescue,
- star ladder,
- Adventure Medals,
- Pack Shards,
- legacy first-clear cards,
- Boss Badges.

This is the most important phase.

## Phase 3 — Co-op Dungeon

- node map,
- deterministic seed,
- run-only items,
- dungeon reward.

## Phase 4 — Duo Tag vs AI

- two humans,
- two AI,
- Tag Chain,
- Duo Move.

## Phase 5 — collection longevity

- Duplicate Spark,
- Adventure cosmetic shop,
- existing Discovery Goal cosmetic unlocks.

If Work allowance/time is limited, prioritize through Phase 2 and leave a clean handoff rather than partially implementing every phase.

---

# 27. Acceptance criteria

Do not call the project complete unless:

- the old game still works,
- Year 1–6 still works,
- all existing tests pass,
- two separate clients can actually connect,
- 1v1 is playable end-to-end,
- Raid is playable end-to-end,
- reward duplication is prevented,
- no child loses cards/progress,
- co-op questions respect each profile’s learning level,
- learning text remains readable during multiplayer,
- first-clear legacy-card route is consistent,
- normal pack economy is not flooded,
- backup/restore includes new persistent reward fields,
- limitations are reported accurately.

---

# 28. Delivery

Return:

1. updated full source ZIP,
2. concise architecture report,
3. exact signaling/deployment description,
4. save migration report,
5. reward economy implementation report,
6. list of all changed files,
7. automated test results,
8. browser test results,
9. real-device networking status,
10. known limitations,
11. deployment status.

Do not deploy a new production version unless the user explicitly approves deployment after reviewing the implementation/test report.

---

# 29. Product intent in one sentence

**Learning earns the main card packs; multiplayer gives the collected cards more purpose through friendly competition, shared boss victories, co-op adventures, useful-but-controlled bonus rewards, visible collection progression, and a long-term Tony + Kai team identity.**
