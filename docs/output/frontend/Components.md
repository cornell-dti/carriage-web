# Frontend Components

## Overview

The Carriage frontend is built with React 18 and TypeScript, using Material-UI (MUI) for the component library and CSS modules for styling. The component architecture follows a modular pattern with clear separation of concerns.

## Component Architecture

### Component Categories

#### 1. Layout Components
- **Sidebar**: Navigation sidebar with role-based menu items
- **Footer**: Application footer component
- **Modal**: Reusable modal component with pagination support

#### 2. Form Components
- **FormElements**: Reusable form components (Input, Button, Select, Label)
- **SearchAndFilter**: Search and filtering interface
- **MiniCal**: Mini calendar component for date selection

#### 3. Data Display Components
- **TableComponents**: Reusable table components (Table, Row, Cell)
- **Card**: Generic card component
- **Tag**: Location tag display component
- **AnalyticsOverview**: Analytics dashboard overview
- **AnalyticsTable**: Analytics data table with filtering

#### 4. User Interface Components
- **UserDetail**: User detail display components
- **UserTables**: User management table components
- **EmployeeCards**: Employee card display components
- **RiderComponents**: Rider-specific UI components

#### 5. Ride Management Components
- **RideDetails**: Comprehensive ride details modal with tabs
- **RideModal**: Ride creation and editing modal
- **RequestRideModal**: Ride request modal with multi-step form
- **RideStatus**: Ride status display components

#### 6. Location Components
- **Locations**: Location management interface
- **LocationModal**: Location creation and editing modal
- **LocationMap**: Interactive map component
- **PlacesSearch**: Google Places search integration

#### 7. Authentication Components
- **AuthManager**: Main authentication orchestrator
- **GoogleAuth**: Google OAuth2 provider wrapper
- **SubscribeWrapper**: Push notification subscription wrapper

#### 8. Utility Components
- **ConfirmationToast**: Toast notification component
- **CopyButton**: Copy-to-clipboard button
- **ExportButton**: Data export functionality
- **ExportPreview**: Export preview interface
- **Notification**: Push notification display
- **NoRidesView**: Empty state for no rides
- **UpdateStatusModal**: Status update modal

## Key Components

### Sidebar Component

**Location**: `frontend/src/components/Sidebar/Sidebar.tsx`

**Purpose**: Role-based navigation sidebar with user profile and logout functionality.

**Props**:
```typescript
type SidebarProps = {
  type: 'admin' | 'rider' | 'driver';
  children: React.ReactNode;
};
```

**Features**:
- Role-based menu items
- User profile photo display
- Logout functionality
- Responsive design
- Skip-to-content accessibility

**Menu Structure**:
- **Admin**: Home, Employees, Students, Locations, Analytics, Rides
- **Rider**: Schedule, Settings
- **Driver**: Rides, Reports, Settings

### Modal Component

**Location**: `frontend/src/components/Modal/Modal.tsx`

**Purpose**: Reusable modal component with pagination and accessibility features.

**Props**:
```typescript
type ModalProps = {
  title: string | string[];
  isOpen: boolean;
  paginate?: boolean;
  currentPage?: number;
  children: React.ReactNode;
  onClose?: () => void;
  displayClose?: boolean;
  isRider?: boolean;
  id?: string;
  arialabelledby?: string;
};
```

**Features**:
- Focus trap for accessibility
- Pagination support
- Portal rendering
- Body scroll lock
- Customizable close behavior

### FormElements Component

**Location**: `frontend/src/components/FormElements/FormElements.tsx`

**Purpose**: Reusable form components with consistent styling and validation.

**Components**:
- **Label**: Form label with consistent styling
- **SRLabel**: Screen reader only label for accessibility
- **Input**: Text input with type-specific styling
- **Button**: Button component with size and style variants
- **SelectComponent**: React Hook Form integrated select component

**Button Variants**:
```typescript
type ButtonProps = {
  small?: boolean;      // Small or large size
  outline?: boolean;    // Primary or secondary style
  disabled?: boolean;
  onClick?: (e: React.BaseSyntheticEvent) => void;
  children: React.ReactNode;
};
```

### TableComponents

**Location**: `frontend/src/components/TableComponents/TableComponents.tsx`

**Purpose**: Reusable table components with responsive design and flexible layouts.

**Components**:
- **Table**: Container component for table layout
- **Row**: Table row with flexible column sizing
- **Cell**: Individual table cell with tag support

**Features**:
- Responsive grid layout
- Flexible column sizing
- Tag integration for location display
- Grouped row support
- Mobile-responsive design

### RideDetails Component

**Location**: `frontend/src/components/RideDetails/RideDetailsComponent.tsx`

**Purpose**: Comprehensive ride details modal with role-based tabs and actions.

**Props**:
```typescript
interface RideDetailsProps {
  open: boolean;
  onClose: () => void;
  ride: RideType;
  onRideUpdated?: (updatedRide: RideType) => void;
}
```

