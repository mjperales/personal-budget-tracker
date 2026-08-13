import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { SpendingInsights } from './SpendingInsights';
import * as api from '../lib/api';

vi.mock('../lib/api');

describe('SpendingInsights', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows loading state initially', () => {
    vi.mocked(api.fetchSpendingInsights).mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    render(<SpendingInsights />);

    expect(screen.getByText(/loading insights/i)).toBeInTheDocument();
  });

  it('shows error state when API fails', async () => {
    vi.mocked(api.fetchSpendingInsights).mockRejectedValue(
      new Error('Network error')
    );

    render(<SpendingInsights />);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    expect(screen.getByText(/unable to load spending insights/i)).toBeInTheDocument();
    expect(screen.getByText(/network error/i)).toBeInTheDocument();
  });

  it('shows empty state when there are no expenses', async () => {
    vi.mocked(api.fetchSpendingInsights).mockResolvedValue({
      totalExpenses: 0,
      topCategory: null,
      categories: [],
    });

    render(<SpendingInsights />);

    await waitFor(() => {
      expect(screen.getByText(/no spending insights yet/i)).toBeInTheDocument();
    });

    expect(screen.getByText(/add an expense transaction/i)).toBeInTheDocument();
  });

  it('displays top spending category correctly', async () => {
    vi.mocked(api.fetchSpendingInsights).mockResolvedValue({
      totalExpenses: 1000,
      topCategory: {
        category: 'Food',
        amount: 500,
        percentage: 50,
      },
      categories: [
        {
          category: 'Food',
          amount: 500,
          percentage: 50,
        },
        {
          category: 'Utilities',
          amount: 300,
          percentage: 30,
        },
        {
          category: 'Transportation',
          amount: 200,
          percentage: 20,
        },
      ],
    });

    const { container } = render(<SpendingInsights />);

    await waitFor(() => {
      expect(screen.getByText('Top spending category')).toBeInTheDocument();
    });

    expect(container.textContent).toContain('Food');
    expect(container.textContent).toContain('$500.00');
    expect(container.textContent).toContain('50% of expenses');
  });

  it('displays all category spending breakdowns', async () => {
    vi.mocked(api.fetchSpendingInsights).mockResolvedValue({
      totalExpenses: 1000,
      topCategory: {
        category: 'Food',
        amount: 500,
        percentage: 50,
      },
      categories: [
        {
          category: 'Food',
          amount: 500,
          percentage: 50,
        },
        {
          category: 'Utilities',
          amount: 300,
          percentage: 30,
        },
        {
          category: 'Transportation',
          amount: 200,
          percentage: 20,
        },
      ],
    });

    const { container } = render(<SpendingInsights />);

    await waitFor(() => {
      expect(screen.getByText('Spending by category')).toBeInTheDocument();
    });

    // All categories should be displayed
    expect(container.textContent).toContain('Food');
    expect(container.textContent).toContain('Utilities');
    expect(container.textContent).toContain('Transportation');

    // Amounts should be displayed
    expect(container.textContent).toContain('$500.00');
    expect(container.textContent).toContain('$300.00');
    expect(container.textContent).toContain('$200.00');

    // Percentages should be displayed
    expect(container.textContent).toContain('50%');
    expect(container.textContent).toContain('30%');
    expect(container.textContent).toContain('20%');
  });

  it('refreshes insights when refreshKey changes', async () => {
    const mockFetch = vi.mocked(api.fetchSpendingInsights);
    
    mockFetch.mockResolvedValue({
      totalExpenses: 100,
      topCategory: {
        category: 'Food',
        amount: 100,
        percentage: 100,
      },
      categories: [
        {
          category: 'Food',
          amount: 100,
          percentage: 100,
        },
      ],
    });

    const { rerender } = render(<SpendingInsights refreshKey={0} />);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    rerender(<SpendingInsights refreshKey={1} />);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });
  });

  it('updates when an expense is added', async () => {
    const mockFetch = vi.mocked(api.fetchSpendingInsights);
    
    // Initially empty
    mockFetch.mockResolvedValueOnce({
      totalExpenses: 0,
      topCategory: null,
      categories: [],
    });

    const { rerender } = render(<SpendingInsights refreshKey={0} />);

    await waitFor(() => {
      expect(screen.getByText(/no spending insights yet/i)).toBeInTheDocument();
    });

    // After adding an expense
    mockFetch.mockResolvedValueOnce({
      totalExpenses: 100,
      topCategory: {
        category: 'Food',
        amount: 100,
        percentage: 100,
      },
      categories: [
        {
          category: 'Food',
          amount: 100,
          percentage: 100,
        },
      ],
    });

    rerender(<SpendingInsights refreshKey={1} />);

    await waitFor(() => {
      expect(screen.getByText('Top spending category')).toBeInTheDocument();
    });
  });

  it('has proper heading structure', async () => {
    vi.mocked(api.fetchSpendingInsights).mockResolvedValue({
      totalExpenses: 100,
      topCategory: {
        category: 'Food',
        amount: 100,
        percentage: 100,
      },
      categories: [
        {
          category: 'Food',
          amount: 100,
          percentage: 100,
        },
      ],
    });

    render(<SpendingInsights />);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /spending insights/i })).toBeInTheDocument();
    });

    const headings = screen.getAllByRole('heading');
    expect(headings[0].tagName).toBe('H2');
  });

  it('should not have accessibility violations in loading state', async () => {
    vi.mocked(api.fetchSpendingInsights).mockImplementation(
      () => new Promise(() => {})
    );

    const { container } = render(<SpendingInsights />);

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should not have accessibility violations in success state', async () => {
    vi.mocked(api.fetchSpendingInsights).mockResolvedValue({
      totalExpenses: 500,
      topCategory: {
        category: 'Food',
        amount: 300,
        percentage: 60,
      },
      categories: [
        {
          category: 'Food',
          amount: 300,
          percentage: 60,
        },
        {
          category: 'Utilities',
          amount: 200,
          percentage: 40,
        },
      ],
    });

    const { container } = render(<SpendingInsights />);

    await waitFor(() => {
      expect(screen.getByText('Top spending category')).toBeInTheDocument();
    });

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should not have accessibility violations in empty state', async () => {
    vi.mocked(api.fetchSpendingInsights).mockResolvedValue({
      totalExpenses: 0,
      topCategory: null,
      categories: [],
    });

    const { container } = render(<SpendingInsights />);

    await waitFor(() => {
      expect(screen.getByText(/no spending insights yet/i)).toBeInTheDocument();
    });

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should not have accessibility violations in error state', async () => {
    vi.mocked(api.fetchSpendingInsights).mockRejectedValue(
      new Error('API error')
    );

    const { container } = render(<SpendingInsights />);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('hides visual bars from assistive technology', async () => {
    vi.mocked(api.fetchSpendingInsights).mockResolvedValue({
      totalExpenses: 100,
      topCategory: {
        category: 'Food',
        amount: 100,
        percentage: 100,
      },
      categories: [
        {
          category: 'Food',
          amount: 100,
          percentage: 100,
        },
      ],
    });

    const { container } = render(<SpendingInsights />);

    await waitFor(() => {
      expect(screen.getByText('Spending by category')).toBeInTheDocument();
    });

    // Visual bars should be marked as decorative
    const bars = container.querySelectorAll('[aria-hidden="true"]');
    expect(bars.length).toBeGreaterThan(0);
  });
});
