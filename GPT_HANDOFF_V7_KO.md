> Latest review update (2026-09-15): v7 now uses Molly only at the user's request. Mitchell selection/audio removed; old voice preferences migrate to Molly without changing profile records. See V7_BROWSER_REVIEW.md for current evidence. Earlier dual-voice statements below are historical.

# Pokémon English Pocket — v7 개발 인계

작성일: 2026-09-15 · 기준: v6에서 분기해 자동 테스트/빌드 검증을 완료한 v7 소스. 아직 공개 사이트 재배포 및 실제 아이 태블릿 검증 전.

## 현재 핵심 결정

- 새 설치는 Tony/Kai 고정 버튼 대신 **최대 5개 로컬 프로필**을 만든다.
- 새 프로필은 이름과 기본 Year 3 / 4 / 5를 고른다.
- 기존 v6 Tony/Kai 저장이 있으면 자동 마이그레이션한다. Tony 기본 Year 4, Kai 기본 Year 3 및 Tony 기존 Year 5 학습 기록을 보존한다.
- 카드·중복 카드·XP·팩·도감·전투 기록은 프로필별이며 학년 변경과 별도로 유지한다.
- 각 프로필 안의 Year 3/4/5 학습 진도는 독립 보존한다.
- Speaking은 세 학년 모두 **주어진 문장 따라 말하기**만 유지한다. 정밀 발음/음소 채점이나 자유대화는 없다.
- PIN/GPT 로그인/계정/클라우드 저장은 추가하지 않는다.

## v7 추가 기능

1. EX 이상 카드 공개 시 강한 배경 glow/반짝임/radiance. 일반 카드는 기존의 조용한 공개 연출 유지.
2. 전투 Full 효과에 타입별로 실제 형태가 다른 공격 VFX와 강화된 카메라/타격감 추가. 기존 전투 계산은 변경하지 않음.
3. 760px+ 태블릿에서 최대 1080px wide UI. 전투는 arena + side console 구도.
4. 힌트/오답 뒤 정답을 independent recall과 구분. 도움 후 정답은 즉시 숙달하지 않고 같은 Vocabulary/Review 세션 끝에서 no-hint 재시험.
5. Settings에 active Year의 간단 Parent learning snapshot.
6. 25/50/100/150/200/250/310 unique-card Discovery Goals. 보상/확률 변화 없음.

## 보존된 v6 범위

- 72단원, 288개 핵심 어휘
- Molly/Mitchell 고정 음성 1,250개
- v5 그래픽 기반과 v6 시네마틱 전투 구조
- A1 286 카드 + 기존 24 카드 = 310종
- 팩 보장/확률, XP, 전투 에너지·공격·방어·교체·승리 보상
- 일반/부모 테스트 저장 분리

## 검증 상태

- `npm test`: 25/25 통과
- 모든 JS source/test `node --check` 통과
- `npm run build` 성공, `web/`과 `dist/` 일치
- 로컬 Node server HTTP 200 확인
- Chromium CSS engine에서 390/768/1024px 샘플 레이아웃과 v7 CSS 파싱 확인
- 단, 이 작업 환경 Chromium은 관리 정책으로 모든 URL navigation이 차단되어 전체 UI의 실제 브라우저 클릭 플레이는 수행하지 못함
- 실제 아이 태블릿, 실제 마이크, 장시간 성능/발열, 전체 오프라인은 여전히 미검증

세부사항은 `UPGRADE_V7.md`, `VALIDATION_V7.md`, 기존 `VALIDATION.md`를 본다. 현재 공개 v6를 이전 버전으로 되돌리거나 완료 검증을 처음부터 반복하지 않는다.
