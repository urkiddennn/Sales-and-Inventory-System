// src/middleware/auth.ts
import { Hono } from 'hono';
import { jwt } from 'hono/jwt';
import { env } from '../config/env';

export const authMiddleware = jwt({
  secret: env.JWT_SECRET,
});

export const adminMiddleware = async (c: any, next: any) => {
  const payload = c.get('jwtPayload');
  if (payload.role !== 'admin') {
    return c.json({ error: 'Admin access required' }, 403);
  }
  await next();
};
