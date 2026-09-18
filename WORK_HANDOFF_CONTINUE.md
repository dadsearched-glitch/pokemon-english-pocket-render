# 멀티플레이 인수인계 — 2026-09-17 (schema harden)

## 최우선 현재 상태
Phase 1~5 작업본 유지. 이번 마무리는 rewards/save schema 검증 강화와 4인 사람 2v2 보존만. 새 Phase/기능 없음. 공식 사이트 미배포.

## 사용자 지시 (그대로)
- 실제 사람 최대 4명 같은 방 2v2. 2 humans + 2 AI로 대체 금지. Tag는 별도 협동.
- 공식 배포 금지. 카드 빼앗기/교환 없음.
- Year1~6 / Molly / 팩 / 솔로 / 310도감 / 저장 보존.
- PVP 팩조각 0. 협동 일일 첫 성공 1조각.
- web/audio/*.mp3 1161개는 생성/수정하지 않음. 기존 파일 사용.

## 프로토콜 / 실행
- PROTOCOL=1, GAME=`8.1-together-preview-1`
- `PORT=8080 node network/dev-server.mjs`
- iceServers:[], BroadcastChannel 금지, cloud signaling 금지
- 테스트: `node --test tests/*.test.mjs`
- 4인 브라우저: `node tests/browser-duo.mjs` (Playwright 4 컨텍스트)

## 이번 마무리
- validRewards가 거부: 미존재 cosmetic ID, coopDay raid/dungeon/tag 누락, raid.stars 비숫자, raid.first 잘못된 키/값, bond id/객체 오류, bond xp 음수, bond level 범위 밖, equipped가 보유/종류와 불일치, schema2 필드 타입 오류
- initRewards는 위 값을 정리해 정상 프로필 id를 유지. schema 1은 그대로 통과 후 schema 2로 이전
- 백업 import와 로컬 load 모두 acceptsProfileRewards / validRewards 사용
- 4인 사람 2v2 모델 테스트 유지. Tag로 대체하지 않음

## 아직 안 한 것
실기기 같은 Wi-Fi 2대/4대, 호스트 실새로고침 60초, cloud signaling, 공식 배포.

real two-device same-Wi-Fi validation not completed.
