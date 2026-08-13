import 'dotenv/config';
import { createApp } from './app.js';
import { config } from './config.js';
import { seedMockData } from './data/seed.js';

const app = createApp(config);

if (config.SEED_DATA) {
  seedMockData();
}

const server = app.listen(config.PORT, () => {
  console.log(`🚀 API server started on port ${config.PORT} (${config.NODE_ENV})`);
});

const shutdown = (signal: string) => {
  console.log(`${signal} signal received, closing server...`);
  server.close((err) => {
    if (err) {
      console.error('Error during server shutdown:', err);
      process.exit(1);
    }
    console.log('Server closed successfully');
    process.exit(0);
  });
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
