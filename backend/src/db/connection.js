const mongoose = require('mongoose');
const env = require('../config/env');
const logger = require('../utils/logger');

const connectDB = async () => {
  try {
    const connOptions = {
      autoIndex: true, // Auto-build indexes in Mongoose schemas (mapped in Phase 0)
    };

    mongoose.connection.on('connecting', () => {
      logger.info('Database connection initiating...');
    });

    mongoose.connection.on('connected', () => {
      logger.info('Database connection established successfully', {
        host: mongoose.connection.host,
        name: mongoose.connection.name,
      });
    });

    mongoose.connection.on('error', (err) => {
      logger.error('Database connection encountered an error', err);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('Database connection disconnected');
    });

    await mongoose.connect(env.MONGO_URI, connOptions);
  } catch (error) {
    logger.error('Database connection failed to initialize', error);
    process.exit(1); // Fail fast
  }
};

const disconnectDB = async () => {
  try {
    await mongoose.connection.close();
    logger.info('Database connection closed cleanly due to application termination');
  } catch (error) {
    logger.error('Error closing database connection', error);
  }
};

module.exports = {
  connectDB,
  disconnectDB,
};
