import { Request, Response, NextFunction } from 'express';
import { UserController } from '../../controllers/UserController';
import { UserStore, IUser } from '../../models/User';
import { ApiError } from '../../middleware/errorHandler';

// Mock de UserStore
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

describe('UserController', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;
  let responseJson: jest.Mock;
  let responseStatus: jest.Mock;
  let responseSend: jest.Mock;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Mock response methods
    responseJson = jest.fn().mockReturnThis();
    responseStatus = jest.fn().mockReturnThis();
    responseSend = jest.fn().mockReturnThis();
    mockNext = jest.fn() as unknown as NextFunction;

    mockRequest = {};
    mockResponse = {
      json: responseJson,
      status: responseStatus,
      send: responseSend
    };
  });

  describe('getAllUsers', () => {
    it('should return all users', () => {
      const mockUsers = [
        { id: 1, name: 'User1', email: 'user1@example.com' },
        { id: 2, name: 'User2', email: 'user2@example.com' }
      ];

      (UserStore.getAll as jest.Mock).mockReturnValue(mockUsers);

      UserController.getAllUsers(mockRequest as Request, mockResponse as Response, mockNext);

      expect(UserStore.getAll).toHaveBeenCalled();
      expect(responseJson).toHaveBeenCalledWith(mockUsers);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should call next with error if exception occurs', () => {
      const error = new Error('Database error');
      (UserStore.getAll as jest.Mock).mockImplementation(() => {
        throw error;
      });

      UserController.getAllUsers(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
      expect(responseJson).not.toHaveBeenCalled();
    });
  });

  describe('getUserById', () => {
    it('should return a user when ID exists', () => {
      const mockUser = { id: 1, name: 'User1', email: 'user1@example.com' };
      mockRequest.params = { id: '1' };

      (UserStore.getById as jest.Mock).mockReturnValue(mockUser);

      UserController.getUserById(mockRequest as Request, mockResponse as Response, mockNext);

      expect(UserStore.getById).toHaveBeenCalledWith(1);
      expect(responseJson).toHaveBeenCalledWith(mockUser);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should call next with ApiError when user is not found', () => {
      mockRequest.params = { id: '999' };

      (UserStore.getById as jest.Mock).mockReturnValue(undefined);

      UserController.getUserById(mockRequest as Request, mockResponse as Response, mockNext);

      expect(UserStore.getById).toHaveBeenCalledWith(999);
      expect(mockNext).toHaveBeenCalledWith(expect.any(ApiError));
      expect(responseJson).not.toHaveBeenCalled();
    });
  });

  describe('createUser', () => {
    it('should create a new user with valid data', () => {
      const newUser = { name: 'New User', email: 'newuser@example.com' };
      const createdUser = { id: 3, ...newUser };

      mockRequest.body = newUser;

      (UserStore.create as jest.Mock).mockReturnValue(createdUser);

      UserController.createUser(mockRequest as Request, mockResponse as Response, mockNext);

      expect(UserStore.create).toHaveBeenCalledWith(newUser);
      expect(responseStatus).toHaveBeenCalledWith(201);
      expect(responseJson).toHaveBeenCalledWith(createdUser);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should call next with error if exception occurs', () => {
      const error = new Error('Create error');
      mockRequest.body = { name: 'New User', email: 'newuser@example.com' };

      (UserStore.create as jest.Mock).mockImplementation(() => {
        throw error;
      });

      UserController.createUser(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
      expect(responseJson).not.toHaveBeenCalled();
    });
  });

  describe('updateUser', () => {
    it('should update a user with valid data', () => {
      const updateData = { name: 'Updated User', email: 'updated@example.com' };
      const updatedUser = { id: 1, ...updateData };

      mockRequest.params = { id: '1' };
      mockRequest.body = updateData;

      (UserStore.update as jest.Mock).mockReturnValue(updatedUser);

      UserController.updateUser(mockRequest as Request, mockResponse as Response, mockNext);

      expect(UserStore.update).toHaveBeenCalledWith(1, updateData);
      expect(responseJson).toHaveBeenCalledWith(updatedUser);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should call next with ApiError when user is not found', () => {
      mockRequest.params = { id: '999' };
      mockRequest.body = { name: 'Updated User' };

      (UserStore.update as jest.Mock).mockReturnValue(undefined);

      UserController.updateUser(mockRequest as Request, mockResponse as Response, mockNext);

      expect(UserStore.update).toHaveBeenCalledWith(999, { name: 'Updated User' });
      expect(mockNext).toHaveBeenCalledWith(expect.any(ApiError));
      expect(responseJson).not.toHaveBeenCalled();
    });
  });

  describe('deleteUser', () => {
    it('should delete a user when ID exists', () => {
      mockRequest.params = { id: '1' };

      (UserStore.delete as jest.Mock).mockReturnValue(true);

      UserController.deleteUser(mockRequest as Request, mockResponse as Response, mockNext);

      expect(UserStore.delete).toHaveBeenCalledWith(1);
      expect(responseStatus).toHaveBeenCalledWith(204);
      expect(responseSend).toHaveBeenCalled();
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should call next with ApiError when user is not found', () => {
      mockRequest.params = { id: '999' };

      (UserStore.delete as jest.Mock).mockReturnValue(false);

      UserController.deleteUser(mockRequest as Request, mockResponse as Response, mockNext);

      expect(UserStore.delete).toHaveBeenCalledWith(999);
      expect(mockNext).toHaveBeenCalledWith(expect.any(ApiError));
      expect(responseStatus).not.toHaveBeenCalledWith(404);
    });
  });
});