# Task #10: Implement Integration Tests

## Purpose and Scope
The purpose of this task was to implement comprehensive integration tests to verify the complete request-response cycle across all API endpoints. The tests verify whether the system components (middlewares, controllers, models) work together correctly to process HTTP requests and generate appropriate responses.

## Technical Architecture and Design Decisions
The implementation of integration tests follows an approach that tests the application as a whole, simulating real HTTP requests and evaluating responses. Important decisions include:

1. **Use of Supertest**: Library chosen to simulate HTTP requests without the need to start a server
2. **Test Isolation**: Each test cleans the storage state to ensure isolation and reproducibility
3. **Complete Flow Tests**: Verification of the complete path, from validation to error handling
4. **Strategic Mocking**: Mocking of specific components when necessary for test isolation

### Architecture Diagram
```
Client (Supertest) -> Express App -> Middlewares -> Controllers -> Models -> Response
```

## Implementation Details

### Code Structure
Integration tests are organized in the following files:
- `src/__tests__/integration/api.test.ts`: Tests for basic CRUD operations on all endpoints
- `src/__tests__/integration/validation.test.ts`: Tests focused on the integration between validation middlewares and controllers

### Patterns Used
1. **AAA Pattern (Arrange-Act-Assert)**:
   - **Arrange**: Setting up test data and initial state
   - **Act**: Executing the operation (HTTP request)
   - **Assert**: Verifying results and final state

2. **Jest Lifecycle Hooks**:
   - `beforeEach`: Setting up a clean state before each test
   - `describe`: Logical grouping of related tests

### Main Algorithms and Logic
The main logic of the tests includes:
1. Cleaning the user storage (`UserStore`) before each test
2. Simulation of HTTP requests using Supertest
3. Verification of HTTP responses, including status codes and response bodies
4. Validation of the final storage state after operations

## Dependencies

### Internal Components
- **Express App**: Express application configured in `app.ts`
- **UserStore**: Model for user data manipulation
- **Validation Middleware**: Middleware for input validation
- **Error Handling Middleware**: Middleware for handling API errors

### External Systems
- **supertest**: Library for simulating HTTP requests
- **jest**: Testing framework

## Configuration Requirements

### Environment Variables
No specific environment variables are needed for integration tests.

### Application Configuration
To run the tests, simply execute the `npm test` command which is configured in `package.json` to run tests with Jest.

## Known Limitations
1. Tests use in-memory storage, which is reset between tests, therefore they don't test real data persistence
2. There are no concurrency or performance tests
3. Network failure or timeout scenarios are not tested

## Potential Future Improvements
1. Add tests for load and concurrency scenarios
2. Implement end-to-end tests with a real database
3. Add tests for new features such as pagination, filtering, and sorting
4. Implement security tests to validate protection against common attacks

## Code Examples and Usage Patterns

### Example of GET Test
```typescript
describe('GET /api/users', () => {
  it('should return an empty array when no users exist', async () => {
    const response = await request(app).get('/api/users');

    expect(response.status).toBe(200);
    expect(response.body).toEqual([]);
  });

  it('should return all users', async () => {
    // Create test users
    const user1 = UserStore.create({ name: 'John Smith', email: 'john@example.com' });
    const user2 = UserStore.create({ name: 'Mary Johnson', email: 'mary@example.com' });

    const response = await request(app).get('/api/users');

    expect(response.status).toBe(200);
    expect(response.body.length).toBe(2);
    expect(response.body).toEqual(expect.arrayContaining([
      expect.objectContaining({ id: user1.id }),
      expect.objectContaining({ id: user2.id })
    ]));
  });
});
```

### Example of Validation Test
```typescript
it('should stop the flow when there is an invalid data error', () => {
  mockRequest.method = 'PUT';
  mockRequest.params = { id: '123' };
  mockRequest.body = {}; // No fields for update

  // First middleware passes
  validateIdParam(mockRequest as Request, mockResponse as Response, nextFunction);
  expect(nextFunction).toHaveBeenCalledWith(); // No error

  jest.clearAllMocks();
  responseStatus.mockReturnValue(mockResponse);

  // Second middleware fails
  validateUserInput(mockRequest as Request, mockResponse as Response, nextFunction);
  expect(nextFunction).toHaveBeenCalledWith(expect.any(ApiError));
  expect(responseStatus).toHaveBeenCalledWith(400);
  expect(responseJson).toHaveBeenCalledWith(expect.objectContaining({
    message: expect.stringContaining('At least one field (name or email) is required for update')
  }));

  // Ensure the controller is not called
  expect(UserStore.update).not.toHaveBeenCalled();
});
```

## Troubleshooting Guide

### Problem 1: Failures in specific tests
**Symptoms:**
- Tests fail with errors comparing expected results
- Failures occur only in specific tests

**Solution:**
1. Check if `beforeEach` is properly cleaning the state
2. Verify if previous tests are not affecting the global state
3. Isolate the specific test with `it.only()` for debugging

### Problem 2: Intermittent test failures
**Symptoms:**
- Tests pass sometimes and fail other times
- Timeout errors or race conditions

**Solution:**
1. Increase test timeout with `jest.setTimeout()`
2. Check asynchronous operations and ensure they are properly awaited
3. Refactor the test to avoid race conditions or time dependencies