#!/bin/bash
# start off by copying the initial conf and launching docker
cp setup.conf ../frontend/default.conf
cd ..
# chown current directory as the user
sudo chown -R $USER:$USER .
docker compose --env-file .env build
docker compose --env-file .env up -d

# get the env vars from .env
source .env

# run certbot setup
docker compose run --rm  certbot certonly --webroot --webroot-path /var/www/certbot/ -d $DOMAIN --non-interactive --agree-tos -m $EMAIL
# stop containers and remove them
docker compose down -v

# copy the new conf and launch docker
cp ./deployment/deploy.conf ./frontend/default.conf
docker compose --env-file .env build
docker compose --env-file .env up
