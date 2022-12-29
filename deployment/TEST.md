# Testing

This should be relatively easy.

First, uncomment the following block in the Dockerfile in the frontend folder:

```
# or, just serve the app temporarily
# EXPOSE 3000
# RUN npm install -g serve
# CMD ["serve", "-s", "build"]
```

Then, comment out the entire `web` block in the docker-compose.yml file.

```
web:
    image: nginx:stable-alpine
    ports:
      - '80:80'
      - '443:443'
    volumes:
      - ./frontend/certbot:/etc/letsencrypt
      - ./frontend/certbot/www:/var/www/certbot/
      - ./frontend/default.conf:/etc/nginx/conf.d/my-site.conf.template
      - build-data:/usr/share/nginx/html
    environment:
      - DOMAIN=${DOMAIN}
    command: /bin/sh -c "envsubst '$${DOMAIN}'< /etc/nginx/conf.d/my-site.conf.template > /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"
    depends_on:
      - frontend
    restart: always
    networks:
      - networkone
```

Finally, run the following commands:

Build: `docker compose --env-file .env build`

Run: `docker compose --env-file .env up`