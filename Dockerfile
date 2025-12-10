# Base image
FROM node:24-alpine AS base
WORKDIR /app

# pnpm setup
ENV CI=true
RUN corepack enable pnpm && \
  pnpm config set store-dir /pnpm/store && \
  pnpm config set package-import-method clone-or-copy

# Build stage
FROM base AS fetch-deps
COPY pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm fetch --prod

FROM fetch-deps AS prod-deps
COPY . .
RUN pnpm install -r --offline --prod --filter server...

FROM fetch-deps AS build-base
RUN pnpm fetch

# Build both frontend and server separately for caching
FROM build-base AS build-server
COPY . .
RUN pnpm install -r --offline --filter server...
# Build with CI=false to avoid treat warnings as errors
RUN CI=false pnpm run -r --filter server... build

FROM build-base AS build-frontend
COPY . .
RUN pnpm install -r --offline --filter frontend...

# Read build-time environment variables
ARG VITE_SERVER_URL
ENV VITE_SERVER_URL=${VITE_SERVER_URL}
ARG VITE_CLIENT_ID
ENV VITE_CLIENT_ID=${VITE_CLIENT_ID}
ARG VITE_PUBLIC_VAPID_KEY
ENV VITE_PUBLIC_VAPID_KEY=${VITE_PUBLIC_VAPID_KEY}
ARG VITE_ENCRYPTION_KEY
ENV VITE_ENCRYPTION_KEY=${VITE_ENCRYPTION_KEY}

# Build with CI=false to avoid treat warnings as errors
RUN CI=false pnpm run -r --filter frontend... build

FROM base AS prod
# Copy the frontend and server directories to the app directory
COPY --from=prod-deps /app/node_modules /app/node_modules
COPY --from=prod-deps /app/server/node_modules /app/server/node_modules

COPY --from=build-frontend /app/frontend/build /app/frontend/build

COPY --from=build-server /app/server/build /app/server/build
COPY --from=build-server /app/server/package.json /app/server/package.json
COPY --from=build-server /app/shared/build /app/shared/build
COPY --from=build-server /app/shared/package.json /app/shared/package.json

# Set production environment after build
ENV NODE_ENV=production

# Expose port 3001 for the server
EXPOSE 3001

# Start the server
WORKDIR /app/server
CMD ["pnpm", "start"]
