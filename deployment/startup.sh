#!/bin/bash
# start by shutting down current containers
docker compose down -v
# start the containers
docker compose --env-file .env up -d