# GPT 인수인계 — Pokémon English Pocket v8.1 Together preview (전체본)

날짜: 2026-09-17  
이 ZIP은 공식 v8 출시본이 아니라 **그 위 작업본 전체**입니다. 처음부터 다시 만들지 마세요.

읽는 순서:
1. 이 파일 (`GPT_HANDOFF_V8_TOGETHER_KO.md`)
2. `CONTINUE_PROMPT_KO.txt` — 다음 채팅 첫 메시지에 그대로 붙여 넣기
3. `WORK_HANDOFF_CONTINUE.md`
4. `TEST_REPORT.md`
5. `CHANGELOG.md`

채팅에는 `CONTINUE_PROMPT_KO.txt`만 붙여도 됩니다. 나머지는 ZIP 안에서 읽으세요.

---

## 사용자 지시 (변경 금지)

- 실제 사람 최대 4명 같은 방, **2대2 PvP**. 2 humans + 2 AI로 대체 금지.
- 협동 태그(2 human vs 2 AI)는 **별도 모드**. Duel 2v2를 태그로 바꾸지 말 것.
- **공식 사이트 변경/배포 금지.** 사용자 테스트 후 별도 승인 전 프로덕션 배포 금지.
- 카드 빼앗기/교환 없음.
- 보존: Year1–6 / 144단원 / 576어휘 / Molly NZ English / pack odds / 5장 팩 트랜잭션 / 솔로 전투 +20XP / 310 도감 / 기존 저장·백업.
- PVP 팩조각 0. 협동(레이드/던전/태그) **각 모드 하루 첫 성공 1조각**. 5조각 = 기존 팩 1개, **수동**, 자동 소비 금지.
- 레이드 최초클리어 → 레거시 24장.
- Duplicate Spark = `max(0, copies-1)`. 카드 삭제 없음.
- vanilla JS. TanStack/React로 감싸지 말 것.
- 시그널링: `node network/dev-server.mjs`. `npm start` / `server.mjs`는 멀티 불가.
- 외부 시크릿 백엔드, cloud signaling, BroadcastChannel 몰래 추가 금지.
- `iceServers: []`. WebRTC DataChannel, 호스트 스타, 호스트 권위 전투.
- 실기기 검증을 못했으면 반드시 `real two-device same-Wi-Fi validation not completed` 라고 쓸 것.

---

## 현재 완료 범위

Together 모드 4개:

| 모드 | 인원 | 내용 |
|---|---|---|
| duel | 사람 2 또는 4 | 2명이면 1v1, 4명이면 **실제 사람** 2v2 |
| raid | 사람 2 | 6 ladder × 1–5★. Team Gauge 3 → Team Attack. 실드. Cheer 부활. 최초클리어 레거시 카드 |
| dungeon | 사람 2 | forest / tide / ember. 5노드 battle → vote → quiz → camp(자동회복) → boss. 보물 **공유**(불일치 시 첫 선택). 런 아이템 berry/orb/charm/shield/spark는 이번 탐험만 |
| tag | 사람 2 vs AI 2 | Pikachu attacker + Charizard defender. Tag Chain 3 → Duo Move. 4인 사람 대전 대체 아님 |

보상 schema 2 (`web/rewards.js`):
- PVP: 승 3 / 패 2 메달, 조각 0
- 레이드: 별에 따라 메달 + 일일 첫 성공 조각 1 + 최초클리어 카드/코스메틱
- 던전 클리어: 6 메달 + 일일 조각 1
- 태그 승: 4 메달 + 일일 조각 1 / 패: 2 메달
- 상점 7종(메달만, 전투 수치 불변)
- Discovery 25/50/100/150/200/250/310 실해금
- Spark: aura / glint / trail / master. 팩 공개 시 DUPLICATE 표시

프로토콜: `PROTOCOL=1`, `GAME='8.1-together-preview-1'`  
버전 섞인 방은 “Both devices need the same game version.”

---

## 실행

