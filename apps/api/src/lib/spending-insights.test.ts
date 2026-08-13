import { describe, it, expect } from 'vitest';
import { calculateSpendingInsights } from './spending-insights.js';
import { TransactionType } from '../models/transaction.js';
import type { Transaction } from '../models/transaction.js';

describe('calculateSpendingInsights', () => {
  it('returns zero totals when there are no transactions', () => {
    const result = calculateSpendingInsights([]);

    expect(result.totalExpenses).toBe(0);
    expect(result.topCategory).toBeNull();
    expect(result.categories).toEqual([]);
  });

  it('returns zero totals when there are only income transactions', () => {
    const transactions: Transaction[] = [
      {
        id: '1',
        date: '2026-08-01',
        description: 'Salary',
        amount: 5000,
        type: TransactionType.INCOME,
        category: 'Employment',
      },
      {
        id: '2',
        date: '2026-08-02',
        description: 'Freelance',
        amount: 500,
        type: TransactionType.INCOME,
        category: 'Freelance',
      },
    ];

    const result = calculateSpendingInsights(transactions);

    expect(result.totalExpenses).toBe(0);
    expect(result.topCategory).toBeNull();
    expect(result.categories).toEqual([]);
  });

  it('calculates correctly for one expense category', () => {
    const transactions: Transaction[] = [
      {
        id: '1',
        date: '2026-08-01',
        description: 'Groceries',
        amount: 100,
        type: TransactionType.EXPENSE,
        category: 'Food',
      },
    ];

    const result = calculateSpendingInsights(transactions);

    expect(result.totalExpenses).toBe(100);
    expect(result.topCategory).toEqual({
      category: 'Food',
      amount: 100,
      percentage: 100,
    });
    expect(result.categories).toEqual([
      {
        category: 'Food',
        amount: 100,
        percentage: 100,
      },
    ]);
  });

  it('calculates correctly for multiple expense categories', () => {
    const transactions: Transaction[] = [
      {
        id: '1',
        date: '2026-08-01',
        description: 'Groceries',
        amount: 500,
        type: TransactionType.EXPENSE,
        category: 'Food',
      },
      {
        id: '2',
        date: '2026-08-02',
        description: 'Electric bill',
        amount: 300,
        type: TransactionType.EXPENSE,
        category: 'Utilities',
      },
      {
        id: '3',
        date: '2026-08-03',
        description: 'Gas',
        amount: 200,
        type: TransactionType.EXPENSE,
        category: 'Transportation',
      },
    ];

    const result = calculateSpendingInsights(transactions);

    expect(result.totalExpenses).toBe(1000);
    expect(result.topCategory).toEqual({
      category: 'Food',
      amount: 500,
      percentage: 50,
    });
    expect(result.categories).toHaveLength(3);
  });

  it('sums multiple transactions in the same category', () => {
    const transactions: Transaction[] = [
      {
        id: '1',
        date: '2026-08-01',
        description: 'Groceries',
        amount: 100,
        type: TransactionType.EXPENSE,
        category: 'Food',
      },
      {
        id: '2',
        date: '2026-08-05',
        description: 'Restaurant',
        amount: 50,
        type: TransactionType.EXPENSE,
        category: 'Food',
      },
      {
        id: '3',
        date: '2026-08-10',
        description: 'Coffee',
        amount: 25,
        type: TransactionType.EXPENSE,
        category: 'Food',
      },
    ];

    const result = calculateSpendingInsights(transactions);

    expect(result.totalExpenses).toBe(175);
    expect(result.topCategory).toEqual({
      category: 'Food',
      amount: 175,
      percentage: 100,
    });
    expect(result.categories).toEqual([
      {
        category: 'Food',
        amount: 175,
        percentage: 100,
      },
    ]);
  });

  it('sorts categories from highest to lowest spending', () => {
    const transactions: Transaction[] = [
      {
        id: '1',
        date: '2026-08-01',
        description: 'Movie',
        amount: 50,
        type: TransactionType.EXPENSE,
        category: 'Entertainment',
      },
      {
        id: '2',
        date: '2026-08-02',
        description: 'Groceries',
        amount: 200,
        type: TransactionType.EXPENSE,
        category: 'Food',
      },
      {
        id: '3',
        date: '2026-08-03',
        description: 'Electric',
        amount: 150,
        type: TransactionType.EXPENSE,
        category: 'Utilities',
      },
    ];

    const result = calculateSpendingInsights(transactions);

    expect(result.categories[0].category).toBe('Food');
    expect(result.categories[0].amount).toBe(200);
    expect(result.categories[1].category).toBe('Utilities');
    expect(result.categories[1].amount).toBe(150);
    expect(result.categories[2].category).toBe('Entertainment');
    expect(result.categories[2].amount).toBe(50);
  });

  it('calculates correct percentages', () => {
    const transactions: Transaction[] = [
      {
        id: '1',
        date: '2026-08-01',
        description: 'Groceries',
        amount: 500,
        type: TransactionType.EXPENSE,
        category: 'Food',
      },
      {
        id: '2',
        date: '2026-08-02',
        description: 'Electric',
        amount: 300,
        type: TransactionType.EXPENSE,
        category: 'Utilities',
      },
      {
        id: '3',
        date: '2026-08-03',
        description: 'Gas',
        amount: 200,
        type: TransactionType.EXPENSE,
        category: 'Transportation',
      },
    ];

    const result = calculateSpendingInsights(transactions);

    expect(result.totalExpenses).toBe(1000);
    
    // Food: 500/1000 = 50%
    expect(result.categories.find(c => c.category === 'Food')?.percentage).toBe(50);
    
    // Utilities: 300/1000 = 30%
    expect(result.categories.find(c => c.category === 'Utilities')?.percentage).toBe(30);
    
    // Transportation: 200/1000 = 20%
    expect(result.categories.find(c => c.category === 'Transportation')?.percentage).toBe(20);
  });

  it('rounds percentages to 1 decimal place', () => {
    const transactions: Transaction[] = [
      {
        id: '1',
        date: '2026-08-01',
        description: 'Item 1',
        amount: 33.33,
        type: TransactionType.EXPENSE,
        category: 'Category A',
      },
      {
        id: '2',
        date: '2026-08-02',
        description: 'Item 2',
        amount: 66.67,
        type: TransactionType.EXPENSE,
        category: 'Category B',
      },
    ];

    const result = calculateSpendingInsights(transactions);

    // 33.33/100 = 33.33% (rounded to 33.3%)
    expect(result.categories.find(c => c.category === 'Category A')?.percentage).toBe(33.3);
    
    // 66.67/100 = 66.67% (rounded to 66.7%)
    expect(result.categories.find(c => c.category === 'Category B')?.percentage).toBe(66.7);
  });

  it('ignores income transactions in calculations', () => {
    const transactions: Transaction[] = [
      {
        id: '1',
        date: '2026-08-01',
        description: 'Salary',
        amount: 5000,
        type: TransactionType.INCOME,
        category: 'Employment',
      },
      {
        id: '2',
        date: '2026-08-02',
        description: 'Groceries',
        amount: 100,
        type: TransactionType.EXPENSE,
        category: 'Food',
      },
    ];

    const result = calculateSpendingInsights(transactions);

    // Only the expense should count
    expect(result.totalExpenses).toBe(100);
    expect(result.categories).toHaveLength(1);
    expect(result.categories[0].category).toBe('Food');
  });

  it('identifies the top spending category correctly', () => {
    const transactions: Transaction[] = [
      {
        id: '1',
        date: '2026-08-01',
        description: 'Groceries',
        amount: 482.37,
        type: TransactionType.EXPENSE,
        category: 'Food',
      },
      {
        id: '2',
        date: '2026-08-02',
        description: 'Electric',
        amount: 310,
        type: TransactionType.EXPENSE,
        category: 'Utilities',
      },
      {
        id: '3',
        date: '2026-08-03',
        description: 'Gas',
        amount: 184.25,
        type: TransactionType.EXPENSE,
        category: 'Transportation',
      },
      {
        id: '4',
        date: '2026-08-04',
        description: 'Movie',
        amount: 96.50,
        type: TransactionType.EXPENSE,
        category: 'Entertainment',
      },
    ];

    const result = calculateSpendingInsights(transactions);

    expect(result.topCategory?.category).toBe('Food');
    expect(result.topCategory?.amount).toBe(482.37);
    // Food is 482.37 out of 1073.12 = ~44.9% (rounded to 45%)
    expect(result.topCategory?.percentage).toBe(45);
  });
});
