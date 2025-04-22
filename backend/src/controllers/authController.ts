import { Context } from "hono";
import { User } from "../model/User";
import { sign } from "hono/jwt";
import { env } from "../config/env";
import bcrypt from "bcryptjs";
import cloudinary from "../config/cloudinary";
import { UploadApiResponse, UploadApiErrorResponse } from "cloudinary";

type CloudinaryUploadResult = UploadApiResponse | UploadApiErrorResponse;

const isUploadSuccess = (result: CloudinaryUploadResult): result is UploadApiResponse => {
    return "secure_url" in result;
};

export const login = async (c: Context) => {
    try {
        const { email, password } = await c.req.json();
        if (!email || !password) {
            return c.json({ error: "Email and password are required" }, 400);
        }
        console.log("Login attempt:", { email, password }); // Debug
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            console.log(`No user found for email: ${email}`);
            return c.json({ error: "Invalid credentials" }, 401);
        }
        const passwordMatch = await bcrypt.compare(password, user.password);
        console.log("Password match:", passwordMatch); // Debug
        if (!passwordMatch) {
            console.log(`Password mismatch for ${email}`);
            return c.json({ error: "Invalid credentials" }, 401);
        }
        console.log(`Login successful for ${email}, Role: ${user.role}`);
        const payload = {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
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
        const body = await c.req.parseBody<{
            name: string;
            email: string;
            password: string;
            'address[fullName]': string;
            'address[street]': string;
            'address[city]': string;
            'address[state]': string;
            'address[zipCode]': string;
            mobileNumber: string;
            profilePicture?: File | string;
            role?: string;
        }>();

        const {
            name,
            email,
            password,
            'address[fullName]': fullName,
            'address[street]': street,
            'address[city]': city,
            'address[state]': state,
            'address[zipCode]': zipCode,
            mobileNumber,
            profilePicture,
            role,
        } = body;

        console.log("Received signup body:", {
            name,
            email,
            password: '[REDACTED]',
            address: { fullName, street, city, state, zipCode },
            mobileNumber,
            profilePicture: profilePicture ? (profilePicture instanceof File ? `[File: ${profilePicture.name}]` : profilePicture) : undefined,
            role,
        });

        // Validate required fields
        if (!name || !email || !password || !fullName || !street || !city || !state || !zipCode || !mobileNumber) {
            return c.json({ error: "All fields are required" }, 400);
        }

        // Validate mobile number
        if (!/^[0-9]{10}$/.test(mobileNumber)) {
            return c.json({ error: "Mobile number must be a valid 10-digit number" }, 400);
        }

        // Validate zip code
        if (!/^[0-9]{5}$/.test(zipCode)) {
            return c.json({ error: "Zip code must be a valid 5-digit number" }, 400);
        }

        // Check if email exists
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return c.json({ error: "Email already exists" }, 409);
        }

        // Handle profile picture upload
        let profileUrl = "";
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
                throw new Error("Cloudinary upload failed");
            }
            profileUrl = uploadResult.secure_url;
            console.log("Set profileUrl:", profileUrl);
        }

        // Restrict admin role
        const userRole = role === "admin" ? "user" : role || "user";
        console.log(`Registering ${email} with role: ${userRole}`);

        const hashedPassword = await bcrypt.hash(password, 10);
        console.log("Hashed password:", hashedPassword);

        const user = new User({
            name,
            email: email.toLowerCase(),
            password: hashedPassword,
            address: { fullName, street, city, state, zipCode },
            mobileNumber,
            profileUrl,
            role: userRole,
        });

        await user.save();
        console.log("Saved user:", {
            id: user._id,
            email: user.email,
            name,
            address: user.address,
            mobileNumber,
            profileUrl,
            role: user.role
        });

        const payload = {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
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
                    address: user.address,
                    mobileNumber: user.mobileNumber,
                    profileUrl: user.profileUrl,
                    role: user.role,
                },
            },
            201
        );
    } catch (error: any) {
        console.error("Registration Error:", error);
        return c.json({ error: error.message || "Internal Server Error" }, 500);
    }
};
