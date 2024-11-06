// src/types/types.ts
export interface OrderEventData {
  userId: string;
  courseId: string;
  tutorId: string;
  thumbnail: string;
  title: string;
  price: string;
  adminShare: string;
  tutorShare: string;
  transactionId: string;
  paymentStatus: boolean;
  timestamp: Date;
  status: string;
}

export interface ServiceResponse {
  service: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  error?: string;
  timestamp: Date;
}

export interface TransactionState {
  _id?: string;
  transactionId: string;
  currentStep: string;
  compensatingActions: string[];
  data: OrderEventData;
  status: 'IN_PROGRESS'| 'COMPLETED' | 'FAILED';
  error?: string;
  serviceResponses: ServiceResponse[];
  createdAt: Date;
  updatedAt: Date;
}