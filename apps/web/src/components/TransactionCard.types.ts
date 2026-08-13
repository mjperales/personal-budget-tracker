import type { Transaction } from '../lib/api';

export interface TransactionCardProps {
  transaction: Transaction;
  onDelete?: (id: string) => void;
}

export interface TransactionCardListProps {
  transactions: Transaction[];
  onDelete?: (id: string) => void;
}
