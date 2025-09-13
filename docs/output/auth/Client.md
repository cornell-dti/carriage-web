# Client-Side Authentication

## Storage Mechanisms

### JWT Token Storage
- **Location**: HTTP-only cookie named `jwt`
- **Encryption**: AES encryption using `REACT_APP_ENCRYPTION_KEY`
- **Security**: Secure flag enabled, path set to `/`

```typescript
// Cookie encryption/decryption
const encrypt = (data: string) => {
  const encrypted = CryptoJS.AES.encrypt(
    JSON.stringify(data),
    secretKey
  ).toString();
  return encrypted;
};

const decrypt = (hash: string | CryptoJS.lib.CipherParams) => {
  const bytes = CryptoJS.AES.decrypt(hash, secretKey);
  const decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
  return decryptedData;
};
```

### Local Storage
- **User ID**: `localStorage.getItem('userId')`
- **User Type**: `localStorage.getItem('userType')`
- **User Data**: `localStorage.getItem('user')` (full user object)

## Route Guards and Protection

### Authentication State Management
The application uses a centralized `AuthManager` component that handles all authentication logic:

```typescript
// Authentication state
const [signedIn, setSignedIn] = useState(getCookie('jwt'));
const [id, setId] = useState(localStorage.getItem('userId') || '');
const [user, setUser] = useState<Rider | Admin | Driver>(
  JSON.parse(localStorage.getItem('user') || '{}')
);
```

### Route Protection Pattern
Instead of traditional `PrivateRoute` components, the app uses conditional rendering in `AuthManager`:

```typescript
if (!signedIn) {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

// Authenticated routes
return (
  <AuthContext.Provider value={{ logout, id, user, refreshUser }}>
    <Routes>
      <Route path="/admin/*" element={<AdminRoutes />} />
      <Route path="/rider/*" element={<RiderRoutes />} />
      <Route path="/driver/*" element={<DriverRoutes />} />
    </Routes>
  </AuthContext.Provider>
);
```

### User Type-Based Navigation
Automatic redirection based on user type:

```typescript
// Default route redirection
<Route
  path="/"
  element={
    <Navigate
      to={
        localStorage.getItem('userType') === 'Admin'
          ? '/admin/home'
          : localStorage.getItem('userType') === 'Driver'
          ? '/driver/rides'
          : '/rider/schedule'
      }
      replace
    />
  }
/>
```

## Axios Interceptors

### Request Interceptor
Automatically attaches JWT token to all API requests:

```typescript
instance.interceptors.request.use(
  (config) => {
    const jwtCookie = document.cookie
      .split(';')
      .find((c) => c.trim().startsWith('jwt='));
    if (jwtCookie) {
      const encryptedJwt = jwtCookie.split('=')[1];
      const decryptedJwt = decrypt(encryptedJwt);
      config.headers['Authorization'] = `Bearer ${decryptedJwt}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
```

### Token Management
```typescript
export const setAuthToken = (token: string) => {
  if (token) {
    instance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete instance.defaults.headers.common['Authorization'];
  }
};
```

## Authentication Context

### AuthContext Structure
```typescript
type AuthState = {
  logout: () => void;
  id: any;
  user?: ValidUser;
  refreshUser: () => void;
};

const AuthContext = createContext({
  logout: () => {},
  id: '',
  user: {},
  refreshUser: () => {},
} as AuthState);
```

### Context Usage
- **logout**: Clears all authentication data and redirects to landing
- **id**: Current user's ID for API calls
- **user**: Full user object with profile data
- **refreshUser**: Function to refresh user data from server

## Error States and Handling

### Login Error Handling
```typescript
.catch((error) => {
  console.error('Login error:', error);
  logout(); // Clear state and redirect
});
```

### Token Decryption Errors
```typescript
try {
  const decryptedJwt = decrypt(encryptedJwt);
  return decryptedJwt;
} catch (error) {
  console.error('Error decrypting JWT:', error);
  return '';
}
```

### Authentication State Errors
- **Invalid Token**: Automatic logout and redirect
- **Network Errors**: Graceful fallback with error logging
- **User Not Found**: Clear state and show error message

## Google OAuth Integration

### OAuth Configuration
```typescript
const adminLogin = googleAuth({
  flow: 'auth-code',
  onSuccess: async (res) => signIn('Admin', res.code),
  onError: (errorResponse) => console.error(errorResponse),
});

const studentLogin = googleAuth({
  flow: 'auth-code',
  onSuccess: async (res) => signIn('Rider', res.code),
  onError: (errorResponse) => console.error(errorResponse),
});

const driverLogin = googleAuth({
  flow: 'auth-code',
  onSuccess: async (res) => signIn('Driver', res.code),
  onError: (errorResponse) => console.error(errorResponse),
});
```

### OAuth Provider Setup
```typescript
<GoogleOAuthProvider
  clientId={clientId}
  onScriptLoadError={() => console.log('error')}
>
  <AuthManager />
</GoogleOAuthProvider>
```

## User Data Refresh

### Refresh Function Creation
```typescript
function createRefresh(userId: string, userType: string, token: string) {
  let endpoint = '';
  
  if (userType === 'Admin') {
    endpoint = `/api/admins/${userId}`;
  } else if (userType === 'Driver') {
    endpoint = `/api/drivers/${userId}`;
  } else {
    endpoint = `/api/riders/${userId}`;
  }
  
  return () => {
    axios
      .get(endpoint)
      .then((res) => res.data)
      .then(({ data }) => {
        localStorage.setItem('user', JSON.stringify(data));
        setUser(data);
      });
  };
}
```

### Refresh Triggers
- **On Login**: User data fetched and cached
- **Manual Refresh**: Via context `refreshUser` function
- **Profile Updates**: After user profile modifications

## Logout Process

### Complete State Cleanup
```typescript
function logout() {
  googleLogout();
  localStorage.removeItem('userType');
  localStorage.removeItem('userId');
  localStorage.removeItem('user');
  deleteCookie('jwt');
  setAuthToken('');
  setSignedIn(false);
  navigate('/', { replace: true });
}
```

### Cookie Management
```typescript
function deleteCookie(name: string) {
  if (getCookie(name)) {
    document.cookie =
      name + '=; expires=Thu, 01 Jan 1970 00:00:01 GMT;path=/;';
  }
}
```

## Security Considerations

### Client-Side Security
- **Token Encryption**: JWT tokens encrypted before storage
- **Secure Cookies**: HTTP-only cookies with secure flag
- **Automatic Cleanup**: Complete state clearing on logout
- **Error Handling**: Graceful fallback on authentication failures

### Best Practices
- **No Sensitive Data**: Only non-sensitive user data in localStorage
- **Token Validation**: Server-side validation on every request
- **Automatic Logout**: On token expiration or validation errors
- **Route Protection**: Unauthenticated users redirected to landing page
