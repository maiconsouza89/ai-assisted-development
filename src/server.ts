import app from './app';
import logger from './utils/logger';

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  logger.info(`Servidor rodando na porta ${PORT}`);
});

// Emitir evento 'listening' para o app
app.emit('listening');

// Tratamento de encerramento seguro
process.on('SIGTERM', () => {
  logger.info('SIGTERM recebido, encerrando o servidor...');
  server.close(() => {
    logger.info('Servidor encerrado.');
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT recebido, encerrando o servidor...');
  server.close(() => {
    logger.info('Servidor encerrado.');
  });
});