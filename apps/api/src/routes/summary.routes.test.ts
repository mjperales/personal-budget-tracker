import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../app.js';
import { transactionStore } from '../stores/transaction-store.js';

describe('GET /api/v1/summary', () => {
  beforeEach(() => {
    transactionStore.reset();
  });

  it('returns zero values when no transactions exist', async () => {
    const app = createApp();
    const response = await request(app).get('/api/v1/summary');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      data: {
        income: 0,
        expenses: 0,
        balance: 0,
      },
    });
  });

  it('calculates income total', async () => {
    transactionStore.create({
      date: '2026-08-12',
      description: 'Salary',
      amount: 5000,
      type: 'income',
      category: 'Employment',
    });

    transactionStore.create({
      date: '2026-08-15',
      description: 'Freelance',
      amount: 1000,
      type: 'income',
      category: 'Side Work',
    });

    const app = createApp();
    const response = await request(app).get('/api/v1/summary');

    expect(response.status).toBe(200);
    expect(response.body.data.income).toBe(6000);
  });

  it('calculates expenses total', async () => {
    transactionStore.create({
      date: '2026-08-12',
      description: 'Groceries',
      amount: 150,
      type: 'expense',
      category: 'Food',
    });

    transactionStore.create({
      date: '2026-08-13',
      description: 'Gas',
      amount: 50,
      type: 'expense',
      category: 'Transportation',
    });

    const app = createApp();
    const response = await request(app).get('/api/v1/summary');

    expect(response.status).toBe(200);
    expect(response.body.data.expenses).toBe(200);
  });

  it('calculates balance correctly', async () => {
    transactionStore.create({
      date: '2026-08-01',
      description: 'Salary',
      amount: 5000,
      type: 'income',
      category: 'Employment',
    });

    transactionStore.create({
      date: '2026-08-05',
      description: 'Rent',
      amount: 1500,
      type: 'expense',
      category: 'Housing',
    });

    transactionStore.create({
      date: '2026-08-10',
      description: 'Groceries',
      amount: 300,
      type: 'expense',
      category: 'Food',
    });

    const app = createApp();
    const response = await request(app).get('/api/v1/summary');

    expect(response.status).toBe(200);
    expect(response.body.data).toEqual({
      income: 5000,
      expenses: 1800,
      balance: 3200,
    });
  });
});
