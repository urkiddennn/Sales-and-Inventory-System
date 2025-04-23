import mongoose from 'mongoose';
import { env } from './env.js';

export const connectDB = async () => {
    try {
        if (!env.MONGODB_URI) {
            throw new Error('MONGODB_URI is not defined in environment variables');
        }
        console.log('Connecting to MongoDB with URI:', env.MONGODB_URI.replace(/:.*@/, ':****@'));
        await mongoose.connect(env.MONGODB_URI);
        console.log('MongoDB connected successfully');
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
};
