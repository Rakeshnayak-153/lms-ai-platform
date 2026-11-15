import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  databaseUrl: process.env.DATABASE_URL || 'postgresql://postgres:postgres123@localhost:5432/lms_ai_db',
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
  },
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET || 'default_jwt_access_secret_123',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'default_jwt_refresh_secret_123',
    accessExpiry: process.env.JWT_ACCESS_EXPIRY || '15m',
    refreshExpiry: process.env.JWT_REFRESH_EXPIRY || '7d',
  },
  aiServiceUrl: process.env.AI_SERVICE_URL || 'http://localhost:8000',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
};
