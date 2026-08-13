export interface TransactionFiltersProps {
  type: string;
  category: string;
  search: string;
  categories: string[];
  onTypeChange: (type: string) => void;
  onCategoryChange: (category: string) => void;
  onSearchChange: (search: string) => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
}
