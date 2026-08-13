import { useEffect, useState } from 'react';
import { fetchTransactions, type Transaction } from '../lib/api';
import { Card } from './ui/Card';
import { TransactionTable } from './TransactionTable';
import { TransactionCardList } from './TransactionCardList';
import type { LoadingState } from './TransactionHistory.types';

export function TransactionHistory() {
  const [state, setState] = useState<LoadingState>('loading');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setState('loading');
    setError(null);

    fetchTransactions()
      .then((data) => {
        setTransactions(data);
        setState('success');
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Failed to load transactions');
        setState('error');
      });
  }, []);

  if (state === 'loading') {
    return (
      <Card role="status" aria-live="polite">
        <div className="flex items-center gap-2 text-muted-foreground">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <span>Loading transactions...</span>
        </div>
      </Card>
    );
  }

  if (state === 'error') {
    return (
      <Card className="border-destructive" role="alert">
        <h3 className="text-destructive font-semibold mb-2">Unable to Load Transactions</h3>
        <p className="text-sm text-muted-foreground">
          {error || 'An unexpected error occurred. Please try refreshing the page.'}
        </p>
      </Card>
    );
  }

  if (transactions.length === 0) {
    return (
      <Card>
        <div className="text-center py-8">
          <p className="text-muted-foreground mb-2">No transactions yet</p>
          <p className="text-sm text-muted-foreground">
            Add your first transaction to start tracking your budget.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <h3 className="text-lg font-semibold mb-4">Transaction History</h3>
      
      {/* Desktop table view */}
      <div className="hidden md:block">
        <TransactionTable transactions={transactions} />
      </div>

      {/* Mobile card view */}
      <div className="md:hidden">
        <TransactionCardList transactions={transactions} />
      </div>
    </Card>
  );
}
