import { TransactionCard } from './TransactionCard';
import type { TransactionCardListProps } from './TransactionCard.types';

export function TransactionCardList({ transactions, onDelete }: TransactionCardListProps) {
  return (
    <div className="space-y-3">
      {transactions.map((transaction) => (
        <TransactionCard 
          key={transaction.id}
          transaction={transaction}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
