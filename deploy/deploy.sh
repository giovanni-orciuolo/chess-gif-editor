#!/bin/sh
# Build locally and replace the running container on or2-vps.
set -eu
cd "$(dirname "$0")/.."
npm test
npm run build
tar czf /tmp/chess-deploy.tgz Dockerfile docker-compose.yml deploy dist
scp -q /tmp/chess-deploy.tgz or2-vps:/tmp/
ssh or2-vps 'cd ~/chess-gif-editor && rm -rf dist && tar xzf /tmp/chess-deploy.tgz && rm /tmp/chess-deploy.tgz && docker compose up -d --build'
