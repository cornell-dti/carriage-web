# Frontend Overview

## Introduction

The Carriage frontend is a React 18 application built with TypeScript, providing a comprehensive ride-sharing management system for Cornell University's transportation services. The application serves three distinct user types: **Riders** (students), **Drivers** (employees), and **Admins** (administrators), each with role-specific interfaces and functionality.

## Technology Stack

### Core Technologies

- **React 18**: Modern React with hooks and concurrent features
- **TypeScript**: Full type safety and enhanced developer experience
- **React Router**: Client-side routing with role-based access control
- **Material-UI (MUI)**: Component library for consistent UI design
- **CSS Modules**: Scoped styling for component isolation

### Key Dependencies

- **@react-oauth/google**: Google OAuth2 integration
- **axios**: HTTP client with authentication interceptors
- **jwt-decode**: JWT token decoding
- **crypto-js**: Encryption/decryption for secure token storage
- **moment**: Date and time manipulation
- **react-hook-form**: Form management and validation
- **focus-trap-react**: Accessibility focus management

## Application Architecture

### Component Structure

The frontend follows a modular component architecture with clear separation of concerns:

```
frontend/src/
├── components/          # Reusable UI components
│   ├── AuthManager/     # Authentication components
│   ├── Modal/          # Modal system
│   ├── FormElements/   # Form components
│   ├── TableComponents/# Table system
│   ├── RideDetails/    # Ride management
│   └── ...
├── pages/              # Route-specific pages
│   ├── Admin/          # Admin dashboard pages
│   ├── Rider/          # Rider interface pages
│   └── Driver/         # Driver interface pages
├── context/            # React Context providers
├── hooks/              # Custom React hooks
├── util/               # Utility functions
├── types/              # TypeScript type definitions
└── icons/              # Icon assets
```

### State Management

The application uses React Context API for global state management:

- **Authentication Context**: User authentication and profile data
- **Data Contexts**: Rides, Riders, Employees, Locations
- **UI Contexts**: Toast notifications, Date management
- **Local State**: Component-specific state with useState/useReducer

### Routing Architecture

Role-based routing with protected routes:

- **Landing Page**: Public authentication interface
- **Admin Routes**: `/admin/*` - Administrative functions
- **Rider Routes**: `/rider/*` - Student ride management
- **Driver Routes**: `/driver/*` - Driver operations

## User Interfaces

### Landing Page

**Purpose**: Public entry point with role-based authentication

**Features**:
- Google OAuth2 login for each user type
- Role selection (Student, Admin, Driver)
- Responsive design with campus imagery
- Public access (no authentication required)

### Admin Interface

**Purpose**: Comprehensive administrative dashboard

**Pages**:
- **Home**: System overview and quick actions
- **Employees**: Driver and admin management
- **Students**: Rider (student) management
- **Locations**: Location management with map integration
- **Analytics**: Comprehensive reporting and statistics
- **Rides**: Ride management and oversight

**Features**:
- Full CRUD operations for all entities
- Advanced analytics and reporting
- Export functionality
- User management and permissions
- System configuration

### Rider Interface

**Purpose**: Student ride request and management

**Pages**:
- **Schedule**: Personal ride schedule and history
- **Settings**: Profile and preference management

**Features**:
- Ride request creation
- Schedule viewing and management
- Ride cancellation
- Favorite locations
- Accessibility preferences
- Profile management

### Driver Interface

**Purpose**: Driver operations and ride management

**Pages**:
- **Rides**: Assigned rides and status updates
- **Reports**: Performance metrics and reporting
- **Settings**: Profile and availability management

**Features**:
- Ride status updates
- Navigation assistance
- Performance tracking
- Availability management
- Profile management

## Component System

### Design System

The application uses a consistent design system with:

- **Material-UI Components**: Base component library
- **Custom Components**: Extended and specialized components
- **CSS Modules**: Scoped styling for component isolation
- **Responsive Design**: Mobile-first approach with breakpoints
- **Accessibility**: WCAG compliance with focus management

### Key Component Categories

