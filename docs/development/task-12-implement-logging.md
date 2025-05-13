# Task #12: Implement Logging and Request Tracking

## Purpose and Scope
The purpose of this task was to implement a comprehensive logging and request tracking system to efficiently monitor and debug the API. The system records detailed information about received requests, sent responses, and errors that occur during processing, facilitating the identification and resolution of problems in both development and production environments.

## Technical Architecture and Design Decisions
The logging system implementation follows a multi-layered approach that combines structured logging with request tracking. Design decisions include:

1. **Use of Winston**: Library chosen for its flexibility and support for multiple log transports
2. **Integration with Morgan**: For HTTP request-specific logging with custom format
3. **Request IDs**: Implementation of unique identifiers for each request to facilitate tracking through the processing flow
4. **Multiple Log Destinations**: Configuration to log both to console and files, with different severity levels
5. **Consistent Format**: Standardization of log format with clear timestamps and severity levels

## Implementation Details

### Code Structure
The logging implementation is organized in the following files:
- `src/utils/logger.ts`: Central Winston configuration for general logging
- `src/middleware/requestLogger.ts`: Middleware for HTTP request logging and request ID management

### Patterns Used
1. **Middleware Pattern**: Used to intercept requests and record relevant information
2. **Singleton Pattern**: Logger configured as a single instance shared throughout the application
3. **Decorator Pattern**: Extends the functionality of requests and responses with tracking information

### Main Algorithms and Logic
The main logging logic includes:
1. Generation of unique IDs for each received request
2. Custom log formatting with relevant information (HTTP method, URL, status, response time)
3. Request body logging to facilitate debugging
4. Propagation of request ID to response headers
5. Different log levels based on environment (production vs. development)

## Dependencies

### Internal Components
- **Express Application**: For registering logging middleware

### External Systems
- **winston**: Main logging library
- **morgan**: HTTP logging middleware for Express
- **File system**: For storing logs in files

## Configuration Requirements

### Environment Variables
- `NODE_ENV`: Defines the logging level (production = 'info', development = 'debug')

### Application Configuration
Logs are stored in the following locations:
- `logs/combined.log`: All logs
- `logs/error.log`: Error logs only
- Console: All logs (useful for development)

## Known Limitations
1. There is no automatic log file rotation, which can cause very large files in production
2. The request body is logged in full, which may expose sensitive data
3. There is no integration with external log monitoring services
4. Local log storage may be lost in ephemeral container environments

## Potential Future Improvements
1. Implement log rotation based on size or time
2. Add masking of sensitive data in logs (passwords, tokens, etc.)
3. Integrate with monitoring services such as ELK Stack, Datadog, or New Relic
4. Add performance metrics for real-time monitoring
5. Implement structured logs in JSON format to facilitate analysis

## Code Examples and Usage Patterns

### Winston Logger Configuration
```typescript
import winston from 'winston';

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.printf(({ level, message, timestamp }) => {
    return `${timestamp} ${level}: ${message}`;
  })
);

// Create logger instance
const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: logFormat,
  transports: [
    // Console transport for all environments
    new winston.transports.Console(),
    // File transport for errors
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    // File transport for all logs
    new winston.transports.File({ filename: 'logs/combined.log' })
  ],
});

export default logger;
```

### Request Logging Middleware
```typescript
import morgan from 'morgan';
import { Request, Response } from 'express';
import logger from '../utils/logger';

// Create a custom token for request ID
morgan.token('request-id', (req: Request) => {
  // Generate a unique ID for the request if not present
  if (!req.headers['x-request-id']) {
    req.headers['x-request-id'] = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
  }
  return req.headers['x-request-id'] as string;
});

// Create a custom token for request body
morgan.token('request-body', (req: Request) => {
  try {
    return JSON.stringify(req.body) || '-';
  } catch (error) {
    return 'Error parsing body';
  }
});

// Create a custom format that includes request ID and body
const logFormat = ':request-id :method :url :status :res[content-length] - :response-time ms - body: :request-body';

// Create a stream object that writes to our Winston logger
const stream = {
  write: (message: string) => {
    logger.info(message.trim());
  },
};

// Export the middleware
export const requestLogger = morgan(logFormat, { stream });
```

### Logger Usage in Application
```typescript
import logger from '../utils/logger';

// Example usage in controllers or services
try {
  // Some operation
  logger.info(`Operation completed successfully: ${result}`);
} catch (error) {
  logger.error(`Error performing operation: ${error.message}`, { error });
  throw error;
}
```

## Troubleshooting Guide

### Problem 1: Log files are not being created
**Symptoms:**
- Logs appear in the console but not in files
- Error when starting the application related to file permissions

**Solution:**
1. Check if the `logs/` directory exists and has write permissions
2. Create the directory manually if necessary: `mkdir logs`
3. Check the permissions of the user running the application

### Problem 2: Request IDs are not being propagated
**Symptoms:**
- Logs don't show the same ID for different parts of a request flow
- `X-Request-ID` header doesn't appear in responses

**Solution:**
1. Check if the `addRequestId` middleware is registered before other middlewares
2. Verify if the middleware is being applied to all necessary routes
3. Check if there's no other middleware overwriting the headers