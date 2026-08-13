import { v4 as uuidv4 } from 'uuid';
import type { Transaction, CreateTransactionInput } from '../models/transaction.js';

class TransactionStore {
  private transactions: Transaction[] = [];

  getAll(): Transaction[] {
    return [...this.transactions];
  }

  create(input: CreateTransactionInput): Transaction {
    const transaction: Transaction = {
      id: uuidv4(),
      ...input,
    };

    this.transactions.push(transaction);
    return transaction;
  }

  findById(id: string): Transaction | undefined {
    return this.transactions.find((t) => t.id === id);
  }

  update(id: string, input: CreateTransactionInput): Transaction | null {
    const index = this.transactions.findIndex((t) => t.id === id);
    
    if (index === -1) {
      return null;
    }

    const updated: Transaction = {
      id,
      ...input,
    };

    this.transactions[index] = updated;
    return updated;
  }

  delete(id: string): boolean {
    const index = this.transactions.findIndex((t) => t.id === id);
    
    if (index === -1) {
      return false;
    }

    this.transactions.splice(index, 1);
    return true;
  }

  reset(): void {
    this.transactions = [];
  }
}

export const transactionStore = new TransactionStore();
