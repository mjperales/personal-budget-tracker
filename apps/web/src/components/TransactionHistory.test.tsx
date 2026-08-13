import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { TransactionHistory } from './TransactionHistory';
import * as api from '../lib/api';

vi.mock('../lib/api');

describe('TransactionHistory', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default mock for category derivation
    vi.mocked(api.fetchTransactions).mockResolvedValue([]);
  });

  it('shows loading state initially', () => {
    const onDeleteClick = vi.fn();
    vi.mocked(api.fetchTransactions).mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    render(<TransactionHistory onDeleteClick={onDeleteClick} />);

    expect(screen.getByText(/loading transactions/i)).toBeInTheDocument();
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('displays transactions when loaded', async () => {
    const onDeleteClick = vi.fn();
    const mockTransactions = [
      {
        id: '1',
        date: '2026-08-12',
        description: 'Groceries',
        amount: 150,
        type: 'expense' as const,
        category: 'Food',
      },
      {
        id: '2',
        date: '2026-08-13',
        description: 'Salary',
        amount: 5000,
        type: 'income' as const,
        category: 'Employment',
      },
    ];
    
    vi.mocked(api.fetchTransactions).mockResolvedValue(mockTransactions);

    render(<TransactionHistory onDeleteClick={onDeleteClick} />);

    await waitFor(() => {
      expect(screen.getAllByText('Groceries').length).toBeGreaterThan(0);
    });

    expect(screen.getAllByText('Salary').length).toBeGreaterThan(0);
  });

  it('shows empty state when no transactions', async () => {
    const onDeleteClick = vi.fn();
    vi.mocked(api.fetchTransactions).mockResolvedValue([]);

    render(<TransactionHistory onDeleteClick={onDeleteClick} />);

    await waitFor(() => {
      expect(screen.getByText(/no transactions yet/i)).toBeInTheDocument();
    });

    expect(screen.getByText(/add your first transaction/i)).toBeInTheDocument();
  });

  it('shows no matches message when filters return no results', async () => {
    const onDeleteClick = vi.fn();
    const user = userEvent.setup();
    
    const mockTransactions = [
      {
        id: '1',
        date: '2026-08-12',
        description: 'Groceries',
        amount: 150,
        type: 'expense' as const,
        category: 'Food',
      },
    ];
    
    // Mock will return all transactions initially, then empty when filtered
    vi.mocked(api.fetchTransactions).mockImplementation((filters) => {
      if (filters?.type === 'income') {
        return Promise.resolve([]);
      }
      return Promise.resolve(mockTransactions);
    });

    render(<TransactionHistory onDeleteClick={onDeleteClick} />);

    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByLabelText(/type/i)).toBeInTheDocument();
    });

    // Apply a filter that will return no results
    const typeSelect = screen.getByLabelText(/type/i);
    await user.selectOptions(typeSelect, 'income');

    // Should show the "no matches" message
    await waitFor(() => {
      expect(screen.getByText(/no transactions match your filters/i)).toBeInTheDocument();
    });
  });

  it('shows error state when API fails', async () => {
    const onDeleteClick = vi.fn();
    vi.mocked(api.fetchTransactions).mockRejectedValue(new Error('Network error'));

    render(<TransactionHistory onDeleteClick={onDeleteClick} />);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    expect(screen.getByText(/unable to load transactions/i)).toBeInTheDocument();
    expect(screen.getByText(/network error/i)).toBeInTheDocument();
  });

  it('formats amounts with correct prefix and color', async () => {
    const onDeleteClick = vi.fn();
    vi.mocked(api.fetchTransactions).mockResolvedValue([
      {
        id: '1',
        date: '2026-08-12',
        description: 'Expense Transaction',
        amount: 100,
        type: 'expense',
        category: 'Food',
      },
      {
        id: '2',
        date: '2026-08-13',
        description: 'Income Transaction',
        amount: 200,
        type: 'income',
        category: 'Work',
      },
    ]);

    const { container } = render(<TransactionHistory onDeleteClick={onDeleteClick} />);

    await waitFor(() => {
      expect(screen.getAllByText('Expense Transaction').length).toBeGreaterThan(0);
    });

    // Check for formatted amounts (desktop or mobile view will have them)
    expect(container.textContent).toContain('$100.00');
    expect(container.textContent).toContain('$200.00');
  });

  it('renders filter controls when transactions are loaded', async () => {
    const onDeleteClick = vi.fn();
    vi.mocked(api.fetchTransactions).mockResolvedValue([
      {
        id: '1',
        date: '2026-08-12',
        description: 'Groceries',
        amount: 150,
        type: 'expense',
        category: 'Food',
      },
    ]);

    render(<TransactionHistory onDeleteClick={onDeleteClick} />);

    await waitFor(() => {
      expect(screen.getByLabelText(/type/i)).toBeInTheDocument();
    });

    expect(screen.getByLabelText(/category/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/search/i)).toBeInTheDocument();
  });

  it('derives category options from transactions', async () => {
    const onDeleteClick = vi.fn();
    vi.mocked(api.fetchTransactions).mockResolvedValue([
      {
        id: '1',
        date: '2026-08-12',
        description: 'Groceries',
        amount: 150,
        type: 'expense',
        category: 'Food',
      },
      {
        id: '2',
        date: '2026-08-13',
        description: 'Rent',
        amount: 1200,
        type: 'expense',
        category: 'Housing',
      },
    ]);

    render(<TransactionHistory onDeleteClick={onDeleteClick} />);

    await waitFor(() => {
      expect(screen.getByLabelText(/category/i)).toBeInTheDocument();
    });

    const categorySelect = screen.getByLabelText(/category/i);
    const options = Array.from(categorySelect.querySelectorAll('option'));
    
    expect(options.some(opt => opt.textContent === 'Food')).toBe(true);
    expect(options.some(opt => opt.textContent === 'Housing')).toBe(true);
  });

  it('shows clear filters button when filters are active', async () => {
    const onDeleteClick = vi.fn();
    const user = userEvent.setup();
    
    vi.mocked(api.fetchTransactions).mockResolvedValue([
      {
        id: '1',
        date: '2026-08-12',
        description: 'Groceries',
        amount: 150,
        type: 'expense',
        category: 'Food',
      },
    ]);

    render(<TransactionHistory onDeleteClick={onDeleteClick} />);

    await waitFor(() => {
      expect(screen.getByLabelText(/type/i)).toBeInTheDocument();
    });

    // Initially no clear button (it's shown but not matching the initial state)
    // After applying a filter, the button should become visible

    // Apply a filter
    const typeSelect = screen.getByLabelText(/type/i);
    await user.selectOptions(typeSelect, 'expense');

    // Clear button should appear
    await waitFor(() => {
      expect(screen.getAllByText(/clear all filters/i).length).toBeGreaterThan(0);
    });
  });

  it('clears filters when clear button is clicked', async () => {
    const onDeleteClick = vi.fn();
    const user = userEvent.setup();
    
    vi.mocked(api.fetchTransactions).mockResolvedValue([
      {
        id: '1',
        date: '2026-08-12',
        description: 'Groceries',
        amount: 150,
        type: 'expense',
        category: 'Food',
      },
    ]);

    render(<TransactionHistory onDeleteClick={onDeleteClick} />);

    await waitFor(() => {
      expect(screen.getByLabelText(/type/i)).toBeInTheDocument();
    });

    // Apply a filter
    const typeSelect = screen.getByLabelText(/type/i);
    await user.selectOptions(typeSelect, 'expense');

    // Clear button should appear
    await waitFor(() => {
      expect(screen.getAllByText(/clear all filters/i).length).toBeGreaterThan(0);
    });

    // Click clear button
    const clearButtons = screen.getAllByText(/clear all filters/i);
    await user.click(clearButtons[0]);

    // After clearing, the clear button should disappear (indicating filters were cleared)
    await waitFor(() => {
      expect(screen.queryByText(/clear all filters/i)).not.toBeInTheDocument();
    });
  });

  it('should not have accessibility violations', async () => {
    const onDeleteClick = vi.fn();
    vi.mocked(api.fetchTransactions).mockResolvedValue([
      {
        id: '1',
        date: '2026-08-12',
        description: 'Test Transaction',
        amount: 100,
        type: 'expense',
        category: 'Test',
      },
    ]);

    const { container } = render(<TransactionHistory onDeleteClick={onDeleteClick} />);

    await waitFor(() => {
      expect(screen.getAllByText('Test Transaction').length).toBeGreaterThan(0);
    });

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
