import { Request, Response, NextFunction } from 'express';
import { ApiError } from './errorHandler';

/**
 * Middleware for user data validation
 * Validates input fields for user creation and update operations
 */
export const validateUserInput = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const { name, email } = req.body;
    const errors: string[] = [];

    // For POST requests, name and email are required
    if (req.method === 'POST') {
      if (!name) errors.push('Name is required');
      if (!email) errors.push('Email is required');
    }

    // For PUT requests, at least one field must be provided
    if (req.method === 'PUT') {
      if (!name && !email) {
        errors.push('At least one field (name or email) is required for update');
      }
    }

    // Validate name if provided
    if (name !== undefined) {
      if (typeof name !== 'string') {
        errors.push('Name must be a string');
      } else if (name.trim().length < 2) {
        errors.push('Name must have at least 2 characters');
      }
    }

    // Validate email if provided
    if (email !== undefined) {
      if (typeof email !== 'string') {
        errors.push('Email must be a string');
      } else {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          errors.push('Invalid email format');
        }
      }
    }

    if (errors.length > 0) {
      throw new ApiError(400, errors.join('; '));
    }

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware for ID parameter validation
 * Ensures that the ID provided in the URL is a valid number
 */
export const validateIdParam = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      throw new ApiError(400, 'Invalid ID format');
    }

    // We ensure that the ID is stored as a number in req.params
    // for later use in controllers
    req.params.id = id.toString();

    next();
  } catch (error) {
    next(error);
  }
};