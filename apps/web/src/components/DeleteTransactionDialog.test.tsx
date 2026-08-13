import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { DeleteTransactionDialog } from './DeleteTransactionDialog';
import type { Transaction } from '../lib/api';

const mockTransaction: Transaction = {
  id: '123',
  date: '2026-08-13',
  description: 'Groceries',
  amount: 100,
  type: 'expense',
  category: 'Food',
};

describe('DeleteTransactionDialog', () => {
  it('does not render when closed', () => {
    const onOpenChange = vi.fn();
    const onConfirm = vi.fn();

    render(
      <DeleteTransactionDialog
        transaction={mockTransaction}
        open={false}
        onOpenChange={onOpenChange}
        onConfirm={onConfirm}
        isDeleting={false}
      />
    );

    expect(screen.queryByText(/delete transaction\?/i)).not.toBeInTheDocument();
  });

  it('renders confirmation message when open', () => {
    const onOpenChange = vi.fn();
    const onConfirm = vi.fn();

    render(
      <DeleteTransactionDialog
        transaction={mockTransaction}
        open={true}
        onOpenChange={onOpenChange}
        onConfirm={onConfirm}
        isDeleting={false}
      />
    );

    expect(screen.getByText(/delete transaction\?/i)).toBeInTheDocument();
    expect(screen.getByText(/are you sure you want to delete "groceries"\?/i)).toBeInTheDocument();
    expect(screen.getByText(/this action cannot be undone/i)).toBeInTheDocument();
  });

  it('shows cancel and delete buttons', () => {
    const onOpenChange = vi.fn();
    const onConfirm = vi.fn();

    render(
      <DeleteTransactionDialog
        transaction={mockTransaction}
        open={true}
        onOpenChange={onOpenChange}
        onConfirm={onConfirm}
        isDeleting={false}
      />
    );

    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^delete$/i })).toBeInTheDocument();
  });

  it('calls onConfirm when delete button is clicked', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    const onConfirm = vi.fn();

    render(
      <DeleteTransactionDialog
        transaction={mockTransaction}
        open={true}
        onOpenChange={onOpenChange}
        onConfirm={onConfirm}
        isDeleting={false}
      />
    );

    const deleteButton = screen.getByRole('button', { name: /^delete$/i });
    await user.click(deleteButton);

    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('does not call onConfirm when cancel button is clicked', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    const onConfirm = vi.fn();

    render(
      <DeleteTransactionDialog
        transaction={mockTransaction}
        open={true}
        onOpenChange={onOpenChange}
        onConfirm={onConfirm}
        isDeleting={false}
      />
    );

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    await user.click(cancelButton);

    expect(onConfirm).not.toHaveBeenCalled();
  });

  it('disables buttons while deleting', () => {
    const onOpenChange = vi.fn();
    const onConfirm = vi.fn();

    render(
      <DeleteTransactionDialog
        transaction={mockTransaction}
        open={true}
        onOpenChange={onOpenChange}
        onConfirm={onConfirm}
        isDeleting={true}
      />
    );

    expect(screen.getByRole('button', { name: /cancel/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /deleting\.\.\./i })).toBeDisabled();
  });

  it('shows deleting state in button text', () => {
    const onOpenChange = vi.fn();
    const onConfirm = vi.fn();

    render(
      <DeleteTransactionDialog
        transaction={mockTransaction}
        open={true}
        onOpenChange={onOpenChange}
        onConfirm={onConfirm}
        isDeleting={true}
      />
    );

    expect(screen.getByText(/deleting\.\.\./i)).toBeInTheDocument();
  });

  it('should not have accessibility violations when open', async () => {
    const onOpenChange = vi.fn();
    const onConfirm = vi.fn();

    const { container } = render(
      <DeleteTransactionDialog
        transaction={mockTransaction}
        open={true}
        onOpenChange={onOpenChange}
        onConfirm={onConfirm}
        isDeleting={false}
      />
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
