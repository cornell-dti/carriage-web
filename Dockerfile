# Base image
FROM node:14-alpine

# Create a directory for the app
WORKDIR /app

# Copy the frontend and server directories to the app directory
COPY frontend /app/frontend
COPY server /app/server

# Copy .env file for the frontend
COPY frontend/.env /app/frontend/.env

# Install dependencies for the frontend and build the app
WORKDIR /app/frontend
RUN npm install && npm run build

# Install dependencies for the server
WORKDIR /app/server
RUN npm install

# Expose port 3000 for the server
EXPOSE 3000

# Start the server
CMD ["npm", "start"]
