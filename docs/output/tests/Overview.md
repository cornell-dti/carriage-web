# Testing Overview

## Introduction

The Carriage application implements a comprehensive testing strategy focused on server-side API testing, authentication testing, and utility function testing. The testing framework uses Jest as the test runner with Supertest for HTTP testing and Chai for assertions.

## Testing Architecture

### Test Organization

The testing structure follows a modular approach with clear separation of concerns:

```
server/
├── tests/                    # Main test directory
│   ├── health.test.ts       # Health check endpoint tests
│   ├── driver.test.ts       # Driver API endpoint tests
│   ├── rider.test.ts        # Rider API endpoint tests
│   ├── location.test.ts     # Location API endpoint tests
│   └── utils/               # Test utilities
│       ├── auth.ts          # Authentication test helpers
│       └── db.ts            # Database test utilities
└── src/util/tests/          # Utility function tests
    └── notification.test.ts # Notification system tests
```

### Testing Framework

**Core Testing Tools**:
- **Jest**: Test runner and assertion library
- **Supertest**: HTTP assertion library for API testing
- **Chai**: BDD/TDD assertion library
- **DynamoDB Local**: Local DynamoDB for testing
- **UUID**: Test data generation

## Test Types

### 1. API Endpoint Tests

**Purpose**: Test REST API endpoints for functionality, authentication, and authorization.

**Coverage**:
- **Health Checks**: Basic application health verification
- **Driver Endpoints**: Driver CRUD operations and availability
- **Rider Endpoints**: Rider management and profile operations
- **Location Endpoints**: Location management and geographic data

**Test Structure**:
```typescript
describe('Testing Functionality of [Entity] Endpoints', () => {
  let adminToken: string;
  let riderToken: string;
  let driverToken: string;
  
  before(async () => {
    // Setup test data and authentication tokens
    adminToken = await authorize('Admin', testAdmin);
    riderToken = await authorize('Rider', testRider);
    driverToken = await authorize('Driver', testDriver);
  });

  after(clearDB); // Clean up test data

  describe('GET [entity] by ID', () => {
    it('should return correct response for Admin account', async () => {
      // Test implementation
    });
  });
});
```

### 2. Authentication Tests

**Purpose**: Test authentication and authorization mechanisms.

**Coverage**:
- **Token Validation**: JWT token verification
- **Role-Based Access**: Permission-based endpoint access
- **User Authentication**: Login and session management
- **Authorization Middleware**: Access control validation

**Test Patterns**:
```typescript
const generateAuthTest = async (authToken: string, expectedStatus: number) => {
  const res = await request(app)
    .get('/api/endpoint')
    .auth(authToken, { type: 'bearer' })
    .expect(expectedStatus);
  
  if (expectedStatus === 200) {
    expect(res.body).to.have.property('data');
  } else {
    expect(res.body).to.have.property('err');
  }
};
```

### 3. Utility Function Tests

**Purpose**: Test utility functions and helper modules.

**Coverage**:
- **Notification System**: Push notification functionality
- **Data Processing**: Utility function behavior
- **Validation**: Input validation and sanitization
- **Business Logic**: Core application logic

## Test Utilities

### Authentication Utilities

**Location**: `server/tests/utils/auth.ts`

**Purpose**: Provide authentication helpers for test setup.

**Functions**:
```typescript
const authorize = async (role: Role, data: any | null = {}) => {
  const model = modelFromRole[role];
  const user = await populateDB(model, data);
  const res = await request(app)
    .post('/api/auth/dummy')
    .send({
      table: `${role}s`,
      email: user.email,
    })
    .expect(200);
  return res.body.jwt;
};
```

**Usage**:
```typescript
const adminToken = await authorize('Admin', testAdmin);
const riderToken = await authorize('Rider', testRider);
const driverToken = await authorize('Driver', testDriver);
```

### Database Utilities

**Location**: `server/tests/utils/db.ts`

**Purpose**: Provide database management utilities for testing.

**Functions**:

#### populateDB
```typescript
export const populateDB = async <T extends Item>(
  table: ModelType<T>,
  data: any
) => {
  return await table.create({
    id: uuid(),
    ...data,
  });
};
```

#### clearDB
```typescript
export const clearDB = async () => {
  for (const model of Object.values(models)) {
    await clearTableContent(model);
  }
};
```

