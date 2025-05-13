# Task #3: Setup Express Server Configuration

## Purpose and Scope
The purpose of this task was to configure the Express server with basic middleware and error handling. This task establishes the fundamental structure of the web application, configuring how HTTP requests are processed, how errors are handled, and how different parts of the application communicate.

## Technical Architecture and Design Decisions
The Express server configuration follows a modular architecture that facilitates maintenance and expansion. Design decisions include:

1. **Separation between App and Server**: Division between Express configuration (`app.ts`) and server initialization (`server.ts`) to facilitate testing
2. **Processing Middleware**: Configuration of middleware to process JSON requests and form data
3. **Logging Middleware**: Implementation of logging to record HTTP requests and responses
4. **Global Error Handling**: Centralized middleware for consistent error handling
5. **Integrated API Documentation**: Configuration of Swagger/OpenAPI for automatic documentation

### Architecture Diagram
```
                        +-------------------+
                        |     server.ts     |
                        | (HTTP Server)     |
                        +--------+----------+
                                 |
                                 v
+----------------+      +--------+----------+      +----------------+
|                |      |                   |      |                |
| requestLogger  +----->+      app.ts      +----->+  errorHandler  |
| (Middleware)   |      | (Express Config)  |      |  (Middleware)  |
|                |      |                   |      |                |
+----------------+      +---------+---------+      +----------------+
                                  |
                                  v
                        +---------+---------+
                        |                   |
                        |    userRoutes     |
                        |   (API Routes)    |
                        |                   |
                        +-------------------+
```

## Implementation Details

### Code Structure
The server configuration is organized in the following files:
- `src/app.ts`: Main Express configuration, middleware, and route mounting
- `src/server.ts`: HTTP server initialization and port configuration
- `src/middleware/errorHandler.ts`: Middleware for global error handling
- `src/middleware/requestLogger.ts`: Middleware for HTTP request logging

### Patterns Used
1. **Middleware Chain**: Chaining middleware functions for request processing
2. **Error-First Callbacks**: Pattern for error propagation and handling in middleware
3. **Singleton Application**: Single Express application instance shared between components

### Main Components

#### Express Configuration (app.ts)
```typescript
import express, { Application, Request, Response, NextFunction } from 'express';
import userRoutes from './routes/userRoutes';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './swagger';
import { requestLogger, addRequestId } from './middleware/requestLogger';
import logger from './utils/logger';

const app: Application = express();

// Middleware to add request ID and logging
app.use(addRequestId);
app.use(requestLogger);

// Middleware to process JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Documentation with Swagger
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Basic route for testing
app.get('/', (req: Request, res: Response) => {
  logger.debug('Root endpoint accessed');
  res.json({ message: 'User Management API working!' });
});

// Mounting the user router at path /api/users
logger.info('Registering user routes at /api/users');
app.use('/api/users', userRoutes);

// Handler for routes not found (404)
app.use(notFoundHandler);

// Middleware for error handling
app.use(errorHandler);

export default app;
```

#### Server Initialization (server.ts)
```typescript
import app from './app';
import logger from './utils/logger';

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});

export default server;
```

## Dependencies

### Internal Components
- **Project Setup (Task #1)**: Depends on the basic project structure and TypeScript configuration
- **Logging System (Task #12)**: Uses the logging system to record server events

### Components that Depend on This
- **User Routes (Task #5)**: Depends on Express configuration to mount routes
- **Validation Middleware (Task #6)**: Integrates with the request processing pipeline
- **Error Handling Middleware (Task #7)**: Uses the configured error handling infrastructure
- **API Documentation (Task #11)**: Uses the Swagger configuration integrated with Express

### External Systems
- **Express.js**: Web framework for Node.js
- **Node.js HTTP Server**: Underlying HTTP server

## Configuration Requirements

### Environment Variables
- `PORT`: Port on which the server will run (default: 3000)
- `NODE_ENV`: Execution environment (development, production, test)

### Application Configuration
The application is configured through the files:
- `app.ts`: Express configuration, middleware, and routes
- `server.ts`: HTTP server and port configuration

To start the server:
```bash
# In development
npm run dev

# In production
npm start
```

## Known Limitations
1. **No Load Balancing**: No configuration for load balancing or multiple instances
2. **Basic Error Handling**: Error handling does not include sophisticated recovery or fallbacks
3. **No HTTPS**: Configuration for HTTP only, without native HTTPS support
4. **No Rate Limiting**: No protection against excessive requests (rate limiting)
5. **Static Configuration**: Configurations defined in code, with little external parameterization

## Potential Future Improvements
1. **HTTPS Support**: Add HTTPS support for secure communication
2. **Rate Limiting**: Implement request limiting for protection against abuse
3. **Clustering**: Configure support for multiple instances using Node.js cluster module
4. **Health Checks**: Add health check endpoints for monitoring
5. **Graceful Shutdown**: Implement graceful server shutdown for zero-downtime maintenance

## Code Examples and Usage Patterns

### Adding New Middleware
```typescript
import { Request, Response, NextFunction } from 'express';

// Create a custom middleware
const customMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Perform some operation on the request
  req.headers['x-custom-header'] = 'value';

  // Pass to the next middleware
  next();
};

// Add to Express
app.use(customMiddleware);
```

### Defining a New Route
```typescript
import express, { Request, Response } from 'express';

const router = express.Router();

// Define a GET route
router.get('/new-resource', (req: Request, res: Response) => {
  res.json({ message: 'New resource available!' });
});

// Mount on the main app
app.use('/api/resource', router);
```

## Troubleshooting Guide

### Problem 1: Server doesn't start or fails to start
**Symptoms:**
- Error message when running `npm run dev` or `npm start`
- Error indicating that the port is in use

**Solution:**
1. Check if there's no other process using the specified port
2. Try changing the port through the PORT environment variable: `PORT=4000 npm run dev`
3. Check the error logs to identify the specific cause of the problem

### Problem 2: Requests result in 404 error (Not Found)
**Symptoms:**
- API returns 404 error even for routes that should exist
- "Route not found" message in logs

**Solution:**
1. Check if the routes are correctly defined and mounted in `app.ts`
2. Verify the base path of the route (e.g., `/api/users`) and the specific path in the router
3. Check the order of middlewares - the 404 handler should be after the route definitions