**Features**:
- Role-based tab display
- Material-UI Dialog integration
- Mobile-responsive design
- Tab-based content organization
- Action buttons for ride management

**Tab Structure**:
- **Rider/Driver**: Overview, Locations
- **Admin**: Overview, People, Locations

## Component Patterns

### CSS Modules

All components use CSS modules for styling:

```typescript
import styles from './ComponentName.module.css';

// Usage
<div className={styles.container}>
  <h1 className={styles.title}>Title</h1>
</div>
```

### Context Integration

Components integrate with React contexts for state management:

```typescript
import AuthContext from '../../context/auth';
import { RidesProvider } from '../../context/RidesContext';

const Component = () => {
  const authContext = useContext(AuthContext);
  // Component logic
};
```

### TypeScript Integration

All components are fully typed with TypeScript:

```typescript
interface ComponentProps {
  title: string;
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const Component: React.FC<ComponentProps> = ({ title, isOpen, onClose, children }) => {
  // Component implementation
};
```

### Accessibility Features

Components include accessibility features:

- **Focus Management**: Focus trap in modals
- **ARIA Labels**: Proper labeling for screen readers
- **Skip Links**: Skip-to-content functionality
- **Keyboard Navigation**: Full keyboard support
- **Screen Reader Support**: Hidden labels and descriptions

### Responsive Design

Components are designed to be responsive:

```typescript
import useWindowSize from '../../hooks/useWindowSize';

const Component = () => {
  const { width } = useWindowSize();
  const isMobile = Boolean(width && width < 700);
  
  return (
    <div className={isMobile ? styles.mobile : styles.desktop}>
      {/* Content */}
    </div>
  );
};
```

## Component Dependencies

### External Libraries

- **@mui/material**: Material-UI components
- **@mui/icons-material**: Material-UI icons
- **react-hook-form**: Form management
- **react-select**: Advanced select components
- **focus-trap-react**: Focus management
- **classnames**: Conditional CSS classes

### Internal Dependencies

- **Context Providers**: Auth, Rides, Locations, etc.
- **Custom Hooks**: useWindowSize, useSkipMain, useClientId
- **Utility Functions**: Axios configuration, type definitions
- **Icon System**: Organized icon imports

## Component Organization

### File Structure

```
components/
├── ComponentName/
│   ├── ComponentName.tsx          # Main component
│   ├── ComponentName.module.css   # Styles
│   ├── SubComponent.tsx           # Sub-components
│   └── types.ts                   # Type definitions
```

### Import Patterns

```typescript
// External libraries
import React, { useState, useContext } from 'react';
import { Dialog, DialogContent } from '@mui/material';

// Internal components
import AuthContext from '../../context/auth';
import { Button, Input } from '../FormElements/FormElements';

// Styles and assets
import styles from './ComponentName.module.css';
import { close } from '../../icons/other/index';
```

## Component Testing

### Testing Patterns

Components should be tested for:

- **Rendering**: Component renders without errors
- **Props**: Props are handled correctly
- **User Interactions**: Click handlers and form submissions
- **Accessibility**: ARIA attributes and keyboard navigation
- **Responsive Behavior**: Mobile and desktop layouts

### Example Test Structure

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import Component from './Component';

describe('Component', () => {
  it('renders with correct title', () => {
    render(<Component title="Test Title" />);
    expect(screen.getByText('Test Title')).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    const onClose = jest.fn();
    render(<Component onClose={onClose} />);
    fireEvent.click(screen.getByRole('button', { name: /close/i }));
    expect(onClose).toHaveBeenCalled();
  });
});
```

## Performance Considerations

### Optimization Techniques

- **React.memo**: Prevent unnecessary re-renders
- **useCallback**: Memoize event handlers
- **useMemo**: Memoize expensive calculations
- **Lazy Loading**: Code splitting for large components
- **Portal Rendering**: Efficient modal rendering

### Bundle Size Optimization

- **Tree Shaking**: Import only needed components
- **Dynamic Imports**: Load components on demand
- **Icon Optimization**: Import only used icons
- **CSS Modules**: Scoped styles reduce conflicts

## Best Practices

### Component Design

1. **Single Responsibility**: Each component has one clear purpose
2. **Composition**: Build complex components from simple ones
3. **Props Interface**: Clear, well-typed prop interfaces
4. **Default Props**: Provide sensible defaults
5. **Error Boundaries**: Handle component errors gracefully

### Code Organization

1. **File Naming**: Use PascalCase for components
2. **Export Patterns**: Default export for main component
3. **Import Order**: External libraries first, then internal
4. **Type Definitions**: Separate types file for complex components
5. **Documentation**: JSDoc comments for complex logic

### Accessibility

1. **Semantic HTML**: Use appropriate HTML elements
2. **ARIA Attributes**: Provide proper labeling
3. **Keyboard Navigation**: Support all interactions
4. **Focus Management**: Manage focus in modals and forms
5. **Screen Reader Support**: Test with assistive technologies
