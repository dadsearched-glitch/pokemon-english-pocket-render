# Implementation status — Phase A

## Complete

- `PeerRoom` public contract preserved with WebSocket server relay transport.
- HTTP room create/join remains capped at four humans; reconnect, accept, start, leave and bearer ownership remain enforced.
- Relay validates bounded JSON game envelopes and routes opaque payloads; host remains authoritative because existing multiplayer dispatch and snapshot validation are unchanged.
- Local (`network/dev-server.mjs`) and production (`server.mjs`) servers accept WebSocket upgrades. Render continues to start with `npm run together`.
- Focused 2-player and 4-player relay integration tests pass.

## Verification

- `npm.cmd test`: 60/60 PASS.
- `npm.cmd run build`: PASS.
- Local relay smoke route `/?slice=frieza`: HTTP 200; full browser rendering/runtime verification: **UNVERIFIED**.
- Real-device LAN and Render deployment: **UNVERIFIED**.
# Implementation status — Phase B/C graphics/UI (2026-09-20)

## Complete

- Lobby player cards now show identity, team badge, selected card thumbnails, card rarity/power metadata already present in the catalogue, and connection state.
- Battle UI now distinguishes 1v1, four-human 2v2, co-op Raid/Dungeon, and Tag human-vs-AI roles.
- Active turn, enemy/boss, HP/energy/combo grouping and reconnect pause messaging have stronger visual hierarchy.
- Responsive CSS covers 360px, 390px, 412px and reduced-motion users without introducing external image dependencies.

## Verification

- `npm.cmd test`: 61/61 PASS.
- `npm.cmd run build`: PASS.
- Browser/UI and physical-device checks: **UNVERIFIED** because Playwright is not installed and no physical devices are attached.

# Implementation status — Phase B/C structural redesign (2026-09-20)

## Complete

- Solo selection has a visual Slot 1/2/3 squad panel and artwork-backed collection grid.
- Solo battle has enemy/VS/active/bench regions, turn banner, HP/energy/combo/status readouts, and state-derived feedback hooks.
- Together selection has large visual card tiles plus a selected-three panel; raid is boss-centric while Dungeon/Tag remain distinct.
- No server, transport, protocol, learning, save, reward, or combat-rule files were changed.

## Verification

- `node --check web/app.js; node --check web/multiplayer.js`: PASS.
- `npm.cmd test`: 61/61 PASS.
- `npm.cmd run build`: PASS.
- `git diff --check`: PASS.
- Live `/?slice=frieza` browser inspection and real-device responsive testing: **UNVERIFIED**.
