# Frontend Pages

## Overview

The Carriage application uses React Router for client-side routing with role-based page access. Each user type (Admin, Rider, Driver) has a dedicated set of pages with appropriate functionality and data access.

## Page Architecture

### Route Structure

The application uses nested routing with role-based access:

```
/ (Landing Page)
├── /admin/* (Admin Routes)
│   ├── /admin/home
│   ├── /admin/employees
│   ├── /admin/riders
│   ├── /admin/locations
│   ├── /admin/analytics
│   └── /admin/rides
├── /rider/* (Rider Routes)
│   ├── /rider/schedule
│   └── /rider/settings
└── /driver/* (Driver Routes)
    ├── /driver/rides
    ├── /driver/reports
    └── /driver/settings
```

### Route Protection

Routes are protected by the `AuthManager` component which:
- Checks for valid JWT token
- Redirects unauthenticated users to landing page
- Provides role-based navigation
- Manages authentication state

## Page Components

### Landing Page

**Location**: `frontend/src/pages/Landing/Landing.tsx`

**Purpose**: Public landing page with authentication options for different user types.

**Features**:
- Google OAuth2 login buttons for each user type
- Role-based authentication (Students, Admins, Drivers)
- Responsive design with campus imagery
- Public access (no authentication required)

**Authentication Flow**:
```typescript
// Student (Rider) login
const studentLogin = googleAuth({
  flow: 'auth-code',
  onSuccess: async (res) => signIn('Rider', res.code),
  onError: (errorResponse) => console.error(errorResponse),
});

// Admin login
const adminLogin = googleAuth({
  flow: 'auth-code',
  onSuccess: async (res) => signIn('Admin', res.code),
  onError: (errorResponse) => console.error(errorResponse),
});

// Driver login
const driverLogin = googleAuth({
  flow: 'auth-code',
  onSuccess: async (res) => signIn('Driver', res.code),
  onError: (errorResponse) => console.error(errorResponse),
});
```

## Admin Pages

### Admin Routes

**Location**: `frontend/src/pages/Admin/Routes.tsx`

**Context Providers**:
- `DateContext`: Date management for analytics and scheduling
- `EmployeesProvider`: Employee (drivers/admins) data management
- `RidersProvider`: Rider data management
- `RidesProvider`: Ride data management
- `LocationsProvider`: Location data management

### Admin Home

**Location**: `frontend/src/pages/Admin/Home.tsx`

**Purpose**: Admin dashboard with overview statistics and quick actions.

**Features**:
- System overview statistics
- Quick access to common admin tasks
- Export functionality for data
- Recent activity feed

**Data Needs**:
- Ride statistics
- User counts
- System health metrics
- Recent rides and activities

### Admin Employees

**Location**: `frontend/src/pages/Admin/Employees.tsx`

**Purpose**: Employee management interface for drivers and admins.

**Features**:
- Employee list with search and filtering
- Add new employees
- Edit employee information
- View employee details
- Employee status management

**Data Needs**:
- Driver and admin data
- Employee statistics
- Availability information
- Performance metrics

### Admin Students (Riders)

**Location**: `frontend/src/pages/Admin/Students.tsx`

**Purpose**: Student (rider) management interface.

**Features**:
- Rider list with search and filtering
- Add new riders
- Edit rider information
- View rider details
- Rider status management
- Accessibility information management

**Data Needs**:
- Rider data
- Rider statistics
- Usage patterns
- Accessibility requirements

### Admin Locations

**Location**: `frontend/src/pages/Admin/Locations.tsx`

**Purpose**: Location management interface.

**Features**:
- Location list with map view
- Add new locations
- Edit location information
- Location categorization
- Image management
- Geographic data management

**Data Needs**:
- Location data
- Geographic coordinates
- Location images
- Usage statistics

### Admin Analytics

**Location**: `frontend/src/pages/Admin/Analytics.tsx`

**Purpose**: Analytics dashboard with comprehensive reporting.

**Features**:
- Ride statistics and trends
- User activity analytics
- Performance metrics
- Export capabilities
- Date range filtering
- Visual charts and graphs

**Data Needs**:
- Historical ride data
- User statistics
- Performance metrics
- Time-series data

## Rider Pages

### Rider Routes

**Location**: `frontend/src/pages/Rider/Routes.tsx`

**Context Providers**:
- `DateContext`: Date management for scheduling
- `RidesProvider`: Ride data management
- `LocationsProvider`: Location data management

### Rider Schedule

**Location**: `frontend/src/pages/Rider/Schedule.tsx`

**Purpose**: Rider's personal schedule and ride management.

**Features**:
- Personal ride schedule
- Request new rides
- View ride details
- Cancel rides
- Favorite locations
- Ride history

**Data Needs**:
- User's ride data
- Available locations
- Driver information
- Ride status updates

### Rider Settings

**Location**: `frontend/src/pages/Rider/Settings.tsx`

**Purpose**: Rider profile and preference management.

**Features**:
- Profile information editing
- Accessibility preferences
- Notification settings
- Account management
- Privacy settings

**Data Needs**:
- User profile data
- Accessibility information
- Notification preferences
- Account settings

