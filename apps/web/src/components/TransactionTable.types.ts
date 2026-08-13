import type { Transaction } from '../lib/api';

export interface TransactionTableProps {
  transactions: Transaction[];
  onDeleteClick: (transaction: Transaction) => void;
}
