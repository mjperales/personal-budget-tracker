import { formatCurrency, formatDate } from '../lib/format';
import { Card } from './ui/Card';
import type { TransactionCardProps } from './TransactionCard.types';

export function TransactionCard({ transaction }: TransactionCardProps) {
  const isIncome = transaction.type === 'income';
  const amountColor = isIncome ? 'text-green-600' : 'text-red-600';
  const amountPrefix = isIncome ? '+' : '-';

  return (
    <Card className="p-4">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h4 className="font-medium text-sm mb-1">
            {transaction.description}
          </h4>
          <p className="text-xs text-muted-foreground">
            {formatDate(transaction.date)}
          </p>
        </div>
        <div className={`text-right font-semibold ${amountColor}`}>
          {amountPrefix}{formatCurrency(transaction.amount)}
        </div>
      </div>
      
      <div className="flex justify-between items-center text-xs">
        <div className="space-x-3">
          <span className="text-muted-foreground">
            {transaction.category}
          </span>
          <span className="capitalize text-muted-foreground">
            {transaction.type}
          </span>
        </div>
        <div className="text-muted-foreground">
          {/* Delete button placeholder */}
          Actions
        </div>
      </div>
    </Card>
  );
}
