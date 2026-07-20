const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const cookieParser = require('cookie-parser');

const env = require('./config/env');
const { httpLogger } = require('./logger');
const errorHandler = require('./middlewares/errorHandler');
const { NotFoundError } = require('./errors');

const app = express();

// 1. Request Logging Middleware (Pino-HTTP)
app.use(httpLogger);

// 2. Global Security Middlewares
app.use(helmet());

const corsOptions = {
  origin: env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
app.use(cors(corsOptions));

const limiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW,
  max: env.RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'TOO_MANY_REQUESTS',
      message: 'Too many requests from this IP, please try again later.',
    },
  },
});
app.use(limiter);

// 3. Request Parsers & Size Limits
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// 4. Request Sanitization
app.use(mongoSanitize());

// 5. API Routes
const authRouter = require('./routes/auth');
app.use('/api/auth', authRouter);

// 6. Catch-all 404 Route handler
app.use((req, res, next) => {
  next(new NotFoundError(`Route ${req.method} ${req.originalUrl} not found`));
});

// 6. Global Error Interceptor Middleware
app.use(errorHandler);

module.exports = app;
