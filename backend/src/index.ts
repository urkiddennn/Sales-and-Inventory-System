import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { serve } from '@hono/node-server';
import { connectDB } from './config/db';
import { env } from './config/env';
import routes from './routes';

// Debug environment variables
console.log('MONGODB_URI:', env.MONGODB_URI ? env.MONGODB_URI.replace(/:.*@/, ':****@') : 'undefined');

// Initialize Hono app
const app = new Hono();

// Apply CORS middleware
app.use(
  '*',
  cors({
    origin: ['*'],
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);

// Mount routes under /api
app.route('/api', routes);

// Root route
app.get('/', (c) => c.text('Hono API is running! Try /api/auth/register or /api/auth/login'));

// Test route
app.get('/api/test', (c) => c.text('Test route works!'));

// Handle favicon
app.get('/favicon.ico', (c) => c.text('No favicon', 404));

// Handle /api/auth
app.get('/api/auth', (c) => c.text('Use /api/auth/register or /api/auth/login', 404));

// Error handling
app.onError((err, c) => {
  console.error('Server error:', err);
  return c.json({ error: err.message }, 500);
});

// Lazy database connection
let dbConnected = false;
app.use('*', async (c, next) => {
  if (!dbConnected) {
    try {
      console.log('Attempting MongoDB connection...');
      await connectDB();
      dbConnected = true;
      console.log('MongoDB connected');
    } catch (error) {
      console.error('Failed to connect to MongoDB:', error);
      return c.json({ error: 'Database connection failed' }, 500);
    }
  }
  await next();
});

// Start server locally
if (process.env.NODE_ENV !== 'production') {
  serve(
    {
      fetch: app.fetch,
      port: Number(env.PORT) || 3000,
    },
    () => {
      console.log(`Server running on port ${env.PORT || 3000}`);
    }
  );
}

// Export for Vercel
export default {
  fetch: app.fetch,
};
