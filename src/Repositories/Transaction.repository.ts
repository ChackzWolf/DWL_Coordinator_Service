import { TransactionModel } from "../Models/Transaction";
import { ServiceResponse, TransactionState } from "../Types/types";

// src/repositories/TransactionRepository.ts
export interface ITransactionRepository {
  saveTransaction(transaction: TransactionState): Promise<void>;
  getTransaction(transactionId: string): Promise<TransactionState | null>;
  updateTransaction(transaction: TransactionState): Promise<void>;
  updateServiceResponse(transactionId: string, serviceResponse: ServiceResponse): Promise<void>;
}

export class MongoTransactionRepository implements ITransactionRepository {
  async saveTransaction(transaction: TransactionState): Promise<void> {
    await TransactionModel.findOneAndUpdate(
      { transactionId: transaction.transactionId }, // filter
      transaction, // update
      { upsert: true, new: true } // options
    );
  }

  async getTransaction(transactionId: string): Promise<TransactionState | null> {
    return await TransactionModel.findOne({ transactionId });
  }

  async updateTransaction(transaction: TransactionState): Promise<void> {
    await TransactionModel.findOneAndUpdate(
      { transactionId: transaction.transactionId },
      transaction,
      { new: true }
    );
  }

  async updateServiceResponse(transactionId: string, serviceResponse: ServiceResponse): Promise<void> {
    console.log('saving response', serviceResponse)
    const response = await TransactionModel.findOneAndUpdate(
      { 
        transactionId,
        'serviceResponses.service': serviceResponse.service 
      },
      { 
        $set: { 
          'serviceResponses.$': serviceResponse 
        }
      },
      { new: true }
    );
    console.log(response, 'updateResponse')
  }
}