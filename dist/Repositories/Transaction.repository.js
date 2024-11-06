"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionRepository = void 0;
class TransactionRepository {
    constructor() {
        this.transactions = new Map();
    }
    async save(state) {
        this.transactions.set(state.transactionId, state);
    }
    async findById(transactionId) {
        return this.transactions.get(transactionId);
    }
    async update(state) {
        this.transactions.set(state.transactionId, state);
    }
    async delete(transactionId) {
        this.transactions.delete(transactionId);
    }
}
exports.TransactionRepository = TransactionRepository;
