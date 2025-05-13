# Task #11: Implement API Documentation

## Purpose and Scope
The purpose of this task was to implement comprehensive documentation for the API, allowing developers to easily understand and use the available endpoints. The documentation needs to cover all endpoints, parameters, request bodies, responses, and HTTP status codes, providing a complete and up-to-date guide for interacting with the API.

## Technical Architecture and Design Decisions
The API documentation implementation used the OpenAPI standard (formerly known as Swagger) through the Swagger JSDoc library. This approach was chosen for:

1. **Code-Integrated Documentation**: Allows documentation to be maintained alongside the code, facilitating updates
2. **Widely Adopted Standard**: OpenAPI is an industry standard for RESTful API documentation
3. **Interactive Interface**: Provides an interactive web interface to test endpoints directly from the documentation
4. **Automatic Generation**: Uses JSDoc comments to automatically generate the OpenAPI specification

## Implementation Details

### Code Structure
The documentation implementation is organized in the following files:
- `src/swagger.ts`: Central configuration for Swagger JSDoc
- JSDoc comments in route and model files to document endpoints and schemas

### Patterns Used
1. **OpenAPI/Swagger Comments**: Use of special comments to document endpoints, following the OpenAPI 3.0 specification
2. **Reusable Schemas**: Definition of schemas for common components, such as the User model
3. **Grouping by Tags**: Organization of endpoints by functional tags (e.g., "Users")

### Main Algorithms and Logic
The Swagger JSDoc configuration includes:
1. Definition of the OpenAPI version (3.0.0)
2. General information about the API (title, version, description)
3. Server configuration (development on localhost:3000)
4. Location of files to be scanned for documentation comments

## Dependencies

### Internal Components
- **API Routes**: Used to extract documentation comments
- **Models**: Used to define data schemas

### External Systems
- **swagger-jsdoc**: Library to generate the OpenAPI specification from JSDoc comments
- **swagger-ui-express**: Middleware to serve the Swagger UI interface

## Configuration Requirements

### Environment Variables
No specific environment variables are needed for API documentation.

### Application Configuration
The API documentation configuration is in the `src/swagger.ts` file. To view the documentation, access the `/api-docs` route on the running server.

## Known Limitations
1. Documentation needs to be manually updated when there are changes to endpoints or models
2. There is no automatic validation to ensure that the implementation matches the documentation
3. The Swagger UI interface is not available in production by default (only in development)

## Potential Future Improvements
1. Implement automated tests to validate if the API matches the documentation
2. Add more detailed request and response examples
3. Integrate authentication into the documentation for protected endpoints (future)
4. Implement API versioning and reflect this in the documentation
5. Add documentation in multiple languages

## Code Examples and Usage Patterns

### Swagger Configuration
```typescript
import swaggerJSDoc from 'swagger-jsdoc';

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'User Management API',
      version: '1.0.0',
      description: 'A simple Express API for managing users',
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server',
      },
    ],
  },
  apis: ['./src/routes/*.ts', './src/models/*.ts'],
};

export const swaggerSpec = swaggerJSDoc(options);
```

### Route Documentation Example
```typescript
/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Returns all users
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: List of all users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 */
router.get('/', userController.getAllUsers);
```

### Documentation Schema Example
```typescript
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
 *           description: Unique user ID
 *         name:
 *           type: string
 *           description: User's name
 *         email:
 *           type: string
 *           format: email
 *           description: User's email
 *       example:
 *         id: 1
 *         name: John Smith
 *         email: john@example.com
 */
```

## Troubleshooting Guide

### Problem 1: Documentation doesn't appear in Swagger UI interface
**Symptoms:**
- The `/api-docs` route shows the interface, but with no endpoints or incomplete information
- Errors in the console related to swagger file parsing

**Solution:**
1. Check if the paths in `apis` in the Swagger configuration point to the correct files
2. Verify that JSDoc comments follow the correct Swagger syntax
3. Check if the Express application is correctly loading the swagger-ui-express middleware

### Problem 2: Component schemas are not being correctly referenced
**Symptoms:**
- "Cannot resolve reference" errors in the Swagger UI interface
- Referenced models appear as "undefined" or empty objects

**Solution:**
1. Check if the components are correctly defined in JSDoc
2. Make sure that references to components use the correct path (e.g., `#/components/schemas/User`)
3. Check the loading order to ensure that component definitions are processed before references