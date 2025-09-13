# Carriage Web Documentation

## Overview

This documentation provides comprehensive coverage of the Carriage Web ride-sharing management system for Cornell University. The documentation is organized into several sections covering architecture, implementation details, and operational workflows.

## Documentation Structure

### 📋 [Architecture Overview](./Architecture.md)
High-level system architecture, repository layout, runtime architecture, data lifecycle, authentication flow, error handling, and configuration management.

### 🔐 [Authentication & Authorization](./auth/)
- **[Overview](./auth/Overview.md)**: Authentication system overview and user types
- **[Client](./auth/Client.md)**: Frontend authentication implementation
- **[Server](./auth/Server.md)**: Backend authentication and authorization

### 🖥️ [Frontend Documentation](./frontend/)
- **[Frontend Overview](./frontend/Frontend.md)**: React application architecture and technology stack
- **[Components](./frontend/Components.md)**: UI components, pages, and patterns
- **[State Management](./frontend/State.md)**: React contexts and state management
- **[Hooks](./frontend/Hooks.md)**: Custom React hooks
- **[Pages](./frontend/Pages.md)**: Route-based page components
- **[Patterns](./frontend/Patterns.md)**: Reusable UI patterns and components

### 🖥️ [Server Documentation](./server/)
- **[Server Overview](./server/Server.md)**: Node.js Express application architecture
- **[Data Models](./server/Models.md)**: DynamoDB schemas and data structures
- **[APIs](./server/APIs.md)**: REST API endpoints and contracts
- **[Data Flow](./server/DataFlow.md)**: Data processing and business logic
- **[Error Handling](./server/Errors.md)**: Error handling patterns and responses

### 🧪 [Testing](./tests/)
- **[Testing Overview](./tests/Overview.md)**: Testing strategy, tools, and coverage

### 🔧 [Build & Operations](./BuildOps.md)
Build processes, environment configuration, deployment, and local development setup.

### 🔄 [Workflows](./workflows/)
- **[Rides Lifecycle](./workflows/RidesLifecycle.md)**: End-to-end ride management workflow
- **[Booking & Requests](./workflows/BookingRequests.md)**: Ride request and booking process
- **[Driver Operations](./workflows/DriverOps.md)**: Driver interface and operations
- **[Rider Experience](./workflows/RiderExperience.md)**: Rider interface and user experience
- **[Scheduling](./workflows/Scheduling.md)**: Recurring rides and scheduling system
- **[Notifications](./workflows/Notifications.md)**: Notification system and delivery
- **[Admin Operations](./workflows/AdminOps.md)**: Administrative interface and management

## Quick Start Guide

### For New Developers

1. **Start with Architecture**: Read [Architecture Overview](./Architecture.md) to understand the system
2. **Understand Authentication**: Review [Authentication Overview](./auth/Overview.md) for user types and access control
3. **Explore Frontend**: Check [Frontend Overview](./frontend/Frontend.md) for React application structure
4. **Review Server**: Read [Server Overview](./server/Server.md) for backend architecture
5. **Follow Workflows**: Study [Rides Lifecycle](./workflows/RidesLifecycle.md) for core business logic

### For System Administrators

1. **Admin Operations**: Start with [Admin Operations](./workflows/AdminOps.md)
2. **Build & Operations**: Review [BuildOps](./BuildOps.md) for deployment
3. **Notifications**: Check [Notifications](./workflows/Notifications.md) for system alerts
4. **Testing**: Review [Testing Overview](./tests/Overview.md) for quality assurance

### For Product Managers

1. **User Workflows**: Review [Rider Experience](./workflows/RiderExperience.md) and [Driver Operations](./workflows/DriverOps.md)
2. **System Capabilities**: Check [Booking & Requests](./workflows/BookingRequests.md) and [Scheduling](./workflows/Scheduling.md)
3. **Administrative Features**: Review [Admin Operations](./workflows/AdminOps.md)

## Key Features

### 🚗 Ride Management
- **Request & Booking**: Students can request rides with location selection and scheduling
- **Driver Assignment**: Automatic and manual driver assignment with availability checking
- **Status Tracking**: Real-time ride status updates and notifications
- **Recurring Rides**: Support for recurring ride patterns (currently disabled)

### 👥 User Management
- **Three User Types**: Riders (students), Drivers (employees), Admins (administrators)
- **Role-Based Access**: Different interfaces and permissions for each user type
- **Google OAuth**: Secure authentication using Google OAuth2
- **Profile Management**: User profiles with photos and contact information

### 📍 Location Management
- **Geographic Locations**: Pickup and dropoff locations with coordinates
- **Map Integration**: Google Maps integration for location selection
- **Custom Locations**: Support for custom addresses and locations
- **Location Categories**: Organized location types and metadata

### 📊 Analytics & Reporting
- **Ride Statistics**: Comprehensive ride analytics and reporting
- **Driver Performance**: Driver performance metrics and statistics
- **Export Functionality**: CSV export of ride data and analytics
- **Date Range Filtering**: Flexible date range selection for reports

### 🔔 Notifications
- **Multi-Platform**: Web push and mobile push notifications
- **Real-Time Updates**: Instant notifications for ride status changes
- **Event-Driven**: Notifications triggered by ride events and status updates
- **User Preferences**: Configurable notification preferences

## Technology Stack

### Frontend
- **React 18** with TypeScript
- **Material-UI** for component library
- **React Router** for navigation
- **Google Maps API** for location services
- **Web Push API** for notifications

### Backend
- **Node.js** with Express.js
- **TypeScript** for type safety
- **DynamoDB** for data storage
- **AWS S3** for file storage
- **AWS SNS** for mobile notifications
- **JWT** for authentication

### Infrastructure
- **Docker** for containerization
- **AWS** for cloud services
- **Google OAuth2** for authentication
- **Heroku** for deployment

## Current Status

### ✅ Implemented Features
- User authentication and authorization
- Ride request and booking system
- Driver assignment and management
- Real-time notifications
- Analytics and reporting
- Location management
- Data export functionality

### 🚧 In Development
- Recurring rides (infrastructure ready, API disabled)
- Advanced analytics and reporting
- Mobile application
- Enhanced notification preferences

### 📋 Planned Features
- Real-time updates via WebSockets
- Advanced scheduling algorithms
- Machine learning for ride optimization
- Multi-tenant support
- Advanced audit trails

## Getting Help

### Documentation Issues
If you find issues with this documentation:
1. Check the specific section for the most up-to-date information
2. Review related sections for additional context
3. Check the source code for implementation details

### Development Questions
For development-related questions:
1. Start with the relevant workflow documentation
2. Review the API documentation for server-side questions
3. Check component documentation for frontend questions
4. Review the testing documentation for quality assurance

### System Administration
For system administration:
1. Review [BuildOps](./BuildOps.md) for deployment and configuration
2. Check [Admin Operations](./workflows/AdminOps.md) for system management
3. Review [Notifications](./workflows/Notifications.md) for system alerts

## Contributing

When contributing to the documentation:
1. Follow the existing structure and formatting
2. Include code examples where appropriate
3. Update cross-references when adding new sections
4. Test all links and references
5. Maintain consistency with the existing style

## Last Updated

This documentation was last updated: **January 2025**

---

*This documentation covers the Carriage Web ride-sharing management system for Cornell University. For questions or issues, please refer to the relevant sections or contact the development team.*
