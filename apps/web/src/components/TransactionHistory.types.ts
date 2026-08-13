import type { Transaction } from '../lib/api';

export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export interface TransactionHistoryProps {
  refreshKey?: number;
  onDeleteClick: (transaction: Transaction) => void;
}

export interface TransactionDisplayProps {
  transactions: Transaction[];
  onDeleteClick: (transaction: Transaction) => void;
}
