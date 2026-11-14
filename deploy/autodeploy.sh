#!/usr/bin/env bash
set -euo pipefail

APP_DIR="${APP_DIR:-/home/deploy/soundout}"
REPO_DIR="$APP_DIR/repo"
REPO_URL="${REPO_URL:-https://github.com/Bioneisme/reading.git}"
BRANCH="${BRANCH:-main}"
IMAGE="ghcr.io/bioneisme/reading"

exec 9>"$APP_DIR/.autodeploy.lock"
flock -n 9 || exit 0

[ -d "$REPO_DIR/.git" ] || git clone -q --branch "$BRANCH" "$REPO_URL" "$REPO_DIR"
git -C "$REPO_DIR" fetch -q origin "$BRANCH"
SHA="$(git -C "$REPO_DIR" rev-parse "origin/$BRANCH")"

[ "$SHA" = "$(cat "$APP_DIR/.last-deployed" 2>/dev/null)" ] && exit 0
[ "$SHA" = "$(cat "$APP_DIR/.last-failed" 2>/dev/null)" ] && exit 0

echo "new commit $SHA: $(git -C "$REPO_DIR" log -1 --format=%s "$SHA")"
git -C "$REPO_DIR" reset -q --hard "$SHA"

fail() { echo "$SHA" > "$APP_DIR/.last-failed"; echo "FAILED at $1"; exit 1; }

docker build -q --build-arg APP_VERSION="$SHA" -t "$IMAGE:$SHA" -t "$IMAGE:latest" "$REPO_DIR" || fail "build (lint/typecheck/tests/next build)"
cp "$REPO_DIR/deploy/docker-compose.yml" "$APP_DIR/docker-compose.yml"
SKIP_PULL=1 APP_DIR="$APP_DIR" bash "$REPO_DIR/deploy/deploy.sh" "$SHA" || fail "deploy/health check"
rm -f "$APP_DIR/.last-failed"
echo "deployed $SHA"
