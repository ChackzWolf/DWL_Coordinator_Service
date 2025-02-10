"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.configs = void 0;
// src/config/env.config.ts
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.configs = {
    port: process.env.PORT || 4001,
    mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/saga-coordinator',
    kafka: {
        brokers: (process.env.KAFKA_BROKERS || 'localhost:9092').split(','),
        clientId: process.env.KAFKA_CLIENT_ID || 'nodejs-kafka',
    },
    serviceTimeout: parseInt(process.env.SERVICE_TIMEOUT || '30000'),
};
