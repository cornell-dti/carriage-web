# Build & Operations

## Overview

The Carriage application uses a modern build and deployment pipeline with Docker containerization, environment-based configuration, and automated deployment processes. The system supports multiple environments and deployment strategies for development, staging, and production.

## Project Structure

### Monorepo Architecture

The project follows a monorepo structure with separate frontend and server applications:

```
carriage-web/
├── frontend/           # React frontend application
│   ├── src/           # Source code
│   ├── public/        # Static assets
│   ├── build/         # Production build output
│   ├── package.json   # Frontend dependencies
│   └── tsconfig.json  # TypeScript configuration
├── server/            # Node.js backend application
│   ├── src/           # Source code
│   ├── build/         # Compiled JavaScript
│   ├── tests/         # Test files
│   ├── package.json   # Server dependencies
│   └── tsconfig.json  # TypeScript configuration
├── docs/              # Documentation
├── docker-compose.yml # Docker orchestration
├── Dockerfile         # Docker build configuration
├── package.json       # Root package.json
└── Procfile          # Heroku deployment configuration
```

### Build Configuration

#### Root Package.json

**Location**: `package.json`

**Purpose**: Orchestrates builds and scripts for both frontend and server.

**Key Scripts**:
```json
{
  "scripts": {
    "heroku-postbuild": "npm run build:frontend && npm run build:server",
    "start:frontend": "cd frontend && npm start",
    "start:server": "cd server && npm start",
    "build:frontend": "cd frontend && npm run build",
    "build:server": "cd server && npm run build",
    "postinstall": "npm run build:server",
    "lint": "npm run lint:frontend && npm run lint:server",
    "format": "npm run format:frontend && npm run format:server"
  }
}
```

#### Frontend Build Configuration

**Location**: `frontend/package.json`

**Build Scripts**:
```json
{
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject",
    "tsc": "tsc --noEmit",
    "lint": "eslint src --ext .ts,.tsx",
    "type-check": "tsc --noEmit"
  }
}
```

**Dependencies**:
- **React 18**: Core React library
- **TypeScript**: Type safety and development experience
- **Material-UI**: Component library
- **React Router**: Client-side routing
- **Axios**: HTTP client
- **Moment**: Date manipulation

#### Server Build Configuration

**Location**: `server/package.json`

**Build Scripts**:
```json
{
  "scripts": {
    "build": "tsc",
    "start": "node build/app.js",
    "dev": "ts-node src/app.ts",
    "lint": "eslint src --ext .ts",
    "type-check": "tsc --noEmit",
    "test": "jest"
  }
}
```

**Dependencies**:
- **Express**: Web framework
- **TypeScript**: Type safety
- **Dynamoose**: DynamoDB ODM
- **AWS SDK**: AWS service integration
- **JWT**: Authentication tokens
- **Moment**: Date manipulation

## Docker Configuration

### Dockerfile

**Location**: `Dockerfile`

**Purpose**: Multi-stage Docker build for production deployment.

**Build Stages**:
1. **Base Stage**: Node.js 16 Alpine base image
2. **Dependencies**: Install and cache dependencies
3. **Build Stage**: Build frontend and server
4. **Production Stage**: Optimized production image

**Configuration**:
```dockerfile
FROM node:16-alpine

WORKDIR /app

# Copy package files for dependency caching
COPY package*.json ./
COPY frontend/package*.json ./frontend/
COPY server/package*.json ./server/

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build applications
RUN npm run build:frontend
RUN npm run build:server

# Expose port
EXPOSE 3001

# Start application
CMD ["npm", "start"]
```

### Docker Compose

**Location**: `docker-compose.yml`

**Purpose**: Local development and testing environment.

**Configuration**:
```yaml
version: '3.8'

services:
  carriage:
    build: .
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - AWS_ACCESS_KEY_ID=${AWS_ACCESS_KEY_ID}
      - AWS_SECRET_ACCESS_KEY=${AWS_SECRET_ACCESS_KEY}
      - JWT_SECRET=${JWT_SECRET}
      - REACT_APP_SERVER_URL=${REACT_APP_SERVER_URL}
      - REACT_APP_CLIENT_ID=${REACT_APP_CLIENT_ID}
    env_file:
      - .env
```

## Environment Configuration

### Environment Variables

The application uses environment variables for configuration across different environments.

#### Frontend Environment Variables

**Location**: `frontend/.env`

**Variables**:
```bash
REACT_APP_SERVER_URL=http://localhost:3001
REACT_APP_CLIENT_ID=your-google-client-id
REACT_APP_GOOGLE_MAPS_API_KEY=your-maps-api-key
```

#### Server Environment Variables

**Location**: `server/.env`

