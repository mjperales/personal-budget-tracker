import type { Transaction } from '../models/transaction.js';
import { TransactionType } from '../models/transaction.js';

export interface CategorySpending {
  category: string;
  amount: number;
  percentage: number;
}

export interface SpendingInsights {
  totalExpenses: number;
  topCategory: CategorySpending | null;
  categories: CategorySpending[];
}

/**
 * Calculate spending insights from transactions.
 * Only expense transactions are included in the calculation.
 * 
 * @param transactions - All transactions to analyze
 * @returns Spending insights with category breakdown
 */
export function calculateSpendingInsights(transactions: Transaction[]): SpendingInsights {
  // Filter to only expenses
  const expenses = transactions.filter((t) => t.type === TransactionType.EXPENSE);

  // If no expenses, return empty result
  if (expenses.length === 0) {
    return {
      totalExpenses: 0,
      topCategory: null,
      categories: [],
    };
  }

  // Calculate total expenses
  const totalExpenses = expenses.reduce((sum, t) => sum + t.amount, 0);

  // Group by category and sum amounts
  const categoryTotals = new Map<string, number>();
  
  for (const expense of expenses) {
    const current = categoryTotals.get(expense.category) || 0;
    categoryTotals.set(expense.category, current + expense.amount);
  }

  // Convert to array with percentages
  const categories: CategorySpending[] = Array.from(categoryTotals.entries())
    .map(([category, amount]) => ({
      category,
      amount,
      // Round percentages to 1 decimal place for predictable display
      percentage: Math.round((amount / totalExpenses) * 1000) / 10,
    }))
    .sort((a, b) => b.amount - a.amount); // Sort highest to lowest

  // Top category is the first one (highest spending)
  const topCategory = categories.length > 0 ? categories[0] : null;

  return {
    totalExpenses,
    topCategory,
    categories,
  };
}
