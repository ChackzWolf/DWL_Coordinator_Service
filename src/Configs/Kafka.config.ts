// src/Configs/Kafka.config.ts
import { Kafka, Consumer, Producer } from 'kafkajs';

export class KafkaConfig {
  private kafka: Kafka;
  private static instance: KafkaConfig;

  private constructor() {
    this.kafka = new Kafka({
      clientId: 'nodejs-kafka', 
      brokers: ['localhost:9092'],
    });
  }

  public static getInstance(): KafkaConfig {
    if (!KafkaConfig.instance) {
      KafkaConfig.instance = new KafkaConfig();
    }
    return KafkaConfig.instance;
  }

  public async createConsumer(groupId: string): Promise<Consumer> {
    const consumer = this.kafka.consumer({ groupId });
    await consumer.connect();
    return consumer;
  }

  public async createProducer(): Promise<Producer> {
    const producer = this.kafka.producer();
    await producer.connect();
    return producer;
  }

  public async sendMessage(topic: string, message: any) {
    const producer = await this.createProducer();
    try {
      await producer.send({
        topic,
        messages: [{ value: JSON.stringify(message) }],
      });
    } finally {
      await producer.disconnect();
    }
  }

  async createTopic(topicName: string, noOfPartition: number) {
    try {
        const admin = this.kafka.admin();
        await admin.connect();
        await admin.createTopics({
            topics: [
                {
                    topic: topicName,
                    numPartitions: noOfPartition,
                    replicationFactor: 1,
                },
            ],
        });
        await admin.disconnect();

        console.log("Topic successfully created.");
    } catch (error) {
        console.log("Failed to create topic.");
    }
}
}


