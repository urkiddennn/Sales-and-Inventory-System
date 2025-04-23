import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { connectDB } from './config/db';
import { env } from './config/env';
import routes from './routes';
import { cors } from 'hono/cors';

const app = new Hono();

// Apply CORS middleware before any routes
app.use(
  '*',
  cors({
    origin: ['*'], // Explicitly allow the frontend origin
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'], // Explicitly allow methods
    allowHeaders: ['Content-Type', 'Authorization'], // Allow specific headers
    credentials: true, // Allow credentials (if needed, e.g., for cookies)
  })
);

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
    serve(
      {
        fetch: app.fetch,
        port: Number(env.PORT),
      },
      () => {
        console.log(`Server running on port ${env.PORT}`);
      }
    );
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
