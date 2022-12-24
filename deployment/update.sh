#!/bin/bash
# start by shutting down current containers
docker compose down -v
# update the code
git pull origin master

# build and start the containers
docker compose --env-file .env build
docker compose --env-file .env up -d
