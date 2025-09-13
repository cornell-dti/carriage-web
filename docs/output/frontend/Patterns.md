# Frontend UI Patterns

## Overview

The Carriage application uses consistent UI patterns across all components to ensure a cohesive user experience. These patterns include reusable components, common layouts, and standardized interactions.

## Modal Patterns

### Base Modal Component

**Location**: `frontend/src/components/Modal/Modal.tsx`

The base modal component provides a consistent foundation for all modal dialogs in the application.

**Features**:
- Focus trap for accessibility
- Portal rendering to document body
- Body scroll lock when open
- Customizable close behavior
- Pagination support for multi-step modals

**Usage Pattern**:
```typescript
const [isModalOpen, setIsModalOpen] = useState(false);

<Modal
  title="Modal Title"
  isOpen={isModalOpen}
  onClose={() => setIsModalOpen(false)}
  displayClose={true}
>
  <ModalContent />
</Modal>
```

### Specialized Modal Components

#### Ride Details Modal

**Location**: `frontend/src/components/RideDetails/RideDetailsComponent.tsx`

**Purpose**: Comprehensive ride information display with role-based tabs.

**Features**:
- Material-UI Dialog integration
- Role-based tab display (Rider/Driver/Admin)
- Mobile-responsive design
- Action buttons for ride management
- Tab-based content organization

**Tab Structure**:
- **Overview**: Basic ride information
- **People**: Rider and driver details (Admin only)
- **Locations**: Start and end location details

#### Request Ride Modal

**Location**: `frontend/src/components/RequestRideModal/RequestRideModal.tsx`

**Purpose**: Multi-step ride request form with validation.

**Features**:
- Multi-step form with pagination
- Form validation with React Hook Form
- Location search integration
- Date and time selection
- Accessibility information collection

#### Employee Modal

**Location**: `frontend/src/components/EmployeeModal/EmployeeModal.tsx`

**Purpose**: Employee creation and editing with role selection.

**Features**:
- Role-based form fields
- Photo upload functionality
- Availability management
- Validation and error handling

#### Location Modal

**Location**: `frontend/src/components/LocationModal/LocationModal.tsx`

**Purpose**: Location creation and editing with map integration.

**Features**:
- Map-based location selection
- Address validation
- Image upload
- Category tagging

## Table Patterns

### Base Table Components

**Location**: `frontend/src/components/TableComponents/TableComponents.tsx`

The table system provides flexible, responsive table layouts with consistent styling.

**Components**:
- **Table**: Container component
- **Row**: Table row with flexible column sizing
- **Cell**: Individual cell with tag support

**Features**:
- Responsive grid layout
- Flexible column sizing
- Tag integration for location display
- Grouped row support
- Mobile-responsive design

**Usage Pattern**:
```typescript
<Table>
  <Row data={headers} colSizes={[1, 2, 1, 1]} header />
  {data.map((item, index) => (
    <Row
      key={index}
      data={[
        item.name,
        { data: item.location, tag: item.locationTag },
        item.status,
        item.actions
      ]}
      colSizes={[1, 2, 1, 1]}
      onClick={() => handleRowClick(item)}
    />
  ))}
</Table>
```

### Specialized Table Components

#### User Tables

**Location**: `frontend/src/components/UserTables/`

**Purpose**: User management tables with search, filtering, and actions.

**Features**:
- Search and filter functionality
- Bulk actions
- User status management
- Export capabilities
- Pagination

#### Analytics Table

**Location**: `frontend/src/components/AnalyticsTable/AnalyticsTable.tsx`

**Purpose**: Analytics data display with filtering and export.

**Features**:
- Date range filtering
- Data visualization
- Export functionality
- Real-time updates
- Performance metrics

## Form Patterns

### Base Form Components

**Location**: `frontend/src/components/FormElements/FormElements.tsx`

The form system provides consistent form elements with validation and styling.

**Components**:
- **Input**: Text input with type-specific styling
- **Button**: Button with size and style variants
- **SelectComponent**: React Hook Form integrated select
- **Label**: Form label with consistent styling
- **SRLabel**: Screen reader only label

**Usage Pattern**:
```typescript
import { useForm, Controller } from 'react-hook-form';
import { Input, Button, SelectComponent } from '../FormElements/FormElements';

const Form = () => {
  const { control, handleSubmit } = useForm();

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Input
        type="text"
        placeholder="Enter name"
        {...register('name', { required: true })}
      />
      <SelectComponent
        control={control}
        name="location"
        datalist={locations}
        rules={{ required: true }}
      />
      <Button type="submit">Submit</Button>
    </form>
  );
};
```

