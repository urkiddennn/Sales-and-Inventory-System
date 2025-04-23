import { User } from '../model/User.js';
import pkg from 'jsonwebtoken';
const { sign } = pkg;
import { env } from '../config/env.js';
import bcrypt from 'bcrypt';
import cloudinary from '../config/cloudinary.js';

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }
        console.log('Login attempt:', { email, password });
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            console.log(`No user found for email: ${email}`);
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        const passwordMatch = await bcrypt.compare(password, user.password);
        console.log('Password match:', passwordMatch);
        if (!passwordMatch) {
            console.log(`Password mismatch for ${email}`);
            return res.status(401).json({ error: 'Invalid credentials' });
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
            console.error('FATAL: JWT_SECRET is not defined!');
            return res.status(500).json({ error: 'Internal server configuration error' });
        }
        const token = sign(payload, secret);
        return res.json({
            token,
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
                role: user.role,
            },
        });
    } catch (error) {
        console.error('Error in login controller:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};

export const register = async (req, res) => {
    try {
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
            role,
        } = req.body;

        console.log('Received signup body:', {
            name,
            email,
            password: '[REDACTED]',
            address: { fullName, street, city, state, zipCode },
            mobileNumber,
            role,
        });

        // Validate required fields
        if (!name || !email || !password || !fullName || !street || !city || !state || !zipCode || !mobileNumber) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        // Validate mobile number
        if (!/^[0-9]{10}$/.test(mobileNumber)) {
            return res.status(400).json({ error: 'Mobile number must be a valid 10-digit number' });
        }

        // Validate zip code
        if (!/^[0-9]{5}$/.test(zipCode)) {
            return res.status(400).json({ error: 'Zip code must be a valid 5-digit number' });
        }

        // Check if email exists
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(409).json({ error: 'Email already exists' });
        }

        // Handle profile picture upload
        let profileUrl = '';
        if (req.file) {
            console.log('Uploading profile picture to Cloudinary:', req.file.originalname);
            const uploadResult = await cloudinary.uploader.upload(req.file.path, { folder: 'user_profiles' });
            profileUrl = uploadResult.secure_url;
            console.log('Set profileUrl:', profileUrl);
        }

        // Restrict admin role
        const userRole = role === 'admin' ? 'user' : role || 'user';
        console.log(`Registering ${email} with role: ${userRole}`);

        const hashedPassword = await bcrypt.hash(password, 10);
        console.log('Hashed password:', hashedPassword);

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
        console.log('Saved user:', {
            id: user._id,
            email: user.email,
            name,
            address: user.address,
            mobileNumber,
            profileUrl,
            role: user.role,
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
            console.error('FATAL: JWT_SECRET is not defined!');
            return res.status(500).json({ error: 'Internal server configuration error' });
        }
        const token = sign(payload, secret);

        return res.status(201).json({
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
        });
    } catch (error) {
        console.error('Registration Error:', error);
        return res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
};
