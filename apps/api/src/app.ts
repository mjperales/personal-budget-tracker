import express from 'express';
import cors from 'cors';
import type { Config } from './config.js';
import { healthRouter } from './routes/health.routes.js';
import { transactionsRouter } from './routes/transactions.routes.js';
import { summaryRouter } from './routes/summary.routes.js';
import { errorHandler } from './middleware/error-handler.js';

export function createApp(config: Partial<Config> = {}) {
  const app = express();

  const allowedOrigins = [
    /^http:\/\/localhost(:\d+)?$/,
  ];

  if (config.CORS_ORIGIN) {
    allowedOrigins.push(
      new RegExp(`^${config.CORS_ORIGIN.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`)
    );
  }

  app.use(
    cors({
      origin(origin, callback) {
        if (!origin) return callback(null, true);
        const allowed = allowedOrigins.some((pattern) => pattern.test(origin));
        callback(allowed ? null : new Error(`CORS: origin ${origin} not allowed`), allowed);
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    })
  );

  app.use(express.json());

  app.use('/api/v1', healthRouter);
  app.use('/api/v1/transactions', transactionsRouter);
  app.use('/api/v1/summary', summaryRouter);

  // 404 handler for unmatched routes
  app.use((_req, res) => {
    res.status(404).json({
      error: {
        code: 'NOT_FOUND',
        message: 'Endpoint not found',
      },
    });
  });

  app.use(errorHandler);

  return app;
}