1. **Layout Components**: Sidebar, Footer, Modal system
2. **Form Components**: Input, Button, Select, validation
3. **Data Display**: Tables, Cards, Analytics components
4. **Navigation**: Sidebar, Tabs, Breadcrumbs
5. **Feedback**: Toast notifications, Loading states
6. **Specialized**: Ride management, Location picker, Map integration

### Component Patterns

- **Composition**: Build complex components from simple ones
- **Props Interface**: Clear, well-typed prop interfaces
- **Error Boundaries**: Graceful error handling
- **Accessibility**: ARIA attributes and keyboard navigation
- **Performance**: Memoization and optimization

## State Management

### Context Providers

The application uses multiple context providers for different aspects of state:

#### Authentication Context
- User authentication status
- User profile data
- Logout functionality
- Token management

#### Data Contexts
- **RidesContext**: Ride data with scheduled/unscheduled separation
- **RidersContext**: Student data with sorting and filtering
- **EmployeesContext**: Driver and admin data management
- **LocationsContext**: Location data with geographic information

#### UI Contexts
- **ToastContext**: Global notification system
- **DateContext**: Shared date state for analytics

### State Patterns

- **Provider Pattern**: Consistent context provider structure
- **Data Fetching**: Automatic data loading with refresh capabilities
- **Error Handling**: Comprehensive error handling and user feedback
- **Performance**: Memoization and optimization strategies

## Custom Hooks

### Utility Hooks

- **useWindowSize**: Responsive design support
- **useClientId**: Google OAuth configuration
- **useSkipMain**: Accessibility skip-to-content functionality

### Hook Patterns

- **Event Listeners**: Window resize, focus management
- **Configuration**: Environment variable access
- **State Management**: Local storage, form state
- **Performance**: Debouncing, memoization

## Authentication & Security

### Authentication Flow

1. **Google OAuth2**: User authenticates with Google
2. **JWT Token**: Server issues JWT token
3. **Token Storage**: Encrypted JWT stored in cookies
4. **Request Interceptors**: Automatic token attachment
5. **Role-Based Access**: Route protection based on user type

### Security Features

- **Encrypted Tokens**: JWT tokens encrypted before storage
- **HTTPS Only**: Secure communication
- **Role-Based Access**: Granular permission system
- **Input Validation**: Client-side validation with server verification
- **XSS Protection**: Sanitized user input

## Performance Optimization

### Bundle Optimization

- **Code Splitting**: Route-based code splitting
- **Tree Shaking**: Unused code elimination
- **Lazy Loading**: Components loaded on demand
- **Bundle Analysis**: Regular bundle size monitoring

### Runtime Performance

- **Memoization**: React.memo and useMemo for expensive operations
- **Virtual Scrolling**: Efficient large list rendering
- **Image Optimization**: Optimized image loading
- **Caching**: Context-based data caching

### Development Performance

- **Hot Reloading**: Fast development iteration
- **TypeScript**: Compile-time error detection
- **ESLint**: Code quality enforcement
- **Prettier**: Consistent code formatting

## Accessibility

### WCAG Compliance

- **Semantic HTML**: Proper HTML element usage
- **ARIA Attributes**: Screen reader support
- **Keyboard Navigation**: Full keyboard accessibility
- **Focus Management**: Proper focus handling in modals
- **Color Contrast**: Accessible color schemes

### Accessibility Features

- **Skip Links**: Skip to main content functionality
- **Screen Reader Support**: Proper labeling and descriptions
- **High Contrast**: Support for high contrast modes
- **Text Scaling**: Responsive text sizing
- **Alternative Text**: Image descriptions

## Testing Strategy

### Testing Approach

- **Unit Tests**: Individual component testing
- **Integration Tests**: Component interaction testing
- **E2E Tests**: Full user workflow testing
- **Accessibility Tests**: Screen reader and keyboard testing

### Testing Tools

- **Jest**: Test runner and assertion library
- **React Testing Library**: Component testing utilities
- **Cypress**: End-to-end testing
- **Accessibility Testing**: Automated accessibility checks

## Development Workflow

### Local Development

