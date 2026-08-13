import { Router } from 'express';
import { z } from 'zod';
import { success, created, noContent } from '../lib/responses.js';
import { transactionStore } from '../stores/transaction-store.js';
import type { TransactionFilters } from '../stores/transaction-store.js';
import { CreateTransactionSchema } from '../models/transaction.js';
import { Errors } from '../lib/errors.js';

export const transactionsRouter = Router();

const TransactionQuerySchema = z.object({
  type: z.enum(['income', 'expense']).optional(),
  category: z.string().optional(),
  search: z.string().optional(),
}).strict();

transactionsRouter.get('/', (req, res) => {
  const result = TransactionQuerySchema.safeParse(req.query);
  
  if (!result.success) {
    throw Errors.validation(result.error.format());
  }

  const filters: TransactionFilters = {};

  if (result.data.type) {
    filters.type = result.data.type;
  }

  if (result.data.category) {
    filters.category = result.data.category;
  }

  if (result.data.search) {
    filters.search = result.data.search;
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
