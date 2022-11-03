# stage one: build development base image

FROM node:lts-alpine as builder

# install dependencies
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install

# install pm2 for prod server
RUN npm install pm2 -g

# copy source code and install and build
COPY . .
RUN npm install
RUN npm run tsc

# stage two: build production image

FROM node:lts-alpine

WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY --from=builder /usr/src/app/build ./

# deploy on port 3001 with pm2
EXPOSE 3001
CMD [ "pm2", "start", "app.js" ]
# CMD [ "npm", "start" ] # old way