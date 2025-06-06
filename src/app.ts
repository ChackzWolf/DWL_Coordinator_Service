import express from 'express';
import { KafkaConfig } from './Configs/Kafka.config';
import { connectDB } from './Configs/Database';
import { SagaCoordinator } from './Services/Saga.coordinator';
import { MongoTransactionRepository } from './Repositories/Transaction.repository';
import { configs } from './Configs/ENV.configs';

async function startServer() {
  const app = express();
  app.use(express.json());
  app.get('/health', (req, res) => {
    res.status(200).json({ status: 'healthy' });
  });
  
  try {
    // Connect to MongoDB
    await connectDB();
    console.log('Connected to MongoDB');

    // Initialize Kafka and repositories
    const kafka = KafkaConfig.getInstance();
    const transactionRepo = new MongoTransactionRepository();

    // Initialize Saga Coordinator
    const sagaCoordinator = new SagaCoordinator(kafka, transactionRepo);

    // Health check endpoint
    app.get('/health', (req, res) => {
      res.status(200).json({ status: 'healthy' });
    });

    // Get transaction status endpoint
    app.get('/transaction/:transactionId', async (req, res) => {
      try {
        const transaction = await transactionRepo.getTransaction(req.params.transactionId);
        if (!transaction) {
          return res.status(404).json({ error: 'Transaction not found' });
        }
        res.json(transaction);
      } catch (error) {
        res.status(500).json({ error: 'Failed to fetch transaction' });
      }
    });

    // Start the server
    app.listen(configs.port, () => {
      console.log(`Server is running on port ${configs.port}`);
      console.log('Saga Coordinator Service started successfully');
    });

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}


startServer()