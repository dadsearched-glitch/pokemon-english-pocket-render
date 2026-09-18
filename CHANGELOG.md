Guard / cosmetics / schema (2026-09-17 이어서):
- FIX web/coop-model.js — Tag Defender Guard는 다음 피격만 줄이고 자기 공격을 약화하지 않음
- FIX network/signaling.mjs — Origin host를 요청 Host와 비교
- MODIFY web/rewards.js — malformed cosmetics/equipped/coopDay 검증·정리, equippedLook
- MODIFY web/multiplayer.js web/app.js web/multiplayer.css web/v7.css — Shop/Discovery 착용 화면 반영
- ADD tests for Guard, schema, origin; tests/browser-duo.mjs
- 4인 사람 2v2 모델 보존. 공식 배포 없음

# 변경파일 — v8 FINAL ZIP 대비

공식 game 폴더는 변경없음. 현재작업본은 git repository가아닌ZIP기반복사본.

Phase 0/1 (이전):
- ADD network/dev-server.mjs, network/signaling.mjs
- ADD web/multiplayer*.js/html/css, web/rewards.js, web/network-proof.html
- ADD tests/multiplayer.test.mjs, tests/signaling.test.mjs
- MODIFY web/app.js, web/v7.css
- RENAME .openai/hosting.json → hosting.production-reference.json

Phase 1 안정화 + Phase 2 레이드 (2026-09-17):
- MODIFY web/multiplayer-model.js — validSnapshot winner/seq/hp/max/type, GAME 8.1-raid-preview-1
- ADD web/raid-model.js — 2인 보스 레이드, Team Gauge, shield, cheer/rescue, 6 ladder × 1–5★
- MODIFY web/rewards.js — schema2 shards/bond/badges/raid first-clear, craftPack 5조각=1팩
- MODIFY web/multiplayer.js / css / transport, network/signaling.mjs, app.js
- ADD tests/raid.test.mjs, tests/browser-duel.mjs, tests/browser-raid.mjs, tests/browser-lobby.mjs

Phase 3–5 던전 / 태그 / Spark·상점 (2026-09-17 이어서):
- ADD web/coop-model.js — 던전 5노드(forest/tide/ember), 공유 투표, 런 아이템, 캠프 자동회복 / 태그 2human vs Pikachu+Charizard AI, Tag Chain 3 → Duo Move
- MODIFY web/rewards.js — rewardDungeon/rewardTag, SHOP 7종, DISCOVERY 7종 실해금, sparkOf/sparkTier, buyCosmetic/equipCosmetic
- MODIFY web/multiplayer.js — 4모드 UI, 던전 지도/투표/퀴즈, 태그 vs 2 AI, 상점 구매/착용, esc 복구, 투표/퀴즈 시 아레나 폴스루 수정
- MODIFY web/multiplayer.css — dungeon-map, shop-row
- MODIFY web/app.js — 팩 DUPLICATE/Spark, 컬렉션 스파크, Discovery 실이름, Together 카피, persist syncDiscovery
- MODIFY web/v7.css, web/catalogue.css — spark aura/glint/trail/master
- ADD tests/coop.test.mjs, tests/browser-dungeon.mjs, tests/browser-tag.mjs
- GAME `8.1-together-preview-1`

미구현: cloud signaling, 공식배포, 실기기 같은 Wi-Fi 2대/4대 검증.
