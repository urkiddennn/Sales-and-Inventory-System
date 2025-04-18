// src/middleware/rateLimit.ts
import { Context } from "hono";

interface RateLimitOptions {
    limit: number;
    windowMs: number;
}

const rateLimitStore: { [key: string]: { count: number; resetTime: number } } = {};

export const getRateLimitMiddleware = ({ limit, windowMs }: RateLimitOptions) => {
    return async (c: Context, next: () => Promise<void>) => {
        const ip = c.req.header("x-forwarded-for") || "unknown";
        const now = Date.now();
        const key = `${ip}:${c.req.path}`;

        if (!rateLimitStore[key] || now > rateLimitStore[key].resetTime) {
            rateLimitStore[key] = { count: 1, resetTime: now + windowMs };
        } else {
            rateLimitStore[key].count += 1;
        }

        if (rateLimitStore[key].count > limit) {
            return c.json({ error: "Too many requests. Please try again later." }, 429);
        }

        await next();
    };
};
