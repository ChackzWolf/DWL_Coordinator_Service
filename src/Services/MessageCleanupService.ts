// class MessageCleanupService {
//     constructor(private readonly messageRepo: ProcessedMessageRepository) {}
  
//     async cleanupOldMessages(daysToKeep: number = 7): Promise<void> {
//       const cutoffDate = new Date();
//       cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
  
//       await ProcessedMessageModel.deleteMany({
//         processedAt: { $lt: cutoffDate }
//       });
//     }
  
//     startCleanupSchedule(): void {
//       // Run cleanup daily
//       setInterval(() => {
//         this.cleanupOldMessages().catch(console.error);
//       }, 24 * 60 * 60 * 1000);
//     }
//   }