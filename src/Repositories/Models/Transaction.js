"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionModel = void 0;
// src/models/Transaction.ts
const mongoose_1 = __importStar(require("mongoose"));
const serviceResponseSchema = new mongoose_1.Schema({
    service: String,
    status: {
        type: String,
        enum: ['PENDING', 'COMPLETED', 'FAILED'],
        default: 'PENDING'
    },
    error: String,
    timestamp: Date
});
const transactionSchema = new mongoose_1.Schema({
    transactionId: { type: String, required: true, unique: true },
    currentStep: String,
    compensatingActions: [String],
    data: mongoose_1.Schema.Types.Mixed,
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
exports.TransactionModel = mongoose_1.default.model('Transaction', transactionSchema);
