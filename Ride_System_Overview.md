# Ride System Overview

## Introduction

The Ride System is the central component of the Carriage Web application, managing the complete lifecycle of transportation requests at Cornell University. It handles ride creation, driver assignment, status tracking, and completion through role-based interfaces for Riders, Drivers, and Administrators.

## System Overview

### Core Functionality
- **Ride Management**: Create, edit, view, and track rides from request to completion
- **Status Tracking**:  status updates with 7 distinct states
- **Driver Assignment**: Automatic and manual driver scheduling
- **Role-Based Access**: Tailored interfaces for different user types
- **Optimistic UI**: Immediate feedback with error recovery

### Technology Stack
- **Frontend**: React 18, TypeScript, Material-UI, CSS Modules
- **Backend**: Node.js, Express, TypeScript, DynamoDB
- **Authentication**: JWT tokens with Google OAuth2
- **State Management**: React Context with optimistic updates

## User Roles & Permissions

### Riders (Students)
**Capabilities:**
- Create ride requests with location and time preferences
- View personal ride history and current status
- Cancel their own rides
- Update ride details (limited fields)

**Interface Focus:**
- Ride request forms
- Status tracking dashboard
- Ride history and details

### Drivers (Employees)
**Capabilities:**
- View assigned rides
- Update ride status (on_the_way, arrived, picked_up, completed)
- Mark no-shows

**Interface Focus:**
- Assigned rides dashboard
- Status update controls

### Administrators
**Capabilities:**
- Full ride management access
- Assign drivers to any ride
- Assign Riders to any ride
- Edit ride details
- Cancel any ride
- Manage ride scheduling

**Interface Focus:**
- Comprehensive ride management
- Driver assignment tools

## Data Architecture

### Core Models

#### Ride Model
```typescript
type RideType = {
  id: string;
  type: 'upcoming' | 'past' | 'active';
  status: 'not_started' | 'on_the_way' | 'arrived' | 'picked_up' | 'completed' | 'no_show' | 'cancelled';
  schedulingState: 'scheduled' | 'unscheduled';
  startLocation: LocationType;
  endLocation: LocationType;
  startTime: string; // ISO 8601
  rider: RiderType;
  driver?: DriverType;
  isRecurring: boolean;
  recurrence : // Yet to be implemented. Leave as placeholder
  timezone: string;
}
```

#### Supporting Models
- **RiderType**: Student information with accessibility needs
- **DriverType**: Employee information with availability
- **LocationType**: Geographic locations with campus tags

### Database Design
- **Primary Table**: Rides (DynamoDB)
- **Relationships**: Rides reference Riders/Drivers by ID
- **Embedded Data**: Locations stored directly in ride records
- **Indexing**: Optimized for date and status queries

## Frontend Architecture

### Component Structure

#### Current Components

2. **RideDetails** - Comprehensive ride display
   - Multi-tab interface (Overview, People, Locations)
   - Real-time editing capabilities
   - Location management with maps
   - Contact information display

3. **RequestRideModal** - Ride creation
   - Form-based ride requests
   - Location selection
   - Time scheduling
   - Accessibility preferences

4. **RideStatus** - Status management
   - Visual status indicators
   - Status update controls
   - Progress tracking

### State Management

#### Context Providers
- **RidesContext**: Central ride state with optimistic operations
- **RideEditContext**: Edit mode and change tracking

#### Optimistic Updates
- Immediate UI feedback on user actions
- Automatic rollback on API failures
- Loading states and error handling
- Conflict resolution for concurrent edits

## Backend Architecture

### API Endpoints

#### Core Operations
```
GET    /api/rides              # Query rides with filters
POST   /api/rides              # Create new ride
GET    /api/rides/:id          # Get specific ride
PUT    /api/rides/:id          # Update ride
DELETE /api/rides/:id          # Delete/cancel ride
GET    /api/rides/download     # Export ride data
```

