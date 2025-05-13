import { Request, Response, NextFunction } from 'express';
import { ApiError, errorHandler, notFoundHandler } from '../../middleware/errorHandler';

// Mock for logger
jest.mock('../../utils/logger', () => ({
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
  debug: jest.fn()
}));

// Mock for Request, Response and NextFunction
const mockRequest = () => {
  const req = {
    headers: { 'x-request-id': 'test-request-id' },
    method: 'GET',
    path: '/test',
    url: '/test'
  } as unknown as Request;
  return req;
};

const mockResponse = () => {
  const res = {} as Response;
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.setHeader = jest.fn().mockReturnValue(res);
  return res;
};

const mockNext: NextFunction = jest.fn();

describe('ApiError', () => {
  it('should correctly set status code and message', () => {
    const statusCode = 404;
    const message = 'Test error';
    const apiError = new ApiError(statusCode, message);

    expect(apiError).toBeInstanceOf(Error);
    expect(apiError.statusCode).toBe(statusCode);
    expect(apiError.message).toBe(message);
    expect(apiError.name).toBe('ApiError');
  });
});

describe('errorHandler middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return the status code and correct error format for ApiError instances', () => {
    const req = mockRequest();
    const res = mockResponse();
    const apiError = new ApiError(404, 'User not found');

    errorHandler(apiError, req, res, mockNext);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      error: 'ApiError',
      message: 'User not found',
      requestId: 'test-request-id'
    });
  });

  it('should return status 500 for generic errors', () => {
    const req = mockRequest();
    const res = mockResponse();
    const genericError = new Error('Generic error');

    errorHandler(genericError, req, res, mockNext);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: 'InternalServerError',
      message: 'An unexpected error occurred',
      requestId: 'test-request-id'
    });
  });
});

describe('notFoundHandler middleware', () => {
  it('should return status 404 with the correct error format', () => {
    const req = mockRequest();
    const res = mockResponse();

    notFoundHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      error: 'NotFound',
      message: 'The requested resource does not exist',
      requestId: 'test-request-id'
    });
  });
});