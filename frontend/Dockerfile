# Use an official Node.js runtime as the base image
FROM node:14

# Set the working directory in the container to /app
WORKDIR /app

# Copy the contents of the frontend directory to the container
COPY frontend/src /app

# Copy the base tsconfig.json file and the frontend's tsconfig.json file to the container
COPY ../tsconfig.base.json /app
COPY . .
COPY ./tsconfig.json /app

# Install the dependencies
RUN npm install

# Build the frontend
RUN npm run build

# Start the frontend
CMD [ "npm", "start" ]
