# stage one: build development base image

FROM node:lts-alpine as builder

# set workdir
WORKDIR /usr/src/app

# add env variables
ENV PATH /app/node_modules/.bin:$PATH

# TEMPORARY FIX ONLY: disable type checking
ENV TSC_COMPILE_ON_ERROR=true
ENV ESLINT_NO_DEV_ERRORS=true

# install pm2 for prod server
RUN npm install pm2 -g
RUN npm install typescript

# install dependencies
COPY package*.json ./
RUN npm install

# copy source code and install and build
COPY . .
# RUN npm install
RUN npm run tsc

# deploy on port 3001 with pm2
EXPOSE 3001

# run
CMD ["nodemon", "--exec", "ts-node", "app.ts"]