import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import App from './App';
import * as api from './lib/api';

vi.mock('./lib/api');
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
  Toaster: () => null,
}));

describe('App', () => {
  it('renders the budget tracker page', async () => {
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

    render(<App />);

    expect(screen.getByRole('heading', { level: 1, name: /personal budget tracker/i })).toBeInTheDocument();
    
    // Wait for components to finish loading
    await waitFor(() => {
      expect(api.fetchSummary).toHaveBeenCalled();
      expect(api.fetchTransactions).toHaveBeenCalled();
      expect(api.fetchSpendingInsights).toHaveBeenCalled();
    });
  });
});
