import { TransactionCard } from './TransactionCard';
import type { TransactionCardListProps } from './TransactionCard.types';

export function TransactionCardList({ transactions, onDeleteClick }: TransactionCardListProps) {
  return (
    <div className="space-y-3">
      {transactions.map((transaction) => (
        <TransactionCard 
          key={transaction.id}
          transaction={transaction}
          onDeleteClick={onDeleteClick}
        />
      ))}
    </div>
  );
}
