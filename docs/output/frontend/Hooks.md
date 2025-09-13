# Frontend Custom Hooks

## Overview

The Carriage frontend uses custom React hooks to encapsulate reusable logic and provide consistent functionality across components. These hooks handle common patterns like window size detection, client configuration, and accessibility features.

## Custom Hooks

### useWindowSize

**Location**: `frontend/src/hooks/useWindowSize.ts`

**Purpose**: Provides responsive window size detection for responsive design.

**Signature**:
```typescript
const useWindowSize = (): WindowSize => {
  // Returns { width?: number; height?: number; }
};
```

**Features**:
- Real-time window size tracking
- Automatic event listener management
- Cleanup on component unmount
- Responsive design support

**Implementation**:
```typescript
const useWindowSize = () => {
  const [windowSize, setWindowSize] = useState<WindowSize>({});

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };
    
    window.addEventListener('resize', handleResize);
    handleResize(); // Initial call
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return windowSize;
};
```

**Usage**:
```typescript
const Component = () => {
  const { width, height } = useWindowSize();
  const isMobile = Boolean(width && width < 700);
  
  return (
    <div className={isMobile ? styles.mobile : styles.desktop}>
      {/* Responsive content */}
    </div>
  );
};
```

**Common Patterns**:
- Mobile/desktop detection
- Responsive component rendering
- Layout adjustments based on screen size
- Touch vs mouse interaction handling

### useClientId

**Location**: `frontend/src/hooks/useClientId.ts`

**Purpose**: Provides Google OAuth client ID from environment variables.

**Signature**:
```typescript
const useClientId = (): string => {
  // Returns REACT_APP_CLIENT_ID or empty string
};
```

**Features**:
- Environment variable access
- Fallback to empty string
- Simple configuration hook
- OAuth integration support

**Implementation**:
```typescript
const useClientId = () => process.env.REACT_APP_CLIENT_ID || '';
```

**Usage**:
```typescript
const GoogleAuth = () => {
  const clientId = useClientId();
  
  return (
    <GoogleOAuthProvider clientId={clientId}>
      <AuthManager />
    </GoogleOAuthProvider>
  );
};
```

**Configuration**:
- Set `REACT_APP_CLIENT_ID` in environment variables
- Used for Google OAuth2 authentication
- Supports different client IDs for different environments

### useSkipMain

**Location**: `frontend/src/hooks/useSkipMain.ts`

**Purpose**: Provides accessibility skip-to-main-content functionality.

**Signature**:
```typescript
const useSkipMain = (): React.RefObject<HTMLDivElement> => {
  // Returns ref for skip link focus management
};
```

**Features**:
- Accessibility compliance
- Focus management for screen readers
- Route change handling
- Skip link functionality

**Implementation**:
```typescript
const useSkipMain = () => {
  const location = useLocation();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.focus();
    }
  }, [location]);

  return ref;
};
```

**Usage**:
```typescript
const RoutesComponent = () => {
  const skipRef = useSkipMain();
  
  return (
    <>
      <div tabIndex={-1} ref={skipRef}></div>
      <HashLink className="skip-main" to="#main">
        Skip to main content
      </HashLink>
      {/* Page content */}
    </>
  );
};
```

**Accessibility Features**:
- WCAG compliance
- Screen reader support
- Keyboard navigation
- Focus management

## Hook Patterns

### Event Listener Hooks

**Pattern**: Hooks that manage event listeners with cleanup.

```typescript
const useEventListener = (eventName: string, handler: Function) => {
  useEffect(() => {
    window.addEventListener(eventName, handler);
    return () => window.removeEventListener(eventName, handler);
  }, [eventName, handler]);
};
```

### Configuration Hooks

**Pattern**: Hooks that provide configuration values.

```typescript
const useConfig = () => {
  return {
    apiUrl: process.env.REACT_APP_API_URL,
    clientId: process.env.REACT_APP_CLIENT_ID,
    environment: process.env.NODE_ENV,
  };
};
```

### State Management Hooks

**Pattern**: Hooks that encapsulate state logic.

```typescript
const useLocalStorage = (key: string, initialValue: any) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      return initialValue;
    }
  });

  const setValue = (value: any) => {
    try {
      setStoredValue(value);
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(error);
    }
  };

  return [storedValue, setValue];
};
```

## Hook Composition

### Combining Hooks

Hooks can be combined to create more complex functionality:

```typescript
const useResponsiveLayout = () => {
  const { width } = useWindowSize();
  const isMobile = Boolean(width && width < 700);
  const isTablet = Boolean(width && width >= 700 && width < 1024);
  const isDesktop = Boolean(width && width >= 1024);
  
  return { isMobile, isTablet, isDesktop, width };
};
```

### Custom Hook Dependencies

Hooks can depend on other hooks:

```typescript
const useAuthenticatedApi = () => {
  const { user } = useContext(AuthContext);
  const clientId = useClientId();
  
  const makeRequest = useCallback(async (endpoint: string) => {
    if (!user) throw new Error('Not authenticated');
    // Make authenticated request
  }, [user, clientId]);
  
  return { makeRequest };
};
```

