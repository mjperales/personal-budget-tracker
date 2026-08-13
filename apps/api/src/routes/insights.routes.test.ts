import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../app.js';
import { transactionStore } from '../stores/transaction-store.js';

describe('GET /api/v1/insights/spending-by-category', () => {
  let app: ReturnType<typeof createApp>;

  beforeEach(() => {
    app = createApp();
    transactionStore.reset();
  });

  it('returns empty insights when there are no transactions', async () => {
    const response = await request(app).get('/api/v1/insights/spending-by-category');

    expect(response.status).toBe(200);
    expect(response.body.data).toEqual({
      totalExpenses: 0,
      topCategory: null,
      categories: [],
    });
  });

  it('returns empty insights when there are only income transactions', async () => {
    transactionStore.create({
      date: '2026-08-01',
      description: 'Salary',
      amount: 5000,
      type: 'income',
      category: 'Employment',
    });

    const response = await request(app).get('/api/v1/insights/spending-by-category');

    expect(response.status).toBe(200);
    expect(response.body.data).toEqual({
      totalExpenses: 0,
      topCategory: null,
      categories: [],
    });
  });

  it('returns correct insights for one expense category', async () => {
    transactionStore.create({
      date: '2026-08-01',
      description: 'Groceries',
      amount: 100,
      type: 'expense',
      category: 'Food',
    });

    const response = await request(app).get('/api/v1/insights/spending-by-category');

    expect(response.status).toBe(200);
    expect(response.body.data.totalExpenses).toBe(100);
    expect(response.body.data.topCategory).toEqual({
      category: 'Food',
      amount: 100,
      percentage: 100,
    });
    expect(response.body.data.categories).toHaveLength(1);
  });

  it('returns correct insights for multiple expense categories', async () => {
    transactionStore.create({
      date: '2026-08-01',
      description: 'Groceries',
      amount: 500,
      type: 'expense',
      category: 'Food',
    });

    transactionStore.create({
      date: '2026-08-02',
      description: 'Electric bill',
      amount: 300,
      type: 'expense',
      category: 'Utilities',
    });

    transactionStore.create({
      date: '2026-08-03',
      description: 'Gas',
      amount: 200,
      type: 'expense',
      category: 'Transportation',
    });

    const response = await request(app).get('/api/v1/insights/spending-by-category');

    expect(response.status).toBe(200);
    expect(response.body.data.totalExpenses).toBe(1000);
    expect(response.body.data.topCategory.category).toBe('Food');
    expect(response.body.data.categories).toHaveLength(3);
  });

  it('sums transactions in the same category', async () => {
    transactionStore.create({
      date: '2026-08-01',
      description: 'Groceries',
      amount: 100,
      type: 'expense',
      category: 'Food',
    });

    transactionStore.create({
      date: '2026-08-05',
      description: 'Restaurant',
      amount: 50,
      type: 'expense',
      category: 'Food',
    });

    const response = await request(app).get('/api/v1/insights/spending-by-category');

    expect(response.status).toBe(200);
    expect(response.body.data.categories).toHaveLength(1);
    expect(response.body.data.categories[0].amount).toBe(150);
  });

  it('sorts categories from highest to lowest spending', async () => {
    transactionStore.create({
      date: '2026-08-01',
      description: 'Movie',
      amount: 50,
      type: 'expense',
      category: 'Entertainment',
    });

    transactionStore.create({
      date: '2026-08-02',
      description: 'Groceries',
      amount: 200,
      type: 'expense',
      category: 'Food',
    });

    transactionStore.create({
      date: '2026-08-03',
      description: 'Electric',
      amount: 150,
      type: 'expense',
      category: 'Utilities',
    });

    const response = await request(app).get('/api/v1/insights/spending-by-category');

    expect(response.status).toBe(200);
    expect(response.body.data.categories[0].category).toBe('Food');
    expect(response.body.data.categories[1].category).toBe('Utilities');
    expect(response.body.data.categories[2].category).toBe('Entertainment');
  });

  it('calculates correct percentages', async () => {
    transactionStore.create({
      date: '2026-08-01',
      description: 'Groceries',
      amount: 500,
      type: 'expense',
      category: 'Food',
    });

    transactionStore.create({
      date: '2026-08-02',
      description: 'Electric',
      amount: 300,
      type: 'expense',
      category: 'Utilities',
    });

    transactionStore.create({
      date: '2026-08-03',
      description: 'Gas',
      amount: 200,
      type: 'expense',
      category: 'Transportation',
    });

    const response = await request(app).get('/api/v1/insights/spending-by-category');

    expect(response.status).toBe(200);
    
    const { categories } = response.body.data;
    const foodCategory = categories.find((c: { category: string }) => c.category === 'Food');
    expect(foodCategory.percentage).toBe(50);
    
    const utilitiesCategory = categories.find((c: { category: string }) => c.category === 'Utilities');
    expect(utilitiesCategory.percentage).toBe(30);
    
    const transportCategory = categories.find((c: { category: string }) => c.category === 'Transportation');
    expect(transportCategory.percentage).toBe(20);
  });

  it('identifies the top spending category correctly', async () => {
    transactionStore.create({
      date: '2026-08-01',
      description: 'Groceries',
      amount: 482.37,
      type: 'expense',
      category: 'Food',
    });

    transactionStore.create({
      date: '2026-08-02',
      description: 'Electric',
      amount: 310,
      type: 'expense',
      category: 'Utilities',
    });

    const response = await request(app).get('/api/v1/insights/spending-by-category');

    expect(response.status).toBe(200);
    expect(response.body.data.topCategory.category).toBe('Food');
    expect(response.body.data.topCategory.amount).toBe(482.37);
  });

  it('uses standardized API response format', async () => {
    const response = await request(app).get('/api/v1/insights/spending-by-category');

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('data');
    expect(response.body.data).toHaveProperty('totalExpenses');
    expect(response.body.data).toHaveProperty('topCategory');
    expect(response.body.data).toHaveProperty('categories');
  });
});
