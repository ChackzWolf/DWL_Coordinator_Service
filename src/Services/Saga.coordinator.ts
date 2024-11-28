
import { KafkaConfig } from "../Configs/Kafka.config";
import { ITransactionRepository } from "../Repositories/Transaction.repository";
import { OrderEventData, ServiceResponse, TransactionState } from "../Types/types";

// src/services/SagaCoordinator.ts
export class SagaCoordinator {
  private kafkaConfig: KafkaConfig;
  private transactionRepo: ITransactionRepository;
  private responseTimeoutMs: number = 50000; // 30 seconds timeout

  constructor(kafkaConfig: KafkaConfig, transactionRepo: ITransactionRepository) {
    this.kafkaConfig = kafkaConfig;
    this.transactionRepo = transactionRepo;
    this.initializeKafkaListeners();
  }                                           
  private async initializeKafkaListeners() {
    const consumer = await this.kafkaConfig.createConsumer('saga-coordinator-group');
    
    // Subscribe to payment.success 
    await consumer.subscribe({ topic: 'payment.success', fromBeginning: false });
    
    // Subscribe to service response topics
    const serviceResponseTopics = [
      'admin.response',
      'tutor.response',
      'user.response',
      'course.response',
      'order.response',
      'chat.response'
    ];
    
    for (const topic of serviceResponseTopics) {
      await consumer.subscribe({ topic, fromBeginning: false });
    }

    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        const messageData = JSON.parse(message.value?.toString() || '{}');
        console.log({
          offset: message.offset,
          value: messageData,
          topic
        }, 'partition off set')
        if (topic === 'payment.success') {

          await this.handlePaymentSuccess(messageData);
        } else {
          await this.handleServiceResponse(topic, messageData);
        }
      }, 
    });
  }

  private async handleServiceResponse(topic: string, messageData: any) {
    const { transactionId, status } = messageData;
    const service = `${topic.split('.')[0]}-service`;
    // console.log(messageData, "this is message data from handle response");
    const serviceResponse: ServiceResponse = {
      service,
      status: status,
      error:'',
      timestamp: new Date()
    };
    // console.log(service, 'to save');
    await this.transactionRepo.updateServiceResponse(transactionId, serviceResponse);
    
    // Check if all services have responded
    const transaction = await this.transactionRepo.getTransaction(transactionId);
    // console.log(transaction, 'before checking transaction all service completed')
    if (transaction) {
     
      const allResponded = this.checkAllServicesResponded(transaction);
      if (allResponded) {
        const hasFailures = transaction.serviceResponses.some(response => response.status === 'FAILED');
        if (hasFailures) {
          await this.handleSagaFailure(transaction);
        } else {
          console.log(' all transaction completed and no fails')
          await this.completeTransaction(transaction);
        }
      }
    }else{
      console.log('nop')
    }
  }

  private async handlePaymentSuccess(eventData: OrderEventData) {
    const transaction: TransactionState = {
      transactionId: eventData.transactionId,
      currentStep: 'STARTED',
      compensatingActions: [],
      data: eventData,
      status: 'IN_PROGRESS',
      serviceResponses: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    // console.log(transaction, "transaction to save.")
    const existing = await this.transactionRepo.isTransactionExists(transaction.transactionId);
    if(existing){
      console.log('existing')
      return;
    }
    await this.transactionRepo.saveTransaction(transaction);
    await this.executeSagaSteps(transaction);
  }

  private async executeSagaSteps(transaction: TransactionState) {
    const steps = [
      { service: 'admin-service', topic: 'admin.update' },
      { service: 'tutor-service', topic: 'tutor.update' },
      { service: 'user-service', topic: 'user.update' },
      { service: 'course-service', topic: 'course.update' },
      { service: 'order-service', topic: 'order.update' },
      { service: 'chat-service', topic: 'chat.update' },
    ];

    // Initialize service responses
    transaction.serviceResponses = steps.map(step => ({
      service: step.service,
      status: 'PENDING',
      error:'',
      timestamp: new Date()
    }));

    await this.transactionRepo.updateTransaction(transaction);

    // Send messages to all services
    for (const step of steps) {
      try {
        transaction.currentStep = step.service;
        await this.transactionRepo.updateTransaction(transaction);
        
        await this.kafkaConfig.sendMessage(step.topic, {
          ...transaction.data,
          sagaId: transaction.transactionId
        });
        // console.log('send to topic', step.topic);
        transaction.compensatingActions.push(step.service);
        await this.transactionRepo.updateTransaction(transaction);
        
        // Start timeout monitor for this service
        this.monitorServiceResponse(transaction.transactionId, step.service);
      } catch (error) {
        console.error(`Failed to send message to ${step.service}:`, error);
      }
    }
  }

  private async monitorServiceResponse(transactionId: string, service: string) {
    setTimeout(async () => {
      const transaction = await this.transactionRepo.getTransaction(transactionId);
      if (transaction) {
        const serviceResponse = transaction.serviceResponses.find(r => r.service === service);
        if (serviceResponse?.status === 'PENDING') {
          console.log('triggered this shit.')
          // Service didn't respond in time
          await this.transactionRepo.updateServiceResponse(transactionId, {
            service,
            status: 'FAILED',
            error: 'Service timeout',
            timestamp: new Date()
          });
          
          // Check if all services have now responded (including this timeout)
          const updatedTransaction = await this.transactionRepo.getTransaction(transactionId);
          // console.log(updatedTransaction, ' this is updated transaction.')

          if (updatedTransaction && this.checkAllServicesResponded(updatedTransaction)) {
            await this.handleSagaFailure(updatedTransaction);
          }
        }
      }
    }, this.responseTimeoutMs);
  }

  private checkAllServicesResponded(transaction: TransactionState): boolean {
    return transaction.serviceResponses.every(
      response => response.status === 'COMPLETED' || response.status === 'FAILED'
    );
  }

  private async completeTransaction(transaction: TransactionState) {
    transaction.status = 'COMPLETED';
    await this.transactionRepo.updateTransaction(transaction);
    
    await this.kafkaConfig.sendMessage('payment.saga.completed', {
      transactionId: transaction.transactionId,
      status: 'SUCCESS'
    }); 
    console.log('Message sent to topic payment.saga.completed SUCCESS')
  }

  private async handleSagaFailure(transaction: TransactionState) {
    transaction.status = 'FAILED';
    await this.transactionRepo.updateTransaction(transaction);

    // Get list of services that completed successfully and need rollback
    // console.log(transaction.serviceResponses, 'services response')
    const servicesToRollback = transaction.serviceResponses
      .filter(response => response.status === 'COMPLETED')
      .map(response => response.service);
      console.log('service to to rollback ',servicesToRollback)
    // Execute compensating transactions only for successful services
    for (const service of servicesToRollback) {
      
      try {
        await this.kafkaConfig.sendMessage(`${service}.rollback`, {
          transactionId: transaction.transactionId,
          data: transaction.data
        });
      } catch (compensatingError) {
        console.error(`Compensating action failed for ${service}:`, compensatingError);
      }
    }

    // Notify payment service of failure
    await this.kafkaConfig.sendMessage('payment.saga.completed', {
      transactionId: transaction.transactionId,
      status: 'FAILED'
    }); 
    console.log('sent to payment that failed')
  }
}