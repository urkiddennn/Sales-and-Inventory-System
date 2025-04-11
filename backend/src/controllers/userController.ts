// src/controllers/userController.ts
import { Context } from "hono";
import { User } from "../model/User";
import bcrypt from "bcryptjs";

// Get user profile
export const getUser = async (c: Context) => {
  try {
    const userId = c.get('jwtPayload').id; // From authMiddleware
    const user = await User.findById(userId).select('-password'); // Exclude password
    if (!user) {
      return c.json({ error: "User not found" }, 404);
    }
    return c.json(user);
  } catch (error: any) {
    console.error("Error fetching user:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
};

// Edit user profile
export const editUser = async (c: Context) => {
  try {
    const userId = c.get('jwtPayload').id;
    const { name, email, password } = await c.req.json();

    const updates: { name?: string; email?: string; password?: string } = {};
    if (name) updates.name = name;
    if (email) updates.email = email;
    if (password) updates.password = await bcrypt.hash(password, 10); // Hash new password

    const user = await User.findByIdAndUpdate(userId, updates, { new: true }).select('-password');
    if (!user) {
      return c.json({ error: "User not found" }, 404);
    }

    return c.json(user);
  } catch (error: any) {
    console.error("Error updating user:", error);
    if (error.code === 11000) { // Duplicate email
      return c.json({ error: "Email already in use" }, 400);
    }
    return c.json({ error: "Internal server error" }, 500);
  }
};

// Delete user (admin-only or self-delete)
export const deleteUser = async (c: Context) => {
  try {
    const userId = c.get('jwtPayload').id;
    const role = c.get('jwtPayload').role;
    const { id } = c.req.param(); // ID of the user to delete

    // Allow self-delete or admin to delete any user
    if (userId !== id && role !== 'admin') {
      return c.json({ error: "Unauthorized: Only admins can delete other users" }, 403);
    }

    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return c.json({ error: "User not found" }, 404);
    }

    return c.json({ message: "User deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting user:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
};
