import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { TransactionTable } from './TransactionTable';
import type { Transaction } from '../lib/api';

const mockTransactions: Transaction[] = [
  {
    id: '1',
    date: '2026-08-12',
    description: 'Groceries',
    amount: 150.50,
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
];

describe('TransactionTable', () => {
  it('renders table with transactions', () => {
    const onDeleteClick = vi.fn();
    render(<TransactionTable transactions={mockTransactions} onDeleteClick={onDeleteClick} />);

    expect(screen.getByText('Groceries')).toBeInTheDocument();
    expect(screen.getByText('Salary')).toBeInTheDocument();
  });

  it('renders all column headers', () => {
    const onDeleteClick = vi.fn();
    const { container } = render(<TransactionTable transactions={mockTransactions} onDeleteClick={onDeleteClick} />);

    const headers = container.querySelectorAll('th');
    const headerTexts = Array.from(headers).map((h) => h.textContent);

    expect(headerTexts).toContain('Date');
    expect(headerTexts).toContain('Description');
    expect(headerTexts).toContain('Category');
    expect(headerTexts).toContain('Type');
    expect(headerTexts).toContain('Amount');
    expect(headerTexts).toContain('Actions');
  });

  it('displays formatted dates', () => {
    const onDeleteClick = vi.fn();
    render(<TransactionTable transactions={mockTransactions} onDeleteClick={onDeleteClick} />);

    expect(screen.getByText('Aug 12, 2026')).toBeInTheDocument();
    expect(screen.getByText('Aug 13, 2026')).toBeInTheDocument();
  });

  it('displays formatted amounts with prefix', () => {
    const onDeleteClick = vi.fn();
    const { container } = render(<TransactionTable transactions={mockTransactions} onDeleteClick={onDeleteClick} />);

    expect(container.textContent).toContain('-$150.50');
    expect(container.textContent).toContain('+$5,000.00');
  });

  it('displays categories and types', () => {
    const onDeleteClick = vi.fn();
    render(<TransactionTable transactions={mockTransactions} onDeleteClick={onDeleteClick} />);

    expect(screen.getByText('Food')).toBeInTheDocument();
    expect(screen.getByText('Employment')).toBeInTheDocument();
    // Types are capitalized in the component
    expect(screen.getByText(/expense/i)).toBeInTheDocument();
    expect(screen.getByText(/income/i)).toBeInTheDocument();
  });

  it('applies correct styling for income and expense', () => {
    const onDeleteClick = vi.fn();
    const { container } = render(<TransactionTable transactions={mockTransactions} onDeleteClick={onDeleteClick} />);

    const rows = container.querySelectorAll('tbody tr');
    expect(rows).toHaveLength(2);

    // First row (expense) should have red text
    const expenseAmount = rows[0].querySelector('.text-red-600');
    expect(expenseAmount).toBeInTheDocument();

    // Second row (income) should have green text
    const incomeAmount = rows[1].querySelector('.text-green-700');
    expect(incomeAmount).toBeInTheDocument();
  });

  it('renders empty table when no transactions', () => {
    const onDeleteClick = vi.fn();
    const { container } = render(<TransactionTable transactions={[]} onDeleteClick={onDeleteClick} />);

    const tbody = container.querySelector('tbody');
    expect(tbody?.children).toHaveLength(0);
  });

  it('should not have accessibility violations', async () => {
    const onDeleteClick = vi.fn();
    const { container } = render(<TransactionTable transactions={mockTransactions} onDeleteClick={onDeleteClick} />);

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
