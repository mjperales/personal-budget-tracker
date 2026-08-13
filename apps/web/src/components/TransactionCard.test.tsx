import { describe, it, expect } from 'vitest';
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
    render(<TransactionCard transaction={mockExpense} />);

    expect(screen.getByText('Groceries at Whole Foods')).toBeInTheDocument();
  });

  it('renders formatted date', () => {
    render(<TransactionCard transaction={mockExpense} />);

    expect(screen.getByText('Aug 12, 2026')).toBeInTheDocument();
  });

  it('renders formatted amount for expense with minus prefix', () => {
    const { container } = render(<TransactionCard transaction={mockExpense} />);

    expect(container.textContent).toContain('-$150.50');
  });

  it('renders formatted amount for income with plus prefix', () => {
    const { container } = render(<TransactionCard transaction={mockIncome} />);

    expect(container.textContent).toContain('+$5,000.00');
  });

  it('displays category and type', () => {
    render(<TransactionCard transaction={mockExpense} />);

    expect(screen.getByText('Food')).toBeInTheDocument();
    expect(screen.getByText('expense')).toBeInTheDocument();
  });

  it('applies green color for income', () => {
    const { container } = render(<TransactionCard transaction={mockIncome} />);

    const amountElement = container.querySelector('.text-green-600');
    expect(amountElement).toBeInTheDocument();
  });

  it('applies red color for expense', () => {
    const { container } = render(<TransactionCard transaction={mockExpense} />);

    const amountElement = container.querySelector('.text-red-600');
    expect(amountElement).toBeInTheDocument();
  });

  it('should not have accessibility violations', async () => {
    const { container } = render(<TransactionCard transaction={mockExpense} />);

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
