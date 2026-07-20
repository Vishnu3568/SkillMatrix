const app = require('./src/app');
const env = require('./src/config/env');
const { connectDB, disconnectDB } = require('./src/db/connection');
const logger = require('./src/utils/logger');

let server;

// Handle uncaught exceptions before boot
process.on('uncaughtException', (err) => {
  logger.error('UNCAUGHT EXCEPTION! Shutting down...', err);
  process.exit(1);
});

const startServer = async () => {
  logger.info('Starting SkillMatrix API Server bootstrap...');

  // Connect to database
  await connectDB();

  // Listen on configured port
  server = app.listen(env.PORT, () => {
    logger.info(`SkillMatrix Server listening successfully on port ${env.PORT} in [${env.NODE_ENV}] mode`);
  });

  // Handle unhandled rejections
  process.on('unhandledRejection', (err) => {
    logger.error('UNHANDLED REJECTION! Shutting down server gracefully...', err);
    if (server) {
      server.close(() => {
        disconnectDB().then(() => process.exit(1));
      });
    } else {
      process.exit(1);
    }
  });
};

// Handle termination signals for graceful shutdown
const gracefulShutdown = (signal) => {
  logger.warn(`Received ${signal}. Starting graceful shutdown...`);
  if (server) {
    server.close(async () => {
      logger.info('HTTP server closed.');
      await disconnectDB();
      logger.info('Graceful shutdown completed.');
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

startServer();
