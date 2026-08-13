import { transactionStore } from '../stores/transaction-store.js';
import { CreateTransactionSchema } from '../models/transaction.js';
import mockTransactions from './mock-transactions.json' with { type: 'json' };

/**
 * Seeds the transaction store with mock data from mock-transactions.json
 * Validates each transaction before adding to ensure data integrity
 */
export function seedMockData(): void {
  console.log('Seeding transaction store with mock data...');
  
  let seededCount = 0;
  let skippedCount = 0;

  for (const transaction of mockTransactions) {
    const result = CreateTransactionSchema.safeParse(transaction);
    
    if (result.success) {
      transactionStore.create(result.data);
      seededCount++;
    } else {
      console.warn(`Skipped invalid transaction: ${transaction.description}`, result.error.format());
      skippedCount++;
    }
  }

  console.log(`✓ Seeded ${seededCount} transactions`);
  if (skippedCount > 0) {
    console.warn(`⚠ Skipped ${skippedCount} invalid transactions`);
  }
}

/**
 * Clears all data from the transaction store
 */
export function clearMockData(): void {
  transactionStore.reset();
  console.log('✓ Cleared all transactions');
}
