import { Context, Next } from "hono";
import { jwt } from "hono/jwt";
import { env } from "../config/env";

interface JWTPayload {
  id: string;
  role: string;
  [key: string]: any;
}

export const authMiddleware = async (c: Context, next: Next) => {
  try {
    // Validate the JWT token
    const jwtMiddleware = jwt({
      secret: env.JWT_SECRET,
    });

    await jwtMiddleware(c, next);

    // Check if the jwtPayload exists
    const payload = c.get("jwtPayload") as JWTPayload;
    if (!payload || !payload.id) {
      throw new Error("Invalid or missing token");
    }
  } catch (err: any) {
    // Log the error and return a 401 Unauthorized response
    console.error("JWT Validation Error:", err.message);
    return c.json({ error: "Unauthorized" }, 401);
  }
};

export const adminMiddleware = async (c: Context, next: Next) => {
  const payload = c.get("jwtPayload") as JWTPayload;

  // Check if the payload exists and contains the required fields
  if (!payload || !payload.role) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  // Check if the user has the admin role
  if (payload.role !== "admin") {
    return c.json({ error: "Admin access required" }, 403);
  }

  await next();
};
