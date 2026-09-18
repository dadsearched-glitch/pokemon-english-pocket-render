# 먼저 읽기 — Year 1~6 학습 확장 인계
## 상태
2026-09-16 작업 중 인계. 구현과 주요 기능 검증은 진행했으나 최종 교육적 검토/출시 승인은 미완료.
사용자가 다른 Chat/AI에서 이어서 진행하도록 요청하여 여기서 작업을 멈추고 패키징했다.
공개 사이트는 v7.1.1 그대로이며 이 작업본은 배포하지 않았다.
공개 URL: https://tony-kai-pocket-adventure.khl8706.chatgpt.site/
베이스 커밋: 13a7f48186b43d771b775ec8483b62ae373d74fb
작업본 표시 버전: v8.0.0-learning-preview · 2026-09-16
이 문서가 오래된 README/GPT_HANDOFF_V7/VALIDATION 문서보다 우선한다.

## 완료한 구현
- 최신 그래픽/배치 옵션/설치 메뉴/느려진 특수기 연출을 포함하는 v7.1.1에서 별도 작업본 생성.
- Year 1,2,6 각각 24단원 신규 작성. Year 3,4,5는 기존 내용을 기반으로 조정.
- 총 144단원, 학년당 핵심 단어 96개, 전체 중복 없는 576개. 첨부 JSON과 정확히 일치.
- 각 단원 핵심어 한글 뜻/쉬운 영어 정의, 타깃 문장 2개, 지문, 독해 2문항, 듣기 선택지 작성.
- Year 1 지문 24~27단어, Y2 33~40, Y3 41~59, Y4 57~74, Y5 65~77, Y6 82~96.
- 타깃 문장 길이: Y1 4~5, Y2 5~6, Y3 5~11(예외 포함), Y4 6~9, Y5 7~11, Y6 9~10.
- Y3 핵심어 유지, Unit1 지문에 신뢰/반납 맥락 추가.
- Y4 후반 8개 지문 간결화, 일부 긴 문장 축약. U1~8 한글 선택지, U9~16 영어 정의+기본 열린 한글 힌트, U17~24 요청 시 힌트.
- Y5 precaution→warning, significance→importance, assumption→theory, contradict→question, counterargument→viewpoint, transferable→apply. 해당 문장/지문/선택지도 조정. 짧은 지문에 이해를 돕는 맥락 추가.
- Y6 비교, 관점, 근거, 실험, 광고의 신뢰성/편향 등 초등학생 맥락. 자유 말하기/발음 점수 없음.
- 프로필 생성 및 설정에서 Y1~6 선택. 부모 기본 Tony Y4/Kai Y3 유지.
- 부모 테스트에 학년/단원/6단계 학습 바로가기 추가. 기존 팩/전투 도구 유지.
- 학년 완료 후 다음 학년 제안 Y5→Y6까지 확장. 확인 없는 자동 전환 없음.
- 학년별 levelSchema 2, learningDataRevision 보관. 기존 완료 단원/단계/카드/XP/팩/전투 기록 유지.
- 변경된 단원의 진행 중 partial만 별도 기록(contentMigrationHistory)에 보관 후 비움.
- 이전 Y5의 교체된 6단어 복습 기록은 legacyVocabulary로 보관. 새 단어 숙달로 복사하지 않음.
- 기존 legacyLearningV5 보존. 옛 글로벌 과정 버전 변경 시 전 학년 초기화하던 로직 제거.
- 신규 프로필은 생성 즉시 현재 학습 revision을 받아 첫 재접속 시 partial이 지워지지 않음.
- Y4 초반 한글 뜻 문제의 hintOpen이 잘못 true여서 도움 사용으로 분류되던 문제 수정.
- 모든 음성 Molly(en-NZ-MollyNeural) 전용. 신규/변경 문장 MP3 생성 완료.

