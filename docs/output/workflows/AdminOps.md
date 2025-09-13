# Admin Operations Workflow

## Overview

The admin operations workflow covers how administrators manage the entire ride-sharing system, including user management, ride oversight, location administration, analytics, and system configuration. This workflow focuses on the administrative interface and the comprehensive management capabilities available to system administrators.

## Admin Interface Structure

### Admin Routes

**File**: `frontend/src/pages/Admin/Routes.tsx`

The admin interface is organized into six main sections:

1. **Home** (`/home`): Dashboard with ride overview and quick actions
2. **Employees** (`/employees`): Driver and admin management
3. **Students** (`/riders`): Rider management
4. **Locations** (`/locations`): Location management
5. **Analytics** (`/analytics`): System analytics and reporting
6. **Export** (`/home/export`): Data export functionality

**Context Providers**:
- `DateContext`: Date management for analytics and scheduling
- `EmployeesProvider`: Employee (drivers/admins) data management
- `RidersProvider`: Rider data management
- `RidesProvider`: Ride data management
- `LocationsProvider`: Location data management

## Admin Dashboard (Home)

### Home Page

**File**: `frontend/src/pages/Admin/Home.tsx`

The admin dashboard provides a comprehensive overview of the system:

#### Key Features
- **Date Selection**: MiniCal component for date-based filtering
- **Export Functionality**: CSV export of ride data
- **Ride Management**: Quick access to create new rides
- **Notifications**: System notifications and alerts
- **Schedule Overview**: Visual schedule display
- **Ride Tables**: Unscheduled and scheduled ride management

#### Export Capabilities
```typescript
<ExportButton
  toastMsg={`${today} data has been downloaded.`}
  endpoint={`/api/rides/download?date=${today}`}
  csvCols={'Name,Pick Up,From,To,Drop Off,Needs,Driver'}
  filename={`scheduledRides_${today}.csv`}
/>
```

#### Dashboard Components
- **Schedule**: Visual schedule display with ride information
- **UnscheduledTable**: Table of unscheduled rides
- **ScheduledTable**: Table of scheduled rides
- **Collapsible Sections**: Organized data presentation

## Employee Management

### Employees Page

**File**: `frontend/src/pages/Admin/Employees.tsx`

The employees page provides comprehensive employee management:

#### Employee Types
- **Administrators**: System administrators with full access
- **Drivers**: Employee drivers with availability and vehicle assignments
- **Hybrid Users**: Admins who are also drivers

#### Key Features
- **Employee Cards**: Visual employee display with photos and details
- **Search and Filter**: Find employees by name or role
- **Add Employee**: Create new employees with role assignment
- **Pagination**: Handle large employee lists efficiently
- **Statistics**: Employee count and role distribution

#### Employee Statistics
```typescript
const employeeStats = [
  {
    icon: user,
    alt: 'admin',
    stats: adminCount,
    description: 'Administrators',
    variant: 'green' as const,
  },
  {
    icon: wheel,
    alt: 'driver',
    stats: driverCount,
    description: 'Drivers',
    variant: 'red' as const,
  },
];
```

#### Employee Data Structure
```typescript
interface EmployeeEntity {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  admin: AdminType;
  driver: DriverType;
  photoLink: string;
  roleType: ('admin' | 'driver')[];
}
```

### Employee Management API

**File**: `server/src/router/admin.ts`

#### Admin CRUD Operations

**Get All Admins**
- **Endpoint**: `GET /api/admins`
- **Auth**: Admin only
- **Response**: Array of admin objects

**Create Admin**
- **Endpoint**: `POST /api/admins`
- **Auth**: Admin only
- **Request**: Complete admin object
- **Response**: Created admin object

**Update Admin**
- **Endpoint**: `PUT /api/admins/:id`
- **Auth**: Admin only
- **Request**: Partial admin object
- **Response**: Updated admin object

**Delete Admin**
- **Endpoint**: `DELETE /api/admins/:id`
- **Auth**: Admin only
- **Response**: Success confirmation

## Rider Management

### Students Page

**File**: `frontend/src/pages/Admin/Students.tsx`

The students page manages rider accounts and information:

#### Key Features
- **Rider List**: Complete list of registered riders
- **Search and Filter**: Find riders by name or attributes
- **Rider Details**: View comprehensive rider information
- **Accessibility Management**: Handle accessibility requirements
- **Usage Statistics**: Track rider usage patterns

