import { Request, Response, NextFunction } from 'express';
import { UserStore } from '../models/User';
import { ApiError } from '../middleware/errorHandler';

export class UserController {
  // Get all users
  static getAllUsers(req: Request, res: Response, next: NextFunction): void {
    try {
      const users = UserStore.getAll();
      res.json(users);
    } catch (error) {
      next(error);
    }
  }

  // Get user by ID
  static getUserById(req: Request, res: Response, next: NextFunction): void {
    try {
      const id = parseInt(req.params.id);
      const user = UserStore.getById(id);

      if (!user) {
        throw new ApiError(404, 'User not found');
      }

      res.json(user);
    } catch (error) {
      next(error);
    }
  }

  // Create new user
  static createUser(req: Request, res: Response, next: NextFunction): void {
    try {
      const { name, email } = req.body;
      const newUser = UserStore.create({ name, email });
      res.status(201).json(newUser);
    } catch (error) {
      next(error);
    }
  }

  // Update user
  static updateUser(req: Request, res: Response, next: NextFunction): void {
    try {
      const id = parseInt(req.params.id);
      const { name, email } = req.body;

      // Create an object with only the provided fields for update
      const updateData: { name?: string, email?: string } = {};
      if (name !== undefined) updateData.name = name;
      if (email !== undefined) updateData.email = email;

      const updatedUser = UserStore.update(id, updateData);

      if (!updatedUser) {
        throw new ApiError(404, 'User not found');
      }

      res.json(updatedUser);
    } catch (error) {
      next(error);
    }
  }

  // Delete user
  static deleteUser(req: Request, res: Response, next: NextFunction): void {
    try {
      const id = parseInt(req.params.id);
      const deleted = UserStore.delete(id);

      if (!deleted) {
        throw new ApiError(404, 'User not found');
      }

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}