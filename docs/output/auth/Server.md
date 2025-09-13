# Server-Side Authentication

## Authentication Routes

### Main Authentication Endpoint
**POST** `/api/auth`

Exchanges Google OAuth2 authorization code for JWT token.

#### Request Body
```json
{
  "code": "google_oauth_authorization_code",
  "table": "Riders|Drivers|Admins"
}
```

#### Response
```json
{
  "jwt": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Error Responses
```json
{
  "err": "User not found"
}
```

```json
{
  "err": "User not active"
}
```

```json
{
  "err": "Table not found"
}
```

### Test Authentication Endpoint (Development Only)
**POST** `/api/auth/dummy`

Used for testing authentication without Google OAuth.

#### Request Body
```json
{
  "email": "test@example.com",
  "table": "Riders|Drivers|Admins"
}
```

## Authentication Flow Implementation

### OAuth2 Token Exchange
```typescript
async function getIdToken(client: OAuth2Client, code: string) {
  const { tokens } = await client.getToken(code);
  const idToken = tokens.id_token!;
  return idToken;
}
```

### Token Verification
```typescript
const client = new OAuth2Client({
  clientId: oauthValues.client_id,
  clientSecret: oauthValues.client_secret,
  redirectUri: req.get('origin'),
});

const idToken = req.body.idToken || (await getIdToken(client, code));
const result = await client.verifyIdToken({ idToken, audience });
const email = result.getPayload()?.email;
```

### User Lookup and JWT Generation
```typescript
function findUserAndSendToken(
  res: express.Response,
  model: ModelType<Item>,
  table: string,
  email: string
) {
  model.scan({ email: { eq: email } }).exec((err, data) => {
    if (err) {
      res.status(err.statusCode || 500).send({ err: err.message });
      return;
    }

    if (data?.length) {
      const { id, active } = data[0].toJSON();
      if (table === 'Riders' && !active) {
        res.status(400).send({ err: 'User not active' });
        return;
      }
      const userPayload = {
        id,
        userType: getUserType(table),
      };
      res
        .status(200)
        .send({ jwt: jwt.sign(userPayload, process.env.JWT_SECRET!) });
    }
  });
}
```

## User Model Mapping

### Model Selection
```typescript
function getModel(table: string) {
  const tableToModel: { [table: string]: ModelType<Item> } = {
    Riders: Rider,
    Drivers: Driver,
    Admins: Admin,
  };
  return tableToModel[table];
}
```

### User Type Derivation
```typescript
function getUserType(table: string) {
  return table.slice(0, table.length - 1);
}
```

## Role-Based Access Control

### Admin Fallback Logic
For admin authentication, the system checks both `Admins` and `Drivers` tables:

```typescript
if (table === 'Admins') {
  // Check drivers table for admins
  Driver.scan({ email: { eq: email } }).exec((dErr, dData) => {
    if (dData?.length) {
      const { id, admin } = dData[0].toJSON();
      if (admin) {
        const userPayload = {
          id,
          userType: getUserType(table),
        };
        res
          .status(200)
          .send({ jwt: jwt.sign(userPayload, process.env.JWT_SECRET!) });
      }
    }
  });
}
```

### User Type Validation
- **Riders**: Must have `active: true` to authenticate
- **Drivers**: Can authenticate if active (default: true)
- **Admins**: Can authenticate from either `Admins` table or `Drivers` table with `admin: true`

## JWT Token Structure

### Token Payload
```typescript
const userPayload = {
  id: string,        // User's unique identifier
  userType: string   // "Rider", "Driver", or "Admin"
};
```

### Token Generation
```typescript
jwt.sign(userPayload, process.env.JWT_SECRET!)
```

## OAuth2 Configuration

### Audience Validation
```typescript
const audience = [
  // driver ios
  '241748771473-a4q5skhr0is8r994o7ie9scrnm5ua760.apps.googleusercontent.com',
  // android
  '241748771473-0r3v31qcthi2kj09e5qk96mhsm5omrvr.apps.googleusercontent.com',
  // web
  '241748771473-da6i0hbtsl78nlkvbvaauvigh3lv0gt0.apps.googleusercontent.com',
  // rider ios
  '241748771473-7rfda2grc8f7p099bmf98en0q9bcvp18.apps.googleusercontent.com',
];
```

### OAuth2 Client Configuration
```typescript
const client = new OAuth2Client({
  clientId: oauthValues.client_id,
  clientSecret: oauthValues.client_secret,
  redirectUri: req.get('origin'),
});
```

## Error Handling

### Authentication Errors
- **400**: User not found, user not active, invalid table
- **500**: Server errors, database errors, OAuth errors

### Error Response Format
```json
{
  "err": "Error message description"
}
```

### Common Error Scenarios
1. **Invalid OAuth Code**: Token exchange fails
2. **Invalid ID Token**: Google token verification fails
3. **User Not Found**: Email not in database
4. **Inactive User**: Rider account deactivated
5. **Database Errors**: DynamoDB connection issues

## Security Considerations

### Token Security
- **JWT Secret**: Stored in environment variables
- **Token Expiration**: Handled by JWT library
- **Signature Validation**: Server validates all incoming tokens

### OAuth2 Security
- **Audience Validation**: Only accepts tokens from configured clients
- **Origin Validation**: Uses request origin for redirect URI
- **Token Verification**: Google's official library for token validation

### Database Security
- **Email Lookup**: Case-sensitive email matching
- **Active Status**: Riders must be active to authenticate
- **Admin Privileges**: Special handling for admin-flagged drivers

## Environment Configuration

### Required Environment Variables
```typescript
export const oauthValues = {
  client_id: process.env.OAUTH_CLIENT_ID,
  client_secret: process.env.OAUTH_CLIENT_SECRET,
};

// JWT signing secret
process.env.JWT_SECRET
```

### OAuth2 Client IDs
The system supports multiple OAuth2 client IDs for different platforms:
- Web application
- iOS driver app
- iOS rider app
- Android app

## Database Models

### User Model Schemas

#### Rider Model
```typescript
{
  id: string,
  firstName: string,
  lastName: string,
  email: string,
  active: boolean,  // Required for authentication
  // ... other fields
}
```

#### Driver Model
```typescript
{
  id: string,
  firstName: string,
  lastName: string,
  email: string,
  admin: boolean,   // Admin privilege flag
  active: boolean,  // Default: true
  // ... other fields
}
```

#### Admin Model
```typescript
{
  id: string,
  firstName: string,
  lastName: string,
  email: string,
  type: AdminRole[], // 'sds-admin' | 'redrunner-admin'
  isDriver: boolean,
  // ... other fields
}
```

## API Integration

### Protected Route Middleware
All API routes (except `/api/auth` and `/api/health-check`) require valid JWT tokens in the Authorization header:

```
Authorization: Bearer <jwt_token>
```

### Token Validation
The server validates JWT tokens on each protected request:
1. Extract token from Authorization header
2. Verify JWT signature using `JWT_SECRET`
3. Validate token expiration
4. Extract user ID and type for request processing
