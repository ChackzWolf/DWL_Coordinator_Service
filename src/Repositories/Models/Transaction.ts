// src/models/Transaction.ts
import mongoose, { Schema } from 'mongoose';

const serviceResponseSchema = new Schema({
  service: String,
  status: {
    type: String,
    enum: ['PENDING', 'COMPLETED', 'FAILED'],
    default: 'PENDING'
  },
  error: String,
  timestamp: Date
});

const transactionSchema = new Schema({
  transactionId: { type: String, required: true, unique: true },
  currentStep: String,
  compensatingActions: [String],
  data: Schema.Types.Mixed,
  status: {
    type: String,
    enum: ['IN_PROGRESS', 'COMPLETED', 'FAILED'],
    default: 'IN_PROGRESS'
  },
  error: String,
  serviceResponses: [serviceResponseSchema]
}, {
  timestamps: true
});

export const TransactionModel = mongoose.model('Transaction', transactionSchema);
