# Frontend State Management

## Overview

The Carriage frontend uses React Context API for global state management, combined with local component state and custom hooks. The state management architecture follows a provider pattern with clear separation of concerns and optimized performance.

## Provider Tree Structure

The application uses a nested provider structure to manage different aspects of state:

```
App
├── ToastProvider (Global notifications)
└── GoogleAuth
    └── AuthContext.Provider (Authentication state)
        └── SubscribeWrapper (Push notifications)
            └── Routes
                ├── AdminRoutes
                │   ├── DateContext.Provider
                │   ├── EmployeesProvider
                │   ├── RidersProvider
                │   ├── RidesProvider
                │   └── LocationsProvider
                ├── RiderRoutes
                │   ├── DateContext.Provider
                │   ├── RidesProvider
                │   └── LocationsProvider
                └── DriverRoutes
                    ├── DateContext.Provider
                    ├── RidesProvider
                    └── LocationsProvider
```

## Context Providers

### Authentication Context

**Location**: `frontend/src/context/auth.ts`

**Purpose**: Manages user authentication state and provides authentication methods.

**State**:
```typescript
type AuthState = {
  logout: () => void;
  id: any;
  user?: ValidUser;
  refreshUser: () => void;
};
```

**Features**:
- User authentication status
- User profile data
- Logout functionality
- User data refresh capability

**Usage**:
```typescript
const authContext = useContext(AuthContext);
const { logout, id, user, refreshUser } = authContext;
```

### Date Context

**Location**: `frontend/src/context/date.ts`

**Purpose**: Manages the current date state for analytics and scheduling.

**State**:
```typescript
type DateContextType = {
  curDate: Date;
  setCurDate: React.Dispatch<React.SetStateAction<Date>>;
};
```

**Features**:
- Current date management
- Date updates for analytics
- Shared date state across components

**Usage**:
```typescript
const { curDate, setCurDate } = useDate();
```

### Rides Context

**Location**: `frontend/src/context/RidesContext.tsx`

**Purpose**: Manages ride data with separation between scheduled and unscheduled rides.

**State**:
```typescript
type ridesState = {
  unscheduledRides: Ride[];
  scheduledRides: Ride[];
  refreshRides: () => Promise<void>;
};
```

**Features**:
- Separate arrays for scheduled and unscheduled rides
- Automatic data fetching on mount
- Manual refresh capability
- Date-based filtering integration

**Data Flow**:
1. Component mounts → `refreshRides()` called
2. API call to `/api/rides`
3. Data filtered by `schedulingState`
4. State updated with filtered arrays

**Usage**:
```typescript
const { unscheduledRides, scheduledRides, refreshRides } = useRides();
```

### Riders Context

**Location**: `frontend/src/context/RidersContext.tsx`

**Purpose**: Manages rider (student) data with sorting and refresh capabilities.

**State**:
```typescript
type ridersState = {
  riders: Array<Rider>;
  refreshRiders: () => Promise<void>;
};
```

**Features**:
- Alphabetical sorting by name
- Automatic data fetching on mount
- Manual refresh capability
- Component mount tracking for cleanup

**Data Flow**:
1. Component mounts → `refreshRiders()` called
2. API call to `/api/riders`
3. Data sorted alphabetically by full name
4. State updated with sorted array

**Usage**:
```typescript
const { riders, refreshRiders } = useRiders();
```

### Employees Context

**Location**: `frontend/src/context/EmployeesContext.tsx`

**Purpose**: Manages employee data (drivers and admins) with separate arrays and sorting.

**State**:
```typescript
type employeesState = {
  drivers: Array<Driver>;
  admins: Array<Admin>;
  refreshDrivers: () => Promise<void>;
  refreshAdmins: () => Promise<void>;
};
```

**Features**:
- Separate arrays for drivers and admins
- Alphabetical sorting by name
- Independent refresh methods
- Component mount tracking for cleanup

**Data Flow**:
1. Component mounts → Both refresh methods called
2. Parallel API calls to `/api/drivers` and `/api/admins`
3. Data sorted alphabetically by full name
4. State updated with sorted arrays

**Usage**:
```typescript
const { drivers, admins, refreshDrivers, refreshAdmins } = useEmployees();
```

### Locations Context

**Location**: `frontend/src/context/LocationsContext.tsx`

**Purpose**: Manages location data with sorting and refresh capabilities.

**State**:
```typescript
type locationsState = {
  locations: Array<Location>;
  refreshLocations: () => Promise<void>;
};
```

**Features**:
- Alphabetical sorting by name
- Automatic data fetching on mount
- Manual refresh capability
- Component mount tracking for cleanup

**Data Flow**:
1. Component mounts → `refreshLocations()` called
2. API call to `/api/locations`
3. Data sorted alphabetically by name
4. State updated with sorted array

**Usage**:
```typescript
const { locations, refreshLocations } = useLocations();
```

### Toast Context

**Location**: `frontend/src/context/toastContext.tsx`

**Purpose**: Manages global toast notifications with success and error states.

**State**:
```typescript
type toastStat = {
  visible: boolean;
  message: string;
  showToast: (message: string, currentToastType: ToastStatus) => void;
  toastType: boolean;
};
```

**Features**:
- Success and error toast types
- Auto-dismiss after 2 seconds
- Portal rendering for global display
- Simple show/hide state management

**Usage**:
```typescript
const { visible, message, showToast, toastType } = useToast();

showToast('Operation successful', ToastStatus.SUCCESS);
showToast('Operation failed', ToastStatus.ERROR);
```

