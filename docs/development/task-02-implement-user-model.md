# Task #2: Implement User Model

## Purpose and Scope
The purpose of this task was to create the User data model with the necessary properties (id, name, email) and methods for in-memory data manipulation. This model serves as the main representation of user data and provides the interface for CRUD operations (Create, Read, Update, Delete) in the data storage.

## Technical Architecture and Design Decisions
The user model implementation follows a two-layer structure: an interface that defines the data structure and a storage class that manages persistence and manipulation. Important decisions include:

1. **Interface for Typing**: Creation of the `IUser` interface to define the data structure and ensure consistency
2. **Implementation Class**: Implementation of the `User` class to instantiate user objects
3. **In-Memory Storage**: Use of the static `UserStore` class to manage data in memory
4. **Auto-incremental ID**: Automatic ID generation system to ensure uniqueness
5. **Static Methods**: Implementation of static methods to facilitate access to storage functions

### Architecture Diagram
```
+-------------+     +----------------+      +----------------+
|  Interface  |     |      Class     |      |   Data Store   |
|    IUser    |---->|      User      |<-----|   UserStore    |
| (Structure) |     | (Object Model) |      | (Data Methods) |
+-------------+     +----------------+      +----------------+
                                                    ^
                                                    |
                                             +------+------+
                                             | In-Memory    |
                                             | Array Storage|
                                             +-------------+
```

## Implementation Details

### Code Structure
The user model is organized in the file:
- `src/models/User.ts`: Contains the `IUser` interface, the `User` class, and the `UserStore` class

### Patterns Used
1. **Repository Pattern**: `UserStore` implements the repository pattern for storage abstraction
2. **Interface-based Programming**: Use of interface to define structure and ensure implementation
3. **Static Utility Methods**: Static methods for CRUD operations in storage

### Main Components

#### IUser Interface
```typescript
export interface IUser {
  id: number;
  name: string;
  email: string;
}
```

#### User Class
```typescript
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
```

#### UserStore Class
```typescript
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
```

## Dependencies

### Internal Components
- **Project Setup (Task #1)**: Depends on the basic project structure and TypeScript configuration

### Components that Depend on This
- **User Controller (Task #4)**: Uses the model to perform CRUD operations
- **Model Tests (Task #8)**: Tests the model functionality
- **Integration Tests (Task #10)**: Uses the model as part of end-to-end tests

### External Systems
- **TypeScript**: For typing and interfaces

## Configuration Requirements

### Environment Variables
There are no specific environment variables for the user model.

### Application Configuration
No additional configuration is needed for the user model.

## Known Limitations
1. **Volatile Storage**: Data is stored in memory and lost when the server restarts
2. **Lack of Validation**: Data validation is handled in upper layers (middleware), not in the model
3. **No Indexing**: Searching by ID requires linear iteration (O(n)) through all users
4. **No Persistence**: There is no database integration for persistence
5. **Thread Safety**: There are no mechanisms to ensure safety in a multi-threaded environment

## Potential Future Improvements
1. **Database Integration**: Replace in-memory storage with database persistence
2. **Model-level Validation**: Add validation methods at the model level
3. **Pagination and Filtering**: Implement methods for paginated and filtered search
4. **Search Indices**: Add optimized data structures for searching
5. **Additional Fields**: Expand the model with extra fields (e.g., creation date, last update)

## Code Examples and Usage Patterns

### User Creation
```typescript
import { UserStore } from '../models/User';

// Create a new user
const newUser = UserStore.create({
  name: 'John Smith',
  email: 'john@example.com'
});

console.log(`User created with ID: ${newUser.id}`);
```

### Search and Update
```typescript
import { UserStore } from '../models/User';

// Search for a user by ID
const user = UserStore.getById(1);

if (user) {
  // Update email
  const updatedUser = UserStore.update(user.id, { email: 'new@example.com' });
  console.log('User updated:', updatedUser);
} else {
  console.log('User not found');
}
```

### Listing and Removal
```typescript
import { UserStore } from '../models/User';

// List all users
const allUsers = UserStore.getAll();
console.log(`Total users: ${allUsers.length}`);

// Remove a user
const deleted = UserStore.delete(1);
console.log(`User removed: ${deleted ? 'Yes' : 'No'}`);
```

## Troubleshooting Guide

### Problem 1: User not found by ID
**Symptoms:**
- `getById` method returns `undefined` even when the user exists
- Application shows 404 error when trying to access a user

**Solution:**
1. Check if the ID passed is of the correct type (number) and not a string
2. Verify if the user was actually created and added to storage
3. Check if there's no implicit type conversion during comparison

### Problem 2: User update doesn't reflect all changes
**Symptoms:**
- Some fields are not updated after calling the `update` method
- Partially updated data

**Solution:**
1. Make sure to pass all fields you want to update in the `userData` object
2. Verify if the update object has the correct structure
3. Check if the spread operator (`...`) is working as expected to merge the objects