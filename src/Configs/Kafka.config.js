"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.KafkaConfig = void 0;
// src/Configs/Kafka.config.ts
const kafkajs_1 = require("kafkajs");
class KafkaConfig {
    constructor() {
        this.kafka = new kafkajs_1.Kafka({
            clientId: 'nodejs-kafka',
            brokers: ['localhost:9092'],
        });
    }
    static getInstance() {
        if (!KafkaConfig.instance) {
            KafkaConfig.instance = new KafkaConfig();
        }
        return KafkaConfig.instance;
    }
    createConsumer(groupId) {
        return __awaiter(this, void 0, void 0, function* () {
            const consumer = this.kafka.consumer({
                groupId,
                sessionTimeout: 30000,
                heartbeatInterval: 3000,
                readUncommitted: false
            });
            yield consumer.connect();
            return consumer;
        });
    }
    createProducer() {
        return __awaiter(this, void 0, void 0, function* () {
            const producer = this.kafka.producer();
            yield producer.connect();
            return producer;
        });
    }
    sendMessage(topic, message) {
        return __awaiter(this, void 0, void 0, function* () {
            const producer = yield this.createProducer();
            try {
                yield producer.send({
                    topic,
                    messages: [{ value: JSON.stringify(message) }],
                });
            }
            finally {
                yield producer.disconnect();
            }
        });
    }
    createTopic(topicName, noOfPartition) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const admin = this.kafka.admin();
                yield admin.connect();
                yield admin.createTopics({
                    topics: [
                        {
                            topic: topicName,
                            numPartitions: noOfPartition,
                            replicationFactor: 1,
                        },
                    ],
                });
                yield admin.disconnect();
                console.log("Topic successfully created.");
            }
            catch (error) {
                console.log("Failed to create topic.");
            }
        });
    }
}
exports.KafkaConfig = KafkaConfig;
