const mongoose = require('mongoose');
const env = require('../config/env');
const { logger } = require('../logger');
const { MESSAGES } = require('../constants');

let retryCount = 0;
const MAX_RETRIES = 5;
const RETRY_INTERVAL_MS = 5000;

const connectDB = async () => {
  const connOptions = {
    autoIndex: true,
  };

  mongoose.connection.on('connecting', () => {
    logger.info('Initiating database connection attempt...');
  });

  mongoose.connection.on('connected', () => {
    logger.info(MESSAGES.DATABASE_CONNECTED, {
      host: mongoose.connection.host,
      name: mongoose.connection.name,
    });
    retryCount = 0; // Reset retries on successful connection
  });

  mongoose.connection.on('error', (err) => {
    logger.error(err, MESSAGES.DATABASE_CONNECTION_ERROR);
  });

  mongoose.connection.on('disconnected', () => {
    logger.warn(MESSAGES.DATABASE_DISCONNECTED);
  });

  const attemptConnect = async () => {
    try {
      await mongoose.connect(env.MONGO_URI || env.MONGODB_URI, connOptions);
    } catch (error) {
      retryCount++;
      logger.error(
        error,
        `Database connection attempt ${retryCount} failed. Max attempts: ${MAX_RETRIES}`
      );

      if (retryCount >= MAX_RETRIES) {
        logger.fatal('Database connection attempts exceeded limit. Shutting down application.');
        process.exit(1); // Fail fast
      }

      logger.info(`Retrying connection in ${RETRY_INTERVAL_MS / 1000}s...`);
      setTimeout(attemptConnect, RETRY_INTERVAL_MS);
    }
  };

  await attemptConnect();
};

const disconnectDB = async () => {
  try {
    await mongoose.connection.close();
    logger.info(MESSAGES.DATABASE_TERMINATED);
  } catch (error) {
    logger.error(error, 'Error during database disconnection');
  }
};

const isDbConnected = () => {
  return mongoose.connection.readyState === 1;
};

module.exports = {
  connectDB,
  disconnectDB,
  isDbConnected,
};
