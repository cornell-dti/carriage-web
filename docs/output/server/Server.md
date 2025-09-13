# Server Overview

## Introduction

The Carriage server is a Node.js Express application built with TypeScript, providing a comprehensive REST API for Cornell University's ride-sharing management system. The server handles authentication, data management, notifications, and business logic for the transportation service, supporting three user types: **Riders** (students), **Drivers** (employees), and **Admins** (administrators).

## Technology Stack

### Core Technologies

- **Node.js**: JavaScript runtime environment
- **Express.js**: Web application framework
- **TypeScript**: Type-safe JavaScript development
- **DynamoDB**: NoSQL database for scalable data storage
- **Dynamoose**: Object Document Mapper (ODM) for DynamoDB

### Key Dependencies

- **jsonwebtoken**: JWT token generation and verification
- **google-auth-library**: Google OAuth2 token verification
- **@aws-sdk/client-sns**: AWS SNS for push notifications
- **@aws-sdk/client-s3**: AWS S3 for file storage
- **web-push**: Web push notification support
- **moment-timezone**: Date and time manipulation
- **validator**: Input validation and sanitization
- **fast-csv**: CSV data export functionality
- **node-schedule**: Scheduled task management

## Application Architecture

### Server Structure

The server follows a modular architecture with clear separation of concerns:

```
server/src/
├── app.ts              # Main application entry point
├── config.ts           # Configuration management
├── models/             # DynamoDB data models
│   ├── admin.ts        # Admin user model
│   ├── driver.ts       # Driver user model
│   ├── rider.ts        # Rider (student) model
│   ├── ride.ts         # Ride model
│   ├── location.ts     # Location model
│   ├── vehicle.ts      # Vehicle model
│   ├── notification.ts # Notification model
│   ├── stats.ts        # Statistics model
│   ├── subscription.ts # Push notification subscription
│   └── favorite.ts     # User favorites model
├── router/             # API route handlers
│   ├── auth.ts         # Authentication routes
│   ├── rider.ts        # Rider management routes
│   ├── driver.ts       # Driver management routes
│   ├── admin.ts        # Admin management routes
│   ├── ride.ts         # Ride management routes
│   ├── location.ts     # Location management routes
│   ├── vehicle.ts      # Vehicle management routes
│   ├── notification.ts # Notification routes
│   ├── stats.ts        # Statistics routes
│   ├── favorite.ts     # Favorites routes
│   ├── upload.ts       # File upload routes
│   └── common.ts       # Common utility functions
└── util/               # Utility functions
    ├── notification.ts # Notification system
    ├── notificationMsg.ts # Message templates
    ├── notificationReceivers.ts # Receiver logic
    ├── repeatingRide.ts # Recurring ride logic
    ├── dynamoose.ts    # Database configuration
    ├── modelConfig.ts  # Model configuration
    └── types.ts        # Type definitions
```

### API Architecture

The server provides a RESTful API with the following characteristics:

- **RESTful Design**: Standard HTTP methods and status codes
- **Role-Based Access**: Authentication and authorization middleware
- **Input Validation**: Comprehensive request validation
- **Error Handling**: Consistent error responses
- **Data Serialization**: JSON request/response format
- **CORS Support**: Cross-origin resource sharing

## Data Models

### Core Entities

The server manages several core data entities:

#### User Models
- **Rider**: Student users with accessibility needs and preferences
- **Driver**: Employee drivers with availability and vehicle assignments
- **Admin**: Administrative users with system management capabilities

#### Business Models
- **Ride**: Core ride entity with scheduling, status, and location data
- **Location**: Geographic locations with categorization and metadata
- **Vehicle**: Vehicle information and capacity data

#### System Models
- **Notification**: Push notification records and status
- **Stats**: Analytics and reporting data
- **Subscription**: Push notification subscription management
- **Favorite**: User favorite rides and locations

### Data Relationships

