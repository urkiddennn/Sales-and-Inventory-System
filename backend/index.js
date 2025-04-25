import express from 'express';
import cors from 'cors';
import { connectDB } from './src/config/db.js';
import { env } from './src/config/env.js';
import routes from './src/routes/index.js';
import upload from './src/config/multerConfig.js'; // No longer needed here

const app = express();

// Apply CORS middleware
app.use(
    cors({
        origin: ['*'],
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],

        credentials: true,
    })
);

// Middleware for parsing JSON and URL-encoded bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// >>> REMOVE THESE INCORRECT LINES <<<
app.post('/api/auth/register', upload.single('profilePicture'), routes);
app.post('/api/products', upload.single('image'), routes);
app.put('/api/products/:id', upload.single('image'), routes);
app.put('/api/users/:id', upload.single('profilePicture'), routes);

// app.post('/api/details', upload.single('image'), routes);

// Mount all routes under /api prefix
app.use('/api', routes); // This line is correct

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
