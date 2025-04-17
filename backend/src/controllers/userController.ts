// src/controllers/userController.ts
import { Context } from "hono";
import { User } from "../model/User";
import bcrypt from "bcryptjs";
import cloudinary from "../config/cloudinary";
import { UploadApiResponse, UploadApiErrorResponse } from "cloudinary";

// Define type for Cloudinary upload result
type CloudinaryUploadResult = UploadApiResponse | UploadApiErrorResponse;

// Utility to check if Cloudinary response is successful
const isUploadSuccess = (result: CloudinaryUploadResult): result is UploadApiResponse => {
  return "secure_url" in result;
};

// Define interface for updates object
interface UserUpdates {
  name?: string;
  email?: string;
  password?: string;
  address?: string;
  mobileNumber?: string;
  profileUrl?: string;
}

// Get user profile
export const getUser = async (c: Context) => {
  try {
    const userId = c.get("jwtPayload").id;
    const user = await User.findById(userId).select("-password");
    if (!user) {
      return c.json({ error: "User not found" }, 404);
    }
    return c.json(user);
  } catch (error: unknown) {
    console.error("Error fetching user:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
};

// Edit user profile
export const editUser = async (c: Context) => {
  try {
    const userId = c.get("jwtPayload").id;
    const body = await c.req.parseBody<{
      name?: string;
      email?: string;
      password?: string;
      address?: string;
      mobileNumber?: string;
      profilePicture?: File | string;
    }>();

    const { name, email, password, address, mobileNumber, profilePicture } = body;

    console.log("Received body:", {
      name,
      email,
      password: password ? "[REDACTED]" : undefined,
      address,
      mobileNumber,
      profilePicture: profilePicture ? (profilePicture instanceof File ? `[File: ${profilePicture.name}]` : profilePicture) : undefined,
    }); // Debug

    const updates: UserUpdates = {};
    if (name) updates.name = name;
    if (email) updates.email = email;
    if (password && typeof password === "string") {
      updates.password = await bcrypt.hash(password, 10);
    }
    if (address) updates.address = address;
    if (mobileNumber) updates.mobileNumber = mobileNumber;

    if (profilePicture instanceof File) {
      console.log("Uploading profile picture to Cloudinary:", profilePicture.name); // Debug
      const arrayBuffer = await profilePicture.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const uploadResult: CloudinaryUploadResult = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "user_profiles" },
          (error, result) => {
            if (error || !result) {
              console.error("Cloudinary error:", error); // Debug
              reject(error || new Error("Upload failed"));
            } else {
              console.log("Cloudinary upload success:", result); // Debug
              resolve(result);
            }
          }
        );
        stream.end(buffer);
      });

      if (!isUploadSuccess(uploadResult)) {
        throw new Error("Cloudinary upload failed: No secure URL returned");
      }
      updates.profileUrl = uploadResult.secure_url;
      console.log("Set profileUrl:", updates.profileUrl); // Debug
    } else if (typeof profilePicture === "string" && profilePicture) {
      updates.profileUrl = profilePicture;
      console.log("Set profileUrl from string:", profilePicture); // Debug
    } else {
      console.log("No valid profilePicture provided"); // Debug
    }

    console.log("Applying updates:", updates); // Debug
    const user = await User.findByIdAndUpdate(userId, updates, { new: true }).select("-password");
    if (!user) {
      return c.json({ error: "User not found" }, 404);
    }

    console.log("Updated user data:", user.toJSON()); // Debug
    return c.json(user);
  } catch (error: unknown) {
    console.error("Error updating user:", error);
    const typedError = error as { code?: number; message?: string };
    if (typedError.code === 11000) {
      return c.json({ error: "Email already in use" }, 400);
    }
    return c.json({ error: typedError.message || "Internal server error" }, 500);
  }
};

// Delete user (admin-only or self-delete)
export const deleteUser = async (c: Context) => {
  try {
    const userId = c.get("jwtPayload").id;
    const role = c.get("jwtPayload").role;
    const { id } = c.req.param();

    if (userId !== id && role !== "admin") {
      return c.json({ error: "Unauthorized: Only admins can delete other users" }, 403);
    }

    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return c.json({ error: "User not found" }, 404);
    }

    return c.json({ message: "User deleted successfully" });
  } catch (error: unknown) {
    console.error("Error deleting user:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
};
