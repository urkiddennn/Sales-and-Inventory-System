// src/controllers/authController.ts
import { Context } from "hono";
import { User } from "../model/User";
import { sign } from "hono/jwt";
import { env } from "../config/env";
import bcrypt from "bcryptjs";

export const login = async (c: Context) => {
  try {
    const { email, password } = await c.req.json();

    if (!email || !password) {
      return c.json({ error: "Email and password are required" }, 400);
    }

    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      console.log(`Login failed for ${email}: Invalid credentials`);
      return c.json({ error: "Invalid credentials" }, 401);
    }

    console.log(`Login successful for ${email}, Role: ${user.role}`);

    const payload = {
      id: user._id.toString(), // Ensure string for consistency
      role: user.role,
      exp: Math.floor(Date.now() / 1000) + 60 * 60, // 1 hour
    };

    const secret = env.JWT_SECRET;
    if (!secret) {
      console.error("FATAL: JWT_SECRET is not defined!");
      return c.json({ error: "Internal server configuration error" }, 500);
    }

    const token = await sign(payload, secret);

    return c.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Error in login controller:", error);
    return c.json({ error: "Internal Server Error" }, 500);
  }
};

export const register = async (c: Context) => {
  try {
    const { email, password, name, role } = await c.req.json();

    if (!email || !password || !name) {
      return c.json({ error: "Email, password, and name are required" }, 400);
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return c.json({ error: "Email already exists" }, 409);
    }

    // Restrict admin role in public registration
    const userRole = role === "admin" ? "user" : role || "user"; // Force "user" unless admin is explicitly handled elsewhere
    console.log(`Registering ${email} with role: ${userRole}`);

    const user = new User({ email, password, name, role: userRole });
    await user.save();

    const payload = {
      id: user._id.toString(),
      role: user.role,
      exp: Math.floor(Date.now() / 1000) + 60 * 60,
    };

    const secret = env.JWT_SECRET;
    if (!secret) {
      console.error("FATAL: JWT_SECRET is not defined!");
      return c.json({ error: "Internal server configuration error" }, 500);
    }
    const token = await sign(payload, secret);

    return c.json(
      {
        token,
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      },
      201
    );
  } catch (error) {
    console.error("Registration Error:", error);

    return c.json({ error: "Internal Server Error" }, 500);
  }
};
