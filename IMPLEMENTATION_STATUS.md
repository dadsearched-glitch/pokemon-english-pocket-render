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
