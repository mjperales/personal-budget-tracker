import { Router } from 'express';
import { success } from '../lib/responses.js';
import { transactionStore } from '../stores/transaction-store.js';
import { TransactionType } from '../models/transaction.js';

export const summaryRouter = Router();

summaryRouter.get('/', (_req, res) => {
  const transactions = transactionStore.getAll();
  
  const income = transactions
    .filter((t) => t.type === TransactionType.INCOME)
    .reduce((sum, t) => sum + t.amount, 0);
  
  const expenses = transactions
    .filter((t) => t.type === TransactionType.EXPENSE)
    .reduce((sum, t) => sum + t.amount, 0);
  
  const balance = income - expenses;

  success(res, {
    income,
    expenses,
    balance,
  });
});
