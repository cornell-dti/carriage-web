# Error Handling and Response Structure

## Overview

The Carriage API uses a consistent error response structure across all endpoints. Errors are returned as JSON objects with descriptive messages and appropriate HTTP status codes.

## Error Response Format

All error responses follow this structure:

```json
{
  "err": "Error message description"
}
```

## HTTP Status Codes

### 2xx Success
- **200 OK**: Successful GET, PUT, DELETE operations
- **201 Created**: Successful POST operations

### 4xx Client Errors
- **400 Bad Request**: Invalid request data, validation errors, missing required fields
- **401 Unauthorized**: Missing or invalid JWT token
- **403 Forbidden**: Valid token but insufficient permissions
- **404 Not Found**: Resource not found
- **450**: Database validation errors (Dynamoose specific)

### 5xx Server Errors
- **500 Internal Server Error**: Unexpected server errors, database connection issues

## Error Categories

### Authentication Errors

#### Missing or Invalid JWT Token
**Status:** `401 Unauthorized`

```json
{
  "err": "Invalid token"
}
```

**Causes:**
- Missing Authorization header
- Invalid JWT signature
- Expired JWT token
- Malformed JWT token

#### Insufficient Permissions
**Status:** `403 Forbidden`

```json
{
  "err": "User ID does not match request ID"
}
```

**Causes:**
- User trying to access another user's data
- Non-admin trying to access admin-only endpoints
- Invalid user type for endpoint

### Validation Errors

#### Missing Required Fields
**Status:** `400 Bad Request`

```json
{
  "err": "Missing required fields: startTime, endTime, and rider are required for single rides."
}
```

**Common Examples:**
- Missing email in user creation
- Missing startTime/endTime in ride creation
- Missing location data
- Missing authentication code

#### Invalid Field Values
**Status:** `400 Bad Request`

```json
{
  "err": "Start time must be in the future."
}
```

**Common Examples:**
- Invalid email format
- Invalid phone number format
- Past start times for rides
- End time before start time
- Invalid date formats

#### Schema Validation Errors
**Status:** `450` (Dynamoose validation)

```json
{
  "err": "ValidationError: email: Email validation failed"
}
```

**Common Examples:**
- Invalid email format
- Invalid phone number format
- Invalid date format
- Invalid enum values
- Required field missing

### Resource Not Found Errors

#### User Not Found
**Status:** `400 Bad Request`

```json
{
  "err": "User not found"
}
```

**Causes:**
- Email not in database during authentication
- Invalid user ID in requests
- User account deactivated

#### Resource Not Found
**Status:** `400 Bad Request`

```json
{
  "err": "id not found in Riders"
}
```

**Common Examples:**
- Invalid rider ID
- Invalid driver ID
- Invalid ride ID
- Invalid location ID
- Invalid vehicle ID

### Business Logic Errors

#### User Not Active
**Status:** `400 Bad Request`

```json
{
  "err": "User not active"
}
```

**Causes:**
- Rider account deactivated
- Driver account deactivated

#### Duplicate Resource
**Status:** `222` (Custom status for already favorited)

```json
{
  "err": "Ride already favorited"
}
```

**Common Examples:**
- Adding duplicate favorite
- Creating duplicate user
- Duplicate location in favorites

#### Invalid Operation
**Status:** `400 Bad Request`

```json
{
  "err": "Recurring rides are not yet supported. Please create a single ride."
}
```

**Common Examples:**
- Attempting to create recurring rides
- Editing recurring rides
- Deleting recurring rides
- Invalid ride state transitions

### Database Errors

#### Connection Errors
**Status:** `500 Internal Server Error`

```json
{
  "err": "Database connection failed"
}
```

**Causes:**
- DynamoDB connection issues
- Network connectivity problems
- AWS credential issues

#### Query Errors
**Status:** `500 Internal Server Error`

```json
{
  "err": "error when scanning table"
}
```

**Causes:**
- Invalid query conditions
- Table not found
- Permission issues with DynamoDB

### External Service Errors

#### OAuth Errors
**Status:** `500 Internal Server Error`

```json
{
  "err": "OAuth token exchange failed"
}
```

**Causes:**
- Invalid OAuth code
- Google OAuth service issues
- Invalid client credentials

#### S3 Upload Errors
**Status:** `400 Bad Request`

```json
{
  "err": "S3 upload failed"
}
```

**Causes:**
- Invalid file format
- File too large
- S3 permission issues
- Network connectivity problems

