# stage one: build development base image

FROM node:16-alpine as builder

# set workdir
WORKDIR /usr/src/server

# add env variables
ENV PATH /node_modules/.bin:$PATH

# TEMPORARY FIX ONLY: disable type checking
ENV TSC_COMPILE_ON_ERROR=true
ENV ESLINT_NO_DEV_ERRORS=true

# install dependencies
COPY package*.json ./
RUN npm install

# copy source code and install and build
COPY . ./
RUN npm run tsc
COPY . ./
# deploy on port 3001 with pm2
EXPOSE 3001

# run"
CMD ["npm", "start"]