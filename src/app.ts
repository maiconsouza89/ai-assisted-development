import express, { Application, Request, Response, NextFunction } from 'express';
import userRoutes from './routes/userRoutes';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './swagger';
import { requestLogger, addRequestId } from './middleware/requestLogger';
import logger from './utils/logger';

const app: Application = express();

// Middleware to add request ID and logging
app.use(addRequestId);
app.use(requestLogger);

// Middleware to process JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API documentation with Swagger
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Basic route for testing
app.get('/', (req: Request, res: Response) => {
  logger.debug('Root endpoint accessed');
  res.json({ message: 'User Management API working!' });
});

// Mounting the user router at path /api/users
logger.info('Registering user routes at /api/users');
app.use('/api/users', userRoutes);

// Handler for routes not found (404)
app.use(notFoundHandler);

// Middleware to handle errors
app.use(errorHandler);

// Register when the application starts
app.on('listening', () => {
  logger.info(`Server started on port ${process.env.PORT || 3000}`);
});

export default app;