## Driver Pages

### Driver Routes

**Location**: `frontend/src/pages/Driver/Routes.tsx`

**Context Providers**:
- `DateContext`: Date management for scheduling
- `RidesProvider`: Ride data management
- `LocationsProvider`: Location data management

### Driver Rides

**Location**: `frontend/src/pages/Driver/Rides.tsx`

**Purpose**: Driver's assigned rides and status management.

**Features**:
- Assigned rides list
- Ride status updates
- Navigation assistance
- Ride details view
- Availability management

**Data Needs**:
- Assigned ride data
- Ride status information
- Location data
- Navigation data

### Driver Reports

**Location**: `frontend/src/pages/Driver/Reports.tsx`

**Purpose**: Driver performance and activity reporting.

**Features**:
- Personal performance metrics
- Ride completion statistics
- Earnings information
- Activity reports
- Performance trends

**Data Needs**:
- Driver performance data
- Ride completion statistics
- Time-based metrics
- Performance trends

### Driver Settings

**Location**: `frontend/src/pages/Driver/Settings.tsx`

**Purpose**: Driver profile and preference management.

**Features**:
- Profile information editing
- Availability management
- Vehicle information
- Notification settings
- Account management

**Data Needs**:
- Driver profile data
- Availability information
- Vehicle data
- Notification preferences

## Page Data Flow

### Context Integration

Pages integrate with React contexts for data management:

```typescript
const AdminRoutes = () => {
  const [curDate, setCurDate] = useState(new Date());
  const defaultVal = { curDate, setCurDate };

  return (
    <DateContext.Provider value={defaultVal}>
      <EmployeesProvider>
        <RidersProvider>
          <RidesProvider>
            <LocationsProvider>
              <RoutesComponent />
            </LocationsProvider>
          </RidesProvider>
        </RidersProvider>
      </EmployeesProvider>
    </DateContext.Provider>
  );
};
```

### Data Loading Patterns

Pages follow consistent data loading patterns:

1. **Context Providers**: Wrap pages with necessary data providers
2. **Lazy Loading**: Load data on component mount
3. **Error Handling**: Handle loading and error states
4. **Caching**: Use context for data caching
5. **Real-time Updates**: Subscribe to data changes

### Authentication Integration

Pages integrate with authentication context:

```typescript
const Page = () => {
  const authContext = useContext(AuthContext);
  const { user, id, logout } = authContext;
  
  // Page logic using authenticated user data
};
```

## Page Layout Patterns

### Sidebar Layout

All authenticated pages use the sidebar layout:

```typescript
<Sidebar type="admin">
  <Routes>
    <Route path="home" element={<Home />} />
    <Route path="employees" element={<Employees />} />
    {/* Additional routes */}
  </Routes>
</Sidebar>
```

### Responsive Design

Pages are designed to be responsive:

- **Desktop**: Full sidebar with content area
- **Mobile**: Collapsible sidebar or bottom navigation
- **Tablet**: Adaptive layout based on screen size

### Accessibility Features

Pages include accessibility features:

- **Skip Links**: Skip to main content
- **Focus Management**: Proper focus handling
- **ARIA Labels**: Screen reader support
- **Keyboard Navigation**: Full keyboard support

## Page State Management

### Local State

Pages use local state for:

- UI state (modals, forms, filters)
- Temporary data
- User interactions
- Component-specific state

### Context State

Pages use context state for:

- Shared data across components
- User authentication
- Global application state
- Data caching

### URL State

Pages use URL state for:

- Navigation state
- Filter parameters
- Page parameters
- Deep linking

## Page Performance

### Optimization Techniques

- **Code Splitting**: Lazy load page components
- **Data Fetching**: Optimize API calls
- **Caching**: Use context for data caching
- **Memoization**: Prevent unnecessary re-renders
- **Bundle Optimization**: Minimize bundle size

### Loading States

Pages handle loading states:

```typescript
const Page = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    fetchData().then((result) => {
      setData(result);
      setLoading(false);
    });
  }, []);

  if (loading) return <LoadingSpinner />;
  if (!data) return <ErrorMessage />;
  
  return <PageContent data={data} />;
};
```

## Page Testing

### Testing Strategies

Pages should be tested for:

- **Rendering**: Page renders without errors
- **Navigation**: Route changes work correctly
- **Data Loading**: Data loads and displays properly
- **User Interactions**: Forms and buttons work
- **Accessibility**: Page is accessible
- **Responsive Design**: Works on different screen sizes

### Test Structure

```typescript
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Page from './Page';

const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('Page', () => {
  it('renders page content', () => {
    renderWithRouter(<Page />);
    expect(screen.getByText('Page Title')).toBeInTheDocument();
  });
});
```

## Page Security

### Access Control

Pages implement access control:

- **Authentication**: Verify user is logged in
- **Authorization**: Check user permissions
- **Role-based Access**: Restrict access by user type
- **Data Filtering**: Show only relevant data

### Data Protection

Pages protect sensitive data:

- **Input Validation**: Validate all user inputs
- **XSS Prevention**: Sanitize user content
- **CSRF Protection**: Use CSRF tokens
- **Secure Headers**: Set security headers
