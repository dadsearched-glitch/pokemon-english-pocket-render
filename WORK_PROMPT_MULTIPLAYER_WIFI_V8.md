# Work 실행 프롬프트 — v8 멀티플레이 + 보상 + 같은 Wi-Fi 실기기 연결

첨부한 최신 **v8 완성본 ZIP**을 기준으로 작업하세요.

먼저 아래 3개 문서를 읽고 구현 명세로 사용하세요.

1. `WORK_HANDOFF_MULTIPLAYER_REWARDS_V8.md`
2. `MULTIPLAYER_RESEARCH_AND_ECONOMY_NOTES.md`
3. `WORK_START_MULTIPLAYER_REWARDS_V8.txt`

## 핵심 원칙

- 현재 완성된 Year 1~6 학습, Molly 오디오, 카드팩, 310장 도감, 솔로 전투, 가오레풍 시네마틱 전투 연출, 프로필/저장/백업복원은 유지하세요.
- 기존 게임을 다시 만들지 말고 **현재 v8 위에 멀티플레이와 보상 시스템만 확장**하세요.
- 각 플레이어는 자기 현재 Year 수준에 맞는 영어문제를 받게 하세요.
- Year가 낮다고 전투에서 더 유리해지는 속도경쟁 구조는 피하고, PvP는 번갈아 턴 방식으로 구현하세요.
- 영어문제를 읽는 동안 전투 이펙트가 선택지를 가리지 않게 하세요.
- 기존 pack odds, pack transaction, solo battle +20 XP는 유지하세요.
- 기존 Year 1~6 학습데이터는 이번 작업에서 수정하지 마세요.

## 반드시 같은 Wi-Fi의 실제 두 기기에서 연결

최종 목표는 **Tony와 Kai가 같은 Wi-Fi에 연결된 서로 다른 휴대폰/태블릿 2대에서 브라우저로 방을 만들고 참가해 실제로 플레이하는 것**입니다.

- `Create Room → Join Room`이 서로 다른 실제 기기에서 동작해야 합니다.
- 같은 브라우저의 두 탭이나 한 기기 시뮬레이션만으로 완료 처리하지 마세요.
- 같은 Wi-Fi라는 이유만으로 자동 통신된다고 가정하지 마세요.
- `BroadcastChannel`을 두 휴대폰 간 통신 방식으로 사용하지 마세요.
- **WebRTC RTCDataChannel + 임시 signaling 구조**를 우선 검토하세요.
- 방 생성 시 6자리 코드 또는 QR로 참가할 수 있게 하세요.
- 공개 매칭, 채팅, 음성채팅, 위치 공유는 만들지 마세요.
- 음성, speech transcript, 전체 학습문제 내용, 전체 프로필 저장데이터를 멀티플레이 서버나 상대 기기로 보내지 마세요.
- 전투에 필요한 최소 JSON 상태만 교환하세요.
- 연결이 끊기면 일정 시간 reconnect를 시도하고 상태를 다시 동기화하세요.
- 두 기기 게임/protocol 버전이 다르면 세션을 시작하지 말고 버전 불일치를 안내하세요.
- 현재 `chatgpt.site` 배포가 signaling endpoint를 지원하지 않는다면, 임의의 외부 서비스를 몰래 추가하지 말고 **필요한 별도 signaling 배포구조를 먼저 보고**하세요.

## 구현 순서

### Phase 1
- Together 메뉴
- Create Room / Join Room
- 실제 2-client 연결
- 1:1 Trainer Duel
- Adventure Medal
- `matchId` 기반 중복보상 방지

### Phase 2 — 최우선
- 2인 Boss Raid
- Team Gauge / Team Attack
- Boss Shield
- Knockout 후 Cheer / Rescue
- 1~5성 Raid
- Adventure Medal
- Pack Shard
- Team Bond
- Boss Badge
- 신규 프로필에 기존 획득 경로가 없다면 24 legacy Adventure Cards를 Raid 최초 클리어 확정 보상으로 연결

### Phase 3
- Co-op Dungeon
- 공유 deterministic map
- 런 전용 임시 아이템
- 영구 PvP 스탯에는 영향 없게

### Phase 4
- Duo Tag Battle
- Tony + Kai 2명 vs AI 2명
- Tag Chain / Duo Move

### Phase 5
- Duplicate Spark
- 중복카드 삭제 없이 카드/전투 시각효과 해금
- Adventure cosmetic shop
- 기존 Discovery milestone `25/50/100/150/200/250/310`에 실제 cosmetic reward 연결

## 보상 경제

- **학습이 카드팩 획득의 가장 빠른 루트**여야 합니다.
- 멀티에서 full pack을 자주 지급하지 마세요.
- `Pack Shard 5개 → 기존 normal pack 1개`
- 일반 PvP에서는 Pack Shard를 지급하지 마세요.
- PvP 예시: 승자 3 Medal / 상대 2 Medal
- 카드나 XP를 상대에게서 빼앗지 마세요.
- Team Bond는 PvP 공격력 증가가 아니라 co-op 기능/연출 중심으로 사용하세요.
- Duplicate는 카드 삭제/소모 없이 Spark 가치로 전환하세요.

## 작업 시작 전 짧은 보고

편집 전에 아래만 간단히 보고하고 바로 구현하세요.

1. 기준 소스/버전
2. 현재 static deployment 구조
3. 실제 두 기기 연결 방식
4. signaling 배포 가능 여부
5. save schema 및 migration 계획
6. 24 legacy card 현재 획득경로 확인
7. 수정/추가 파일
8. Phase별 구현 계획

## 검증

기존 테스트는 계속 통과해야 하고, 새로 다음을 검증하세요.

- 멀티 protocol/state sync
- 1:1 전투
- Raid / Team Attack / Shield / Cheer
- legacy first-clear reward
- Pack Shard
- Dungeon
- Tag Battle
- Duplicate Spark
- 저장 migration
- backup/restore
- `matchId` 중복보상 방지
- normal mode / test mode 분리

### 실제 same-Wi-Fi 검증

가능하면 최소한 다음을 실제 기기 2대로 확인하세요.

1. 기기 A에서 방 생성
2. 기기 B에서 코드 참가
3. 양쪽 Ready
4. 1:1 완주
5. Boss Raid 완주
6. 한쪽 잠깐 끊김 후 reconnect
7. 양쪽 HP/턴/보상 상태 일치
8. 동일 `matchId` 보상 중복 없음

실제 휴대폰 2대로 확인하지 못했다면 반드시:

**`real two-device same-Wi-Fi validation not completed`**

라고 명확히 보고하고, 실기기 검증 완료라고 주장하지 마세요.

## 완료 시 제공

- 최신 전체 소스 ZIP
- 변경파일 목록
- networking/signaling 구조
- save migration 설명
- 보상경제 구현 내용
- 자동테스트 결과
- 브라우저 테스트 결과
- 실제 두 기기 테스트 여부
- 알려진 제한사항

## 배포 및 사용량

- 새 production 배포는 제가 별도로 승인하기 전까지 하지 마세요.
- Work 사용량이 **10~15% 이하**로 내려가면 새로운 Phase를 시작하지 말고 현재 상태를 안전하게 정리하세요.
- 그 시점에는 다음 파일을 만들어 주세요:
  - `LATEST_SOURCE.zip`
  - `WORK_HANDOFF_CONTINUE.md`
  - `CHANGELOG.md`
  - `TEST_REPORT.md`