**Usage**:
```typescript
// Populate test data
await populateDB(Driver, testDriver);
await populateDB(Rider, testRider);

// Clean up after tests
after(clearDB);
```

## Test Data Management

### Test Data Structure

**Test Entities**:
- **Admin**: Test administrator with full permissions
- **Driver**: Test driver with availability and vehicle assignment
- **Rider**: Test rider with accessibility needs and preferences
- **Vehicle**: Test vehicles with capacity information
- **Location**: Test locations with geographic data
- **Ride**: Test rides with various statuses and types

### Test Data Examples

**Admin Test Data**:
```typescript
const testAdmin: Omit<AdminType, 'id'> = {
  firstName: 'Test-Admin',
  lastName: 'Test-Admin',
  phoneNumber: '1111111111',
  email: 'test-admin@cornell.edu',
  type: ['sds-admin'],
  isDriver: false,
};
```

**Driver Test Data**:
```typescript
const testDrivers = [
  {
    id: 'driver0',
    email: 'drivertest-email@test.com',
    phoneNumber: '1234567890',
    firstName: 'Test',
    lastName: 'Testing',
    vehicle: testVehicles[0].id,
    startDate: '2023-03-09',
    availability: {
      Mon: { startTime: '08:00', endTime: '12:00' },
      Tue: { startTime: '08:00', endTime: '12:00' },
      // ... other days
    },
    photoLink: '',
  }
];
```

**Ride Test Data**:
```typescript
const testRides = [
  {
    id: 'test-ride0',
    type: Type.PAST,
    status: Status.COMPLETED,
    late: false,
    startLocation: testLocations[0].id,
    endLocation: testLocations[1].id,
    startTime: moment().subtract({ days: 7, hours: 6 }).toISOString(),
    endTime: moment().subtract({ days: 7, hours: 5 }).toISOString(),
    rider: testStatRider.id,
    driver: testDrivers[0].id,
    recurring: false,
  }
];
```

## Test Execution

### Running Tests

**All Tests**:
```bash
cd server
npm test
```

**Specific Test Files**:
```bash
npm test -- driver.test.ts
npm test -- health.test.ts
npm test -- rider.test.ts
```

**Watch Mode**:
```bash
npm test -- --watch
```

**Coverage Report**:
```bash
npm test -- --coverage
```

### Test Commands

**Package.json Scripts**:
```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:ci": "jest --ci --coverage --watchAll=false"
  }
}
```

## Test Coverage

### Coverage Focus Areas

**High Priority**:
- **Authentication**: All authentication and authorization flows
- **API Endpoints**: All REST API endpoints and methods
- **Data Validation**: Input validation and sanitization
- **Error Handling**: Error responses and edge cases
- **Business Logic**: Core application functionality

**Medium Priority**:
- **Utility Functions**: Helper functions and utilities
- **Data Models**: Model validation and relationships
- **Integration**: Cross-component integration
- **Performance**: Response times and efficiency

**Low Priority**:
- **UI Components**: Frontend component testing (if implemented)
- **End-to-End**: Full user workflow testing
- **Load Testing**: Performance under load
- **Security**: Security vulnerability testing

### Coverage Metrics

**Target Coverage**:
- **Statements**: 80%+
- **Branches**: 75%+
- **Functions**: 85%+
- **Lines**: 80%+

**Coverage Reports**:
- HTML coverage reports generated in `coverage/` directory
- LCOV format for CI/CD integration
- Coverage thresholds enforced in CI

## Test Patterns

### API Testing Pattern

**Standard API Test Structure**:
```typescript
describe('API Endpoint Tests', () => {
  let authToken: string;
  
  before(async () => {
    authToken = await authorize('Admin', testData);
  });

  after(clearDB);

  describe('GET /api/endpoint', () => {
    it('should return data for authenticated user', async () => {
      const res = await request(app)
        .get('/api/endpoint')
        .auth(authToken, { type: 'bearer' })
        .expect(200);
      
      expect(res.body).to.have.property('data');
      expect(res.body.data).to.be.an('array');
    });

    it('should fail without authentication', async () => {
      const res = await request(app)
        .get('/api/endpoint')
        .expect(400);
      
      expect(res.body).to.have.property('err');
    });
  });
});
```

### Authorization Testing Pattern

