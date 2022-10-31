# stage one: build development base image

FROM node:lts-alpine as builder

WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm install
RUN npm run tsc

# stage two: build production image

# FROM node:lts-alpine

# WORKDIR /usr/src/app
# COPY package*.json ./
# RUN npm install
# COPY --from=builder /usr/src/app/dist ./dist
EXPOSE 3001
CMD [ "npm", "start" ]