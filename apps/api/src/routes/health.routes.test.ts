import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../app.js';

describe('GET /api/v1/health', () => {
  it('returns standardized success response', async () => {
    const app = createApp();
    const response = await request(app).get('/api/v1/health');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      data: { status: 'ok' },
    });
  });

  it('returns 404 for non-versioned endpoint', async () => {
    const app = createApp();
    const response = await request(app).get('/api/health');

    expect(response.status).toBe(404);
  });
});

describe('Error handling', () => {
  it('returns standardized error response for unknown endpoints', async () => {
    const app = createApp();
    const response = await request(app).get('/api/v1/unknown');

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('error');
    expect(response.body.error).toHaveProperty('code');
    expect(response.body.error).toHaveProperty('message');
  });
});