**Variables**:
```bash
# Database
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=us-east-1

# Authentication
JWT_SECRET=your-jwt-secret
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Notifications
VAPID_PUBLIC_KEY=your-vapid-public-key
VAPID_PRIVATE_KEY=your-vapid-private-key
VAPID_CONTACT=your-contact-email

# SNS
SNS_ANDROID_ARN=your-android-sns-arn
SNS_IOS_ARN=your-ios-sns-arn

# S3
S3_BUCKET_NAME=your-s3-bucket
```

### Environment-Specific Configuration

#### Development Environment

**Configuration**:
- Local DynamoDB or AWS DynamoDB Local
- Development Google OAuth credentials
- Local file storage or S3 development bucket
- Debug logging enabled

**Setup**:
```bash
# Install dependencies
npm install

# Start development server
npm run start:server

# Start frontend (separate terminal)
npm run start:frontend
```

#### Staging Environment

**Configuration**:
- AWS DynamoDB staging tables
- Staging Google OAuth credentials
- S3 staging bucket
- Production-like configuration

**Deployment**:
```bash
# Build for staging
npm run build:frontend
npm run build:server

# Deploy to staging
docker build -t carriage-staging .
docker run -p 3001:3001 carriage-staging
```

#### Production Environment

**Configuration**:
- AWS DynamoDB production tables
- Production Google OAuth credentials
- S3 production bucket
- Optimized performance settings

**Deployment**:
- Heroku deployment with buildpacks
- Docker container deployment
- AWS ECS/EKS deployment
- Traditional server deployment

## Build Process

### Frontend Build

**Process**:
1. **TypeScript Compilation**: Type checking and compilation
2. **Dependency Resolution**: Install and resolve dependencies
3. **Asset Processing**: Process images, fonts, and static assets
4. **Bundle Optimization**: Webpack optimization and minification
5. **Static Generation**: Generate production-ready static files

**Output**:
- `frontend/build/` directory with optimized assets
- Minified JavaScript and CSS
- Optimized images and fonts
- Service worker for offline functionality

### Server Build

**Process**:
1. **TypeScript Compilation**: Compile TypeScript to JavaScript
2. **Dependency Resolution**: Install production dependencies
3. **Asset Copying**: Copy static assets and configuration
4. **Optimization**: Remove development dependencies
5. **Bundle Creation**: Create production-ready server bundle

**Output**:
- `server/build/` directory with compiled JavaScript
- Optimized server code
- Production dependencies only
- Configuration files

### Build Optimization

**Frontend Optimizations**:
- Code splitting by route
- Tree shaking for unused code
- Image optimization and compression
- CSS minification and purging
- Bundle analysis and monitoring

**Server Optimizations**:
- TypeScript compilation optimization
- Dependency tree optimization
- Memory usage optimization
- Startup time optimization

## Deployment Strategies

### Heroku Deployment

**Configuration**: `Procfile`

**Process**:
1. **Build Phase**: `heroku-postbuild` script runs
2. **Frontend Build**: React app builds to `frontend/build/`
3. **Server Build**: TypeScript compiles to `server/build/`
4. **Start Phase**: `npm start` runs the server
5. **Static Serving**: Server serves frontend static files

**Environment Variables**:
- Set via Heroku dashboard or CLI
- Secure configuration management
- Environment-specific values

### Docker Deployment

**Process**:
1. **Image Build**: Docker builds multi-stage image
2. **Container Registry**: Push to registry (Docker Hub, ECR)
3. **Container Deployment**: Deploy to container platform
4. **Service Orchestration**: Manage with Kubernetes or Docker Swarm

**Benefits**:
- Consistent deployment across environments
- Scalability and load balancing
- Easy rollback and versioning
- Infrastructure as code

### AWS Deployment

**Options**:
- **ECS**: Container service for Docker deployments
- **EKS**: Kubernetes service for orchestration
- **Lambda**: Serverless deployment option
- **EC2**: Traditional virtual machine deployment

**Configuration**:
- IAM roles and policies
- VPC and security groups
- Load balancers and auto-scaling
- CloudWatch monitoring

## Local Development

### Prerequisites

**Required Software**:
- Node.js 16+ and npm
- Docker and Docker Compose (optional)
- Git for version control
- AWS CLI (for database access)

**Required Accounts**:
- Google Cloud Console (OAuth credentials)
- AWS Account (DynamoDB, S3, SNS)
- Heroku Account (for deployment)

### Development Setup

**1. Clone Repository**:
```bash
git clone <repository-url>
cd carriage-web
```

**2. Install Dependencies**:
```bash
# Install root dependencies
npm install

# Install frontend dependencies
cd frontend && npm install

# Install server dependencies
cd ../server && npm install
```

**3. Environment Configuration**:
```bash
# Copy environment files
cp frontend/.env.example frontend/.env
cp server/.env.example server/.env

# Configure environment variables
# Edit .env files with your credentials
```

