# Base image
FROM node:16-alpine

# Create a directory for the app
WORKDIR /app

# Copy package.jsons first to install
COPY package.json package-lock.json ./
COPY frontend/package.json frontend/package-lock.json /app/frontend/
COPY server/package.json server/package-lock.json /app/server/
RUN npm install

# Copy the frontend and server directories to the app directory
COPY frontend /app/frontend
COPY server /app/server
COPY . .

# Install dependencies for the frontend and build the app
WORKDIR /app/frontend
RUN npm run build

# Install dependencies for the server
WORKDIR /app/server
RUN npm run build

# Expose port 3001 for the server
EXPOSE 3001

# Start the server
CMD ["npm", "start"]
