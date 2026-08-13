import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { TransactionForm } from './TransactionForm';
import * as api from '../lib/api';
import { toast } from 'sonner';

vi.mock('../lib/api');
vi.mock('sonner');

describe('TransactionForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders form fields with accessible labels', () => {
    const onSuccess = vi.fn();
    render(<TransactionForm onSuccess={onSuccess} />);

    expect(screen.getByLabelText(/date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/amount/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/type/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/category/i)).toBeInTheDocument();
  });

  it('shows required indicators for required fields', () => {
    const onSuccess = vi.fn();
    render(<TransactionForm onSuccess={onSuccess} />);

    const requiredLabels = screen.getAllByText('*');
    expect(requiredLabels.length).toBeGreaterThan(0);
  });

  it('validates required description field', async () => {
    const user = userEvent.setup();
    const onSuccess = vi.fn();
    render(<TransactionForm onSuccess={onSuccess} />);

    const submitButton = screen.getByRole('button', { name: /add transaction/i });
    await user.click(submitButton);

    expect(await screen.findByText(/description is required/i)).toBeInTheDocument();
    expect(api.createTransaction).not.toHaveBeenCalled();
  });

  it('validates amount must be greater than zero', async () => {
    const user = userEvent.setup();
    const onSuccess = vi.fn();
    render(<TransactionForm onSuccess={onSuccess} />);

    const amountInput = screen.getByLabelText(/amount/i);
    const submitButton = screen.getByRole('button', { name: /add transaction/i });

    await user.clear(amountInput);
    await user.type(amountInput, '0');
    await user.click(submitButton);

    expect(await screen.findByText(/amount must be greater than 0/i)).toBeInTheDocument();
    expect(api.createTransaction).not.toHaveBeenCalled();
  });

  it('validates invalid amounts', async () => {
    const user = userEvent.setup();
    const onSuccess = vi.fn();
    render(<TransactionForm onSuccess={onSuccess} />);

    const amountInput = screen.getByLabelText(/amount/i);
    const submitButton = screen.getByRole('button', { name: /add transaction/i });

    // Clear and leave empty
    await user.clear(amountInput);
    await user.click(submitButton);

    expect(await screen.findByText(/amount must be greater than 0/i)).toBeInTheDocument();
    expect(api.createTransaction).not.toHaveBeenCalled();
  });

  it('validates required category field', async () => {
    const user = userEvent.setup();
    const onSuccess = vi.fn();
    render(<TransactionForm onSuccess={onSuccess} />);

    const submitButton = screen.getByRole('button', { name: /add transaction/i });
    await user.click(submitButton);

    expect(await screen.findByText(/category is required/i)).toBeInTheDocument();
    expect(api.createTransaction).not.toHaveBeenCalled();
  });

  it('successfully submits valid transaction', async () => {
    const user = userEvent.setup();
    const onSuccess = vi.fn();
    const mockTransaction = {
      id: '123',
      date: '2026-08-13',
      description: 'Test Transaction',
      amount: 100,
      type: 'expense' as const,
      category: 'Food',
    };

    vi.mocked(api.createTransaction).mockResolvedValue(mockTransaction);

    render(<TransactionForm onSuccess={onSuccess} />);

    await user.type(screen.getByLabelText(/description/i), 'Test Transaction');
    await user.type(screen.getByLabelText(/amount/i), '100');
    await user.type(screen.getByLabelText(/category/i), 'Food');

    const submitButton = screen.getByRole('button', { name: /add transaction/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(api.createTransaction).toHaveBeenCalledWith({
        date: expect.any(String),
        description: 'Test Transaction',
        amount: 100,
        type: 'expense',
        category: 'Food',
      });
    });

    expect(onSuccess).toHaveBeenCalled();
    expect(toast.success).toHaveBeenCalledWith('"Test Transaction" was added successfully.');
  });

  it('prevents duplicate submissions while request is pending', async () => {
    const user = userEvent.setup();
    const onSuccess = vi.fn();

    vi.mocked(api.createTransaction).mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 1000))
    );

    render(<TransactionForm onSuccess={onSuccess} />);

    await user.type(screen.getByLabelText(/description/i), 'Test');
    await user.type(screen.getByLabelText(/amount/i), '100');
    await user.type(screen.getByLabelText(/category/i), 'Food');

    const submitButton = screen.getByRole('button', { name: /add transaction/i });
    await user.click(submitButton);

    expect(submitButton).toBeDisabled();
    expect(screen.getByText(/adding\.\.\./i)).toBeInTheDocument();
  });

  it('displays API error when submission fails', async () => {
    const user = userEvent.setup();
    const onSuccess = vi.fn();

    vi.mocked(api.createTransaction).mockRejectedValue(new Error('Network error'));

    render(<TransactionForm onSuccess={onSuccess} />);

    await user.type(screen.getByLabelText(/description/i), 'Test');
    await user.type(screen.getByLabelText(/amount/i), '100');
    await user.type(screen.getByLabelText(/category/i), 'Food');

    const submitButton = screen.getByRole('button', { name: /add transaction/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Network error');
    });

    expect(onSuccess).not.toHaveBeenCalled();
  });

  it('does not show success message on API failure', async () => {
    const user = userEvent.setup();
    const onSuccess = vi.fn();

    vi.mocked(api.createTransaction).mockRejectedValue(new Error('Server error'));

    render(<TransactionForm onSuccess={onSuccess} />);

    await user.type(screen.getByLabelText(/description/i), 'Test');
    await user.type(screen.getByLabelText(/amount/i), '100');
    await user.type(screen.getByLabelText(/category/i), 'Food');

    await user.click(screen.getByRole('button', { name: /add transaction/i }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalled();
    });

    expect(toast.success).not.toHaveBeenCalled();
  });

  it('resets form after successful submission', async () => {
    const user = userEvent.setup();
    const onSuccess = vi.fn();
    const mockTransaction = {
      id: '123',
      date: '2026-08-13',
      description: 'Test Transaction',
      amount: 100,
      type: 'expense' as const,
      category: 'Food',
    };

    vi.mocked(api.createTransaction).mockResolvedValue(mockTransaction);

    render(<TransactionForm onSuccess={onSuccess} />);

    const descriptionInput = screen.getByLabelText(/description/i) as HTMLInputElement;
    const amountInput = screen.getByLabelText(/amount/i) as HTMLInputElement;
    const categoryInput = screen.getByLabelText(/category/i) as HTMLInputElement;

    await user.type(descriptionInput, 'Test Transaction');
    await user.type(amountInput, '100');
    await user.type(categoryInput, 'Food');

    await user.click(screen.getByRole('button', { name: /add transaction/i }));

    await waitFor(() => {
      expect(descriptionInput.value).toBe('');
      expect(amountInput.value).toBe('');
      expect(categoryInput.value).toBe('');
    });
  });

  it('clears validation errors when user starts typing', async () => {
    const user = userEvent.setup();
    const onSuccess = vi.fn();
    render(<TransactionForm onSuccess={onSuccess} />);

    const submitButton = screen.getByRole('button', { name: /add transaction/i });
    await user.click(submitButton);

    expect(await screen.findByText(/description is required/i)).toBeInTheDocument();

    const descriptionInput = screen.getByLabelText(/description/i);
    await user.type(descriptionInput, 'Test');

    expect(screen.queryByText(/description is required/i)).not.toBeInTheDocument();
  });

  it('should not have accessibility violations', async () => {
    const onSuccess = vi.fn();
    const { container } = render(<TransactionForm onSuccess={onSuccess} />);

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
