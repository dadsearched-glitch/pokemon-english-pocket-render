# VS Code Agent — 최종 검증 + 필요한 수정만 수행

이 폴더는 **Pokémon English Pocket 최신 전체본**입니다. 기존 Molly MP3 1,161개도 이미 `web/audio/`에 합쳐져 있습니다. **오디오를 재생성하거나 삭제하지 마세요.**

내가 터미널 명령을 하나씩 할 필요 없도록, 당신이 직접 검사·실행·수정·재검증하세요.

## 절대 보존
- Year 1~6 학습 데이터 / Molly 음성
- 카드팩 확률과 5장 transaction
- 310장 도감
- Solo Battle 및 +20 XP
- 실제 사람 1v1, 실제 사람 최대 4명 2v2
- Raid / Dungeon / Tag(2 human vs 2 AI)
- 저장/백업복원
- PvP Pack Shard 0
- 협동 일일 첫 성공 Pack Shard 규칙
- production 배포 금지
- 임의 cloud signaling/외부 서비스 추가 금지

## 1. 먼저 자동검증
프로젝트 루트에서 `npm test`를 실행하세요.
이 전체본에서는 **58/58 PASS가 기준**입니다.

그 다음 Playwright가 없으면 개발검증용으로만 설치하세요:

`npm install --no-save --package-lock=false playwright`
`npx playwright install chromium`

그 후 아래 한 명령으로 자동 브라우저 검증을 실행하세요:

`npm run verify:all`

`tools/vscode-verify.mjs`는 unit/integration test 후 multiplayer dev/signaling server를 띄우고 lobby, 1v1, raid, dungeon, tag, 4-human 2v2 브라우저 테스트를 순서대로 실행합니다.

실패하면 로그/스크린샷을 근거로 **필요한 최소 수정만** 하고 다시 전체 검증하세요.

## 2. 기획 대비 남은 부분 확인/수정
현재 코드에서 이미 구현된 기능을 다시 만들지 마세요.

특히 **Team Bond**를 확인하세요. 현재 save/reward 코드에는 pair별 `xp`와 `level 1~5`가 존재하고 협동 보상에서 증가하지만, 실제 UI/해금 효과가 충분히 연결되어 있는지 확인하세요.

부족하면 기존 schema를 갈아엎지 말고 다음만 완성하세요:
- Together/Rewards 화면에 파트너 이름, Bond Lv, XP 진행 표시
- Lv1 기본 Team Attack
- Lv2 Team nameplate/시각효과
- Lv3 alternate Team/Duo visual
- Lv4 Cheer/Rescue 소폭 개선
- Lv5 Raid 시작 Team Gauge 소폭 보너스
- PvP damage/HP에는 영향 금지
- 관련 unit/integration test 추가

## 3. reconnect 검증 보강
실제 브라우저 자동검증으로 가능한 범위에서 다음을 검사하고, 테스트가 없다면 추가하세요.
- Guest reload 후 상태 복구
- Host reload 후 상태 복구
- 짧은 연결단절 후 재연결
- 60초 단절 후 abandoned 처리
- reload/reconnect 후 같은 `matchId` 보상 중복 없음
- 양쪽 HP/turn/result/reward 상태 일치

## 4. 같은 Wi-Fi 실기기 준비
`network/dev-server.mjs`가 `0.0.0.0:4190`에서 동작하는지 확인하세요.
가능하면 서버 시작 로그에 사용자가 휴대폰에서 열기 쉬운 **LAN URL**도 표시되게 개선하세요(예: `http://192.168.x.x:4190`).

하지만 당신이 실제 휴대폰 2대를 직접 조작하지 못했다면 절대로 실기기 검증 완료라고 쓰지 말고:

`real two-device same-Wi-Fi validation not completed`

라고 보고하세요.

실기기 수동 검증 목표는:
Create Room → 두 번째 기기 Join → 승인 → Ready → 1v1 완주 → Raid 완주 → reconnect → 양쪽 상태 일치 → reward 중복 없음.

## 5. 완료 기준
모든 수정 후 다시:
- `npm test`
- `npm run verify:all`

을 실행하세요.

마지막에 `VSCODE_FINAL_TEST_REPORT.md`를 생성해서 다음만 간단히 정리하세요:
- 변경 파일
- unit/integration 결과
- Playwright 결과
- Team Bond 상태
- reconnect 상태
- same-Wi-Fi 실기기 검증 여부
- 남은 제한사항

그리고 수정된 전체 프로젝트를 ZIP으로 만들어 주세요.

새 기능/새 Phase를 임의로 추가하지 마세요. 지금 목표는 **현재 완성본을 검증하고, 확인된 부족분만 마무리하는 것**입니다.