#### Query Parameters
- `type`: upcoming, past, active
- `status`: ride status filter
- `rider`: filter by rider ID
- `driver`: filter by driver ID
- `date`: filter by specific date
- `schedulingState`: scheduled, unscheduled
- `allDates`: include all dates (not just selected)

### Business Logic

#### Ride Lifecycle
1. **Creation**
   - Validate required fields
   - Check time constraints (future dates)
   - Set scheduling state based on driver presence
   - Send notifications

2. **Status Transitions**
   - Enforce valid status progression
   - Role-based update permissions
   - Automatic notifications
   - Handle cancellations and no-shows

3. **Driver Assignment**
   - Update scheduling state automatically
   - Validate driver availability
   - Check for conflicts

#### Validation Rules
- Start time must be in the future
- End time must be after start time
- Required fields: startTime, endTime, rider, locations
- Location coordinates must be valid
- Rider and driver must exist in system

### Security

#### Authentication
- JWT token validation for all ride operations
- Google OAuth2 integration
- Session management

#### Authorization
- Role-based access control
- Ride ownership validation
- Permission hierarchy (Admin > Driver/Rider)
- Backend validation on every operation

## Key Features

### Advanced Ride Management
- **Unified Interface**: Single component for all ride operations
- **Role-Based Customization**: Different views for different user types
- **Real-Time Updates**: Live status changes across all interfaces
- **Comprehensive Validation**: Client and server-side validation

### User Experience
- **Optimistic UI**: Immediate feedback with error recovery
- **Responsive Design**: Mobile-friendly interfaces
- **Accessibility Support**: Screen reader compatibility and keyboard navigation
- **Intuitive Navigation**: Clear status indicators and progress tracking

### Analytics & Reporting
- **Data Export**: CSV export with date filtering
- **Status Tracking**: Historical status changes
- **Usage Analytics**: Ride patterns and trends
- **Performance Metrics**: Completion rates and timing

## Ride Status Flow

### Status Progression
```
not_started → on_the_way → arrived → picked_up → completed
     ↓              ↓           ↓
cancelled      cancelled   no_show
```

### Status Meanings
- **not_started**: Ride created, awaiting driver
- **on_the_way**: Driver en route to pickup
- **arrived**: Driver at pickup location
- **picked_up**: Rider in vehicle
- **completed**: Ride finished successfully
- **cancelled**: Ride cancelled by user or admin
- **no_show**: Rider didn't appear at pickup

### Scheduling States
- **scheduled**: Driver assigned
- **unscheduled**: No driver assigned

## Future Enhancements

### Planned Features
1. **Recurring Rides**
   - RFC 5545 recurrence rules
   - Series management
   - Exception handling

2. **Real-Time Features**
   - WebSocket connections
   - Live location tracking
   - Instant notifications

3. **Advanced Analytics**
   - Predictive analytics
   - Usage patterns
   - Performance dashboards

### Technical Improvements
1. **Performance**
   - Code splitting
   - Lazy loading
   - Caching strategies

2. **Scalability**
   - Microservices architecture
   - Load balancing
   - Database optimization

## Development & Deployment

### Development Workflow
- **Frontend**: React dev server with hot reloading
- **Backend**: Express server with TypeScript compilation
- **Database**: DynamoDB with local development setup
- **Testing**: API testing and component testing

### Deployment
- **Containerization**: Docker containers for all services
- **Environment**: Configurable environment variables
- **Monitoring**: Health checks and logging
- **Security**: SSL certificates and secure configurations

## Conclusion

The Ride System provides a robust, scalable solution for managing transportation services at Cornell University. Its modern architecture, role-based design, and optimistic UI create an excellent user experience while maintaining data integrity and security.

Key strengths include comprehensive ride lifecycle management, real-time status tracking, role-based interfaces, and optimistic updates with error recovery. The system is well-positioned for future enhancements while maintaining its current functionality and performance.

The modular design allows for easy extension and modification of ride features without affecting other system components, making it maintainable and adaptable to changing requirements.