# TEST REPORT — 2026-09-20 Phase A server relay

## Automated verification

- `npm.cmd test`: **59/59 PASS**
- `npm.cmd run build`: **PASS**
- Focused markers printed:
  - `SERVER RELAY 2P PASS`
  - `SERVER RELAY 4P PASS`
- Relay coverage includes authenticated room create/join, four-human cap, opaque envelope routing, targeted messages, broadcast, and 2v2 fan-out.
- `npm.cmd run together` + `Invoke-WebRequest http://127.0.0.1:4190/?slice=frieza`: **HTTP 200** (route served).

## Unverified

- Full browser rendering and gameplay at `/?slice=frieza` were not run in this pass.
- Real-device LAN (2P/4P), reconnect during an active battle, and Render production smoke test remain **UNVERIFIED**.

# TEST REPORT — 2026-09-17 schema harden

## 자동검증
- rewards schema 전용 6/6 PASS (`tests/rewards-schema.test.mjs`)
  - 미존재 cosmetic ID 거부
  - coopDay 필드 누락 거부
  - raid.stars string / 잘못된 ladder 거부
  - raid.first 잘못된 key/value 거부
  - bond id/object, 음수 xp, level 범위 거부
  - equipped 미보유·종류 불일치 거부
  - schema 2 타입 오류 거부
  - schema 1 정상 저장 통과 + 제자리 이전
  - backup import gate가 같은 validRewards를 사용
- 멀티 7/7, 레이드 3/3, 협동 7/7, 시그널 3/3 PASS
- 학습/코스/도감/샌드박스/v7/y1-y6 비오디오 23/23 PASS
- 오디오 파일 존재 검사 2개는 이 작업본 ZIP이 mp3를 제외해서 이 트리에서만 ENOENT. 원본 ZIP 오디오 1161개는 수정하지 않음.

## 4인 사람 2v2 브라우저
- 모델: 4 human createMatch / 완주 / 보상 1회 / 카드·XP·팩 불변 PASS
- 이 샌드박스에 Playwright 브라우저 런타임이 없어 독립 4 컨텍스트 WebRTC 완주(연결 3 → Ready 4 → 승패 → ack 4/4 → reload 중복보상 없음)를 재실행하지 못함
- 4 human을 2 human + 2 AI로 대체하지 않음

## 미검증
- real two-device same-Wi-Fi validation not completed
- 실기기 4대 2v2
- 전투 중 Guest reload 재접속
- 호스트 새로고침 / 실네트워크 60초 단절
- 공식 배포 / cloud signaling 없음

## 변경 파일
- web/rewards.js
- web/app.js
- tests/rewards-schema.test.mjs
- WORK_HANDOFF_CONTINUE.md
- TEST_REPORT.md