**4. Start Development**:
```bash
# Start server (terminal 1)
cd server && npm run dev

# Start frontend (terminal 2)
cd frontend && npm start
```

### Development Workflow

**1. Code Changes**:
- Make changes to source code
- Frontend hot-reloads automatically
- Server restarts on changes (with nodemon)

**2. Testing**:
```bash
# Run frontend tests
cd frontend && npm test

# Run server tests
cd server && npm test

# Run all tests
npm test
```

**3. Linting and Formatting**:
```bash
# Lint code
npm run lint

# Format code
npm run format

# Type checking
npm run type-check
```

**4. Build Testing**:
```bash
# Test production build
npm run build:frontend
npm run build:server

# Test Docker build
docker build -t carriage-dev .
```

## CI/CD Pipeline

### Continuous Integration

**GitHub Actions** (if configured):
```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '16'
      - run: npm install
      - run: npm run lint
      - run: npm run type-check
      - run: npm test
      - run: npm run build:frontend
      - run: npm run build:server
```

**Build Steps**:
1. **Code Checkout**: Get latest code
2. **Dependency Installation**: Install all dependencies
3. **Linting**: Run ESLint and Prettier
4. **Type Checking**: TypeScript compilation check
5. **Testing**: Run unit and integration tests
6. **Building**: Build frontend and server
7. **Deployment**: Deploy to staging/production

### Continuous Deployment

**Automated Deployment**:
- **Staging**: Deploy on merge to develop branch
- **Production**: Deploy on merge to main branch
- **Rollback**: Automatic rollback on deployment failure
- **Monitoring**: Health checks and monitoring

## Monitoring and Logging

### Application Monitoring

**Health Checks**:
- Server health endpoint
- Database connectivity checks
- External service availability
- Performance metrics

**Logging**:
- Structured JSON logging
- Log levels (debug, info, warn, error)
- Request/response logging
- Error tracking and alerting

### Performance Monitoring

**Metrics**:
- Response times
- Throughput rates
- Error rates
- Resource utilization

**Tools**:
- Application Performance Monitoring (APM)
- Log aggregation services
- Error tracking services
- Uptime monitoring

## Security Considerations

### Build Security

**Dependencies**:
- Regular dependency updates
- Vulnerability scanning
- License compliance
- Supply chain security

**Secrets Management**:
- Environment variable encryption
- Secure secret storage
- Access control and rotation
- Audit logging

### Deployment Security

**Container Security**:
- Base image scanning
- Runtime security monitoring
- Network security policies
- Access control

**Infrastructure Security**:
- Network segmentation
- Firewall configuration
- SSL/TLS certificates
- Security headers

## Troubleshooting

### Common Build Issues

**1. Dependency Conflicts**:
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

**2. TypeScript Errors**:
```bash
# Check TypeScript configuration
npm run type-check

# Update TypeScript types
npm update @types/*
```

**3. Build Failures**:
```bash
# Check build logs
npm run build:frontend --verbose
npm run build:server --verbose
```

### Deployment Issues

**1. Environment Variables**:
- Verify all required variables are set
- Check variable names and values
- Ensure proper encoding

**2. Database Connection**:
- Verify AWS credentials
- Check DynamoDB table permissions
- Test network connectivity

**3. OAuth Configuration**:
- Verify Google OAuth credentials
- Check redirect URIs
- Ensure proper scopes

## Best Practices

### Build Optimization

1. **Dependency Management**: Keep dependencies up to date
2. **Bundle Size**: Monitor and optimize bundle sizes
3. **Build Caching**: Use build caching for faster builds
4. **Parallel Builds**: Run builds in parallel when possible
5. **Incremental Builds**: Use incremental build strategies

### Deployment Best Practices

1. **Environment Parity**: Keep environments as similar as possible
2. **Configuration Management**: Use environment variables for configuration
3. **Secrets Management**: Never commit secrets to version control
4. **Rollback Strategy**: Always have a rollback plan
5. **Monitoring**: Monitor deployments and application health

### Development Workflow

1. **Version Control**: Use proper branching strategies
2. **Code Review**: Require code reviews for all changes
3. **Testing**: Maintain high test coverage
4. **Documentation**: Keep documentation up to date
5. **Automation**: Automate repetitive tasks

## Future Considerations

### Planned Improvements

1. **Microservices**: Consider microservices architecture
2. **Serverless**: Evaluate serverless deployment options
3. **Kubernetes**: Consider Kubernetes for orchestration
4. **GitOps**: Implement GitOps for deployment
5. **Multi-region**: Support multi-region deployment

### Technology Updates

1. **Node.js**: Upgrade to latest LTS version
2. **Docker**: Use multi-stage builds and optimization
3. **CI/CD**: Implement advanced CI/CD pipelines
4. **Monitoring**: Enhanced monitoring and observability
5. **Security**: Improved security scanning and compliance
