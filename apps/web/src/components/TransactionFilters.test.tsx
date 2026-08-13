import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { TransactionFilters } from './TransactionFilters';

describe('TransactionFilters', () => {
  const mockCategories = ['Food', 'Housing', 'Transportation', 'Utilities'];
  const defaultProps = {
    type: '',
    category: '',
    search: '',
    categories: mockCategories,
    onTypeChange: vi.fn(),
    onCategoryChange: vi.fn(),
    onSearchChange: vi.fn(),
    onClearFilters: vi.fn(),
    hasActiveFilters: false,
  };

  it('renders all filter controls with accessible labels', () => {
    render(<TransactionFilters {...defaultProps} />);

    expect(screen.getByLabelText(/type/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/category/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/search/i)).toBeInTheDocument();
  });

  it('renders type options correctly', () => {
    render(<TransactionFilters {...defaultProps} />);

    const typeSelect = screen.getByLabelText(/type/i);
    expect(typeSelect).toHaveValue('');
    
    const options = Array.from(typeSelect.querySelectorAll('option'));
    expect(options).toHaveLength(3);
    expect(options[0]).toHaveTextContent('All Transactions');
    expect(options[1]).toHaveTextContent('Income');
    expect(options[2]).toHaveTextContent('Expense');
  });

  it('renders category options correctly', () => {
    render(<TransactionFilters {...defaultProps} />);

    const categorySelect = screen.getByLabelText(/category/i);
    expect(categorySelect).toHaveValue('');
    
    const options = Array.from(categorySelect.querySelectorAll('option'));
    expect(options).toHaveLength(5); // "All Categories" + 4 categories
    expect(options[0]).toHaveTextContent('All Categories');
    expect(options[1]).toHaveTextContent('Food');
    expect(options[2]).toHaveTextContent('Housing');
  });

  it('calls onTypeChange when type is selected', async () => {
    const user = userEvent.setup();
    const onTypeChange = vi.fn();

    render(<TransactionFilters {...defaultProps} onTypeChange={onTypeChange} />);

    const typeSelect = screen.getByLabelText(/type/i);
    await user.selectOptions(typeSelect, 'income');

    expect(onTypeChange).toHaveBeenCalledWith('income');
  });

  it('calls onCategoryChange when category is selected', async () => {
    const user = userEvent.setup();
    const onCategoryChange = vi.fn();

    render(<TransactionFilters {...defaultProps} onCategoryChange={onCategoryChange} />);

    const categorySelect = screen.getByLabelText(/category/i);
    await user.selectOptions(categorySelect, 'Food');

    expect(onCategoryChange).toHaveBeenCalledWith('Food');
  });

  it('debounces search input', async () => {
    const user = userEvent.setup();
    const onSearchChange = vi.fn();

    render(<TransactionFilters {...defaultProps} onSearchChange={onSearchChange} />);

    const searchInput = screen.getByLabelText(/search/i);
    
    // Type multiple characters quickly
    await user.type(searchInput, 'groceries');

    // Should not call immediately
    expect(onSearchChange).not.toHaveBeenCalled();

    // Wait for debounce (300ms)
    await waitFor(() => {
      expect(onSearchChange).toHaveBeenCalledWith('groceries');
    }, { timeout: 500 });

    // Should only be called once despite multiple keystrokes
    expect(onSearchChange).toHaveBeenCalledTimes(1);
  });

  it('does not show clear filters button when no filters are active', () => {
    render(<TransactionFilters {...defaultProps} hasActiveFilters={false} />);

    expect(screen.queryByText(/clear all filters/i)).not.toBeInTheDocument();
  });

  it('shows clear filters button when filters are active', () => {
    render(<TransactionFilters {...defaultProps} hasActiveFilters={true} />);

    expect(screen.getByText(/clear all filters/i)).toBeInTheDocument();
  });

  it('calls onClearFilters when clear button is clicked', async () => {
    const user = userEvent.setup();
    const onClearFilters = vi.fn();

    render(<TransactionFilters {...defaultProps} hasActiveFilters={true} onClearFilters={onClearFilters} />);

    const clearButton = screen.getByText(/clear all filters/i);
    await user.click(clearButton);

    expect(onClearFilters).toHaveBeenCalledTimes(1);
  });

  it('disables category select when no categories are available', () => {
    render(<TransactionFilters {...defaultProps} categories={[]} />);

    const categorySelect = screen.getByLabelText(/category/i);
    expect(categorySelect).toBeDisabled();
  });

  it('displays selected filter values', () => {
    render(
      <TransactionFilters
        {...defaultProps}
        type="expense"
        category="Food"
        search="groceries"
      />
    );

    expect(screen.getByLabelText(/type/i)).toHaveValue('expense');
    expect(screen.getByLabelText(/category/i)).toHaveValue('Food');
    expect(screen.getByLabelText(/search/i)).toHaveValue('groceries');
  });

  it('should not have accessibility violations', async () => {
    const { container } = render(<TransactionFilters {...defaultProps} />);

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should not have accessibility violations with active filters', async () => {
    const { container } = render(<TransactionFilters {...defaultProps} hasActiveFilters={true} />);

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
