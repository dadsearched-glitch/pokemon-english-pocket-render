# Render Web Service 배포

이 프로젝트는 `network/dev-server.mjs`가 `web/` 정적 게임과 `/api/rooms` memory signaling을 같은 origin에서 제공합니다. Render에서는 별도 frontend 정적 서비스나 외부 signaling을 만들지 않습니다.

## Render 설정

- Build Command: `npm install`
- Start Command: `npm run together`
- Health Check Path: `/`
- `PORT`는 Render가 주입하며 서버는 `process.env.PORT || 4190`을 사용합니다.
- 서버는 `0.0.0.0`에 bind합니다.

Molly 음성은 `web/audio/`에 포함된 MP3와 `web/audio-manifest.json`을 통해 같은 origin에서 제공됩니다. 브라우저는 signaling을 `/api/rooms` 상대 경로로 호출하므로 배포 URL에서 frontend와 signaling이 일치합니다.

## 제한사항

Signaling room과 WebRTC negotiation queue는 메모리에만 있습니다. Render free instance가 sleep하거나 재시작되면 방과 진행 중인 signaling 상태가 사라집니다. 영구 room, 계정, cloud signaling 또는 서버 권위 경제는 추가하지 않았습니다. 로컬 프로필/보상 저장도 기존처럼 브라우저 `localStorage`입니다.

이 저장소는 production 배포를 자동 실행하지 않습니다. 배포 전 Render URL에서 게임 로딩, Molly MP3 요청, Create Room, Join Room, WebRTC, Raid, PvP를 직접 확인해야 합니다.