**Role-Based Access Testing**:
```typescript
describe('Authorization Tests', () => {
  const testRoles = ['Admin', 'Driver', 'Rider'];
  
  testRoles.forEach(role => {
    it(`should allow ${role} access`, async () => {
      const token = await authorize(role, testData);
      const res = await request(app)
        .get('/api/endpoint')
        .auth(token, { type: 'bearer' });
      
      expect(res.status).to.be.oneOf([200, 400]); // Based on permissions
    });
  });
});
```

### Data Validation Testing Pattern

**Input Validation Testing**:
```typescript
describe('Input Validation Tests', () => {
  const invalidInputs = [
    { field: 'email', value: 'invalid-email', expected: 400 },
    { field: 'phoneNumber', value: '123', expected: 400 },
    { field: 'requiredField', value: '', expected: 400 }
  ];

  invalidInputs.forEach(({ field, value, expected }) => {
    it(`should reject invalid ${field}`, async () => {
      const res = await request(app)
        .post('/api/endpoint')
        .send({ [field]: value })
        .auth(authToken, { type: 'bearer' })
        .expect(expected);
      
      expect(res.body).to.have.property('err');
    });
  });
});
```

## CI/CD Integration

### Continuous Integration

**GitHub Actions** (if configured):
```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '16'
      - run: npm install
      - run: npm test
      - run: npm run test:coverage
```

**Test Pipeline**:
1. **Code Checkout**: Get latest code
2. **Dependency Installation**: Install test dependencies
3. **Test Execution**: Run all tests
4. **Coverage Analysis**: Generate coverage reports
5. **Results**: Report test results and coverage

### Test Environment

**Test Configuration**:
- **Database**: DynamoDB Local or test database
- **Environment**: Test-specific environment variables
- **Isolation**: Each test runs in isolation
- **Cleanup**: Automatic cleanup after tests

## Troubleshooting

### Common Test Issues

**1. Database Connection Issues**:
```bash
# Ensure DynamoDB Local is running
docker run -p 8000:8000 amazon/dynamodb-local

# Check environment variables
echo $AWS_ACCESS_KEY_ID
echo $AWS_SECRET_ACCESS_KEY
```

**2. Authentication Failures**:
```bash
# Verify test authentication setup
# Check JWT_SECRET environment variable
# Ensure test user data is valid
```

**3. Test Timeouts**:
```bash
# Increase test timeout
npm test -- --testTimeout=10000

# Check for hanging promises
# Verify proper async/await usage
```

**4. Memory Issues**:
```bash
# Increase Node.js memory limit
node --max-old-space-size=4096 node_modules/.bin/jest
```

### Debug Commands

**Verbose Test Output**:
```bash
npm test -- --verbose
```

**Single Test File**:
```bash
npm test -- --testNamePattern="specific test"
```

**Debug Mode**:
```bash
npm test -- --detectOpenHandles --forceExit
```

## Best Practices

### Test Design

1. **Isolation**: Each test should be independent
2. **Clarity**: Test names should clearly describe what is being tested
3. **Completeness**: Test both success and failure scenarios
4. **Maintainability**: Keep tests simple and focused
5. **Performance**: Tests should run quickly

### Test Data

1. **Realistic Data**: Use realistic test data
2. **Minimal Data**: Use only necessary data for each test
3. **Cleanup**: Always clean up test data
4. **Consistency**: Use consistent test data across tests
5. **Isolation**: Test data should not interfere between tests

### Assertions

1. **Specific**: Use specific assertions
2. **Clear**: Assertions should be easy to understand
3. **Complete**: Test all important aspects
4. **Meaningful**: Assertions should provide useful feedback
5. **Reliable**: Assertions should be stable and predictable

## Future Considerations

### Planned Enhancements

1. **Frontend Testing**: Add React component testing
2. **E2E Testing**: Implement end-to-end testing
3. **Performance Testing**: Add load and performance tests
4. **Security Testing**: Add security vulnerability tests
5. **Visual Testing**: Add visual regression testing

### Testing Tools

1. **Cypress**: For end-to-end testing
2. **React Testing Library**: For component testing
3. **Jest**: Enhanced configuration and plugins
4. **Supertest**: Advanced HTTP testing features
5. **Test Containers**: For integration testing

### Coverage Improvements

1. **Higher Coverage**: Increase overall test coverage
2. **Edge Cases**: Test more edge cases and error conditions
3. **Integration**: Add more integration tests
4. **Performance**: Add performance and load tests
5. **Security**: Add security-focused tests
