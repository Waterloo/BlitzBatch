import dotenv from 'dotenv';

dotenv.config();

export const config = {
  app: {
    name: 'BlitzBatch',
    version: '1.0.0',
  },
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/blitzbatch_db',
  },
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key',
  },
  files: {
    maxSize: parseInt(process.env.MAX_FILE_SIZE || '52428800', 10),
    uploadDir: 'uploads',
  },
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW || '60', 10) * 1000,
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '10000', 10),
  },
};