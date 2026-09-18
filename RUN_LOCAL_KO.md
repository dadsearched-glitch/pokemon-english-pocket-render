# 로컬 실행 방법

학습만 볼 때는 정적 서버로 충분합니다.

```bash
node server.mjs
```

브라우저: `http://localhost:4177`

Together(1대1 / 4인 2대2 / 2인 레이드)는 시그널링이 필요합니다.

```bash
node network/dev-server.mjs
```

기본 주소: `http://localhost:4190` (또는 `PORT=8080`). `/?test=1`에서 프로필을 고른 뒤 Together.

`npm start` / `server.mjs`만으로는 멀티플레이가 동작하지 않습니다.

테스트를 직접 돌리려면:

```bash
npm test
```

## 중요

- `index.html`을 `file://`로 열지 마세요.
- 일반 게임과 `?test=1` 저장은 분리되어 있습니다.
- 이 로컬 실행본은 공개 사이트를 자동으로 수정하거나 배포하지 않습니다.
- 같은 Wi-Fi의 다른 기기는 이 컴퓨터의 로컬 IPv4:포트로 접속해야 하며, 방화벽/AP 격리/HTTPS 제약이 있을 수 있습니다.
