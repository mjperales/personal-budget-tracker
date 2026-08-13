import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { TransactionCard } from './TransactionCard';
import type { Transaction } from '../lib/api';

const mockExpense: Transaction = {
  id: '1',
  date: '2026-08-12',
  description: 'Groceries at Whole Foods',
  amount: 150.50,
  type: 'expense',
  category: 'Food',
};

const mockIncome: Transaction = {
  id: '2',
  date: '2026-08-13',
  description: 'Monthly Salary',
  amount: 5000,
  type: 'income',
  category: 'Employment',
};

describe('TransactionCard', () => {
  it('renders transaction description', () => {
    const onDeleteClick = vi.fn();
    render(<TransactionCard transaction={mockExpense} onDeleteClick={onDeleteClick} />);

    expect(screen.getByText('Groceries at Whole Foods')).toBeInTheDocument();
  });

  it('renders formatted date', () => {
    const onDeleteClick = vi.fn();
    render(<TransactionCard transaction={mockExpense} onDeleteClick={onDeleteClick} />);

    expect(screen.getByText('Aug 12, 2026')).toBeInTheDocument();
  });

  it('renders formatted amount for expense with minus prefix', () => {
    const onDeleteClick = vi.fn();
    const { container } = render(<TransactionCard transaction={mockExpense} onDeleteClick={onDeleteClick} />);

    expect(container.textContent).toContain('-$150.50');
  });

  it('renders formatted amount for income with plus prefix', () => {
    const onDeleteClick = vi.fn();
    const { container } = render(<TransactionCard transaction={mockIncome} onDeleteClick={onDeleteClick} />);

    expect(container.textContent).toContain('+$5,000.00');
  });

  it('displays category and type', () => {
    const onDeleteClick = vi.fn();
    render(<TransactionCard transaction={mockExpense} onDeleteClick={onDeleteClick} />);

    expect(screen.getByText('Food')).toBeInTheDocument();
    expect(screen.getByText('expense')).toBeInTheDocument();
  });

  it('applies green color for income', () => {
    const onDeleteClick = vi.fn();
    const { container } = render(<TransactionCard transaction={mockIncome} onDeleteClick={onDeleteClick} />);

    const amountElement = container.querySelector('.text-green-700');
    expect(amountElement).toBeInTheDocument();
  });

  it('applies red color for expense', () => {
    const onDeleteClick = vi.fn();
    const { container } = render(<TransactionCard transaction={mockExpense} onDeleteClick={onDeleteClick} />);

    const amountElement = container.querySelector('.text-red-600');
    expect(amountElement).toBeInTheDocument();
  });

  it('should not have accessibility violations', async () => {
    const onDeleteClick = vi.fn();
    const { container } = render(<TransactionCard transaction={mockExpense} onDeleteClick={onDeleteClick} />);

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
