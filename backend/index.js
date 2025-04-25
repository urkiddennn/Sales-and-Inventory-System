import express from 'express';
import cors from 'cors';
import { connectDB } from './src/config/db.js';
import { env } from './src/config/env.js';
import routes from './src/routes/index.js';

const app = express();

// CORS config
const allowedOrigins = ['https://cg3-solar-products.vercel.app'];

const corsOptions = {
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            console.log(`✅ CORS allowed for origin: ${origin}`);
            callback(null, true);
        } else {
            console.log(`❌ CORS blocked for origin: ${origin}`);
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
};

// Apply CORS globally
app.use(cors(corsOptions));

// Handle preflight
app.options('*', cors(corsOptions));

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api', routes);

// Error handler
app.use((err, req, res, next) => {
    console.error('❌', err.stack);
    res.status(500).json({ error: err.message || 'Internal Server Error' });
});

// Start server
const startServer = async () => {
    try {
        await connectDB();
        app.listen(Number(env.PORT), () => {
            console.log(`🚀 Server running on port ${env.PORT}`);
        });
    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
};

startServer();

export default app;
