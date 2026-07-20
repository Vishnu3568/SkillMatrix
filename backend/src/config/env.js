const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from backend/.env file
const envPath = path.resolve(__dirname, '../../.env');
dotenv.config({ path: envPath });

const requiredEnvVars = ['MONGO_URI'];

const missingEnvVars = requiredEnvVars.filter((varName) => !process.env[varName]);

if (missingEnvVars.length > 0) {
  const errorMessage = `FATAL CONFIGURATION ERROR: Missing required environment variable(s): ${missingEnvVars.join(', ')}`;
  console.error(errorMessage);
  process.exit(1);
}

module.exports = {
  PORT: parseInt(process.env.PORT || '5000', 10),
  NODE_ENV: process.env.NODE_ENV || 'development',
  MONGO_URI: process.env.MONGO_URI,
  CLIENT_ORIGIN_URL: process.env.CLIENT_ORIGIN_URL || 'http://localhost:5173',
  JWT_SECRET: process.env.JWT_SECRET || 'development_secret_key',
  JWT_EXPIRE: process.env.JWT_EXPIRE || '24h',
};
