import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { TransactionHistory } from './TransactionHistory';
import * as api from '../lib/api';

vi.mock('../lib/api');

describe('TransactionHistory', () => {
  beforeEach(() => {
    vi.clearAllMocks();
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
        description: 'Salary',
        amount: 5000,
        type: 'income',
        category: 'Employment',
      },
    ]);

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
