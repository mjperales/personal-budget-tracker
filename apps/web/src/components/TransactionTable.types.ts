import type { Transaction } from '../lib/api';

export interface TransactionTableProps {
  transactions: Transaction[];
  onDelete?: (id: string) => void;
}
