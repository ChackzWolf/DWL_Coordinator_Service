"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SagaOrchestrator = void 0;
const crypto_1 = require("crypto");
class SagaOrchestrator {
    constructor(kafkaConfig, transactionRepo) {
        this.kafkaConfig = kafkaConfig;
        this.transactionRepo = transactionRepo;
        this.steps = [
            {
                service: 'PAYMENT_SERVICE',
                topic: 'payment.execute',
                compensationTopic: 'payment.refund'
            },
            {
                service: 'ORDER_SERVICE',
                topic: 'order.create',
                compensationTopic: 'order.cancel'
            },
            {
                service: 'USER_SERVICE',
                topic: 'user.update',
                compensationTopic: 'user.rollback'
            },
            {
                service: 'TUTOR_SERVICE',
                topic: 'tutor.update',
                compensationTopic: 'tutor.rollback'
            },
            {
                service: 'COURSE_SERVICE',
                topic: 'course.update',
                compensationTopic: 'course.rollback'
            }
        ];
    }
    async initialize() {
        await this.kafkaConfig.connect();
        await this.initializeKafkaListeners();
    }
    async initializeKafkaListeners() {
        const topics = [
            ...this.steps.map(step => `${step.topic}.response`),
            ...this.steps.map(step => `${step.compensationTopic}.response`)
        ];
        await this.kafkaConfig.consumeMessages(topics, this.handleServiceResponse.bind(this));
    }
    async startTransaction(payload) {
        const transactionId = (0, crypto_1.randomUUID)();
        const initialState = {
            transactionId,
            status: 'PENDING',
            currentStep: 0,
            compensatingActions: [],
            payload
        };
        await this.transactionRepo.save(initialState);
        await this.executeStep(transactionId);
        return transactionId;
    }
    async executeStep(transactionId) {
        const state = await this.transactionRepo.findById(transactionId);
        if (!state || state.currentStep >= this.steps.length)
            return;
        const currentStep = this.steps[state.currentStep];
        const message = {
            transactionId,
            payload: state.payload,
            step: state.currentStep
        };
        await this.kafkaConfig.sendMessage(currentStep.topic, message);
    }
    async handleServiceResponse(message) {
        const { transactionId, success, error } = message;
        const state = await this.transactionRepo.findById(transactionId);
        if (!state)
            return;
        if (success) {
            state.compensatingActions.push(this.steps[state.currentStep].compensationTopic);
            state.currentStep++;
            if (state.currentStep >= this.steps.length) {
                state.status = 'COMPLETED';
                await this.kafkaConfig.sendMessage('transaction.completed', {
                    transactionId,
                    status: 'COMPLETED'
                });
            }
            else {
                await this.transactionRepo.update(state);
                await this.executeStep(transactionId);
            }
        }
        else {
            state.status = 'FAILED';
            state.error = error;
            await this.transactionRepo.update(state);
            await this.initiateRollback(transactionId);
        }
    }
    async initiateRollback(transactionId) {
        const state = await this.transactionRepo.findById(transactionId);
        if (!state)
            return;
        for (const compensationTopic of state.compensatingActions.reverse()) {
            await this.kafkaConfig.sendMessage(compensationTopic, {
                transactionId,
                payload: state.payload,
                error: state.error
            });
        }
        await this.kafkaConfig.sendMessage('transaction.failed', {
            transactionId,
            error: state.error
        });
    }
    async getTransactionStatus(transactionId) {
        return await this.transactionRepo.findById(transactionId);
    }
}
exports.SagaOrchestrator = SagaOrchestrator;
