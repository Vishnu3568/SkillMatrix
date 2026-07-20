const pino = require('pino');
const pinoHttp = require('pino-http');
const env = require('../config/env');

const isProduction = env.NODE_ENV === 'production';

const pinoOptions = {
  level: isProduction ? 'info' : 'debug',
  redact: {
    paths: [
      'req.headers.authorization',
      'req.headers.cookie',
      'body.password',
      'body.passwordConfirm',
    ],
    censor: '[REDACTED]',
  },
};

// Use pino-pretty in development for developer readability
if (!isProduction) {
  pinoOptions.transport = {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'SYS:standard',
      ignore: 'pid,hostname',
    },
  };
}

const logger = pino(pinoOptions);

const httpLogger = pinoHttp({
  logger,
  customSuccessMessage: (req, res, responseTime) => {
    return `${req.method} ${req.originalUrl || req.url} - Status ${res.statusCode} - ${responseTime}ms`;
  },
  customErrorMessage: (req, res, err) => {
    return `${req.method} ${req.originalUrl || req.url} - Status ${res.statusCode} - Error: ${err.message}`;
  },
  serializers: {
    req(req) {
      // Custom request serializer to hide raw headers/cookies
      return {
        id: req.id,
        method: req.method,
        url: req.url,
        query: req.query,
        ip: req.ip,
      };
    },
    res(res) {
      return {
        statusCode: res.statusCode,
      };
    },
  },
});

module.exports = {
  logger,
  httpLogger,
};