#### Rider Data Management
- **Profile Information**: Name, email, phone, photo
- **Accessibility**: Special requirements and accommodations
- **Organization**: Department or group affiliation
- **Favorites**: Preferred locations and ride patterns
- **Usage History**: Ride history and statistics

## Location Management

### Locations Page

**File**: `frontend/src/pages/Admin/Locations.tsx`

The locations page manages all system locations:

#### Key Features
- **Location List**: Complete list of available locations
- **Map Integration**: Visual location display
- **Add Location**: Create new locations with coordinates
- **Edit Location**: Modify location information
- **Image Management**: Upload and manage location photos
- **Categorization**: Organize locations by type and purpose

#### Location Data Structure
```typescript
interface Location {
  id: string;
  name: string;
  shortName: string;
  address: string;
  info: string;
  tag: string;
  lat: number;
  lng: number;
  photoLink?: string;
  images?: string[];
}
```

#### Image Upload Process
```typescript
const uploadLocationImage = async (
  id: string,
  images?: LocationImage[]
): Promise<Location | null> => {
  if (!images || images.length === 0) return null;
  const buffers: string[] = [];
  for (const img of images) {
    if (img.file) {
      const b64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(img.file!);
        reader.onload = function () {
          const base64 = (reader.result as string).split(',')[1] || '';
          resolve(base64);
        };
      });
      buffers.push(b64);
    }
  }
  // Upload to S3 via API
  const resp = await axios.post('/api/upload/', {
    id,
    tableName: 'Locations',
    fileBuffers: buffers,
  });
  return resp.data?.data || resp.data;
};
```

## Analytics and Reporting

### Analytics Page

**File**: `frontend/src/pages/Admin/Analytics.tsx`

The analytics page provides comprehensive system reporting:

#### Analytics Features
- **Date Range Selection**: Custom date range filtering
- **Ride Data Analytics**: Ride statistics and trends
- **Driver Data Analytics**: Driver performance metrics
- **Export Functionality**: CSV export of analytics data
- **Tabbed Interface**: Switch between ride and driver analytics

#### Analytics Data Structure
```typescript
interface TableData {
  date: string;
  dayCount: number;
  dayNoShow: number;
  dayCancel: number;
  nightCount: number;
  nightNoShow: number;
  nightCancel: number;
  drivers: { [driverName: string]: number };
}
```

#### Analytics API

**File**: `server/src/router/stats.ts`

**Get Analytics Data**
- **Endpoint**: `GET /api/stats?from=YYYY-MM-DD&to=YYYY-MM-DD`
- **Auth**: Admin only
- **Response**: Array of daily statistics

**Download Analytics**
- **Endpoint**: `GET /api/stats/download?from=YYYY-MM-DD&to=YYYY-MM-DD`
- **Auth**: Admin only
- **Response**: CSV file with analytics data

**Update Statistics**
- **Endpoint**: `PUT /api/stats`
- **Auth**: Admin only
- **Request**: Statistics updates for specific dates
- **Response**: Updated statistics

#### Statistics Calculation
```typescript
function computeStats(
  res: Response,
  statsAcc: StatsType[],
  numDays: number,
  dayStart: string,
  dayEnd: string,
  nightStart: string,
  nightEnd: string,
  year: string,
  monthDay: string,
  download: boolean
) {
  // Calculate day vs night statistics
  // Track completed rides, no-shows, cancellations
  // Aggregate driver performance data
  // Store in Stats table for future reference
}
```

## Ride Management

### Ride Oversight

Admins have comprehensive ride management capabilities:

#### Ride Operations
- **View All Rides**: Complete ride history and current rides
- **Assign Drivers**: Assign drivers to unscheduled rides
- **Edit Rides**: Modify ride details and scheduling
- **Cancel Rides**: Cancel rides with proper notifications
- **Status Updates**: Monitor ride status and progress

#### Ride Assignment Process
1. **View Unscheduled Rides**: See all rides needing drivers
2. **Check Driver Availability**: Verify driver availability
3. **Assign Driver**: Assign available driver to ride
4. **Update Status**: Change ride status to scheduled
5. **Send Notifications**: Notify rider and driver

#### Ride Data Export
```typescript
const exportCols = 'Name,Pick Up,From,To,Drop Off,Needs,Driver';
const exportEndpoint = `/api/rides/download?date=${today}`;
const filename = `scheduledRides_${today}.csv`;
```

