import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    env: {
      NODE_ENV: 'test',
      MONGODB_URI: 'mongodb://127.0.0.1:27017/skillmatrix_test',
      JWT_ACCESS_SECRET: 'test_jwt_access_secret_key_min_32_chars_long',
      JWT_REFRESH_SECRET: 'test_jwt_refresh_secret_key_min_32_chars_long',
      CLIENT_URL: 'http://localhost:5173',
    },
  },
});
