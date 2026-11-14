#!/usr/bin/env bash
set -euo pipefail

TAG="${1:?usage: deploy.sh <image-tag>}"
APP_DIR="${APP_DIR:-$HOME/readly}"
IMAGE="ghcr.io/bioneisme/reading"
export DOCKER_CONFIG="$APP_DIR/.docker"

cd "$APP_DIR"
test -f .env || { echo ".env is missing in $APP_DIR"; exit 1; }

if [ -n "${GHCR_TOKEN:-}" ]; then
  echo "$GHCR_TOKEN" | docker login ghcr.io -u "${GHCR_USER:-bioneisme}" --password-stdin >/dev/null
fi

export IMAGE_TAG="$TAG"
if [ -z "${SKIP_PULL:-}" ]; then
  docker compose pull web
fi
docker compose up -d --remove-orphans web

for i in $(seq 1 30); do
  if curl -fsS http://127.0.0.1:3030/api/health >/dev/null; then
    echo "healthy: $(curl -fsS http://127.0.0.1:3030/api/health)"
    echo "$TAG" > .last-deployed
    docker images "$IMAGE" --format '{{.Tag}}' | grep -vE "^($TAG|latest)$" | tail -n +3 | xargs -r -I{} docker rmi "$IMAGE:{}" >/dev/null || true
    exit 0
  fi
  sleep 2
done

echo "health check failed"; docker compose logs --tail=80 web
exit 1
