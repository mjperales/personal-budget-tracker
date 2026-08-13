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

  it('filters transactions by type', async () => {
    transactionStore.create({
      date: '2026-08-12',
      description: 'Salary',
      amount: 5000,
      type: 'income',
      category: 'Employment',
    });

    transactionStore.create({
      date: '2026-08-12',
      description: 'Groceries',
      amount: 150,
      type: 'expense',
      category: 'Food',
    });

    const app = createApp();
    const response = await request(app).get('/api/v1/transactions?type=income');

    expect(response.status).toBe(200);
    expect(response.body.data).toHaveLength(1);
    expect(response.body.data[0].type).toBe('income');
  });

  it('filters transactions by category', async () => {
    transactionStore.create({
      date: '2026-08-12',
      description: 'Groceries',
      amount: 150,
      type: 'expense',
      category: 'Food',
    });

    transactionStore.create({
      date: '2026-08-12',
      description: 'Gas',
      amount: 50,
      type: 'expense',
      category: 'Transportation',
    });

    const app = createApp();
    const response = await request(app).get('/api/v1/transactions?category=Food');

    expect(response.status).toBe(200);
    expect(response.body.data).toHaveLength(1);
    expect(response.body.data[0].category).toBe('Food');
  });

  it('searches transactions by description', async () => {
    transactionStore.create({
      date: '2026-08-12',
      description: 'Whole Foods Groceries',
      amount: 150,
      type: 'expense',
      category: 'Food',
    });

    transactionStore.create({
      date: '2026-08-12',
      description: 'Gas Station',
      amount: 50,
      type: 'expense',
      category: 'Transportation',
    });

    const app = createApp();
    const response = await request(app).get('/api/v1/transactions?search=groceries');

    expect(response.status).toBe(200);
    expect(response.body.data).toHaveLength(1);
    expect(response.body.data[0].description).toContain('Groceries');
  });

  it('combines multiple filters', async () => {
    transactionStore.create({
      date: '2026-08-12',
      description: 'Restaurant dinner',
      amount: 75,
      type: 'expense',
      category: 'Food',
    });

    transactionStore.create({
      date: '2026-08-12',
      description: 'Groceries',
      amount: 150,
      type: 'expense',
      category: 'Food',
    });

    transactionStore.create({
      date: '2026-08-12',
      description: 'Freelance income',
      amount: 1000,
      type: 'income',
      category: 'Work',
    });

    const app = createApp();
    const response = await request(app)
      .get('/api/v1/transactions?type=expense&category=Food&search=groceries');

    expect(response.status).toBe(200);
    expect(response.body.data).toHaveLength(1);
    expect(response.body.data[0].description).toBe('Groceries');
  });

  it('returns 400 for invalid type parameter', async () => {
    const app = createApp();
    const response = await request(app).get('/api/v1/transactions?type=invalid');

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error');
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('returns 400 for repeated category parameters', async () => {
    const app = createApp();
    const response = await request(app).get('/api/v1/transactions?category=Food&category=Other');

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error');
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('returns 400 for unexpected query parameters', async () => {
    const app = createApp();
    const response = await request(app).get('/api/v1/transactions?invalid=param');

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error');
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
  });
});

describe('POST /api/v1/transactions', () => {
  beforeEach(() => {
    transactionStore.reset();
  });

  it('creates a new transaction', async () => {
    const app = createApp();
    const response = await request(app)
      .post('/api/v1/transactions')
      .send({
        date: '2026-08-12',
        description: 'Salary',
        amount: 5000,
        type: 'income',
        category: 'Employment',
      });

    expect(response.status).toBe(201);
    expect(response.body.data).toMatchObject({
      date: '2026-08-12',
      description: 'Salary',
      amount: 5000,
      type: 'income',
      category: 'Employment',
    });
    expect(response.body.data.id).toBeDefined();
  });

  it('validates required fields', async () => {
    const app = createApp();
    const response = await request(app)
      .post('/api/v1/transactions')
      .send({
        description: 'Missing fields',
      });

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('validates amount must be positive', async () => {
    const app = createApp();
    const response = await request(app)
      .post('/api/v1/transactions')
      .send({
        date: '2026-08-12',
        description: 'Invalid',
        amount: -50,
        type: 'expense',
        category: 'Food',
      });

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('validates type must be income or expense', async () => {
    const app = createApp();
    const response = await request(app)
      .post('/api/v1/transactions')
      .send({
        date: '2026-08-12',
        description: 'Invalid',
        amount: 50,
        type: 'invalid',
        category: 'Food',
      });

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('validates date format', async () => {
    const app = createApp();
    const response = await request(app)
      .post('/api/v1/transactions')
      .send({
        date: 'not-a-date',
        description: 'Invalid date',
        amount: 50,
        type: 'expense',
        category: 'Food',
      });

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
  });
});

describe('PUT /api/v1/transactions/:id', () => {
  beforeEach(() => {
    transactionStore.reset();
  });

  it('updates an existing transaction', async () => {
    const transaction = transactionStore.create({
      date: '2026-08-12',
      description: 'Groceries',
      amount: 75.50,
      type: 'expense',
      category: 'Food',
    });

    const app = createApp();
    const response = await request(app)
      .put(`/api/v1/transactions/${transaction.id}`)
      .send({
        date: '2026-08-13',
        description: 'Groceries - Updated',
        amount: 85.00,
        type: 'expense',
        category: 'Food',
      });

    expect(response.status).toBe(200);
    expect(response.body.data).toMatchObject({
      id: transaction.id,
      date: '2026-08-13',
      description: 'Groceries - Updated',
      amount: 85.00,
      type: 'expense',
      category: 'Food',
    });
  });

  it('returns 404 for non-existent transaction', async () => {
    const app = createApp();
    const response = await request(app)
      .put('/api/v1/transactions/non-existent-id')
      .send({
        date: '2026-08-12',
        description: 'Test',
        amount: 50,
        type: 'expense',
        category: 'Food',
      });

    expect(response.status).toBe(404);
    expect(response.body.error.code).toBe('NOT_FOUND');
  });

  it('validates update data', async () => {
    const transaction = transactionStore.create({
      date: '2026-08-12',
      description: 'Groceries',
      amount: 75.50,
      type: 'expense',
      category: 'Food',
    });

    const app = createApp();
    const response = await request(app)
      .put(`/api/v1/transactions/${transaction.id}`)
      .send({
        date: '2026-08-12',
        description: 'Invalid',
        amount: -50,
        type: 'expense',
        category: 'Food',
      });

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
  });
});

describe('DELETE /api/v1/transactions/:id', () => {
  beforeEach(() => {
    transactionStore.reset();
  });

  it('deletes an existing transaction', async () => {
    const transaction = transactionStore.create({
      date: '2026-08-12',
      description: 'Groceries',
      amount: 75.50,
      type: 'expense',
      category: 'Food',
    });

    const app = createApp();
    const response = await request(app).delete(`/api/v1/transactions/${transaction.id}`);

    expect(response.status).toBe(204);
    expect(response.body).toEqual({});

    const remaining = transactionStore.getAll();
    expect(remaining).toHaveLength(0);
  });

  it('returns 404 for non-existent transaction', async () => {
    const app = createApp();
    const response = await request(app).delete('/api/v1/transactions/non-existent-id');

    expect(response.status).toBe(404);
    expect(response.body.error.code).toBe('NOT_FOUND');
  });
});
