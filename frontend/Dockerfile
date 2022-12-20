# STAGE 1: BUILD DEVELOPMENT BASE IMAGE
# To test the development server locally only, remove 'AS builder' from the line below; and uncomment the line that reads 'CMD ["npm", "start"]'. Then, comment out all of STAGE 2

# pull the base image
FROM node:19-bullseye AS builder

# set the working direction
WORKDIR /

# add env variables
ENV PATH /node_modules/.bin:$PATH
ENV CHOKIDAR_USEPOLLING true

# TEMPORARY FIX ONLY: disable type checking
ENV TSC_COMPILE_ON_ERROR=true
ENV ESLINT_NO_DEV_ERRORS=true

# # install app dependencies
# COPY package*.json ./
# RUN npm install

# add app
COPY . ./
RUN npm install 
RUN npm run build
COPY . ./
# or, just serve the app lol
EXPOSE 3000
RUN npm install -g serve
CMD ["serve", "-s", "build"]

# # STAGE 2: BUILD PRODUCTION IMAGE

# # pull the base image
# FROM nginx:latest

# # Set working directory to nginx resources directory
# WORKDIR /usr/share/nginx/html

# # Remove default nginx static resources
# RUN rm -rf ./*

# # Copies static resources from builder stage
# COPY --from=builder /build .

# # Replace default nginx configuration with custom configuration
# WORKDIR /etc/nginx/conf.d
# RUN rm default.conf
# COPY --from=builder /default.conf .

# # Containers run nginx with global directives and daemon off
# ENTRYPOINT ["nginx", "-g", "daemon off;"]