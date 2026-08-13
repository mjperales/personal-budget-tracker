import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { SummaryPanel } from './SummaryPanel';
import * as api from '../lib/api';

vi.mock('../lib/api');

describe('SummaryPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows loading state initially', () => {
    vi.mocked(api.fetchSummary).mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    render(<SummaryPanel />);

    expect(screen.getByText(/loading financial summary/i)).toBeInTheDocument();
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('displays summary data when loaded', async () => {
    vi.mocked(api.fetchSummary).mockResolvedValue({
      income: 5000,
      expenses: 2000,
      balance: 3000,
    });

    render(<SummaryPanel />);

    await waitFor(() => {
      expect(screen.getByText('$5,000.00')).toBeInTheDocument();
    });

    expect(screen.getByText('$2,000.00')).toBeInTheDocument();
    expect(screen.getByText('$3,000.00')).toBeInTheDocument();
  });

  it('formats currency correctly', async () => {
    vi.mocked(api.fetchSummary).mockResolvedValue({
      income: 1234.56,
      expenses: 789.12,
      balance: 445.44,
    });

    render(<SummaryPanel />);

    await waitFor(() => {
      expect(screen.getByText('$1,234.56')).toBeInTheDocument();
    });

    expect(screen.getByText('$789.12')).toBeInTheDocument();
    expect(screen.getByText('$445.44')).toBeInTheDocument();
  });

  it('shows positive balance in green with trending up icon', async () => {
    vi.mocked(api.fetchSummary).mockResolvedValue({
      income: 5000,
      expenses: 2000,
      balance: 3000,
    });

    const { container } = render(<SummaryPanel />);

    const balanceElement = await screen.findByText('$3,000.00');
    expect(balanceElement).toHaveClass('text-green-600');

    // Check for trending up icon (lucide-react renders as svg)
    const icon = container.querySelector('svg.text-green-600');
    expect(icon).toBeInTheDocument();
  });

  it('shows negative balance in red with trending down icon', async () => {
    vi.mocked(api.fetchSummary).mockResolvedValue({
      income: 1000,
      expenses: 2000,
      balance: -1000,
    });

    const { container } = render(<SummaryPanel />);

    const balanceElement = await screen.findByText('-$1,000.00');
    expect(balanceElement).toHaveClass('text-red-600');

    // Check for trending down icon (lucide-react renders as svg)
    const icon = container.querySelector('svg.text-red-600');
    expect(icon).toBeInTheDocument();
  });

  it('handles zero values', async () => {
    vi.mocked(api.fetchSummary).mockResolvedValue({
      income: 0,
      expenses: 0,
      balance: 0,
    });

    render(<SummaryPanel />);

    await waitFor(() => {
      const amounts = screen.getAllByText('$0.00');
      expect(amounts).toHaveLength(3);
    });
  });

  it('displays error state when API fails', async () => {
    vi.mocked(api.fetchSummary).mockRejectedValue(new Error('Network error'));

    render(<SummaryPanel />);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    expect(screen.getByText(/unable to load summary/i)).toBeInTheDocument();
    expect(screen.getByText(/network error/i)).toBeInTheDocument();
  });

  it('displays generic error message when error has no message', async () => {
    vi.mocked(api.fetchSummary).mockRejectedValue('Unknown error');

    render(<SummaryPanel />);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    expect(screen.getByText(/failed to load summary/i)).toBeInTheDocument();
  });

  it('has accessible labels for amounts', async () => {
    vi.mocked(api.fetchSummary).mockResolvedValue({
      income: 5000,
      expenses: 2000,
      balance: 3000,
    });

    render(<SummaryPanel />);

    await waitFor(() => {
      expect(screen.getByLabelText(/total income: \$5,000\.00/i)).toBeInTheDocument();
    });

    expect(screen.getByLabelText(/total expenses: \$2,000\.00/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/positive balance: \$3,000\.00/i)).toBeInTheDocument();
  });

  it('should not have accessibility violations in success state', async () => {
    vi.mocked(api.fetchSummary).mockResolvedValue({
      income: 5000,
      expenses: 2000,
      balance: 3000,
    });

    const { container } = render(<SummaryPanel />);

    await waitFor(() => {
      expect(screen.getByText('$5,000.00')).toBeInTheDocument();
    });

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should not have accessibility violations in loading state', async () => {
    vi.mocked(api.fetchSummary).mockImplementation(
      () => new Promise(() => {})
    );

    const { container } = render(<SummaryPanel />);

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should not have accessibility violations in error state', async () => {
    vi.mocked(api.fetchSummary).mockRejectedValue(new Error('Network error'));

    const { container } = render(<SummaryPanel />);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
