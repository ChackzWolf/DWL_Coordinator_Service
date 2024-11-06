"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KafkaConfig = void 0;
const kafkajs_1 = require("kafkajs");
class KafkaConfig {
    constructor() {
        this.kafka = new kafkajs_1.Kafka({
            clientId: 'saga-orchestrator',
            brokers: ['localhost:9092']
        });
        this.producer = this.kafka.producer();
        this.consumer = this.kafka.consumer({ groupId: 'saga-orchestrator-group' });
    }
    async connect() {
        await this.producer.connect();
        await this.consumer.connect();
    }
    async disconnect() {
        await this.producer.disconnect();
        await this.consumer.disconnect();
    }
    async sendMessage(topic, message) {
        await this.producer.send({
            topic,
            messages: [{ value: JSON.stringify(message) }]
        });
    }
    async consumeMessages(topics, handler) {
        for (const topic of topics) {
            await this.consumer.subscribe({ topic });
        }
        await this.consumer.run({
            eachMessage: async ({ message }) => {
                var _a;
                const parsedMessage = JSON.parse(((_a = message.value) === null || _a === void 0 ? void 0 : _a.toString()) || '');
                await handler(parsedMessage);
            }
        });
    }
}
exports.KafkaConfig = KafkaConfig;