- **Rides** reference **Riders** and **Drivers**
- **Rides** reference **Start** and **End Locations**
- **Drivers** can be assigned to **Vehicles**
- **Users** can have **Subscriptions** for notifications
- **Users** can have **Favorites** for rides and locations

## API Endpoints

### Authentication

**Base Path**: `/api/auth`

- `POST /` - Google OAuth2 authentication
- Token validation and user lookup
- JWT token generation

### User Management

#### Riders
**Base Path**: `/api/riders`

- `GET /` - Get all riders
- `GET /:id` - Get rider by ID
- `GET /:id/profile` - Get rider profile
- `GET /:id/accessibility` - Get accessibility information
- `GET /:id/organization` - Get organization information
- `GET /:id/favorites` - Get favorite locations
- `GET /:id/currentride` - Get current ride
- `GET /:id/usage` - Get usage statistics
- `POST /` - Create new rider
- `PUT /:id` - Update rider
- `POST /:id/favorites` - Add favorite location
- `DELETE /:id` - Delete rider

#### Drivers
**Base Path**: `/api/drivers`

- `GET /` - Get all drivers
- `GET /available` - Get available drivers
- `GET /:id` - Get driver by ID
- `GET /:id/profile` - Get driver profile
- `POST /` - Create new driver
- `PUT /:id` - Update driver
- `DELETE /:id` - Delete driver

#### Admins
**Base Path**: `/api/admins`

- `GET /` - Get all admins
- `GET /:id` - Get admin by ID
- `POST /` - Create new admin
- `PUT /:id` - Update admin
- `DELETE /:id` - Delete admin

### Ride Management

**Base Path**: `/api/rides`

- `GET /` - Get rides with filtering
- `GET /:id` - Get ride by ID
- `GET /rider/:id` - Get rides by rider ID
- `GET /repeating` - Get repeating rides
- `GET /download` - Download rides as CSV
- `POST /` - Create new ride
- `PUT /:id` - Update ride
- `DELETE /:id` - Delete ride

### Location Management

**Base Path**: `/api/locations`

- `GET /` - Get all locations
- `GET /:id` - Get location by ID
- `POST /` - Create new location
- `PUT /:id` - Update location
- `DELETE /:id` - Delete location

### Vehicle Management

**Base Path**: `/api/vehicles`

- `GET /` - Get all vehicles
- `GET /:id` - Get vehicle by ID
- `POST /` - Create new vehicle
- `PUT /:id` - Update vehicle
- `DELETE /:id` - Delete vehicle

### Statistics

**Base Path**: `/api/stats`

- `GET /` - Get statistics for date range
- `POST /` - Update statistics for specific date
- `GET /download` - Download statistics as CSV

### Notifications

**Base Path**: `/api/notification`

- `POST /subscribe` - Subscribe to push notifications

### Favorites

**Base Path**: `/api/favorite`

- `GET /` - Get user's favorite rides
- `GET /:rideId` - Check if ride is favorited
- `POST /` - Add ride to favorites
- `DELETE /:rideId` - Remove ride from favorites

### File Upload

**Base Path**: `/api/upload`

- `POST /` - Upload images to S3

## Authentication & Authorization

### Authentication Flow

1. **Google OAuth2**: User authenticates with Google
2. **Token Verification**: Server verifies Google ID token
3. **User Lookup**: Find user in database by email
4. **JWT Generation**: Create JWT token with user information
5. **Token Response**: Return JWT token to client

### Authorization Middleware

The server uses role-based access control with the `validateUser` middleware:

- **User**: Basic authenticated user
- **Rider**: Student user with ride access
- **Driver**: Employee driver with ride management
- **Admin**: Administrative user with full access

### Security Features

- **JWT Tokens**: Secure token-based authentication
- **Role-Based Access**: Granular permission system
- **Input Validation**: Comprehensive request validation
- **SQL Injection Prevention**: Parameterized queries
- **XSS Protection**: Input sanitization
- **CORS Configuration**: Controlled cross-origin access

## Database Integration

### DynamoDB Configuration

