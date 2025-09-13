# Architecture Overview

## Repository Layout

The Carriage Web application is a full-stack ride-sharing platform with the following structure:

```
carriage-web/
├── frontend/                 # React TypeScript frontend
│   ├── src/
│   │   ├── components/      # UI components and pages
│   │   ├── context/         # React contexts for state management
│   │   ├── hooks/           # Custom React hooks
│   │   ├── pages/           # Route-based page components
│   │   ├── types/           # TypeScript type definitions
│   │   └── util/            # Frontend utilities
│   └── build/               # Production build output
├── server/                  # Node.js Express backend
│   ├── src/
│   │   ├── models/          # DynamoDB data models
│   │   ├── router/          # Express route handlers
│   │   └── util/            # Server utilities
│   └── build/               # Compiled JavaScript output
├── docs/                    # Documentation
└── docker-compose.yml       # Container orchestration
```

## Runtime Architecture

### Frontend-Backend Communication

The application follows a traditional client-server architecture:

```
┌─────────────────┐    HTTP/REST    ┌─────────────────┐
│   React Frontend │ ◄─────────────► │  Express Server │
│   (Port 3000)    │                 │   (Port 3001)   │
└─────────────────┘                 └─────────────────┘
         │                                   │
         │                                   │
         ▼                                   ▼
┌─────────────────┐                 ┌─────────────────┐
│   Browser APIs  │                 │   AWS Services  │
│   - Google Maps │                 │   - DynamoDB    │
│   - Notifications│                 │   - S3          │
│   - Geolocation │                 │   - SNS         │
└─────────────────┘                 └─────────────────┘
```

### Key Technologies

**Frontend:**
- React 18 with TypeScript
- Material-UI (MUI) for component library
- React Router for navigation
- Axios for HTTP requests
- Google Maps integration
- React Big Calendar for scheduling

**Backend:**
- Node.js with Express
- TypeScript
- DynamoDB with Dynamoose ODM
- JWT authentication
- Google OAuth2 integration
- AWS S3 for file storage
- AWS SNS for push notifications

## Data Lifecycle

### Request Flow

1. **User Action** → React component triggers action
2. **Context Update** → State management via React contexts
3. **API Call** → Axios request to Express server
4. **Authentication** → JWT token validation
5. **Business Logic** → Route handler processes request
6. **Data Access** → DynamoDB operations via Dynamoose
7. **Response** → JSON response back to frontend
8. **UI Update** → React re-renders with new data

### State Management

The application uses React Context for state management:

- **AuthContext**: User authentication state
- **RidesContext**: Ride data and operations
- **RidersContext**: Rider information
- **LocationsContext**: Location data
- **EmployeesContext**: Driver/admin data
- **ToastContext**: Notification system

## Authentication Flow

### OAuth2 + JWT Implementation

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Frontend  │    │   Backend   │    │   Google    │
│             │    │             │    │   OAuth2    │
└─────────────┘    └─────────────┘    └─────────────┘
       │                   │                   │
       │ 1. Login Request  │                   │
       ├──────────────────►│                   │
       │                   │ 2. OAuth Code     │
       │                   ├──────────────────►│
       │                   │ 3. ID Token       │
       │                   │◄──────────────────┤
       │ 4. JWT Token      │                   │
       │◄──────────────────┤                   │
       │                   │                   │
       │ 5. Store JWT      │                   │
       │    in Cookie      │                   │
       │                   │                   │
```

### User Types

The system supports three user types:
- **Riders**: End users requesting rides
- **Drivers**: Service providers with vehicles
- **Admins**: System administrators with elevated privileges

Authentication is handled via Google OAuth2 with role-based access control.

## Error Handling and Logging

### Frontend Error Handling

- React Error Boundaries for component-level errors
- Toast notifications for user feedback
- Axios interceptors for HTTP error handling
- Form validation with React Hook Form

### Backend Error Handling

- Express error middleware
- DynamoDB error handling via Dynamoose
- JWT validation errors
- OAuth2 authentication errors

### Logging

- Console logging for development
- Structured error responses
- Health check endpoint at `/api/health-check`

## Configuration and Environments

### Environment Variables

**Server Configuration:**
- `JWT_SECRET`: JWT signing secret
- `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY`: AWS credentials
- `OAUTH_CLIENT_ID` / `OAUTH_CLIENT_SECRET`: Google OAuth credentials
- `PUBLIC_VAPID_KEY` / `PRIVATE_VAPID_KEY`: Web push notification keys
- `IOS_DRIVER_ARN` / `IOS_RIDER_ARN` / `ANDROID_ARN`: SNS topic ARNs

**Frontend Configuration:**
- `REACT_APP_SERVER_URL`: Backend API URL
- `REACT_APP_CLIENT_ID`: Google OAuth client ID
- `REACT_APP_PUBLIC_VAPID_KEY`: Web push public key
- `REACT_APP_ENCRYPTION_KEY`: Client-side encryption key

### Deployment

**Production:**
- Docker containerization
- Heroku deployment with Procfile
- Environment-specific builds
- Static file serving from Express

**Development:**
- Separate frontend (port 3000) and backend (port 3001) servers
- Hot reloading for both frontend and backend
- Local DynamoDB or AWS DynamoDB

## Data Models

### Core Entities

- **Ride**: Central entity representing a ride request/booking
- **Rider**: User requesting rides
- **Driver**: Service provider with vehicle
- **Vehicle**: Driver's transportation vehicle
- **Location**: Geographic locations and addresses
- **Admin**: System administrators
- **Notification**: Push notifications and alerts

### Database Design

Uses AWS DynamoDB with Dynamoose ODM for:
- NoSQL document storage
- Automatic scaling
- Global secondary indexes
- Time-based data retention

## Security Considerations

- JWT tokens for stateless authentication
- HTTPS enforcement in production
- CORS configuration for cross-origin requests
- Input validation and sanitization
- Role-based access control
- Secure cookie handling

## Performance Optimizations

- React component memoization
- Lazy loading for route components
- Image optimization and compression
- Database query optimization
- Caching strategies for frequently accessed data
- CDN for static assets

## Monitoring and Observability

- Health check endpoints
- Error tracking and logging
- Performance monitoring
- User analytics
- System metrics collection

---

*This architecture document provides a high-level overview. For detailed implementation information, refer to the specific component, API, and workflow documentation.*
