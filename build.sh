#!/bin/bash
set -e

export MY_UID=$(id -u)
export MY_GID=$(id -g)
docker compose run --rm app bun install --frozen-lockfile --ignore-scripts
docker compose run --rm app bun run build
docker compose restart app
