import { Router } from 'express';
import { success } from '../lib/responses.js';
import { transactionStore } from '../stores/transaction-store.js';
import { calculateSpendingInsights } from '../lib/spending-insights.js';

export const insightsRouter = Router();

// GET /api/v1/insights/spending-by-category
insightsRouter.get('/spending-by-category', (_req, res) => {
  const transactions = transactionStore.getAll();
  const insights = calculateSpendingInsights(transactions);
  
  success(res, insights);
});
