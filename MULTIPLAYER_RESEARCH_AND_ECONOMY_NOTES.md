# Pokémon English Pocket v8 — Multiplayer / Reward Research Notes

This companion file explains why the Work handoff is structured the way it is.

## Current v8 source findings

Audited source: `Pocket_English_v8_FINAL_20260916.zip`

- `package.json`: v8.0.0.
- `.openai/hosting.json`: static `dist/` deployment.
- `web/model.js`: save version 2, local profiles, learning reward, pack transaction, solo battle.
- `web/app.js`: home, collection milestones, profile UI, battle UI.
- `web/data.js`: 286 A1 catalogue adapter plus 24 legacy adventure cards.
- `RELEASE_V8_KO.md`: Year 1–6 release status, 1,008 learning utterances, 1,161 MP3 files total, localStorage, no device sync.
- Automated suite was rerun: 32/32 passed.

### Existing reward loop

- mission: +10 XP
- completed 6-stage unit: +60 XP and +1 pack
- normal pack: 5 cards
- solo battle win: +20 XP
- discovery goals: 25/50/100/150/200/250/310, currently cosmetic/display only
- duplicates: displayed as copy count, no strong gameplay use

### Why multiplayer should not pay full packs often

Year 1–6 = 144 units = 144 normal packs = 720 pulls if every unit is completed once.

Seeded simulation of current v8 `openPack()`:

- 24 packs → ~107 unique A1 cards
- 48 → ~161
- 72 → ~202
- 96 → ~241
- 120 → ~276
- 144 → ~286

The current pack code draws from 286 A1 `SET_CARDS`, with strong unseen bias.

Therefore a player who follows the learning path already has a strong route toward the A1 collection.

Multiplayer should add:
- purpose,
- co-op progression,
- cosmetics,
- small controlled pack bonuses,

rather than become a faster pack faucet.

### 24 legacy-card opportunity

The catalogue contains 24 `LEGACY_CARDS`, but current `openPack()` draws only from `SET_CARDS`.

A newly created profile starts empty.

This creates a natural reward opportunity: co-op Raid first-clears can intentionally unlock the 24 legacy adventure cards and make the 310/310 goal meaningful for new profiles.

Work must verify that no newer source already added another normal acquisition route.

---

# Official Pokémon design references

## Sword / Shield Max Raid

Sources:
- https://swordshield.pokemon.com/en-us/gameplay/max-raid-battles/how-to-max-raid/
- https://swordshield.pokemon.com/en-us/gameplay/dynamax-powerful-pokemon/
- https://www.pokemon.com/uk/strategy/pokemon-sword-and-pokemon-shield-max-raid-battle-tips

Observed design:
- 4-player co-op against a large boss.
- Knocked-out players can cheer.
- Barriers create boss phases.
- Valuable items and rare Pokémon make raids worth repeating.

Applied idea:
- Cheer/rescue questions,
- simple shield phases,
- strong first-clear + repeatable resources.

## Scarlet / Violet Tera Raid

Sources:
- https://www.pokemon.com/us/news/challenge-chesnaught-great-tusk-and-iron-treads-in-tera-raid-battles
- https://www.pokemon.com/us/news/chesnaught-with-the-mightiest-mark-returns-to-7-star-tera-raid-battles

Observed design:
- star tiers signal challenge,
- cooperative powerful boss,
- useful material rewards.

Applied idea:
- 1–5 stars,
- stronger first-clear rewards and prestige.

## TCG Pocket

Sources:
- https://www.pokemon.com/us/strategy/a-guide-to-collecting-cards-and-using-wonder-picks-in-pokemon-trading-card-game-pocket
- https://www.pokemon.com/us/pokemon-news/pokemon-tcg-pocket-pawmot-drop-event
- https://support.pokemon.com/hc/en-us/articles/30330309361172-Pok%C3%A9mon-TCG-Pocket-Gameplay-FAQ

Observed design:
- missions can pay tickets/hourglasses rather than direct cards every time,
- duplicate-related flair,
- first event clear stronger than repeat clear,
- social systems can give small rewards without taking another player’s card.

Applied idea:
- Adventure Medals,
- Pack Shards,
- Duplicate Spark,
- first-clear Adventure Cards.

## Pokémon Masters EX Battle Rally

Source:
- https://www.pokemon.com/us/strategy/earn-battle-rally-medals-in-pokemon-masters-exs-battle-rally-mode

Observed design:
- sequential battle run,
- temporary run power-ups,
- point/medal conversion,
- varied teams become useful.

Applied idea:
- short co-op dungeon,
- temporary items that disappear after the run.

## Pokémon UNITE Energy Rewards

Source:
- https://support.pokemon.com/hc/en-us/articles/4404740700948-How-do-Energy-Rewards-work-in-Pok%C3%A9mon-UNITE-and-what-is-the-difference-between-Extra-Energy-Tanks-and-Energy-Boost-Tanks

Observed design:
- battle participation generates a separate reward resource,
- output can be limited.

Applied idea:
- multiplayer currency separate from education XP/packs,
- Pack Shard earning controlled by first eligible daily co-op clears.

## Pokémon GO Party / Raid event design

Sources:
- https://gotour.pokemongolive.com/gowildarea/global/
- https://gotour.pokemongolive.com/gowildarea/gameplay/

Observed design:
- party challenges reward group activity,
- raid/event participation can provide commemorative backgrounds, encounters and medals.

Applied idea:
- Team Bond,
- Boss/Dungeon Badges,
- arena/background cosmetics.

---

# Web multiplayer technical references

## WebRTC data

https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API/Using_data_channels

RTCDataChannel can transmit arbitrary game data peer-to-peer and is encrypted.

## Signaling

https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API/Signaling_and_video_calling

WebRTC still needs an out-of-band signaling mechanism to exchange connection information.

## ICE/STUN/TURN

https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API/Protocols

Network topology/firewalls can require ICE/STUN/TURN. Same Wi-Fi improves the chance of direct connectivity but does not remove the need to negotiate the peer connection.

## BroadcastChannel is not the two-phone solution

https://developer.mozilla.org/en-US/docs/Web/API/BroadcastChannel

BroadcastChannel is for same-origin browsing contexts such as tabs/windows. It should be useful for local test tooling, not as the production two-device transport.

---

# Design conclusions

1. **Raid is the highest-value new mode.**
   It combines collection, cinematic battles, co-op, learning and meaningful rewards.

2. **PvP rewards should stay small.**
   Tony/Kai should not feel that one child steals progression from the other.

3. **Co-op should pay more than PvP.**
   The game’s family/learning purpose benefits when helping each other is valuable.

4. **Packs must remain education-led.**
   Multiplayer uses Pack Shards, not frequent full packs.

5. **The 24 legacy cards are ideal raid first-clear collectibles.**
   This gives co-op a unique reward and closes the apparent 286→310 collection gap.

6. **Dungeon power should be temporary.**
   Run-only items create variety without permanently breaking PvP balance.

7. **Duplicate rewards should be visible.**
   A duplicate should create noticeable card/battle presentation progression, not a barely visible number.

8. **Two-player networking should be solved before building all four modes.**
   Static UI without real peer connectivity is not success.

9. **The multiplayer transport should not carry children’s speech or full learning data.**
   Only action/result/session state is needed.

10. **Start with 2 real players.**
    4-human Tag Battle can be a later expansion; 2 humans vs 2 AI delivers the concept with much lower networking risk.
