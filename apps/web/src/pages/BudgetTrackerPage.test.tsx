import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { BudgetTrackerPage } from './BudgetTrackerPage';
import * as api from '../lib/api';

vi.mock('../lib/api');
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('BudgetTrackerPage', () => {
  it('renders the page heading', async () => {
    vi.mocked(api.fetchSummary).mockResolvedValue({
      income: 0,
      expenses: 0,
      balance: 0,
    });
    vi.mocked(api.fetchTransactions).mockResolvedValue([]);
    vi.mocked(api.fetchSpendingInsights).mockResolvedValue({
      totalExpenses: 0,
      topCategory: null,
      categories: [],
    });

    render(<BudgetTrackerPage />);

    expect(screen.getByRole('heading', { level: 1, name: /personal budget tracker/i })).toBeInTheDocument();
    
    // Wait for components to finish loading
    await waitFor(() => {
      expect(api.fetchSummary).toHaveBeenCalled();
      expect(api.fetchTransactions).toHaveBeenCalled();
      expect(api.fetchSpendingInsights).toHaveBeenCalled();
    });
  });

  it('renders the main sections', async () => {
    vi.mocked(api.fetchSummary).mockResolvedValue({
      income: 0,
      expenses: 0,
      balance: 0,
    });
    vi.mocked(api.fetchTransactions).mockResolvedValue([]);
    vi.mocked(api.fetchSpendingInsights).mockResolvedValue({
      totalExpenses: 0,
      topCategory: null,
      categories: [],
    });

    render(<BudgetTrackerPage />);

    // Wait for loading to complete
    await screen.findByLabelText(/description/i);

    // Check that headings exist (may be multiple due to sr-only and visible)
    const addTransactionHeadings = screen.getAllByRole('heading', { name: /add transaction/i });
    expect(addTransactionHeadings.length).toBeGreaterThan(0);
    
    const transactionHistoryHeadings = screen.getAllByRole('heading', { name: /transaction history/i });
    expect(transactionHistoryHeadings.length).toBeGreaterThan(0);
  });

  it('has proper heading hierarchy', async () => {
    vi.mocked(api.fetchSummary).mockResolvedValue({
      income: 0,
      expenses: 0,
      balance: 0,
    });
    vi.mocked(api.fetchTransactions).mockResolvedValue([]);
    vi.mocked(api.fetchSpendingInsights).mockResolvedValue({
      totalExpenses: 0,
      topCategory: null,
      categories: [],
    });

    render(<BudgetTrackerPage />);

    const headings = screen.getAllByRole('heading');
    
    // h1 - page title
    expect(headings[0].tagName).toBe('H1');
    
    // h2s - section headings
    const h2s = headings.filter((h) => h.tagName === 'H2');
    expect(h2s.length).toBeGreaterThan(0);
    
    // Wait for components to finish loading
    await waitFor(() => {
      expect(api.fetchSummary).toHaveBeenCalled();
      expect(api.fetchTransactions).toHaveBeenCalled();
      expect(api.fetchSpendingInsights).toHaveBeenCalled();
    });
  });

  it('should not have accessibility violations', async () => {
    vi.mocked(api.fetchSummary).mockResolvedValue({
      income: 1000,
      expenses: 500,
      balance: 500,
    });
    vi.mocked(api.fetchTransactions).mockResolvedValue([]);
    vi.mocked(api.fetchSpendingInsights).mockResolvedValue({
      totalExpenses: 0,
      topCategory: null,
      categories: [],
    });

    const { container } = render(<BudgetTrackerPage />);

    // Wait for async content to load
    await screen.findByText(/total income/i);

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