### Form Validation Patterns

**React Hook Form Integration**:
```typescript
const { control, register, handleSubmit, formState: { errors } } = useForm({
  defaultValues: {
    name: '',
    email: '',
    location: ''
  }
});

// Validation rules
const validationRules = {
  name: { required: 'Name is required' },
  email: { 
    required: 'Email is required',
    pattern: {
      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
      message: 'Invalid email address'
    }
  }
};
```

### Multi-Step Form Pattern

**Location**: `frontend/src/components/RequestRideModal/RequestRideModal.tsx`

**Features**:
- Step-by-step form progression
- Form state persistence
- Validation per step
- Navigation between steps
- Progress indicators

**Implementation**:
```typescript
const [currentStep, setCurrentStep] = useState(0);
const [formData, setFormData] = useState({});

const steps = [
  { title: 'Basic Info', component: BasicInfoStep },
  { title: 'Location', component: LocationStep },
  { title: 'Schedule', component: ScheduleStep },
  { title: 'Review', component: ReviewStep }
];

const handleNext = (stepData) => {
  setFormData({ ...formData, ...stepData });
  setCurrentStep(currentStep + 1);
};
```

## Card Patterns

### Base Card Component

**Location**: `frontend/src/components/Card/Card.tsx`

**Purpose**: Consistent card layout for displaying related information.

**Features**:
- Consistent padding and spacing
- Hover effects
- Click handling
- Flexible content area

### Specialized Card Components

#### Employee Cards

**Location**: `frontend/src/components/EmployeeCards/EmployeeCards.tsx`

**Purpose**: Employee information display with actions.

**Features**:
- Employee photo display
- Contact information
- Status indicators
- Action buttons
- Availability display

#### Favorites Card

**Location**: `frontend/src/components/RiderComponents/FavoritesCard.tsx`

**Purpose**: Favorite ride display with quick actions.

**Features**:
- Ride information summary
- Quick action buttons
- Status indicators
- Remove from favorites

## Navigation Patterns

### Sidebar Navigation

**Location**: `frontend/src/components/Sidebar/Sidebar.tsx`

**Purpose**: Role-based navigation with consistent layout.

**Features**:
- Role-based menu items
- Active state indication
- User profile display
- Logout functionality
- Responsive design

**Menu Structure**:
```typescript
const adminMenu = [
  { icon: home, caption: 'Home', path: 'home' },
  { icon: drivers, caption: 'Employees', path: 'employees' },
  { icon: riders, caption: 'Students', path: 'riders' },
  { icon: locations, caption: 'Locations', path: 'locations' },
  { icon: analytics, caption: 'Analytics', path: 'analytics' }
];
```

### Tab Navigation

**Location**: `frontend/src/components/TabSwitcher/TabSwitcher.tsx`

**Purpose**: Tab-based content organization.

**Features**:
- Tab switching
- Active state indication
- Content area management
- Responsive design

## Status Display Patterns

### Status Indicators

**Location**: `frontend/src/components/Tag/Tag.tsx`

**Purpose**: Consistent status and category display.

**Features**:
- Color-coded status
- Text and icon variants
- Size variants
- Accessibility support

**Usage**:
```typescript
<Tag location="Central Campus" tag="central" reduced={false} />
<Tag location="Active" tag="active" reduced={true} />
```

### Ride Status Components

**Location**: `frontend/src/components/RideStatus/`

**Purpose**: Ride status display and management.

**Features**:
- Status progression display
- Action buttons
- Status updates
- Visual indicators

## Search and Filter Patterns

### Search Bar

**Location**: `frontend/src/components/SearchBar/SearchBar.tsx`

**Purpose**: Consistent search functionality across the application.

**Features**:
- Real-time search
- Search suggestions
- Clear functionality
- Keyboard navigation

### Search and Filter

**Location**: `frontend/src/components/FormElements/SearchAndFilter.tsx`

**Purpose**: Advanced search and filtering interface.

**Features**:
- Multiple filter options
- Date range filtering
- Status filtering
- Clear all filters
- Filter persistence

## Notification Patterns

### Toast Notifications

**Location**: `frontend/src/components/ConfirmationToast/ConfirmationToast.tsx`

