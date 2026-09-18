#!/bin/sh
# Preview contract: always bind the playable Pocket English server on 0.0.0.0:8080.
set -eu
cd /workspace/pocket
if curl -sf -o /dev/null --max-time 2 http://127.0.0.1:8080/; then
  exit 0
fi
PORT=8080 node network/dev-server.mjs >/tmp/pocket-dev-server.log 2>&1 &
pid=$!
for i in 1 2 3 4 5 6 7 8 9 10; do
  if curl -sf -o /dev/null --max-time 1 http://127.0.0.1:8080/; then
    exit 0
  fi
  sleep 0.3
done
echo "Pocket English server failed to start" >&2
cat /tmp/pocket-dev-server.log >&2 || true
wait "$pid" || true
exit 1
