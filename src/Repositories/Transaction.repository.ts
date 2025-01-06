import { TransactionModel } from "./Models/Transaction";
import { ServiceResponse, TransactionState } from "../Types/types";

// src/repositories/TransactionRepository.ts
export interface ITransactionRepository {
  isTransactionExists(transaction: string):Promise<boolean>
  saveTransaction(transaction: TransactionState): Promise<void>; 
  getTransaction(transactionId: string): Promise<TransactionState | null>;
  updateTransaction(transaction: TransactionState): Promise<void>;
  updateServiceResponse(transactionId: string, serviceResponse: ServiceResponse): Promise<void>;
}

export class MongoTransactionRepository implements ITransactionRepository {

  async isTransactionExists(transactionId: string):Promise<boolean>{
    const existingTransaction = await TransactionModel.findOne({
      transactionId: transactionId,
    });
    if(!existingTransaction){
      console.log('transaction doed not exists.');
      return false
    }
    console.log('Transaction already exists', existingTransaction);
    return true 
  }


  async saveTransaction(transaction: TransactionState): Promise<void> {
    // Find the existing transaction by transactionId
    const existingTransaction = await TransactionModel.findOne({
      transactionId: transaction.transactionId,
    });

    if (existingTransaction) {
      console.log('already saved')
      // Check the status of the existing transaction
      if (existingTransaction.status === 'COMPLETED' || existingTransaction.status === 'IN_PROGRESS') {
        console.log('status',existingTransaction.status);
        // If status is COMPLETED or PENDING, log and do nothing
        console.log(`Transaction ID ${transaction.transactionId} already exists with status: ${existingTransaction.status}`);
        return;
      }

      if (existingTransaction.status === 'FAILED') {
        // If status is FAILED, proceed to save (update) the transaction
        console.log(`Transaction ID ${transaction.transactionId} is FAILED. Overwriting with new data.`);
      }
    }

    // Save the transaction (either as new or update existing FAILED one)
    await TransactionModel.findOneAndUpdate(
      { transactionId: transaction.transactionId }, // filter by transactionId
      transaction, // new transaction data
      { upsert: true, new: true } // upsert option ensures creation if not found
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