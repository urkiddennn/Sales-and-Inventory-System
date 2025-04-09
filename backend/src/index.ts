// src/index.ts
import { Hono } from 'hono';
import { serve } from '@hono/node-server'; // Add this import
import { connectDB } from './config/db';
import { env } from './config/env';
import routes from './routes';

const app = new Hono();

// Mount all routes under /api prefix
app.route('/api', routes);

// Error handling middleware
app.onError((err, c) => {
  console.error(`${err}`);
  return c.json({ error: err.message }, 500);
});

// Start the server
const startServer = async () => {
  try {
    await connectDB(); // Connect to MongoDB
    serve({
      fetch: app.fetch, // Use Hono's fetch method
      port: Number(env.PORT),
    }, () => {
      console.log(`Server running on port ${env.PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
