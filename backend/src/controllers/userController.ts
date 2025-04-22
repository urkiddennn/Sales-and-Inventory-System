import { Context } from "hono";
import { User } from "../model/User";
import bcrypt from "bcryptjs";
import cloudinary from "../config/cloudinary";
import { UploadApiResponse, UploadApiErrorResponse } from "cloudinary";

type CloudinaryUploadResult = UploadApiResponse | UploadApiErrorResponse;

const isUploadSuccess = (result: CloudinaryUploadResult): result is UploadApiResponse => {
    return "secure_url" in result;
};

interface UserUpdates {
    name?: string;
    email?: string;
    password?: string;
    address?: {
        fullName: string;
        street: string;
        city: string;
        state: string;
        zipCode: string;
    };
    mobileNumber?: string;
    profileUrl?: string;
}

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

export const editUser = async (c: Context) => {
    try {
        const userId = c.get("jwtPayload").id;
        const body = await c.req.parseBody<{
            name?: string;
            email?: string;
            password?: string;
            "address[fullName]"?: string;
            "address[street]"?: string;
            "address[city]"?: string;
            "address[state]"?: string;
            "address[zipCode]"?: string;
            mobileNumber?: string;
            profilePicture?: File | string;
        }>();

        const {
            name,
            email,
            password,
            "address[fullName]": fullName,
            "address[street]": street,
            "address[city]": city,
            "address[state]": state,
            "address[zipCode]": zipCode,
            mobileNumber,
            profilePicture,
        } = body;

        console.log("Received body:", {
            name,
            email,
            password: password ? "[REDACTED]" : undefined,
            address: { fullName, street, city, state, zipCode },
            mobileNumber,
            profilePicture: profilePicture ? (profilePicture instanceof File ? `[File: ${profilePicture.name}]` : profilePicture) : undefined,
        });

        const updates: UserUpdates = {};
        if (name) updates.name = name;
        if (email) updates.email = email;
        if (password && typeof password === "string") {
            updates.password = await bcrypt.hash(password, 10);
        }
        if (fullName && street && city && state && zipCode) {
            updates.address = { fullName, street, city, state, zipCode };
        }
        if (mobileNumber) updates.mobileNumber = mobileNumber;

        if (profilePicture instanceof File) {
            console.log("Uploading profile picture to Cloudinary:", profilePicture.name);
            const arrayBuffer = await profilePicture.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            const uploadResult: CloudinaryUploadResult = await new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                    { folder: "user_profiles" },
                    (error, result) => {
                        if (error || !result) {
                            console.error("Cloudinary error:", error);
                            reject(error || new Error("Upload failed"));
                        } else {
                            console.log("Cloudinary upload success:", result);
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
            console.log("Set profileUrl:", updates.profileUrl);
        } else if (typeof profilePicture === "string" && profilePicture) {
            updates.profileUrl = profilePicture;
            console.log("Set profileUrl from string:", profilePicture);
        } else {
            console.log("No valid profilePicture provided");
        }

        console.log("Applying updates:", updates);
        const user = await User.findByIdAndUpdate(userId, updates, { new: true }).select("-password");
        if (!user) {
            return c.json({ error: "User not found" }, 404);
        }

        console.log("Updated user data:", user.toJSON());
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

// Delete user and other functions remain unchanged
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

export const getAdminUser = async (c: Context) => {
    try {
        const admin = await User.findOne({ role: "admin" }).select("_id name email role");
        if (!admin) {
            return c.json({ error: "No admin user found" }, 404);
        }
        return c.json({
            _id: admin._id,
            username: admin.name,
            email: admin.email,
            role: admin.role,
        });
    } catch (error: unknown) {
        console.error("Error fetching admin user:", error);
        return c.json({ error: "Internal server error" }, 500);
    }
};

export const getAllUsers = async (c: Context) => {
    try {
        const users = await User.find().select("-password");
        return c.json(users);
    } catch (error: any) {
        console.error("Error fetching users:", error);
        return c.json({ error: error.message }, 500);
    }
};

export const getUserById = async (c: Context) => {
    try {
        const { id } = c.req.param();
        const role = c.get("jwtPayload").role;
        if (role !== "admin") {
            return c.json({ error: "Unauthorized: Admin access required" }, 403);
        }

        const user = await User.findById(id).select("-password");
        if (!user) {
            return c.json({ error: "User not found" }, 404);
        }
        return c.json(user);
    } catch (error: unknown) {
        console.error("Error fetching user by ID:", error);
        return c.json({ error: "Internal server error" }, 500);
    }
};
