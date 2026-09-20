# Known issues

- Real-device LAN validation (two or four physical devices) is **UNVERIFIED** in this environment.
- Cloud deployment and Render smoke testing are **UNVERIFIED**; the production entry point is wired to `npm run together`.
- Relay rooms remain in-memory and expire on server restart; no durable room history is intended.
- Browser-specific reconnect UX still needs a physical-device pass.
