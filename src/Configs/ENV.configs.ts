// src/config/env.config.ts
import dotenv from 'dotenv';
dotenv.config();

export const configs = {
  port: process.env.PORT || 4001,
  mongoUri: process.env.MONGO_URI ,
  kafka: {
    brokers: (process.env.KAFKA_BROKERS || 'education-kafka:29092').split(','),
    clientId: process.env.KAFKA_CLIENT_ID || 'nodejs-kafka',
  },
  serviceTimeout: parseInt(process.env.SERVICE_TIMEOUT || '30000'),
};   