The server uses DynamoDB as the primary database with the following features:

- **NoSQL Design**: Flexible schema for complex data structures
- **Scalability**: Automatic scaling based on demand
- **Global Tables**: Multi-region replication support
- **Backup**: Automated backup and point-in-time recovery

### Dynamoose ODM

The server uses Dynamoose for object-document mapping:

- **Schema Definition**: Type-safe schema definitions
- **Validation**: Built-in data validation
- **Relationships**: Support for data relationships
- **Middleware**: Pre/post hooks for data processing

### Data Operations

- **CRUD Operations**: Create, Read, Update, Delete
- **Batch Operations**: Efficient bulk data operations
- **Query Operations**: Complex querying with filters
- **Scan Operations**: Table scanning with conditions

## Notification System

### Push Notifications

The server supports multiple notification channels:

- **Web Push**: Browser-based push notifications
- **Mobile Push**: Android and iOS push notifications
- **SNS Integration**: AWS SNS for mobile notifications
- **Web Push Library**: Web push protocol implementation

### Notification Types

- **Ride Status Updates**: Arrived, On the way, Cancelled
- **Ride Changes**: Created, Edited, Scheduled, Driver reassigned
- **System Notifications**: Maintenance, updates, alerts

### Message Templates

The server includes contextual message templates:

- **Role-Based Messages**: Different messages for different user types
- **Event-Specific Content**: Tailored content based on event type
- **Localization Support**: Multi-language message support

## File Management

### AWS S3 Integration

The server uses AWS S3 for file storage:

- **Image Uploads**: User photos and location images
- **File Validation**: Type and size validation
- **Secure URLs**: Time-limited access URLs
- **CDN Integration**: Content delivery network support

### Upload Endpoints

- **Single Upload**: Individual file uploads
- **Batch Upload**: Multiple file uploads
- **Image Processing**: Automatic image optimization
- **Metadata Storage**: File metadata in database

## Scheduling & Automation

### Recurring Rides

The server supports recurring ride functionality:

- **RRULE Support**: RFC 5545 recurrence rules
- **Exception Dates**: Handle date exceptions
- **Timezone Support**: Multi-timezone scheduling
- **Bulk Operations**: Efficient recurring ride management

### Scheduled Tasks

The server includes scheduled task management:

- **Statistics Updates**: Daily statistics calculation
- **Cleanup Tasks**: Data cleanup and maintenance
- **Notification Scheduling**: Delayed notification delivery
- **Report Generation**: Automated report creation

## Error Handling

### Error Types

The server handles various error types:

- **Validation Errors**: Input validation failures
- **Authentication Errors**: Invalid or expired tokens
- **Authorization Errors**: Insufficient permissions
- **Database Errors**: Connection and query failures
- **External Service Errors**: Third-party service failures

### Error Response Format

All errors follow a consistent response format:

```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": "Additional error details"
}
```

### Error Logging

- **Structured Logging**: JSON-formatted log entries
- **Error Tracking**: Comprehensive error monitoring
- **Performance Monitoring**: Request timing and metrics
- **Alert System**: Automated error notifications

## Performance & Scalability

### Database Optimization

- **Indexing**: Optimized DynamoDB indexes
- **Query Optimization**: Efficient query patterns
- **Connection Pooling**: Database connection management
- **Caching**: Redis caching for frequently accessed data

### API Performance

- **Response Compression**: Gzip compression for responses
- **Request Validation**: Early validation to prevent unnecessary processing
- **Pagination**: Efficient data pagination
- **Rate Limiting**: API rate limiting and throttling

### Monitoring

- **Health Checks**: Application health monitoring
- **Metrics Collection**: Performance metrics and analytics
- **Log Aggregation**: Centralized log management
- **Alerting**: Automated performance alerts

## Testing

### Test Strategy

The server includes comprehensive testing:

- **Unit Tests**: Individual function testing
- **Integration Tests**: API endpoint testing
- **Database Tests**: Data model testing
- **Authentication Tests**: Security testing

