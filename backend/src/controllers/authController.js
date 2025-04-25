import { User } from '../model/User.js';
import pkg from 'jsonwebtoken';
const { sign } = pkg;
import { env } from '../config/env.js';
import bcrypt from 'bcrypt';
import cloudinary from '../config/cloudinary.js';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }
        console.log('Login attempt:', { email });
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
    console.log('Starting registration process', { headers: req.headers['content-type'] });

    // Create a formidable form instance with options
    const form = formidable({
        multiples: false, // Single file upload
        keepExtensions: true, // Preserve file extensions
        uploadDir: '/tmp/uploads', // Use /tmp for Vercel
        maxFileSize: 2 * 1024 * 1024, // 2MB limit
    });

    // Ensure upload directory exists
    const uploadDir = '/tmp/uploads';
    try {
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
            console.log('Created upload directory:', uploadDir);
        }
    } catch (dirErr) {
        console.error('Failed to create upload directory:', dirErr);
        return res.status(500).json({ error: 'Server file system error' });
    }

    form.parse(req, async (err, fields, files) => {
        if (err) {
            console.error('Formidable parse error:', err);
            return res.status(500).json({ error: 'Failed to process form data', details: err.message });
        }

        try {
            console.log('Parsed form data:', { fields, files: Object.keys(files) });

            // Extract fields (formidable v3 returns fields as arrays)
            const name = fields.name?.[0];
            const email = fields.email?.[0];
            const password = fields.password?.[0];
            const fullName = fields['address[fullName]']?.[0];
            const street = fields['address[street]']?.[0];
            const city = fields['address[city]']?.[0];
            const state = fields['address[state]']?.[0];
            const zipCode = fields['address[zipCode]']?.[0];
            const mobileNumber = fields.mobileNumber?.[0];
            const role = fields.role?.[0];

            console.log('Extracted signup body:', {
                name,
                email,
                password: '[REDACTED]',
                address: { fullName, street, city, state, zipCode },
                mobileNumber,
                role,
            });

            // Validate required fields
            const missingFields = [];
            if (!name) missingFields.push('name');
            if (!email) missingFields.push('email');
            if (!password) missingFields.push('password');
            if (!fullName) missingFields.push('address[fullName]');
            if (!street) missingFields.push('address[street]');
            if (!city) missingFields.push('address[city]');
            if (!state) missingFields.push('address[state]');
            if (!zipCode) missingFields.push('address[zipCode]');
            if (!mobileNumber) missingFields.push('mobileNumber');

            if (missingFields.length > 0) {
                console.log('Missing fields:', missingFields);
                return res.status(400).json({ error: 'All fields are required', missing: missingFields });
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
            console.log('Checking for existing user with email:', email);
            const existingUser = await User.findOne({ email: email.toLowerCase() });
            if (existingUser) {
                console.log('Email already exists:', email);
                return res.status(409).json({ error: 'Email already exists' });
            }

            // Handle profile picture upload
            let profileUrl = '';
            const profilePicture = files.profilePicture?.[0];
            if (profilePicture) {
                console.log('Uploading profile picture:', profilePicture.originalFilename, profilePicture.filepath);
                try {
                    const uploadResult = await cloudinary.uploader.upload(profilePicture.filepath, {
                        folder: 'user_profiles',
                    });
                    profileUrl = uploadResult.secure_url;
                    console.log('Cloudinary upload successful, profileUrl:', profileUrl);
                } catch (uploadErr) {
                    console.error('Cloudinary upload error:', uploadErr);
                    return res.status(500).json({ error: 'Failed to upload profile picture', details: uploadErr.message });
                }
                // Clean up temporary file
                try {
                    fs.unlinkSync(profilePicture.filepath);
                    console.log('Deleted temporary file:', profilePicture.filepath);
                } catch (unlinkErr) {
                    console.error('Error deleting temporary file:', unlinkErr);
                }
            } else {
                console.log('No profile picture provided');
            }

            // Restrict admin role
            const userRole = role === 'admin' ? 'user' : role || 'user';
            console.log(`Registering ${email} with role: ${userRole}`);

            // Hash password
            console.log('Hashing password');
            const hashedPassword = await bcrypt.hash(password, 10);
            console.log('Password hashed successfully');

            // Create user
            console.log('Creating new user');
            const user = new User({
                name,
                email: email.toLowerCase(),
                password: hashedPassword,
                address: { fullName, street, city, state, zipCode },
                mobileNumber,
                profileUrl,
                role: userRole,
            });

            // Save user
            console.log('Saving user to database');
            await user.save();
            console.log('User saved:', { id: user._id, email: user.email });

            // Generate JWT
            console.log('Generating JWT');
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
            console.log('JWT generated successfully');

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
            console.error('Registration Error:', {
                message: error.message,
                stack: error.stack,
                fields,
                files: Object.keys(files),
            });
            return res.status(500).json({ error: error.message || 'Internal Server Error' });
        }
    });
};
