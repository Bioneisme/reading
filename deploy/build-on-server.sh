#!/usr/bin/env bash
set -euo pipefail

HOST="${DEPLOY_HOST:-lab}"
REF="${1:-HEAD}"
SHA="$(git rev-parse "$REF")"
IMAGE="ghcr.io/bioneisme/reading"
BUILD_DIR="/tmp/readly-build-$SHA"

echo "building $SHA on $HOST"
git archive "$SHA" | ssh "$HOST" "rm -rf $BUILD_DIR && mkdir -p $BUILD_DIR && tar -x -C $BUILD_DIR"
ssh "$HOST" "cd $BUILD_DIR && docker build -q --build-arg APP_VERSION=$SHA -t $IMAGE:$SHA -t $IMAGE:latest . && rm -rf $BUILD_DIR"
git show "$SHA:deploy/docker-compose.yml" | ssh "$HOST" "cat > /home/deploy/readly/docker-compose.yml && chown deploy:deploy /home/deploy/readly/docker-compose.yml"
ssh "$HOST" "cat > /home/deploy/readly/deploy.sh && chown deploy:deploy /home/deploy/readly/deploy.sh" < deploy/deploy.sh
ssh "$HOST" "su - deploy -c 'SKIP_PULL=1 bash /home/deploy/readly/deploy.sh $SHA'"
