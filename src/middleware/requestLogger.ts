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

// Middleware to add request ID to response headers
export const addRequestId = (req: Request, res: Response, next: Function) => {
  // Generate a unique ID for the request if not present
  if (!req.headers['x-request-id']) {
    req.headers['x-request-id'] = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
  }

  // Add the request ID to response headers
  res.setHeader('X-Request-ID', req.headers['x-request-id'] as string);
  next();
};