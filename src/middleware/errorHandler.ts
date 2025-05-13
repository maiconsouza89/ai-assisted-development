import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

// Custom error class for API errors
export class ApiError extends Error {
  statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'ApiError';
  }
}

// Error handling middleware
export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction): void => {
  const requestId = req.headers['x-request-id'] || 'unknown';

  if (err instanceof ApiError) {
    logger.warn(`[${requestId}] ${err.name}: ${err.message}`);
    res.status(err.statusCode).json({
      error: err.name,
      message: err.message,
      requestId
    });
    return;
  }

  // Log the stack trace for unexpected errors
  logger.error(`[${requestId}] Unhandled error: ${err.message}\n${err.stack}`);

  // Default to 500 (internal server error) for unhandled errors
  res.status(500).json({
    error: 'InternalServerError',
    message: 'An unexpected error occurred',
    requestId
  });
};

// Handler for routes that don't exist (404)
export const notFoundHandler = (req: Request, res: Response): void => {
  const requestId = req.headers['x-request-id'] || 'unknown';

  logger.info(`[${requestId}] Route not found: ${req.method} ${req.path}`);

  res.status(404).json({
    error: 'NotFound',
    message: 'The requested resource does not exist',
    requestId
  });
};