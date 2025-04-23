# Base image
FROM node:16-alpine

# Create a directory for the app
WORKDIR /app

# Set production environment for node
ENV NODE_ENV=production

# Read build-time environment variables
ARG VITE_SERVER_URL
ENV VITE_SERVER_URL ${VITE_SERVER_URL}
ARG VITE_CLIENT_ID
ENV VITE_CLIENT_ID ${VITE_CLIENT_ID}
ARG VITE_PUBLIC_VAPID_KEY
ENV VITE_PUBLIC_VAPID_KEY ${VITE_PUBLIC_VAPID_KEY}
ARG VITE_ENCRYPTION_KEY
ENV VITE_ENCRYPTION_KEY ${VITE_ENCRYPTION_KEY}

# Copy package.jsons first to install
COPY package.json package-lock.json /app/
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