## System Configuration

### Configuration Management

Admins can configure various system settings:

#### Location Configuration
- **Add New Locations**: Create pickup/dropoff locations
- **Edit Existing Locations**: Update location information
- **Manage Categories**: Organize locations by type
- **Upload Images**: Add location photos and maps

#### User Configuration
- **Employee Management**: Add/edit drivers and admins
- **Role Assignment**: Assign admin roles and permissions
- **Availability Management**: Set driver availability schedules
- **Access Control**: Manage user permissions and access

#### System Settings
- **Notification Configuration**: Set up notification preferences
- **Analytics Settings**: Configure reporting parameters
- **Export Settings**: Set up data export formats
- **Holiday Management**: Configure system holidays

## Permissions and Access Control

### Admin Roles

**File**: `server/src/models/admin.ts`

```typescript
export type AdminType = {
  id: string;
  firstName: string;
  lastName: string;
  type: AdminRole[];
  isDriver: boolean;
  phoneNumber: string;
  email: string;
  photoLink?: string;
};

export type AdminRole = 'sds-admin' | 'redrunner-admin';
```

#### Role Types
- **sds-admin**: Standard admin role with full access
- **redrunner-admin**: Specialized admin role
- **isDriver**: Boolean flag for admin-driver hybrid users

### Permission Validation

**File**: `server/src/util/index.ts`

```typescript
export const validateUser = (requiredRole: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Validate JWT token
    // Check user role against required role
    // Grant or deny access based on permissions
  };
};
```

#### Access Levels
- **Admin**: Full system access
- **Driver**: Limited to driver operations
- **Rider**: Limited to rider operations
- **User**: Basic authenticated access

## Data Export and Reporting

### Export Functionality

The system provides comprehensive data export capabilities:

#### Export Types
- **Ride Data**: Complete ride information and history
- **Analytics Data**: Statistical reports and trends
- **User Data**: Employee and rider information
- **Location Data**: Location information and metadata

#### Export Formats
- **CSV**: Comma-separated values for spreadsheet import
- **JSON**: Structured data for API consumption
- **PDF**: Formatted reports for printing

#### Export Process
```typescript
const exportData = async (endpoint: string, filename: string) => {
  const response = await axios.get(endpoint);
  const blob = new Blob([response.data], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  window.URL.revokeObjectURL(url);
};
```

## Error Handling and Validation

### Client-Side Validation
- **Form Validation**: Ensure required fields are completed
- **Data Type Validation**: Validate data formats and types
- **Permission Checks**: Verify user has required permissions
- **Error Display**: Show user-friendly error messages

### Server-Side Validation
- **Authentication**: Verify user authentication
- **Authorization**: Check user permissions
- **Data Validation**: Validate request data
- **Error Responses**: Return appropriate error codes and messages

## Current Limitations

1. **Limited Role Management**: Basic admin role system
2. **No Bulk Operations**: Individual record management only
3. **Limited Analytics**: Basic reporting capabilities
4. **No Audit Trail**: No change tracking or logging
5. **No Advanced Filtering**: Basic search and filter options
6. **No Real-time Updates**: Manual refresh required

## Future Enhancements

1. **Advanced Role Management**: Granular permission system
2. **Bulk Operations**: Mass updates and operations
3. **Advanced Analytics**: Machine learning and predictive analytics
4. **Audit Trail**: Complete change tracking and logging
5. **Real-time Updates**: WebSocket integration for live updates
6. **Advanced Filtering**: Complex search and filter options
7. **Automated Reporting**: Scheduled reports and alerts
8. **System Monitoring**: Health checks and performance metrics
9. **Backup and Recovery**: Data backup and disaster recovery
10. **Multi-tenant Support**: Support for multiple organizations

## Related Components

- **EmployeeModal**: Employee creation and editing
- **LocationFormModal**: Location management
- **AnalyticsTable**: Analytics data display
- **ExportButton**: Data export functionality
- **SearchAndFilter**: Search and filtering components
- **StatsBox**: Statistics display components

## Dependencies

- **Material-UI**: UI components and styling
- **React Context**: State management
- **Axios**: API communication
- **Moment.js**: Date/time handling
- **Fast-CSV**: CSV export functionality
- **Dynamoose**: Database operations
