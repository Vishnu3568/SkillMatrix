const env = require('../config/env');

const formatLog = (level, message, meta = {}) => {
  const logObj = {
    timestamp: new Date().toISOString(),
    level,
    message,
    environment: env.NODE_ENV,
    ...meta,
  };

  // In production, log as structured JSON. In development, log as readable string.
  if (env.NODE_ENV === 'production') {
    return JSON.stringify(logObj);
  } else {
    const metaStr = Object.keys(meta).length ? ` | meta: ${JSON.stringify(meta)}` : '';
    return `[${logObj.timestamp}] [${level.toUpperCase()}]: ${message}${metaStr}`;
  }
};

const logger = {
  info: (message, meta) => {
    console.log(formatLog('info', message, meta));
  },
  error: (message, error, meta = {}) => {
    const errorMeta = error ? {
      error: error.message,
      stack: error.stack,
      ...meta,
    } : meta;
    console.error(formatLog('error', message, errorMeta));
  },
  warn: (message, meta) => {
    console.warn(formatLog('warn', message, meta));
  },
  debug: (message, meta) => {
    if (env.NODE_ENV !== 'production') {
      console.log(formatLog('debug', message, meta));
    }
  },
};

module.exports = logger;
