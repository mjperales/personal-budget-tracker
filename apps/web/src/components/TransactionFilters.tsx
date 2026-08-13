import { useEffect, useRef } from 'react';
import type { TransactionFiltersProps } from './TransactionFilters.types';

export function TransactionFilters({
  type,
  category,
  search,
  categories,
  onTypeChange,
  onCategoryChange,
  onSearchChange,
  onClearFilters,
  hasActiveFilters,
}: TransactionFiltersProps) {
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const handleSearchInput = (value: string) => {
    // Clear existing timeout
    if (searchTimeoutRef.current !== undefined) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Debounce search by 300ms
    searchTimeoutRef.current = setTimeout(() => {
      onSearchChange(value);
    }, 300);
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current !== undefined) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="mb-6 space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Type Filter */}
        <div>
          <label htmlFor="filter-type" className="block text-sm font-medium mb-1">
            Type
          </label>
          <select
            id="filter-type"
            value={type}
            onChange={(e) => onTypeChange(e.target.value)}
            className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">All Transactions</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
        </div>

        {/* Category Filter */}
        <div>
          <label htmlFor="filter-category" className="block text-sm font-medium mb-1">
            Category
          </label>
          <select
            id="filter-category"
            value={category}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
            disabled={categories.length === 0}
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Search Filter */}
        <div>
          <label htmlFor="filter-search" className="block text-sm font-medium mb-1">
            Search
          </label>
          <input
            type="search"
            id="filter-search"
            defaultValue={search}
            onChange={(e) => handleSearchInput(e.target.value)}
            placeholder="Search descriptions..."
            className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </div>

      {/* Clear Filters Button */}
      {hasActiveFilters && (
        <div>
          <button
            onClick={onClearFilters}
            className="text-sm text-primary hover:text-primary/80 underline focus:outline-none focus:ring-2 focus:ring-ring rounded px-1"
          >
            Clear all filters
          </button>
        </div>
      )}
    </div>
  );
}