## State Management Patterns

### Provider Pattern

All contexts follow a consistent provider pattern:

```typescript
// 1. Define state type
type ContextState = {
  data: DataType[];
  refreshData: () => Promise<void>;
};

// 2. Create context with initial state
const Context = React.createContext(initialState);

// 3. Create custom hook
export const useContext = () => React.useContext(Context);

// 4. Create provider component
export const ContextProvider = ({ children }: ProviderProps) => {
  const [data, setData] = useState<DataType[]>([]);
  
  const refreshData = useCallback(async () => {
    // API call and state update
  }, []);

  return (
    <Context.Provider value={{ data, refreshData }}>
      {children}
    </Context.Provider>
  );
};
```

### Data Fetching Pattern

All data contexts follow a consistent data fetching pattern:

```typescript
const refreshData = useCallback(async () => {
  try {
    const response = await axios.get('/api/endpoint');
    const data = response.data.data;
    
    // Process data (sorting, filtering)
    if (data) {
      data.sort((a, b) => a.name.localeCompare(b.name));
      setData(data);
    }
  } catch (error) {
    console.error('Error refreshing data:', error);
  }
}, []);
```

### Component Mount Tracking

Contexts use `useRef` to track component mount status for cleanup:

```typescript
const componentMounted = useRef(true);

useEffect(() => {
  refreshData();
  
  return () => {
    componentMounted.current = false;
  };
}, [refreshData]);

// In data fetching
if (componentMounted.current) {
  setData(newData);
}
```

### Memoization and Performance

Contexts use `useCallback` for function memoization:

```typescript
const refreshData = useCallback(async () => {
  // API call logic
}, []); // Empty dependency array for stable reference
```

## State Lifecycle

### Initialization

1. **App Start**: ToastProvider and AuthContext initialized
2. **Route Mount**: Role-specific contexts initialized
3. **Data Fetching**: All contexts fetch initial data
4. **State Population**: Components receive populated state

### Updates

1. **User Actions**: Components trigger context methods
2. **API Calls**: Context methods make API requests
3. **State Updates**: Context state updated with new data
4. **Re-renders**: Components re-render with updated state

### Cleanup

1. **Route Unmount**: Context providers unmount
2. **Component Cleanup**: useRef flags set to false
3. **Memory Cleanup**: Event listeners and timers cleared

## Data Flow Architecture

### Top-Down Data Flow

```
API Response → Context State → Component Props → UI Update
```

### Bottom-Up Actions

```
User Action → Component Handler → Context Method → API Call → State Update
```

### Cross-Context Communication

Contexts can communicate through:
- Shared parent context
- Event-based communication
- Direct method calls
- State synchronization

## Performance Considerations

### Optimization Strategies

1. **useCallback**: Memoize context methods to prevent unnecessary re-renders
2. **useMemo**: Memoize expensive calculations in context values
3. **Component Mount Tracking**: Prevent state updates on unmounted components
4. **Selective Re-renders**: Use multiple contexts to minimize re-render scope

### Memory Management

1. **Cleanup Functions**: Proper cleanup in useEffect
2. **Ref Tracking**: Track component mount status
3. **Event Listeners**: Remove event listeners on unmount
4. **Timers**: Clear timers and intervals

### Bundle Size Optimization

1. **Context Splitting**: Separate contexts by concern
2. **Lazy Loading**: Load contexts on demand
3. **Tree Shaking**: Import only needed context methods
4. **Code Splitting**: Split contexts by route

## Error Handling

### Context Error Patterns

```typescript
const refreshData = useCallback(async () => {
  try {
    const response = await axios.get('/api/endpoint');
    const data = response.data.data;
    setData(data);
  } catch (error) {
    console.error('Error refreshing data:', error);
    // Could also update error state here
  }
}, []);
```

### Error State Management

Contexts can include error state:

```typescript
type ContextState = {
  data: DataType[];
  error: string | null;
  loading: boolean;
  refreshData: () => Promise<void>;
};
```

## Testing Contexts

### Context Testing Patterns

```typescript
import { render, screen } from '@testing-library/react';
import { ContextProvider } from './Context';

const renderWithContext = (component) => {
  return render(
    <ContextProvider>
      {component}
    </ContextProvider>
  );
};

describe('Context', () => {
  it('provides data to components', () => {
    renderWithContext(<TestComponent />);
    expect(screen.getByText('Expected Data')).toBeInTheDocument();
  });
});
```

### Mocking Contexts

```typescript
const mockContextValue = {
  data: mockData,
  refreshData: jest.fn(),
};

jest.mock('./Context', () => ({
  useContext: () => mockContextValue,
}));
```

## Best Practices

### Context Design

1. **Single Responsibility**: Each context has one clear purpose
2. **Minimal State**: Keep only necessary state in contexts
3. **Stable References**: Use useCallback for context methods
4. **Error Handling**: Include error handling in context methods
5. **Type Safety**: Use TypeScript for all context types

### Performance

1. **Context Splitting**: Split large contexts into smaller ones
2. **Memoization**: Use useCallback and useMemo appropriately
3. **Selective Subscriptions**: Components only subscribe to needed context
4. **Lazy Loading**: Load contexts on demand

### Maintenance

1. **Consistent Patterns**: Follow consistent patterns across contexts
2. **Documentation**: Document context purpose and usage
3. **Testing**: Test context behavior and integration
4. **Error Boundaries**: Use error boundaries for context errors
