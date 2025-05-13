import { error } from "console";

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - name
 *         - email
 *       properties:
 *         id:
 *           type: integer
 *           description: Unique user ID automatically generated
 *         name:
 *           type: string
 *           description: User's name
 *         email:
 *           type: string
 *           description: User's email
 *       example:
 *         id: 1
 *         name: John Smith
 *         email: john@example.com
 */
export interface IUser {
  id: number;
  name: string;
  email: string;
}

export class User implements IUser {
  id: number;
  name: string;
  email: string;

  constructor(name: string, email: string, id?: number) {
    this.name = name;
    this.email = email;
    this.id = id || Date.now();
  }
}

// In-memory storage
export class UserStore {
  private static users: IUser[] = [];
  private static lastId: number = 0;

  static getAll(): IUser[] {
    return this.users;
  }

  static getById(id: number): IUser | undefined {
    return this.users.find(user => user.id === id);
  }

  static create(userData: Omit<IUser, 'id'>): IUser {
    const id = ++this.lastId;
    const newUser = { id, ...userData };
    this.users.push(newUser);
    return newUser;
  }

  static update(id: number, userData: Partial<Omit<IUser, 'id'>>): IUser | undefined {
    const index = this.users.findIndex(user => user.id === id);
    if (index === -1) return undefined;

    this.users[index] = { ...this.users[index], ...userData };
    return this.users[index];
  }

  static delete(id: number): boolean {
    const initialLength = this.users.length;
    this.users = this.users.filter(user => user.id !== id);
    return initialLength !== this.users.length;
  }
}