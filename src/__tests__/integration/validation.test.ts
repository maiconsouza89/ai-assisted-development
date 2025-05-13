import { Request, Response, NextFunction } from 'express';
import { validateUserInput, validateIdParam } from '../../middleware/validation';
import { UserController } from '../../controllers/UserController';
import { UserStore } from '../../models/User';
import { ApiError } from '../../middleware/errorHandler';

// Mock for UserStore
jest.mock('../../models/User', () => {
  const originalModule = jest.requireActual('../../models/User');
  return {
    ...originalModule,
    UserStore: {
      getAll: jest.fn(),
      getById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn()
    }
  };
});

// Mock error middleware to capture errors in integration tests
const catchErrors = (mockResponse: Partial<Response>) => {
  return (err: Error, req: Request, res: Response, next: NextFunction) => {
    if (err instanceof ApiError) {
      res.status(err.statusCode).json({
        error: err.name,
        message: err.message
      });
    } else {
      res.status(500).json({
        error: 'InternalServerError',
        message: 'An unexpected error occurred'
      });
    }
  };
};

describe('Integration between Validation Middleware and Controllers', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: jest.Mock;
  let errorHandler: jest.Mock;
  let responseJson: jest.Mock;
  let responseStatus: jest.Mock;
  let responseSend: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    responseJson = jest.fn().mockReturnThis();
    responseStatus = jest.fn().mockReturnThis();
    responseSend = jest.fn().mockReturnThis();

    mockRequest = {};
    mockResponse = {
      json: responseJson,
      status: responseStatus,
      send: responseSend
    };

    nextFunction = jest.fn((error?: any) => {
      if (error) {
        catchErrors(mockResponse)(error, mockRequest as Request, mockResponse as Response, jest.fn());
      }
    });

    errorHandler = jest.fn();
  });

  describe('ID Validation Flow', () => {
    it('should call next with ApiError for invalid IDs in validateIdParam middleware', () => {
      mockRequest.params = { id: 'abc' };

      validateIdParam(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalledWith(expect.any(ApiError));
      expect(responseStatus).toHaveBeenCalledWith(400);
      expect(responseJson).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Invalid ID format'
      }));
    });

    it('should pass valid ID to the controller through middleware', () => {
      mockRequest.params = { id: '123' };
      const mockUser = { id: 123, name: 'Test User', email: 'test@example.com' };

      (UserStore.getById as jest.Mock).mockReturnValue(mockUser);

      validateIdParam(mockRequest as Request, mockResponse as Response, nextFunction);
      expect(nextFunction).toHaveBeenCalledWith(); // Called without parameters = no errors

      // Simulate controller call after middleware
      UserController.getUserById(mockRequest as Request, mockResponse as Response, errorHandler);
      expect(UserStore.getById).toHaveBeenCalledWith(123);
      expect(responseJson).toHaveBeenCalledWith(mockUser);
      expect(errorHandler).not.toHaveBeenCalled();
    });
  });

  describe('User Input Validation Flow', () => {
    it('should call next with ApiError for invalid user data in validateUserInput middleware', () => {
      mockRequest.method = 'POST';
      mockRequest.body = { name: 'User', email: 'invalid-email' };

      validateUserInput(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalledWith(expect.any(ApiError));
      expect(responseStatus).toHaveBeenCalledWith(400);
      expect(responseJson).toHaveBeenCalledWith(expect.objectContaining({
        message: expect.stringContaining('Invalid email format')
      }));
    });

    it('should pass valid data to the controller through middleware', () => {
      mockRequest.method = 'POST';
      mockRequest.body = { name: 'New User', email: 'valid@example.com' };
      const createdUser = { id: 1, ...mockRequest.body };

      (UserStore.create as jest.Mock).mockReturnValue(createdUser);

      validateUserInput(mockRequest as Request, mockResponse as Response, nextFunction);
      expect(nextFunction).toHaveBeenCalledWith(); // Called without parameters = no errors

      // Simulate controller call after middleware
      UserController.createUser(mockRequest as Request, mockResponse as Response, errorHandler);
      expect(UserStore.create).toHaveBeenCalledWith(mockRequest.body);
      expect(responseStatus).toHaveBeenCalledWith(201);
      expect(responseJson).toHaveBeenCalledWith(createdUser);
      expect(errorHandler).not.toHaveBeenCalled();
    });
  });

  describe('Complete Flow for User Update', () => {
    it('should validate ID and input data before updating the user', () => {
      mockRequest.method = 'PUT';
      mockRequest.params = { id: '123' };
      mockRequest.body = { name: 'Updated User', email: 'updated@example.com' };
      const updatedUser = { id: 123, ...mockRequest.body };

      (UserStore.update as jest.Mock).mockReturnValue(updatedUser);

      // Execute middlewares in sequence
      validateIdParam(mockRequest as Request, mockResponse as Response, nextFunction);
      expect(nextFunction).toHaveBeenCalledTimes(1);
      expect(nextFunction).toHaveBeenCalledWith(); // No errors

      jest.clearAllMocks(); // Reset mocks for new test

      validateUserInput(mockRequest as Request, mockResponse as Response, nextFunction);
      expect(nextFunction).toHaveBeenCalledTimes(1);
      expect(nextFunction).toHaveBeenCalledWith(); // No errors

      // Simulate controller call after middlewares
      UserController.updateUser(mockRequest as Request, mockResponse as Response, errorHandler);
      expect(UserStore.update).toHaveBeenCalledWith(123, mockRequest.body);
      expect(responseJson).toHaveBeenCalledWith(updatedUser);
      expect(errorHandler).not.toHaveBeenCalled();
    });

    it('should stop the flow when there is an invalid ID error', () => {
      mockRequest.method = 'PUT';
      mockRequest.params = { id: 'abc' };
      mockRequest.body = { name: 'Updated User' };

      validateIdParam(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalledWith(expect.any(ApiError));
      expect(responseStatus).toHaveBeenCalledWith(400);
      expect(responseJson).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Invalid ID format'
      }));

      // Ensure controller is not called
      expect(UserStore.update).not.toHaveBeenCalled();
    });

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

      // Ensure controller is not called
      expect(UserStore.update).not.toHaveBeenCalled();
    });
  });
});