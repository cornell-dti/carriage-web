#!/bin/bash
# start off by copying the initial conf and launching docker
cp .conf1 frontend/default.conf
docker compose build
docker compose up -d

# run certbot setup
docker compose run --rm  certbot certonly --webroot --webroot-path /var/www/certbot/ -d DOCKERTODO.DOMAIN.COM --non-interactive --agree-tos -m DOCKERTODOcontact@my-site.com
# add crontab to renew certs
crontab -l | { cat; echo "0 0 1 * * /bin/bash cd /root/carriage-web && docker compose run --rm certbot renew"; } | crontab -
# stop containers and remove them
docker compose down -v
y | docker system prune -a

# copy the new conf and launch docker
cp .conf2 frontend/default.conf
docker compose build --no-cache
docker compose up