**Purpose**: User feedback for actions and status updates.

**Features**:
- Success and error variants
- Auto-dismiss
- Manual dismiss
- Accessibility support

**Usage**:
```typescript
const { showToast } = useToast();

showToast('Ride created successfully', 'success');
showToast('Error creating ride', 'error');
```

### Push Notifications

**Location**: `frontend/src/components/Notification/Notification.tsx`

**Purpose**: Push notification display and management.

**Features**:
- Notification list
- Mark as read
- Notification actions
- Real-time updates

## Loading and Error Patterns

### Loading States

**Pattern**: Consistent loading indicators across the application.

**Implementation**:
```typescript
const [loading, setLoading] = useState(true);
const [data, setData] = useState(null);

if (loading) {
  return <LoadingSpinner />;
}

if (!data) {
  return <ErrorMessage message="No data available" />;
}
```

### Error Handling

**Pattern**: Consistent error display and handling.

**Components**:
- Error messages
- Retry buttons
- Fallback content
- Error boundaries

## Responsive Design Patterns

### Mobile-First Design

**Approach**: Design for mobile first, then enhance for larger screens.

**Implementation**:
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

### Breakpoint Management

**Breakpoints**:
- Mobile: < 700px
- Tablet: 700px - 1024px
- Desktop: > 1024px

### Responsive Components

**Patterns**:
- Collapsible sidebar on mobile
- Stacked layouts on small screens
- Horizontal layouts on large screens
- Touch-friendly interactions on mobile

## Accessibility Patterns

### Focus Management

**Pattern**: Proper focus handling for modals and forms.

**Implementation**:
```typescript
import FocusTrap from 'focus-trap-react';

<FocusTrap
  focusTrapOptions={{
    onDeactivate: onClose,
    returnFocusOnDeactivate: true,
    clickOutsideDeactivates: true,
  }}
>
  <ModalContent />
</FocusTrap>
```

### Screen Reader Support

**Pattern**: Proper labeling and descriptions for screen readers.

**Implementation**:
```typescript
<button
  aria-label="Close modal"
  aria-describedby="modal-description"
  onClick={onClose}
>
  <img alt="close" src={close} />
</button>
```

### Keyboard Navigation

**Pattern**: Full keyboard support for all interactions.

**Features**:
- Tab navigation
- Enter/Space activation
- Escape key handling
- Arrow key navigation
- Focus indicators

## Performance Patterns

### Lazy Loading

**Pattern**: Load components and data on demand.

**Implementation**:
```typescript
const LazyComponent = React.lazy(() => import('./Component'));

<Suspense fallback={<LoadingSpinner />}>
  <LazyComponent />
</Suspense>
```

### Memoization

**Pattern**: Prevent unnecessary re-renders.

**Implementation**:
```typescript
const MemoizedComponent = React.memo(({ data }) => {
  return <div>{data.name}</div>;
});

const MemoizedCallback = useCallback((item) => {
  handleItemClick(item);
}, [handleItemClick]);
```

### Virtual Scrolling

**Pattern**: Efficient rendering of large lists.

**Implementation**:
```typescript
import { FixedSizeList as List } from 'react-window';

<List
  height={600}
  itemCount={items.length}
  itemSize={50}
  itemData={items}
>
  {({ index, style, data }) => (
    <div style={style}>
      {data[index].name}
    </div>
  )}
</List>
```

## Best Practices

### Component Composition

1. **Single Responsibility**: Each component has one clear purpose
2. **Composition over Inheritance**: Build complex components from simple ones
3. **Props Interface**: Clear, well-typed prop interfaces
4. **Default Props**: Provide sensible defaults
5. **Error Boundaries**: Handle component errors gracefully

### State Management

1. **Local State**: Use for component-specific state
2. **Context State**: Use for shared state across components
3. **URL State**: Use for navigation and filter state
4. **Server State**: Use for data fetched from APIs

### Performance

1. **Memoization**: Use React.memo and useMemo appropriately
2. **Lazy Loading**: Load components and data on demand
3. **Bundle Splitting**: Split code by route and feature
4. **Image Optimization**: Optimize images for web delivery

### Accessibility

1. **Semantic HTML**: Use appropriate HTML elements
2. **ARIA Attributes**: Provide proper labeling
3. **Keyboard Navigation**: Support all interactions
4. **Focus Management**: Manage focus in modals and forms
5. **Screen Reader Support**: Test with assistive technologies
