const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from server/.env or root .env file if available
const envPathServer = path.resolve(__dirname, '../../.env');
const envPathRoot = path.resolve(__dirname, '../../../.env');
dotenv.config({ path: envPathServer });
dotenv.config({ path: envPathRoot });

// Provide safe default values so the application and test suites run reliably everywhere
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/skillmatrix';
const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'default_jwt_access_secret_key_min_32_chars_long';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'default_jwt_refresh_secret_key_min_32_chars_long';
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

module.exports = {
  PORT: parseInt(process.env.PORT || '5000', 10),
  NODE_ENV: process.env.NODE_ENV || 'development',
  MONGODB_URI,
  JWT_ACCESS_SECRET,
  JWT_REFRESH_SECRET,
  CLIENT_URL,
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || '',
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY || '',
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET || '',
  RATE_LIMIT_WINDOW: parseInt(process.env.RATE_LIMIT_WINDOW || '900000', 10), // 15 mins default
  RATE_LIMIT_MAX: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
};
