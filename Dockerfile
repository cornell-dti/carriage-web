# Base builder image
FROM node:16-alpine AS builder

# Create a directory for the app
WORKDIR /app

# Set production environment for node
ENV NODE_ENV=production
ENV REACT_APP_PUBLIC_VAPID_KEY=$REACT_APP_PUBLIC_VAPID_KEY
ENV REACT_APP_SERVER_URL=$REACT_APP_SERVER_URL
ENV REACT_APP_CLIENT_ID=$REACT_APP_CLIENT_ID
ENV REACT_APP_ENCRYPTION_KEY=$REACT_APP_ENCRYPTION_KEY
ENV REACT_APP_GOOGLE_MAPS_API_KEY=$REACT_APP_GOOGLE_MAPS_API_KEY
ENV REACT_APP_GOOGLE_MAPS_MAP_ID=$REACT_APP_GOOGLE_MAPS_MAP_ID

# Install dependencies first
COPY package*.json ./
COPY frontend/package*.json ./frontend/
COPY server/package*.json ./server/

RUN npm ci --ignore-scripts
WORKDIR /app/frontend
RUN npm ci --ignore-scripts
WORKDIR /app/server
RUN npm ci --ignore-scripts

WORKDIR /app

# Copy full source
COPY . .

# Build frontend
WORKDIR /app/frontend
RUN npm run build

# Build backend
WORKDIR /app/server
RUN npm run build

# ------------------
# Production runtime image
FROM node:16-alpine AS runner

# Set working directory
WORKDIR /app

# Set production environment
ENV NODE_ENV=production

# Copy only needed files from builder
COPY --from=builder /app/server /app/server
COPY --from=builder /app/frontend/build /app/frontend/build
COPY package*.json ./
COPY server/package*.json ./server/

# Install only production dependencies
RUN npm ci --omit=dev --ignore-scripts && npm cache clean --force

# Expose app port
EXPOSE 3001

# Set default command
WORKDIR /app/server
CMD ["npm", "start"]