#### Notification Errors
**Status:** `400 Bad Request`

```json
{
  "err": "subscribing failed"
}
```

**Causes:**
- Invalid push notification endpoint
- Invalid VAPID keys
- SNS service issues

## Error Handling Patterns

### Database Operations

#### Get Operations
```typescript
model.get(id, (err, data) => {
  if (err) {
    res.status(err.statusCode || 500).send({ err: err.message });
  } else if (!data) {
    res.status(400).send({ err: `id not found in ${table}` });
  } else {
    res.status(200).send({ data: data.toJSON() });
  }
});
```

#### Create Operations
```typescript
document.save((err, data) => {
  if (err) {
    res.status(err.statusCode || 450).send({ err: err.message });
  } else if (!data) {
    res.status(400).send({ err: 'error when saving document' });
  } else {
    res.status(200).send({ data: data.toJSON() });
  }
});
```

#### Update Operations
```typescript
model.update(key, operation, (err, data) => {
  if (err) {
    res.status(err.statusCode || 500).send({ err: err.message });
  } else if (!data) {
    res.status(400).send({ err: `id not found in ${table}` });
  } else {
    res.status(200).send({ data: data.toJSON() });
  }
});
```

#### Scan Operations
```typescript
model.scan(condition).exec((err, data) => {
  if (err) {
    res.status(err.statusCode || 500).send({ err: err.message });
  } else if (!data) {
    res.status(400).send({ err: 'error when scanning table' });
  } else {
    res.status(200).send({ data: data.toJSON() });
  }
});
```

### Validation Patterns

#### Request Validation
```typescript
if (!req.body.email || !req.body.firstName) {
  res.status(400).send({ err: 'Missing required fields: email, firstName' });
  return;
}
```

#### Business Logic Validation
```typescript
if (startTime <= now) {
  res.status(400).send({ err: 'Start time must be in the future.' });
  return;
}
```

#### Permission Validation
```typescript
if (res.locals.user.userType !== UserType.ADMIN && 
    res.locals.user.id !== req.params.id) {
  res.status(400).send({ err: 'User ID does not match request ID' });
  return;
}
```

## Error Logging

### Server-Side Logging
```typescript
try {
  // Operation
} catch (error) {
  console.error('Error creating rider:', error);
  res.status(500).json({ error: 'Failed to create rider' });
}
```

### Client-Side Error Handling
```typescript
.catch((error) => {
  console.error('Login error:', error);
  logout(); // Clear state and redirect
});
```

## Error Recovery

### Automatic Recovery
- **Token Refresh**: Automatic token refresh on user data updates
- **Retry Logic**: Built-in retry for network operations
- **Fallback Values**: Default values for optional fields

### Manual Recovery
- **User Actions**: Clear errors on user interaction
- **Refresh**: Manual refresh of data
- **Logout/Login**: Complete authentication reset

## Error Prevention

### Input Validation
- **Client-Side**: Form validation before submission
- **Server-Side**: Comprehensive validation of all inputs
- **Database**: Schema-level validation

### Authentication
- **Token Validation**: Verify JWT on every request
- **Permission Checks**: Validate user permissions
- **Session Management**: Proper session handling

### Data Integrity
- **Referential Integrity**: Validate foreign key relationships
- **Business Rules**: Enforce business logic constraints
- **State Validation**: Validate object state transitions

## Error Monitoring

### Production Monitoring
- **Error Tracking**: Log all errors for analysis
- **Performance Monitoring**: Track error rates and response times
- **Alerting**: Set up alerts for critical errors

### Development Debugging
- **Detailed Logging**: Include stack traces in development
- **Error Boundaries**: Catch and handle React errors
- **Debug Information**: Include helpful debugging information

## Best Practices

### Error Messages
- **User-Friendly**: Clear, actionable error messages
- **Consistent**: Use consistent error message format
- **Specific**: Include specific details about what went wrong
- **Secure**: Don't expose sensitive information

### Error Handling
- **Graceful Degradation**: Handle errors without crashing
- **User Feedback**: Provide clear feedback to users
- **Recovery Options**: Offer ways to recover from errors
- **Logging**: Log errors for debugging and monitoring

### Error Testing
- **Unit Tests**: Test error conditions
- **Integration Tests**: Test error handling across components
- **Error Scenarios**: Test common error scenarios
- **Edge Cases**: Test edge cases and boundary conditions
