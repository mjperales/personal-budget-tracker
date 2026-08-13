import { useEffect, useState } from 'react';
import { fetchSpendingInsights, type SpendingInsights as SpendingInsightsData } from '../lib/api';
import { formatCurrency } from '../lib/format';
import { Card } from './ui/Card';
import type { SpendingInsightsProps } from './SpendingInsights.types';

type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export function SpendingInsights({ refreshKey = 0 }: SpendingInsightsProps) {
  const [state, setState] = useState<LoadingState>('loading');
  const [insights, setInsights] = useState<SpendingInsightsData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setState('loading');
    setError(null);

    fetchSpendingInsights()
      .then((data) => {
        setInsights(data);
        setState('success');
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Failed to load spending insights');
        setState('error');
      });
  }, [refreshKey]);

  if (state === 'loading') {
    return (
      <Card>
        <h2 className="text-xl font-semibold mb-4">Spending Insights</h2>
        <p className="text-muted-foreground">Loading insights...</p>
      </Card>
    );
  }

  if (state === 'error') {
    return (
      <Card>
        <h2 className="text-xl font-semibold mb-4">Spending Insights</h2>
        <div role="alert" className="text-destructive">
          <p className="font-medium">Unable to load spending insights</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      </Card>
    );
  }

  if (!insights || insights.totalExpenses === 0) {
    return (
      <Card>
        <h2 className="text-xl font-semibold mb-4">Spending Insights</h2>
        <div className="text-center py-6">
          <p className="text-muted-foreground mb-2">No spending insights yet.</p>
          <p className="text-sm text-muted-foreground">
            Add an expense transaction to see your spending breakdown.
          </p>
        </div>
      </Card>
    );
  }

  const { topCategory, categories } = insights;

  return (
    <Card>
      <h2 className="text-xl font-semibold mb-6">Spending Insights</h2>

      {/* Top Spending Category */}
      {topCategory && (
        <div className="mb-6 pb-6 border-b border-border">
          <p className="text-sm font-medium text-muted-foreground mb-2">
            Top spending category
          </p>
          <p className="text-2xl font-bold mb-1">{topCategory.category}</p>
          <p className="text-lg text-muted-foreground">
            {formatCurrency(topCategory.amount)} · {topCategory.percentage}% of expenses
          </p>
        </div>
      )}

      {/* Category Breakdown */}
      {categories.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-muted-foreground mb-3">
            Spending by category
          </h3>
          {categories.map((category) => (
            <div key={category.category} className="space-y-2">
              {/* Category name and amount */}
              <div className="flex justify-between items-baseline text-sm">
                <span className="font-medium">{category.category}</span>
                <span className="text-muted-foreground">
                  {formatCurrency(category.amount)} · {category.percentage}%
                </span>
              </div>
              
              {/* Visual bar (decorative) */}
              <div 
                className="h-2 bg-muted rounded-full overflow-hidden"
                aria-hidden="true"
              >
                <div
                  className="h-full bg-primary rounded-full transition-all duration-300"
                  style={{ width: `${category.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
