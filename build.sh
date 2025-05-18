#!/bin/bash
set -e

docker compose run --rm app bun install --frozen-lockfile --ignore-scripts
docker compose run --rm app bun run build
docker compose restart app