```bash
cd <이 ZIP을 푼 폴더>
PORT=8080 node network/dev-server.mjs
```

브라우저: `http://127.0.0.1:8080/?test=1` → 프로필(Tony/Kai) → Together.

`npm start`는 학습 솔로만 되고 시그널링이 없습니다.

통과한 자동 테스트를 처음부터 전부 다시 돌리지 마세요. 이번에 손댄 모듈만:

```bash
node --test tests/coop.test.mjs tests/multiplayer.test.mjs tests/raid.test.mjs
```

브라우저(Playwright, 같은 PC 두 컨텍스트):

```bash
node tests/browser-duel.mjs
node tests/browser-raid.mjs
node tests/browser-dungeon.mjs
node tests/browser-tag.mjs
```

---

## 핵심 파일

| 경로 | 역할 |
|---|---|
| `web/multiplayer-model.js` | 1v1 / 4인 2v2. PROTOCOL, GAME, validSnapshot, validSeq export |
| `web/raid-model.js` | 2인 보스 레이드 |
| `web/coop-model.js` | 던전 + 태그 |
| `web/rewards.js` | schema2, craftPack, shop, discovery, spark, rewardDungeon/Tag/Raid |
| `web/multiplayer.js` | Together UI. 4모드, 상점, esc HTML 이스케이프 |
| `web/multiplayer-transport.js` | WebRTC DataChannel, 시그널링 HTTP |
| `web/multiplayer.html` / `multiplayer.css` | Together 페이지 |
| `web/app.js` | 홈 Together 카피, 팩 DUPLICATE/Spark, 컬렉션 오라, Discovery 이름, persist syncDiscovery |
| `network/dev-server.mjs` | 정적 `web/` + `/api/rooms` |
| `network/signaling.mjs` | 메모리 방, SDP만, 로비 stale 20초 |
| `tests/coop.test.mjs` | 던전/태그/상점/스파크/Discovery |
| `tests/browser-dungeon.mjs` / `browser-tag.mjs` | Playwright 완주 |
| `.openai/hosting.production-reference.json` | 참고만. 활성 배포 설정 아님 |

학습/도감/오디오는 기존 v8 유지. `web/audio/` 에 mp3 1161개.

---

## 검증 상태

자동: 기존 학습 32 + 멀티 7 + 시그널 2 + 레이드 3 + 협동 5 = **49**.  
이번 세션에서 재실행한 것: 멀티+레이드+협동 15/15 PASS. 학습 32와 시그널 2는 해당 모듈 미변경으로 생략.

브라우저(같은 머신 두 컨텍스트, 진짜 WebRTC):
- 1v1 완주 ack 2/2
- Electric 1★ 레이드 완주
- Forest 던전 클리어
- Tag vs 2 AI 승리 (Pikachu·Charizard 0 HP)

스크린샷: ZIP 안 `screenshots/`

**real two-device same-Wi-Fi validation not completed.**  
호스트 실기기 새로고침 / 실네트워크 60초 단절 / 실제 4기기 2v2 미검증.  
cloud signaling 없음. 공식 배포 없음.

---

## 다음 작업 우선순위

1. 사용자가 같은 Wi-Fi 실제 2기기로 연결해 보게 지원. 배포는 승인 전 금지.
2. 호스트 새로고침·60초 단절을 실브라우저로 확인.
3. 4인 **사람** 2v2 실기기. 태그로 대체하지 말 것.
4. 일반(비-sandbox) 프로필의 레이드 최초클리어 24종 경로 확인.

건드리지 말 것: Year1–6 학습 데이터, Molly 오디오 생성물, pack odds, 솔로 +20XP, 310 도감 목록.

---

## ZIP 구성

- `LATEST_SOURCE.zip` — 이 폴더 전체(오디오 1161 포함). 진짜 전체본.
- 오디오가 커서 GPT 업로드가 안 되면 `web/audio/*.mp3`만 빼고 올려도 코드 작업은 가능합니다. 오디오 매니페스트와 경로는 그대로 두세요.
