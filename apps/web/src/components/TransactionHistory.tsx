import { useEffect, useState, useMemo } from 'react';
import { fetchTransactions, type Transaction, type TransactionFilters as ApiFilters } from '../lib/api';
import { Card } from './ui/Card';
import { TransactionTable } from './TransactionTable';
import { TransactionCardList } from './TransactionCardList';
import { TransactionFilters } from './TransactionFilters';
import type { LoadingState, TransactionHistoryProps } from './TransactionHistory.types';

export function TransactionHistory({ refreshKey = 0, onDeleteClick }: TransactionHistoryProps) {
  const [state, setState] = useState<LoadingState>('loading');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  // Filter state
  const [filterType, setFilterType] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterSearch, setFilterSearch] = useState('');

  // Derive categories from all transactions
  const categories = useMemo(() => {
    const uniqueCategories = [...new Set(allTransactions.map(t => t.category))];
    return uniqueCategories.sort();
  }, [allTransactions]);

  // Check if any filters are active
  const hasActiveFilters = filterType !== '' || filterCategory !== '' || filterSearch !== '';

  // Fetch transactions with current filters
  useEffect(() => {
    setState('loading');
    setError(null);

    const filters: ApiFilters = {};
    if (filterType) filters.type = filterType as 'income' | 'expense';
    if (filterCategory) filters.category = filterCategory;
    if (filterSearch) filters.search = filterSearch;

    fetchTransactions(filters)
      .then((data) => {
        setTransactions(data);
        setState('success');
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Failed to load transactions');
        setState('error');
      });
  }, [refreshKey, filterType, filterCategory, filterSearch]);

  // Fetch all transactions once to derive categories
  useEffect(() => {
    fetchTransactions()
      .then((data) => {
        setAllTransactions(data);
      })
      .catch(() => {
        // Silently fail - categories will just be empty
      });
  }, [refreshKey]);

  const handleClearFilters = () => {
    setFilterType('');
    setFilterCategory('');
    setFilterSearch('');
  };

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

  // Differentiate between no transactions and no filtered results
  if (transactions.length === 0 && state === 'success') {
    if (allTransactions.length === 0) {
      // No transactions exist at all
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
    } else if (hasActiveFilters) {
      // Transactions exist but no matches for current filters
      return (
        <Card>
          <h3 className="text-lg font-semibold mb-4">Transaction History</h3>
          
          <TransactionFilters
            type={filterType}
            category={filterCategory}
            search={filterSearch}
            categories={categories}
            onTypeChange={setFilterType}
            onCategoryChange={setFilterCategory}
            onSearchChange={setFilterSearch}
            onClearFilters={handleClearFilters}
            hasActiveFilters={hasActiveFilters}
          />

          <div className="text-center py-8">
            <p className="text-muted-foreground mb-2">No transactions match your filters</p>
            <p className="text-sm text-muted-foreground mb-4">
              Try adjusting your filter criteria or search term.
            </p>
            <button
              onClick={handleClearFilters}
              className="text-sm text-primary hover:text-primary/80 underline focus:outline-none focus:ring-2 focus:ring-ring rounded px-2 py-1"
            >
              Clear all filters
            </button>
          </div>
        </Card>
      );
    }
  }

  return (
    <Card>
      <h3 className="text-lg font-semibold mb-4">Transaction History</h3>
      
      <TransactionFilters
        type={filterType}
        category={filterCategory}
        search={filterSearch}
        categories={categories}
        onTypeChange={setFilterType}
        onCategoryChange={setFilterCategory}
        onSearchChange={setFilterSearch}
        onClearFilters={handleClearFilters}
        hasActiveFilters={hasActiveFilters}
      />

      {/* Desktop table view */}
      <div className="hidden md:block">
        <TransactionTable transactions={transactions} onDeleteClick={onDeleteClick} />
      </div>

      {/* Mobile card view */}
      <div className="md:hidden">
        <TransactionCardList transactions={transactions} onDeleteClick={onDeleteClick} />
      </div>
    </Card>
  );
}
