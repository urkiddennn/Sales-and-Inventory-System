import pkg from 'jsonwebtoken';
const { verify } = pkg;
import { env } from '../config/env.js';

export const authMiddleware = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ error: 'No token provided' });
        }

        const payload = verify(token, env.JWT_SECRET);
        if (!payload || !payload.id) {
            throw new Error('Invalid or missing token');
        }

        req.jwtPayload = payload;
        next();
    } catch (err) {
        console.error('JWT Validation Error:', err.message);
        return res.status(401).json({ error: 'Unauthorized' });
    }
};

export const adminMiddleware = async (req, res, next) => {
    const payload = req.jwtPayload;

    if (!payload || !payload.role) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    if (payload.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
    }

    next();
};