### Test Tools

- **Jest**: Test runner and assertion library
- **Supertest**: HTTP assertion library
- **DynamoDB Local**: Local DynamoDB for testing
- **Mock Services**: External service mocking

## Deployment

### Environment Configuration

The server supports multiple environments:

- **Development**: Local development configuration
- **Staging**: Pre-production testing environment
- **Production**: Live production environment

### Configuration Management

- **Environment Variables**: Secure configuration management
- **Secrets Management**: Encrypted secret storage
- **Feature Flags**: Runtime feature toggling
- **Configuration Validation**: Startup configuration validation

### Deployment Options

- **Docker**: Containerized deployment
- **Heroku**: Platform-as-a-Service deployment
- **AWS**: Cloud-native deployment
- **Traditional Hosting**: Server-based deployment

## Documentation Structure

### API Documentation

- **[APIs](./APIs.md)**: Comprehensive API endpoint reference
- **[Models](./Models.md)**: Data model schemas and relationships
- **[DataFlow](./DataFlow.md)**: Data flow and processing patterns
- **[Errors](./Errors.md)**: Error handling and response codes

### Integration Documentation

- **[Authentication](../auth/Overview.md)**: End-to-end authentication flow
- **[Utilities](../shared/Utilities.md)**: Shared utility functions

## Getting Started

### Prerequisites

- Node.js 16+ and npm
- AWS account with DynamoDB access
- Google OAuth2 credentials
- Environment variables configured

### Quick Start

1. **Clone Repository**: Get the latest code
2. **Install Dependencies**: `npm install`
3. **Configure Environment**: Set up environment variables
4. **Start Development**: `npm run dev`
5. **Access API**: API available at configured port

### Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run tests
npm test

# Type checking
npm run type-check

# Linting
npm run lint
```

## Best Practices

### Code Organization

1. **Modular Structure**: Clear separation of concerns
2. **Type Safety**: Comprehensive TypeScript typing
3. **Error Handling**: Consistent error handling patterns
4. **Validation**: Input validation and sanitization
5. **Documentation**: Clear API documentation

### Security

1. **Authentication**: Secure token-based authentication
2. **Authorization**: Role-based access control
3. **Input Validation**: Comprehensive request validation
4. **Data Protection**: Sensitive data encryption
5. **Audit Logging**: Security event logging

### Performance

1. **Database Optimization**: Efficient query patterns
2. **Caching**: Strategic data caching
3. **Connection Management**: Proper connection pooling
4. **Resource Management**: Memory and CPU optimization
5. **Monitoring**: Performance monitoring and alerting

### Maintenance

1. **Code Quality**: Consistent coding standards
2. **Testing**: Comprehensive test coverage
3. **Documentation**: Up-to-date documentation
4. **Version Control**: Proper version management
5. **Deployment**: Automated deployment processes

## Troubleshooting

### Common Issues

1. **Database Connection**: Check DynamoDB configuration
2. **Authentication**: Verify JWT token and Google OAuth setup
3. **File Uploads**: Check AWS S3 configuration and permissions
4. **Notifications**: Verify push notification setup
5. **Performance**: Monitor database queries and API response times

### Debug Tools

- **Logging**: Comprehensive application logging
- **Health Checks**: Application health monitoring
- **Metrics**: Performance and usage metrics
- **Error Tracking**: Centralized error monitoring

## Future Considerations

### Planned Enhancements

1. **GraphQL API**: Consider GraphQL for more flexible data querying
2. **Microservices**: Evaluate microservices architecture
3. **Real-time Updates**: WebSocket integration for live updates
4. **Advanced Analytics**: Enhanced reporting and insights
5. **API Versioning**: Proper API versioning strategy

### Technology Updates

1. **Node.js**: Upgrade to latest LTS version
2. **TypeScript**: Adopt latest TypeScript features
3. **Database**: Consider additional database options
4. **Caching**: Implement Redis caching layer
5. **Monitoring**: Enhanced monitoring and observability
