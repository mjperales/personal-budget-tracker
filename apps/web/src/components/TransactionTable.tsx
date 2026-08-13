import { Trash2 } from 'lucide-react';
import { formatCurrency, formatDate } from '../lib/format';
import type { TransactionTableProps } from './TransactionTable.types';

export function TransactionTable({ transactions, onDeleteClick }: TransactionTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left py-3 px-4 font-semibold text-sm text-muted-foreground">
              Date
            </th>
            <th className="text-left py-3 px-4 font-semibold text-sm text-muted-foreground">
              Description
            </th>
            <th className="text-left py-3 px-4 font-semibold text-sm text-muted-foreground">
              Category
            </th>
            <th className="text-left py-3 px-4 font-semibold text-sm text-muted-foreground">
              Type
            </th>
            <th className="text-right py-3 px-4 font-semibold text-sm text-muted-foreground">
              Amount
            </th>
            <th className="text-right py-3 px-4 font-semibold text-sm text-muted-foreground">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((transaction) => {
            const isIncome = transaction.type === 'income';
            const amountColor = isIncome ? 'text-green-600' : 'text-red-600';
            const amountPrefix = isIncome ? '+' : '-';

            return (
              <tr 
                key={transaction.id}
                className="border-b border-border last:border-0 hover:bg-muted/50"
              >
                <td className="py-3 px-4 text-sm">
                  {formatDate(transaction.date)}
                </td>
                <td className="py-3 px-4 text-sm font-medium">
                  {transaction.description}
                </td>
                <td className="py-3 px-4 text-sm text-muted-foreground">
                  {transaction.category}
                </td>
                <td className="py-3 px-4 text-sm">
                  <span className="capitalize">{transaction.type}</span>
                </td>
                <td className={`py-3 px-4 text-sm font-semibold text-right ${amountColor}`}>
                  {amountPrefix}{formatCurrency(transaction.amount)}
                </td>
                <td className="py-3 px-4 text-sm text-right">
                  <button
                    onClick={() => onDeleteClick(transaction)}
                    className="inline-flex items-center gap-1 text-destructive hover:text-destructive/80 focus:outline-none focus:ring-2 focus:ring-ring rounded px-2 py-1"
                    aria-label={`Delete ${transaction.description} transaction`}
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                    <span className="text-xs">Delete</span>
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
