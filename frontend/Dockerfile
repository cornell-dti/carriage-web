# STAGE 1: BUILD DEVELOPMENT BASE IMAGE
# To test the development server locally only, remove 'AS builder' from the line below; and uncomment the line that reads 'CMD ["npm", "start"]'. Then, comment out all of STAGE 2

# pull the base image
FROM node:16 AS builder

# set the working direction
WORKDIR /usr/src/frontend

# add env variables
ENV PATH /node_modules/.bin:$PATH
ENV CHOKIDAR_USEPOLLING true

# TEMPORARY FIX ONLY: disable type checking
ENV TSC_COMPILE_ON_ERROR=true
ENV ESLINT_NO_DEV_ERRORS=true
ENV DISABLE_ESLINT_PLUGIN=true
ENV NPM_FLAGS --legacy-peer-deps

# add app and install dependencies
COPY . .
RUN npm install
COPY . .
RUN npm run build
COPY . .

# or, just serve the app temporarily
# EXPOSE 3000
# RUN npm install -g serve
# CMD ["serve", "-s", "build"]