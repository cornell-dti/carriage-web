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
RUN pm2 install typescript

# install dependencies
COPY package*.json ./
RUN npm install

# copy source code and install and build
COPY . .
# RUN npm install
RUN npm run tsc

# # stage two: build production image

# FROM node:lts-alpine

# WORKDIR /usr/src/app
# COPY package*.json ./
# RUN npm install
# COPY --from=builder /usr/src/app/build ./

# optionally, install nodemon for testing
# RUN npm install -g nodemon

# deploy on port 3001 with pm2
EXPOSE 3001

# EXPOSE 443
# RUN nodemon --exec \"ts-node\" app.ts

# CMD ["node", "app.js"]
# CMD ["pm2", "start", "app.js"]
CMD ["pm2-runtime", "app.ts"]