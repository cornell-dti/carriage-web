# Authentication Overview

## End-to-End Authentication Flow

The Carriage application uses Google OAuth2 with JWT tokens for authentication. The system supports three user types: Riders, Drivers, and Admins.

### Authentication Flow Diagram

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Frontend  │    │   Backend   │    │   Google    │    │  DynamoDB   │
│             │    │             │    │   OAuth2    │    │             │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
       │                   │                   │                   │
       │ 1. User clicks    │                   │                   │
       │    login button   │                   │                   │
       ├──────────────────►│                   │                   │
       │                   │ 2. Redirect to    │                   │
       │                   │    Google OAuth   │                   │
       │                   ├──────────────────►│                   │
       │                   │ 3. User grants    │                   │
       │                   │    permission     │                   │
       │                   │◄──────────────────┤                   │
       │ 4. Auth code      │                   │                   │
       │◄──────────────────┤                   │                   │
       │                   │ 5. Exchange code  │                   │
       │                   │    for ID token   │                   │
       │                   ├──────────────────►│                   │
       │                   │ 6. ID token       │                   │
       │                   │◄──────────────────┤                   │
       │                   │ 7. Verify token   │                   │
       │                   │    & get email    │                   │
       │                   │                   │                   │
       │                   │ 8. Look up user   │                   │
       │                   │    by email       │                   │
       │                   ├──────────────────────────────────────►│
       │                   │ 9. User data      │                   │
       │                   │◄──────────────────────────────────────┤
       │ 10. JWT token     │                   │                   │
       │◄──────────────────┤                   │                   │
       │                   │                   │                   │
       │ 11. Store JWT     │                   │                   │
       │     in encrypted  │                   │                   │
       │     cookie        │                   │                   │
       │                   │                   │                   │
       │ 12. Navigate to   │                   │                   │
       │     user dashboard│                   │                   │
```

## User Types and Roles

### Rider
- **Table**: `Riders`
- **Access**: Can request rides, view schedule, manage profile
- **Navigation**: `/rider/schedule`
- **Validation**: Must be active (`active: true`)

### Driver
- **Table**: `Drivers`
- **Access**: Can view assigned rides, update status, manage availability
- **Navigation**: `/driver/rides`
- **Special**: Can have admin privileges (`admin: true`)

### Admin
- **Table**: `Admins` (with fallback to `Drivers` table)
- **Access**: Full system access, user management, analytics
- **Navigation**: `/admin/home`
- **Roles**: `sds-admin` or `redrunner-admin`

## Token Management

### JWT Token Structure
```json
{
  "id": "user-uuid",
  "userType": "Rider|Driver|Admin",
  "iat": 1234567890,
  "exp": 1234567890
}
```

### Token Storage
- **Location**: Encrypted HTTP-only cookie named `jwt`
- **Encryption**: AES encryption using `REACT_APP_ENCRYPTION_KEY`
- **Security**: Secure flag enabled, path set to `/`

### Token Lifecycle
1. **Creation**: Generated on successful authentication
2. **Storage**: Encrypted and stored in cookie
3. **Usage**: Automatically attached to API requests via Axios interceptor
4. **Validation**: Server validates on each protected endpoint
5. **Expiration**: Handled by JWT expiration mechanism

## Authentication States

### Unauthenticated State
- User sees landing page with login options
- No access to protected routes
- Redirected to `/` for any protected route access

### Authenticated State
- User data loaded and cached in localStorage
- JWT token available for API requests
- Access to role-specific routes and features
- Automatic token refresh on user data updates

## Security Considerations

### Client-Side Security
- JWT tokens encrypted before storage
- Automatic token attachment to requests
- Secure cookie configuration
- Local storage for user data (non-sensitive)

### Server-Side Security
- Google OAuth2 token verification
- JWT signature validation
- Role-based access control
- Email-based user lookup with fallback logic

### Common Security Patterns
- **Token Refresh**: User data refreshed on login
- **Logout**: Complete token and data cleanup
- **Error Handling**: Graceful fallback on auth failures
- **Route Protection**: Automatic redirection for unauthorized access

## Error Handling

### Authentication Errors
- **Invalid Token**: Redirect to login
- **User Not Found**: Show error message
- **Inactive User**: Block access for riders
- **Network Errors**: Retry mechanism with fallback

### Token Validation Errors
- **Expired Token**: Automatic logout
- **Invalid Signature**: Clear tokens and redirect
- **Missing Token**: Redirect to login page

## Integration Points

### Frontend Components
- `AuthManager`: Main authentication orchestrator
- `GoogleAuth`: OAuth2 provider wrapper
- `AuthContext`: Global auth state management
- Axios interceptors: Automatic token handling

### Backend Routes
- `POST /api/auth`: Main authentication endpoint
- `POST /api/auth/dummy`: Test authentication (development only)
- Protected routes: All `/api/*` endpoints except health check

### External Services
- **Google OAuth2**: Identity provider
- **DynamoDB**: User data storage
- **JWT**: Token generation and validation