## 음성 인벤토리
HANDOFF_INVENTORY.json에 실제 패키징 시점 수치:
- 학습 발화 1,008개 / 필요한 MP3 1,008개 / 누락 0.
- 과거 호환/전투 기술/인사 포함 manifest 1,161개 / MP3 1,161개.
- 기기 TTS로 대체하지 않았고 Mitchell 생성하지 않음.
- generate_course_audio.py는 기존 성공 파일을 재사용하며 새 문장만 생성한다.
- 모든 MP3를 사람이 청취한 것은 아님. 자동 존재/크기 검사와 브라우저 샘플 재생만 확인.

## 실제 완료한 검증 — 무의미하게 반복하지 말 것
### 자동
1. 최초 기존 27개 검사 실행: 카드/팩/전투 등 회귀 통과. 실패는 새 학년 길이 기준, 변경된 migration 기대값, 생성 중 음성 때문.
2. 변경 기준에 맞춰 tests/course.test.mjs, tests/v6.test.mjs의 옛 기대값 수정. 삭제/스킵하지 않았음.
3. tests/y1-y6.test.mjs 추가:
   - 144단원과 공식 제공 어휘표 정확 일치, 576중복 없음.
   - 모든 단원 6단계 문제 구조, 선택지 중복 없음, 정답 존재, 주어진 문장 Speaking.
   - 학년별 6단계 보상/JSON복원/학년 독립.
   - 기존 완료 기록/글로벌 보상 보존, 변경 partial 보관, 옛 Y5어휘 별도 보존.
   - 힌트 언어/학년 경계, 부모 기본 학년.
   - 새 프로필 첫 reload partial 보존.
4. course + y1-y6 11개 통과(당시 신규 reload 검사 추가 전).
5. 음성 생성 후 v6 + model 9개 통과.
6. 마지막 변경 후 y1-y6 + v6 + v7-review-fixes 10개 통과.
7. JavaScript 구문검사, build 성공.
마지막 변경은 fresh profile revision 초기화. 위 6의 10개 검사가 마지막 성공 확인 지점.
전체 테스트를 마지막 변경 후 일괄 재실행한 기록은 없다. 필요할 때 변경 영향 부분만 재확인.

### 실제 브라우저
로컬 http://localhost:4186/?test=1 에서 공개 저장과 분리된 부모 테스트 기록 사용.
Tony로 각 Y1~Y6 Unit1을 Vocabulary→Listening→Reading→Sentence→Speaking→Review 실제 클릭.
학년마다 Trail complete와 60 XP 확인, 합계 360 XP. 자기 확인 2회/학년, 마이크 사용 안 함.
듣기 Listen 클릭 후 답안 활성화 및 진행 확인. JS error 로그 [].
학년별 시작 시 앞 학년과 섞이지 않음. 기본 Tony Y4/Kai Y3, 생성 폼 6학년 표시 확인.
Y4 초기 실행 때 추가 복습이 생기는 기존 hintOpen 오류를 발견/수정. 수정 후 자동 경계 검사 통과.
테스트 자동화에서 단계 수 고정 가정으로 두 번 중단되었지만 화면 상태 확인 후 남은 단계 이어서 완료.
마지막 fresh-profile revision 수정은 브라우저 검증 이후이며 자동 검사로 검증했다.

## 미완료 / 다음 작업
1. 각 학년 Unit 1/8/16/24의 수동 교육적 검토를 명시적으로 정리:
   지문 근거가 정답을 유일하게 지지하는지, 영어 정의가 순환/동의어 중복으로 애매하지 않은지,
   번역 자연스러움, distractor 난이도, 뉴질랜드 영어 표현.
   모든 데이터의 구조/길이는 검사했지만 이 24개 샘플의 별도 검토표는 아직 없음.
2. 실제 브라우저에서 U8/16/24, Y4 U9/U17 힌트 전환, 일반모드 새 프로필 생성/설정 전환을 추가 샘플링.
   이미 마친 각 학년 U1 전체 흐름은 변경 없으면 반복하지 말 것.
3. 신뢰할 수 있는 synthetic v6/v7 JSON을 브라우저 Restore로 넣는 실증은 이 작업에서 아직 안 함.
   자동 migration 검사는 통과. 실제 아이 저장 데이터는 접근/수정 안 함.
