// // src/interfaces/ProcessedMessage.interface.ts
// interface ProcessedMessage {
//     messageId: string;
//     topic: string;
//     transactionId: string;
//     processedAt: Date;
//     status: 'PROCESSED' | 'FAILED';
//   }
  
//   // src/repositories/ProcessedMessage.repository.ts
//   class ProcessedMessageRepository {
//     async isMessageProcessed(messageId: string): Promise<boolean> {
//       // Implement using your database of choice (MongoDB example):
//       const message = await ProcessedMessageModel.findOne({ messageId });
//       return !!message;
//     }
  
//     async markMessageAsProcessed(message: ProcessedMessage): Promise<void> {
//       await ProcessedMessageModel.create(message);
//     }
//   }