import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../app.js';
import { transactionStore } from '../stores/transaction-store.js';

describe('GET /api/v1/transactions', () => {
  beforeEach(() => {
    transactionStore.reset();
  });

  it('returns empty array when no transactions exist', async () => {
    const app = createApp();
    const response = await request(app).get('/api/v1/transactions');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      data: [],
    });
  });

  it('returns standardized success response shape', async () => {
    const app = createApp();
    const response = await request(app).get('/api/v1/transactions');

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('data');
    expect(Array.isArray(response.body.data)).toBe(true);
  });

  it('returns all transactions', async () => {
    const transaction = transactionStore.create({
      date: '2026-08-12',
      description: 'Groceries',
      amount: 75.50,
      type: 'expense',
      category: 'Food',
    });

    const app = createApp();
    const response = await request(app).get('/api/v1/transactions');

    expect(response.status).toBe(200);
    expect(response.body.data).toHaveLength(1);
    expect(response.body.data[0]).toMatchObject({
      id: transaction.id,
      date: '2026-08-12',
      description: 'Groceries',
      amount: 75.50,
      type: 'expense',
      category: 'Food',
    });
  });
});
