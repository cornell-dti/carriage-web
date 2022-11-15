# STAGE 1: BUILD DEVELOPMENT BASE IMAGE
# To test the development server locally only, remove 'AS builder' from the line below; and uncomment the line that reads 'CMD ["npm", "start"]'. Then, comment out all of STAGE 2

# pull the base image
FROM node:19-bullseye

# set the working direction
WORKDIR /app

# add env variables
ENV PATH /app/node_modules/.bin:$PATH
ENV CHOKIDAR_USEPOLLING true

# install app dependencies
COPY package*.json ./
RUN npm install

# copy source code and install and build
COPY . ./
RUN npm install
RUN tsc --build
RUN npm run build

# optionally: run the app locally on port 3001
CMD ["npm", "start"]

# # STAGE 2: BUILD PRODUCTION IMAGE

# # pull the base image
# FROM nginx:latest

# # Set working directory to nginx resources directory
# WORKDIR /usr/share/nginx/html

# # Remove default nginx static resources
# RUN rm -rf ./*

# # Copies static resources from builder stage
# COPY --from=builder /app/build .

# # Replace default nginx configuration with custom configuration
# WORKDIR /etc/nginx/conf.d
# RUN rm default.conf
# COPY --from=builder /app/default.conf .

# # Containers run nginx with global directives and daemon off
# ENTRYPOINT ["nginx", "-g", "daemon off;"]