1. **Environment Setup**: Node.js, npm, environment variables
2. **Dependencies**: Install frontend and server dependencies
3. **Development Server**: Hot reloading development server
4. **API Integration**: Connect to local or remote API
5. **Testing**: Run tests and linting

### Build Process

1. **TypeScript Compilation**: Type checking and compilation
2. **Bundle Optimization**: Webpack optimization
3. **Asset Processing**: Image and font optimization
4. **Environment Configuration**: Build-time environment setup
5. **Static Generation**: Production-ready static files

## Deployment

### Production Build

- **Optimized Bundle**: Minified and compressed assets
- **Environment Variables**: Production configuration
- **Static Hosting**: Served from CDN or static host
- **API Integration**: Production API endpoints

### Deployment Options

- **Heroku**: Platform-as-a-Service deployment
- **Docker**: Containerized deployment
- **Static Hosting**: CDN-based deployment
- **Traditional Hosting**: Server-based deployment

## Documentation Structure

### Component Documentation

- **[Components](./Components.md)**: Component taxonomy and patterns
- **[Pages](./Pages.md)**: Route-to-page mapping and data needs
- **[Patterns](./Patterns.md)**: Reusable UI patterns and conventions

### State Documentation

- **[State](./State.md)**: Context providers and state management
- **[Hooks](./Hooks.md)**: Custom hooks and their usage

### Integration Documentation

- **[Authentication](../auth/Overview.md)**: End-to-end authentication flow
- **[Utilities](../shared/Utilities.md)**: Shared utility functions

## Getting Started

### Prerequisites

- Node.js 16+ and npm
- Google OAuth2 credentials
- Environment variables configured
- Backend API running

### Quick Start

1. **Clone Repository**: Get the latest code
2. **Install Dependencies**: `npm install`
3. **Configure Environment**: Set up environment variables
4. **Start Development**: `npm start`
5. **Access Application**: Open browser to localhost:3000

### Development Commands

```bash
# Start development server
npm start

# Run tests
npm test

# Build for production
npm run build

# Type checking
npm run type-check

# Linting
npm run lint
```

## Best Practices

### Code Organization

1. **Component Structure**: Clear component hierarchy
2. **File Naming**: Consistent naming conventions
3. **Import Organization**: Logical import ordering
4. **Type Definitions**: Comprehensive TypeScript typing
5. **Documentation**: JSDoc comments for complex logic

### Performance

1. **Bundle Size**: Monitor and optimize bundle size
2. **Runtime Performance**: Use React optimization techniques
3. **Memory Management**: Proper cleanup and garbage collection
4. **Network Optimization**: Efficient API calls and caching

### Accessibility

1. **Semantic HTML**: Use appropriate HTML elements
2. **ARIA Support**: Provide proper ARIA attributes
3. **Keyboard Navigation**: Ensure full keyboard support
4. **Screen Reader**: Test with assistive technologies

### Security

1. **Input Validation**: Validate all user inputs
2. **XSS Prevention**: Sanitize user content
3. **CSRF Protection**: Use CSRF tokens
4. **Secure Headers**: Set appropriate security headers

## Troubleshooting

### Common Issues

1. **Authentication Errors**: Check JWT token and Google OAuth setup
2. **API Connection**: Verify backend API is running and accessible
3. **Build Errors**: Check TypeScript errors and dependencies
4. **Performance Issues**: Monitor bundle size and runtime performance

### Debug Tools

- **React DevTools**: Component inspection and debugging
- **Redux DevTools**: State management debugging
- **Network Tab**: API call monitoring
- **Console Logs**: Error tracking and debugging

## Future Considerations

### Planned Enhancements

1. **Progressive Web App**: PWA capabilities for mobile experience
2. **Offline Support**: Offline functionality and data sync
3. **Real-time Updates**: WebSocket integration for live updates
4. **Advanced Analytics**: Enhanced reporting and insights
5. **Mobile App**: Native mobile application

### Technology Updates

1. **React 19**: Upgrade to latest React version
2. **Next.js**: Consider Next.js for SSR capabilities
3. **GraphQL**: Evaluate GraphQL for API integration
4. **Micro-frontends**: Consider micro-frontend architecture
5. **Performance**: Continuous performance optimization
