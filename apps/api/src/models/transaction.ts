import { z } from 'zod';

export const TransactionType = {
  INCOME: 'income',
  EXPENSE: 'expense',
} as const;

export const TransactionSchema = z.object({
  id: z.string().uuid(),
  date: z.string().date(),
  description: z.string().min(1, 'Description is required'),
  amount: z.number().positive('Amount must be greater than 0'),
  type: z.enum([TransactionType.INCOME, TransactionType.EXPENSE]),
  category: z.string().min(1, 'Category is required'),
});

export const CreateTransactionSchema = TransactionSchema.omit({ id: true });

export type Transaction = z.infer<typeof TransactionSchema>;
export type CreateTransactionInput = z.infer<typeof CreateTransactionSchema>;