4. 부모 테스트 폼의 선택 연속 조작과 전환 시점 검토:
   transition 중 UI가 다시 렌더링되면 방금 고른 select가 되돌아갈 수 있음(자동화 관찰).
   제출 버튼 활성화 후 선택하면 정상. 개선이 필요하면 로컬에서 최소 수정 후 해당 흐름만 검증.
5. 최종 회귀 파일 비교 및 최종 보고서. 게임 계산/확률을 변경하지 않았지만 마지막 파일별 동등성 보고서는 미작성.
6. package.json은 기존 7.0.0; 앱 표시만 learning preview 8.0.0. 출시 버전 번호는 승인 시 정리.
7. 실제 아이 태블릿, 마이크 인식, 장시간 플레이/발열, 모든 음성 청취는 미검증.
8. 모든 후속 수정은 작성 원본에도 반영하고 필요한 음성만 갱신.
9. 사용자 배포 명시 요청 전까지 절대 배포하지 말 것.

## 소스 구조와 실행
- web/course-content.js: 144단원 생성 결과; COURSE_VERSION은 nz-life-1 유지, DATA_REVISION은 y1-y6-20260916.
- build_learning_data.py: 데이터 생성 원본. baseline-courses.json(Y3/4/5 기존본)을 deep copy 후 조정.
- year1-authoring.txt, year2-authoring.txt, year6-authoring.txt: 새 72단원 작성 원본.
  줄당 1단원; ~로 7필드 분리: 뜻/정의,문장1,문장2,지문,독해1,독해2,듣기.
- Y1_Y6_CORE_WORDS.json/csv: 사용자 제공 최우선 단어표.
- learning-data.json: 생성된 전체 내용, 사람이 검토하기 쉬운 데이터.
- web/learning-level.js, web/course.js: 학년별 저장 및 migration.
- web/model.js: 허용 학년 확장만. 보상/전투 계산 그대로.
- web/app.js: 6학년 UI/부모 테스트 바로가기/표시 버전.
- web/v7.css: 부모 테스트 폼과 학년 버튼 줄바꿈만 추가. 기존 디자인 유지.
- tests/y1-y6.test.mjs: 새 데이터/저장 검증.
- web/audio-manifest.json + web/audio/*.mp3: 실행 음성.
- year4-content.js/year5-support.js는 과거 작성 자료로 남아 있으나 최신 course-content는 자체 데이터이며 직접 import하지 않는다.
- .openai/hosting.json에는 정식 사이트 ID가 그대로 있으므로 절대 자동 배포하지 말 것.
- 첨부된 이전 v6/v7 보고서는 당시 이력이며 이번 완료 근거로 오인하지 말 것.

Node.js만 있으면 실행:
  node build.mjs
  node server.mjs
기본 http://localhost:4177/ ; 부모 테스트 ?test=1.
다른 저장 영역에서 시험하려면 다른 포트 사용:
PowerShell: $env:PORT='4186'; node server.mjs
Bash: PORT=4186 node server.mjs
테스트: node --test tests/y1-y6.test.mjs
데이터 수정 시: python build_learning_data.py
새 음성 필요 시: node audio-list.mjs → python generate_course_audio.py (Python edge_tts 및 네트워크 필요)
마지막에는 node build.mjs. dist는 web에서 재생성되며 원본 편집은 web/작성 데이터에 한다.

## 보존 조건
학습 6단계, 카드 310종/팩확률/XP/전투계산/도감/기존 저장/백업복원 유지.
Molly만, 로그인/PIN 없음, localStorage 기기/브라우저별 저장.
Speaking은 주어진 문장 따라 말하기만. 정밀 발음점수/자유답변 추가 금지.
교육 기준은 보충학습 방향이며 NZ 전체 교육과정 이수/공식 인증을 주장하지 않는다.
공식 참조:
https://newzealandcurriculum.tahurangi.education.govt.nz/5637288579.p
https://newzealandcurriculum.tahurangi.education.govt.nz/nzc---english-phase-2/5637238346.p
