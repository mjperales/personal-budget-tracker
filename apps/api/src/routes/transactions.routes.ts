import { Router } from 'express';
import { success } from '../lib/responses.js';
import { transactionStore } from '../stores/transaction-store.js';

export const transactionsRouter = Router();

transactionsRouter.get('/', (_req, res) => {
  const transactions = transactionStore.getAll();
  success(res, transactions);
});
