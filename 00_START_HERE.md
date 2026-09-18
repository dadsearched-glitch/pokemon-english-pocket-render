# 먼저 읽기 — 멀티플레이 작업본 (Phase 3–5까지) 전체본

공식 v8 출시 ZIP이 아니라 그 위 작업본 **전체**입니다.

읽는 순서:
1. `GPT_HANDOFF_V8_TOGETHER_KO.md` — GPT/다음 AI용 한 장 요약
2. `CONTINUE_PROMPT_KO.txt` — 다음 채팅 첫 메시지에 그대로 붙여 넣기
3. `WORK_HANDOFF_CONTINUE.md`
4. `TEST_REPORT.md`
5. `CHANGELOG.md`

현재: Together 1v1 / 4인 2v2 모델, 2인 레이드, 2인 던전, 2인 vs 2 AI 태그, Duplicate Spark, 메달 상점, Discovery 실해금.

공식 사이트는 변경/배포하지 않았습니다.

로컬 확인: 이 폴더에서 `PORT=8080 node network/dev-server.mjs` → `/?test=1` → 프로필 → Together.
`npm start`는 시그널링이 없어 멀티가 안 됩니다.
