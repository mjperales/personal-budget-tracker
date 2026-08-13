import type { Transaction } from '../lib/api';

export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export interface TransactionDisplayProps {
  transactions: Transaction[];
  onDelete?: (id: string) => void;
}
