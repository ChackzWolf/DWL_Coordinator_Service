// src/config/env.config.ts
import dotenv from 'dotenv';
dotenv.config();

export const configs = {
  port: process.env.PORT || 4001,
  mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/saga-coordinator',
  kafka: {
    brokers: (process.env.KAFKA_BROKERS || 'localhost:9092').split(','),
    clientId: process.env.KAFKA_CLIENT_ID || 'nodejs-kafka',
  },
  serviceTimeout: parseInt(process.env.SERVICE_TIMEOUT || '30000'),
};   