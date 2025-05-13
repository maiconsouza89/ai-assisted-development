import winston from 'winston';

// Definir formato do log
const logFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.printf(({ level, message, timestamp }) => {
    return `${timestamp} ${level}: ${message}`;
  })
);

// Criar instância do logger
const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: logFormat,
  transports: [
    // Transporte para console em todos os ambientes
    new winston.transports.Console(),
    // Transporte para arquivo de erros
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    // Transporte para todos os logs
    new winston.transports.File({ filename: 'logs/combined.log' })
  ],
});

export default logger;