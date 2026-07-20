const app = require('./src/app');
const env = require('./src/config/env');
const { connectDB, disconnectDB } = require('./src/database/connection');
const { logger } = require('./src/logger');

let server;

// Fail fast on uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.fatal(err, 'UNCAUGHT EXCEPTION! Shutting down process immediately...');
  process.exit(1);
});

const bootstrap = async () => {
  logger.info('Starting SkillMatrix API Server bootstrap...');

  // Initialize DB Connection
  await connectDB();

  // Start Express Server
  server = app.listen(env.PORT, () => {
    logger.info(`SkillMatrix API Server listening on port ${env.PORT} in [${env.NODE_ENV}] mode`);
  });

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (err) => {
    logger.fatal(err, 'UNHANDLED REJECTION! Shutting down server gracefully...');
    if (server) {
      server.close(() => {
        disconnectDB().then(() => process.exit(1));
      });
    } else {
      process.exit(1);
    }
  });
};

const handleTermination = (signal) => {
  logger.warn(`Termination signal ${signal} received. Starting graceful shutdown...`);
  if (server) {
    server.close(async () => {
      logger.info('Express server closed.');
      await disconnectDB();
      logger.info('Shutdown complete. Exiting.');
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
};

process.on('SIGINT', () => handleTermination('SIGINT'));
process.on('SIGTERM', () => handleTermination('SIGTERM'));

bootstrap();
