import { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { fetchSummary, type Summary } from '../lib/api';
import { formatCurrency } from '../lib/format';
import { Card } from './ui/Card';

type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export function SummaryPanel() {
  const [state, setState] = useState<LoadingState>('loading');
  const [summary, setSummary] = useState<Summary | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setState('loading');
    setError(null);

    fetchSummary()
      .then((data) => {
        setSummary(data);
        setState('success');
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Failed to load summary');
        setState('error');
      });
  }, []);

  if (state === 'loading') {
    return (
      <Card role="status" aria-live="polite">
        <div className="flex items-center gap-2 text-muted-foreground">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <span>Loading financial summary...</span>
        </div>
      </Card>
    );
  }

  if (state === 'error') {
    return (
      <Card className="border-destructive" role="alert">
        <h3 className="text-destructive font-semibold mb-2">Unable to Load Summary</h3>
        <p className="text-sm text-muted-foreground">
          {error || 'An unexpected error occurred. Please try refreshing the page.'}
        </p>
      </Card>
    );
  }

  if (!summary) {
    return null;
  }

  const isPositiveBalance = summary.balance >= 0;
  const balanceColor = isPositiveBalance ? 'text-green-600' : 'text-red-600';
  const balanceLabel = isPositiveBalance ? 'Positive balance' : 'Negative balance';
  const BalanceIcon = isPositiveBalance ? TrendingUp : TrendingDown;

  return (
    <Card>
      <h3 className="text-lg font-semibold mb-6">Financial Summary</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Income */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">Total Income</p>
          <p className="text-2xl font-bold text-green-600" aria-label={`Total income: ${formatCurrency(summary.income)}`}>
            {formatCurrency(summary.income)}
          </p>
        </div>

        {/* Expenses */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">Total Expenses</p>
          <p className="text-2xl font-bold text-red-600" aria-label={`Total expenses: ${formatCurrency(summary.expenses)}`}>
            {formatCurrency(summary.expenses)}
          </p>
        </div>

        {/* Balance */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">Current Balance</p>
          <div className="flex items-center gap-2">
            <BalanceIcon className={`h-6 w-6 ${balanceColor}`} aria-hidden="true" />
            <p 
              className={`text-2xl font-bold ${balanceColor}`}
              aria-label={`${balanceLabel}: ${formatCurrency(summary.balance)}`}
            >
              {formatCurrency(summary.balance)}
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}
