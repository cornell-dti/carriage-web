# Base image
FROM node:16-alpine

# Create a directory for the app
WORKDIR /app

# Copy the frontend and server directories to the app directory
COPY frontend /app/frontend
COPY server /app/server
COPY . .

RUN npm install

# Install dependencies for the frontend and build the app
WORKDIR /app/frontend
RUN npm install && npm run build

# Install dependencies for the server
WORKDIR /app/server
RUN npm install

# Expose port 3001 for the server
EXPOSE 3001

# Start the server
CMD ["npm", "start"]