## Performance Considerations

### Hook Optimization

1. **useCallback**: Memoize functions returned by hooks
2. **useMemo**: Memoize expensive calculations
3. **Dependency Arrays**: Minimize dependencies to prevent unnecessary re-runs
4. **Cleanup**: Proper cleanup in useEffect

### Example Optimized Hook

```typescript
const useOptimizedWindowSize = () => {
  const [windowSize, setWindowSize] = useState<WindowSize>({});
  
  const handleResize = useCallback(() => {
    setWindowSize({
      width: window.innerWidth,
      height: window.innerHeight,
    });
  }, []);
  
  useEffect(() => {
    window.addEventListener('resize', handleResize);
    handleResize();
    
    return () => window.removeEventListener('resize', handleResize);
  }, [handleResize]);
  
  return useMemo(() => ({
    ...windowSize,
    isMobile: Boolean(windowSize.width && windowSize.width < 700),
    isTablet: Boolean(windowSize.width && windowSize.width >= 700 && windowSize.width < 1024),
    isDesktop: Boolean(windowSize.width && windowSize.width >= 1024),
  }), [windowSize]);
};
```

## Testing Hooks

### Hook Testing Patterns

```typescript
import { renderHook, act } from '@testing-library/react-hooks';
import useWindowSize from './useWindowSize';

describe('useWindowSize', () => {
  it('returns window size', () => {
    const { result } = renderHook(() => useWindowSize());
    
    expect(result.current.width).toBe(window.innerWidth);
    expect(result.current.height).toBe(window.innerHeight);
  });
  
  it('updates on window resize', () => {
    const { result } = renderHook(() => useWindowSize());
    
    act(() => {
      // Simulate window resize
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 800,
      });
      window.dispatchEvent(new Event('resize'));
    });
    
    expect(result.current.width).toBe(800);
  });
});
```

### Mocking in Hook Tests

```typescript
// Mock environment variables
const originalEnv = process.env;

beforeEach(() => {
  process.env = {
    ...originalEnv,
    REACT_APP_CLIENT_ID: 'test-client-id',
  };
});

afterEach(() => {
  process.env = originalEnv;
});
```

## Hook Best Practices

### Design Principles

1. **Single Responsibility**: Each hook should have one clear purpose
2. **Reusability**: Hooks should be reusable across components
3. **Composability**: Hooks should work well together
4. **Performance**: Hooks should be optimized for performance
5. **Testing**: Hooks should be easily testable

### Naming Conventions

1. **Prefix**: All custom hooks start with "use"
2. **Descriptive**: Names should clearly describe the hook's purpose
3. **Consistent**: Follow consistent naming patterns
4. **Clear**: Names should be self-documenting

### Error Handling

```typescript
const useApiData = (endpoint: string) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(endpoint);
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [endpoint]);
  
  return { data, loading, error };
};
```

### TypeScript Integration

```typescript
interface UseApiDataReturn<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

const useApiData = <T>(endpoint: string): UseApiDataReturn<T> => {
  // Implementation
};
```

## Common Hook Patterns

### Data Fetching Hook

```typescript
const useFetch = <T>(url: string) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(url);
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [url]);
  
  return { data, loading, error };
};
```

### Form Hook

```typescript
const useForm = <T>(initialValues: T) => {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  
  const setValue = (name: keyof T, value: any) => {
    setValues(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };
  
  const setError = (name: keyof T, error: string) => {
    setErrors(prev => ({ ...prev, [name]: error }));
  };
  
  const reset = () => {
    setValues(initialValues);
    setErrors({});
  };
  
  return { values, errors, setValue, setError, reset };
};
```

### Debounced Hook

```typescript
const useDebounce = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  
  return debouncedValue;
};
```

## Integration with Context

### Context-Aware Hooks

```typescript
const useAuthenticatedUser = () => {
  const authContext = useContext(AuthContext);
  
  if (!authContext) {
    throw new Error('useAuthenticatedUser must be used within AuthProvider');
  }
  
  return authContext;
};
```

### Context-Specific Hooks

```typescript
const useRides = () => {
  const context = useContext(RidesContext);
  
  if (!context) {
    throw new Error('useRides must be used within RidesProvider');
  }
  
  return context;
};
```

## Future Hook Considerations

### Potential New Hooks

1. **useApi**: Generic API data fetching
2. **useLocalStorage**: Local storage management
3. **useDebounce**: Debounced value updates
4. **useIntersectionObserver**: Intersection observer API
5. **useMediaQuery**: Media query matching
6. **useGeolocation**: Geolocation API
7. **useNotification**: Web notifications API

### Hook Library Integration

Consider integrating with popular hook libraries:
- **react-use**: Collection of essential hooks
- **ahooks**: React hooks library
- **usehooks-ts**: TypeScript hooks library
