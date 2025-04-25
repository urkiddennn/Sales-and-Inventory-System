import express from 'express';
import cors from 'cors';
import { connectDB } from './src/config/db.js';
import { env } from './src/config/env.js';
import routes from './src/routes/index.js';

const app = express();

// Apply CORS middleware
app.use(
    cors({
        origin: ['https://cg3-solar-products.vercel.app'],
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
        allowedHeaders: ['Content-Type', 'Authorization'],
    })
);

app.options('*', cors());

// Middleware for parsing JSON and URL-encoded bodies
app.use(express.json({ limit: '10mb' })); // Increased to 10mb
app.use(express.urlencoded({ extended: true }));

// Mount all routes under /api prefix
app.use('/api', routes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: err.message || 'Internal Server Error' });
});

// Start the server
const startServer = async () => {
    try {
        await connectDB(); // Connect to MongoDB
        app.listen(Number(env.PORT), () => {
            console.log(`Server running on port ${env.PORT}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

startServer();

export default app;
