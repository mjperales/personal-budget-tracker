import { Router } from 'express';
import { success, created, noContent } from '../lib/responses.js';
import { transactionStore } from '../stores/transaction-store.js';
import type { TransactionFilters } from '../stores/transaction-store.js';
import { CreateTransactionSchema } from '../models/transaction.js';
import { Errors } from '../lib/errors.js';

export const transactionsRouter = Router();

transactionsRouter.get('/', (req, res) => {
  const filters: TransactionFilters = {};

  if (req.query.type) {
    filters.type = req.query.type as 'income' | 'expense';
  }

  if (req.query.category) {
    filters.category = req.query.category as string;
  }

  if (req.query.search) {
    filters.search = req.query.search as string;
  }

  const transactions = transactionStore.getAll(filters);
  success(res, transactions);
});

transactionsRouter.post('/', (req, res) => {
  const result = CreateTransactionSchema.safeParse(req.body);
  
  if (!result.success) {
    throw Errors.validation(result.error.format());
  }

  const transaction = transactionStore.create(result.data);
  created(res, transaction);
});

transactionsRouter.put('/:id', (req, res) => {
  const result = CreateTransactionSchema.safeParse(req.body);
  
  if (!result.success) {
    throw Errors.validation(result.error.format());
  }

  const transaction = transactionStore.update(req.params.id, result.data);
  
  if (!transaction) {
    throw Errors.notFound('Transaction');
  }

  success(res, transaction);
});

transactionsRouter.delete('/:id', (req, res) => {
  const deleted = transactionStore.delete(req.params.id);
  
  if (!deleted) {
    throw Errors.notFound('Transaction');
  }

  noContent(res);
});
