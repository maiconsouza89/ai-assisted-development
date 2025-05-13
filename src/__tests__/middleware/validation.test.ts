import { Request, Response, NextFunction } from 'express';
import { validateUserInput, validateIdParam } from '../../middleware/validation';
import { ApiError } from '../../middleware/errorHandler';

describe('Validation Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction;

  beforeEach(() => {
    mockRequest = {};
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    nextFunction = jest.fn();
  });

  describe('validateUserInput', () => {
    test('should allow POST request with valid fields', () => {
      mockRequest = {
        method: 'POST',
        body: {
          name: 'Test User',
          email: 'test@example.com'
        }
      };

      validateUserInput(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).toBeCalledTimes(1);
      expect(nextFunction).toBeCalledWith();
      expect(mockResponse.status).not.toBeCalled();
    });

    test('should call next with ApiError for POST request with missing fields', () => {
      mockRequest = {
        method: 'POST',
        body: { name: 'Test User' }
      };

      validateUserInput(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).toBeCalledTimes(1);
      expect(nextFunction).toBeCalledWith(expect.any(ApiError));
      const error = (nextFunction as jest.Mock).mock.calls[0][0] as ApiError;
      expect(error.statusCode).toBe(400);
      expect(error.message).toContain('Email is required');
      expect(mockResponse.status).not.toBeCalled();
    });

    test('should allow PUT request with at least one field', () => {
      mockRequest = {
        method: 'PUT',
        body: { name: 'New Name' }
      };

      validateUserInput(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).toBeCalledTimes(1);
      expect(nextFunction).toBeCalledWith();
      expect(mockResponse.status).not.toBeCalled();
    });

    test('should call next with ApiError for PUT request without fields', () => {
      mockRequest = {
        method: 'PUT',
        body: {}
      };

      validateUserInput(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).toBeCalledTimes(1);
      expect(nextFunction).toBeCalledWith(expect.any(ApiError));
      const error = (nextFunction as jest.Mock).mock.calls[0][0] as ApiError;
      expect(error.statusCode).toBe(400);
      expect(error.message).toContain('At least one field (name or email) is required for update');
      expect(mockResponse.status).not.toBeCalled();
    });

    test('should call next with ApiError for invalid email format', () => {
      mockRequest = {
        method: 'POST',
        body: {
          name: 'Test User',
          email: 'invalid-email'
        }
      };

      validateUserInput(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).toBeCalledTimes(1);
      expect(nextFunction).toBeCalledWith(expect.any(ApiError));
      const error = (nextFunction as jest.Mock).mock.calls[0][0] as ApiError;
      expect(error.statusCode).toBe(400);
      expect(error.message).toContain('Invalid email format');
      expect(mockResponse.status).not.toBeCalled();
    });

    test('should call next with ApiError for name that is too short', () => {
      mockRequest = {
        method: 'POST',
        body: {
          name: 'A',
          email: 'test@example.com'
        }
      };

      validateUserInput(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).toBeCalledTimes(1);
      expect(nextFunction).toBeCalledWith(expect.any(ApiError));
      const error = (nextFunction as jest.Mock).mock.calls[0][0] as ApiError;
      expect(error.statusCode).toBe(400);
      expect(error.message).toContain('Name must have at least 2 characters');
      expect(mockResponse.status).not.toBeCalled();
    });

    test('should call next with ApiError for incorrect name type', () => {
      mockRequest = {
        method: 'POST',
        body: {
          name: 123,
          email: 'test@example.com'
        }
      };

      validateUserInput(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).toBeCalledTimes(1);
      expect(nextFunction).toBeCalledWith(expect.any(ApiError));
      const error = (nextFunction as jest.Mock).mock.calls[0][0] as ApiError;
      expect(error.statusCode).toBe(400);
      expect(error.message).toContain('Name must be a string');
      expect(mockResponse.status).not.toBeCalled();
    });

    test('should call next with ApiError for incorrect email type', () => {
      mockRequest = {
        method: 'POST',
        body: {
          name: 'Test User',
          email: 123
        }
      };

      validateUserInput(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).toBeCalledTimes(1);
      expect(nextFunction).toBeCalledWith(expect.any(ApiError));
      const error = (nextFunction as jest.Mock).mock.calls[0][0] as ApiError;
      expect(error.statusCode).toBe(400);
      expect(error.message).toContain('Email must be a string');
      expect(mockResponse.status).not.toBeCalled();
    });
  });

  describe('validateIdParam', () => {
    test('should allow valid ID', () => {
      mockRequest = {
        params: { id: '123' }
      };

      validateIdParam(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).toBeCalledTimes(1);
      expect(nextFunction).toBeCalledWith();
      expect(mockResponse.status).not.toBeCalled();
    });

    test('should call next with ApiError for non-numeric ID', () => {
      mockRequest = {
        params: { id: 'abc' }
      };

      validateIdParam(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).toBeCalledTimes(1);
      expect(nextFunction).toBeCalledWith(expect.any(ApiError));
      const error = (nextFunction as jest.Mock).mock.calls[0][0] as ApiError;
      expect(error.statusCode).toBe(400);
      expect(error.message).toContain('Invalid ID format');
      expect(mockResponse.status).not.toBeCalled();
    });
  });
});