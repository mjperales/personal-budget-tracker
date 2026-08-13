import type { Transaction } from '../lib/api';

export interface TransactionCardProps {
  transaction: Transaction;
  onDeleteClick: (transaction: Transaction) => void;
}

export interface TransactionCardListProps {
  transactions: Transaction[];
  onDeleteClick: (transaction: Transaction) => void;
}
