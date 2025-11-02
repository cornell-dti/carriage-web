# Base image
FROM node:16-alpine

# Create a directory for the app
WORKDIR /app

# Read build-time environment variables
ARG REACT_APP_SERVER_URL
ENV REACT_APP_SERVER_URL=${REACT_APP_SERVER_URL}
ARG REACT_APP_CLIENT_ID
ENV REACT_APP_CLIENT_ID=${REACT_APP_CLIENT_ID}
ARG REACT_APP_PUBLIC_VAPID_KEY
ENV REACT_APP_PUBLIC_VAPID_KEY=${REACT_APP_PUBLIC_VAPID_KEY}
ARG REACT_APP_ENCRYPTION_KEY
ENV REACT_APP_ENCRYPTION_KEY=${REACT_APP_ENCRYPTION_KEY}

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

# Set production environment after build
ENV NODE_ENV=production

# Expose port 3001 for the server
EXPOSE 3001

# Start the server
CMD ["npm", "start"]
